-- ================================================================================
-- USER INVENTORY PREFERENCES
-- Migration 006: Add user-specific inventory preferences
-- ================================================================================

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_inventory_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Waste buffer percentages by category
    default_waste_buffers JSONB DEFAULT '{
        "proteins": 1.0,
        "produce": 1.8,
        "dairy": 1.2,
        "dry_goods": 0.5,
        "frozen": 0.8,
        "beverages": 0.3,
        "disposables": 0.2,
        "cleaning": 0.1,
        "paper_goods": 0.1,
        "smallwares": 0.0
    }'::jsonb,
    
    -- Alert thresholds
    low_stock_threshold_days DECIMAL(5,2) DEFAULT 3.0,
    price_increase_alert_percent DECIMAL(5,2) DEFAULT 5.0,
    
    -- Unit preferences
    preferred_weight_unit TEXT DEFAULT 'lb',
    preferred_volume_unit TEXT DEFAULT 'ga',
    show_unit_conversions BOOLEAN DEFAULT true,
    
    -- Display preferences
    group_by_vendor BOOLEAN DEFAULT false,
    default_category_order JSONB DEFAULT '["proteins", "produce", "dairy", "dry_goods", "frozen", "beverages", "disposables", "cleaning", "paper_goods", "smallwares"]'::jsonb,
    hidden_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_inventory_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own preferences
DROP POLICY IF EXISTS user_preferences_policy ON user_inventory_preferences;
CREATE POLICY user_preferences_policy ON user_inventory_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_inventory_preferences(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_inventory_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_inventory_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default preferences for existing users
INSERT INTO user_inventory_preferences (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_inventory_preferences 
    WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ================================================================================
-- HELPER FUNCTIONS
-- ================================================================================

-- Function to get waste buffer for category
CREATE OR REPLACE FUNCTION get_waste_buffer(
    target_user_id UUID,
    target_category TEXT
)
RETURNS DECIMAL AS $$
DECLARE
    buffer_value DECIMAL;
BEGIN
    SELECT (default_waste_buffers->>target_category)::DECIMAL
    INTO buffer_value
    FROM user_inventory_preferences
    WHERE user_id = target_user_id;
    
    -- Return default if not found
    RETURN COALESCE(buffer_value, 1.0);
END;
$$ LANGUAGE plpgsql;

-- Function to get alert threshold
CREATE OR REPLACE FUNCTION get_alert_threshold(
    target_user_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    threshold_value DECIMAL;
BEGIN
    SELECT low_stock_threshold_days
    INTO threshold_value
    FROM user_inventory_preferences
    WHERE user_id = target_user_id;
    
    -- Return default if not found
    RETURN COALESCE(threshold_value, 3.0);
END;
$$ LANGUAGE plpgsql;

-- ================================================================================
-- VERIFICATION
-- ================================================================================

-- Check preferences created
SELECT COUNT(*) as total_preferences FROM user_inventory_preferences;

-- Check default values
SELECT 
    user_id,
    low_stock_threshold_days,
    price_increase_alert_percent,
    preferred_weight_unit,
    preferred_volume_unit
FROM user_inventory_preferences
LIMIT 5;

-- Test waste buffer function
SELECT get_waste_buffer(
    (SELECT user_id FROM user_inventory_preferences LIMIT 1),
    'proteins'
) as proteins_buffer;

-- ================================================================================
-- MIGRATION COMPLETE
-- ================================================================================
-- ✅ user_inventory_preferences table created
-- ✅ RLS policy enabled
-- ✅ Indexes created
-- ✅ Triggers configured
-- ✅ Helper functions created
-- ✅ Default preferences for existing users
-- ================================================================================
