-- Add competitor_name field to insights table for proper data relationships
ALTER TABLE insights 
ADD COLUMN competitor_name TEXT;

-- Create index for performance
CREATE INDEX idx_insights_competitor_name ON insights(competitor_name);

-- Update existing insights with competitor names from analysis_competitors table
UPDATE insights 
SET competitor_name = ac.competitor_name
FROM analysis_competitors ac
WHERE insights.competitor_id = ac.competitor_id 
AND insights.analysis_id = ac.analysis_id
AND insights.competitor_name IS NULL;

-- For insights without competitor_id, set a default
UPDATE insights 
SET competitor_name = 'Multiple Sources'
WHERE competitor_name IS NULL;