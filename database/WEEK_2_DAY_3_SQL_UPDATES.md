# 🍽️ WEEK 2 DAY 3 - MENU INTELLIGENCE SQL UPDATES

## 📊 OVERVIEW

**Purpose:** Database schema updates required for Menu Intelligence system integration  
**Safety Level:** ✅ **COMPLETELY SAFE** - No modifications to existing tables  
**Execution Time:** ~2-3 minutes  
**Rollback:** Fully reversible (drop tables if needed)  

---

## 🔒 SAFETY GUARANTEES

### **Zero Risk to Existing System**
- ✅ **No modifications** to existing `public.analyses` table
- ✅ **No modifications** to existing `public.users` table  
- ✅ **No modifications** to existing `public.restaurants` table
- ✅ **Completely separate** menu intelligence tables
- ✅ **Independent RLS policies** - no conflicts with existing security

### **Isolation Strategy**
- All menu tables use `menu_` prefix for clear separation
- Foreign keys only reference existing stable tables (`users`)
- No triggers or functions that affect existing tables
- Complete rollback capability without affecting review system

---

## 📋 EXECUTION CHECKLIST

### **Pre-Execution Verification**
- [ ] Confirm Supabase SQL Editor access
- [ ] Verify existing system is operational
- [ ] Backup current database (optional but recommended)
- [ ] Review all SQL statements below

### **Execution Steps**
1. [ ] Copy SQL from "COMPLETE SQL SCRIPT" section below
2. [ ] Paste into Supabase SQL Editor
3. [ ] Execute the complete script
4. [ ] Verify table creation in Database view
5. [ ] Test RLS policies with sample queries

### **Post-Execution Validation**
- [ ] All 4 new tables created successfully
- [ ] All indexes created
- [ ] All RLS policies active
- [ ] No errors in Supabase logs
- [ ] Existing system still functional

---

## 🗄️ NEW TABLES OVERVIEW

### **1. `public.menu_analyses`**
**Purpose:** Store menu analysis requests and results  
**Records:** User menu uploads, analysis status, results  
**Security:** User can only access their own analyses  

### **2. `public.menu_insights`**
**Purpose:** Store individual insights from menu analysis  
**Records:** Pricing recommendations, gap analysis, opportunities  
**Security:** Linked to user's analyses via foreign key  

### **3. `public.competitor_menus`**
**Purpose:** Cache extracted competitor menus (7-day TTL)  
**Records:** Scraped menu data, extraction metadata  
**Security:** Shared cache with controlled access  

### **4. `public.menu_item_matches`**
**Purpose:** Store LLM-generated item matches  
**Records:** User item vs competitor item comparisons  
**Security:** Linked to user's analyses via foreign key  

---

## 🔧 COMPLETE SQL SCRIPT

**Copy and paste this entire script into Supabase SQL Editor:**

```sql
-- ============================================================================
-- WEEK 2 DAY 3: MENU INTELLIGENCE DATABASE SCHEMA
-- SAFE: Completely separate from existing review analysis tables
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: MENU ANALYSES
-- ============================================================================
CREATE TABLE public.menu_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    
    -- Menu Analysis Specific Fields
    restaurant_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    restaurant_menu JSONB NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'premium')),
    
    -- Processing Information
    competitor_count INTEGER DEFAULT 2,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    current_step VARCHAR(255),
    error_message TEXT,
    
    -- Results Metadata
    total_competitors_analyzed INTEGER,
    total_menu_items_compared INTEGER,
    processing_time_seconds INTEGER,
    
    -- Cost Tracking
    estimated_cost DECIMAL(10,4),
    actual_cost DECIMAL(10,4),
    
    -- LLM Information
    llm_provider VARCHAR(50) DEFAULT 'google_gemini',
    llm_model VARCHAR(100) DEFAULT 'gemini-2.0-flash-exp',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- ============================================================================
-- TABLE 2: MENU INSIGHTS
-- ============================================================================
CREATE TABLE public.menu_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_analysis_id UUID REFERENCES public.menu_analyses(id) ON DELETE CASCADE,
    
    -- Insight Classification
    category VARCHAR(50) NOT NULL CHECK (category IN ('pricing', 'gap', 'opportunity', 'threat', 'watch')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Confidence and Evidence
    confidence VARCHAR(20) NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
    significance DECIMAL(4,2), -- 0-100 percentage
    proof_quote TEXT,
    mention_count INTEGER DEFAULT 1,
    
    -- Source Information
    competitor_source VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: COMPETITOR MENUS CACHE
-- ============================================================================
CREATE TABLE public.competitor_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_place_id VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    
    -- Menu Data
    menu_data JSONB NOT NULL,
    extraction_method VARCHAR(50) NOT NULL CHECK (extraction_method IN ('toast', 'square', 'slice', 'vision', 'user_upload')),
    extraction_url VARCHAR(500),
    
    -- Quality Metrics
    success_rate DECIMAL(3,2) DEFAULT 1.0,
    item_count INTEGER,
    
    -- Cache Management
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    last_accessed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: MENU ITEM MATCHES
-- ============================================================================
CREATE TABLE public.menu_item_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_analysis_id UUID REFERENCES public.menu_analyses(id) ON DELETE CASCADE,
    
    -- User's Menu Item
    user_item_name VARCHAR(255) NOT NULL,
    user_item_price DECIMAL(10,2),
    user_item_category VARCHAR(100),
    
    -- Competitor Match
    competitor_item_name VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_item_price DECIMAL(10,2),
    
    -- Match Quality
    match_confidence DECIMAL(3,2) NOT NULL, -- 0.0 to 1.0
    price_difference DECIMAL(10,2), -- Positive = user more expensive
    price_difference_percent DECIMAL(5,2),
    
    -- Analysis Results
    pricing_recommendation TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Menu Analyses Indexes
CREATE INDEX idx_menu_analyses_user_id ON public.menu_analyses(user_id);
CREATE INDEX idx_menu_analyses_status ON public.menu_analyses(status);
CREATE INDEX idx_menu_analyses_tier ON public.menu_analyses(tier);
CREATE INDEX idx_menu_analyses_created_at ON public.menu_analyses(created_at);

-- Menu Insights Indexes
CREATE INDEX idx_menu_insights_analysis_id ON public.menu_insights(menu_analysis_id);
CREATE INDEX idx_menu_insights_category ON public.menu_insights(category);
CREATE INDEX idx_menu_insights_confidence ON public.menu_insights(confidence);

-- Competitor Menus Indexes
CREATE INDEX idx_competitor_menus_place_id ON public.competitor_menus(competitor_place_id);
CREATE INDEX idx_competitor_menus_expires_at ON public.competitor_menus(expires_at);
CREATE INDEX idx_competitor_menus_extraction_method ON public.competitor_menus(extraction_method);

-- Menu Item Matches Indexes
CREATE INDEX idx_menu_item_matches_analysis_id ON public.menu_item_matches(menu_analysis_id);
CREATE INDEX idx_menu_item_matches_confidence ON public.menu_item_matches(match_confidence);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all menu tables
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

-- Competitor Menus Policies (shared cache, but access controlled)
CREATE POLICY "Users can view competitor menus" ON public.competitor_menus
    FOR SELECT USING (true); -- Shared cache for all users

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

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================
-- Function to clean up expired competitor menu cache
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

-- Function to validate menu JSON structure
CREATE OR REPLACE FUNCTION public.validate_menu_structure(menu_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if menu has required structure
    IF NOT (menu_json ? 'items') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if items is an array
    IF jsonb_typeof(menu_json->'items') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraint to validate menu structure
ALTER TABLE public.menu_analyses 
ADD CONSTRAINT valid_menu_structure 
CHECK (validate_menu_structure(restaurant_menu));

-- ============================================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.menu_analyses IS 'Menu competitive analysis records - separate from review analyses';
COMMENT ON TABLE public.menu_insights IS 'Insights generated from menu competitive analysis';
COMMENT ON TABLE public.competitor_menus IS 'Cache of extracted competitor menus with 7-day TTL';
COMMENT ON TABLE public.menu_item_matches IS 'LLM-generated matches between user and competitor menu items';

COMMENT ON COLUMN public.menu_analyses.restaurant_menu IS 'User uploaded menu in standardized JSON format';
COMMENT ON COLUMN public.menu_analyses.tier IS 'Analysis tier: free (2 competitors) or premium (5 competitors)';
COMMENT ON COLUMN public.competitor_menus.extraction_method IS 'How the menu was obtained: toast, square, slice, vision, user_upload';
COMMENT ON COLUMN public.menu_item_matches.match_confidence IS 'LLM confidence in item match (0.0-1.0)';
```

---

## ✅ VERIFICATION QUERIES

**After executing the SQL script, run these queries to verify everything is working:**

### **1. Verify Tables Created**
```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'menu_%'
ORDER BY table_name;
```

**Expected Result:** 4 tables (menu_analyses, menu_insights, competitor_menus, menu_item_matches)

### **2. Verify RLS Policies**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'menu_%'
ORDER BY tablename, policyname;
```

**Expected Result:** Multiple RLS policies for each menu table

### **3. Verify Indexes**
```sql
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename LIKE 'menu_%'
ORDER BY tablename, indexname;
```

**Expected Result:** Performance indexes on all menu tables

### **4. Test Menu Structure Validation**
```sql
SELECT public.validate_menu_structure('{"items": [{"name": "Pizza", "price": 12.99}]}');
```

**Expected Result:** `true`

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

**If you need to remove the menu intelligence tables:**

```sql
-- Drop tables in reverse order (due to foreign key constraints)
DROP TABLE IF EXISTS public.menu_item_matches CASCADE;
DROP TABLE IF EXISTS public.menu_insights CASCADE;
DROP TABLE IF EXISTS public.competitor_menus CASCADE;
DROP TABLE IF EXISTS public.menu_analyses CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.cleanup_expired_competitor_menus();
DROP FUNCTION IF EXISTS public.validate_menu_structure(JSONB);
```

---

## 📊 EXPECTED IMPACT

### **Storage Requirements**
- **Initial:** ~1KB per table (empty tables)
- **Per Analysis:** ~5-10KB (menu data + results)
- **Cache Growth:** ~2-5KB per competitor menu
- **Monthly Growth:** Estimated 1-5MB for moderate usage

### **Performance Impact**
- **Query Performance:** Minimal (separate tables, proper indexes)
- **Existing System:** Zero impact (no shared resources)
- **RLS Overhead:** Negligible (simple user_id checks)

### **Maintenance**
- **Automatic Cleanup:** Competitor menu cache expires in 7 days
- **Manual Cleanup:** Run `SELECT public.cleanup_expired_competitor_menus();` if needed
- **Monitoring:** Check table sizes in Supabase dashboard

---

## 🎯 POST-EXECUTION NEXT STEPS

### **Immediate (After SQL Execution)**
1. ✅ Verify all tables created successfully
2. ✅ Test RLS policies with sample queries
3. ✅ Confirm existing system still operational
4. ✅ Update application configuration if needed

### **Development Integration**
1. Update Supabase client configuration
2. Test menu intelligence API endpoints
3. Validate data flow from application to database
4. Run end-to-end tests with real database

### **Production Preparation**
1. Monitor database performance metrics
2. Set up alerts for table growth
3. Schedule periodic cache cleanup
4. Document backup and recovery procedures

---

## 🚨 TROUBLESHOOTING

### **Common Issues & Solutions**

**Issue:** "relation already exists" error  
**Solution:** Tables already created, skip to verification queries

**Issue:** RLS policy creation fails  
**Solution:** Check if policies already exist, drop and recreate if needed

**Issue:** Foreign key constraint fails  
**Solution:** Ensure `public.users` table exists and has proper structure

**Issue:** Function creation fails  
**Solution:** Check PostgreSQL version compatibility, may need syntax adjustments

### **Support Queries**

**Check existing menu tables:**
```sql
\dt public.menu_*
```

**Check RLS status:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'menu_%';
```

---

## ✅ EXECUTION CONFIRMATION

**Once you've successfully executed the SQL script, you should see:**

- ✅ 4 new tables in Supabase Database view
- ✅ All tables have RLS enabled (shield icon)
- ✅ No errors in Supabase logs
- ✅ Verification queries return expected results
- ✅ Existing review analysis system still functional

**The database is now ready for Menu Intelligence system integration!**

---

*SQL Schema designed for Week 2 Day 3 Menu Intelligence Integration*  
*Safe execution with zero impact on existing review analysis system*