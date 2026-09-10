import { Hono } from "hono";
import type { Env } from "../types";
import { r2GetWithKeyFallbacks } from "../lib/storage-keys";
import { resolvePublicAppId } from "../lib/request-app";
import { catKey, readCatalog } from "../lib/catalog-store";

export const mediaRoutes = new Hono<{ Bindings: Env }>();

mediaRoutes.get("/audio/:storyId/:speakerId", async (c) => {
  const appId = resolvePublicAppId(c);
  const { storyId, speakerId } = c.req.param();

  const storiesPayload = await readCatalog<{ stories: any[] }>(
    c.env.CACHE,
    catKey("stories", appId, "en"),
  );
  const story = storiesPayload?.stories?.find(
    (s) => s.id === storyId || s.slug === storyId,
  );
  if (!story) {
    return c.json({ error: "Audio not found" }, 404);
  }

  const speakersPayload = await readCatalog<{ speakers: any[] }>(
    c.env.CACHE,
    catKey("speakers", appId),
  );
  const speaker = (speakersPayload?.speakers ?? []).find(
    (sp: any) =>
      sp.id === speakerId ||
      String(sp.name ?? "").toLowerCase() === speakerId.toLowerCase(),
  );
  const speakerKey = String(speaker?.name ?? speakerId)
    .toLowerCase()
    .replace(/\s+/g, "-");
  const audioKey = `${appId}/stories/${story.slug}/narration-${speakerKey}.mp3`;

  const object = await r2GetWithKeyFallbacks(c.env.MEDIA, audioKey, appId);
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
