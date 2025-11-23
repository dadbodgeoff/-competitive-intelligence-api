-- ============================================================================
-- Migration: Premium image generation monthly limits
-- ============================================================================

-- Helper to reset on the first day of the next calendar month (Eastern time)
CREATE OR REPLACE FUNCTION get_next_month_start_est()
RETURNS TIMESTAMPTZ AS $$
DECLARE
    v_local TIMESTAMP;
BEGIN
    v_local := timezone('America/New_York', NOW());
    RETURN (date_trunc('month', v_local) + interval '1 month') AT TIME ZONE 'America/New_York';
END;
$$ LANGUAGE plpgsql STABLE;

-- Add premium tracking columns
ALTER TABLE user_usage_limits
    ADD COLUMN IF NOT EXISTS premium_image_generation_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS premium_image_generation_reset TIMESTAMPTZ NOT NULL DEFAULT get_next_month_start_est();

UPDATE user_usage_limits
SET premium_image_generation_reset = COALESCE(premium_image_generation_reset, get_next_month_start_est());

-- Recreate initialize function with new columns
CREATE OR REPLACE FUNCTION initialize_usage_limits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_account_id UUID;
BEGIN
    v_account_id := get_primary_account_id(p_user_id);
    IF v_account_id IS NULL THEN
        RETURN;
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
        weekly_premium_analyses,
        weekly_image_generations,
        image_generation_28day_count,
        image_generation_28day_reset,
        premium_image_generation_count,
        premium_image_generation_reset
    )
    VALUES (
        p_user_id,
        v_account_id,
        0,
        0,
        get_next_monday_est(),
        0,
        get_next_28day_reset(),
        0,
        0,
        0,
        0,
        0,
        get_next_28day_reset(),
        0,
        get_next_month_start_est()
    )
    ON CONFLICT (account_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate check_usage_limit with premium monthly enforcement
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
    v_account_id := get_primary_account_id(p_user_id);

    IF v_account_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'No active account assigned';
        RETURN;
    END IF;

    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;

    -- Enterprise remains unlimited
    IF v_subscription_tier = 'enterprise' THEN
        RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
        RETURN;
    END IF;

    -- Premium is unlimited except for image generation
    IF v_subscription_tier = 'premium' AND p_operation_type <> 'image_generation' THEN
        RETURN QUERY SELECT TRUE, 0, 999999, NOW(), 'Unlimited access'::TEXT;
        RETURN;
    END IF;

    v_current_time_est := NOW() AT TIME ZONE 'America/New_York';

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

    IF v_current_time_est >= v_usage_record.weekly_reset_date THEN
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

    IF v_current_time_est >= v_usage_record.image_generation_28day_reset THEN
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

    IF v_current_time_est >= v_usage_record.premium_image_generation_reset THEN
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

        WHEN 'image_generation' THEN
            IF v_subscription_tier = 'premium' THEN
                IF v_usage_record.premium_image_generation_count < 50 THEN
                    RETURN QUERY SELECT TRUE, v_usage_record.premium_image_generation_count, 50,
                        (v_usage_record.premium_image_generation_reset AT TIME ZONE 'America/New_York'),
                        'Monthly premium creative generation available'::TEXT;
                ELSE
                    RETURN QUERY SELECT FALSE, v_usage_record.premium_image_generation_count, 50,
                        (v_usage_record.premium_image_generation_reset AT TIME ZONE 'America/New_York'),
                        'Monthly premium creative limit (50) exhausted'::TEXT;
                END IF;
            ELSE
                IF v_usage_record.image_generation_28day_count < 1 THEN
                    RETURN QUERY SELECT TRUE, v_usage_record.image_generation_28day_count, 1,
                        (v_usage_record.image_generation_28day_reset AT TIME ZONE 'America/New_York'),
                        'Creative generation available (1 per 28 days)'::TEXT;
                ELSE
                    RETURN QUERY SELECT FALSE, v_usage_record.image_generation_28day_count, 1,
                        (v_usage_record.image_generation_28day_reset AT TIME ZONE 'America/New_York'),
                        '28-day creative limit (1) exhausted'::TEXT;
                END IF;
            END IF;

        ELSE
            RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'Unknown operation type'::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate increment_usage with premium tracking
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

    PERFORM initialize_usage_limits(p_user_id);

    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;

    IF v_subscription_tier = 'enterprise' THEN
        INSERT INTO usage_history (user_id, account_id, operation_type, operation_id, subscription_tier, metadata)
        VALUES (p_user_id, v_account_id, p_operation_type, p_operation_id, v_subscription_tier, p_metadata);
        RETURN TRUE;
    END IF;

    IF v_subscription_tier = 'premium' AND p_operation_type <> 'image_generation' THEN
        INSERT INTO usage_history (user_id, account_id, operation_type, operation_id, subscription_tier, metadata)
        VALUES (p_user_id, v_account_id, p_operation_type, p_operation_id, v_subscription_tier, p_metadata);
        RETURN TRUE;
    END IF;

    CASE p_operation_type
        WHEN 'invoice_upload' THEN
            UPDATE user_usage_limits
            SET weekly_invoice_uploads = weekly_invoice_uploads + 1
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'free_analysis' THEN
            UPDATE user_usage_limits
            SET weekly_free_analyses = weekly_free_analyses + 1
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'menu_comparison' THEN
            UPDATE user_usage_limits
            SET weekly_menu_comparisons = weekly_menu_comparisons + 1
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'menu_upload' THEN
            UPDATE user_usage_limits
            SET weekly_menu_uploads = weekly_menu_uploads + 1
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'premium_analysis' THEN
            UPDATE user_usage_limits
            SET weekly_premium_analyses = weekly_premium_analyses + 1
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        WHEN 'image_generation' THEN
            IF v_subscription_tier = 'premium' THEN
                UPDATE user_usage_limits
                SET premium_image_generation_count = premium_image_generation_count + 1
                WHERE user_id = p_user_id
                  AND account_id = v_account_id;
            ELSE
                UPDATE user_usage_limits
                SET image_generation_28day_count = image_generation_28day_count + 1
                WHERE user_id = p_user_id
                  AND account_id = v_account_id;
            END IF;

        ELSE
            RAISE EXCEPTION 'Unknown operation type %', p_operation_type;
    END CASE;

    INSERT INTO usage_history (user_id, account_id, operation_type, operation_id, subscription_tier, metadata)
    VALUES (p_user_id, v_account_id, p_operation_type, p_operation_id, v_subscription_tier, p_metadata);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- End of Migration
-- ============================================================================

