-- ============================================================================
-- Migration 021: Enable RLS on Critical Tables
-- ============================================================================
-- Purpose: Fix Supabase security warnings by enabling RLS on tables that
--          have policies defined but RLS not enabled
-- Risk: HIGH - These tables contain user data but are currently unprotected
-- ============================================================================

-- 1. Enable RLS on tables that have policies but RLS disabled
-- These are CRITICAL security issues
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on related tables
ALTER TABLE public.analysis_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for analysis_competitors (if not exist)
DO $$ 
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_competitors' 
        AND policyname = 'Users can view own analysis competitors'
    ) THEN
        CREATE POLICY "Users can view own analysis competitors"
        ON public.analysis_competitors FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.analyses 
            WHERE analyses.id = analysis_competitors.analysis_id 
            AND analyses.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_competitors' 
        AND policyname = 'Users can insert own analysis competitors'
    ) THEN
        CREATE POLICY "Users can insert own analysis competitors"
        ON public.analysis_competitors FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.analyses 
            WHERE analyses.id = analysis_competitors.analysis_id 
            AND analyses.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_competitors' 
        AND policyname = 'Service role can manage analysis competitors'
    ) THEN
        CREATE POLICY "Service role can manage analysis competitors"
        ON public.analysis_competitors FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 4. Create policies for competitors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'competitors' 
        AND policyname = 'Users can view competitors from their analyses'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'competitors' 
        AND policyname = 'Service role can manage competitors'
    ) THEN
        CREATE POLICY "Service role can manage competitors"
        ON public.competitors FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 5. Create policies for evidence_reviews
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'evidence_reviews' 
        AND policyname = 'Users can view evidence from their insights'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'evidence_reviews' 
        AND policyname = 'Service role can manage evidence'
    ) THEN
        CREATE POLICY "Service role can manage evidence"
        ON public.evidence_reviews FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 6. Verify RLS is enabled on all critical tables
DO $$
DECLARE
    table_record RECORD;
    missing_rls BOOLEAN := false;
BEGIN
    FOR table_record IN 
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
          'analyses', 'reviews', 'insights', 
          'analysis_competitors', 'competitors', 'evidence_reviews'
        )
    LOOP
        IF NOT table_record.rowsecurity THEN
            RAISE WARNING 'RLS not enabled on table: %', table_record.tablename;
            missing_rls := true;
        ELSE
            RAISE NOTICE 'RLS enabled on table: %', table_record.tablename;
        END IF;
    END LOOP;

    IF missing_rls THEN
        RAISE EXCEPTION 'RLS verification failed - some tables do not have RLS enabled';
    ELSE
        RAISE NOTICE 'SUCCESS: RLS enabled on all critical tables';
    END IF;
END $$;

-- 7. Display current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'analyses', 'reviews', 'insights', 
  'analysis_competitors', 'competitors', 'evidence_reviews'
)
ORDER BY tablename;
