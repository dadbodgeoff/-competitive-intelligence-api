-- ============================================================================
-- MIGRATION 030: Menu Item Daily Sales Tracking
-- Purpose : Record daily quantities sold per menu item while snapshotting COGS
--           and revenue so food spend can be analyzed historically.
-- Author  : RestaurantIQ COGS Enhancements
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- TABLE: menu_item_daily_sales
-- Stores one row per menu item (and optional price variant) per calendar day.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_item_daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    menu_item_price_id UUID REFERENCES menu_item_prices(id) ON DELETE SET NULL,

    sale_date DATE NOT NULL,
    quantity_sold NUMERIC(12,3) NOT NULL CHECK (quantity_sold >= 0),

    unit_cogs_snapshot NUMERIC(12,4),
    unit_menu_price_snapshot NUMERIC(12,4),
    total_cogs_snapshot NUMERIC(14,4),
    total_revenue_snapshot NUMERIC(14,4),
    gross_profit_snapshot NUMERIC(14,4),

    cogs_source TEXT DEFAULT 'recipe_snapshot',
    metadata JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE menu_item_daily_sales IS
    'Daily sales quantities with COGS snapshots for spend tracking.';
COMMENT ON COLUMN menu_item_daily_sales.unit_cogs_snapshot IS
    'Per-serving COGS captured at entry time to preserve historical accuracy.';
COMMENT ON COLUMN menu_item_daily_sales.unit_menu_price_snapshot IS
    'Menu price per serving captured when the sale entry is recorded.';
COMMENT ON COLUMN menu_item_daily_sales.cogs_source IS
    'Indicates how the COGS snapshot was derived (e.g., recipe_snapshot, manual).';

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_menu_item_daily_sales_user_date
    ON menu_item_daily_sales(user_id, sale_date);

CREATE INDEX IF NOT EXISTS idx_menu_item_daily_sales_item_date
    ON menu_item_daily_sales(menu_item_id, sale_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_item_daily_sales_unique_entry
    ON menu_item_daily_sales (
        user_id,
        menu_item_id,
        sale_date,
        COALESCE(menu_item_price_id::text, 'all')
    );

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE menu_item_daily_sales ENABLE ROW LEVEL SECURITY;

-- Drop policies if re-running migration
DROP POLICY IF EXISTS "Users can view own menu daily sales" ON menu_item_daily_sales;
DROP POLICY IF EXISTS "Users can insert own menu daily sales" ON menu_item_daily_sales;
DROP POLICY IF EXISTS "Users can update own menu daily sales" ON menu_item_daily_sales;
DROP POLICY IF EXISTS "Users can delete own menu daily sales" ON menu_item_daily_sales;

CREATE POLICY "Users can view own menu daily sales" ON menu_item_daily_sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM menu_items mi
            JOIN restaurant_menus rm ON rm.id = mi.menu_id
            WHERE mi.id = menu_item_daily_sales.menu_item_id
              AND rm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own menu daily sales" ON menu_item_daily_sales
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM menu_items mi
            JOIN restaurant_menus rm ON rm.id = mi.menu_id
            WHERE mi.id = menu_item_daily_sales.menu_item_id
              AND rm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own menu daily sales" ON menu_item_daily_sales
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM menu_items mi
            JOIN restaurant_menus rm ON rm.id = mi.menu_id
            WHERE mi.id = menu_item_daily_sales.menu_item_id
              AND rm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own menu daily sales" ON menu_item_daily_sales
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM menu_items mi
            JOIN restaurant_menus rm ON rm.id = mi.menu_id
            WHERE mi.id = menu_item_daily_sales.menu_item_id
              AND rm.user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_menu_item_daily_sales_updated_at
    BEFORE UPDATE ON menu_item_daily_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    PERFORM 1 FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'menu_item_daily_sales';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'menu_item_daily_sales table was not created';
    END IF;

    PERFORM 1 FROM pg_indexes
     WHERE schemaname = 'public'
       AND indexname = 'idx_menu_item_daily_sales_unique_entry';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unique index for menu_item_daily_sales not created';
    END IF;

    PERFORM 1 FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename = 'menu_item_daily_sales'
       AND rowsecurity = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'RLS not enabled on menu_item_daily_sales';
    END IF;

    RAISE NOTICE '✅ Migration 030 completed successfully (menu_item_daily_sales ready)';
END $$;


