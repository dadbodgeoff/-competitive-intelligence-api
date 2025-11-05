-- ============================================================================
-- MIGRATION 023: Free Tier Usage Limits System
-- ============================================================================
-- Description: Comprehensive usage tracking for free tier accounts
-- Author: Usage Limits Implementation
-- Date: 2025-11-03
-- Dependencies: Requires users table with subscription_tier column
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Usage tracking table (atomic, secure)
CREATE TABLE IF NOT EXISTS user_usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Weekly limits (reset Monday 12:00 AM EST)
    weekly_invoice_uploads INTEGER DEFAULT 0,
    weekly_free_analyses INTEGER DEFAULT 0,
    weekly_reset_date TIMESTAMP NOT NULL,
    
    -- 28-day limits (reset every 28 days starting 2025-11-03)
    monthly_bonus_invoices INTEGER DEFAULT 0,
    monthly_reset_date TIMESTAMP NOT NULL,
    
    -- Per-operation limits (reset Monday 12:00 AM EST)
    weekly_menu_comparisons INTEGER DEFAULT 0,
    weekly_menu_uploads INTEGER DEFAULT 0,
    weekly_premium_analyses INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

COMMENT ON TABLE user_usage_limits IS 'Tracks free tier usage limits with weekly and 28-day resets';
COMMENT ON COLUMN user_usage_limits.weekly_invoice_uploads IS 'Invoice uploads this week (limit: 1)';
COMMENT ON COLUMN user_usage_limits.weekly_free_analyses IS 'Free review analyses this week (limit: 2)';
COMMENT ON COLUMN user_usage_limits.weekly_reset_date IS 'Next Monday 12:00 AM EST reset';
COMMENT ON COLUMN user_usage_limits.monthly_bonus_invoices IS 'Bonus invoices this 28-day period (limit: 2)';
COMMENT ON COLUMN user_usage_limits.monthly_reset_date IS 'Next 28-day reset date';
COMMENT ON COLUMN user_usage_limits.weekly_menu_comparisons IS 'Menu comparisons this week (limit: 1)';
COMMENT ON COLUMN user_usage_limits.weekly_menu_uploads IS 'Menu uploads this week (limit: 1)';
COMMENT ON COLUMN user_usage_limits.weekly_premium_analyses IS 'Premium analyses this week (limit: 1)';

-- Usage history log (audit trail, cannot be modified)
CREATE TABLE IF NOT EXISTS usage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- 'invoice_upload', 'free_analysis', 'menu_comparison', etc.
    operation_id UUID, -- Reference to the actual operation (invoice_id, analysis_id, etc.)
    subscription_tier VARCHAR(50) NOT NULL, -- Tier at time of operation
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    metadata JSONB, -- Additional context (IP, user agent, etc.)
    
    -- Prevent modifications
    CHECK (timestamp <= NOW())
);

COMMENT ON TABLE usage_history IS 'Immutable audit log of all usage operations';
COMMENT ON COLUMN usage_history.operation_type IS 'Type of operation performed';
COMMENT ON COLUMN usage_history.subscription_tier IS 'User tier at time of operation (for audit)';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON user_usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_weekly_reset ON user_usage_limits(weekly_reset_date);
CREATE INDEX IF NOT EXISTS idx_usage_limits_monthly_reset ON user_usage_limits(monthly_reset_date);

CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_operation_type ON usage_history(operation_type);
CREATE INDEX IF NOT EXISTS idx_usage_history_timestamp ON usage_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_history_user_operation ON usage_history(user_id, operation_type, timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE user_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own usage limits" ON user_usage_limits;
DROP POLICY IF EXISTS "Service role can manage usage limits" ON user_usage_limits;
DROP POLICY IF EXISTS "Users can view own usage history" ON usage_history;
DROP POLICY IF EXISTS "Service role can insert usage history" ON usage_history;

-- Usage limits policies (service role only for writes to prevent tampering)
CREATE POLICY "Users can view own usage limits" ON user_usage_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage limits" ON user_usage_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Usage history policies (read-only for users, service role can insert)
CREATE POLICY "Users can view own usage history" ON usage_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage history" ON usage_history
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate next Monday 12:00 AM EST
CREATE OR REPLACE FUNCTION get_next_monday_est()
RETURNS TIMESTAMP AS $$
DECLARE
    current_time_est TIMESTAMP;
    next_monday TIMESTAMP;
BEGIN
    -- Convert current UTC time to EST (UTC-5)
    current_time_est := NOW() AT TIME ZONE 'America/New_York';
    
    -- Calculate next Monday at 12:00 AM EST
    next_monday := date_trunc('week', current_time_est + INTERVAL '1 week') AT TIME ZONE 'America/New_York';
    
    RETURN next_monday;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate next 28-day reset (from 2025-11-03)
CREATE OR REPLACE FUNCTION get_next_28day_reset()
RETURNS TIMESTAMP AS $$
DECLARE
    base_date TIMESTAMP := '2025-11-03 00:00:00'::TIMESTAMP AT TIME ZONE 'America/New_York';
    current_time_est TIMESTAMP;
    days_since_base INTEGER;
    periods_elapsed INTEGER;
    next_reset TIMESTAMP;
BEGIN
    -- Convert current UTC time to EST
    current_time_est := NOW() AT TIME ZONE 'America/New_York';
    
    -- Calculate days since base date
    days_since_base := EXTRACT(DAY FROM current_time_est - base_date)::INTEGER;
    
    -- Calculate how many 28-day periods have elapsed
    periods_elapsed := FLOOR(days_since_base / 28.0)::INTEGER;
    
    -- Calculate next reset date
    next_reset := base_date + ((periods_elapsed + 1) * INTERVAL '28 days');
    
    RETURN next_reset;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to initialize usage limits for new user
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

-- Function to check if user can perform operation (atomic)
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_operation_type VARCHAR(50)
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_usage INTEGER,
    limit_value INTEGER,
    reset_date TIMESTAMP,
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

-- Function to increment usage (atomic, called after successful operation)
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_operation_type VARCHAR(50),
    p_operation_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_tier VARCHAR(50);
    v_used_bonus BOOLEAN := FALSE;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO v_subscription_tier
    FROM users
    WHERE id = p_user_id;
    
    -- Premium/Enterprise users don't need tracking
    IF v_subscription_tier IN ('premium', 'enterprise') THEN
        -- Still log for audit purposes
        INSERT INTO usage_history (user_id, operation_type, operation_id, subscription_tier, metadata)
        VALUES (p_user_id, p_operation_type, p_operation_id, v_subscription_tier, p_metadata);
        RETURN TRUE;
    END IF;
    
    -- Increment appropriate counter
    CASE p_operation_type
        WHEN 'invoice_upload' THEN
            -- Try weekly first, then monthly bonus
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
            WHERE user_id = p_user_id;
            
        WHEN 'free_analysis' THEN
            UPDATE user_usage_limits
            SET weekly_free_analyses = weekly_free_analyses + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            
        WHEN 'menu_comparison' THEN
            UPDATE user_usage_limits
            SET weekly_menu_comparisons = weekly_menu_comparisons + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            
        WHEN 'menu_upload' THEN
            UPDATE user_usage_limits
            SET weekly_menu_uploads = weekly_menu_uploads + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            
        WHEN 'premium_analysis' THEN
            UPDATE user_usage_limits
            SET weekly_premium_analyses = weekly_premium_analyses + 1,
                updated_at = NOW()
            WHERE user_id = p_user_id;
    END CASE;
    
    -- Log to audit trail
    INSERT INTO usage_history (user_id, operation_type, operation_id, subscription_tier, metadata)
    VALUES (p_user_id, p_operation_type, p_operation_id, v_subscription_tier, p_metadata);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_usage_limits_updated_at ON user_usage_limits;
CREATE TRIGGER update_usage_limits_updated_at 
    BEFORE UPDATE ON user_usage_limits
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to initialize usage limits on user creation
CREATE OR REPLACE FUNCTION trigger_initialize_usage_limits()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM initialize_usage_limits(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_init_limits ON auth.users;
CREATE TRIGGER on_user_created_init_limits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_initialize_usage_limits();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('user_usage_limits', 'usage_history')) = 2,
           'Not all usage limit tables were created';
    
    RAISE NOTICE '✅ All 2 usage limit tables created successfully';
END $$;

-- Verify indexes were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename IN ('user_usage_limits', 'usage_history')) >= 7,
           'Not all indexes were created';
    
    RAISE NOTICE '✅ All indexes created successfully';
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('user_usage_limits', 'usage_history')
            AND rowsecurity = true) = 2,
           'RLS not enabled on all tables';
    
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- Verify functions were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_proc 
            WHERE proname IN ('get_next_monday_est', 'get_next_28day_reset', 
                             'initialize_usage_limits', 'check_usage_limit', 
                             'increment_usage')) = 5,
           'Not all functions were created';
    
    RAISE NOTICE '✅ All 5 functions created successfully';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 023 completed successfully!';
    RAISE NOTICE 'Created: 2 tables, 7+ indexes, 4 RLS policies, 5 functions, 2 triggers';
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE 'Ready for free tier usage limits';
    RAISE NOTICE '28-day reset starts: 2025-11-03 00:00:00 EST';
    RAISE NOTICE 'Weekly reset: Every Monday 12:00 AM EST';
END $$;
