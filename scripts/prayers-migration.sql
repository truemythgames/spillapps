-- Prayers feature: new tables only, no changes to existing schema
-- Safe to run on production — all CREATE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS prayer_categories (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES prayer_categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  transcript TEXT,
  duration_seconds INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_free INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prayer_audio (
  id TEXT PRIMARY KEY,
  prayer_id TEXT NOT NULL REFERENCES prayers(id),
  speaker_id TEXT NOT NULL REFERENCES speakers(id),
  audio_key TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  locale TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS prayer_stories (
  prayer_id TEXT NOT NULL REFERENCES prayers(id),
  story_id TEXT NOT NULL REFERENCES stories(id),
  PRIMARY KEY (prayer_id, story_id)
);

CREATE TABLE IF NOT EXISTS prayer_characters (
  prayer_id TEXT NOT NULL REFERENCES prayers(id),
  character_id TEXT NOT NULL REFERENCES characters(id),
  PRIMARY KEY (prayer_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_prayers_app_category ON prayers(app_id, category_id);
CREATE INDEX IF NOT EXISTS idx_prayers_slug ON prayers(slug);
CREATE INDEX IF NOT EXISTS idx_prayer_audio_prayer ON prayer_audio(prayer_id, locale);
CREATE INDEX IF NOT EXISTS idx_prayer_stories_story ON prayer_stories(story_id);
CREATE INDEX IF NOT EXISTS idx_prayer_characters_char ON prayer_characters(character_id);
