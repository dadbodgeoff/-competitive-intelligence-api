-- Sync auth.users with public.users after database copy
-- This creates missing public.users records for existing auth users

-- Insert missing public.users records for all auth users
INSERT INTO public.users (
    id,
    first_name,
    last_name,
    subscription_tier,
    is_active,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
    'free' as subscription_tier,
    true as is_active,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Show what was created
SELECT 
    'Records created' as result,
    COUNT(*) as count
FROM public.users pu
INNER JOIN auth.users au ON pu.id = au.id
WHERE pu.updated_at > NOW() - INTERVAL '1 minute';
