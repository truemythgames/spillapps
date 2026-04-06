import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const storiesRoutes = new Hono<{ Bindings: Env }>();

storiesRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const seasonId = c.req.query("season_id");
  const testament = c.req.query("testament");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  let query = `
    SELECT s.*, se.name as season_name, se.testament
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

  return c.json({
    stories: result.results.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key),
    })),
  });
});

storiesRoutes.get("/recently-added", async (c) => {
  const appId = resolvePublicAppId(c);
  const limit = parseInt(c.req.query("limit") || "10");

  const result = await c.env.DB.prepare(
    `SELECT s.*, se.name as season_name, se.testament
     FROM stories s
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE s.is_published = 1 AND s.app_id = ?
     ORDER BY s.published_at DESC
     LIMIT ?`
  )
    .bind(appId, limit)
    .all();

  return c.json({
    stories: result.results.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key),
    })),
  });
});

storiesRoutes.get("/popular", async (c) => {
  const appId = resolvePublicAppId(c);
  const cacheKey = `popular-stories:${appId}`;
  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) {
    return c.json(JSON.parse(cached));
  }

  const result = await c.env.DB.prepare(
    `SELECT s.*, se.name as season_name, se.testament,
            COUNT(up.story_id) as play_count
     FROM stories s
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     LEFT JOIN user_progress up ON s.id = up.story_id
     WHERE s.is_published = 1 AND s.app_id = ?
     GROUP BY s.id
     ORDER BY play_count DESC
     LIMIT 20`
  )
    .bind(appId)
    .all();

  const data = {
    stories: result.results.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key),
    })),
  };

  await c.env.CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: 3600,
  });

  return c.json(data);
});

storiesRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
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

  const storyId = (story as any).id;

  const audioVersions = await c.env.DB.prepare(
    `SELECT sa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
     FROM story_audio sa
     JOIN speakers sp ON sa.speaker_id = sp.id AND sp.app_id = ?
     WHERE sa.story_id = ?`
  )
    .bind(appId, storyId)
    .all();

  const characters = await c.env.DB.prepare(
    `SELECT ch.* FROM characters ch
     JOIN character_stories cs ON ch.id = cs.character_id
     WHERE cs.story_id = ? AND ch.app_id = ?`
  )
    .bind(storyId, appId)
    .all();

  return c.json({
    story: {
      ...(story as any),
      cover_image_url: mediaUrl(c.env, (story as any).cover_image_key),
    },
    audio_versions: audioVersions.results.map((a: any) => ({
      ...a,
      audio_url: mediaUrl(c.env, a.audio_key) ?? "",
      speaker_avatar_url: mediaUrl(c.env, a.speaker_avatar),
    })),
    characters: characters.results.map((ch: any) => ({
      ...ch,
      cover_image_url: mediaUrl(c.env, ch.cover_image_key),
    })),
  });
});
