-- Verify nrivikings8@gmail.com has premium tier
SELECT 
    u.id,
    au.email,
    u.subscription_tier,
    u.updated_at,
    u.is_active
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE au.email = 'nrivikings8@gmail.com';

-- Also check subscription metadata
SELECT 
    sm.tier,
    sm.started_at,
    sm.payment_provider,
    sm.notes
FROM public.subscription_metadata sm
JOIN auth.users au ON sm.user_id = au.id
WHERE au.email = 'nrivikings8@gmail.com';

-- Check subscription history
SELECT 
    sh.previous_tier,
    sh.new_tier,
    sh.change_reason,
    sh.changed_at
FROM public.subscription_history sh
JOIN auth.users au ON sh.user_id = au.id
WHERE au.email = 'nrivikings8@gmail.com'
ORDER BY sh.changed_at DESC;
