-- Spill platform — Bible Tea product schema
-- Initial migration

CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  testament TEXT NOT NULL CHECK (testament IN ('old', 'new')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  cover_image_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES seasons(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  transcript TEXT,
  cover_image_key TEXT,
  duration_seconds INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_free INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS speakers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_key TEXT,
  voice_style TEXT DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS story_audio (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  speaker_id TEXT NOT NULL REFERENCES speakers(id),
  audio_key TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  UNIQUE(story_id, speaker_id)
);

CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_key TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS character_stories (
  character_id TEXT NOT NULL REFERENCES characters(id),
  story_id TEXT NOT NULL REFERENCES stories(id),
  PRIMARY KEY (character_id, story_id)
);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_key TEXT,
  playlist_type TEXT NOT NULL DEFAULT 'curated' CHECK (playlist_type IN ('curated', 'seasonal', 'thematic')),
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS playlist_stories (
  playlist_id TEXT NOT NULL REFERENCES playlists(id),
  story_id TEXT NOT NULL REFERENCES stories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, story_id)
);

CREATE TABLE IF NOT EXISTS daily_features (
  id TEXT PRIMARY KEY,
  feature_date TEXT NOT NULL UNIQUE,
  story_id TEXT REFERENCES stories(id),
  quote_text TEXT,
  quote_attribution TEXT
);

-- User tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clerk_id TEXT UNIQUE,
  rc_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT NOT NULL,
  story_id TEXT NOT NULL REFERENCES stories(id),
  speaker_id TEXT NOT NULL REFERENCES speakers(id),
  position_seconds REAL NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, story_id)
);

CREATE TABLE IF NOT EXISTS user_likes (
  user_id TEXT NOT NULL,
  story_id TEXT NOT NULL REFERENCES stories(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, story_id)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  last_listen_date TEXT
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  default_speaker_id TEXT REFERENCES speakers(id),
  playback_speed REAL NOT NULL DEFAULT 1.0,
  language TEXT NOT NULL DEFAULT 'en'
);

-- Indexes for performance

CREATE INDEX IF NOT EXISTS idx_stories_season ON stories(season_id);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_story_audio_story ON story_audio(story_id);
CREATE INDEX IF NOT EXISTS idx_character_stories_story ON character_stories(story_id);
CREATE INDEX IF NOT EXISTS idx_playlist_stories_playlist ON playlist_stories(playlist_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated ON user_progress(updated_at);
CREATE INDEX IF NOT EXISTS idx_daily_features_date ON daily_features(feature_date);
