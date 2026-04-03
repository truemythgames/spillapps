export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
  /** Product slug this Worker serves first (e.g. bible-tea); platform is Spill. */
  APP_ID: string;
  /** Comma-separated app ids allowed to call this API (defaults to APP_ID). */
  ALLOWED_APP_IDS?: string;
  APP_NAME: string;
  /** Public API URL returned in /v1/config (e.g. https://api.spillapps.com). */
  PUBLIC_API_BASE: string;
  /** Public base URL for R2 media (e.g. https://media.spillapps.com). */
  PUBLIC_MEDIA_BASE: string;
  /** Google OAuth Web client ID (set as Worker variable or in apps/api/.dev.vars). */
  GOOGLE_CLIENT_ID?: string;
  APPLE_BUNDLE_ID: string;
  /** HS256 secret; set with `wrangler secret put JWT_SECRET` or .dev.vars — never commit. */
  JWT_SECRET?: string;
  ADMIN_EMAIL: string;
  OPENAI_API_KEY?: string;
  /** Comma-separated browser origins, or * (see apps/api/wrangler.toml). */
  CORS_ALLOWED_ORIGINS?: string;
}

export interface Story {
  id: string;
  season_id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_key: string;
  duration_seconds: number;
  sort_order: number;
  is_free: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Season {
  id: string;
  testament: "old" | "new";
  name: string;
  slug: string;
  description: string;
  cover_image_key: string;
  sort_order: number;
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  avatar_key: string;
  voice_style: string;
  is_default: boolean;
}

export interface StoryAudio {
  id: string;
  story_id: string;
  speaker_id: string;
  audio_key: string;
  duration_seconds: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_image_key: string;
  playlist_type: "curated" | "seasonal" | "thematic";
  is_featured: boolean;
  sort_order: number;
}

export interface UserProgress {
  user_id: string;
  story_id: string;
  speaker_id: string;
  position_seconds: number;
  completed: boolean;
  updated_at: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  max_streak: number;
  last_listen_date: string;
}

export interface DailyFeature {
  id: string;
  feature_date: string;
  story_id: string | null;
  quote_text: string | null;
  quote_attribution: string | null;
}
