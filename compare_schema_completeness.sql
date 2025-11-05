-- Compare schema completeness - check for missing key features
-- Run this in your PRODUCTION database to verify everything copied correctly

-- 1. Check all tables exist
SELECT 
    'Tables' as object_type,
    tablename as name,
    schemaname as schema
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check all functions/stored procedures exist
SELECT 
    'Functions' as object_type,
    proname as name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;

-- 3. Check all triggers exist
SELECT 
    'Triggers' as object_type,
    t.tgname as name,
    c.relname as table_name,
    n.nspname as schema
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('public', 'auth')
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4. Check RLS policies
SELECT 
    'RLS Policies' as object_type,
    schemaname,
    tablename,
    policyname as name,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check indexes
SELECT 
    'Indexes' as object_type,
    schemaname,
    tablename,
    indexname as name
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. Check foreign key constraints
SELECT 
    'Foreign Keys' as object_type,
    tc.table_name,
    tc.constraint_name as name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 7. Check extensions
SELECT 
    'Extensions' as object_type,
    extname as name,
    extversion as version
FROM pg_extension
ORDER BY extname;
