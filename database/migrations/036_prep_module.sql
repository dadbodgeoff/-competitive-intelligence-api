-- =============================================================================
-- MIGRATION 036: Daily Prep Module
-- =============================================================================
-- Description : Adds prep templates, daily prep sheets, item assignments,
--               and supporting history needed for production prep workflows.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: 031_multi_account_module_access.sql,
--               032_account_backfill.sql,
--               033_account_data_extensions.sql,
--               034_scheduling_module.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prep_day_status') THEN
        CREATE TYPE prep_day_status AS ENUM ('draft', 'published');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prep_item_log_action') THEN
        CREATE TYPE prep_item_log_action AS ENUM ('created', 'updated', 'completed', 'reopened', 'deleted');
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prep_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, name)
);

CREATE TABLE IF NOT EXISTS prep_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES prep_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    default_par NUMERIC(10,2) DEFAULT 0,
    default_on_hand NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prep_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    prep_date DATE NOT NULL,
    status prep_day_status NOT NULL DEFAULT 'draft',
    template_id UUID REFERENCES prep_templates(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, prep_date)
);

CREATE TABLE IF NOT EXISTS prep_day_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    prep_day_id UUID NOT NULL REFERENCES prep_days(id) ON DELETE CASCADE,
    template_item_id UUID REFERENCES prep_template_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    par_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    on_hand_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_to_prep NUMERIC(10,2) GENERATED ALWAYS AS (GREATEST(par_amount - on_hand_amount, 0)) STORED,
    unit TEXT,
    assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    completion_note TEXT,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prep_day_item_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    prep_day_id UUID NOT NULL REFERENCES prep_days(id) ON DELETE CASCADE,
    prep_day_item_id UUID NOT NULL REFERENCES prep_day_items(id) ON DELETE CASCADE,
    action prep_item_log_action NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_detail JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_prep_templates_account ON prep_templates(account_id);
CREATE INDEX IF NOT EXISTS idx_prep_template_items_template ON prep_template_items(template_id, display_order);
CREATE INDEX IF NOT EXISTS idx_prep_days_account_date ON prep_days(account_id, prep_date DESC);
CREATE INDEX IF NOT EXISTS idx_prep_days_status ON prep_days(account_id, status);
CREATE INDEX IF NOT EXISTS idx_prep_day_items_day ON prep_day_items(prep_day_id, display_order);
CREATE INDEX IF NOT EXISTS idx_prep_day_items_assignee ON prep_day_items(account_id, assigned_user_id, prep_day_id);
CREATE INDEX IF NOT EXISTS idx_prep_day_item_logs_item ON prep_day_item_logs(prep_day_item_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- MODULE REGISTRATION
-- -----------------------------------------------------------------------------
INSERT INTO modules (slug, name, description)
VALUES ('prep', 'Daily Prep', 'Build daily prep lists, assign teammates, and track completion')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO account_module_access (account_id, module_slug, can_access, granted_at)
SELECT a.id, 'prep', TRUE, NOW()
FROM accounts a
ON CONFLICT (account_id, module_slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- TRIGGERS (updated_at maintenance)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prep_templates_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_prep_templates_updated_at ON prep_templates;';
    END IF;
END $$;
CREATE TRIGGER trg_prep_templates_updated_at
    BEFORE UPDATE ON prep_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prep_template_items_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_prep_template_items_updated_at ON prep_template_items;';
    END IF;
END $$;
CREATE TRIGGER trg_prep_template_items_updated_at
    BEFORE UPDATE ON prep_template_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prep_days_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_prep_days_updated_at ON prep_days;';
    END IF;
END $$;
CREATE TRIGGER trg_prep_days_updated_at
    BEFORE UPDATE ON prep_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prep_day_items_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_prep_day_items_updated_at ON prep_day_items;';
    END IF;
END $$;
CREATE TRIGGER trg_prep_day_items_updated_at
    BEFORE UPDATE ON prep_day_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE prep_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_day_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_day_item_logs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'prep_templates',
            'prep_template_items',
            'prep_days',
            'prep_day_items',
            'prep_day_item_logs'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role manages %1$s" ON %1$s;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Members view %1$s" ON %1$s;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Members manage %1$s" ON %1$s;', tbl);
    END LOOP;
END $$;

CREATE POLICY "Service role manages prep_templates"
    ON prep_templates
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view prep_templates"
    ON prep_templates
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_templates.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members manage prep_templates"
    ON prep_templates
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_templates.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_templates.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Service role manages prep_template_items"
    ON prep_template_items
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view prep_template_items"
    ON prep_template_items
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_template_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members manage prep_template_items"
    ON prep_template_items
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_template_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_template_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Service role manages prep_days"
    ON prep_days
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view prep_days"
    ON prep_days
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_days.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members manage prep_days"
    ON prep_days
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_days.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_days.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Service role manages prep_day_items"
    ON prep_day_items
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view prep_day_items"
    ON prep_day_items
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_day_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members manage prep_day_items"
    ON prep_day_items
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_day_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_day_items.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Service role manages prep_day_item_logs"
    ON prep_day_item_logs
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view prep_day_item_logs"
    ON prep_day_item_logs
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_day_item_logs.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Members manage prep_day_item_logs"
    ON prep_day_item_logs
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1
            FROM account_members am
            WHERE am.account_id = prep_day_item_logs.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    missing_count INT;
BEGIN
    SELECT COUNT(*) INTO missing_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'prep_templates',
        'prep_template_items',
        'prep_days',
        'prep_day_items',
        'prep_day_item_logs'
      );

    IF missing_count <> 5 THEN
        RAISE EXCEPTION 'Migration 036 failed: prep module tables missing';
    END IF;

    RAISE NOTICE '✅ Migration 036 complete: prep module tables and policies installed.';
END $$;

