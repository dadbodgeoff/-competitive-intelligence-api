-- ============================================================================
-- DIAGNOSTIC: Check why templates aren't showing in frontend
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose the issue
-- ============================================================================

-- 1. How many total templates exist?
SELECT 'Total templates' as metric, COUNT(*) as count FROM creative_prompt_templates;
SELECT 'Active templates' as metric, COUNT(*) as count FROM creative_prompt_templates WHERE is_active = TRUE;
SELECT 'Templates with theme_id' as metric, COUNT(*) as count FROM creative_prompt_templates WHERE theme_id IS NOT NULL;
SELECT 'Orphaned templates (no theme_id)' as metric, COUNT(*) as count FROM creative_prompt_templates WHERE theme_id IS NULL AND is_active = TRUE;

-- 2. How many themes exist?
SELECT 'Total themes' as metric, COUNT(*) as count FROM creative_prompt_themes;

-- 3. Theme category distribution (this is what frontend uses for tabs)
SELECT 
    COALESCE(category, 'NULL/missing') as category,
    COUNT(*) as theme_count
FROM creative_prompt_themes
GROUP BY category
ORDER BY theme_count DESC;

-- 4. Templates per theme (what frontend will show when you click a theme)
SELECT 
    t.name as theme_name,
    t.theme_slug,
    t.category,
    t.restaurant_vertical,
    COUNT(p.id) as template_count
FROM creative_prompt_themes t
LEFT JOIN creative_prompt_templates p ON p.theme_id = t.id AND p.is_active = TRUE
GROUP BY t.id, t.name, t.theme_slug, t.category, t.restaurant_vertical
ORDER BY template_count DESC
LIMIT 30;

-- 5. Sample of orphaned templates (templates without theme_id)
SELECT 
    slug,
    name,
    restaurant_vertical,
    campaign_channel,
    is_active
FROM creative_prompt_templates
WHERE theme_id IS NULL AND is_active = TRUE
LIMIT 20;

-- 6. Check if themes have the category column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'creative_prompt_themes'
ORDER BY ordinal_position;

-- 7. Check if templates have theme_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'creative_prompt_templates'
ORDER BY ordinal_position;
