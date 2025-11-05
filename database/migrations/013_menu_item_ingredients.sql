-- ============================================================================
-- MIGRATION 013: Menu Item Ingredients (Plate Costing System)
-- Purpose: Link menu items to inventory items for recipe costing
-- ============================================================================
-- 
-- ARCHITECTURE GUARANTEE:
-- This table is OWNED by the Menu module
-- It only REFERENCES inventory_items (READ ONLY)
-- It NEVER modifies invoice/inventory source of truth
-- 
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: menu_item_ingredients
-- Purpose: Store recipe ingredients for menu items with quantities
-- ============================================================================

CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Menu module owns these relationships
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    menu_item_price_id UUID REFERENCES menu_item_prices(id) ON DELETE CASCADE,
    
    -- READ-ONLY reference to invoice source of truth
    -- ON DELETE RESTRICT prevents deletion of inventory items that are linked
    -- This protects the invoice module's data integrity
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    
    -- Recipe data (menu module owns this)
    quantity_per_serving DECIMAL(12,3) NOT NULL CHECK (quantity_per_serving > 0),
    unit_of_measure TEXT NOT NULL,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicate ingredients for same menu item/size combination
    CONSTRAINT unique_menu_inventory_link UNIQUE(menu_item_id, menu_item_price_id, inventory_item_id)
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_menu_ingredients_menu_item 
    ON menu_item_ingredients(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_menu_ingredients_inventory 
    ON menu_item_ingredients(inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_menu_ingredients_price 
    ON menu_item_ingredients(menu_item_price_id);

-- ============================================================================
-- COMMENTS for documentation
-- ============================================================================

COMMENT ON TABLE menu_item_ingredients IS 
    'Recipe ingredients for menu items - links to inventory_items (READ ONLY)';

COMMENT ON COLUMN menu_item_ingredients.menu_item_id IS 
    'Menu item this ingredient belongs to';

COMMENT ON COLUMN menu_item_ingredients.menu_item_price_id IS 
    'Specific size/price variant (NULL = applies to all sizes)';

COMMENT ON COLUMN menu_item_ingredients.inventory_item_id IS 
    'READ-ONLY reference to inventory_items (source of truth for pricing)';

COMMENT ON COLUMN menu_item_ingredients.quantity_per_serving IS 
    'Amount of ingredient used per serving (e.g., 3.0 oz of lettuce)';

COMMENT ON COLUMN menu_item_ingredients.unit_of_measure IS 
    'Unit for quantity (should match inventory_item unit for accurate costing)';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own menu ingredients" ON menu_item_ingredients;
DROP POLICY IF EXISTS "Users can insert own menu ingredients" ON menu_item_ingredients;
DROP POLICY IF EXISTS "Users can update own menu ingredients" ON menu_item_ingredients;
DROP POLICY IF EXISTS "Users can delete own menu ingredients" ON menu_item_ingredients;

-- Policy: Users can view their own menu ingredients
CREATE POLICY "Users can view own menu ingredients" ON menu_item_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_ingredients.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- Policy: Users can insert ingredients for their own menu items
CREATE POLICY "Users can insert own menu ingredients" ON menu_item_ingredients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_ingredients.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- Policy: Users can update their own menu ingredients
CREATE POLICY "Users can update own menu ingredients" ON menu_item_ingredients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_ingredients.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own menu ingredients
CREATE POLICY "Users can delete own menu ingredients" ON menu_item_ingredients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_ingredients.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

DO $$
BEGIN
    -- Verify table was created
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'menu_item_ingredients') = 1,
           'menu_item_ingredients table was not created';
    
    -- Verify indexes were created
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'menu_item_ingredients') >= 3,
           'Not all indexes were created for menu_item_ingredients';
    
    -- Verify RLS is enabled
    ASSERT (SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'menu_item_ingredients'
            AND rowsecurity = true) = 1,
           'RLS not enabled on menu_item_ingredients';
    
    -- Verify RLS policies were created
    ASSERT (SELECT COUNT(*) FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'menu_item_ingredients') = 4,
           'Not all RLS policies were created for menu_item_ingredients';
    
    RAISE NOTICE '✅ Migration 013 completed successfully';
    RAISE NOTICE '   - Table: menu_item_ingredients created';
    RAISE NOTICE '   - Indexes: 3 created';
    RAISE NOTICE '   - RLS: Enabled with 4 policies';
    RAISE NOTICE '   - Foreign Keys: 3 created (menu_item_id, menu_item_price_id, inventory_item_id)';
    RAISE NOTICE '   - Constraints: unique_menu_inventory_link, quantity_per_serving > 0';
END $$;

-- ============================================================================
-- EXAMPLE USAGE (for testing)
-- ============================================================================

-- Example: Link "Burger Bun" inventory item to "Burger" menu item
-- 
-- INSERT INTO menu_item_ingredients (
--     menu_item_id,
--     menu_item_price_id,
--     inventory_item_id,
--     quantity_per_serving,
--     unit_of_measure,
--     notes
-- ) VALUES (
--     'menu-item-uuid',
--     NULL,  -- NULL = applies to all sizes
--     'inventory-item-uuid',
--     1.0,
--     'ea',
--     'Standard burger bun'
-- );

-- Example: Query recipe with costs
-- 
-- SELECT 
--     mi.item_name as menu_item,
--     ii.name as ingredient,
--     mii.quantity_per_serving,
--     mii.unit_of_measure,
--     ii.average_unit_cost,
--     (mii.quantity_per_serving * ii.average_unit_cost) as ingredient_cost
-- FROM menu_item_ingredients mii
-- JOIN menu_items mi ON mi.id = mii.menu_item_id
-- JOIN inventory_items ii ON ii.id = mii.inventory_item_id
-- WHERE mi.id = 'menu-item-uuid';

