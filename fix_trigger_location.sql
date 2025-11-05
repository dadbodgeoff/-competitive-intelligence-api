-- Fix: Move trigger to auth.users table
-- This is the correct location for new user registration

-- 1. Drop trigger from wrong location
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;

-- 2. Drop trigger from correct location (to recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger on auth.users (correct location)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify trigger location
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    n.nspname AS schema_name,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';
