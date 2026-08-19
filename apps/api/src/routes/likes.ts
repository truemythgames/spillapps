import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";
import { resolveLikeTarget } from "../lib/story";

export const likesRoutes = new Hono<{ Bindings: Env }>();

likesRoutes.use("*", requireAuth);

likesRoutes.get("/", async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    `SELECT COALESCE('prayer-' || p.slug, s.slug, ul.story_id) as story_id
     FROM user_likes ul
     LEFT JOIN stories s ON s.id = ul.story_id
     LEFT JOIN prayers p ON p.id = ul.story_id
     WHERE ul.user_id = ?
     ORDER BY ul.created_at DESC`
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

  const target = await resolveLikeTarget(c.env.DB, user.appId, decodeURIComponent(storyId));
  if (!target) {
    return c.json({ error: "Not found" }, 404);
  }

  const existing = await c.env.DB.prepare(
    "SELECT 1 FROM user_likes WHERE user_id = ? AND story_id = ?"
  )
    .bind(user.userId, target.id)
    .first();

  if (existing) {
    await c.env.DB.prepare(
      "DELETE FROM user_likes WHERE user_id = ? AND story_id = ?"
    )
      .bind(user.userId, target.id)
      .run();
    return c.json({ liked: false });
  }

  await c.env.DB.prepare(
    "INSERT INTO user_likes (user_id, story_id, created_at) VALUES (?, ?, datetime('now'))"
  )
    .bind(user.userId, target.id)
    .run();
  return c.json({ liked: true });
});
