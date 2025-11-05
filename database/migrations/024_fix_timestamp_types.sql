-- ============================================================================
-- MIGRATION 024: Fix Timestamp Type Mismatch in check_usage_limit
-- ============================================================================
-- Description: Fix timestamp type mismatch causing usage limit errors
-- Issue: Function returns TIMESTAMPTZ but declares TIMESTAMP
-- Date: 2025-11-04
-- ============================================================================

-- Drop and recreate the function with correct return type
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_operation_type VARCHAR(50)
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_usage INTEGER,
    limit_value INTEGER,
    reset_date TIMESTAMPTZ,  -- Changed from TIMESTAMP to TIMESTAMPTZ
    message TEXT
) AS $$
DECLARE
    v_subscription_tier VARCHAR(50);
    v_usage_record RECORD;
    v_current_time_est TIMESTAMP;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;
    
    -- Premium/Enterprise users have unlimited access
    IF v_subscription_tier IN ('premium', 'enterprise') THEN
        RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
        RETURN;
    END IF;
    
    -- Get current time in EST
    v_current_time_est := NOW() AT TIME ZONE 'America/New_York';
    
    -- Get or create usage record
    SELECT * INTO v_usage_record
    FROM user_usage_limits
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock row to prevent race conditions
    
    IF NOT FOUND THEN
        PERFORM initialize_usage_limits(p_user_id);
        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
        FOR UPDATE;
    END IF;
    
    -- Check if weekly reset is needed
    IF v_current_time_est >= v_usage_record.weekly_reset_date THEN
        UPDATE user_usage_limits
        SET weekly_invoice_uploads = 0,
            weekly_free_analyses = 0,
            weekly_menu_comparisons = 0,
            weekly_menu_uploads = 0,
            weekly_premium_analyses = 0,
            weekly_reset_date = get_next_monday_est(),
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Refresh record
        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id;
    END IF;
    
    -- Check if 28-day reset is needed
    IF v_current_time_est >= v_usage_record.monthly_reset_date THEN
        UPDATE user_usage_limits
        SET monthly_bonus_invoices = 0,
            monthly_reset_date = get_next_28day_reset(),
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Refresh record
        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id;
    END IF;
    
    -- Check specific operation limits
    CASE p_operation_type
        WHEN 'invoice_upload' THEN
            -- Check weekly limit (1) OR monthly bonus (2)
            IF v_usage_record.weekly_invoice_uploads < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_invoice_uploads, 1, 
                    v_usage_record.weekly_reset_date, 'Weekly invoice upload available'::TEXT;
            ELSIF v_usage_record.monthly_bonus_invoices < 2 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.monthly_bonus_invoices, 2,
                    v_usage_record.monthly_reset_date, 'Bonus invoice upload available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_invoice_uploads, 1,
                    v_usage_record.weekly_reset_date, 'Weekly limit (1) and monthly bonus (2) exhausted'::TEXT;
            END IF;
            
        WHEN 'free_analysis' THEN
            IF v_usage_record.weekly_free_analyses < 2 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_free_analyses, 2,
                    v_usage_record.weekly_reset_date, 'Free analysis available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_free_analyses, 2,
                    v_usage_record.weekly_reset_date, 'Weekly limit (2) exhausted'::TEXT;
            END IF;
            
        WHEN 'menu_comparison' THEN
            IF v_usage_record.weekly_menu_comparisons < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_menu_comparisons, 1,
                    v_usage_record.weekly_reset_date, 'Menu comparison available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_menu_comparisons, 1,
                    v_usage_record.weekly_reset_date, 'Weekly limit (1) exhausted'::TEXT;
            END IF;
            
        WHEN 'menu_upload' THEN
            IF v_usage_record.weekly_menu_uploads < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_menu_uploads, 1,
                    v_usage_record.weekly_reset_date, 'Menu upload available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_menu_uploads, 1,
                    v_usage_record.weekly_reset_date, 'Weekly limit (1) exhausted'::TEXT;
            END IF;
            
        WHEN 'premium_analysis' THEN
            IF v_usage_record.weekly_premium_analyses < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_premium_analyses, 1,
                    v_usage_record.weekly_reset_date, 'Premium analysis available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_premium_analyses, 1,
                    v_usage_record.weekly_reset_date, 'Weekly limit (1) exhausted'::TEXT;
            END IF;
            
        ELSE
            RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'Unknown operation type'::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 024 complete: Fixed timestamp type mismatch';
    RAISE NOTICE '   Changed reset_date return type from TIMESTAMP to TIMESTAMPTZ';
END $$;
