import type { Env } from "../types";
import { normalizeStorageKeyForApp } from "./storage-keys";

export function publicMediaBase(env: Env): string {
  const base = env.PUBLIC_MEDIA_BASE?.trim() || "https://media.spillapps.com";
  return base.replace(/\/$/, "");
}

/**
 * Public URL for an R2 object key (per-app prefix applied), or null if no key.
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

/**
 * Thumbnail URL for cover images (400x400). Falls back to full-size if key
 * doesn't look like a cover path.
 */
export function thumbUrl(
  env: Env,
  key: string | null | undefined,
  appId?: string,
): string | null {
  if (!key?.trim()) return null;
  const k = key.trim();
  const thumbKey = k.replace(/\/cover\.webp$/, "/cover-thumb.webp");
  if (thumbKey === k) return mediaUrl(env, key, appId);
  const canonical = normalizeStorageKeyForApp(thumbKey, appId || env.APP_ID);
  return `${publicMediaBase(env)}/${canonical}`;
}
