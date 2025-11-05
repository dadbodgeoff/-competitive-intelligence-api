-- Fix users table RLS policies to match dev database exactly
-- This will allow the trigger to work properly

-- Step 1: Drop all existing policies on users table
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;

-- Step 2: Create policies that match dev database (applied to 'public' role only)
CREATE POLICY "Users can insert their own record"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);  -- Allow insert during registration

CREATE POLICY "Users can update their own record"
ON public.users
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
TO public
USING (auth.uid() = id);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Step 5: Verify setup
SELECT 
    'RLS Policies' as check_type,
    policyname,
    cmd::text as command,
    roles::text as applied_to
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;
