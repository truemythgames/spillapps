import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale } from "../lib/locale";
import { catKey, loadCatalog, readCatalog } from "../lib/catalog-store";
import { buildSotd, buildPlaylists } from "../lib/catalog-builder";

export const featuredRoutes = new Hono<{ Bindings: Env }>();

featuredRoutes.get("/story-of-the-day", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const today = new Date().toISOString().split("T")[0];

  const data = await loadCatalog<Record<string, unknown>>(
    c.env.CACHE,
    catKey("sotd", appId, locale, today),
    () => buildSotd(c.env, appId, locale, today),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      ttlSeconds: 36 * 3600,
      fallbackKeys: locale === "en" ? [] : [catKey("sotd", appId, "en", today)],
    },
  );
  if (data) return c.json(data);

  // Last resort (KV empty AND D1 down): deterministic pick from the stories catalog.
  for (const loc of [locale, "en"]) {
    const stories = await readCatalog<{ stories: any[] }>(
      c.env.CACHE,
      catKey("stories", appId, loc),
    );
    if (stories?.stories?.length) {
      const idx = Math.floor(Date.now() / 86400000) % stories.stories.length;
      return c.json({ story: stories.stories[idx] });
    }
  }
  return c.json({ story: null });
});

featuredRoutes.get("/playlist-of-the-week", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);

  const catalog = await loadCatalog<{ playlists: any[] }>(
    c.env.CACHE,
    catKey("playlists", appId, locale),
    () => buildPlaylists(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("playlists", appId, "en")],
    },
  );

  const featured = catalog?.playlists?.find((p) => Number(p.is_featured) === 1) ?? null;
  if (!featured) return c.json({ playlist: null });

  const { stories: _stories, ...playlist } = featured;
  return c.json({ playlist });
});
