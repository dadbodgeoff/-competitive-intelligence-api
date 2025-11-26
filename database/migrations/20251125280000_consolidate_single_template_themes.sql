-- ============================================================================
-- MIGRATION: Consolidate Single-Template Themes
-- ============================================================================
-- Description : Merges themes with only 1 template into broader parent themes
--               to reduce clutter and improve UX in the frontend gallery.
-- Author      : Kiro
-- Date        : 2025-11-25
-- ============================================================================

-- ============================================================================
-- STEP 1: Move single-template themes to appropriate parent themes
-- ============================================================================

-- Pizza-related single themes → Pizza Restaurant
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'parmigiano_showstopper',
        'take_home_dessert', 
        'monthly_signature_pie',
        'artisan_dough_lab',
        'oven_dome_heat',
        'secret_menu_whispers',
        'family_supper_series',
        'delivery_power_stack',
        'waitlist_social_proof',
        'cocktail_pairings_night'
    )
);

-- Bar/Grill/Drinks single themes → Happy Hour & Drinks
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'winter_copper_cocktail',
        'beer_flight_paddle',
        'soggy_coaster',
        'whiskey_barrel_hightop',
        'empty_tap_handle',
        'cocktail_napkin_note',
        'candlelit_bottle_special'
    )
);

-- Sports/Game Day single themes → Sports & Game Day
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'game_over_bundle',
        'pigskin_showdown',
        'gameday_fridge_fog'
    )
);

-- Breakfast/Brunch single themes → Breakfast & Brunch (or Holiday Breakfast)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'flour_carved_morning',
        'power_bowl_grind'
    )
);

-- Bakery single themes → Bakery Morning Light
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'bakery_string_tag',
        'powdered_brownie_snowfall'
    )
);

-- Fine Dining single themes → Fine Dining Tasting Menu
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'wet_slate_omakase',
        'velvet_gala_menu',
        'guest_check_leather',
        'reserved_table_tent'
    )
);

-- BBQ single themes → BBQ Smokehouse
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'butchers_cut_cleaver',
        'butcher_paper_lineup',
        'foil_wrap_cure',
        'wood_burner_brand'
    )
);

-- Mexican single themes → Mexican Street Food
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'taco_tuesday_basket',
        'hot_sauce_challenge'
    )
);

-- Coffee/Cafe single themes → Bakery Morning Light (closest match)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'barista_foam_pov',
        'espresso_grounds_spill'
    )
);

-- Events/Entertainment single themes → Special Events
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'spotlight_comedy_brick',
        'gaffer_tape_setlist',
        'balloon_kids_free',
        'knife_roll_invitation'
    )
);

-- Behind the Scenes / Kitchen single themes → Behind the Scenes
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'chef_pass_heatlamp',
        'kitchen_pass_heatlamp',
        'kitchen_ticket_spike',
        'selvedge_apron_crew'
    )
);

-- Hiring/Operational single themes → UGC & Operational
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'eighty_six_board',
        'tip_jar_sticky',
        'stapled_receipt'
    )
);

-- Social Proof single themes → Social Proof & Community
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'mirror_selfie_moment',
        'bathroom_mirror_selfie',
        'neon_brick_quote'
    )
);

-- Seasonal/Weather single themes → Seasonal Celebrations
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'snow_day_sidewalk',
        'seasonal_spice_dust',
        'golden_hour_window',
        'frosted_window_warmers',
        'ice_rink_scrape',
        'fireside_slate_hearth',
        'roasted_root_parchment',
        'enamel_pot_steam',
        'cast_iron_comforts'
    )
);

-- Fast Casual / Lunch single themes → Fast Casual Fresh
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'city_bench_lunch',
        'chrome_napkin_special'
    )
);

-- Marketing/Guerrilla single themes → General Templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'guerilla_window_marketing',
        'brick_wall_popups',
        'sidewalk_chalk_masterpiece',
        'letter_board_announcement',
        'kraft_paper_scroll',
        'corrugated_graffiti_wall',
        'graphite_trivia_sheet',
        'crayon_tablecloth',
        'custom_creator_lab'
    )
);

-- Ice Cream single themes → General Templates (or could create dessert theme)
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'ice_cream_frost_wipe'
    )
);

-- ============================================================================
-- STEP 2: Update generation jobs to point to new themes before deleting old ones
-- ============================================================================

-- Update jobs that reference themes being consolidated
UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'parmigiano_showstopper', 'take_home_dessert', 'monthly_signature_pie',
        'artisan_dough_lab', 'oven_dome_heat', 'secret_menu_whispers',
        'family_supper_series', 'delivery_power_stack', 'waitlist_social_proof',
        'cocktail_pairings_night'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'winter_copper_cocktail', 'beer_flight_paddle', 'soggy_coaster',
        'whiskey_barrel_hightop', 'empty_tap_handle', 'cocktail_napkin_note',
        'candlelit_bottle_special'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'game_over_bundle', 'pigskin_showdown', 'gameday_fridge_fog'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'flour_carved_morning', 'power_bowl_grind'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'bakery_string_tag', 'powdered_brownie_snowfall', 'barista_foam_pov', 'espresso_grounds_spill'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'wet_slate_omakase', 'velvet_gala_menu', 'guest_check_leather', 'reserved_table_tent'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'butchers_cut_cleaver', 'butcher_paper_lineup', 'foil_wrap_cure', 'wood_burner_brand'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'taco_tuesday_basket', 'hot_sauce_challenge'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'spotlight_comedy_brick', 'gaffer_tape_setlist', 'balloon_kids_free', 'knife_roll_invitation'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'chef_pass_heatlamp', 'kitchen_pass_heatlamp', 'kitchen_ticket_spike', 'selvedge_apron_crew'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'eighty_six_board', 'tip_jar_sticky', 'stapled_receipt'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'mirror_selfie_moment', 'bathroom_mirror_selfie', 'neon_brick_quote'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'snow_day_sidewalk', 'seasonal_spice_dust', 'golden_hour_window',
        'frosted_window_warmers', 'ice_rink_scrape', 'fireside_slate_hearth',
        'roasted_root_parchment', 'enamel_pot_steam', 'cast_iron_comforts'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'city_bench_lunch', 'chrome_napkin_special'
    )
);

UPDATE creative_generation_jobs
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general')
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'guerilla_window_marketing', 'brick_wall_popups', 'sidewalk_chalk_masterpiece',
        'letter_board_announcement', 'kraft_paper_scroll', 'corrugated_graffiti_wall',
        'graphite_trivia_sheet', 'crayon_tablecloth', 'custom_creator_lab',
        'ice_cream_frost_wipe'
    )
);

-- ============================================================================
-- STEP 3: Delete empty themes (themes with 0 templates after consolidation)
-- ============================================================================

DELETE FROM creative_prompt_themes
WHERE id NOT IN (
    SELECT DISTINCT theme_id FROM creative_prompt_templates WHERE theme_id IS NOT NULL
)
AND id NOT IN (
    SELECT DISTINCT theme_id FROM creative_generation_jobs WHERE theme_id IS NOT NULL
);

-- ============================================================================
-- STEP 3: Log results
-- ============================================================================

DO $
DECLARE
    theme_count INTEGER;
    templates_per_theme RECORD;
BEGIN
    SELECT COUNT(*) INTO theme_count FROM creative_prompt_themes;
    
    RAISE NOTICE '=== Theme Consolidation Complete ===';
    RAISE NOTICE 'Remaining themes: %', theme_count;
END $;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
