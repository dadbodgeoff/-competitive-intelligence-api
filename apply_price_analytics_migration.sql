-- Apply Price Analytics Functions Migration
-- Run this in Supabase SQL Editor to ensure functions exist

-- Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'get_vendor_price_comparison',
        'find_savings_opportunities',
        'calculate_vendor_competitive_score',
        'detect_price_anomalies'
    )
ORDER BY routine_name;

-- If functions don't exist, they need to be created from:
-- database/migrations/007_price_analytics_functions.sql
