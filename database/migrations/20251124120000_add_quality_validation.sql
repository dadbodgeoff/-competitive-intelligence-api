-- Quality Validation System Migration
-- Adds quality metrics tracking and feature flags

-- Quality validation metrics table
CREATE TABLE IF NOT EXISTS creative_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES creative_generation_jobs(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES creative_generation_assets(id) ON DELETE CASCADE,
    
    -- Quality scores (0-100)
    overall_quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    resolution_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    text_quality_score DECIMAL(5,2),
    composition_score DECIMAL(5,2),
    
    -- Detected issues
    quality_issues JSONB DEFAULT '[]'::jsonb,
    has_garbled_text BOOLEAN DEFAULT FALSE,
    has_low_resolution BOOLEAN DEFAULT FALSE,
    has_ai_artifacts BOOLEAN DEFAULT FALSE,
    is_too_generic BOOLEAN DEFAULT FALSE,
    
    -- Validation metadata
    validator_version VARCHAR(20) DEFAULT 'v1.0',
    validation_duration_ms INTEGER,
    validation_error TEXT,
    
    -- User behavior tracking (for feedback loop)
    was_downloaded BOOLEAN DEFAULT FALSE,
    download_timestamp TIMESTAMP,
    was_regenerated BOOLEAN DEFAULT FALSE,
    regeneration_count INTEGER DEFAULT 0,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quality_metrics_job_id ON creative_quality_metrics(job_id);
CREATE INDEX idx_quality_metrics_asset_id ON creative_quality_metrics(asset_id);
CREATE INDEX idx_quality_metrics_score ON creative_quality_metrics(overall_quality_score);
CREATE INDEX idx_quality_metrics_created_at ON creative_quality_metrics(created_at);

-- Add quality score to assets table (denormalized for quick access)
ALTER TABLE creative_generation_assets 
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS quality_issues JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_quality_validated BOOLEAN DEFAULT FALSE;

-- Feature flag table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert quality validator feature flag (disabled by default)
INSERT INTO feature_flags (flag_name, is_enabled, description, config)
VALUES (
    'quality_validator_enabled',
    FALSE,  -- Start disabled for safety
    'Enable post-generation quality validation',
    '{
        "mode": "log_only",
        "min_score_threshold": 60.0,
        "auto_regenerate_on_failure": false,
        "block_low_quality": false
    }'::jsonb
)
ON CONFLICT (flag_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE creative_quality_metrics IS 'Tracks quality validation results for generated images';
COMMENT ON COLUMN creative_quality_metrics.overall_quality_score IS 'Overall quality score 0-100';
COMMENT ON COLUMN creative_quality_metrics.quality_issues IS 'Array of detected issue codes';
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout of new features';
