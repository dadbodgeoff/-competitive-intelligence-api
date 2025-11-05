-- Get invoice_items table schema and sample data
-- Run this in your Supabase SQL Editor

-- 1. Get table schema
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'invoice_items'
ORDER BY ordinal_position;

-- 2. Get sample data (10 rows)
SELECT * FROM invoice_items
LIMIT 10;

-- 3. Get row count
SELECT COUNT(*) as total_rows FROM invoice_items;

-- 4. Get date range of data
SELECT 
    MIN(created_at) as earliest_date,
    MAX(created_at) as latest_date
FROM invoice_items;

-- 5. Get unique vendors
SELECT DISTINCT 
    i.vendor_name,
    COUNT(ii.id) as item_count
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
GROUP BY i.vendor_name
ORDER BY item_count DESC;

-- 6. Get sample with invoice data (shows the join pattern)
SELECT 
    ii.id,
    ii.description,
    ii.quantity,
    ii.unit_price,
    ii.extended_price,
    ii.created_at,
    i.vendor_name,
    i.invoice_date,
    i.invoice_number,
    i.user_id
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
LIMIT 10;
