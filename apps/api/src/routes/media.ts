import { Hono } from "hono";
import type { Env } from "../types";
import { r2GetWithKeyFallbacks } from "../lib/storage-keys";
import { resolvePublicAppId } from "../lib/request-app";

export const mediaRoutes = new Hono<{ Bindings: Env }>();

mediaRoutes.get("/audio/:storyId/:speakerId", async (c) => {
  const appId = resolvePublicAppId(c);
  const { storyId, speakerId } = c.req.param();

  const audio = await c.env.DB.prepare(
    `SELECT sa.audio_key FROM story_audio sa
     JOIN stories s ON s.id = sa.story_id AND s.app_id = ?
     JOIN speakers sp ON sp.id = sa.speaker_id AND sp.app_id = s.app_id
     WHERE sa.story_id = ? AND sa.speaker_id = ?`
  )
    .bind(appId, storyId, speakerId)
    .first<any>();

  if (!audio) {
    return c.json({ error: "Audio not found" }, 404);
  }

  const object = await r2GetWithKeyFallbacks(
    c.env.MEDIA,
    audio.audio_key,
    appId
  );
  if (!object) {
    return c.json({ error: "Audio file not found" }, 404);
  }

  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Accept-Ranges", "bytes");

  if (object.size != null) {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { headers });
});

mediaRoutes.get("/image/:key{.+}", async (c) => {
  const appId = resolvePublicAppId(c);
  const key = c.req.param("key");

  const object = await r2GetWithKeyFallbacks(c.env.MEDIA, key, appId);
  if (!object) {
    return c.json({ error: "Image not found" }, 404);
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "image/webp"
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
});
