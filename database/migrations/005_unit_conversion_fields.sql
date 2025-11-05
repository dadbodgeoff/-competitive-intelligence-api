-- ================================================================================
-- UNIT CONVERSION ENHANCEMENTS
-- Migration 005: Add base unit tracking for inventory items
-- ================================================================================

-- Add base unit fields to inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS base_unit TEXT,
ADD COLUMN IF NOT EXISTS conversion_factor DECIMAL(12,6);

-- Create index for base unit queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_base_unit 
ON inventory_items(base_unit);

-- Update existing items with base units based on category
UPDATE inventory_items 
SET base_unit = CASE
    WHEN category IN ('proteins', 'produce', 'dairy', 'frozen', 'dry_goods') THEN 'lb'
    WHEN category IN ('beverages', 'cleaning') THEN 'ga'
    ELSE 'ea'
END
WHERE base_unit IS NULL;

-- Set conversion factors for common units
UPDATE inventory_items
SET conversion_factor = CASE unit_of_measure
    -- Weight to pounds
    WHEN 'lb' THEN 1.0
    WHEN 'lbs' THEN 1.0
    WHEN 'oz' THEN 0.0625
    WHEN 'kg' THEN 2.20462
    WHEN 'g' THEN 0.00220462
    -- Volume to gallons
    WHEN 'ga' THEN 1.0
    WHEN 'gal' THEN 1.0
    WHEN 'qt' THEN 0.25
    WHEN 'l' THEN 0.264172
    WHEN 'lt' THEN 0.264172
    -- Count to each
    WHEN 'ea' THEN 1.0
    WHEN 'each' THEN 1.0
    WHEN 'ct' THEN 1.0
    WHEN 'dz' THEN 12.0
    ELSE 1.0
END
WHERE conversion_factor IS NULL;

-- ================================================================================
-- VERIFICATION
-- ================================================================================

-- Check base units assigned
SELECT 
    base_unit,
    COUNT(*) as item_count
FROM inventory_items
GROUP BY base_unit
ORDER BY item_count DESC;

-- Check conversion factors
SELECT 
    unit_of_measure,
    base_unit,
    conversion_factor,
    COUNT(*) as item_count
FROM inventory_items
GROUP BY unit_of_measure, base_unit, conversion_factor
ORDER BY item_count DESC;

-- ================================================================================
-- MIGRATION COMPLETE
-- ================================================================================
-- ✅ Base unit fields added
-- ✅ Existing items updated
-- ✅ Conversion factors set
-- ✅ Index created
-- ================================================================================
