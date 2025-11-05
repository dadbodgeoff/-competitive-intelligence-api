-- Run this in Supabase SQL Editor to diagnose the schema issue

-- 1. Check which schema inventory_items is in
SELECT 
    table_schema, 
    table_name
FROM information_schema.tables 
WHERE table_name = 'inventory_items';

-- 2. Check current search_path
SHOW search_path;

-- 3. Check which schema the function is in
SELECT 
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'get_item_price_metrics';

-- 4. List all schemas
SELECT schema_name 
FROM information_schema.schemata
ORDER BY schema_name;
