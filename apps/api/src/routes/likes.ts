import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";

export const likesRoutes = new Hono<{ Bindings: Env }>();

likesRoutes.use("*", requireAuth);

likesRoutes.get("/", async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    "SELECT story_id FROM user_likes WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.userId)
    .all();

  return c.json({
    likes: result.results.map((r: any) => r.story_id),
  });
});

likesRoutes.post("/:storyId", async (c) => {
  const user = c.get("user");
  const storyId = c.req.param("storyId");

  const storyOk = await c.env.DB.prepare(
    "SELECT 1 FROM stories WHERE id = ? AND app_id = ?"
  )
    .bind(storyId, user.appId)
    .first();
  if (!storyOk) {
    return c.json({ error: "Story not found" }, 404);
  }

  const existing = await c.env.DB.prepare(
    "SELECT 1 FROM user_likes WHERE user_id = ? AND story_id = ?"
  )
    .bind(user.userId, storyId)
    .first();

  if (existing) {
    await c.env.DB.prepare(
      "DELETE FROM user_likes WHERE user_id = ? AND story_id = ?"
    )
      .bind(user.userId, storyId)
      .run();
    return c.json({ liked: false });
  }

  await c.env.DB.prepare(
    "INSERT INTO user_likes (user_id, story_id, created_at) VALUES (?, ?, datetime('now'))"
  )
    .bind(user.userId, storyId)
    .run();
  return c.json({ liked: true });
});
