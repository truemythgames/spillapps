-- 14 additional curated playlists for Bible Tea

-- 1. Bible Stories for Kids
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-kids', 'bible-tea', 'Bible Stories for Kids', 'The most beloved, family-friendly Bible stories — perfect for bedtime listening or road trips.', 1, 25);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-kids', 'st-creation', 1),
  ('pl-kids', 'st-adam-eve', 2),
  ('pl-kids', 'st-noah', 3),
  ('pl-kids', 'st-abraham-call', 4),
  ('pl-kids', 'st-joseph-brothers', 5),
  ('pl-kids', 'st-baby-moses', 6),
  ('pl-kids', 'st-red-sea', 7),
  ('pl-kids', 'st-david-goliath', 8),
  ('pl-kids', 'st-daniel-lions', 9),
  ('pl-kids', 'st-jonah', 10),
  ('pl-kids', 'st-ruth', 11),
  ('pl-kids', 'st-birth-jesus', 12),
  ('pl-kids', 'st-good-samaritan', 13),
  ('pl-kids', 'st-prodigal-son', 14),
  ('pl-kids', 'st-resurrection', 15);

-- 2. Quick Listens
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-quick', 'bible-tea', 'Quick Listens', 'Short, punchy stories you can finish in one sitting — perfect for a commute or coffee break.', 1, 26);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-quick', 'st-cain-abel', 1),
  ('pl-quick', 'st-babel', 2),
  ('pl-quick', 'st-jacobs-ladder', 3),
  ('pl-quick', 'st-burning-bush', 4),
  ('pl-quick', 'st-nicodemus-comes-at-night', 5),
  ('pl-quick', 'st-the-centurions-faith', 6),
  ('pl-quick', 'st-the-fish-with-a-coin', 7),
  ('pl-quick', 'st-zacchaeus-climbs-a-tree', 8),
  ('pl-quick', 'st-matthew-leaves-everything', 9),
  ('pl-quick', 'st-doubting-thomas', 10),
  ('pl-quick', 'st-the-road-to-emmaus', 11),
  ('pl-quick', 'st-eutychus-falls-out-a-window', 12);

-- 3. Deep Dives
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-deep', 'bible-tea', 'Deep Dives', 'Epic, multi-chapter narratives that demand your full attention — the Bible''s most complex stories.', 1, 27);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-deep', 'st-joseph-brothers', 1),
  ('pl-deep', 'st-joseph-egypt', 2),
  ('pl-deep', 'st-joseph-forgives', 3),
  ('pl-deep', 'st-ten-plagues', 4),
  ('pl-deep', 'st-samson', 5),
  ('pl-deep', 'st-esther', 6),
  ('pl-deep', 'st-absaloms-rise', 7),
  ('pl-deep', 'st-absaloms-rebellion', 8),
  ('pl-deep', 'st-a-fathers-worst-battle', 9),
  ('pl-deep', 'st-signs-of-the-end', 10);

-- 4. Promises of God
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-promises', 'bible-tea', 'Promises of God', 'Every major covenant and promise — from the rainbow to the empty tomb. God keeps His word.', 1, 28);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-promises', 'st-creation', 1),
  ('pl-promises', 'st-noah', 2),
  ('pl-promises', 'st-abraham-call', 3),
  ('pl-promises', 'st-promise-son', 4),
  ('pl-promises', 'st-birth-isaac', 5),
  ('pl-promises', 'st-jacobs-ladder', 6),
  ('pl-promises', 'st-burning-bush', 7),
  ('pl-promises', 'st-ten-commandments', 8),
  ('pl-promises', 'st-gods-promise-to-david', 9),
  ('pl-promises', 'st-angel-visits-mary', 10),
  ('pl-promises', 'st-birth-jesus', 11),
  ('pl-promises', 'st-resurrection', 12),
  ('pl-promises', 'st-the-new-heaven-and-new-earth', 13);

-- 5. Angels & the Supernatural
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-angels', 'bible-tea', 'Angels & the Supernatural', 'Burning bushes, angelic messengers, heavenly visions, and spiritual warfare — the Bible''s wildest moments.', 1, 29);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-angels', 'st-burning-bush', 1),
  ('pl-angels', 'st-jacobs-ladder', 2),
  ('pl-angels', 'st-jacob-wrestles', 3),
  ('pl-angels', 'st-a-talking-donkey-and-a-hired-prophet', 4),
  ('pl-angels', 'st-elijah-on-mount-carmel', 5),
  ('pl-angels', 'st-daniel-lions', 6),
  ('pl-angels', 'st-angel-visits-zechariah', 7),
  ('pl-angels', 'st-angel-visits-mary', 8),
  ('pl-angels', 'st-the-wise-men', 9),
  ('pl-angels', 'st-40-days-in-the-desert', 10),
  ('pl-angels', 'st-the-transfiguration', 11),
  ('pl-angels', 'st-resurrection', 12),
  ('pl-angels', 'st-the-ascension', 13),
  ('pl-angels', 'st-pentecost', 14),
  ('pl-angels', 'st-johns-exile-and-revelation', 15);

-- 6. War & Battles
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-battles', 'bible-tea', 'War & Battles', 'Sieges, ambushes, and impossible odds — every major military conflict in the Bible.', 1, 30);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-battles', 'st-red-sea', 1),
  ('pl-battles', 'st-the-battle-against-midian', 2),
  ('pl-battles', 'st-jericho', 3),
  ('pl-battles', 'st-achans-hidden-sin', 4),
  ('pl-battles', 'st-the-gibeonite-trick', 5),
  ('pl-battles', 'st-conquering-the-land', 6),
  ('pl-battles', 'st-deborah-and-jael', 7),
  ('pl-battles', 'st-gideon-vs-the-midianites', 8),
  ('pl-battles', 'st-david-goliath', 9),
  ('pl-battles', 'st-sauls-last-stand', 10),
  ('pl-battles', 'st-two-kings-two-armies', 11),
  ('pl-battles', 'st-absaloms-rebellion', 12),
  ('pl-battles', 'st-a-fathers-worst-battle', 13),
  ('pl-battles', 'st-davids-last-battles', 14),
  ('pl-battles', 'st-one-angel-one-army-destroyed', 15);

-- 7. Faith Under Pressure
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-faith', 'bible-tea', 'Faith Under Pressure', 'When everything is on the line — stories of people who trusted God when it made zero sense.', 1, 31);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-faith', 'st-abraham-isaac', 1),
  ('pl-faith', 'st-burning-bush', 2),
  ('pl-faith', 'st-deborah-and-jael', 3),
  ('pl-faith', 'st-gideon-vs-the-midianites', 4),
  ('pl-faith', 'st-daniel-lions', 5),
  ('pl-faith', 'st-esther', 6),
  ('pl-faith', 'st-elijah-on-mount-carmel', 7),
  ('pl-faith', 'st-the-centurions-faith', 8),
  ('pl-faith', 'st-peters-big-confession', 9),
  ('pl-faith', 'st-stephen-the-first-martyr', 10),
  ('pl-faith', 'st-earthquake-at-philippi', 11),
  ('pl-faith', 'st-shipwreck-and-malta', 12);

-- 8. Leadership Lessons
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-leadership', 'bible-tea', 'Leadership Lessons', 'What it takes to lead God''s people — the good, the bad, and the spectacular failures.', 1, 32);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-leadership', 'st-baby-moses', 1),
  ('pl-leadership', 'st-burning-bush', 2),
  ('pl-leadership', 'st-joshua-takes-command', 3),
  ('pl-leadership', 'st-deborah-and-jael', 4),
  ('pl-leadership', 'st-gideon-vs-the-midianites', 5),
  ('pl-leadership', 'st-david-king', 6),
  ('pl-leadership', 'st-solomon', 7),
  ('pl-leadership', 'st-the-kingdom-splits', 8),
  ('pl-leadership', 'st-josiah-finds-the-lost-book', 9),
  ('pl-leadership', 'st-picking-the-twelve', 10),
  ('pl-leadership', 'st-the-jerusalem-council', 11),
  ('pl-leadership', 'st-farewell-at-miletus', 12);

-- 9. Betrayal & Redemption
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-betrayal', 'bible-tea', 'Betrayal & Redemption', 'Backstabbing brothers, broken vows, and spectacular comebacks — the Bible''s most dramatic falls and restorations.', 1, 33);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-betrayal', 'st-cain-abel', 1),
  ('pl-betrayal', 'st-joseph-brothers', 2),
  ('pl-betrayal', 'st-joseph-forgives', 3),
  ('pl-betrayal', 'st-samson', 4),
  ('pl-betrayal', 'st-david-bathsheba', 5),
  ('pl-betrayal', 'st-absaloms-rise', 6),
  ('pl-betrayal', 'st-judas-makes-a-deal', 7),
  ('pl-betrayal', 'st-peters-three-denials', 8),
  ('pl-betrayal', 'st-prodigal-son', 9),
  ('pl-betrayal', 'st-saul-meets-jesus', 10),
  ('pl-betrayal', 'st-ananias-and-sapphira', 11);

-- 10. Christmas
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-christmas', 'bible-tea', 'The Christmas Story', 'The complete birth narrative — from Zechariah''s surprise to the flight to Egypt. The real Christmas story.', 1, 34);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-christmas', 'st-angel-visits-zechariah', 1),
  ('pl-christmas', 'st-angel-visits-mary', 2),
  ('pl-christmas', 'st-birth-of-john-the-baptist', 3),
  ('pl-christmas', 'st-birth-jesus', 4),
  ('pl-christmas', 'st-simeon-and-anna', 5),
  ('pl-christmas', 'st-the-wise-men', 6),
  ('pl-christmas', 'st-flight-to-egypt', 7),
  ('pl-christmas', 'st-boy-jesus-at-the-temple', 8);

-- 11. The Wilderness
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-wilderness', 'bible-tea', 'The Wilderness', 'Desert wandering, divine testing, and learning to trust — stories forged in the wasteland.', 1, 35);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-wilderness', 'st-bread-heaven', 1),
  ('pl-wilderness', 'st-golden-calf', 2),
  ('pl-wilderness', 'st-second-chance', 3),
  ('pl-wilderness', 'st-complaining-craving-and-chaos', 4),
  ('pl-wilderness', 'st-12-spies-and-a-40-year-detour', 5),
  ('pl-wilderness', 'st-rebellion-and-the-earth-opens', 6),
  ('pl-wilderness', 'st-snakes-water-and-the-long-road', 7),
  ('pl-wilderness', 'st-wandering', 8),
  ('pl-wilderness', 'st-40-days-in-the-desert', 9),
  ('pl-wilderness', 'st-jonah', 10);

-- 12. When You Need Hope
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-hope', 'bible-tea', 'When You Need Hope', 'For the hard days — stories of rescue, restoration, and new beginnings that remind you it''s not over.', 1, 36);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-hope', 'st-creation', 1),
  ('pl-hope', 'st-noah', 2),
  ('pl-hope', 'st-joseph-forgives', 3),
  ('pl-hope', 'st-red-sea', 4),
  ('pl-hope', 'st-ruth', 5),
  ('pl-hope', 'st-born-blind-now-sees', 6),
  ('pl-hope', 'st-lazarus-lives-again', 7),
  ('pl-hope', 'st-prodigal-son', 8),
  ('pl-hope', 'st-resurrection', 9),
  ('pl-hope', 'st-the-road-to-emmaus', 10),
  ('pl-hope', 'st-pentecost', 11),
  ('pl-hope', 'st-the-new-heaven-and-new-earth', 12);

-- 13. Joshua's Conquest
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-joshua', 'bible-tea', 'Joshua''s Conquest', 'The full campaign for the Promised Land — from crossing the Jordan to the final challenge.', 1, 37);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-joshua', 'st-joshua-takes-command', 1),
  ('pl-joshua', 'st-crossing-the-jordan', 2),
  ('pl-joshua', 'st-jericho', 3),
  ('pl-joshua', 'st-achans-hidden-sin', 4),
  ('pl-joshua', 'st-the-gibeonite-trick', 5),
  ('pl-joshua', 'st-conquering-the-land', 6),
  ('pl-joshua', 'st-caleb-claims-his-mountain', 7),
  ('pl-joshua', 'st-claim-your-inheritance', 8),
  ('pl-joshua', 'st-safe-cities-sacred-spaces', 9),
  ('pl-joshua', 'st-the-altar-that-almost-started-a-war', 10),
  ('pl-joshua', 'st-joshuas-final-challenge', 11);

-- 14. Judges: Age of Chaos
INSERT OR IGNORE INTO playlists (id, app_id, name, description, is_featured, sort_order)
VALUES ('pl-judges', 'bible-tea', 'Judges: Age of Chaos', 'Israel without a king — an escalating cycle of rebellion, oppression, and flawed heroes. It gets wild.', 1, 38);

INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES
  ('pl-judges', 'st-the-cycle-of-disobedience', 1),
  ('pl-judges', 'st-deborah-and-jael', 2),
  ('pl-judges', 'st-gideon-vs-the-midianites', 3),
  ('pl-judges', 'st-when-victory-goes-to-your-head', 4),
  ('pl-judges', 'st-the-bramble-king', 5),
  ('pl-judges', 'st-jephthahs-reckless-vow', 6),
  ('pl-judges', 'st-samson', 7),
  ('pl-judges', 'st-everyone-did-what-they-wanted', 8),
  ('pl-judges', 'st-homemade-religion', 9);
