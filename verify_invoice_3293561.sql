-- Verify invoice #3293561 from PERFORMANCE FOODSERVICE was saved correctly

-- Check invoice header
SELECT 
    id,
    invoice_number,
    vendor_name,
    invoice_date,
    subtotal,
    tax,
    total,
    parse_method,
    parse_cost,
    parse_time_seconds,
    parse_tokens_used,
    status,
    created_at
FROM invoices
WHERE invoice_number = '3293561'
AND vendor_name ILIKE '%PERFORMANCE FOODSERVICE%'
ORDER BY created_at DESC
LIMIT 1;

-- Check line items count
SELECT 
    i.invoice_number,
    i.vendor_name,
    COUNT(ii.id) as line_items_count,
    SUM(ii.extended_price) as total_from_items
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.invoice_number = '3293561'
AND i.vendor_name ILIKE '%PERFORMANCE FOODSERVICE%'
GROUP BY i.id, i.invoice_number, i.vendor_name
ORDER BY i.created_at DESC
LIMIT 1;

-- Check parse logs
SELECT 
    model_used,
    tokens_used,
    cost,
    parse_time_seconds,
    success,
    created_at
FROM invoice_parse_logs
WHERE invoice_id IN (
    SELECT id FROM invoices 
    WHERE invoice_number = '3293561'
    AND vendor_name ILIKE '%PERFORMANCE FOODSERVICE%'
    ORDER BY created_at DESC
    LIMIT 1
);

-- Sample of line items (first 5)
SELECT 
    ii.item_number,
    ii.description,
    ii.quantity,
    ii.pack_size,
    ii.unit_price,
    ii.extended_price,
    ii.category
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
WHERE i.invoice_number = '3293561'
AND i.vendor_name ILIKE '%PERFORMANCE FOODSERVICE%'
ORDER BY ii.created_at
LIMIT 5;
