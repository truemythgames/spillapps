import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale } from "../lib/locale";
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
    `https://catalog.cache/${encodeURIComponent(`cat3edge:prayer3:${appId}:${locale}:${id}`)}`,
  );
  try {
    const hit = await edgeCache().match(edgeKey);
    if (hit) return c.json(await hit.json());
  } catch {}

  const payload = await prayerDetailFallback(c, appId, locale, id);
  if (!payload) return c.json({ error: "Prayer not found" }, 404);

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

  const storyIds: string[] = prayer.related_story_ids ?? [];
  const charIds: string[] = prayer.related_character_ids ?? [];

  const storiesPayload =
    (await readCatalog<{ stories: any[] }>(c.env.CACHE, catKey("stories", appId, locale))) ??
    (await readCatalog<{ stories: any[] }>(c.env.CACHE, catKey("stories", appId, "en")));
  const related_stories = (storiesPayload?.stories ?? [])
    .filter((s: any) => storyIds.includes(s.id))
    .map((s: any) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      cover_image_key: s.cover_image_key,
      cover_image_url: s.cover_image_url ?? null,
    }));

  const charactersPayload =
    (await readCatalog<{ characters: any[] }>(c.env.CACHE, catKey("characters", appId, locale))) ??
    (await readCatalog<{ characters: any[] }>(c.env.CACHE, catKey("characters", appId, "en")));
  const related_characters = (charactersPayload?.characters ?? [])
    .filter((ch: any) => charIds.includes(ch.id))
    .map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      description: ch.description,
    }));

  return {
    prayer: {
      ...prayer,
      duration_seconds: fromAudio || Number(prayer.duration_seconds) || 0,
    },
    audio_versions,
    related_stories,
    related_characters,
  };
}

prayersRoutes.get("/for-story/:storyId", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const rawId = c.req.param("storyId");

  const storiesPayload =
    (await readCatalog<{ stories: any[] }>(c.env.CACHE, catKey("stories", appId, locale))) ??
    (await readCatalog<{ stories: any[] }>(c.env.CACHE, catKey("stories", appId, "en")));
  const story = storiesPayload?.stories?.find((s) => s.id === rawId || s.slug === rawId);
  const storyId = story?.id ?? rawId;

  const catalog = await loadPrayers(c, appId, locale);
  const prayers = (catalog?.prayers ?? [])
    .filter((p) => (p.related_story_ids ?? []).includes(storyId))
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      category_name: p.category_name,
      category_icon: p.category_icon,
    }));

  return c.json({ prayers });
});
