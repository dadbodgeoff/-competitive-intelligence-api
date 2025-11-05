-- ============================================================================
-- VERIFY USAGE LIMITS MIGRATION
-- Run this in Supabase SQL Editor to verify the migration worked
-- ============================================================================

-- Test 1: Check tables exist
SELECT 'Test 1: Tables exist' as test;
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage_limits', 'usage_history')
ORDER BY tablename;

-- Test 2: Check functions exist
SELECT 'Test 2: Functions exist' as test;
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN (
    'check_usage_limit',
    'increment_usage',
    'initialize_usage_limits',
    'get_next_monday_est',
    'get_next_28day_reset'
)
ORDER BY proname;

-- Test 3: Check indexes exist
SELECT 'Test 3: Indexes exist' as test;
SELECT 
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage_limits', 'usage_history')
ORDER BY tablename, indexname;

-- Test 4: Check RLS policies exist
SELECT 'Test 4: RLS Policies exist' as test;
SELECT 
    tablename,
    policyname,
    cmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage_limits', 'usage_history')
ORDER BY tablename, policyname;

-- Test 5: Test date calculation functions
SELECT 'Test 5: Date functions work' as test;
SELECT 
    'Next Monday EST' as description,
    get_next_monday_est() as calculated_date
UNION ALL
SELECT 
    'Next 28-day reset' as description,
    get_next_28day_reset() as calculated_date;

-- Test 6: Test with a real user (if exists)
SELECT 'Test 6: Test with real user' as test;

-- Get first user
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    -- Get first user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user: %', test_user_id;
        
        -- Initialize limits for user
        PERFORM initialize_usage_limits(test_user_id);
        RAISE NOTICE 'Initialized usage limits';
        
        -- Check usage limit
        FOR test_result IN 
            SELECT * FROM check_usage_limit(test_user_id, 'invoice_upload')
        LOOP
            RAISE NOTICE 'Check result: allowed=%, current=%, limit=%, message=%', 
                test_result.allowed, 
                test_result.current_usage, 
                test_result.limit_value,
                test_result.message;
        END LOOP;
        
        RAISE NOTICE 'All tests passed!';
    ELSE
        RAISE NOTICE 'No users found - skipping user tests';
    END IF;
END $$;

-- Test 7: Show usage limits for all users
SELECT 'Test 7: Current usage limits' as test;
SELECT 
    u.id as user_id,
    u.subscription_tier,
    ul.weekly_invoice_uploads,
    ul.weekly_free_analyses,
    ul.weekly_menu_comparisons,
    ul.weekly_menu_uploads,
    ul.weekly_premium_analyses,
    ul.monthly_bonus_invoices,
    ul.weekly_reset_date,
    ul.monthly_reset_date
FROM users u
LEFT JOIN user_usage_limits ul ON ul.user_id = u.id
LIMIT 5;

-- Test 8: Show usage history
SELECT 'Test 8: Usage history' as test;
SELECT 
    user_id,
    operation_type,
    subscription_tier,
    timestamp,
    metadata
FROM usage_history
ORDER BY timestamp DESC
LIMIT 10;

-- Summary
SELECT 'VERIFICATION COMPLETE' as status;
SELECT 
    'Tables: ' || COUNT(DISTINCT tablename)::text as tables_created
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage_limits', 'usage_history');

SELECT 
    'Functions: ' || COUNT(*)::text as functions_created
FROM pg_proc 
WHERE proname IN (
    'check_usage_limit',
    'increment_usage',
    'initialize_usage_limits',
    'get_next_monday_est',
    'get_next_28day_reset'
);

SELECT 
    'Indexes: ' || COUNT(*)::text as indexes_created
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage_limits', 'usage_history');

SELECT 
    'RLS Policies: ' || COUNT(*)::text as policies_created
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage_limits', 'usage_history');
