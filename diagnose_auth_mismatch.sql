-- Diagnose auth/public users mismatch after database copy

-- 1. Check for auth users without public.users records
SELECT 
    'Auth users missing from public.users' as issue,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. Check for public.users without auth users (orphaned)
SELECT 
    'Public users missing from auth.users' as issue,
    COUNT(*) as count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;

-- 3. List specific auth users without public records
SELECT 
    'Missing public.users records' as type,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
LIMIT 10;

-- 4. Check if there are any users at all
SELECT 
    'Total auth.users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total public.users' as metric,
    COUNT(*) as count
FROM public.users;
