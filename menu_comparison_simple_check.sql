-- Simple menu comparison schema check

-- 1. Show competitor_businesses columns
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitor_businesses'
ORDER BY ordinal_position;

-- 2. Show competitor_menu_analyses columns
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitor_menu_analyses'
ORDER BY ordinal_position;

-- 3. Recent menu analyses with data counts
SELECT 
    cma.id,
    cma.restaurant_name,
    cma.status,
    cma.competitors_found,
    cma.competitors_selected,
    cma.created_at
FROM competitor_menu_analyses cma
WHERE cma.created_at > NOW() - INTERVAL '7 days'
ORDER BY cma.created_at DESC
LIMIT 5;

-- 4. Recent competitor_businesses records
SELECT 
    id, 
    analysis_id, 
    place_id, 
    business_name, 
    is_selected,
    created_at
FROM competitor_businesses
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 5;
