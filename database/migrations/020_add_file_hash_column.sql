-- Migration: Add file_hash column for duplicate detection
-- Purpose: Enable fast duplicate detection using file content hash
-- Date: 2025-11-02

BEGIN;

-- Add file_hash column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64);

-- Add index for fast duplicate lookups
CREATE INDEX IF NOT EXISTS idx_invoices_file_hash 
ON invoices(user_id, file_hash) 
WHERE file_hash IS NOT NULL;

-- Add comment
COMMENT ON COLUMN invoices.file_hash IS 'SHA256 hash of uploaded file for duplicate detection';

COMMIT;

-- Verification
DO $$
BEGIN
    -- Check column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'file_hash'
    ) THEN
        RAISE NOTICE '✅ file_hash column added successfully';
    ELSE
        RAISE EXCEPTION '❌ file_hash column not found';
    END IF;
    
    -- Check index exists
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'invoices' 
        AND indexname = 'idx_invoices_file_hash'
    ) THEN
        RAISE NOTICE '✅ file_hash index created successfully';
    ELSE
        RAISE EXCEPTION '❌ file_hash index not found';
    END IF;
END $$;
