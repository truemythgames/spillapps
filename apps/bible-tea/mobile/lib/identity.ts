import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | { apiUrl?: string; appId?: string }
  | undefined;

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  extra?.apiUrl ||
  "https://api.spillapps.com";

const APP_ID = extra?.appId || "bible-tea";

const INSTALL_ID_KEY = "install_id";
/** Pre-existing RevenueCat id; reused so upgrades keep their identity. */
const LEGACY_APP_USER_ID_KEY = "rc_app_user_id";
const SESSION_TOKEN_KEY = "session_token";
const USER_ID_KEY = "session_user_id";

let cachedInstallId: string | null = null;
let cachedToken: string | null = null;
let cachedUserId: string | null = null;
let sessionPromise: Promise<Session | null> | null = null;

export interface Session {
  token: string;
  userId: string;
}

async function readSecure(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeSecure(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn(`[Identity] Failed to persist ${key}:`, e);
  }
}

/** Stable per-install UUID. Survives restarts, and reinstalls on iOS. */
export async function getInstallId(): Promise<string> {
  if (cachedInstallId) return cachedInstallId;

  const existing = await readSecure(INSTALL_ID_KEY);
  if (existing) {
    cachedInstallId = existing;
    return existing;
  }

  // Installs from before device sessions may still hold a `bt_<uuid>` id.
  const legacy = await readSecure(LEGACY_APP_USER_ID_KEY);
  const fromLegacy = legacy?.replace(/^bt_/, "").trim();
  const installId =
    fromLegacy && fromLegacy.length >= 36 ? fromLegacy : Crypto.randomUUID();

  await writeSecure(INSTALL_ID_KEY, installId);
  cachedInstallId = installId;
  return installId;
}

const SESSION_TIMEOUT_MS = 8000;

async function requestSession(): Promise<Session | null> {
  const installId = await getInstallId();
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), SESSION_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/v1/auth/device`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Id": APP_ID },
      body: JSON.stringify({ install_id: installId, app_id: APP_ID }),
      signal: abort.signal,
    });

    if (!res.ok) {
      console.warn("[Identity] Device session failed:", res.status);
      return null;
    }

    const data = (await res.json()) as {
      session_token?: string;
      user?: { id?: string };
    };

    if (!data.session_token || !data.user?.id) return null;

    cachedToken = data.session_token;
    cachedUserId = data.user.id;
    await writeSecure(SESSION_TOKEN_KEY, cachedToken);
    await writeSecure(USER_ID_KEY, cachedUserId);

    return { token: cachedToken, userId: cachedUserId };
  } catch (e) {
    console.warn("[Identity] Device session request failed:", e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Cached session, minting one if needed. Concurrent callers share a request. */
export async function getSession(): Promise<Session | null> {
  if (cachedToken && cachedUserId) {
    return { token: cachedToken, userId: cachedUserId };
  }

  const [storedToken, storedUserId] = await Promise.all([
    readSecure(SESSION_TOKEN_KEY),
    readSecure(USER_ID_KEY),
  ]);
  if (storedToken && storedUserId) {
    cachedToken = storedToken;
    cachedUserId = storedUserId;
    return { token: storedToken, userId: storedUserId };
  }

  if (!sessionPromise) {
    sessionPromise = requestSession().finally(() => {
      sessionPromise = null;
    });
  }
  return sessionPromise;
}

/** Called after a 401 so the next request mints a fresh token. */
export async function clearSession(): Promise<void> {
  cachedToken = null;
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch {}
}

/**
 * The app's user id, shared by the API and RevenueCat so a subscription event
 * can be traced back to a row in our own database. Derived locally from the
 * install id — the server derives the same value — so startup never waits on
 * the network to identify the user.
 */
export async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const stored = await readSecure(USER_ID_KEY);
  if (stored) {
    cachedUserId = stored;
    return stored;
  }
  return `${APP_ID}:dev_${await getInstallId()}`;
}
