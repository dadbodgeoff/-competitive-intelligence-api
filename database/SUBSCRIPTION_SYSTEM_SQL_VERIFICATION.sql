-- ============================================================================
-- SUBSCRIPTION SYSTEM - DATABASE VERIFICATION & SETUP
-- Run this in Supabase SQL Editor
-- ============================================================================

-- PART 1: VERIFY EXISTING SCHEMA
-- ============================================================================

-- Check if users table exists and has subscription_tier column
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND column_name IN ('id', 'subscription_tier', 'is_active', 'created_at', 'updated_at');

-- Check if subscription_tier index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND indexname = 'idx_users_subscription_tier';

-- Check current subscription tier values in database
SELECT 
    subscription_tier,
    COUNT(*) as user_count
FROM public.users
GROUP BY subscription_tier
ORDER BY user_count DESC;

-- PART 2: ADD MISSING COLUMNS (IF NEEDED)
-- ============================================================================

-- Add tier column to analyses table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analyses' 
        AND column_name = 'tier'
    ) THEN
        ALTER TABLE public.analyses 
        ADD COLUMN tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'enterprise'));
        
        RAISE NOTICE 'Added tier column to analyses table';
    ELSE
        RAISE NOTICE 'tier column already exists in analyses table';
    END IF;
END $$;

-- Add estimated_cost and actual_cost columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analyses' 
        AND column_name = 'estimated_cost'
    ) THEN
        ALTER TABLE public.analyses 
        ADD COLUMN estimated_cost DECIMAL(10,4) DEFAULT 0.0;
        
        RAISE NOTICE 'Added estimated_cost column to analyses table';
    ELSE
        RAISE NOTICE 'estimated_cost column already exists in analyses table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analyses' 
        AND column_name = 'actual_cost'
    ) THEN
        ALTER TABLE public.analyses 
        ADD COLUMN actual_cost DECIMAL(10,4) DEFAULT 0.0;
        
        RAISE NOTICE 'Added actual_cost column to analyses table';
    ELSE
        RAISE NOTICE 'actual_cost column already exists in analyses table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analyses' 
        AND column_name = 'insights_generated'
    ) THEN
        ALTER TABLE public.analyses 
        ADD COLUMN insights_generated INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added insights_generated column to analyses table';
    ELSE
        RAISE NOTICE 'insights_generated column already exists in analyses table';
    END IF;
END $$;

-- PART 3: CREATE NEW TABLES FOR SUBSCRIPTION MANAGEMENT
-- ============================================================================

-- Create subscription_history table for audit trail
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    previous_tier VARCHAR(50),
    new_tier VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES public.users(id),
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription_metadata table for future payment integration
CREATE TABLE IF NOT EXISTS public.subscription_metadata (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('free', 'premium', 'enterprise')),
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT false,
    payment_provider VARCHAR(50) DEFAULT 'manual',
    external_subscription_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id 
    ON public.subscription_history(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_at 
    ON public.subscription_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_metadata_tier 
    ON public.subscription_metadata(tier);

CREATE INDEX IF NOT EXISTS idx_subscription_metadata_expires_at 
    ON public.subscription_metadata(expires_at);

-- PART 4: ADD ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_metadata ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make script idempotent)
DROP POLICY IF EXISTS "Users can view own subscription history" ON public.subscription_history;
DROP POLICY IF EXISTS "Users can view own subscription metadata" ON public.subscription_metadata;

-- Users can view their own subscription history
CREATE POLICY "Users can view own subscription history" 
    ON public.subscription_history
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can view their own subscription metadata
CREATE POLICY "Users can view own subscription metadata" 
    ON public.subscription_metadata
    FOR SELECT 
    USING (auth.uid() = user_id);

-- PART 5: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to update subscription tier with audit trail
CREATE OR REPLACE FUNCTION public.update_user_subscription_tier(
    target_user_id UUID,
    new_tier VARCHAR(50),
    admin_user_id UUID DEFAULT NULL,
    reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    old_tier VARCHAR(50);
BEGIN
    -- Get current tier
    SELECT subscription_tier INTO old_tier
    FROM public.users
    WHERE id = target_user_id;

    -- Update user tier
    UPDATE public.users
    SET subscription_tier = new_tier,
        updated_at = NOW()
    WHERE id = target_user_id;

    -- Record in history
    INSERT INTO public.subscription_history (
        user_id,
        previous_tier,
        new_tier,
        changed_by,
        change_reason
    ) VALUES (
        target_user_id,
        old_tier,
        new_tier,
        admin_user_id,
        reason
    );

    -- Update or create metadata
    INSERT INTO public.subscription_metadata (
        user_id,
        tier,
        started_at,
        payment_provider,
        notes
    ) VALUES (
        target_user_id,
        new_tier,
        NOW(),
        'manual',
        reason
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        tier = new_tier,
        started_at = NOW(),
        notes = reason,
        updated_at = NOW();

    RAISE NOTICE 'Updated user % from % to %', target_user_id, old_tier, new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription_details(target_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    subscription_tier VARCHAR(50),
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN,
    payment_provider VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        au.email,
        u.subscription_tier,
        COALESCE(sm.started_at, u.created_at) as started_at,
        sm.expires_at,
        u.is_active,
        COALESCE(sm.payment_provider, 'manual') as payment_provider
    FROM public.users u
    LEFT JOIN auth.users au ON u.id = au.id
    LEFT JOIN public.subscription_metadata sm ON u.id = sm.user_id
    WHERE u.id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 6: VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'analyses', 'subscription_history', 'subscription_metadata')
ORDER BY table_name;

-- Verify all required columns exist in analyses table
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'analyses'
    AND column_name IN ('tier', 'estimated_cost', 'actual_cost', 'insights_generated')
ORDER BY column_name;

-- Verify indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'subscription_history', 'subscription_metadata')
    AND indexname LIKE '%subscription%'
ORDER BY tablename, indexname;

-- Verify RLS policies exist
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('subscription_history', 'subscription_metadata')
ORDER BY tablename, policyname;

-- Verify functions exist
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('update_user_subscription_tier', 'get_user_subscription_details')
ORDER BY routine_name;

-- PART 7: TEST QUERIES (OPTIONAL - FOR VERIFICATION)
-- ============================================================================

-- Show all users and their subscription tiers
SELECT 
    u.id,
    au.email,
    u.subscription_tier,
    u.is_active,
    u.created_at,
    (SELECT COUNT(*) FROM public.analyses WHERE user_id = u.id) as analysis_count
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC
LIMIT 10;

-- Show subscription history (if any)
SELECT 
    sh.id,
    au.email as user_email,
    sh.previous_tier,
    sh.new_tier,
    sh.change_reason,
    sh.changed_at
FROM public.subscription_history sh
LEFT JOIN auth.users au ON sh.user_id = au.id
ORDER BY sh.changed_at DESC
LIMIT 10;

-- PART 8: EXAMPLE USAGE - UPGRADE A USER TO PREMIUM
-- ============================================================================
-- UNCOMMENT AND MODIFY THE EMAIL TO UPGRADE A SPECIFIC USER

/*
-- Example: Upgrade user by email to premium
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get user ID by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'nrivikings8@gmail.com';  -- CHANGE THIS EMAIL

    IF target_user_id IS NOT NULL THEN
        -- Upgrade to premium
        PERFORM public.update_user_subscription_tier(
            target_user_id,
            'premium',
            NULL,  -- No admin user (manual upgrade)
            'Beta tester - manual upgrade for testing premium features'
        );
        
        RAISE NOTICE 'Successfully upgraded user to premium';
    ELSE
        RAISE NOTICE 'User not found with that email';
    END IF;
END $$;
*/

-- PART 9: FINAL VERIFICATION
-- ============================================================================

-- Summary of database state
SELECT 
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM public.users
UNION ALL
SELECT 
    'Free Tier Users',
    COUNT(*)::TEXT
FROM public.users
WHERE subscription_tier = 'free'
UNION ALL
SELECT 
    'Premium Tier Users',
    COUNT(*)::TEXT
FROM public.users
WHERE subscription_tier = 'premium'
UNION ALL
SELECT 
    'Enterprise Tier Users',
    COUNT(*)::TEXT
FROM public.users
WHERE subscription_tier = 'enterprise'
UNION ALL
SELECT 
    'Total Analyses',
    COUNT(*)::TEXT
FROM public.analyses
UNION ALL
SELECT 
    'Subscription History Records',
    COUNT(*)::TEXT
FROM public.subscription_history
UNION ALL
SELECT 
    'Subscription Metadata Records',
    COUNT(*)::TEXT
FROM public.subscription_metadata;
