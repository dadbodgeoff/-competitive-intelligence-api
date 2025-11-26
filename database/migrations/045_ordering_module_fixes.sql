-- ============================================================================
-- MIGRATION 045: Ordering Module Fixes
-- ----------------------------------------------------------------------------
-- Adds missing service role RLS policies and fixes data integrity issues
-- for the predictive ordering module.
-- ============================================================================

-- ============================================================================
-- PART 1: Add Service Role RLS Policies for vendor_delivery_schedules
-- ============================================================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role manages vendor delivery schedules" ON vendor_delivery_schedules;

-- Add service role policy for full access
CREATE POLICY "Service role manages vendor delivery schedules" ON vendor_delivery_schedules
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 2: Add Service Role RLS Policies for inventory_item_usage_metrics
-- ============================================================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role manages usage metrics" ON inventory_item_usage_metrics;

-- Add service role policy for full access
CREATE POLICY "Service role manages usage metrics" ON inventory_item_usage_metrics
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 3: Add Service Role RLS Policies for inventory_item_facts
-- (May already exist from migration 029, but ensure it's there)
-- ============================================================================

DROP POLICY IF EXISTS "Service role manages inventory item facts" ON inventory_item_facts;

CREATE POLICY "Service role manages inventory item facts" ON inventory_item_facts
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 4: Add Service Role RLS Policies for inventory_item_features
-- ============================================================================

DROP POLICY IF EXISTS "Service role manages inventory item features" ON inventory_item_features;

CREATE POLICY "Service role manages inventory item features" ON inventory_item_features
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 5: Add Service Role RLS Policies for inventory_item_forecasts
-- ============================================================================

DROP POLICY IF EXISTS "Service role manages inventory item forecasts" ON inventory_item_forecasts;

CREATE POLICY "Service role manages inventory item forecasts" ON inventory_item_forecasts
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 6: Add Service Role RLS Policies for inventory_forecast_accuracy
-- ============================================================================

DROP POLICY IF EXISTS "Service role manages inventory forecast accuracy" ON inventory_forecast_accuracy;

CREATE POLICY "Service role manages inventory forecast accuracy" ON inventory_forecast_accuracy
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 7: Enable RLS on all ordering tables (idempotent)
-- ============================================================================

ALTER TABLE inventory_item_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_forecast_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_delivery_schedules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 8: Add user-level RLS policies for ordering tables (if missing)
-- ============================================================================

-- inventory_item_facts
DROP POLICY IF EXISTS "Users can view their inventory facts" ON inventory_item_facts;
CREATE POLICY "Users can view their inventory facts" ON inventory_item_facts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their inventory facts" ON inventory_item_facts;
CREATE POLICY "Users can manage their inventory facts" ON inventory_item_facts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- inventory_item_features
DROP POLICY IF EXISTS "Users can view their inventory features" ON inventory_item_features;
CREATE POLICY "Users can view their inventory features" ON inventory_item_features
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their inventory features" ON inventory_item_features;
CREATE POLICY "Users can manage their inventory features" ON inventory_item_features
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- inventory_item_forecasts
DROP POLICY IF EXISTS "Users can view their inventory forecasts" ON inventory_item_forecasts;
CREATE POLICY "Users can view their inventory forecasts" ON inventory_item_forecasts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their inventory forecasts" ON inventory_item_forecasts;
CREATE POLICY "Users can manage their inventory forecasts" ON inventory_item_forecasts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- inventory_forecast_accuracy
DROP POLICY IF EXISTS "Users can view their forecast accuracy" ON inventory_forecast_accuracy;
CREATE POLICY "Users can view their forecast accuracy" ON inventory_forecast_accuracy
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their forecast accuracy" ON inventory_forecast_accuracy;
CREATE POLICY "Users can manage their forecast accuracy" ON inventory_forecast_accuracy
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 9: Add index for faster forecast queries by date range
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_forecasts_user_date_range
    ON inventory_item_forecasts(user_id, forecast_date DESC, order_index);

CREATE INDEX IF NOT EXISTS idx_forecasts_cleanup
    ON inventory_item_forecasts(user_id, forecast_date);

-- ============================================================================
-- PART 10: Add index for faster feature lookups (not just today)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_features_user_latest
    ON inventory_item_features(user_id, normalized_item_id, feature_date DESC);

-- ============================================================================
-- PART 11: Cleanup stale forecasts (older than 60 days)
-- ============================================================================

DELETE FROM inventory_item_forecasts
WHERE forecast_date < CURRENT_DATE - INTERVAL '60 days';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Check vendor_delivery_schedules has service role policy
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'vendor_delivery_schedules'
      AND policyname = 'Service role manages vendor delivery schedules';
    
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'Missing service role policy on vendor_delivery_schedules';
    END IF;

    -- Check inventory_item_usage_metrics has service role policy
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'inventory_item_usage_metrics'
      AND policyname = 'Service role manages usage metrics';
    
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'Missing service role policy on inventory_item_usage_metrics';
    END IF;

    -- Check inventory_item_facts has service role policy
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'inventory_item_facts'
      AND policyname = 'Service role manages inventory item facts';
    
    IF policy_count = 0 THEN
        RAISE EXCEPTION 'Missing service role policy on inventory_item_facts';
    END IF;

    RAISE NOTICE '✅ Migration 045 complete: All ordering RLS policies verified.';
END $$;

-- ============================================================================
-- END MIGRATION 045
-- ============================================================================
