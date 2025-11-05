-- Deep audit of menu comparison save flow
-- Check if data was actually saved to database

-- 1. Check recent competitor_menu_analyses for your user
SELECT 
    id,
    user_id,
    restaurant_name,
    location,
    status,
    competitors_found,
    competitors_selected,
    created_at,
    completed_at
FROM competitor_menu_analyses
WHERE user_id = '455a0c46-b694-44e8-ab1c-ee36342037cf'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if any saved_menu_comparisons exist
SELECT 
    id,
    analysis_id,
    user_id,
    report_name,
    notes,
    is_archived,
    created_at
FROM saved_menu_comparisons
WHERE user_id = '455a0c46-b694-44e8-ab1c-ee36342037cf'
ORDER BY created_at DESC;

-- 3. Check competitor_businesses for recent analyses
SELECT 
    cb.id,
    cb.analysis_id,
    cb.business_name,
    cb.is_selected,
    cma.restaurant_name,
    cma.status
FROM competitor_businesses cb
JOIN competitor_menu_analyses cma ON cma.id = cb.analysis_id
WHERE cma.user_id = '455a0c46-b694-44e8-ab1c-ee36342037cf'
ORDER BY cb.created_at DESC
LIMIT 10;

-- 4. Check menu_comparison_insights
SELECT 
    mci.id,
    mci.analysis_id,
    mci.title,
    mci.insight_type,
    cma.restaurant_name,
    cma.status
FROM menu_comparison_insights mci
JOIN competitor_menu_analyses cma ON cma.id = mci.analysis_id
WHERE cma.user_id = '455a0c46-b694-44e8-ab1c-ee36342037cf'
ORDER BY mci.created_at DESC
LIMIT 10;

-- 5. Check RLS policies on saved_menu_comparisons
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'saved_menu_comparisons';
