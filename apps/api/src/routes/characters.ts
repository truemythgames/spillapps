import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale } from "../lib/locale";
import { catKey, loadCatalog } from "../lib/catalog-store";
import { buildCharacters } from "../lib/catalog-builder";

export const charactersRoutes = new Hono<{ Bindings: Env }>();

async function loadCharacters(c: any, appId: string, locale: string) {
  return loadCatalog<{ characters: any[] }>(
    c.env.CACHE,
    catKey("characters", appId, locale),
    () => buildCharacters(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("characters", appId, "en")],
    },
  );
}

charactersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const catalog = await loadCharacters(c, appId, locale);
  return c.json(catalog ?? { characters: [] });
});

charactersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  const catalog = await loadCharacters(c, appId, locale);
  const ch = catalog?.characters?.find((x) => x.id === id);
  if (!ch) return c.json({ error: "Character not found" }, 404);

  const { stories, ...character } = ch;
  return c.json({ character, stories: stories ?? [] });
});
