-- ================================================================================
-- MIGRATION 011: ITEM PRICE TRACKING METRICS
-- Adds last paid price, 7-day average, and 28-day average tracking per item
-- ================================================================================

-- Function: Get current price metrics for an item
-- Returns last paid price, 7-day avg, 28-day avg for each item
CREATE OR REPLACE FUNCTION get_item_price_metrics(
    target_user_id UUID,
    target_item_id UUID DEFAULT NULL
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    last_paid_price DECIMAL(10,2),
    last_paid_date DATE,
    last_paid_vendor_id UUID,
    last_paid_vendor_name TEXT,
    avg_price_7day DECIMAL(10,2),
    avg_price_28day DECIMAL(10,2),
    price_change_7day_percent DECIMAL(6,2),
    price_change_28day_percent DECIMAL(6,2),
    total_purchases_7day INT,
    total_purchases_28day INT
) AS $$
BEGIN
    RETURN QUERY
    WITH item_list AS (
        -- Get all items or specific item
        SELECT 
            ii.id,
            ii.name
        FROM inventory_items ii
        WHERE ii.user_id = target_user_id
            AND (target_item_id IS NULL OR ii.id = target_item_id)
    ),
    last_purchase AS (
        -- Get most recent purchase for each item
        SELECT DISTINCT ON (ph.inventory_item_id)
            ph.inventory_item_id,
            ph.unit_price as last_price,
            ph.invoice_date as last_date,
            ph.vendor_id,
            v.name as vendor_name
        FROM price_history ph
        JOIN vendors v ON ph.vendor_id = v.id
        WHERE ph.user_id = target_user_id
        ORDER BY ph.inventory_item_id, ph.invoice_date DESC
    ),
    avg_7day AS (
        -- Calculate 7-day average
        SELECT 
            ph.inventory_item_id,
            AVG(ph.unit_price) as avg_price,
            COUNT(*) as purchase_count
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY ph.inventory_item_id
    ),
    avg_28day AS (
        -- Calculate 28-day average
        SELECT 
            ph.inventory_item_id,
            AVG(ph.unit_price) as avg_price,
            COUNT(*) as purchase_count
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - INTERVAL '28 days'
        GROUP BY ph.inventory_item_id
    )
    SELECT 
        il.id,
        il.name,
        lp.last_price,
        lp.last_date,
        lp.vendor_id,
        lp.vendor_name,
        a7.avg_price,
        a28.avg_price,
        -- Calculate % change from 7-day avg to last price
        CASE 
            WHEN a7.avg_price IS NOT NULL AND a7.avg_price > 0 
            THEN ((lp.last_price - a7.avg_price) / a7.avg_price * 100)
            ELSE NULL
        END as price_change_7day_percent,
        -- Calculate % change from 28-day avg to last price
        CASE 
            WHEN a28.avg_price IS NOT NULL AND a28.avg_price > 0 
            THEN ((lp.last_price - a28.avg_price) / a28.avg_price * 100)
            ELSE NULL
        END as price_change_28day_percent,
        COALESCE(a7.purchase_count, 0)::INT,
        COALESCE(a28.purchase_count, 0)::INT
    FROM item_list il
    LEFT JOIN last_purchase lp ON il.id = lp.inventory_item_id
    LEFT JOIN avg_7day a7 ON il.id = a7.inventory_item_id
    LEFT JOIN avg_28day a28 ON il.id = a28.inventory_item_id
    WHERE lp.last_price IS NOT NULL  -- Only return items with price history
    ORDER BY il.name;
END;
$$ LANGUAGE plpgsql;

-- Function: Get price metrics for all items (summary view)
CREATE OR REPLACE FUNCTION get_all_items_price_summary(
    target_user_id UUID
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    last_paid_price DECIMAL(10,2),
    last_paid_date DATE,
    last_paid_vendor TEXT,
    avg_price_7day DECIMAL(10,2),
    avg_price_28day DECIMAL(10,2),
    price_trend TEXT,
    has_recent_data BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.item_id,
        m.item_name,
        m.last_paid_price,
        m.last_paid_date,
        m.last_paid_vendor_name,
        m.avg_price_7day,
        m.avg_price_28day,
        CASE 
            WHEN m.price_change_7day_percent > 5 THEN 'increasing'
            WHEN m.price_change_7day_percent < -5 THEN 'decreasing'
            ELSE 'stable'
        END as price_trend,
        (m.last_paid_date >= CURRENT_DATE - INTERVAL '7 days') as has_recent_data
    FROM get_item_price_metrics(target_user_id, NULL) m
    ORDER BY m.last_paid_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get items with significant price changes
CREATE OR REPLACE FUNCTION get_items_with_price_changes(
    target_user_id UUID,
    min_change_percent DECIMAL DEFAULT 10.0,
    days_to_compare INT DEFAULT 7
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    last_paid_price DECIMAL(10,2),
    comparison_avg_price DECIMAL(10,2),
    price_change_percent DECIMAL(6,2),
    change_type TEXT,
    last_vendor TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.item_id,
        m.item_name,
        m.last_paid_price,
        CASE 
            WHEN days_to_compare = 7 THEN m.avg_price_7day
            ELSE m.avg_price_28day
        END as comparison_avg,
        CASE 
            WHEN days_to_compare = 7 THEN m.price_change_7day_percent
            ELSE m.price_change_28day_percent
        END as change_percent,
        CASE 
            WHEN days_to_compare = 7 AND m.price_change_7day_percent > 0 THEN 'increase'
            WHEN days_to_compare = 28 AND m.price_change_28day_percent > 0 THEN 'increase'
            ELSE 'decrease'
        END as change_type,
        m.last_paid_vendor_name
    FROM get_item_price_metrics(target_user_id, NULL) m
    WHERE (
        (days_to_compare = 7 AND ABS(m.price_change_7day_percent) >= min_change_percent)
        OR
        (days_to_compare = 28 AND ABS(m.price_change_28day_percent) >= min_change_percent)
    )
    ORDER BY 
        CASE 
            WHEN days_to_compare = 7 THEN ABS(m.price_change_7day_percent)
            ELSE ABS(m.price_change_28day_percent)
        END DESC;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for faster access (optional, can be refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS item_price_metrics_cache AS
SELECT 
    user_id,
    item_id,
    item_name,
    last_paid_price,
    last_paid_date,
    last_paid_vendor_id,
    last_paid_vendor_name,
    avg_price_7day,
    avg_price_28day,
    price_change_7day_percent,
    price_change_28day_percent,
    total_purchases_7day,
    total_purchases_28day,
    NOW() as cached_at
FROM (
    SELECT DISTINCT user_id FROM inventory_items
) users
CROSS JOIN LATERAL get_item_price_metrics(users.user_id, NULL);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_price_metrics_cache_user_item 
    ON item_price_metrics_cache(user_id, item_id);

CREATE INDEX IF NOT EXISTS idx_price_metrics_cache_user_date 
    ON item_price_metrics_cache(user_id, last_paid_date DESC);

-- Function to refresh the cache (call this after invoice processing)
CREATE OR REPLACE FUNCTION refresh_price_metrics_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY item_price_metrics_cache;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION get_item_price_metrics IS 
    'Returns comprehensive price metrics for items including last paid price, 7-day and 28-day averages';

COMMENT ON FUNCTION get_all_items_price_summary IS 
    'Returns simplified price summary for all items with trend indicators';

COMMENT ON FUNCTION get_items_with_price_changes IS 
    'Identifies items with significant price changes compared to recent averages';

COMMENT ON MATERIALIZED VIEW item_price_metrics_cache IS 
    'Cached price metrics for faster dashboard loading. Refresh after invoice processing.';

-- Grant permissions (adjust as needed)
-- GRANT EXECUTE ON FUNCTION get_item_price_metrics TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_all_items_price_summary TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_items_with_price_changes TO authenticated;
-- GRANT SELECT ON item_price_metrics_cache TO authenticated;

