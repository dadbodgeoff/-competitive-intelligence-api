-- ============================================================================
-- CONSOLIDATED CREATIVE MODULE MIGRATIONS - PRODUCTION DEPLOYMENT
-- ============================================================================
-- Description: All 19 creative module migrations in a single file
-- Date: 2025-11-23
-- Instructions: 
--   1. Open Supabase Dashboard SQL Editor
--   2. Copy this ENTIRE file
--   3. Paste into SQL Editor
--   4. Click "Run" (this will take 30-60 seconds)
--   5. Verify success with queries at the bottom
-- ============================================================================

BEGIN;

-- ============================================================================
-- FILE: 20251122190000_add_policy_consent_columns.sql
-- ============================================================================

-- Add consent tracking fields for policy acknowledgements
alter table if exists public.users
    add column if not exists terms_version text,
    add column if not exists terms_accepted_at timestamptz,
    add column if not exists privacy_version text,
    add column if not exists privacy_accepted_at timestamptz;

comment on column public.users.terms_version is 'Version identifier of the Terms of Service accepted by the user';
comment on column public.users.terms_accepted_at is 'Timestamp when the user accepted the Terms of Service';
comment on column public.users.privacy_version is 'Version identifier of the Privacy Policy accepted by the user';
comment on column public.users.privacy_accepted_at is 'Timestamp when the user accepted the Privacy Policy';




-- ============================================================================
-- FILE: 20251122205000_creative_image_generation_module.sql
-- ============================================================================

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



-- ============================================================================
-- FILE: 20251122221000_creative_theme_support.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: Creative Theme & Variation Support
-- ============================================================================
-- Description : Adds creative prompt themes, template metadata, variation
--               history, and seeds initial pizza prompt catalog.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 20251122205000_creative_image_generation_module.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------------
-- Theme catalog
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creative_prompt_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_vertical TEXT NOT NULL,
    theme_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    campaign_channel TEXT NOT NULL DEFAULT 'instagram',
    mood_board_urls JSONB NOT NULL DEFAULT '[]'::JSONB,
    default_palette JSONB NOT NULL DEFAULT '{}'::JSONB,
    default_fonts JSONB NOT NULL DEFAULT '{}'::JSONB,
    default_hashtags JSONB NOT NULL DEFAULT '[]'::JSONB,
    variation_rules JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(theme_slug)
);

-- --------------------------------------------------------------------------
-- Template metadata enhancements
-- --------------------------------------------------------------------------

ALTER TABLE creative_prompt_templates
    ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES creative_prompt_themes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS variation_tags JSONB NOT NULL DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS input_schema JSONB NOT NULL DEFAULT '{}'::JSONB;

ALTER TABLE creative_generation_jobs
    ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES creative_prompt_themes(id),
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES creative_prompt_templates(id);

-- --------------------------------------------------------------------------
-- Variation history
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creative_variation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES creative_generation_jobs(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES creative_prompt_themes(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES creative_prompt_templates(id) ON DELETE CASCADE,
    style_seed TEXT NOT NULL,
    noise_level NUMERIC(4,2),
    style_notes JSONB NOT NULL DEFAULT '[]'::JSONB,
    texture TEXT,
    palette JSONB NOT NULL DEFAULT '{}'::JSONB,
    variation_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_variations_recent
    ON creative_variation_history(account_id, theme_id, created_at DESC);

-- --------------------------------------------------------------------------
-- Seed: Pizza-focused themes & templates
-- --------------------------------------------------------------------------

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'cocktail_pairings_night',
        'Cocktail Pairings Night',
        'Low-light cocktail pairings with artisan pizzas and chalk typography.',
        'instagram',
        '{"primary":"#F0544F","secondary":"#F6BD60","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
        '["#pizzanight","#craftcocktails","#datenight"]'::JSONB,
        '{
            "style_adjectives":["warm edison bulbs","moody film grain","bar-top reflections","handcrafted details"],
            "texture_options":["chalk dust","glass condensation","bokeh light orbs"],
            "palette_swaps":[["#F0544F","#F6BD60"],["#2C3E50","#E63946"]],
            "camera_styles":["cinematic close-up","shallow depth of field","wide bar angle"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'cocktail_pizza_pairings',
    'Cocktail + Pizza Pairings',
    'pizza',
    'instagram',
    'base',
    $$Photorealistic low-light bar scene. A black round tray holds two perfectly garnished {{cocktail_1}} and {{cocktail_2}} with condensation, plus a sizzling cast-iron skillet of {{pizza_name}} with epic cheese pull. Center: rustic wooden-framed chalkboard with beautiful hand-lettered white/pink/yellow chalk:  â€œPerfect Pairings Tonightâ€  â€¢ {{pizza_1}} + {{cocktail_1}} â€“ ${{price_1}}  â€¢ {{pizza_2}} + {{cocktail_2}} â€“ ${{price_2}}  â€¢ {{pizza_3}} + {{cocktail_3}} â€“ ${{price_3}}  â€œAsk about our ${{flight_price}} flight + pizza dealâ€  Small doodles of cocktail glasses and pizza slices. Blurred bottles and warm Edison bulbs in background, ultra-cinematic, 8k food photography.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Cocktail Pairings Tray',
    '["low_light","bar_scene","chalk_typography"]'::JSONB,
    '{
        "required": ["pizza_name","pizza_1","pizza_2","pizza_3","price_1","price_2","price_3","cocktail_1","cocktail_2","cocktail_3","flight_price"],
        "optional": [],
        "types": {
            "price_1": "currency",
            "price_2": "currency",
            "price_3": "currency",
            "flight_price": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'delivery_power_stack',
        'Delivery Power Stack',
        'Golden-hour delivery stack with chalk marker offers and QR promotion.',
        'instagram',
        '{"primary":"#E76F51","secondary":"#F4A261","accent":"#264653"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Lato"}'::JSONB,
        '["#deliverydeals","#pizzaboxart","#weekendvibes"]'::JSONB,
        '{
            "style_adjectives":["sunlit counter glow","steam rising","chalk marker energy","handwritten doodles"],
            "texture_options":["lens flare","sunlit dust particles","subtle film grain"],
            "palette_swaps":[["#E76F51","#F4A261"],["#E63946","#F1FAEE"]],
            "camera_styles":["hero angle","tabletop close-up","wide delivery stack"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'pizza_box_stack_special',
    'Weekend Delivery Special',
    'pizza',
    'instagram',
    'base',
    $$Golden-hour photorealistic shot on marble counter near window. Tall stack of 5 kraft pizza boxes, top box open with steam rising and cheese pull from {{featured_pizza}}. Second box lid covered in colorful chalk marker:  â€œ{{promotion_title}}â€ in huge playful script  â€œ{{deal_line}}â€  1. {{pizza_1}} â€“ ${{price_1}}  2. {{pizza_2}} â€“ ${{price_2}}  3. {{pizza_3}} â€“ ${{price_3}}  {{qr_text}} with actual scannable QR code drawn in chalk  Cute heart-eye pizza doodle. Natural sunlight, ultra-appetizing, ready for delivery-app hero image.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Delivery Box Stack',
    '["sunlit","delivery","chalk_marker","qr_code"]'::JSONB,
    '{
        "required": ["featured_pizza","promotion_title","deal_line","pizza_1","price_1","pizza_2","price_2","pizza_3","price_3","qr_text"],
        "optional": [],
        "types": {
            "price_1": "currency",
            "price_2": "currency",
            "price_3": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'family_supper_series',
        'Family Supper Series',
        'Brown butcher paper feast with arrows and doodles for communal dining.',
        'instagram',
        '{"primary":"#E07A5F","secondary":"#F2CC8F","accent":"#81B29A"}'::JSONB,
        '{"headline":"Playfair Display","body":"Raleway"}'::JSONB,
        '["#familystyle","#sundaysupper","#italianfeast"]'::JSONB,
        '{
            "style_adjectives":["candlelit warmth","overhead feast","handwritten arrows","shared plates"],
            "texture_options":["butcher paper grain","wine stains","chalk smudges"],
            "palette_swaps":[["#E07A5F","#F2CC8F"],["#CB997E","#FFE8D6"]],
            "camera_styles":["flat lay","wide communal table","tight detail on hands"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'butcher_paper_sunday_supper',
    'Butcher Paper Sunday Supper',
    'pizza',
    'instagram',
    'base',
    $$Overhead photorealistic shot of long wooden communal table covered in brown butcher paper. Full Italian feast laid out: giant {{main_pizza}}, spaghetti & meatballs, caprese, rigatoni, wine bottles. Chalk marker directly on paper:  â€œ{{event_name}} â€“ ${{price}} (feeds {{people}})â€  Arrows pointing to every dish labeling them, kid doodles, wine stains, Parmesan dust. Hands reaching in, warm candlelight, the ultimate FOMO family-style photo.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Family-Style Feast',
    '["overhead","butcher_paper","family_style"]'::JSONB,
    '{
        "required": ["main_pizza","event_name","price","people"],
        "optional": [],
        "types": {
            "price": "currency",
            "people": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'artisan_dough_lab',
        'Artisan Dough Lab',
        'Macro dough artistry with fermentation flex and flour explosions.',
        'instagram',
        '{"primary":"#F4F1DE","secondary":"#3D405B","accent":"#E07A5F"}'::JSONB,
        '{"headline":"Cinzel","body":"Source Sans Pro"}'::JSONB,
        '["#artisanpizza","#doughlife","#pizzalab"]'::JSONB,
        '{
            "style_adjectives":["golden-hour glow","flour burst","macro texture","bench craft"],
            "texture_options":["flour haze","grain overlay","light leaks"],
            "palette_swaps":[["#F4F1DE","#3D405B"],["#FFF8E7","#2C3E50"]],
            "camera_styles":["macro close-up","cinematic side angle","dramatic backlight"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'chalk_on_dough_ball',
    'Chalk on Proofed Dough',
    'pizza',
    'instagram',
    'base',
    $$Extreme macro, golden-hour light. Perfectly proofed {{dough_type}} dough ball on floured wooden bench, flour exploding in air. Hand-written directly on dough in edible white chalk marker:  â€œ{{dough_claim}}â€  â€œ{{date}} :)â€  Shallow depth of field, window light, the artisan flex every pizzeria needs.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Dough Lab Close-Up',
    '["macro","flour_burst","artisan"]'::JSONB,
    '{
        "required": ["dough_type","dough_claim","date"],
        "optional": [],
        "types": {
            "date": "date"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'parmigiano_showstopper',
        'Parmigiano Showstopper',
        'Huge Parmigiano wheel chalkboard announcing specials and events.',
        'instagram',
        '{"primary":"#FFD166","secondary":"#EF476F","accent":"#073B4C"}'::JSONB,
        '{"headline":"Abril Fatface","body":"Nunito"}'::JSONB,
        '["#parmnight","#cheeseshower","#italianstyle"]'::JSONB,
        '{
            "style_adjectives":["dramatic spotlight","cheese shavings flying","chalkboard carve","brick warmth"],
            "texture_options":["cheese dust","lens flare","warm vignette"],
            "palette_swaps":[["#FFD166","#EF476F"],["#F4E285","#2F4858"]],
            "camera_styles":["hero shot","angled close-up","wide ambience"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'parm_wheel_event',
    'Giant Parmigiano Wheel',
    'pizza',
    'instagram',
    'base',
    $$Hero shot: massive 80-lb wheel of Parmigiano-Reggiano cracked open like a book on wooden table. Cut face turned into chalkboard with blue/yellow/pink chalk:  â€œ{{event_name}} â€“ Unlimited Shavings with Any Pizza ${{price}}â€  Flying cheese-shaving doodles  â€œ{{day_and_time}}â€  Cheese knife stabbed in, shavings scattered, warm restaurant lighting, brick wall background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Parm Night Feature',
    '["cheese_wheel","event_promo","chalk_typography"]'::JSONB,
    '{
        "required": ["event_name","price","day_and_time"],
        "optional": [],
        "types": {
            "price": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'secret_menu_whispers',
        'Secret Menu Whispers',
        'Speakeasy chalkboard teasing limited secret pizzas.',
        'instagram',
        '{"primary":"#1B263B","secondary":"#415A77","accent":"#E0E1DD"}'::JSONB,
        '{"headline":"Cormorant Garamond","body":"Roboto"}'::JSONB,
        '["#secretmenu","#speakeasy","#onlytonight"]'::JSONB,
        '{
            "style_adjectives":["low-light mystery","candle glow","chalk whispers","exclusive vibe"],
            "texture_options":["smoky haze","neon reflections","grain"],
            "palette_swaps":[["#1B263B","#E0E1DD"],["#111827","#F5F3F0"]],
            "camera_styles":["bar close-up","hand interaction","moody macro"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'secret_menu_chalkboard',
    'Secret Menu Chalkboard',
    'pizza',
    'instagram',
    'base',
    $$Moody speakeasy bar close-up. Small vintage chalkboard propped against liquor bottles, tattooed bartender hand reaching. Text in whispery white chalk:  â€œAsk for the Secret Pizza â€“ Only {{quantity}} made tonightâ€  â€œ{{secret_pizza_name}} â€“ ${{price}}â€  Tiny skull or flame doodle. Red low light, ultra-exclusive vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Secret Pizza Whisper',
    '["low_light","exclusive","bar"]'::JSONB,
    '{
        "required": ["quantity","secret_pizza_name","price"],
        "optional": [],
        "types": {
            "price": "currency",
            "quantity": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'guerilla_window_marketing',
        'Guerrilla Window Marketing',
        'Foggy car window messaging with neon reflections and rainy ambiance.',
        'instagram',
        '{"primary":"#0D3B66","secondary":"#F95738","accent":"#EEF4ED"}'::JSONB,
        '{"headline":"Antonio","body":"Inter"}'::JSONB,
        '["#streetmarketing","#rainynight","#pizzalove"]'::JSONB,
        '{
            "style_adjectives":["rainy neon","urban reflections","handwritten fog","street energy"],
            "texture_options":["raindrops","fogged glass","neon bokeh"],
            "palette_swaps":[["#0D3B66","#F95738"],["#1C2541","#3A506B"]],
            "camera_styles":["street documentary","angled exterior","close-up message"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'foggy_window_message',
    'Foggy Window Guerilla',
    'pizza',
    'instagram',
    'base',
    $$Nighttime rainy street shot. Fogged-up car window with finger-written + chalk marker message visible from outside:  â€œBest pizza in the city â†’ {{directions}}â€  â€œ{{restaurant_name}}â€  â€œ{{todays_special}}â€ + pizza doodle  Blurry neon {{restaurant_name}} sign reflecting, raindrops, authentic viral marketing gold.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Rainy Window Teaser',
    '["rainy","neon","street_marketing"]'::JSONB,
    '{
        "required": ["directions","restaurant_name","todays_special"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'brick_wall_popups',
        'Brick Wall Pop-Ups',
        'Large-format brick wall chalkboard for multi-course events.',
        'instagram',
        '{"primary":"#E07A5F","secondary":"#3D405B","accent":"#F2CC8F"}'::JSONB,
        '{"headline":"Oswald","body":"PT Sans"}'::JSONB,
        '["#popupdinner","#winepairing","#soldout"]'::JSONB,
        '{
            "style_adjectives":["packed crowd","string lights","ornate chalk typography","celebratory energy"],
            "texture_options":["brick texture","chalk dust","motion blur"],
            "palette_swaps":[["#E07A5F","#3D405B"],["#8D99AE","#EDF2F4"]],
            "camera_styles":["wide crowd","mid shot wall","over-the-shoulder"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'brick_wall_popup_event',
    'Brick Wall Pop-Up Chalkboard',
    'pizza',
    'instagram',
    'base',
    $$Wide cinematic shot inside packed restaurant. Entire exposed-brick wall is a giant ornate chalkboard announcing:  â€œ{{event_title}}â€  â€œ{{subtitle}} â€“ {{date}} â€“ ${{price}} ppâ€  5-course menu with wine pairings listed in beautiful typography and illustrations. String lights, smiling crowd in foreground, pure sold-out FOMO.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Brick Wall Pop-Up',
    '["wide_event","chalkwall","crowd_energy"]'::JSONB,
    '{
        "required": ["event_title","subtitle","date","price"],
        "optional": [],
        "types": {
            "date": "date",
            "price": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'oven_dome_heat',
        'Oven Dome Heat',
        'Blazing oven dome chalk callouts highlighting temperature prowess.',
        'instagram',
        '{"primary":"#FF7F50","secondary":"#FFD166","accent":"#2D3142"}'::JSONB,
        '{"headline":"League Spartan","body":"Muli"}'::JSONB,
        '["#woodfiredpizza","#leopardcrust","#ovenready"]'::JSONB,
        '{
            "style_adjectives":["fire glow","heat shimmer","brick patina","temperature flex"],
            "texture_options":["ember sparks","smoke wisps","lens flare"],
            "palette_swaps":[["#FF7F50","#FFD166"],["#EF233C","#FFB703"]],
            "camera_styles":["macro oven","angled dome","firebox close-up"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'chalk_on_oven_dome',
    'Chalk on Wood-Fired Oven',
    'pizza',
    'instagram',
    'base',
    $$Close-up of blazing brick pizza oven dome. Heat-resistant white/yellow chalk directly on bricks:  â€œTonight the oven is running {{temperature}} â€“ perfect leopard-spotted crustâ€  Small flame thermometer doodle. Visible flames inside, flour on floor, heat shimmer, the most badass pizza photo possible.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Oven Dome Flex',
    '["fire","oven","chalk","temperature"]'::JSONB,
    '{
        "required": ["temperature"],
        "optional": [],
        "types": {
            "temperature": "string"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'take_home_dessert',
        'Take-Home Dessert',
        'Mason jar tiramisu tray ready for upsell photos.',
        'instagram',
        '{"primary":"#F2E9E4","secondary":"#C9ADA7","accent":"#4A4E69"}'::JSONB,
        '{"headline":"Quicksand","body":"Work Sans"}'::JSONB,
        '["#dessertporn","#tiramisu","#takehome"]'::JSONB,
        '{
            "style_adjectives":["soft window light","cocoa dust","tray presentation","cozy textures"],
            "texture_options":["cocoa smudge","linen folds","bokeh glow"],
            "palette_swaps":[["#F2E9E4","#C9ADA7"],["#FFF1E6","#BC8A5F"]],
            "camera_styles":["top-down","45-degree dessert","macro bite"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'take_home_tiramisu',
    'Take-Home Tiramisu Tray',
    'pizza',
    'instagram',
    'base',
    $$Top-down natural-light shot. Wooden tray holding 8 mason jars of layered tiramisu dusted with cocoa. Small chalkboard sign in center dusted with cocoa â€œchalk smudgesâ€:  â€œTake-Home Tiramisu â€“ ${{single_price}} eachâ€  â€œor {{bundle_quantity}} for ${{bundle_price}}â€  Spoon in one jar, soft window light, instantly shareable dessert porn.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Tiramisu Upsell',
    '["dessert","top_down","chalk_sign"]'::JSONB,
    '{
        "required": ["single_price","bundle_quantity","bundle_price"],
        "optional": [],
        "types": {
            "single_price": "currency",
            "bundle_price": "currency",
            "bundle_quantity": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'monthly_signature_pie',
        'Monthly Signature Pie',
        'Vintage scale balancing pizza of the month with seasonal props.',
        'instagram',
        '{"primary":"#D4A373","secondary":"#CCD5AE","accent":"#6B705C"}'::JSONB,
        '{"headline":"Josefin Sans","body":"Merriweather"}'::JSONB,
        '["#pizzaofthemonth","#seasonalslice","#limitedrun"]'::JSONB,
        '{
            "style_adjectives":["golden-hour warmth","vintage brass","seasonal props","balanced composition"],
            "texture_options":["light leaks","dust motes","film grain"],
            "palette_swaps":[["#D4A373","#CCD5AE"],["#BC6C25","#F4A261"]],
            "camera_styles":["side profile","hero close-up","45-degree product"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'pizza_of_month_scale',
    'Pizza of the Month Scale',
    'pizza',
    'instagram',
    'base',
    $$Golden-hour shot. Antique brass scale with gorgeous {{monthly_pizza}} perfectly balanced on one side. Hanging chalkboard tag:  â€œ{{month}} Pizza of the Month â€“ {{pizza_name}}â€  Ingredients: {{ingredient_list}}  ${{price}}  â€œOnly {{quantity}} made dailyâ€  Autumn leaves scattered (or seasonal props), warm wood background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Pizza of the Month',
    '["seasonal","vintage","scale"]'::JSONB,
    '{
        "required": ["monthly_pizza","month","pizza_name","price","quantity","ingredient_list"],
        "optional": [],
        "types": {
            "price": "currency",
            "quantity": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'waitlist_social_proof',
        'Waitlist Social Proof',
        'Host stand chalkboard flexing sold-out nights and online ordering.',
        'instagram',
        '{"primary":"#8D99AE","secondary":"#EDF2F4","accent":"#EF233C"}'::JSONB,
        '{"headline":"Montserrat","body":"Poppins"}'::JSONB,
        '["#fullybooked","#hoststand","#linkinbio"]'::JSONB,
        '{
            "style_adjectives":["entrance glow","crowd blur","chalkboard pop","hospitality vibe"],
            "texture_options":["motion blur","light trails","chalk dust"],
            "palette_swaps":[["#8D99AE","#EF233C"],["#2B2D42","#F8F9FA"]],
            "camera_styles":["host stand close-up","crowd background","entrance angle"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'host_stand_waitlist',
    'Host Stand Waitlist Flex',
    'pizza',
    'instagram',
    'base',
    $$Intimate shot of packed restaurant entrance. A-frame chalkboard at host stand:  â€œFully committed tonight â€“ next table {{time}}â€  â€œOr order online & skip the wait â†’ {{online_callout}}â€  Blurred happy crowd laughing in background, candles glowing, turns a wait into social proof marketing.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Host Stand Flex',
    '["entrance","crowd","chalkboard"]'::JSONB,
    '{
        "required": ["time","online_callout"],
        "optional": [],
        "types": {
            "time": "string"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================




-- ============================================================================
-- FILE: 20251122223000_bar_grill_theme_support.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: Bar & Grill Creative Themes
-- ============================================================================
-- Description : Seeds creative prompt themes and templates tailored for bar,
--               grill, and gastropub operators with production-ready prompts.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 20251122221000_creative_theme_support.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Theme 1: Mirror Selfie Moment
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'mirror_selfie_moment',
        'Mirror Selfie Moment',
        'Nightlife mirror selfies with neon reflections and chalk lettering.',
        'instagram',
        '{"primary":"#FF4C7B","secondary":"#2EC5FF","accent":"#F9F871"}'::JSONB,
        '{"headline":"Anton","body":"Montserrat"}'::JSONB,
        '["#latenightbites","#bartenderlife","#afterhours"]'::JSONB,
        '{
            "style_adjectives":["mirror glow","neon haze","smoky ambiance","crowded nightlife"],
            "texture_options":["fogged glass","chalk dust","light leaks"],
            "palette_swaps":[["#FF4C7B","#2EC5FF"],["#F72585","#7209B7"]],
            "camera_styles":["low-angle selfie","over-the-shoulder","wide nightlife scene"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'mirror_selfie_menu',
    'Mirror Selfie Menu',
    'bar_grill',
    'instagram',
    'base',
    $$Photorealistic low-angle hero shot inside a packed craft beer bar at {{scene_time}} on a {{scene_day}}. A bartender takes a mirror selfie as the back-bar mirror glows with LED rim lighting and chalk marker lettering:  â€œ{{headline}}â€  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}} â€“ ${{item3_price}}  â€œ{{cta_line}}â€  Neon beer signs bleed magenta and cyan across the fogged glass, smoke tendrils curl through the reflection, bottles catch rainbow flares, and the crowd blurs into a roar while the phone flash reveals floating dust motes.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Mirror Selfie Moment',
    '["mirror","neon","nightlife"]'::JSONB,
    '{
        "required": ["scene_time","scene_day","headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 2: Butcher Paper Lineup
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'butcher_paper_lineup',
        'Butcher Paper Lineup',
        'Overhead butcher-paper flatlays filled with bar bites and marker ink.',
        'instagram',
        '{"primary":"#E07A5F","secondary":"#C27D38","accent":"#F2CC8F"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
        '["#gamedaygrub","#butcherpaper","#gastropub"]'::JSONB,
        '{
            "style_adjectives":["edison warmth","overhead feast","marker ink bleed","tabletop chaos"],
            "texture_options":["butcher paper fiber","sea salt scatter","sauce smears"],
            "palette_swaps":[["#E07A5F","#C27D38"],["#915B3C","#F7C59F"]],
            "camera_styles":["flat lay overhead","angled tabletop","macro food detail"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'butcher_paper_tableside',
    'Butcher Paper Tableside',
    'bar_grill',
    'instagram',
    'base',
    $$High-angle foodie flat lay on brown butcher paper at a buzzing gastropub. Thick black marker scrawls â€œ{{headline}}â€ with a casual underline above the menu:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}} â€“ ${{item3_price}}  â€œ{{cta_line}}â€  Honey-glazed wings, frosty pint rings, scattered sea salt, peppercorns, and a blurred hand stealing fries create the perfect chaotic realism under warm Edison bulb light.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Butcher Paper Flatlay',
    '["butcher_paper","flatlay","gastropub"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 3: Chef Pass Heat Lamp
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'chef_pass_heatlamp',
        'Chefâ€™s Pass Heat Lamp',
        'Kitchen pass tiles with grease pencil announcements and steaming plates.',
        'instagram',
        '{"primary":"#FFA94D","secondary":"#FFFFFF","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"Oswald","body":"Lato"}'::JSONB,
        '["#freshcatch","#chefspecial","#behindthepass"]'::JSONB,
        '{
            "style_adjectives":["heat lamp glow","kitchen hustle","tile reflections","steam trails"],
            "texture_options":["grease pencil wax","tile gloss","steam haze"],
            "palette_swaps":[["#FFA94D","#FFFFFF"],["#FFB347","#F0F0F0"]],
            "camera_styles":["eye-level pass","shallow depth of field","over-the-bar focus"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'chefs_pass_tiles',
    'Chef Pass Tiles',
    'bar_grill',
    'instagram',
    'base',
    $$Eye-level view past chrome beer taps toward glossy white subway tiles lit by golden heat lamps. Bold grease pencil handwriting reads â€œ{{headline}}â€ with todayâ€™s menu:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€œ{{cta_line}}â€  A frosty pilsner and taco plate glow in the foreground while a motion-blurred chef streaks past, steam drifting through the frame for a fresh-from-the-pass flex.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Chefâ€™s Pass Moment',
    '["heat_lamp","kitchen_pass","fresh_catch"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 4: Golden Hour Window Splash
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'golden_hour_window',
        'Golden Hour Window',
        'Sun-drenched exterior window paint promos with patio vibes.',
        'instagram',
        '{"primary":"#FFD166","secondary":"#EF476F","accent":"#118AB2"}'::JSONB,
        '{"headline":"Pacifico","body":"Nunito"}'::JSONB,
        '["#happyhour","#patioseason","#goldenhour"]'::JSONB,
        '{
            "style_adjectives":["golden hour sun","window paint texture","street reflections","crowd energy"],
            "texture_options":["window brush strokes","glass streaks","flare leaks"],
            "palette_swaps":[["#FFD166","#EF476F"],["#FFB703","#FB8500"]],
            "camera_styles":["street-level window","angled exterior","lens flare shot"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'golden_hour_window_splash',
    'Golden Hour Window Splash',
    'bar_grill',
    'instagram',
    'base',
    $$Exterior eye-level shot through a glowing plate-glass window at {{scene_time}}. Neon-yellow and white window paint bubbles out: â€œ{{headline}}â€  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}} â€“ ${{item3_price}}  â€œ{{cta_line}}â€  The glass reflects passing cars and trees while happy patrons clink glasses inside, sun flare streaking across the lettering with visible brush textures.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Golden Hour Window',
    '["window_paint","golden_hour","patio_vibes"]'::JSONB,
    '{
        "required": ["scene_time","headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 5: Whiskey Barrel High-Top
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'whiskey_barrel_hightop',
        'Whiskey Barrel High-Top',
        'Rustic barrel tabletops with chalk dust and bourbon glow.',
        'instagram',
        '{"primary":"#7F5539","secondary":"#B08968","accent":"#F2E9E4"}'::JSONB,
        '{"headline":"Cinzel","body":"Source Sans Pro"}'::JSONB,
        '["#whiskeybar","#smokehouse","#bourbontime"]'::JSONB,
        '{
            "style_adjectives":["barrel patina","chalk dust","intimate lighting","alligator skin whiskey"],
            "texture_options":["chalk smear","wood grain","peanut shells"],
            "palette_swaps":[["#7F5539","#B08968"],["#5A3D2B","#D4A373"]],
            "camera_styles":["top-down macro","angled detail","spotlit centerpiece"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'whiskey_barrel_specials',
    'Whiskey Barrel Specials',
    'bar_grill',
    'instagram',
    'base',
    $$Close-up high-angle shot of an aged oak whiskey barrel used as a high-top table. Dusty white chalk scrawls â€œ{{headline}}â€ with nightly specials:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  A leather coaster cradles a glass of amber bourbon catching the light while peanut shells and worn wood grain add tactile drama.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Whiskey Barrel High-Top',
    '["barrel","chalk","bourbon"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 6: Game Day Fridge
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'gameday_fridge_fog',
        'Game Day Fridge',
        'Condensation-heavy beer fridge messaging with finger-written text.',
        'instagram',
        '{"primary":"#00A6FB","secondary":"#F8F9FA","accent":"#1B1B1E"}'::JSONB,
        '{"headline":"Archivo Black","body":"Inter"}'::JSONB,
        '["#gameday","#coldbeer","#tailgate"]'::JSONB,
        '{
            "style_adjectives":["cold condensation","cool blue lighting","macro droplets","clear reveal"],
            "texture_options":["fog wipe","droplet streaks","frosted glass"],
            "palette_swaps":[["#00A6FB","#F8F9FA"],["#4CC9F0","#F1FAEE"]],
            "camera_styles":["macro fridge door","angled condensation","dim merch lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'gameday_fridge_glass',
    'Game Day Fridge Glass',
    'bar_grill',
    'instagram',
    'base',
    $$Macro shot of a commercial beer fridge door drenched in condensation. Finger-wiped negative-space lettering reveals â€œ{{headline}}â€ with cold deals:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Behind the letters, colorful cans glow under blue LED strips while droplets bead around the text for an icy refreshment flex.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Game Day Fridge',
    '["condensation","macro","beer_fridge"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 7: Corrugated Graffiti Wall
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'corrugated_graffiti_wall',
        'Corrugated Graffiti Wall',
        'Spray paint drip typography on corrugated steel with neon reflections.',
        'instagram',
        '{"primary":"#FF4C7D","secondary":"#2CE3F2","accent":"#FFD166"}'::JSONB,
        '{"headline":"Russo One","body":"Poppins"}'::JSONB,
        '["#weekendvibes","#industrialbar","#neonnights"]'::JSONB,
        '{
            "style_adjectives":["spray paint drips","metallic reflections","neon wash","industrial grit"],
            "texture_options":["paint drip","metal sheen","rust patina"],
            "palette_swaps":[["#FF4C7D","#2CE3F2"],["#FF6F91","#08D9D6"]],
            "camera_styles":["medium wall shot","angled graffiti","motion blur passing"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'corrugated_graffiti_menu',
    'Corrugated Graffiti Menu',
    'bar_grill',
    'instagram',
    'base',
    $$Interior medium shot of galvanized corrugated steel splashed with hot pink and teal graffiti. Drip-style spray paint proclaims â€œ{{headline}}â€ above the lineup:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}} â€“ ${{item3_price}}  â€œ{{cta_line}}â€  Neon reflections flow down the ridges while a blurred server hustles past a bar stool in the foreground.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Corrugated Graffiti Wall',
    '["spray_paint","industrial","neon_reflection"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 8: Cocktail Napkin Notes
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'cocktail_napkin_note',
        'Cocktail Napkin Note',
        'Ballpoint pen scribbles on textured napkins with condensation rings.',
        'instagram',
        '{"primary":"#FDF6EC","secondary":"#0A3D62","accent":"#C44536"}'::JSONB,
        '{"headline":"Dancing Script","body":"Open Sans"}'::JSONB,
        '["#speakeasy","#secretmenu","#bartenderschoice"]'::JSONB,
        '{
            "style_adjectives":["macro napkin fiber","ink bleed","mahogany glow","condensation ring"],
            "texture_options":["ink smear","paper wrinkle","wet ring"],
            "palette_swaps":[["#FDF6EC","#0A3D62"],["#FBF3E4","#1B3A4B"]],
            "camera_styles":["macro top-down","angled close-up","intimate bar top"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'cocktail_napkin_secret',
    'Cocktail Napkin Secret',
    'bar_grill',
    'instagram',
    'base',
    $$Macro shot of a textured cocktail napkin on polished mahogany. Blue ink handwriting reads â€œ{{headline}}â€ with favorites listed:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}} â€“ ${{item3_price}}  â€œ{{cta_line}}â€  A crystal rocks glass rests on the corner, condensation bleeding the ink where a ring overlaps the letters while warm bottle bokeh fills the background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Cocktail Napkin Secret',
    '["napkin","ink_bleed","speakeasy"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 9: Beer Flight Paddle
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'beer_flight_paddle',
        'Beer Flight Paddle',
        'Sunlit beer flight paddles with chalk marker labels and vibrant liquid.',
        'instagram',
        '{"primary":"#F4A261","secondary":"#264653","accent":"#E9C46A"}'::JSONB,
        '{"headline":"League Spartan","body":"Lora"}'::JSONB,
        '["#beerflight","#tastingroom","#craftbrew"]'::JSONB,
        '{
            "style_adjectives":["sunlit patio","glass refraction","chalk labels","refreshing condensation"],
            "texture_options":["chalk marker","wood grain","condensation beads"],
            "palette_swaps":[["#F4A261","#264653"],["#E5989B","#6D597A"]],
            "camera_styles":["eye-level flight","angled paddle","shallow depth outdoors"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'beer_flight_of_month',
    'Beer Flight of the Month',
    'bar_grill',
    'instagram',
    'base',
    $$Close-up of a wooden tasting paddle on a sunlit picnic table with four colorful beers. A black chalk strip lists â€œ{{headline}}â€ and numbered pours:  1. {{item1_name}}  2. {{item2_name}}  3. {{item3_name}}  4. {{item4_name}}  â€œ{{cta_line}}â€  Sunlight passes through the glasses casting golden shadows while string lights and greenery blur in the background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Beer Flight Paddle',
    '["beer_flight","chalk","patio"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","item4_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 10: Kraft Paper Scroll
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'kraft_paper_scroll',
        'Kraft Paper Scroll',
        'Industrial kraft paper scroll menus against brick with permanent marker.',
        'instagram',
        '{"primary":"#8C3A11","secondary":"#FF9F1C","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"Fugaz One","body":"Barlow"}'::JSONB,
        '["#kitchenspecials","#brickandmortar","#livemusic"]'::JSONB,
        '{
            "style_adjectives":["spotlit scroll","brick texture","marker boldness","industrial ambiance"],
            "texture_options":["paper curl","marker bleed","brick mortar"],
            "palette_swaps":[["#8C3A11","#FF9F1C"],["#7C3F00","#FF784E"]],
            "camera_styles":["medium wall shot","angled scroll","motion blur passersby"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'kraft_scroll_specials',
    'Kraft Scroll Specials',
    'bar_grill',
    'instagram',
    'base',
    $$Medium shot of a brown kraft paper scroll hanging on a red brick wall with a black metal dispenser. Bold black marker hand-lettering announces â€œ{{headline}}â€ and specials:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}} â€“ ${{item3_price}}  â€œ{{cta_line}}â€  Neon signage casts a subtle glow while a blurred server strolls past, the paper edges gently curling.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kraft Paper Scroll',
    '["kraft_paper","industrial","brick_wall"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 11: Foil Wrap Cure
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'foil_wrap_cure',
        'Foil Wrap Cure',
        'Late-night foil-wrapped comfort food with sharpie annotations.',
        'instagram',
        '{"primary":"#C0C0C0","secondary":"#FF3131","accent":"#1E1E1E"}'::JSONB,
        '{"headline":"Permanent Marker","body":"Titillium Web"}'::JSONB,
        '["#latenightcure","#afterhours","#dinervibes"]'::JSONB,
        '{
            "style_adjectives":["flash photography","foil glare","greasy nostalgia","diner energy"],
            "texture_options":["foil crinkle","marker matte","fluorescent hotspot"],
            "palette_swaps":[["#C0C0C0","#FF3131"],["#E0E0E0","#FF6B6B"]],
            "camera_styles":["macro foil wrap","angled tray","high-contrast flash"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'foil_wrap_late_night',
    'Foil Wrap Late Night',
    'bar_grill',
    'instagram',
    'base',
    $$High-angle macro shot of a foil-wrapped burger resting on a red plastic tray under bright fluorescent light. Thick black marker scrawls â€œ{{headline}}â€ with the cure-all lineup:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  The foil crinkles explode with specular highlights while a ketchup cup and grease-stained napkins complete the gritty late-night vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Foil Wrap Cure',
    '["foil","late_night","flash_photo"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================




-- ============================================================================
-- FILE: 20251122224000_mixed_vertical_theme_support.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: Mixed Vertical Creative Themes
-- ============================================================================
-- Description : Seeds multi-vertical creative themes/templates covering
--               pizza takeout, healthy bowls, lunch rush, bakery mornings,
--               cafes, fine dining, diners, omakase, tacos, steakhouse,
--               southern comfort, and ice cream promos.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 20251122221000_creative_theme_support.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper macro to seed template (for clarity inside file use repeated statements)

-- ============================================================================
-- Theme 1: Game Over Bundle (Pizza Night)
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cross_vertical',
        'game_over_bundle',
        'Game Over Bundle',
        'Pizza night gaming energy with greasy cardboard lid handwriting.',
        'instagram',
        '{"primary":"#FF6F61","secondary":"#F4D35E","accent":"#1B1F3A"}'::JSONB,
        '{"headline":"Bangers","body":"Roboto"}'::JSONB,
        '["#pizzanight","#latenightdelivery","#gameon"]'::JSONB,
        '{
            "style_adjectives":["tv glow","cardboard grease","dog cameo","living room chaos"],
            "texture_options":["grease stain","pen skip","cardboard corrugation"],
            "palette_swaps":[["#FF6F61","#F4D35E"],["#F95738","#2E294E"]],
            "camera_styles":["low-angle coffee table","wide living room","cinematic ambient light"]
        }'::JSONB
    )
    RETURNING id
) 
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'game_over_bundle',
    'Game Over Pizza Bundle',
    'cross_vertical',
    'instagram',
    'base',
    $$Low-angle wide shot from a coffee table perspective. A pizza box lid flipped open reveals gooey pepperoni under flickering TV glow. Ballpoint pen handwriting skips across corrugated cardboard: â€œ{{headline}}â€  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Grease stains halo the text, melted cheese glistens blue from the screen, and a dog nose sneaks into frame for cozy Friday night vibes.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Game Over Bundle',
    '["pizza_night","cardboard","tv_glow"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;
-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- ============================================================================
-- Theme 10: Butcher's Cut Cleaver
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'steakhouse',
        'butchers_cut_cleaver',
        'Butcherâ€™s Cut Cleaver',
        'Dramatic cleaver-on-block visuals with marker lettering on steel.',
        'instagram',
        '{"primary":"#6B2C2C","secondary":"#E63946","accent":"#F5EAEA"}'::JSONB,
        '{"headline":"Oswald","body":"Raleway"}'::JSONB,
        '["#steakhouse","#butcherscut","#redwine"]'::JSONB,
        '{
            "style_adjectives":["cleaver sheen","dramatic lighting","wood block texture","peppercorn scatter"],
            "texture_options":["marker matting","steel grain","salt crystals"],
            "palette_swaps":[["#6B2C2C","#E63946"],["#4A1F1F","#F28482"]],
            "camera_styles":["close-up cleaver","angled butcher block","rembrandt lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'butchers_cut_cleaver',
    'Butcherâ€™s Cut Cleaver',
    'steakhouse',
    'instagram',
    'base',
    $$Cinematic close-up of a heavy stainless cleaver embedded in a butcher block. Black dry-erase marker across the blade proclaims â€œ{{headline}}â€ with cuts:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Peppercorns and sea salt scatter on the wood while a glass of red wine blurs in the background for bold steakhouse drama.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Butcherâ€™s Cut Cleaver',
    '["cleaver","steakhouse","dramatic_light"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 11: Cast Iron Comforts
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'southern_comfort',
        'cast_iron_comforts',
        'Cast Iron Comforts',
        'Flour-stenciled lettering on cast iron skillets with soul-food warmth.',
        'instagram',
        '{"primary":"#432818","secondary":"#F6AA1C","accent":"#EAD7C5"}'::JSONB,
        '{"headline":"Abril Fatface","body":"Nunito"}'::JSONB,
        '["#soulfoodsunday","#castiron","#comfortfood"]'::JSONB,
        '{
            "style_adjectives":["warm kitchen glow","flour dust","iron sheen","comfort textures"],
            "texture_options":["flour stencil","cast iron patina","napkin checkered"],
            "palette_swaps":[["#432818","#F6AA1C"],["#5E3023","#FA9F42"]],
            "camera_styles":["top-down skillet","angled kitchen","homey lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'cast_iron_comforts',
    'Cast Iron Comforts',
    'southern_comfort',
    'instagram',
    'base',
    $$Top-down shot of a seasoned cast-iron skillet dusted with white flour through a stencil. Powdered lettering reads â€œ{{headline}}â€ with southern staples:  â€¢ {{item1_name}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  A red-and-white napkin, honey bowl, and handle grip frame the skillet with soul-food warmth.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Cast Iron Comforts',
    '["cast_iron","flour_stencil","soul_food"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 12: Ice Cream Frost Wipe
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'ice_cream',
        'ice_cream_frost_wipe',
        'Ice Cream Frost Wipe',
        'Frosted sneeze guards with finger-wiped lettering over colorful tubs.',
        'instagram',
        '{"primary":"#6BCBFF","secondary":"#FFB6C1","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Fredoka One","body":"Quicksand"}'::JSONB,
        '["#icecreamtime","#summercool","#frozendreams"]'::JSONB,
        '{
            "style_adjectives":["frosted glass","negative space lettering","playful reflections","cool tones"],
            "texture_options":["frost crystals","wipe trails","condensed vapor"],
            "palette_swaps":[["#6BCBFF","#FFB6C1"],["#8EC5FC","#E0C3FC"]],
            "camera_styles":["through glass","macro frost","bright dessert counter"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'ice_cream_frost_wipe',
    'Ice Cream Frost Wipe',
    'ice_cream',
    'instagram',
    'base',
    $$Eye-level shot through a frosted ice cream cabinet sneeze guard. Finger-wiped letters spell â€œ{{headline}}â€ with chill treats:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Colorful tubs glow behind the clear letters while ice crystals jag the edges and a childâ€™s reflection points excitedly.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Ice Cream Frost Wipe',
    '["frosted_glass","ice_cream","finger_wipe"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- Theme 2: Power Bowl Grind
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'healthy_bowls',
        'power_bowl_grind',
        'Power Bowl Grind',
        'Corporate desk salad containers with grease pencil handwriting.',
        'instagram',
        '{"primary":"#2EC4B6","secondary":"#E71D36","accent":"#011627"}'::JSONB,
        '{"headline":"Montserrat","body":"Inter"}'::JSONB,
        '["#powerbowl","#lunchfuel","#mealprep"]'::JSONB,
        '{
            "style_adjectives":["monitor glow","condensation beads","plastic refraction","desk hustle"],
            "texture_options":["grease pencil wax","plastic stress mark","lid reflection"],
            "palette_swaps":[["#2EC4B6","#E71D36"],["#28A9AB","#FF6F59"]],
            "camera_styles":["high-angle desk","macro condensation","office vignette"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'power_bowl_grind',
    'Power Bowl Deal',
    'healthy_bowls',
    'instagram',
    'base',
    $$High-angle desktop shot of a sealed plastic salad container packed with greens and grilled protein. Blue grease pencil handwriting on the lid reads â€œ{{headline}}â€ with lineup:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Computer monitor light reflects off the lid while condensation collects near the proteins for a corporate grind fuel-up.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Power Bowl Grind',
    '["takeout_lid","desk_lunch","healthy_fuel"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 3: City Bench Lunch Rush
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fast_casual',
        'city_bench_lunch',
        'City Bench Lunch Rush',
        'Urban midday hustle with paper bag marker text and harsh sunlight.',
        'instagram',
        '{"primary":"#F77F00","secondary":"#003049","accent":"#EAE2B7"}'::JSONB,
        '{"headline":"Permanent Marker","body":"Open Sans"}'::JSONB,
        '["#lunchtime","#streetfood","#cityliving"]'::JSONB,
        '{
            "style_adjectives":["noon sun","paper fiber","urban grit","motion blur pigeon"],
            "texture_options":["grease bleed","bag crinkle","marker saturation"],
            "palette_swaps":[["#F77F00","#003049"],["#FF924C","#264653"]],
            "camera_styles":["bench-level","street candid","high-contrast shadows"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'city_bench_lunch',
    'City Bench Lunch',
    'fast_casual',
    'instagram',
    'base',
    $$Eye-level street photo of a grease-stained paper bag on a park bench under harsh noon sun. Thick marker letters declare â€œ{{headline}}â€ with combo:  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Crinkles warp the text, purple sheen appears in greasy spots, a pigeon blurs by, and city traffic bokehs the background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'City Bench Lunch',
    '["paper_bag","street_food","high_noon"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 4: Flour Carved Morning Bake
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bakery',
        'flour_carved_morning',
        'Flour Carved Morning',
        'Bakery workbench with flour-carved lettering and sunlight shafts.',
        'instagram',
        '{"primary":"#F7DAD9","secondary":"#D8A47F","accent":"#6F4E37"}'::JSONB,
        '{"headline":"Playfair Display","body":"Work Sans"}'::JSONB,
        '["#freshbaked","#morningrush","#artisanbread"]'::JSONB,
        '{
            "style_adjectives":["flour dust","sunbeam","artisan hands","wood grain"],
            "texture_options":["flour carve","smoke puff","bench scratches"],
            "palette_swaps":[["#F7DAD9","#D8A47F"],["#F9E1B5","#C89F7C"]],
            "camera_styles":["macro bench","angled sunbeam","high-contrast morning"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'flour_carved_menu',
    'Flour Carved Menu',
    'bakery',
    'instagram',
    'base',
    $$Cinematic low-angle macro of a bakery workbench as a sunbeam cuts through flour dust. Menu text is carved into a thick layer of flour: â€œ{{headline}}â€  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  A bakerâ€™s hands knead dough in the background while warm light versus cool shadows show wood grain under the flour.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Flour Carved Morning',
    '["flour_carve","sunbeam","artisan_bakery"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 5: Barista Foam POV
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cafe',
        'barista_foam_pov',
        'Barista Foam POV',
        'Latte art POV with cocoa dust text and cafe hustle.',
        'instagram',
        '{"primary":"#C68B59","secondary":"#8C4A2F","accent":"#F7E7CE"}'::JSONB,
        '{"headline":"Playball","body":"Lato"}'::JSONB,
        '["#latteart","#cafelife","#morningfuel"]'::JSONB,
        '{
            "style_adjectives":["microfoam sheen","powder typography","cafe blur","steam aura"],
            "texture_options":["cocoa dust","foam swirl","condensation drip"],
            "palette_swaps":[["#C68B59","#8C4A2F"],["#D4A373","#6F4518"]],
            "camera_styles":["top-down cup","barista POV","macro foam detail"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'barista_foam_pov',
    'Barista POV Foam',
    'cafe',
    'instagram',
    'base',
    $$Extreme top-down POV into a wide latte cup. Cocoa powder lettering floats atop silky foam: â€œ{{headline}}â€  â€¢ {{item1_name}} â€“ ${{item1_price}}  â€¢ {{item2_name}} â€“ ${{item2_price}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Golden micro-bubbles shimmer in track lighting while condensation beads down the cup and a bustling cafe blurs below.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Barista Foam POV',
    '["latte_art","cocoa_dust","cafe_pov"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 6: Candlelit Bottle Special
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'candlelit_bottle_special',
        'Candlelit Bottle Special',
        'Gold paint marker lettering on wine bottle with romantic candle glow.',
        'instagram',
        '{"primary":"#D4AF37","secondary":"#1A1A1A","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Cormorant Garamond","body":"Raleway"}'::JSONB,
        '["#datenight","#winepairing","#cheflife"]'::JSONB,
        '{
            "style_adjectives":["candle reflection","glass curvature","romantic bokeh","linen texture"],
            "texture_options":["gold marker","wine glass distortion","soft shadow"],
            "palette_swaps":[["#D4AF37","#1A1A1A"],["#E6C200","#2D2A32"]],
            "camera_styles":["portrait bottle","intimate table","shallow depth low-light"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'candlelit_bottle_special',
    'Candlelit Bottle Special',
    'fine_dining',
    'instagram',
    'base',
    $$Portrait shot of a dark wine bottle centerpiece beside a tall candle. Metallic gold paint marker wraps the bottle with â€œ{{headline}}â€ and specials:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  The flame reflects inside the letters while table linens, stemware, and soft bokeh create elegant date-night vibes.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Candlelit Bottle',
    '["wine_bottle","romantic","gold_marker"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 7: Chrome Napkin Special
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'diner',
        'chrome_napkin_special',
        'Chrome Napkin Special',
        'Retro diner napkin dispenser with grease pencil lettering and neon reflections.',
        'instagram',
        '{"primary":"#FF3131","secondary":"#00A8E8","accent":"#F1FAEE"}'::JSONB,
        '{"headline":"Rubik Mono One","body":"Poppins"}'::JSONB,
        '["#dinervibes","#earlybird","#breakfastspecial"]'::JSONB,
        '{
            "style_adjectives":["chrome reflection","grease pencil sheen","retro neon","checkerboard floor"],
            "texture_options":["wax pencil","smudge","formica gloss"],
            "palette_swaps":[["#FF3131","#00A8E8"],["#FF4D6D","#4CC9F0"]],
            "camera_styles":["macro chrome","angled diner","fish-eye reflection"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'chrome_napkin_special',
    'Chrome Napkin Special',
    'diner',
    'instagram',
    'base',
    $$Macro portrait of a chrome napkin dispenser on a formica countertop. Red grease pencil scrawls â€œ{{headline}}â€ with breakfast favorites:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Maple syrup glows amber nearby, neon signage warps across the chrome, and vintage nostalgia drips from every reflection.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Chrome Napkin',
    '["diner","chrome","grease_pencil"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 8: Wet Slate Omakase
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'sushi',
        'wet_slate_omakase',
        'Wet Slate Omakase',
        'Moody wet slate boards with liquid chalk calligraphy.',
        'instagram',
        '{"primary":"#1F2A44","secondary":"#FFFFFF","accent":"#FF6F59"}'::JSONB,
        '{"headline":"Sawarabi Mincho","body":"Noto Sans"}'::JSONB,
        '["#omakase","#sushilife","#chefstable"]'::JSONB,
        '{
            "style_adjectives":["wet slate sheen","chalk calligraphy","dim ambience","sashimi glow"],
            "texture_options":["water streak","stone grain","chalk crisp"],
            "palette_swaps":[["#1F2A44","#FFFFFF"],["#0F172A","#F8F9FA"]],
            "camera_styles":["overhead slate","moody spotlight","high-dynamic range"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'wet_slate_omakase',
    'Wet Slate Omakase',
    'sushi',
    'instagram',
    'base',
    $$Overhead shot of a wet black slate board streaked with water. Bright white liquid chalk script reads â€œ{{headline}}â€ with omakase items:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Sashimi, wasabi, and chopsticks frame the calligraphy, moisture gleaming under moody lighting for Michelin-level drama.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Wet Slate Omakase',
    '["wet_slate","liquid_chalk","omakase"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 9: Taco Tuesday Basket
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'taqueria',
        'taco_tuesday_basket',
        'Taco Tuesday Basket',
        'Wax paper baskets with marker lettering and grease window.',
        'instagram',
        '{"primary":"#FFB400","secondary":"#FF6B6B","accent":"#2B2D42"}'::JSONB,
        '{"headline":"Luckiest Guy","body":"Montserrat"}'::JSONB,
        '["#tacotuesday","#streettacos","#happyhour"]'::JSONB,
        '{
            "style_adjectives":["wax paper texture","grease transparency","vibrant toppings","street food energy"],
            "texture_options":["grease spot","marker bleed","lime juice sheen"],
            "palette_swaps":[["#FFB400","#FF6B6B"],["#FF9F1C","#E63946"]],
            "camera_styles":["top-down basket","macro toppings","color pop food porn"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'taco_tuesday_basket',
    'Taco Tuesday Basket',
    'taqueria',
    'instagram',
    'base',
    $$High-angle close-up of a red plastic basket lined with checkered wax paper. Bold marker lettering on the paper proclaims â€œ{{headline}}â€ with specials:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Grease stains create translucent windows across the ink while tacos, lime wedges, and cilantro surround the message in vibrant street-food color.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Taco Tuesday Basket',
    '["wax_paper","street_tacos","marker"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;
-- ============================================================================
-- END OF MIGRATION
-- ============================================================================



-- ============================================================================
-- FILE: 20251122231000_winter_theme_support.sql
-- ============================================================================

-- ============================================================================
-- Migration: Seed Winter / Holiday Creative Themes & Templates
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Snow Day Sidewalk Chalkboard
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'gastropub',
        'snow_day_sidewalk',
        'Snow Day Sidewalk Chalkboard',
        'Powder-dusted A-frame chalkboards on wintry sidewalks.',
        'instagram',
        '{"primary":"#0F4C75","secondary":"#3282B8","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Open Sans"}'::JSONB,
        '["#snowday","#wintermenu","#cozyvibes"]'::JSONB,
        '{
            "style_adjectives":["powder snow","frosty air","chalk texture","street vignette"],
            "texture_options":["snow drift","chalk dust","wet wood grain"],
            "palette_swaps":[["#0F4C75","#FFFFFF"],["#1B262C","#BBE1FA"]],
            "camera_styles":["low-angle sidewalk","street candid","soft overcast"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'snow_day_sidewalk',
    'Snow Day Sidewalk',
    'gastropub',
    'instagram',
    'base',
    $$Low-angle photo of a rustic wooden A-frame chalkboard partly buried in fresh powder. Pastel icy-blue and white chalk announce â€œ{{headline}}â€ with specials:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Snow stacks on the sign frame while blurred winter boots pass behind under soft, overcast daylight.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Snow Day Sidewalk',
    '["chalkboard","snow_drift","street_scene"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Frosted Window Warmers
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'gastropub',
        'frosted_window_warmers',
        'Frosted Window Warmers',
        'Frost-traced windows glowing with interior warmth.',
        'instagram',
        '{"primary":"#1C3144","secondary":"#F2A65A","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
        '["#winterwarmers","#fireside","#comfortdrinks"]'::JSONB,
        '{
            "style_adjectives":["window frost","amber glow","snowfall bokeh","cozy contrast"],
            "texture_options":["fern frost","condensation","marker glow"],
            "palette_swaps":[["#1C3144","#F2A65A"],["#243B53","#F7B801"]],
            "camera_styles":["eye-level window","through-glass focus","snow foreground"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'frosted_window_warmers',
    'Frosted Window Warmers',
    'gastropub',
    'instagram',
    'base',
    $$Eye-level view from outside a snow-dusted window. Intricate ice fern patterns frame white window-marker lettering reading â€œ{{headline}}â€ with cozy bites:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Snowflakes blur in front while a golden fireplace and bundled guests glow inside.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Frosted Window Warmers',
    '["window_frost","amber_glow","snowfall"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Seasonal Spice Dust
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'coffeehouse',
        'seasonal_spice_dust',
        'Seasonal Spice Dust',
        'Cocoa and cinnamon stenciled lettering on walnut counters.',
        'instagram',
        '{"primary":"#533E2D","secondary":"#C4723C","accent":"#F3E9DC"}'::JSONB,
        '{"headline":"Quincy CF","body":"Josefin Sans"}'::JSONB,
        '["#seasonalsips","#cafelife","#warmspice"]'::JSONB,
        '{
            "style_adjectives":["spice dust","warm grain","macro aroma","negative space"],
            "texture_options":["cinnamon shadow","stencil crisp","steam curl"],
            "palette_swaps":[["#533E2D","#F3E9DC"],["#3D2C2E","#E6C79C"]],
            "camera_styles":["top-down macro","moody cafe","steam highlight"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'seasonal_spice_dust',
    'Seasonal Spice Dust',
    'coffeehouse',
    'instagram',
    'base',
    $$Top-down macro of a walnut counter dusted in cocoa and cinnamon. Negative space lettering reveals the wood, spelling â€œ{{headline}}â€ with seasonal sips:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Cinnamon sticks, star anise, and a steaming mug frame the warm, moody composition.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Seasonal Spice Dust',
    '["spice_dust","macro","warm_mood"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Fireside Slate Hearth
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'fireside_slate_hearth',
        'Fireside Slate Hearth',
        'Slate hearth lettering flickering under fireplace glow.',
        'instagram',
        '{"primary":"#3B3C36","secondary":"#D08C60","accent":"#F4E3CF"}'::JSONB,
        '{"headline":"Cormorant Garamond","body":"Source Sans Pro"}'::JSONB,
        '["#firesidedining","#cozyevenings","#wintermenu"]'::JSONB,
        '{
            "style_adjectives":["ember glow","chalk soot","wool texture","plaid accent"],
            "texture_options":["sooty chalk","fire bokeh","hearth stone"],
            "palette_swaps":[["#3B3C36","#D08C60"],["#2F2F2F","#E0A371"]],
            "camera_styles":["eye-level hearth","shallow depth","firelight flicker"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'fireside_slate_hearth',
    'Fireside Slate Hearth',
    'fine_dining',
    'instagram',
    'base',
    $$Eye-level focus on a dark slate hearth glowing from a roaring fireplace behind. Sooty white chalk writes â€œ{{headline}}â€ with elevated courses:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Sparks drift in bokeh while a plaid wool throw and leather arm rest set a luxe, cozy tone.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Fireside Slate Hearth',
    '["hearth","firelight","luxury_cozy"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Winter Copper Cocktail
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cocktail_bar',
        'winter_copper_cocktail',
        'Winter Copper Cocktail',
        'Frost-etched copper mugs with festive garnish and fairy lights.',
        'instagram',
        '{"primary":"#7A4419","secondary":"#B34747","accent":"#F5F3EE"}'::JSONB,
        '{"headline":"Montserrat","body":"PT Sans"}'::JSONB,
        '["#wintercocktails","#moscowmule","#holidaybar"]'::JSONB,
        '{
            "style_adjectives":["copper frost","rosemary twinkle","condensation beads","festive bokeh"],
            "texture_options":["iced copper","etched lettering","sugar cranberry"],
            "palette_swaps":[["#7A4419","#F5F3EE"],["#8C5A2E","#F2D0A4"]],
            "camera_styles":["macro mug","shallow bar top","fairy light blur"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'winter_copper_cocktail',
    'Winter Copper Cocktail',
    'cocktail_bar',
    'instagram',
    'base',
    $$Extreme close-up of a hammered copper mug glazed with frost and droplets. Frost-etched lettering spells â€œ{{headline}}â€ with signature drinks:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  Garnished with rosemary and sugared cranberries, fairy lights sparkle in the blurred background for a crisp holiday bar vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Winter Copper Cocktail',
    '["copper_mug","frost_etch","holiday_bar"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: Velvet Gala Menu
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'velvet_gala_menu',
        'Velvet Gala Menu',
        'Emerald velvet menus with gold foil emboss under candlelight.',
        'instagram',
        '{"primary":"#0B3D2E","secondary":"#C9A227","accent":"#F7F4EA"}'::JSONB,
        '{"headline":"Cinzel","body":"Work Sans"}'::JSONB,
        '["#holidaygala","#luxedining","#celebration"]'::JSONB,
        '{
            "style_adjectives":["velvet sheen","foil gleam","candle shadow","champagne sparkle"],
            "texture_options":["emboss glow","velvet pile","glass refraction"],
            "palette_swaps":[["#0B3D2E","#C9A227"],["#123524","#E5C07B"]],
            "camera_styles":["high-angle menu","macro texture","soft candlelight"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'velvet_gala_menu',
    'Velvet Gala Menu',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle close-up of an emerald velvet menu cover on white linen. Metallic gold foil embossing reads â€œ{{headline}}â€ with event highlights:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Candlelit shadows, a crystal flute, and gleaming silverware create a luxurious celebration.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Velvet Gala Menu',
    '["velvet","gold_foil","gala"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122231100_winter_theme_support_part2.sql
-- ============================================================================

-- ============================================================================
-- Migration: Seed Winter / Holiday Creative Themes & Templates (Part 2)
-- Created: 2025-11-22
-- ============================================================================

-- Theme 7: Powdered Brownie Snowfall
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bakery',
        'powdered_brownie_snowfall',
        'Powdered Brownie Snowfall',
        'Powdered sugar stenciled lettering over decadent brownie stacks.',
        'instagram',
        '{"primary":"#2B1B17","secondary":"#FFFFFF","accent":"#C7A27C"}'::JSONB,
        '{"headline":"Grand Hotel","body":"Nunito"}'::JSONB,
        '["#holidaydesserts","#sweetseason","#bakerymagic"]'::JSONB,
        '{
            "style_adjectives":["powder sugar","brownie gloss","warm kitchen","sparkle bokeh"],
            "texture_options":["sugar stencil","fudge sheen","cooling rack"],
            "palette_swaps":[["#2B1B17","#FFFFFF"],["#3C2720","#F5E6CA"]],
            "camera_styles":["top-down dessert","macro crumb","warm kitchen blur"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'powdered_brownie_snowfall',
    'Powdered Brownie Snowfall',
    'bakery',
    'instagram',
    'base',
    $$Top-down macro of a brownie stack on a cooling rack blanketed in powdered sugar. Stenciled negative space reveals â€œ{{headline}}â€ with sweet treats:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  A sugar sifter and cocoa station blur softly in the warm holiday kitchen background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Powdered Brownie Snowfall',
    '["powder_sugar","brownie_stack","holiday_treats"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 8: Enamel Pot Steam
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'comfort_food',
        'enamel_pot_steam',
        'Enamel Pot Steam',
        'Glossy dutch ovens with steam plumes and homey reflections.',
        'instagram',
        '{"primary":"#B3171E","secondary":"#F1C27D","accent":"#F8F5F1"}'::JSONB,
        '{"headline":"Alegreya Sans SC","body":"Karla"}'::JSONB,
        '["#soupszn","#comfortfood","#winterkitchen"]'::JSONB,
        '{
            "style_adjectives":["gloss enamel","steam plume","home kitchen","rustic loaf"],
            "texture_options":["marker on enamel","steam blur","wood tabletop"],
            "palette_swaps":[["#B3171E","#F1C27D"],["#9E1C21","#F0D1A4"]],
            "camera_styles":["high-angle pot","steam glow","homey vignette"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'enamel_pot_steam',
    'Enamel Pot Steam',
    'comfort_food',
    'instagram',
    'base',
    $$High-angle view of a bright enamel dutch oven with the lid ajar, releasing thick steam. White grease marker contrasts on the glossy lid with â€œ{{headline}}â€ and hearty comforts:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  A ladle, crusty bread, and window reflection complete the homestyle winter vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Enamel Pot Steam',
    '["enamel_pot","steam","comfort"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 9: Roasted Root Parchment
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'farm_to_table',
        'roasted_root_parchment',
        'Roasted Root Parchment',
        'Oil-stained parchment with marker menu amid roasted winter veggies.',
        'instagram',
        '{"primary":"#8C4A2F","secondary":"#D8A657","accent":"#F6E7CB"}'::JSONB,
        '{"headline":"Amatic SC","body":"Merriweather"}'::JSONB,
        '["#winterharvest","#farmtotable","#rootveggies"]'::JSONB,
        '{
            "style_adjectives":["roast caramel","oil stains","herb scatter","sheet pan glow"],
            "texture_options":["parchment grease","marker bleed","char edges"],
            "palette_swaps":[["#8C4A2F","#D8A657"],["#854D0E","#F2CC8F"]],
            "camera_styles":["overhead sheet pan","food styling","warm kitchen light"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'roasted_root_parchment',
    'Roasted Root Parchment',
    'farm_to_table',
    'instagram',
    'base',
    $$Overhead sheet pan of caramelized winter root vegetables on oil-stained parchment. Black marker scrawl on a clear patch reads â€œ{{headline}}â€ with farm-fresh dishes:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Herbs, charred edges, and honeyed light emphasize rustic freshness.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Roasted Root Parchment',
    '["parchment","root_veg","farmhouse"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 10: Ice Rink Scrape
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'sports_bar',
        'ice_rink_scrape',
        'Ice Rink Scrape',
        'Carved lettering in scarred ice with arena lighting.',
        'instagram',
        '{"primary":"#0B132B","secondary":"#1C2541","accent":"#5BC0BE"}'::JSONB,
        '{"headline":"Anton","body":"Roboto"}'::JSONB,
        '["#gamenight","#hockeybar","#sportsfans"]'::JSONB,
        '{
            "style_adjectives":["scarred ice","arena blue","frost shavings","cold intensity"],
            "texture_options":["ice carve","blade scratch","puck mark"],
            "palette_swaps":[["#0B132B","#5BC0BE"],["#1B1B2F","#00A8E8"]],
            "camera_styles":["macro ice surface","top-down rink","cool spotlight"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'ice_rink_scrape',
    'Ice Rink Scrape',
    'sports_bar',
    'instagram',
    'base',
    $$Extreme close-up of a frozen rink surface etched with skate scratches. Deeply carved letters announce â€œ{{headline}}â€ with arena-ready deals:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  Ice shavings pile along the grooves while a puck and cool arena lights frame the scene.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Ice Rink Scrape',
    '["ice_carve","arena_light","sports"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 11: Wood Burner Brand
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'ski_lodge',
        'wood_burner_brand',
        'Wood Burner Brand',
        'Branded wood slices with char smoke and lodge ambiance.',
        'instagram',
        '{"primary":"#5A3825","secondary":"#A47149","accent":"#F2E2CE"}'::JSONB,
        '{"headline":"Rye","body":"Cabin"}'::JSONB,
        '["#mountainlodge","#apresski","#woodfire"]'::JSONB,
        '{
            "style_adjectives":["char edge","pine grain","smoke wisp","plaid warmth"],
            "texture_options":["wood brand","charcoal ash","lantern glow"],
            "palette_swaps":[["#5A3825","#A47149"],["#4E342E","#D7B899"]],
            "camera_styles":["macro wood slice","tabletop lodge","warm rustic"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'wood_burner_brand',
    'Wood Burner Brand',
    'ski_lodge',
    'instagram',
    'base',
    $$Macro shot of a pine log slice used as a coaster, freshly branded with dark lettering reading â€œ{{headline}}â€ alongside mountain fare:  â€¢ {{item1_name}}  â€¢ {{item2_name}}  â€¢ {{item3_name}}  â€œ{{cta_line}}â€  A wisp of smoke trails upward while an axe handle, lantern, and plaid cloth blur in the lodge background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Wood Burner Brand',
    '["wood_brand","lodge","smoke_wisp"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 12: Custom Creator Lab
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cross_vertical',
        'custom_creator_lab',
        'Custom Creator Lab',
        'Guided freeform builder that pairs best-practice tips with open creative space.',
        'instagram',
        '{"primary":"#3A7CA5","secondary":"#F4F1DE","accent":"#81B29A"}'::JSONB,
        '{"headline":"Playfair Display","body":"DM Sans"}'::JSONB,
        '["#creativebrief","#brandvoice","#storyfirst"]'::JSONB,
        '{
            "style_adjectives":["story-driven","human voice","hero focus","texture-rich"],
            "texture_options":["soft light leak","handwritten accent","motion blur","grain overlay"],
            "palette_swaps":[["#3A7CA5","#F4F1DE"],["#81B29A","#F2CC8F"]],
            "camera_styles":["flexible POV","macro detail","lifestyle wide","flat lay hybrid"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'custom_creator_lab',
    'Custom Creator Lab',
    'cross_vertical',
    'instagram',
    'base',
    $$Headline: {{headline}}

Scene Overview: {{scene_description}}

Hero Elements: {{hero_items}}

Lighting & Mood: {{lighting_mood}}

CTA: {{cta_line}}

Optional Notes: {{supporting_props}}$$,
    'v1',
    TRUE,
    '{
        "guidance_blocks": [
            {
                "title": "Creative Framework",
                "bullets": [
                    "Anchor one hero subject or dish before layering atmosphere.",
                    "Pair a sensory cue with each visual detail you add.",
                    "Reserve space for a clear CTA with an action verb."
                ]
            },
            {
                "title": "Voice & Tone Reminders",
                "bullets": [
                    "Keep sentences active and precise; swap generic adjectives for specifics.",
                    "Blend brand voice keywords with seasonal or local references.",
                    "Mention lighting and environment so the generator can stage the scene."
                ]
            }
        ],
        "quick_start_prompts": [
            {
                "label": "Product Spotlight",
                "template": "Headline: {{headline}}\\nScene: Describe the hero product on its stage with lighting.\\nDetails: Note two supporting props or textures.\\nCTA: {{cta_line}}"
            },
            {
                "label": "Lifestyle Story",
                "template": "Headline: {{headline}}\\nMoment: Explain who is in the scene and what they are doing.\\nSetting: Outline environment, lighting, and mood.\\nCTA: {{cta_line}}"
            }
        ],
        "ui": {
            "show_guided_toggle": true,
            "default_palette_suggestions": ["neon night", "soft neutral", "high contrast"],
            "default_font_suggestions": ["Playfair Display", "Montserrat", "DM Sans"]
        }
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Custom Creator Lab',
    '["custom","guided","freeform"]'::JSONB,
    '{
        "required": ["headline","scene_description","hero_items","lighting_mood","cta_line"],
        "optional": ["supporting_props","color_palette","tone_keywords","camera_notes","texture_focus"],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Social Proof Scene Builder
-- ============================================================================
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cross_vertical',
        'social_proof_scene_builder',
        'Social Proof Scene Builder',
        'Transforms customer reviews into immersive visual scenes that feel earned, tactile, and proudly displayed.',
        'instagram',
        '{"primary":"#F7D488","secondary":"#1F2933","accent":"#EF5D60"}'::JSONB,
        '{"headline":"Playfair Display","body":"DM Sans"}'::JSONB,
        '["#socialproof","#earnedpraise","#scrollstopper"]'::JSONB,
        '{
            "style_adjectives":["earned","tactile","scene-driven","authentic brag"],
            "texture_options":["thermal paper","leather sheen","felt board","neon glass","chalk dust","wet cardstock"],
            "palette_swaps":[["#F7D488","#1F2933"],["#EF5D60","#0F172A"]],
            "camera_styles":["macro product proof","lifestyle POV","hero close-up","low depth of field"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'kitchen_ticket_spike',
    'Kitchen Ticket Spike',
    'fast_casual',
    'instagram',
    'base',
    $$Extreme close-up macro of a stainless order spike piercing a crumpled thermal receipt mid-rush. The printed header screams â€œ{{headline_text}}â€ with the kitchen shorthand review:
 â€¢ {{line_one}}
 â€¢ {{line_two}}
 â€¢ {{line_three}}
 â€œ{{signature}}â€
Heat-lamp glow and blurred chef motion prove the line is slammed while pride drips off the spike. Grease translucency detail: {{ambient_detail}}$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Back-of-house flex that shows reviews live on the line.",
        "recommended_usage": ["burger joints","diners","high-volume kitchens"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kitchen Ticket Spike',
    '["social_proof","thermal_receipt","back_of_house"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","line_three","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'guest_check_leather',
    'Guest Check Leather',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle POV over a tuxedoed table: a black leather guest check presenter lies open on crisp linen. The merchant copy gleams with handwritten ink reading â€œ{{headline_text}}â€ followed by:
 â€¢ {{line_one}}
 â€¢ {{line_two}}
 â€¢ {{line_three}}
 â€œ{{signature}}â€
A foil-wrapped chocolate mint, card edge, and candlelit reflections deliver the upscale thank-you energy guests brag about.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Fine dining gratitude captured in leather and candlelight.",
        "recommended_usage": ["steakhouses","Italian","date-night venues"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Guest Check Leather',
    '["social_proof","guest_check","romantic"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","line_three","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'neon_brick_quote',
    'Neon Brick Quote',
    'nightlife',
    'instagram',
    'base',
    $$Eye-level in a dim bar, the painted brick wall glows with custom neon bending the review into light: â€œ{{headline_text}}â€ stacked with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Hot pink and cyan illumination wraps mortar cracks, monstera leaves, and bar glass reflections so the praise literally lights the room.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Nightlife testimonial immortalized as bespoke neon signage.",
        "recommended_usage": ["bars","clubs","gastropubs"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Neon Brick Quote',
    '["social_proof","neon_sign","nightlife"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'tip_jar_sticky_note',
    'Tip Jar Sticky Note',
    'cafe',
    'instagram',
    'base',
    $$Counter-level close-up of an overstuffed glass tip jar, bills crumpled against the glass. A taped note scrawled in bold Sharpie reads â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Sunlit espresso blur and peeling tape corners prove the love is spontaneous and real.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Counter-service praise that feels handwritten and immediate.",
        "recommended_usage": ["cafes","bakeries","coffee trailers"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Tip Jar Sticky Note',
    '["social_proof","tip_jar","counter_service"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'letter_board_announcement',
    'Letter Board Announcement',
    'brunch_spot',
    'instagram',
    'base',
    $$Straight-on hero of a dusty felt letter board framed in oak. White plastic letters slot in to proclaim â€œ{{headline_text}}â€, {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Styled props like {{ambient_detail}} finish the influencer-perfect arrangement that makes the review photo-ready.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Instagram-ready letter board featuring fan devotion.",
        "recommended_usage": ["brunch cafes","boutiques","lifestyle concepts"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Letter Board Announcement',
    '["social_proof","letter_board","flat_lay"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'reserved_table_tent',
    'Reserved Table Tent',
    'fine_dining',
    'instagram',
    'base',
    $$Low-angle focus on a cream cardstock table tent with gold trim reading â€œ{{headline_text}}â€ and lines {{line_one}}, {{line_two}}, plus â€œ{{signature}}â€. Crystal stems, soft bokeh service, and warm sconces blur behind to prove the table is held for those who rave.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "VIP reservation energy framed as gratitude signage.",
        "recommended_usage": ["wine bars","bistros","anniversary venues"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Reserved Table Tent',
    '["social_proof","table_tent","vip"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'stapled_receipt_takeout',
    'Stapled Receipt Takeout',
    'takeout',
    'instagram',
    'base',
    $$Macro of a kraft paper bag fold stapled tight with a thermal receipt. The staple crunch frames â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Background stacks of bags and service lights amplify the must-have delivery flex.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Delivery praise captured at the pass window.",
        "recommended_usage": ["ghost kitchens","pickup counters","delivery-first brands"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Stapled Receipt Takeout',
    '["social_proof","takeout_bag","stapled_receipt"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'soggy_coaster_note',
    'Soggy Coaster Note',
    'sports_bar',
    'instagram',
    'base',
    $$Top-down view of a damp cardboard coaster stained by a frosty pint ring. Blue pen handwriting spells â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Ink bleed, peanut shells, and amber bar glow sell the lived-in loyalty.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Dive-bar love note soaked into the coaster.",
        "recommended_usage": ["breweries","dive bars","sports lounges"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Soggy Coaster Note',
    '["social_proof","beer_coaster","amber_glow"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'crayon_tablecloth_review',
    'Crayon Tablecloth Review',
    'family_dining',
    'instagram',
    'base',
    $$Close-up of a butcher-paper table cover covered in wax crayon joy. Childlike scrawl announces â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Loose crayons, chocolate milk glass, and bright lighting telegraph family love.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Family dining praise preserved in kid art.",
        "recommended_usage": ["Italian","family diners","pizza nights"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Crayon Tablecloth Review',
    '["social_proof","crayon_art","family_dining"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'sidewalk_chalk_masterpiece',
    'Sidewalk Chalk Masterpiece',
    'foot_traffic',
    'instagram',
    'base',
    $$High-angle on sunlit sidewalk chalk art outside the door. Thick pastel script shouts â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Concrete grit, dust clouds, stray leaves, and passerby shadow turn the review into a curbside CTA.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Street chalk hype that stops pedestrians.",
        "recommended_usage": ["cafes","ice cream","walk-up counters"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Sidewalk Chalk Masterpiece',
    '["social_proof","sidewalk_chalk","curb_appeal"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'bakery_string_tag',
    'Bakery String Tag',
    'bakery',
    'instagram',
    'base',
    $$Close-up of a pastel pastry box tied with red-and-white bakerâ€™s twine. A dangling tag proclaims â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Fiber fray, marble counter glint, and case blur sell the gift-worthy brag.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Gifting energy captured on bakery packaging.",
        "recommended_usage": ["patisseries","donut shops","dessert gifting"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bakery String Tag',
    '["social_proof","bakery_box","gift_ready"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'bathroom_mirror_selfie',
    'Bathroom Mirror Selfie',
    'nightlife',
    'instagram',
    'base',
    $$Portrait mirror selfie moment in a neon-splashed restroom. Lipstick lettering across the glass shouts â€œ{{headline_text}}â€ with {{line_one}}, {{line_two}}, and â€œ{{signature}}â€. Flash bloom, graffiti layers, and disco reflections scream viral vibe check.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "UGC-style mirror proclamation of the venueâ€™s vibe.",
        "recommended_usage": ["nightclubs","cocktail bars","gen-z hangouts"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bathroom Mirror Selfie',
    '["social_proof","mirror_selfie","ugc"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122232000_social_proof_theme_support.sql
-- ============================================================================

-- ============================================================================
-- Migration: Seed Social Proof Creative Themes & Templates (Part 1)
-- Section: Nano Banana â€“ Social Proof Review Showcases
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Kitchen Ticket Spike
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fast_casual',
        'kitchen_ticket_spike',
        'Kitchen Ticket Spike',
        'Thermal receipt review highlight on a back-of-house order spike.',
        'instagram',
        '{"primary":"#F2A65A","secondary":"#E4E9F7","accent":"#2B2D42"}'::JSONB,
        '{"headline":"Roboto Mono","body":"Inter"}'::JSONB,
        '["#burgerlife","#kitchenrush","#servicelegend"]'::JSONB,
        '{
            "style_adjectives":["thermal paper texture","heat lamp glow","stainless steel reflections","busy kitchen energy"],
            "texture_options":["grease stain translucency","dot matrix ink","wrinkled receipt"],
            "palette_swaps":[["#F2A65A","#2B2D42"],["#F77F00","#343A40"]],
            "camera_styles":["macro spike","shallow depth kitchen","warm back-of-house lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'kitchen_ticket_spike',
    'Kitchen Ticket Spike',
    'fast_casual',
    'instagram',
    'base',
    $$Macro shot of a stainless order spike holding a crumpled thermal receipt. Dot-matrix print proclaims â€œ{{headline}}â€ with bullet review quotes:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€¢ {{quote_line3}}  â€œ{{attribution}}â€  Heat lamp glow, chef motion blur, and grease translucency prove the kitchen stays slammed.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kitchen Ticket Spike',
    '["thermal_receipt","order_spike","heat_lamp"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","quote_line3","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Guest Check Leather Folder
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'guest_check_leather',
        'Guest Check Leather Folder',
        'Handwritten praise on a leather guest check with candlelit ambiance.',
        'instagram',
        '{"primary":"#1F1A17","secondary":"#C59D5F","accent":"#F7EBDA"}'::JSONB,
        '{"headline":"Playfair Display","body":"Cormorant Garamond"}'::JSONB,
        '["#finedining","#chefskiss","#date_night"]'::JSONB,
        '{
            "style_adjectives":["leather grain","ballpoint sheen","candle glow","tabletop luxury"],
            "texture_options":["pen pressure indent","mint wrapper shine","linen fold shadow"],
            "palette_swaps":[["#1F1A17","#C59D5F"],["#2B211A","#DAB785"]],
            "camera_styles":["high-angle check presenter","romantic lighting","shallow depth table"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'guest_check_leather',
    'Guest Check Leather Folder',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle POV of an open black leather guest check on white linen. Blue ink handwriting gushes: â€œ{{headline}}â€ next lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€¢ {{quote_line3}}  â€œ{{attribution}}â€  Chocolate mint wrapper, credit card glint, and candlelit shadows sell refined gratitude.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Guest Check Leather Folder',
    '["leather_presenter","handwritten_note","candlelight"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","quote_line3","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Neon Brick Quote
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'nightlife',
        'neon_brick_quote',
        'Neon Brick Quote',
        'Custom neon review signage glowing against distressed brick.',
        'instagram',
        '{"primary":"#FF2EC6","secondary":"#38DFFF","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"Neon Tubes","body":"Futura"}'::JSONB,
        '["#neonnight","#clubreviews","#gastropubglow"]'::JSONB,
        '{
            "style_adjectives":["neon emission","brick patina","nightlife glow","plant silhouettes"],
            "texture_options":["painted brick flake","neon halo","shadowed mortar"],
            "palette_swaps":[["#FF2EC6","#38DFFF"],["#FF006E","#70E1FF"]],
            "camera_styles":["eye-level wall","ambient bar lighting","neon focus"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'neon_brick_quote',
    'Neon Brick Quote',
    'nightlife',
    'instagram',
    'base',
    $$Eye-level shot of a distressed white brick wall lit by custom neon. Electric tubing spells â€œ{{headline}}â€ then stacked lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Glowing colors halo mortar cracks while monstera leaves catch the light, proving the vibe matches the hype.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Neon Brick Quote',
    '["neon_sign","brick_texture","nightlife"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Tip Jar Sticky Note
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'coffee_shop',
        'tip_jar_sticky',
        'Tip Jar Sticky Note',
        'Tip jar review taped to glass with morning cafÃ© energy.',
        'instagram',
        '{"primary":"#F7B267","secondary":"#FFE9A0","accent":"#4A4E69"}'::JSONB,
        '{"headline":"Cabin Sketch","body":"Poppins"}'::JSONB,
        '["#coffeeshoplove","#baristamagic","#morningcrowd"]'::JSONB,
        '{
            "style_adjectives":["glass refraction","cash clutter","sunlit counter","handwritten tape"],
            "texture_options":["masking tape peel","sharpie bleed","coin shine"],
            "palette_swaps":[["#F7B267","#4A4E69"],["#F8E16C","#2F3E46"]],
            "camera_styles":["close-up jar","bright window light","espresso blur"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'tip_jar_sticky',
    'Tip Jar Sticky Note',
    'coffee_shop',
    'instagram',
    'base',
    $$Close-up of a tip jar stuffed with cash and coins on a wood counter. Peeling tape note shouts â€œ{{headline}}â€ with stacked review lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Morning sun, espresso blur, and marker strokes make the praise feel spontaneous.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Tip Jar Sticky Note',
    '["tip_jar","sharpie_note","morning_light"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Letter Board Announcement
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'brunch_spot',
        'letter_board_announcement',
        'Letter Board Announcement',
        'Felt groove board showcasing rave brunch review.',
        'instagram',
        '{"primary":"#1C1E26","secondary":"#F0D9B5","accent":"#6C757D"}'::JSONB,
        '{"headline":"Cooper Hewitt","body":"Avenir"}'::JSONB,
        '["#brunchclub","#feltboard","#instaflex"]'::JSONB,
        '{
            "style_adjectives":["felt texture","plastics letters","styled flatlay","soft studio light"],
            "texture_options":["letter misalignment","dust motes","frame grain"],
            "palette_swaps":[["#1C1E26","#F0D9B5"],["#2E313B","#FFE8D6"]],
            "camera_styles":["flatlay square","minimalist styling","diffused lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'letter_board_announcement',
    'Letter Board Announcement',
    'brunch_spot',
    'instagram',
    'base',
    $$Straight-on flatlay of a black felt letter board framed in oak. White plastic letters rave: line1 â€œ{{headline}}â€ line2 â€œ{{quote_line1}}â€ line3 â€œ{{quote_line2}}â€ line4 â€œ{{attribution}}â€. Succulent, sunglasses, and soft influencer lighting turn the review into instant social proof.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Letter Board Announcement',
    '["felt_board","flatlay","influencer_style"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: Reserved Table Tent
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'wine_bar',
        'reserved_table_tent',
        'Reserved Table Tent',
        'Elegant reservation card featuring heartfelt service review.',
        'instagram',
        '{"primary":"#F7F1E5","secondary":"#C0896C","accent":"#3D2C29"}'::JSONB,
        '{"headline":"Didot","body":"Libre Baskerville"}'::JSONB,
        '["#vipservice","#anniversarydinner","#tableset"]'::JSONB,
        '{
            "style_adjectives":["matte cardstock","gold trim","bokeh dining room","low-angle hero"],
            "texture_options":["foil glint","glass refraction","table linen"],
            "palette_swaps":[["#F7F1E5","#C0896C"],["#FFF5E1","#B17E5D"]],
            "camera_styles":["low-angle tent card","warm bokeh","shallow depth focus"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'reserved_table_tent',
    'Reserved Table Tent',
    'wine_bar',
    'instagram',
    'base',
    $$Low-angle close-up of a cream cardstock tent with gold trim. Elegant serif lines read â€œ{{headline}}â€ followed by:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Crystal glass stems, warm bokeh guests, and perfect focus signal VIP treatment.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Reserved Table Tent',
    '["table_tent","vip_vibes","gold_trim"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122232100_social_proof_theme_support_part2.sql
-- ============================================================================

-- ============================================================================
-- Migration: Seed Social Proof Creative Themes & Templates (Part 2)
-- Section: Nano Banana â€“ Social Proof Review Showcases
-- Created: 2025-11-22
-- ============================================================================

-- Theme 7: Stapled Receipt
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'takeout',
        'stapled_receipt',
        'Stapled Receipt',
        'Takeout bag receipt highlighting delivery obsession.',
        'instagram',
        '{"primary":"#D4A373","secondary":"#FFECD6","accent":"#2F2F2F"}'::JSONB,
        '{"headline":"Space Mono","body":"Manrope"}'::JSONB,
        '["#takeoutlife","#bagdrop","#ghostkitchen"]'::JSONB,
        '{
            "style_adjectives":["kraft paper fiber","metal staple tension","harsh pass lighting","order stack urgency"],
            "texture_options":["staple pinch","receipt curl","paper fiber"],
            "palette_swaps":[["#D4A373","#2F2F2F"],["#C58940","#1F1F1F"]],
            "camera_styles":["macro bag top","kitchen pass lighting","shallow depth focus"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'stapled_receipt',
    'Stapled Receipt',
    'takeout',
    'instagram',
    'base',
    $$Macro view of a folded kraft takeout bag stapled with a thermal receipt. Text in the review section reads â€œ{{headline}}â€ then stacked lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€¢ {{quote_line3}}  â€œ{{attribution}}â€  Metal deformation, bag fibers, and blurred pickup stack scream delivery demand.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Stapled Receipt',
    '["takeout_bag","staple_detail","delivery_hype"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","quote_line3","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 8: Soggy Coaster
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'brewery',
        'soggy_coaster',
        'Soggy Coaster',
        'Beer coaster scribbled review with condensation ring.',
        'instagram',
        '{"primary":"#6C4A31","secondary":"#E1C699","accent":"#2E2A24"}'::JSONB,
        '{"headline":"Brandon Grotesque","body":"Source Sans Pro"}'::JSONB,
        '["#brewerylife","#localsonly","#pubvibes"]'::JSONB,
        '{
            "style_adjectives":["wet cardboard","ink bleed","amber bar light","woodgrain scuffs"],
            "texture_options":["condensation ring","pen pressure","salt scatter"],
            "palette_swaps":[["#6C4A31","#E1C699"],["#5B3A2A","#F2DEC6"]],
            "camera_styles":["top-down coaster","moody bar lighting","macro detail"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'soggy_coaster',
    'Soggy Coaster',
    'brewery',
    'instagram',
    'base',
    $$Top-down of a damp cardboard coaster with a fresh condensation ring. Blue pen scrawl reads â€œ{{headline}}â€ with following lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Ink bleed, peanuts, and amber bar glow prove the new regulars are hooked.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Soggy Coaster',
    '["beer_coaster","ink_bleed","bar_top"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 9: Crayon Tablecloth
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'family_dining',
        'crayon_tablecloth',
        'Crayon Tablecloth',
        'Child-drawn crayon review on butcher paper table cover.',
        'instagram',
        '{"primary":"#F4F1DE","secondary":"#FFB4A2","accent":"#2A9D8F"}'::JSONB,
        '{"headline":"Comic Neue","body":"KG Primary Penmanship"}'::JSONB,
        '["#familydinner","#kidapproved","#pizzanight"]'::JSONB,
        '{
            "style_adjectives":["wax buildup","paper grain","playful mess","family warmth"],
            "texture_options":["crayon smear","crumb scatter","glass condensation"],
            "palette_swaps":[["#F4F1DE","#FFB4A2"],["#FFF1E6","#F7A399"]],
            "camera_styles":["table-level kid art","bright dining light","macro crayon"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'crayon_tablecloth',
    'Crayon Tablecloth',
    'family_dining',
    'instagram',
    'base',
    $$Eye-level focus on butcher paper covered in waxy crayon praise. Child handwriting shouts â€œ{{headline}}â€ with playful lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Scattered crayons, chocolate milk glass, and bright lighting make family approval feel tangible.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Crayon Tablecloth',
    '["kid_crayon","family_energy","butcher_paper"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 10: Sidewalk Chalk Masterpiece
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'foot_traffic',
        'sidewalk_chalk_masterpiece',
        'Sidewalk Chalk Masterpiece',
        'Sidewalk chalk review pointing pedestrians into the shop.',
        'instagram',
        '{"primary":"#F8C4FF","secondary":"#8BE9FD","accent":"#FFEE93"}'::JSONB,
        '{"headline":"Chalkboard","body":"Montserrat Alternates"}'::JSONB,
        '["#curbappeal","#sidewalksign","#donutdrop"]'::JSONB,
        '{
            "style_adjectives":["concrete grain","chalk dust","sun-cast shadow","street leaf"],
            "texture_options":["chalk particles","footprint smudge","fallen leaf"],
            "palette_swaps":[["#F8C4FF","#FFEE93"],["#FFD6E0","#C8F7FF"]],
            "camera_styles":["top-down sidewalk","high noon shadow","street vignette"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'sidewalk_chalk_masterpiece',
    'Sidewalk Chalk Masterpiece',
    'foot_traffic',
    'instagram',
    'base',
    $$High-angle view of sunlit sidewalk chalk art outside the entrance. Vibrant lettering commands â€œ{{headline}}â€ with supportive lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Concrete grain, chalk dust, leaf drift, and viewer shadow stop foot traffic cold.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Sidewalk Chalk Masterpiece',
    '["sidewalk_chalk","curbside","foot_traffic"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 11: Bakery String Tag
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bakery',
        'bakery_string_tag',
        'Bakery String Tag',
        'Gift tag review attached to pastry box with twine.',
        'instagram',
        '{"primary":"#F7CAD0","secondary":"#F8EDEB","accent":"#C9184A"}'::JSONB,
        '{"headline":"Allura","body":"Quicksand"}'::JSONB,
        '["#sweetgift","#officetreat","#croissantcrush"]'::JSONB,
        '{
            "style_adjectives":["twine fibers","tag shadow","marble counter","display case glow"],
            "texture_options":["felt-tip strokes","twine fray","box fold"],
            "palette_swaps":[["#F7CAD0","#C9184A"],["#FAD2E1","#FF4D6D"]],
            "camera_styles":["macro tag","soft pastry light","shallow depth"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'bakery_string_tag',
    'Bakery String Tag',
    'bakery',
    'instagram',
    'base',
    $$Macro focus on a pastel pastry box tied with red-and-white bakerâ€™s twine. Dangling tag reads â€œ{{headline}}â€ with lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Twine fibers, marble counter, and pastry case bokeh make the review the perfect gift.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bakery String Tag',
    '["bakers_twine","gift_tag","pastry_box"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 12: Bathroom Mirror Selfie
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'nightlife',
        'bathroom_mirror_selfie',
        'Bathroom Mirror Selfie',
        'Mirror selfie review written in lipstick with nightlife reflection.',
        'instagram',
        '{"primary":"#FF4F8B","secondary":"#1F1B2C","accent":"#9C89FF"}'::JSONB,
        '{"headline":"Marker Felt","body":"Montserrat"}'::JSONB,
        '["#vibesimmaculate","#nightout","#ugcenergy"]'::JSONB,
        '{
            "style_adjectives":["lipstick streak","mirror ghosting","flash flare","graffiti ambience"],
            "texture_options":["lip print","tile reflection","red neon"],
            "palette_swaps":[["#FF4F8B","#9C89FF"],["#FF006E","#845EC2"]],
            "camera_styles":["portrait mirror","flash pop","bathroom graffiti"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'bathroom_mirror_selfie',
    'Bathroom Mirror Selfie',
    'nightlife',
    'instagram',
    'base',
    $$Portrait mirror selfie scene framed by graffiti tile. Lipstick lettering on glass yells â€œ{{headline}}â€ with vibrant lines:  â€¢ {{quote_line1}}  â€¢ {{quote_line2}}  â€œ{{attribution}}â€  Flash flare, reflection ghosting, and neon spill prove the vibe is viral.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bathroom Mirror Selfie',
    '["mirror_selfie","lipstick_text","nightlife_vibe"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122233000_hiring_theme_support.sql
-- ============================================================================

-- ============================================================================
-- Migration: Seed Now Hiring Creative Themes & Templates
-- Section: Nano Banana â€“ Talent Acquisition Campaigns
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Selvedge Apron Crew
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'hipster_service',
        'selvedge_apron_crew',
        'Selvedge Apron Crew',
        'Denim apron hiring poster with screen-printed typography.',
        'instagram',
        '{"primary":"#1F3A5F","secondary":"#F7F9FB","accent":"#C08457"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Work Sans"}'::JSONB,
        '["#nowhiring","#baristalife","#joinourcrew"]'::JSONB,
        '{
            "style_adjectives":["raw denim weave","screen print distress","brass hardware","clean cafe lighting"],
            "texture_options":["embroidered edge","leather strap patina","tile grout shadow"],
            "palette_swaps":[["#1F3A5F","#F7F9FB"],["#283C63","#E6E6EA"]],
            "camera_styles":["straight-on apron","macro fabric detail","bright tile backdrop"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'selvedge_apron_crew',
    'Selvedge Apron Crew',
    'hipster_service',
    'instagram',
    'base',
    $$Close-up of a selvedge denim apron on a subway-tile wall. Distressed white ink reads â€œ{{headline}}â€ with stacked calls:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  â€œ{{cta_line}}â€  Brass rivets, leather straps, and a hanging portafilter put style behind the hiring message.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Selvedge Apron Crew',
    '["denim_apron","screen_print","hipster_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Kitchen Pass Heat Lamp
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'culinary_backline',
        'kitchen_pass_heatlamp',
        'Kitchen Pass Heat Lamp',
        'Grease pencil hiring call written across the stainless pass.',
        'instagram',
        '{"primary":"#FF6B35","secondary":"#FFD166","accent":"#2F4858"}'::JSONB,
        '{"headline":"Anton","body":"Roboto Condensed"}'::JSONB,
        '["#linecooklife","#kitchenpass","#wearehiring"]'::JSONB,
        '{
            "style_adjectives":["heat lamp glow","stainless reflections","china marker wax","service urgency"],
            "texture_options":["smudged marker","finger drag","steam haze"],
            "palette_swaps":[["#FF6B35","#FFD166"],["#F95738","#F4D35E"]],
            "camera_styles":["eye-level pass","shallow depth kitchen","orange flood lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'kitchen_pass_heatlamp',
    'Kitchen Pass Heat Lamp',
    'culinary_backline',
    'instagram',
    'base',
    $$Eye-level look across a stainless kitchen pass bathed in orange heat lamps. Grease pencil scrawl shouts â€œ{{headline}}â€ with stacked lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  â€œ{{cta_line}}â€  Chef motion blur, garnish plates, and hot reflections sell the urgency.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kitchen Pass Heat Lamp',
    '["heatlamp","grease_pencil","linecook_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Empty Tap Handle
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'craft_bar',
        'empty_tap_handle',
        'Empty Tap Handle',
        'Vacant tap handle with hang tag invite for bartenders.',
        'instagram',
        '{"primary":"#8C5E34","secondary":"#F6E0B5","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"League Spartan","body":"Fira Sans"}'::JSONB,
        '["#bartenderwanted","#craftbeerjobs","#taproomteam"]'::JSONB,
        '{
            "style_adjectives":["wood grain","bar bokeh","condensation drip","twine tag"],
            "texture_options":["ink stamp","tag curl","metal sheen"],
            "palette_swaps":[["#8C5E34","#F6E0B5"],["#7A4419","#FFEAC2"]],
            "camera_styles":["low-angle taps","shallow depth bar","warm ambient"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'empty_tap_handle',
    'Empty Tap Handle',
    'craft_bar',
    'instagram',
    'base',
    $$Low-angle view of a tap lineup with one plain wooden handle. Kraft-tag tied with twine reads â€œ{{headline}}â€ then lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  â€œ{{cta_line}}â€  Condensation, bottle bokeh, and wood grain make the open slot impossible to ignore.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Empty Tap Handle',
    '["tap_handle","hang_tag","bartender_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Espresso Grounds Spill
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'coffee_shop',
        'espresso_grounds_spill',
        'Espresso Grounds Spill',
        'Negative-space hiring call carved into fresh espresso grounds.',
        'instagram',
        '{"primary":"#3F2F2F","secondary":"#F7F4F0","accent":"#B88846"}'::JSONB,
        '{"headline":"Archivo Black","body":"Prompt"}'::JSONB,
        '["#baristahiring","#coffeecareers","#wakeuplocal"]'::JSONB,
        '{
            "style_adjectives":["granular grounds","negative space lettering","marble sheen","morning ritual"],
            "texture_options":["bean scatter","tamper mark","pitcher reflection"],
            "palette_swaps":[["#3F2F2F","#F7F4F0"],["#2F1B10","#EFE7DD"]],
            "camera_styles":["top-down macro","studio daylight","coffee tools"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'espresso_grounds_spill',
    'Espresso Grounds Spill',
    'coffee_shop',
    'instagram',
    'base',
    $$Top-down macro of espresso grounds shaped into bold negative space text. Marble peeks through spelling â€œ{{headline}}â€ with support lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€œ{{cta_line}}â€  Milk pitcher, tamper, and stray beans prove this call is for true coffee devotees.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Espresso Grounds Spill',
    '["coffee_grounds","negative_space","barista_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Knife Roll Invitation
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'knife_roll_invitation',
        'Knife Roll Invitation',
        'Vintage knife roll with invitation card in empty slot.',
        'instagram',
        '{"primary":"#6B4226","secondary":"#F2E9E4","accent":"#9A8C98"}'::JSONB,
        '{"headline":"Cinzel","body":"Crimson Text"}'::JSONB,
        '["#hiringchefs","#culinarycareer","#souschefsearch"]'::JSONB,
        '{
            "style_adjectives":["worn leather","blade gleam","butcher block grain","respectful tone"],
            "texture_options":["patina scratch","cardstock bevel","steel reflection"],
            "palette_swaps":[["#6B4226","#F2E9E4"],["#5A3825","#ECE2D0"]],
            "camera_styles":["high-angle knife roll","dramatic lighting","focused composition"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'knife_roll_invitation',
    'Knife Roll Invitation',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle on a weathered leather knife roll spread across butcher block. A crisp card tucked in the empty slot declares â€œ{{headline}}â€ with refined lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  â€œ{{cta_line}}â€  Blade shine and leather patina make the position feel elite.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Knife Roll Invitation',
    '["knife_roll","prestige_hiring","fine_dining_team"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: 86 Board Now Hiring
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'high_volume_kitchen',
        'eighty_six_board',
        '86 Board Now Hiring',
        'Whiteboard 86 list flipped into a gritty hiring shout.',
        'instagram',
        '{"primary":"#FFFFFF","secondary":"#4A5568","accent":"#E53E3E"}'::JSONB,
        '{"headline":"Permanent Marker","body":"Montserrat"}'::JSONB,
        '["#kitchenculture","#86badattitudes","#cookwanted"]'::JSONB,
        '{
            "style_adjectives":["dry erase ghosting","fluorescent glare","marker urgency","back-of-house grit"],
            "texture_options":["towel drape","tape residue","smudge trail"],
            "palette_swaps":[["#FFFFFF","#E53E3E"],["#F7FAFC","#C53030"]],
            "camera_styles":["medium shot board","green fluorescent","handwritten chaos"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'eighty_six_board',
    '86 Board Now Hiring',
    'high_volume_kitchen',
    'instagram',
    'base',
    $$Medium shot of a smudged kitchen whiteboard under fluorescent glare. Blue and red marker list â€œ{{headline}}â€ followed by lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  â€œ{{cta_line}}â€  Crossed-out menu items, grease smears, and towel drape prove it is straight from the line.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    '86 Board Now Hiring',
    '["whiteboard","back_of_house","gritty_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122234000_events_promotions_theme_support.sql
-- ============================================================================

-- ============================================================================
-- Migration: Seed Events & Promotions Creative Themes & Templates
-- Section: Nano Banana â€“ Experiential Campaigns
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Gaffer Tape Setlist (Live Music)
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'live_music',
        'gaffer_tape_setlist',
        'Gaffer Tape Setlist',
        'Stage monitor with taped setlist announcing tonightâ€™s live act.',
        'instagram',
        '{"primary":"#1B1C30","secondary":"#F8F6F0","accent":"#7C4DFF"}'::JSONB,
        '{"headline":"Anton","body":"Montserrat"}'::JSONB,
        '["#livemusic","#tonightonly","#acousticduo"]'::JSONB,
        '{
            "style_adjectives":["gaffer tape texture","stage wash lighting","monitor grille","performer pov"],
            "texture_options":["tape tear","paper wrinkle","dust motes"],
            "palette_swaps":[["#1B1C30","#7C4DFF"],["#111224","#FF61D2"]],
            "camera_styles":["low-angle monitor","stage gel lighting","shallow depth cables"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'gaffer_tape_setlist',
    'Gaffer Tape Setlist',
    'live_music',
    'instagram',
    'base',
    $$Low-angle performer POV of a stage monitor with a wrinkled paper setlist taped down by ripped black gaffer tape. Bold marker reads â€œ{{headline}}â€ with electric bullet lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  Microphone base, guitar cable, and purple-blue stage wash make the night feel loud and real.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Gaffer Tape Setlist',
    '["live_music","gaffer_tape","stage_monitor"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Pigskin Showdown (Game Day)
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'sports_bar',
        'pigskin_showdown',
        'Pigskin Showdown',
        'Macro football leather promo for game-day specials.',
        'instagram',
        '{"primary":"#8B4513","secondary":"#FFFFFF","accent":"#2F855A"}'::JSONB,
        '{"headline":"League Spartan","body":"Fira Sans"}'::JSONB,
        '["#gameday","#sundayshowdown","#wingdeal"]'::JSONB,
        '{
            "style_adjectives":["football pebbling","metallic marker sheen","field blur","sports hype"],
            "texture_options":["lace stitch","highlight glint","leather shadow"],
            "palette_swaps":[["#8B4513","#2F855A"],["#7B341E","#38A169"]],
            "camera_styles":["macro pigskin","shallow depth turf","dramatic contrast"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'pigskin_showdown',
    'Pigskin Showdown',
    'sports_bar',
    'instagram',
    'base',
    $$Extreme close-up of a pro footballâ€™s pebbled leather with white laces in frame. Metallic marker lettering shouts â€œ{{headline}}â€ and lists:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  Turf-green blur and specular highlights deliver instant game-day energy.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Pigskin Showdown',
    '["football_macro","metallic_marker","sports_promo"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Graphite Trivia Sheet
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pub_event',
        'graphite_trivia_sheet',
        'Graphite Trivia Sheet',
        'Pub quiz answer sheet with erased smudges and pencil sheen.',
        'instagram',
        '{"primary":"#F5F1EB","secondary":"#3C3C3C","accent":"#C58B00"}'::JSONB,
        '{"headline":"Special Elite","body":"Kalam"}'::JSONB,
        '["#trivianight","#pubquiz","#brainfuel"]'::JSONB,
        '{
            "style_adjectives":["graphite shine","eraser dust","tabletop warmth","handwritten energy"],
            "texture_options":["pencil smear","beer ring","paper grain"],
            "palette_swaps":[["#F5F1EB","#C58B00"],["#FFF5E1","#B7791F"]],
            "camera_styles":["top-down sheet","macro pencil","warm pub lighting"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'graphite_trivia_sheet',
    'Graphite Trivia Sheet',
    'pub_event',
    'instagram',
    'base',
    $$Top-down on a pub quiz score sheet with graphite handwriting, eraser smudges, and pencil crumbs. The sheet declares â€œ{{headline}}â€ with narrative lines:  â€¢ {{line1}}  â€¢ {{line2}}  â€¢ {{line3}}  Pint glass ring and amber lamp glow gamify the invite.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Graphite Trivia Sheet',
    '["trivia_night","graphite_sheen","pub_quiz"]'::JSONB,
    '{
        "required": ["headline","line1","line2","line3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Spotlight Comedy Brick
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'comedy_event',
        'spotlight_comedy_brick',
        'Spotlight Comedy Brick',
        'Gobo projection on brick wall for comedy night.',
        'instagram',
        '{"primary":"#FFFFFF","secondary":"#1C1C1C","accent":"#FFB703"}'::JSONB,
        '{"headline":"Oswald","body":"Futura"}'::JSONB,
        '["#comedynight","#openmic","#laughlocal"]'::JSONB,
        '{
            "style_adjectives":["spotlight halo","brick relief","microphone silhouette","high contrast stage"],
            "texture_options":["shadow length","painted mortar","light spill"],
            "palette_swaps":[["#FFFFFF","#FFB703"],["#F8F9FA","#FBB13C"]],
            "camera_styles":["eye-level brick","single spotlight","dramatic contrast"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'spotlight_comedy_brick',
    'Spotlight Comedy Brick',
    'comedy_event',
    'instagram',
    'base',
    $$Eye-level shot of a white brick wall sliced by a tight spotlight. A microphone stand casts a shadow across projected text reading â€œ{{headline}}â€ with supporting lines:  â€¢ {{line1}}  â€¢ {{line2}}  â€¢ {{line3}}  Pitch-black surroundings focus all attention on the open-mic invite.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Spotlight Comedy Brick',
    '["comedy_stage","spotlight_projection","brick_texture"]'::JSONB,
    '{
        "required": ["headline","line1","line2","line3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Balloon Kids Free
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'family_promo',
        'balloon_kids_free',
        'Balloon Kids Free',
        'Latex balloon cluster featuring kids-eat-free offer.',
        'instagram',
        '{"primary":"#FFD166","secondary":"#FF6F59","accent":"#118AB2"}'::JSONB,
        '{"headline":"Fredoka One","body":"Nunito"}'::JSONB,
        '["#kidseatfree","#familyfun","#balloonday"]'::JSONB,
        '{
            "style_adjectives":["latex stretch","marker translucency","ceiling reflection","party energy"],
            "texture_options":["ribbon curl","balloon glare","ink streak"],
            "palette_swaps":[["#FFD166","#118AB2"],["#FFB703","#06D6A0"]],
            "camera_styles":["balloon close-up","bright interior","shallow depth party"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'balloon_kids_free',
    'Balloon Kids Free',
    'family_promo',
    'instagram',
    'base',
    $$Close-up of vibrant helium balloons with a yellow balloon front and center. Stretched marker letters announce â€œ{{headline}}â€ followed by:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€œ{{cta_line}}â€  Glossy reflections, curled ribbons, and ceiling lights scream kid-friendly celebration.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Balloon Kids Free',
    '["balloon_text","family_promo","party_energy"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: Hot Sauce Challenge
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'spicy_event',
        'hot_sauce_challenge',
        'Hot Sauce Challenge',
        'Spilled hot sauce typography daring guests to turn up the heat.',
        'instagram',
        '{"primary":"#E63946","secondary":"#F1FAEE","accent":"#457B9D"}'::JSONB,
        '{"headline":"Bangers","body":"Raleway"}'::JSONB,
        '["#spicychallenge","#tacotuesday","#bringtheheat"]'::JSONB,
        '{
            "style_adjectives":["viscous sauce","gloss highlights","marble counter","daredevil energy"],
            "texture_options":["chili flake","lime zest","bottle drip"],
            "palette_swaps":[["#E63946","#457B9D"],["#D62828","#1D3557"]],
            "camera_styles":["top-down spill","foodie styling","macro gloss"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'hot_sauce_challenge',
    'Hot Sauce Challenge',
    'spicy_event',
    'instagram',
    'base',
    $$Top-down of a marble counter where thick hot sauce has been drizzled into raised, glossy lettering. The spill screams â€œ{{headline}}â€ with fiery lines:  â€¢ {{bullet1}}  â€¢ {{bullet2}}  â€¢ {{bullet3}}  Lime wedge, chili pepper, and sauce bottle sell the dare.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Hot Sauce Challenge',
    '["hot_sauce","gloss_typography","spicy_promo"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122235000_theme_category_support.sql
-- ============================================================================

-- ============================================================================
-- Migration: Add category metadata to creative themes
-- Created: 2025-11-22
-- ============================================================================

ALTER TABLE creative_prompt_themes
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'campaigns';

-- Social proof themes
UPDATE creative_prompt_themes
SET category = 'social-proof'
WHERE theme_slug IN (
    'kitchen_ticket_spike',
    'guest_check_leather',
    'neon_brick_quote',
    'tip_jar_sticky',
    'letter_board_announcement',
    'reserved_table_tent',
    'stapled_receipt',
    'soggy_coaster',
    'crayon_tablecloth',
    'sidewalk_chalk_masterpiece',
    'bakery_string_tag',
    'bathroom_mirror_selfie'
);

-- Hiring themes
UPDATE creative_prompt_themes
SET category = 'hiring'
WHERE theme_slug IN (
    'selvedge_apron_crew',
    'kitchen_pass_heatlamp',
    'empty_tap_handle',
    'espresso_grounds_spill',
    'knife_roll_invitation',
    'eighty_six_board'
);

-- Events & promotions themes
UPDATE creative_prompt_themes
SET category = 'events'
WHERE theme_slug IN (
    'gaffer_tape_setlist',
    'pigskin_showdown',
    'graphite_trivia_sheet',
    'spotlight_comedy_brick',
    'balloon_kids_free',
    'hot_sauce_challenge'
);

ALTER TABLE creative_prompt_themes
    ALTER COLUMN category SET NOT NULL;

-- ============================================================================
-- End of Migration
-- ============================================================================




-- ============================================================================
-- FILE: 20251122236000_image_generation_28day_and_asset_storage.sql
-- ============================================================================

-- ============================================================================
-- Migration: Image generation 28-day limit & local asset storage metadata
-- Created: 2025-11-22
-- ============================================================================

-- Extend usage limits table with 28-day creative generation counters
ALTER TABLE user_usage_limits
    ADD COLUMN IF NOT EXISTS image_generation_28day_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS image_generation_28day_reset TIMESTAMPTZ NOT NULL DEFAULT get_next_28day_reset();

UPDATE user_usage_limits
SET image_generation_28day_reset = COALESCE(image_generation_28day_reset, get_next_28day_reset());

-- Track original CDN URLs and storage paths for generated assets
ALTER TABLE creative_generation_assets
    ADD COLUMN IF NOT EXISTS source_asset_url TEXT,
    ADD COLUMN IF NOT EXISTS source_preview_url TEXT,
    ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Recreate initialize_usage_limits to seed new columns
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
        image_generation_28day_reset
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
        get_next_28day_reset()
    )
    ON CONFLICT (account_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate check_usage_limit with 28-day creative enforcement
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
            IF v_usage_record.image_generation_28day_count < 1 THEN
                RETURN QUERY SELECT TRUE, v_usage_record.image_generation_28day_count, 1,
                    v_usage_record.image_generation_28day_reset,
                    'Creative generation available (1 per 28 days)'::TEXT;
            ELSE
                RETURN QUERY SELECT FALSE, v_usage_record.image_generation_28day_count, 1,
                    v_usage_record.image_generation_28day_reset,
                    '28-day creative limit (1) exhausted'::TEXT;
            END IF;

        ELSE
            RETURN QUERY SELECT FALSE, 0, 0, NOW(), 'Unknown operation type'::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate increment_usage to update 28-day counter
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
            UPDATE user_usage_limits
            SET weekly_image_generations = weekly_image_generations + 1,
                image_generation_28day_count = image_generation_28day_count + 1
            WHERE user_id = p_user_id
              AND account_id = v_account_id;

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




-- ============================================================================
-- FILE: 20251122237000_premium_image_generation_limit.sql
-- ============================================================================

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




-- ============================================================================
-- FILE: 20251123000000_add_smart_defaults_to_templates.sql
-- ============================================================================

-- Migration: Add Smart Defaults to Creative Templates
-- This adds default values and contextual default pools to ensure high-quality prompts
-- even when users leave optional fields blank.

-- ============================================================================
-- Update Bar Mirror Selfie Template with Defaults
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{defaults}',
    '{
        "scene_time": ["golden hour", "happy hour", "late evening", "midnight", "sunset", "prime time"],
        "scene_day": ["Friday", "Saturday night", "Thursday", "weekend", "Saturday", "Friday night"]
    }'::jsonb
)
WHERE slug = 'mirror_selfie_moment'
AND NOT input_schema ? 'defaults';

-- ============================================================================
-- Update Golden Hour Window Template with Defaults
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{defaults}',
    '{
        "scene_time": ["golden hour", "sunset", "late afternoon", "magic hour", "dusk"]
    }'::jsonb
)
WHERE slug = 'golden_hour_window'
AND NOT input_schema ? 'defaults';

-- ============================================================================
-- Update Custom Scene Builder Template with Defaults
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{defaults}',
    '{
        "scene_description": [
            "Vibrant restaurant interior with warm lighting and bustling atmosphere",
            "Cozy dining space with rustic wooden tables and ambient candlelight",
            "Modern bar setting with sleek surfaces and dramatic LED accents",
            "Outdoor patio scene with string lights and natural greenery",
            "Industrial-chic space with exposed brick and vintage fixtures"
        ],
        "supporting_props": ["fresh ingredients", "artisan tableware", "ambient lighting", "textured surfaces"],
        "color_palette": ["warm earth tones", "vibrant jewel tones", "cool industrial grays", "natural wood and green"],
        "texture_focus": ["rustic wood grain", "polished metal", "soft fabric", "natural stone"],
        "camera_notes": ["shallow depth of field", "eye-level perspective", "overhead flatlay", "dynamic angle"]
    }'::jsonb
)
WHERE slug = 'custom_scene_builder'
AND NOT input_schema ? 'defaults';

-- ============================================================================
-- Add Contextual Defaults to Bar & Grill Theme
-- ============================================================================
UPDATE creative_prompt_themes
SET variation_rules = jsonb_set(
    variation_rules,
    '{contextual_defaults}',
    '{
        "scene_time": {
            "high_energy": ["happy hour", "late evening", "midnight", "prime time", "Friday night"],
            "romantic": ["golden hour", "sunset", "candlelight hour", "twilight", "intimate evening"],
            "casual": ["lunch rush", "afternoon", "brunch time", "mid-morning", "early evening"],
            "default": ["golden hour", "evening", "happy hour", "late night", "sunset"]
        },
        "scene_day": {
            "high_energy": ["Friday", "Saturday night", "weekend", "game day", "Friday night"],
            "romantic": ["date night", "Saturday evening", "Friday evening", "Valentine''s Day", "anniversary"],
            "casual": ["Tuesday", "Wednesday", "weekday", "Monday", "Thursday"],
            "default": ["Friday", "Saturday", "weekend", "Thursday", "Saturday night"]
        },
        "scene_description": {
            "high_energy": [
                "Packed bar with energetic crowd and pulsing neon lights",
                "Bustling sports bar atmosphere with multiple screens and cheering patrons",
                "Lively nightlife scene with DJ booth and dance floor energy"
            ],
            "romantic": [
                "Intimate corner booth with soft candlelight and elegant table setting",
                "Cozy two-top table with ambient lighting and romantic atmosphere",
                "Secluded patio seating with string lights and private ambiance"
            ],
            "casual": [
                "Relaxed dining area with comfortable seating and friendly vibe",
                "Casual bar setting with communal tables and welcoming atmosphere",
                "Laid-back patio space with picnic tables and outdoor charm"
            ],
            "default": [
                "Vibrant bar interior with warm lighting and social atmosphere",
                "Modern restaurant space with inviting ambiance and stylish decor",
                "Dynamic dining environment with energetic yet comfortable vibe"
            ]
        }
    }'::jsonb
)
WHERE theme_slug = 'bar_grill_mirror_selfie'
AND NOT variation_rules ? 'contextual_defaults';

-- ============================================================================
-- Add Contextual Defaults to Social Proof Theme
-- ============================================================================
UPDATE creative_prompt_themes
SET variation_rules = jsonb_set(
    variation_rules,
    '{contextual_defaults}',
    '{
        "scene_time": {
            "high_energy": ["peak dinner rush", "bustling evening", "prime time", "Saturday night"],
            "romantic": ["intimate dinner hour", "candlelit evening", "romantic sunset"],
            "casual": ["casual lunch", "afternoon gathering", "brunch time"],
            "default": ["dinner service", "evening atmosphere", "peak hours"]
        },
        "scene_description": {
            "high_energy": [
                "Crowded restaurant with every table full and vibrant energy",
                "Packed dining room with servers weaving through happy guests",
                "Bustling scene with laughter and clinking glasses filling the air"
            ],
            "romantic": [
                "Intimate table setting with rose petals and soft lighting",
                "Romantic corner with elegant presentation and private ambiance",
                "Cozy booth with champagne glasses and anniversary celebration"
            ],
            "casual": [
                "Friendly neighborhood spot with regulars chatting at the bar",
                "Relaxed dining scene with families and friends enjoying meals",
                "Comfortable atmosphere with casual elegance and warm hospitality"
            ],
            "default": [
                "Welcoming restaurant interior with satisfied diners and attentive service",
                "Inviting dining space showcasing happy customers and quality food",
                "Authentic restaurant moment capturing genuine guest satisfaction"
            ]
        }
    }'::jsonb
)
WHERE theme_slug LIKE 'social_proof%'
AND NOT variation_rules ? 'contextual_defaults';

-- ============================================================================
-- Add Contextual Defaults to Winter Theme
-- ============================================================================
UPDATE creative_prompt_themes
SET variation_rules = jsonb_set(
    variation_rules,
    '{contextual_defaults}',
    '{
        "scene_time": {
            "high_energy": ["aprÃ¨s-ski hour", "winter evening", "holiday party time"],
            "romantic": ["cozy winter evening", "fireside hour", "snowy twilight"],
            "casual": ["winter afternoon", "snow day lunch", "cozy morning"],
            "default": ["winter evening", "snowy afternoon", "cozy hour"]
        },
        "scene_description": {
            "high_energy": [
                "Festive winter scene with holiday lights and celebratory atmosphere",
                "Snowy outdoor setting with fire pit and gathering crowd",
                "Winter wonderland with twinkling lights and seasonal cheer"
            ],
            "romantic": [
                "Intimate fireside setting with plush blankets and warm glow",
                "Cozy corner with snow falling outside and candlelight within",
                "Romantic winter scene with hot cocoa and soft lighting"
            ],
            "casual": [
                "Comfortable winter retreat with rustic charm and warm hospitality",
                "Casual snow day gathering with comfort food and friendly faces",
                "Relaxed winter atmosphere with seasonal touches and cozy vibes"
            ],
            "default": [
                "Inviting winter scene with seasonal decor and warm ambiance",
                "Charming cold-weather setting with comfort and style",
                "Cozy winter environment with festive touches and welcoming atmosphere"
            ]
        }
    }'::jsonb
)
WHERE theme_slug LIKE 'winter%'
AND NOT variation_rules ? 'contextual_defaults';

-- ============================================================================
-- Add Context Rules to Input Schemas (for documentation)
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{context_rules}',
    '{
        "scene_time": {
            "description": "Time of day that sets lighting and atmosphere",
            "quality_requirement": "Must specify lighting conditions for photorealistic rendering",
            "examples": ["golden hour", "happy hour", "midnight", "sunset"]
        },
        "scene_day": {
            "description": "Day of week that influences crowd energy and social context",
            "quality_requirement": "Must convey temporal context and vibe",
            "examples": ["Friday", "Saturday night", "date night", "game day"]
        },
        "scene_description": {
            "description": "Detailed scene setting that establishes environment and mood",
            "quality_requirement": "Must provide rich visual context for AI generation",
            "examples": ["Vibrant bar interior with warm lighting", "Cozy patio with string lights"]
        }
    }'::jsonb
)
WHERE input_schema ? 'optional'
AND NOT input_schema ? 'context_rules';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the migration worked:
-- SELECT 
--     slug, 
--     input_schema->'defaults' as defaults,
--     input_schema->'context_rules' as context_rules
-- FROM creative_prompt_templates
-- WHERE input_schema ? 'defaults';

-- SELECT 
--     theme_slug,
--     variation_rules->'contextual_defaults' as contextual_defaults
-- FROM creative_prompt_themes
-- WHERE variation_rules ? 'contextual_defaults';



-- ============================================================================
-- FILE: 20251123093000_fix_usage_limit_timestamp_cast.sql
-- ============================================================================

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




-- ============================================================================
-- FILE: 20251123140000_add_brand_profile_phase1_fields.sql
-- ============================================================================

-- Migration: Add Phase 1 Brand Profile Fields
-- Description: Adds brand voice, visual style, cuisine type, and atmosphere fields to creative_brand_profiles
-- Date: 2025-11-23

-- Add new columns to creative_brand_profiles table
ALTER TABLE creative_brand_profiles
ADD COLUMN IF NOT EXISTS brand_voice TEXT,
ADD COLUMN IF NOT EXISTS brand_tone TEXT,
ADD COLUMN IF NOT EXISTS voice_description TEXT,
ADD COLUMN IF NOT EXISTS visual_styles TEXT[], -- Array of visual style preferences
ADD COLUMN IF NOT EXISTS cuisine_type TEXT,
ADD COLUMN IF NOT EXISTS cuisine_specialties TEXT[], -- Array of specialties
ADD COLUMN IF NOT EXISTS atmosphere_tags TEXT[], -- Array of atmosphere keywords
ADD COLUMN IF NOT EXISTS target_demographic TEXT;

-- Add comments for documentation
COMMENT ON COLUMN creative_brand_profiles.brand_voice IS 'Brand voice style: casual, professional, playful, elegant, bold';
COMMENT ON COLUMN creative_brand_profiles.brand_tone IS 'Overall tone of brand communications';
COMMENT ON COLUMN creative_brand_profiles.voice_description IS 'Custom description of brand voice (e.g., "Family-friendly and warm")';
COMMENT ON COLUMN creative_brand_profiles.visual_styles IS 'Array of visual style preferences: rustic, modern, minimalist, vibrant, dark_moody';
COMMENT ON COLUMN creative_brand_profiles.cuisine_type IS 'Primary cuisine type: italian, mexican, asian_fusion, american, etc.';
COMMENT ON COLUMN creative_brand_profiles.cuisine_specialties IS 'Array of specialty items or dietary focuses';
COMMENT ON COLUMN creative_brand_profiles.atmosphere_tags IS 'Array of atmosphere keywords: cozy, industrial, beachy, urban, rustic, modern';
COMMENT ON COLUMN creative_brand_profiles.target_demographic IS 'Primary target audience: families, young_professionals, date_night, lunch_crowd';

-- Create index for faster queries on cuisine_type (commonly filtered)
CREATE INDEX IF NOT EXISTS idx_brand_profiles_cuisine_type ON creative_brand_profiles(cuisine_type);

-- Update existing records to have empty arrays where NULL
UPDATE creative_brand_profiles
SET 
    visual_styles = COALESCE(visual_styles, ARRAY[]::TEXT[]),
    cuisine_specialties = COALESCE(cuisine_specialties, ARRAY[]::TEXT[]),
    atmosphere_tags = COALESCE(atmosphere_tags, ARRAY[]::TEXT[])
WHERE visual_styles IS NULL OR cuisine_specialties IS NULL OR atmosphere_tags IS NULL;



-- ============================================================================
-- FILE: 20251123150000_add_brand_profile_phase2_fields.sql
-- ============================================================================

-- Migration: Add Phase 2 Brand Profile Fields
-- Description: Adds logo, prohibited elements, and social media preferences to creative_brand_profiles
-- Date: 2025-11-23
-- Status: READY TO RUN (when Phase 2 is implemented)

-- Add Phase 2 columns to creative_brand_profiles table
ALTER TABLE creative_brand_profiles
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_placement TEXT DEFAULT 'top_left',
ADD COLUMN IF NOT EXISTS logo_watermark_style TEXT DEFAULT 'subtle',
ADD COLUMN IF NOT EXISTS prohibited_elements TEXT[], -- Array of elements to avoid
ADD COLUMN IF NOT EXISTS allergen_warnings TEXT[], -- Array of allergen warnings to include
ADD COLUMN IF NOT EXISTS cultural_sensitivities TEXT[], -- Array of cultural/religious considerations
ADD COLUMN IF NOT EXISTS primary_social_platforms TEXT[], -- Array: instagram, facebook, tiktok, twitter
ADD COLUMN IF NOT EXISTS preferred_aspect_ratios TEXT[], -- Array: square, portrait, landscape
ADD COLUMN IF NOT EXISTS brand_hashtags TEXT[], -- Array of brand hashtags
ADD COLUMN IF NOT EXISTS social_media_handle TEXT; -- Primary social media handle

-- Add comments for documentation
COMMENT ON COLUMN creative_brand_profiles.logo_url IS 'URL to uploaded logo file in storage';
COMMENT ON COLUMN creative_brand_profiles.logo_placement IS 'Logo placement preference: top_left, top_right, center, bottom_left, bottom_right, none';
COMMENT ON COLUMN creative_brand_profiles.logo_watermark_style IS 'Watermark style: subtle, prominent, none';
COMMENT ON COLUMN creative_brand_profiles.prohibited_elements IS 'Elements to avoid in generated images (e.g., alcohol, meat, specific colors)';
COMMENT ON COLUMN creative_brand_profiles.allergen_warnings IS 'Allergen warnings that must be included';
COMMENT ON COLUMN creative_brand_profiles.cultural_sensitivities IS 'Cultural or religious sensitivities to respect';
COMMENT ON COLUMN creative_brand_profiles.primary_social_platforms IS 'Primary social media platforms: instagram, facebook, tiktok, twitter, linkedin';
COMMENT ON COLUMN creative_brand_profiles.preferred_aspect_ratios IS 'Preferred aspect ratios: square (1:1), portrait (4:5, 9:16), landscape (16:9)';
COMMENT ON COLUMN creative_brand_profiles.brand_hashtags IS 'Brand hashtags to include in social posts';
COMMENT ON COLUMN creative_brand_profiles.social_media_handle IS 'Primary social media handle (e.g., @restaurantname)';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_brand_profiles_logo_url ON creative_brand_profiles(logo_url) WHERE logo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brand_profiles_social_platforms ON creative_brand_profiles USING GIN(primary_social_platforms);

-- Update existing records to have empty arrays where NULL
UPDATE creative_brand_profiles
SET 
    prohibited_elements = COALESCE(prohibited_elements, ARRAY[]::TEXT[]),
    allergen_warnings = COALESCE(allergen_warnings, ARRAY[]::TEXT[]),
    cultural_sensitivities = COALESCE(cultural_sensitivities, ARRAY[]::TEXT[]),
    primary_social_platforms = COALESCE(primary_social_platforms, ARRAY[]::TEXT[]),
    preferred_aspect_ratios = COALESCE(preferred_aspect_ratios, ARRAY[]::TEXT[]),
    brand_hashtags = COALESCE(brand_hashtags, ARRAY[]::TEXT[])
WHERE 
    prohibited_elements IS NULL OR 
    allergen_warnings IS NULL OR 
    cultural_sensitivities IS NULL OR
    primary_social_platforms IS NULL OR
    preferred_aspect_ratios IS NULL OR
    brand_hashtags IS NULL;

-- Add check constraint for logo_placement
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_logo_placement 
CHECK (logo_placement IN ('top_left', 'top_right', 'center', 'bottom_left', 'bottom_right', 'none'));

-- Add check constraint for logo_watermark_style
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_watermark_style 
CHECK (logo_watermark_style IN ('subtle', 'prominent', 'none'));



-- ============================================================================
-- FILE: 20251123160000_add_brand_profile_phase3_fields.sql
-- ============================================================================

-- Migration: Add Phase 3 Brand Profile Fields
-- Description: Adds seasonal automation, location context, and price positioning to creative_brand_profiles
-- Date: 2025-11-23
-- Status: READY TO RUN (when Phase 3 is implemented)

-- Add Phase 3 columns to creative_brand_profiles table
ALTER TABLE creative_brand_profiles
ADD COLUMN IF NOT EXISTS active_seasons TEXT[], -- Array: spring, summer, fall, winter
ADD COLUMN IF NOT EXISTS recurring_events JSONB DEFAULT '[]'::jsonb, -- Array of {name, day_of_week, description}
ADD COLUMN IF NOT EXISTS holiday_participation TEXT[], -- Array: christmas, valentines, halloween, etc.
ADD COLUMN IF NOT EXISTS seasonal_menu_rotation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_type TEXT, -- urban, suburban, beach, mountain, rural
ADD COLUMN IF NOT EXISTS regional_style TEXT, -- southern, new_england, southwest, pacific_northwest, midwest, etc.
ADD COLUMN IF NOT EXISTS local_landmarks TEXT, -- Free text: "Near the waterfront", "Downtown historic district"
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS price_range TEXT, -- $, $$, $$$, $$$$
ADD COLUMN IF NOT EXISTS value_proposition TEXT, -- best_value, premium_ingredients, quick_affordable, fine_dining
ADD COLUMN IF NOT EXISTS average_check_size DECIMAL(10,2), -- Average ticket price
ADD COLUMN IF NOT EXISTS positioning_statement TEXT; -- Free text positioning statement

-- Add comments for documentation
COMMENT ON COLUMN creative_brand_profiles.active_seasons IS 'Seasons when restaurant is most active or has special offerings';
COMMENT ON COLUMN creative_brand_profiles.recurring_events IS 'JSON array of recurring events: [{name: "Taco Tuesday", day: "tuesday", description: "Half-price tacos"}]';
COMMENT ON COLUMN creative_brand_profiles.holiday_participation IS 'Holidays the restaurant celebrates: christmas, valentines, halloween, thanksgiving, etc.';
COMMENT ON COLUMN creative_brand_profiles.seasonal_menu_rotation IS 'Whether restaurant rotates menu seasonally';
COMMENT ON COLUMN creative_brand_profiles.location_type IS 'Type of location: urban, suburban, beach, mountain, rural';
COMMENT ON COLUMN creative_brand_profiles.regional_style IS 'Regional culinary style: southern, new_england, southwest, pacific_northwest, midwest, cajun, tex_mex';
COMMENT ON COLUMN creative_brand_profiles.local_landmarks IS 'Notable local landmarks or location description';
COMMENT ON COLUMN creative_brand_profiles.city IS 'City where restaurant is located';
COMMENT ON COLUMN creative_brand_profiles.state IS 'State/province where restaurant is located';
COMMENT ON COLUMN creative_brand_profiles.country IS 'Country where restaurant is located';
COMMENT ON COLUMN creative_brand_profiles.price_range IS 'Price range indicator: $, $$, $$$, $$$$';
COMMENT ON COLUMN creative_brand_profiles.value_proposition IS 'Value positioning: best_value, premium_ingredients, quick_affordable, fine_dining, family_friendly';
COMMENT ON COLUMN creative_brand_profiles.average_check_size IS 'Average check size per person in local currency';
COMMENT ON COLUMN creative_brand_profiles.positioning_statement IS 'Brand positioning statement (e.g., "Farm-to-table dining in the heart of downtown")';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_brand_profiles_location_type ON creative_brand_profiles(location_type);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_price_range ON creative_brand_profiles(price_range);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_city_state ON creative_brand_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_holidays ON creative_brand_profiles USING GIN(holiday_participation);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_recurring_events ON creative_brand_profiles USING GIN(recurring_events);

-- Update existing records to have empty arrays where NULL
UPDATE creative_brand_profiles
SET 
    active_seasons = COALESCE(active_seasons, ARRAY[]::TEXT[]),
    holiday_participation = COALESCE(holiday_participation, ARRAY[]::TEXT[]),
    recurring_events = COALESCE(recurring_events, '[]'::jsonb)
WHERE 
    active_seasons IS NULL OR 
    holiday_participation IS NULL OR 
    recurring_events IS NULL;

-- Add check constraint for location_type
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_location_type 
CHECK (location_type IN ('urban', 'suburban', 'beach', 'mountain', 'rural', NULL));

-- Add check constraint for price_range
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_price_range 
CHECK (price_range IN ('$', '$$', '$$$', '$$$$', NULL));

-- Add check constraint for regional_style
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_regional_style 
CHECK (regional_style IN (
    'southern', 'new_england', 'southwest', 'pacific_northwest', 'midwest', 
    'cajun', 'tex_mex', 'california', 'new_york', 'chicago', NULL
));

-- Add check constraint for value_proposition
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_value_proposition 
CHECK (value_proposition IN (
    'best_value', 'premium_ingredients', 'quick_affordable', 
    'fine_dining', 'family_friendly', 'casual_dining', NULL
));

-- Create a helper function to get current season-appropriate templates
CREATE OR REPLACE FUNCTION get_current_season() RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (12, 1, 2) THEN 'winter'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (3, 4, 5) THEN 'spring'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (6, 7, 8) THEN 'summer'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (9, 10, 11) THEN 'fall'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_current_season() IS 'Returns the current season based on the current date';

-- Create a helper function to check if a holiday is upcoming (within 2 weeks)
CREATE OR REPLACE FUNCTION get_upcoming_holidays() RETURNS TEXT[] AS $$
DECLARE
    current_month INT;
    current_day INT;
    holidays TEXT[] := ARRAY[]::TEXT[];
BEGIN
    current_month := EXTRACT(MONTH FROM CURRENT_DATE);
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    
    -- Check for holidays within 2 weeks
    IF current_month = 12 AND current_day >= 11 THEN holidays := array_append(holidays, 'christmas'); END IF;
    IF current_month = 2 AND current_day >= 1 AND current_day <= 14 THEN holidays := array_append(holidays, 'valentines'); END IF;
    IF current_month = 3 AND current_day >= 3 AND current_day <= 17 THEN holidays := array_append(holidays, 'st_patricks'); END IF;
    IF current_month = 10 AND current_day >= 17 THEN holidays := array_append(holidays, 'halloween'); END IF;
    IF current_month = 11 AND current_day >= 11 AND current_day <= 28 THEN holidays := array_append(holidays, 'thanksgiving'); END IF;
    IF current_month = 7 AND current_day >= 1 AND current_day <= 4 THEN holidays := array_append(holidays, 'independence_day'); END IF;
    IF current_month = 5 AND current_day >= 1 AND current_day <= 14 THEN holidays := array_append(holidays, 'mothers_day'); END IF;
    IF current_month = 6 AND current_day >= 8 AND current_day <= 21 THEN holidays := array_append(holidays, 'fathers_day'); END IF;
    
    RETURN holidays;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_upcoming_holidays() IS 'Returns array of holidays that are upcoming within 2 weeks';




COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after the migration)
-- ============================================================================

-- 1. Check all creative tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'creative_%' 
ORDER BY table_name;
-- Expected: 7 tables

-- 2. Check theme count
SELECT COUNT(*) as theme_count FROM creative_prompt_themes;
-- Expected: ~40+ themes

-- 3. Check template count  
SELECT COUNT(*) as template_count FROM creative_prompt_templates;
-- Expected: ~40+ templates

-- 4. Check brand profile table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'creative_brand_profiles' 
ORDER BY ordinal_position;

-- 5. Check usage limits updated
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_usage_limits' 
  AND column_name = 'weekly_image_generations';
-- Expected: 1 row

-- ============================================================================
-- SUCCESS! Your creative module is ready to use.
-- Next steps:
--   1. Create Supabase Storage bucket: 'creative-assets' (public)
--   2. Push code to production
--   3. Rebuild Docker containers
--   4. Test generation at /creative/generate
-- ============================================================================