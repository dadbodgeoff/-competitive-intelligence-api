-- Quick check for critical features in production database

-- Critical tables check
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN '✅'
        ELSE '❌'
    END as users_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analyses') THEN '✅'
        ELSE '❌'
    END as analyses_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN '✅'
        ELSE '❌'
    END as invoices_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'menu_items') THEN '✅'
        ELSE '❌'
    END as menu_items_table;

-- Critical functions check
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN '✅'
        ELSE '❌'
    END as handle_new_user_function,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN '✅'
        ELSE '❌'
    END as update_timestamp_function;

-- Critical triggers check
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE t.tgname = 'on_auth_user_created' AND n.nspname = 'auth'
        ) THEN '✅'
        ELSE '❌'
    END as auth_user_trigger;

-- RLS enabled check
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'analyses', 'invoices', 'menu_items')
ORDER BY tablename;

-- Extensions check
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN '✅'
        ELSE '❌'
    END as uuid_extension,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN '✅'
        ELSE '❌'
    END as fuzzy_match_extension;
