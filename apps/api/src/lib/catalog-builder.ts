/**
 * Catalog materializer.
 *
 * Reads content from D1 and writes ready-to-serve JSON payloads to KV
 * (see catalog-store.ts). Triggered by admin mutations and the nightly
 * cron. This is the ONLY place public catalog data is read from D1.
 */

import type { Env } from "../types";
import { mediaUrl } from "./media";
import { overlayTranslations, overlaySeasonNames } from "./locale";
import { parseAllowedAppIds } from "../middleware/auth";
import { catKey, writeCatalog } from "./catalog-store";

const LOCALES = ["en", "es"] as const;
export type CatalogLocale = (typeof LOCALES)[number];

const STORY_FIELDS = `s.id, s.season_id, s.title, s.slug, s.description, s.cover_image_key,
  s.duration_seconds, s.sort_order, s.is_free, s.is_published, s.published_at, s.bible_ref`;

export async function buildStories(env: Env, appId: string, locale: string) {
  const { results } = await env.DB.prepare(
    `SELECT ${STORY_FIELDS}, se.name as season_name, se.testament
     FROM stories s
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE s.is_published = 1 AND s.app_id = ?
     ORDER BY se.sort_order ASC, s.sort_order ASC`
  )
    .bind(appId)
    .all();

  let stories = await overlayTranslations(env.DB, results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  stories = await overlaySeasonNames(env.DB, stories, appId, locale);

  return {
    stories: stories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(env, s.cover_image_key, appId),
    })),
  };
}

export async function buildPlaylists(env: Env, appId: string, locale: string) {
  const { results: playlistRows } = await env.DB.prepare(
    "SELECT * FROM playlists WHERE app_id = ? ORDER BY is_featured DESC, sort_order ASC"
  )
    .bind(appId)
    .all();

  const playlists = await overlayTranslations(env.DB, playlistRows as any[], {
    entityType: "playlist",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const { results: storyRows } = await env.DB.prepare(
    `SELECT ps.playlist_id, ps.sort_order as playlist_order, ${STORY_FIELDS},
            se.name as season_name, se.testament
     FROM playlist_stories ps
     JOIN playlists p ON p.id = ps.playlist_id AND p.app_id = ?
     JOIN stories s ON s.id = ps.story_id AND s.app_id = ?
     JOIN seasons se ON se.id = s.season_id AND se.app_id = s.app_id
     WHERE s.is_published = 1
     ORDER BY ps.playlist_id, ps.sort_order ASC`
  )
    .bind(appId, appId)
    .all();

  const uniqueStories = [
    ...new Map((storyRows as any[]).map((s) => [s.id, s])).values(),
  ];
  let translatedStories = await overlayTranslations(env.DB, uniqueStories, {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  translatedStories = await overlaySeasonNames(env.DB, translatedStories, appId, locale);
  const storyById = new Map(
    translatedStories.map((s) => [
      s.id,
      { ...s, cover_image_url: mediaUrl(env, s.cover_image_key, appId) },
    ]),
  );

  const storiesByPlaylist = new Map<string, any[]>();
  for (const row of storyRows as any[]) {
    const story = storyById.get(row.id);
    if (!story) continue;
    const list = storiesByPlaylist.get(row.playlist_id) ?? [];
    list.push({ ...story, playlist_order: row.playlist_order });
    storiesByPlaylist.set(row.playlist_id, list);
  }

  return {
    playlists: playlists.map((p: any) => ({
      ...p,
      cover_image_url: mediaUrl(env, p.cover_image_key, appId),
      stories: storiesByPlaylist.get(p.id) ?? [],
    })),
  };
}

export async function buildCharacters(env: Env, appId: string, locale: string) {
  const { results: characters } = await env.DB.prepare(
    "SELECT * FROM characters WHERE app_id = ? ORDER BY sort_order, name"
  )
    .bind(appId)
    .all();

  const { results: storyRows } = await env.DB.prepare(
    `SELECT cs.character_id, s.id, s.title, s.slug, s.description,
            s.cover_image_key, s.duration_seconds
     FROM character_stories cs
     JOIN stories s ON s.id = cs.story_id AND s.app_id = ?
     JOIN characters ch ON ch.id = cs.character_id AND ch.app_id = ?
     WHERE s.is_published = 1`
  )
    .bind(appId, appId)
    .all();

  const translatedChars = await overlayTranslations(env.DB, characters as any[], {
    entityType: "character",
    appId,
    locale,
    fields: ["name", "description", "overview"],
  });

  const uniqueStories = [
    ...new Map((storyRows as any[]).map((s) => [s.id, s])).values(),
  ];
  const translatedStories = await overlayTranslations(env.DB, uniqueStories, {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  const storyById = new Map(translatedStories.map((s) => [s.id, s]));

  const storiesByChar = new Map<string, any[]>();
  for (const row of storyRows as any[]) {
    const story = storyById.get(row.id);
    if (!story) continue;
    const list = storiesByChar.get(row.character_id) ?? [];
    list.push(story);
    storiesByChar.set(row.character_id, list);
  }

  return {
    characters: translatedChars.map((ch: any) => ({
      ...ch,
      image_url: mediaUrl(env, ch.cover_image_key, appId),
      stories: (storiesByChar.get(ch.id) ?? []).map((s: any) => ({
        ...s,
        cover_image_url: mediaUrl(env, s.cover_image_key, appId),
      })),
    })),
  };
}

export async function buildSeasons(env: Env, appId: string, locale: string) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM seasons WHERE app_id = ? ORDER BY sort_order ASC"
  )
    .bind(appId)
    .all();

  const seasons = await overlayTranslations(env.DB, results as any[], {
    entityType: "season",
    appId,
    locale,
    fields: ["name", "description"],
  });

  return {
    seasons: seasons.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(env, s.cover_image_key, appId),
    })),
  };
}

export async function buildSpeakers(env: Env, appId: string) {
  const { results } = await env.DB.prepare(
    `SELECT sp.* FROM speakers sp WHERE sp.app_id = ?
     ORDER BY sp.is_default DESC, sp.name ASC`
  )
    .bind(appId)
    .all();

  return {
    speakers: results.map((s: any) => ({
      ...s,
      story_count: 0,
      avatar_url: mediaUrl(env, s.avatar_key, appId),
    })),
  };
}

export async function buildPrayers(env: Env, appId: string, locale: string) {
  const { results: categoryRows } = await env.DB.prepare(
    "SELECT * FROM prayer_categories WHERE app_id = ? ORDER BY sort_order ASC"
  )
    .bind(appId)
    .all();

  const categories = await overlayTranslations(env.DB, categoryRows as any[], {
    entityType: "prayer_category",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const { results: prayerRows } = await env.DB.prepare(
    `SELECT p.*, pc.name as category_name, pc.slug as category_slug, pc.icon as category_icon
     FROM prayers p
     JOIN prayer_categories pc ON p.category_id = pc.id
     WHERE p.is_published = 1 AND p.app_id = ?
     ORDER BY pc.sort_order ASC, p.sort_order ASC`
  )
    .bind(appId)
    .all();

  const prayers = await overlayTranslations(env.DB, prayerRows as any[], {
    entityType: "prayer",
    appId,
    locale,
    fields: ["title", "description"],
  });

  return { categories, prayers };
}

export async function buildSettings(env: Env, appId: string) {
  const { results } = await env.DB.prepare(
    "SELECT key, value FROM app_settings WHERE app_id = ?"
  )
    .bind(appId)
    .all();

  const settings: Record<string, string> = {};
  for (const row of results as any[]) {
    settings[row.key] = row.value;
  }
  return { settings };
}

export async function buildSotd(
  env: Env,
  appId: string,
  locale: string,
  date: string,
) {
  const feature = await env.DB.prepare(
    "SELECT * FROM daily_features WHERE feature_date = ? AND app_id = ?"
  )
    .bind(date, appId)
    .first<any>();

  let storyRow: any = null;
  let quote: string | null = null;
  let attribution: string | null = null;

  if (feature?.story_id) {
    storyRow = await env.DB.prepare(
      `SELECT s.*, se.name as season_name, se.testament
       FROM stories s JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
       WHERE s.id = ? AND s.app_id = ?`
    )
      .bind(feature.story_id, appId)
      .first();
    quote = feature.quote_text;
    attribution = feature.quote_attribution;
  }

  if (!storyRow) {
    const daysSinceEpoch = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 86400000);
    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM stories WHERE app_id = ? AND is_published = 1"
    )
      .bind(appId)
      .first<{ cnt: number }>();
    const total = countResult?.cnt ?? 1;
    const offset = daysSinceEpoch % total;

    storyRow = await env.DB.prepare(
      `SELECT s.*, se.name as season_name, se.testament
       FROM stories s JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
       WHERE s.app_id = ? AND s.is_published = 1
       ORDER BY s.sort_order ASC
       LIMIT 1 OFFSET ?`
    )
      .bind(appId, offset)
      .first();
  }

  if (storyRow) {
    const [translated] = await overlayTranslations(env.DB, [storyRow as any], {
      entityType: "story",
      appId,
      locale,
      fields: ["title", "description"],
    });
    const [withSeason] = await overlaySeasonNames(env.DB, [translated], appId, locale);
    storyRow = withSeason;
  }

  return {
    story: storyRow
      ? {
          ...(storyRow as any),
          cover_image_url: mediaUrl(env, (storyRow as any).cover_image_key, appId),
        }
      : null,
    ...(quote ? { quote, attribution } : {}),
  };
}

/**
 * Materialize every catalog payload for one app into KV.
 * Each payload is built independently — a failure (e.g. D1 quota) skips
 * that write and keeps the last good KV value.
 */
export async function rebuildCatalog(env: Env, appId: string): Promise<string[]> {
  const written: string[] = [];
  const today = new Date().toISOString().split("T")[0];

  const put = async (key: string, build: () => Promise<unknown>, ttl?: number) => {
    try {
      const data = await build();
      await writeCatalog(env.CACHE, key, data, ttl);
      written.push(key);
    } catch (err) {
      console.error(`catalog rebuild: skipped ${key}:`, err);
    }
  };

  for (const locale of LOCALES) {
    await put(catKey("stories", appId, locale), () => buildStories(env, appId, locale));
    await put(catKey("playlists", appId, locale), () => buildPlaylists(env, appId, locale));
    await put(catKey("characters", appId, locale), () => buildCharacters(env, appId, locale));
    await put(catKey("seasons", appId, locale), () => buildSeasons(env, appId, locale));
    await put(catKey("prayers", appId, locale), () => buildPrayers(env, appId, locale));
    // Dated key: expires on its own, rebuilt nightly by the cron.
    await put(
      catKey("sotd", appId, locale, today),
      () => buildSotd(env, appId, locale, today),
      36 * 3600,
    );
  }
  await put(catKey("speakers", appId), () => buildSpeakers(env, appId));
  await put(catKey("settings", appId), () => buildSettings(env, appId));

  return written;
}

export async function rebuildAllCatalogs(env: Env): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  for (const appId of parseAllowedAppIds(env)) {
    out[appId] = await rebuildCatalog(env, appId);
  }
  return out;
}
