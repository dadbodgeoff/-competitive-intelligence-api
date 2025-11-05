-- Test if we can manually insert into public.users
-- This will help identify if there's a constraint issue

-- Generate a test UUID
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Try to insert a test user
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
        test_id,
        'Test',
        'User',
        'free',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Successfully inserted test user with ID: %', test_id;
    
    -- Clean up test user
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE 'Test user deleted';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to insert: %', SQLERRM;
END $$;
