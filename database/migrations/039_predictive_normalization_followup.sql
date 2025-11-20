-- ============================================================================
-- MIGRATION 039: Predictive Normalization Follow-up
-- ----------------------------------------------------------------------------
-- Applies the supplemental constraints, RLS policies, and indexes that were
-- added to migration 038 after its initial release. This migration is safe to
-- run even if portions were already applied manually.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enable RLS and policies (idempotent via DROP IF EXISTS)
-- ----------------------------------------------------------------------------
ALTER TABLE normalized_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage normalized ingredients" ON normalized_ingredients;
CREATE POLICY "Users manage normalized ingredients" ON normalized_ingredients
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages normalized ingredients" ON normalized_ingredients;
CREATE POLICY "Service role manages normalized ingredients" ON normalized_ingredients
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

ALTER TABLE ingredient_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage ingredient mappings" ON ingredient_mappings;
CREATE POLICY "Users manage ingredient mappings" ON ingredient_mappings
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages ingredient mappings" ON ingredient_mappings;
CREATE POLICY "Service role manages ingredient mappings" ON ingredient_mappings
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read ingredient price history" ON ingredient_price_history;
CREATE POLICY "Users read ingredient price history" ON ingredient_price_history
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages ingredient price history" ON ingredient_price_history;
CREATE POLICY "Service role manages ingredient price history" ON ingredient_price_history
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

ALTER TABLE invoice_item_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view invoice item logs" ON invoice_item_logs;
CREATE POLICY "Users can view invoice item logs" ON invoice_item_logs
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert invoice item logs" ON invoice_item_logs;
CREATE POLICY "Service role can insert invoice item logs" ON invoice_item_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage invoice item logs" ON invoice_item_logs;
CREATE POLICY "Service role can manage invoice item logs" ON invoice_item_logs
    USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Ensure indexes exist with canonical naming
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_item_facts_user_item;
CREATE INDEX IF NOT EXISTS idx_item_facts_user_normalized
    ON inventory_item_facts(user_id, normalized_ingredient_id, delivery_date);

DROP INDEX IF EXISTS idx_item_features_user_item;
CREATE INDEX IF NOT EXISTS idx_item_features_user_normalized
    ON inventory_item_features(user_id, normalized_ingredient_id, feature_date);

DROP INDEX IF EXISTS idx_item_forecasts_user_item;
CREATE INDEX IF NOT EXISTS idx_item_forecasts_user_normalized
    ON inventory_item_forecasts(user_id, normalized_ingredient_id, forecast_date);

DROP INDEX IF EXISTS idx_forecast_accuracy_user_item;
CREATE INDEX IF NOT EXISTS idx_forecast_accuracy_user_normalized
    ON inventory_forecast_accuracy(user_id, normalized_ingredient_id, week_start);

CREATE INDEX IF NOT EXISTS idx_invoice_item_logs_item
    ON invoice_item_logs(invoice_item_id, created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_item_logs_user_time
    ON invoice_item_logs(user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Attach missing foreign key constraints (guarded)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'inventory_item_facts_normalized_ingredient_fk'
    ) THEN
        ALTER TABLE inventory_item_facts
            ADD CONSTRAINT inventory_item_facts_normalized_ingredient_fk
            FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'inventory_item_features_normalized_ingredient_fk'
    ) THEN
        ALTER TABLE inventory_item_features
            ADD CONSTRAINT inventory_item_features_normalized_ingredient_fk
            FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'inventory_item_forecasts_normalized_ingredient_fk'
    ) THEN
        ALTER TABLE inventory_item_forecasts
            ADD CONSTRAINT inventory_item_forecasts_normalized_ingredient_fk
            FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'inventory_forecast_accuracy_normalized_ingredient_fk'
    ) THEN
        ALTER TABLE inventory_forecast_accuracy
            ADD CONSTRAINT inventory_forecast_accuracy_normalized_ingredient_fk
            FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Verification
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    PERFORM 1 FROM pg_indexes WHERE indexname = 'idx_item_facts_user_normalized';
    PERFORM 1 FROM pg_indexes WHERE indexname = 'idx_item_features_user_normalized';
    PERFORM 1 FROM pg_indexes WHERE indexname = 'idx_item_forecasts_user_normalized';
    PERFORM 1 FROM pg_indexes WHERE indexname = 'idx_forecast_accuracy_user_normalized';
    PERFORM 1 FROM pg_indexes WHERE indexname = 'idx_invoice_item_logs_user_time';
END $$;

-- ============================================================================
-- END MIGRATION 039
-- ============================================================================

