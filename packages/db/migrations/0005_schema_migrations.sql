-- Optional audit trail for manual D1 migrations: insert a row when you apply a new migration file.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
