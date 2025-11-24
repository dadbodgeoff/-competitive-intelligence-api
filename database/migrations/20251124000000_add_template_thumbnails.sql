-- ============================================================================
-- MIGRATION: Add Thumbnail Support to Creative Templates
-- ============================================================================
-- Description: Adds thumbnail_url and preview_image_url columns to support
--              visual template browsing and instant previews
-- Date: 2024-11-24
-- ============================================================================

-- Add thumbnail columns to creative_prompt_templates
ALTER TABLE creative_prompt_templates
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
    ADD COLUMN IF NOT EXISTS example_output_url TEXT;

COMMENT ON COLUMN creative_prompt_templates.thumbnail_url IS 'Small thumbnail image (200x200) for template cards';
COMMENT ON COLUMN creative_prompt_templates.preview_image_url IS 'Medium preview image (600x400) for template preview drawer';
COMMENT ON COLUMN creative_prompt_templates.example_output_url IS 'Full example output image for lightbox preview';

-- Add thumbnail columns to creative_prompt_themes
ALTER TABLE creative_prompt_themes
    ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
    ADD COLUMN IF NOT EXISTS icon_name TEXT;

COMMENT ON COLUMN creative_prompt_themes.hero_image_url IS 'Hero image for theme card header';
COMMENT ON COLUMN creative_prompt_themes.icon_name IS 'Lucide icon name for theme (fallback if no hero image)';

-- Add usage tracking for templates
ALTER TABLE creative_prompt_templates
    ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

COMMENT ON COLUMN creative_prompt_templates.usage_count IS 'Total number of times this template has been used';
COMMENT ON COLUMN creative_prompt_templates.last_used_at IS 'Last time this template was used for generation';

-- Create index for popular templates
CREATE INDEX IF NOT EXISTS idx_creative_templates_popular
    ON creative_prompt_templates(usage_count DESC, last_used_at DESC NULLS LAST)
    WHERE is_active = TRUE;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE creative_prompt_templates
    SET usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE slug = p_template_slug
      AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_template_usage IS 'Increments usage counter when template is used for generation';
