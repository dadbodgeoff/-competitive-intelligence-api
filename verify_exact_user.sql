-- Verify the exact user ID from the logs
SELECT 
    id,
    subscription_tier,
    updated_at
FROM public.users
WHERE id = '7a8e9f71-ca9f-46af-8694-41b5e52464ab';
