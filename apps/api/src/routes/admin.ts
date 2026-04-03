import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { mediaUrl } from "../lib/media";
import { normalizeKeyForDb, normalizeStorageKeyForApp } from "../lib/storage-keys";
import { resolveAdminTargetAppId } from "../lib/request-app";

export const adminRoutes = new Hono<{ Bindings: Env }>();

adminRoutes.use("*", requireAuth, requireAdmin);

adminRoutes.post("/stories", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const body = await c.req.json();
  const seasonOk = await c.env.DB.prepare(
    "SELECT 1 FROM seasons WHERE id = ? AND app_id = ?"
  )
    .bind(body.season_id, appId)
    .first();
  if (!seasonOk) {
    return c.json({ error: "Season not found for this app" }, 400);
  }
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO stories (id, app_id, season_id, title, slug, description, cover_image_key, duration_seconds, sort_order, is_free, is_published, published_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      appId,
      body.season_id,
      body.title,
      body.slug,
      body.description || "",
      normalizeKeyForDb(body.cover_image_key, appId),
      body.duration_seconds || 0,
      body.sort_order || 0,
      body.is_free ? 1 : 0,
      body.is_published ? 1 : 0,
      body.is_published ? new Date().toISOString() : null,
      new Date().toISOString()
    )
    .run();

  return c.json({ id, success: true }, 201);
});

adminRoutes.put("/stories/:id", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE stories SET
       title = COALESCE(?, title),
       slug = COALESCE(?, slug),
       description = COALESCE(?, description),
       cover_image_key = COALESCE(?, cover_image_key),
       duration_seconds = COALESCE(?, duration_seconds),
       sort_order = COALESCE(?, sort_order),
       is_free = COALESCE(?, is_free),
       is_published = COALESCE(?, is_published),
       published_at = CASE WHEN ? = 1 AND published_at IS NULL THEN ? ELSE published_at END
     WHERE id = ? AND app_id = ?`
  )
    .bind(
      body.title ?? null,
      body.slug ?? null,
      body.description ?? null,
      body.cover_image_key !== undefined
        ? normalizeKeyForDb(body.cover_image_key, appId)
        : null,
      body.duration_seconds ?? null,
      body.sort_order ?? null,
      body.is_free != null ? (body.is_free ? 1 : 0) : null,
      body.is_published != null ? (body.is_published ? 1 : 0) : null,
      body.is_published ? 1 : 0,
      new Date().toISOString(),
      id,
      appId
    )
    .run();

  return c.json({ success: true });
});

adminRoutes.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  const key = formData.get("key") as string;

  if (!file || !key) {
    return c.json({ error: "File and key are required" }, 400);
  }

  const objectKey = normalizeStorageKeyForApp(key, resolveAdminTargetAppId(c));

  await c.env.MEDIA.put(objectKey, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return c.json({
    key: objectKey,
    url: mediaUrl(c.env, objectKey) ?? "",
    size: file.size,
  });
});

adminRoutes.post("/speakers", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO speakers (id, app_id, name, bio, avatar_key, voice_style, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      appId,
      body.name,
      body.bio || "",
      normalizeKeyForDb(body.avatar_key, appId),
      body.voice_style || "",
      body.is_default ? 1 : 0
    )
    .run();

  return c.json({ id, success: true }, 201);
});

adminRoutes.post("/story-audio", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();

  const story = await c.env.DB.prepare(
    "SELECT 1 FROM stories WHERE id = ? AND app_id = ?"
  )
    .bind(body.story_id, appId)
    .first();
  const speaker = await c.env.DB.prepare(
    "SELECT 1 FROM speakers WHERE id = ? AND app_id = ?"
  )
    .bind(body.speaker_id, appId)
    .first();
  if (!story || !speaker) {
    return c.json({ error: "Story or speaker not found for this app" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO story_audio (id, story_id, speaker_id, audio_key, duration_seconds) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      body.story_id,
      body.speaker_id,
      normalizeKeyForDb(body.audio_key, appId) ?? "",
      body.duration_seconds || 0
    )
    .run();

  return c.json({ id, success: true }, 201);
});

adminRoutes.post("/playlists", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO playlists (id, app_id, name, description, cover_image_key, playlist_type, is_featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      appId,
      body.name,
      body.description || "",
      normalizeKeyForDb(body.cover_image_key, appId),
      body.playlist_type || "curated",
      body.is_featured ? 1 : 0,
      body.sort_order || 0
    )
    .run();

  return c.json({ id, success: true }, 201);
});

// --- Characters ---

adminRoutes.post("/characters", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const body = await c.req.json();
  const id = body.id || crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO characters (id, app_id, name, description, cover_image_key, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      appId,
      body.name,
      body.description || "",
      normalizeKeyForDb(body.cover_image_key, appId),
      body.sort_order || 0
    )
    .run();

  if (body.story_ids?.length) {
    for (const storyId of body.story_ids) {
      const ok = await c.env.DB.prepare(
        "SELECT 1 FROM stories WHERE id = ? AND app_id = ?"
      )
        .bind(storyId, appId)
        .first();
      if (!ok) continue;
      await c.env.DB.prepare(
        "INSERT OR IGNORE INTO character_stories (character_id, story_id) VALUES (?, ?)"
      )
        .bind(id, storyId)
        .run();
    }
  }

  return c.json({ id, success: true }, 201);
});

adminRoutes.put("/characters/:id", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE characters SET
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       cover_image_key = COALESCE(?, cover_image_key),
       sort_order = COALESCE(?, sort_order)
     WHERE id = ? AND app_id = ?`
  )
    .bind(
      body.name ?? null,
      body.description ?? null,
      body.cover_image_key ?? null,
      body.sort_order ?? null,
      id,
      appId
    )
    .run();

  if (body.story_ids) {
    await c.env.DB.prepare("DELETE FROM character_stories WHERE character_id = ?").bind(id).run();
    for (const storyId of body.story_ids) {
      const ok = await c.env.DB.prepare(
        "SELECT 1 FROM stories WHERE id = ? AND app_id = ?"
      )
        .bind(storyId, appId)
        .first();
      if (!ok) continue;
      await c.env.DB.prepare(
        "INSERT OR IGNORE INTO character_stories (character_id, story_id) VALUES (?, ?)"
      )
        .bind(id, storyId)
        .run();
    }
  }

  return c.json({ success: true });
});

adminRoutes.delete("/characters/:id", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM character_stories WHERE character_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM characters WHERE id = ? AND app_id = ?")
    .bind(id, appId)
    .run();
  return c.json({ success: true });
});

adminRoutes.post("/cache/purge", async (c) => {
  const appId = resolveAdminTargetAppId(c);
  const keys = [
    `story-of-the-day:${appId}`,
    `playlist-of-the-week:${appId}`,
    `popular-stories:${appId}`,
  ];
  for (const key of keys) {
    await c.env.CACHE.delete(key);
  }
  return c.json({ success: true, purged: keys });
});
