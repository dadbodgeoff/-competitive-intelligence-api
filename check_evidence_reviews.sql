-- Check if evidence reviews exist for the premium analysis
SELECT 
    analysis_id,
    competitor_name,
    sentiment_category,
    COUNT(*) as review_count
FROM evidence_reviews
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38'
GROUP BY analysis_id, competitor_name, sentiment_category
ORDER BY competitor_name, sentiment_category;

-- Total count
SELECT COUNT(*) as total_evidence_reviews
FROM evidence_reviews
WHERE analysis_id = '5cec1990-c54d-4935-b352-18af09e78f38';
