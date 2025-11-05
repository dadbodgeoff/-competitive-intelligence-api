-- ============================================================================
-- COMPLETE INVOICE ECOSYSTEM VERIFICATION
-- Invoice: Sysco Intermountain #1277265
-- ============================================================================

\echo '============================================================================'
\echo 'INVOICE #1277265 - COMPLETE ECOSYSTEM VERIFICATION'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. INVOICE HEADER
-- ============================================================================
\echo '1️⃣  INVOICE HEADER'
\echo '-------------------'
SELECT 
    id,
    invoice_number,
    vendor_name,
    invoice_date,
    total,
    status,
    parse_method,
    parse_cost,
    parse_time_seconds,
    created_at
FROM invoices
WHERE invoice_number = '1277265'
  AND vendor_name ILIKE '%sysco%intermountain%'
ORDER BY created_at DESC
LIMIT 1;

\echo ''

-- Store invoice_id for subsequent queries
\set invoice_id_query 'SELECT id FROM invoices WHERE invoice_number = ''1277265'' AND vendor_name ILIKE ''%sysco%intermountain%'' ORDER BY created_at DESC LIMIT 1'

-- ============================================================================
-- 2. LINE ITEMS (All 9 items)
-- ============================================================================
\echo '2️⃣  LINE ITEMS (Should be 9 items)'
\echo '-----------------------------------'
SELECT 
    item_number,
    description,
    quantity,
    pack_size,
    unit_price,
    extended_price,
    category,
    user_corrected
FROM invoice_items
WHERE invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY created_at;

\echo ''
\echo 'Line Items Count:'
SELECT COUNT(*) as total_line_items
FROM invoice_items
WHERE invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
);

\echo ''

-- ============================================================================
-- 3. VENDOR LOOKUP
-- ============================================================================
\echo '3️⃣  VENDOR RECORD'
\echo '-----------------'
SELECT 
    v.id,
    v.name,
    v.normalized_name,
    v.vendor_type,
    v.created_at,
    COUNT(DISTINCT vim.id) as mapped_items_count
FROM vendors v
LEFT JOIN vendor_item_mappings vim ON vim.vendor_id = v.id
WHERE v.normalized_name = 'sysco intermountain'
GROUP BY v.id, v.name, v.normalized_name, v.vendor_type, v.created_at;

\echo ''

-- ============================================================================
-- 4. VENDOR ITEM MAPPINGS (Fuzzy Matching Results)
-- ============================================================================
\echo '4️⃣  VENDOR ITEM MAPPINGS (Fuzzy Matching)'
\echo '------------------------------------------'
SELECT 
    vim.vendor_item_number,
    vim.vendor_description,
    ii.name as inventory_item_name,
    vim.confidence_score,
    vim.mapping_method,
    vim.created_at
FROM vendor_item_mappings vim
JOIN inventory_items ii ON ii.id = vim.inventory_item_id
WHERE vim.vendor_id = (
    SELECT id FROM vendors 
    WHERE normalized_name = 'sysco intermountain'
)
  AND vim.vendor_item_number IN (
    SELECT item_number 
    FROM invoice_items 
    WHERE invoice_id = (
        SELECT id FROM invoices 
        WHERE invoice_number = '1277265' 
          AND vendor_name ILIKE '%sysco%intermountain%' 
        ORDER BY created_at DESC 
        LIMIT 1
    )
)
ORDER BY vim.created_at;

\echo ''
\echo 'Mapping Summary:'
SELECT 
    COUNT(*) as total_mappings,
    COUNT(DISTINCT vim.inventory_item_id) as unique_inventory_items,
    AVG(vim.confidence_score) as avg_confidence
FROM vendor_item_mappings vim
WHERE vim.vendor_id = (
    SELECT id FROM vendors 
    WHERE normalized_name = 'sysco intermountain'
)
  AND vim.vendor_item_number IN (
    SELECT item_number 
    FROM invoice_items 
    WHERE invoice_id = (
        SELECT id FROM invoices 
        WHERE invoice_number = '1277265' 
          AND vendor_name ILIKE '%sysco%intermountain%' 
        ORDER BY created_at DESC 
        LIMIT 1
    )
);

\echo ''

-- ============================================================================
-- 5. INVENTORY ITEMS (Created/Updated)
-- ============================================================================
\echo '5️⃣  INVENTORY ITEMS'
\echo '-------------------'
SELECT 
    ii.id,
    ii.name,
    ii.category,
    ii.current_quantity,
    ii.unit_of_measure,
    ii.reorder_point,
    ii.updated_at
FROM inventory_items ii
WHERE ii.id IN (
    SELECT DISTINCT vim.inventory_item_id
    FROM vendor_item_mappings vim
    WHERE vim.vendor_id = (
        SELECT id FROM vendors 
        WHERE normalized_name = 'sysco intermountain'
    )
      AND vim.vendor_item_number IN (
        SELECT item_number 
        FROM invoice_items 
        WHERE invoice_id = (
            SELECT id FROM invoices 
            WHERE invoice_number = '1277265' 
              AND vendor_name ILIKE '%sysco%intermountain%' 
            ORDER BY created_at DESC 
            LIMIT 1
        )
    )
)
ORDER BY ii.name;

\echo ''

-- ============================================================================
-- 6. INVENTORY TRANSACTIONS (Purchase Records)
-- ============================================================================
\echo '6️⃣  INVENTORY TRANSACTIONS'
\echo '--------------------------'
SELECT 
    it.id,
    ii.name as item_name,
    it.transaction_type,
    it.quantity_change,
    it.unit_cost,
    it.total_cost,
    it.quantity_before,
    it.quantity_after,
    it.transaction_date,
    it.created_at
FROM inventory_transactions it
JOIN inventory_items ii ON ii.id = it.inventory_item_id
WHERE it.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY it.created_at;

\echo ''
\echo 'Transaction Summary:'
SELECT 
    COUNT(*) as total_transactions,
    SUM(it.quantity_change) as total_quantity_added,
    SUM(it.total_cost) as total_value_added
FROM inventory_transactions it
WHERE it.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
);

\echo ''

-- ============================================================================
-- 7. PRICE HISTORY (Price Tracking)
-- ============================================================================
\echo '7️⃣  PRICE HISTORY'
\echo '-----------------'
SELECT 
    ph.id,
    ii.name as item_name,
    ph.unit_price,
    ph.pack_size,
    ph.price_per_base_unit,
    ph.invoice_date,
    ph.created_at
FROM price_history ph
JOIN inventory_items ii ON ii.id = ph.inventory_item_id
WHERE ph.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY ii.name, ph.invoice_date;

\echo ''
\echo 'Price History Summary:'
SELECT 
    COUNT(*) as total_price_records,
    AVG(ph.unit_price) as avg_unit_price,
    MIN(ph.unit_price) as min_price,
    MAX(ph.unit_price) as max_price
FROM price_history ph
WHERE ph.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
);

\echo ''

-- ============================================================================
-- 8. PRICE CHANGES & TRENDS
-- ============================================================================
\echo '8️⃣  PRICE CHANGES (Comparing to Previous Prices)'
\echo '------------------------------------------------'
WITH current_prices AS (
    SELECT 
        ph.inventory_item_id,
        ii.name as item_name,
        ph.unit_price as current_price,
        ph.invoice_date as current_date
    FROM price_history ph
    JOIN inventory_items ii ON ii.id = ph.inventory_item_id
    WHERE ph.invoice_id = (
        SELECT id FROM invoices 
        WHERE invoice_number = '1277265' 
          AND vendor_name ILIKE '%sysco%intermountain%' 
        ORDER BY created_at DESC 
        LIMIT 1
    )
),
previous_prices AS (
    SELECT 
        ph.inventory_item_id,
        ph.unit_price as previous_price,
        ph.invoice_date as previous_date,
        ROW_NUMBER() OVER (
            PARTITION BY ph.inventory_item_id 
            ORDER BY ph.invoice_date DESC
        ) as rn
    FROM price_history ph
    WHERE ph.vendor_id = (
        SELECT id FROM vendors 
        WHERE normalized_name = 'sysco intermountain'
    )
      AND ph.invoice_date < (
        SELECT invoice_date FROM invoices 
        WHERE invoice_number = '1277265' 
          AND vendor_name ILIKE '%sysco%intermountain%' 
        ORDER BY created_at DESC 
        LIMIT 1
    )
)
SELECT 
    cp.item_name,
    pp.previous_price,
    cp.current_price,
    ROUND(
        ((cp.current_price - COALESCE(pp.previous_price, cp.current_price)) / 
         COALESCE(pp.previous_price, cp.current_price) * 100)::numeric, 
        2
    ) as price_change_percent,
    pp.previous_date,
    cp.current_date
FROM current_prices cp
LEFT JOIN previous_prices pp ON pp.inventory_item_id = cp.inventory_item_id 
    AND pp.rn = 1
ORDER BY price_change_percent DESC NULLS LAST;

\echo ''

-- ============================================================================
-- 9. INVENTORY ALERTS (Price Alerts, Low Stock, etc.)
-- ============================================================================
\echo '9️⃣  INVENTORY ALERTS'
\echo '--------------------'
SELECT 
    ia.id,
    ia.alert_type,
    ia.severity,
    ia.title,
    ia.message,
    ia.is_read,
    ia.created_at
FROM inventory_alerts ia
WHERE ia.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY ia.severity DESC, ia.created_at DESC;

\echo ''
\echo 'Alert Summary:'
SELECT 
    ia.alert_type,
    ia.severity,
    COUNT(*) as count
FROM inventory_alerts ia
WHERE ia.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
GROUP BY ia.alert_type, ia.severity
ORDER BY ia.severity DESC;

\echo ''

-- ============================================================================
-- 10. PROCESSED EVENTS (Idempotency Check)
-- ============================================================================
\echo '🔟 PROCESSED EVENTS (Idempotency)'
\echo '----------------------------------'
SELECT 
    pe.id,
    pe.event_type,
    pe.event_id,
    pe.processing_result,
    pe.error_message,
    pe.processed_at
FROM processed_events pe
WHERE pe.event_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
  AND pe.event_type = 'invoice_saved';

\echo ''

-- ============================================================================
-- 11. UNIT CONVERSIONS APPLIED
-- ============================================================================
\echo '1️⃣1️⃣  UNIT CONVERSIONS'
\echo '---------------------'
SELECT 
    it.id,
    ii.name as item_name,
    inv_item.pack_size as invoice_pack_size,
    it.quantity_change as converted_quantity,
    ii.unit_of_measure as base_unit,
    it.notes
FROM inventory_transactions it
JOIN inventory_items ii ON ii.id = it.inventory_item_id
JOIN invoice_items inv_item ON inv_item.invoice_id = it.invoice_id
WHERE it.invoice_id = (
    SELECT id FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
  AND it.notes LIKE '%conversion%'
ORDER BY it.created_at;

\echo ''

-- ============================================================================
-- 12. COMPLETE ECOSYSTEM SUMMARY
-- ============================================================================
\echo '1️⃣2️⃣  COMPLETE ECOSYSTEM SUMMARY'
\echo '================================'

WITH invoice_data AS (
    SELECT id, total, created_at
    FROM invoices 
    WHERE invoice_number = '1277265' 
      AND vendor_name ILIKE '%sysco%intermountain%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    '✅ Invoice Saved' as checkpoint,
    CASE WHEN EXISTS (SELECT 1 FROM invoice_data) THEN '✓' ELSE '✗' END as status,
    (SELECT COUNT(*) FROM invoice_data) as count
UNION ALL
SELECT 
    '✅ Line Items Created',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM invoice_items
WHERE invoice_id = (SELECT id FROM invoice_data)
UNION ALL
SELECT 
    '✅ Vendor Identified',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM vendors
WHERE normalized_name = 'sysco intermountain'
UNION ALL
SELECT 
    '✅ Items Mapped (Fuzzy)',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM vendor_item_mappings vim
WHERE vim.vendor_id = (SELECT id FROM vendors WHERE normalized_name = 'sysco intermountain')
  AND vim.vendor_item_number IN (
    SELECT item_number FROM invoice_items WHERE invoice_id = (SELECT id FROM invoice_data)
)
UNION ALL
SELECT 
    '✅ Inventory Updated',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM inventory_transactions
WHERE invoice_id = (SELECT id FROM invoice_data)
UNION ALL
SELECT 
    '✅ Prices Tracked',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM price_history
WHERE invoice_id = (SELECT id FROM invoice_data)
UNION ALL
SELECT 
    '✅ Alerts Generated',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM inventory_alerts
WHERE invoice_id = (SELECT id FROM invoice_data)
UNION ALL
SELECT 
    '✅ Processing Complete',
    CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END,
    COUNT(*)
FROM processed_events
WHERE event_id = (SELECT id FROM invoice_data)
  AND event_type = 'invoice_saved';

\echo ''
\echo '============================================================================'
\echo 'VERIFICATION COMPLETE'
\echo '============================================================================'
