-- =============================================================================
-- MIGRATION 035: Scheduling Timekeeping & Labor Summaries
-- =============================================================================
-- Description : Clock-in/out tracking tied to scheduling shifts plus day/week
--               labor summaries for real-time cost reporting.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-19
-- Dependencies: 034_scheduling_module.sql, 033_account_data_extensions.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_clock_source') THEN
        CREATE TYPE shift_clock_source AS ENUM ('self', 'manager_adjust', 'system_auto');
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduling_shift_live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES scheduling_shifts(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_rate_cents BIGINT,
    started_rate_type schedule_wage_type,
    started_rate_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (shift_id, member_user_id)
);

CREATE TABLE IF NOT EXISTS scheduling_shift_clock_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES scheduling_shifts(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clock_in_at TIMESTAMPTZ NOT NULL,
    clock_out_at TIMESTAMPTZ,
    clock_in_source shift_clock_source NOT NULL DEFAULT 'self',
    clock_out_source shift_clock_source,
    clock_in_note TEXT,
    clock_out_note TEXT,
    effective_rate_cents BIGINT NOT NULL,
    effective_rate_type schedule_wage_type NOT NULL,
    effective_rate_currency TEXT NOT NULL DEFAULT 'USD',
    total_minutes INTEGER,
    break_minutes INTEGER DEFAULT 0 CHECK (break_minutes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (clock_out_at IS NULL OR clock_out_at >= clock_in_at)
);

CREATE TABLE IF NOT EXISTS scheduling_labor_day_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    week_id UUID NOT NULL REFERENCES scheduling_weeks(id) ON DELETE CASCADE,
    day_id UUID NOT NULL REFERENCES scheduling_days(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    scheduled_minutes INTEGER DEFAULT 0,
    scheduled_cost_cents BIGINT DEFAULT 0,
    actual_minutes INTEGER DEFAULT 0,
    actual_cost_cents BIGINT DEFAULT 0,
    variance_minutes INTEGER GENERATED ALWAYS AS (actual_minutes - scheduled_minutes) STORED,
    variance_cost_cents BIGINT GENERATED ALWAYS AS (actual_cost_cents - scheduled_cost_cents) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, day_id)
);

CREATE TABLE IF NOT EXISTS scheduling_labor_week_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    week_id UUID NOT NULL REFERENCES scheduling_weeks(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    scheduled_minutes INTEGER DEFAULT 0,
    scheduled_cost_cents BIGINT DEFAULT 0,
    actual_minutes INTEGER DEFAULT 0,
    actual_cost_cents BIGINT DEFAULT 0,
    variance_minutes INTEGER GENERATED ALWAYS AS (actual_minutes - scheduled_minutes) STORED,
    variance_cost_cents BIGINT GENERATED ALWAYS AS (actual_cost_cents - scheduled_cost_cents) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, week_id)
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_shift_live_sessions_member
    ON scheduling_shift_live_sessions(member_user_id);

CREATE INDEX IF NOT EXISTS idx_shift_clock_entries_shift
    ON scheduling_shift_clock_entries(shift_id);

CREATE INDEX IF NOT EXISTS idx_shift_clock_entries_member
    ON scheduling_shift_clock_entries(member_user_id);

CREATE INDEX IF NOT EXISTS idx_shift_clock_entries_account
    ON scheduling_shift_clock_entries(account_id);

CREATE INDEX IF NOT EXISTS idx_labor_day_summary_account_date
    ON scheduling_labor_day_summary(account_id, schedule_date);

CREATE INDEX IF NOT EXISTS idx_labor_week_summary_account
    ON scheduling_labor_week_summary(account_id, week_start_date);

-- -----------------------------------------------------------------------------
-- TRIGGERS (updated_at maintenance)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_shift_live_sessions_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_shift_live_sessions_updated_at ON scheduling_shift_live_sessions;';
    END IF;
END $$;
CREATE TRIGGER trg_shift_live_sessions_updated_at
    BEFORE UPDATE ON scheduling_shift_live_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_shift_clock_entries_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_shift_clock_entries_updated_at ON scheduling_shift_clock_entries;';
    END IF;
END $$;
CREATE TRIGGER trg_shift_clock_entries_updated_at
    BEFORE UPDATE ON scheduling_shift_clock_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_labor_day_summary_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_labor_day_summary_updated_at ON scheduling_labor_day_summary;';
    END IF;
END $$;
CREATE TRIGGER trg_labor_day_summary_updated_at
    BEFORE UPDATE ON scheduling_labor_day_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_labor_week_summary_updated_at') THEN
        EXECUTE 'DROP TRIGGER trg_labor_week_summary_updated_at ON scheduling_labor_week_summary;';
    END IF;
END $$;
CREATE TRIGGER trg_labor_week_summary_updated_at
    BEFORE UPDATE ON scheduling_labor_week_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- RLS POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE scheduling_shift_live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_shift_clock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_labor_day_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_labor_week_summary ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'scheduling_shift_live_sessions',
            'scheduling_shift_clock_entries',
            'scheduling_labor_day_summary',
            'scheduling_labor_week_summary'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role manages %1$s" ON %1$s;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Members view %1$s" ON %1$s;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Owners manage %1$s" ON %1$s;', tbl);
    END LOOP;
END $$;

CREATE POLICY "Service role manages scheduling_shift_live_sessions"
    ON scheduling_shift_live_sessions
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view scheduling_shift_live_sessions"
    ON scheduling_shift_live_sessions
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_shift_live_sessions.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Owners manage scheduling_shift_live_sessions"
    ON scheduling_shift_live_sessions
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_shift_live_sessions.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_shift_live_sessions.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Service role manages scheduling_shift_clock_entries"
    ON scheduling_shift_clock_entries
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view scheduling_shift_clock_entries"
    ON scheduling_shift_clock_entries
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR scheduling_shift_clock_entries.member_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_shift_clock_entries.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Owners manage scheduling_shift_clock_entries"
    ON scheduling_shift_clock_entries
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_shift_clock_entries.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_shift_clock_entries.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Service role manages scheduling_labor_day_summary"
    ON scheduling_labor_day_summary
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view scheduling_labor_day_summary"
    ON scheduling_labor_day_summary
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_labor_day_summary.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Owners manage scheduling_labor_day_summary"
    ON scheduling_labor_day_summary
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_labor_day_summary.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_labor_day_summary.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Service role manages scheduling_labor_week_summary"
    ON scheduling_labor_week_summary
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Members view scheduling_labor_week_summary"
    ON scheduling_labor_week_summary
    FOR SELECT
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_labor_week_summary.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
        )
    );

CREATE POLICY "Owners manage scheduling_labor_week_summary"
    ON scheduling_labor_week_summary
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_labor_week_summary.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR EXISTS (
            SELECT 1 FROM account_members am
            WHERE am.account_id = scheduling_labor_week_summary.account_id
              AND am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role IN ('owner', 'admin')
        )
    );

-- -----------------------------------------------------------------------------
-- UNIQUE INDEX TO PREVENT OVERLAPPING ACTIVE SESSIONS
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_session_unique_member
    ON scheduling_shift_live_sessions(account_id, member_user_id)
    WHERE TRUE;

-- -----------------------------------------------------------------------------
-- VERIFICATION NOTICE
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'scheduling_shift_live_sessions',
          'scheduling_shift_clock_entries',
          'scheduling_labor_day_summary',
          'scheduling_labor_week_summary'
      );

    IF table_count <> 4 THEN
        RAISE EXCEPTION 'Migration 035 failed: expected scheduling timekeeping tables missing.';
    END IF;

    RAISE NOTICE '✅ Migration 035 complete: clocking & labor summaries ready.';
END $$;

