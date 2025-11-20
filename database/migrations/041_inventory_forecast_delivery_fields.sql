-- ================================================================================
-- MIGRATION 041: Delivery-Aligned Forecast Metadata
-- Purpose: Add delivery_date, lead_time, vendor attribution for multi-horizon forecasts
-- ================================================================================

ALTER TABLE inventory_item_forecasts
    ADD COLUMN IF NOT EXISTS delivery_date DATE,
    ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
    ADD COLUMN IF NOT EXISTS delivery_window_label TEXT,
    ADD COLUMN IF NOT EXISTS vendor_name TEXT;

-- Backfill existing rows so new columns remain consistent
UPDATE inventory_item_forecasts
SET
    delivery_date = COALESCE(delivery_date, forecast_date),
    lead_time_days = COALESCE(lead_time_days, horizon_days),
    delivery_window_label = COALESCE(
        delivery_window_label,
        TO_CHAR(COALESCE(delivery_date, forecast_date), 'FMDay, Mon DD')
    );

CREATE INDEX IF NOT EXISTS idx_item_forecasts_delivery_date
    ON inventory_item_forecasts(user_id, delivery_date);

COMMENT ON COLUMN inventory_item_forecasts.delivery_date IS 'Target delivery date for this forecast';
COMMENT ON COLUMN inventory_item_forecasts.lead_time_days IS 'Days between generation and delivery';
COMMENT ON COLUMN inventory_item_forecasts.delivery_window_label IS 'Human readable label for the delivery window';
COMMENT ON COLUMN inventory_item_forecasts.vendor_name IS 'Vendor associated with the forecasted item';

