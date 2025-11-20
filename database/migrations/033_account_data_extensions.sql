-- ============================================================================
-- MIGRATION 033: Account-Scoped Data & Compensation Ledger
-- ============================================================================
-- Description : Adds account_id to core operational tables, seeds existing
--               records, and introduces account_member_compensation for pay
--               rate tracking.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: 031_multi_account_module_access.sql, 032_account_backfill.sql
-- ============================================================================

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ACCOUNT ID COLUMN ADDITIONS
-- ============================================================================

-- Invoices -------------------------------------------------------------------
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE invoices i
SET account_id = u.primary_account_id
FROM public.users u
WHERE u.id = i.user_id
  AND i.account_id IS NULL;

-- If any invoices still missing account_id, fall back to newest membership
WITH fallback AS (
    SELECT
        i.id AS invoice_id,
        am.account_id
    FROM invoices i
    JOIN account_members am
        ON am.user_id = i.user_id
       AND am.status = 'active'
    WHERE i.account_id IS NULL
    ORDER BY am.created_at DESC
)
UPDATE invoices i
SET account_id = fallback.account_id
FROM fallback
WHERE i.id = fallback.invoice_id;

ALTER TABLE invoices
    ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON invoices(account_id);

-- Invoice Items --------------------------------------------------------------
ALTER TABLE invoice_items
    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE invoice_items ii
SET account_id = inv.account_id
FROM invoices inv
WHERE inv.id = ii.invoice_id
  AND ii.account_id IS NULL;

ALTER TABLE invoice_items
    ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_items_account_id ON invoice_items(account_id);

-- Invoice Parse Logs ---------------------------------------------------------
ALTER TABLE invoice_parse_logs
    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE invoice_parse_logs pl
SET account_id = inv.account_id
FROM invoices inv
WHERE inv.id = pl.invoice_id
  AND pl.account_id IS NULL;

ALTER TABLE invoice_parse_logs
    ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_parse_logs_account_id ON invoice_parse_logs(account_id);

-- Usage Limits ---------------------------------------------------------------
ALTER TABLE user_usage_limits
    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE user_usage_limits ul
SET account_id = u.primary_account_id
FROM public.users u
WHERE u.id = ul.user_id
  AND ul.account_id IS NULL;

ALTER TABLE user_usage_limits
    ALTER COLUMN account_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_limits_account_user
    ON user_usage_limits(account_id, user_id);

ALTER TABLE usage_history
    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE usage_history uh
SET account_id = ul.account_id
FROM user_usage_limits ul
WHERE ul.user_id = uh.user_id
  AND uh.account_id IS NULL;

ALTER TABLE usage_history
    ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usage_history_account ON usage_history(account_id);

-- ============================================================================
-- COMPENSATION LEDGER
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_member_compensation (
    account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at      TIMESTAMPTZ,
    rate_cents   BIGINT NOT NULL,
    currency     TEXT NOT NULL DEFAULT 'USD',
    rate_type    TEXT NOT NULL CHECK (rate_type IN ('hourly', 'salary', 'contract')),
    notes        TEXT,
    set_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, user_id, effective_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_compensation_current
    ON account_member_compensation(account_id, user_id)
    WHERE ends_at IS NULL;

COMMENT ON TABLE account_member_compensation IS 'Historical pay rate assignments per account member';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Invoices table policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages invoices" ON invoices;
DROP POLICY IF EXISTS "Members can read invoices" ON invoices;
DROP POLICY IF EXISTS "Members can write invoices" ON invoices;

CREATE POLICY "Service role manages invoices" ON invoices
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members can read invoices" ON invoices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoices.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members can write invoices" ON invoices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoices.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoices.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

-- Invoice items policies
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Members can read invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Members can write invoice items" ON invoice_items;

CREATE POLICY "Service role manages invoice items" ON invoice_items
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members can read invoice items" ON invoice_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoice_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members can write invoice items" ON invoice_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoice_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoice_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

-- Invoice parse logs policies
ALTER TABLE invoice_parse_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages invoice logs" ON invoice_parse_logs;
DROP POLICY IF EXISTS "Members can read invoice logs" ON invoice_parse_logs;
DROP POLICY IF EXISTS "Members can write invoice logs" ON invoice_parse_logs;

CREATE POLICY "Service role manages invoice logs" ON invoice_parse_logs
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members can read invoice logs" ON invoice_parse_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoice_parse_logs.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members can write invoice logs" ON invoice_parse_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoice_parse_logs.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = invoice_parse_logs.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

-- Usage tables policies
ALTER TABLE user_usage_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages usage limits" ON user_usage_limits;
DROP POLICY IF EXISTS "Members read usage limits" ON user_usage_limits;
DROP POLICY IF EXISTS "Members write usage limits" ON user_usage_limits;

CREATE POLICY "Service role manages usage limits" ON user_usage_limits
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members read usage limits" ON user_usage_limits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = user_usage_limits.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
        OR user_usage_limits.user_id = auth.uid()
    );

CREATE POLICY "Members write usage limits" ON user_usage_limits
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = user_usage_limits.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = user_usage_limits.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages usage history" ON usage_history;
DROP POLICY IF EXISTS "Members read usage history" ON usage_history;
DROP POLICY IF EXISTS "Members insert usage history" ON usage_history;

CREATE POLICY "Service role manages usage history" ON usage_history
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members read usage history" ON usage_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = usage_history.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
        OR usage_history.user_id = auth.uid()
    );

CREATE POLICY "Members insert usage history" ON usage_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = usage_history.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

-- Compensation policies
ALTER TABLE account_member_compensation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages compensation" ON account_member_compensation;
DROP POLICY IF EXISTS "Owners manage compensation" ON account_member_compensation;
DROP POLICY IF EXISTS "Members can view own compensation" ON account_member_compensation;

CREATE POLICY "Service role manages compensation" ON account_member_compensation
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Owners manage compensation" ON account_member_compensation
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_member_compensation.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_member_compensation.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        )
    );

CREATE POLICY "Members can view own compensation" ON account_member_compensation
    FOR SELECT
    USING (
        account_member_compensation.user_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = account_member_compensation.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


