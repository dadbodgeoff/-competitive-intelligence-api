-- Fix RLS to allow trigger to insert into public.users
-- The trigger function runs with SECURITY DEFINER, so it needs proper permissions

-- Option 1: Grant the function owner (postgres) permission to bypass RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Then re-enable with proper policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert (for trigger)
DROP POLICY IF EXISTS "Allow service role to insert users" ON public.users;
CREATE POLICY "Allow service role to insert users"
ON public.users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create policy to allow authenticated users to read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'users';
