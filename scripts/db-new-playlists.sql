-- 10 new curated playlists for Bible Tea

-- 1. Women of the Bible
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-women', 'bible-tea', 'Women of the Bible', 'The fierce, faithful, and fearless women whose stories shaped history — from Deborah to Mary.', 1, 15);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-women', 'st-tired-waiting', 1),
  ('pl-women', 'st-birth-isaac', 2),
  ('pl-women', 'st-isaac-rebekah', 3),
  ('pl-women', 'st-jacob-rachel', 4),
  ('pl-women', 'st-deborah-and-jael', 5),
  ('pl-women', 'st-ruth', 6),
  ('pl-women', 'st-esther', 7),
  ('pl-women', 'st-angel-visits-mary', 8),
  ('pl-women', 'st-mary-and-martha', 9),
  ('pl-women', 'st-the-woman-at-the-well', 10),
  ('pl-women', 'st-jairus-daughter-and-the-bleeding-woman', 11),
  ('pl-women', 'st-a-mothers-desperate-faith', 12),
  ('pl-women', 'st-go-ahead-throw-a-stone', 13);

-- 2. Kings & Kingdoms
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-kings', 'bible-tea', 'Kings & Kingdoms', 'The rise and fall of Israel''s monarchy — brilliant kings, terrible kings, and the God who outlasted them all.', 1, 16);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-kings', 'st-david-king', 1),
  ('pl-kings', 'st-gods-promise-to-david', 2),
  ('pl-kings', 'st-solomon', 3),
  ('pl-kings', 'st-the-kingdom-splits', 4),
  ('pl-kings', 'st-kings-who-copied-the-worst', 5),
  ('pl-kings', 'st-hezekiah-vs-the-empire', 6),
  ('pl-kings', 'st-one-angel-one-army-destroyed', 7),
  ('pl-kings', 'st-hezekiahs-extra-years', 8),
  ('pl-kings', 'st-manasseh-hits-reverse', 9),
  ('pl-kings', 'st-josiah-finds-the-lost-book', 10),
  ('pl-kings', 'st-josiahs-last-battle', 11),
  ('pl-kings', 'st-decay-coups-and-leprosy', 12),
  ('pl-kings', 'st-the-northern-kingdom-falls', 13),
  ('pl-kings', 'st-jerusalem-burns', 14);

-- 3. Paul's Missions
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-paul', 'bible-tea', 'Paul''s Missions', 'From persecutor to apostle — follow Paul across the Roman Empire as he plants churches, survives shipwrecks, and changes the world.', 1, 17);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-paul', 'st-saul-meets-jesus', 1),
  ('pl-paul', 'st-the-antioch-church', 2),
  ('pl-paul', 'st-pauls-first-journey', 3),
  ('pl-paul', 'st-the-jerusalem-council', 4),
  ('pl-paul', 'st-earthquake-at-philippi', 5),
  ('pl-paul', 'st-thessalonica-riot-and-berea', 6),
  ('pl-paul', 'st-athens-the-unknown-god', 7),
  ('pl-paul', 'st-riot-in-ephesus', 8),
  ('pl-paul', 'st-eutychus-falls-out-a-window', 9),
  ('pl-paul', 'st-farewell-at-miletus', 10),
  ('pl-paul', 'st-arrested-at-the-temple', 11),
  ('pl-paul', 'st-trials-before-governors', 12),
  ('pl-paul', 'st-shipwreck-and-malta', 13),
  ('pl-paul', 'st-paul-under-house-arrest', 14),
  ('pl-paul', 'st-pauls-last-letter', 15);

-- 4. Parables of Jesus
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-parables', 'bible-tea', 'Parables of Jesus', 'The stories Jesus told to flip people''s thinking — vivid, subversive, and impossible to forget.', 1, 18);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-parables', 'st-good-samaritan', 1),
  ('pl-parables', 'st-prodigal-son', 2),
  ('pl-parables', 'st-the-shrewd-manager', 3),
  ('pl-parables', 'st-the-rich-man-and-lazarus', 4),
  ('pl-parables', 'st-the-good-shepherd', 5),
  ('pl-parables', 'st-the-wedding-feast-parables', 6),
  ('pl-parables', 'st-the-narrow-door', 7),
  ('pl-parables', 'st-counting-the-cost', 8),
  ('pl-parables', 'st-signs-of-the-end', 9);

-- 5. Healing & Restoration
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-healing', 'bible-tea', 'Healing & Restoration', 'Every miracle of healing — blind eyes opened, the dead raised, and bodies made whole.', 1, 19);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-healing', 'st-healing-at-the-pool', 1),
  ('pl-healing', 'st-peters-mother-in-law-healed', 2),
  ('pl-healing', 'st-touching-the-leper', 3),
  ('pl-healing', 'st-through-the-roof', 4),
  ('pl-healing', 'st-the-centurions-faith', 5),
  ('pl-healing', 'st-the-widows-son-lives-again', 6),
  ('pl-healing', 'st-deaf-ears-opened', 7),
  ('pl-healing', 'st-jairus-daughter-and-the-bleeding-woman', 8),
  ('pl-healing', 'st-healing-the-officials-son', 9),
  ('pl-healing', 'st-born-blind-now-sees', 10),
  ('pl-healing', 'st-the-boy-with-a-demon', 11),
  ('pl-healing', 'st-lazarus-lives-again', 12),
  ('pl-healing', 'st-the-beautiful-gate-miracle', 13),
  ('pl-healing', 'st-peters-miracles', 14);

-- 6. Prophets & Visions
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-prophets', 'bible-tea', 'Prophets & Visions', 'Burning bushes, talking donkeys, and apocalyptic visions — the wildest encounters with God in Scripture.', 1, 20);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-prophets', 'st-burning-bush', 1),
  ('pl-prophets', 'st-jacobs-ladder', 2),
  ('pl-prophets', 'st-a-talking-donkey-and-a-hired-prophet', 3),
  ('pl-prophets', 'st-when-curses-wont-stick', 4),
  ('pl-prophets', 'st-elijah-on-mount-carmel', 5),
  ('pl-prophets', 'st-daniel-lions', 6),
  ('pl-prophets', 'st-jonah', 7),
  ('pl-prophets', 'st-angel-visits-zechariah', 8),
  ('pl-prophets', 'st-angel-visits-mary', 9),
  ('pl-prophets', 'st-the-transfiguration', 10),
  ('pl-prophets', 'st-cornelius-and-the-vision', 11),
  ('pl-prophets', 'st-johns-exile-and-revelation', 12),
  ('pl-prophets', 'st-the-new-heaven-and-new-earth', 13);

-- 7. The Exodus Journey (extended)
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-exodus-full', 'bible-tea', 'The Full Exodus', 'The complete journey from Egyptian slavery to the edge of the Promised Land — plagues, miracles, rebellion, and 40 years in the desert.', 1, 21);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-exodus-full', 'st-baby-moses', 1),
  ('pl-exodus-full', 'st-burning-bush', 2),
  ('pl-exodus-full', 'st-ten-plagues', 3),
  ('pl-exodus-full', 'st-red-sea', 4),
  ('pl-exodus-full', 'st-bread-heaven', 5),
  ('pl-exodus-full', 'st-ten-commandments', 6),
  ('pl-exodus-full', 'st-golden-calf', 7),
  ('pl-exodus-full', 'st-second-chance', 8),
  ('pl-exodus-full', 'st-gods-tent', 9),
  ('pl-exodus-full', 'st-first-priests', 10),
  ('pl-exodus-full', 'st-organizing-the-camp', 11),
  ('pl-exodus-full', 'st-complaining-craving-and-chaos', 12),
  ('pl-exodus-full', 'st-12-spies-and-a-40-year-detour', 13),
  ('pl-exodus-full', 'st-rebellion-and-the-earth-opens', 14),
  ('pl-exodus-full', 'st-snakes-water-and-the-long-road', 15),
  ('pl-exodus-full', 'st-wandering', 16),
  ('pl-exodus-full', 'st-moses-farewell-address', 17),
  ('pl-exodus-full', 'st-moses-final', 18);

-- 8. David's Full Story
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-david', 'bible-tea', 'David''s Full Story', 'From shepherd boy to warrior to flawed king — the complete arc of Israel''s greatest and most complicated ruler.', 1, 22);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-david', 'st-david-goliath', 1),
  ('pl-david', 'st-sauls-last-stand', 2),
  ('pl-david', 'st-two-kings-two-armies', 3),
  ('pl-david', 'st-david-king', 4),
  ('pl-david', 'st-david-dances-before-the-ark', 5),
  ('pl-david', 'st-gods-promise-to-david', 6),
  ('pl-david', 'st-kindness-to-mephibosheth', 7),
  ('pl-david', 'st-david-bathsheba', 8),
  ('pl-david', 'st-absaloms-rise', 9),
  ('pl-david', 'st-absaloms-rebellion', 10),
  ('pl-david', 'st-a-fathers-worst-battle', 11),
  ('pl-david', 'st-davids-broken-return', 12),
  ('pl-david', 'st-davids-last-battles', 13),
  ('pl-david', 'st-davids-final-mistake', 14);

-- 9. The Passion
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-passion', 'bible-tea', 'The Passion', 'The final hours of Jesus — betrayal, trial, crucifixion, and the empty tomb. The story that changed everything.', 1, 23);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-passion', 'st-the-plot-against-jesus', 1),
  ('pl-passion', 'st-judas-makes-a-deal', 2),
  ('pl-passion', 'st-anointed-at-bethany', 3),
  ('pl-passion', 'st-last-supper', 4),
  ('pl-passion', 'st-gethsemane', 5),
  ('pl-passion', 'st-arrested-in-the-garden', 6),
  ('pl-passion', 'st-before-the-sanhedrin', 7),
  ('pl-passion', 'st-peters-three-denials', 8),
  ('pl-passion', 'st-jesus-before-pilate', 9),
  ('pl-passion', 'st-crucifixion', 10),
  ('pl-passion', 'st-buried-in-a-borrowed-tomb', 11),
  ('pl-passion', 'st-resurrection', 12);

-- 10. Acts: Church on Fire
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-acts', 'bible-tea', 'Acts: Church on Fire', 'The explosive birth of the early church — from Pentecost to Paul in Rome. Miracles, persecution, and unstoppable growth.', 1, 24);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-acts', 'st-the-ascension', 1),
  ('pl-acts', 'st-pentecost', 2),
  ('pl-acts', 'st-the-beautiful-gate-miracle', 3),
  ('pl-acts', 'st-ananias-and-sapphira', 4),
  ('pl-acts', 'st-stephen-the-first-martyr', 5),
  ('pl-acts', 'st-the-church-scatters', 6),
  ('pl-acts', 'st-saul-meets-jesus', 7),
  ('pl-acts', 'st-peters-miracles', 8),
  ('pl-acts', 'st-cornelius-and-the-vision', 9),
  ('pl-acts', 'st-the-antioch-church', 10),
  ('pl-acts', 'st-james-killed-peter-escapes', 11),
  ('pl-acts', 'st-pauls-first-journey', 12),
  ('pl-acts', 'st-the-jerusalem-council', 13),
  ('pl-acts', 'st-earthquake-at-philippi', 14);
