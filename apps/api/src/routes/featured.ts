import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const featuredRoutes = new Hono<{ Bindings: Env }>();

featuredRoutes.get("/story-of-the-day", async (c) => {
  const appId = resolvePublicAppId(c);
  const cacheKey = `story-of-the-day:${appId}`;
  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) {
    const feature = JSON.parse(cached);
    const story = await c.env.DB.prepare(
      `SELECT s.*, se.name as season_name, se.testament
       FROM stories s JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
       WHERE s.id = ? AND s.app_id = ?`
    )
      .bind(feature.story_id, appId)
      .first();

    if (story) {
      return c.json({
        story: {
          ...(story as any),
          cover_image_url: mediaUrl(c.env, (story as any).cover_image_key),
        },
        quote: feature.quote_text,
        attribution: feature.quote_attribution,
      });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const feature = await c.env.DB.prepare(
    "SELECT * FROM daily_features WHERE feature_date = ? AND app_id = ?"
  )
    .bind(today, appId)
    .first<any>();

  if (!feature?.story_id) {
    const randomStory = await c.env.DB.prepare(
      "SELECT * FROM stories WHERE app_id = ? AND is_published = 1 AND is_free = 1 ORDER BY RANDOM() LIMIT 1"
    )
      .bind(appId)
      .first();
    return c.json({
      story: randomStory
        ? {
            ...(randomStory as any),
            cover_image_url: mediaUrl(c.env, (randomStory as any).cover_image_key),
          }
        : null,
    });
  }

  const story = await c.env.DB.prepare(
    `SELECT s.*, se.name as season_name, se.testament
     FROM stories s JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE s.id = ? AND s.app_id = ?`
  )
    .bind(feature.story_id, appId)
    .first();

  return c.json({
    story: story
      ? {
          ...(story as any),
          cover_image_url: mediaUrl(c.env, (story as any).cover_image_key),
        }
      : null,
    quote: feature.quote_text,
    attribution: feature.quote_attribution,
  });
});

featuredRoutes.get("/playlist-of-the-week", async (c) => {
  const appId = resolvePublicAppId(c);
  const cacheKey = `playlist-of-the-week:${appId}`;
  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) {
    return c.json({ playlist: JSON.parse(cached) });
  }

  const playlist = await c.env.DB.prepare(
    "SELECT * FROM playlists WHERE is_featured = 1 AND app_id = ? LIMIT 1"
  )
    .bind(appId)
    .first();

  if (playlist) {
    await c.env.CACHE.put(cacheKey, JSON.stringify(playlist), {
      expirationTtl: 604800,
    });
  }

  return c.json({
    playlist: playlist
      ? {
          ...(playlist as any),
          cover_image_url: mediaUrl(c.env, (playlist as any).cover_image_key),
        }
      : null,
  });
});
