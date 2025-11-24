-- Migration: Add Smart Defaults to Creative Templates
-- This adds default values and contextual default pools to ensure high-quality prompts
-- even when users leave optional fields blank.

-- ============================================================================
-- Update Bar Mirror Selfie Template with Defaults
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{defaults}',
    '{
        "scene_time": ["golden hour", "happy hour", "late evening", "midnight", "sunset", "prime time"],
        "scene_day": ["Friday", "Saturday night", "Thursday", "weekend", "Saturday", "Friday night"]
    }'::jsonb
)
WHERE slug = 'mirror_selfie_moment'
AND NOT input_schema ? 'defaults';

-- ============================================================================
-- Update Golden Hour Window Template with Defaults
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{defaults}',
    '{
        "scene_time": ["golden hour", "sunset", "late afternoon", "magic hour", "dusk"]
    }'::jsonb
)
WHERE slug = 'golden_hour_window'
AND NOT input_schema ? 'defaults';

-- ============================================================================
-- Update Custom Scene Builder Template with Defaults
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{defaults}',
    '{
        "scene_description": [
            "Vibrant restaurant interior with warm lighting and bustling atmosphere",
            "Cozy dining space with rustic wooden tables and ambient candlelight",
            "Modern bar setting with sleek surfaces and dramatic LED accents",
            "Outdoor patio scene with string lights and natural greenery",
            "Industrial-chic space with exposed brick and vintage fixtures"
        ],
        "supporting_props": ["fresh ingredients", "artisan tableware", "ambient lighting", "textured surfaces"],
        "color_palette": ["warm earth tones", "vibrant jewel tones", "cool industrial grays", "natural wood and green"],
        "texture_focus": ["rustic wood grain", "polished metal", "soft fabric", "natural stone"],
        "camera_notes": ["shallow depth of field", "eye-level perspective", "overhead flatlay", "dynamic angle"]
    }'::jsonb
)
WHERE slug = 'custom_scene_builder'
AND NOT input_schema ? 'defaults';

-- ============================================================================
-- Add Contextual Defaults to Bar & Grill Theme
-- ============================================================================
UPDATE creative_prompt_themes
SET variation_rules = jsonb_set(
    variation_rules,
    '{contextual_defaults}',
    '{
        "scene_time": {
            "high_energy": ["happy hour", "late evening", "midnight", "prime time", "Friday night"],
            "romantic": ["golden hour", "sunset", "candlelight hour", "twilight", "intimate evening"],
            "casual": ["lunch rush", "afternoon", "brunch time", "mid-morning", "early evening"],
            "default": ["golden hour", "evening", "happy hour", "late night", "sunset"]
        },
        "scene_day": {
            "high_energy": ["Friday", "Saturday night", "weekend", "game day", "Friday night"],
            "romantic": ["date night", "Saturday evening", "Friday evening", "Valentine''s Day", "anniversary"],
            "casual": ["Tuesday", "Wednesday", "weekday", "Monday", "Thursday"],
            "default": ["Friday", "Saturday", "weekend", "Thursday", "Saturday night"]
        },
        "scene_description": {
            "high_energy": [
                "Packed bar with energetic crowd and pulsing neon lights",
                "Bustling sports bar atmosphere with multiple screens and cheering patrons",
                "Lively nightlife scene with DJ booth and dance floor energy"
            ],
            "romantic": [
                "Intimate corner booth with soft candlelight and elegant table setting",
                "Cozy two-top table with ambient lighting and romantic atmosphere",
                "Secluded patio seating with string lights and private ambiance"
            ],
            "casual": [
                "Relaxed dining area with comfortable seating and friendly vibe",
                "Casual bar setting with communal tables and welcoming atmosphere",
                "Laid-back patio space with picnic tables and outdoor charm"
            ],
            "default": [
                "Vibrant bar interior with warm lighting and social atmosphere",
                "Modern restaurant space with inviting ambiance and stylish decor",
                "Dynamic dining environment with energetic yet comfortable vibe"
            ]
        }
    }'::jsonb
)
WHERE theme_slug = 'bar_grill_mirror_selfie'
AND NOT variation_rules ? 'contextual_defaults';

-- ============================================================================
-- Add Contextual Defaults to Social Proof Theme
-- ============================================================================
UPDATE creative_prompt_themes
SET variation_rules = jsonb_set(
    variation_rules,
    '{contextual_defaults}',
    '{
        "scene_time": {
            "high_energy": ["peak dinner rush", "bustling evening", "prime time", "Saturday night"],
            "romantic": ["intimate dinner hour", "candlelit evening", "romantic sunset"],
            "casual": ["casual lunch", "afternoon gathering", "brunch time"],
            "default": ["dinner service", "evening atmosphere", "peak hours"]
        },
        "scene_description": {
            "high_energy": [
                "Crowded restaurant with every table full and vibrant energy",
                "Packed dining room with servers weaving through happy guests",
                "Bustling scene with laughter and clinking glasses filling the air"
            ],
            "romantic": [
                "Intimate table setting with rose petals and soft lighting",
                "Romantic corner with elegant presentation and private ambiance",
                "Cozy booth with champagne glasses and anniversary celebration"
            ],
            "casual": [
                "Friendly neighborhood spot with regulars chatting at the bar",
                "Relaxed dining scene with families and friends enjoying meals",
                "Comfortable atmosphere with casual elegance and warm hospitality"
            ],
            "default": [
                "Welcoming restaurant interior with satisfied diners and attentive service",
                "Inviting dining space showcasing happy customers and quality food",
                "Authentic restaurant moment capturing genuine guest satisfaction"
            ]
        }
    }'::jsonb
)
WHERE theme_slug LIKE 'social_proof%'
AND NOT variation_rules ? 'contextual_defaults';

-- ============================================================================
-- Add Contextual Defaults to Winter Theme
-- ============================================================================
UPDATE creative_prompt_themes
SET variation_rules = jsonb_set(
    variation_rules,
    '{contextual_defaults}',
    '{
        "scene_time": {
            "high_energy": ["après-ski hour", "winter evening", "holiday party time"],
            "romantic": ["cozy winter evening", "fireside hour", "snowy twilight"],
            "casual": ["winter afternoon", "snow day lunch", "cozy morning"],
            "default": ["winter evening", "snowy afternoon", "cozy hour"]
        },
        "scene_description": {
            "high_energy": [
                "Festive winter scene with holiday lights and celebratory atmosphere",
                "Snowy outdoor setting with fire pit and gathering crowd",
                "Winter wonderland with twinkling lights and seasonal cheer"
            ],
            "romantic": [
                "Intimate fireside setting with plush blankets and warm glow",
                "Cozy corner with snow falling outside and candlelight within",
                "Romantic winter scene with hot cocoa and soft lighting"
            ],
            "casual": [
                "Comfortable winter retreat with rustic charm and warm hospitality",
                "Casual snow day gathering with comfort food and friendly faces",
                "Relaxed winter atmosphere with seasonal touches and cozy vibes"
            ],
            "default": [
                "Inviting winter scene with seasonal decor and warm ambiance",
                "Charming cold-weather setting with comfort and style",
                "Cozy winter environment with festive touches and welcoming atmosphere"
            ]
        }
    }'::jsonb
)
WHERE theme_slug LIKE 'winter%'
AND NOT variation_rules ? 'contextual_defaults';

-- ============================================================================
-- Add Context Rules to Input Schemas (for documentation)
-- ============================================================================
UPDATE creative_prompt_templates
SET input_schema = jsonb_set(
    input_schema,
    '{context_rules}',
    '{
        "scene_time": {
            "description": "Time of day that sets lighting and atmosphere",
            "quality_requirement": "Must specify lighting conditions for photorealistic rendering",
            "examples": ["golden hour", "happy hour", "midnight", "sunset"]
        },
        "scene_day": {
            "description": "Day of week that influences crowd energy and social context",
            "quality_requirement": "Must convey temporal context and vibe",
            "examples": ["Friday", "Saturday night", "date night", "game day"]
        },
        "scene_description": {
            "description": "Detailed scene setting that establishes environment and mood",
            "quality_requirement": "Must provide rich visual context for AI generation",
            "examples": ["Vibrant bar interior with warm lighting", "Cozy patio with string lights"]
        }
    }'::jsonb
)
WHERE input_schema ? 'optional'
AND NOT input_schema ? 'context_rules';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the migration worked:
-- SELECT 
--     slug, 
--     input_schema->'defaults' as defaults,
--     input_schema->'context_rules' as context_rules
-- FROM creative_prompt_templates
-- WHERE input_schema ? 'defaults';

-- SELECT 
--     theme_slug,
--     variation_rules->'contextual_defaults' as contextual_defaults
-- FROM creative_prompt_themes
-- WHERE variation_rules ? 'contextual_defaults';
