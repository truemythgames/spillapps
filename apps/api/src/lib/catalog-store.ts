/**
 * Persistent catalog store.
 *
 * Public catalog data (stories, playlists, characters, seasons, speakers,
 * prayers, settings, SOTD) is materialized into KV by the catalog builder —
 * on admin writes and on the nightly cron. Public routes read ONLY from here;
 * D1 is used lazily just to bootstrap a missing key. A D1 outage or quota
 * exhaustion therefore cannot take the catalog offline.
 *
 * Reads go edge-cache-first (per colo, EDGE_TTL) then KV (global). Writes are
 * persistent (no TTL) unless a TTL is passed (used for dated keys like SOTD).
 */

const EDGE_TTL = 600;

/** Workers runtime cache; `default` is missing from lib.dom's CacheStorage type. */
const edgeCache = (): Cache => (caches as any).default as Cache;
export { edgeCache };

export function catKey(
  name: string,
  appId: string,
  locale?: string,
  extra?: string,
): string {
  return ["cat3", name, appId, locale, extra].filter(Boolean).join(":");
}

function edgeRequest(key: string): Request {
  return new Request(`https://catalog.cache/${encodeURIComponent(key)}`);
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${EDGE_TTL}`,
    },
  });
}

export async function readCatalog<T>(
  kv: KVNamespace,
  key: string,
): Promise<T | null> {
  try {
    const hit = await edgeCache().match(edgeRequest(key));
    if (hit) return (await hit.json()) as T;
  } catch {
    // edge cache is best-effort
  }
  try {
    const raw = await kv.get(key, "json");
    if (raw == null) return null;
    try {
      await edgeCache().put(edgeRequest(key), jsonResponse(raw));
    } catch {}
    return raw as T;
  } catch {
    return null;
  }
}

/**
 * Read a catalog payload; if the key was never materialized, bootstrap it
 * from D1 via `build` and persist. If D1 is down too, fall back to the
 * given alternate keys (e.g. the "en" payload for an "es" request).
 */
export async function loadCatalog<T>(
  kv: KVNamespace,
  key: string,
  build: () => Promise<T>,
  opts: {
    waitUntil?: (p: Promise<unknown>) => void;
    fallbackKeys?: string[];
    ttlSeconds?: number;
  } = {},
): Promise<T | null> {
  const cached = await readCatalog<T>(kv, key);
  if (cached) return cached;

  try {
    const data = await build();
    const write = writeCatalog(kv, key, data, opts.ttlSeconds);
    if (opts.waitUntil) opts.waitUntil(write);
    else await write;
    return data;
  } catch (err) {
    console.error(`catalog bootstrap failed for ${key}:`, err);
    for (const alt of opts.fallbackKeys ?? []) {
      const fallback = await readCatalog<T>(kv, alt);
      if (fallback) return fallback;
    }
    return null;
  }
}

/** Persistent by default; pass ttlSeconds only for dated keys (e.g. SOTD). */
export async function writeCatalog(
  kv: KVNamespace,
  key: string,
  data: unknown,
  ttlSeconds?: number,
): Promise<void> {
  try {
    await kv.put(
      key,
      JSON.stringify(data),
      ttlSeconds ? { expirationTtl: Math.max(60, ttlSeconds) } : undefined,
    );
  } catch {
    // Never let a KV write failure break a request or a rebuild.
  }
  try {
    await edgeCache().put(edgeRequest(key), jsonResponse(data));
  } catch {}
}
