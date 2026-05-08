import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslations, overlayTranslation } from "../lib/locale";

export const seasonsRoutes = new Hono<{ Bindings: Env }>();

seasonsRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
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

  const seasons = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "season",
    appId,
    locale,
    fields: ["name", "description"],
  });

  return c.json({
    seasons: seasons.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  });
});

seasonsRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  let season = await c.env.DB.prepare(
    "SELECT * FROM seasons WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!season) {
    return c.json({ error: "Season not found" }, 404);
  }

  season = await overlayTranslation(c.env.DB, season as any, {
    entityType: "season",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const stories = await c.env.DB.prepare(
    "SELECT * FROM stories WHERE season_id = ? AND app_id = ? AND is_published = 1 ORDER BY sort_order ASC"
  )
    .bind(id, appId)
    .all();

  const translatedStories = await overlayTranslations(c.env.DB, stories.results as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });

  return c.json({
    season: {
      ...season,
      cover_image_url: mediaUrl(c.env, (season as any).cover_image_key, appId),
    },
    stories: translatedStories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  });
});
