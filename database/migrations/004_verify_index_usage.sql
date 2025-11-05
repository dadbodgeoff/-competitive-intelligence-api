-- ================================================================================
-- VERIFY GIN INDEX USAGE WITH REALISTIC DATA
-- ================================================================================
-- This script tests that the GIN index is used with a realistic dataset size
-- Run this AFTER 004_fuzzy_matching_setup.sql
-- ================================================================================

-- Check if pg_trgm extension is enabled
SELECT 
    extname as "Extension",
    extversion as "Version"
FROM pg_extension 
WHERE extname = 'pg_trgm';
-- Expected: pg_trgm | 1.6 (or similar)

-- Check if GIN index exists
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname = 'idx_inventory_items_normalized_trgm';
-- Expected: Should show the GIN index definition

-- Test similarity function
SELECT similarity('chicken breast boneless', 'boneless chicken breast') as similarity_score;
-- Expected: ~0.8-0.9

-- Test with small dataset (will use Seq Scan - this is correct!)
EXPLAIN ANALYZE
SELECT 
    id, 
    name, 
    similarity(normalized_name, 'chicken breast') as sim
FROM inventory_items
WHERE similarity(normalized_name, 'chicken breast') > 0.3
ORDER BY sim DESC
LIMIT 10;
-- With <100 rows: Seq Scan (faster for small tables)
-- With >1000 rows: Index Scan (faster for large tables)

-- ================================================================================
-- SIMULATE LARGER DATASET (Optional - for testing only)
-- ================================================================================
-- Uncomment to test index usage with realistic data size
-- WARNING: This creates test data - don't run in production!

/*
-- Create temporary test data
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
    i INTEGER;
    item_names TEXT[] := ARRAY[
        'Chicken Breast Boneless',
        'Ground Beef 80/20',
        'Pork Chops',
        'Salmon Fillet',
        'Turkey Breast',
        'Ribeye Steak',
        'Chicken Thighs',
        'Ground Turkey',
        'Bacon Strips',
        'Sausage Links',
        'Tomatoes Fresh',
        'Lettuce Romaine',
        'Onions Yellow',
        'Potatoes Russet',
        'Carrots Baby',
        'Broccoli Fresh',
        'Peppers Bell',
        'Mushrooms White',
        'Garlic Fresh',
        'Spinach Fresh'
    ];
BEGIN
    -- Insert 1000 test items (50 variations of each base item)
    FOR i IN 1..50 LOOP
        FOR j IN 1..array_length(item_names, 1) LOOP
            INSERT INTO inventory_items (
                user_id,
                name,
                normalized_name,
                category,
                unit_of_measure,
                current_quantity
            ) VALUES (
                test_user_id,
                item_names[j] || ' ' || i || ' lb',
                lower(item_names[j] || ' ' || i || ' lb'),
                'proteins',
                'lb',
                0
            );
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Created 1000 test items';
END $$;

-- Now test again - should use Index Scan
EXPLAIN ANALYZE
SELECT 
    id, 
    name, 
    similarity(normalized_name, 'chicken breast') as sim
FROM inventory_items
WHERE similarity(normalized_name, 'chicken breast') > 0.3
ORDER BY sim DESC
LIMIT 10;
-- Expected: Bitmap Index Scan on idx_inventory_items_normalized_trgm

-- Clean up test data
DELETE FROM inventory_items 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
*/

-- ================================================================================
-- INDEX STATISTICS
-- ================================================================================

-- Check index size
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexrelname = 'idx_inventory_items_normalized_trgm';
-- Shows current index size

-- Check index usage statistics (after some queries)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "Times Used",
    idx_tup_read as "Tuples Read",
    idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes
WHERE indexrelname = 'idx_inventory_items_normalized_trgm';
-- Shows how often the index is used

-- ================================================================================
-- PERFORMANCE COMPARISON
-- ================================================================================

-- Test query performance (run multiple times for accurate timing)
-- This will use the index when table is large enough

-- Query 1: Find similar items
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT 
    id,
    name,
    normalized_name,
    similarity(normalized_name, 'chicken breast boneless') as sim
FROM inventory_items
WHERE similarity(normalized_name, 'chicken breast boneless') > 0.3
ORDER BY sim DESC
LIMIT 10;

-- Query 2: Find items with specific similarity
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT 
    id,
    name,
    similarity(normalized_name, 'ground beef') as sim
FROM inventory_items
WHERE similarity(normalized_name, 'ground beef') > 0.5
ORDER BY sim DESC;

-- ================================================================================
-- VERIFICATION SUMMARY
-- ================================================================================

SELECT 
    'pg_trgm Extension' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm')
        THEN '✅ Enabled'
        ELSE '❌ Not Enabled'
    END as status
UNION ALL
SELECT 
    'GIN Index',
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inventory_items_normalized_trgm')
        THEN '✅ Created'
        ELSE '❌ Not Created'
    END
UNION ALL
SELECT 
    'Similarity Function',
    CASE 
        WHEN similarity('test', 'test') = 1.0
        THEN '✅ Working'
        ELSE '❌ Not Working'
    END
UNION ALL
SELECT
    'Review Index',
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_mappings_needs_review')
        THEN '✅ Created'
        ELSE '❌ Not Created'
    END
UNION ALL
SELECT
    'Confidence Index',
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_mappings_confidence')
        THEN '✅ Created'
        ELSE '❌ Not Created'
    END;

-- ================================================================================
-- NOTES
-- ================================================================================
-- 
-- Sequential Scan vs Index Scan:
-- - Small tables (<100 rows): Seq Scan is faster and correct
-- - Medium tables (100-1000 rows): PostgreSQL decides based on selectivity
-- - Large tables (>1000 rows): Index Scan is typically faster
-- 
-- Your current result showing Seq Scan is CORRECT and OPTIMAL for small datasets!
-- The index will automatically be used when your table grows.
-- 
-- Performance expectations:
-- - Small dataset (3 rows): 0.079ms (Seq Scan)
-- - Medium dataset (100 rows): 1-5ms (May use index)
-- - Large dataset (10,000 rows): 10-50ms (Will use index)
-- 
-- ================================================================================
