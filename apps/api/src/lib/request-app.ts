import type { Context } from "hono";
import type { Env } from "../types";
import { parseAllowedAppIds } from "../middleware/auth";

/** Public routes: client sends `X-App-Id` (must be allowlisted) or defaults to Worker `APP_ID`. */
export function resolvePublicAppId(c: Context<{ Bindings: Env }>): string {
  const raw = c.req.header("X-App-Id")?.trim();
  if (raw && parseAllowedAppIds(c.env).includes(raw)) return raw;
  return c.env.APP_ID;
}

/**
 * `/admin` routes after `requireAdmin`: sole operator switches tenant via `X-App-Id`.
 * Falls back to JWT `app_id` when header is missing or not allowlisted.
 */
export function resolveAdminTargetAppId(c: Context<{ Bindings: Env }>): string {
  const user = c.get("user");
  const header = c.req.header("X-App-Id")?.trim();
  if (header && parseAllowedAppIds(c.env).includes(header)) {
    return header;
  }
  return user.appId;
}
