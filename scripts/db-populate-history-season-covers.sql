-- Populate cover_image_key for every history-tea season with an iconic story cover.
-- All keys point to stories/<id>/cover.webp that already exist in R2 under the history-tea/ prefix.

UPDATE seasons SET cover_image_key = 'stories/hammurabis-code/cover.webp'            WHERE app_id = 'history-tea' AND id = 's-ht-ancient-mesopotamia';
UPDATE seasons SET cover_image_key = 'stories/building-the-pyramids/cover.webp'      WHERE app_id = 'history-tea' AND id = 's-ht-ancient-egypt';
UPDATE seasons SET cover_image_key = 'stories/alexander-the-great/cover.webp'        WHERE app_id = 'history-tea' AND id = 's-ht-ancient-greece';
UPDATE seasons SET cover_image_key = 'stories/caesar-crosses-the-rubicon/cover.webp' WHERE app_id = 'history-tea' AND id = 's-ht-roman-republic';
UPDATE seasons SET cover_image_key = 'stories/pompeii-destroyed/cover.webp'          WHERE app_id = 'history-tea' AND id = 's-ht-roman-empire';
UPDATE seasons SET cover_image_key = 'stories/hagia-sophia-rises/cover.webp'         WHERE app_id = 'history-tea' AND id = 's-ht-byzantine-empire';
UPDATE seasons SET cover_image_key = 'stories/muhammads-revelation/cover.webp'       WHERE app_id = 'history-tea' AND id = 's-ht-islamic-world';
UPDATE seasons SET cover_image_key = 'stories/joan-of-arc/cover.webp'                WHERE app_id = 'history-tea' AND id = 's-ht-medieval-europe';
UPDATE seasons SET cover_image_key = 'stories/genghis-khan-rises/cover.webp'         WHERE app_id = 'history-tea' AND id = 's-ht-medieval-asia';
UPDATE seasons SET cover_image_key = 'stories/leonardo-da-vinci/cover.webp'          WHERE app_id = 'history-tea' AND id = 's-ht-renaissance-and-reformation';
UPDATE seasons SET cover_image_key = 'stories/columbus-1492/cover.webp'              WHERE app_id = 'history-tea' AND id = 's-ht-age-of-exploration';
UPDATE seasons SET cover_image_key = 'stories/louis-xiv-versailles/cover.webp'       WHERE app_id = 'history-tea' AND id = 's-ht-17th-century';
UPDATE seasons SET cover_image_key = 'stories/storming-the-bastille/cover.webp'      WHERE app_id = 'history-tea' AND id = 's-ht-enlightenment-and-revolutions';
UPDATE seasons SET cover_image_key = 'stories/battle-of-waterloo/cover.webp'         WHERE app_id = 'history-tea' AND id = 's-ht-napoleonic-era';
UPDATE seasons SET cover_image_key = 'stories/darwin-publishes-origin/cover.webp'    WHERE app_id = 'history-tea' AND id = 's-ht-19th-century';
UPDATE seasons SET cover_image_key = 'stories/battle-of-gettysburg/cover.webp'       WHERE app_id = 'history-tea' AND id = 's-ht-american-civil-war';
UPDATE seasons SET cover_image_key = 'stories/meiji-restoration/cover.webp'          WHERE app_id = 'history-tea' AND id = 's-ht-imperialism-and-late-1800s';
UPDATE seasons SET cover_image_key = 'stories/battle-of-the-somme/cover.webp'        WHERE app_id = 'history-tea' AND id = 's-ht-world-war-i';
UPDATE seasons SET cover_image_key = 'stories/roaring-twenties/cover.webp'           WHERE app_id = 'history-tea' AND id = 's-ht-interwar-era';
UPDATE seasons SET cover_image_key = 'stories/d-day/cover.webp'                      WHERE app_id = 'history-tea' AND id = 's-ht-world-war-ii';
UPDATE seasons SET cover_image_key = 'stories/moon-landing/cover.webp'               WHERE app_id = 'history-tea' AND id = 's-ht-cold-war';
UPDATE seasons SET cover_image_key = 'stories/9-11/cover.webp'                       WHERE app_id = 'history-tea' AND id = 's-ht-modern-era';
