import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale } from "../lib/locale";
import { catKey, loadCatalog } from "../lib/catalog-store";
import { buildSeasons, buildStories } from "../lib/catalog-builder";

export const seasonsRoutes = new Hono<{ Bindings: Env }>();

async function loadSeasons(c: any, appId: string, locale: string) {
  return loadCatalog<{ seasons: any[] }>(
    c.env.CACHE,
    catKey("seasons", appId, locale),
    () => buildSeasons(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("seasons", appId, "en")],
    },
  );
}

seasonsRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const testament = c.req.query("testament");

  const catalog = await loadSeasons(c, appId, locale);
  if (!catalog) return c.json({ seasons: [] });

  const seasons = testament
    ? catalog.seasons.filter((s) => s.testament === testament)
    : catalog.seasons;
  return c.json({ seasons });
});

seasonsRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  const catalog = await loadSeasons(c, appId, locale);
  const season = catalog?.seasons?.find((s) => s.id === id);
  if (!season) return c.json({ error: "Season not found" }, 404);

  const storiesCatalog = await loadCatalog<{ stories: any[] }>(
    c.env.CACHE,
    catKey("stories", appId, locale),
    () => buildStories(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("stories", appId, "en")],
    },
  );
  const stories = (storiesCatalog?.stories ?? []).filter((s) => s.season_id === id);

  return c.json({ season, stories });
});
