-- Quick schema verification for review analysis module
-- Copy ALL results and send back

-- 1. COMPETITORS TABLE - What columns exist?
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitors'
ORDER BY ordinal_position;

-- 2. ANALYSIS_COMPETITORS TABLE - What columns exist?
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'analysis_competitors'
ORDER BY ordinal_position;

-- 3. Recent analyses - Are competitors being linked?
SELECT 
    a.id,
    a.restaurant_name,
    a.status,
    a.created_at,
    COUNT(ac.competitor_id) as competitor_count
FROM analyses a
LEFT JOIN analysis_competitors ac ON a.id = ac.analysis_id
WHERE a.created_at > NOW() - INTERVAL '24 hours'
GROUP BY a.id, a.restaurant_name, a.status, a.created_at
ORDER BY a.created_at DESC;

-- 4. Check if competitors table has any recent data
SELECT id, name, google_place_id, created_at
FROM competitors
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 5;
