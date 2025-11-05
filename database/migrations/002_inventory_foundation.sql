-- ================================================================================
-- INVENTORY FOUNDATION SCHEMA
-- Purpose: Core inventory tracking, vendor management, and transaction audit trail
-- ================================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================================
-- TABLE 1: INVENTORY ITEMS - Master inventory catalog
-- ================================================================================
CREATE TABLE inventory_items (
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_item UNIQUE(user_id, normalized_name)
);

CREATE INDEX idx_inventory_items_user ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_normalized ON inventory_items(normalized_name);

-- ================================================================================
-- TABLE 2: VENDORS - Vendor master data
-- ================================================================================
CREATE TABLE vendors (
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

CREATE INDEX idx_vendors_user ON vendors(user_id);

-- ================================================================================
-- TABLE 3: VENDOR ITEM MAPPINGS - Links vendor SKUs to inventory items
-- ================================================================================
CREATE TABLE vendor_item_mappings (
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_vendor_item UNIQUE(user_id, vendor_id, vendor_item_number)
);

CREATE INDEX idx_vendor_mappings_inventory ON vendor_item_mappings(inventory_item_id);
CREATE INDEX idx_vendor_mappings_vendor_item ON vendor_item_mappings(vendor_id, vendor_item_number);

-- ================================================================================
-- TABLE 4: INVENTORY TRANSACTIONS - Complete audit trail
-- ================================================================================
CREATE TABLE inventory_transactions (
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

CREATE INDEX idx_transactions_item_date ON inventory_transactions(inventory_item_id, transaction_date DESC);
CREATE INDEX idx_transactions_reference ON inventory_transactions(reference_id, reference_type);
CREATE INDEX idx_transactions_user_date ON inventory_transactions(user_id, transaction_date DESC);

-- ================================================================================
-- TABLE 5: PRICE HISTORY - Track price changes over time
-- ================================================================================
CREATE TABLE price_history (
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

CREATE INDEX idx_price_history_item_date ON price_history(inventory_item_id, invoice_date DESC);
CREATE INDEX idx_price_history_vendor_date ON price_history(vendor_id, invoice_date DESC);

-- ================================================================================
-- TABLE 6: PROCESSED EVENTS - Idempotency tracking
-- ================================================================================
CREATE TABLE processed_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_id UUID NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processing_result TEXT NOT NULL,
    error_message TEXT,
    CONSTRAINT unique_event UNIQUE(event_type, event_id)
);

CREATE INDEX idx_processed_events_lookup ON processed_events(event_type, event_id);

-- ================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_item_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;

-- Policies for inventory_items
CREATE POLICY inventory_items_user_policy ON inventory_items
    FOR ALL USING (auth.uid() = user_id);

-- Policies for vendors
CREATE POLICY vendors_user_policy ON vendors
    FOR ALL USING (auth.uid() = user_id);

-- Policies for vendor_item_mappings
CREATE POLICY vendor_mappings_user_policy ON vendor_item_mappings
    FOR ALL USING (auth.uid() = user_id);

-- Policies for inventory_transactions
CREATE POLICY transactions_user_policy ON inventory_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Policies for price_history
CREATE POLICY price_history_user_policy ON price_history
    FOR ALL USING (auth.uid() = user_id);

-- Policies for processed_events
CREATE POLICY processed_events_user_policy ON processed_events
    FOR ALL USING (auth.uid() = user_id);

-- ================================================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_mappings_updated_at BEFORE UPDATE ON vendor_item_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
