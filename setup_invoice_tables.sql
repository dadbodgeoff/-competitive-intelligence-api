-- Quick setup script for invoice tables
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
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
    
    -- Unique constraint
    UNIQUE(user_id, vendor_name, invoice_number, invoice_date)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_parse_logs table
CREATE TABLE IF NOT EXISTS invoice_parse_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Parse metadata
    model_used TEXT NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10,6),
    parse_time_seconds INTEGER,
    
    -- Success tracking
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_parse_logs_invoice_id ON invoice_parse_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_parse_logs_user_id ON invoice_parse_logs(user_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_parse_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices"
    ON invoices FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
CREATE POLICY "Users can insert own invoices"
    ON invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices"
    ON invoices FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Users can delete own invoices"
    ON invoices FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for invoice_items
DROP POLICY IF EXISTS "Users can view own invoice items" ON invoice_items;
CREATE POLICY "Users can view own invoice items"
    ON invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own invoice items" ON invoice_items;
CREATE POLICY "Users can insert own invoice items"
    ON invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own invoice items" ON invoice_items;
CREATE POLICY "Users can update own invoice items"
    ON invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own invoice items" ON invoice_items;
CREATE POLICY "Users can delete own invoice items"
    ON invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

-- RLS Policies for invoice_parse_logs
DROP POLICY IF EXISTS "Users can view own parse logs" ON invoice_parse_logs;
CREATE POLICY "Users can view own parse logs"
    ON invoice_parse_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own parse logs" ON invoice_parse_logs;
CREATE POLICY "Users can insert own parse logs"
    ON invoice_parse_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Success message
SELECT 'Invoice tables created successfully!' as message;
