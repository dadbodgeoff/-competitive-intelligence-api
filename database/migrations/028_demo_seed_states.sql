-- ============================================================================
-- MIGRATION 028: Demo Seed State Tracking
-- Purpose: Track sample data seeding lifecycle per user account
-- ============================================================================

-- Create helper table to record seeding status and inserted entity metadata
CREATE TABLE IF NOT EXISTS demo_seed_states (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'seeded', 'cleared', 'error')),
    seeded_at TIMESTAMP,
    cleared_at TIMESTAMP,
    last_error TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE demo_seed_states IS 'Tracks demo dataset seeding lifecycle per user account';
COMMENT ON COLUMN demo_seed_states.metadata IS 'JSON payload describing inserted demo entity identifiers for cleanup';

-- Reuse global updated_at trigger helper
CREATE TRIGGER update_demo_seed_states_updated_at
    BEFORE UPDATE ON demo_seed_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification block
DO $$
BEGIN
    -- Ensure table exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'demo_seed_states'
    ) THEN
        RAISE EXCEPTION '❌ demo_seed_states table was not created';
    END IF;

    -- Ensure primary key is present
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'demo_seed_states_pkey'
    ) THEN
        RAISE EXCEPTION '❌ demo_seed_states primary key missing';
    END IF;

    RAISE NOTICE '✅ Migration 028 completed successfully - demo_seed_states ready';
END $$;

