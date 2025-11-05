-- Analysis ID: e2b66882-18c5-4070-b3e1-d8888471febd
-- Check what happened in this analysis

-- 1. Analysis metadata
SELECT 
    id,
    restaurant_name,
    location,
    tier,
    status,
    created_at,
    completed_at,
    EXTRACT(EPOCH FROM (completed_at - created_at)) as total_seconds,
    total_reviews_analyzed,
    insights_generated
FROM analyses 
WHERE id = 'e2b66882-18c5-4070-b3e1-d8888471febd';

-- 2. Competitors found
SELECT 
    competitor_name,
    rating,
    review_count,
    distance_miles
FROM analysis_competitors
WHERE analysis_id = 'e2b66882-18c5-4070-b3e1-d8888471febd'
ORDER BY competitor_name;

-- 3. Reviews collected per competitor
SELECT 
    c.competitor_name,
    COUNT(r.id) as reviews_collected
FROM analysis_competitors c
LEFT JOIN reviews r ON r.competitor_id = c.competitor_id
WHERE c.analysis_id = 'e2b66882-18c5-4070-b3e1-d8888471febd'
GROUP BY c.competitor_name
ORDER BY c.competitor_name;

-- 4. Insights generated
SELECT 
    category,
    competitor_name,
    title,
    confidence,
    significance
FROM insights
WHERE analysis_id = 'e2b66882-18c5-4070-b3e1-d8888471febd'
ORDER BY competitor_name, category;

-- 5. Check if evidence reviews were stored
SELECT COUNT(*) as evidence_review_count
FROM evidence_reviews
WHERE analysis_id = 'e2b66882-18c5-4070-b3e1-d8888471febd';
