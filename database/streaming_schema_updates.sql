-- Streaming Analysis Schema Updates
-- Add streaming-specific columns to existing tables

-- Update analyses table for streaming support
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS current_step VARCHAR(255),
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streaming_session_id UUID,
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free';

-- Create streaming_events table for real-time progress tracking
CREATE TABLE IF NOT EXISTS public.streaming_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id),
    event_type VARCHAR(50) NOT NULL, -- 'competitors_found', 'competitor_reviews', 'insight_generated', etc.
    event_data JSONB,
    progress_percentage INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create streaming_sessions table for connection management
CREATE TABLE IF NOT EXISTS public.streaming_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id),
    user_id UUID REFERENCES public.users(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'disconnected'
    started_at TIMESTAMP DEFAULT NOW(),
    last_event_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Add indexes for streaming performance
CREATE INDEX IF NOT EXISTS idx_analyses_streaming_session ON public.analyses(streaming_session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_current_step ON public.analyses(current_step);
CREATE INDEX IF NOT EXISTS idx_analyses_progress ON public.analyses(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_streaming_events_analysis_id ON public.streaming_events(analysis_id);
CREATE INDEX IF NOT EXISTS idx_streaming_events_type ON public.streaming_events(event_type);
CREATE INDEX IF NOT EXISTS idx_streaming_events_created_at ON public.streaming_events(created_at);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_analysis_id ON public.streaming_sessions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_user_id ON public.streaming_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_status ON public.streaming_sessions(status);

-- Add RLS policies for streaming tables
ALTER TABLE public.streaming_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see streaming events from their analyses
CREATE POLICY "Users can view own streaming events" ON public.streaming_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analyses 
            WHERE analyses.id = streaming_events.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

-- Users can only see their own streaming sessions
CREATE POLICY "Users can view own streaming sessions" ON public.streaming_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Add competitor_name to insights table if not exists (for streaming display)
ALTER TABLE public.insights 
ADD COLUMN IF NOT EXISTS competitor_name VARCHAR(255);

-- Update insights with competitor names from existing data
UPDATE public.insights 
SET competitor_name = competitors.name
FROM public.competitors
WHERE insights.competitor_id = competitors.id
AND insights.competitor_name IS NULL;

-- Add evidence_reviews table for storing review evidence
CREATE TABLE IF NOT EXISTS public.evidence_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id),
    competitor_id VARCHAR(255) REFERENCES public.competitors(id),
    competitor_name VARCHAR(255),
    review_id UUID REFERENCES public.reviews(id),
    review_text TEXT,
    review_rating INTEGER,
    review_date DATE,
    insight_category VARCHAR(50), -- Which insight this review supports
    relevance_score DECIMAL(3,2), -- 0.00-1.00 relevance to insights
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for evidence reviews
CREATE INDEX IF NOT EXISTS idx_evidence_reviews_analysis_id ON public.evidence_reviews(analysis_id);
CREATE INDEX IF NOT EXISTS idx_evidence_reviews_competitor_id ON public.evidence_reviews(competitor_id);
CREATE INDEX IF NOT EXISTS idx_evidence_reviews_insight_category ON public.evidence_reviews(insight_category);

-- RLS for evidence reviews
ALTER TABLE public.evidence_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evidence reviews" ON public.evidence_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analyses 
            WHERE analyses.id = evidence_reviews.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

-- Add streaming status tracking function
CREATE OR REPLACE FUNCTION update_streaming_progress(
    p_analysis_id UUID,
    p_event_type VARCHAR(50),
    p_event_data JSONB DEFAULT NULL,
    p_progress INTEGER DEFAULT NULL,
    p_current_step VARCHAR(255) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insert streaming event
    INSERT INTO public.streaming_events (
        analysis_id, 
        event_type, 
        event_data, 
        progress_percentage
    ) VALUES (
        p_analysis_id, 
        p_event_type, 
        p_event_data, 
        p_progress
    );
    
    -- Update analysis progress
    UPDATE public.analyses 
    SET 
        progress_percentage = COALESCE(p_progress, progress_percentage),
        current_step = COALESCE(p_current_step, current_step),
        updated_at = NOW()
    WHERE id = p_analysis_id;
    
    -- Update streaming session last event time
    UPDATE public.streaming_sessions 
    SET last_event_at = NOW()
    WHERE analysis_id = p_analysis_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Add function to cleanup old streaming data (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_streaming_data() RETURNS VOID AS $$
BEGIN
    -- Delete streaming events older than 7 days
    DELETE FROM public.streaming_events 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Mark old streaming sessions as completed
    UPDATE public.streaming_sessions 
    SET status = 'completed', completed_at = NOW()
    WHERE status = 'active' 
    AND last_event_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create a view for streaming analysis status
CREATE OR REPLACE VIEW streaming_analysis_status AS
SELECT 
    a.id as analysis_id,
    a.user_id,
    a.restaurant_name,
    a.location,
    a.status,
    a.current_step,
    a.progress_percentage,
    a.tier,
    a.created_at,
    a.updated_at,
    a.completed_at,
    ss.status as streaming_status,
    ss.started_at as streaming_started_at,
    ss.last_event_at,
    COUNT(se.id) as total_events,
    COUNT(DISTINCT c.id) as competitors_found,
    COUNT(DISTINCT i.id) as insights_generated
FROM public.analyses a
LEFT JOIN public.streaming_sessions ss ON a.id = ss.analysis_id
LEFT JOIN public.streaming_events se ON a.id = se.analysis_id
LEFT JOIN public.analysis_competitors ac ON a.id = ac.analysis_id
LEFT JOIN public.competitors c ON ac.competitor_id = c.id
LEFT JOIN public.insights i ON a.id = i.analysis_id
GROUP BY 
    a.id, a.user_id, a.restaurant_name, a.location, a.status, 
    a.current_step, a.progress_percentage, a.tier, a.created_at, 
    a.updated_at, a.completed_at, ss.status, ss.started_at, ss.last_event_at;

-- Grant permissions on new objects
GRANT SELECT ON streaming_analysis_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_streaming_progress TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_streaming_data TO service_role;