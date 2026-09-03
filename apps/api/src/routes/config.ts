import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";
import { catKey, loadCatalog } from "../lib/catalog-store";
import { buildSettings } from "../lib/catalog-builder";

export const configRoute = new Hono<{ Bindings: Env }>();

configRoute.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const apiBase = c.env.PUBLIC_API_BASE.replace(/\/$/, "");
  const mediaBase = c.env.PUBLIC_MEDIA_BASE.replace(/\/$/, "");

  const payload = await loadCatalog<{ settings: Record<string, string> }>(
    c.env.CACHE,
    catKey("settings", appId),
    () => buildSettings(c.env, appId),
    { waitUntil: (p) => c.executionCtx?.waitUntil?.(p) },
  );
  // If both KV and D1 are unavailable, defaults keep clients working.
  const settings = payload?.settings ?? {};

  return c.json({
    api_base: apiBase,
    media_base: mediaBase,
    app_id: appId,
    min_app_version: settings.min_app_version || "1.0.0",
    min_ios_version: settings.min_ios_version || settings.min_app_version || "1.0.0",
    min_android_version: settings.min_android_version || settings.min_app_version || "1.0.0",
    force_update: settings.force_update === "true",
    force_update_ios: settings.force_update_ios === "true",
    force_update_android: settings.force_update_android === "true",
    maintenance: settings.maintenance === "true",
    feature_flags: {
      chat_enabled: settings.chat_enabled === "true",
      offline_downloads: settings.offline_downloads === "true",
      read_along: settings.read_along === "true",
    },
  });
});
