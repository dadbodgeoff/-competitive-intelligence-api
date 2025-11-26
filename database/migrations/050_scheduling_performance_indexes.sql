-- =============================================================================
-- MIGRATION 050: Scheduling Performance Indexes
-- =============================================================================
-- Description : Adds additional indexes to improve scheduling module query
--               performance. These are safe additions that don't affect any
--               existing logic - they only make queries faster.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: 034_scheduling_module.sql, 035_timekeeping_module.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR SCHEDULING_WEEKS
-- -----------------------------------------------------------------------------
-- Index for fetching weeks by status (draft/published/archived)
CREATE INDEX IF NOT EXISTS idx_sched_weeks_account_status 
    ON scheduling_weeks(account_id, status);

-- Index for ordering weeks by date (most recent first)
CREATE INDEX IF NOT EXISTS idx_sched_weeks_account_date_desc 
    ON scheduling_weeks(account_id, week_start_date DESC);

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR SCHEDULING_DAYS
-- -----------------------------------------------------------------------------
-- Composite index for fetching days by week (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_sched_days_week_date 
    ON scheduling_days(week_id, schedule_date);

-- Index for account + week combination
CREATE INDEX IF NOT EXISTS idx_sched_days_account_week 
    ON scheduling_days(account_id, week_id);

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR SCHEDULING_SHIFTS
-- -----------------------------------------------------------------------------
-- Composite index for fetching shifts by week (grid view)
CREATE INDEX IF NOT EXISTS idx_sched_shifts_week 
    ON scheduling_shifts(week_id);

-- Index for account + week combination
CREATE INDEX IF NOT EXISTS idx_sched_shifts_account_week 
    ON scheduling_shifts(account_id, week_id);

-- Index for day + shift type (filtering by FOH/BOH)
CREATE INDEX IF NOT EXISTS idx_sched_shifts_day_type 
    ON scheduling_shifts(day_id, shift_type);

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR SHIFT ASSIGNMENTS
-- -----------------------------------------------------------------------------
-- Index for fetching all assignments for a week's shifts
CREATE INDEX IF NOT EXISTS idx_sched_assign_account 
    ON scheduling_shift_assignments(account_id);

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR LIVE SESSIONS (Clock-in tracking)
-- -----------------------------------------------------------------------------
-- Index for finding active sessions by shift
CREATE INDEX IF NOT EXISTS idx_live_sessions_shift 
    ON scheduling_shift_live_sessions(shift_id);

-- Index for account-level live session queries
CREATE INDEX IF NOT EXISTS idx_live_sessions_account 
    ON scheduling_shift_live_sessions(account_id);

-- Index for heartbeat monitoring (find stale sessions)
CREATE INDEX IF NOT EXISTS idx_live_sessions_heartbeat 
    ON scheduling_shift_live_sessions(last_heartbeat_at);

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR CLOCK ENTRIES
-- -----------------------------------------------------------------------------
-- Index for fetching clock entries by date range
CREATE INDEX IF NOT EXISTS idx_clock_entries_account_date 
    ON scheduling_shift_clock_entries(account_id, clock_in_at);

-- Index for finding open clock entries (no clock_out)
CREATE INDEX IF NOT EXISTS idx_clock_entries_open 
    ON scheduling_shift_clock_entries(account_id, member_user_id) 
    WHERE clock_out_at IS NULL;

-- -----------------------------------------------------------------------------
-- ADDITIONAL INDEXES FOR LABOR SUMMARIES
-- -----------------------------------------------------------------------------
-- Index for week summary lookups
CREATE INDEX IF NOT EXISTS idx_labor_week_summary_week 
    ON scheduling_labor_week_summary(week_id);

-- Index for day summary by week
CREATE INDEX IF NOT EXISTS idx_labor_day_summary_week 
    ON scheduling_labor_day_summary(week_id);

-- -----------------------------------------------------------------------------
-- ANALYZE TABLES TO UPDATE STATISTICS
-- -----------------------------------------------------------------------------
-- This helps the query planner make better decisions
ANALYZE scheduling_weeks;
ANALYZE scheduling_days;
ANALYZE scheduling_shifts;
ANALYZE scheduling_shift_assignments;
ANALYZE scheduling_shift_live_sessions;
ANALYZE scheduling_shift_clock_entries;
ANALYZE scheduling_labor_day_summary;
ANALYZE scheduling_labor_week_summary;

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 050 complete: Scheduling performance indexes added.';
    RAISE NOTICE '   These indexes will improve query performance for:';
    RAISE NOTICE '   - Week list loading';
    RAISE NOTICE '   - Grid data fetching';
    RAISE NOTICE '   - Live session tracking';
    RAISE NOTICE '   - Labor summary calculations';
END $$;
