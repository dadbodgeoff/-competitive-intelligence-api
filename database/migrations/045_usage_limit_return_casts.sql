-- ============================================================================
-- MIGRATION 045: Usage Limit Timestamp Casting
-- ============================================================================
-- Description : Fixes the runtime error thrown by check_usage_limit when the
--               function attempts to return TIMESTAMP WITHOUT TIME ZONE values
--               (stored in user_usage_limits) even though the return signature
--               expects TIMESTAMPTZ. We now explicitly cast/annotate every
--               reset_date response so the type matches the declared schema.
-- Author      : GPT-5.1 Codex
-- Date        : 2025-11-21
-- Dependencies: 034_usage_limits_account_context.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_operation_type VARCHAR(50)
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_usage INTEGER,
    limit_value INTEGER,
    reset_date TIMESTAMPTZ,
    message TEXT
) AS $$
DECLARE
    v_subscription_tier VARCHAR(50);
    v_usage_record RECORD;
    v_current_time_est TIMESTAMP;
    v_account_id UUID;
BEGIN
    -- Resolve account context
    v_account_id := get_primary_account_id(p_user_id);

    IF v_account_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'No active account assigned';
        RETURN;
    END IF;

    -- Get subscription tier
    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;

    -- Premium/Enterprise users have unlimited access
    IF v_subscription_tier IN ('premium', 'enterprise') THEN
        RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
        RETURN;
    END IF;

    v_current_time_est := NOW() AT TIME ZONE 'America/New_York';

    -- Ensure usage record exists
    SELECT * INTO v_usage_record
    FROM user_usage_limits
    WHERE user_id = p_user_id
      AND account_id = v_account_id
    FOR UPDATE;

    IF NOT FOUND THEN
        PERFORM initialize_usage_limits(p_user_id);
        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
          AND account_id = v_account_id
        FOR UPDATE;
    END IF;

    -- Weekly reset
    IF v_current_time_est >= v_usage_record.weekly_reset_date THEN
        UPDATE user_usage_limits
        SET weekly_invoice_uploads = 0,
            weekly_free_analyses = 0,
            weekly_menu_comparisons = 0,
            weekly_menu_uploads = 0,
            weekly_premium_analyses = 0,
            weekly_reset_date = get_next_monday_est(),
            updated_at = NOW()
        WHERE user_id = p_user_id
          AND account_id = v_account_id;

        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
          AND account_id = v_account_id;
    END IF;

    -- Monthly reset
    IF v_current_time_est >= v_usage_record.monthly_reset_date THEN
        UPDATE user_usage_limits
        SET monthly_bonus_invoices = 0,
            monthly_reset_date = get_next_28day_reset(),
            updated_at = NOW()
        WHERE user_id = p_user_id
          AND account_id = v_account_id;

        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
          AND account_id = v_account_id;
    END IF;

    -- Helper to normalize reset timestamps to timestamptz
    -- Stored values are EST wall-clock timestamps (without tz)
    -- so cast them back to timestamptz using the same timezone assumption.
    --
    -- NOTE: "AT TIME ZONE 'America/New_York'" converts the naive timestamp into
    -- a proper timestamptz while preserving the intended EST instant.
    -- =========================================================================

    CASE p_operation_type
        WHEN 'invoice_upload' THEN
            IF v_usage_record.weekly_invoice_uploads < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_invoice_uploads, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly invoice upload available'::TEXT;
            ELSIF v_usage_record.monthly_bonus_invoices < 2 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.monthly_bonus_invoices, 2,
                    (v_usage_record.monthly_reset_date AT TIME ZONE 'America/New_York'),
                    'Bonus invoice upload available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_invoice_uploads, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly limit (1) and monthly bonus (2) exhausted'::TEXT;
            END IF;

        WHEN 'free_analysis' THEN
            IF v_usage_record.weekly_free_analyses < 2 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_free_analyses, 2,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Free analysis available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_free_analyses, 2,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly limit (2) exhausted'::TEXT;
            END IF;

        WHEN 'menu_comparison' THEN
            IF v_usage_record.weekly_menu_comparisons < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_menu_comparisons, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Menu comparison available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_menu_comparisons, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly limit (1) exhausted'::TEXT;
            END IF;

        WHEN 'menu_upload' THEN
            IF v_usage_record.weekly_menu_uploads < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_menu_uploads, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Menu upload available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_menu_uploads, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly limit (1) exhausted'::TEXT;
            END IF;

        WHEN 'premium_analysis' THEN
            IF v_usage_record.weekly_premium_analyses < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_premium_analyses, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Premium analysis available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_premium_analyses, 1,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly limit (1) exhausted'::TEXT;
            END IF;

        ELSE
            RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'Unknown operation type'::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 045 complete: usage limit reset_date outputs now cast to timestamptz.';
END $$;


