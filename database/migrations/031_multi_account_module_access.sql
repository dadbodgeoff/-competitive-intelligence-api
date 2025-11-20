-- ============================================================================
-- MIGRATION 031: Multi-Account & Module Access Foundation
-- ============================================================================
-- Description : Adds shared account model, membership, invitations, and
--               module-level access controls so owners can manage team access.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: Requires Supabase auth schema (`auth.users`) and existing
--               `public.users` profile table.
-- ============================================================================

-- Ensure UUID generation extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_member_role') THEN
        CREATE TYPE account_member_role AS ENUM ('owner', 'admin', 'member');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_member_status') THEN
        CREATE TYPE account_member_status AS ENUM ('active', 'invited', 'suspended');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_invitation_status') THEN
        CREATE TYPE account_invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');
    END IF;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    plan VARCHAR(50) DEFAULT 'free',
    trial_ends_at TIMESTAMPTZ,
    billing_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE accounts IS 'Top-level tenant account shared by multiple users';
COMMENT ON COLUMN accounts.plan IS 'Subscription plan: free, premium, enterprise';

CREATE TABLE IF NOT EXISTS account_members (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role account_member_role NOT NULL DEFAULT 'member',
    status account_member_status NOT NULL DEFAULT 'active',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, user_id)
);

COMMENT ON TABLE account_members IS 'Links users to accounts with a role and status';
COMMENT ON COLUMN account_members.role IS 'owner, admin, or member';

-- Enforce single owner per account
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_members_owner_unique
ON account_members(account_id)
WHERE role = 'owner';

CREATE TABLE IF NOT EXISTS account_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role account_member_role NOT NULL DEFAULT 'member',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status account_invitation_status NOT NULL DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ
);

COMMENT ON TABLE account_invitations IS 'Tracks pending invitations for users to join an account';

CREATE TABLE IF NOT EXISTS modules (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

COMMENT ON TABLE modules IS 'Canonical list of product modules/features';

CREATE TABLE IF NOT EXISTS account_module_access (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    module_slug TEXT NOT NULL REFERENCES modules(slug) ON DELETE CASCADE,
    can_access BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    PRIMARY KEY (account_id, module_slug)
);

COMMENT ON TABLE account_module_access IS 'Per-account feature access flags managed by the owner';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_user ON account_members(user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_role ON account_members(role);
CREATE INDEX IF NOT EXISTS idx_account_invitations_account ON account_invitations(account_id);
CREATE INDEX IF NOT EXISTS idx_account_invitations_email ON account_invitations(email);
CREATE INDEX IF NOT EXISTS idx_account_module_access_account ON account_module_access(account_id);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add link from public.users profile to the primary account (nullable for now)
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS primary_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS default_account_role account_member_role DEFAULT 'member',
    ADD COLUMN IF NOT EXISTS last_invited_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.users.primary_account_id IS 'Default account context for the user';
COMMENT ON COLUMN public.users.default_account_role IS 'Most privileged role granted across accounts';

-- ============================================================================
-- DATA SEEDING
-- ============================================================================

-- Seed modules catalog (idempotent)
INSERT INTO modules (slug, name, description)
VALUES
    ('dashboard', 'Executive Dashboard', 'Overview KPIs, alerts, and announcements'),
    ('invoices', 'Invoice Intelligence', 'Upload invoices and analyze line items'),
    ('menu_management', 'Menu Management', 'Maintain restaurant menus and pricing'),
    ('menu_comparison', 'Competitive Menu Comparison', 'Benchmark menus against competitors'),
    ('ordering_predictions', 'Ordering Predictions', 'Demand and ordering recommendations'),
    ('pricing_analytics', 'Pricing Analytics', 'Track competitor pricing trends'),
    ('alerts', 'Alerting & Notifications', 'Threshold-based alert center'),
    ('tier_analysis', 'Tier Analysis', 'Premium tier analytics and insights'),
    ('streaming_analysis', 'Streaming Analysis', 'Real-time analysis workflows'),
    ('reporting', 'Reporting & Exports', 'Generate and export PDF/CSV reports')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

-- For existing accounts (if any), ensure a module access row exists for each module
INSERT INTO account_module_access (account_id, module_slug, can_access, granted_at)
SELECT a.id, m.slug, TRUE, NOW()
FROM accounts a
CROSS JOIN modules m
ON CONFLICT (account_id, module_slug) DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Helper: create an account, owner membership, and default module access in one call
CREATE OR REPLACE FUNCTION public.create_account_with_owner(
    p_owner_user_id UUID,
    p_account_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_id UUID;
BEGIN
    INSERT INTO accounts (owner_user_id, name)
    VALUES (p_owner_user_id, COALESCE(p_account_name, 'My Restaurant'))
    RETURNING id INTO v_account_id;

    INSERT INTO account_members (
        account_id,
        user_id,
        role,
        status,
        invited_by,
        invited_at,
        joined_at
    )
    VALUES (
        v_account_id,
        p_owner_user_id,
        'owner',
        'active',
        p_owner_user_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (account_id, user_id) DO UPDATE
        SET role = EXCLUDED.role,
            status = EXCLUDED.status,
            joined_at = EXCLUDED.joined_at,
            updated_at = NOW();

    INSERT INTO account_module_access (account_id, module_slug, can_access, granted_by, granted_at)
    SELECT v_account_id, m.slug, TRUE, p_owner_user_id, NOW()
    FROM modules m
    ON CONFLICT (account_id, module_slug) DO NOTHING;

    UPDATE public.users
    SET primary_account_id = v_account_id,
        default_account_role = 'owner'
    WHERE id = p_owner_user_id;

    RETURN v_account_id;
END;
$$;

COMMENT ON FUNCTION public.create_account_with_owner(UUID, TEXT)
    IS 'Creates an account for the user, assigns owner role, and seeds module access';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_module_access ENABLE ROW LEVEL SECURITY;
-- modules table is read-only catalogue; leave RLS disabled for simplicity

-- Drop existing policies to allow re-running migration safely
DROP POLICY IF EXISTS "Service role manages accounts" ON accounts;
DROP POLICY IF EXISTS "Members can view account" ON accounts;
DROP POLICY IF EXISTS "Owners can update account" ON accounts;
DROP POLICY IF EXISTS "Owners can delete account" ON accounts;

DROP POLICY IF EXISTS "Service role manages account members" ON account_members;
DROP POLICY IF EXISTS "Members can view membership" ON account_members;
DROP POLICY IF EXISTS "Owners manage membership" ON account_members;

DROP POLICY IF EXISTS "Service role manages invitations" ON account_invitations;
DROP POLICY IF EXISTS "Owners manage invitations" ON account_invitations;
DROP POLICY IF EXISTS "Owners view invitations" ON account_invitations;

DROP POLICY IF EXISTS "Service role manages module access" ON account_module_access;
DROP POLICY IF EXISTS "Members can view module access" ON account_module_access;
DROP POLICY IF EXISTS "Owners manage module access" ON account_module_access;

-- accounts policies
CREATE POLICY "Service role manages accounts" ON accounts
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members can view account" ON accounts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = accounts.id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Owners can update account" ON accounts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = accounts.id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = accounts.id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    );

CREATE POLICY "Owners can delete account" ON accounts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = accounts.id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    );

-- account_members policies
CREATE POLICY "Service role manages account members" ON account_members
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members can view membership" ON account_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am2
            WHERE am2.account_id = account_members.account_id
              AND am2.user_id = auth.uid()
              AND am2.status = 'active'
        )
    );

CREATE POLICY "Owners manage membership" ON account_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am2
            WHERE am2.account_id = account_members.account_id
              AND am2.user_id = auth.uid()
              AND am2.status = 'active'
              AND am2.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am2
            WHERE am2.account_id = account_members.account_id
              AND am2.user_id = auth.uid()
              AND am2.status = 'active'
              AND am2.role = 'owner'
        )
    );

-- account_invitations policies
CREATE POLICY "Service role manages invitations" ON account_invitations
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Owners manage invitations" ON account_invitations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_invitations.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_invitations.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    );

CREATE POLICY "Owners view invitations" ON account_invitations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_invitations.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    );

-- account_module_access policies
CREATE POLICY "Service role manages module access" ON account_module_access
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members can view module access" ON account_module_access
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_module_access.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Owners manage module access" ON account_module_access
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_module_access.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_module_access.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


