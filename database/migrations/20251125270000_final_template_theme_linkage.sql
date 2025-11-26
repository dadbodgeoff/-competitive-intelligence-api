-- ============================================================================
-- MIGRATION: Final Template Theme Linkage
-- ============================================================================
-- Description : Comprehensive fix to ensure ALL templates from recent migrations
--               are properly linked to themes and have input_schema extracted.
--               This handles the specific migrations:
--               - 20251125180000_happy_hour_drinks_templates.sql
--               - 20251125190000_ugc_operational_templates.sql
--               - 20251125200000_holiday_christmas_templates_complete.sql
--               - 20251125210000_holiday_bar_grill_templates.sql
--               - 20251125220000_holiday_breakfast_diner_templates.sql
--               - 20251125230000_pizza_restaurant_templates.sql
--               - 20251125240000_holiday_pizza_templates.sql
-- Author      : Kiro
-- Date        : 2025-11-25
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure all required themes exist
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

-- Pizza Restaurant Theme (non-holiday)
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

-- Daily Drink Specials Theme (for wine wednesday, thirsty thursday, etc.)
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

-- ============================================================================
-- STEP 2: Extract input_schema from metadata for ALL templates
-- ============================================================================

-- Extract input_schema from metadata where it's stored as a JSON string
UPDATE creative_prompt_templates
SET input_schema = (metadata->>'input_schema')::JSONB
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null' OR input_schema::TEXT = '{}')
  AND metadata->>'input_schema' IS NOT NULL
  AND metadata->>'input_schema' != ''
  AND metadata->>'input_schema' != 'null';

-- Extract input_schema from metadata where it's stored as a nested object
UPDATE creative_prompt_templates
SET input_schema = metadata->'input_schema'
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null' OR input_schema::TEXT = '{}')
  AND metadata->'input_schema' IS NOT NULL
  AND jsonb_typeof(metadata->'input_schema') = 'object';

-- ============================================================================
-- STEP 3: Link templates to themes based on slug patterns
-- ============================================================================

-- Happy Hour templates (hh-* prefix)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'hh-%' OR slug LIKE 'hh_%');

-- Daily drink specials (daily-* prefix for drinks)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'daily_drink_specials'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'daily-%' OR slug LIKE 'daily_%')
  AND (slug LIKE '%wine%' OR slug LIKE '%margarita%' OR slug LIKE '%thirsty%' OR slug LIKE '%sunday%' OR slug LIKE '%drink%');

-- UGC templates (ugc-* prefix)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'ugc-%' OR slug LIKE 'ugc_%');

-- Operational templates (ops-* prefix)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'ops-%' OR slug LIKE 'ops_%');

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
WHERE theme_id IS NULL 
  AND (slug LIKE 'holiday-bg-%' OR slug LIKE 'holiday_bg_%');

-- Holiday Breakfast/Diner templates (holiday-breakfast-*, holiday-diner-*)
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
WHERE theme_id IS NULL 
  AND (slug LIKE 'holiday-pizza-%' OR slug LIKE 'holiday_pizza_%');

-- ============================================================================
-- STEP 4: Catch remaining templates by restaurant_vertical + keywords
-- ============================================================================

-- Any remaining holiday templates for bar_grill vertical
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_bar_grill'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'bar_grill'
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%' OR slug LIKE '%nye%');

-- Any remaining holiday templates for breakfast/diner vertical
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_breakfast'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical IN ('breakfast', 'diner')
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%');

-- Any remaining holiday templates for pizza vertical
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_pizza'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'pizza'
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%' OR slug LIKE '%nye%');

-- Any remaining pizza templates (non-holiday)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'pizza';

-- Any remaining bar_grill templates with happy hour/drink keywords
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'bar_grill'
  AND (slug LIKE '%happy%' OR slug LIKE '%cocktail%' OR slug LIKE '%drink%' OR slug LIKE '%beer%' OR slug LIKE '%wine%');

-- Any remaining all_verticals holiday templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_christmas'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'all_verticals'
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%festive%');

-- ============================================================================
-- STEP 5: Ensure variation_tags is valid
-- ============================================================================

UPDATE creative_prompt_templates
SET variation_tags = '[]'::JSONB
WHERE variation_tags IS NULL OR variation_tags::TEXT = 'null';

-- ============================================================================
-- STEP 6: Set display_name from name if missing
-- ============================================================================

UPDATE creative_prompt_templates
SET display_name = name
WHERE display_name IS NULL AND name IS NOT NULL;

-- ============================================================================
-- STEP 7: Final catch-all for any remaining orphans
-- ============================================================================

-- Create general theme if not exists
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

-- Link any remaining orphans
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL;

-- ============================================================================
-- STEP 8: Log results
-- ============================================================================

DO $
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
    
    RAISE NOTICE '=== Final Template Theme Linkage Summary ===';
    RAISE NOTICE 'Total active templates: %', total_templates;
    RAISE NOTICE 'Linked to themes: %', linked_templates;
    RAISE NOTICE 'Still orphaned: %', orphaned_templates;
    RAISE NOTICE 'With input_schema: %', templates_with_schema;
    RAISE NOTICE 'Total themes: %', theme_count;
END $;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
