import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslations } from "../lib/locale";
import { resolveStoryId } from "../lib/story";
import { catKey, loadCatalog, readCatalog, edgeCache } from "../lib/catalog-store";
import { buildPrayers } from "../lib/catalog-builder";
import { durationFromR2Mp3 } from "../lib/mp3-duration";

export const prayersRoutes = new Hono<{ Bindings: Env }>();

async function loadPrayers(c: any, appId: string, locale: string) {
  return loadCatalog<{ categories: any[]; prayers: any[] }>(
    c.env.CACHE,
    catKey("prayers", appId, locale),
    () => buildPrayers(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("prayers", appId, "en")],
    },
  );
}

prayersRoutes.get("/categories", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const catalog = await loadPrayers(c, appId, locale);
  return c.json({ categories: catalog?.categories ?? [] });
});

prayersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const categoryId = c.req.query("category_id");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const catalog = await loadPrayers(c, appId, locale);
  if (!catalog) return c.json({ prayers: [] });

  let prayers = catalog.prayers;
  if (categoryId) prayers = prayers.filter((p) => p.category_id === categoryId);

  return c.json({ prayers: prayers.slice(offset, offset + limit) });
});

prayersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  const edgeKey = new Request(
    `https://catalog.cache/${encodeURIComponent(`cat3edge:prayer2:${appId}:${locale}:${id}`)}`,
  );
  try {
    const hit = await edgeCache().match(edgeKey);
    if (hit) return c.json(await hit.json());
  } catch {}

  try {
    return await prayerDetailFromD1(c, appId, locale, id, edgeKey);
  } catch (err) {
    // D1 down: prayer (incl. transcript) from the prayers catalog in KV,
    // audio discovered by listing R2. Related content omitted.
    console.error("prayer detail D1 failed, using KV+R2 fallback:", err);
    const fallback = await prayerDetailFallback(c, appId, locale, id);
    if (fallback) {
      c.executionCtx?.waitUntil?.(
        edgeCache()
          .put(
            edgeKey,
            new Response(JSON.stringify(fallback), {
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=1800",
              },
            }),
          )
          .catch(() => {}),
      );
      return c.json(fallback);
    }
    return c.json({ error: "Prayer temporarily unavailable" }, 503);
  }
});

async function prayerDetailFallback(
  c: any,
  appId: string,
  locale: string,
  id: string,
): Promise<Record<string, unknown> | null> {
  const catalog = await loadPrayers(c, appId, locale);
  const prayer = catalog?.prayers?.find((p) => p.id === id || p.slug === id);
  if (!prayer) return null;

  const speakersPayload = await readCatalog<{ speakers: any[] }>(
    c.env.CACHE,
    catKey("speakers", appId),
  );
  const speakerByKey = new Map(
    (speakersPayload?.speakers ?? []).map((sp: any) => [
      String(sp.name ?? "").toLowerCase(),
      sp,
    ]),
  );

  const listing = await c.env.MEDIA.list({
    prefix: `${appId}/prayers/${prayer.slug}/`,
  });
  const audioObjects = (listing.objects ?? []).filter((o: any) =>
    /\/narration-[^/]+\.mp3$/.test(o.key),
  );
  const esFiles = audioObjects.filter((o: any) => /-es\.mp3$/.test(o.key));
  const enFiles = audioObjects.filter((o: any) => !/-es\.mp3$/.test(o.key));
  const chosen = locale === "es" && esFiles.length ? esFiles : enFiles;

  const audio_versions = (
    await Promise.all(
      chosen.map(async (o: any) => {
        const m = o.key.match(/narration-([^/]+?)(?:-es)?\.mp3$/);
        const speakerKey = m?.[1] ?? "narrator";
        const sp = speakerByKey.get(speakerKey);
        // Unregistered takes in R2 (e.g. narration-grace-v2.mp3) are not published.
        if (!sp) return null;
        const fromFile = await durationFromR2Mp3(c.env.MEDIA, o.key, Number(o.size) || 0);
        return {
          id: `fallback-${prayer.slug}-${speakerKey}`,
          prayer_id: prayer.id,
          speaker_id: sp?.id ?? speakerKey,
          audio_key: o.key,
          duration_seconds: fromFile || Number(prayer.duration_seconds) || 0,
          speaker_name: sp?.name ?? speakerKey.charAt(0).toUpperCase() + speakerKey.slice(1),
          speaker_avatar: sp?.avatar_key ?? null,
          audio_url: mediaUrl(c.env, o.key, appId) ?? "",
          speaker_avatar_url: sp ? mediaUrl(c.env, sp.avatar_key, appId) : null,
          is_default: Number(sp?.is_default ?? 0),
        };
      }),
    )
  )
    .filter(Boolean)
    // Match the D1 route: default speaker (Grace) first, then by name.
    .sort(
      (a: any, b: any) =>
        b.is_default - a.is_default || a.speaker_name.localeCompare(b.speaker_name),
    );

  const fromAudio = Math.max(
    0,
    ...audio_versions.map((a: any) => Number(a.duration_seconds) || 0),
  );

  return {
    prayer: {
      ...prayer,
      duration_seconds: fromAudio || Number(prayer.duration_seconds) || 0,
    },
    audio_versions,
    related_stories: [],
    related_characters: [],
  };
}

async function prayerDetailFromD1(
  c: any,
  appId: string,
  locale: string,
  id: string,
  edgeKey: Request,
) {
  let prayer = await c.env.DB.prepare(
    `SELECT p.*, pc.name as category_name, pc.slug as category_slug
     FROM prayers p
     JOIN prayer_categories pc ON p.category_id = pc.id
     WHERE (p.id = ? OR p.slug = ?) AND p.app_id = ?`
  )
    .bind(id, id, appId)
    .first();

  if (!prayer) {
    return c.json({ error: "Prayer not found" }, 404);
  }

  const [translated] = await overlayTranslations(c.env.DB, [prayer as any], {
    entityType: "prayer",
    appId,
    locale,
    fields: ["title", "description", "transcript"],
    nullIfMissing: ["transcript"],
  });
  prayer = translated;

  const prayerId = (prayer as any).id;

  let audioVersions = await c.env.DB.prepare(
    `SELECT pa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
     FROM prayer_audio pa
     JOIN speakers sp ON pa.speaker_id = sp.id AND sp.app_id = ?
     WHERE pa.prayer_id = ? AND (pa.locale = ? OR pa.locale IS NULL)
     ORDER BY sp.is_default DESC, sp.name ASC`
  )
    .bind(appId, prayerId, locale)
    .all();

  if (audioVersions.results.length === 0 && locale !== "en") {
    audioVersions = await c.env.DB.prepare(
      `SELECT pa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
       FROM prayer_audio pa
       JOIN speakers sp ON pa.speaker_id = sp.id AND sp.app_id = ?
       WHERE pa.prayer_id = ? AND (pa.locale = 'en' OR pa.locale IS NULL)
       ORDER BY sp.is_default DESC, sp.name ASC`
    )
      .bind(appId, prayerId)
      .all();
  }

  const relatedStories = await c.env.DB.prepare(
    `SELECT s.id, s.title, s.slug, s.cover_image_key
     FROM stories s
     JOIN prayer_stories ps ON s.id = ps.story_id
     WHERE ps.prayer_id = ?`
  )
    .bind(prayerId)
    .all();

  const relatedCharacters = await c.env.DB.prepare(
    `SELECT ch.id, ch.name, ch.description
     FROM characters ch
     JOIN prayer_characters pch ON ch.id = pch.character_id
     WHERE pch.prayer_id = ?`
  )
    .bind(prayerId)
    .all();

  const translatedStories = await overlayTranslations(c.env.DB, relatedStories.results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title"],
  });
  const translatedRelatedChars = await overlayTranslations(c.env.DB, relatedCharacters.results as any[], {
    entityType: "character",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const audio_versions = audioVersions.results.map((a: any) => ({
    ...a,
    audio_url: mediaUrl(c.env, a.audio_key, appId) ?? "",
    speaker_avatar_url: mediaUrl(c.env, a.speaker_avatar, appId),
  }));
  const fromAudio = Math.max(
    0,
    ...audio_versions.map((a: any) => Number(a.duration_seconds) || 0),
  );
  const payload = {
    prayer: {
      ...(prayer as any),
      duration_seconds: fromAudio || Number((prayer as any).duration_seconds) || 0,
    },
    audio_versions,
    related_stories: translatedStories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
    related_characters: translatedRelatedChars,
  };

  c.executionCtx?.waitUntil?.(
    edgeCache()
      .put(
        edgeKey,
        new Response(JSON.stringify(payload), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        }),
      )
      .catch(() => {}),
  );

  return c.json(payload);
}

prayersRoutes.get("/for-story/:storyId", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const rawId = c.req.param("storyId");

  try {
    const storyId = (await resolveStoryId(c.env.DB, appId, rawId)) ?? rawId;

    const result = await c.env.DB.prepare(
      `SELECT p.id, p.title, p.slug, p.description, pc.name as category_name, pc.icon as category_icon
       FROM prayers p
       JOIN prayer_stories ps ON p.id = ps.prayer_id
       JOIN prayer_categories pc ON p.category_id = pc.id
       WHERE ps.story_id = ? AND p.app_id = ? AND p.is_published = 1
       ORDER BY p.sort_order ASC`
    )
      .bind(storyId, appId)
      .all();

    const prayers = await overlayTranslations(c.env.DB, result.results as any[], {
      entityType: "prayer",
      appId,
      locale,
      fields: ["title", "description"],
    });

    return c.json({ prayers });
  } catch (err) {
    // Non-critical section on the story screen; empty beats a 500.
    console.error("prayers for-story D1 failed:", err);
    return c.json({ prayers: [] });
  }
});
