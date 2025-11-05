-- QUICK FIX: Disable the broken trigger so users can register
-- This allows registration to work immediately while we fix the function properly

-- Disable the trigger
DROP TRIGGER IF EXISTS on_user_created_init_limits ON auth.users;

-- Verify it's gone
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_user_created_init_limits';

-- This should return empty, meaning the trigger is disabled
-- Users can now register successfully
-- You'll need to manually initialize usage limits for new users or fix the function later
