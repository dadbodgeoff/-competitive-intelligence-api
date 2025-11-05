-- ============================================================================
-- COMPLETE FIX: Usage Limits System for Production
-- ============================================================================
-- This creates all missing functions and re-enables the trigger

-- Step 1: Drop any existing broken versions
DROP FUNCTION IF EXISTS initialize_usage_limits(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_next_monday_est() CASCADE;
DROP FUNCTION IF EXISTS get_next_28day_reset() CASCADE;
DROP FUNCTION IF EXISTS trigger_initialize_usage_limits() CASCADE;
DROP TRIGGER IF EXISTS on_user_created_init_limits ON auth.users;

-- Step 2: Create helper function for weekly reset (next Monday EST)
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

-- Step 3: Create helper function for monthly reset (28 days from now)
CREATE OR REPLACE FUNCTION get_next_28day_reset()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN (CURRENT_DATE + INTERVAL '28 days')::TIMESTAMP AT TIME ZONE 'America/New_York';
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 4: Create the main initialization function
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

-- Step 5: Create the trigger function
CREATE OR REPLACE FUNCTION trigger_initialize_usage_limits()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM initialize_usage_limits(NEW.id);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Failed to initialize usage limits for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the trigger
CREATE TRIGGER on_user_created_init_limits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_initialize_usage_limits();

-- Step 7: Backfill existing users who don't have usage limits
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
)
SELECT 
    id,
    0,
    0,
    get_next_monday_est(),
    0,
    get_next_28day_reset(),
    0,
    0,
    0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_usage_limits)
ON CONFLICT (user_id) DO NOTHING;

-- Step 8: Verify everything was created
SELECT 
    'Functions created' as status,
    COUNT(*) as count
FROM pg_proc 
WHERE proname IN ('initialize_usage_limits', 'get_next_monday_est', 'get_next_28day_reset', 'trigger_initialize_usage_limits')

UNION ALL

SELECT 
    'Trigger created' as status,
    COUNT(*) as count
FROM pg_trigger 
WHERE tgname = 'on_user_created_init_limits'

UNION ALL

SELECT 
    'Users with limits' as status,
    COUNT(*) as count
FROM user_usage_limits;
