-- Just show me the columns - super simple

SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'competitors'
ORDER BY ordinal_position;
