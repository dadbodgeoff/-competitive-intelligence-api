-- Upgrade specific user to premium tier
-- Replace the email address with the target user's email

DO $$
DECLARE
    target_user_id UUID;
    user_email TEXT := 'nrivikings8@gmail.com';  -- CHANGE THIS EMAIL
BEGIN
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;

    IF target_user_id IS NOT NULL THEN
        PERFORM public.update_user_subscription_tier(
            target_user_id,
            'premium',
            NULL,
            'Beta tester - manual upgrade for testing premium features'
        );
        
        RAISE NOTICE 'Successfully upgraded % to premium', user_email;
    ELSE
        RAISE NOTICE 'User not found with email: %', user_email;
    END IF;
END $$;

-- Verify the upgrade
SELECT 
    u.id,
    au.email,
    u.subscription_tier,
    u.updated_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE au.email = 'nrivikings8@gmail.com';  -- CHANGE THIS EMAIL
