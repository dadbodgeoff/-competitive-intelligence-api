-- ============================================================================
-- MIGRATION 012: Menu Management System
-- ============================================================================
-- Description: Complete menu management system for restaurant owners
-- Author: Menu Module Implementation
-- Date: 2025-01-01
-- Dependencies: Requires base schema (users table)
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Restaurant menus (one active menu per user, supports versioning)
CREATE TABLE IF NOT EXISTS restaurant_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    menu_version INTEGER DEFAULT 1,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    parse_metadata JSONB, -- Gemini extraction metadata (model, cost, time)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, menu_version)
);

COMMENT ON TABLE restaurant_menus IS 'Restaurant menu versions - source of truth for menu data';
COMMENT ON COLUMN restaurant_menus.status IS 'active = current menu, archived = old version';
COMMENT ON COLUMN restaurant_menus.parse_metadata IS 'Gemini extraction metadata: model_used, parse_time_seconds, cost, items_extracted';

-- Menu categories (Appetizers, Pizza, Pasta, etc.)
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES restaurant_menus(id) ON DELETE CASCADE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(menu_id, category_name)
);

COMMENT ON TABLE menu_categories IS 'Menu categories for organizing items';
COMMENT ON COLUMN menu_categories.display_order IS 'Order to display categories (0 = first)';

-- Menu items (source of truth for user's menu)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES restaurant_menus(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    options JSONB, -- ["Mild", "Hot", "Teriyaki"] or null
    notes TEXT, -- Special instructions, timing, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE menu_items IS 'Individual menu items with descriptions and options';
COMMENT ON COLUMN menu_items.options IS 'JSON array of flavor/style options: ["Mild", "Hot", "Teriyaki"]';
COMMENT ON COLUMN menu_items.notes IS 'Special notes like "Please Allow 15 Minutes" or "Market Price"';

-- Menu item prices (supports multiple sizes/variants)
CREATE TABLE IF NOT EXISTS menu_item_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
    size_label VARCHAR(50), -- "Small", "Large", "8 Pieces", null for single price
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE menu_item_prices IS 'Prices for menu items - supports multiple sizes per item';
COMMENT ON COLUMN menu_item_prices.size_label IS 'Size/variant label or null for single-price items';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_menus_user_id ON restaurant_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_status ON restaurant_menus(status);
CREATE INDEX IF NOT EXISTS idx_menus_user_status ON restaurant_menus(user_id, status);

CREATE INDEX IF NOT EXISTS idx_categories_menu_id ON menu_categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON menu_categories(menu_id, display_order);

CREATE INDEX IF NOT EXISTS idx_items_menu_id ON menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_display_order ON menu_items(category_id, display_order);

CREATE INDEX IF NOT EXISTS idx_prices_item_id ON menu_item_prices(menu_item_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_prices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own menus" ON restaurant_menus;
DROP POLICY IF EXISTS "Users can insert own menus" ON restaurant_menus;
DROP POLICY IF EXISTS "Users can update own menus" ON restaurant_menus;
DROP POLICY IF EXISTS "Users can delete own menus" ON restaurant_menus;

DROP POLICY IF EXISTS "Users can view own categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON menu_categories;

DROP POLICY IF EXISTS "Users can view own items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert own items" ON menu_items;
DROP POLICY IF EXISTS "Users can update own items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own items" ON menu_items;

DROP POLICY IF EXISTS "Users can view own prices" ON menu_item_prices;
DROP POLICY IF EXISTS "Users can insert own prices" ON menu_item_prices;
DROP POLICY IF EXISTS "Users can update own prices" ON menu_item_prices;
DROP POLICY IF EXISTS "Users can delete own prices" ON menu_item_prices;

-- Policies for restaurant_menus
CREATE POLICY "Users can view own menus" ON restaurant_menus
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menus" ON restaurant_menus
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menus" ON restaurant_menus
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own menus" ON restaurant_menus
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for menu_categories (via menu_id join)
CREATE POLICY "Users can view own categories" ON menu_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_categories.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own categories" ON menu_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_categories.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own categories" ON menu_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_categories.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own categories" ON menu_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_categories.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- Policies for menu_items (via menu_id join)
CREATE POLICY "Users can view own items" ON menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_items.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own items" ON menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_items.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own items" ON menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_items.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own items" ON menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM restaurant_menus 
            WHERE restaurant_menus.id = menu_items.menu_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- Policies for menu_item_prices (via menu_item_id join)
CREATE POLICY "Users can view own prices" ON menu_item_prices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_prices.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own prices" ON menu_item_prices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_prices.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own prices" ON menu_item_prices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_prices.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own prices" ON menu_item_prices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM menu_items
            JOIN restaurant_menus ON restaurant_menus.id = menu_items.menu_id
            WHERE menu_items.id = menu_item_prices.menu_item_id 
            AND restaurant_menus.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on restaurant_menus
DROP TRIGGER IF EXISTS update_menus_updated_at ON restaurant_menus;
CREATE TRIGGER update_menus_updated_at 
    BEFORE UPDATE ON restaurant_menus
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at timestamp on menu_items
DROP TRIGGER IF EXISTS update_items_updated_at ON menu_items;
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON menu_items
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's active menu with all items
CREATE OR REPLACE FUNCTION get_active_menu(p_user_id UUID)
RETURNS TABLE (
    menu_id UUID,
    restaurant_name VARCHAR,
    menu_version INTEGER,
    category_id UUID,
    category_name VARCHAR,
    category_order INTEGER,
    item_id UUID,
    item_name VARCHAR,
    item_description TEXT,
    item_options JSONB,
    item_notes TEXT,
    item_order INTEGER,
    price_id UUID,
    size_label VARCHAR,
    price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS menu_id,
        m.restaurant_name,
        m.menu_version,
        c.id AS category_id,
        c.category_name,
        c.display_order AS category_order,
        i.id AS item_id,
        i.item_name,
        i.description AS item_description,
        i.options AS item_options,
        i.notes AS item_notes,
        i.display_order AS item_order,
        p.id AS price_id,
        p.size_label,
        p.price
    FROM restaurant_menus m
    LEFT JOIN menu_categories c ON c.menu_id = m.id
    LEFT JOIN menu_items i ON i.category_id = c.id
    LEFT JOIN menu_item_prices p ON p.menu_item_id = i.id
    WHERE m.user_id = p_user_id
    AND m.status = 'active'
    ORDER BY c.display_order, i.display_order, p.price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_menu IS 'Get user''s active menu with all categories, items, and prices';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('restaurant_menus', 'menu_categories', 'menu_items', 'menu_item_prices')) = 4,
           'Not all menu tables were created';
    
    RAISE NOTICE '✅ All 4 menu tables created successfully';
END $$;

-- Verify indexes were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename IN ('restaurant_menus', 'menu_categories', 'menu_items', 'menu_item_prices')) >= 8,
           'Not all indexes were created';
    
    RAISE NOTICE '✅ All indexes created successfully';
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('restaurant_menus', 'menu_categories', 'menu_items', 'menu_item_prices')
            AND rowsecurity = true) = 4,
           'RLS not enabled on all tables';
    
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- Verify policies were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename IN ('restaurant_menus', 'menu_categories', 'menu_items', 'menu_item_prices')) >= 16,
           'Not all RLS policies were created';
    
    RAISE NOTICE '✅ All RLS policies created successfully';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

RAISE NOTICE '🎉 Migration 012 completed successfully!';
RAISE NOTICE '📋 Created: 4 tables, 8+ indexes, 16+ RLS policies, 1 helper function';
RAISE NOTICE '🔒 RLS enabled on all tables';
RAISE NOTICE '✅ Ready for menu management module';
