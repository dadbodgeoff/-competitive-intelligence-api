-- ================================================================================
-- MIGRATION 037: Scheduler Shift Assignments & Labor Tracking
-- ================================================================================
-- Description : Adds support for assigning members to shifts, storing wage overrides,
--               and tracking scheduled labor hours/cost for weekly scheduling.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-20
-- Dependencies: 034_scheduling_module.sql
-- ================================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- Column additions
-- ------------------------------------------------------------------------------
ALTER TABLE scheduling_shifts
    ADD COLUMN IF NOT EXISTS assigned_member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS wage_override_cents BIGINT,
    ADD COLUMN IF NOT EXISTS wage_override_currency TEXT DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS shift_notes TEXT;

ALTER TABLE scheduling_days
    ADD COLUMN IF NOT EXISTS scheduled_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS scheduled_labor_cents BIGINT DEFAULT 0;

ALTER TABLE scheduling_weeks
    ADD COLUMN IF NOT EXISTS scheduled_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS scheduled_labor_cents BIGINT DEFAULT 0;

-- ------------------------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sched_shifts_member
    ON scheduling_shifts (account_id, assigned_member_id);

-- ------------------------------------------------------------------------------
-- Trigger helpers
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_scheduler_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_day_id UUID;
    v_week_id UUID;
    v_day_minutes INTEGER;
    v_day_cost BIGINT;
BEGIN
    v_day_id := COALESCE(NEW.day_id, OLD.day_id);
    IF v_day_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT week_id INTO v_week_id FROM scheduling_days WHERE id = v_day_id;

    UPDATE scheduling_days
    SET
        scheduled_minutes = COALESCE((
            SELECT SUM(
                CASE
                    WHEN end_time > start_time THEN
                        GREATEST(EXTRACT(EPOCH FROM (end_time - start_time)) / 60 - COALESCE(break_minutes, 0), 0)
                    ELSE 0
                END
            )
            FROM scheduling_shifts
            WHERE day_id = v_day_id
        ), 0),
        scheduled_labor_cents = COALESCE((
            SELECT SUM(
                CASE
                    WHEN end_time > start_time THEN
                        (
                            GREATEST(EXTRACT(EPOCH FROM (end_time - start_time)) / 60 - COALESCE(break_minutes, 0), 0)
                            / 60
                        ) *
                        (
                            CASE
                                WHEN wage_override_cents IS NOT NULL THEN wage_override_cents
                                ELSE (
                                    SELECT rate_cents
                                    FROM account_member_compensation
                                    WHERE account_id = scheduling_shifts.account_id
                                      AND user_id = scheduling_shifts.assigned_member_id
                                      AND (ends_at IS NULL OR ends_at > NOW())
                                    ORDER BY effective_at DESC
                                    LIMIT 1
                                )
                            END
                        )
                END
            )
            FROM scheduling_shifts
            WHERE day_id = v_day_id
        ), 0)
    WHERE id = v_day_id;

    SELECT scheduled_minutes, scheduled_labor_cents
    INTO v_day_minutes, v_day_cost
    FROM scheduling_days
    WHERE id = v_day_id;

    UPDATE scheduling_weeks
    SET
        scheduled_minutes = COALESCE((
            SELECT SUM(scheduled_minutes)
            FROM scheduling_days
            WHERE week_id = v_week_id
        ), 0),
        scheduled_labor_cents = COALESCE((
            SELECT SUM(scheduled_labor_cents)
            FROM scheduling_days
            WHERE week_id = v_week_id
        ), 0)
    WHERE id = v_week_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sched_shifts_summary ON scheduling_shifts;
CREATE TRIGGER trg_sched_shifts_summary
AFTER INSERT OR UPDATE OR DELETE ON scheduling_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_scheduler_summary();

-- ------------------------------------------------------------------------------
-- Verification
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'scheduling_shifts'
          AND column_name = 'assigned_member_id'
    ) INTO v_exists;

    IF NOT v_exists THEN
        RAISE EXCEPTION 'Migration 037 failed: scheduling_shifts.assigned_member_id missing';
    END IF;
END $$;

