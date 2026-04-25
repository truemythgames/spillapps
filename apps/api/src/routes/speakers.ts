import { Hono } from "hono";
import type { Env } from "../types";
import { mediaUrl } from "../lib/media";
import { resolvePublicAppId } from "../lib/request-app";

export const speakersRoutes = new Hono<{ Bindings: Env }>();

speakersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const result = await c.env.DB.prepare(
    "SELECT * FROM speakers WHERE app_id = ? ORDER BY is_default DESC, name ASC"
  )
    .bind(appId)
    .all();

  return c.json({
    speakers: result.results.map((s: any) => ({
      ...s,
      avatar_url: mediaUrl(c.env, s.avatar_key, appId),
    })),
  });
});

speakersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const id = c.req.param("id");

  const speaker = await c.env.DB.prepare(
    "SELECT * FROM speakers WHERE id = ? AND app_id = ?"
  )
    .bind(id, appId)
    .first();

  if (!speaker) {
    return c.json({ error: "Speaker not found" }, 404);
  }

  return c.json({
    speaker: {
      ...(speaker as any),
      avatar_url: mediaUrl(c.env, (speaker as any).avatar_key, appId),
    },
  });
});
