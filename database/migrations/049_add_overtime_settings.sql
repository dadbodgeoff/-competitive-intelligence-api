-- =============================================================================
-- MIGRATION 049: Add Overtime Settings to Scheduling
-- =============================================================================
-- Description : Adds configurable overtime threshold and multiplier to 
--               scheduling settings for per-account customization.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: 034_scheduling_module.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ADD OVERTIME COLUMNS TO SCHEDULING SETTINGS
-- -----------------------------------------------------------------------------
ALTER TABLE scheduling_settings
    ADD COLUMN IF NOT EXISTS overtime_threshold_minutes INTEGER DEFAULT 2400,
    ADD COLUMN IF NOT EXISTS overtime_multiplier DECIMAL(3,2) DEFAULT 1.50,
    ADD COLUMN IF NOT EXISTS overtime_enabled BOOLEAN DEFAULT TRUE;

-- Add constraint for valid multiplier range (1.0 to 3.0)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_overtime_multiplier_range'
    ) THEN
        ALTER TABLE scheduling_settings
            ADD CONSTRAINT chk_overtime_multiplier_range 
            CHECK (overtime_multiplier >= 1.0 AND overtime_multiplier <= 3.0);
    END IF;
END $$;

-- Add constraint for valid threshold (minimum 1 hour = 60 minutes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_overtime_threshold_range'
    ) THEN
        ALTER TABLE scheduling_settings
            ADD CONSTRAINT chk_overtime_threshold_range 
            CHECK (overtime_threshold_minutes >= 60);
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- ADD OVERTIME TRACKING TO CLOCK ENTRIES
-- -----------------------------------------------------------------------------
ALTER TABLE scheduling_shift_clock_entries
    ADD COLUMN IF NOT EXISTS is_overtime BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS overtime_rate_cents BIGINT;

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    col_count INT;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'scheduling_settings'
      AND column_name IN ('overtime_threshold_minutes', 'overtime_multiplier', 'overtime_enabled');
    
    IF col_count < 3 THEN
        RAISE EXCEPTION 'Migration 049 failed: overtime columns not added to scheduling_settings';
    END IF;
    
    RAISE NOTICE '✅ Migration 049 complete: overtime settings added.';
END $$;
