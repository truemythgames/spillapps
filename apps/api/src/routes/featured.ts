import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const featuredRoutes = new Hono<{ Bindings: Env }>();

featuredRoutes.get("/story-of-the-day", async (c) => {
  const appId = resolvePublicAppId(c);
  const today = new Date().toISOString().split("T")[0];
  const cacheKey = `sotd:${appId}:${today}`;

  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) {
    return c.json(JSON.parse(cached));
  }

  const feature = await c.env.DB.prepare(
    "SELECT * FROM daily_features WHERE feature_date = ? AND app_id = ?"
  )
    .bind(today, appId)
    .first<any>();

  let storyRow: any = null;
  let quote: string | null = null;
  let attribution: string | null = null;

  if (feature?.story_id) {
    storyRow = await c.env.DB.prepare(
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
    const daysSinceEpoch = Math.floor(Date.now() / 86400000);
    const countResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM stories WHERE app_id = ? AND is_published = 1"
    )
      .bind(appId)
      .first<{ cnt: number }>();
    const total = countResult?.cnt ?? 1;
    const offset = daysSinceEpoch % total;

    storyRow = await c.env.DB.prepare(
      `SELECT s.*, se.name as season_name, se.testament
       FROM stories s JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
       WHERE s.app_id = ? AND s.is_published = 1
       ORDER BY s.sort_order ASC
       LIMIT 1 OFFSET ?`
    )
      .bind(appId, offset)
      .first();
  }

  const response = {
    story: storyRow
      ? {
          ...(storyRow as any),
          cover_image_url: mediaUrl(c.env, (storyRow as any).cover_image_key, appId),
        }
      : null,
    ...(quote ? { quote, attribution } : {}),
  };

  const secondsUntilMidnight =
    86400 - ((Date.now() / 1000) % 86400);
  await c.env.CACHE.put(cacheKey, JSON.stringify(response), {
    expirationTtl: Math.max(Math.floor(secondsUntilMidnight), 60),
  });

  return c.json(response);
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
          cover_image_url: mediaUrl(c.env, (playlist as any).cover_image_key, appId),
        }
      : null,
  });
});
