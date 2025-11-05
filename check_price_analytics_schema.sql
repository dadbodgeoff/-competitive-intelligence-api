-- Check what price analytics related tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name LIKE '%price%'
        OR table_name LIKE '%tracking%'
        OR table_name LIKE '%inventory%'
    )
ORDER BY table_name;

-- Check inventory_items columns for price tracking
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'inventory_items'
    AND (
        column_name LIKE '%price%'
        OR column_name LIKE '%last%'
    )
ORDER BY ordinal_position;

-- Check if there are any price analytics functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%price%'
ORDER BY routine_name;
