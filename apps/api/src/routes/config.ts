import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";

export const configRoute = new Hono<{ Bindings: Env }>();

configRoute.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const apiBase = c.env.PUBLIC_API_BASE.replace(/\/$/, "");
  const mediaBase = c.env.PUBLIC_MEDIA_BASE.replace(/\/$/, "");

  const { results } = await c.env.DB.prepare(
    "SELECT key, value FROM app_settings WHERE app_id = ?"
  ).bind(appId).all();

  const settings: Record<string, string> = {};
  for (const row of results as any[]) {
    settings[row.key] = row.value;
  }

  return c.json({
    api_base: apiBase,
    media_base: mediaBase,
    app_id: appId,
    min_app_version: settings.min_app_version || "1.0.0",
    force_update: settings.force_update === "true",
    maintenance: settings.maintenance === "true",
    feature_flags: {
      chat_enabled: settings.chat_enabled === "true",
      offline_downloads: settings.offline_downloads === "true",
      read_along: settings.read_along === "true",
    },
  });
});
