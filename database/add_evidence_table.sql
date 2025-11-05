-- Add evidence_reviews table to store the selected reviews used for analysis
CREATE TABLE public.evidence_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    sentiment_category VARCHAR(20) NOT NULL, -- 'negative', 'positive', 'neutral'
    review_data JSONB NOT NULL, -- Full review data including text, rating, date, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_evidence_reviews_analysis_id ON public.evidence_reviews(analysis_id);
CREATE INDEX idx_evidence_reviews_competitor ON public.evidence_reviews(analysis_id, competitor_name);