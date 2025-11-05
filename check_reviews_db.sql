-- Check reviews for this analysis
-- First get competitor IDs for this analysis
SELECT 
    r.id,
    r.competitor_id,
    c.name as competitor_name,
    r.author_name,
    r.rating,
    LEFT(r.text, 50) as text_preview,
    r.review_date
FROM reviews r
JOIN competitors c ON c.id = r.competitor_id
WHERE r.competitor_id IN (
    SELECT competitor_id 
    FROM analysis_competitors 
    WHERE analysis_id = '9bbd7cf0-53f1-42e1-89f3-ea031c37e35e'
)
LIMIT 5;

-- Also check if competitors table has names
SELECT 
    c.id,
    c.name,
    c.place_id
FROM competitors c
WHERE c.id IN (
    SELECT competitor_id 
    FROM analysis_competitors 
    WHERE analysis_id = '9bbd7cf0-53f1-42e1-89f3-ea031c37e35e'
);
