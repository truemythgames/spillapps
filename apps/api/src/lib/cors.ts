import type { Env } from "../types";

/**
 * Resolves Access-Control-Allow-Origin for browser requests.
 * `CORS_ALLOWED_ORIGINS`: comma-separated origins, or `*` (avoid in production if possible).
 */
export function resolveCorsOrigin(
  requestOrigin: string | undefined,
  env: Env
): string | undefined {
  const raw = env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw || raw === "*") return "*";
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes("*")) return "*";
  if (!requestOrigin) return allowed[0];
  return allowed.includes(requestOrigin) ? requestOrigin : undefined;
}
