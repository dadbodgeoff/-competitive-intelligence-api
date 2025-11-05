-- Verify Invoice Ingestion for Invoice: efe2ccf5-296b-4d26-be60-fc28d56513ce
-- Run this in Supabase SQL Editor

-- 1. Check Invoice Record
SELECT 
    'INVOICE' as record_type,
    id,
    invoice_number,
    vendor_name,
    invoice_date,
    total,
    status,
    created_at
FROM invoices 
WHERE id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce';

-- 2. Check Invoice Items (should be 9 items)
SELECT 
    'INVOICE_ITEMS' as record_type,
    item_number,
    description,
    quantity,
    unit_price,
    extended_price,
    category,
    created_at
FROM invoice_items 
WHERE invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce'
ORDER BY created_at;

-- 3. Check Inventory Transactions (should be 9 transactions)
SELECT 
    'INVENTORY_TRANSACTIONS' as record_type,
    it.transaction_type,
    ii.name as item_name,
    it.quantity_change,
    it.unit_of_measure,
    it.unit_price,
    it.created_at
FROM inventory_transactions it
JOIN inventory_items ii ON it.inventory_item_id = ii.id
WHERE it.invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce'
ORDER BY it.created_at;

-- 4. Check Price History (should be 9 price records)
SELECT 
    'PRICE_HISTORY' as record_type,
    ii.name as item_name,
    ph.unit_price,
    ph.price_change_percent,
    ph.invoice_date,
    ph.created_at
FROM price_history ph
JOIN inventory_items ii ON ph.inventory_item_id = ii.id
WHERE ph.invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce'
ORDER BY ph.created_at;

-- 5. Check Inventory Alerts (should have 1 alert for the 963% price increase)
SELECT 
    'INVENTORY_ALERTS' as record_type,
    ia.alert_type,
    ii.name as item_name,
    ia.severity,
    ia.message,
    ia.is_resolved,
    ia.created_at
FROM inventory_alerts ia
JOIN inventory_items ii ON ia.inventory_item_id = ii.id
WHERE ia.invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce'
ORDER BY ia.created_at;

-- 6. Check Vendor Item Mappings (should have 9 mappings)
SELECT 
    'VENDOR_MAPPINGS' as record_type,
    vim.vendor_item_number,
    ii.name as inventory_item_name,
    v.name as vendor_name,
    vim.created_at
FROM vendor_item_mappings vim
JOIN inventory_items ii ON vim.inventory_item_id = ii.id
JOIN vendors v ON vim.vendor_id = v.id
WHERE vim.vendor_id = (
    SELECT vendor_id FROM vendor_item_mappings 
    WHERE vendor_item_number IN ('2822312', '5148453', '6344790', '1995125', '5228424', '2005148', '2034023', '7680291', '')
    LIMIT 1
)
AND vim.vendor_item_number IN ('2822312', '5148453', '6344790', '1995125', '5228424', '2005148', '2034023', '7680291', '');

-- 7. Check Updated Inventory Quantities
SELECT 
    'CURRENT_INVENTORY' as record_type,
    ii.name,
    ii.current_quantity,
    ii.unit_of_measure,
    ii.category,
    ii.updated_at
FROM inventory_items ii
WHERE ii.id IN (
    SELECT DISTINCT inventory_item_id 
    FROM inventory_transactions 
    WHERE invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce'
)
ORDER BY ii.name;

-- 8. Summary Stats
SELECT 
    'SUMMARY' as record_type,
    (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce') as invoice_items_count,
    (SELECT COUNT(*) FROM inventory_transactions WHERE invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce') as transactions_count,
    (SELECT COUNT(*) FROM price_history WHERE invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce') as price_history_count,
    (SELECT COUNT(*) FROM inventory_alerts WHERE invoice_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce') as alerts_count,
    (SELECT status FROM invoices WHERE id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce') as invoice_status;

-- 9. Check Processed Events (should show invoice was processed)
SELECT 
    'PROCESSED_EVENTS' as record_type,
    event_type,
    event_id,
    processed_at,
    created_at
FROM processed_events
WHERE event_id = 'efe2ccf5-296b-4d26-be60-fc28d56513ce';
