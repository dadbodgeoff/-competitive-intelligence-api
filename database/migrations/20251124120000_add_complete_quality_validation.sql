-- ============================================================================
-- COMPLETE QUALITY VALIDATION SYSTEM MIGRATION
-- Phase 1: Basic validation (resolution, clarity, text)
-- Phase 2: Advanced validation (Vision API, composition, food quality)
-- ============================================================================

-- ============================================================================
-- PART 1: QUALITY METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS creative_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES creative_generation_jobs(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES creative_generation_assets(id) ON DELETE CASCADE,
    
    -- ========================================================================
    -- PHASE 1: Basic Quality Scores (0-100)
    -- ========================================================================
    overall_quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    resolution_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    text_quality_score DECIMAL(5,2),
    
    -- ========================================================================
    -- PHASE 2: Advanced Quality Scores (0-100)
    -- ========================================================================
    semantic_score DECIMAL(5,2),           -- Vision API: Does image match intent?
    composition_score DECIMAL(5,2),        -- Rule of thirds, focal points
    food_quality_score DECIMAL(5,2),       -- Restaurant-specific checks
    
    -- ========================================================================
    -- PHASE 1: Basic Detected Issues
    -- ========================================================================
    quality_issues JSONB DEFAULT '[]'::jsonb,
    has_garbled_text BOOLEAN DEFAULT FALSE,
    has_low_resolution BOOLEAN DEFAULT FALSE,
    has_ai_artifacts BOOLEAN DEFAULT FALSE,
    is_too_generic BOOLEAN DEFAULT FALSE,
    
    -- ========================================================================
    -- PHASE 2: Advanced Detected Issues
    -- ========================================================================
    has_semantic_mismatch BOOLEAN DEFAULT FALSE,      -- Wrong food item
    has_poor_composition BOOLEAN DEFAULT FALSE,       -- Bad framing
    has_unappetizing_colors BOOLEAN DEFAULT FALSE,    -- Green meat, gray food
    has_cold_lighting BOOLEAN DEFAULT FALSE,          -- Blue tint instead of warm
    has_low_freshness BOOLEAN DEFAULT FALSE,          -- Low texture entropy
    has_portion_issues BOOLEAN DEFAULT FALSE,         -- Too small/large
    
    -- ========================================================================
    -- PHASE 2: Vision API Results
    -- ========================================================================
    vision_api_result JSONB,              -- Full Vision API response
    detected_labels JSONB,                -- ["pizza", "food", "italian"]
    detected_objects JSONB,               -- Object localization results
    dominant_colors JSONB,                -- Color palette analysis
    detected_text JSONB,                  -- OCR results
    safe_search_result JSONB,             -- Safety check results
    
    -- ========================================================================
    -- Validation Metadata
    -- ========================================================================
    validator_version VARCHAR(20) DEFAULT 'v2.0',
    validation_duration_ms INTEGER,
    validation_error TEXT,
    phase1_enabled BOOLEAN DEFAULT TRUE,
    phase2_vision_enabled BOOLEAN DEFAULT FALSE,
    phase2_composition_enabled BOOLEAN DEFAULT FALSE,
    phase2_food_quality_enabled BOOLEAN DEFAULT FALSE,
    
    -- ========================================================================
    -- User Behavior Tracking (for feedback loop)
    -- ========================================================================
    was_downloaded BOOLEAN DEFAULT FALSE,
    download_timestamp TIMESTAMP,
    time_to_download_seconds INTEGER,     -- Time from generation to download
    was_regenerated BOOLEAN DEFAULT FALSE,
    regeneration_count INTEGER DEFAULT 0,
    regeneration_reason TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    user_reported_issue BOOLEAN DEFAULT FALSE,
    
    -- ========================================================================
    -- Timestamps
    -- ========================================================================
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_quality_metrics_job_id ON creative_quality_metrics(job_id);
CREATE INDEX idx_quality_metrics_asset_id ON creative_quality_metrics(asset_id);
CREATE INDEX idx_quality_metrics_overall_score ON creative_quality_metrics(overall_quality_score);
CREATE INDEX idx_quality_metrics_created_at ON creative_quality_metrics(created_at);
CREATE INDEX idx_quality_metrics_semantic_score ON creative_quality_metrics(semantic_score);
CREATE INDEX idx_quality_metrics_food_quality_score ON creative_quality_metrics(food_quality_score);

-- Composite indexes for common queries
CREATE INDEX idx_quality_metrics_score_date ON creative_quality_metrics(overall_quality_score, created_at);
CREATE INDEX idx_quality_metrics_issues ON creative_quality_metrics USING GIN(quality_issues);
CREATE INDEX idx_quality_metrics_labels ON creative_quality_metrics USING GIN(detected_labels);

-- ============================================================================
-- PART 2: UPDATE ASSETS TABLE
-- ============================================================================

ALTER TABLE creative_generation_assets 
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS quality_issues JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_quality_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS semantic_match_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS composition_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS food_quality_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS validation_timestamp TIMESTAMP;

-- Index for quick quality filtering
CREATE INDEX IF NOT EXISTS idx_assets_quality_score ON creative_generation_assets(quality_score);
CREATE INDEX IF NOT EXISTS idx_assets_validated ON creative_generation_assets(is_quality_validated);

-- ============================================================================
-- PART 3: FEATURE FLAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast flag lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);

-- ============================================================================
-- PART 4: INSERT FEATURE FLAGS
-- ============================================================================

-- Main quality validator flag (controls entire system)
INSERT INTO feature_flags (flag_name, is_enabled, description, config)
VALUES (
    'quality_validator_enabled',
    FALSE,  -- Start disabled for safety
    'Master switch for quality validation system',
    '{
        "mode": "log_only",
        "min_score_threshold": 60.0,
        "auto_regenerate_on_failure": false,
        "block_low_quality": false,
        "validator_version": "v2.0",
        "enable_phase1": true,
        "enable_phase2_vision_api": false,
        "enable_phase2_composition": false,
        "enable_phase2_food_quality": false,
        "vision_api_timeout_seconds": 10,
        "max_validation_duration_ms": 5000
    }'::jsonb
)
ON CONFLICT (flag_name) DO UPDATE SET
    description = EXCLUDED.description,
    config = EXCLUDED.config;

-- Individual Phase 2 feature flags (for granular control)
INSERT INTO feature_flags (flag_name, is_enabled, description, config)
VALUES 
    (
        'quality_validator_vision_api',
        FALSE,
        'Enable Vertex AI Vision API for semantic analysis',
        '{
            "cost_per_image": 0.0075,
            "features": ["LABEL_DETECTION", "OBJECT_LOCALIZATION", "SAFE_SEARCH_DETECTION", "IMAGE_PROPERTIES", "TEXT_DETECTION"],
            "min_confidence_threshold": 0.7,
            "max_labels": 10
        }'::jsonb
    ),
    (
        'quality_validator_composition',
        FALSE,
        'Enable composition analysis (rule of thirds, focal points)',
        '{
            "check_rule_of_thirds": true,
            "check_focal_point": true,
            "check_centering": true,
            "check_edge_clipping": true,
            "min_composition_score": 60.0
        }'::jsonb
    ),
    (
        'quality_validator_food_quality',
        FALSE,
        'Enable restaurant-specific food quality checks',
        '{
            "check_color_palette": true,
            "check_freshness": true,
            "check_lighting_warmth": true,
            "check_portion_appearance": true,
            "min_food_quality_score": 60.0,
            "unappetizing_color_threshold": 0.1,
            "min_texture_entropy": 1.5
        }'::jsonb
    )
ON CONFLICT (flag_name) DO UPDATE SET
    description = EXCLUDED.description,
    config = EXCLUDED.config;

-- ============================================================================
-- PART 5: QUALITY ANALYTICS VIEWS
-- ============================================================================

-- View: Daily quality summary
CREATE OR REPLACE VIEW quality_metrics_daily_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_validations,
    AVG(overall_quality_score) as avg_overall_score,
    AVG(resolution_score) as avg_resolution_score,
    AVG(clarity_score) as avg_clarity_score,
    AVG(text_quality_score) as avg_text_quality_score,
    AVG(semantic_score) as avg_semantic_score,
    AVG(composition_score) as avg_composition_score,
    AVG(food_quality_score) as avg_food_quality_score,
    COUNT(*) FILTER (WHERE overall_quality_score >= 80) as excellent_count,
    COUNT(*) FILTER (WHERE overall_quality_score >= 60 AND overall_quality_score < 80) as good_count,
    COUNT(*) FILTER (WHERE overall_quality_score >= 40 AND overall_quality_score < 60) as poor_count,
    COUNT(*) FILTER (WHERE overall_quality_score < 40) as critical_count,
    COUNT(*) FILTER (WHERE has_semantic_mismatch) as semantic_mismatch_count,
    COUNT(*) FILTER (WHERE has_unappetizing_colors) as unappetizing_colors_count,
    COUNT(*) FILTER (WHERE has_poor_composition) as poor_composition_count,
    AVG(validation_duration_ms) as avg_validation_duration_ms,
    COUNT(*) FILTER (WHERE was_downloaded) as downloaded_count,
    COUNT(*) FILTER (WHERE was_regenerated) as regenerated_count
FROM creative_quality_metrics
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Issue frequency analysis
CREATE OR REPLACE VIEW quality_issues_frequency AS
SELECT 
    issue,
    COUNT(*) as occurrence_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM creative_quality_metrics), 2) as percentage
FROM creative_quality_metrics,
    jsonb_array_elements_text(quality_issues) as issue
GROUP BY issue
ORDER BY occurrence_count DESC;

-- View: Low quality assets requiring attention
CREATE OR REPLACE VIEW low_quality_assets AS
SELECT 
    qm.id,
    qm.job_id,
    qm.asset_id,
    qm.overall_quality_score,
    qm.quality_issues,
    qm.has_semantic_mismatch,
    qm.has_unappetizing_colors,
    qm.has_poor_composition,
    qm.created_at,
    a.asset_url,
    j.template_id,
    j.user_id
FROM creative_quality_metrics qm
JOIN creative_generation_assets a ON qm.asset_id = a.id
JOIN creative_generation_jobs j ON qm.job_id = j.id
WHERE qm.overall_quality_score < 60
ORDER BY qm.created_at DESC;

-- ============================================================================
-- PART 6: HELPER FUNCTIONS
-- ============================================================================

-- Function: Update quality metrics timestamp
CREATE OR REPLACE FUNCTION update_quality_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_quality_metrics_timestamp ON creative_quality_metrics;
CREATE TRIGGER trigger_update_quality_metrics_timestamp
    BEFORE UPDATE ON creative_quality_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_metrics_timestamp();

-- Function: Calculate quality score distribution
CREATE OR REPLACE FUNCTION get_quality_score_distribution(
    start_date TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE(
    score_range TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH score_ranges AS (
        SELECT 
            CASE 
                WHEN overall_quality_score >= 80 THEN '80-100 (Excellent)'
                WHEN overall_quality_score >= 60 THEN '60-79 (Good)'
                WHEN overall_quality_score >= 40 THEN '40-59 (Poor)'
                ELSE '0-39 (Critical)'
            END as range,
            COUNT(*) as cnt
        FROM creative_quality_metrics
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY range
    ),
    total AS (
        SELECT COUNT(*) as total_count
        FROM creative_quality_metrics
        WHERE created_at BETWEEN start_date AND end_date
    )
    SELECT 
        sr.range,
        sr.cnt,
        ROUND(sr.cnt * 100.0 / t.total_count, 2)
    FROM score_ranges sr, total t
    ORDER BY sr.range DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE creative_quality_metrics IS 'Tracks quality validation results for generated images (Phase 1 + Phase 2)';
COMMENT ON COLUMN creative_quality_metrics.overall_quality_score IS 'Overall quality score 0-100 (weighted average of all checks)';
COMMENT ON COLUMN creative_quality_metrics.quality_issues IS 'Array of detected issue codes (e.g., ["low_resolution", "semantic_mismatch"])';
COMMENT ON COLUMN creative_quality_metrics.semantic_score IS 'Phase 2: Semantic match score from Vision API (does image match user intent?)';
COMMENT ON COLUMN creative_quality_metrics.composition_score IS 'Phase 2: Composition quality score (rule of thirds, focal points)';
COMMENT ON COLUMN creative_quality_metrics.food_quality_score IS 'Phase 2: Restaurant-specific food quality score (colors, freshness, lighting)';
COMMENT ON COLUMN creative_quality_metrics.vision_api_result IS 'Phase 2: Full Vertex AI Vision API response (labels, objects, colors, text)';
COMMENT ON COLUMN creative_quality_metrics.has_semantic_mismatch IS 'Phase 2: True if image content does not match user input (e.g., burger when pizza requested)';
COMMENT ON COLUMN creative_quality_metrics.has_unappetizing_colors IS 'Phase 2: True if image has unappetizing colors (green meat, gray food, etc.)';
COMMENT ON COLUMN creative_quality_metrics.has_cold_lighting IS 'Phase 2: True if lighting has cold blue tint instead of warm tones';
COMMENT ON COLUMN creative_quality_metrics.has_low_freshness IS 'Phase 2: True if food appears stale (low texture entropy)';

COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout of new features';
COMMENT ON COLUMN feature_flags.config IS 'JSON configuration for the feature (thresholds, options, etc.)';

COMMENT ON VIEW quality_metrics_daily_summary IS 'Daily aggregated quality metrics for monitoring and analytics';
COMMENT ON VIEW quality_issues_frequency IS 'Frequency analysis of detected quality issues';
COMMENT ON VIEW low_quality_assets IS 'Assets with quality scores below threshold requiring attention';

-- ============================================================================
-- PART 8: SAMPLE QUERIES FOR MONITORING
-- ============================================================================

-- Query 1: Check current feature flag status
-- SELECT flag_name, is_enabled, config FROM feature_flags WHERE flag_name LIKE 'quality_validator%';

-- Query 2: Get quality metrics for last 24 hours
-- SELECT * FROM quality_metrics_daily_summary WHERE date >= CURRENT_DATE - INTERVAL '1 day';

-- Query 3: Find most common quality issues
-- SELECT * FROM quality_issues_frequency LIMIT 10;

-- Query 4: Get quality score distribution
-- SELECT * FROM get_quality_score_distribution(NOW() - INTERVAL '7 days', NOW());

-- Query 5: Find low-quality assets
-- SELECT * FROM low_quality_assets LIMIT 20;

-- Query 6: Check validation performance
-- SELECT 
--     AVG(validation_duration_ms) as avg_duration,
--     MAX(validation_duration_ms) as max_duration,
--     COUNT(*) FILTER (WHERE validation_error IS NOT NULL) as error_count
-- FROM creative_quality_metrics
-- WHERE created_at > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'creative_quality_metrics') THEN
        RAISE NOTICE '✅ creative_quality_metrics table created successfully';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flags') THEN
        RAISE NOTICE '✅ feature_flags table created successfully';
    END IF;
    
    RAISE NOTICE '✅ Quality validation system migration complete!';
    RAISE NOTICE '📊 Phase 1 (Basic): Ready';
    RAISE NOTICE '🚀 Phase 2 (Advanced): Ready (disabled by default)';
    RAISE NOTICE '🎯 Next step: Enable feature flags as needed';
END $$;
