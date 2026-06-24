PRAGMA foreign_keys = OFF;
-- Prayer data: categories, prayers, audio, links

-- Categories
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-anxiety', 'bible-tea', 'Anxiety & Worry', 'anxiety', 'When your mind won''t stop racing and peace feels impossible.', 'cloud-rain', 1);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-sleep', 'bible-tea', 'Sleep & Rest', 'sleep', 'Wind down, let go, and rest in God''s presence.', 'moon', 2);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-gratitude', 'bible-tea', 'Gratitude & Praise', 'gratitude', 'Shift your focus from what''s wrong to what''s good.', 'sun', 3);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-healing', 'bible-tea', 'Healing & Sickness', 'healing', 'When your body or heart needs God''s healing touch.', 'heart-pulse', 4);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-strength', 'bible-tea', 'Strength & Courage', 'strength', 'When you need backbone for what''s ahead.', 'shield', 5);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-forgiveness', 'bible-tea', 'Forgiveness', 'forgiveness', 'Letting go of what was done to you — or what you''ve done.', 'hand-heart', 6);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-family', 'bible-tea', 'Family & Relationships', 'family', 'Praying over the people you love most.', 'users', 7);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-finances', 'bible-tea', 'Financial Stress', 'finances', 'When money is tight and worry is loud.', 'wallet', 8);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-morning', 'bible-tea', 'Morning Prayers', 'morning', 'Start your day anchored before the noise begins.', 'sunrise', 9);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-evening', 'bible-tea', 'Evening Prayers', 'evening', 'Close the day well. Release, reflect, rest.', 'sunset', 10);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-grief', 'bible-tea', 'Grief & Loss', 'grief', 'When you''ve lost something or someone and the ache won''t fade.', 'cloud', 11);
INSERT OR IGNORE INTO prayer_categories (id, app_id, name, slug, description, icon, sort_order) VALUES ('cat-decisions', 'bible-tea', 'Decisions & Direction', 'decisions', 'When you don''t know which way to go.', 'compass', 12);

-- Prayers
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-anxious-thoughts', 'bible-tea', 'cat-anxiety', 'When Anxious Thoughts Won''t Stop', 'anxious-thoughts', 'A prayer for when your mind spirals and you can''t find the off switch.', '# When Anxious Thoughts Won''t Stop

Take a deep breath and let the air fill your lungs. Feel the ground beneath your feet, anchoring you in this moment. You’re here, and it’s okay to feel what you’re feeling.

God, we’re coming to You with hearts that are heavy and minds that are racing. Sometimes, it feels like we’re caught in a storm of thoughts, and it’s hard to find our footing. We need Your peace, Lord, the kind that calms the winds and stills the waters.

In this moment, help us to remember Your promise: “Cast all your anxiety on Him because He cares for you.” We’re trying, God. We’re handing over our worries, our fears, our doubts. They’re all Yours now. 

Help us to trust that You’ve got us, even when we can’t see the way forward. Bring quiet to our minds and rest to our souls. Let us feel Your presence, like a warm blanket on a cold night, wrapping us in Your love and reassurance.

As we move through this day, remind us that we’re never alone. You’re with us in every anxious moment and every deep breath we take. Thank You for being our refuge and strength.

In Your peace, we find our calm. In Your love, we find our courage. Amen.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-overwhelmed', 'bible-tea', 'cat-anxiety', 'When You''re Completely Overwhelmed', 'overwhelmed', 'Everything is too much. This prayer helps you breathe and hand it over.', '# When You''re Completely Overwhelmed

Take a slow, deep breath. Let it fill your lungs and release it gently. Right now, everything feels like it''s pressing down on you, and it''s hard to see a way through. You''re not alone in this. Let''s bring it to God together.

God, here we are, feeling overwhelmed and scattered. It''s like the worries have piled up so high, and we''re not sure how to even begin sorting through them. But we know You are with us, even in this storm. You tell us in Philippians 4:6, "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." So here we are, God, laying it all before You. 

Help us to breathe through this, to find a moment of peace in Your presence. We ask for clarity to see what truly matters and the courage to let go of what we can''t control. Wrap us in Your comfort, remind us of Your faithfulness, and help us trust that You are working all things for good.

Thank You for being our anchor, our peace. We believe that even when we''re overwhelmed, You hold us steady. In this moment, let Your calm fill our hearts. We are grateful that we never face anything alone. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-fear-of-future', 'bible-tea', 'cat-anxiety', 'Fear of the Future', 'fear-of-future', 'When tomorrow terrifies you. A prayer to trust the One who holds it.', '# Fear of the Future

Take a moment to breathe deeply, allowing the present to wrap around you like a comforting blanket. As you exhale, let go of the tension that knots your stomach when you think about tomorrow.

Let''s pray. Dear God, here we are, standing on the edge of the unknown. The future feels like a wild ocean, vast and unpredictable. We can''t help but worry about what''s to come. But right now, we choose to rest in the promise that You are the one who holds our tomorrows. 

Lord, in the midst of our anxiety, remind us of Your words: "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future" (Jeremiah 29:11). You’ve mapped out our path with love and care, even when we cannot see it.

Help us release our grip on what we cannot control. Teach us to trust that You are walking alongside us, holding our hand through every twist and turn. Anchor us in Your peace, which transcends all understanding.

May we step forward with courage, knowing that today is enough for us to handle, and that You will meet us in tomorrow with open arms. Amen. 

Remember, God is already there, waiting to bless you with His peace and assurance.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-peace-in-chaos', 'bible-tea', 'cat-anxiety', 'Peace in the Chaos', 'peace-in-chaos', 'The storm is raging but Jesus is in the boat. A prayer for supernatural calm.', '# Peace in the Chaos

Take a deep breath and feel the ground beneath you. The storm might be raging around you, but right now, in this moment, you''re safe. Let’s reach out to God together.

God, sometimes it feels like the waves are too high, and the wind too strong. Our hearts race with the chaos of our thoughts, and peace seems so far away. But we remember, Lord, that You are with us in this boat. Just as Jesus calmed the storm with a word, we ask You now to speak peace over our hearts. 

You tell us in Philippians 4:6-7 not to be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, to present our requests to You. So here we are, Lord, laying it all before You. Help us to trust in Your presence and power, even when everything else feels out of control.

Guide us to the still waters of Your peace. Let Your calm wash over us, quieting our minds and soothing our spirits. Remind us that You’ve got this, and You’ve got us.

Thank you for being our refuge and strength. May Your peace, which surpasses all understanding, guard our hearts and minds in Christ Jesus. Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-letting-go-of-control', 'bible-tea', 'cat-anxiety', 'Letting Go of Control', 'letting-go-of-control', 'You can''t hold it all together. A prayer to release your grip and trust God''s plan.', '# Letting Go of Control

Take a deep breath and find a moment of stillness. You’ve been carrying so much. The weight of trying to hold everything together is heavy, isn’t it? Let’s take this time to open our hearts to God.

Dear God, we come to You with open hands, acknowledging how tightly we’ve been gripping onto control. We’re so often consumed by our own plans and what-ifs. You remind us in Proverbs 3:5 to "Trust in the Lord with all your heart and lean not on your own understanding." Yet, we confess, trusting isn’t always easy.

Help us to release the illusion that we must manage it all. Guide us to trust that Your wisdom far exceeds our own. In this moment, we surrender our fears and anxieties to You. We ask for Your peace to replace our worry, for Your love to fill those spaces where fear has taken root.

Lord, teach us to embrace the unknown with faith, knowing that You hold our tomorrows. Let us find rest in the truth that You are always working for our good, even when we can’t see it.

Thank You for being our refuge and strength. As we go forward, remind us that we are never alone and that Your plans for us are full of hope. Amen.

You are in the hands of a loving God who promises peace beyond understanding. Let that truth anchor you today.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-cant-sleep', 'bible-tea', 'cat-sleep', 'When You Can''t Sleep', 'cant-sleep', 'Your body is tired but your mind won''t quit. Let this prayer carry you to rest.', '# When You Can''t Sleep

As you lie in bed, the room is quiet, yet your mind chatters on. You find yourself restless, longing for the sweet release of sleep. Let''s take a deep breath together and turn this moment into a gentle conversation with God.

Dear God, here we are, in the stillness of the night. My mind is buzzing, and sleep feels just out of reach. I bring to you all my thoughts and worries, laying them down like stones at your feet. Help me to release them, one by one, into your capable hands. You tell us in Psalm 4:8, "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." Let these words be my lullaby tonight.

As I breathe in your peace and breathe out my stress, wrap me in your calming presence. I ask for your protection over my heart and mind, that they may find rest in you. Let the rhythm of my breath mirror the rhythm of your love, steady and sure.

Thank you, God, for the gift of rest, for being my sanctuary in the night. I trust you to watch over me, renewing my spirit as I drift into sleep. Amen.

And now, may you feel cradled by God''s peace, allowing His love to gently carry you to rest.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-nighttime-peace', 'bible-tea', 'cat-sleep', 'Nighttime Peace', 'nighttime-peace', 'A gentle prayer to close the day, release the weight, and sleep in God''s arms.', '# Nighttime Peace

As you settle into bed, feel the weight of the day gently lift off your shoulders. The world outside quiets down, inviting you into a space of calm and rest. 

Let''s pray together. 

Heavenly Father, here we are at the end of another day. We bring to You all of our worries and the thoughts that linger in our minds. We ask for Your peace to fill this room and our hearts. You tell us in Psalm 4:8, "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." Let this promise soak into our being, reminding us that we are safe in Your care.

Lord, help us to release the events of today—the triumphs and the trials. We offer them up to You, trusting that You hold all things in Your hands. Quiet our restless thoughts, and replace them with the assurance of Your presence. 

May Your love be the gentle lullaby that sings us into restful sleep. We breathe in Your peace and exhale our worries, knowing that tomorrow is Yours as well.

Thank you for being the God who never slumbers. As we drift into dreams, may we feel wrapped in Your everlasting arms. Amen.

Sleep well, beloved child of God.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-rest-for-weary', 'bible-tea', 'cat-sleep', 'Rest for the Weary', 'rest-for-weary', 'Come to me, all who are weary. A prayer for the bone-tired and burnt out.', '# Rest for the Weary

As you settle into the quiet of the evening, take a moment to feel the comfort of your surroundings. Let the day slip away and allow yourself to sink into this moment of peace.

God, you know how tired I am, how the weight of the day has settled into my bones. I come to you now, seeking rest and renewal. You have promised, "Come to me, all who are weary and burdened, and I will give you rest." I hold on to that promise tonight. 

Help me to release the worries that keep my mind spinning. Let the concerns of tomorrow fade away, knowing that you hold them in your hands. I ask for your peace to blanket me, for your presence to fill this room. Remind me that your love and grace are enough, even when I feel depleted.

As sleep gently takes hold, may I find refuge in you. Restore my weary spirit and renew my strength, so I can face a new day with hope and courage. Thank you for being my safe place, my constant in the chaos.

Amen. Take comfort in knowing that God is with you, offering rest and renewal. Sleep well, beloved.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-trusting-through-night', 'bible-tea', 'cat-sleep', 'Trusting God Through the Night', 'trusting-through-night', 'Darkness feels heavy. But morning is coming. A prayer for faith in the dark hours.', '# Trusting God Through the Night

As you settle into bed tonight, you may feel the weight of the day lingering. The darkness might seem overwhelming, but remember, you''re not alone. Let''s take a moment to bring your heart to God.

Dear God, in these quiet moments, I ask for your peace to cover me like a warm blanket. The night feels long, and sometimes my mind races with thoughts and worries. I lay them at your feet, trusting you to hold them while I rest. Help me to remember that even when it''s dark, you are my light. Psalm 4:8 gently reminds us, "In peace, I will lie down and sleep, for you alone, Lord, make me dwell in safety." Let these words sink into your spirit, wrapping you in the assurance that God watches over you.

Guide my dreams, Lord, and renew my strength for the new day. Let the stillness of the night be a time of healing and restoration. I release my fears and anxieties to you, knowing that your love casts out all fear. Thank you for being my refuge, my safe place.

As you close your eyes, breathe deeply, and trust that God is with you, holding the promise of morning in his hands. Rest well, dear friend, for you are cradled in His everlasting arms.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-surrender-before-sleep', 'bible-tea', 'cat-sleep', 'Surrender Before Sleep', 'surrender-before-sleep', 'Hand over the day — the wins, the failures, the unknowns. Sleep free.', '# Surrender Before Sleep

As the day gently bows out and night wraps around you, let’s take a moment together to breathe and release. Feel the weight of the day slip off your shoulders, and invite a sense of calm to settle in.

Dear God, as we stand on the edge of sleep, we come to you with open hearts. Today might have been filled with victories, struggles, or simply the ordinary. Whatever it held, we hand it over to you now. We trust that you’ve been with us in every moment. Help us to let go of any worries or lingering thoughts that try to cling on. In Psalm 4:8, it says, "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." Let this be the truth we rest in tonight.

Guide us into your peace, a peace that transcends our understanding. Envelop us in your love, so that as we close our eyes, we can find true rest in you. Restore our spirits and renew our strength for the morning to come.

Thank you, God, for being our refuge and our place of comfort. As we drift into sleep, may we feel your presence near, like a gentle whisper assuring us, “I am with you.”

May your rest be deep and your heart be light. Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-thankful-heart', 'bible-tea', 'cat-gratitude', 'A Thankful Heart', 'thankful-heart', 'A prayer to notice the good, even in hard seasons. Gratitude changes everything.', '# A Thankful Heart

Take a moment to settle in. Let your shoulders relax, and breathe deeply. Sometimes, in the hustle of life, we forget to pause and notice the good. Let’s take this moment to open our hearts to gratitude.

God, we come to You with thankful hearts. Even in seasons that feel overwhelming, we know there are blessings to be found. Help us to see Your goodness in the small things — the warmth of the sun on our face, the laughter of a friend, or even the quiet moments of peace. 

We’re reminded of Your word in 1 Thessalonians 5:18, "Give thanks in all circumstances; for this is God’s will for you in Christ Jesus." May this be the lens through which we view our days, finding reasons to give thanks, even when it''s hard. 

Guide us to remember that gratitude is a choice, one that can transform our perspective. Thank You for the people who come into our lives and the opportunities we have to grow. 

As we move through today, let us carry this spirit of thankfulness with us. May our hearts remain open to Your love and the countless ways You bless us. 

In this moment, we are grateful. Amen.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-praise-in-storm', 'bible-tea', 'cat-gratitude', 'Praise in the Storm', 'praise-in-storm', 'Everything is falling apart but you choose worship anyway. A prayer of defiant praise.', '# Praise in the Storm

Take a deep breath. Even if the world feels heavy, you are here, right now, choosing to seek His presence. 

Father, we come to You, hearts full of gratitude even as the storm rages around us. It''s not easy, but we choose to fix our eyes on You, the One who calms the seas. We thank You for being our steadfast anchor when everything else feels uncertain. In the midst of our chaos, we lift up a song of praise.

Lord, we remember Your promise in Isaiah 41:10, "Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." Let this truth seep into our hearts, reminding us that we are never alone. 

Help us to see the glimpses of Your goodness even here, even now. The small joys, the unexpected kindnesses, the quiet moments where You whisper peace to our souls. We praise You not because of our circumstances, but because You are worthy of all our praise. 

As we continue this journey, let our hearts sing louder than the storm. Thank You, God, for Your unwavering presence and love. 

In this moment, we choose worship. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-morning-gratitude', 'bible-tea', 'cat-gratitude', 'Morning Gratitude', 'morning-gratitude', 'Start the day with eyes wide open to God''s goodness. A prayer for fresh mornings.', '# Morning Gratitude

As the morning light gently nudges you awake, take a moment to just breathe. Feel the coolness of the air, the promise of a new day. Let’s lean into this moment of gratitude together.

God, here we are at the start of a fresh day. Thank you for this sunrise, for the beauty in the simplicity of morning. We come to You with hearts full of gratitude. Thank you for the breath in our lungs, for the chance to begin anew.

Your word says in Lamentations 3:22-23, "The steadfast love of the Lord never ceases; His mercies never come to an end; they are new every morning; great is Your faithfulness." We hold onto that promise today, Lord. Let us see Your mercies in the small things, like a warm cup of tea or the song of a bird. Help us to recognize Your presence in the ordinary.

Guide us to walk through this day with eyes wide open to Your goodness. May we be vessels of Your love and kindness to everyone we meet. Thank you for being with us, for the assurance that Your love surrounds us every step of the way.

As we step into today, let us carry this gratitude in our hearts. Amen.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-counting-blessings', 'bible-tea', 'cat-gratitude', 'Counting Blessings', 'counting-blessings', 'When you forget how good God has been. A prayer to remember and give thanks.', '# Counting Blessings

Take a deep breath and let your shoulders relax. Picture yourself surrounded by the warmth of a gentle sunrise, reminding you of new beginnings and fresh mercies.

God, we come to you with grateful hearts, wanting to pause and remember the countless ways you have been good to us. Sometimes life moves so fast, and we forget to notice the blessings you''ve woven into our everyday. Help us see them clearly now. From the small joys like a warm cup of tea on a chilly morning, to the deeper gifts of love and friendship, we are thankful.

Lord, your words remind us in James 1:17 that "every good and perfect gift is from above, coming down from the Father of the heavenly lights." Help us to hold onto this truth, especially when life feels overwhelming. May we always find you in the details, knowing that each blessing is a reflection of your love and faithfulness.

Guide our hearts to recognize and cherish these gifts, nurturing a spirit of praise and gratitude within us. Let this thankfulness shape our actions and our words, so we can spread your love to others.

In every moment, may we be reminded of your goodness. Thank you, God, for being the source of all blessings. Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-joy-in-small-things', 'bible-tea', 'cat-gratitude', 'Joy in Small Things', 'joy-in-small-things', 'Big miracles are rare. Small mercies are daily. A prayer to see them.', '# Joy in Small Things

Hey there. Take a moment to pause and breathe deeply. Feel the air fill your lungs and let gratitude gently rise within you, like the warmth of the sun on a cool morning.

God, today we come to you with open hearts, eager to recognize the small wonders around us. Sometimes, life feels like a whirlwind and we overlook the tiny gifts you place in our path. Help us to slow down and notice the beauty in the everyday — the laughter of a friend, the rustling leaves, or the aroma of fresh coffee.

We are reminded of your words in James 1:17, "Every good and perfect gift is from above, coming down from the Father of the heavenly lights." Today, we acknowledge these gifts, both big and small, as a reflection of your love and care.

Guide us to find joy in these moments and to carry that joy with us, sharing it with others. Let us be mindful of the blessings that are often overshadowed by the chaos of daily life. We thank you for your unending grace and for the simple pleasures that make our days brighter.

May our hearts remain open and grateful, always attuned to your presence in the small things. Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-physical-healing', 'bible-tea', 'cat-healing', 'Prayer for Physical Healing', 'physical-healing', 'Your body is broken. Bring it to the Healer. A prayer for restoration.', '# Prayer for Physical Healing

Take a deep breath and gently close your eyes. You might be feeling weary or burdened by the weight of your body''s pain. Let''s bring that to God, who knows every part of you intimately.

God, we come to You today with a humble heart, seeking Your healing touch. You know the struggles we''re facing, the discomfort, and the fear that sometimes creeps in. We ask You to hold us in Your comforting embrace. You are the Healer, Lord, and we trust in Your power to restore. Like the psalmist said, "He heals the brokenhearted and binds up their wounds" (Psalm 147:3). We believe this promise for our bodies, too.

Help us to find moments of peace amid the chaos. Grant us patience, Lord, as we await Your healing. Let us lean on the strength that comes from knowing You are with us every step of the way. Encourage our hearts and renew our spirits, knowing that Your love is more profound than any pain we feel.

Thank You for being our refuge and strength, an ever-present help in times of trouble. We rest in the assurance that You are working all things together for our good.

Amen.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-emotional-healing', 'bible-tea', 'cat-healing', 'Prayer for Emotional Healing', 'emotional-healing', 'The wound isn''t visible but it''s real. A prayer for the scars inside.', '# Prayer for Emotional Healing

Take a deep breath. Let the stillness settle around you like a comforting blanket. You''re in a safe space to bring the hidden pieces of your heart to God.

God, we''re here with heavy hearts, carrying wounds that aren''t visible but deeply felt. We come to You, knowing that You see every tear, every moment of despair. You know the scars that life has etched into our souls. We''re seeking Your healing touch today.

Please, Lord, enter the places where hurt lingers. Help us release the burdens we''ve carried for too long. Your Word reminds us in Psalm 147:3 that You "heal the brokenhearted and bind up their wounds." We cling to this promise, trusting that Your love can mend what feels shattered.

Guide us to forgive where we need to, both others and ourselves. Fill us with Your peace, the kind that surpasses all understanding. Show us the beauty of grace, and help us to extend it, even when it''s hard. 

We ask for courage to face each day with renewed strength, knowing that we''re not alone in this journey. Thank You for being our constant source of comfort and hope.

In every moment, remind us that healing is possible. We are held, we are loved, and You are with us. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-healing-for-loved-one', 'bible-tea', 'cat-healing', 'Healing for a Loved One', 'healing-for-loved-one', 'Someone you love is suffering and you feel helpless. Pray anyway.', '# Healing for a Loved One

Take a moment to breathe, letting your heart settle. You might feel a heaviness right now, holding the concern for someone you love who is unwell.

God, we come to you with open hearts, feeling the weight of watching someone we care about suffer. It’s not easy to stand by, wanting to help but feeling helpless. You understand our struggles and our hopes. We ask for your comforting presence to surround our loved one. Please bring them relief in their pain, strength in their weakness, and peace amidst their fears. 

You remind us in Psalm 147:3 that you "heal the brokenhearted and bind up their wounds." We hold onto this promise, trusting that you are at work even when we cannot see it. Help us to be a source of comfort and encouragement, to trust in your timing and your plan.

Guide the hands of those providing care and give them wisdom. Let our faith be a light in the dark moments, and our prayers a bridge connecting us to you. 

We thank you, Lord, for your love that never fails, and we trust in your healing power. Amen.

Remember, you are not alone in this, and your prayers hold power.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-chronic-pain', 'bible-tea', 'cat-healing', 'When Healing Doesn''t Come', 'chronic-pain', 'You''ve prayed. Nothing changed. A prayer for endurance when God feels silent.', '# When Healing Doesn''t Come

Find a quiet space for a moment, where you can let the weight of your heart settle. You’ve prayed and hoped, yet nothing seems to change. It’s okay to feel weary.

God, we come to you today with hearts heavy with longing. We have been waiting, watching, hoping for healing that hasn''t yet arrived. In this space of silence, help us to feel your presence close. You know our struggles, our doubts, and our fears. We ask for your strength to endure this season of waiting. Your word reminds us in Isaiah 40:31 that "those who wait upon the Lord shall renew their strength." We cling to this promise now, trusting that you are with us even when the path feels uncertain. 

Help us to find small moments of grace and peace amidst the pain. Open our eyes to the love around us, and let it be a balm to our weary souls. May we hold onto hope, knowing that your timing is perfect, even when it doesn''t align with ours. 

We ask for your comfort, your peace, and your unwavering love to fill the spaces where fear tries to creep in. Thank you for being our refuge, our ever-present help. We trust that you are working in ways we cannot see. Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-mental-health', 'bible-tea', 'cat-healing', 'A Prayer for Your Mental Health', 'mental-health', 'Depression, anxiety, numbness. God sees you in the pit. A prayer from the depths.', '# A Prayer for Your Mental Health

Take a deep breath and let yourself settle into this moment. You might feel like you''re in a valley, where shadows seem longer and the path is unclear. But even here, you are not alone.

Dear God, we come to You with heavy hearts and weary minds. You know the deep places of our thoughts and the burdens we carry. We ask for Your gentle presence to surround us now. Calm our racing thoughts, Lord, and fill us with Your peace that surpasses all understanding. Help us to remember that even in our darkest moments, Your light is never too far away.

God, we ask for healing in our minds and spirits. Remind us that we are fearfully and wonderfully made, as You tell us in Psalm 139. Even when we feel broken, we are whole in Your eyes. Give us the courage to seek help when we need it and the wisdom to rest when our souls are weary.

Thank You for the promise that nothing can separate us from Your love. As we walk this path toward healing, let us feel Your steady hand guiding us. Amen.

Remember, you are beloved and never beyond the reach of hope. God walks with you, one step at a time.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-courage-to-act', 'bible-tea', 'cat-strength', 'Courage to Act', 'courage-to-act', 'You know what to do but fear holds you back. A prayer for holy boldness.', '# Courage to Act

Take a deep breath and settle into this moment. Picture the challenge in front of you that requires more than just strength—it calls for courage. 

Dear God, here we are, standing on the edge of something new. It''s scary, and we feel the weight of fear holding us back. We''re reminded of Joshua, to whom You said, "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." We need that assurance right now, that You are with us, even when our confidence wavers.

Help us to see the steps we need to take, and give us the boldness to take them. The unknown is daunting, but we trust that You''re already there, preparing the way. Let Your presence be our courage, guiding us like a light through the fog of doubt. 

As we move forward, fill our hearts with Your peace. Let us act not from fear, but from faith in Your promises. May we find strength in knowing that we don''t walk this path alone. 

Thank you for being our constant support and for reminding us that true courage comes from trusting in You. Amen.

Remember, as you step out in faith, "The Lord is my light and my salvation—whom shall I fear?" Keep this close to your heart today.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-facing-giants', 'bible-tea', 'cat-strength', 'Facing Your Giants', 'facing-giants', 'The problem is bigger than you. Good — that means God gets the glory.', '# Facing Your Giants

Take a deep breath and settle into this moment. Feel the weight of the challenges you''re facing, but also the strength that stirs within you, waiting to rise.

God, we come to you acknowledging the giants in our lives. They''re big, and sometimes, they seem to tower over us. But we''re reminded, Lord, that these challenges give us a chance to see Your power and glory at work. Just as David stood before Goliath with nothing but faith and a sling, help us to stand firm in the strength You provide. You tell us in 2 Timothy 1:7 that You have not given us a spirit of fear, but of power, love, and a sound mind. Let that truth sink deep into our hearts today.

When we feel small, remind us that Your power is made perfect in our weakness. When doubt creeps in, help us to fix our eyes on You, trusting that You go before us and fight our battles. Give us courage to step out, knowing that with You, we are never alone. Strengthen our spirit, Lord, and fill us with the bravery to face whatever comes our way.

Thank you for being our fortress and shield. With You, we are more than conquerors. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-standing-alone', 'bible-tea', 'cat-strength', 'Standing Alone', 'standing-alone', 'Everyone else caved. You''re the only one left standing. A prayer for the outnumbered.', '# Standing Alone

Take a deep breath. Imagine you’re standing in a vast open field, the wind softly brushing against your face. Though you’re alone, there’s a quiet strength that anchors you. 

God, right now, it feels like I’m standing on shaky ground. Everyone else has caved, and here I am, wondering if I have the strength to keep standing. But I remember your promise: “Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.” Those words from Joshua remind me that I’m never truly alone. 

Help me, Father, to feel your presence in this moment, to trust that you’re right beside me. Give me the courage to stand firm in my convictions, even when it feels like I’m the only one. Let your strength fill the spaces where mine falls short. Remind me that being outnumbered doesn’t mean being outmatched when you are on my side.

Thank you for being my rock, my fortress, and my deliverer. May I walk in your strength today, knowing that with you, I have everything I need. 

Amen. Remember, wherever you stand, God is standing with you.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-endurance', 'bible-tea', 'cat-strength', 'Prayer for Endurance', 'endurance', 'The race is long and your legs are heavy. A prayer to keep going.', '# Prayer for Endurance

Take a deep breath, feel the air fill your lungs. Picture yourself on a long journey, with the road stretching out before you. Maybe you''re feeling weary, but you are not alone. 

Let''s pause and turn our hearts to God. Dear Father, sometimes the path feels endless, and our legs grow tired. We ask for Your strength to keep us moving forward. You remind us in Isaiah 40:31 that those who hope in You will renew their strength; they will soar on wings like eagles, run and not grow weary, walk and not be faint. We cling to this promise. 

Help us to find courage in the small steps, knowing that each one brings us closer to where we''re meant to be. When doubt whispers in our ears, let Your voice be louder, reassuring us that You are with us every step of the way. 

Guide us to find moments of rest and renewal, to pause and remember that our strength doesn''t come from our own efforts, but from Your boundless love and power. 

Thank You for walking beside us, for lifting us when we stumble, and for being our constant source of endurance. We trust in Your unfailing support. 

Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-armor-up', 'bible-tea', 'cat-strength', 'Armor Up', 'armor-up', 'Put on the full armor of God. A prayer before you step into battle.', '# Armor Up

As you find a quiet moment, feel your feet firmly on the ground and take a deep breath. You''re about to step into the challenges and opportunities of the day, and it’s normal to feel a bit uncertain. Let''s take a moment to gather strength and courage together.

God, we come before you seeking your presence. Sometimes the world feels overwhelming, and we need your strength. Help us to remember that we don’t face our battles alone. You’ve given us what we need to stand strong. As it says in Ephesians 6:10, "Finally, be strong in the Lord and in his mighty power." We ask for your power to fill us right now. 

Guide us to put on the full armor of God, to shield us from doubt and fear. Let truth be our belt, righteousness our breastplate, and peace in our steps. May faith be our shield, salvation our helmet, and your Word the sword we carry. With you, we can face what lies ahead.

Thank you, God, for being our fortress and our refuge. We trust in your strength as we move forward. Remind us that with you, we are never truly alone, and your courage is our ally.

Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-forgiving-others', 'bible-tea', 'cat-forgiveness', 'Forgiving Someone Who Hurt You', 'forgiving-others', 'They don''t deserve it. Neither did you. A prayer to release the bitterness.', '# Forgiving Someone Who Hurt You

Take a deep breath, and feel the weight of that hurt. It’s heavy, isn’t it? Let’s bring it to God together, and see what unfolds.

God, we’re here, holding a pain that feels too big. We admit that forgiveness feels unreachable right now. But we remember Your words, “Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you” (Ephesians 4:32). We want to step closer to that grace You offer.

Help us to see this person through Your eyes, not ours. It’s hard, but we know that harboring bitterness only hurts us more. We release this burden to You, knowing that You’re big enough to handle it. Please soften our hearts, and guide us to let go, even when it feels impossible.

Thank You for the times You’ve forgiven us, when we didn’t deserve it. Remind us that forgiveness doesn’t mean forgetting or excusing, but freeing ourselves from the chains of anger. We trust that You’re working in this situation, even when we can’t see it.

As we move forward, give us peace in knowing that we’re not alone. You’re with us every step, helping us to heal. Amen.

Now, let’s take a moment to breathe in God’s peace, and breathe out any lingering resentment. You’re on a path to freedom, and God is walking with you.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-asking-forgiveness', 'bible-tea', 'cat-forgiveness', 'Asking God for Forgiveness', 'asking-forgiveness', 'You blew it. Badly. But God''s mercy is bigger than your mess.', '# Asking God for Forgiveness

Take a deep breath, and imagine God right beside you, listening with a heart full of love. Even when you''ve messed up, God''s mercy is waiting, bigger than any mistake.

God, here we are, feeling the weight of our own actions. We know we''ve stumbled, and it feels heavy, like a cloud shadowing our spirit. But we come to You, believing in Your endless grace. You see our hearts more clearly than we do, and still, You invite us closer.

Lord, we ask for Your forgiveness. Help us to let go of the guilt that clings so tightly. We remember Your words in 1 John 1:9, “If we confess our sins, You are faithful and just to forgive us and to cleanse us from all unrighteousness.” And so, we confess, trusting in Your promise to restore us.

Guide us to forgive ourselves too, Lord. Sometimes that''s the hardest part. Teach us to walk forward, not stuck in what we cannot change, but renewed by Your love. Let our hearts be softened, ready to forgive others as You continually forgive us.

Thank You, God, for this moment of grace. May we carry Your peace with us, knowing we are always welcome in Your presence. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-forgiving-yourself', 'bible-tea', 'cat-forgiveness', 'Forgiving Yourself', 'forgiving-yourself', 'God forgave you. Why can''t you? A prayer to stop carrying what''s already paid for.', '# Forgiving Yourself

Take a deep breath and let it out slowly. Feel the weight of your shoulders release, even just a little. You''re here now, in this moment, ready to let go.

God, sometimes we hold onto mistakes like they''re treasures, reliving them over and over. We beat ourselves up for things You’ve already forgiven. Your word reminds us in 1 John 1:9 that if we confess our sins, You are faithful and just to forgive us and cleanse us from all unrighteousness. Help us to believe that, to truly feel the freedom You offer.

Guide us to let go of the guilt and shame we cling to, to see ourselves as You see us—washed clean and made new. Help us to forgive ourselves, knowing that Your grace is enough. We ask for the courage to release the past and step into the future with hope. Teach us to love ourselves with the same compassion You have shown us.

In this quiet moment, we choose to lay down the burdens we were never meant to carry. We trust in Your promise of a fresh start. Thank you for Your unending love and mercy.

May we walk in the peace that forgiveness brings, one step at a time. Amen.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-broken-relationship', 'bible-tea', 'cat-forgiveness', 'A Broken Relationship', 'broken-relationship', 'The bridge burned. Can it be rebuilt? A prayer for what feels beyond repair.', '# A Broken Relationship

Take a deep breath and feel the weight of the hurt and the hope that things could be different. It''s okay to feel both at once. Let''s talk to God about it.

God, here we are with this relationship that feels shattered. The bridge feels burned, and the path to rebuilding seems so unclear. We bring this to You, knowing that You are the restorer of what feels beyond repair. You know the ache of broken connections, and You promise that nothing is impossible with You.

Help us to forgive, even when it feels too hard. Give us the courage to take the first step, even if it''s just in our hearts. We remember Your words in Ephesians 4:32, urging us to "be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you." Let this be our guiding light as we navigate the pain and the possibility of healing.

Lord, we ask for Your wisdom and patience. Teach us to listen deeply and speak with love. May our hearts be softened and our minds opened to the work You are doing in both of us. We trust in Your timing and Your grace.

Thank You for being with us in the messiness of life. We hold onto hope, knowing that with You, restoration is always possible. Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-letting-go-anger', 'bible-tea', 'cat-forgiveness', 'Letting Go of Anger', 'letting-go-anger', 'The rage feels justified. But it''s eating you alive. A prayer to release it.', '# Letting Go of Anger

Take a deep breath and close your eyes for a moment. Feel the weight of the anger you’re holding onto. It’s heavy, isn’t it? It’s okay to acknowledge that. 

Now, let''s bring this to God. Dear God, we come to You with hearts burdened by anger. Sometimes, it feels like holding onto this anger is the only way to protect ourselves. But we know it’s not serving us well. Help us to release it into Your hands. Remind us that forgiveness is not about letting someone off the hook; it''s about freeing ourselves from the chains of resentment. 

Lord, You say in Ephesians 4:31-32, "Get rid of all bitterness, rage and anger... Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you." Help us to live this out, to let go of bitterness and embrace kindness, even when it''s hard. 

We ask for Your strength to forgive, not by our own might, but through Your grace. Help us to see the person who hurt us through Your eyes, with empathy and understanding. We trust You to heal the wounds that anger has left behind. 

In this moment, we choose to let go. We choose peace. Thank You for being our safe place, always ready to catch us when we fall. Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-marriage', 'bible-tea', 'cat-family', 'Prayer for Your Marriage', 'marriage', 'Love is a daily choice. A prayer for patience, grace, and staying committed.', '# Prayer for Your Marriage

Take a deep breath and settle into this moment. Picture you and your spouse, hand in hand, standing together through life’s ups and downs. Feel the love that brought you together, and the commitment that keeps you moving forward.

God, we come to You with our hearts open, seeking Your guidance and strength for our marriage. Help us to remember that love is a daily choice, one that requires patience and grace. When we face misunderstandings or disagreements, remind us to approach each other with compassion and a willingness to listen.

Lord, give us the wisdom to support each other’s dreams and the courage to forgive when we fall short. May we embrace the beautiful messiness of love, knowing that, as Ecclesiastes 4:12 says, "A cord of three strands is not easily broken." You are the third strand in our relationship, binding us together with Your steadfast love.

Help us to cherish the little moments of joy and laughter, and to lean on each other in times of sorrow and challenge. Let our marriage be a testament to Your love and faithfulness, a source of strength and joy for us and those around us.

Thank you, God, for this partnership. We trust that with You, our love will continue to grow and flourish. Amen.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-children', 'bible-tea', 'cat-family', 'Prayer for Your Children', 'children', 'You can''t protect them from everything. But you can cover them in prayer.', '# Prayer for Your Children

As you settle into this moment, take a deep breath. Feel the warmth of love that surrounds your family, even in times of worry or uncertainty. Think of your children, their laughter, their dreams, and their challenges.

God, we come to You with hearts full of love for our children. We know that we can''t shield them from all of life''s trials, but we trust in Your unending care. Help us remember, as it says in Proverbs 22:6, to "train up a child in the way he should go; even when he is old, he will not depart from it." Guide us in nurturing their hearts and minds so they may walk in paths of wisdom and grace.

We ask for Your protection over them, Lord. Surround them with Your angels and keep them safe from harm. Grant us patience and understanding as we navigate the complex journey of parenthood. May we be a source of strength and comfort for them, reflecting Your love in our actions and words.

Lord, we entrust our children to You, knowing that Your plans for them are full of hope and promise. Thank you for the privilege of being their parent. We place their future in Your hands, trusting in Your perfect wisdom and boundless love.

Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-parents', 'bible-tea', 'cat-family', 'Honoring Your Parents', 'parents', 'They''re not perfect. Neither are you. A prayer for gratitude and grace.', '# Honoring Your Parents

Take a moment to find a comfortable space where you can breathe deeply and let your thoughts settle. Picture your parents—imperfect, human, just like you. Feel the gratitude and grace that we can extend to them today.

Dear God, we come to You with hearts that seek understanding and compassion. You know our parents better than anyone, with all their strengths and weaknesses. Help us to see them through Your eyes, to recognize the love they''ve given, and to understand the challenges they have faced. 

Guide us to honor them, as You have called us to do. In Exodus 20:12, You remind us, "Honor your father and your mother, so that you may live long in the land the Lord your God is giving you." May we find ways to show appreciation and respect, even when it''s hard. Help us forgive their mistakes, just as we hope to be forgiven for ours.

Lord, grant us the patience to listen, the wisdom to support, and the courage to love them as they are. May our relationships be strengthened by Your grace and filled with Your peace.

We thank You for the gift of family, and we trust that You are working in our hearts and in theirs. Amen.

Let this prayer guide you toward connection, as you lean into love and understanding.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-lonely', 'bible-tea', 'cat-family', 'When You Feel Alone', 'lonely', 'No one calls. No one sees. But God does. A prayer for the lonely.', '# When You Feel Alone

Take a deep breath and close your eyes for a moment. Feel the warmth of God''s presence surrounding you, even when the world feels cold and distant. 

Lord, we come to You with hearts that sometimes feel heavy with loneliness. In moments when it seems like no one understands or cares, remind us that You are always with us. You know every part of our story, every joy and every sorrow. 

God, we ask for Your comfort. Whisper to our hearts that we are never truly alone, for Your love is constant and unfailing. Just as You promised in Isaiah 41:10, "Do not fear, for I am with you; do not be dismayed, for I am your God." Help us to remember this truth when silence surrounds us.

Guide us to reach out to those around us, to find connection and community. Open our eyes to see the beauty in others and the love they have to offer. Teach us to extend our own hearts, to be a friend to someone else who might be feeling the same way.

Thank You, God, for Your unwavering presence. You are our refuge, our strength, and our closest companion. Amen. 

Feel the peace that comes from knowing you are held in His hands, cherished and never forgotten.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-toxic-people', 'bible-tea', 'cat-family', 'Dealing with Difficult People', 'toxic-people', 'They drain you. A prayer for boundaries, wisdom, and not losing your mind.', '# Dealing with Difficult People

Take a deep breath and let yourself settle into this moment. Think of the person or people who have been challenging for you lately. Let''s bring this to God together.

God, here we are, in the midst of messy relationships. You know the ones that test us, that wear us thin, that make us question our patience. We come to You, asking for wisdom and strength. Help us to set healthy boundaries, to protect our hearts without hardening them. 

Lord, You teach us in James 1:5 that if we lack wisdom, we can ask and You give generously to all without finding fault. So here we are, asking. Show us how to respond with grace and truth. Help us to see these difficult people through Your eyes, with compassion and understanding, even when it feels impossible.

We pray for peace in our hearts. Let Your love be the filter through which we see and interact with them. Remind us that we are not alone in this — You are with us, guiding us, loving us.

May we find rest in Your presence, knowing that You hold all things together. Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-financial-provision', 'bible-tea', 'cat-finances', 'Prayer for Provision', 'financial-provision', 'Bills are due. The account is empty. A prayer for God''s supernatural supply.', '# Prayer for Provision

Right now, you might feel the weight of financial stress pressing down on you. It''s heavy, and it''s real. So, let''s take a deep breath together and turn towards God, who knows your needs even before you ask.

God, we come to you feeling the burden of financial strain, and it''s tough. But we know that you are our provider, our source of all good things. We remember your promise in Philippians 4:19 that you will meet all our needs according to the riches of your glory in Christ Jesus. We hold onto that promise now, Lord.

Help us to trust you in this uncertain time. We ask for your wisdom in managing the resources we have, and we pray for opportunities to open up, ones that we may not even see yet. Give us peace in our hearts, knowing that you care for us deeply.

Father, during these moments when fear tries to creep in, remind us of your faithfulness. You''ve brought us through before, and we trust you will again. Thank you for being with us in every moment, for hearing our hearts even when we can''t find the right words.

May we rest in your peace, confident in your provision. Amen.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-debt', 'bible-tea', 'cat-finances', 'Freedom from Debt', 'debt', 'The weight of what you owe. A prayer for wisdom, discipline, and breakthrough.', '# Freedom from Debt

Take a deep breath, and let the tension in your shoulders ease for a moment. Financial stress can feel like a heavy backpack you can''t take off. Right now, let''s sit with God and gently unpack that weight.

God, you know every detail of our lives, including our financial struggles. We''re feeling the burden of debt, the worry of making ends meet, and the fear of what''s next. We humbly ask for your wisdom and guidance. Help us to see where we can make changes, to find discipline in our spending, and to trust you with our needs. 

Proverbs 3:5-6 reminds us to "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." We lean into that promise now, asking you to straighten the twisted paths of our financial worries.

Give us peace, Lord, that surpasses understanding. Show us opportunities we might not see and provide in ways we can''t imagine. We''re grateful for your provision, even when it''s hard to see. 

Thank you for being our provider and our comforter. With you, we can find freedom and hope beyond our circumstances. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-generosity', 'bible-tea', 'cat-finances', 'A Heart of Generosity', 'generosity', 'Open hands, not clenched fists. A prayer to give freely and trust God for more.', '# A Heart of Generosity

Take a deep breath and let it out slowly. Picture your hands, not gripped tight with worry, but open and ready to receive peace and hope. 

God, we come to You today with hearts that sometimes feel heavy from financial stress. It''s hard, Lord, to not let anxiety rule our minds. But we know that You are our provider, and You see our needs even before we speak them. Help us trust You more deeply, knowing that You care for us.

You remind us in 2 Corinthians 9:7 that You love a cheerful giver. Let that truth sink in, Father. We want to have open hands, not clenched fists. Teach us to give freely, even when it feels like we don’t have much to offer. Transform our perspective from scarcity to abundance, from fear to faith.

Lord, we ask for wisdom in managing what we have. Give us clarity and creativity to make the most of our resources. And when we give, let it be with a heart full of joy, trusting that You will provide for us, just as You promised.

Thank You for being with us in every situation, big or small. We release our worries to You and embrace the peace that only You can give. Amen.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-contentment', 'bible-tea', 'cat-finances', 'Prayer for Contentment', 'contentment', 'Enough is enough. A prayer to stop chasing and start resting in what you have.', '# Prayer for Contentment

Take a moment to breathe deeply, letting go of the tension and uncertainty swirling around your financial worries. Feel the ground beneath you, steady and unwavering, as you open your heart to God.

Dear God, in a world that often tells us we need more—more money, more stuff, more security—we come to you seeking peace. You know our struggles, the nights we lie awake counting bills instead of sheep. Help us to remember, as Paul wrote to the Philippians, that "my God will meet all your needs according to the riches of his glory in Christ Jesus" (Philippians 4:19).

Guide us to find contentment in what we have, to see abundance in the simplicity of today, and to trust that You will provide what we truly need. Quiet our fears and help us to focus on the blessings already in our hands. May we use what we have wisely, with an open heart and a generous spirit.

Lord, teach us to lean on You, to find rest in Your presence, and to trust that we are enough, just as we are. Let contentment fill our hearts like a gentle rain, easing our anxieties and refreshing our spirits.

In this moment, we choose to rest in Your promise and let go of the chase. Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-job-work', 'bible-tea', 'cat-finances', 'Prayer for Your Work', 'job-work', 'Monday dread or career confusion. A prayer for purpose and direction in your work.', '# Prayer for Your Work

As you find yourself in the hustle of another Monday, pause for a moment. Feel the gentle rhythm of your breath and let your shoulders soften. Together, let''s turn our thoughts to God and invite Him into our work.

Dear God, here we are at the start of another week. Sometimes, the weight of our jobs feels heavy, and the path forward seems unclear. We seek Your presence in the midst of our work, asking for clarity and purpose. Help us to remember that our efforts are not in vain when done for You. Just as Colossians 3:23 reminds us, "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." 

Guide us to find joy and satisfaction in our tasks, no matter how big or small they may seem. Open doors where there need to be opportunities and close those that no longer serve our growth. May we trust in Your timing and plan, knowing that You care for our needs far beyond what we can see.

Thank You for the skills and talents You''ve given us. Let us use them wisely and with integrity. As we move through this week, help us to lean on Your strength and remember that we are never alone in our work.

Amen. Remember, God''s got your back, and He''s right there with you.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-new-day', 'bible-tea', 'cat-morning', 'A New Day', 'new-day', 'Fresh mercies. Clean slate. A prayer to begin with intention and gratitude.', '# A New Day

As the first light of morning spills into your room, take a deep breath and feel the promise of a new day. Let’s pause together, setting our intentions and opening our hearts to gratitude.

Dear God, as the world awakens around us, we come to You with humble hearts. Thank You for the gift of today—a fresh start, a clean slate. Your mercies are new every morning, and we’re so grateful for that. We know that whatever lies ahead, Your presence is with us, guiding and supporting us.

Help us to approach this day with intention. Remind us of the beauty in small things, the kindness we can share, and the strength we have in You. As we plan our tasks and interactions, may we carry Your love in our actions. In Lamentations 3:22-23, we’re reminded, "Because of the Lord’s great love, we are not consumed, for His compassions never fail. They are new every morning; great is Your faithfulness', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-surrender-day', 'bible-tea', 'cat-morning', 'Surrendering This Day', 'surrender-day', 'Before the to-do list takes over — hand the day to God first.', '# Surrendering This Day

As the morning light gently fills your room, take a deep breath and feel the promise of a new day. It''s a moment to pause before the world rushes in, a chance to center yourself in peace.

Dear God, as this day begins, I come to You with an open heart. I offer You my plans, my hopes, and my worries. Help me to trust in Your wisdom and timing, knowing that Your ways are higher than mine. Let me lean on Your understanding, especially when my own feels shaky or uncertain. Proverbs 3:5 reminds me to "trust in the Lord with all your heart and lean not on your own understanding." May this be the foundation of my day.

Guide my steps, Lord, and help me to see the beauty in the ordinary moments. Whether in work or rest, let me find joy and gratitude. Surround me with Your love and let it flow through me to others, infusing my actions and words with kindness and grace.

As I embark on this day, I place it all in Your hands. Thank you for being my constant companion, my source of strength and peace. In this surrender, I find freedom and hope.

Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-focus-and-clarity', 'bible-tea', 'cat-morning', 'Focus & Clarity', 'focus-and-clarity', 'A clear mind, a steady heart. A prayer for wisdom before the chaos starts.', '# Focus & Clarity

As the morning light gently filters through your window, take a deep breath and feel the promise of a new day. Let the stillness of this moment prepare your heart and mind for whatever lies ahead.

Heavenly Father, as the world begins to stir, I ask for Your guidance. Help me approach this day with a clear mind and a steady heart. In the midst of tasks and distractions, grant me focus. Remind me that Your wisdom surpasses all understanding, as Proverbs 3:5-6 encourages us, "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."

Lord, clear away the fog of confusion and grant me clarity in my decisions. Let my actions today reflect Your love and wisdom. Help me to pause and seek Your presence whenever I feel overwhelmed or uncertain.

Thank You for being the source of my strength and clarity. As I step into this day, I trust that You are with me, guiding each step. May my heart remain open to Your whispers and my mind attentive to Your guidance.

Amen. Remember, with God by your side, you are never alone in the journey of today.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-gods-presence-today', 'bible-tea', 'cat-morning', 'God''s Presence Today', 'gods-presence-today', 'Don''t leave home without it. A prayer to carry God''s presence into every moment.', '# God''s Presence Today

As you sit here in the quiet of the morning, take a deep breath and feel the newness of the day stretching out before you. It''s a fresh start, a blank canvas. 

God, as we stand on the brink of this new day, we invite Your presence to fill every moment. We ask that You guide us in our thoughts, words, and actions. Let Your love be the lens through which we see the world and the people around us. Just as the Psalmist reminds us, "Your word is a lamp to my feet and a light to my path" (Psalm 119:105), we ask for Your wisdom to illuminate our way today.

Help us to carry Your peace within us, so that no matter what we encounter, we remain rooted in Your calm. Let Your joy be our strength when challenges arise, and Your compassion be our response when others need a listening ear or a helping hand.

Thank You for this day and the opportunities it holds. May we walk through it aware of Your presence and grateful for Your never-ending grace.

As you go about your day, remember you are never alone. God is with you, guiding each step, and His love surrounds you always.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-purpose-today', 'bible-tea', 'cat-morning', 'Walking in Purpose', 'purpose-today', 'Not just busy — intentional. A prayer to live today on purpose.', '# Walking in Purpose

As the morning light gently peeks through your window, take a moment to breathe in this new day. Feel the promise and potential that comes with the sunrise. It’s a fresh start, a chance to be intentional with your time and energy.

Dear God, thank you for the gift of this new morning. As you step into today, ask for guidance to walk in purpose, not just busyness. Invite God to help you focus on what truly matters, to align your actions with His plans. Remember the words from Proverbs 16:3, "Commit your work to the Lord, and your plans will be established." Let this promise be your anchor throughout the day.

In the moments that feel overwhelming or rushed, seek God''s wisdom and peace. Ask Him to show you where to pause, where to engage, and where to let go. Pray for the courage to embrace opportunities to serve and love others intentionally.

As you sip your morning tea or coffee, imagine God’s presence sitting with you, guiding your thoughts and steps. Trust that He is with you in every decision, big or small. May today be a reflection of His love and purpose in your life.

Go forth with confidence, knowing you are walking in His light. Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-end-of-day', 'bible-tea', 'cat-evening', 'End of Day', 'end-of-day', 'The day is done. A prayer to release what happened and rest in God''s keeping.', '# End of Day

As the day draws to a close and the world quiets down, take a moment to notice the gentle rhythm of your breath. Feel the weight of the day begin to lift. It''s time to let go and rest in the comforting presence of God.

Dear God, we come to you at the end of this day, thankful for your constant presence. As we reflect on what has passed, we ask for your peace to wash over us. Help us release the worries and burdens we''ve carried, knowing that you are in control. You tell us in Psalm 4:8, "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." We hold onto this promise, trusting that you will guard our hearts and minds as we surrender to rest.

Guide us to forgive ourselves and others for any shortcomings today. May we find comfort in your grace, which renews us every morning. As we prepare for sleep, fill our hearts with gratitude for the moments of joy and the lessons learned.

Thank you for being our refuge, for listening to our hearts, and for loving us unconditionally. We rest in the assurance that tomorrow is a new day with fresh opportunities. 

May we sleep peacefully, enveloped in your love and care. Amen.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-reflect-and-release', 'bible-tea', 'cat-evening', 'Reflect & Release', 'reflect-and-release', 'What went well? What didn''t? Hand it all back. Tomorrow is a new start.', '# Reflect & Release

As the day gently draws to a close, take a deep breath and let the events of today settle in your mind. Some moments were bright, others might have cast a shadow. Now''s the time to pause and bring it all before God.

Heavenly Father, here we are at the end of another day. Thank you for the blessings that came our way—the laughter, the kindness, the small victories. Help us to remember these moments and carry their warmth into tomorrow. And for the times we stumbled or fell short, we ask for Your grace. Teach us through our mistakes and help us to grow.

Lord, we release our worries and burdens to You. All the "what ifs" and "should haves"—we place them in Your hands. As you remind us in Psalm 55:22, "Cast your cares on the Lord and he will sustain you." We trust You to hold what is too heavy for us to carry.

Guide us into rest, Father. Renew our spirits and prepare our hearts for a fresh start. We thank You for Your unfailing love and the promise of a new day. In Your peace, we lay our heads down, knowing that You watch over us.

Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-gratitude-tonight', 'bible-tea', 'cat-evening', 'Gratitude Tonight', 'gratitude-tonight', 'Before your head hits the pillow — name three good things. Thank the Giver.', '# Gratitude Tonight

As the day winds down and the night wraps its gentle arms around you, take a moment to settle into the stillness. Let the events of the day drift like autumn leaves, making space for gratitude to fill your heart.

God, we come to You this evening with hearts brimming with thankfulness. Pause for a moment and think of three good things from today—big or small. Maybe it was a kind word from a friend, a moment of laughter, or simply the warmth of the sun on your face. Whatever they are, hold them close.

Lord, thank You for these blessings. In a world that often races past, You remind us to stop and notice. As James 1:17 says, "Every good and perfect gift is from above, coming down from the Father of the heavenly lights." Tonight, we acknowledge these gifts, recognizing Your hand in each one.

Help us, God, to carry this gratitude into our dreams. May it weave through our rest, sowing seeds of peace and contentment. As we lay down our burdens, we trust them to Your care, knowing that You watch over us always.

In this quiet moment, know that you are held by the One who loves you deeply. Rest easy, for tomorrow is a new day, and His mercies are new every morning. Amen.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-protection-through-night', 'bible-tea', 'cat-evening', 'Protection Through the Night', 'protection-through-night', 'Guardian angels and God''s covering. A prayer for safety while you sleep.', '# Protection Through the Night

As the day winds down and the world around you starts to quiet, take a moment to settle your mind. Feel the weight of the day gently lift as you prepare to rest. Let’s invite God''s presence to surround you this evening.

Dear God, as the stars begin to twinkle in the night sky, we come to You with hearts seeking peace and security. We ask for Your protective embrace over us as we sleep. Just as Psalm 4:8 reminds us, "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." May these words become our truth tonight.

Lord, we ask for Your angels to stand guard around us, keeping watch through the dark hours. Fill our hearts with the assurance that You are our refuge, our safe haven from all that troubles us. Clear our minds of worry and fear, and replace them with dreams filled with hope and comfort.

We trust You, God, to shield us from harm and to wake us refreshed and renewed. As we close our eyes, let us feel Your love wrapping around us like a warm blanket. Thank You for Your constant vigilance and care, which never falters or fades.

And as we drift into sleep, let our last thoughts be of gratitude for Your unwavering protection. Amen.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-tomorrow-in-gods-hands', 'bible-tea', 'cat-evening', 'Tomorrow Is in God''s Hands', 'tomorrow-in-gods-hands', 'Stop planning. Stop worrying. Tomorrow belongs to Him. A prayer to let go.', '# Tomorrow Is in God''s Hands

As the day winds down and the world quiets, you find yourself in this gentle moment of transition. The weight of tomorrow''s unknowns might be sitting just at the edge of your thoughts. But right now, you can let those thoughts drift away and focus on this moment, on this breath.

Dear God, as we draw close tonight, help us to release the worries of what might come. We know that planning has its place, but so does trust. We bring our tomorrow to you, knowing that you hold it with care. Just as Psalm 55:22 reminds us, "Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken." Let this truth sink deep, calming our anxious hearts.

We ask for your peace to wrap around us like a warm blanket, soothing the edges of our minds. Help us to rest in the knowledge that you have gone before us, paving a path with your love and wisdom. May our sleep be restful, our dreams sweet, and our spirits renewed.

Thank you for being our constant, unchanging anchor. With every breath, we choose to trust you more. As we close our eyes, we remember: tomorrow is in your hands, and that''s the safest place it could ever be. Amen.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-lost-someone', 'bible-tea', 'cat-grief', 'When You''ve Lost Someone', 'lost-someone', 'The chair is empty. The silence is loud. A prayer for the grief that won''t let go.', '# When You''ve Lost Someone

Take a deep breath and find a quiet moment. Grief might feel like an ever-present shadow, but you''re not alone in this pain. 

God, we''re here with heavy hearts. Losing someone we love leaves an emptiness that words can''t fill, and the silence can feel overwhelming. We bring our sorrow to You, knowing You understand our tears. Your promise in Psalm 34:18, "The Lord is close to the brokenhearted and saves those who are crushed in spirit," is a comfort we cling to now. Help us to feel Your presence in the midst of our grief, like a gentle hand resting on our shoulder. 

Give us the strength to face each day, even when it feels impossible. Help us to remember the moments of joy and love we shared with them, and let those memories bring a small measure of peace to our aching hearts. Guide us to lean on the support of friends and family, and to reach out when the burden feels too heavy to bear alone. 

Thank You, God, for being our refuge and strength, even in our deepest sorrow. We trust that Your love surrounds us and that You hold our loved one close. Amen.

Remember, you''re not alone. God''s comfort is with you, even in this.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-why-god', 'bible-tea', 'cat-grief', 'When You''re Asking ''Why?''', 'why-god', 'No answers. Just pain. A prayer for when God feels cruel or absent.', '# When You''re Asking ''Why?''

Take a moment to settle in, feeling the weight of your heart. It''s okay to let the tears fall. You''re not alone in this space. Let''s bring this ache to God together.

God, here we are, feeling so lost amidst the unanswered questions. It feels like the ground has shifted beneath our feet, and we''re left asking, "Why?" You know the depth of our pain, yet sometimes, it feels like You''re so far away.

We come to You, Lord, not seeking quick answers, but simply to be held in Your presence. You promised that You are close to the brokenhearted, and today we need to feel that closeness. We lift our raw, hurting hearts to You, trusting that You see us, even when it feels like we''re in the shadows.

In Romans 8:26, You remind us that the Spirit helps us in our weakness and even intercedes for us with groans too deep for words. Right now, we lean on that promise, asking Your Spirit to speak on our behalf when words fail us.

As we sit in this silence, help us to sense Your nearness. May we find comfort in knowing that we''re not abandoned, even when answers are elusive.

Breathe in peace, trusting that God''s love surrounds you, even in the darkest valleys. Amen.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-broken-dreams', 'bible-tea', 'cat-grief', 'Grieving a Broken Dream', 'broken-dreams', 'The life you planned isn''t the life you got. A prayer to mourn what could have been.', '# Grieving a Broken Dream

Take a deep breath and let it out slowly. Feel the weight of what could have been, the dreams that have slipped through your fingers. It’s okay to mourn them, to feel the loss deeply.

Dear God, today we bring to You the dreams that didn’t come to pass. The hopes, the plans, the visions for a future that now feels out of reach. You know the ache in our hearts, the silent questions and the quiet grief. We lay all these before You, trusting that You see every tear and hear every unspoken word.

Help us, Lord, to grieve with hope, knowing that in Your hands, even broken dreams have purpose. Your Word reminds us that “The Lord is close to the brokenhearted and saves those who are crushed in spirit” (Psalm 34:18). Be close to us now, wrapping us in Your love and comfort.

Guide us to find new dreams, new paths that align with Your will. Teach us to trust in Your timing and to lean on Your strength when our own fails us. May we find solace in Your presence and courage to embrace the unknown.

As we hold onto Your promises, let us find peace in knowing that You are always working for our good. Thank You for never leaving us, even in our moments of deepest sorrow. Amen.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-comfort-in-pain', 'bible-tea', 'cat-grief', 'Comfort in Pain', 'comfort-in-pain', 'God doesn''t always fix it. But He sits with you in it. A prayer for His presence.', '# Comfort in Pain

As you settle into this moment, take a deep breath. Let the tension in your shoulders melt away, and allow yourself to fully arrive here, where you’re safe to feel whatever you need to feel. It’s okay. You’re not alone.

God, our hearts are heavy today. We come to You carrying this weight of grief and loss. It feels like the world has shifted beneath our feet, and we’re struggling to find our balance. We ask You to be with us in this pain. Remind us that You are close to the brokenhearted, as You promised in Psalm 34:18, and save those who are crushed in spirit.

Help us to lean into Your presence, even when answers seem far away. We long for Your comfort, the kind that wraps around us like a warm blanket on a cold night. Guide us gently through this valley, holding our hand every step of the way. When words fail us, let us find solace in Your love.

Thank You for being a God who doesn’t shy away from our tears. Thank You for being a God who sits with us in silence, offering peace that surpasses understanding. May we feel Your strength as we navigate these deep waters, knowing that we are never walking alone.

Amen.

In His presence, we find our refuge and rest.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-hope-after-loss', 'bible-tea', 'cat-grief', 'Hope After Loss', 'hope-after-loss', 'Weeping lasts for the night, but joy comes in the morning. A prayer to believe that.', '# Hope After Loss

Take a deep breath and let yourself be present in this moment. It''s okay to feel what you''re feeling. Grief can be overwhelming, but you''re not alone in this.

Dear God, here we are, hearts heavy with loss. Sometimes it feels like the world has shifted, and we’re not sure how to find our footing again. Lord, you know the depth of our sorrow, and we bring it all to you. We ask for your comfort, the kind that wraps around us like a warm blanket on a cold night.

We remember your promise that "weeping may last through the night, but joy comes with the morning" (Psalm 30:5). Help us to hold onto this hope, even when the night feels long. Remind us that it’s okay to grieve, and that healing is a journey you walk with us.

God, grant us moments of peace amidst the storm, and the strength to take each day step by step. We pray for glimpses of joy that can break through the clouds, reminding us of your presence and your love.

Thank you for being our refuge, our safe place to cry, to question, and to heal. Help us to trust in your goodness, even when it’s hard to see. Amen.

Remember: you are deeply loved, and brighter days will come.', 5, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-big-decision', 'bible-tea', 'cat-decisions', 'Facing a Big Decision', 'big-decision', 'Left or right? Stay or go? A prayer for clarity when the path splits.', '# Facing a Big Decision

Take a deep breath, my friend. You''re standing at a crossroads, and that''s okay. It''s a place of possibility, even if it feels a bit overwhelming right now. Let''s take a moment to pause and invite God into this space.

God, here we are, seeking Your wisdom. Decisions can be heavy, and sometimes we''re not sure which way to turn. But we trust that You hold the map to our lives, even when we can''t see the path clearly. In this moment, we ask for Your guidance. You tell us in Jeremiah 29:11 that You have plans for us, plans to prosper us and not to harm us, plans to give us hope and a future. Let that promise settle in our hearts as we weigh our options.

Help us to quiet the noise around us so we can hear Your gentle whisper. Give us the courage to follow where You lead, even if it means stepping out of our comfort zone. May Your peace, which surpasses all understanding, guard our hearts and minds in Christ Jesus.

Thank You for being with us in this uncertainty. We trust that You are lighting the way, one step at a time. Amen.

You''re not alone in this. Remember, God is guiding you, and you are on the right path.', 1, 1);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-gods-will', 'bible-tea', 'cat-decisions', 'Knowing God''s Will', 'gods-will', 'What does God want me to do? A prayer to hear His voice above the noise.', '# Knowing God''s Will

Take a deep breath and let yourself settle into this moment. Picture yourself walking down a path, but you’re not quite sure which turn to take. It''s okay to feel uncertain right now.

Let''s take this to God together. Lord, here we are, seeking clarity in the midst of our busy lives. We admit, sometimes it feels like we’re surrounded by so many voices, each competing for our attention. But what we truly desire is to hear Your voice above all the noise. Help us to tune into Your guidance and trust that You will lead us in the way we should go.

God, we remember Your promise in Psalm 32:8, "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you." We want to believe this with our whole hearts. Please open our ears to hear Your whispers, and give us the courage to follow where You lead, even if the path feels unfamiliar.

Thank You, Lord, for being our constant guide, even when we can''t see the entire journey ahead. In this moment, we trust that Your plans for us are good.

As you move forward, hold onto this truth: You are not alone, and His guidance is as close as your next breath.', 2, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-patience-in-waiting', 'bible-tea', 'cat-decisions', 'Patience in Waiting', 'patience-in-waiting', 'The answer hasn''t come yet. A prayer for the unbearable in-between.', '# Patience in Waiting

Take a deep breath. Here you are, in the middle of the unknown, waiting for clarity to come. It feels like the answers are taking their sweet time, doesn''t it? Let''s bring this moment to God together.

God, we come before you, feeling the weight of this waiting. It''s hard not to have all the answers right now. We long to see the path clearly, to know which step to take next. You remind us, though, in Psalm 27:14, to "wait for the Lord; be strong, and let your heart take courage; wait for the Lord."

Help us embrace this waiting, to find peace in the stillness. Grant us patience, even when it''s tough, and trust that You are crafting something beautiful in this in-between. We ask for Your wisdom to seep into our hearts, guiding us gently, step by step.

As we wait, let us not miss the small whispers of Your guidance amidst the noise. Let our hearts be open to Your timing, Your direction. We know You are with us, even now, working all things together for good. 

Thank you for holding us in this space. We trust You are leading us towards the right door. We rest in Your promise, knowing You see the whole picture, even when we can''t.

Amen.', 3, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-new-beginning', 'bible-tea', 'cat-decisions', 'Prayer for a New Beginning', 'new-beginning', 'Closing one chapter, opening another. A prayer for courage to step forward.', '# Prayer for a New Beginning

As you sit here, take a deep breath and feel the weight of the moment. You’re standing at the edge of something new, a fresh chapter waiting to be written. It’s natural to feel a mix of excitement and uncertainty, so let’s bring those feelings to God together.

God, here we are, at this crossroads of life, with decisions to make and paths to choose. You know the hopes and fears nestled in our hearts. We ask for Your wisdom to guide us. Just as You promised in Proverbs 3:5-6, we trust You with all our heart, leaning not on our own understanding. In all our ways, we acknowledge You, confident that You will make our paths straight.

Help us to embrace the courage and clarity that only You can provide. When doubts creep in, remind us of Your presence, whispering reassurance into our souls. We seek Your voice in the quiet moments, asking for the strength to step forward with faith, even when the way isn’t fully clear.

Thank You, God, for being our constant companion in times of change. As we move forward, may Your peace be our anchor, and Your love be our guide. Amen.

Remember, you are never alone on this journey. With each step, God walks beside you, lighting your path.', 4, 0);
INSERT OR IGNORE INTO prayers (id, app_id, category_id, title, slug, description, transcript, sort_order, is_free) VALUES ('pr-trusting-gods-timing', 'bible-tea', 'cat-decisions', 'Trusting God''s Timing', 'trusting-gods-timing', 'It''s taking too long. Or is it? A prayer to trust that God''s clock is perfect.', '# Trusting God''s Timing

Take a deep breath and settle into this moment. Feel the weight of uncertainty lift as we turn to God together, seeking clarity and peace.

God, we come to you with hearts eager for direction. Sometimes it feels like things are taking too long, like we’re waiting endlessly for the next step to reveal itself. Help us remember that your timing is always perfect, even when it doesn’t align with our own plans. 

Guide us to trust in your wisdom and patience. You remind us in Ecclesiastes 3:11 that “He has made everything beautiful in its time.” Let this truth sink deep into our souls, reassuring us that you see the bigger picture, even when we can’t. 

We ask for your guidance in making decisions, whether big or small. Help us to lean not on our own understanding but to acknowledge you in all our ways, knowing that you will direct our paths. Give us the courage to pause, to listen for your voice, and to trust where you lead.

As we navigate this season of waiting, fill us with peace and hope, knowing that you are with us every step of the way. Amen.', 5, 0);

-- Prayer audio
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-anxious-thoughts-grace', 'pr-anxious-thoughts', 'spk-grace', 'bible-tea/prayers/anxious-thoughts/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-anxious-thoughts-elijah', 'pr-anxious-thoughts', 'spk-elijah', 'bible-tea/prayers/anxious-thoughts/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-overwhelmed-grace', 'pr-overwhelmed', 'spk-grace', 'bible-tea/prayers/overwhelmed/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-overwhelmed-elijah', 'pr-overwhelmed', 'spk-elijah', 'bible-tea/prayers/overwhelmed/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-fear-of-future-grace', 'pr-fear-of-future', 'spk-grace', 'bible-tea/prayers/fear-of-future/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-fear-of-future-elijah', 'pr-fear-of-future', 'spk-elijah', 'bible-tea/prayers/fear-of-future/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-peace-in-chaos-grace', 'pr-peace-in-chaos', 'spk-grace', 'bible-tea/prayers/peace-in-chaos/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-peace-in-chaos-elijah', 'pr-peace-in-chaos', 'spk-elijah', 'bible-tea/prayers/peace-in-chaos/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-letting-go-of-control-grace', 'pr-letting-go-of-control', 'spk-grace', 'bible-tea/prayers/letting-go-of-control/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-letting-go-of-control-elijah', 'pr-letting-go-of-control', 'spk-elijah', 'bible-tea/prayers/letting-go-of-control/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-cant-sleep-grace', 'pr-cant-sleep', 'spk-grace', 'bible-tea/prayers/cant-sleep/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-cant-sleep-elijah', 'pr-cant-sleep', 'spk-elijah', 'bible-tea/prayers/cant-sleep/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-nighttime-peace-grace', 'pr-nighttime-peace', 'spk-grace', 'bible-tea/prayers/nighttime-peace/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-nighttime-peace-elijah', 'pr-nighttime-peace', 'spk-elijah', 'bible-tea/prayers/nighttime-peace/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-rest-for-weary-grace', 'pr-rest-for-weary', 'spk-grace', 'bible-tea/prayers/rest-for-weary/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-rest-for-weary-elijah', 'pr-rest-for-weary', 'spk-elijah', 'bible-tea/prayers/rest-for-weary/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-trusting-through-night-grace', 'pr-trusting-through-night', 'spk-grace', 'bible-tea/prayers/trusting-through-night/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-trusting-through-night-elijah', 'pr-trusting-through-night', 'spk-elijah', 'bible-tea/prayers/trusting-through-night/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-surrender-before-sleep-grace', 'pr-surrender-before-sleep', 'spk-grace', 'bible-tea/prayers/surrender-before-sleep/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-surrender-before-sleep-elijah', 'pr-surrender-before-sleep', 'spk-elijah', 'bible-tea/prayers/surrender-before-sleep/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-thankful-heart-grace', 'pr-thankful-heart', 'spk-grace', 'bible-tea/prayers/thankful-heart/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-thankful-heart-elijah', 'pr-thankful-heart', 'spk-elijah', 'bible-tea/prayers/thankful-heart/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-praise-in-storm-grace', 'pr-praise-in-storm', 'spk-grace', 'bible-tea/prayers/praise-in-storm/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-praise-in-storm-elijah', 'pr-praise-in-storm', 'spk-elijah', 'bible-tea/prayers/praise-in-storm/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-morning-gratitude-grace', 'pr-morning-gratitude', 'spk-grace', 'bible-tea/prayers/morning-gratitude/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-morning-gratitude-elijah', 'pr-morning-gratitude', 'spk-elijah', 'bible-tea/prayers/morning-gratitude/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-counting-blessings-grace', 'pr-counting-blessings', 'spk-grace', 'bible-tea/prayers/counting-blessings/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-counting-blessings-elijah', 'pr-counting-blessings', 'spk-elijah', 'bible-tea/prayers/counting-blessings/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-joy-in-small-things-grace', 'pr-joy-in-small-things', 'spk-grace', 'bible-tea/prayers/joy-in-small-things/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-joy-in-small-things-elijah', 'pr-joy-in-small-things', 'spk-elijah', 'bible-tea/prayers/joy-in-small-things/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-physical-healing-grace', 'pr-physical-healing', 'spk-grace', 'bible-tea/prayers/physical-healing/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-physical-healing-elijah', 'pr-physical-healing', 'spk-elijah', 'bible-tea/prayers/physical-healing/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-emotional-healing-grace', 'pr-emotional-healing', 'spk-grace', 'bible-tea/prayers/emotional-healing/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-emotional-healing-elijah', 'pr-emotional-healing', 'spk-elijah', 'bible-tea/prayers/emotional-healing/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-healing-for-loved-one-grace', 'pr-healing-for-loved-one', 'spk-grace', 'bible-tea/prayers/healing-for-loved-one/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-healing-for-loved-one-elijah', 'pr-healing-for-loved-one', 'spk-elijah', 'bible-tea/prayers/healing-for-loved-one/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-chronic-pain-grace', 'pr-chronic-pain', 'spk-grace', 'bible-tea/prayers/chronic-pain/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-chronic-pain-elijah', 'pr-chronic-pain', 'spk-elijah', 'bible-tea/prayers/chronic-pain/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-mental-health-grace', 'pr-mental-health', 'spk-grace', 'bible-tea/prayers/mental-health/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-mental-health-elijah', 'pr-mental-health', 'spk-elijah', 'bible-tea/prayers/mental-health/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-courage-to-act-grace', 'pr-courage-to-act', 'spk-grace', 'bible-tea/prayers/courage-to-act/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-courage-to-act-elijah', 'pr-courage-to-act', 'spk-elijah', 'bible-tea/prayers/courage-to-act/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-facing-giants-grace', 'pr-facing-giants', 'spk-grace', 'bible-tea/prayers/facing-giants/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-facing-giants-elijah', 'pr-facing-giants', 'spk-elijah', 'bible-tea/prayers/facing-giants/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-standing-alone-grace', 'pr-standing-alone', 'spk-grace', 'bible-tea/prayers/standing-alone/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-standing-alone-elijah', 'pr-standing-alone', 'spk-elijah', 'bible-tea/prayers/standing-alone/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-endurance-grace', 'pr-endurance', 'spk-grace', 'bible-tea/prayers/endurance/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-endurance-elijah', 'pr-endurance', 'spk-elijah', 'bible-tea/prayers/endurance/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-armor-up-grace', 'pr-armor-up', 'spk-grace', 'bible-tea/prayers/armor-up/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-armor-up-elijah', 'pr-armor-up', 'spk-elijah', 'bible-tea/prayers/armor-up/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-forgiving-others-grace', 'pr-forgiving-others', 'spk-grace', 'bible-tea/prayers/forgiving-others/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-forgiving-others-elijah', 'pr-forgiving-others', 'spk-elijah', 'bible-tea/prayers/forgiving-others/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-asking-forgiveness-grace', 'pr-asking-forgiveness', 'spk-grace', 'bible-tea/prayers/asking-forgiveness/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-asking-forgiveness-elijah', 'pr-asking-forgiveness', 'spk-elijah', 'bible-tea/prayers/asking-forgiveness/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-forgiving-yourself-grace', 'pr-forgiving-yourself', 'spk-grace', 'bible-tea/prayers/forgiving-yourself/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-forgiving-yourself-elijah', 'pr-forgiving-yourself', 'spk-elijah', 'bible-tea/prayers/forgiving-yourself/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-broken-relationship-grace', 'pr-broken-relationship', 'spk-grace', 'bible-tea/prayers/broken-relationship/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-broken-relationship-elijah', 'pr-broken-relationship', 'spk-elijah', 'bible-tea/prayers/broken-relationship/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-letting-go-anger-grace', 'pr-letting-go-anger', 'spk-grace', 'bible-tea/prayers/letting-go-anger/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-letting-go-anger-elijah', 'pr-letting-go-anger', 'spk-elijah', 'bible-tea/prayers/letting-go-anger/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-marriage-grace', 'pr-marriage', 'spk-grace', 'bible-tea/prayers/marriage/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-marriage-elijah', 'pr-marriage', 'spk-elijah', 'bible-tea/prayers/marriage/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-children-grace', 'pr-children', 'spk-grace', 'bible-tea/prayers/children/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-children-elijah', 'pr-children', 'spk-elijah', 'bible-tea/prayers/children/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-parents-grace', 'pr-parents', 'spk-grace', 'bible-tea/prayers/parents/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-parents-elijah', 'pr-parents', 'spk-elijah', 'bible-tea/prayers/parents/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-lonely-grace', 'pr-lonely', 'spk-grace', 'bible-tea/prayers/lonely/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-lonely-elijah', 'pr-lonely', 'spk-elijah', 'bible-tea/prayers/lonely/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-toxic-people-grace', 'pr-toxic-people', 'spk-grace', 'bible-tea/prayers/toxic-people/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-toxic-people-elijah', 'pr-toxic-people', 'spk-elijah', 'bible-tea/prayers/toxic-people/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-financial-provision-grace', 'pr-financial-provision', 'spk-grace', 'bible-tea/prayers/financial-provision/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-financial-provision-elijah', 'pr-financial-provision', 'spk-elijah', 'bible-tea/prayers/financial-provision/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-debt-grace', 'pr-debt', 'spk-grace', 'bible-tea/prayers/debt/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-debt-elijah', 'pr-debt', 'spk-elijah', 'bible-tea/prayers/debt/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-generosity-grace', 'pr-generosity', 'spk-grace', 'bible-tea/prayers/generosity/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-generosity-elijah', 'pr-generosity', 'spk-elijah', 'bible-tea/prayers/generosity/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-contentment-grace', 'pr-contentment', 'spk-grace', 'bible-tea/prayers/contentment/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-contentment-elijah', 'pr-contentment', 'spk-elijah', 'bible-tea/prayers/contentment/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-job-work-grace', 'pr-job-work', 'spk-grace', 'bible-tea/prayers/job-work/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-job-work-elijah', 'pr-job-work', 'spk-elijah', 'bible-tea/prayers/job-work/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-new-day-grace', 'pr-new-day', 'spk-grace', 'bible-tea/prayers/new-day/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-new-day-elijah', 'pr-new-day', 'spk-elijah', 'bible-tea/prayers/new-day/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-surrender-day-grace', 'pr-surrender-day', 'spk-grace', 'bible-tea/prayers/surrender-day/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-surrender-day-elijah', 'pr-surrender-day', 'spk-elijah', 'bible-tea/prayers/surrender-day/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-focus-and-clarity-grace', 'pr-focus-and-clarity', 'spk-grace', 'bible-tea/prayers/focus-and-clarity/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-focus-and-clarity-elijah', 'pr-focus-and-clarity', 'spk-elijah', 'bible-tea/prayers/focus-and-clarity/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-gods-presence-today-grace', 'pr-gods-presence-today', 'spk-grace', 'bible-tea/prayers/gods-presence-today/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-gods-presence-today-elijah', 'pr-gods-presence-today', 'spk-elijah', 'bible-tea/prayers/gods-presence-today/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-purpose-today-grace', 'pr-purpose-today', 'spk-grace', 'bible-tea/prayers/purpose-today/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-purpose-today-elijah', 'pr-purpose-today', 'spk-elijah', 'bible-tea/prayers/purpose-today/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-end-of-day-grace', 'pr-end-of-day', 'spk-grace', 'bible-tea/prayers/end-of-day/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-end-of-day-elijah', 'pr-end-of-day', 'spk-elijah', 'bible-tea/prayers/end-of-day/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-reflect-and-release-grace', 'pr-reflect-and-release', 'spk-grace', 'bible-tea/prayers/reflect-and-release/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-reflect-and-release-elijah', 'pr-reflect-and-release', 'spk-elijah', 'bible-tea/prayers/reflect-and-release/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-gratitude-tonight-grace', 'pr-gratitude-tonight', 'spk-grace', 'bible-tea/prayers/gratitude-tonight/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-gratitude-tonight-elijah', 'pr-gratitude-tonight', 'spk-elijah', 'bible-tea/prayers/gratitude-tonight/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-protection-through-night-grace', 'pr-protection-through-night', 'spk-grace', 'bible-tea/prayers/protection-through-night/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-protection-through-night-elijah', 'pr-protection-through-night', 'spk-elijah', 'bible-tea/prayers/protection-through-night/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-tomorrow-in-gods-hands-grace', 'pr-tomorrow-in-gods-hands', 'spk-grace', 'bible-tea/prayers/tomorrow-in-gods-hands/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-tomorrow-in-gods-hands-elijah', 'pr-tomorrow-in-gods-hands', 'spk-elijah', 'bible-tea/prayers/tomorrow-in-gods-hands/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-lost-someone-grace', 'pr-lost-someone', 'spk-grace', 'bible-tea/prayers/lost-someone/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-lost-someone-elijah', 'pr-lost-someone', 'spk-elijah', 'bible-tea/prayers/lost-someone/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-why-god-grace', 'pr-why-god', 'spk-grace', 'bible-tea/prayers/why-god/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-why-god-elijah', 'pr-why-god', 'spk-elijah', 'bible-tea/prayers/why-god/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-broken-dreams-grace', 'pr-broken-dreams', 'spk-grace', 'bible-tea/prayers/broken-dreams/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-broken-dreams-elijah', 'pr-broken-dreams', 'spk-elijah', 'bible-tea/prayers/broken-dreams/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-comfort-in-pain-grace', 'pr-comfort-in-pain', 'spk-grace', 'bible-tea/prayers/comfort-in-pain/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-comfort-in-pain-elijah', 'pr-comfort-in-pain', 'spk-elijah', 'bible-tea/prayers/comfort-in-pain/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-hope-after-loss-grace', 'pr-hope-after-loss', 'spk-grace', 'bible-tea/prayers/hope-after-loss/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-hope-after-loss-elijah', 'pr-hope-after-loss', 'spk-elijah', 'bible-tea/prayers/hope-after-loss/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-big-decision-grace', 'pr-big-decision', 'spk-grace', 'bible-tea/prayers/big-decision/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-big-decision-elijah', 'pr-big-decision', 'spk-elijah', 'bible-tea/prayers/big-decision/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-gods-will-grace', 'pr-gods-will', 'spk-grace', 'bible-tea/prayers/gods-will/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-gods-will-elijah', 'pr-gods-will', 'spk-elijah', 'bible-tea/prayers/gods-will/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-patience-in-waiting-grace', 'pr-patience-in-waiting', 'spk-grace', 'bible-tea/prayers/patience-in-waiting/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-patience-in-waiting-elijah', 'pr-patience-in-waiting', 'spk-elijah', 'bible-tea/prayers/patience-in-waiting/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-new-beginning-grace', 'pr-new-beginning', 'spk-grace', 'bible-tea/prayers/new-beginning/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-new-beginning-elijah', 'pr-new-beginning', 'spk-elijah', 'bible-tea/prayers/new-beginning/narration-elijah.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-trusting-gods-timing-grace', 'pr-trusting-gods-timing', 'spk-grace', 'bible-tea/prayers/trusting-gods-timing/narration-grace.mp3', 0, 'en');
INSERT OR IGNORE INTO prayer_audio (id, prayer_id, speaker_id, audio_key, duration_seconds, locale) VALUES ('pa-trusting-gods-timing-elijah', 'pr-trusting-gods-timing', 'spk-elijah', 'bible-tea/prayers/trusting-gods-timing/narration-elijah.mp3', 0, 'en');

-- Prayer-story links
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-anxious-thoughts', 'st-elijah-runs-away');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-overwhelmed', 'st-hannahs-prayer');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-fear-of-future', 'st-abraham-call');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-peace-in-chaos', 'st-walks-water');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-letting-go-of-control', 'st-tired-waiting');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-cant-sleep', 'st-psalm-91-gods-protection');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-nighttime-peace', 'st-psalm-23');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-rest-for-weary', 'st-bread-heaven');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-trusting-through-night', 'st-songs-in-the-night');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-thankful-heart', 'st-psalm-150-everything-praise');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-praise-in-storm', 'st-david-dances-before-the-ark');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-morning-gratitude', 'st-creation');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-counting-blessings', 'st-crossing-the-red-sea');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-joy-in-small-things', 'st-bread-from-heaven');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-physical-healing', 'st-naaman-and-the-muddy-river');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-emotional-healing', 'st-psalm-51-a-broken-king');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-healing-for-loved-one', 'st-hezekiahs-prayer');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-chronic-pain', 'st-job-loses-everything');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-mental-health', 'st-songs-in-the-night');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-mental-health', 'st-elijah-runs-away');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-courage-to-act', 'st-esther-saves-her-people');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-facing-giants', 'st-david-goliath');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-standing-alone', 'st-elijah-on-mount-carmel');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-standing-alone', 'st-daniel-and-the-lions-den');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-endurance', 'st-finish-the-race');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-armor-up', 'st-armor-of-god');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-forgiving-others', 'st-joseph-forgives');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-asking-forgiveness', 'st-psalm-51-a-broken-king');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-asking-forgiveness', 'st-david-and-bathsheba');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-forgiving-yourself', 'st-prodigal-son');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-broken-relationship', 'st-jacob-esau');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-letting-go-anger', 'st-jonahs-anger');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-marriage', 'st-hosea-and-gomer');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-children', 'st-hannahs-prayer');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-parents', 'st-ruth-and-naomi');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-lonely', 'st-elijah-runs-away');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-toxic-people', 'st-david-spares-saul');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-financial-provision', 'st-bread-from-heaven');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-debt', 'st-sabbath-jubilee-and-justice');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-generosity', 'st-feeding-5000');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-contentment', 'st-the-wise-and-the-foolish');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-job-work', 'st-abrahams-call');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-new-day', 'st-creation');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-surrender-day', 'st-crossing-the-jordan');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-focus-and-clarity', 'st-solomons-wisdom');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-gods-presence-today', 'st-burning-bush');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-purpose-today', 'st-isaiahs-call');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-reflect-and-release', 'st-psalm-139-fully-known');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-protection-through-night', 'st-psalm-91-gods-protection');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-tomorrow-in-gods-hands', 'st-abrahams-call');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-lost-someone', 'st-ruth-and-naomi');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-why-god', 'st-job-questions-god');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-broken-dreams', 'st-davids-broken-return');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-comfort-in-pain', 'st-jobs-friends-speak');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-comfort-in-pain', 'st-god-answers-job');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-hope-after-loss', 'st-job-restored');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-big-decision', 'st-abrahams-call');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-gods-will', 'st-samuel-anoints-david');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-patience-in-waiting', 'st-tired-of-waiting');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-new-beginning', 'st-crossing-the-jordan');
INSERT OR IGNORE INTO prayer_stories (prayer_id, story_id) VALUES ('pr-trusting-gods-timing', 'st-gods-promise-of-a-son');

-- Prayer-character links
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-anxious-thoughts', 'ch-elijah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-overwhelmed', 'ch-moses');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-fear-of-future', 'ch-abraham');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-peace-in-chaos', 'ch-jesus');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-letting-go-of-control', 'ch-abraham');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-letting-go-of-control', 'ch-sarah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-nighttime-peace', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-rest-for-weary', 'ch-jesus');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-trusting-through-night', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-thankful-heart', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-praise-in-storm', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-counting-blessings', 'ch-moses');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-emotional-healing', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-chronic-pain', 'ch-job');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-mental-health', 'ch-elijah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-courage-to-act', 'ch-esther');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-facing-giants', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-standing-alone', 'ch-elijah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-standing-alone', 'ch-daniel');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-endurance', 'ch-paul');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-armor-up', 'ch-paul');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-forgiving-others', 'ch-joseph');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-asking-forgiveness', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-forgiving-yourself', 'ch-peter');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-broken-relationship', 'ch-jacob');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-letting-go-anger', 'ch-jonah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-parents', 'ch-ruth');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-lonely', 'ch-elijah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-toxic-people', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-financial-provision', 'ch-moses');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-generosity', 'ch-jesus');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-contentment', 'ch-solomon');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-job-work', 'ch-abraham');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-surrender-day', 'ch-joshua');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-focus-and-clarity', 'ch-solomon');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-gods-presence-today', 'ch-moses');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-reflect-and-release', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-tomorrow-in-gods-hands', 'ch-abraham');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-lost-someone', 'ch-ruth');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-why-god', 'ch-job');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-broken-dreams', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-comfort-in-pain', 'ch-job');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-hope-after-loss', 'ch-job');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-big-decision', 'ch-abraham');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-gods-will', 'ch-david');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-patience-in-waiting', 'ch-abraham');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-patience-in-waiting', 'ch-sarah');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-new-beginning', 'ch-joshua');
INSERT OR IGNORE INTO prayer_characters (prayer_id, character_id) VALUES ('pr-trusting-gods-timing', 'ch-abraham');