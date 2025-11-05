-- Add missing columns to competitors table
-- Run this in your Supabase SQL editor

ALTER TABLE public.competitors 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS google_review_count INTEGER,
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'restaurant';

-- Update the existing rating and review_count columns to match the new structure
-- (This ensures consistency between old and new data)
UPDATE public.competitors 
SET 
    google_rating = rating,
    google_review_count = review_count
WHERE google_rating IS NULL AND rating IS NOT NULL;

-- Add indexes for the new columns for better performance
CREATE INDEX IF NOT EXISTS idx_competitors_latitude_longitude ON public.competitors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_competitors_category ON public.competitors(category);
CREATE INDEX IF NOT EXISTS idx_competitors_google_rating ON public.competitors(google_rating);