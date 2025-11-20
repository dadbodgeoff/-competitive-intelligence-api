-- ============================================================================
-- MIGRATION 034: Scheduling Module Foundations
-- ============================================================================
-- Description : Adds scheduling preferences, weekly periods, daily plans,
--               shifts, and assignments so teams can plan labor and record
--               sales forecasts. Extends the modules catalogue with the new
--               scheduling feature and backfills access for existing accounts.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: 031_multi_account_module_access.sql, 032_account_backfill.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_week_status') THEN
        CREATE TYPE schedule_week_status AS ENUM ('draft', 'published', 'archived');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_shift_type') THEN
        CREATE TYPE schedule_shift_type AS ENUM ('front_of_house', 'back_of_house', 'management', 'other');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_wage_type') THEN
        CREATE TYPE schedule_wage_type AS ENUM ('hourly', 'salary', 'flat');
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS scheduling_settings (
    account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    week_start_day SMALLINT NOT NULL DEFAULT 1 CHECK (week_start_day BETWEEN 0 AND 6),
    timezone TEXT DEFAULT 'UTC',
    auto_publish BOOLEAN NOT NULL DEFAULT FALSE,
    default_shift_length_minutes INTEGER DEFAULT 480,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE scheduling_settings IS 'Per-account scheduling preferences and defaults.';
COMMENT ON COLUMN scheduling_settings.week_start_day IS '0=Monday .. 6=Sunday';

CREATE TABLE IF NOT EXISTS scheduling_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    status schedule_week_status NOT NULL DEFAULT 'draft',
    expected_sales_total NUMERIC(12,2),
    expected_guest_count INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, week_start_date)
);

COMMENT ON TABLE scheduling_weeks IS 'Represents a scheduling period aligned to the account''s custom week.';

CREATE TABLE IF NOT EXISTS scheduling_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    week_id UUID NOT NULL REFERENCES scheduling_weeks(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    expected_sales NUMERIC(12,2),
    expected_guest_count INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (week_id, schedule_date)
);

COMMENT ON TABLE scheduling_days IS 'Daily forecasting and notes within a scheduling week.';

CREATE TABLE IF NOT EXISTS scheduling_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    week_id UUID NOT NULL REFERENCES scheduling_weeks(id) ON DELETE CASCADE,
    day_id UUID NOT NULL REFERENCES scheduling_days(id) ON DELETE CASCADE,
    shift_type schedule_shift_type NOT NULL DEFAULT 'other',
    role_label TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0 CHECK (break_minutes >= 0),
    wage_type schedule_wage_type DEFAULT 'hourly',
    wage_rate NUMERIC(10,2),
    wage_currency TEXT DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

COMMENT ON TABLE scheduling_shifts IS 'Shift definitions for a particular schedule day.';

CREATE TABLE IF NOT EXISTS scheduling_shift_assignments (
    shift_id UUID NOT NULL REFERENCES scheduling_shifts(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wage_override NUMERIC(10,2),
    wage_type_override schedule_wage_type,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (shift_id, member_user_id)
);

COMMENT ON TABLE scheduling_shift_assignments IS 'Maps account members to scheduled shifts.';

CREATE TABLE IF NOT EXISTS scheduling_forecast_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    week_id UUID REFERENCES scheduling_weeks(id) ON DELETE SET NULL,
    forecast_generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE scheduling_forecast_history IS 'Stores historical forecast payloads for auditing/improvement.';

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_sched_settings_account ON scheduling_settings(account_id);
CREATE INDEX IF NOT EXISTS idx_sched_weeks_account_date ON scheduling_weeks(account_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_sched_days_account_date ON scheduling_days(account_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_sched_shifts_day ON scheduling_shifts(day_id);
CREATE INDEX IF NOT EXISTS idx_sched_shift_assign_member ON scheduling_shift_assignments(member_user_id);

-- ----------------------------------------------------------------------------
-- MODULE CATALOG & ACCESS
-- ----------------------------------------------------------------------------

INSERT INTO modules (slug, name, description)
VALUES ('scheduling', 'Scheduling & Labor', 'Plan shifts, assign staff, and forecast weekly sales')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO account_module_access (account_id, module_slug, can_access, granted_at)
SELECT a.id, 'scheduling', TRUE, NOW()
FROM accounts a
ON CONFLICT (account_id, module_slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE scheduling_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_forecast_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so migration is re-runnable
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'scheduling_settings',
            'scheduling_weeks',
            'scheduling_days',
            'scheduling_shifts',
            'scheduling_shift_assignments',
            'scheduling_forecast_history'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role manages %1$s" ON %1$s;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Members view %1$s" ON %1$s;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Owners manage %1$s" ON %1$s;', tbl);
    END LOOP;
END $$;

-- Shared policy templates
CREATE POLICY "Service role manages scheduling_settings" ON scheduling_settings
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view scheduling_settings" ON scheduling_settings
    FOR SELECT
    USING (auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_settings.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        ));

CREATE POLICY "Owners manage scheduling_settings" ON scheduling_settings
    FOR ALL
    USING (auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_settings.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        ))
    WITH CHECK (auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_settings.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'owner'
        ));

-- Reuse same policy style for other tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'scheduling_weeks',
            'scheduling_days',
            'scheduling_shifts',
            'scheduling_shift_assignments',
            'scheduling_forecast_history'
        ])
    LOOP
        EXECUTE format($policy$
            CREATE POLICY "Service role manages %1$s" ON %1$s
                USING (auth.role() = 'service_role')
                WITH CHECK (auth.role() = 'service_role');
        $policy$, tbl);

        EXECUTE format($policy$
            CREATE POLICY "Members view %1$s" ON %1$s
                FOR SELECT
                USING (
                    auth.role() = 'service_role'
                    OR EXISTS (
                        SELECT 1 FROM account_members am
                        WHERE am.account_id = %1$s.account_id
                          AND am.user_id = auth.uid()
                          AND am.status = 'active'
                    )
                );
        $policy$, tbl);

        EXECUTE format($policy$
            CREATE POLICY "Owners manage %1$s" ON %1$s
                FOR ALL
                USING (
                    auth.role() = 'service_role'
                    OR EXISTS (
                        SELECT 1 FROM account_members am
                        WHERE am.account_id = %1$s.account_id
                          AND am.user_id = auth.uid()
                          AND am.status = 'active'
                          AND am.role = 'owner'
                    )
                )
                WITH CHECK (
                    auth.role() = 'service_role'
                    OR EXISTS (
                        SELECT 1 FROM account_members am
                        WHERE am.account_id = %1$s.account_id
                          AND am.user_id = auth.uid()
                          AND am.status = 'active'
                          AND am.role = 'owner'
                    )
                );
        $policy$, tbl);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ----------------------------------------------------------------------------

CREATE TRIGGER update_scheduling_settings_updated_at
    BEFORE UPDATE ON scheduling_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_weeks_updated_at
    BEFORE UPDATE ON scheduling_weeks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_days_updated_at
    BEFORE UPDATE ON scheduling_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_shifts_updated_at
    BEFORE UPDATE ON scheduling_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_shift_assignments_updated_at
    BEFORE UPDATE ON scheduling_shift_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- scheduling_forecast_history is append-only; no trigger required.

-- ----------------------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    missing_count INT;
BEGIN
    SELECT COUNT(*) INTO missing_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'scheduling_settings',
        'scheduling_weeks',
        'scheduling_days',
        'scheduling_shifts',
        'scheduling_shift_assignments',
        'scheduling_forecast_history'
      );

    IF missing_count <> 6 THEN
        RAISE EXCEPTION 'Scheduling tables missing – installation incomplete';
    END IF;

    RAISE NOTICE '✅ Scheduling module schema installed successfully.';
END $$;


