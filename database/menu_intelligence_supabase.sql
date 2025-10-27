-- MENU INTELLIGENCE DATABASE SCHEMA
-- Safe: Completely separate from existing review analysis tables
-- Execute this entire script in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: MENU ANALYSES
CREATE TABLE public.menu_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    restaurant_menu JSONB NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'premium')),
    competitor_count INTEGER DEFAULT 2,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    current_step VARCHAR(255),
    error_message TEXT,
    total_competitors_analyzed INTEGER,
    total_menu_items_compared INTEGER,
    processing_time_seconds INTEGER,
    estimated_cost DECIMAL(10,4),
    actual_cost DECIMAL(10,4),
    llm_provider VARCHAR(50) DEFAULT 'google_gemini',
    llm_model VARCHAR(100) DEFAULT 'gemini-2.0-flash-exp',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- TABLE 2: MENU INSIGHTS
CREATE TABLE public.menu_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_analysis_id UUID REFERENCES public.menu_analyses(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('pricing', 'gap', 'opportunity', 'threat', 'watch')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence VARCHAR(20) NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
    significance DECIMAL(4,2),
    proof_quote TEXT,
    mention_count INTEGER DEFAULT 1,
    competitor_source VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 3: COMPETITOR MENUS CACHE
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

-- TABLE 4: MENU ITEM MATCHES
CREATE TABLE public.menu_item_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_analysis_id UUID REFERENCES public.menu_analyses(id) ON DELETE CASCADE,
    user_item_name VARCHAR(255) NOT NULL,
    user_item_price DECIMAL(10,2),
    user_item_category VARCHAR(100),
    competitor_item_name VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_item_price DECIMAL(10,2),
    match_confidence DECIMAL(3,2) NOT NULL,
    price_difference DECIMAL(10,2),
    price_difference_percent DECIMAL(5,2),
    pricing_recommendation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_menu_analyses_user_id ON public.menu_analyses(user_id);
CREATE INDEX idx_menu_analyses_status ON public.menu_analyses(status);
CREATE INDEX idx_menu_analyses_tier ON public.menu_analyses(tier);
CREATE INDEX idx_menu_analyses_created_at ON public.menu_analyses(created_at);

CREATE INDEX idx_menu_insights_analysis_id ON public.menu_insights(menu_analysis_id);
CREATE INDEX idx_menu_insights_category ON public.menu_insights(category);
CREATE INDEX idx_menu_insights_confidence ON public.menu_insights(confidence);

CREATE INDEX idx_competitor_menus_place_id ON public.competitor_menus(competitor_place_id);
CREATE INDEX idx_competitor_menus_expires_at ON public.competitor_menus(expires_at);
CREATE INDEX idx_competitor_menus_extraction_method ON public.competitor_menus(extraction_method);

CREATE INDEX idx_menu_item_matches_analysis_id ON public.menu_item_matches(menu_analysis_id);
CREATE INDEX idx_menu_item_matches_confidence ON public.menu_item_matches(match_confidence);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.menu_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_matches ENABLE ROW LEVEL SECURITY;

-- Menu Analyses Policies
CREATE POLICY "Users can view own menu analyses" ON public.menu_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own menu analyses" ON public.menu_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menu analyses" ON public.menu_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Menu Insights Policies
CREATE POLICY "Users can view own menu insights" ON public.menu_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menu_analyses 
            WHERE menu_analyses.id = menu_insights.menu_analysis_id 
            AND menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create menu insights for own analyses" ON public.menu_insights
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menu_analyses 
            WHERE menu_analyses.id = menu_insights.menu_analysis_id 
            AND menu_analyses.user_id = auth.uid()
        )
    );

-- Competitor Menus Policies (shared cache)
CREATE POLICY "Users can view competitor menus" ON public.competitor_menus
    FOR SELECT USING (true);

CREATE POLICY "Service can manage competitor menus" ON public.competitor_menus
    FOR ALL USING (auth.role() = 'service_role');

-- Menu Item Matches Policies
CREATE POLICY "Users can view own menu item matches" ON public.menu_item_matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menu_analyses 
            WHERE menu_analyses.id = menu_item_matches.menu_analysis_id 
            AND menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create menu item matches for own analyses" ON public.menu_item_matches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menu_analyses 
            WHERE menu_analyses.id = menu_item_matches.menu_analysis_id 
            AND menu_analyses.user_id = auth.uid()
        )
    );

-- UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.cleanup_expired_competitor_menus()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.competitor_menus 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.validate_menu_structure(menu_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT (menu_json ? 'items') THEN
        RETURN FALSE;
    END IF;
    
    IF jsonb_typeof(menu_json->'items') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE public.menu_analyses 
ADD CONSTRAINT valid_menu_structure 
CHECK (validate_menu_structure(restaurant_menu));

-- TABLE COMMENTS
COMMENT ON TABLE public.menu_analyses IS 'Menu competitive analysis records - separate from review analyses';
COMMENT ON TABLE public.menu_insights IS 'Insights generated from menu competitive analysis';
COMMENT ON TABLE public.competitor_menus IS 'Cache of extracted competitor menus with 7-day TTL';
COMMENT ON TABLE public.menu_item_matches IS 'LLM-generated matches between user and competitor menu items';