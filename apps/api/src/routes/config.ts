import { Hono } from "hono";
import type { Env } from "../types";

export const configRoute = new Hono<{ Bindings: Env }>();

configRoute.get("/", (c) => {
  const apiBase = c.env.PUBLIC_API_BASE.replace(/\/$/, "");
  const mediaBase = c.env.PUBLIC_MEDIA_BASE.replace(/\/$/, "");
  return c.json({
    api_base: apiBase,
    media_base: mediaBase,
    app_id: c.env.APP_ID,
    min_app_version: "1.0.0",
    force_update: false,
    maintenance: false,
    feature_flags: {
      chat_enabled: false,
      offline_downloads: false,
      read_along: false,
    },
  });
});
