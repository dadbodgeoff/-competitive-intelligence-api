-- ============================================================================
-- MIGRATION 044: Predictive Ordering Enhancements
-- ----------------------------------------------------------------------------
-- Adds justification metadata (28d/90d order counts + totals) to usage metrics
-- and introduces an order_index field on forecasts so the API/UI can surface
-- the next four deliveries with explicit sequencing.
-- ============================================================================

ALTER TABLE inventory_item_usage_metrics
    ADD COLUMN IF NOT EXISTS orders_last_28d INTEGER NOT NULL DEFAULT 0;

ALTER TABLE inventory_item_usage_metrics
    ADD COLUMN IF NOT EXISTS orders_last_90d INTEGER NOT NULL DEFAULT 0;

ALTER TABLE inventory_item_usage_metrics
    ADD COLUMN IF NOT EXISTS total_quantity_28d NUMERIC(18,6);

ALTER TABLE inventory_item_usage_metrics
    ADD COLUMN IF NOT EXISTS total_quantity_90d NUMERIC(18,6);

COMMENT ON COLUMN inventory_item_usage_metrics.orders_last_28d IS
    'Number of invoice_items observed for the normalized item within the last 28 days';
COMMENT ON COLUMN inventory_item_usage_metrics.orders_last_90d IS
    'Number of invoice_items observed for the normalized item within the last 90 days';
COMMENT ON COLUMN inventory_item_usage_metrics.total_quantity_28d IS
    'Total normalized quantity purchased during the last 28 days';
COMMENT ON COLUMN inventory_item_usage_metrics.total_quantity_90d IS
    'Total normalized quantity purchased during the last 90 days';

ALTER TABLE inventory_item_forecasts
    ADD COLUMN IF NOT EXISTS order_index INTEGER;

COMMENT ON COLUMN inventory_item_forecasts.order_index IS
    'Zero-based sequence index so the UI can render four upcoming delivery windows';

UPDATE inventory_item_usage_metrics
SET
    orders_last_28d = COALESCE(orders_last_28d, 0),
    orders_last_90d = COALESCE(orders_last_90d, 0)
WHERE orders_last_28d IS NULL OR orders_last_90d IS NULL;

UPDATE inventory_item_forecasts
SET order_index = COALESCE(order_index, 0)
WHERE order_index IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_item_usage_metrics'
          AND column_name = 'orders_last_28d'
    ) THEN
        RAISE EXCEPTION 'orders_last_28d missing on inventory_item_usage_metrics';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_item_usage_metrics'
          AND column_name = 'orders_last_90d'
    ) THEN
        RAISE EXCEPTION 'orders_last_90d missing on inventory_item_usage_metrics';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_item_usage_metrics'
          AND column_name = 'total_quantity_28d'
    ) THEN
        RAISE EXCEPTION 'total_quantity_28d missing on inventory_item_usage_metrics';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_item_usage_metrics'
          AND column_name = 'total_quantity_90d'
    ) THEN
        RAISE EXCEPTION 'total_quantity_90d missing on inventory_item_usage_metrics';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory_item_forecasts'
          AND column_name = 'order_index'
    ) THEN
        RAISE EXCEPTION 'order_index missing on inventory_item_forecasts';
    END IF;

    RAISE NOTICE '✅ Migration 044 complete: predictive ordering metadata ready.';
END $$;

-- ============================================================================
-- END MIGRATION 044
-- ============================================================================


