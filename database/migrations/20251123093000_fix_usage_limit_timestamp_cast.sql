-- ============================================================================
-- Migration: Ensure check_usage_limit returns TIMESTAMPTZ reset dates
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
    v_current_time TIMESTAMPTZ;
    v_account_id UUID;
BEGIN
    v_account_id := get_primary_account_id(p_user_id);

    IF v_account_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'No active account assigned';
        RETURN;
    END IF;

    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;

    IF v_subscription_tier = 'enterprise' THEN
        RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
        RETURN;
    END IF;

    IF v_subscription_tier = 'premium' AND p_operation_type <> 'image_generation' THEN
        RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
        RETURN;
    END IF;

    v_current_time := NOW();

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

    IF v_current_time >= v_usage_record.weekly_reset_date THEN
        UPDATE user_usage_limits
        SET weekly_invoice_uploads = 0,
            weekly_free_analyses = 0,
            weekly_menu_comparisons = 0,
            weekly_menu_uploads = 0,
            weekly_premium_analyses = 0,
            weekly_image_generations = 0,
            weekly_reset_date = get_next_monday_est(),
            updated_at = NOW()
        WHERE user_id = p_user_id
          AND account_id = v_account_id;

        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
          AND account_id = v_account_id;
    END IF;

    IF v_current_time >= v_usage_record.monthly_reset_date THEN
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

    IF v_current_time >= v_usage_record.image_generation_28day_reset THEN
        UPDATE user_usage_limits
        SET image_generation_28day_count = 0,
            image_generation_28day_reset = get_next_28day_reset(),
            updated_at = NOW()
        WHERE user_id = p_user_id
          AND account_id = v_account_id;

        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
          AND account_id = v_account_id;
    END IF;

    IF v_current_time >= v_usage_record.premium_image_generation_reset THEN
        UPDATE user_usage_limits
        SET premium_image_generation_count = 0,
            premium_image_generation_reset = get_next_month_start_est(),
            updated_at = NOW()
        WHERE user_id = p_user_id
          AND account_id = v_account_id;

        SELECT * INTO v_usage_record
        FROM user_usage_limits
        WHERE user_id = p_user_id
          AND account_id = v_account_id;
    END IF;

    CASE p_operation_type
        WHEN 'invoice_upload' THEN
            IF v_usage_record.weekly_invoice_uploads < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_invoice_uploads, 1,
                    v_usage_record.weekly_reset_date,
                    'Weekly invoice upload available'::TEXT;
            ELSIF v_usage_record.monthly_bonus_invoices < 2 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.monthly_bonus_invoices, 2,
                    v_usage_record.monthly_reset_date,
                    'Bonus invoice upload available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_invoice_uploads, 1,
                    v_usage_record.weekly_reset_date,
                    'Weekly limit (1) and monthly bonus (2) exhausted'::TEXT;
            END IF;

        WHEN 'free_analysis' THEN
            IF v_usage_record.weekly_free_analyses < 2 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_free_analyses, 2,
                    v_usage_record.weekly_reset_date,
                    'Free analysis available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_free_analyses, 2,
                    v_usage_record.weekly_reset_date,
                    'Weekly limit (2) exhausted'::TEXT;
            END IF;

        WHEN 'menu_comparison' THEN
            IF v_usage_record.weekly_menu_comparisons < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_menu_comparisons, 1,
                    v_usage_record.weekly_reset_date,
                    'Menu comparison available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_menu_comparisons, 1,
                    v_usage_record.weekly_reset_date,
                    'Weekly limit (1) exhausted'::TEXT;
            END IF;

        WHEN 'menu_upload' THEN
            IF v_usage_record.weekly_menu_uploads < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_menu_uploads, 1,
                    v_usage_record.weekly_reset_date,
                    'Menu upload available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_menu_uploads, 1,
                    v_usage_record.weekly_reset_date,
                    'Weekly limit (1) exhausted'::TEXT;
            END IF;

        WHEN 'premium_analysis' THEN
            IF v_usage_record.weekly_premium_analyses < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_premium_analyses, 1,
                    v_usage_record.weekly_reset_date,
                    'Premium analysis available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_premium_analyses, 1,
                    v_usage_record.weekly_reset_date,
                    'Weekly limit (1) exhausted'::TEXT;
            END IF;

        WHEN 'image_generation' THEN
            IF v_subscription_tier = 'premium' THEN
                IF v_usage_record.premium_image_generation_count < 50 THEN
                    RETURN QUERY SELECT TRUE, v_usage_record.premium_image_generation_count, 50,
                        v_usage_record.premium_image_generation_reset,
                        'Monthly premium creative generation available'::TEXT;
                ELSE
                    RETURN QUERY SELECT FALSE, v_usage_record.premium_image_generation_count, 50,
                        v_usage_record.premium_image_generation_reset,
                        'Monthly premium creative limit (50) exhausted'::TEXT;
                END IF;
            ELSE
                IF v_usage_record.image_generation_28day_count < 1 THEN
                    RETURN QUERY SELECT TRUE, v_usage_record.image_generation_28day_count, 1,
                        v_usage_record.image_generation_28day_reset,
                        'Creative generation available (1 per 28 days)'::TEXT;
                ELSE
                    RETURN QUERY SELECT FALSE, v_usage_record.image_generation_28day_count, 1,
                        v_usage_record.image_generation_28day_reset,
                        '28-day creative limit (1) exhausted'::TEXT;
                END IF;
            END IF;

        ELSE
            RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'Unknown operation type'::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- End of Migration
-- ============================================================================

