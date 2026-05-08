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
    nullIfMissing?: string[];
  },
): Promise<T[]> {
  const { entityType, appId, locale, idField = "id", fields = ["title", "description", "name"], nullIfMissing = [] } = opts;
  if (locale === "en" || !locale || items.length === 0) return items;

  const ids = items.map((i) => i[idField]).filter(Boolean);
  if (ids.length === 0) return items;

  const fieldPlaceholders = fields.map(() => "?").join(",");
  // D1 has a 100 bind-param limit; reserve slots for fixed params + fields
  const fixedParams = 3 + fields.length; // appId, entityType, locale + fields
  const batchSize = Math.max(1, 100 - fixedParams);

  const lookup = new Map<string, Map<string, string>>();

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const idPlaceholders = batch.map(() => "?").join(",");

    const { results } = await db
      .prepare(
        `SELECT entity_id, field, value FROM content_translations
         WHERE app_id = ? AND entity_type = ? AND locale = ?
         AND entity_id IN (${idPlaceholders})
         AND field IN (${fieldPlaceholders})`,
      )
      .bind(appId, entityType, locale, ...batch, ...fields)
      .all();

    if (results) {
      for (const row of results as any[]) {
        let m = lookup.get(row.entity_id);
        if (!m) {
          m = new Map();
          lookup.set(row.entity_id, m);
        }
        m.set(row.field, row.value);
      }
    }
  }

  return items.map((item) => {
    const trans = lookup.get(item[idField]);
    const copy = { ...item };
    if (trans) {
      for (const [field, value] of trans) {
        (copy as any)[field] = value;
      }
    }
    for (const field of nullIfMissing) {
      if (!trans?.has(field)) {
        (copy as any)[field] = null;
      }
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
    nullIfMissing?: string[];
  },
): Promise<T | null> {
  if (!item) return null;
  const [result] = await overlayTranslations(db, [item], opts);
  return result;
}

/**
 * Translate `season_name` on story rows by looking up season name translations.
 */
export async function overlaySeasonNames<T extends Record<string, any>>(
  db: D1Database,
  stories: T[],
  appId: string,
  locale: string,
): Promise<T[]> {
  if (locale === "en" || !locale || stories.length === 0) return stories;

  const seasonIds = [...new Set(stories.map((s) => s.season_id).filter(Boolean))];
  if (seasonIds.length === 0) return stories;

  const ph = seasonIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT entity_id, value FROM content_translations
       WHERE app_id = ? AND entity_type = 'season' AND locale = ? AND field = 'name'
       AND entity_id IN (${ph})`,
    )
    .bind(appId, locale, ...seasonIds)
    .all();

  if (!results || results.length === 0) return stories;

  const nameMap = new Map<string, string>();
  for (const r of results as any[]) nameMap.set(r.entity_id, r.value);

  return stories.map((s) => {
    const translated = nameMap.get(s.season_id);
    return translated ? { ...s, season_name: translated } : s;
  });
}
