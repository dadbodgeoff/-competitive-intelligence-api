-- ================================================================================
-- REFERENCE DATA & ENHANCEMENTS
-- Purpose: Categories, units, and enhanced metadata for inventory system
-- ================================================================================

-- ================================================================================
-- TABLE 1: ITEM CATEGORIES - Hierarchical category system
-- ================================================================================
CREATE TABLE item_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    parent_category_id UUID REFERENCES item_categories(id) ON DELETE CASCADE,
    display_order INTEGER,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

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
('smallwares', 10);

-- Insert subcategories for proteins
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'beef', id, 1 FROM item_categories WHERE name = 'proteins'
UNION ALL
SELECT 'chicken', id, 2 FROM item_categories WHERE name = 'proteins'
UNION ALL
SELECT 'pork', id, 3 FROM item_categories WHERE name = 'proteins'
UNION ALL
SELECT 'seafood', id, 4 FROM item_categories WHERE name = 'proteins'
UNION ALL
SELECT 'turkey', id, 5 FROM item_categories WHERE name = 'proteins'
UNION ALL
SELECT 'lamb', id, 6 FROM item_categories WHERE name = 'proteins'
UNION ALL
SELECT 'specialty_proteins', id, 7 FROM item_categories WHERE name = 'proteins';

-- Insert subcategories for produce
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'vegetables_fresh', id, 1 FROM item_categories WHERE name = 'produce'
UNION ALL
SELECT 'vegetables_root', id, 2 FROM item_categories WHERE name = 'produce'
UNION ALL
SELECT 'vegetables_leafy', id, 3 FROM item_categories WHERE name = 'produce'
UNION ALL
SELECT 'fruit_fresh', id, 4 FROM item_categories WHERE name = 'produce'
UNION ALL
SELECT 'fruit_citrus', id, 5 FROM item_categories WHERE name = 'produce'
UNION ALL
SELECT 'herbs_fresh', id, 6 FROM item_categories WHERE name = 'produce'
UNION ALL
SELECT 'produce_prepared', id, 7 FROM item_categories WHERE name = 'produce';

-- Insert subcategories for dairy
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'milk', id, 1 FROM item_categories WHERE name = 'dairy'
UNION ALL
SELECT 'cheese', id, 2 FROM item_categories WHERE name = 'dairy'
UNION ALL
SELECT 'eggs', id, 3 FROM item_categories WHERE name = 'dairy'
UNION ALL
SELECT 'butter', id, 4 FROM item_categories WHERE name = 'dairy'
UNION ALL
SELECT 'cream', id, 5 FROM item_categories WHERE name = 'dairy'
UNION ALL
SELECT 'yogurt', id, 6 FROM item_categories WHERE name = 'dairy';

-- Insert subcategories for dry_goods
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'flour_baking', id, 1 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'grains_rice', id, 2 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'pasta', id, 3 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'oils', id, 4 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'vinegar', id, 5 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'spices', id, 6 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'baking_supplies', id, 7 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'canned_goods', id, 8 FROM item_categories WHERE name = 'dry_goods'
UNION ALL
SELECT 'condiments', id, 9 FROM item_categories WHERE name = 'dry_goods';

-- Insert subcategories for frozen
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'vegetables_frozen', id, 1 FROM item_categories WHERE name = 'frozen'
UNION ALL
SELECT 'fruit_frozen', id, 2 FROM item_categories WHERE name = 'frozen'
UNION ALL
SELECT 'appetizers_frozen', id, 3 FROM item_categories WHERE name = 'frozen'
UNION ALL
SELECT 'desserts_frozen', id, 4 FROM item_categories WHERE name = 'frozen'
UNION ALL
SELECT 'bread_frozen', id, 5 FROM item_categories WHERE name = 'frozen';

-- Insert subcategories for beverages
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'soft_drinks', id, 1 FROM item_categories WHERE name = 'beverages'
UNION ALL
SELECT 'coffee_tea', id, 2 FROM item_categories WHERE name = 'beverages'
UNION ALL
SELECT 'juices', id, 3 FROM item_categories WHERE name = 'beverages'
UNION ALL
SELECT 'mixers', id, 4 FROM item_categories WHERE name = 'beverages'
UNION ALL
SELECT 'water', id, 5 FROM item_categories WHERE name = 'beverages';

-- Insert subcategories for disposables
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'containers_takeout', id, 1 FROM item_categories WHERE name = 'disposables'
UNION ALL
SELECT 'cups_lids', id, 2 FROM item_categories WHERE name = 'disposables'
UNION ALL
SELECT 'utensils_disposable', id, 3 FROM item_categories WHERE name = 'disposables'
UNION ALL
SELECT 'bags', id, 4 FROM item_categories WHERE name = 'disposables'
UNION ALL
SELECT 'straws_napkins', id, 5 FROM item_categories WHERE name = 'disposables';

-- Insert subcategories for cleaning
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'detergents', id, 1 FROM item_categories WHERE name = 'cleaning'
UNION ALL
SELECT 'chemicals', id, 2 FROM item_categories WHERE name = 'cleaning'
UNION ALL
SELECT 'tools_cleaning', id, 3 FROM item_categories WHERE name = 'cleaning'
UNION ALL
SELECT 'gloves', id, 4 FROM item_categories WHERE name = 'cleaning';

-- Insert subcategories for paper_goods
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'paper_towels', id, 1 FROM item_categories WHERE name = 'paper_goods'
UNION ALL
SELECT 'toilet_paper', id, 2 FROM item_categories WHERE name = 'paper_goods'
UNION ALL
SELECT 'napkins', id, 3 FROM item_categories WHERE name = 'paper_goods'
UNION ALL
SELECT 'wipes', id, 4 FROM item_categories WHERE name = 'paper_goods';

-- Insert subcategories for smallwares
INSERT INTO item_categories (name, parent_category_id, display_order)
SELECT 'pots_pans', id, 1 FROM item_categories WHERE name = 'smallwares'
UNION ALL
SELECT 'utensils_kitchen', id, 2 FROM item_categories WHERE name = 'smallwares'
UNION ALL
SELECT 'knives', id, 3 FROM item_categories WHERE name = 'smallwares'
UNION ALL
SELECT 'storage_containers', id, 4 FROM item_categories WHERE name = 'smallwares'
UNION ALL
SELECT 'thermometers', id, 5 FROM item_categories WHERE name = 'smallwares';

-- ================================================================================
-- TABLE 2: UNITS OF MEASURE - Comprehensive unit system
-- ================================================================================
CREATE TABLE units_of_measure (
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

-- Insert weight units
INSERT INTO units_of_measure (unit_code, unit_name, unit_type, base_unit_code, conversion_to_base, commonly_used, display_order) VALUES
('lb', 'Pound', 'weight', 'lb', 1.0, true, 1),
('lbs', 'Pounds', 'weight', 'lb', 1.0, true, 2),
('oz', 'Ounce', 'weight', 'lb', 0.0625, true, 3),
('kg', 'Kilogram', 'weight', 'lb', 2.20462, false, 4),
('g', 'Gram', 'weight', 'lb', 0.00220462, false, 5),
('ton', 'Ton', 'weight', 'lb', 2000.0, false, 6);

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
('lt', 'Liter', 'volume', 'ga', 0.264172, false, 18);

-- Insert count units
INSERT INTO units_of_measure (unit_code, unit_name, unit_type, base_unit_code, conversion_to_base, commonly_used, display_order) VALUES
('ea', 'Each', 'count', 'ea', 1.0, true, 20),
('each', 'Each', 'count', 'ea', 1.0, true, 21),
('pc', 'Piece', 'count', 'ea', 1.0, true, 22),
('pcs', 'Pieces', 'count', 'ea', 1.0, true, 23),
('ct', 'Count', 'count', 'ea', 1.0, true, 24),
('dz', 'Dozen', 'count', 'ea', 12.0, true, 25),
('dozen', 'Dozen', 'count', 'ea', 12.0, true, 26);

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
('container', 'Container', 'package', NULL, NULL, false, 41);

-- ================================================================================
-- TABLE 3: INVENTORY ALERTS
-- ================================================================================
CREATE TABLE inventory_alerts (
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

CREATE INDEX idx_alerts_user_unread ON inventory_alerts(user_id) WHERE read_at IS NULL;

ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY alerts_user_policy ON inventory_alerts
    FOR ALL USING (auth.uid() = user_id);

-- ================================================================================
-- TABLE 4: USER INVENTORY PREFERENCES
-- ================================================================================
CREATE TABLE user_inventory_preferences (
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

ALTER TABLE user_inventory_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY preferences_user_policy ON user_inventory_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ================================================================================
-- ENHANCEMENTS TO EXISTING TABLES
-- ================================================================================

-- Enhance inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT true;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS storage_location TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS preferred_vendor_id UUID REFERENCES vendors(id);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS track_by_batch BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS minimum_order_quantity DECIMAL(12,3);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_inventory_tags ON inventory_items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_inventory_storage ON inventory_items(storage_location);

-- Enhance vendor_item_mappings
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT false;
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5);
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS quality_notes TEXT;
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS last_quality_issue_date DATE;
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS ordering_notes TEXT;
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS case_pack_quantity INTEGER;
ALTER TABLE vendor_item_mappings ADD COLUMN IF NOT EXISTS inner_pack_quantity INTEGER;

-- ================================================================================
-- PACK SIZE PATTERNS TABLE
-- ================================================================================
CREATE TABLE pack_size_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern TEXT NOT NULL,
    description TEXT,
    example TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO pack_size_patterns (pattern, description, example) VALUES
('(\d+)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(lb|lbs|oz|ga)', 'Count x Weight/Volume', '12 x 2 lb'),
('(\d+)\s*/\s*(\d+(?:\.\d+)?)\s*(lb|oz)', 'Count/Weight', '6/10 oz'),
('(\d+)\s*#(\d+)', 'Count #Size (cans)', '6 #10'),
('(\d+(?:\.\d+)?)\s*(lb|lbs|oz|ga|qt)', 'Simple Weight/Volume', '5 lb'),
('(\d+)\s*ct', 'Count only', '24 ct'),
('(\d+)\s*(ea|each)', 'Each count', '12 each');
