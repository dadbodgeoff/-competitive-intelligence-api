-- ================================================================================
-- MIGRATION 007: PRICE ANALYTICS FUNCTIONS
-- Advanced SQL functions for price intelligence and vendor comparison
-- ================================================================================

-- Function: Get vendor price comparison for an item
-- Returns aggregated price metrics across all vendors
CREATE OR REPLACE FUNCTION get_vendor_price_comparison(
    target_item_id UUID,
    target_user_id UUID,
    days_back INT DEFAULT 90
)
RETURNS TABLE (
    vendor_id UUID,
    vendor_name TEXT,
    current_price DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    purchase_count BIGINT,
    last_purchase_date DATE,
    price_trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH vendor_prices AS (
        SELECT 
            ph.vendor_id,
            v.name as vendor_name,
            ph.unit_price,
            ph.invoice_date,
            ROW_NUMBER() OVER (PARTITION BY ph.vendor_id ORDER BY ph.invoice_date DESC) as rn
        FROM price_history ph
        JOIN vendors v ON ph.vendor_id = v.id
        WHERE ph.inventory_item_id = target_item_id
            AND ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
    ),
    vendor_stats AS (
        SELECT 
            vp.vendor_id,
            vp.vendor_name,
            MAX(CASE WHEN vp.rn = 1 THEN vp.unit_price END) as current_price,
            AVG(vp.unit_price) as avg_price,
            MIN(vp.unit_price) as min_price,
            MAX(vp.unit_price) as max_price,
            COUNT(*) as purchase_count,
            MAX(vp.invoice_date) as last_purchase_date
        FROM vendor_prices vp
        GROUP BY vp.vendor_id, vp.vendor_name
    )
    SELECT 
        vs.vendor_id,
        vs.vendor_name,
        vs.current_price,
        vs.avg_price,
        vs.min_price,
        vs.max_price,
        vs.purchase_count,
        vs.last_purchase_date,
        CASE 
            WHEN vs.current_price > vs.avg_price * 1.05 THEN 'increasing'
            WHEN vs.current_price < vs.avg_price * 0.95 THEN 'decreasing'
            ELSE 'stable'
        END as price_trend
    FROM vendor_stats vs
    ORDER BY vs.current_price ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Find savings opportunities across all items
-- Identifies items where switching vendors could save money
CREATE OR REPLACE FUNCTION find_savings_opportunities(
    target_user_id UUID,
    min_savings_percent DECIMAL DEFAULT 5.0,
    days_back INT DEFAULT 90
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    current_vendor_id UUID,
    current_vendor_name TEXT,
    current_price DECIMAL(10,2),
    best_vendor_id UUID,
    best_vendor_name TEXT,
    best_price DECIMAL(10,2),
    savings_amount DECIMAL(10,2),
    savings_percent DECIMAL(6,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_purchases AS (
        SELECT DISTINCT ON (ph.inventory_item_id)
            ph.inventory_item_id,
            ph.vendor_id as current_vendor_id,
            ph.unit_price as current_price,
            ph.invoice_date
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        ORDER BY ph.inventory_item_id, ph.invoice_date DESC
    ),
    best_prices AS (
        SELECT DISTINCT ON (ph.inventory_item_id)
            ph.inventory_item_id,
            ph.vendor_id as best_vendor_id,
            ph.unit_price as best_price
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        ORDER BY ph.inventory_item_id, ph.unit_price ASC
    )
    SELECT 
        lp.inventory_item_id,
        ii.name as item_name,
        lp.current_vendor_id,
        cv.name as current_vendor_name,
        lp.current_price,
        bp.best_vendor_id,
        bv.name as best_vendor_name,
        bp.best_price,
        (lp.current_price - bp.best_price) as savings_amount,
        ((lp.current_price - bp.best_price) / lp.current_price * 100) as savings_percent
    FROM latest_purchases lp
    JOIN best_prices bp ON lp.inventory_item_id = bp.inventory_item_id
    JOIN inventory_items ii ON lp.inventory_item_id = ii.id
    JOIN vendors cv ON lp.current_vendor_id = cv.id
    JOIN vendors bv ON bp.best_vendor_id = bv.id
    WHERE lp.current_vendor_id != bp.best_vendor_id
        AND ((lp.current_price - bp.best_price) / lp.current_price * 100) >= min_savings_percent
    ORDER BY savings_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate vendor competitive score
-- Returns 0-100 score based on how often vendor has best prices
CREATE OR REPLACE FUNCTION calculate_vendor_competitive_score(
    target_vendor_id UUID,
    target_user_id UUID,
    days_back INT DEFAULT 90
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_items INT;
    best_price_count INT;
    score DECIMAL(5,2);
BEGIN
    -- Count items where this vendor has the best price
    WITH vendor_ranks AS (
        SELECT 
            ph.inventory_item_id,
            ph.vendor_id,
            RANK() OVER (PARTITION BY ph.inventory_item_id ORDER BY AVG(ph.unit_price)) as price_rank
        FROM price_history ph
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        GROUP BY ph.inventory_item_id, ph.vendor_id
    )
    SELECT 
        COUNT(DISTINCT inventory_item_id),
        COUNT(DISTINCT CASE WHEN price_rank = 1 THEN inventory_item_id END)
    INTO total_items, best_price_count
    FROM vendor_ranks
    WHERE vendor_id = target_vendor_id;
    
    -- Calculate score
    IF total_items > 0 THEN
        score := (best_price_count::DECIMAL / total_items::DECIMAL) * 100;
    ELSE
        score := 50.0;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function: Detect price anomalies
-- Identifies unusual price changes using statistical analysis
CREATE OR REPLACE FUNCTION detect_price_anomalies(
    target_user_id UUID,
    days_back INT DEFAULT 90,
    std_dev_threshold DECIMAL DEFAULT 2.0
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    vendor_id UUID,
    vendor_name TEXT,
    current_price DECIMAL(10,2),
    expected_price DECIMAL(10,2),
    deviation_percent DECIMAL(6,2),
    anomaly_type TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH price_stats AS (
        SELECT 
            ph.inventory_item_id,
            ph.vendor_id,
            ph.unit_price as current_price,
            AVG(ph2.unit_price) as avg_price,
            STDDEV(ph2.unit_price) as std_dev,
            ph.invoice_date
        FROM price_history ph
        JOIN price_history ph2 ON ph.inventory_item_id = ph2.inventory_item_id
            AND ph2.invoice_date < ph.invoice_date
            AND ph2.invoice_date >= CURRENT_DATE - days_back
        WHERE ph.user_id = target_user_id
            AND ph.invoice_date >= CURRENT_DATE - days_back
        GROUP BY ph.inventory_item_id, ph.vendor_id, ph.unit_price, ph.invoice_date
        HAVING COUNT(ph2.id) >= 3  -- Need enough historical data
    ),
    anomalies AS (
        SELECT 
            ps.inventory_item_id,
            ps.vendor_id,
            ps.current_price,
            ps.avg_price as expected_price,
            ABS((ps.current_price - ps.avg_price) / ps.avg_price * 100) as deviation_percent,
            CASE 
                WHEN ps.current_price > ps.avg_price THEN 'spike'
                ELSE 'drop'
            END as anomaly_type,
            ABS((ps.current_price - ps.avg_price) / NULLIF(ps.std_dev, 0)) as z_score
        FROM price_stats ps
        WHERE ps.std_dev > 0
            AND ABS((ps.current_price - ps.avg_price) / ps.std_dev) >= std_dev_threshold
    )
    SELECT 
        a.inventory_item_id,
        ii.name as item_name,
        a.vendor_id,
        v.name as vendor_name,
        a.current_price,
        a.expected_price,
        a.deviation_percent,
        a.anomaly_type,
        CASE 
            WHEN a.z_score >= 3.0 THEN 'high'
            WHEN a.z_score >= 2.5 THEN 'medium'
            ELSE 'low'
        END as severity
    FROM anomalies a
    JOIN inventory_items ii ON a.inventory_item_id = ii.id
    JOIN vendors v ON a.vendor_id = v.id
    ORDER BY a.z_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better analytics performance
CREATE INDEX IF NOT EXISTS idx_price_history_user_item_date 
    ON price_history(user_id, inventory_item_id, invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_user_vendor_date 
    ON price_history(user_id, vendor_id, invoice_date DESC);

-- Add comment for documentation
COMMENT ON FUNCTION get_vendor_price_comparison IS 
    'Returns comprehensive price comparison across all vendors for a specific item';

COMMENT ON FUNCTION find_savings_opportunities IS 
    'Identifies items where switching to a different vendor could save money';

COMMENT ON FUNCTION calculate_vendor_competitive_score IS 
    'Calculates 0-100 score indicating how competitive a vendor''s pricing is';

COMMENT ON FUNCTION detect_price_anomalies IS 
    'Detects unusual price changes using statistical analysis (z-score method)';
