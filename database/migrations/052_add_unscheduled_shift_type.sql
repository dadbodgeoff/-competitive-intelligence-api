-- ============================================================================
-- MIGRATION 052: Add 'unscheduled' to schedule_shift_type enum
-- ============================================================================
-- Description : Adds 'unscheduled' value to the schedule_shift_type enum
--               to support ad-hoc clock-ins for team members who aren't
--               on the schedule but need to clock in.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: 034_scheduling_module.sql
-- ============================================================================

-- Add 'unscheduled' to the schedule_shift_type enum
-- PostgreSQL requires ALTER TYPE to add new enum values
ALTER TYPE schedule_shift_type ADD VALUE IF NOT EXISTS 'unscheduled';

-- Verification
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'unscheduled' 
        AND enumtypid = 'schedule_shift_type'::regtype
    ) THEN
        RAISE NOTICE '✅ schedule_shift_type enum now includes "unscheduled" value.';
    ELSE
        RAISE EXCEPTION 'Failed to add "unscheduled" to schedule_shift_type enum';
    END IF;
END $$;
