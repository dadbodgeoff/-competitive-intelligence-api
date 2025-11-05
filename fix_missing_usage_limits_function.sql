-- ============================================================================
-- FIX: Missing initialize_usage_limits function in production
-- ============================================================================
-- This fixes the error: function initialize_usage_limits(uuid) does not exist
-- The trigger exists but the function it calls is missing

-- Drop existing functions with wrong signatures first
DROP FUNCTION IF EXISTS get_next_monday_est() CASCADE;
DROP FUNCTION IF EXISTS get_next_28day_reset() CASCADE;
DROP FUNCTION IF EXISTS initialize_usage_limits(UUID) CASCADE;

-- Create the helper functions
CREATE OR REPLACE FUNCTION get_next_monday_est()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    v_now TIMESTAMP WITH TIME ZONE;
    v_days_until_monday INTEGER;
BEGIN
    v_now := NOW() AT TIME ZONE 'America/New_York';
    v_days_until_monday := (8 - EXTRACT(DOW FROM v_now)::INTEGER) % 7;
    IF v_days_until_monday = 0 THEN
        v_days_until_monday := 7;
    END IF;
    RETURN (DATE(v_now) + v_days_until_monday)::TIMESTAMP AT TIME ZONE 'America/New_York';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_next_28day_reset()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN (CURRENT_DATE + INTERVAL '28 days')::TIMESTAMP AT TIME ZONE 'America/New_York';
END;
$$ LANGUAGE plpgsql STABLE;

-- Now create the main function that's missing
CREATE OR REPLACE FUNCTION initialize_usage_limits(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_usage_limits (
        user_id,
        weekly_invoice_uploads,
        weekly_free_analyses,
        weekly_reset_date,
        monthly_bonus_invoices,
        monthly_reset_date,
        weekly_menu_comparisons,
        weekly_menu_uploads,
        weekly_premium_analyses
    ) VALUES (
        p_user_id,
        0,
        0,
        get_next_monday_est(),
        0,
        get_next_28day_reset(),
        0,
        0,
        0
    )
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the function was created
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'initialize_usage_limits';

-- Test it works (this should not error)
DO $$
BEGIN
    RAISE NOTICE 'Function initialize_usage_limits exists and is callable';
END $$;
