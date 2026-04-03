import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";
import { mediaUrl } from "../lib/media";

export const progressRoutes = new Hono<{ Bindings: Env }>();

progressRoutes.use("*", requireAuth);

progressRoutes.get("/", async (c) => {
  const user = c.get("user");

  const progress = await c.env.DB.prepare(
    `SELECT up.*, s.title as story_title, s.cover_image_key,
            se.name as season_name, se.testament
     FROM user_progress up
     JOIN stories s ON up.story_id = s.id AND s.app_id = ?
     JOIN seasons se ON s.season_id = se.id AND se.app_id = s.app_id
     WHERE up.user_id = ?
     ORDER BY up.updated_at DESC`
  )
    .bind(user.appId, user.userId)
    .all();

  return c.json({
    progress: progress.results.map((p: any) => ({
      ...p,
      cover_image_url: mediaUrl(c.env, p.cover_image_key),
    })),
  });
});

progressRoutes.put("/:storyId", async (c) => {
  const user = c.get("user");
  const storyId = c.req.param("storyId");
  const body = await c.req.json<{
    speaker_id: string;
    position_seconds: number;
    completed?: boolean;
  }>();

  const ok = await c.env.DB.prepare(
    "SELECT 1 FROM stories WHERE id = ? AND app_id = ?"
  )
    .bind(storyId, user.appId)
    .first();
  if (!ok) {
    return c.json({ error: "Story not found" }, 404);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO user_progress (user_id, story_id, speaker_id, position_seconds, completed, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id, story_id)
     DO UPDATE SET
       speaker_id = excluded.speaker_id,
       position_seconds = excluded.position_seconds,
       completed = CASE WHEN excluded.completed = 1 THEN 1 ELSE user_progress.completed END,
       updated_at = excluded.updated_at`
  )
    .bind(
      user.userId,
      storyId,
      body.speaker_id,
      body.position_seconds,
      body.completed ? 1 : 0,
      now
    )
    .run();

  return c.json({ success: true });
});

progressRoutes.get("/streak", async (c) => {
  const user = c.get("user");

  const streak = await c.env.DB.prepare(
    "SELECT * FROM user_streaks WHERE user_id = ?"
  )
    .bind(user.userId)
    .first();

  if (!streak) {
    return c.json({ current_streak: 0, max_streak: 0, last_listen_date: null });
  }

  return c.json(streak);
});

progressRoutes.post("/streak/checkin", async (c) => {
  const user = c.get("user");
  const today = new Date().toISOString().split("T")[0];

  const existing = await c.env.DB.prepare(
    "SELECT * FROM user_streaks WHERE user_id = ?"
  )
    .bind(user.userId)
    .first<any>();

  if (!existing) {
    await c.env.DB.prepare(
      "INSERT INTO user_streaks (user_id, current_streak, max_streak, last_listen_date) VALUES (?, 1, 1, ?)"
    )
      .bind(user.userId, today)
      .run();
    return c.json({ current_streak: 1, max_streak: 1 });
  }

  if (existing.last_listen_date === today) {
    return c.json(existing);
  }

  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];
  const isConsecutive = existing.last_listen_date === yesterday;

  const newStreak = isConsecutive ? existing.current_streak + 1 : 1;
  const newMax = Math.max(newStreak, existing.max_streak);

  await c.env.DB.prepare(
    "UPDATE user_streaks SET current_streak = ?, max_streak = ?, last_listen_date = ? WHERE user_id = ?"
  )
    .bind(newStreak, newMax, today, user.userId)
    .run();

  return c.json({
    current_streak: newStreak,
    max_streak: newMax,
    last_listen_date: today,
  });
});
