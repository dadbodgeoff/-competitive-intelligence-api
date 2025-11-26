-- =============================================================================
-- MIGRATION 047: Fix Timekeeping Clock Source Enum and Column
-- =============================================================================
-- Description : Adds missing clock source values to enum and adds clock_in_source
--               column to live_sessions table for tracking clock-in origin.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: 035_timekeeping_module.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ADD MISSING ENUM VALUES
-- -----------------------------------------------------------------------------
-- Add 'pin_kiosk' and 'dashboard' to the shift_clock_source enum
DO $$
BEGIN
    -- Check if 'pin_kiosk' exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pin_kiosk' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'shift_clock_source')
    ) THEN
        ALTER TYPE shift_clock_source ADD VALUE 'pin_kiosk';
    END IF;
END $$;

DO $$
BEGIN
    -- Check if 'dashboard' exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'dashboard' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'shift_clock_source')
    ) THEN
        ALTER TYPE shift_clock_source ADD VALUE 'dashboard';
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- ADD CLOCK_IN_SOURCE COLUMN TO LIVE SESSIONS
-- -----------------------------------------------------------------------------
ALTER TABLE scheduling_shift_live_sessions
    ADD COLUMN IF NOT EXISTS clock_in_source shift_clock_source DEFAULT 'self';

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    col_exists BOOLEAN;
    enum_count INT;
BEGIN
    -- Verify column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scheduling_shift_live_sessions'
          AND column_name = 'clock_in_source'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        RAISE EXCEPTION 'Migration 047 failed: clock_in_source column not added';
    END IF;
    
    -- Verify enum values
    SELECT COUNT(*) INTO enum_count
    FROM pg_enum
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'shift_clock_source')
      AND enumlabel IN ('self', 'manager_adjust', 'system_auto', 'pin_kiosk', 'dashboard');
    
    IF enum_count < 5 THEN
        RAISE WARNING 'Migration 047: Some enum values may not have been added (found %)', enum_count;
    END IF;
    
    RAISE NOTICE '✅ Migration 047 complete: clock source enum and column updated.';
END $$;
