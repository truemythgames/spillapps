import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const charactersRoutes = new Hono<{ Bindings: Env }>();

charactersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const { results: characters } = await c.env.DB.prepare(
    "SELECT * FROM characters WHERE app_id = ? ORDER BY sort_order, name"
  )
    .bind(appId)
    .all();

  const enriched = await Promise.all(
    characters.map(async (ch: any) => {
      const { results: stories } = await c.env.DB.prepare(
        `SELECT s.id, s.title, s.slug, s.description, s.cover_image_key
         FROM character_stories cs
         JOIN stories s ON s.id = cs.story_id AND s.app_id = ?
         WHERE cs.character_id = ?`
      )
        .bind(appId, ch.id)
        .all();
      return {
        ...ch,
        image_url: mediaUrl(c.env, ch.cover_image_key),
        stories: stories.map((s: any) => ({
          ...s,
          cover_image_url: mediaUrl(c.env, s.cover_image_key),
        })),
      };
    })
  );

  return c.json({ characters: enriched });
});

charactersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const id = c.req.param("id");

  const character = await c.env.DB.prepare(
    "SELECT * FROM characters WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!character) return c.json({ error: "Character not found" }, 404);

  const { results: stories } = await c.env.DB.prepare(
    `SELECT s.id, s.title, s.slug, s.description, s.cover_image_key, s.duration_seconds
     FROM character_stories cs
     JOIN stories s ON s.id = cs.story_id AND s.app_id = ?
     WHERE cs.character_id = ?`
  )
    .bind(appId, id)
    .all();

  return c.json({
    character: {
      ...(character as any),
      image_url: mediaUrl(c.env, (character as any).cover_image_key),
    },
    stories: stories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key),
    })),
  });
});
