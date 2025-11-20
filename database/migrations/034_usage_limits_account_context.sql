-- ============================================================================
-- MIGRATION 034: Usage Limit Functions with Account Context
-- ============================================================================
-- Description : Updates usage limit helper functions to populate the new
--               account_id columns introduced in migration 033.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: 033_account_data_extensions.sql
-- ============================================================================

-- Helper function to resolve a user's active account
CREATE OR REPLACE FUNCTION get_primary_account_id(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_account_id UUID;
BEGIN
    SELECT primary_account_id INTO v_account_id
    FROM users
    WHERE id = p_user_id;

    IF v_account_id IS NULL THEN
        SELECT am.account_id
        INTO v_account_id
        FROM account_members am
        WHERE am.user_id = p_user_id
          AND am.status = 'active'
        ORDER BY
            CASE am.role
                WHEN 'owner' THEN 1
                WHEN 'admin' THEN 2
                ELSE 3
            END,
            am.created_at DESC
        LIMIT 1;
    END IF;

    RETURN v_account_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Initialize usage limits with account context
CREATE OR REPLACE FUNCTION initialize_usage_limits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_account_id UUID;
BEGIN
    v_account_id := get_primary_account_id(p_user_id);

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'No account found for user %', p_user_id;
    END IF;

    INSERT INTO user_usage_limits (
        user_id,
        account_id,
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
        v_account_id,
        0,
        0,
        get_next_monday_est(),
        0,
        get_next_28day_reset(),
        0,
        0,
        0
    )
    ON CONFLICT (account_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check usage limit with account scoping
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

    -- Check limits
    CASE p_operation_type
        WHEN 'invoice_upload' THEN
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

-- Increment usage with account tracking
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_operation_type VARCHAR(50),
    p_operation_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_tier VARCHAR(50);
    v_account_id UUID;
BEGIN
    v_account_id := get_primary_account_id(p_user_id);

    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'No account found for user %', p_user_id;
    END IF;

    -- Ensure usage row exists
    PERFORM initialize_usage_limits(p_user_id);

    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;

    IF v_subscription_tier IN ('premium', 'enterprise') THEN
        INSERT INTO usage_history (user_id, account_id, operation_type, operation_id, subscription_tier, metadata)
        VALUES (p_user_id, v_account_id, p_operation_type, p_operation_id, v_subscription_tier, p_metadata);
        RETURN TRUE;
    END IF;

    CASE p_operation_type
        WHEN 'invoice_upload' THEN
            UPDATE user_usage_limits
            SET weekly_invoice_uploads = CASE 
                    WHEN weekly_invoice_uploads < 1 THEN weekly_invoice_uploads + 1
                    ELSE weekly_invoice_uploads
                END,
                monthly_bonus_invoices = CASE
                    WHEN weekly_invoice_uploads >= 1 AND monthly_bonus_invoices < 2 THEN monthly_bonus_invoices + 1
                    ELSE monthly_bonus_invoices
                END,
                updated_at = NOW()
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'free_analysis' THEN
            UPDATE user_usage_limits
            SET weekly_free_analyses = weekly_free_analyses + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'menu_comparison' THEN
            UPDATE user_usage_limits
            SET weekly_menu_comparisons = weekly_menu_comparisons + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'menu_upload' THEN
            UPDATE user_usage_limits
            SET weekly_menu_uploads = weekly_menu_uploads + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'premium_analysis' THEN
            UPDATE user_usage_limits
            SET weekly_premium_analyses = weekly_premium_analyses + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        ELSE
            -- Unknown operation, do nothing
            RETURN FALSE;
    END CASE;

    INSERT INTO usage_history (
        user_id,
        account_id,
        operation_type,
        operation_id,
        subscription_tier,
        metadata
    ) VALUES (
        p_user_id,
        v_account_id,
        p_operation_type,
        p_operation_id,
        v_subscription_tier,
        p_metadata
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


