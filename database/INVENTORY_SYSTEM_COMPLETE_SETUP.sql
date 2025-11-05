-- ================================================================================
-- INVENTORY FOUNDATION SYSTEM - COMPLETE SETUP
-- Run this entire file in Supabase SQL Editor
-- ================================================================================
-- This creates the complete inventory tracking system for invoice processing
-- Includes: inventory items, vendors, mappings, transactions, price tracking
-- ================================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================================
-- PART 1: CORE INVENTORY TABLES
-- ================================================================================

-- TABLE 1: INVENTORY ITEMS - Master inventory catalog
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    current_quantity DECIMAL(12,3) DEFAULT 0,
    unit_of_measure TEXT NOT NULL,
    average_unit_cost DECIMAL(10,2),
    last_purchase_price DECIMAL(10,2),
    last_purchase_date DATE,
    waste_buffer_percent DECIMAL(5,2) DEFAULT 1.0,
    safety_stock_days DECIMAL(5,2) DEFAULT 2.0,
    par_level DECIMAL(12,3),
    reorder_point DECIMAL(12,3),
    last_counted_at TIMESTAMP,
    last_counted_quantity DECIMAL(12,3),
    is_perishable BOOLEAN DEFAULT true,
    shelf_life_days INTEGER,
    storage_location TEXT,
    preferred_vendor_id UUID,
    track_by_batch BOOLEAN DEFAULT false,
    minimum_order_quantity DECIMAL(12,3),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_item UNIQUE(user_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_user ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_normalized ON inventory_items(normalized_name);
CREATE INDEX IF NOT EXISTS idx_inventory_tags ON inventory_items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_inventory_storage ON inventory_items(storage_location);

-- TABLE 2: VENDORS - Vendor master data
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    vendor_type TEXT,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    typical_order_day TEXT,
    delivery_lead_time_days INTEGER DEFAULT 1,
    minimum_order_amount DECIMAL(10,2),
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_vendor UNIQUE(user_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_vendors_user ON vendors(user_id);

-- TABLE 3: VENDOR ITEM MAPPINGS - Links vendor SKUs to inventory items
CREATE TABLE IF NOT EXISTS vendor_item_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_item_number TEXT NOT NULL,
    vendor_description TEXT NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    match_confidence DECIMAL(3,2) DEFAULT 0.0,
    match_method TEXT,
    matched_at TIMESTAMP,
    vendor_pack_size TEXT,
    conversion_to_base_unit DECIMAL(12,3),
    last_price DECIMAL(10,2),
    last_ordered_date DATE,
    needs_review BOOLEAN DEFAULT false,
    is_preferred BOOLEAN DEFAULT false,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    quality_notes TEXT,
    last_quality_issue_date DATE,
    ordering_notes TEXT,
    lead_time_days INTEGER,
    case_pack_quantity INTEGER,
    inner_pack_quantity INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_vendor_item UNIQUE(user_id, vendor_id, vendor_item_number)
);

CREATE INDEX IF NOT EXISTS idx_vendor_mappings_inventory ON vendor_item_mappings(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_vendor_mappings_vendor_item ON vendor_item_mappings(vendor_id, vendor_item_number);

-- TABLE 4: INVENTORY TRANSACTIONS - Complete audit trail
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    quantity_change DECIMAL(12,3) NOT NULL,
    running_balance DECIMAL(12,3) NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    notes TEXT,
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_quantity_nonzero CHECK (quantity_change != 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_item_date ON inventory_transactions(inventory_item_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON inventory_transactions(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON inventory_transactions(user_id, transaction_date DESC);

-- TABLE 5: PRICE HISTORY - Track price changes over time
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    unit_price DECIMAL(10,2) NOT NULL,
    pack_size TEXT,
    total_pack_price DECIMAL(10,2),
    invoice_id UUID,
    invoice_date DATE NOT NULL,
    previous_price DECIMAL(10,2),
    price_change_percent DECIMAL(6,2),
    is_price_increase BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_item_date ON price_history(inventory_item_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_vendor_date ON price_history(vendor_id, invoice_date DESC);

-- TABLE 6: PROCESSED EVENTS - Idempotency tracking
CREATE TABLE IF NOT EXISTS processed_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_id UUID NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processing_result TEXT NOT NULL,
    error_message TEXT,
    CONSTRAINT unique_event UNIQUE(event_type, event_id)
);

CREATE INDEX IF NOT EXISTS idx_processed_events_lookup ON processed_events(event_type, event_id);

-- ================================================================================
-- PART 2: REFERENCE DATA TABLES
-- ================================================================================

-- TABLE 7: ITEM CATEGORIES - Hierarchical category system
CREATE TABLE IF NOT EXISTS item_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    parent_category_id UUID REFERENCES item_categories(id) ON DELETE CASCADE,
    display_order INTEGER,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 8: UNITS OF MEASURE - Comprehensive unit system
CREATE TABLE IF NOT EXISTS units_of_measure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_code TEXT NOT NULL UNIQUE,
    unit_name TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    base_unit_code TEXT,
    conversion_to_base DECIMAL(12,6),
    display_order INTEGER,
    commonly_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 9: INVENTORY ALERTS
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON inventory_alerts(user_id) WHERE read_at IS NULL;

-- TABLE 10: USER INVENTORY PREFERENCES
CREATE TABLE IF NOT EXISTS user_inventory_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_category_order JSONB,
    hidden_categories TEXT[],
    preferred_weight_unit TEXT DEFAULT 'lb',
    preferred_volume_unit TEXT DEFAULT 'ga',
    low_stock_threshold_days DECIMAL(5,2) DEFAULT 3.0,
    price_increase_alert_percent DECIMAL(5,2) DEFAULT 5.0,
    show_unit_conversions BOOLEAN DEFAULT true,
    group_by_vendor BOOLEAN DEFAULT false,
    default_waste_buffers JSONB DEFAULT '{"proteins": 1.0, "produce": 1.8, "dairy": 1.2, "dry_goods": 0.5, "frozen": 0.8, "beverages": 0.3, "disposables": 0.2, "cleaning": 0.1, "paper_goods": 0.1, "smallwares": 0.0}'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 11: PACK SIZE PATTERNS
CREATE TABLE IF NOT EXISTS pack_size_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern TEXT NOT NULL,
    description TEXT,
    example TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- ================================================================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_item_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS inventory_items_user_policy ON inventory_items;
DROP POLICY IF EXISTS vendors_user_policy ON vendors;
DROP POLICY IF EXISTS vendor_mappings_user_policy ON vendor_item_mappings;
DROP POLICY IF EXISTS transactions_user_policy ON inventory_transactions;
DROP POLICY IF EXISTS price_history_user_policy ON price_history;
DROP POLICY IF EXISTS processed_events_user_policy ON processed_events;
DROP POLICY IF EXISTS alerts_user_policy ON inventory_alerts;
DROP POLICY IF EXISTS preferences_user_policy ON user_inventory_preferences;

-- Create policies
CREATE POLICY inventory_items_user_policy ON inventory_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY vendors_user_policy ON vendors
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY vendor_mappings_user_policy ON vendor_item_mappings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY transactions_user_policy ON inventory_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY price_history_user_policy ON price_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY processed_events_user_policy ON processed_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY alerts_user_policy ON inventory_alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY preferences_user_policy ON user_inventory_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ================================================================================
-- PART 4: TRIGGERS FOR UPDATED_AT
-- ================================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
DROP TRIGGER IF EXISTS update_vendor_mappings_updated_at ON vendor_item_mappings;

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_mappings_updated_at BEFORE UPDATE ON vendor_item_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================================
-- PART 5: SEED REFERENCE DATA
-- ================================================================================

-- Insert parent categories
INSERT INTO item_categories (name, display_order) VALUES
('proteins', 1),
('produce', 2),
('dairy', 3),
('dry_goods', 4),
('frozen', 5),
('beverages', 6),
('disposables', 7),
('cleaning', 8),
('paper_goods', 9),
('smallwares', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for proteins
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'beef', id, 1 FROM item_categories WHERE name = 'proteins'
UNION ALL SELECT 'chicken', id, 2 FROM item_categories WHERE name = 'proteins'
UNION ALL SELECT 'pork', id, 3 FROM item_categories WHERE name = 'proteins'
UNION ALL SELECT 'seafood', id, 4 FROM item_categories WHERE name = 'proteins'
UNION ALL SELECT 'turkey', id, 5 FROM item_categories WHERE name = 'proteins'
UNION ALL SELECT 'lamb', id, 6 FROM item_categories WHERE name = 'proteins'
UNION ALL SELECT 'specialty_proteins', id, 7 FROM item_categories WHERE name = 'proteins'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for produce
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'vegetables_fresh', id, 1 FROM item_categories WHERE name = 'produce'
UNION ALL SELECT 'vegetables_root', id, 2 FROM item_categories WHERE name = 'produce'
UNION ALL SELECT 'vegetables_leafy', id, 3 FROM item_categories WHERE name = 'produce'
UNION ALL SELECT 'fruit_fresh', id, 4 FROM item_categories WHERE name = 'produce'
UNION ALL SELECT 'fruit_citrus', id, 5 FROM item_categories WHERE name = 'produce'
UNION ALL SELECT 'herbs_fresh', id, 6 FROM item_categories WHERE name = 'produce'
UNION ALL SELECT 'produce_prepared', id, 7 FROM item_categories WHERE name = 'produce'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for dairy
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'milk', id, 1 FROM item_categories WHERE name = 'dairy'
UNION ALL SELECT 'cheese', id, 2 FROM item_categories WHERE name = 'dairy'
UNION ALL SELECT 'eggs', id, 3 FROM item_categories WHERE name = 'dairy'
UNION ALL SELECT 'butter', id, 4 FROM item_categories WHERE name = 'dairy'
UNION ALL SELECT 'cream', id, 5 FROM item_categories WHERE name = 'dairy'
UNION ALL SELECT 'yogurt', id, 6 FROM item_categories WHERE name = 'dairy'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for dry_goods
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'flour_baking', id, 1 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'grains_rice', id, 2 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'pasta', id, 3 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'oils', id, 4 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'vinegar', id, 5 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'spices', id, 6 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'baking_supplies', id, 7 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'canned_goods', id, 8 FROM item_categories WHERE name = 'dry_goods'
UNION ALL SELECT 'condiments', id, 9 FROM item_categories WHERE name = 'dry_goods'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for frozen
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'vegetables_frozen', id, 1 FROM item_categories WHERE name = 'frozen'
UNION ALL SELECT 'fruit_frozen', id, 2 FROM item_categories WHERE name = 'frozen'
UNION ALL SELECT 'appetizers_frozen', id, 3 FROM item_categories WHERE name = 'frozen'
UNION ALL SELECT 'desserts_frozen', id, 4 FROM item_categories WHERE name = 'frozen'
UNION ALL SELECT 'bread_frozen', id, 5 FROM item_categories WHERE name = 'frozen'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for beverages
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'soft_drinks', id, 1 FROM item_categories WHERE name = 'beverages'
UNION ALL SELECT 'coffee_tea', id, 2 FROM item_categories WHERE name = 'beverages'
UNION ALL SELECT 'juices', id, 3 FROM item_categories WHERE name = 'beverages'
UNION ALL SELECT 'mixers', id, 4 FROM item_categories WHERE name = 'beverages'
UNION ALL SELECT 'water', id, 5 FROM item_categories WHERE name = 'beverages'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for disposables
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'containers_takeout', id, 1 FROM item_categories WHERE name = 'disposables'
UNION ALL SELECT 'cups_lids', id, 2 FROM item_categories WHERE name = 'disposables'
UNION ALL SELECT 'utensils_disposable', id, 3 FROM item_categories WHERE name = 'disposables'
UNION ALL SELECT 'bags', id, 4 FROM item_categories WHERE name = 'disposables'
UNION ALL SELECT 'straws_napkins', id, 5 FROM item_categories WHERE name = 'disposables'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for cleaning
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'detergents', id, 1 FROM item_categories WHERE name = 'cleaning'
UNION ALL SELECT 'chemicals', id, 2 FROM item_categories WHERE name = 'cleaning'
UNION ALL SELECT 'tools_cleaning', id, 3 FROM item_categories WHERE name = 'cleaning'
UNION ALL SELECT 'gloves', id, 4 FROM item_categories WHERE name = 'cleaning'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for paper_goods
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'paper_towels', id, 1 FROM item_categories WHERE name = 'paper_goods'
UNION ALL SELECT 'toilet_paper', id, 2 FROM item_categories WHERE name = 'paper_goods'
UNION ALL SELECT 'napkins', id, 3 FROM item_categories WHERE name = 'paper_goods'
UNION ALL SELECT 'wipes', id, 4 FROM item_categories WHERE name = 'paper_goods'
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for smallwares
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'pots_pans', id, 1 FROM item_categories WHERE name = 'smallwares'
UNION ALL SELECT 'utensils_kitchen', id, 2 FROM item_categories WHERE name = 'smallwares'
UNION ALL SELECT 'knives', id, 3 FROM item_categories WHERE name = 'smallwares'
UNION ALL SELECT 'storage_containers', id, 4 FROM item_categories WHERE name = 'smallwares'
UNION ALL SELECT 'thermometers', id, 5 FROM item_categories WHERE name = 'smallwares'
ON CONFLICT (name) DO NOTHING;

-- Insert weight units
INSERT INTO units_of_measure (unit_code, unit_name, unit_type, base_unit_code, conversion_to_base, commonly_used, display_order) VALUES
('lb', 'Pound', 'weight', 'lb', 1.0, true, 1),
('lbs', 'Pounds', 'weight', 'lb', 1.0, true, 2),
('oz', 'Ounce', 'weight', 'lb', 0.0625, true, 3),
('kg', 'Kilogram', 'weight', 'lb', 2.20462, false, 4),
('g', 'Gram', 'weight', 'lb', 0.00220462, false, 5),
('ton', 'Ton', 'weight', 'lb', 2000.0, false, 6)
ON CONFLICT (unit_code) DO NOTHING;

-- Insert volume units
INSERT INTO units_of_measure (unit_code, unit_name, unit_type, base_unit_code, conversion_to_base, commonly_used, display_order) VALUES
('ga', 'Gallon', 'volume', 'ga', 1.0, true, 10),
('gal', 'Gallon', 'volume', 'ga', 1.0, true, 11),
('qt', 'Quart', 'volume', 'ga', 0.25, true, 12),
('pt', 'Pint', 'volume', 'ga', 0.125, true, 13),
('cup', 'Cup', 'volume', 'ga', 0.0625, true, 14),
('fl oz', 'Fluid Ounce', 'volume', 'ga', 0.0078125, true, 15),
('ml', 'Milliliter', 'volume', 'ga', 0.000264172, false, 16),
('l', 'Liter', 'volume', 'ga', 0.264172, false, 17),
('lt', 'Liter', 'volume', 'ga', 0.264172, false, 18)
ON CONFLICT (unit_code) DO NOTHING;

-- Insert count units
INSERT INTO units_of_measure (unit_code, unit_name, unit_type, base_unit_code, conversion_to_base, commonly_used, display_order) VALUES
('ea', 'Each', 'count', 'ea', 1.0, true, 20),
('each', 'Each', 'count', 'ea', 1.0, true, 21),
('pc', 'Piece', 'count', 'ea', 1.0, true, 22),
('pcs', 'Pieces', 'count', 'ea', 1.0, true, 23),
('ct', 'Count', 'count', 'ea', 1.0, true, 24),
('dz', 'Dozen', 'count', 'ea', 12.0, true, 25),
('dozen', 'Dozen', 'count', 'ea', 12.0, true, 26)
ON CONFLICT (unit_code) DO NOTHING;

-- Insert package units
INSERT INTO units_of_measure (unit_code, unit_name, unit_type, base_unit_code, conversion_to_base, commonly_used, display_order) VALUES
('cs', 'Case', 'package', NULL, NULL, true, 30),
('case', 'Case', 'package', NULL, NULL, true, 31),
('bx', 'Box', 'package', NULL, NULL, true, 32),
('box', 'Box', 'package', NULL, NULL, true, 33),
('bg', 'Bag', 'package', NULL, NULL, true, 34),
('bag', 'Bag', 'package', NULL, NULL, true, 35),
('pk', 'Pack', 'package', NULL, NULL, true, 36),
('pack', 'Pack', 'package', NULL, NULL, true, 37),
('#10 can', '#10 Can', 'package', NULL, NULL, true, 38),
('sack', 'Sack', 'package', NULL, NULL, false, 39),
('tray', 'Tray', 'package', NULL, NULL, false, 40),
('container', 'Container', 'package', NULL, NULL, false, 41)
ON CONFLICT (unit_code) DO NOTHING;

-- Insert pack size patterns
INSERT INTO pack_size_patterns (pattern, description, example) VALUES
('(\d+)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(lb|lbs|oz|ga)', 'Count x Weight/Volume', '12 x 2 lb'),
('(\d+)\s*/\s*(\d+(?:\.\d+)?)\s*(lb|oz)', 'Count/Weight', '6/10 oz'),
('(\d+)\s*#(\d+)', 'Count #Size (cans)', '6 #10'),
('(\d+(?:\.\d+)?)\s*(lb|lbs|oz|ga|qt)', 'Simple Weight/Volume', '5 lb'),
('(\d+)\s*ct', 'Count only', '24 ct'),
('(\d+)\s*(ea|each)', 'Each count', '12 each')
ON CONFLICT DO NOTHING;

-- ================================================================================
-- SETUP COMPLETE
-- ================================================================================
-- ✅ All tables created
-- ✅ Indexes created
-- ✅ RLS policies enabled
-- ✅ Triggers configured
-- ✅ Reference data seeded
-- 
-- Next steps:
-- 1. Deploy backend services
-- 2. Test invoice processing workflow
-- 3. Verify inventory tracking
-- ================================================================================
