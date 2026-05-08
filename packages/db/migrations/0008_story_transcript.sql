-- Store story transcript (markdown) directly in the DB instead of R2 files.
-- Old R2 files are kept for backward compat with older app versions.

ALTER TABLE stories ADD COLUMN transcript TEXT DEFAULT NULL;
