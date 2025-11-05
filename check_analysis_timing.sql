-- Check the full analysis timing and review data
SELECT 
    a.id,
    a.restaurant_name,
    a.created_at,
    a.completed_at,
    EXTRACT(EPOCH FROM (a.completed_at - a.created_at)) as total_seconds,
    a.tier,
    a.insights_generated,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT ac.competitor_id) as competitor_count
FROM analyses a
LEFT JOIN analysis_competitors ac ON a.id = ac.analysis_id
LEFT JOIN reviews r ON ac.competitor_id = r.competitor_id
WHERE a.id = '856007f7-9022-43ce-8722-b2b75a35ef02'
GROUP BY a.id, a.restaurant_name, a.created_at, a.completed_at, a.tier, a.insights_generated;

-- Get per-competitor review counts
SELECT 
    c.name as competitor_name,
    COUNT(r.id) as review_count,
    MIN(r.review_date) as oldest_review,
    MAX(r.review_date) as newest_review
FROM analysis_competitors ac
JOIN competitors c ON ac.competitor_id = c.id
LEFT JOIN reviews r ON c.id = r.competitor_id
WHERE ac.analysis_id = '856007f7-9022-43ce-8722-b2b75a35ef02'
GROUP BY c.name
ORDER BY review_count DESC;

-- Check if we have timing data in reviews
SELECT 
    competitor_id,
    COUNT(*) as count,
    source,
    source_type
FROM reviews r
WHERE competitor_id IN (
    SELECT competitor_id 
    FROM analysis_competitors 
    WHERE analysis_id = '856007f7-9022-43ce-8722-b2b75a35ef02'
)
GROUP BY competitor_id, source, source_type;
