-- ============================================
-- MENU COMPARISON MODULE SCHEMA VERIFICATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check which menu comparison tables exist
SELECT 
    'Table Existence' as check_type,
    table_name,
    '✅ EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'competitor_menu_analyses',
    'competitor_businesses', 
    'competitor_menu_snapshots',
    'competitor_menu_items',
    'menu_comparison_insights',
    'saved_menu_comparisons'
)
ORDER BY table_name;

-- 2. COMPETITOR_BUSINESSES table columns
SELECT 
    '--- COMPETITOR_BUSINESSES COLUMNS ---' as section,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitor_businesses'
ORDER BY ordinal_position;

-- 3. COMPETITOR_MENU_ANALYSES table columns
SELECT 
    '--- COMPETITOR_MENU_ANALYSES COLUMNS ---' as section,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitor_menu_analyses'
ORDER BY ordinal_position;

-- 4. COMPETITOR_MENU_SNAPSHOTS table columns
SELECT 
    '--- COMPETITOR_MENU_SNAPSHOTS COLUMNS ---' as section,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitor_menu_snapshots'
ORDER BY ordinal_position;

-- 5. COMPETITOR_MENU_ITEMS table columns
SELECT 
    '--- COMPETITOR_MENU_ITEMS COLUMNS ---' as section,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitor_menu_items'
ORDER BY ordinal_position;

-- 6. Recent menu analyses - check data flow
SELECT 
    '--- RECENT MENU ANALYSES ---' as section,
    cma.id,
    cma.restaurant_name,
    cma.status,
    cma.competitors_found,
    cma.competitors_selected,
    cma.created_at,
    COUNT(DISTINCT cb.id) as competitors_stored,
    COUNT(DISTINCT cms.id) as menu_snapshots,
    COUNT(DISTINCT cmi.id) as menu_items_total
FROM competitor_menu_analyses cma
LEFT JOIN competitor_businesses cb ON cma.id = cb.analysis_id
LEFT JOIN competitor_menu_snapshots cms ON cma.id = cms.analysis_id
LEFT JOIN competitor_menu_items cmi ON cms.id = cmi.snapshot_id
WHERE cma.created_at > NOW() - INTERVAL '7 days'
GROUP BY cma.id, cma.restaurant_name, cma.status, cma.competitors_found, cma.competitors_selected, cma.created_at
ORDER BY cma.created_at DESC
LIMIT 10;

-- 7. Check for orphaned competitor_businesses (stored but not linked)
SELECT 
    '--- ORPHANED COMPETITOR_BUSINESSES ---' as section,
    cb.id,
    cb.business_name,
    cb.analysis_id,
    cb.is_selected,
    cb.created_at,
    COUNT(cms.id) as menu_snapshots
FROM competitor_businesses cb
LEFT JOIN competitor_menu_snapshots cms ON cb.id = cms.competitor_id
WHERE cb.created_at > NOW() - INTERVAL '7 days'
GROUP BY cb.id, cb.business_name, cb.analysis_id, cb.is_selected, cb.created_at
ORDER BY cb.created_at DESC
LIMIT 10;

-- 8. Sample data from competitor_businesses
SELECT 
    '--- SAMPLE COMPETITOR_BUSINESSES ---' as section,
    id, analysis_id, place_id, business_name, is_selected, created_at
FROM competitor_businesses
ORDER BY created_at DESC
LIMIT 5;

-- 9. Sample data from competitor_menu_snapshots
SELECT 
    '--- SAMPLE MENU SNAPSHOTS ---' as section,
    id, competitor_id, analysis_id, menu_source, parse_status, created_at
FROM competitor_menu_snapshots
ORDER BY created_at DESC
LIMIT 5;

-- 10. Sample data from competitor_menu_items
SELECT 
    '--- SAMPLE MENU ITEMS ---' as section,
    id, snapshot_id, category_name, item_name, base_price
FROM competitor_menu_items
ORDER BY created_at DESC
LIMIT 5;
