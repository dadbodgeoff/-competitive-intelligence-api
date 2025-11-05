-- Multi-Source Review Collection Schema Updates
-- Safe migration that won't break existing data

BEGIN;

-- Add source tracking columns to reviews table (safe for existing data)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'google_places';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS extraction_metadata JSONB;

-- Update existing reviews to have proper source_type
UPDATE reviews SET source_type = 'google_places' WHERE source_type IS NULL OR source_type = '';

-- Add source tracking to evidence_reviews table
ALTER TABLE evidence_reviews ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'google_places';
ALTER TABLE evidence_reviews ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE evidence_reviews ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add multi_source_metadata table for tracking collection stats
CREATE TABLE IF NOT EXISTS multi_source_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    competitor_id VARCHAR(255),
    competitor_name VARCHAR(255),
    google_reviews_count INTEGER DEFAULT 0,
    yelp_reviews_count INTEGER DEFAULT 0,
    web_scraped_count INTEGER DEFAULT 0,
    total_collected INTEGER DEFAULT 0,
    total_after_dedup INTEGER DEFAULT 0,
    total_after_quality INTEGER DEFAULT 0,
    collection_success_rate DECIMAL(5,2),
    collection_cost DECIMAL(8,4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_source_type ON reviews(source_type);
CREATE INDEX IF NOT EXISTS idx_reviews_confidence ON reviews(confidence_score);
CREATE INDEX IF NOT EXISTS idx_evidence_reviews_source ON evidence_reviews(source_type);
CREATE INDEX IF NOT EXISTS idx_multi_source_analysis ON multi_source_metadata(analysis_id);
CREATE INDEX IF NOT EXISTS idx_multi_source_competitor ON multi_source_metadata(analysis_id, competitor_id);

COMMIT;