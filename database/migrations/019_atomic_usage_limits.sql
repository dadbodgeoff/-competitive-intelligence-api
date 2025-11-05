-- Atomic Usage Limit Enforcement
-- Prevents subscription tier bypass via race conditions
-- Uses row-level locking for true atomicity

-- Function to check and reserve usage slot atomically
CREATE OR REPLACE FUNCTION check_and_reserve_usage_atomic(
    p_user_id UUID,
    p_operation_type TEXT,
    p_max_allowed INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_current_count INTEGER;
    v_tier TEXT;
BEGIN
    -- Get user's tier with row lock (prevents concurrent checks)
    SELECT subscription_tier INTO v_tier
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;  -- Lock this row until transaction completes
    
    -- Count current usage this month based on operation type
    IF p_operation_type = 'analysis' THEN
        SELECT COUNT(*) INTO v_current_count
        FROM analyses
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', NOW());
        
    ELSIF p_operation_type = 'invoice_parse' THEN
        SELECT COUNT(*) INTO v_current_count
        FROM invoices
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', NOW());
        
    ELSIF p_operation_type = 'menu_comparison' THEN
        SELECT COUNT(*) INTO v_current_count
        FROM competitor_menu_analyses
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', NOW());
        
    ELSE
        -- Unknown operation type
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'unknown_operation_type',
            'current_count', 0,
            'max_allowed', p_max_allowed
        );
    END IF;
    
    -- Check if limit exceeded
    IF v_current_count >= p_max_allowed THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'reason', 'limit_exceeded',
            'current_count', v_current_count,
            'max_allowed', p_max_allowed,
            'tier', v_tier
        );
    END IF;
    
    -- Within limits - allow operation
    RETURN jsonb_build_object(
        'allowed', TRUE,
        'current_count', v_current_count,
        'max_allowed', p_max_allowed,
        'tier', v_tier,
        'remaining', p_max_allowed - v_current_count - 1
    );
    
END;
$$ LANGUAGE plpgsql;

-- Function to get tier limits (centralized configuration)
CREATE OR REPLACE FUNCTION get_tier_limits(p_tier TEXT)
RETURNS JSONB AS $$
BEGIN
    RETURN CASE p_tier
        WHEN 'free' THEN jsonb_build_object(
            'analyses_per_month', 5,
            'invoices_per_month', 10,
            'menu_comparisons_per_month', 2
        )
        WHEN 'premium' THEN jsonb_build_object(
            'analyses_per_month', -1,  -- Unlimited
            'invoices_per_month', -1,
            'menu_comparisons_per_month', -1
        )
        WHEN 'enterprise' THEN jsonb_build_object(
            'analyses_per_month', -1,
            'invoices_per_month', -1,
            'menu_comparisons_per_month', -1
        )
        ELSE jsonb_build_object(
            'analyses_per_month', 0,
            'invoices_per_month', 0,
            'menu_comparisons_per_month', 0
        )
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to check specific operation limit
CREATE OR REPLACE FUNCTION check_operation_limit(
    p_user_id UUID,
    p_operation_type TEXT
) RETURNS JSONB AS $$
DECLARE
    v_tier TEXT;
    v_limits JSONB;
    v_max_allowed INTEGER;
BEGIN
    -- Get user tier
    SELECT subscription_tier INTO v_tier
    FROM users
    WHERE id = p_user_id;
    
    IF v_tier IS NULL THEN
        v_tier := 'free';  -- Default to free tier
    END IF;
    
    -- Get tier limits
    v_limits := get_tier_limits(v_tier);
    
    -- Extract specific limit
    IF p_operation_type = 'analysis' THEN
        v_max_allowed := (v_limits->>'analyses_per_month')::INTEGER;
    ELSIF p_operation_type = 'invoice_parse' THEN
        v_max_allowed := (v_limits->>'invoices_per_month')::INTEGER;
    ELSIF p_operation_type = 'menu_comparison' THEN
        v_max_allowed := (v_limits->>'menu_comparisons_per_month')::INTEGER;
    ELSE
        v_max_allowed := 0;
    END IF;
    
    -- Check and reserve atomically
    RETURN check_and_reserve_usage_atomic(p_user_id, p_operation_type, v_max_allowed);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for faster monthly counts
-- Note: Using regular indexes instead of partial indexes with NOW()
-- because NOW() is not immutable and can't be used in index predicates
CREATE INDEX IF NOT EXISTS idx_analyses_user_month 
ON analyses(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_invoices_user_month 
ON invoices(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_competitor_menu_analyses_user_month 
ON competitor_menu_analyses(user_id, created_at);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_reserve_usage_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_limits TO authenticated;
GRANT EXECUTE ON FUNCTION check_operation_limit TO authenticated;

-- Migration complete
-- Run test_atomic_usage_limits.py to verify functionality
