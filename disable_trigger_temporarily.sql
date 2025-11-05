-- Temporarily disable the trigger so registration works
-- This will let you register, then we can fix the trigger properly

-- Disable the trigger
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Verify it's disabled
SELECT 
    t.tgname as trigger_name,
    CASE 
        WHEN t.tgenabled = 'D' THEN '❌ DISABLED'
        WHEN t.tgenabled = 'O' THEN '✅ ENABLED'
        ELSE 'UNKNOWN'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname = 'on_auth_user_created' AND n.nspname = 'auth';
