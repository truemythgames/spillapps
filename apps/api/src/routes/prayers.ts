import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale, overlayTranslations } from "../lib/locale";

export const prayersRoutes = new Hono<{ Bindings: Env }>();

prayersRoutes.get("/categories", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);

  const result = await c.env.DB.prepare(
    `SELECT * FROM prayer_categories WHERE app_id = ? ORDER BY sort_order ASC`
  )
    .bind(appId)
    .all();

  let categories = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "prayer_category",
    appId,
    locale,
    fields: ["name", "description"],
  });

  return c.json({ categories });
});

prayersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const categoryId = c.req.query("category_id");
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  let query = `
    SELECT p.*, pc.name as category_name, pc.slug as category_slug, pc.icon as category_icon
    FROM prayers p
    JOIN prayer_categories pc ON p.category_id = pc.id
    WHERE p.is_published = 1 AND p.app_id = ?
  `;
  const params: any[] = [appId];

  if (categoryId) {
    query += " AND p.category_id = ?";
    params.push(categoryId);
  }

  query += " ORDER BY pc.sort_order ASC, p.sort_order ASC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  let prayers = await overlayTranslations(c.env.DB, result.results as any[], {
    entityType: "prayer",
    appId,
    locale,
    fields: ["title", "description"],
  });

  return c.json({ prayers });
});

prayersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  let prayer = await c.env.DB.prepare(
    `SELECT p.*, pc.name as category_name, pc.slug as category_slug
     FROM prayers p
     JOIN prayer_categories pc ON p.category_id = pc.id
     WHERE (p.id = ? OR p.slug = ?) AND p.app_id = ?`
  )
    .bind(id, id, appId)
    .first();

  if (!prayer) {
    return c.json({ error: "Prayer not found" }, 404);
  }

  const [translated] = await overlayTranslations(c.env.DB, [prayer as any], {
    entityType: "prayer",
    appId,
    locale,
    fields: ["title", "description", "transcript"],
    nullIfMissing: ["transcript"],
  });
  prayer = translated;

  const prayerId = (prayer as any).id;

  let audioVersions = await c.env.DB.prepare(
    `SELECT pa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
     FROM prayer_audio pa
     JOIN speakers sp ON pa.speaker_id = sp.id AND sp.app_id = ?
     WHERE pa.prayer_id = ? AND (pa.locale = ? OR pa.locale IS NULL)
     ORDER BY sp.is_default DESC, sp.name ASC`
  )
    .bind(appId, prayerId, locale)
    .all();

  if (audioVersions.results.length === 0 && locale !== "en") {
    audioVersions = await c.env.DB.prepare(
      `SELECT pa.*, sp.name as speaker_name, sp.avatar_key as speaker_avatar
       FROM prayer_audio pa
       JOIN speakers sp ON pa.speaker_id = sp.id AND sp.app_id = ?
       WHERE pa.prayer_id = ? AND (pa.locale = 'en' OR pa.locale IS NULL)
       ORDER BY sp.is_default DESC, sp.name ASC`
    )
      .bind(appId, prayerId)
      .all();
  }

  const relatedStories = await c.env.DB.prepare(
    `SELECT s.id, s.title, s.slug, s.cover_image_key
     FROM stories s
     JOIN prayer_stories ps ON s.id = ps.story_id
     WHERE ps.prayer_id = ?`
  )
    .bind(prayerId)
    .all();

  const relatedCharacters = await c.env.DB.prepare(
    `SELECT ch.id, ch.name, ch.description
     FROM characters ch
     JOIN prayer_characters pch ON ch.id = pch.character_id
     WHERE pch.prayer_id = ?`
  )
    .bind(prayerId)
    .all();

  return c.json({
    prayer: {
      ...(prayer as any),
    },
    audio_versions: audioVersions.results.map((a: any) => ({
      ...a,
      audio_url: mediaUrl(c.env, a.audio_key, appId) ?? "",
      speaker_avatar_url: mediaUrl(c.env, a.speaker_avatar, appId),
    })),
    related_stories: relatedStories.results.map((s: any) => ({
      ...s,
      cover_image_url: mediaUrl(c.env, s.cover_image_key, appId),
    })),
    related_characters: relatedCharacters.results,
  });
});

prayersRoutes.get("/for-story/:storyId", async (c) => {
  const appId = resolvePublicAppId(c);
  const storyId = c.req.param("storyId");

  const result = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.slug, p.description, pc.name as category_name, pc.icon as category_icon
     FROM prayers p
     JOIN prayer_stories ps ON p.id = ps.prayer_id
     JOIN prayer_categories pc ON p.category_id = pc.id
     WHERE ps.story_id = ? AND p.app_id = ? AND p.is_published = 1
     ORDER BY p.sort_order ASC`
  )
    .bind(storyId, appId)
    .all();

  return c.json({ prayers: result.results });
});
