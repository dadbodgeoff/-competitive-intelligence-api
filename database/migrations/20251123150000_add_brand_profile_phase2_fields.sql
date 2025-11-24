-- Migration: Add Phase 2 Brand Profile Fields
-- Description: Adds logo, prohibited elements, and social media preferences to creative_brand_profiles
-- Date: 2025-11-23
-- Status: READY TO RUN (when Phase 2 is implemented)

-- Add Phase 2 columns to creative_brand_profiles table
ALTER TABLE creative_brand_profiles
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_placement TEXT DEFAULT 'top_left',
ADD COLUMN IF NOT EXISTS logo_watermark_style TEXT DEFAULT 'subtle',
ADD COLUMN IF NOT EXISTS prohibited_elements TEXT[], -- Array of elements to avoid
ADD COLUMN IF NOT EXISTS allergen_warnings TEXT[], -- Array of allergen warnings to include
ADD COLUMN IF NOT EXISTS cultural_sensitivities TEXT[], -- Array of cultural/religious considerations
ADD COLUMN IF NOT EXISTS primary_social_platforms TEXT[], -- Array: instagram, facebook, tiktok, twitter
ADD COLUMN IF NOT EXISTS preferred_aspect_ratios TEXT[], -- Array: square, portrait, landscape
ADD COLUMN IF NOT EXISTS brand_hashtags TEXT[], -- Array of brand hashtags
ADD COLUMN IF NOT EXISTS social_media_handle TEXT; -- Primary social media handle

-- Add comments for documentation
COMMENT ON COLUMN creative_brand_profiles.logo_url IS 'URL to uploaded logo file in storage';
COMMENT ON COLUMN creative_brand_profiles.logo_placement IS 'Logo placement preference: top_left, top_right, center, bottom_left, bottom_right, none';
COMMENT ON COLUMN creative_brand_profiles.logo_watermark_style IS 'Watermark style: subtle, prominent, none';
COMMENT ON COLUMN creative_brand_profiles.prohibited_elements IS 'Elements to avoid in generated images (e.g., alcohol, meat, specific colors)';
COMMENT ON COLUMN creative_brand_profiles.allergen_warnings IS 'Allergen warnings that must be included';
COMMENT ON COLUMN creative_brand_profiles.cultural_sensitivities IS 'Cultural or religious sensitivities to respect';
COMMENT ON COLUMN creative_brand_profiles.primary_social_platforms IS 'Primary social media platforms: instagram, facebook, tiktok, twitter, linkedin';
COMMENT ON COLUMN creative_brand_profiles.preferred_aspect_ratios IS 'Preferred aspect ratios: square (1:1), portrait (4:5, 9:16), landscape (16:9)';
COMMENT ON COLUMN creative_brand_profiles.brand_hashtags IS 'Brand hashtags to include in social posts';
COMMENT ON COLUMN creative_brand_profiles.social_media_handle IS 'Primary social media handle (e.g., @restaurantname)';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_brand_profiles_logo_url ON creative_brand_profiles(logo_url) WHERE logo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brand_profiles_social_platforms ON creative_brand_profiles USING GIN(primary_social_platforms);

-- Update existing records to have empty arrays where NULL
UPDATE creative_brand_profiles
SET 
    prohibited_elements = COALESCE(prohibited_elements, ARRAY[]::TEXT[]),
    allergen_warnings = COALESCE(allergen_warnings, ARRAY[]::TEXT[]),
    cultural_sensitivities = COALESCE(cultural_sensitivities, ARRAY[]::TEXT[]),
    primary_social_platforms = COALESCE(primary_social_platforms, ARRAY[]::TEXT[]),
    preferred_aspect_ratios = COALESCE(preferred_aspect_ratios, ARRAY[]::TEXT[]),
    brand_hashtags = COALESCE(brand_hashtags, ARRAY[]::TEXT[])
WHERE 
    prohibited_elements IS NULL OR 
    allergen_warnings IS NULL OR 
    cultural_sensitivities IS NULL OR
    primary_social_platforms IS NULL OR
    preferred_aspect_ratios IS NULL OR
    brand_hashtags IS NULL;

-- Add check constraint for logo_placement
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_logo_placement 
CHECK (logo_placement IN ('top_left', 'top_right', 'center', 'bottom_left', 'bottom_right', 'none'));

-- Add check constraint for logo_watermark_style
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_watermark_style 
CHECK (logo_watermark_style IN ('subtle', 'prominent', 'none'));
