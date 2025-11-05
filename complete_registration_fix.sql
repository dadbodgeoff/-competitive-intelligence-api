-- COMPLETE FIX FOR USER REGISTRATION
-- Run this entire script in Supabase SQL Editor

-- Step 1: Update the trigger function with proper error handling and RLS bypass
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER  -- Run as function owner (postgres) to bypass RLS
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert into public.users
    INSERT INTO public.users (
        id, 
        first_name, 
        last_name,
        subscription_tier,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'free',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;  -- Don't fail if user already exists
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail auth user creation
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- Step 3: Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Set up RLS policies for public.users
-- Keep RLS enabled for security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Policy 1: Allow service role full access (for trigger and API)
CREATE POLICY "Allow service role full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 5: Verify everything is set up correctly
SELECT 'Trigger location:' as check_type, 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    n.nspname AS schema_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname = 'on_auth_user_created'

UNION ALL

SELECT 'RLS Policies:' as check_type,
    policyname,
    cmd::text,
    roles::text
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';
