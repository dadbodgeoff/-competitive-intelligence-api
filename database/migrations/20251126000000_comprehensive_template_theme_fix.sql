-- ============================================================================
-- MIGRATION: Comprehensive Template Theme Fix
-- ============================================================================
-- Description : Links ALL 549+ templates to appropriate themes so they appear
--               in the frontend. This is a comprehensive fix that handles:
--               - Story templates (story-*)
--               - Holiday templates (holiday-*)
--               - Sports templates (sports-*, gameday-*)
--               - Daily specials (daily-*, lto-*)
--               - Delivery/Takeout (delivery-*, takeout-*)
--               - Gift cards/Rewards (gift-*, reward-*)
--               - UGC/Operational (ugc-*, ops-*)
--               - Restaurant verticals (pizza-*, bbq-*, seafood-*, etc.)
-- Author      : Kiro
-- Date        : 2025-11-26
-- ============================================================================

-- ============================================================================
-- STEP 1: Create ALL necessary themes (if not exist)
-- ============================================================================

-- Instagram Stories Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'instagram_stories', 'Instagram Stories',
    'Vertical 9:16 story templates for announcements, polls, countdowns, and engagement.',
    'instagram_story',
    '{"primary":"#E1306C","secondary":"#833AB4","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#instastory","#swipeup","#linkinbio"]'::JSONB,
    '{"style_adjectives":["vertical format","story optimized","swipe-friendly"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Sports & Game Day Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'bar_grill', 'sports_gameday', 'Sports & Game Day',
    'Game day specials, watch parties, playoff promotions, and sports bar marketing.',
    'instagram',
    '{"primary":"#1E3A5F","secondary":"#F39C12","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
    '["#gameday","#watchparty","#sportsbar","#biggame"]'::JSONB,
    '{"style_adjectives":["game day energy","sports atmosphere","crowd excitement"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Daily Specials & LTOs Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'daily_specials_lto', 'Daily Specials & LTOs',
    'Daily specials, limited time offers, weekly features, and rotating menu items.',
    'instagram',
    '{"primary":"#E74C3C","secondary":"#F39C12","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Oswald","body":"Open Sans"}'::JSONB,
    '["#dailyspecial","#limitedtime","#todayonly","#weeklyspecial"]'::JSONB,
    '{"style_adjectives":["urgency","limited availability","special feature"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Delivery & Takeout Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'delivery_takeout', 'Delivery & Takeout',
    'Online ordering, delivery promotions, curbside pickup, and to-go specials.',
    'instagram',
    '{"primary":"#27AE60","secondary":"#2C3E50","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#delivery","#takeout","#orderonline","#curbside"]'::JSONB,
    '{"style_adjectives":["convenience","quick service","order now"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Gift Cards & Rewards Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'giftcards_rewards', 'Gift Cards & Rewards',
    'Gift card promotions, loyalty programs, rewards, and gifting campaigns.',
    'instagram',
    '{"primary":"#9B59B6","secondary":"#F1C40F","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#giftcard","#rewards","#loyalty","#givethegift"]'::JSONB,
    '{"style_adjectives":["gifting","celebration","reward yourself"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Breakfast & Brunch Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'breakfast', 'breakfast_brunch', 'Breakfast & Brunch',
    'Morning specials, brunch menus, breakfast promotions, and diner marketing.',
    'instagram',
    '{"primary":"#F39C12","secondary":"#E67E22","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Merriweather"}'::JSONB,
    '["#brunch","#breakfast","#morningvibes","#sundaybrunch"]'::JSONB,
    '{"style_adjectives":["morning light","cozy breakfast","brunch vibes"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- New Year's Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'new_years', 'New Year''s Celebrations',
    'NYE parties, countdown events, New Year specials, and celebration promotions.',
    'instagram',
    '{"primary":"#FFD700","secondary":"#000000","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Montserrat"}'::JSONB,
    '["#newyears","#nye","#countdown","#celebrate"]'::JSONB,
    '{"style_adjectives":["celebration","champagne toast","midnight magic"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Seafood Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'seafood', 'seafood_restaurant', 'Seafood Restaurant',
    'Fresh catch, raw bar, lobster specials, and coastal dining promotions.',
    'instagram',
    '{"primary":"#1ABC9C","secondary":"#2C3E50","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#seafood","#freshcatch","#lobster","#rawbar"]'::JSONB,
    '{"style_adjectives":["ocean fresh","coastal vibes","ice display"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- BBQ Smokehouse Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'bbq', 'bbq_smokehouse', 'BBQ & Smokehouse',
    'Smoked meats, pitmaster specials, BBQ platters, and smokehouse promotions.',
    'instagram',
    '{"primary":"#8B4513","secondary":"#D35400","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Oswald","body":"Roboto"}'::JSONB,
    '["#bbq","#smokehouse","#brisket","#lowandslowl"]'::JSONB,
    '{"style_adjectives":["smoke rings","butcher paper","pitmaster craft"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Mexican Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'mexican', 'mexican_street_food', 'Mexican & Taqueria',
    'Tacos, burritos, margaritas, and authentic Mexican restaurant promotions.',
    'instagram',
    '{"primary":"#E74C3C","secondary":"#27AE60","accent":"#F1C40F"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Open Sans"}'::JSONB,
    '["#tacos","#mexican","#margarita","#tacotuesday"]'::JSONB,
    '{"style_adjectives":["vibrant colors","street food","fiesta vibes"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Fine Dining Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'fine_dining', 'fine_dining_tasting', 'Fine Dining',
    'Tasting menus, wine pairings, chef''s table, and upscale dining experiences.',
    'instagram',
    '{"primary":"#2C3E50","secondary":"#BDC3C7","accent":"#D4AF37"}'::JSONB,
    '{"headline":"Playfair Display","body":"Cormorant Garamond"}'::JSONB,
    '["#finedining","#tastingmenu","#chefstable","#culinary"]'::JSONB,
    '{"style_adjectives":["elegant plating","candlelit ambiance","refined"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Bakery Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'bakery', 'bakery_morning_light', 'Bakery & Patisserie',
    'Fresh pastries, artisan bread, custom cakes, and bakery promotions.',
    'instagram',
    '{"primary":"#D4A574","secondary":"#8B4513","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lora"}'::JSONB,
    '["#bakery","#freshbaked","#pastry","#artisanbread"]'::JSONB,
    '{"style_adjectives":["golden morning light","flour dust","fresh from oven"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Fast Casual Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'fast_casual', 'fast_casual_fresh', 'Fast Casual',
    'Build-your-own bowls, grab-and-go, quick service with quality ingredients.',
    'instagram',
    '{"primary":"#27AE60","secondary":"#3498DB","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#fastcasual","#healthyeats","#bowls","#quicklunch"]'::JSONB,
    '{"style_adjectives":["fresh ingredients","quick service","healthy options"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Behind the Scenes Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'behind_the_scenes', 'Behind the Scenes',
    'Kitchen action, team spotlights, prep work, and restaurant life content.',
    'instagram',
    '{"primary":"#34495E","secondary":"#95A5A6","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Oswald","body":"Open Sans"}'::JSONB,
    '["#behindthescenes","#kitchenlife","#restaurantlife","#teamwork"]'::JSONB,
    '{"style_adjectives":["authentic moments","kitchen energy","real restaurant life"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Social Proof Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'social_proof_community', 'Social Proof & Reviews',
    'Customer testimonials, review highlights, community engagement, and UGC.',
    'instagram',
    '{"primary":"#9B59B6","secondary":"#3498DB","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Quicksand","body":"Work Sans"}'::JSONB,
    '["#reviews","#customerslove","#testimonial","#community"]'::JSONB,
    '{"style_adjectives":["authentic reviews","customer love","community focused"]}'::JSONB,
    'social-proof'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Hiring Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'hiring_recruitment', 'Hiring & Recruitment',
    'Now hiring posts, job openings, team culture, and recruitment campaigns.',
    'instagram',
    '{"primary":"#2ECC71","secondary":"#27AE60","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#nowhiring","#joinus","#careers","#teamwork"]'::JSONB,
    '{"style_adjectives":["team energy","opportunity","join us"]}'::JSONB,
    'hiring'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Events & Promotions Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'special_events', 'Events & Promotions',
    'Live music, trivia nights, special events, and promotional campaigns.',
    'instagram',
    '{"primary":"#E74C3C","secondary":"#9B59B6","accent":"#F1C40F"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
    '["#events","#livemusic","#trivianight","#specialevent"]'::JSONB,
    '{"style_adjectives":["event energy","celebration","entertainment"]}'::JSONB,
    'events'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- Seasonal Celebrations Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
) VALUES (
    'all_verticals', 'seasonal_celebrations', 'Seasonal & Weather',
    'Seasonal menus, weather-based promotions, and time-of-year specials.',
    'instagram',
    '{"primary":"#E67E22","secondary":"#D35400","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#seasonal","#fallmenu","#winterwarmers","#summerspecials"]'::JSONB,
    '{"style_adjectives":["seasonal vibes","weather appropriate","time of year"]}'::JSONB,
    'campaigns'
) ON CONFLICT (theme_slug) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- STEP 2: Extract input_schema from metadata for ALL templates
-- ============================================================================

-- Extract from metadata string
UPDATE creative_prompt_templates
SET input_schema = (metadata->>'input_schema')::JSONB
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null')
  AND metadata->>'input_schema' IS NOT NULL
  AND metadata->>'input_schema' != '';

-- Extract from metadata object
UPDATE creative_prompt_templates
SET input_schema = metadata->'input_schema'
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null')
  AND metadata->'input_schema' IS NOT NULL
  AND jsonb_typeof(metadata->'input_schema') = 'object';

-- ============================================================================
-- STEP 3: Link templates to themes - COMPREHENSIVE PATTERN MATCHING
-- ============================================================================

-- Story templates → Instagram Stories
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'instagram_stories'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'story-%' OR slug LIKE 'story_%' OR slug LIKE '%story%' OR campaign_channel = 'instagram_story');

-- Sports/Game Day templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'sports-%' OR slug LIKE 'gameday-%' OR slug LIKE '%gameday%' OR slug LIKE '%game-day%' OR slug LIKE '%playoff%' OR slug LIKE '%superbowl%' OR slug LIKE '%march-madness%');

-- Daily Specials & LTOs
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'daily_specials_lto'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'daily-%' OR slug LIKE 'lto-%' OR slug LIKE '%special%' OR slug LIKE '%limited%' OR slug LIKE '%weekly%' OR slug LIKE '%feature%') AND slug NOT LIKE '%drink%' AND slug NOT LIKE '%wine%';

-- Delivery & Takeout
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'delivery_takeout'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'delivery-%' OR slug LIKE 'takeout-%' OR slug LIKE '%delivery%' OR slug LIKE '%takeout%' OR slug LIKE '%curbside%' OR slug LIKE '%order-online%' OR slug LIKE '%to-go%');

-- Gift Cards & Rewards
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'giftcards_rewards'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'gift-%' OR slug LIKE 'reward-%' OR slug LIKE '%giftcard%' OR slug LIKE '%gift-card%' OR slug LIKE '%loyalty%' OR slug LIKE '%rewards%');

-- Happy Hour & Drinks
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'hh-%' OR slug LIKE 'happy-%' OR slug LIKE '%happy-hour%' OR slug LIKE '%cocktail%' OR slug LIKE '%drink%' OR slug LIKE '%beer%' OR slug LIKE '%wine%' OR slug LIKE '%margarita%');

-- UGC & Operational
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'ugc-%' OR slug LIKE 'ops-%' OR slug LIKE '%operational%' OR slug LIKE '%hours%' OR slug LIKE '%closed%' OR slug LIKE '%announcement%');

-- Holiday & Christmas (general)
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_christmas'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'holiday-%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%' OR slug LIKE '%xmas%') AND restaurant_vertical NOT IN ('pizza', 'bar_grill', 'breakfast');

-- New Year's
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'new_years'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'nye-%' OR slug LIKE '%new-year%' OR slug LIKE '%newyear%' OR slug LIKE '%countdown%' OR slug LIKE '%midnight%');

-- Pizza templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'pizza-%' OR restaurant_vertical = 'pizza') AND slug NOT LIKE '%holiday%';

-- Holiday Pizza
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_pizza'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'pizza' AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%');

-- BBQ templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'bbq-%' OR slug LIKE '%smokehouse%' OR slug LIKE '%brisket%' OR restaurant_vertical = 'bbq');

-- Seafood templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seafood_restaurant'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'seafood-%' OR slug LIKE '%lobster%' OR slug LIKE '%oyster%' OR restaurant_vertical = 'seafood');

-- Mexican templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'mexican-%' OR slug LIKE 'taco-%' OR slug LIKE '%taqueria%' OR restaurant_vertical = 'mexican');

-- Fine Dining templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'fd-%' OR slug LIKE 'fine-%' OR slug LIKE '%tasting%' OR restaurant_vertical = 'fine_dining');

-- Bakery templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'bakery-%' OR slug LIKE 'bc-%' OR slug LIKE '%pastry%' OR restaurant_vertical = 'bakery');

-- Breakfast/Brunch templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'brunch-%' OR slug LIKE 'breakfast-%' OR slug LIKE '%brunch%' OR restaurant_vertical IN ('breakfast', 'diner')) AND slug NOT LIKE '%holiday%';

-- Holiday Breakfast
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_breakfast'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical IN ('breakfast', 'diner') AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%');

-- Fast Casual templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'fc-%' OR slug LIKE 'fast-%' OR restaurant_vertical = 'fast_casual');

-- Bar & Grill (non-holiday, non-sports, non-drinks)
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'bar_grill' AND slug NOT LIKE '%holiday%' AND slug NOT LIKE '%sport%' AND slug NOT LIKE '%game%';

-- Holiday Bar & Grill
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_bar_grill'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'bar_grill' AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%');

-- Behind the Scenes
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'bts-%' OR slug LIKE '%behind%' OR slug LIKE '%kitchen%' OR slug LIKE '%team%' OR slug LIKE '%staff%');

-- Social Proof
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE '%review%' OR slug LIKE '%testimonial%' OR slug LIKE '%social-proof%' OR slug LIKE '%customer%');

-- Hiring
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'hiring_recruitment'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'hiring-%' OR slug LIKE '%hiring%' OR slug LIKE '%job%' OR slug LIKE '%career%' OR slug LIKE '%join%');

-- Events
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'event-%' OR slug LIKE '%event%' OR slug LIKE '%trivia%' OR slug LIKE '%music%' OR slug LIKE '%party%') AND slug NOT LIKE '%holiday%';

-- Seasonal
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'), updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE '%seasonal%' OR slug LIKE '%winter%' OR slug LIKE '%summer%' OR slug LIKE '%fall%' OR slug LIKE '%spring%' OR slug LIKE '%weather%');

-- ============================================================================
-- STEP 4: Catch-all for remaining orphans by restaurant_vertical
-- ============================================================================

-- Any remaining all_verticals → General Templates
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'all_verticals';

-- Any remaining with specific verticals
UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'pizza';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'bbq';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seafood_restaurant'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'seafood';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'mexican';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'fine_dining';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'bakery';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical IN ('breakfast', 'diner');

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'fast_casual';

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'), updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'bar_grill';

-- ============================================================================
-- STEP 5: Final catch-all - link ANY remaining orphans to General
-- ============================================================================

UPDATE creative_prompt_templates SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'), updated_at = NOW()
WHERE theme_id IS NULL;

-- ============================================================================
-- STEP 6: Ensure display_name is set
-- ============================================================================

UPDATE creative_prompt_templates SET display_name = name WHERE display_name IS NULL AND name IS NOT NULL;

-- ============================================================================
-- STEP 7: Ensure variation_tags is valid JSON array
-- ============================================================================

UPDATE creative_prompt_templates SET variation_tags = '[]'::JSONB WHERE variation_tags IS NULL OR variation_tags::TEXT = 'null';

-- ============================================================================
-- STEP 8: Verification Query
-- ============================================================================

DO $$
DECLARE
    total_templates INTEGER;
    linked_templates INTEGER;
    orphaned_templates INTEGER;
    templates_with_schema INTEGER;
    theme_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_templates FROM creative_prompt_templates WHERE is_active = TRUE;
    SELECT COUNT(*) INTO linked_templates FROM creative_prompt_templates WHERE theme_id IS NOT NULL AND is_active = TRUE;
    SELECT COUNT(*) INTO orphaned_templates FROM creative_prompt_templates WHERE theme_id IS NULL AND is_active = TRUE;
    SELECT COUNT(*) INTO templates_with_schema FROM creative_prompt_templates 
        WHERE input_schema IS NOT NULL AND input_schema != '{}'::JSONB AND input_schema::TEXT != 'null' AND is_active = TRUE;
    SELECT COUNT(*) INTO theme_count FROM creative_prompt_themes;
    
    RAISE NOTICE '=== Comprehensive Template Theme Fix Summary ===';
    RAISE NOTICE 'Total active templates: %', total_templates;
    RAISE NOTICE 'Linked to themes: %', linked_templates;
    RAISE NOTICE 'Still orphaned: %', orphaned_templates;
    RAISE NOTICE 'With input_schema: %', templates_with_schema;
    RAISE NOTICE 'Total themes: %', theme_count;
END $$;

-- Show theme distribution
SELECT 
    t.name as theme_name,
    t.theme_slug,
    t.category,
    COUNT(p.id) as template_count
FROM creative_prompt_themes t
LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id AND p.is_active = TRUE
GROUP BY t.id, t.name, t.theme_slug, t.category
ORDER BY template_count DESC;


-- ============================================================================
-- STEP 9: Ensure all themes have correct category for frontend tabs
-- ============================================================================
-- Frontend tabs: 'campaigns', 'social-proof', 'hiring', 'events'
-- Themes without category default to 'campaigns'

-- Set category for all themes that don't have one
UPDATE creative_prompt_themes SET category = 'campaigns' WHERE category IS NULL;

-- Social Proof themes
UPDATE creative_prompt_themes SET category = 'social-proof' 
WHERE theme_slug IN ('social_proof_community', 'social_proof', 'reviews', 'testimonials', 'ugc_community')
   OR name ILIKE '%social proof%' OR name ILIKE '%review%' OR name ILIKE '%testimonial%';

-- Hiring themes
UPDATE creative_prompt_themes SET category = 'hiring'
WHERE theme_slug IN ('hiring_recruitment', 'hiring', 'careers', 'jobs', 'recruitment')
   OR name ILIKE '%hiring%' OR name ILIKE '%recruit%' OR name ILIKE '%career%' OR name ILIKE '%job%';

-- Events themes
UPDATE creative_prompt_themes SET category = 'events'
WHERE theme_slug IN ('special_events', 'events', 'live_music', 'trivia', 'entertainment')
   OR name ILIKE '%event%' OR name ILIKE '%trivia%' OR name ILIKE '%music%' OR name ILIKE '%party%'
   AND theme_slug NOT LIKE '%holiday%';

-- Everything else is campaigns (default)
UPDATE creative_prompt_themes SET category = 'campaigns' 
WHERE category NOT IN ('campaigns', 'social-proof', 'hiring', 'events');

-- ============================================================================
-- STEP 10: Final verification - show what frontend will see
-- ============================================================================

SELECT 
    category,
    COUNT(*) as theme_count,
    SUM(template_count) as total_templates
FROM (
    SELECT 
        t.category,
        t.name,
        COUNT(p.id) as template_count
    FROM creative_prompt_themes t
    LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id AND p.is_active = TRUE
    GROUP BY t.id, t.category, t.name
) sub
GROUP BY category
ORDER BY category;

-- Show themes with their template counts
SELECT 
    t.category,
    t.name as theme_name,
    t.theme_slug,
    t.restaurant_vertical,
    COUNT(p.id) as template_count
FROM creative_prompt_themes t
LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id AND p.is_active = TRUE
GROUP BY t.id, t.category, t.name, t.theme_slug, t.restaurant_vertical
HAVING COUNT(p.id) > 0
ORDER BY t.category, template_count DESC;
