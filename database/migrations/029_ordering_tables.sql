-- ============================================================================
-- MIGRATION 029: Predictive Ordering Foundations
-- Purpose: Create derived tables for normalized facts, features, forecasts,
--          and forecast accuracy while keeping invoice_items read-only.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- inventory_item_facts
-- Normalized, per-delivery facts derived from invoice_items.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_item_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_item_id UUID NOT NULL REFERENCES invoice_items(id) ON DELETE CASCADE,
    normalized_item_id TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    base_quantity NUMERIC(18,6) NOT NULL,
    base_unit TEXT NOT NULL,
    pack_description TEXT,
    source_invoice_number TEXT,
    anomaly_flags JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, invoice_item_id)
);

COMMENT ON TABLE inventory_item_facts IS
    'Normalized quantities derived from invoice_items for predictive ordering.';

CREATE INDEX IF NOT EXISTS idx_item_facts_user_item
    ON inventory_item_facts(user_id, normalized_item_id, delivery_date);

-- ----------------------------------------------------------------------------
-- inventory_item_features
-- Rolling aggregates and engineered metrics per normalized item.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_item_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_item_id TEXT NOT NULL,
    feature_date DATE NOT NULL,
    avg_quantity_7d NUMERIC(18,6),
    avg_quantity_28d NUMERIC(18,6),
    avg_quantity_90d NUMERIC(18,6),
    variance_28d NUMERIC(18,6),
    weekday_seasonality JSONB,
    lead_time_days NUMERIC(18,6),
    last_delivery_date DATE,
    generated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, normalized_item_id, feature_date)
);

COMMENT ON TABLE inventory_item_features IS
    'Rolling aggregates and engineered metrics powering predictive ordering.';

CREATE INDEX IF NOT EXISTS idx_item_features_user_item
    ON inventory_item_features(user_id, normalized_item_id);

-- ----------------------------------------------------------------------------
-- inventory_item_forecasts
-- Stores forecast output for upcoming deliveries.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_item_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_item_id TEXT NOT NULL,
    forecast_date DATE NOT NULL,
    horizon_days INTEGER NOT NULL,
    forecast_quantity NUMERIC(18,6) NOT NULL,
    lower_bound NUMERIC(18,6),
    upper_bound NUMERIC(18,6),
    model_version TEXT,
    model_params JSONB,
    generated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, normalized_item_id, forecast_date, horizon_days)
);

COMMENT ON TABLE inventory_item_forecasts IS
    'Forecasted quantities with confidence intervals and model metadata.';

CREATE INDEX IF NOT EXISTS idx_item_forecasts_user_item
    ON inventory_item_forecasts(user_id, normalized_item_id, forecast_date);

-- ----------------------------------------------------------------------------
-- inventory_forecast_accuracy
-- Tracks forecast error vs actual consumption for continuous improvement.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_forecast_accuracy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_item_id TEXT NOT NULL,
    week_start DATE NOT NULL,
    actual_quantity NUMERIC(18,6),
    forecast_quantity NUMERIC(18,6),
    mape NUMERIC(18,6),
    bias NUMERIC(18,6),
    generated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, normalized_item_id, week_start)
);

COMMENT ON TABLE inventory_forecast_accuracy IS
    'Accuracy tracking for predictive ordering forecasts.';

CREATE INDEX IF NOT EXISTS idx_forecast_accuracy_user_item
    ON inventory_forecast_accuracy(user_id, normalized_item_id, week_start);

-- ----------------------------------------------------------------------------
-- Updated_at triggers reuse existing helper
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_inventory_item_facts_updated_at
    BEFORE UPDATE ON inventory_item_facts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_item_features_updated_at
    BEFORE UPDATE ON inventory_item_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_item_forecasts_updated_at
    BEFORE UPDATE ON inventory_item_forecasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_forecast_accuracy_updated_at
    BEFORE UPDATE ON inventory_forecast_accuracy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification block
DO $$
BEGIN
    PERFORM 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inventory_item_facts';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'inventory_item_facts table missing';
    END IF;

    PERFORM 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inventory_item_features';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'inventory_item_features table missing';
    END IF;

    PERFORM 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inventory_item_forecasts';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'inventory_item_forecasts table missing';
    END IF;

    PERFORM 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inventory_forecast_accuracy';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'inventory_forecast_accuracy table missing';
    END IF;

    RAISE NOTICE '✅ Migration 029 completed successfully (ordering tables ready)';
END $$;

