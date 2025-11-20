-- ================================================================================
-- MIGRATION 042: Inventory Usage Metrics
-- Purpose: Persist weekly usage + reorder cadence per normalized item for predictive ordering
-- ================================================================================

CREATE TABLE IF NOT EXISTS inventory_item_usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_item_id TEXT NOT NULL,
    normalized_ingredient_id UUID REFERENCES normalized_ingredients(id) ON DELETE CASCADE,
    average_weekly_usage NUMERIC(18,6),
    average_reorder_interval_days NUMERIC(18,6),
    deliveries_per_week NUMERIC(6,3),
    units_per_delivery NUMERIC(18,6),
    last_delivery_date DATE,
    last_invoice_item_id UUID REFERENCES invoice_items(id),
    pack_units_per_case NUMERIC(18,6),
    suggested_case_label TEXT,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, normalized_item_id)
);

COMMENT ON TABLE inventory_item_usage_metrics IS 'Derived usage cadence per normalized ingredient';

ALTER TABLE inventory_item_usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their usage metrics"
    ON inventory_item_usage_metrics
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_item
    ON inventory_item_usage_metrics (user_id, normalized_item_id);

CREATE TRIGGER trg_inventory_item_usage_metrics_updated_at
    BEFORE UPDATE ON inventory_item_usage_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


