-- Complete analytics seed with ALL required fields
-- Run this in Supabase SQL Editor

-- Step 1: Clean up old TREND data
DELETE FROM invoice_items WHERE invoice_id IN (
    SELECT id FROM invoices 
    WHERE invoice_number LIKE 'TREND-%' 
    AND user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
);

DELETE FROM invoices 
WHERE invoice_number LIKE 'TREND-%' 
AND user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- Step 2: Create invoices with proper structure
WITH invoice_data AS (
    SELECT 
        (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com') as user_id,
        'TREND-' || TO_CHAR(CURRENT_DATE - (week * 7 + inv * 2), 'YYYYMMDD') || '-' || inv as invoice_number,
        CURRENT_DATE - (week * 7 + inv * 2) as invoice_date,
        CASE ((week + inv) % 4)
            WHEN 0 THEN 'Sysco Food Services'
            WHEN 1 THEN 'US Foods'
            WHEN 2 THEN 'Restaurant Depot'
            ELSE 'Gordon Food Service'
        END as vendor_name,
        week,
        inv
    FROM generate_series(0, 11) AS week
    CROSS JOIN generate_series(1, 2) AS inv
)
INSERT INTO invoices (user_id, invoice_number, invoice_date, vendor_name, subtotal, tax, total, parse_method, status, raw_file_url)
SELECT 
    user_id,
    invoice_number,
    invoice_date,
    vendor_name,
    1000.00,
    80.00,
    1080.00,
    'manual',
    'approved',
    'seed_complete_trend_data'
FROM invoice_data;

-- Step 3: Add FRESH MOZZARELLA - INCREASING 15% over 90 days
WITH price_calc AS (
    SELECT 
        i.id as invoice_id,
        75.00 + (12 - ((CURRENT_DATE - i.invoice_date) / 7)) * 1.20 as unit_price
    FROM invoices i
    WHERE i.invoice_number LIKE 'TREND-%'
    AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    invoice_id,
    'MOZZ-FRESH-001',
    'FRESH MOZZARELLA CHEESE',
    1.00,
    '6/5 lb',
    unit_price,
    unit_price * 1.00,
    'REFRIGERATED'
FROM price_calc;

-- Step 4: Add SHREDDED MOZZARELLA - INCREASING 8%
WITH price_calc AS (
    SELECT 
        i.id as invoice_id,
        68.00 + (12 - ((CURRENT_DATE - i.invoice_date) / 7)) * 0.50 as unit_price
    FROM invoices i
    WHERE i.invoice_number LIKE 'TREND-%'
    AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    invoice_id,
    'MOZZ-SHRED-002',
    'SHREDDED MOZZARELLA CHEESE',
    2.00,
    '4/5 lb',
    unit_price,
    unit_price * 2.00,
    'REFRIGERATED'
FROM price_calc;

-- Step 5: Add ROMANO CHEESE - DECREASING 12%
WITH price_calc AS (
    SELECT 
        i.id as invoice_id,
        48.00 - (12 - ((CURRENT_DATE - i.invoice_date) / 7)) * 0.50 as unit_price
    FROM invoices i
    WHERE i.invoice_number LIKE 'TREND-%'
    AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    invoice_id,
    'ROMANO-003',
    'ROMANO CHEESE GRATED',
    1.00,
    '2/5 lb',
    unit_price,
    unit_price * 1.00,
    'REFRIGERATED'
FROM price_calc;

-- Step 6: Add PEPPERONI - VENDOR PRICE DIFFERENCES (for savings opportunities)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    i.id,
    'PEPP-004',
    'PEPPERONI SLICED',
    1.00,
    '2/5 lb',
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
    'REFRIGERATED'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- Step 7: Add ITALIAN SAUSAGE - RECENT SPIKE (20%)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    i.id,
    'SAUSAGE-005',
    'ITALIAN SAUSAGE BULK',
    1.00,
    '2/5 lb',
    CASE 
        WHEN i.invoice_date >= CURRENT_DATE - 14 THEN 42.00  -- Recent spike
        ELSE 35.00  -- Normal price
    END,
    CASE 
        WHEN i.invoice_date >= CURRENT_DATE - 14 THEN 42.00
        ELSE 35.00
    END,
    'REFRIGERATED'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- Step 8: Add BACON - MODERATE INCREASING (6%)
WITH price_calc AS (
    SELECT 
        i.id as invoice_id,
        46.00 + (12 - ((CURRENT_DATE - i.invoice_date) / 7)) * 0.25 as unit_price
    FROM invoices i
    WHERE i.invoice_number LIKE 'TREND-%'
    AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    invoice_id,
    'BACON-006',
    'BACON COOKED CRUMBLED',
    1.00,
    '4/2.5 lb',
    unit_price,
    unit_price * 1.00,
    'REFRIGERATED'
FROM price_calc;

-- Step 9: Add MUSHROOMS - DECREASING (7%)
WITH price_calc AS (
    SELECT 
        i.id as invoice_id,
        30.00 - (12 - ((CURRENT_DATE - i.invoice_date) / 7)) * 0.20 as unit_price
    FROM invoices i
    WHERE i.invoice_number LIKE 'TREND-%'
    AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com')
)
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    invoice_id,
    'MUSH-007',
    'MUSHROOMS SLICED',
    1.00,
    '4/5 lb',
    unit_price,
    unit_price * 1.00,
    'REFRIGERATED'
FROM price_calc;

-- Step 10: Add OLIVE OIL - STABLE
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    i.id,
    'OIL-008',
    'OLIVE OIL EXTRA VIRGIN',
    1.00,
    '4/1 gal',
    52.00 + (RANDOM() * 1.5 - 0.75),
    52.00 + (RANDOM() * 1.5 - 0.75),
    'DRY'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- Step 11: Add PIZZA SAUCE - STABLE
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    i.id,
    'SAUCE-009',
    'PIZZA SAUCE',
    2.00,
    '6/#10 can',
    32.00 + (RANDOM() * 1 - 0.5),
    (32.00 + (RANDOM() * 1 - 0.5)) * 2.00,
    'DRY'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- Step 12: Add ASIAGO - STABLE
INSERT INTO invoice_items (invoice_id, item_number, description, quantity, pack_size, unit_price, extended_price, category)
SELECT 
    i.id,
    'ASIAGO-010',
    'ASIAGO CHEESE SHREDDED',
    1.00,
    '2/5 lb',
    45.00 + (RANDOM() * 2 - 1),
    45.00 + (RANDOM() * 2 - 1),
    'REFRIGERATED'
FROM invoices i
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');

-- VERIFICATION: Show what was created
SELECT 
    '✅ SUCCESS!' as status,
    COUNT(DISTINCT i.id) as invoices_created,
    COUNT(ii.id) as items_created,
    COUNT(DISTINCT ii.description) as unique_items,
    MIN(i.invoice_date) as oldest_invoice,
    MAX(i.invoice_date) as newest_invoice
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.invoice_number LIKE 'TREND-%'
AND i.user_id = (SELECT id FROM auth.users WHERE email = 'dadbodgeoff@gmail.com');
