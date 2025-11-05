# Complete Subscription System Setup - Run in Order

## Step 1: Fix Subscription Tier Constraint
**File:** `FIX_SUBSCRIPTION_TIER_CONSTRAINT.sql`

This removes the old constraint and adds a new one that allows 'free', 'premium', and 'enterprise'.

```sql
-- Copy and paste this entire block
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'premium', 'enterprise'));
```

## Step 2: Run Full Verification Script
**File:** `SUBSCRIPTION_SYSTEM_SQL_VERIFICATION.sql`

This creates all the new tables, indexes, policies, and functions.

Copy and paste the entire file contents.

## Step 3: Upgrade User to Premium
**File:** `UPGRADE_USER_TO_PREMIUM.sql`

Change the email to your target user and run:

```sql
DO $$
DECLARE
    target_user_id UUID;
    user_email TEXT := 'nrivikings8@gmail.com';  -- CHANGE THIS
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
WHERE au.email = 'nrivikings8@gmail.com';  -- CHANGE THIS
```

## Expected Results

After running all three steps, you should see:

```
| metric                        | value |
| ----------------------------- | ----- |
| Total Users                   | 2     |
| Free Tier Users               | 1     |
| Premium Tier Users            | 1     |  ← Should be 1 now
| Enterprise Tier Users         | 0     |
| Total Analyses                | 89    |
| Subscription History Records  | 1     |  ← Should be 1 now
| Subscription Metadata Records | 1     |  ← Should be 1 now
```

## Troubleshooting

If you still get errors:

1. **Check current constraint:**
```sql
SELECT 
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
    AND conname LIKE '%subscription%';
```

2. **Manually update user (bypass function):**
```sql
UPDATE public.users 
SET subscription_tier = 'premium',
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'nrivikings8@gmail.com');
```

3. **Verify update:**
```sql
SELECT 
    u.subscription_tier,
    au.email
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE au.email = 'nrivikings8@gmail.com';
```
