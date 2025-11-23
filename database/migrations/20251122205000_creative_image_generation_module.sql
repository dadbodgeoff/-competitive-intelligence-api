-- ============================================================================
-- MIGRATION: Creative Image Generation Module
-- ============================================================================
-- Description : Introduces Nano Banana creative generation tables, updates
--               usage limit infrastructure with the new image_generation
--               operation, and prepares audit/event logging for orchestrator.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 045_usage_limit_return_casts.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS creative_prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    restaurant_vertical TEXT NOT NULL,
    campaign_channel TEXT NOT NULL,
    prompt_section TEXT NOT NULL,
    prompt_body TEXT NOT NULL,
    prompt_version TEXT NOT NULL DEFAULT 'v1',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE creative_prompt_templates IS 'Section-based creative prompt templates for Nano Banana image generation.';
COMMENT ON COLUMN creative_prompt_templates.account_id IS 'Optional account-specific override. NULL means globally available template.';
COMMENT ON COLUMN creative_prompt_templates.prompt_section IS 'Template section key (e.g., headline, body, styling).';

CREATE UNIQUE INDEX IF NOT EXISTS idx_creative_prompt_templates_scope
    ON creative_prompt_templates(
        COALESCE(account_id, '00000000-0000-0000-0000-000000000000'::UUID),
        slug,
        prompt_section,
        prompt_version
    );

CREATE INDEX IF NOT EXISTS idx_creative_prompt_templates_vertical
    ON creative_prompt_templates(restaurant_vertical, campaign_channel)
    WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS creative_brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    palette JSONB NOT NULL DEFAULT jsonb_build_object('primary', '#FFFFFF'),
    typography JSONB DEFAULT '{}'::JSONB,
    voice_profile JSONB DEFAULT '{}'::JSONB,
    asset_descriptors JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE creative_brand_profiles IS 'Stored brand styling profiles applied to Nano Banana prompts.';

CREATE INDEX IF NOT EXISTS idx_brand_profiles_account
    ON creative_brand_profiles(account_id, is_default DESC, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_profiles_account_user_default
    ON creative_brand_profiles(account_id, user_id)
    WHERE is_default = TRUE;

CREATE TABLE IF NOT EXISTS creative_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_slug TEXT,
    template_version TEXT,
    brand_profile_id UUID REFERENCES creative_brand_profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued',
        'assembling_prompt',
        'dispatching',
        'generating',
        'processing_assets',
        'completed',
        'failed'
    )),
    nano_job_id TEXT,
    desired_outputs JSONB NOT NULL,
    prompt_sections JSONB NOT NULL DEFAULT '{}'::JSONB,
    prompt_token_estimate INTEGER,
    cost_estimate NUMERIC(10,4),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE creative_generation_jobs IS 'Top-level job records coordinating Nano Banana image generations.';

CREATE INDEX IF NOT EXISTS idx_creative_jobs_account_status
    ON creative_generation_jobs(account_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_creative_jobs_user
    ON creative_generation_jobs(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_creative_jobs_nano_id
    ON creative_generation_jobs(nano_job_id)
    WHERE nano_job_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS creative_generation_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES creative_generation_jobs(id) ON DELETE CASCADE,
    variant_label TEXT,
    asset_url TEXT NOT NULL,
    preview_url TEXT,
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    prompt_variation JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE creative_generation_assets IS 'Rendered asset outputs for creative jobs.';

CREATE INDEX IF NOT EXISTS idx_creative_assets_job
    ON creative_generation_assets(job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS creative_job_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES creative_generation_jobs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    progress INTEGER,
    payload JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE creative_job_events IS 'Immutable audit log of orchestrator events for creative jobs.';

CREATE INDEX IF NOT EXISTS idx_creative_events_job
    ON creative_job_events(job_id, created_at ASC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE creative_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_generation_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_job_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service-role-manage-creative-templates" ON creative_prompt_templates;
DROP POLICY IF EXISTS "service-role-manage-creative-brand-profiles" ON creative_brand_profiles;
DROP POLICY IF EXISTS "service-role-manage-creative-jobs" ON creative_generation_jobs;
DROP POLICY IF EXISTS "service-role-manage-creative-assets" ON creative_generation_assets;
DROP POLICY IF EXISTS "service-role-manage-creative-events" ON creative_job_events;

CREATE POLICY "service-role-manage-creative-templates" ON creative_prompt_templates
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service-role-manage-creative-brand-profiles" ON creative_brand_profiles
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service-role-manage-creative-jobs" ON creative_generation_jobs
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service-role-manage-creative-assets" ON creative_generation_assets
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service-role-manage-creative-events" ON creative_job_events
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- USAGE LIMIT UPDATES (Image Generation)
-- ============================================================================

ALTER TABLE user_usage_limits
    ADD COLUMN IF NOT EXISTS weekly_image_generations INTEGER NOT NULL DEFAULT 0;

UPDATE user_usage_limits
SET weekly_image_generations = COALESCE(weekly_image_generations, 0);

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
        weekly_premium_analyses,
        weekly_image_generations
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
        0,
        0
    )
    ON CONFLICT (account_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate check_usage_limit with image_generation branch (keeps timestamptz casts)
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

    IF v_subscription_tier IN ('premium', 'enterprise') THEN
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
            IF v_usage_record.weekly_image_generations < 5 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.weekly_image_generations, 5,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Creative generation available'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.weekly_image_generations, 5,
                    (v_usage_record.weekly_reset_date AT TIME ZONE 'America/New_York'),
                    'Weekly creative limit (5) exhausted'::TEXT;
            END IF;

        ELSE
            RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'Unknown operation type'::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate increment_usage with image_generation tracking
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

        WHEN 'image_generation' THEN
            UPDATE user_usage_limits
            SET weekly_image_generations = weekly_image_generations + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

        ELSE
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
