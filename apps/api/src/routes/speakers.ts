import { Hono } from "hono";
import type { Env } from "../types";
import { resolvePublicAppId } from "../lib/request-app";
import { catKey, loadCatalog } from "../lib/catalog-store";
import { buildSpeakers } from "../lib/catalog-builder";

export const speakersRoutes = new Hono<{ Bindings: Env }>();

async function loadSpeakers(c: any, appId: string) {
  return loadCatalog<{ speakers: any[] }>(
    c.env.CACHE,
    catKey("speakers", appId),
    () => buildSpeakers(c.env, appId),
    { waitUntil: (p) => c.executionCtx?.waitUntil?.(p) },
  );
}

speakersRoutes.get("/", async (c) => {
  const appId = resolvePublicAppId(c);
  const catalog = await loadSpeakers(c, appId);
  return c.json(catalog ?? { speakers: [] });
});

speakersRoutes.get("/:id", async (c) => {
  const appId = resolvePublicAppId(c);
  const id = c.req.param("id");

  const catalog = await loadSpeakers(c, appId);
  const speaker = catalog?.speakers?.find((s) => s.id === id);
  if (!speaker) return c.json({ error: "Speaker not found" }, 404);

  return c.json({ speaker });
});
