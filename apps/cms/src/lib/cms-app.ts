/** Persisted key for which product tenant the CMS is editing. */
const STORAGE_KEY = "spill_cms_selected_app_id";

/**
 * Apps this CMS may manage — must match Worker `ALLOWED_APP_IDS` (comma-separated).
 * If unset, uses `VITE_APP_ID` or `bible-tea` as a single-app default.
 */
export function getAllowedAppIds(): string[] {
  const raw = import.meta.env.VITE_ALLOWED_APP_IDS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const single = import.meta.env.VITE_APP_ID?.trim() || "bible-tea";
  return [single];
}

/** Effective app for API calls (validated against `getAllowedAppIds()`). */
export function getCmsAppId(): string {
  const allowed = getAllowedAppIds();
  try {
    const stored = localStorage.getItem(STORAGE_KEY)?.trim();
    if (stored && allowed.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return allowed[0] ?? "bible-tea";
}

export function setCmsAppId(id: string): void {
  if (!getAllowedAppIds().includes(id)) return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Session flag: user finished “pick an app” after login (multi-app only). Cleared on sign-out. */
const APP_GATE_KEY = "spill_cms_app_gate_ok";

export function markCmsAppGateComplete(): void {
  try {
    sessionStorage.setItem(APP_GATE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearCmsAppGate(): void {
  try {
    sessionStorage.removeItem(APP_GATE_KEY);
  } catch {
    /* ignore */
  }
}

export function isCmsAppGateComplete(): boolean {
  try {
    return sessionStorage.getItem(APP_GATE_KEY) === "1";
  } catch {
    return false;
  }
}
