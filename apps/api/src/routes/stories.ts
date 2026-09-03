import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslation, overlayTranslations, overlaySeasonNames } from "../lib/locale";
import { catKey, loadCatalog, readCatalog, edgeCache } from "../lib/catalog-store";
import { buildStories } from "../lib/catalog-builder";

export const storiesRoutes = new Hono<{ Bindings: Env }>();

/** Full stories catalog from KV; filters applied in-memory (301 rows, cheap). */
async function loadStories(c: any, appId: string, locale: string) {
  return loadCatalog<{ stories: any[] }>(
    c.env.CACHE,
    catKey("stories", appId, locale),
    () => buildStories(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("stories", appId, "en")],
    },
  );
}

storiesRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const seasonId = c.req.query("season_id");
  const testament = c.req.query("testament");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const catalog = await loadStories(c, appId, locale);
  if (!catalog) return c.json({ stories: [] });

  let stories = catalog.stories;
  if (seasonId) stories = stories.filter((s) => s.season_id === seasonId);
  if (testament) stories = stories.filter((s) => s.testament === testament);

  return c.json({ stories: stories.slice(offset, offset + limit) });
});

storiesRoutes.get("/recently-added", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const limit = parseInt(c.req.query("limit") || "10");

  const catalog = await loadStories(c, appId, locale);
  if (!catalog) return c.json({ stories: [] });

  const stories = [...catalog.stories]
    .sort((a, b) => String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")))
    .slice(0, limit);

  return c.json({ stories });
});

storiesRoutes.get("/popular", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);

  const catalog = await loadStories(c, appId, locale);
  if (!catalog) return c.json({ stories: [] });

  const stories = [...catalog.stories]
    .sort((a, b) => String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")))
    .slice(0, 20);

  return c.json({ stories });
});

/**
 * Story detail (transcript, audio versions, characters, related prayers).
 * Per-story and low-volume, so it stays on D1 — but the response is edge
 * cached so repeat opens in a region don't re-query.
 */
storiesRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  const edgeKey = new Request(
    // story4: bumped so payloads cached with unpublished takes are skipped.
    `https://catalog.cache/${encodeURIComponent(`cat3edge:story4:${appId}:${locale}:${id}`)}`,
  );
  try {
    const hit = await edgeCache().match(edgeKey);
    if (hit) return c.json(await hit.json());
  } catch {}

  try {
    return await storyDetailFromD1(c, appId, locale, id, edgeKey);
  } catch (err) {
    // D1 down (e.g. quota). Serve a degraded but playable detail from the
    // stories catalog in KV + the actual audio files in R2.
    console.error("story detail D1 failed, using KV+R2 fallback:", err);
    const fallback = await storyDetailFallback(c, appId, locale, id);
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
    return c.json({ error: "Story temporarily unavailable" }, 503);
  }
});

async function storyDetailFromD1(
  c: any,
  appId: string,
  locale: string,
  id: string,
  edgeKey: Request,
) {
  let story = await c.env.DB.prepare(
    `SELECT s.*, se.name as season_name, se.testament
     FROM stories s
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE s.id = ? AND s.app_id = ?`
  )
    .bind(id, appId)
    .first();

  if (!story) {
    story = await c.env.DB.prepare(
      `SELECT s.*, se.name as season_name, se.testament
       FROM stories s
       JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
       WHERE s.slug = ? AND s.app_id = ?`
    )
      .bind(id, appId)
      .first();
  }

  if (!story) {
    return c.json({ error: "Story not found" }, 404);
  }

  story = await overlayTranslation(c.env.DB, story as any, {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description", "transcript"],
    nullIfMissing: ["transcript"],
  });
  const [translatedStory] = await overlaySeasonNames(c.env.DB, [story as any], appId, locale);
  story = translatedStory;

  const storyId = (story as any).id;

  let audioVersions = await c.env.DB.prepare(
    `SELECT sa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
     FROM story_audio sa
     JOIN speakers sp ON sa.speaker_id = sp.id AND sp.app_id = ?
     WHERE sa.story_id = ? AND (sa.locale = ? OR sa.locale IS NULL)
     ORDER BY sp.is_default DESC, sp.name ASC`
  )
    .bind(appId, storyId, locale)
    .all();

  if (audioVersions.results.length === 0 && locale !== "en") {
    audioVersions = await c.env.DB.prepare(
      `SELECT sa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
       FROM story_audio sa
       JOIN speakers sp ON sa.speaker_id = sp.id AND sp.app_id = ?
       WHERE sa.story_id = ? AND (sa.locale = 'en' OR sa.locale IS NULL)
       ORDER BY sp.is_default DESC, sp.name ASC`
    )
      .bind(appId, storyId)
      .all();
  }

  const characters = await c.env.DB.prepare(
    `SELECT ch.* FROM characters ch
     JOIN character_stories cs ON ch.id = cs.character_id
     WHERE cs.story_id = ? AND ch.app_id = ?`
  )
    .bind(storyId, appId)
    .all();

  const translatedChars = await overlayTranslations(c.env.DB, characters.results as any[], {
    entityType: "character",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const relatedPrayerRows = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.slug, p.description, pc.name as category_name, pc.icon as category_icon
     FROM prayers p
     JOIN prayer_stories ps ON p.id = ps.prayer_id
     JOIN prayer_categories pc ON p.category_id = pc.id
     WHERE ps.story_id = ? AND p.app_id = ? AND p.is_published = 1
     ORDER BY p.sort_order ASC`
  )
    .bind(storyId, appId)
    .all();

  const relatedPrayers = await overlayTranslations(c.env.DB, relatedPrayerRows.results as any[], {
    entityType: "prayer",
    appId,
    locale,
    fields: ["title", "description"],
  });

  const payload = {
    story: {
      ...(story as any),
      cover_image_url: mediaUrl(c.env, (story as any).cover_image_key, appId),
    },
    audio_versions: audioVersions.results.map((a: any) => ({
      ...a,
      audio_url: mediaUrl(c.env, a.audio_key, appId) ?? "",
      speaker_avatar_url: mediaUrl(c.env, a.speaker_avatar, appId),
    })),
    characters: translatedChars.map((ch: any) => ({
      ...ch,
      cover_image_url: mediaUrl(c.env, ch.cover_image_key, appId),
    })),
    related_prayers: relatedPrayers,
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

/**
 * D1-free story detail: story row from the stories catalog in KV, audio
 * versions discovered by listing R2 (narration-<speaker>[-es].mp3),
 * characters derived from the characters catalog. No transcript.
 */
async function storyDetailFallback(
  c: any,
  appId: string,
  locale: string,
  id: string,
): Promise<Record<string, unknown> | null> {
  const catalog =
    (await readCatalog<{ stories: any[] }>(c.env.CACHE, catKey("stories", appId, locale))) ??
    (await readCatalog<{ stories: any[] }>(c.env.CACHE, catKey("stories", appId, "en")));
  const story = catalog?.stories?.find((s) => s.id === id || s.slug === id);
  if (!story) return null;

  // Transcript from the materialized transcripts map (locale, then en).
  let transcript: string | null = null;
  for (const loc of locale === "en" ? ["en"] : [locale, "en"]) {
    const map = await readCatalog<{ transcripts: Record<string, string> }>(
      c.env.CACHE,
      catKey("transcripts", appId, loc),
    );
    if (map?.transcripts?.[story.id]) {
      transcript = map.transcripts[story.id];
      break;
    }
  }

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
    prefix: `${appId}/stories/${story.slug}/`,
  });
  const audioObjects = (listing.objects ?? []).filter((o: any) =>
    /\/narration-[^/]+\.mp3$/.test(o.key),
  );

  const wantEs = locale === "es";
  const esFiles = audioObjects.filter((o: any) => /-es\.mp3$/.test(o.key));
  const enFiles = audioObjects.filter((o: any) => !/-es\.mp3$/.test(o.key));
  const chosen = wantEs && esFiles.length ? esFiles : enFiles;

  const audio_versions = chosen
    .map((o: any) => {
      const m = o.key.match(/narration-([^/]+?)(?:-es)?\.mp3$/);
      const speakerKey = m?.[1] ?? "narrator";
      const sp = speakerByKey.get(speakerKey);
      // Unregistered takes in R2 (e.g. narration-grace-v2.mp3) are not published.
      if (!sp) return null;
      return {
        id: `fallback-${story.slug}-${speakerKey}`,
        story_id: story.id,
        speaker_id: sp?.id ?? speakerKey,
        audio_key: o.key,
        duration_seconds: story.duration_seconds ?? 0,
        speaker_name: sp?.name ?? speakerKey.charAt(0).toUpperCase() + speakerKey.slice(1),
        speaker_avatar: sp?.avatar_key ?? null,
        audio_url: mediaUrl(c.env, o.key, appId) ?? "",
        speaker_avatar_url: sp ? mediaUrl(c.env, sp.avatar_key, appId) : null,
        is_default: Number(sp?.is_default ?? 0),
      };
    })
    .filter(Boolean)
    // Match the D1 route: default speaker (Grace) first, then by name.
    .sort(
      (a: any, b: any) =>
        b.is_default - a.is_default || a.speaker_name.localeCompare(b.speaker_name),
    );

  const charactersPayload = await readCatalog<{ characters: any[] }>(
    c.env.CACHE,
    catKey("characters", appId, locale),
  );
  const characters = (charactersPayload?.characters ?? [])
    .filter((ch: any) => (ch.stories ?? []).some((s: any) => s.id === story.id))
    .map(({ stories: _stories, ...ch }: any) => ({
      ...ch,
      cover_image_url: ch.image_url ?? null,
    }));

  return {
    story: { ...story, transcript },
    audio_versions,
    characters,
    related_prayers: [],
  };
}
