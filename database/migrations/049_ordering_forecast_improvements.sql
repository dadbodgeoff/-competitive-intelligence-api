-- Migration: Ordering Forecast Improvements
-- Adds forecast buffer setting and improves forecast data structure

-- 1. Add forecast_buffer to user_inventory_preferences
ALTER TABLE user_inventory_preferences 
ADD COLUMN IF NOT EXISTS forecast_buffer DECIMAL(3,2) DEFAULT 0.5;

COMMENT ON COLUMN user_inventory_preferences.forecast_buffer IS 
'Buffer multiplier for forecast quantities. 0.5 = 50% buffer (order 1.5x usage). Default 0.5';

-- 2. Add explanation fields to inventory_item_forecasts for chain-of-thought display
ALTER TABLE inventory_item_forecasts
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS forecast_explanation JSONB,
ADD COLUMN IF NOT EXISTS data_window_days INTEGER DEFAULT 28,
ADD COLUMN IF NOT EXISTS order_count_in_window INTEGER,
ADD COLUMN IF NOT EXISTS total_cases_in_window DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekly_case_usage DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS buffer_applied DECIMAL(3,2);

COMMENT ON COLUMN inventory_item_forecasts.confidence_score IS 
'Confidence in forecast (0-1). Based on data consistency and recency';

COMMENT ON COLUMN inventory_item_forecasts.forecast_explanation IS 
'Chain of thought explanation for the forecast calculation';

COMMENT ON COLUMN inventory_item_forecasts.data_window_days IS 
'Number of days of data used (28 or 60)';

COMMENT ON COLUMN inventory_item_forecasts.order_count_in_window IS 
'Number of orders found in the data window';

COMMENT ON COLUMN inventory_item_forecasts.total_cases_in_window IS 
'Total cases ordered in the data window';

COMMENT ON COLUMN inventory_item_forecasts.weekly_case_usage IS 
'Calculated weekly case usage';

COMMENT ON COLUMN inventory_item_forecasts.buffer_applied IS 
'Buffer multiplier that was applied';

-- 3. Create index for faster vendor-based queries
CREATE INDEX IF NOT EXISTS idx_forecasts_vendor_date 
ON inventory_item_forecasts(user_id, vendor_name, forecast_date);

-- 4. Add vendor_id to forecasts for strict vendor assignment
ALTER TABLE inventory_item_forecasts
ADD COLUMN IF NOT EXISTS vendor_id UUID;

-- Done
SELECT 'Migration 049 complete: Ordering forecast improvements' as status;
