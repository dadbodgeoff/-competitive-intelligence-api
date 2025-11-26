-- ============================================================================
-- MIGRATION: Comprehensive Template Cleanup
-- ============================================================================
-- Description : Final cleanup migration to ensure ALL templates are properly
--               linked to themes and have input_schema extracted from metadata.
--               This runs after all other template migrations.
-- Author      : Kiro
-- Date        : 2025-11-25
-- ============================================================================

-- ============================================================================
-- STEP 1: Create any missing themes that templates might reference
-- ============================================================================

-- Fine Dining Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'fine_dining',
    'fine_dining_tasting',
    'Fine Dining Tasting Menu',
    'Elegant candlelit scenes for tasting menus, wine pairings, and chef''s table experiences.',
    'instagram',
    '{"primary":"#FFFFFF","secondary":"#722F37","accent":"#D4AF37"}'::JSONB,
    '{"headline":"Cormorant Garamond","body":"Lato"}'::JSONB,
    '["#finedining","#tastingmenu","#chefstable","#datenight"]'::JSONB,
    '{"style_adjectives":["candlelit intimate warmth","crisp linen texture","refined understated elegance"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Fast Casual Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'fast_casual',
    'fast_casual_fresh',
    'Fast Casual Fresh',
    'Bright, energetic scenes for build-your-own concepts and grab-and-go displays.',
    'instagram',
    '{"primary":"#4CAF50","secondary":"#FFFFFF","accent":"#FF9800"}'::JSONB,
    '{"headline":"Poppins","body":"Open Sans"}'::JSONB,
    '["#fastcasual","#healthyeats","#buildyourown","#freshfood"]'::JSONB,
    '{"style_adjectives":["bright natural daylight","clean modern lines","fresh ingredient colors"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Bakery Morning Light Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'bakery',
    'bakery_morning_light',
    'Bakery Morning Light',
    'Warm golden morning scenes for pastry cases, custom cakes, and coffee menus.',
    'instagram',
    '{"primary":"#D4A574","secondary":"#FFFFFF","accent":"#8B4513"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lora"}'::JSONB,
    '["#bakery","#freshbaked","#pastry","#coffeeshop"]'::JSONB,
    '{"style_adjectives":["golden morning warmth","flour dust in light beams","cozy neighborhood feel"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- BBQ Smokehouse Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'bbq',
    'bbq_smokehouse',
    'BBQ Smokehouse',
    'Authentic smoky scenes with dramatic lighting, butcher paper, and pitmaster craftsmanship.',
    'instagram',
    '{"primary":"#8B0000","secondary":"#D2691E","accent":"#F5DEB3"}'::JSONB,
    '{"headline":"Oswald","body":"Roboto Slab"}'::JSONB,
    '["#bbq","#smokehouse","#lowandslowbbq","#pitmaster"]'::JSONB,
    '{"style_adjectives":["smoky dramatic atmosphere","ember glow warmth","authentic pitmaster craft"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Seafood Fresh Catch Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'seafood',
    'seafood_fresh_catch',
    'Seafood Fresh Catch',
    'Ocean-fresh market scenes with ice displays, raw bars, and coastal dining atmosphere.',
    'instagram',
    '{"primary":"#1E90FF","secondary":"#FFFFFF","accent":"#FFD700"}'::JSONB,
    '{"headline":"Playfair Display","body":"Open Sans"}'::JSONB,
    '["#seafood","#freshcatch","#rawbar","#oceantoplate"]'::JSONB,
    '{"style_adjectives":["ocean-fresh sparkle","ice crystal clarity","coastal elegance"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Mexican Street Food Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'mexican',
    'mexican_street_food',
    'Mexican Street Food',
    'Vibrant taqueria scenes with authentic street food energy and festive colors.',
    'instagram',
    '{"primary":"#FF6B35","secondary":"#00A86B","accent":"#FFD700"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
    '["#tacos","#mexicanfood","#streetfood","#taqueria"]'::JSONB,
    '{"style_adjectives":["vibrant fiesta colors","authentic street energy","sizzling trompo action"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Asian Comfort Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'asian',
    'asian_comfort',
    'Asian Comfort Food',
    'Steamy ramen bowls, sushi artistry, and dim sum spreads with authentic atmosphere.',
    'instagram',
    '{"primary":"#C41E3A","secondary":"#000000","accent":"#FFD700"}'::JSONB,
    '{"headline":"Noto Sans JP","body":"Open Sans"}'::JSONB,
    '["#ramen","#sushi","#dimsum","#asianfood"]'::JSONB,
    '{"style_adjectives":["steam rising drama","umami richness","zen minimalism"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Brunch Vibes Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'breakfast',
    'brunch_vibes',
    'Brunch Vibes',
    'Weekend brunch spreads with eggs benedict, pancake stacks, and mimosa moments.',
    'instagram',
    '{"primary":"#F39C12","secondary":"#FFFFFF","accent":"#E74C3C"}'::JSONB,
    '{"headline":"Josefin Sans","body":"Lora"}'::JSONB,
    '["#brunch","#weekendvibes","#brunchgoals","#sundaybrunch"]'::JSONB,
    '{"style_adjectives":["bright morning light","indulgent weekend energy","instagram-worthy spreads"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Special Events Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'special_events',
    'Special Events',
    'Grand openings, anniversaries, live music nights, and private event promotions.',
    'instagram',
    '{"primary":"#9B59B6","secondary":"#FFFFFF","accent":"#F1C40F"}'::JSONB,
    '{"headline":"Playfair Display","body":"Montserrat"}'::JSONB,
    '["#grandopening","#celebration","#livemusic","#privateevent"]'::JSONB,
    '{"style_adjectives":["celebratory energy","milestone moments","event excitement"]}'::JSONB,
    'events'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'events',
    updated_at = NOW();

-- Behind the Scenes Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'behind_the_scenes',
    'Behind the Scenes',
    'Kitchen action shots, chef spotlights, and team culture highlights.',
    'instagram',
    '{"primary":"#2C3E50","secondary":"#FFFFFF","accent":"#E74C3C"}'::JSONB,
    '{"headline":"Oswald","body":"Open Sans"}'::JSONB,
    '["#behindthescenes","#kitchenlife","#cheflife","#restaurantlife"]'::JSONB,
    '{"style_adjectives":["authentic kitchen energy","team camaraderie","craft in action"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Seasonal Celebrations Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'seasonal_celebrations',
    'Seasonal Celebrations',
    'Fall harvest menus, summer patio season, holiday catering, and seasonal specials.',
    'instagram',
    '{"primary":"#D35400","secondary":"#27AE60","accent":"#F39C12"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lora"}'::JSONB,
    '["#seasonal","#fallmenu","#summermenu","#holidayspecials"]'::JSONB,
    '{"style_adjectives":["seasonal abundance","harvest warmth","celebration ready"]}'::JSONB,
    'campaigns'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'campaigns',
    updated_at = NOW();

-- Social Proof Community Theme
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules, category
)
VALUES (
    'all_verticals',
    'social_proof_community',
    'Social Proof & Community',
    'Customer reviews, award features, and community giveback highlights.',
    'instagram',
    '{"primary":"#3498DB","secondary":"#FFFFFF","accent":"#F1C40F"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#customerreview","#bestof","#localfavorite","#community"]'::JSONB,
    '{"style_adjectives":["authentic testimonials","award-worthy","community connection"]}'::JSONB,
    'social-proof'
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    category = 'social-proof',
    updated_at = NOW();

-- ============================================================================
-- STEP 2: Link templates to themes based on slug patterns
-- ============================================================================

-- Link fine dining templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%fine_dining%' OR slug LIKE '%fine-dining%' OR slug LIKE '%tasting_menu%' OR slug LIKE '%wine_pairing%' OR slug LIKE '%chefs_table%');

-- Link fast casual templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%fast_casual%' OR slug LIKE '%fast-casual%' OR slug LIKE '%grab_and_go%' OR slug LIKE '%build_your%' OR slug LIKE '%counter%');

-- Link bakery templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%bakery%' OR slug LIKE '%pastry%' OR slug LIKE '%cake%' OR slug LIKE '%coffee_menu%');

-- Link BBQ templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%bbq%' OR slug LIKE '%smokehouse%' OR slug LIKE '%brisket%' OR slug LIKE '%smoker%' OR slug LIKE '%butcher_paper%');

-- Link seafood templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seafood_fresh_catch'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%seafood%' OR slug LIKE '%fish%' OR slug LIKE '%oyster%' OR slug LIKE '%lobster%' OR slug LIKE '%raw_bar%');

-- Link Mexican templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%mexican%' OR slug LIKE '%taco%' OR slug LIKE '%burrito%' OR slug LIKE '%margarita%' OR slug LIKE '%taqueria%');

-- Link Asian templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'asian_comfort'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%asian%' OR slug LIKE '%ramen%' OR slug LIKE '%sushi%' OR slug LIKE '%dim_sum%' OR slug LIKE '%noodle%');

-- Link brunch templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'brunch_vibes'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%brunch%' OR slug LIKE '%benedict%' OR slug LIKE '%pancake%' OR slug LIKE '%avocado_toast%')
  AND slug NOT LIKE '%holiday%';

-- Link special events templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%grand_opening%' OR slug LIKE '%anniversary%' OR slug LIKE '%live_music%' OR slug LIKE '%private_event%');

-- Link behind the scenes templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%kitchen_action%' OR slug LIKE '%meet_the%' OR slug LIKE '%chef_spotlight%');

-- Link seasonal templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%fall_harvest%' OR slug LIKE '%summer_patio%' OR slug LIKE '%seasonal%')
  AND slug NOT LIKE '%holiday%' AND slug NOT LIKE '%christmas%';

-- Link social proof templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community'),
    updated_at = NOW()
WHERE theme_id IS NULL 
  AND (slug LIKE '%review%' OR slug LIKE '%award%' OR slug LIKE '%testimonial%' OR slug LIKE '%community%');

-- ============================================================================
-- STEP 3: Extract input_schema from metadata for ALL templates
-- ============================================================================

-- Extract input_schema from metadata where it exists
UPDATE creative_prompt_templates
SET input_schema = (metadata->>'input_schema')::JSONB
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null')
  AND metadata->>'input_schema' IS NOT NULL
  AND metadata->>'input_schema' != '';

-- Also try extracting from metadata.input_schema (nested)
UPDATE creative_prompt_templates
SET input_schema = (metadata->'input_schema')::JSONB
WHERE (input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null')
  AND metadata->'input_schema' IS NOT NULL
  AND jsonb_typeof(metadata->'input_schema') = 'object';

-- ============================================================================
-- STEP 4: Extract description, use_case, best_for from metadata
-- ============================================================================

UPDATE creative_prompt_templates
SET 
    description = COALESCE(description, metadata->>'description'),
    use_case = COALESCE(use_case, metadata->>'use_case', metadata->>'content_type'),
    display_name = COALESCE(display_name, name)
WHERE metadata IS NOT NULL AND metadata != '{}'::JSONB;

-- Extract best_for array from metadata
UPDATE creative_prompt_templates
SET best_for = ARRAY(SELECT jsonb_array_elements_text(metadata->'best_for'))
WHERE metadata->'best_for' IS NOT NULL 
  AND jsonb_typeof(metadata->'best_for') = 'array'
  AND (best_for IS NULL OR array_length(best_for, 1) IS NULL);

-- ============================================================================
-- STEP 5: Ensure all templates have valid variation_tags
-- ============================================================================

UPDATE creative_prompt_templates
SET variation_tags = '[]'::JSONB
WHERE variation_tags IS NULL OR variation_tags::TEXT = 'null';

-- ============================================================================
-- STEP 6: Final catch-all - link remaining orphans to general theme
-- ============================================================================

UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    updated_at = NOW()
WHERE theme_id IS NULL;

-- ============================================================================
-- STEP 7: Set category on all themes that don't have one
-- ============================================================================

UPDATE creative_prompt_themes
SET category = 'campaigns'
WHERE category IS NULL;

-- ============================================================================
-- STEP 8: Log results
-- ============================================================================

DO $$
DECLARE
    total_templates INTEGER;
    linked_templates INTEGER;
    orphaned_templates INTEGER;
    templates_with_schema INTEGER;
    templates_without_schema INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_templates FROM creative_prompt_templates;
    SELECT COUNT(*) INTO linked_templates FROM creative_prompt_templates WHERE theme_id IS NOT NULL;
    SELECT COUNT(*) INTO orphaned_templates FROM creative_prompt_templates WHERE theme_id IS NULL;
    SELECT COUNT(*) INTO templates_with_schema FROM creative_prompt_templates 
        WHERE input_schema IS NOT NULL AND input_schema != '{}'::JSONB AND input_schema::TEXT != 'null';
    SELECT COUNT(*) INTO templates_without_schema FROM creative_prompt_templates 
        WHERE input_schema IS NULL OR input_schema = '{}'::JSONB OR input_schema::TEXT = 'null';
    
    RAISE NOTICE '=== Comprehensive Template Cleanup Summary ===';
    RAISE NOTICE 'Total templates: %', total_templates;
    RAISE NOTICE 'Linked to themes: %', linked_templates;
    RAISE NOTICE 'Still orphaned: %', orphaned_templates;
    RAISE NOTICE 'With input_schema: %', templates_with_schema;
    RAISE NOTICE 'Without input_schema: %', templates_without_schema;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
