-- =============================================
-- NEW PLAYLISTS
-- =============================================

-- 1. Abraham's Journey — the complete Abraham arc
INSERT OR IGNORE INTO playlists (id, app_id, name, description, playlist_type, sort_order)
VALUES ('pl-abraham', 'bible-tea', 'Abraham''s Journey', 'From a random call to the father of nations. Follow Abraham''s wild ride of faith, lies, and promises.', 'curated', 10);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-abraham', 'st-abraham-call', 1),
  ('pl-abraham', 'st-abe-sister-lie', 2),
  ('pl-abraham', 'st-same-lie', 3),
  ('pl-abraham', 'st-promise-son', 4),
  ('pl-abraham', 'st-tired-waiting', 5),
  ('pl-abraham', 'st-sodom', 6),
  ('pl-abraham', 'st-lots-escape', 7),
  ('pl-abraham', 'st-birth-isaac', 8),
  ('pl-abraham', 'st-abraham-isaac', 9),
  ('pl-abraham', 'st-isaac-rebekah', 10);

-- 2. Jacob's Saga — trickster becomes Israel
INSERT OR IGNORE INTO playlists (id, app_id, name, description, playlist_type, sort_order)
VALUES ('pl-jacob', 'bible-tea', 'Jacob''s Saga', 'The ultimate glow-up story. A scammer wrestles God and becomes the father of Israel.', 'curated', 11);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-jacob', 'st-jacob-esau', 1),
  ('pl-jacob', 'st-jacobs-ladder', 2),
  ('pl-jacob', 'st-jacob-rachel', 3),
  ('pl-jacob', 'st-jacob-wrestles', 4),
  ('pl-jacob', 'st-jacob-egypt', 5);

-- 3. The Great Escape — the full Exodus experience
INSERT OR IGNORE INTO playlists (id, app_id, name, description, playlist_type, sort_order)
VALUES ('pl-exodus', 'bible-tea', 'The Great Escape', 'Slavery, plagues, a sea splitting in half, and survival in the desert. The original action movie.', 'curated', 12);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-exodus', 'st-baby-moses', 1),
  ('pl-exodus', 'st-burning-bush', 2),
  ('pl-exodus', 'st-ten-plagues', 3),
  ('pl-exodus', 'st-red-sea', 4),
  ('pl-exodus', 'st-bread-heaven', 5),
  ('pl-exodus', 'st-ten-commandments', 6),
  ('pl-exodus', 'st-golden-calf', 7),
  ('pl-exodus', 'st-second-chance', 8),
  ('pl-exodus', 'st-gods-tent', 9);

-- 4. Second Chances — God's mercy on repeat
INSERT OR IGNORE INTO playlists (id, app_id, name, description, playlist_type, sort_order)
VALUES ('pl-second-chances', 'bible-tea', 'Second Chances', 'Messed up? So did they. Stories about grace, forgiveness, and fresh starts.', 'curated', 13);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-second-chances', 'st-second-chance', 1),
  ('pl-second-chances', 'st-prodigal-son', 2),
  ('pl-second-chances', 'st-jonah', 3),
  ('pl-second-chances', 'st-joseph-forgives', 4),
  ('pl-second-chances', 'st-david-bathsheba', 5),
  ('pl-second-chances', 'st-same-lie', 6),
  ('pl-second-chances', 'st-atonement', 7);

-- 5. Relationship Goals — love, loyalty, devotion
INSERT OR IGNORE INTO playlists (id, app_id, name, description, playlist_type, sort_order)
VALUES ('pl-relationships', 'bible-tea', 'Relationship Goals', 'Love at first sight, 14 years of waiting, and ride-or-die loyalty. Ancient love hits different.', 'curated', 14);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-relationships', 'st-isaac-rebekah', 1),
  ('pl-relationships', 'st-jacob-rachel', 2),
  ('pl-relationships', 'st-ruth', 3),
  ('pl-relationships', 'st-samson', 4),
  ('pl-relationships', 'st-david-bathsheba', 5),
  ('pl-relationships', 'st-good-samaritan', 6);

-- =============================================
-- UPDATE EXISTING PLAYLISTS with new stories
-- =============================================

-- Family Drama: add Jacob/Rachel, Lot's escape, Tired of Waiting
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-family', 'st-jacob-rachel', 9),
  ('pl-family', 'st-tired-waiting', 10),
  ('pl-family', 'st-lots-escape', 11),
  ('pl-family', 'st-jacob-wrestles', 12);

-- Maximum Drama: add Sodom & Gomorrah
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-drama', 'st-sodom', 9),
  ('pl-drama', 'st-lots-escape', 10);

-- Love Stories: add Isaac & Rebekah, Jacob Rachel & Leah
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-love', 'st-isaac-rebekah', 9),
  ('pl-love', 'st-jacob-rachel', 10);

-- Miracles & Wonders: add Bread from Heaven
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-miracles', 'st-bread-heaven', 11);

-- Courage Under Fire: add Jacob Wrestles God
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-courage', 'st-jacob-wrestles', 9);
