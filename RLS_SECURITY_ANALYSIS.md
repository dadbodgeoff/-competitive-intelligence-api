# 🔒 RLS (Row Level Security) Analysis

## Overview
Supabase reported 48 warnings. This document analyzes each to determine if they're real security issues or intentional design decisions.

---

## Category 1: Tables Without RLS Enabled (11 warnings)

### 🚨 CRITICAL - Must Enable RLS

#### 1. `analyses` - CRITICAL ISSUE ❌
- **Status:** HAS POLICIES BUT RLS NOT ENABLED
- **Risk:** HIGH - Contains user analysis data
- **Policies Exist:** Yes (6 policies for user isolation)
- **Action:** ENABLE RLS IMMEDIATELY
```sql
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
```

#### 2. `reviews` - CRITICAL ISSUE ❌
- **Status:** HAS POLICIES BUT RLS NOT ENABLED  
- **Risk:** HIGH - Contains review data linked to analyses
- **Policies Exist:** Yes ("Users can view reviews from their analyses")
- **Action:** ENABLE RLS IMMEDIATELY
```sql
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
```

#### 3. `insights` - CRITICAL ISSUE ❌
- **Status:** HAS POLICIES BUT RLS NOT ENABLED
- **Risk:** HIGH - Contains user insights
- **Policies Exist:** Yes ("Users can view own insights")
- **Action:** ENABLE RLS IMMEDIATELY
```sql
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
```

#### 4. `analysis_competitors` - HIGH PRIORITY ⚠️
- **Status:** NO RLS
- **Risk:** MEDIUM - Linked to analyses via foreign key
- **Action:** Enable RLS with user_id check
```sql
ALTER TABLE public.analysis_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis competitors"
ON public.analysis_competitors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analyses 
    WHERE analyses.id = analysis_competitors.analysis_id 
    AND analyses.user_id = auth.uid()
  )
);
```

#### 5. `competitors` - HIGH PRIORITY ⚠️
- **Status:** NO RLS
- **Risk:** MEDIUM - Contains competitor data
- **Action:** Enable RLS
```sql
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitors from their analyses"
ON public.competitors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_competitors ac
    JOIN public.analyses a ON a.id = ac.analysis_id
    WHERE ac.competitor_id = competitors.id
    AND a.user_id = auth.uid()
  )
);
```

#### 6. `evidence_reviews` - HIGH PRIORITY ⚠️
- **Status:** NO RLS
- **Risk:** MEDIUM - Contains evidence data
- **Action:** Enable RLS
```sql
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence from their insights"
ON public.evidence_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.insights i
    JOIN public.analyses a ON a.id = i.analysis_id
    WHERE i.id = evidence_reviews.insight_id
    AND a.user_id = auth.uid()
  )
);
```

### ✅ ACCEPTABLE - Reference/Lookup Tables (Read-Only)

#### 7. `units_of_measure` - ACCEPTABLE ✅
- **Status:** NO RLS
- **Risk:** NONE - Static reference data
- **Justification:** Global lookup table, no user-specific data
- **Action:** Optional - Can enable with SELECT-only policy for all users

#### 8. `item_categories` - ACCEPTABLE ✅
- **Status:** NO RLS
- **Risk:** NONE - Static reference data
- **Justification:** Global lookup table, no user-specific data
- **Action:** Optional - Can enable with SELECT-only policy for all users

#### 9. `pack_size_patterns` - ACCEPTABLE ✅
- **Status:** NO RLS
- **Risk:** NONE - Static reference data
- **Justification:** Regex patterns for parsing, no user data
- **Action:** Optional - Can enable with SELECT-only policy for all users

### 🔍 NEEDS REVIEW - Metadata Tables

#### 10. `multi_source_metadata` - NEEDS REVIEW ⚠️
- **Status:** NO RLS
- **Risk:** MEDIUM - May contain user-specific metadata
- **Action:** Review table structure, likely needs RLS
```sql
-- If it has user_id column:
ALTER TABLE public.multi_source_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metadata"
ON public.multi_source_metadata FOR SELECT
USING (user_id = auth.uid());
```

#### 11. `metrics_events` - NEEDS REVIEW ⚠️
- **Status:** NO RLS
- **Risk:** LOW-MEDIUM - Analytics/telemetry data
- **Justification:** May be intentionally open for service role writes
- **Action:** Review if contains user-identifiable data
```sql
-- If it has user_id:
ALTER TABLE public.metrics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert metrics"
ON public.metrics_events FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can view own metrics"
ON public.metrics_events FOR SELECT
USING (user_id = auth.uid());
```

---

## Category 2: Functions with Mutable Search Path (30 warnings)

### Analysis: MEDIUM PRIORITY ⚠️

**What it means:** Functions don't have `SET search_path` which could allow search path injection attacks.

**Risk Level:** MEDIUM - Potential for privilege escalation if attacker can manipulate search_path

**Affected Functions:**
1. `get_active_menu`
2. `update_user_subscription_tier`
3. `get_user_subscription_details`
4. `get_vendor_price_comparison`
5. `find_savings_opportunities`
6. `calculate_vendor_competitive_score`
7. `detect_price_anomalies`
8. `update_inventory_item_price_tracking`
9. `update_inventory_item_price_tracking_for_item`
10. `check_and_reserve_usage_atomic`
11. `update_competitor_menu_access`
12. `cleanup_expired_competitor_menus`
13. `validate_menu_structure`
14. `find_similar_items`
15. `get_fuzzy_matching_stats`
16. `get_system_time`
17. `check_operation_limit`
18. `get_menu_comparison_analysis`
19. `get_comparison_insights`
20. `get_waste_buffer`
21. `get_alert_threshold`
22. `get_tier_limits`
23. `delete_invoice_with_cascade`
24. `check_duplicate_invoice`
25. `get_user_usage_stats`
26. `get_item_price_metrics`
27. `get_all_items_price_summary`
28. `get_items_with_price_changes`
29. `handle_new_user`
30. `update_updated_at_column`

**Fix Template:**
```sql
-- For each function, add SET search_path
ALTER FUNCTION public.function_name() 
SET search_path = public, pg_temp;

-- Or recreate with SECURITY DEFINER and search_path:
CREATE OR REPLACE FUNCTION public.function_name()
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- function body
END;
$$;
```

**Recommendation:** Apply to all functions, prioritize:
1. Authentication functions (`handle_new_user`, `update_user_subscription_tier`)
2. Financial functions (`check_and_reserve_usage_atomic`)
3. Data access functions (all `get_*` functions)

---

## Category 3: View with SECURITY DEFINER (1 warning)

### `system_time_info` - LOW PRIORITY ℹ️

**Status:** View defined with SECURITY DEFINER
**Risk:** LOW - Views with SECURITY DEFINER bypass RLS
**Action:** Review if this is intentional
```sql
-- Check the view definition
\d+ public.system_time_info

-- If it needs to be accessible to all users, this is fine
-- If not, recreate without SECURITY DEFINER
```

---

## Category 4: Extension in Public Schema (1 warning)

### `pg_trgm` - LOW PRIORITY ℹ️

**Status:** Extension installed in public schema
**Risk:** LOW - Best practice violation, not a security issue
**Recommendation:** Move to extensions schema
```sql
-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extension (requires superuser)
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Update search_path
ALTER DATABASE postgres SET search_path TO public, extensions;
```

**Note:** This is cosmetic, not a security issue. Can be done later.

---

## Category 5: Auth Configuration (2 warnings)

### 1. HaveIBeenPwned Integration - MEDIUM PRIORITY ⚠️

**Status:** Not enabled
**Risk:** MEDIUM - Users can use compromised passwords
**Action:** Enable in Supabase Dashboard
```
Settings → Authentication → Password Protection
☑ Enable HaveIBeenPwned password check
```

### 2. MFA Options - LOW PRIORITY ℹ️

**Status:** Too few MFA options enabled
**Risk:** LOW - Depends on your security requirements
**Action:** Enable additional MFA methods in Supabase Dashboard
```
Settings → Authentication → MFA
☑ TOTP (Time-based One-Time Password)
☑ SMS (if needed)
```

---

## Priority Action Plan

### 🚨 IMMEDIATE (Before Production)

1. **Enable RLS on tables with policies:**
```sql
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
```

2. **Enable RLS on related tables:**
```sql
ALTER TABLE public.analysis_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;
```

3. **Create missing RLS policies** (see SQL above)

### ⚠️ HIGH PRIORITY (This Week)

4. **Fix function search paths** - Start with critical functions:
   - `handle_new_user`
   - `update_user_subscription_tier`
   - `check_and_reserve_usage_atomic`
   - All `get_*` functions

5. **Enable HaveIBeenPwned** password checking

6. **Review and secure:**
   - `multi_source_metadata` table
   - `metrics_events` table

### ℹ️ MEDIUM PRIORITY (Before Launch)

7. **Fix remaining function search paths** (all 30 functions)

8. **Enable additional MFA options**

9. **Review `system_time_info` view** security

### 📋 LOW PRIORITY (Post-Launch)

10. **Move `pg_trgm` to extensions schema**

11. **Add RLS to reference tables** (optional):
    - `units_of_measure`
    - `item_categories`
    - `pack_size_patterns`

---

## SQL Script to Fix Critical Issues

```sql
-- ============================================================================
-- CRITICAL RLS FIXES - RUN IMMEDIATELY
-- ============================================================================

-- 1. Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on related tables
ALTER TABLE public.analysis_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for analysis_competitors
CREATE POLICY "Users can view own analysis competitors"
ON public.analysis_competitors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analyses 
    WHERE analyses.id = analysis_competitors.analysis_id 
    AND analyses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own analysis competitors"
ON public.analysis_competitors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.analyses 
    WHERE analyses.id = analysis_competitors.analysis_id 
    AND analyses.user_id = auth.uid()
  )
);

-- 4. Create policies for competitors
CREATE POLICY "Users can view competitors from their analyses"
ON public.competitors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_competitors ac
    JOIN public.analyses a ON a.id = ac.analysis_id
    WHERE ac.competitor_id = competitors.id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage competitors"
ON public.competitors FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Create policies for evidence_reviews
CREATE POLICY "Users can view evidence from their insights"
ON public.evidence_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.insights i
    JOIN public.analyses a ON a.id = i.analysis_id
    WHERE i.id = evidence_reviews.insight_id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage evidence"
ON public.evidence_reviews FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'analyses', 'reviews', 'insights', 
  'analysis_competitors', 'competitors', 'evidence_reviews'
);

-- Expected: All should show rowsecurity = true
```

---

## Summary

**Total Warnings:** 48
- **Critical (Fix Now):** 6 tables without RLS
- **High Priority:** 30 functions without search_path
- **Medium Priority:** 3 (metadata tables, password check)
- **Low Priority:** 9 (reference tables, extensions, MFA)

**Security Impact:**
- **Current Risk:** HIGH - User data not properly isolated
- **After Fixes:** LOW - Industry standard security

**Estimated Fix Time:**
- Critical fixes: 30 minutes
- High priority: 2-3 hours
- All fixes: 4-6 hours
