-- Allow prayer + prayer_category rows in content_translations.
-- The prayers feature reads translations via overlayTranslations(entityType: 'prayer' | 'prayer_category'),
-- but the original CHECK constraint (migration 0007) never included those entity types.
-- SQLite can't alter a CHECK constraint in place, so rebuild the table preserving all data.

ALTER TABLE content_translations RENAME TO content_translations_old;

CREATE TABLE content_translations (
  app_id      TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'story', 'season', 'character', 'playlist', 'speaker', 'daily_feature',
    'prayer', 'prayer_category'
  )),
  entity_id   TEXT NOT NULL,
  locale      TEXT NOT NULL,
  field       TEXT NOT NULL,
  value       TEXT NOT NULL,
  PRIMARY KEY (app_id, entity_type, entity_id, locale, field)
);

INSERT INTO content_translations (app_id, entity_type, entity_id, locale, field, value)
  SELECT app_id, entity_type, entity_id, locale, field, value FROM content_translations_old;

DROP TABLE content_translations_old;

CREATE INDEX IF NOT EXISTS idx_translations_lookup
  ON content_translations(app_id, entity_type, locale);
