-- Check what columns exist in the analyses table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'analyses'
ORDER BY ordinal_position;
