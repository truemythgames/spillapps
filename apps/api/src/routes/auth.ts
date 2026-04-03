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
