-- ============================================
-- REVIEW ANALYSIS MODULE SCHEMA VERIFICATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if tables exist
SELECT 
    'Table Existence Check' as check_type,
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('analyses', 'competitors', 'analysis_competitors', 'reviews', 'insights')
ORDER BY table_name;

-- 2. Get EXACT columns in 'analyses' table
SELECT 
    '--- ANALYSES TABLE COLUMNS ---' as section,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'analyses'
ORDER BY ordinal_position;

-- 3. Get EXACT columns in 'competitors' table
SELECT 
    '--- COMPETITORS TABLE COLUMNS ---' as section,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'competitors'
ORDER BY ordinal_position;

-- 4. Get EXACT columns in 'analysis_competitors' junction table
SELECT 
    '--- ANALYSIS_COMPETITORS TABLE COLUMNS ---' as section,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'analysis_competitors'
ORDER BY ordinal_position;

-- 5. Get EXACT columns in 'reviews' table
SELECT 
    '--- REVIEWS TABLE COLUMNS ---' as section,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 6. Get EXACT columns in 'insights' table
SELECT 
    '--- INSIGHTS TABLE COLUMNS ---' as section,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'insights'
ORDER BY ordinal_position;

-- 7. Check foreign key relationships
SELECT
    '--- FOREIGN KEY RELATIONSHIPS ---' as section,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('analyses', 'competitors', 'analysis_competitors', 'reviews', 'insights')
ORDER BY tc.table_name, kcu.column_name;

-- 8. Check recent analyses with competitor counts
SELECT
    '--- RECENT ANALYSES DATA CHECK ---' as section,
    a.id,
    a.restaurant_name,
    a.status,
    a.created_at,
    COUNT(DISTINCT ac.competitor_id) as competitors_linked,
    COUNT(DISTINCT r.id) as reviews_count,
    COUNT(DISTINCT i.id) as insights_count
FROM analyses a
LEFT JOIN analysis_competitors ac ON a.id = ac.analysis_id
LEFT JOIN reviews r ON ac.competitor_id = r.competitor_id
LEFT JOIN insights i ON a.id = i.analysis_id
WHERE a.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.id, a.restaurant_name, a.status, a.created_at
ORDER BY a.created_at DESC
LIMIT 10;

-- 9. Check if there are orphaned competitors (in competitors table but not linked)
SELECT
    '--- ORPHANED COMPETITORS CHECK ---' as section,
    c.id,
    c.name,
    c.created_at,
    COUNT(ac.analysis_id) as linked_analyses
FROM competitors c
LEFT JOIN analysis_competitors ac ON c.id = ac.competitor_id
WHERE c.created_at > NOW() - INTERVAL '7 days'
GROUP BY c.id, c.name, c.created_at
ORDER BY c.created_at DESC
LIMIT 10;

-- 10. Sample data from each table (if exists)
SELECT '--- SAMPLE ANALYSES DATA ---' as section, * FROM analyses ORDER BY created_at DESC LIMIT 3;
SELECT '--- SAMPLE COMPETITORS DATA ---' as section, * FROM competitors ORDER BY created_at DESC LIMIT 3;
SELECT '--- SAMPLE ANALYSIS_COMPETITORS DATA ---' as section, * FROM analysis_competitors LIMIT 5;
SELECT '--- SAMPLE REVIEWS DATA ---' as section, id, competitor_id, source, rating, LEFT(text, 50) as text_preview FROM reviews ORDER BY created_at DESC LIMIT 3;
SELECT '--- SAMPLE INSIGHTS DATA ---' as section, id, analysis_id, category, title FROM insights ORDER BY created_at DESC LIMIT 3;
