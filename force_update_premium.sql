-- Force update the user to premium (direct UPDATE, bypassing function)
UPDATE public.users
SET subscription_tier = 'premium',
    updated_at = NOW()
WHERE id = '7a8e9f71-ca9f-46af-8694-41b5e52464ab';

-- Verify the update
SELECT 
    id,
    subscription_tier,
    updated_at
FROM public.users
WHERE id = '7a8e9f71-ca9f-46af-8694-41b5e52464ab';
