-- ================================================================================
-- MIGRATION 040: Vendor Delivery Schedules
-- Purpose: Track detected delivery weekdays per vendor/user for predictive ordering
-- ================================================================================

CREATE TABLE IF NOT EXISTS vendor_delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    delivery_weekdays INTEGER[] NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    detection_method TEXT NOT NULL DEFAULT 'historical',
    last_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, vendor_name)
);

COMMENT ON TABLE vendor_delivery_schedules IS 'Detected vendor delivery weekday patterns per user account';
COMMENT ON COLUMN vendor_delivery_schedules.delivery_weekdays IS 'Array of weekdays (0=Mon..6=Sun) when vendor typically delivers';
COMMENT ON COLUMN vendor_delivery_schedules.confidence_score IS '0-1 score indicating pattern reliability';

ALTER TABLE vendor_delivery_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their delivery schedules"
    ON vendor_delivery_schedules
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their delivery schedules"
    ON vendor_delivery_schedules
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their delivery schedules"
    ON vendor_delivery_schedules
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their delivery schedules"
    ON vendor_delivery_schedules
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_vendor_delivery_schedules_user_vendor
    ON vendor_delivery_schedules (user_id, vendor_name);

CREATE TRIGGER trg_vendor_delivery_schedules_updated_at
    BEFORE UPDATE ON vendor_delivery_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

