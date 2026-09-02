import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslations, overlayTranslation, overlaySeasonNames } from "../lib/locale";
import { readCatalogCache, writeCatalogCache } from "../lib/catalog-cache";

export const storiesRoutes = new Hono<{ Bindings: Env }>();

storiesRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const seasonId = c.req.query("season_id");
  const testament = c.req.query("testament");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  const cacheKey = `catalog:stories:${appId}:${locale}:${seasonId ?? ""}:${testament ?? ""}:${limit}:${offset}`;
  const cached = await readCatalogCache<{ stories: any[] }>(c.env.CACHE, cacheKey);
  if (cached) return c.json(cached);

  let query = `
    SELECT s.id, s.season_id, s.title, s.slug, s.description, s.cover_image_key,
           s.duration_seconds, s.sort_order, s.is_free, s.is_published, s.published_at,
           s.bible_ref, se.name as season_name, se.testament
    FROM stories s
    JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
    WHERE s.is_published = 1 AND s.app_id = ?
  `;
  const params: any[] = [appId];

  if (seasonId) {
    query += " AND s.season_id = ?";
    params.push(seasonId);
  }

  if (testament) {
    query += " AND se.testament = ?";
    params.push(testament);
  }

  query += " ORDER BY se.sort_order ASC, s.sort_order ASC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const result = await c.env.DB.prepare(query)
    .bind(...params)
    .all();

  let stories = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  stories = await overlaySeasonNames(c.env.DB, stories, appId, locale);

  const payload = {
    stories: stories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  };
  await writeCatalogCache(c.env.CACHE, cacheKey, payload);
  return c.json(payload);
});

storiesRoutes.get("/recently-added", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const limit = parseInt(c.req.query("limit") || "10");
  const cacheKey = `catalog:recent:${appId}:${locale}:${limit}`;
  const cached = await readCatalogCache<{ stories: any[] }>(c.env.CACHE, cacheKey);
  if (cached) return c.json(cached);

  const result = await c.env.DB.prepare(
    `SELECT s.id, s.season_id, s.title, s.slug, s.description, s.cover_image_key,
            s.duration_seconds, s.sort_order, s.bible_ref, se.name as season_name, se.testament
     FROM stories s
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE s.is_published = 1 AND s.app_id = ?
     ORDER BY s.published_at DESC
     LIMIT ?`
  )
    .bind(appId, limit)
    .all();

  let stories = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  stories = await overlaySeasonNames(c.env.DB, stories, appId, locale);

  const payload = {
    stories: stories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  };
  await writeCatalogCache(c.env.CACHE, cacheKey, payload);
  return c.json(payload);
});

storiesRoutes.get("/popular", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const cacheKey = `popular-stories:${appId}:${locale}`;
  const cached = await readCatalogCache<{ stories: any[] }>(c.env.CACHE, cacheKey);
  if (cached) {
    return c.json(cached);
  }

  const result = await c.env.DB.prepare(
    `SELECT s.id, s.season_id, s.title, s.slug, s.description, s.cover_image_key,
            s.duration_seconds, s.sort_order, s.bible_ref, se.name as season_name, se.testament
     FROM stories s
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE s.is_published = 1 AND s.app_id = ?
     ORDER BY s.published_at DESC
     LIMIT 20`
  )
    .bind(appId)
    .all();

  let stories = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  stories = await overlaySeasonNames(c.env.DB, stories, appId, locale);

  const data = {
    stories: stories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  };

  await writeCatalogCache(c.env.CACHE, cacheKey, data, 3600);

  return c.json(data);
});

storiesRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

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

  return c.json({
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
  });
});
