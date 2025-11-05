-- Upgrade dadbodgeoff@gmail.com to premium tier
-- Run this in Supabase SQL Editor
-- Note: Email is stored in auth.users, not public.users

-- First, find the user ID from auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'dadbodgeoff@gmail.com';

-- Then upgrade using the ID (replace with actual ID from above)
UPDATE users 
SET subscription_tier = 'premium'
WHERE id = '455a0c46-b694-44e8-ab1c-ee36342037cf';

-- Verify the upgrade
SELECT 
    u.id,
    au.email,
    u.subscription_tier,
    u.created_at
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.id = '455a0c46-b694-44e8-ab1c-ee36342037cf';
