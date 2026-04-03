/** Spill platform admin session. */
export const ADMIN_AUTH_STORAGE_KEY = "spill_admin_auth";

/** Older installs used this key; read once and move to `spill_admin_auth`. */
const MIGRATION_SOURCE_ADMIN_AUTH_KEY = "bibletea_admin_auth";

/** Read stored admin auth JSON; migrates from pre-Spill storage key if present. */
export function readAdminAuthRaw(): string | null {
  const next = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (next) return next;
  const migrated = localStorage.getItem(MIGRATION_SOURCE_ADMIN_AUTH_KEY);
  if (migrated) {
    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, migrated);
    localStorage.removeItem(MIGRATION_SOURCE_ADMIN_AUTH_KEY);
    return migrated;
  }
  return null;
}

export function clearAdminAuthStorage(): void {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  localStorage.removeItem(MIGRATION_SOURCE_ADMIN_AUTH_KEY);
}
