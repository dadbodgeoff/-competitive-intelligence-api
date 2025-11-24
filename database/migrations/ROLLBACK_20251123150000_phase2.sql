-- Rollback Migration: Phase 2 Brand Profile Fields
-- Description: Removes Phase 2 fields if needed
-- Date: 2025-11-23
-- WARNING: This will delete data! Only run if you need to rollback Phase 2

-- Drop constraints first
ALTER TABLE creative_brand_profiles
DROP CONSTRAINT IF EXISTS check_logo_placement,
DROP CONSTRAINT IF EXISTS check_watermark_style;

-- Drop indexes
DROP INDEX IF EXISTS idx_brand_profiles_logo_url;
DROP INDEX IF EXISTS idx_brand_profiles_social_platforms;

-- Drop columns
ALTER TABLE creative_brand_profiles
DROP COLUMN IF EXISTS logo_url,
DROP COLUMN IF EXISTS logo_placement,
DROP COLUMN IF EXISTS logo_watermark_style,
DROP COLUMN IF EXISTS prohibited_elements,
DROP COLUMN IF EXISTS allergen_warnings,
DROP COLUMN IF EXISTS cultural_sensitivities,
DROP COLUMN IF EXISTS primary_social_platforms,
DROP COLUMN IF EXISTS preferred_aspect_ratios,
DROP COLUMN IF EXISTS brand_hashtags,
DROP COLUMN IF EXISTS social_media_handle;
