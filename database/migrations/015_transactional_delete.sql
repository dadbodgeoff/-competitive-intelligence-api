-- ================================================================================
-- MIGRATION 015: TRANSACTIONAL DELETE FUNCTIONS
-- Adds database functions for safe transactional operations
-- ================================================================================

-- Function: Delete invoice with cascade in transaction
CREATE OR REPLACE FUNCTION delete_invoice_with_cascade(
    target_invoice_id UUID,
    target_user_id UUID,
    item_descriptions TEXT[]
)
RETURNS TABLE (
    success BOOLEAN,
    invoice_items_deleted INT,
    inventory_items_deleted INT,
    error_message TEXT
) AS $$
DECLARE
    invoice_items_count INT := 0;
    inventory_items_count INT := 0;
    invoice_exists BOOLEAN := FALSE;
BEGIN
    -- Check if invoice exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM invoices 
        WHERE id = target_invoice_id AND user_id = target_user_id
    ) INTO invoice_exists;
    
    IF NOT invoice_exists THEN
        RETURN QUERY SELECT FALSE, 0, 0, 'Invoice not found or access denied'::TEXT;
        RETURN;
    END IF;
    
    -- Start transaction (function is already in transaction context)
    
    -- Count items before deletion
    SELECT COUNT(*) INTO invoice_items_count
    FROM invoice_items 
    WHERE invoice_id = target_invoice_id;
    
    -- Delete the invoice (invoice_items will cascade via FK)
    DELETE FROM invoices 
    WHERE id = target_invoice_id AND user_id = target_user_id;
    
    -- CASCADE: Delete inventory_items that match descriptions (user-scoped)
    IF array_length(item_descriptions, 1) > 0 THEN
        DELETE FROM inventory_items 
        WHERE user_id = target_user_id 
        AND name = ANY(item_descriptions);
        
        GET DIAGNOSTICS inventory_items_count = ROW_COUNT;
    END IF;
    
    -- Return success
    RETURN QUERY SELECT TRUE, invoice_items_count, inventory_items_count, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Transaction will be rolled back automatically
        RETURN QUERY SELECT FALSE, 0, 0, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function: Check for duplicate invoices
CREATE OR REPLACE FUNCTION check_duplicate_invoice(
    target_user_id UUID,
    invoice_number TEXT,
    vendor_name TEXT,
    invoice_date DATE,
    total_amount DECIMAL(10,2),
    tolerance DECIMAL(10,2) DEFAULT 0.01
)
RETURNS TABLE (
    is_duplicate BOOLEAN,
    duplicate_type TEXT,
    existing_invoice_id UUID,
    existing_total DECIMAL(10,2),
    total_difference DECIMAL(10,2)
) AS $$
DECLARE
    existing_record RECORD;
BEGIN
    -- Check for exact match first
    SELECT id, total INTO existing_record
    FROM invoices
    WHERE user_id = target_user_id
    AND invoice_number = check_duplicate_invoice.invoice_number
    AND vendor_name = check_duplicate_invoice.vendor_name
    AND invoice_date = check_duplicate_invoice.invoice_date
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            TRUE, 
            'exact'::TEXT, 
            existing_record.id, 
            existing_record.total,
            ABS(existing_record.total - total_amount);
        RETURN;
    END IF;
    
    -- Check for near-duplicate (same vendor, similar date, similar total)
    SELECT id, total INTO existing_record
    FROM invoices
    WHERE user_id = target_user_id
    AND vendor_name = check_duplicate_invoice.vendor_name
    AND invoice_date BETWEEN (check_duplicate_invoice.invoice_date - INTERVAL '1 day') 
                         AND (check_duplicate_invoice.invoice_date + INTERVAL '1 day')
    AND ABS(total - total_amount) <= tolerance
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            TRUE, 
            'near'::TEXT, 
            existing_record.id, 
            existing_record.total,
            ABS(existing_record.total - total_amount);
        RETURN;
    END IF;
    
    -- No duplicate found
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::UUID, NULL::DECIMAL, NULL::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user usage statistics for rate limiting
CREATE OR REPLACE FUNCTION get_user_usage_stats(
    target_user_id UUID,
    operation_type TEXT,
    time_window_hours INT DEFAULT 24
)
RETURNS TABLE (
    operation_count INT,
    first_operation_time TIMESTAMP,
    last_operation_time TIMESTAMP,
    within_limit BOOLEAN
) AS $$
DECLARE
    count_result INT := 0;
    first_time TIMESTAMP;
    last_time TIMESTAMP;
    time_cutoff TIMESTAMP;
BEGIN
    time_cutoff := NOW() - (time_window_hours || ' hours')::INTERVAL;
    
    -- Count operations based on type
    IF operation_type = 'invoice_parse' THEN
        SELECT COUNT(*), MIN(created_at), MAX(created_at)
        INTO count_result, first_time, last_time
        FROM invoices
        WHERE user_id = target_user_id
        AND created_at >= time_cutoff;
        
    ELSIF operation_type = 'analysis' THEN
        SELECT COUNT(*), MIN(created_at), MAX(created_at)
        INTO count_result, first_time, last_time
        FROM analyses
        WHERE user_id = target_user_id
        AND created_at >= time_cutoff;
        
    END IF;
    
    -- Return results (limit checking done in application layer)
    RETURN QUERY SELECT 
        count_result,
        first_time,
        last_time,
        TRUE; -- Application will determine if within limit
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_invoice_with_cascade TO authenticated;
GRANT EXECUTE ON FUNCTION check_duplicate_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_usage_stats TO authenticated;

-- Add comments
COMMENT ON FUNCTION delete_invoice_with_cascade IS 
    'Safely delete invoice and cascade to related inventory items in a transaction';

COMMENT ON FUNCTION check_duplicate_invoice IS 
    'Check for duplicate invoices before processing';

COMMENT ON FUNCTION get_user_usage_stats IS 
    'Get user operation statistics for rate limiting';