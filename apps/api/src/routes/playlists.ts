import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const playlistsRoutes = new Hono<{ Bindings: Env }>();

playlistsRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const result = await c.env.DB.prepare(
    "SELECT * FROM playlists WHERE app_id = ? ORDER BY is_featured DESC, sort_order ASC"
  )
    .bind(appId)
    .all();

  return c.json({
    playlists: result.results.map((p: any) => ({
      ...p,
      cover_image_url: mediaUrl(c.env, p.cover_image_key, appId),
    })),
  });
});

playlistsRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const id = c.req.param("id");

  const playlist = await c.env.DB.prepare(
    "SELECT * FROM playlists WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!playlist) {
    return c.json({ error: "Playlist not found" }, 404);
  }

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

  return c.json({
    playlist: {
      ...(playlist as any),
      cover_image_url: mediaUrl(c.env, (playlist as any).cover_image_key, appId),
    },
    stories: stories.results.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  });
});
