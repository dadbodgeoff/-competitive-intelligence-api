-- Migration: Add Phase 3 Brand Profile Fields
-- Description: Adds seasonal automation, location context, and price positioning to creative_brand_profiles
-- Date: 2025-11-23
-- Status: READY TO RUN (when Phase 3 is implemented)

-- Add Phase 3 columns to creative_brand_profiles table
ALTER TABLE creative_brand_profiles
ADD COLUMN IF NOT EXISTS active_seasons TEXT[], -- Array: spring, summer, fall, winter
ADD COLUMN IF NOT EXISTS recurring_events JSONB DEFAULT '[]'::jsonb, -- Array of {name, day_of_week, description}
ADD COLUMN IF NOT EXISTS holiday_participation TEXT[], -- Array: christmas, valentines, halloween, etc.
ADD COLUMN IF NOT EXISTS seasonal_menu_rotation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_type TEXT, -- urban, suburban, beach, mountain, rural
ADD COLUMN IF NOT EXISTS regional_style TEXT, -- southern, new_england, southwest, pacific_northwest, midwest, etc.
ADD COLUMN IF NOT EXISTS local_landmarks TEXT, -- Free text: "Near the waterfront", "Downtown historic district"
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS price_range TEXT, -- $, $$, $$$, $$$$
ADD COLUMN IF NOT EXISTS value_proposition TEXT, -- best_value, premium_ingredients, quick_affordable, fine_dining
ADD COLUMN IF NOT EXISTS average_check_size DECIMAL(10,2), -- Average ticket price
ADD COLUMN IF NOT EXISTS positioning_statement TEXT; -- Free text positioning statement

-- Add comments for documentation
COMMENT ON COLUMN creative_brand_profiles.active_seasons IS 'Seasons when restaurant is most active or has special offerings';
COMMENT ON COLUMN creative_brand_profiles.recurring_events IS 'JSON array of recurring events: [{name: "Taco Tuesday", day: "tuesday", description: "Half-price tacos"}]';
COMMENT ON COLUMN creative_brand_profiles.holiday_participation IS 'Holidays the restaurant celebrates: christmas, valentines, halloween, thanksgiving, etc.';
COMMENT ON COLUMN creative_brand_profiles.seasonal_menu_rotation IS 'Whether restaurant rotates menu seasonally';
COMMENT ON COLUMN creative_brand_profiles.location_type IS 'Type of location: urban, suburban, beach, mountain, rural';
COMMENT ON COLUMN creative_brand_profiles.regional_style IS 'Regional culinary style: southern, new_england, southwest, pacific_northwest, midwest, cajun, tex_mex';
COMMENT ON COLUMN creative_brand_profiles.local_landmarks IS 'Notable local landmarks or location description';
COMMENT ON COLUMN creative_brand_profiles.city IS 'City where restaurant is located';
COMMENT ON COLUMN creative_brand_profiles.state IS 'State/province where restaurant is located';
COMMENT ON COLUMN creative_brand_profiles.country IS 'Country where restaurant is located';
COMMENT ON COLUMN creative_brand_profiles.price_range IS 'Price range indicator: $, $$, $$$, $$$$';
COMMENT ON COLUMN creative_brand_profiles.value_proposition IS 'Value positioning: best_value, premium_ingredients, quick_affordable, fine_dining, family_friendly';
COMMENT ON COLUMN creative_brand_profiles.average_check_size IS 'Average check size per person in local currency';
COMMENT ON COLUMN creative_brand_profiles.positioning_statement IS 'Brand positioning statement (e.g., "Farm-to-table dining in the heart of downtown")';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_brand_profiles_location_type ON creative_brand_profiles(location_type);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_price_range ON creative_brand_profiles(price_range);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_city_state ON creative_brand_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_holidays ON creative_brand_profiles USING GIN(holiday_participation);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_recurring_events ON creative_brand_profiles USING GIN(recurring_events);

-- Update existing records to have empty arrays where NULL
UPDATE creative_brand_profiles
SET 
    active_seasons = COALESCE(active_seasons, ARRAY[]::TEXT[]),
    holiday_participation = COALESCE(holiday_participation, ARRAY[]::TEXT[]),
    recurring_events = COALESCE(recurring_events, '[]'::jsonb)
WHERE 
    active_seasons IS NULL OR 
    holiday_participation IS NULL OR 
    recurring_events IS NULL;

-- Add check constraint for location_type
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_location_type 
CHECK (location_type IN ('urban', 'suburban', 'beach', 'mountain', 'rural', NULL));

-- Add check constraint for price_range
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_price_range 
CHECK (price_range IN ('$', '$$', '$$$', '$$$$', NULL));

-- Add check constraint for regional_style
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_regional_style 
CHECK (regional_style IN (
    'southern', 'new_england', 'southwest', 'pacific_northwest', 'midwest', 
    'cajun', 'tex_mex', 'california', 'new_york', 'chicago', NULL
));

-- Add check constraint for value_proposition
ALTER TABLE creative_brand_profiles
ADD CONSTRAINT check_value_proposition 
CHECK (value_proposition IN (
    'best_value', 'premium_ingredients', 'quick_affordable', 
    'fine_dining', 'family_friendly', 'casual_dining', NULL
));

-- Create a helper function to get current season-appropriate templates
CREATE OR REPLACE FUNCTION get_current_season() RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (12, 1, 2) THEN 'winter'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (3, 4, 5) THEN 'spring'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (6, 7, 8) THEN 'summer'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) IN (9, 10, 11) THEN 'fall'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_current_season() IS 'Returns the current season based on the current date';

-- Create a helper function to check if a holiday is upcoming (within 2 weeks)
CREATE OR REPLACE FUNCTION get_upcoming_holidays() RETURNS TEXT[] AS $$
DECLARE
    current_month INT;
    current_day INT;
    holidays TEXT[] := ARRAY[]::TEXT[];
BEGIN
    current_month := EXTRACT(MONTH FROM CURRENT_DATE);
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    
    -- Check for holidays within 2 weeks
    IF current_month = 12 AND current_day >= 11 THEN holidays := array_append(holidays, 'christmas'); END IF;
    IF current_month = 2 AND current_day >= 1 AND current_day <= 14 THEN holidays := array_append(holidays, 'valentines'); END IF;
    IF current_month = 3 AND current_day >= 3 AND current_day <= 17 THEN holidays := array_append(holidays, 'st_patricks'); END IF;
    IF current_month = 10 AND current_day >= 17 THEN holidays := array_append(holidays, 'halloween'); END IF;
    IF current_month = 11 AND current_day >= 11 AND current_day <= 28 THEN holidays := array_append(holidays, 'thanksgiving'); END IF;
    IF current_month = 7 AND current_day >= 1 AND current_day <= 4 THEN holidays := array_append(holidays, 'independence_day'); END IF;
    IF current_month = 5 AND current_day >= 1 AND current_day <= 14 THEN holidays := array_append(holidays, 'mothers_day'); END IF;
    IF current_month = 6 AND current_day >= 8 AND current_day <= 21 THEN holidays := array_append(holidays, 'fathers_day'); END IF;
    
    RETURN holidays;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_upcoming_holidays() IS 'Returns array of holidays that are upcoming within 2 weeks';
