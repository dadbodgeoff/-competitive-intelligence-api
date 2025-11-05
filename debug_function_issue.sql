-- Debug: Check what's actually in the database

-- 1. Check if the function exists and in what schema
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'initialize_usage_limits';

-- 2. Check the trigger
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname = 'on_user_created_init_limits';

-- 3. Check if user_usage_limits table exists
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE tablename = 'user_usage_limits';
