-- ============================================================================
-- MIGRATION 046: Per-Member Module Access Control
-- ============================================================================
-- Description : Adds granular per-member module access so owners can control
--               what each team member can see/access individually.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: Requires migration 031_multi_account_module_access.sql
-- ============================================================================

-- ============================================================================
-- NEW TABLE: member_module_access
-- ============================================================================
-- This table allows per-user overrides of account-level module access.
-- If a row exists, it overrides the account-level setting for that user.
-- If no row exists, the user inherits the account-level setting.

CREATE TABLE IF NOT EXISTS member_module_access (
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_slug TEXT NOT NULL REFERENCES modules(slug) ON DELETE CASCADE,
    can_access BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    notes TEXT,
    PRIMARY KEY (account_id, user_id, module_slug)
);

COMMENT ON TABLE member_module_access IS 'Per-member module access overrides. Overrides account-level settings when present.';
COMMENT ON COLUMN member_module_access.can_access IS 'TRUE = member can access, FALSE = member cannot access (overrides account setting)';
COMMENT ON COLUMN member_module_access.notes IS 'Optional reason for the access grant/revocation';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_member_module_access_user ON member_module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_member_module_access_module ON member_module_access(module_slug);
CREATE INDEX IF NOT EXISTS idx_member_module_access_account_user ON member_module_access(account_id, user_id);

-- ============================================================================
-- ADD NEW MODULES (if not exists)
-- ============================================================================

INSERT INTO modules (slug, name, description)
VALUES
    ('scheduling', 'Staff Scheduling', 'Create and manage employee schedules'),
    ('timekeeping', 'Time Clock', 'Employee clock-in/out and time tracking'),
    ('prep', 'Prep Management', 'Kitchen prep lists and task management'),
    ('cogs', 'COGS Analysis', 'Cost of goods sold tracking and analysis'),
    ('creative', 'Creative Studio', 'AI-powered marketing image generation'),
    ('review_analysis', 'Review Analysis', 'Customer review sentiment analysis')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE member_module_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Service role manages member module access" ON member_module_access;
DROP POLICY IF EXISTS "Members can view own module access" ON member_module_access;
DROP POLICY IF EXISTS "Owners and admins manage member module access" ON member_module_access;

-- Service role full access
CREATE POLICY "Service role manages member module access" ON member_module_access
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Members can view their own access
CREATE POLICY "Members can view own module access" ON member_module_access
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = member_module_access.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

-- Owners and admins can manage member access
CREATE POLICY "Owners and admins manage member module access" ON member_module_access
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = member_module_access.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = member_module_access.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- HELPER FUNCTION: Get effective module access for a user
-- ============================================================================
-- Returns the effective access for a user, considering both account-level
-- and member-level overrides.

CREATE OR REPLACE FUNCTION public.get_effective_module_access(
    p_account_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    module_slug TEXT,
    module_name TEXT,
    module_description TEXT,
    can_access BOOLEAN,
    access_source TEXT  -- 'account' or 'member'
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.slug AS module_slug,
        m.name AS module_name,
        m.description AS module_description,
        COALESCE(mma.can_access, ama.can_access, FALSE) AS can_access,
        CASE 
            WHEN mma.can_access IS NOT NULL THEN 'member'
            ELSE 'account'
        END AS access_source
    FROM modules m
    LEFT JOIN account_module_access ama 
        ON ama.account_id = p_account_id 
        AND ama.module_slug = m.slug
    LEFT JOIN member_module_access mma 
        ON mma.account_id = p_account_id 
        AND mma.user_id = p_user_id 
        AND mma.module_slug = m.slug
    ORDER BY m.name;
END;
$$;

COMMENT ON FUNCTION public.get_effective_module_access(UUID, UUID)
    IS 'Returns effective module access for a user, with member overrides taking precedence';

-- ============================================================================
-- HELPER FUNCTION: Check if user can access a specific module
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_can_access_module(
    p_account_id UUID,
    p_user_id UUID,
    p_module_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_member_access BOOLEAN;
    v_account_access BOOLEAN;
BEGIN
    -- Check member-level override first
    SELECT can_access INTO v_member_access
    FROM member_module_access
    WHERE account_id = p_account_id
      AND user_id = p_user_id
      AND module_slug = p_module_slug;
    
    IF v_member_access IS NOT NULL THEN
        RETURN v_member_access;
    END IF;
    
    -- Fall back to account-level access
    SELECT can_access INTO v_account_access
    FROM account_module_access
    WHERE account_id = p_account_id
      AND module_slug = p_module_slug;
    
    RETURN COALESCE(v_account_access, FALSE);
END;
$$;

COMMENT ON FUNCTION public.user_can_access_module(UUID, UUID, TEXT)
    IS 'Returns TRUE if user can access the specified module';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
