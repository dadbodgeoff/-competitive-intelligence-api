-- COMPREHENSIVE AUDIT FOR ANALYSIS: 5cec1990-c54d-4935-b352-18af09e78f38
-- Run each section in Supabase SQL Editor

-- ============================================================================
-- 1. ANALYSIS METADATA
-- ============================================================================
SELECT 
    id,
    restaurant_name,
    location,
    tier,
    competitor_count,
    status,
    insights_generated,
    total_reviews_analyzed,
    created_at,
    completed_at
FROM analyses
WHERE id = '5cec1990-c54d-4935-b352-18af09e78f38';

-- ============================================================================
-- 2. COMPETITORS FOUND
-- ============================================================================
SELECT 
    ac.competitor_id,
    ac.competitor_name,
    ac.rating,
    ac.review_count,
    ac.distance_miles
FROM analysis_competitors ac
WHERE ac.analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
ORDER BY ac.competitor_name;

-- ============================================================================
-- 3. REVIEWS COLLECTED (should be 150 per competitor for premium)
-- ============================================================================
SELECT 
    r.competitor_id,
    c.name as competitor_name,
    COUNT(*) as reviews_collected,
    MIN(r.review_date) as oldest_review,
    MAX(r.review_date) as newest_review
FROM reviews r
JOIN competitors c ON r.competitor_id = c.id
WHERE r.competitor_id IN (
    SELECT competitor_id 
    FROM analysis_competitors 
    WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
)
GROUP BY r.competitor_id, c.name
ORDER BY c.name;

-- ============================================================================
-- 4. INSIGHTS GENERATED (should be 5 per competitor for premium)
-- ============================================================================
SELECT 
    competitor_name,
    category,
    COUNT(*) as insight_count
FROM insights
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
GROUP BY competitor_name, category
ORDER BY competitor_name, category;

-- Total insights
SELECT COUNT(*) as total_insights
FROM insights
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38';

-- ============================================================================
-- 5. EVIDENCE REVIEWS (should be 35 per competitor for premium)
-- ============================================================================
SELECT 
    competitor_name,
    sentiment_category,
    COUNT(*) as evidence_count
FROM evidence_reviews
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
GROUP BY competitor_name, sentiment_category
ORDER BY competitor_name, sentiment_category;

-- Total evidence reviews
SELECT COUNT(*) as total_evidence_reviews
FROM evidence_reviews
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38';

-- Sample evidence review to see structure
SELECT 
    competitor_name,
    sentiment_category,
    review_data,
    created_at
FROM evidence_reviews
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
LIMIT 3;

-- ============================================================================
-- 6. SUMMARY COMPARISON
-- ============================================================================
SELECT 
    'Competitors Found' as metric,
    COUNT(DISTINCT competitor_id)::TEXT as value
FROM analysis_competitors
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'

UNION ALL

SELECT 
    'Total Reviews Collected',
    COUNT(*)::TEXT
FROM reviews
WHERE competitor_id IN (
    SELECT competitor_id 
    FROM analysis_competitors 
    WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
)

UNION ALL

SELECT 
    'Insights Generated',
    COUNT(*)::TEXT
FROM insights
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'

UNION ALL

SELECT 
    'Evidence Reviews Stored',
    COUNT(*)::TEXT
FROM evidence_reviews
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38';

-- ============================================================================
-- 7. EXPECTED VS ACTUAL (Premium Tier)
-- ============================================================================
-- Expected for Premium:
-- - 5 competitors (or as many as available in area)
-- - 150 reviews per competitor
-- - 5 insights per competitor
-- - 35 evidence reviews per competitor

-- This analysis had 4 competitors, so expected:
-- - 4 competitors ✓
-- - 600 total reviews (150 × 4)
-- - 20 insights (5 × 4)
-- - 140 evidence reviews (35 × 4)
