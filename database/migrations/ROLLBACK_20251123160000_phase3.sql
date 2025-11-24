-- Rollback Migration: Phase 3 Brand Profile Fields
-- Description: Removes Phase 3 fields if needed
-- Date: 2025-11-23
-- WARNING: This will delete data! Only run if you need to rollback Phase 3

-- Drop helper functions
DROP FUNCTION IF EXISTS get_current_season();
DROP FUNCTION IF EXISTS get_upcoming_holidays();

-- Drop constraints
ALTER TABLE creative_brand_profiles
DROP CONSTRAINT IF EXISTS check_location_type,
DROP CONSTRAINT IF EXISTS check_price_range,
DROP CONSTRAINT IF EXISTS check_regional_style,
DROP CONSTRAINT IF EXISTS check_value_proposition;

-- Drop indexes
DROP INDEX IF EXISTS idx_brand_profiles_location_type;
DROP INDEX IF EXISTS idx_brand_profiles_price_range;
DROP INDEX IF EXISTS idx_brand_profiles_city_state;
DROP INDEX IF EXISTS idx_brand_profiles_holidays;
DROP INDEX IF EXISTS idx_brand_profiles_recurring_events;

-- Drop columns
ALTER TABLE creative_brand_profiles
DROP COLUMN IF EXISTS active_seasons,
DROP COLUMN IF EXISTS recurring_events,
DROP COLUMN IF EXISTS holiday_participation,
DROP COLUMN IF EXISTS seasonal_menu_rotation,
DROP COLUMN IF EXISTS location_type,
DROP COLUMN IF EXISTS regional_style,
DROP COLUMN IF EXISTS local_landmarks,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS price_range,
DROP COLUMN IF EXISTS value_proposition,
DROP COLUMN IF EXISTS average_check_size,
DROP COLUMN IF EXISTS positioning_statement;
