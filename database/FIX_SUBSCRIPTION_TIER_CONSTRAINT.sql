-- Fix subscription_tier constraint to allow 'premium' and 'enterprise'
-- Run this in Supabase SQL Editor

-- First, check what constraint exists
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
    AND conname LIKE '%subscription_tier%';

-- Drop the old constraint if it exists
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

-- Add new constraint that allows 'free', 'premium', and 'enterprise'
ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'premium', 'enterprise'));

-- Verify the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
    AND conname LIKE '%subscription_tier%';

-- Show current users
SELECT 
    u.id,
    au.email,
    u.subscription_tier,
    u.is_active
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
