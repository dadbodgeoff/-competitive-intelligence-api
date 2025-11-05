-- ============================================================================
-- MIGRATION 027: Fix Menu Item Ingredients - Remove inventory_item_id
-- Purpose: Clean up duplicate foreign keys, keep only invoice_item_id
-- ============================================================================
-- 
-- ISSUE: menu_item_ingredients has BOTH inventory_item_id AND invoice_item_id
-- SOLUTION: Remove inventory_item_id, keep only invoice_item_id
-- 
-- ARCHITECTURE:
-- ✅ invoice_items (source of truth - read only)
-- ✅ menu_item_ingredients.invoice_item_id → invoice_items.id
-- ❌ Remove: menu_item_ingredients.inventory_item_id → inventory_items.id
-- 
-- ============================================================================

-- 1. Check if inventory_item_id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_item_ingredients' 
        AND column_name = 'inventory_item_id'
    ) THEN
        RAISE NOTICE '⚠️  Found inventory_item_id column - will remove it';
        
        -- Drop the foreign key constraint first
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'menu_item_ingredients_inventory_item_id_fkey'
            AND table_name = 'menu_item_ingredients'
        ) THEN
            ALTER TABLE menu_item_ingredients 
            DROP CONSTRAINT menu_item_ingredients_inventory_item_id_fkey;
            RAISE NOTICE '✅ Dropped foreign key constraint: menu_item_ingredients_inventory_item_id_fkey';
        END IF;
        
        -- Drop the column
        ALTER TABLE menu_item_ingredients 
        DROP COLUMN inventory_item_id;
        RAISE NOTICE '✅ Dropped column: inventory_item_id';
        
    ELSE
        RAISE NOTICE '✅ Column inventory_item_id does not exist - already clean';
    END IF;
END $$;

-- 2. Verify invoice_item_id column exists and has correct constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_item_ingredients' 
        AND column_name = 'invoice_item_id'
    ) THEN
        RAISE EXCEPTION '❌ CRITICAL: invoice_item_id column does not exist!';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'menu_item_ingredients_invoice_item_id_fkey'
        AND table_name = 'menu_item_ingredients'
    ) THEN
        RAISE EXCEPTION '❌ CRITICAL: invoice_item_id foreign key constraint does not exist!';
    END IF;
    
    RAISE NOTICE '✅ Verified: invoice_item_id column and foreign key exist';
END $$;

-- 3. Update the unique constraint to use invoice_item_id (not inventory_item_id)
DO $$
BEGIN
    -- Drop old unique constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_menu_inventory_link'
        AND table_name = 'menu_item_ingredients'
    ) THEN
        ALTER TABLE menu_item_ingredients 
        DROP CONSTRAINT unique_menu_inventory_link;
        RAISE NOTICE '✅ Dropped old constraint: unique_menu_inventory_link';
    END IF;
    
    -- Create new unique constraint with invoice_item_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_menu_invoice_link'
        AND table_name = 'menu_item_ingredients'
    ) THEN
        ALTER TABLE menu_item_ingredients 
        ADD CONSTRAINT unique_menu_invoice_link 
        UNIQUE(menu_item_id, menu_item_price_id, invoice_item_id);
        RAISE NOTICE '✅ Created new constraint: unique_menu_invoice_link';
    END IF;
END $$;

-- 4. Update table comment to reflect correct architecture
COMMENT ON TABLE menu_item_ingredients IS 
    'Recipe ingredients for menu items - links to invoice_items (READ ONLY source of truth)';

COMMENT ON COLUMN menu_item_ingredients.invoice_item_id IS 
    'READ-ONLY reference to invoice_items (source of truth for pricing and pack size)';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_has_inventory_item_id BOOLEAN;
    v_has_invoice_item_id BOOLEAN;
    v_fk_count INTEGER;
BEGIN
    -- Check columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_item_ingredients' 
        AND column_name = 'inventory_item_id'
    ) INTO v_has_inventory_item_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_item_ingredients' 
        AND column_name = 'invoice_item_id'
    ) INTO v_has_invoice_item_id;
    
    -- Check foreign keys
    SELECT COUNT(*) INTO v_fk_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'menu_item_ingredients'
    AND constraint_type = 'FOREIGN KEY';
    
    -- Verify correct state
    IF v_has_inventory_item_id THEN
        RAISE EXCEPTION '❌ FAILED: inventory_item_id column still exists!';
    END IF;
    
    IF NOT v_has_invoice_item_id THEN
        RAISE EXCEPTION '❌ FAILED: invoice_item_id column does not exist!';
    END IF;
    
    IF v_fk_count != 3 THEN
        RAISE EXCEPTION '❌ FAILED: Expected 3 foreign keys, found %', v_fk_count;
    END IF;
    
    RAISE NOTICE '✅ Migration 027 completed successfully';
    RAISE NOTICE '   - Removed: inventory_item_id column';
    RAISE NOTICE '   - Kept: invoice_item_id → invoice_items';
    RAISE NOTICE '   - Foreign Keys: % (menu_item_id, menu_item_price_id, invoice_item_id)', v_fk_count;
    RAISE NOTICE '   - Architecture: Menu reads from invoice_items (source of truth)';
END $$;
