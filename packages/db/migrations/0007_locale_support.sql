-- Locale / i18n support for multi-language content.
-- English remains the source of truth in the original tables; translations live
-- in a separate table so existing queries return English by default.

-- ---------------------------------------------------------------------------
-- content_translations: per-field overrides keyed by (app, entity, locale)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_translations (
  app_id      TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'story', 'season', 'character', 'playlist', 'speaker', 'daily_feature'
  )),
  entity_id   TEXT NOT NULL,
  locale      TEXT NOT NULL,
  field       TEXT NOT NULL,
  value       TEXT NOT NULL,
  PRIMARY KEY (app_id, entity_type, entity_id, locale, field)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup
  ON content_translations(app_id, entity_type, locale);

-- ---------------------------------------------------------------------------
-- app_chat_prompts: add locale dimension (was PK: app_id, topic)
-- ---------------------------------------------------------------------------
PRAGMA foreign_keys=OFF;

CREATE TABLE app_chat_prompts_new (
  app_id TEXT NOT NULL,
  topic  TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  body   TEXT NOT NULL,
  PRIMARY KEY (app_id, topic, locale)
);

INSERT INTO app_chat_prompts_new (app_id, topic, locale, body)
  SELECT app_id, topic, 'en', body FROM app_chat_prompts;

DROP TABLE app_chat_prompts;
ALTER TABLE app_chat_prompts_new RENAME TO app_chat_prompts;

PRAGMA foreign_keys=ON;
