-- Invoice Operations Schema
-- Sprint 1: Upload, Parse, Review, Save invoices
-- Pattern: Follows existing database/menu_intelligence_supabase.sql structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Invoice metadata
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    vendor_name TEXT NOT NULL,
    
    -- Financial data
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    
    -- Parsing metadata
    parse_method TEXT NOT NULL CHECK (parse_method IN ('gemini_flash', 'gemini_pro', 'manual')),
    parse_cost DECIMAL(10,6),
    parse_time_seconds INTEGER,
    parse_tokens_used INTEGER,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'parsed' CHECK (status IN ('parsed', 'reviewed', 'approved')),
    
    -- File storage
    raw_file_url TEXT NOT NULL,
    parsed_json JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: prevent duplicate invoices
    UNIQUE(user_id, vendor_name, invoice_number, invoice_date)
);

-- ============================================================================
-- INVOICE LINE ITEMS TABLE
-- ============================================================================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Item data
    item_number TEXT,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    pack_size TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    extended_price DECIMAL(10,2) NOT NULL,
    category TEXT CHECK (category IN ('DRY', 'REFRIGERATED', 'FROZEN')),
    
    -- User corrections tracking
    user_corrected BOOLEAN DEFAULT FALSE,
    original_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validation: extended price should match quantity × unit price (±$0.02 tolerance)
    CONSTRAINT valid_extended_price CHECK (
        ABS(extended_price - (quantity * unit_price)) < 0.02
    )
);

-- ============================================================================
-- PARSE LOGS TABLE (for debugging and optimization)
-- ============================================================================
CREATE TABLE invoice_parse_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Parse details
    model_used TEXT NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10,6),
    parse_time_seconds INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_name);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_item_number ON invoice_items(item_number);
CREATE INDEX idx_invoice_items_category ON invoice_items(category);

CREATE INDEX idx_parse_logs_user_id ON invoice_parse_logs(user_id);
CREATE INDEX idx_parse_logs_created_at ON invoice_parse_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_parse_logs ENABLE ROW LEVEL SECURITY;

-- Invoices: Users can only access their own
CREATE POLICY "Users can view own invoices"
    ON invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
    ON invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
    ON invoices FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
    ON invoices FOR DELETE
    USING (auth.uid() = user_id);

-- Invoice Items: Users can only access items from their invoices
CREATE POLICY "Users can view own invoice items"
    ON invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own invoice items"
    ON invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own invoice items"
    ON invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own invoice items"
    ON invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

-- Parse Logs: Users can view their own logs
CREATE POLICY "Users can view own parse logs"
    ON invoice_parse_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parse logs"
    ON invoice_parse_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (for documentation)
-- ============================================================================
COMMENT ON TABLE invoices IS 'Stores parsed food service invoices with metadata';
COMMENT ON TABLE invoice_items IS 'Line items from invoices with product details';
COMMENT ON TABLE invoice_parse_logs IS 'Logs of parsing attempts for debugging and cost tracking';

COMMENT ON COLUMN invoices.parse_method IS 'Which AI model or method was used to parse';
COMMENT ON COLUMN invoices.status IS 'parsed=just parsed, reviewed=user reviewed, approved=finalized';
COMMENT ON COLUMN invoice_items.user_corrected IS 'TRUE if user manually edited this item';
