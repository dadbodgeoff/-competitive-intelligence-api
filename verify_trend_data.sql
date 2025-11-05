-- Verify the TREND data was seeded correctly
-- Run this in Supabase SQL Editor

-- 1. Check invoice counts
SELECT 
    'Invoice Summary' as check_type,
    COUNT(*) as total_invoices,
    COUNT(CASE WHEN invoice_number LIKE 'TREND-%' THEN 1 END) as trend_invoices,
    COUNT(CASE WHEN invoice_number LIKE 'SEED-%' THEN 1 END) as seed_invoices
FROM invoices
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- 2. Check items with price trends
SELECT 
    'Price Trends' as check_type,
    ii.description,
    COUNT(*) as purchase_count,
    MIN(ii.unit_price) as min_price,
    MAX(ii.unit_price) as max_price,
    ROUND(((MAX(ii.unit_price) - MIN(ii.unit_price)) / MIN(ii.unit_price) * 100)::numeric, 1) as price_change_percent
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
WHERE i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
AND i.invoice_number LIKE 'TREND-%'
GROUP BY ii.description
HAVING COUNT(*) >= 5
ORDER BY price_change_percent DESC;

-- 3. Test the items-list endpoint data
SELECT 
    'Items List Test' as check_type,
    description,
    last_paid_price,
    last_paid_date,
    last_paid_vendor
FROM (
    SELECT DISTINCT ON (ii.description)
        ii.description,
        ii.unit_price as last_paid_price,
        i.invoice_date as last_paid_date,
        i.vendor_name as last_paid_vendor
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
    ORDER BY ii.description, i.invoice_date DESC
) subq
ORDER BY last_paid_date DESC
LIMIT 10;
