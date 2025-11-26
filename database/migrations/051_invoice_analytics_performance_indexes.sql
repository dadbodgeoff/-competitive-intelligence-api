-- ================================================================================
-- INVOICE ANALYTICS PERFORMANCE INDEXES
-- Purpose: Optimize invoice dashboard queries for faster load times
-- ================================================================================

-- Index for invoice date filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_invoices_account_date 
ON invoices(account_id, invoice_date DESC);

-- Index for vendor grouping queries
CREATE INDEX IF NOT EXISTS idx_invoices_account_vendor 
ON invoices(account_id, vendor_name);

-- Index for invoice_items join performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id 
ON invoice_items(invoice_id);

-- Composite index for invoice_items with extended_price (covering index for aggregations)
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_price 
ON invoice_items(invoice_id, extended_price);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_invoices_account_status 
ON invoices(account_id, status);

-- Note: Partial indexes with date ranges require immutable functions
-- The composite index on (account_id, invoice_date DESC) already covers recent queries efficiently

-- ================================================================================
-- MATERIALIZED VIEW FOR DASHBOARD SUMMARY (Optional - for high-traffic scenarios)
-- Uncomment if needed for very large datasets
-- ================================================================================

-- CREATE MATERIALIZED VIEW IF NOT EXISTS mv_invoice_dashboard_summary AS
-- SELECT 
--     account_id,
--     DATE_TRUNC('day', invoice_date) as invoice_day,
--     COUNT(DISTINCT i.id) as invoice_count,
--     COUNT(DISTINCT vendor_name) as vendor_count,
--     SUM(ii.extended_price) as total_spend
-- FROM invoices i
-- JOIN invoice_items ii ON ii.invoice_id = i.id
-- GROUP BY account_id, DATE_TRUNC('day', invoice_date);

-- CREATE UNIQUE INDEX ON mv_invoice_dashboard_summary(account_id, invoice_day);

-- ================================================================================
-- ANALYZE TABLES (Run after index creation)
-- ================================================================================
ANALYZE invoices;
ANALYZE invoice_items;
