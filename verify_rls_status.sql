-- ============================================================================
-- RLS Status Verification Script
-- ============================================================================
-- Run this in Supabase SQL Editor to check RLS status
-- ============================================================================

-- 1. Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'analyses', 
  'reviews', 
  'insights', 
  'analysis_competitors', 
  'competitors', 
  'evidence_reviews',
  'users',
  'invoices',
  'invoice_items',
  'inventory_items',
  'menus',
  'menu_items'
)
ORDER BY 
  CASE WHEN rowsecurity THEN 1 ELSE 0 END,
  tablename;

-- 2. List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as command,
  roles::text as applies_to
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Find tables with policies but RLS not enabled (CRITICAL ISSUE)
SELECT 
  tablename,
  '🚨 CRITICAL: Has policies but RLS not enabled' as issue
FROM pg_tables t
WHERE schemaname = 'public'
AND rowsecurity = false
AND EXISTS (
  SELECT 1 FROM pg_policies p 
  WHERE p.tablename = t.tablename
)
ORDER BY tablename;

-- 4. Check function search paths
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE 
    WHEN p.prosecdef THEN '⚠️ SECURITY DEFINER'
    ELSE 'INVOKER'
  END as security_type,
  CASE 
    WHEN pc.prosrc LIKE '%SET search_path%' THEN '✅ Has search_path'
    ELSE '❌ Missing search_path'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_proc pc ON p.oid = pc.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'handle_new_user',
  'update_user_subscription_tier',
  'get_user_subscription_details',
  'check_and_reserve_usage_atomic',
  'get_vendor_price_comparison',
  'find_savings_opportunities'
)
ORDER BY 
  CASE WHEN pc.prosrc LIKE '%SET search_path%' THEN 1 ELSE 0 END,
  p.proname;

-- 5. Summary Report
DO $$
DECLARE
  total_tables INTEGER;
  rls_enabled INTEGER;
  has_policies_no_rls INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public';
  
  -- Count RLS enabled
  SELECT COUNT(*) INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;
  
  -- Count critical issues
  SELECT COUNT(*) INTO has_policies_no_rls
  FROM pg_tables t
  WHERE schemaname = 'public'
  AND rowsecurity = false
  AND EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename);
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS SECURITY SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total public tables: %', total_tables;
  RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled;
  RAISE NOTICE '🚨 CRITICAL: Tables with policies but RLS disabled: %', has_policies_no_rls;
  RAISE NOTICE '========================================';
  
  IF has_policies_no_rls > 0 THEN
    RAISE WARNING 'SECURITY ISSUE: % table(s) have RLS policies but RLS is not enabled!', has_policies_no_rls;
    RAISE WARNING 'Run migration 021_enable_rls_critical_tables.sql immediately';
  ELSE
    RAISE NOTICE '✅ All tables with policies have RLS enabled';
  END IF;
END $$;
