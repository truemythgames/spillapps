-- Spill platform — Bible Tea seed content
-- Seasons, Stories, Speakers, and Playlists

-- ============================================
-- SPEAKERS
-- ============================================

INSERT OR IGNORE INTO speakers (id, app_id, name, bio, avatar_key, voice_style, is_default) VALUES
  ('spk-grace', 'bible-tea', 'Grace', 'Your bestie who makes everything relatable', 'bible-tea/speakers/grace.webp', 'warm-casual', 1),
  ('spk-maya', 'bible-tea', 'Maya', 'Dramatic storyteller who lives for the plot twists', 'bible-tea/speakers/maya.webp', 'dramatic-expressive', 0),
  ('spk-jordan', 'bible-tea', 'Jordan', 'Chill vibes, deep insights, zero judgment', 'bible-tea/speakers/jordan.webp', 'calm-reflective', 0);

-- ============================================
-- SEASONS (Bible Books)
-- ============================================

INSERT OR IGNORE INTO seasons (id, app_id, testament, name, slug, description, cover_image_key, sort_order) VALUES
  ('s-genesis', 'bible-tea', 'old', 'Genesis', 'genesis', 'Where it all began. Creation, the first humans, epic floods, and family drama that puts reality TV to shame.', 'bible-tea/covers/genesis.webp', 1),
  ('s-exodus', 'bible-tea', 'old', 'Exodus', 'exodus', 'The great escape. Slavery, plagues, parting seas, and the original road trip that lasted 40 years.', 'bible-tea/covers/exodus.webp', 2),
  ('s-heroes', 'bible-tea', 'old', 'Heroes & Kings', 'heroes-kings', 'Underdogs, warriors, queens, and kings. The Old Testament''s greatest characters.', 'bible-tea/covers/heroes.webp', 3),
  ('s-jesus', 'bible-tea', 'new', 'The Life of Jesus', 'life-of-jesus', 'The main character. His birth, miracles, teachings, and the ultimate plot twist.', 'bible-tea/covers/jesus.webp', 4);

-- ============================================
-- STORIES — Season 1: Genesis (12 stories)
-- ============================================

INSERT OR IGNORE INTO stories (id, app_id, season_id, title, slug, description, duration_seconds, sort_order, is_free, is_published, published_at) VALUES
  ('st-creation', 'bible-tea', 's-genesis', 'The Creation', 'the-creation', 'God literally built the entire universe in 6 days and said "I need a break." The origin story of everything.', 300, 1, 1, 1, '2026-03-26'),
  ('st-adam-eve', 'bible-tea', 's-genesis', 'Adam & Eve', 'adam-and-eve', 'The one rule they had to follow... and they couldn''t even do that. The original trust issues.', 330, 2, 1, 1, '2026-03-26'),
  ('st-cain-abel', 'bible-tea', 's-genesis', 'Cain & Abel', 'cain-and-abel', 'The first brothers. The first jealousy. The first unaliving. Things escalated FAST.', 300, 3, 0, 1, '2026-03-26'),
  ('st-noah', 'bible-tea', 's-genesis', 'Noah''s Ark', 'noahs-ark', 'God said "I''m done" and flooded the whole planet. But one guy got a heads up and built a boat zoo.', 360, 4, 1, 1, '2026-03-26'),
  ('st-babel', 'bible-tea', 's-genesis', 'Tower of Babel', 'tower-of-babel', 'Humanity tried to build a tower to heaven. God said absolutely not and scrambled everyone''s languages.', 270, 5, 0, 1, '2026-03-26'),
  ('st-abraham-call', 'bible-tea', 's-genesis', 'Abraham''s Call', 'abrahams-call', 'God told this 75-year-old man to leave everything behind with zero details. And he just... went.', 300, 6, 0, 1, '2026-03-26'),
  ('st-abraham-isaac', 'bible-tea', 's-genesis', 'Abraham & Isaac', 'abraham-and-isaac', 'God asked Abraham to sacrifice his own son. The most intense trust test in history.', 330, 7, 0, 1, '2026-03-26'),
  ('st-jacob-esau', 'bible-tea', 's-genesis', 'Jacob & Esau', 'jacob-and-esau', 'Twin brothers, a stolen blessing, and decades of beef. Family drama at its finest.', 300, 8, 0, 1, '2026-03-26'),
  ('st-jacobs-ladder', 'bible-tea', 's-genesis', 'Jacob''s Ladder', 'jacobs-ladder', 'Jacob has a dream about a stairway to heaven. Not the Led Zeppelin song, the OG version.', 240, 9, 0, 1, '2026-03-26'),
  ('st-joseph-brothers', 'bible-tea', 's-genesis', 'Joseph & His Brothers', 'joseph-and-his-brothers', 'His brothers literally sold him into slavery because they were jealous of his outfit. Yes, really.', 360, 10, 1, 1, '2026-03-26'),
  ('st-joseph-egypt', 'bible-tea', 's-genesis', 'Joseph in Egypt', 'joseph-in-egypt', 'From prison to running the entire country. The glow-up to end all glow-ups.', 330, 11, 0, 1, '2026-03-26'),
  ('st-joseph-forgives', 'bible-tea', 's-genesis', 'Joseph Forgives His Brothers', 'joseph-forgives', 'His brothers show up begging for food, not knowing he''s basically the vice president now. The reveal is EVERYTHING.', 300, 12, 0, 1, '2026-03-26');

-- ============================================
-- STORIES — Season 2: Exodus (8 stories)
-- ============================================

INSERT OR IGNORE INTO stories (id, app_id, season_id, title, slug, description, duration_seconds, sort_order, is_free, is_published, published_at) VALUES
  ('st-baby-moses', 'bible-tea', 's-exodus', 'Baby Moses', 'baby-moses', 'His mom hid him in a basket on the river to save his life. Pharaoh''s daughter found him and raised him as royalty.', 300, 1, 0, 1, '2026-03-26'),
  ('st-burning-bush', 'bible-tea', 's-exodus', 'The Burning Bush', 'the-burning-bush', 'Moses sees a bush that''s on fire but won''t burn down. Then God starts TALKING from it.', 270, 2, 0, 1, '2026-03-26'),
  ('st-ten-plagues', 'bible-tea', 's-exodus', 'The 10 Plagues', 'the-ten-plagues', 'God sent 10 increasingly unhinged plagues on Egypt. Rivers of blood, frogs everywhere, total darkness. It was a LOT.', 420, 3, 0, 1, '2026-03-26'),
  ('st-red-sea', 'bible-tea', 's-exodus', 'Crossing the Red Sea', 'crossing-the-red-sea', 'Trapped between the sea and an army. Then Moses raises his staff and the sea literally splits in two.', 300, 4, 0, 1, '2026-03-26'),
  ('st-ten-commandments', 'bible-tea', 's-exodus', 'The 10 Commandments', 'the-ten-commandments', 'God carved the rules of life onto stone tablets. Moses went up a mountain and came back with the ultimate terms of service.', 330, 5, 0, 1, '2026-03-26'),
  ('st-golden-calf', 'bible-tea', 's-exodus', 'The Golden Calf', 'the-golden-calf', 'Moses was gone for 40 days and the people immediately built a fake god out of their jewelry. The audacity.', 270, 6, 0, 1, '2026-03-26'),
  ('st-wandering', 'bible-tea', 's-exodus', 'Wandering the Desert', 'wandering-the-desert', '40 years of walking because they couldn''t trust God. The world''s longest road trip with the worst vibes.', 300, 7, 0, 1, '2026-03-26'),
  ('st-moses-final', 'bible-tea', 's-exodus', 'Moses'' Final Days', 'moses-final-days', 'He led them all the way there but never got to enter the promised land himself. Heartbreaking.', 270, 8, 0, 1, '2026-03-26');

-- ============================================
-- STORIES — Season 3: Heroes & Kings (10 stories)
-- ============================================

INSERT OR IGNORE INTO stories (id, app_id, season_id, title, slug, description, duration_seconds, sort_order, is_free, is_published, published_at) VALUES
  ('st-jericho', 'bible-tea', 's-heroes', 'Joshua & Jericho', 'joshua-and-jericho', 'They walked around a city for 7 days, blew some trumpets, and the walls collapsed. Military strategy: vibes only.', 300, 1, 0, 1, '2026-03-26'),
  ('st-samson', 'bible-tea', 's-heroes', 'Samson & Delilah', 'samson-and-delilah', 'The strongest man alive had one weakness — a woman who literally asked him his secret 3 times and he still told her.', 360, 2, 0, 1, '2026-03-26'),
  ('st-ruth', 'bible-tea', 's-heroes', 'Ruth & Naomi', 'ruth-and-naomi', 'A story about loyalty, love, and choosing your people. Ruth said "where you go, I go" and she MEANT it.', 300, 3, 0, 1, '2026-03-26'),
  ('st-david-goliath', 'bible-tea', 's-heroes', 'David & Goliath', 'david-and-goliath', 'A teenager with a slingshot vs a 9-foot giant in full armor. Everyone thought he was crazy. He wasn''t.', 330, 4, 1, 1, '2026-03-26'),
  ('st-david-king', 'bible-tea', 's-heroes', 'David Becomes King', 'david-becomes-king', 'From shepherd boy to the greatest king Israel ever had. The original rags-to-riches story.', 300, 5, 0, 1, '2026-03-26'),
  ('st-david-bathsheba', 'bible-tea', 's-heroes', 'David & Bathsheba', 'david-and-bathsheba', 'Even the greatest king fell hard. Power, lust, and a cover-up that God wasn''t having.', 330, 6, 0, 1, '2026-03-26'),
  ('st-solomon', 'bible-tea', 's-heroes', 'Solomon''s Wisdom', 'solomons-wisdom', 'God said "ask for anything" and Solomon asked for wisdom. Then immediately proved it with the wildest judgment call ever.', 300, 7, 0, 1, '2026-03-26'),
  ('st-daniel-lions', 'bible-tea', 's-heroes', 'Daniel & the Lions'' Den', 'daniel-and-the-lions-den', 'They threw him in a pit of lions because he wouldn''t stop praying. The lions? Didn''t touch him.', 300, 8, 0, 1, '2026-03-26'),
  ('st-jonah', 'bible-tea', 's-heroes', 'Jonah & the Whale', 'jonah-and-the-whale', 'God said go left. Jonah went right. Then a giant fish swallowed him for 3 days. Lesson learned.', 300, 9, 0, 1, '2026-03-26'),
  ('st-esther', 'bible-tea', 's-heroes', 'Esther Saves Her People', 'esther-saves-her-people', 'A secret Jewish queen risks everything to stop a genocide. She walked in uninvited to the king. Main character energy.', 360, 10, 0, 1, '2026-03-26');

-- ============================================
-- STORIES — Season 4: Life of Jesus (10 stories)
-- ============================================

INSERT OR IGNORE INTO stories (id, app_id, season_id, title, slug, description, duration_seconds, sort_order, is_free, is_published, published_at) VALUES
  ('st-birth-jesus', 'bible-tea', 's-jesus', 'The Birth of Jesus', 'birth-of-jesus', 'A teenage girl, a divine pregnancy, no room at the inn, and a baby born in a barn. Christmas but make it real.', 330, 1, 1, 1, '2026-03-26'),
  ('st-baptism', 'bible-tea', 's-jesus', 'Jesus Gets Baptized', 'jesus-gets-baptized', 'Jesus walks into the Jordan River and the sky literally opens up. God said "that''s my son" out loud.', 270, 2, 0, 1, '2026-03-26'),
  ('st-first-miracles', 'bible-tea', 's-jesus', 'Jesus'' First Miracles', 'jesus-first-miracles', 'He turned water into wine at a party. His mom basically peer-pressured him into it. Iconic.', 300, 3, 0, 1, '2026-03-26'),
  ('st-good-samaritan', 'bible-tea', 's-jesus', 'The Good Samaritan', 'the-good-samaritan', 'A man gets robbed and left for dead. The "good" religious people walked past him. The outsider stopped to help.', 300, 4, 0, 1, '2026-03-26'),
  ('st-prodigal-son', 'bible-tea', 's-jesus', 'The Prodigal Son', 'the-prodigal-son', 'He took his inheritance early, blew it all, and came crawling back. His dad threw him a party anyway.', 330, 5, 0, 1, '2026-03-26'),
  ('st-walks-water', 'bible-tea', 's-jesus', 'Jesus Walks on Water', 'jesus-walks-on-water', 'Middle of a storm. Disciples panicking. Then they see someone WALKING on the waves toward them.', 270, 6, 0, 1, '2026-03-26'),
  ('st-feeds-5000', 'bible-tea', 's-jesus', 'Jesus Feeds 5,000', 'jesus-feeds-five-thousand', '5 loaves, 2 fish, 5,000 hungry people. He made it work. And there were LEFTOVERS.', 270, 7, 0, 1, '2026-03-26'),
  ('st-last-supper', 'bible-tea', 's-jesus', 'The Last Supper', 'the-last-supper', 'His final meal with his 12 closest friends. One of them was about to betray him. He already knew.', 360, 8, 0, 1, '2026-03-26'),
  ('st-crucifixion', 'bible-tea', 's-jesus', 'The Crucifixion', 'the-crucifixion', 'They arrested him, mocked him, and killed him on a cross. The darkest day. But it wasn''t the end.', 420, 9, 0, 1, '2026-03-26'),
  ('st-resurrection', 'bible-tea', 's-jesus', 'The Resurrection', 'the-resurrection', 'Three days later, the tomb was empty. He was alive. Everything he said was true. The greatest comeback in history.', 360, 10, 0, 1, '2026-03-26');

-- ============================================
-- PLAYLISTS
-- ============================================

INSERT OR IGNORE INTO playlists (id, app_id, name, description, cover_image_key, playlist_type, is_featured, sort_order) VALUES
  ('pl-easter', 'bible-tea', 'Holy Week', 'From the Last Supper to the Resurrection. The most important week in history.', 'bible-tea/covers/easter-playlist.webp', 'seasonal', 1, 1),
  ('pl-beginners', 'bible-tea', 'Start Here', 'New to the Bible? These 10 stories will give you the foundation.', 'bible-tea/covers/start-here.webp', 'curated', 0, 2),
  ('pl-drama', 'bible-tea', 'Maximum Drama', 'Betrayals, plot twists, and jaw-dropping moments. The Bible goes HARD.', 'bible-tea/covers/drama.webp', 'thematic', 0, 3),
  ('pl-underdogs', 'bible-tea', 'Underdog Stories', 'Nobody believed in them. They proved everyone wrong.', 'bible-tea/covers/underdogs.webp', 'thematic', 0, 4);

-- Easter playlist
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-easter', 'st-last-supper', 1),
  ('pl-easter', 'st-crucifixion', 2),
  ('pl-easter', 'st-resurrection', 3);

-- Start Here playlist
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-beginners', 'st-creation', 1),
  ('pl-beginners', 'st-adam-eve', 2),
  ('pl-beginners', 'st-noah', 3),
  ('pl-beginners', 'st-joseph-brothers', 4),
  ('pl-beginners', 'st-red-sea', 5),
  ('pl-beginners', 'st-david-goliath', 6),
  ('pl-beginners', 'st-daniel-lions', 7),
  ('pl-beginners', 'st-jonah', 8),
  ('pl-beginners', 'st-birth-jesus', 9),
  ('pl-beginners', 'st-resurrection', 10);

-- Drama playlist
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-drama', 'st-cain-abel', 1),
  ('pl-drama', 'st-joseph-brothers', 2),
  ('pl-drama', 'st-ten-plagues', 3),
  ('pl-drama', 'st-samson', 4),
  ('pl-drama', 'st-david-bathsheba', 5),
  ('pl-drama', 'st-esther', 6),
  ('pl-drama', 'st-last-supper', 7),
  ('pl-drama', 'st-crucifixion', 8);

-- Underdog playlist
INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-underdogs', 'st-baby-moses', 1),
  ('pl-underdogs', 'st-david-goliath', 2),
  ('pl-underdogs', 'st-ruth', 3),
  ('pl-underdogs', 'st-esther', 4),
  ('pl-underdogs', 'st-daniel-lions', 5),
  ('pl-underdogs', 'st-joseph-brothers', 6);
