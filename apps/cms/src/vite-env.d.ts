/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_ALLOWED_EMAIL?: string;
  /** Default product when `VITE_ALLOWED_APP_IDS` is not set. */
  readonly VITE_APP_ID?: string;
  /** Comma-separated app ids (must match API `ALLOWED_APP_IDS`) for multi-product CMS. */
  readonly VITE_ALLOWED_APP_IDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
