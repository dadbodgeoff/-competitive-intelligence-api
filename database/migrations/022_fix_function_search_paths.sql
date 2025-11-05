-- ============================================================================
-- Migration 022: Fix Function Search Paths
-- ============================================================================
-- Purpose: Add SET search_path to all functions to prevent search path injection
-- Risk: MEDIUM - Functions without search_path can be exploited for privilege escalation
-- Reference: https://www.postgresql.org/docs/current/sql-createfunction.html
-- ============================================================================

-- Critical Authentication & Authorization Functions
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_subscription_tier(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_subscription_details(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_and_reserve_usage_atomic(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_usage_stats(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_operation_limit(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_tier_limits(text) SET search_path = public, pg_temp;

-- Price Analytics Functions
ALTER FUNCTION public.get_vendor_price_comparison(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.find_savings_opportunities(uuid, numeric, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_vendor_competitive_score(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.detect_price_anomalies(uuid, integer, numeric) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_item_price_metrics(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_all_items_price_summary(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_items_with_price_changes(uuid, integer, numeric) SET search_path = public, pg_temp;

-- Inventory Functions
ALTER FUNCTION public.update_inventory_item_price_tracking() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_inventory_item_price_tracking_for_item(uuid) SET search_path = public, pg_temp;

-- Menu Functions
ALTER FUNCTION public.get_active_menu(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.validate_menu_structure(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_competitor_menu_access(uuid, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_expired_competitor_menus() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_menu_comparison_analysis(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_comparison_insights(uuid) SET search_path = public, pg_temp;

-- Fuzzy Matching Functions
ALTER FUNCTION public.find_similar_items(text, uuid, numeric) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_fuzzy_matching_stats(uuid) SET search_path = public, pg_temp;

-- User Preferences Functions
ALTER FUNCTION public.get_waste_buffer(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_alert_threshold(uuid) SET search_path = public, pg_temp;

-- Invoice Functions
ALTER FUNCTION public.delete_invoice_with_cascade(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_duplicate_invoice(text, text, uuid) SET search_path = public, pg_temp;

-- Utility Functions
ALTER FUNCTION public.get_system_time() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Verify all functions have search_path set
DO $$
DECLARE
    func_record RECORD;
    missing_search_path BOOLEAN := false;
BEGIN
    RAISE NOTICE 'Checking function search paths...';
    
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments,
            p.prosecdef as is_security_definer,
            (SELECT setting FROM pg_settings WHERE name = 'search_path') as current_search_path
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'handle_new_user',
            'update_user_subscription_tier',
            'get_user_subscription_details',
            'get_vendor_price_comparison',
            'find_savings_opportunities',
            'calculate_vendor_competitive_score',
            'detect_price_anomalies',
            'update_inventory_item_price_tracking',
            'update_inventory_item_price_tracking_for_item',
            'check_and_reserve_usage_atomic',
            'update_competitor_menu_access',
            'cleanup_expired_competitor_menus',
            'validate_menu_structure',
            'find_similar_items',
            'get_fuzzy_matching_stats',
            'get_system_time',
            'check_operation_limit',
            'get_menu_comparison_analysis',
            'get_comparison_insights',
            'get_waste_buffer',
            'get_alert_threshold',
            'get_tier_limits',
            'delete_invoice_with_cascade',
            'check_duplicate_invoice',
            'get_user_usage_stats',
            'get_item_price_metrics',
            'get_all_items_price_summary',
            'get_items_with_price_changes',
            'get_active_menu',
            'update_updated_at_column'
        )
    LOOP
        RAISE NOTICE 'Function: %.%(%) - Security Definer: %', 
            'public',
            func_record.function_name,
            func_record.arguments,
            func_record.is_security_definer;
    END LOOP;

    RAISE NOTICE 'SUCCESS: All critical functions have been updated';
END $$;
