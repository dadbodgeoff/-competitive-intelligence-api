-- Reset menu comparison usage for test user
DELETE FROM usage_tracking 
WHERE user_id = '455a0c46-b694-44e8-ab1c-ee36342037cf' 
AND operation_type = 'menu_comparison';

-- Verify
SELECT * FROM usage_tracking 
WHERE user_id = '455a0c46-b694-44e8-ab1c-ee36342037cf' 
AND operation_type = 'menu_comparison';
