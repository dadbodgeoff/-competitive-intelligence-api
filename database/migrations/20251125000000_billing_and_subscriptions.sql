-- ============================================================================
-- MIGRATION: Billing & Subscriptions Foundation
-- ============================================================================
-- Description: Complete billing infrastructure for Stripe integration
-- Author: RestaurantIQ
-- Date: 2025-11-25
-- Dependencies: users table, user_usage_limits table
-- ============================================================================

-- ============================================================================
-- 1. ADD STRIPE CUSTOMER ID TO USERS TABLE
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID (cus_xxx) - created on first checkout';

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Stripe IDs
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_price_id VARCHAR(255) NOT NULL,
    
    -- Subscription details
    status VARCHAR(50) NOT NULL DEFAULT 'incomplete',
    -- Possible statuses: incomplete, incomplete_expired, trialing, active, 
    -- past_due, canceled, unpaid, paused
    
    -- Plan info
    plan_name VARCHAR(100) NOT NULL, -- 'premium', 'enterprise'
    plan_interval VARCHAR(20) NOT NULL DEFAULT 'month', -- 'month', 'year'
    
    -- Billing period
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Trial info (if applicable)
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation info
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN (
        'incomplete', 'incomplete_expired', 'trialing', 'active', 
        'past_due', 'canceled', 'unpaid', 'paused'
    )),
    CONSTRAINT valid_plan CHECK (plan_name IN ('premium', 'enterprise')),
    CONSTRAINT valid_interval CHECK (plan_interval IN ('month', 'year'))
);

COMMENT ON TABLE subscriptions IS 'Stripe subscription records synced via webhooks';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================================================
-- 3. PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Stripe IDs
    stripe_invoice_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Payment details
    amount_cents INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Possible statuses: pending, succeeded, failed, refunded, partially_refunded
    
    -- Invoice details
    invoice_number VARCHAR(100),
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    
    -- Description
    description TEXT,
    
    -- Failure info (if applicable)
    failure_code VARCHAR(100),
    failure_message TEXT,
    
    -- Refund info (if applicable)
    refunded_amount_cents INTEGER DEFAULT 0,
    refund_reason TEXT,
    
    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_payment_status CHECK (status IN (
        'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
    ))
);

COMMENT ON TABLE payment_history IS 'Record of all payments and invoices from Stripe';

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history(created_at DESC);

-- ============================================================================
-- 4. STRIPE WEBHOOK EVENTS LOG (Idempotency)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE stripe_webhook_events IS 'Log of Stripe webhook events for idempotency and debugging';

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_webhook_events(processed);

-- ============================================================================
-- 5. EMAIL LOG TABLE (For SendGrid tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Email details
    email_type VARCHAR(100) NOT NULL,
    -- Types: welcome, upgrade_confirmation, usage_warning, payment_receipt,
    -- payment_failed, subscription_canceled, subscription_renewed
    
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    
    -- SendGrid tracking
    sendgrid_message_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Possible: pending, sent, delivered, opened, clicked, bounced, failed
    
    -- Error info
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_email_status CHECK (status IN (
        'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    ))
);

COMMENT ON TABLE email_log IS 'Track all transactional emails sent via SendGrid';

CREATE INDEX IF NOT EXISTS idx_email_log_user_id ON email_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);

-- ============================================================================
-- 6. PRICING PLANS TABLE (Reference data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan identification
    plan_slug VARCHAR(50) UNIQUE NOT NULL, -- 'premium_monthly', 'premium_yearly', etc.
    plan_name VARCHAR(100) NOT NULL, -- 'Premium', 'Enterprise'
    tier VARCHAR(50) NOT NULL, -- Maps to subscription_tier: 'premium', 'enterprise'
    
    -- Stripe Price ID (you'll update these after creating products in Stripe)
    stripe_price_id VARCHAR(255),
    
    -- Pricing
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    interval VARCHAR(20) NOT NULL, -- 'month', 'year'
    interval_count INTEGER NOT NULL DEFAULT 1,
    
    -- Display info
    description TEXT,
    features JSONB DEFAULT '[]', -- Array of feature strings
    
    -- Limits (what this plan provides)
    limits JSONB DEFAULT '{}',
    -- Example: {"invoice_uploads": -1, "image_generations": 50, "analyses": -1}
    -- -1 means unlimited
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Show as "Most Popular"
    
    -- Ordering
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_tier CHECK (tier IN ('free', 'premium', 'enterprise')),
    CONSTRAINT valid_plan_interval CHECK (interval IN ('month', 'year'))
);

COMMENT ON TABLE pricing_plans IS 'Reference table for available pricing plans';

-- Insert default plans (update stripe_price_id after creating in Stripe dashboard)
INSERT INTO pricing_plans (plan_slug, plan_name, tier, amount_cents, currency, interval, description, features, limits, is_active, is_featured, display_order)
VALUES 
    ('free', 'Free', 'free', 0, 'usd', 'month', 
     'Perfect for trying out RestaurantIQ',
     '["1 invoice upload per week", "2 bonus uploads every 28 days", "5 AI image generations/month", "Basic analytics", "Email support"]'::jsonb,
     '{"invoice_uploads_weekly": 1, "bonus_uploads_28day": 2, "image_generations_monthly": 5}'::jsonb,
     TRUE, FALSE, 0),
     
    ('premium_monthly', 'Premium', 'premium', 9900, 'usd', 'month',
     'For serious operators who want unlimited access',
     '["Unlimited invoice uploads", "Unlimited menu comparisons", "50 AI image generations/month", "Unlimited competitor analyses", "Priority support", "Data export"]'::jsonb,
     '{"invoice_uploads_weekly": -1, "image_generations_monthly": 50, "analyses": -1}'::jsonb,
     TRUE, TRUE, 1),
     
    ('premium_yearly', 'Premium (Annual)', 'premium', 95000, 'usd', 'year',
     'Save 20% with annual billing',
     '["Everything in Premium", "2 months free", "Annual billing"]'::jsonb,
     '{"invoice_uploads_weekly": -1, "image_generations_monthly": 50, "analyses": -1}'::jsonb,
     TRUE, FALSE, 2),
     
    ('enterprise_monthly', 'Enterprise', 'enterprise', 29900, 'usd', 'month',
     'For multi-unit operators and groups',
     '["Everything in Premium", "Unlimited AI generations", "Team permissions", "Dedicated onboarding", "API access", "Custom integrations"]'::jsonb,
     '{"invoice_uploads_weekly": -1, "image_generations_monthly": -1, "analyses": -1, "team_members": -1}'::jsonb,
     TRUE, FALSE, 3)
ON CONFLICT (plan_slug) DO NOTHING;

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can view their own, service role can manage all
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages subscriptions" ON subscriptions;
CREATE POLICY "Service role manages subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Payment history: Users can view their own
DROP POLICY IF EXISTS "Users can view own payments" ON payment_history;
CREATE POLICY "Users can view own payments" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages payments" ON payment_history;
CREATE POLICY "Service role manages payments" ON payment_history
    FOR ALL USING (auth.role() = 'service_role');

-- Webhook events: Service role only
DROP POLICY IF EXISTS "Service role manages webhook events" ON stripe_webhook_events;
CREATE POLICY "Service role manages webhook events" ON stripe_webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- Email log: Users can view their own
DROP POLICY IF EXISTS "Users can view own emails" ON email_log;
CREATE POLICY "Users can view own emails" ON email_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages email log" ON email_log;
CREATE POLICY "Service role manages email log" ON email_log
    FOR ALL USING (auth.role() = 'service_role');

-- Pricing plans: Everyone can read active plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON pricing_plans;
CREATE POLICY "Anyone can view active plans" ON pricing_plans
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Service role manages plans" ON pricing_plans;
CREATE POLICY "Service role manages plans" ON pricing_plans
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 8. FUNCTIONS
-- ============================================================================

-- Function to sync subscription status to user's subscription_tier
CREATE OR REPLACE FUNCTION sync_user_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- When subscription becomes active, upgrade user
    IF NEW.status = 'active' THEN
        UPDATE users 
        SET subscription_tier = NEW.plan_name,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    
    -- When subscription is canceled/expired, downgrade to free
    ELSIF NEW.status IN ('canceled', 'unpaid', 'incomplete_expired') THEN
        -- Only downgrade if this was their active subscription
        IF NOT EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE user_id = NEW.user_id 
            AND status = 'active' 
            AND id != NEW.id
        ) THEN
            UPDATE users 
            SET subscription_tier = 'free',
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync tier
DROP TRIGGER IF EXISTS sync_subscription_tier_trigger ON subscriptions;
CREATE TRIGGER sync_subscription_tier_trigger
    AFTER INSERT OR UPDATE OF status ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_subscription_tier();

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_name VARCHAR,
    status VARCHAR,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN,
    stripe_subscription_id VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_name,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end,
        s.stripe_subscription_id
    FROM subscriptions s
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing', 'past_due')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if webhook event was already processed (idempotency)
CREATE OR REPLACE FUNCTION check_webhook_processed(p_event_id VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_processed BOOLEAN;
BEGIN
    SELECT processed INTO v_processed
    FROM stripe_webhook_events
    WHERE stripe_event_id = p_event_id;
    
    RETURN COALESCE(v_processed, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 10. VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Verify tables
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('subscriptions', 'payment_history', 'stripe_webhook_events', 'email_log', 'pricing_plans')) = 5,
           'Not all billing tables were created';
    
    RAISE NOTICE '✅ All 5 billing tables created successfully';
    
    -- Verify stripe_customer_id column on users
    ASSERT (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'stripe_customer_id') = 1,
           'stripe_customer_id column not added to users';
    
    RAISE NOTICE '✅ stripe_customer_id added to users table';
    
    -- Verify pricing plans seeded
    ASSERT (SELECT COUNT(*) FROM pricing_plans) >= 4,
           'Pricing plans not seeded';
    
    RAISE NOTICE '✅ Pricing plans seeded';
    
    -- Verify RLS enabled
    ASSERT (SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('subscriptions', 'payment_history', 'stripe_webhook_events', 'email_log', 'pricing_plans')
            AND rowsecurity = true) = 5,
           'RLS not enabled on all billing tables';
    
    RAISE NOTICE '✅ RLS enabled on all billing tables';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'BILLING MIGRATION COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tables created: subscriptions, payment_history, stripe_webhook_events, email_log, pricing_plans';
    RAISE NOTICE 'Column added: users.stripe_customer_id';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Create products/prices in Stripe Dashboard';
    RAISE NOTICE '2. Update pricing_plans.stripe_price_id with real Stripe Price IDs';
    RAISE NOTICE '3. Add STRIPE_* and SENDGRID_API_KEY to environment';
    RAISE NOTICE '4. Deploy stripe_service.py and email_service.py';
    RAISE NOTICE '============================================';
END $$;
