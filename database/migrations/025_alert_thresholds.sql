-- ============================================================================
-- MIGRATION 025: Alert Thresholds
-- ============================================================================
-- Description: Add user-configurable alert thresholds to preferences
-- Author: Alerts System Implementation
-- Date: 2025-11-04
-- Dependencies: Requires user_inventory_preferences table
-- ============================================================================

-- Add threshold columns
ALTER TABLE user_inventory_preferences 
ADD COLUMN IF NOT EXISTS price_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS price_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS price_drop_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS price_drop_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0;

-- Add comments
COMMENT ON COLUMN user_inventory_preferences.price_alert_threshold_7day IS 'Alert if price increases > this % vs 7-day avg';
COMMENT ON COLUMN user_inventory_preferences.price_alert_threshold_28day IS 'Alert if price increases > this % vs 28-day avg';
COMMENT ON COLUMN user_inventory_preferences.price_drop_alert_threshold_7day IS 'Alert if price decreases > this % vs 7-day avg';
COMMENT ON COLUMN user_inventory_preferences.price_drop_alert_threshold_28day IS 'Alert if price decreases > this % vs 28-day avg';

-- Constraint for reasonable values
ALTER TABLE user_inventory_preferences
ADD CONSTRAINT reasonable_alert_thresholds CHECK (
  price_alert_threshold_7day BETWEEN 1.0 AND 100.0 AND
  price_alert_threshold_28day BETWEEN 1.0 AND 100.0 AND
  price_drop_alert_threshold_7day BETWEEN 1.0 AND 100.0 AND
  price_drop_alert_threshold_28day BETWEEN 1.0 AND 100.0
);

-- Verification
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'user_inventory_preferences' 
            AND column_name LIKE '%alert_threshold%') = 4,
           'Not all threshold columns were created';
    
    RAISE NOTICE '✅ Alert threshold columns added successfully';
END $$;
