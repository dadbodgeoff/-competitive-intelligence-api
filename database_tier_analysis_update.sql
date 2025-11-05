-- Add missing columns for tier analysis support
-- Run this in your Supabase SQL editor

ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS insights_generated INTEGER DEFAULT 0;

-- Add analysis_id column to competitors table for linking
ALTER TABLE public.competitors
ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES public.analyses(id);

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_analyses_tier ON public.analyses(tier);
CREATE INDEX IF NOT EXISTS idx_analyses_estimated_cost ON public.analyses(estimated_cost);
CREATE INDEX IF NOT EXISTS idx_competitors_analysis_id ON public.competitors(analysis_id);