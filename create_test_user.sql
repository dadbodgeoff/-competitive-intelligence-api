-- Create test user for inventory system testing
-- Run this in Supabase SQL Editor

-- Option 1: Use existing user (nrivikings8@gmail.com)
-- Get the user ID:
SELECT id, email FROM auth.users WHERE email = 'nrivikings8@gmail.com';

-- Copy the ID from above and use it in your test, OR:

-- Option 2: Create a test user entry in public.users for an existing auth user
-- First, get any existing auth user ID:
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Get first user from auth.users
    SELECT id INTO existing_user_id FROM auth.users LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert into public.users if not exists
        INSERT INTO public.users (id, first_name, last_name, subscription_tier, is_active)
        VALUES (existing_user_id, 'Test', 'User', 'premium', true)
        ON CONFLICT (id) DO UPDATE SET
            is_active = true,
            subscription_tier = 'premium';
        
        RAISE NOTICE 'Test user created with ID: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No auth users found. Please sign up first.';
    END IF;
END $$;

-- Verify
SELECT u.id, u.first_name, u.last_name, u.subscription_tier, au.email
FROM public.users u
JOIN auth.users au ON u.id = au.id
LIMIT 1;
