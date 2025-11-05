-- Migration 010: Standardize Timestamps Across All Tables
-- Ensures all tables use database time (NOW()) as source of truth
-- Adds updated_at triggers where missing

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INVENTORY_ITEMS - Add trigger for updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VENDORS - Add trigger for updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VENDOR_ITEM_MAPPINGS - Add trigger for updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_vendor_item_mappings_updated_at ON vendor_item_mappings;
CREATE TRIGGER update_vendor_item_mappings_updated_at
    BEFORE UPDATE ON vendor_item_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INVOICES - Add trigger for updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Ensure all timestamp columns use TIMESTAMPTZ (timezone-aware)
-- ============================================================================

-- Check and document timestamp columns
COMMENT ON COLUMN inventory_items.created_at IS 'Record creation time (database time)';
COMMENT ON COLUMN inventory_items.updated_at IS 'Last update time (auto-updated by trigger)';
COMMENT ON COLUMN inventory_items.price_last_updated_at IS 'When price tracking was last recalculated (database time)';

COMMENT ON COLUMN inventory_transactions.created_at IS 'Transaction timestamp (database time)';
COMMENT ON COLUMN inventory_transactions.transaction_date IS 'Business date of transaction (user-provided or invoice date)';

COMMENT ON COLUMN price_history.created_at IS 'Record creation time (database time)';
COMMENT ON COLUMN price_history.invoice_date IS 'Invoice date (business date from invoice)';

COMMENT ON COLUMN invoices.created_at IS 'Record creation time (database time)';
COMMENT ON COLUMN invoices.updated_at IS 'Last update time (auto-updated by trigger)';
COMMENT ON COLUMN invoices.invoice_date IS 'Invoice date (business date from vendor invoice)';

-- ============================================================================
-- Create view for system time info (useful for debugging)
-- ============================================================================
CREATE OR REPLACE VIEW system_time_info AS
SELECT
    NOW() as current_database_time,
    CURRENT_DATE as current_database_date,
    EXTRACT(TIMEZONE FROM NOW()) as timezone_offset_seconds,
    TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS TZ') as formatted_time;

COMMENT ON VIEW system_time_info IS 'Shows current database time - use this as source of truth for all timestamps';

-- ============================================================================
-- Helper function to get current database time (for application use)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_system_time()
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN NOW();
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_system_time() IS 'Returns current database time - use this instead of application time';

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check all tables have proper timestamp columns
-- SELECT 
--     table_name,
--     column_name,
--     data_type,
--     column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name IN ('created_at', 'updated_at', 'transaction_date', 'invoice_date')
-- ORDER BY table_name, column_name;

-- Check all triggers are in place
-- SELECT 
--     trigger_name,
--     event_object_table,
--     action_timing,
--     event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
--   AND trigger_name LIKE '%updated_at%'
-- ORDER BY event_object_table;
