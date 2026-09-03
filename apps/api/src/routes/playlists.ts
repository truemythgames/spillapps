import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveLocale } from "../lib/locale";
import { catKey, loadCatalog } from "../lib/catalog-store";
import { buildPlaylists } from "../lib/catalog-builder";

export const playlistsRoutes = new Hono<{ Bindings: Env }>();

async function loadPlaylists(c: any, appId: string, locale: string) {
  return loadCatalog<{ playlists: any[] }>(
    c.env.CACHE,
    catKey("playlists", appId, locale),
    () => buildPlaylists(c.env, appId, locale),
    {
      waitUntil: (p) => c.executionCtx?.waitUntil?.(p),
      fallbackKeys: locale === "en" ? [] : [catKey("playlists", appId, "en")],
    },
  );
}

/** Full list with stories embedded — one call covers app open. */
playlistsRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const catalog = await loadPlaylists(c, appId, locale);
  return c.json(catalog ?? { playlists: [] });
});

playlistsRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const locale = resolveLocale(c);
  const id = c.req.param("id");

  const catalog = await loadPlaylists(c, appId, locale);
  const pl = catalog?.playlists?.find((p) => p.id === id);
  if (!pl) {
    // Old degraded builds requested a synthetic id; serve all stories rather than 404.
    if (id === "fallback-all-stories" && catalog?.playlists?.length) {
      const stories = catalog.playlists.flatMap((p) => p.stories ?? []);
      const dedup = [...new Map(stories.map((s: any) => [s.id, s])).values()];
      return c.json({
        playlist: { id, name: "Stories", cover_image_url: dedup[0]?.cover_image_url ?? null },
        stories: dedup,
      });
    }
    return c.json({ error: "Playlist not found" }, 404);
  }

  const { stories, ...playlist } = pl;
  return c.json({ playlist, stories: stories ?? [] });
});
