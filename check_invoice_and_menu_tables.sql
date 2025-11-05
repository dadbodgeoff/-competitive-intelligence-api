-- ============================================================================
-- CHECK INVOICE_ITEMS TABLE (SOURCE OF TRUTH - READ ONLY)
-- ============================================================================

-- 1. Get invoice_items table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'invoice_items'
ORDER BY ordinal_position;

-- 2. Sample invoice_items data
SELECT 
    id,
    invoice_id,
    description,
    pack_size,
    unit_price,
    quantity,
    extended_price,
    created_at
FROM invoice_items
LIMIT 5;

-- 3. Count invoice_items
SELECT COUNT(*) as total_invoice_items FROM invoice_items;

-- ============================================================================
-- CHECK MENU_ITEM_INGREDIENTS TABLE (RECIPE TRACKING - MENU BUCKET)
-- ============================================================================

-- 4. Get menu_item_ingredients table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'menu_item_ingredients'
ORDER BY ordinal_position;

-- 5. Check foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'menu_item_ingredients';

-- 6. Sample menu_item_ingredients data with joined invoice_items
SELECT 
    mii.id,
    mii.menu_item_id,
    mii.invoice_item_id,
    mii.quantity_per_serving,
    mii.unit_of_measure,
    mii.notes,
    ii.description as invoice_item_description,
    ii.pack_size,
    ii.unit_price as invoice_unit_price,
    mii.created_at
FROM menu_item_ingredients mii
LEFT JOIN invoice_items ii ON ii.id = mii.invoice_item_id
LIMIT 5;

-- 7. Count menu_item_ingredients
SELECT COUNT(*) as total_recipe_ingredients FROM menu_item_ingredients;

-- ============================================================================
-- VERIFY ARCHITECTURE: Menu reads from invoice_items but doesn't write back
-- ============================================================================

-- 8. Check if there are any triggers on invoice_items that might be affected by menu
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'invoice_items';

-- 9. Verify menu_item_ingredients references invoice_items (not inventory_items)
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conrelid = 'menu_item_ingredients'::regclass
AND contype = 'f';
