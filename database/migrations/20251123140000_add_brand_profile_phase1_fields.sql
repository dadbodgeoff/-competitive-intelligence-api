-- Migration: Add Phase 1 Brand Profile Fields
-- Description: Adds brand voice, visual style, cuisine type, and atmosphere fields to creative_brand_profiles
-- Date: 2025-11-23

-- Add new columns to creative_brand_profiles table
ALTER TABLE creative_brand_profiles
ADD COLUMN IF NOT EXISTS brand_voice TEXT,
ADD COLUMN IF NOT EXISTS brand_tone TEXT,
ADD COLUMN IF NOT EXISTS voice_description TEXT,
ADD COLUMN IF NOT EXISTS visual_styles TEXT[], -- Array of visual style preferences
ADD COLUMN IF NOT EXISTS cuisine_type TEXT,
ADD COLUMN IF NOT EXISTS cuisine_specialties TEXT[], -- Array of specialties
ADD COLUMN IF NOT EXISTS atmosphere_tags TEXT[], -- Array of atmosphere keywords
ADD COLUMN IF NOT EXISTS target_demographic TEXT;

-- Add comments for documentation
COMMENT ON COLUMN creative_brand_profiles.brand_voice IS 'Brand voice style: casual, professional, playful, elegant, bold';
COMMENT ON COLUMN creative_brand_profiles.brand_tone IS 'Overall tone of brand communications';
COMMENT ON COLUMN creative_brand_profiles.voice_description IS 'Custom description of brand voice (e.g., "Family-friendly and warm")';
COMMENT ON COLUMN creative_brand_profiles.visual_styles IS 'Array of visual style preferences: rustic, modern, minimalist, vibrant, dark_moody';
COMMENT ON COLUMN creative_brand_profiles.cuisine_type IS 'Primary cuisine type: italian, mexican, asian_fusion, american, etc.';
COMMENT ON COLUMN creative_brand_profiles.cuisine_specialties IS 'Array of specialty items or dietary focuses';
COMMENT ON COLUMN creative_brand_profiles.atmosphere_tags IS 'Array of atmosphere keywords: cozy, industrial, beachy, urban, rustic, modern';
COMMENT ON COLUMN creative_brand_profiles.target_demographic IS 'Primary target audience: families, young_professionals, date_night, lunch_crowd';

-- Create index for faster queries on cuisine_type (commonly filtered)
CREATE INDEX IF NOT EXISTS idx_brand_profiles_cuisine_type ON creative_brand_profiles(cuisine_type);

-- Update existing records to have empty arrays where NULL
UPDATE creative_brand_profiles
SET 
    visual_styles = COALESCE(visual_styles, ARRAY[]::TEXT[]),
    cuisine_specialties = COALESCE(cuisine_specialties, ARRAY[]::TEXT[]),
    atmosphere_tags = COALESCE(atmosphere_tags, ARRAY[]::TEXT[])
WHERE visual_styles IS NULL OR cuisine_specialties IS NULL OR atmosphere_tags IS NULL;
