-- ============================================================================
-- MIGRATION 026: Alert Acknowledgments
-- ============================================================================
-- Description: Track dismissed and acknowledged alerts
-- Author: Alerts System Implementation
-- Date: 2025-11-04
-- Dependencies: Requires auth.users table
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Track dismissed/acknowledged alerts
CREATE TABLE IF NOT EXISTS alert_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'price_increase' or 'savings_opportunity'
  alert_key VARCHAR(255) NOT NULL, -- item_vendor_date combo
  item_description TEXT NOT NULL,
  vendor_name TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, alert_type, alert_key)
);

-- Enable RLS
ALTER TABLE alert_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own acknowledgments" ON alert_acknowledgments;
DROP POLICY IF EXISTS "Users can manage own acknowledgments" ON alert_acknowledgments;

-- RLS Policies
CREATE POLICY "Users can view own acknowledgments"
  ON alert_acknowledgments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own acknowledgments"
  ON alert_acknowledgments FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_ack_user_type ON alert_acknowledgments(user_id, alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_ack_active ON alert_acknowledgments(user_id, dismissed) WHERE dismissed = false;

-- Verification
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'alert_acknowledgments') = 1,
           'alert_acknowledgments table was not created';
    
    RAISE NOTICE '✅ alert_acknowledgments table created successfully';
    RAISE NOTICE '✅ RLS enabled and policies created';
    RAISE NOTICE '✅ Indexes created for performance';
END $$;
