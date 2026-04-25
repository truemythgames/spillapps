import type { Env } from "../types";
import { normalizeStorageKeyForApp } from "./storage-keys";

export function publicMediaBase(env: Env): string {
  const base = env.PUBLIC_MEDIA_BASE?.trim() || "https://media.spillapps.com";
  return base.replace(/\/$/, "");
}

/**
 * Public URL for an R2 object key (per-app prefix applied), or null if no key.
 *
 * Pass the request-resolved appId so multi-tenant routes generate URLs under
 * the correct prefix (e.g. `history-tea/...`). Falls back to the worker's
 * default `env.APP_ID` for legacy callers.
 */
export function mediaUrl(
  env: Env,
  key: string | null | undefined,
  appId?: string,
): string | null {
  if (!key?.trim()) return null;
  const canonical = normalizeStorageKeyForApp(key.trim(), appId || env.APP_ID);
  return `${publicMediaBase(env)}/${canonical}`;
}
