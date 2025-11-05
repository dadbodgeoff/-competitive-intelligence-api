-- ============================================================================
-- MIGRATION 025: Add invoice_item_id to menu_item_ingredients
-- Purpose: Link ingredients directly to invoice_items (source of truth)
-- ============================================================================
-- 
-- ARCHITECTURE FIX:
-- Previously: menu_item_ingredients -> inventory_items -> invoice_items
-- Now: menu_item_ingredients -> invoice_items (direct link to source of truth)
-- 
-- This removes the unnecessary inventory_items intermediary for menu recipes
-- ============================================================================

-- Add invoice_item_id column (nullable initially for migration)
ALTER TABLE menu_item_ingredients 
ADD COLUMN IF NOT EXISTS invoice_item_id UUID REFERENCES invoice_items(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_invoice_item 
    ON menu_item_ingredients(invoice_item_id);

-- Make inventory_item_id nullable (will be deprecated)
ALTER TABLE menu_item_ingredients 
ALTER COLUMN inventory_item_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN menu_item_ingredients.invoice_item_id IS 
    'Direct link to invoice_items (source of truth for pricing and pack size)';

COMMENT ON COLUMN menu_item_ingredients.inventory_item_id IS 
    'DEPRECATED: Use invoice_item_id instead. Kept for backward compatibility.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Verify column was added
    ASSERT (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'menu_item_ingredients'
            AND column_name = 'invoice_item_id') = 1,
           'invoice_item_id column was not added';
    
    -- Verify index was created
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'menu_item_ingredients'
            AND indexname = 'idx_menu_ingredients_invoice_item') = 1,
           'Index on invoice_item_id was not created';
    
    RAISE NOTICE '✅ Migration 025 completed successfully';
    RAISE NOTICE '   - Column: invoice_item_id added to menu_item_ingredients';
    RAISE NOTICE '   - Index: idx_menu_ingredients_invoice_item created';
    RAISE NOTICE '   - inventory_item_id is now nullable (deprecated)';
END $$;
