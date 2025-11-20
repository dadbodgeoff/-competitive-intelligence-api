-- ============================================================================
-- MIGRATION 043: Clock-In PIN Support
-- ============================================================================
-- Description : Adds secure storage columns for 4-digit timeclock PINs so team
--               members can authenticate on the kiosk without full login.
-- Author      : GPT-5.1 Codex
-- Date        : 2025-11-20
-- Dependencies: 035_timekeeping_module.sql
-- ============================================================================

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS clock_pin_hash TEXT,
    ADD COLUMN IF NOT EXISTS clock_pin_salt TEXT,
    ADD COLUMN IF NOT EXISTS clock_pin_lookup TEXT,
    ADD COLUMN IF NOT EXISTS clock_pin_updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS clock_pin_failed_attempts INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.users.clock_pin_hash IS 'PBKDF2 hash of the user''s 4-digit kiosk PIN';
COMMENT ON COLUMN public.users.clock_pin_salt IS 'Random salt for the kiosk PIN hash';
COMMENT ON COLUMN public.users.clock_pin_lookup IS 'Deterministic hash to locate users by PIN without exposing raw value';
COMMENT ON COLUMN public.users.clock_pin_updated_at IS 'Timestamp of the last successful PIN update';
COMMENT ON COLUMN public.users.clock_pin_failed_attempts IS 'Sequential failed kiosk PIN attempts for lockout/alerts';

CREATE INDEX IF NOT EXISTS idx_users_clock_pin_lookup
    ON public.users(clock_pin_lookup)
    WHERE clock_pin_lookup IS NOT NULL;

DO $$
DECLARE
    col_count INT;
BEGIN
    SELECT COUNT(*)
    INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name IN (
          'clock_pin_hash',
          'clock_pin_salt',
          'clock_pin_lookup',
          'clock_pin_updated_at',
          'clock_pin_failed_attempts'
      );

    IF col_count <> 5 THEN
        RAISE EXCEPTION 'Migration 043 failed: expected PIN columns missing on public.users';
    END IF;

    RAISE NOTICE '✅ Migration 043 complete: clock PIN columns added.';
END $$;


