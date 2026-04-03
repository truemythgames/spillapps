import { createMiddleware } from "hono/factory";
import { jwtVerify, SignJWT, createRemoteJWKSet } from "jose";
import type { Env } from "../types";

export interface AuthUser {
  userId: string;
  email: string;
  appId: string;
  isAdmin: boolean;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

// ---------------------------------------------------------------------------
// Provider token verification (used by /v1/auth/signin)
// ---------------------------------------------------------------------------

interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  aud: string;
}

const appleJWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

export async function verifyGoogleToken(
  token: string,
  clientId: string
): Promise<GoogleTokenPayload | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    if (!res.ok) return null;

    const payload = (await res.json()) as GoogleTokenPayload;
    if (payload.aud !== clientId) return null;
    if (!payload.email_verified) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyAppleToken(
  token: string,
  bundleId: string
): Promise<{ sub: string; email?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, appleJWKS, {
      issuer: "https://appleid.apple.com",
      audience: bundleId,
    });
    if (!payload.sub) return null;
    return { sub: payload.sub as string, email: payload.email as string | undefined };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// App id + scoped user ids (one API, many products; no shared accounts)
// ---------------------------------------------------------------------------

export function parseAllowedAppIds(env: Env): string[] {
  const raw = env.ALLOWED_APP_IDS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [env.APP_ID];
}

export function resolveAppIdForSignIn(bodyAppId: string | undefined, env: Env): string {
  return (bodyAppId?.trim() || env.APP_ID).trim();
}

export function assertAppIdAllowed(appId: string, env: Env): boolean {
  return parseAllowedAppIds(env).includes(appId);
}

/** Canonical user id: `${appId}:${oauth_sub}` */
export function scopedUserId(appId: string, oauthSub: string): string {
  return `${appId}:${oauthSub}`;
}

/**
 * Normalize session subject: older JWTs may carry raw OAuth `sub`; DB uses scoped user ids.
 */
export function normalizeScopedUserId(userId: string, appId: string): string {
  const prefix = `${appId}:`;
  if (userId.startsWith(prefix)) return userId;
  return `${prefix}${userId}`;
}

// ---------------------------------------------------------------------------
// Session JWT helpers
// ---------------------------------------------------------------------------

export async function createSessionToken(
  userId: string,
  email: string,
  appId: string,
  secret: string
): Promise<string> {
  const scoped = normalizeScopedUserId(userId, appId);
  return new SignJWT({ userId: scoped, email, appId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(new TextEncoder().encode(secret));
}

export async function verifySessionPayload(
  token: string,
  secret: string
): Promise<{ userId: string; email: string; appId: string }> {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret)
  );
  const p = payload as Record<string, unknown>;
  const appId =
    typeof p.appId === "string" && p.appId.length > 0 ? p.appId : "bible-tea";
  const rawUserId = typeof p.userId === "string" ? p.userId : "";
  const email = typeof p.email === "string" ? p.email : "";
  const userId = normalizeScopedUserId(rawUserId, appId);
  return { userId, email, appId };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export const requireAuth = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    if (!c.env.JWT_SECRET?.trim()) {
      return c.json(
        { error: "Server misconfiguration: JWT_SECRET is not set" },
        503
      );
    }

    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Missing authentication" }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const { userId, email, appId } = await verifySessionPayload(
        token,
        c.env.JWT_SECRET
      );
      if (!parseAllowedAppIds(c.env).includes(appId)) {
        return c.json({ error: "Invalid token" }, 401);
      }
      c.set("user", {
        userId,
        email,
        appId,
        isAdmin: email === c.env.ADMIN_EMAIL,
      });
      await next();
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
  }
);

export const requireAdmin = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const user = c.get("user");
    if (!user?.isAdmin) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  }
);
