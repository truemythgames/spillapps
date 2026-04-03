-- Per-app isolation for catalog content and chat (same schema, separate rows per app_id).

PRAGMA foreign_keys=OFF;

-- ---------------------------------------------------------------------------
-- seasons: UNIQUE(app_id, slug)
-- ---------------------------------------------------------------------------
CREATE TABLE seasons_new (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL DEFAULT 'bible-tea',
  testament TEXT NOT NULL CHECK (testament IN ('old', 'new')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(app_id, slug)
);

INSERT INTO seasons_new (id, app_id, testament, name, slug, description, cover_image_key, sort_order)
SELECT id, 'bible-tea', testament, name, slug, description, cover_image_key, sort_order FROM seasons;

DROP TABLE seasons;
ALTER TABLE seasons_new RENAME TO seasons;

-- ---------------------------------------------------------------------------
-- stories: UNIQUE(app_id, slug)
-- ---------------------------------------------------------------------------
CREATE TABLE stories_new (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL DEFAULT 'bible-tea',
  season_id TEXT NOT NULL REFERENCES seasons(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  transcript TEXT,
  cover_image_key TEXT,
  duration_seconds INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_free INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(app_id, slug)
);

INSERT INTO stories_new (
  id, app_id, season_id, title, slug, description, transcript, cover_image_key,
  duration_seconds, sort_order, is_free, is_published, published_at, created_at
)
SELECT
  id, 'bible-tea', season_id, title, slug, description, transcript, cover_image_key,
  duration_seconds, sort_order, is_free, is_published, published_at, created_at
FROM stories;

DROP TABLE stories;
ALTER TABLE stories_new RENAME TO stories;

PRAGMA foreign_keys=ON;

-- ---------------------------------------------------------------------------
-- Other catalog tables: app_id column
-- ---------------------------------------------------------------------------
ALTER TABLE speakers ADD COLUMN app_id TEXT NOT NULL DEFAULT 'bible-tea';
ALTER TABLE characters ADD COLUMN app_id TEXT NOT NULL DEFAULT 'bible-tea';
ALTER TABLE playlists ADD COLUMN app_id TEXT NOT NULL DEFAULT 'bible-tea';

-- ---------------------------------------------------------------------------
-- daily_features: UNIQUE(app_id, feature_date)
-- ---------------------------------------------------------------------------
PRAGMA foreign_keys=OFF;

CREATE TABLE daily_features_new (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL DEFAULT 'bible-tea',
  feature_date TEXT NOT NULL,
  story_id TEXT REFERENCES stories(id),
  quote_text TEXT,
  quote_attribution TEXT,
  UNIQUE(app_id, feature_date)
);

INSERT INTO daily_features_new (id, app_id, feature_date, story_id, quote_text, quote_attribution)
SELECT id, 'bible-tea', feature_date, story_id, quote_text, quote_attribution FROM daily_features;

DROP TABLE daily_features;
ALTER TABLE daily_features_new RENAME TO daily_features;

PRAGMA foreign_keys=ON;

-- ---------------------------------------------------------------------------
-- Chat + users
-- ---------------------------------------------------------------------------
ALTER TABLE chat_conversations ADD COLUMN app_id TEXT NOT NULL DEFAULT 'bible-tea';

ALTER TABLE users ADD COLUMN app_id TEXT;
UPDATE users SET app_id = CASE
  WHEN id LIKE '%:%' THEN substr(id, 1, instr(id, ':') - 1)
  ELSE 'bible-tea'
END;
UPDATE users SET app_id = 'bible-tea' WHERE app_id IS NULL OR trim(app_id) = '';

-- Optional overrides for LLM system prompts per app/topic (API falls back to built-ins if empty).
CREATE TABLE IF NOT EXISTS app_chat_prompts (
  app_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  body TEXT NOT NULL,
  PRIMARY KEY (app_id, topic)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seasons_app ON seasons(app_id);
CREATE INDEX IF NOT EXISTS idx_stories_app ON stories(app_id);
CREATE INDEX IF NOT EXISTS idx_stories_season ON stories(season_id);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_stories_app_season ON stories(app_id, season_id);
CREATE INDEX IF NOT EXISTS idx_stories_app_published ON stories(app_id, is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_speakers_app ON speakers(app_id);
CREATE INDEX IF NOT EXISTS idx_characters_app ON characters(app_id);
CREATE INDEX IF NOT EXISTS idx_playlists_app ON playlists(app_id);
CREATE INDEX IF NOT EXISTS idx_daily_features_app_date ON daily_features(app_id, feature_date);
CREATE INDEX IF NOT EXISTS idx_chat_conv_app_user ON chat_conversations(app_id, user_id);
CREATE INDEX IF NOT EXISTS idx_users_app ON users(app_id);
