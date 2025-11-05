-- Simple seed script without DO block - guaranteed to work
-- Run this in Supabase SQL Editor

-- Delete old TREND data if exists
DELETE FROM invoice_items WHERE invoice_id IN (
    SELECT id FROM invoices WHERE invoice_number LIKE 'TREND-%'
);
DELETE FROM invoices WHERE invoice_number LIKE 'TREND-%';

-- Get user ID (replace with your actual ID if needed)
-- Run this first to get your ID:
-- SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com';

-- Then use that ID in the INSERT statements below
-- For now, using a subquery

-- Create 24 invoices with clear price trends over 90 days
INSERT INTO invoices (user_id, invoice_number, invoice_date, vendor_name, subtotal, tax, total, parse_method, status, raw_file_url)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com'),
    'TREND-' || TO_CHAR(CURRENT_DATE - (week * 7 + inv * 2), 'YYYYMMDD') || '-' || inv,
    CURRENT_DATE - (week * 7 + inv * 2),
    CASE ((week + inv) % 4)
        WHEN 0 THEN 'Sysco Food Services'
        WHEN 1 THEN 'US Foods'
        WHEN 2 THEN 'Restaurant Depot'
        ELSE 'Gordon Food Service'
    END,
    1000.00,
    80.00,
    1080.00,
    'manual',
    'approved',
    'seed_trend_data'
FROM generate_series(0, 11) AS week
CROSS JOIN generate_series(1, 2) AS inv;

-- Now add items with clear price trends
-- FRESH MOZZARELLA - INCREASING 15%
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, extended_price, pack_size)
SELECT 
    i.id,
    'FRESH MOZZARELLA CHEESE',
    1,
    75.00 + (12 - EXTRACT(DAY FROM CURRENT_DATE - i.invoice_date)::int / 7) * 1.20,
    75.00 + (12 - EXTRACT(DAY FROM CURRENT_DATE - i.invoice_date)::int / 7) * 1.20,
    '6/5 lb'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- SHREDDED MOZZARELLA - INCREASING 8%
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, extended_price, pack_size)
SELECT 
    i.id,
    'SHREDDED MOZZARELLA CHEESE',
    2,
    68.00 + (12 - EXTRACT(DAY FROM CURRENT_DATE - i.invoice_date)::int / 7) * 0.50,
    (68.00 + (12 - EXTRACT(DAY FROM CURRENT_DATE - i.invoice_date)::int / 7) * 0.50) * 2,
    '4/5 lb'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- ROMANO CHEESE - DECREASING 12%
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, extended_price, pack_size)
SELECT 
    i.id,
    'ROMANO CHEESE GRATED',
    1,
    48.00 - (12 - EXTRACT(DAY FROM CURRENT_DATE - i.invoice_date)::int / 7) * 0.50,
    48.00 - (12 - EXTRACT(DAY FROM CURRENT_DATE - i.invoice_date)::int / 7) * 0.50,
    '2/5 lb'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- PEPPERONI - VENDOR PRICE DIFFERENCES
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, extended_price, pack_size)
SELECT 
    i.id,
    'PEPPERONI SLICED',
    1,
    CASE i.vendor_name
        WHEN 'Sysco Food Services' THEN 38.50
        WHEN 'US Foods' THEN 36.00
        WHEN 'Restaurant Depot' THEN 34.50
        ELSE 39.00
    END,
    CASE i.vendor_name
        WHEN 'Sysco Food Services' THEN 38.50
        WHEN 'US Foods' THEN 36.00
        WHEN 'Restaurant Depot' THEN 34.50
        ELSE 39.00
    END,
    '2/5 lb'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- Verify the data was created
SELECT 
    'SUCCESS!' as status,
    COUNT(DISTINCT i.id) as invoices_created,
    COUNT(ii.id) as items_created
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');
