CREATE TABLE IF NOT EXISTS app_settings (
  app_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (app_id, key)
);
