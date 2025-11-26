-- ============================================================================
-- CONSOLIDATED CREATIVE MODULE MIGRATIONS
-- ============================================================================
-- Description: Run all creative module migrations in a single transaction
-- Date: 2025-11-25 (Updated)
-- Instructions: Copy this entire file and paste into Supabase SQL Editor
-- ============================================================================

BEGIN;

-- ============================================================================
-- MIGRATION 1: Policy Consent Columns
-- ============================================================================
\i database/migrations/20251122190000_add_policy_consent_columns.sql

-- ============================================================================
-- MIGRATION 2: Creative Image Generation Module (Core Tables)
-- ============================================================================
\i database/migrations/20251122205000_creative_image_generation_module.sql

-- ============================================================================
-- MIGRATION 3: Creative Theme Support
-- ============================================================================
\i database/migrations/20251122221000_creative_theme_support.sql

-- ============================================================================
-- MIGRATION 4: Bar & Grill Themes
-- ============================================================================
\i database/migrations/20251122223000_bar_grill_theme_support.sql

-- ============================================================================
-- MIGRATION 5: Mixed Vertical Themes
-- ============================================================================
\i database/migrations/20251122224000_mixed_vertical_theme_support.sql

-- ============================================================================
-- MIGRATION 6: Winter Theme Support (Part 1)
-- ============================================================================
\i database/migrations/20251122231000_winter_theme_support.sql

-- ============================================================================
-- MIGRATION 7: Winter Theme Support (Part 2)
-- ============================================================================
\i database/migrations/20251122231100_winter_theme_support_part2.sql

-- ============================================================================
-- MIGRATION 8: Social Proof Theme Support (Part 1)
-- ============================================================================
\i database/migrations/20251122232000_social_proof_theme_support.sql

-- ============================================================================
-- MIGRATION 9: Social Proof Theme Support (Part 2)
-- ============================================================================
\i database/migrations/20251122232100_social_proof_theme_support_part2.sql

-- ============================================================================
-- MIGRATION 10: Hiring Theme Support
-- ============================================================================
\i database/migrations/20251122233000_hiring_theme_support.sql

-- ============================================================================
-- MIGRATION 11: Events & Promotions Theme Support
-- ============================================================================
\i database/migrations/20251122234000_events_promotions_theme_support.sql

-- ============================================================================
-- MIGRATION 12: Theme Category Support
-- ============================================================================
\i database/migrations/20251122235000_theme_category_support.sql

-- ============================================================================
-- MIGRATION 13: Image Generation 28-Day Limits & Asset Storage
-- ============================================================================
\i database/migrations/20251122236000_image_generation_28day_and_asset_storage.sql

-- ============================================================================
-- MIGRATION 14: Premium Image Generation Limits
-- ============================================================================
\i database/migrations/20251122237000_premium_image_generation_limit.sql

-- ============================================================================
-- MIGRATION 15: Smart Defaults to Templates
-- ============================================================================
\i database/migrations/20251123000000_add_smart_defaults_to_templates.sql

-- ============================================================================
-- MIGRATION 16: Fix Usage Limit Timestamp Cast
-- ============================================================================
\i database/migrations/20251123093000_fix_usage_limit_timestamp_cast.sql

-- ============================================================================
-- MIGRATION 17: Brand Profile Phase 1 Fields
-- ============================================================================
\i database/migrations/20251123140000_add_brand_profile_phase1_fields.sql

-- ============================================================================
-- MIGRATION 18: Brand Profile Phase 2 Fields
-- ============================================================================
\i database/migrations/20251123150000_add_brand_profile_phase2_fields.sql

-- ============================================================================
-- MIGRATION 19: Brand Profile Phase 3 Fields
-- ============================================================================
\i database/migrations/20251123160000_add_brand_profile_phase3_fields.sql

-- ============================================================================
-- MIGRATION 20: Template Descriptions
-- ============================================================================
\i database/migrations/20251124200000_add_template_descriptions.sql

-- ============================================================================
-- MIGRATION 21: Creative Prompt Library Expansion
-- ============================================================================
\i database/migrations/20251125100000_creative_prompt_library_expansion.sql

-- ============================================================================
-- MIGRATION 22: Story Templates - No Food (Typography-focused)
-- ============================================================================
\i database/migrations/20251125110000_story_templates_no_food.sql

-- ============================================================================
-- MIGRATION 23: Sports & Game Day Templates
-- ============================================================================
\i database/migrations/20251125130000_sports_gameday_templates.sql

-- ============================================================================
-- MIGRATION 24: Gift Cards & Weather Templates
-- ============================================================================
\i database/migrations/20251125140000_giftcards_weather_templates.sql

-- ============================================================================
-- MIGRATION 25: Christmas & Holiday Templates
-- ============================================================================
\i database/migrations/20251125140000_holiday_christmas_templates.sql

-- ============================================================================
-- MIGRATION 26: New Year's Eve & Day Templates
-- ============================================================================
\i database/migrations/20251125150000_new_years_templates.sql

-- ============================================================================
-- MIGRATION 27: Daily Specials & LTO Templates
-- ============================================================================
\i database/migrations/20251125160000_daily_specials_lto_templates.sql

-- ============================================================================
-- MIGRATION 28: Menu Items & LTOs - No Food Imagery Templates
-- ============================================================================
\i database/migrations/20251125170000_menu_lto_nofood_templates.sql

-- ============================================================================
-- MIGRATION 29: Rewards & Gift Cards Templates
-- ============================================================================
\i database/migrations/20251125170000_rewards_giftcards_templates.sql

-- ============================================================================
-- MIGRATION 30: Delivery & Takeout Templates
-- ============================================================================
\i database/migrations/20251125180000_delivery_takeout_templates.sql

-- ============================================================================
-- MIGRATION 31: Happy Hour & Drinks Templates
-- ============================================================================
\i database/migrations/20251125180000_happy_hour_drinks_templates.sql

-- ============================================================================
-- MIGRATION 32: UGC & Operational Templates
-- ============================================================================
\i database/migrations/20251125190000_ugc_operational_templates.sql

-- ============================================================================
-- MIGRATION 33: Holiday Christmas Templates Complete
-- ============================================================================
\i database/migrations/20251125200000_holiday_christmas_templates_complete.sql

-- ============================================================================
-- MIGRATION 34: Holiday Bar & Grill Templates
-- ============================================================================
\i database/migrations/20251125210000_holiday_bar_grill_templates.sql

-- ============================================================================
-- MIGRATION 35: Holiday Breakfast & Diner Templates
-- ============================================================================
\i database/migrations/20251125220000_holiday_breakfast_diner_templates.sql

-- ============================================================================
-- MIGRATION 36: Pizza Restaurant Templates
-- ============================================================================
\i database/migrations/20251125230000_pizza_restaurant_templates.sql

-- ============================================================================
-- MIGRATION 37: Holiday Pizza Templates
-- ============================================================================
\i database/migrations/20251125240000_holiday_pizza_templates.sql

-- ============================================================================
-- MIGRATION 38: FIX - Link Orphaned Templates to Themes
-- CRITICAL: Templates without theme_id won't show in frontend!
-- ============================================================================
\i database/migrations/20251125250000_fix_orphaned_templates.sql

-- ============================================================================
-- MIGRATION 39: Comprehensive Template Cleanup
-- Final cleanup to ensure ALL templates are properly linked and have input_schema
-- ============================================================================
\i database/migrations/20251125260000_comprehensive_template_cleanup.sql

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after the migration to verify everything was created:

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'creative_%' 
ORDER BY table_name;

-- Check theme count
SELECT COUNT(*) as theme_count FROM creative_prompt_themes;

-- Check template count by theme
SELECT 
    t.name as theme_name,
    t.theme_slug,
    COUNT(p.id) as template_count
FROM creative_prompt_themes t
LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id
GROUP BY t.id, t.name, t.theme_slug
ORDER BY template_count DESC;

-- Check for orphaned templates (should be 0 after fix migration)
SELECT COUNT(*) as orphaned_count 
FROM creative_prompt_templates 
WHERE theme_id IS NULL;

-- Check brand profile table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'creative_brand_profiles' 
ORDER BY ordinal_position;

-- ============================================================================
-- END OF CONSOLIDATED MIGRATIONS
-- ============================================================================
