/**
 * Per-app R2 keys: `{app_id}/relative/path` (e.g. bible-tea/covers/foo.webp).
 * Prevents collisions when multiple Tea apps share one bucket.
 */

const TEA_APP_PREFIX = /^[a-z0-9]+-tea\//;

/** Canonical object key for this app (idempotent). */
export function normalizeStorageKeyForApp(key: string, appId: string): string {
  const k = key.trim().replace(/^\/+/, "");
  if (!k) return `${appId}/`;
  if (k.startsWith(`${appId}/`)) return k;
  if (TEA_APP_PREFIX.test(k)) return k;
  return `${appId}/${k}`;
}

/** Normalize nullable DB key fields before INSERT/UPDATE. */
export function normalizeKeyForDb(
  value: string | null | undefined,
  appId: string
): string | null {
  if (value == null || String(value).trim() === "") return null;
  return normalizeStorageKeyForApp(String(value), appId);
}

/**
 * Fetch from R2: try canonical key, then raw DB value, then path with app prefix stripped
 * (migration / unprefixed uploads).
 */
export async function r2GetWithKeyFallbacks(
  bucket: R2Bucket,
  dbKey: string | null | undefined,
  appId: string
): Promise<R2ObjectBody | null> {
  if (!dbKey?.trim()) return null;
  const raw = dbKey.trim();
  const canonical = normalizeStorageKeyForApp(raw, appId);
  const candidates: string[] = [canonical];
  if (raw !== canonical) candidates.push(raw);
  if (raw.startsWith(`${appId}/`)) {
    const stripped = raw.slice(appId.length + 1);
    if (stripped) candidates.push(stripped);
  }
  const seen = new Set<string>();
  for (const k of candidates) {
    if (seen.has(k)) continue;
    seen.add(k);
    const o = await bucket.get(k);
    if (o) return o;
  }
  return null;
}
