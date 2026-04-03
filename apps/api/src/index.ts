import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";
import { resolveCorsOrigin } from "./lib/cors";
import { storiesRoutes } from "./routes/stories";
import { seasonsRoutes } from "./routes/seasons";
import { playlistsRoutes } from "./routes/playlists";
import { speakersRoutes } from "./routes/speakers";
import { progressRoutes } from "./routes/progress";
import { likesRoutes } from "./routes/likes";
import { authRoutes } from "./routes/auth";
import { featuredRoutes } from "./routes/featured";
import { mediaRoutes } from "./routes/media";
import { adminRoutes } from "./routes/admin";
import { configRoute } from "./routes/config";
import { chatRoutes } from "./routes/chat";
import { charactersRoutes } from "./routes/characters";
import { parseAllowedAppIds } from "./middleware/auth";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const o = resolveCorsOrigin(origin, c.env);
      if (o === undefined) return null;
      return o;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-App-Id"],
  })
);

app.route("/v1/config", configRoute);
app.route("/v1/seasons", seasonsRoutes);
app.route("/v1/stories", storiesRoutes);
app.route("/v1/playlists", playlistsRoutes);
app.route("/v1/speakers", speakersRoutes);
app.route("/v1/auth", authRoutes);
app.route("/v1/me/progress", progressRoutes);
app.route("/v1/me/likes", likesRoutes);
app.route("/v1/featured", featuredRoutes);
app.route("/v1/media", mediaRoutes);
app.route("/v1/chat", chatRoutes);
app.route("/v1/characters", charactersRoutes);
app.route("/admin", adminRoutes);

app.get("/", (c) =>
  c.json({
    name: "spillapps-api",
    app_id: c.env.APP_ID,
    status: "ok",
  })
);

app.notFound((c) =>
  c.json({ error: "Not Found", message: "Route not found" }, 404)
);

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env) {
    await refreshDailyFeatures(env);
  },
};

async function refreshDailyFeatures(env: Env) {
  const today = new Date().toISOString().split("T")[0];

  for (const appId of parseAllowedAppIds(env)) {
    const feature = await env.DB.prepare(
      "SELECT * FROM daily_features WHERE feature_date = ? AND app_id = ?"
    )
      .bind(today, appId)
      .first();

    if (feature) {
      await env.CACHE.put(`story-of-the-day:${appId}`, JSON.stringify(feature), {
        expirationTtl: 86400,
      });
    }

    const playlist = await env.DB.prepare(
      "SELECT * FROM playlists WHERE is_featured = 1 AND app_id = ? LIMIT 1"
    )
      .bind(appId)
      .first();

    if (playlist) {
      await env.CACHE.put(
        `playlist-of-the-week:${appId}`,
        JSON.stringify(playlist),
        {
          expirationTtl: 604800,
        }
      );
    }
  }
}
