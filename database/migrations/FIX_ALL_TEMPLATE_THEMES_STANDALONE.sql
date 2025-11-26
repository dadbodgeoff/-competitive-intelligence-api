-- ============================================================================
-- STANDALONE FIX: Link All Templates to Themes
-- ============================================================================
-- Description : Run this STANDALONE in Supabase SQL Editor to fix all templates
--               that are missing theme_id associations. This will make them
--               appear in the frontend Creative module.
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Run it
-- 4. Verify with the queries at the bottom
-- ============================================================================

-- ============================================================================
-- STEP 1: Create all required themes
-- ============================================================================

-- Happy Hour & Drinks Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'bar_grill',
    'happy_hour_drinks',
    'Happy Hour & Drinks',
    'Cocktail specials, happy hour deals, daily drink specials, and beverage-focused promotions.',
    'instagram',
    '{"primary":"#7B2D8E","secondary":"#F39C12","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Abril Fatface","body":"Raleway"}'::JSONB,
    '["#happyhour","#cocktails","#drinkspecials","#cheers"]'::JSONB,
    '{"style_adjectives":["golden hour warmth","bar ambiance","cocktail artistry","social atmosphere"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- UGC & Operational Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'ugc_operational',
    'UGC & Operational',
    'User-generated content campaigns, review requests, operational announcements, hours updates, and community engagement.',
    'instagram',
    '{"primary":"#6C5CE7","secondary":"#A29BFE","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Quicksand","body":"Work Sans"}'::JSONB,
    '["#behindthescenes","#teamwork","#restaurantlife","#community"]'::JSONB,
    '{"style_adjectives":["authentic moments","team energy","real restaurant life","community focused"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Holiday Christmas Complete Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'holiday_christmas',
    'Holiday & Christmas',
    'Festive holiday templates for Christmas parties, seasonal menus, gift cards, and year-end celebrations.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#165B33","accent":"#FFD700"}'::JSONB,
    '{"headline":"Playfair Display","body":"Merriweather"}'::JSONB,
    '["#holidayseason","#christmas","#festive","#celebrate"]'::JSONB,
    '{"style_adjectives":["warm festive glow","holiday sparkle","cozy celebration","seasonal magic"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Holiday Bar & Grill Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'bar_grill',
    'holiday_bar_grill',
    'Holiday Bar & Grill',
    'Holiday parties, festive drink specials, game day holiday events, and seasonal bar promotions.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#2C3E50","accent":"#FFD700"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
    '["#holidayparty","#festivedrinks","#barlife","#celebrate"]'::JSONB,
    '{"style_adjectives":["festive bar atmosphere","holiday cocktails","party energy","seasonal celebration"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Holiday Breakfast & Diner Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'breakfast',
    'holiday_breakfast',
    'Holiday Breakfast & Brunch',
    'Christmas brunch, holiday breakfast specials, festive morning menus, and diner holiday promotions.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#F39C12","accent":"#165B33"}'::JSONB,
    '{"headline":"Playfair Display","body":"Merriweather"}'::JSONB,
    '["#holidaybrunch","#christmasbreakfast","#festivebrunch","#morningmagic"]'::JSONB,
    '{"style_adjectives":["cozy holiday morning","festive breakfast","family gathering","seasonal warmth"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pizza Restaurant Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'pizza',
    'pizza_restaurant',
    'Pizza Restaurant',
    'Artisan pizza, cheese pulls, wood-fired ovens, Italian dining, and pizzeria promotions.',
    'instagram',
    '{"primary":"#E74C3C","secondary":"#F39C12","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Oswald","body":"Open Sans"}'::JSONB,
    '["#pizza","#pizzanight","#italianfood","#woodfired"]'::JSONB,
    '{"style_adjectives":["cheese pull","wood-fired","artisan craft","Italian authenticity"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Holiday Pizza Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'pizza',
    'holiday_pizza',
    'Holiday Pizza Specials',
    'Christmas and holiday-themed pizza promotions, NYE pizza parties, and seasonal specials.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#165B33","accent":"#F39C12"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#holidaypizza","#christmaspizza","#festive","#pizzaparty"]'::JSONB,
    '{"style_adjectives":["festive pizza","holiday gathering","seasonal toppings","celebration ready"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Daily Drink Specials Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'bar_grill',
    'daily_drink_specials',
    'Daily Drink Specials',
    'Wine Wednesday, Thirsty Thursday, Margarita Monday, Sunday Funday, and other daily drink promotions.',
    'instagram',
    '{"primary":"#9B59B6","secondary":"#3498DB","accent":"#F1C40F"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#winewednesday","#thirstythursday","#margaritamonday","#sundayfunday"]'::JSONB,
    '{"style_adjectives":["daily special energy","drink feature","weekday promotion","recurring deal"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Instagram Stories Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'instagram_stories',
    'Instagram Stories',
    'Vertical 9:16 story templates for announcements, engagement, and quick updates.',
    'instagram_story',
    '{"primary":"#667EEA","secondary":"#764BA2","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Poppins","body":"Inter"}'::JSONB,
    '["#instastory","#restaurantlife","#foodie","#localfood"]'::JSONB,
    '{"style_adjectives":["bold typography","vertical format","swipe-up ready","engagement focused"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sports & Game Day Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'bar_grill',
    'sports_gameday',
    'Sports & Game Day',
    'High-energy sports bar templates for watch parties, game day specials, and championship events.',
    'instagram',
    '{"primary":"#1E3A5F","secondary":"#FF6B35","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Oswald","body":"Roboto"}'::JSONB,
    '["#gameday","#watchparty","#sportsbar","#wings"]'::JSONB,
    '{"style_adjectives":["TV glow atmosphere","crowd energy","sports bar authentic","game day excitement"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Gift Cards & Rewards Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'giftcards_rewards',
    'Gift Cards & Rewards',
    'Gift card promotions, loyalty programs, and reward announcements.',
    'instagram',
    '{"primary":"#D4AF37","secondary":"#1A1A2E","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#giftcard","#treatyourself","#rewards","#loyalty"]'::JSONB,
    '{"style_adjectives":["premium presentation","gift-worthy styling","celebration ready","elegant packaging"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- New Year's Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'new_years',
    'New Year''s Eve & Day',
    'NYE countdown parties, champagne toasts, and New Year''s Day specials.',
    'instagram',
    '{"primary":"#FFD700","secondary":"#000000","accent":"#C0C0C0"}'::JSONB,
    '{"headline":"Cinzel","body":"Montserrat"}'::JSONB,
    '["#nye","#newyear","#countdown","#cheers"]'::JSONB,
    '{"style_adjectives":["glamorous celebration","midnight magic","champagne sparkle","fresh start energy"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Daily Specials & LTO Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'daily_specials_lto',
    'Daily Specials & LTOs',
    'Limited-time offers, daily specials, and rotating menu features.',
    'instagram',
    '{"primary":"#FF6B35","secondary":"#004E89","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Open Sans"}'::JSONB,
    '["#dailyspecial","#limitedtime","#todayonly","#dontmissout"]'::JSONB,
    '{"style_adjectives":["urgency driven","eye-catching","special highlight","limited availability"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Delivery & Takeout Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'delivery_takeout',
    'Delivery & Takeout',
    'Online ordering promotions, delivery deals, and takeout specials.',
    'instagram',
    '{"primary":"#00B894","secondary":"#2D3436","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Poppins","body":"Nunito"}'::JSONB,
    '["#delivery","#takeout","#ordernow","#fooddelivery"]'::JSONB,
    '{"style_adjectives":["convenience focused","app-ready","doorstep delivery","packaging showcase"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Breakfast & Brunch Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'breakfast',
    'breakfast_brunch',
    'Breakfast & Brunch',
    'Morning specials, brunch menus, and breakfast promotions.',
    'instagram',
    '{"primary":"#F39C12","secondary":"#E74C3C","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Josefin Sans","body":"Lora"}'::JSONB,
    '["#brunch","#breakfast","#morningvibes","#weekendbrunch"]'::JSONB,
    '{"style_adjectives":["morning light","cozy breakfast","brunch spread","weekend vibes"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- General/Cross-Vertical Theme (catch-all)
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'cross_vertical_general',
    'General Templates',
    'Versatile templates that work across all restaurant types.',
    'instagram',
    '{"primary":"#3498DB","secondary":"#2C3E50","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#restaurant","#foodie","#localfood","#eatlocal"]'::JSONB,
    '{"style_adjectives":["versatile","professional","clean","modern"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- ============================================================================
-- STEP 2: Extract input_schema from metadata
-- ============================================================================

-- Extract from metadata string
UPDATE creative_prompt_templates
SET input_schema = (metadata->>'input_schema')::JSONB
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null' OR input_schema::TEXT = '{}')
  AND metadata->>'input_schema' IS NOT NULL
  AND metadata->>'input_schema' != ''
  AND metadata->>'input_schema' != 'null';

-- Extract from nested object
UPDATE creative_prompt_templates
SET input_schema = metadata->'input_schema'
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null' OR input_schema::TEXT = '{}')
  AND metadata->'input_schema' IS NOT NULL
  AND jsonb_typeof(metadata->'input_schema') = 'object';

-- ============================================================================
-- STEP 3: Link templates to themes by slug pattern
-- ============================================================================

-- Happy Hour templates (hh-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'hh-%' OR slug LIKE 'hh_%');

-- Daily drink specials (daily-* for drinks)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'daily_drink_specials'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'daily-%' OR slug LIKE 'daily_%')
  AND (slug LIKE '%wine%' OR slug LIKE '%margarita%' OR slug LIKE '%thirsty%' OR slug LIKE '%sunday%' OR slug LIKE '%drink%');

-- UGC templates (ugc-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'ugc-%' OR slug LIKE 'ugc_%');

-- Operational templates (ops-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'ops-%' OR slug LIKE 'ops_%');

-- Holiday Christmas templates (holiday-sq-*, holiday-story-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_christmas'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'holiday-sq-%' OR slug LIKE 'holiday-story-%' OR slug LIKE 'holiday_sq_%' OR slug LIKE 'holiday_story_%')
  AND restaurant_vertical NOT IN ('pizza', 'bar_grill', 'breakfast', 'diner');

-- Holiday Bar & Grill templates (holiday-bg-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_bar_grill'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'holiday-bg-%' OR slug LIKE 'holiday_bg_%');

-- Holiday Breakfast/Diner templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_breakfast'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'holiday-breakfast-%' OR slug LIKE 'holiday-diner-%' OR slug LIKE 'holiday_breakfast_%' OR slug LIKE 'holiday_diner_%');

-- Pizza Restaurant templates (pizza-sq-*, pizza-story-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'pizza-sq-%' OR slug LIKE 'pizza-story-%' OR slug LIKE 'pizza_sq_%' OR slug LIKE 'pizza_story_%')
  AND slug NOT LIKE '%holiday%';

-- Holiday Pizza templates (holiday-pizza-*)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_pizza'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'holiday-pizza-%' OR slug LIKE 'holiday_pizza_%');

-- Sports & Game Day templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE 'sports-%' OR slug LIKE 'sports_%' OR slug LIKE '%gameday%');

-- Gift Cards templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'giftcards_rewards'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE '%gift%card%' OR slug LIKE '%giftcard%' OR slug LIKE '%reward%');

-- New Year's templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'new_years'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE '%nye%' OR slug LIKE '%new-year%' OR slug LIKE '%new_year%');

-- Delivery & Takeout templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'delivery_takeout'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND (slug LIKE '%delivery%' OR slug LIKE '%takeout%' OR slug LIKE '%pickup%');

-- Instagram Story templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'instagram_stories'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND campaign_channel = 'instagram_story';

-- ============================================================================
-- STEP 4: Link by restaurant_vertical + keywords
-- ============================================================================

-- Remaining holiday bar_grill
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_bar_grill'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'bar_grill'
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%' OR slug LIKE '%nye%');

-- Remaining holiday breakfast/diner
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_breakfast'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical IN ('breakfast', 'diner')
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%');

-- Remaining holiday pizza
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_pizza'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'pizza'
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%' OR slug LIKE '%nye%');

-- Remaining pizza templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical = 'pizza';

-- Remaining bar_grill drink templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'bar_grill'
  AND (slug LIKE '%happy%' OR slug LIKE '%cocktail%' OR slug LIKE '%drink%' OR slug LIKE '%beer%' OR slug LIKE '%wine%');

-- Remaining all_verticals holiday
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_christmas'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'all_verticals'
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%');

-- Remaining breakfast templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL AND restaurant_vertical IN ('breakfast', 'diner');

-- ============================================================================
-- STEP 5: Final cleanup
-- ============================================================================

-- Fix variation_tags
UPDATE creative_prompt_templates
SET variation_tags = '[]'::JSONB
WHERE variation_tags IS NULL OR variation_tags::TEXT = 'null';

-- Set display_name from name
UPDATE creative_prompt_templates
SET display_name = name
WHERE display_name IS NULL AND name IS NOT NULL;

-- Link remaining orphans to general theme
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check orphaned templates (should be 0)
SELECT COUNT(*) as orphaned_count 
FROM creative_prompt_templates 
WHERE theme_id IS NULL AND is_active = TRUE;

-- Check templates per theme
SELECT 
    t.name as theme_name,
    t.theme_slug,
    COUNT(p.id) as template_count
FROM creative_prompt_themes t
LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id AND p.is_active = TRUE
GROUP BY t.id, t.name, t.theme_slug
ORDER BY template_count DESC;

-- Check templates with input_schema
SELECT 
    COUNT(*) FILTER (WHERE input_schema IS NOT NULL AND input_schema != '{}'::JSONB) as with_schema,
    COUNT(*) FILTER (WHERE input_schema IS NULL OR input_schema = '{}'::JSONB) as without_schema,
    COUNT(*) as total
FROM creative_prompt_templates
WHERE is_active = TRUE;

-- ============================================================================
-- END
-- ============================================================================
