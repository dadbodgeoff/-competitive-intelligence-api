-- =============================================================================
-- MIGRATION 048: Add Location Code for Time Clock
-- =============================================================================
-- Description : Adds a 4-digit location code to accounts for scoped PIN clock-in.
--               This prevents PIN collisions across different restaurants.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: None
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ADD LOCATION CODE COLUMN
-- -----------------------------------------------------------------------------
ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS clock_location_code VARCHAR(4);

-- -----------------------------------------------------------------------------
-- CREATE UNIQUE INDEX (location codes must be unique across all accounts)
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_clock_location_code
    ON accounts(clock_location_code)
    WHERE clock_location_code IS NOT NULL;

-- -----------------------------------------------------------------------------
-- FUNCTION TO GENERATE UNIQUE 4-DIGIT CODE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_unique_location_code()
RETURNS VARCHAR(4) AS $$
DECLARE
    new_code VARCHAR(4);
    code_exists BOOLEAN;
    attempts INT := 0;
    max_attempts INT := 100;
BEGIN
    LOOP
        -- Generate random 4-digit code (1000-9999 to avoid leading zeros)
        new_code := LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0');
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM accounts WHERE clock_location_code = new_code
        ) INTO code_exists;
        
        -- Return if unique
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique location code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- TRIGGER TO AUTO-GENERATE CODE ON INSERT (if not provided)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_default_location_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clock_location_code IS NULL THEN
        NEW.clock_location_code := generate_unique_location_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_accounts_location_code ON accounts;
CREATE TRIGGER trg_accounts_location_code
    BEFORE INSERT ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_default_location_code();

-- -----------------------------------------------------------------------------
-- BACKFILL EXISTING ACCOUNTS WITH LOCATION CODES
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    acc RECORD;
BEGIN
    FOR acc IN SELECT id FROM accounts WHERE clock_location_code IS NULL
    LOOP
        UPDATE accounts 
        SET clock_location_code = generate_unique_location_code()
        WHERE id = acc.id;
    END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    col_exists BOOLEAN;
    null_count INT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'accounts'
          AND column_name = 'clock_location_code'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        RAISE EXCEPTION 'Migration 048 failed: clock_location_code column not added';
    END IF;
    
    -- Check all accounts have codes
    SELECT COUNT(*) INTO null_count
    FROM accounts WHERE clock_location_code IS NULL;
    
    IF null_count > 0 THEN
        RAISE WARNING 'Migration 048: % accounts still missing location codes', null_count;
    END IF;
    
    RAISE NOTICE '✅ Migration 048 complete: location codes added to accounts.';
END $$;
