import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslations, overlayTranslation } from "../lib/locale";

export const charactersRoutes = new Hono<{ Bindings: Env }>();

charactersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const { results: characters } = await c.env.DB.prepare(
    "SELECT * FROM characters WHERE app_id = ? ORDER BY sort_order, name"
  )
    .bind(appId)
    .all();

  const translatedChars = await overlayTranslations(c.env.DB, characters as any[], {
    entityType: "character",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const enriched = await Promise.all(
    translatedChars.map(async (ch: any) => {
      const { results: stories } = await c.env.DB.prepare(
        `SELECT s.id, s.title, s.slug, s.description, s.cover_image_key
         FROM character_stories cs
         JOIN stories s ON s.id = cs.story_id AND s.app_id = ?
         WHERE cs.character_id = ?`
      )
        .bind(appId, ch.id)
        .all();

      const translatedStories = await overlayTranslations(c.env.DB, stories as any[], {
        entityType: "story",
        appId,
        locale,
        fields: ["title", "description"],
      });

      return {
        ...ch,
        image_url: mediaUrl(c.env, ch.cover_image_key, appId),
        stories: translatedStories.map((s: any) => ({
          ...s,
          cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
        })),
      };
    })
  );

  return c.json({ characters: enriched });
});

charactersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  let character = await c.env.DB.prepare(
    "SELECT * FROM characters WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!character) return c.json({ error: "Character not found" }, 404);

  character = await overlayTranslation(c.env.DB, character as any, {
    entityType: "character",
    appId,
    locale,
    fields: ["name", "description"],
  });

  const { results: stories } = await c.env.DB.prepare(
    `SELECT s.id, s.title, s.slug, s.description, s.cover_image_key, s.duration_seconds
     FROM character_stories cs
     JOIN stories s ON s.id = cs.story_id AND s.app_id = ?
     WHERE cs.character_id = ?`
  )
    .bind(appId, id)
    .all();

  const translatedStories = await overlayTranslations(c.env.DB, stories as any[], {
    entityType: "story",
    appId,
    locale,
    fields: ["title", "description"],
  });

  return c.json({
    character: {
      ...(character as any),
      image_url: mediaUrl(c.env, (character as any).cover_image_key, appId),
    },
    stories: translatedStories.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
  });
});
