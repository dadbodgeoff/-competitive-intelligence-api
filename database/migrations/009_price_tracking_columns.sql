-- Migration 009: Add Price Tracking Columns to Inventory Items
-- Adds columns to track last paid price, 7-day average, and 28-day average
-- These are automatically updated via triggers when price_history changes

-- Add new columns to inventory_items
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS last_paid_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_paid_date DATE,
ADD COLUMN IF NOT EXISTS price_7day_avg DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_28day_avg DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_last_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for efficient price history queries
CREATE INDEX IF NOT EXISTS idx_price_history_item_date 
ON price_history(inventory_item_id, invoice_date DESC);

-- Function to update price tracking columns
CREATE OR REPLACE FUNCTION update_inventory_item_price_tracking()
RETURNS TRIGGER AS $$
DECLARE
    v_item_id UUID;
    v_user_id UUID;
    v_last_price DECIMAL(10,2);
    v_last_date DATE;
    v_avg_7day DECIMAL(10,2);
    v_avg_28day DECIMAL(10,2);
BEGIN
    -- Get the item_id from the trigger
    IF TG_OP = 'DELETE' THEN
        v_item_id := OLD.inventory_item_id;
        v_user_id := OLD.user_id;
    ELSE
        v_item_id := NEW.inventory_item_id;
        v_user_id := NEW.user_id;
    END IF;

    -- Get most recent price
    SELECT unit_price, invoice_date
    INTO v_last_price, v_last_date
    FROM price_history
    WHERE inventory_item_id = v_item_id
      AND user_id = v_user_id
    ORDER BY invoice_date DESC, created_at DESC
    LIMIT 1;

    -- Calculate 7-day average
    SELECT AVG(unit_price)
    INTO v_avg_7day
    FROM price_history
    WHERE inventory_item_id = v_item_id
      AND user_id = v_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '7 days';

    -- Calculate 28-day average
    SELECT AVG(unit_price)
    INTO v_avg_28day
    FROM price_history
    WHERE inventory_item_id = v_item_id
      AND user_id = v_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '28 days';

    -- Update inventory_items table
    UPDATE inventory_items
    SET 
        last_paid_price = v_last_price,
        last_paid_date = v_last_date,
        price_7day_avg = v_avg_7day,
        price_28day_avg = v_avg_28day,
        price_last_updated_at = NOW()
    WHERE id = v_item_id
      AND user_id = v_user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on price_history INSERT
DROP TRIGGER IF EXISTS trigger_update_price_tracking_insert ON price_history;
CREATE TRIGGER trigger_update_price_tracking_insert
AFTER INSERT ON price_history
FOR EACH ROW
EXECUTE FUNCTION update_inventory_item_price_tracking();

-- Create trigger on price_history UPDATE
DROP TRIGGER IF EXISTS trigger_update_price_tracking_update ON price_history;
CREATE TRIGGER trigger_update_price_tracking_update
AFTER UPDATE ON price_history
FOR EACH ROW
EXECUTE FUNCTION update_inventory_item_price_tracking();

-- Create trigger on price_history DELETE
DROP TRIGGER IF EXISTS trigger_update_price_tracking_delete ON price_history;
CREATE TRIGGER trigger_update_price_tracking_delete
AFTER DELETE ON price_history
FOR EACH ROW
EXECUTE FUNCTION update_inventory_item_price_tracking();

-- Helper function for manual recalculation (useful for maintenance)
-- MUST be created BEFORE backfill uses it
CREATE OR REPLACE FUNCTION update_inventory_item_price_tracking_for_item(
    p_item_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_last_price DECIMAL(10,2);
    v_last_date DATE;
    v_avg_7day DECIMAL(10,2);
    v_avg_28day DECIMAL(10,2);
BEGIN
    -- Get most recent price
    SELECT unit_price, invoice_date
    INTO v_last_price, v_last_date
    FROM price_history
    WHERE inventory_item_id = p_item_id
      AND user_id = p_user_id
    ORDER BY invoice_date DESC, created_at DESC
    LIMIT 1;

    -- Calculate 7-day average
    SELECT AVG(unit_price)
    INTO v_avg_7day
    FROM price_history
    WHERE inventory_item_id = p_item_id
      AND user_id = p_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '7 days';

    -- Calculate 28-day average
    SELECT AVG(unit_price)
    INTO v_avg_28day
    FROM price_history
    WHERE inventory_item_id = p_item_id
      AND user_id = p_user_id
      AND invoice_date >= CURRENT_DATE - INTERVAL '28 days';

    -- Update inventory_items table
    UPDATE inventory_items
    SET 
        last_paid_price = v_last_price,
        last_paid_date = v_last_date,
        price_7day_avg = v_avg_7day,
        price_28day_avg = v_avg_28day,
        price_last_updated_at = NOW()
    WHERE id = p_item_id
      AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing data
-- This will populate the new columns for all existing inventory items
DO $$
DECLARE
    item_record RECORD;
BEGIN
    FOR item_record IN 
        SELECT DISTINCT inventory_item_id, user_id 
        FROM price_history
    LOOP
        PERFORM update_inventory_item_price_tracking_for_item(
            item_record.inventory_item_id, 
            item_record.user_id
        );
    END LOOP;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN inventory_items.last_paid_price IS 'Most recent unit price paid for this item';
COMMENT ON COLUMN inventory_items.last_paid_date IS 'Date of most recent purchase';
COMMENT ON COLUMN inventory_items.price_7day_avg IS 'Rolling 7-day average unit price';
COMMENT ON COLUMN inventory_items.price_28day_avg IS 'Rolling 28-day average unit price';
COMMENT ON COLUMN inventory_items.price_last_updated_at IS 'Timestamp when price tracking was last updated';

-- Verification query
-- SELECT 
--     i.name,
--     i.last_paid_price,
--     i.last_paid_date,
--     i.price_7day_avg,
--     i.price_28day_avg,
--     i.price_last_updated_at
-- FROM inventory_items i
-- WHERE i.last_paid_price IS NOT NULL
-- ORDER BY i.name;
