-- Diagnose login issues

-- 1. Check if users table exists and has data
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- 2. Check RLS policies on users table
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
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. Check if there are any triggers blocking auth
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- 4. Try to find a specific user (replace with your email)
-- SELECT id, email, email_confirmed_at, created_at 
-- FROM auth.users 
-- WHERE email = 'your-email@example.com';
