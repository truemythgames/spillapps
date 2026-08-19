import type { Env } from "../types";

/** Accept either the canonical story id (`st-noah`) or the public slug. */
export async function resolveStoryId(
  db: Env["DB"],
  appId: string,
  idOrSlug: string
): Promise<string | null> {
  const byId = await db
    .prepare("SELECT id FROM stories WHERE id = ? AND app_id = ?")
    .bind(idOrSlug, appId)
    .first<{ id: string }>();
  if (byId?.id) return byId.id;

  const bySlug = await db
    .prepare("SELECT id FROM stories WHERE slug = ? AND app_id = ?")
    .bind(idOrSlug, appId)
    .first<{ id: string }>();
  return bySlug?.id ?? null;
}

/** Story id/slug, or a prayer id/slug, or a player id (`prayer-<slug>`). */
export async function resolveLikeTarget(
  db: Env["DB"],
  appId: string,
  idOrSlug: string
): Promise<{ id: string; kind: "story" | "prayer"; slug: string } | null> {
  const storyId = await resolveStoryId(db, appId, idOrSlug);
  if (storyId) {
    const row = await db
      .prepare("SELECT id, slug FROM stories WHERE id = ? AND app_id = ?")
      .bind(storyId, appId)
      .first<{ id: string; slug: string }>();
    if (row) return { id: row.id, kind: "story", slug: row.slug ?? row.id };
  }

  const raw = idOrSlug.startsWith("prayer-") ? idOrSlug.slice(7) : idOrSlug;
  const prayer = await db
    .prepare("SELECT id, slug FROM prayers WHERE (id = ? OR slug = ?) AND app_id = ?")
    .bind(raw, raw, appId)
    .first<{ id: string; slug: string }>();
  if (!prayer) return null;
  return { id: prayer.id, kind: "prayer", slug: prayer.slug ?? prayer.id };
}
