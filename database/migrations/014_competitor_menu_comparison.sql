-- ============================================================================
-- MIGRATION 014: Competitor Menu Comparison System
-- ============================================================================
-- Description: Menu comparison feature - discover competitors, parse menus, analyze pricing
-- Author: Menu Comparison Module
-- Date: 2025-11-01
-- Dependencies: Requires migration 012 (menu_management_system)
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Competitor menu analysis sessions
CREATE TABLE IF NOT EXISTS competitor_menu_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_menu_id UUID REFERENCES restaurant_menus(id) ON DELETE CASCADE NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'discovering' CHECK (status IN ('discovering', 'selecting', 'analyzing', 'completed', 'failed')),
    current_step TEXT,
    competitors_found INTEGER DEFAULT 0,
    competitors_selected INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

COMMENT ON TABLE competitor_menu_analyses IS 'Menu comparison analysis sessions';
COMMENT ON COLUMN competitor_menu_analyses.status IS 'discovering = finding competitors, selecting = user choosing 2, analyzing = running comparison, completed = done';
COMMENT ON COLUMN competitor_menu_analyses.user_menu_id IS 'Reference to user''s menu being compared';

-- Discovered competitors (5 found, user selects 2)
CREATE TABLE IF NOT EXISTS competitor_businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES competitor_menu_analyses(id) ON DELETE CASCADE NOT NULL,
    place_id VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    rating DECIMAL(3, 2),
    review_count INTEGER,
    price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
    distance_miles DECIMAL(6, 2),
    phone VARCHAR(50),
    website TEXT,
    menu_url TEXT,
    is_selected BOOLEAN DEFAULT false,
    discovery_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE competitor_businesses IS 'Discovered competitor businesses (5 per analysis)';
COMMENT ON COLUMN competitor_businesses.is_selected IS 'true if user selected this competitor for analysis (max 2)';
COMMENT ON COLUMN competitor_businesses.discovery_metadata IS 'Google Places API response data';

-- Competitor menu snapshots (parsed menus from selected competitors)
CREATE TABLE IF NOT EXISTS competitor_menu_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES competitor_businesses(id) ON DELETE CASCADE NOT NULL,
    analysis_id UUID REFERENCES competitor_menu_analyses(id) ON DELETE CASCADE NOT NULL,
    menu_source VARCHAR(50) CHECK (menu_source IN ('google_places', 'website_scrape', 'manual_upload')),
    menu_url TEXT,
    parse_status VARCHAR(50) DEFAULT 'pending' CHECK (parse_status IN ('pending', 'parsing', 'completed', 'failed')),
    parse_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    parsed_at TIMESTAMP
);

COMMENT ON TABLE competitor_menu_snapshots IS 'Parsed menu data from selected competitors';
COMMENT ON COLUMN competitor_menu_snapshots.menu_source IS 'Where we got the menu from';
COMMENT ON COLUMN competitor_menu_snapshots.parse_metadata IS 'Gemini parsing metadata (model, cost, time, items_extracted)';

-- Competitor menu items (parsed from competitor menus)
CREATE TABLE IF NOT EXISTS competitor_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES competitor_menu_snapshots(id) ON DELETE CASCADE NOT NULL,
    category_name VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    price_range_low DECIMAL(10, 2),
    price_range_high DECIMAL(10, 2),
    size_variants JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE competitor_menu_items IS 'Individual menu items from competitor menus';
COMMENT ON COLUMN competitor_menu_items.size_variants IS 'JSON array of size/price pairs: [{"size": "Small", "price": 10.00}, {"size": "Large", "price": 15.00}]';
COMMENT ON COLUMN competitor_menu_items.base_price IS 'Lowest price if multiple sizes, or single price';

-- Menu comparison insights (LLM-generated analysis)
CREATE TABLE IF NOT EXISTS menu_comparison_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES competitor_menu_analyses(id) ON DELETE CASCADE NOT NULL,
    insight_type VARCHAR(50) CHECK (insight_type IN ('pricing_gap', 'missing_item', 'overpriced_item', 'underpriced_item', 'category_gap', 'opportunity')),
    category VARCHAR(100),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    user_item_name VARCHAR(255),
    user_item_price DECIMAL(10, 2),
    competitor_item_name VARCHAR(255),
    competitor_item_price DECIMAL(10, 2),
    competitor_business_name VARCHAR(255),
    price_difference DECIMAL(10, 2),
    price_difference_percent DECIMAL(5, 2),
    confidence VARCHAR(20) CHECK (confidence IN ('high', 'medium', 'low')),
    priority INTEGER DEFAULT 0,
    evidence JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE menu_comparison_insights IS 'LLM-generated insights from menu comparison';
COMMENT ON COLUMN menu_comparison_insights.insight_type IS 'Type of insight discovered';
COMMENT ON COLUMN menu_comparison_insights.evidence IS 'Supporting data: competitor names, prices, item matches';
COMMENT ON COLUMN menu_comparison_insights.priority IS 'Higher = more important (0-100)';

-- Saved comparison reports (user can save analysis for later review)
CREATE TABLE IF NOT EXISTS saved_menu_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES competitor_menu_analyses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    report_name VARCHAR(255),
    notes TEXT,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE saved_menu_comparisons IS 'User-saved comparison reports for later review';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Competitor menu analyses
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON competitor_menu_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON competitor_menu_analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_user_status ON competitor_menu_analyses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON competitor_menu_analyses(created_at DESC);

-- Competitor businesses
CREATE INDEX IF NOT EXISTS idx_businesses_analysis_id ON competitor_businesses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_businesses_place_id ON competitor_businesses(place_id);
CREATE INDEX IF NOT EXISTS idx_businesses_selected ON competitor_businesses(analysis_id, is_selected);

-- Competitor menu snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_competitor_id ON competitor_menu_snapshots(competitor_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_analysis_id ON competitor_menu_snapshots(analysis_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_status ON competitor_menu_snapshots(parse_status);

-- Competitor menu items
CREATE INDEX IF NOT EXISTS idx_items_snapshot_id ON competitor_menu_items(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON competitor_menu_items(category_name);
CREATE INDEX IF NOT EXISTS idx_items_price ON competitor_menu_items(base_price);

-- Menu comparison insights
CREATE INDEX IF NOT EXISTS idx_insights_analysis_id ON menu_comparison_insights(analysis_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON menu_comparison_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON menu_comparison_insights(analysis_id, priority DESC);

-- Saved comparisons
CREATE INDEX IF NOT EXISTS idx_saved_user_id ON saved_menu_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_archived ON saved_menu_comparisons(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_saved_created_at ON saved_menu_comparisons(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE competitor_menu_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_menu_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_comparison_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_menu_comparisons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own analyses" ON competitor_menu_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON competitor_menu_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON competitor_menu_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON competitor_menu_analyses;

DROP POLICY IF EXISTS "Users can view own competitor businesses" ON competitor_businesses;
DROP POLICY IF EXISTS "Users can insert own competitor businesses" ON competitor_businesses;
DROP POLICY IF EXISTS "Users can update own competitor businesses" ON competitor_businesses;
DROP POLICY IF EXISTS "Users can delete own competitor businesses" ON competitor_businesses;

DROP POLICY IF EXISTS "Users can view own snapshots" ON competitor_menu_snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON competitor_menu_snapshots;
DROP POLICY IF EXISTS "Users can update own snapshots" ON competitor_menu_snapshots;
DROP POLICY IF EXISTS "Users can delete own snapshots" ON competitor_menu_snapshots;

DROP POLICY IF EXISTS "Users can view own competitor items" ON competitor_menu_items;
DROP POLICY IF EXISTS "Users can insert own competitor items" ON competitor_menu_items;
DROP POLICY IF EXISTS "Users can update own competitor items" ON competitor_menu_items;
DROP POLICY IF EXISTS "Users can delete own competitor items" ON competitor_menu_items;

DROP POLICY IF EXISTS "Users can view own insights" ON menu_comparison_insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON menu_comparison_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON menu_comparison_insights;
DROP POLICY IF EXISTS "Users can delete own insights" ON menu_comparison_insights;

DROP POLICY IF EXISTS "Users can view own saved comparisons" ON saved_menu_comparisons;
DROP POLICY IF EXISTS "Users can insert own saved comparisons" ON saved_menu_comparisons;
DROP POLICY IF EXISTS "Users can update own saved comparisons" ON saved_menu_comparisons;
DROP POLICY IF EXISTS "Users can delete own saved comparisons" ON saved_menu_comparisons;

-- Policies for competitor_menu_analyses
CREATE POLICY "Users can view own analyses" ON competitor_menu_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON competitor_menu_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON competitor_menu_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON competitor_menu_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for competitor_businesses (via analysis_id join)
CREATE POLICY "Users can view own competitor businesses" ON competitor_businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_businesses.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own competitor businesses" ON competitor_businesses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_businesses.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own competitor businesses" ON competitor_businesses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_businesses.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own competitor businesses" ON competitor_businesses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_businesses.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

-- Policies for competitor_menu_snapshots (via analysis_id join)
CREATE POLICY "Users can view own snapshots" ON competitor_menu_snapshots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own snapshots" ON competitor_menu_snapshots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own snapshots" ON competitor_menu_snapshots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own snapshots" ON competitor_menu_snapshots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

-- Policies for competitor_menu_items (via snapshot_id join)
CREATE POLICY "Users can view own competitor items" ON competitor_menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_snapshots
            JOIN competitor_menu_analyses ON competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id
            WHERE competitor_menu_snapshots.id = competitor_menu_items.snapshot_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own competitor items" ON competitor_menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM competitor_menu_snapshots
            JOIN competitor_menu_analyses ON competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id
            WHERE competitor_menu_snapshots.id = competitor_menu_items.snapshot_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own competitor items" ON competitor_menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_snapshots
            JOIN competitor_menu_analyses ON competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id
            WHERE competitor_menu_snapshots.id = competitor_menu_items.snapshot_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own competitor items" ON competitor_menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_snapshots
            JOIN competitor_menu_analyses ON competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id
            WHERE competitor_menu_snapshots.id = competitor_menu_items.snapshot_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

-- Policies for menu_comparison_insights (via analysis_id join)
CREATE POLICY "Users can view own insights" ON menu_comparison_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = menu_comparison_insights.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own insights" ON menu_comparison_insights
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = menu_comparison_insights.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own insights" ON menu_comparison_insights
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = menu_comparison_insights.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own insights" ON menu_comparison_insights
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM competitor_menu_analyses 
            WHERE competitor_menu_analyses.id = menu_comparison_insights.analysis_id 
            AND competitor_menu_analyses.user_id = auth.uid()
        )
    );

-- Policies for saved_menu_comparisons
CREATE POLICY "Users can view own saved comparisons" ON saved_menu_comparisons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved comparisons" ON saved_menu_comparisons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved comparisons" ON saved_menu_comparisons
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved comparisons" ON saved_menu_comparisons
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on competitor_menu_analyses
DROP TRIGGER IF EXISTS update_analyses_updated_at ON competitor_menu_analyses;
CREATE TRIGGER update_analyses_updated_at 
    BEFORE UPDATE ON competitor_menu_analyses
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at timestamp on saved_menu_comparisons
DROP TRIGGER IF EXISTS update_saved_updated_at ON saved_menu_comparisons;
CREATE TRIGGER update_saved_updated_at 
    BEFORE UPDATE ON saved_menu_comparisons
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get analysis with all related data
CREATE OR REPLACE FUNCTION get_menu_comparison_analysis(p_analysis_id UUID)
RETURNS TABLE (
    analysis_id UUID,
    user_menu_id UUID,
    restaurant_name VARCHAR,
    location VARCHAR,
    status VARCHAR,
    competitor_id UUID,
    competitor_name VARCHAR,
    competitor_address TEXT,
    is_selected BOOLEAN,
    snapshot_id UUID,
    menu_source VARCHAR,
    parse_status VARCHAR,
    item_id UUID,
    category_name VARCHAR,
    item_name VARCHAR,
    item_description TEXT,
    base_price DECIMAL,
    size_variants JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS analysis_id,
        a.user_menu_id,
        a.restaurant_name,
        a.location,
        a.status,
        cb.id AS competitor_id,
        cb.business_name AS competitor_name,
        cb.address AS competitor_address,
        cb.is_selected,
        cms.id AS snapshot_id,
        cms.menu_source,
        cms.parse_status,
        cmi.id AS item_id,
        cmi.category_name,
        cmi.item_name,
        cmi.description AS item_description,
        cmi.base_price,
        cmi.size_variants
    FROM competitor_menu_analyses a
    LEFT JOIN competitor_businesses cb ON cb.analysis_id = a.id
    LEFT JOIN competitor_menu_snapshots cms ON cms.competitor_id = cb.id
    LEFT JOIN competitor_menu_items cmi ON cmi.snapshot_id = cms.id
    WHERE a.id = p_analysis_id
    ORDER BY cb.business_name, cmi.category_name, cmi.item_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_menu_comparison_analysis IS 'Get complete analysis with competitors, menus, and items';

-- Function to get insights for an analysis
CREATE OR REPLACE FUNCTION get_comparison_insights(p_analysis_id UUID)
RETURNS TABLE (
    insight_id UUID,
    insight_type VARCHAR,
    category VARCHAR,
    title TEXT,
    description TEXT,
    user_item_name VARCHAR,
    user_item_price DECIMAL,
    competitor_item_name VARCHAR,
    competitor_item_price DECIMAL,
    competitor_business_name VARCHAR,
    price_difference DECIMAL,
    price_difference_percent DECIMAL,
    confidence VARCHAR,
    priority INTEGER,
    evidence JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mci.id AS insight_id,
        mci.insight_type,
        mci.category,
        mci.title,
        mci.description,
        mci.user_item_name,
        mci.user_item_price,
        mci.competitor_item_name,
        mci.competitor_item_price,
        mci.competitor_business_name,
        mci.price_difference,
        mci.price_difference_percent,
        mci.confidence,
        mci.priority,
        mci.evidence
    FROM menu_comparison_insights mci
    WHERE mci.analysis_id = p_analysis_id
    ORDER BY mci.priority DESC, mci.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_comparison_insights IS 'Get all insights for an analysis, ordered by priority';

-- Function to cascade delete menu analysis with all related data
CREATE OR REPLACE FUNCTION delete_menu_analysis_cascade(
    target_analysis_id UUID,
    target_user_id UUID
) RETURNS TABLE (success BOOLEAN, message TEXT) AS $
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM competitor_menu_analyses 
        WHERE id = target_analysis_id AND user_id = target_user_id
    ) THEN
        RETURN QUERY SELECT FALSE, 'Analysis not found or access denied'::TEXT;
        RETURN;
    END IF;
    
    -- Delete in correct order (children first)
    -- 1. Delete menu comparison insights
    DELETE FROM menu_comparison_insights WHERE analysis_id = target_analysis_id;
    
    -- 2. Delete competitor menu items (via snapshots)
    DELETE FROM competitor_menu_items 
    WHERE snapshot_id IN (
        SELECT cms.id FROM competitor_menu_snapshots cms
        WHERE cms.analysis_id = target_analysis_id
    );
    
    -- 3. Delete competitor menu snapshots
    DELETE FROM competitor_menu_snapshots WHERE analysis_id = target_analysis_id;
    
    -- 4. Delete saved comparisons
    DELETE FROM saved_menu_comparisons WHERE analysis_id = target_analysis_id;
    
    -- 5. Delete competitor businesses
    DELETE FROM competitor_businesses WHERE analysis_id = target_analysis_id;
    
    -- 6. Delete analysis record
    DELETE FROM competitor_menu_analyses WHERE id = target_analysis_id;
    
    RETURN QUERY SELECT TRUE, 'Analysis cascade deleted successfully'::TEXT;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_menu_analysis_cascade IS 'Cascade delete menu analysis with all related data (competitors, menus, insights, saved comparisons)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
                'competitor_menu_analyses',
                'competitor_businesses',
                'competitor_menu_snapshots',
                'competitor_menu_items',
                'menu_comparison_insights',
                'saved_menu_comparisons'
            )) = 6,
           'Not all competitor menu comparison tables were created';
    
    RAISE NOTICE '✅ All 6 competitor menu comparison tables created successfully';
END $$;

-- Verify indexes were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename IN (
                'competitor_menu_analyses',
                'competitor_businesses',
                'competitor_menu_snapshots',
                'competitor_menu_items',
                'menu_comparison_insights',
                'saved_menu_comparisons'
            )) >= 18,
           'Not all indexes were created';
    
    RAISE NOTICE '✅ All indexes created successfully';
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN (
                'competitor_menu_analyses',
                'competitor_businesses',
                'competitor_menu_snapshots',
                'competitor_menu_items',
                'menu_comparison_insights',
                'saved_menu_comparisons'
            )
            AND rowsecurity = true) = 6,
           'RLS not enabled on all tables';
    
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- Verify policies were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename IN (
                'competitor_menu_analyses',
                'competitor_businesses',
                'competitor_menu_snapshots',
                'competitor_menu_items',
                'menu_comparison_insights',
                'saved_menu_comparisons'
            )) >= 24,
           'Not all RLS policies were created';
    
    RAISE NOTICE '✅ All RLS policies created successfully';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Migration 014 completed successfully!';
    RAISE NOTICE '📋 Created: 6 tables, 18+ indexes, 24+ RLS policies, 2 helper functions';
    RAISE NOTICE '🔒 RLS enabled on all tables';
    RAISE NOTICE '✅ Ready for competitor menu comparison module';
END $$;
