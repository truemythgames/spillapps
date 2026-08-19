import { Hono } from "hono";
import type { Env } from "../types";
import {
  verifyGoogleToken,
  verifyAppleToken,
  createSessionToken,
  resolveAppIdForSignIn,
  assertAppIdAllowed,
  scopedUserId,
} from "../middleware/auth";

export const authRoutes = new Hono<{ Bindings: Env }>();

/**
 * Device session: the app has no login, but progress, streaks and the
 * RevenueCat customer all need one durable id. The client keeps a UUID in
 * secure storage and exchanges it here; the derived user id is deterministic
 * so a lost token re-resolves to the same user instead of orphaning data.
 */
authRoutes.post("/device", async (c) => {
  const body = await c.req.json<{ install_id: string; app_id?: string }>();

  const appId = resolveAppIdForSignIn(body.app_id, c.env);
  if (!assertAppIdAllowed(appId, c.env)) {
    return c.json({ error: "Invalid app" }, 400);
  }

  if (!c.env.JWT_SECRET?.trim()) {
    return c.json(
      { error: "Server misconfiguration: JWT_SECRET is not set" },
      503
    );
  }

  // The install id is the only credential here, so reject anything that
  // isn't a client-generated UUID.
  const installId = String(body.install_id ?? "").trim().toLowerCase();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      installId
    )
  ) {
    return c.json({ error: "Invalid install_id" }, 400);
  }

  const internalId = scopedUserId(appId, `dev_${installId}`);

  await c.env.DB.prepare(
    `INSERT INTO users (id, app_id, rc_id, created_at, last_seen_at)
     VALUES (?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT (id) DO UPDATE SET last_seen_at = datetime('now'), rc_id = excluded.rc_id`
  )
    .bind(internalId, appId, internalId)
    .run();

  const sessionToken = await createSessionToken(
    internalId,
    "",
    appId,
    c.env.JWT_SECRET
  );

  return c.json({
    session_token: sessionToken,
    user: { id: internalId },
  });
});

authRoutes.post("/signin", async (c) => {
  const body = await c.req.json<{
    token: string;
    provider: "google" | "apple";
    app_id?: string;
  }>();

  const appId = resolveAppIdForSignIn(body.app_id, c.env);
  if (!assertAppIdAllowed(appId, c.env)) {
    return c.json({ error: "Invalid app" }, 400);
  }

  if (!c.env.JWT_SECRET?.trim()) {
    return c.json(
      { error: "Server misconfiguration: JWT_SECRET is not set" },
      503
    );
  }

  if (
    body.provider === "google" &&
    !String(c.env.GOOGLE_CLIENT_ID ?? "").trim()
  ) {
    return c.json(
      { error: "Server misconfiguration: GOOGLE_CLIENT_ID is not set" },
      503
    );
  }

  let oauthSub: string;
  let email = "";
  let name: string | undefined;
  let picture: string | undefined;

  if (body.provider === "google") {
    const payload = await verifyGoogleToken(body.token, c.env.GOOGLE_CLIENT_ID!);
    if (!payload) return c.json({ error: "Invalid Google token" }, 401);
    oauthSub = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } else if (body.provider === "apple") {
    const payload = await verifyAppleToken(body.token, c.env.APPLE_BUNDLE_ID);
    if (!payload) return c.json({ error: "Invalid Apple token" }, 401);
    oauthSub = payload.sub;
    email = payload.email ?? "";
  } else {
    return c.json({ error: "Invalid provider" }, 400);
  }

  const internalId = scopedUserId(appId, oauthSub);

  await c.env.DB.prepare(
    `INSERT INTO users (id, app_id, created_at, last_seen_at)
     VALUES (?, ?, datetime('now'), datetime('now'))
     ON CONFLICT (id) DO UPDATE SET last_seen_at = datetime('now')`
  )
    .bind(internalId, appId)
    .run();

  const sessionToken = await createSessionToken(
    internalId,
    email,
    appId,
    c.env.JWT_SECRET
  );

  return c.json({
    session_token: sessionToken,
    user: { id: internalId, email, name, picture },
  });
});
