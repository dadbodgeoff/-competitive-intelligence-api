-- ============================================================================
-- STANDALONE: Consolidate Single-Template Themes
-- ============================================================================
-- Run this in Supabase SQL Editor to clean up themes with only 1 template
-- by merging them into broader parent categories.
-- ============================================================================

-- Pizza-related → Pizza Restaurant
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'parmigiano_showstopper', 'take_home_dessert', 'monthly_signature_pie',
        'artisan_dough_lab', 'oven_dome_heat', 'secret_menu_whispers',
        'family_supper_series', 'delivery_power_stack', 'waitlist_social_proof',
        'cocktail_pairings_night'
    )
);

-- Bar/Drinks → Happy Hour & Drinks
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'winter_copper_cocktail', 'beer_flight_paddle', 'soggy_coaster',
        'whiskey_barrel_hightop', 'empty_tap_handle', 'cocktail_napkin_note',
        'candlelit_bottle_special'
    )
);

-- Sports → Sports & Game Day
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'game_over_bundle', 'pigskin_showdown', 'gameday_fridge_fog'
    )
);

-- Breakfast → Breakfast & Brunch
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'flour_carved_morning', 'power_bowl_grind'
    )
);

-- Bakery/Coffee → Bakery Morning Light
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'bakery_string_tag', 'powdered_brownie_snowfall',
        'barista_foam_pov', 'espresso_grounds_spill'
    )
);

-- Fine Dining → Fine Dining Tasting Menu
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'wet_slate_omakase', 'velvet_gala_menu', 'guest_check_leather', 'reserved_table_tent'
    )
);

-- BBQ → BBQ Smokehouse
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'butchers_cut_cleaver', 'butcher_paper_lineup', 'foil_wrap_cure', 'wood_burner_brand'
    )
);

-- Mexican → Mexican Street Food
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'taco_tuesday_basket', 'hot_sauce_challenge'
    )
);

-- Events → Special Events
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'spotlight_comedy_brick', 'gaffer_tape_setlist', 'balloon_kids_free', 'knife_roll_invitation'
    )
);

-- Kitchen/BTS → Behind the Scenes
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'chef_pass_heatlamp', 'kitchen_pass_heatlamp', 'kitchen_ticket_spike', 'selvedge_apron_crew'
    )
);

-- Hiring/Ops → UGC & Operational
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'eighty_six_board', 'tip_jar_sticky', 'stapled_receipt'
    )
);

-- Social Proof → Social Proof & Community
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'mirror_selfie_moment', 'bathroom_mirror_selfie', 'neon_brick_quote'
    )
);

-- Seasonal/Weather → Seasonal Celebrations
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'snow_day_sidewalk', 'seasonal_spice_dust', 'golden_hour_window',
        'frosted_window_warmers', 'ice_rink_scrape', 'fireside_slate_hearth',
        'roasted_root_parchment', 'enamel_pot_steam', 'cast_iron_comforts'
    )
);

-- Fast Casual → Fast Casual Fresh
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'city_bench_lunch', 'chrome_napkin_special'
    )
);

-- Marketing/Misc → General Templates
UPDATE creative_prompt_templates
SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general'),
    updated_at = NOW()
WHERE theme_id IN (
    SELECT id FROM creative_prompt_themes WHERE theme_slug IN (
        'guerilla_window_marketing', 'brick_wall_popups', 'sidewalk_chalk_masterpiece',
        'letter_board_announcement', 'kraft_paper_scroll', 'corrugated_graffiti_wall',
        'graphite_trivia_sheet', 'crayon_tablecloth', 'custom_creator_lab',
        'ice_cream_frost_wipe'
    )
);

-- ============================================================================
-- Update generation jobs BEFORE deleting themes (FK constraint)
-- ============================================================================

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'pizza_restaurant')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('parmigiano_showstopper', 'take_home_dessert', 'monthly_signature_pie', 'artisan_dough_lab', 'oven_dome_heat', 'secret_menu_whispers', 'family_supper_series', 'delivery_power_stack', 'waitlist_social_proof', 'cocktail_pairings_night'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'happy_hour_drinks')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('winter_copper_cocktail', 'beer_flight_paddle', 'soggy_coaster', 'whiskey_barrel_hightop', 'empty_tap_handle', 'cocktail_napkin_note', 'candlelit_bottle_special'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'sports_gameday')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('game_over_bundle', 'pigskin_showdown', 'gameday_fridge_fog'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'breakfast_brunch')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('flour_carved_morning', 'power_bowl_grind'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('bakery_string_tag', 'powdered_brownie_snowfall', 'barista_foam_pov', 'espresso_grounds_spill'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('wet_slate_omakase', 'velvet_gala_menu', 'guest_check_leather', 'reserved_table_tent'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('butchers_cut_cleaver', 'butcher_paper_lineup', 'foil_wrap_cure', 'wood_burner_brand'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('taco_tuesday_basket', 'hot_sauce_challenge'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('spotlight_comedy_brick', 'gaffer_tape_setlist', 'balloon_kids_free', 'knife_roll_invitation'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('chef_pass_heatlamp', 'kitchen_pass_heatlamp', 'kitchen_ticket_spike', 'selvedge_apron_crew'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'ugc_operational')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('eighty_six_board', 'tip_jar_sticky', 'stapled_receipt'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('mirror_selfie_moment', 'bathroom_mirror_selfie', 'neon_brick_quote'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('snow_day_sidewalk', 'seasonal_spice_dust', 'golden_hour_window', 'frosted_window_warmers', 'ice_rink_scrape', 'fireside_slate_hearth', 'roasted_root_parchment', 'enamel_pot_steam', 'cast_iron_comforts'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('city_bench_lunch', 'chrome_napkin_special'));

UPDATE creative_generation_jobs SET theme_id = (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'cross_vertical_general')
WHERE theme_id IN (SELECT id FROM creative_prompt_themes WHERE theme_slug IN ('guerilla_window_marketing', 'brick_wall_popups', 'sidewalk_chalk_masterpiece', 'letter_board_announcement', 'kraft_paper_scroll', 'corrugated_graffiti_wall', 'graphite_trivia_sheet', 'crayon_tablecloth', 'custom_creator_lab', 'ice_cream_frost_wipe'));

-- Delete empty themes (safe now that jobs are updated)
DELETE FROM creative_prompt_themes
WHERE id NOT IN (SELECT DISTINCT theme_id FROM creative_prompt_templates WHERE theme_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT theme_id FROM creative_generation_jobs WHERE theme_id IS NOT NULL);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    t.name as theme_name,
    t.theme_slug,
    COUNT(p.id) as template_count
FROM creative_prompt_themes t
LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id AND p.is_active = TRUE
GROUP BY t.id, t.name, t.theme_slug
HAVING COUNT(p.id) > 0
ORDER BY template_count DESC;
