ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS current_step VARCHAR(255),
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free';

ALTER TABLE public.analyses 
DROP CONSTRAINT IF EXISTS analyses_status_check;

ALTER TABLE public.analyses 
ADD CONSTRAINT analyses_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'streaming'));

CREATE TABLE IF NOT EXISTS public.streaming_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    progress_percentage INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_current_step ON public.analyses(current_step);
CREATE INDEX IF NOT EXISTS idx_analyses_progress ON public.analyses(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_streaming_events_analysis_id ON public.streaming_events(analysis_id);
CREATE INDEX IF NOT EXISTS idx_streaming_events_type ON public.streaming_events(event_type);

ALTER TABLE public.streaming_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaming events" ON public.streaming_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analyses 
            WHERE analyses.id = streaming_events.analysis_id 
            AND analyses.user_id = auth.uid()
        )
    );

GRANT SELECT ON public.streaming_events TO authenticated;
GRANT INSERT ON public.streaming_events TO service_role;