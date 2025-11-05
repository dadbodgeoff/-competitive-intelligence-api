-- Add the missing competitor_menus table
CREATE TABLE public.competitor_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_place_id VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    menu_data JSONB NOT NULL,
    extraction_method VARCHAR(50) NOT NULL CHECK (extraction_method IN ('toast', 'square', 'slice', 'vision', 'user_upload')),
    extraction_url VARCHAR(500),
    success_rate DECIMAL(3,2) DEFAULT 1.0,
    item_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    last_accessed_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for competitor_menus
CREATE INDEX idx_competitor_menus_place_id ON public.competitor_menus(competitor_place_id);
CREATE INDEX idx_competitor_menus_expires_at ON public.competitor_menus(expires_at);
CREATE INDEX idx_competitor_menus_extraction_method ON public.competitor_menus(extraction_method);

-- Enable RLS
ALTER TABLE public.competitor_menus ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view competitor menus" ON public.competitor_menus
    FOR SELECT USING (true);

CREATE POLICY "Service can manage competitor menus" ON public.competitor_menus
    FOR ALL USING (auth.role() = 'service_role');

-- Add table comment
COMMENT ON TABLE public.competitor_menus IS 'Cache of extracted competitor menus with 7-day TTL';

-- Verify all 4 tables now exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'menu_%'
ORDER BY table_name;