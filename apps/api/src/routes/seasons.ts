import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const seasonsRoutes = new Hono<{ Bindings: Env }>();

seasonsRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const testament = c.req.query("testament");

  let query = "SELECT * FROM seasons WHERE app_id = ?";
  const params: string[] = [appId];

  if (testament) {
    query += " AND testament = ?";
    params.push(testament);
  }

  query += " ORDER BY sort_order ASC";

  const result = await c.env.DB.prepare(query)
    .bind(...params)
    .all();

  const seasons = result.results.map((s: any) => ({
    ...s,
    cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
  }));

  return c.json({ seasons });
});

seasonsRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const id = c.req.param("id");

  const season = await c.env.DB.prepare(
    "SELECT * FROM seasons WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!season) {
    return c.json({ error: "Season not found" }, 404);
  }

  const stories = await c.env.DB.prepare(
    "SELECT * FROM stories WHERE season_id = ? AND app_id = ? AND is_published = 1 ORDER BY sort_order ASC"
  )
    .bind(id, appId)
    .all();

  return c.json({
    season: {
      ...season,
      cover_image_url: mediaUrl(c.env, (season as any).cover_image_key, appId),
    },
    stories: stories.results.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  });
});
