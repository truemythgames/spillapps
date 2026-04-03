import { join } from "node:path";

/**
 * Per-app authoring assets live next to each product app: `apps/<app_id>/content/`
 * (catalogs, `stories/`, optional `characters/`).
 * Override with env `CONTENT_APP_ID` (must match API `app_id`, e.g. bible-tea).
 */
export const DEFAULT_CONTENT_APP_ID = "bible-tea";

export function getContentAppId(): string {
  const raw = process.env.CONTENT_APP_ID?.trim();
  return raw || DEFAULT_CONTENT_APP_ID;
}

/** Absolute path to `apps/<app_id>/content/` given monorepo root. */
export function contentAppDir(repoRoot: string, appId = getContentAppId()): string {
  return join(repoRoot, "apps", appId, "content");
}
