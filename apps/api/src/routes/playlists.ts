import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslations, overlayTranslation, overlaySeasonNames } from "../lib/locale";
import { readCatalogCache, writeCatalogCache } from "../lib/catalog-cache";

export const playlistsRoutes = new Hono<{ Bindings: Env }>();

playlistsRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const cacheKey = `catalog:playlists:${appId}:${locale}`;
  const cached = await readCatalogCache<{ playlists: any[] }>(c.env.CACHE, cacheKey);
  if (cached) return c.json(cached);

  const result = await c.env.DB.prepare(
    "SELECT * FROM playlists WHERE app_id = ? ORDER BY is_featured DESC, sort_order ASC"
  )
    .bind(appId)
    .all();

  const playlists = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "playlist",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const payload = {
    playlists: playlists.map((p: any) => ({
      ...p,
      cover_image_url: mediaUrl(c.env, p.cover_image_key, appId),
    })),
  };
  await writeCatalogCache(c.env.CACHE, cacheKey, payload);
  return c.json(payload);
});

playlistsRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");
  const cacheKey = `catalog:playlist:${appId}:${locale}:${id}`;
  const cached = await readCatalogCache<{ playlist: any; stories: any[] }>(c.env.CACHE, cacheKey);
  if (cached) return c.json(cached);

  let playlist = await c.env.DB.prepare(
    "SELECT * FROM playlists WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!playlist) {
    return c.json({ error: "Playlist not found" }, 404);
  }

  playlist = await overlayTranslation(c.env.DB, playlist as any, {
    entityType: "playlist",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const stories = await c.env.DB.prepare(
    `SELECT s.*, ps.sort_order as playlist_order, se.name as season_name
     FROM playlist_stories ps
     JOIN stories s ON ps.story_id = s.id AND s.app_id = ?
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE ps.playlist_id = ?
     ORDER BY ps.sort_order ASC`
  )
    .bind(appId, id)
    .all();

  let translatedStories = await overlayTranslations(c.env.DB, stories.results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });
  translatedStories = await overlaySeasonNames(c.env.DB, translatedStories, appId, locale);

  const payload = {
    playlist: {
      ...(playlist as any),
      cover_image_url: mediaUrl(c.env, (playlist as any).cover_image_key, appId),
    },
    stories: translatedStories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  };
  await writeCatalogCache(c.env.CACHE, cacheKey, payload);
  return c.json(payload);
});
