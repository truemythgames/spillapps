import type { Context } from "hono";
import type { Env } from "../types";

const SUPPORTED_LOCALES = ["en", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Extract locale from `Accept-Language` header (e.g. "es-MX,es;q=0.9,en;q=0.8").
 * Returns the best supported locale, defaulting to "en".
 */
export function resolveLocale(c: Context<{ Bindings: Env }>): SupportedLocale {
  const header = c.req.header("Accept-Language")?.trim();
  if (!header) return "en";

  const tags = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.trim().split("-")[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of tags) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
      return lang as SupportedLocale;
    }
  }

  return "en";
}

/**
 * Overlay translations on a list of DB rows.
 * If locale is "en" (or not provided), returns items unchanged — zero DB cost.
 */
export async function overlayTranslations<T extends Record<string, any>>(
  db: D1Database,
  items: T[],
  opts: {
    entityType: string;
    appId: string;
    locale: string;
    idField?: string;
    fields?: string[];
  },
): Promise<T[]> {
  const { entityType, appId, locale, idField = "id", fields = ["title", "description", "name"] } = opts;
  if (locale === "en" || !locale || items.length === 0) return items;

  const ids = items.map((i) => i[idField]).filter(Boolean);
  if (ids.length === 0) return items;

  const idPlaceholders = ids.map(() => "?").join(",");
  const fieldPlaceholders = fields.map(() => "?").join(",");

  const { results } = await db
    .prepare(
      `SELECT entity_id, field, value FROM content_translations
       WHERE app_id = ? AND entity_type = ? AND locale = ?
       AND entity_id IN (${idPlaceholders})
       AND field IN (${fieldPlaceholders})`,
    )
    .bind(appId, entityType, locale, ...ids, ...fields)
    .all();

  if (!results || results.length === 0) return items;

  const lookup = new Map<string, Map<string, string>>();
  for (const row of results as any[]) {
    let m = lookup.get(row.entity_id);
    if (!m) {
      m = new Map();
      lookup.set(row.entity_id, m);
    }
    m.set(row.field, row.value);
  }

  return items.map((item) => {
    const trans = lookup.get(item[idField]);
    if (!trans) return item;
    const copy = { ...item };
    for (const [field, value] of trans) {
      (copy as any)[field] = value;
    }
    return copy;
  });
}

/**
 * Overlay translations on a single DB row.
 */
export async function overlayTranslation<T extends Record<string, any>>(
  db: D1Database,
  item: T | null,
  opts: {
    entityType: string;
    appId: string;
    locale: string;
    idField?: string;
    fields?: string[];
  },
): Promise<T | null> {
  if (!item) return null;
  const [result] = await overlayTranslations(db, [item], opts);
  return result;
}
