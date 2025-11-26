-- ============================================================================
-- Update Template Thumbnails with Placeholder Images
-- ============================================================================
-- Run this in Supabase SQL Editor to add placeholder thumbnails to templates
-- ============================================================================

-- Base URL for your Supabase storage
-- Replace if your project URL is different
DO $$
DECLARE
    base_url TEXT := 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/';
BEGIN
    -- Update all templates with default placeholders
    UPDATE creative_prompt_templates
    SET 
        thumbnail_url = base_url || 'placeholders/thumbnails/seasonal-menu.png',
        preview_image_url = base_url || 'placeholders/previews/seasonal-menu.png',
        example_output_url = base_url || 'placeholders/examples/seasonal-menu.png',
        updated_at = NOW()
    WHERE thumbnail_url IS NULL;

    RAISE NOTICE 'Updated % templates with default placeholders', 
        (SELECT COUNT(*) FROM creative_prompt_templates WHERE thumbnail_url IS NOT NULL);
END $$;

-- ============================================================================
-- Optional: Update specific templates with matching placeholders
-- ============================================================================

-- Seasonal/Campaign templates
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/seasonal-menu.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/seasonal-menu.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/seasonal-menu.png'
WHERE slug LIKE '%seasonal%' OR slug LIKE '%menu%';

-- Limited time offers
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/limited-time-offer.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/limited-time-offer.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/limited-time-offer.png'
WHERE slug LIKE '%limited%' OR slug LIKE '%offer%' OR slug LIKE '%promo%';

-- Happy hour
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/happy-hour-special.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/happy-hour-special.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/happy-hour-special.png'
WHERE slug LIKE '%happy%' OR slug LIKE '%hour%';

-- Customer reviews / social proof
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/customer-review.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/customer-review.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/customer-review.png'
WHERE slug LIKE '%review%' OR slug LIKE '%testimonial%' OR slug LIKE '%social%';

-- Team/hiring
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/team-spotlight.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/team-spotlight.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/team-spotlight.png'
WHERE slug LIKE '%team%' OR slug LIKE '%hiring%' OR slug LIKE '%staff%';

-- Events
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/event-announcement.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/event-announcement.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/event-announcement.png'
WHERE slug LIKE '%event%' OR slug LIKE '%celebration%';

-- New dishes
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/new-dish-launch.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/new-dish-launch.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/new-dish-launch.png'
WHERE slug LIKE '%new%' OR slug LIKE '%dish%' OR slug LIKE '%launch%';

-- Brunch/weekend
UPDATE creative_prompt_templates
SET 
    thumbnail_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/thumbnails/weekend-brunch.png',
    preview_image_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/previews/weekend-brunch.png',
    example_output_url = 'https://kapbytccfblkfqrdviec.supabase.co/storage/v1/object/public/creative-assets/placeholders/examples/weekend-brunch.png'
WHERE slug LIKE '%brunch%' OR slug LIKE '%weekend%' OR slug LIKE '%breakfast%';

-- ============================================================================
-- Verify the updates
-- ============================================================================

SELECT 
    slug,
    display_name,
    CASE 
        WHEN thumbnail_url IS NOT NULL THEN '✅ Has thumbnail'
        ELSE '❌ Missing thumbnail'
    END as thumbnail_status,
    usage_count
FROM creative_prompt_templates
ORDER BY usage_count DESC NULLS LAST, display_name;

-- ============================================================================
-- Update themes with icon names (fallback for hero images)
-- ============================================================================

UPDATE creative_prompt_themes
SET icon_name = CASE
    WHEN restaurant_vertical LIKE '%pizza%' THEN 'Pizza'
    WHEN restaurant_vertical LIKE '%cafe%' OR restaurant_vertical LIKE '%coffee%' THEN 'Coffee'
    WHEN restaurant_vertical LIKE '%bar%' OR restaurant_vertical LIKE '%pub%' THEN 'Beer'
    WHEN restaurant_vertical LIKE '%bakery%' THEN 'Croissant'
    WHEN restaurant_vertical LIKE '%fine%' OR restaurant_vertical LIKE '%upscale%' THEN 'UtensilsCrossed'
    ELSE 'Palette'
END
WHERE icon_name IS NULL;

-- Show summary
SELECT 
    COUNT(*) as total_templates,
    COUNT(thumbnail_url) as with_thumbnails,
    COUNT(*) - COUNT(thumbnail_url) as missing_thumbnails
FROM creative_prompt_templates;
