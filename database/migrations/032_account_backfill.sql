-- ============================================================================
-- MIGRATION 032: Account Backfill For Existing Users
-- ============================================================================
-- Description : Creates an account + owner membership for legacy users and
--               ensures profile links point at the correct primary account.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: 031_multi_account_module_access.sql
-- ============================================================================

-- Create accounts for users who do not yet belong to one
DO $$
DECLARE
    rec RECORD;
    v_account_id UUID;
    v_account_name TEXT;
BEGIN
    FOR rec IN
        SELECT
            au.id AS user_id,
            au.email,
            u.first_name,
            u.last_name
        FROM auth.users au
        LEFT JOIN public.users u ON u.id = au.id
        WHERE NOT EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.user_id = au.id
        )
    LOOP
        v_account_name :=
            COALESCE(
                NULLIF(TRIM(CONCAT_WS(' ', rec.first_name, rec.last_name)), ''),
                NULLIF(split_part(rec.email, '@', 1), ''),
                'Account ' || LEFT(rec.user_id::TEXT, 8)
            );

        BEGIN
            v_account_id := public.create_account_with_owner(rec.user_id, v_account_name);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Failed to create account for user %: %', rec.user_id, SQLERRM;
        END;
    END LOOP;
END $$;

-- Ensure primary_account_id/default role align with owner membership
WITH owner_members AS (
    SELECT DISTINCT ON (am.user_id)
        am.user_id,
        am.account_id,
        am.role
    FROM account_members am
    WHERE am.status = 'active'
      AND am.role = 'owner'
    ORDER BY am.user_id, am.created_at DESC
)
UPDATE public.users u
SET primary_account_id = owner_members.account_id,
    default_account_role = owner_members.role
FROM owner_members
WHERE u.id = owner_members.user_id;

-- Fallback: pick the highest-privileged active membership when owner not present
WITH ranked_members AS (
    SELECT
        am.user_id,
        am.account_id,
        am.role,
        am.created_at,
        ROW_NUMBER() OVER (
            PARTITION BY am.user_id
            ORDER BY
                CASE am.role
                    WHEN 'owner' THEN 1
                    WHEN 'admin' THEN 2
                    ELSE 3
                END,
                am.created_at DESC
        ) AS rn
    FROM account_members am
    WHERE am.status = 'active'
),
fallback_members AS (
    SELECT user_id, account_id, role
    FROM ranked_members
    WHERE rn = 1
)
UPDATE public.users u
SET primary_account_id = fallback_members.account_id,
    default_account_role = fallback_members.role
FROM fallback_members
WHERE u.id = fallback_members.user_id
  AND u.primary_account_id IS NULL;

-- Seed module access rows for any newly created accounts (idempotent)
INSERT INTO account_module_access (account_id, module_slug, can_access, granted_at)
SELECT a.id, m.slug, TRUE, NOW()
FROM accounts a
CROSS JOIN modules m
ON CONFLICT (account_id, module_slug) DO NOTHING;

-- Align module grants with known owner when missing granted_by
WITH owner_lookup AS (
    SELECT
        am.account_id,
        am.user_id AS owner_user_id
    FROM account_members am
    WHERE am.role = 'owner'
      AND am.status = 'active'
)
UPDATE account_module_access ama
SET granted_by = owner_lookup.owner_user_id
FROM owner_lookup
WHERE ama.account_id = owner_lookup.account_id
  AND ama.granted_by IS NULL;

-- Final consistency notice
DO $$
DECLARE
    accounts_created INT;
BEGIN
    SELECT COUNT(*) INTO accounts_created
    FROM accounts;
    RAISE NOTICE '✅ Account backfill complete. Total accounts: %', accounts_created;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


