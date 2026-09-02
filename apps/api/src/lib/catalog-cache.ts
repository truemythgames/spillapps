const CATALOG_TTL = 300;

function cacheRequest(key: string): Request {
  return new Request(`https://catalog.cache/${encodeURIComponent(key)}`);
}

/** Edge cache — not KV. Free KV only allows 1,000 writes/day. */
export async function readCatalogCache<T>(
  _kv: KVNamespace,
  key: string,
): Promise<T | null> {
  try {
    const hit = await caches.default.match(cacheRequest(key));
    if (!hit) return null;
    return (await hit.json()) as T;
  } catch {
    return null;
  }
}

export async function writeCatalogCache(
  _kv: KVNamespace,
  key: string,
  data: unknown,
  ttl = CATALOG_TTL,
): Promise<void> {
  try {
    await caches.default.put(
      cacheRequest(key),
      new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${Math.max(60, ttl)}`,
        },
      }),
    );
  } catch {
    // Cache is optional. Never fail the request.
  }
}
