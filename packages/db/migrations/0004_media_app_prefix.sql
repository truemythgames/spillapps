-- Spill R2 keys: prefix existing rows with bible-tea/ for per-app object paths (shared bucket spill-media).
-- Skip rows already under bible-tea/ or any *-tea/ app prefix.

UPDATE stories SET cover_image_key = 'bible-tea/' || cover_image_key
WHERE cover_image_key IS NOT NULL
  AND TRIM(cover_image_key) != ''
  AND cover_image_key NOT LIKE 'bible-tea/%'
  AND NOT (cover_image_key GLOB '*-tea/*' OR cover_image_key GLOB '*-tea');

UPDATE seasons SET cover_image_key = 'bible-tea/' || cover_image_key
WHERE cover_image_key IS NOT NULL
  AND TRIM(cover_image_key) != ''
  AND cover_image_key NOT LIKE 'bible-tea/%'
  AND NOT (cover_image_key GLOB '*-tea/*' OR cover_image_key GLOB '*-tea');

UPDATE speakers SET avatar_key = 'bible-tea/' || avatar_key
WHERE avatar_key IS NOT NULL
  AND TRIM(avatar_key) != ''
  AND avatar_key NOT LIKE 'bible-tea/%'
  AND NOT (avatar_key GLOB '*-tea/*' OR avatar_key GLOB '*-tea');

UPDATE story_audio SET audio_key = 'bible-tea/' || audio_key
WHERE audio_key IS NOT NULL
  AND TRIM(audio_key) != ''
  AND audio_key NOT LIKE 'bible-tea/%'
  AND NOT (audio_key GLOB '*-tea/*' OR audio_key GLOB '*-tea');

UPDATE playlists SET cover_image_key = 'bible-tea/' || cover_image_key
WHERE cover_image_key IS NOT NULL
  AND TRIM(cover_image_key) != ''
  AND cover_image_key NOT LIKE 'bible-tea/%'
  AND NOT (cover_image_key GLOB '*-tea/*' OR cover_image_key GLOB '*-tea');

UPDATE characters SET cover_image_key = 'bible-tea/' || cover_image_key
WHERE cover_image_key IS NOT NULL
  AND TRIM(cover_image_key) != ''
  AND cover_image_key NOT LIKE 'bible-tea/%'
  AND NOT (cover_image_key GLOB '*-tea/*' OR cover_image_key GLOB '*-tea');
