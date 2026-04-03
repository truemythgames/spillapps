import { createContext, useContext, useState, type ReactNode } from "react";
import { exchangeGoogleSession } from "./api";
import {
  ADMIN_AUTH_STORAGE_KEY,
  clearAdminAuthStorage,
  readAdminAuthRaw,
} from "./storage";
import { clearCmsAppGate } from "./cms-app";

interface AuthState {
  token: string | null;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export type LoginResult =
  | { ok: true }
  | {
      ok: false;
      reason: "email" | "api" | "token";
      /** Set when reason is `api` (HTTP body, network error, etc.). */
      detail?: string;
    };

interface AuthContextType extends AuthState {
  login: (credential: string) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** If set (non-empty), only this Google address may use the CMS (see `.env`). */
const ALLOWED_EMAIL_RAW = import.meta.env.VITE_ALLOWED_EMAIL;

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    let base64 = token.split(".")[1];
    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const DEV_BYPASS =
  import.meta.env.DEV && !String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();
const DEV_STATE: AuthState = {
  token: "dev",
  email: "dev@localhost",
  name: "Dev Admin",
  picture: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    if (DEV_BYPASS) return DEV_STATE;

    const stored = readAdminAuthRaw();
    if (!stored) return { token: null, email: null, name: null, picture: null };

    try {
      const parsed = JSON.parse(stored) as AuthState;
      const payload = decodeJwtPayload(parsed.token!);
      if (!payload || payload.exp * 1000 < Date.now()) {
        clearAdminAuthStorage();
        return { token: null, email: null, name: null, picture: null };
      }
      return parsed;
    } catch {
      return { token: null, email: null, name: null, picture: null };
    }
  });

  async function login(credential: string): Promise<LoginResult> {
    if (DEV_BYPASS) {
      setAuth(DEV_STATE);
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(DEV_STATE));
      return { ok: true };
    }

    try {
      const { session_token, user } = await exchangeGoogleSession(credential);

      const allowed = ALLOWED_EMAIL_RAW?.trim();
      if (allowed) {
        const a = allowed.toLowerCase();
        const got = (user.email ?? "").trim().toLowerCase();
        if (got !== a) {
          return { ok: false, reason: "email" };
        }
      }

      const payload = decodeJwtPayload(session_token);
      if (!payload || payload.exp * 1000 < Date.now()) {
        return { ok: false, reason: "token" };
      }

      const state: AuthState = {
        token: session_token,
        email: user.email,
        name: user.name ?? null,
        picture: user.picture ?? null,
      };

      setAuth(state);
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(state));
      return { ok: true };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return { ok: false, reason: "api", detail };
    }
  }

  function logout() {
    window.google?.accounts?.id?.disableAutoSelect();
    setAuth({ token: null, email: null, name: null, picture: null });
    clearAdminAuthStorage();
    clearCmsAppGate();
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
