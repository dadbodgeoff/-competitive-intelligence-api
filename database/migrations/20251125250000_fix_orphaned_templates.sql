-- ============================================================================
-- MIGRATION: Fix Orphaned Templates - Link to Themes
-- ============================================================================
-- Description : Creates missing themes and links all orphaned templates
--               that were inserted without theme_id associations.
--               Also extracts input_schema from metadata where needed.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Issue       : Templates not showing in frontend because they lack theme_id
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Missing Themes for New Template Categories
-- ============================================================================

-- Instagram Stories Theme (for story-* templates)
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'all_verticals',
    'instagram_stories',
    'Instagram Stories',
    'Vertical 9:16 story templates for announcements, engagement, and quick updates. Typography-focused, no food imagery required.',
    'instagram_story',
    '{"primary":"#667EEA","secondary":"#764BA2","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Poppins","body":"Inter"}'::JSONB,
    '["#instastory","#restaurantlife","#foodie","#localfood"]'::JSONB,
    '{
        "style_adjectives":["bold typography","vertical format","swipe-up ready","engagement focused"],
        "texture_options":["gradient backgrounds","textured surfaces","brand colors"],
        "camera_styles":["full bleed","centered text","sticker-ready layout"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Sports & Game Day Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
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
    '{
        "style_adjectives":["TV glow atmosphere","crowd energy","sports bar authentic","game day excitement"],
        "texture_options":["screen reflections","condensation on glasses","motion blur crowds"],
        "camera_styles":["wide venue shot","hero platter with TVs","crowd reaction"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Gift Cards & Rewards Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'all_verticals',
    'giftcards_rewards',
    'Gift Cards & Rewards',
    'Gift card promotions, loyalty programs, and reward announcements for any restaurant type.',
    'instagram',
    '{"primary":"#D4AF37","secondary":"#1A1A2E","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#giftcard","#treatyourself","#rewards","#loyalty"]'::JSONB,
    '{
        "style_adjectives":["premium presentation","gift-worthy styling","celebration ready","elegant packaging"],
        "texture_options":["ribbon textures","metallic accents","soft bokeh"],
        "camera_styles":["product hero","lifestyle context","gift-giving moment"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Holiday & Christmas Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'all_verticals',
    'holiday_christmas',
    'Holiday & Christmas',
    'Festive holiday templates for Christmas parties, seasonal menus, and year-end celebrations.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#165B33","accent":"#FFD700"}'::JSONB,
    '{"headline":"Playfair Display","body":"Merriweather"}'::JSONB,
    '["#holidayseason","#christmas","#festive","#celebrate"]'::JSONB,
    '{
        "style_adjectives":["warm festive glow","holiday sparkle","cozy celebration","seasonal magic"],
        "texture_options":["twinkling lights","evergreen textures","snow accents"],
        "camera_styles":["warm interior","festive table setting","holiday decor context"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- New Year's Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'all_verticals',
    'new_years',
    'New Year''s Eve & Day',
    'NYE countdown parties, champagne toasts, and New Year''s Day recovery specials.',
    'instagram',
    '{"primary":"#FFD700","secondary":"#000000","accent":"#C0C0C0"}'::JSONB,
    '{"headline":"Cinzel","body":"Montserrat"}'::JSONB,
    '["#nye","#newyear","#countdown","#cheers"]'::JSONB,
    '{
        "style_adjectives":["glamorous celebration","midnight magic","champagne sparkle","fresh start energy"],
        "texture_options":["confetti","champagne bubbles","glitter accents"],
        "camera_styles":["celebration moment","champagne pour","countdown energy"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Daily Specials & LTO Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
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
    '{
        "style_adjectives":["urgency driven","eye-catching","special highlight","limited availability"],
        "texture_options":["bold graphics","countdown elements","spotlight effect"],
        "camera_styles":["hero dish focus","menu board style","action shot"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Happy Hour & Drinks Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'bar_grill',
    'happy_hour_drinks',
    'Happy Hour & Drinks',
    'Cocktail specials, happy hour deals, and beverage-focused promotions.',
    'instagram',
    '{"primary":"#7B2D8E","secondary":"#F39C12","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Abril Fatface","body":"Raleway"}'::JSONB,
    '["#happyhour","#cocktails","#drinkspecials","#cheers"]'::JSONB,
    '{
        "style_adjectives":["golden hour warmth","bar ambiance","cocktail artistry","social atmosphere"],
        "texture_options":["condensation","ice cubes","garnish details"],
        "camera_styles":["drink hero","bar lineup","pour action"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Delivery & Takeout Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
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
    '{
        "style_adjectives":["convenience focused","app-ready","doorstep delivery","packaging showcase"],
        "texture_options":["branded packaging","delivery bags","QR codes"],
        "camera_styles":["packaging hero","doorstep moment","order ready"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- UGC & Operational Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'all_verticals',
    'ugc_operational',
    'UGC & Operational',
    'User-generated content prompts, behind-the-scenes, hiring, and operational announcements.',
    'instagram',
    '{"primary":"#6C5CE7","secondary":"#A29BFE","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Quicksand","body":"Work Sans"}'::JSONB,
    '["#behindthescenes","#teamwork","#restaurantlife","#nowhiring"]'::JSONB,
    '{
        "style_adjectives":["authentic moments","team energy","real restaurant life","community focused"],
        "texture_options":["candid shots","kitchen action","team photos"],
        "camera_styles":["documentary style","action shots","team portraits"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Breakfast & Brunch Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
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
    '{
        "style_adjectives":["morning light","cozy breakfast","brunch spread","weekend vibes"],
        "texture_options":["steam rising","syrup drizzle","coffee pour"],
        "camera_styles":["overhead spread","hero stack","table setting"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Pizza Restaurant Theme (for non-holiday pizza templates)
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'pizza',
    'pizza_restaurant',
    'Pizza Restaurant',
    'Artisan pizza, Italian dining, and pizzeria promotions.',
    'instagram',
    '{"primary":"#E74C3C","secondary":"#F39C12","accent":"#FFFFFF"}'::JSONB,
    '{"headline":"Oswald","body":"Open Sans"}'::JSONB,
    '["#pizza","#pizzanight","#italianfood","#woodfired"]'::JSONB,
    '{
        "style_adjectives":["cheese pull","wood-fired","artisan craft","Italian authenticity"],
        "texture_options":["bubbling cheese","charred crust","flour dust"],
        "camera_styles":["overhead slice","cheese pull action","oven shot"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Holiday Pizza Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'pizza',
    'holiday_pizza',
    'Holiday Pizza Specials',
    'Christmas and holiday-themed pizza promotions and seasonal specials.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#165B33","accent":"#F39C12"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
    '["#holidaypizza","#christmaspizza","#festive","#pizzaparty"]'::JSONB,
    '{
        "style_adjectives":["festive pizza","holiday gathering","seasonal toppings","celebration ready"],
        "texture_options":["holiday decor","twinkling lights","festive table"],
        "camera_styles":["party spread","festive setting","family style"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Holiday Bar & Grill Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'bar_grill',
    'holiday_bar_grill',
    'Holiday Bar & Grill',
    'Holiday parties, festive drink specials, and seasonal bar promotions.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#2C3E50","accent":"#FFD700"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
    '["#holidayparty","#festivedrinks","#barlife","#celebrate"]'::JSONB,
    '{
        "style_adjectives":["festive bar atmosphere","holiday cocktails","party energy","seasonal celebration"],
        "texture_options":["holiday lights","garnish details","festive decor"],
        "camera_styles":["bar setup","cocktail hero","party atmosphere"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Holiday Breakfast Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'breakfast',
    'holiday_breakfast',
    'Holiday Breakfast & Brunch',
    'Christmas brunch, holiday breakfast specials, and festive morning menus.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#F39C12","accent":"#165B33"}'::JSONB,
    '{"headline":"Playfair Display","body":"Merriweather"}'::JSONB,
    '["#holidaybrunch","#christmasbreakfast","#festivebrunch","#morningmagic"]'::JSONB,
    '{
        "style_adjectives":["cozy holiday morning","festive breakfast","family gathering","seasonal warmth"],
        "texture_options":["holiday table setting","morning light","festive garnishes"],
        "camera_styles":["brunch spread","cozy setting","family style"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();


-- ============================================================================
-- STEP 2: Link Orphaned Templates to Themes
-- ============================================================================

-- Link Instagram Story templates to instagram_stories theme
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'instagram_stories'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'story-%' OR slug LIKE 'story_%' OR campaign_channel = 'instagram_story');

-- Link Sports & Game Day templates to sports_gameday theme
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE 'sports-%' OR slug LIKE 'sports_%' OR slug LIKE '%gameday%' OR slug LIKE '%game-day%');

-- Link Gift Card & Rewards templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'giftcards_rewards'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%gift%card%' OR slug LIKE '%giftcard%' OR slug LIKE '%reward%' OR slug LIKE '%loyalty%');

-- Link Holiday & Christmas templates (non-pizza, non-bar, non-breakfast)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_christmas'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%xmas%' OR slug LIKE '%festive%')
  AND restaurant_vertical NOT IN ('pizza', 'bar_grill', 'breakfast');

-- Link Holiday Pizza templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_pizza'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%xmas%')
  AND restaurant_vertical = 'pizza';

-- Link Holiday Bar & Grill templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_bar_grill'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%xmas%')
  AND restaurant_vertical = 'bar_grill';

-- Link Holiday Breakfast templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'holiday_breakfast'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%holiday%' OR slug LIKE '%christmas%' OR slug LIKE '%xmas%')
  AND restaurant_vertical IN ('breakfast', 'diner');

-- Link New Year's templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'new_years'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%nye%' OR slug LIKE '%new-year%' OR slug LIKE '%new_year%' OR slug LIKE '%newyear%');

-- Link Daily Specials & LTO templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'daily_specials_lto'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%special%' OR slug LIKE '%lto%' OR slug LIKE '%limited%' OR slug LIKE '%daily%')
  AND slug NOT LIKE '%holiday%';

-- Link Happy Hour & Drinks templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%happy%hour%' OR slug LIKE '%happyhour%' OR slug LIKE '%cocktail%' OR slug LIKE '%drink%')
  AND slug NOT LIKE '%sports%';

-- Link Delivery & Takeout templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'delivery_takeout'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%delivery%' OR slug LIKE '%takeout%' OR slug LIKE '%take-out%' OR slug LIKE '%pickup%' OR slug LIKE '%to-go%');

-- Link UGC & Operational templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%ugc%' OR slug LIKE '%hiring%' OR slug LIKE '%behind%' OR slug LIKE '%team%' OR slug LIKE '%operational%');

-- Link Breakfast & Brunch templates (non-holiday)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical IN ('breakfast', 'diner')
  AND slug NOT LIKE '%holiday%';

-- Link Pizza Restaurant templates (non-holiday)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND restaurant_vertical = 'pizza'
  AND slug NOT LIKE '%holiday%';

-- Link Weather-related templates to operational
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%weather%' OR slug LIKE '%rain%' OR slug LIKE '%snow%' OR slug LIKE '%cold%' OR slug LIKE '%hot%');

-- ============================================================================
-- STEP 3: Catch-all for any remaining orphaned templates
-- Link to a general "cross_vertical" theme
-- ============================================================================

-- Create a catch-all theme if it doesn't exist
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
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
    '{
        "style_adjectives":["versatile","professional","clean","modern"],
        "texture_options":["clean backgrounds","subtle textures","brand colors"],
        "camera_styles":["hero shot","lifestyle","product focus"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Link any remaining orphaned templates to the general theme
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    input_schema = COALESCE(
        CASE 
            WHEN metadata->>'input_schema' IS NOT NULL 
            THEN (metadata->>'input_schema')::JSONB 
            ELSE input_schema 
        END,
        '{}'::JSONB
    ),
    display_name = COALESCE(display_name, name),
    updated_at = NOW()
WHERE theme_id IS NULL;

-- ============================================================================
-- STEP 4: Ensure all templates have proper variation_tags
-- ============================================================================

UPDATE creative_prompt_templates
SET variation_tags = '[]'::JSONB
WHERE variation_tags IS NULL OR variation_tags::TEXT = 'null';

-- ============================================================================
-- STEP 5: Extract input_schema from metadata for all templates
-- ============================================================================

-- For templates where input_schema is empty but metadata has it
UPDATE creative_prompt_templates
SET input_schema = (metadata->>'input_schema')::JSONB
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema = 'null'::JSONB)
  AND metadata->>'input_schema' IS NOT NULL;

-- Also extract description, use_case from metadata if available
UPDATE creative_prompt_templates
SET 
    description = COALESCE(description, metadata->>'description'),
    use_case = COALESCE(use_case, metadata->>'use_case', metadata->>'content_type')
WHERE metadata IS NOT NULL AND metadata != '{}'::JSONB;

-- Extract best_for array from metadata using proper JSONB array conversion
UPDATE creative_prompt_templates
SET best_for = ARRAY(SELECT jsonb_array_elements_text(metadata->'best_for'))
WHERE metadata->'best_for' IS NOT NULL 
  AND jsonb_typeof(metadata->'best_for') = 'array'
  AND best_for IS NULL;

-- ============================================================================
-- STEP 6: Log the results
-- ============================================================================

DO $$
DECLARE
    total_templates INTEGER;
    linked_templates INTEGER;
    orphaned_templates INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_templates FROM creative_prompt_templates;
    SELECT COUNT(*) INTO linked_templates FROM creative_prompt_templates WHERE theme_id IS NOT NULL;
    SELECT COUNT(*) INTO orphaned_templates FROM creative_prompt_templates WHERE theme_id IS NULL;
    
    RAISE NOTICE '=== Template Linking Summary ===';
    RAISE NOTICE 'Total templates: %', total_templates;
    RAISE NOTICE 'Linked to themes: %', linked_templates;
    RAISE NOTICE 'Still orphaned: %', orphaned_templates;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
