-- ============================================================================
-- CONSOLIDATED CREATIVE MODULE MIGRATIONS
-- ============================================================================
-- Description: Run all creative module migrations in a single transaction
-- Date: 2025-11-23
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
-- MIGRATION 20: Sports & Game Day Templates (26 templates)
-- ============================================================================
\i database/migrations/20251125130000_sports_gameday_templates.sql

-- ============================================================================
-- MIGRATION 21: Christmas & Holiday Templates (15 templates, no food)
-- ============================================================================
\i database/migrations/20251125140000_holiday_christmas_templates.sql

-- ============================================================================
-- MIGRATION 22: New Year's Eve & Day Templates (12 templates, no food)
-- ============================================================================
\i database/migrations/20251125150000_new_years_templates.sql

-- ============================================================================
-- MIGRATION 23: Daily Specials & LTO Templates (18 templates, no food)
-- ============================================================================
\i database/migrations/20251125160000_daily_specials_lto_templates.sql

-- ============================================================================
-- MIGRATION 24: Menu Items & LTOs - No Food Imagery Templates (28 templates)
-- ============================================================================
\i database/migrations/20251125170000_menu_lto_nofood_templates.sql

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

-- Check template count
SELECT COUNT(*) as template_count FROM creative_prompt_templates;

-- Check brand profile table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'creative_brand_profiles' 
ORDER BY ordinal_position;

-- ============================================================================
-- END OF CONSOLIDATED MIGRATIONS
-- ============================================================================
