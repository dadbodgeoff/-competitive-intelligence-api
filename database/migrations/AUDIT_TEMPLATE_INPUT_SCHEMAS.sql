-- AUDIT: Find templates where prompt_body references variables not in input_schema
-- This helps identify templates that need their input_schema updated

-- Step 1: Create a function to extract {{variable}} patterns from prompt_body
CREATE OR REPLACE FUNCTION extract_prompt_variables(prompt_text TEXT)
RETURNS TEXT[] AS $$
DECLARE
    matches TEXT[];
    match_record RECORD;
BEGIN
    matches := ARRAY[]::TEXT[];
    
    -- Use regex to find all {{variable}} patterns
    FOR match_record IN 
        SELECT (regexp_matches(prompt_text, '\{\{(\w+)\}\}', 'g'))[1] AS var_name
    LOOP
        IF NOT match_record.var_name = ANY(matches) THEN
            matches := array_append(matches, match_record.var_name);
        END IF;
    END LOOP;
    
    RETURN matches;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Query to find mismatches
WITH template_analysis AS (
    SELECT 
        t.id,
        t.slug,
        t.display_name,
        t.theme_id,
        th.name as theme_name,
        extract_prompt_variables(t.prompt_body) as prompt_vars,
        COALESCE(
            (t.input_schema::jsonb->'required')::jsonb,
            '[]'::jsonb
        ) as required_fields,
        COALESCE(
            (t.input_schema::jsonb->'optional')::jsonb,
            '[]'::jsonb
        ) as optional_fields
    FROM creative_prompt_templates t
    LEFT JOIN creative_themes th ON t.theme_id = th.id
    WHERE t.is_active = true
),
schema_fields AS (
    SELECT 
        id,
        slug,
        display_name,
        theme_id,
        theme_name,
        prompt_vars,
        required_fields,
        optional_fields,
        -- Combine required and optional into one array
        (
            SELECT array_agg(elem::text) 
            FROM (
                SELECT jsonb_array_elements_text(required_fields) as elem
                UNION
                SELECT jsonb_array_elements_text(optional_fields) as elem
            ) combined
        ) as all_schema_fields
    FROM template_analysis
)
SELECT 
    id,
    slug,
    display_name,
    theme_name,
    prompt_vars as "Variables in Prompt",
    all_schema_fields as "Fields in Schema",
    -- Find variables in prompt that are NOT in schema
    (
        SELECT array_agg(v)
        FROM unnest(prompt_vars) v
        WHERE v NOT IN (
            SELECT unnest(COALESCE(all_schema_fields, ARRAY[]::TEXT[]))
        )
        -- Exclude common auto-filled variables
        AND v NOT IN ('brand_name', 'restaurant_name')
    ) as "MISSING FROM SCHEMA (needs fixing)"
FROM schema_fields
WHERE (
    SELECT count(*)
    FROM unnest(prompt_vars) v
    WHERE v NOT IN (
        SELECT unnest(COALESCE(all_schema_fields, ARRAY[]::TEXT[]))
    )
    AND v NOT IN ('brand_name', 'restaurant_name')
) > 0
ORDER BY theme_name, slug;

-- Step 3: Summary count
SELECT 
    'Templates with missing schema fields' as issue,
    count(*) as count
FROM (
    SELECT t.id
    FROM creative_prompt_templates t
    WHERE t.is_active = true
    AND EXISTS (
        SELECT 1
        FROM unnest(extract_prompt_variables(t.prompt_body)) v
        WHERE v NOT IN (
            SELECT jsonb_array_elements_text(COALESCE(t.input_schema::jsonb->'required', '[]'::jsonb))
            UNION
            SELECT jsonb_array_elements_text(COALESCE(t.input_schema::jsonb->'optional', '[]'::jsonb))
        )
        AND v NOT IN ('brand_name', 'restaurant_name')
    )
) missing;

-- Cleanup
DROP FUNCTION IF EXISTS extract_prompt_variables(TEXT);
