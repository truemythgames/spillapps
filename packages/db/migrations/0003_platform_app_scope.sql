-- Spill platform: scope unscoped user IDs to the first product app_id (bible-tea).
-- New sign-ins use `${app_id}:${oauth_sub}` so the same OAuth subject can exist per app.

UPDATE user_progress SET user_id = 'bible-tea:' || user_id
WHERE user_id NOT LIKE 'bible-tea:%';

UPDATE user_likes SET user_id = 'bible-tea:' || user_id
WHERE user_id NOT LIKE 'bible-tea:%';

UPDATE user_streaks SET user_id = 'bible-tea:' || user_id
WHERE user_id NOT LIKE 'bible-tea:%';

UPDATE user_preferences SET user_id = 'bible-tea:' || user_id
WHERE user_id NOT LIKE 'bible-tea:%';

UPDATE chat_conversations SET user_id = 'bible-tea:' || user_id
WHERE user_id != 'anon' AND user_id NOT LIKE 'bible-tea:%';

UPDATE users SET id = 'bible-tea:' || id
WHERE id NOT LIKE 'bible-tea:%';
