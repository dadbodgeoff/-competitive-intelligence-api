-- ============================================================================
-- Migration: Seed Social Proof Creative Themes & Templates (Part 2)
-- Section: Nano Banana – Social Proof Review Showcases
-- Created: 2025-11-22
-- ============================================================================

-- Theme 7: Stapled Receipt
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'takeout',
        'stapled_receipt',
        'Stapled Receipt',
        'Takeout bag receipt highlighting delivery obsession.',
        'instagram',
        '{"primary":"#D4A373","secondary":"#FFECD6","accent":"#2F2F2F"}'::JSONB,
        '{"headline":"Space Mono","body":"Manrope"}'::JSONB,
        '["#takeoutlife","#bagdrop","#ghostkitchen"]'::JSONB,
        '{
            "style_adjectives":["kraft paper fiber","metal staple tension","harsh pass lighting","order stack urgency"],
            "texture_options":["staple pinch","receipt curl","paper fiber"],
            "palette_swaps":[["#D4A373","#2F2F2F"],["#C58940","#1F1F1F"]],
            "camera_styles":["macro bag top","kitchen pass lighting","shallow depth focus"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'stapled_receipt',
    'Stapled Receipt',
    'takeout',
    'instagram',
    'base',
    $$Macro view of a folded kraft takeout bag stapled with a thermal receipt. Text in the review section reads “{{headline}}” then stacked lines:  • {{quote_line1}}  • {{quote_line2}}  • {{quote_line3}}  “{{attribution}}”  Metal deformation, bag fibers, and blurred pickup stack scream delivery demand.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Stapled Receipt',
    '["takeout_bag","staple_detail","delivery_hype"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","quote_line3","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 8: Soggy Coaster
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'brewery',
        'soggy_coaster',
        'Soggy Coaster',
        'Beer coaster scribbled review with condensation ring.',
        'instagram',
        '{"primary":"#6C4A31","secondary":"#E1C699","accent":"#2E2A24"}'::JSONB,
        '{"headline":"Brandon Grotesque","body":"Source Sans Pro"}'::JSONB,
        '["#brewerylife","#localsonly","#pubvibes"]'::JSONB,
        '{
            "style_adjectives":["wet cardboard","ink bleed","amber bar light","woodgrain scuffs"],
            "texture_options":["condensation ring","pen pressure","salt scatter"],
            "palette_swaps":[["#6C4A31","#E1C699"],["#5B3A2A","#F2DEC6"]],
            "camera_styles":["top-down coaster","moody bar lighting","macro detail"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'soggy_coaster',
    'Soggy Coaster',
    'brewery',
    'instagram',
    'base',
    $$Top-down of a damp cardboard coaster with a fresh condensation ring. Blue pen scrawl reads “{{headline}}” with following lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Ink bleed, peanuts, and amber bar glow prove the new regulars are hooked.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Soggy Coaster',
    '["beer_coaster","ink_bleed","bar_top"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 9: Crayon Tablecloth
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'family_dining',
        'crayon_tablecloth',
        'Crayon Tablecloth',
        'Child-drawn crayon review on butcher paper table cover.',
        'instagram',
        '{"primary":"#F4F1DE","secondary":"#FFB4A2","accent":"#2A9D8F"}'::JSONB,
        '{"headline":"Comic Neue","body":"KG Primary Penmanship"}'::JSONB,
        '["#familydinner","#kidapproved","#pizzanight"]'::JSONB,
        '{
            "style_adjectives":["wax buildup","paper grain","playful mess","family warmth"],
            "texture_options":["crayon smear","crumb scatter","glass condensation"],
            "palette_swaps":[["#F4F1DE","#FFB4A2"],["#FFF1E6","#F7A399"]],
            "camera_styles":["table-level kid art","bright dining light","macro crayon"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'crayon_tablecloth',
    'Crayon Tablecloth',
    'family_dining',
    'instagram',
    'base',
    $$Eye-level focus on butcher paper covered in waxy crayon praise. Child handwriting shouts “{{headline}}” with playful lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Scattered crayons, chocolate milk glass, and bright lighting make family approval feel tangible.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Crayon Tablecloth',
    '["kid_crayon","family_energy","butcher_paper"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 10: Sidewalk Chalk Masterpiece
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'foot_traffic',
        'sidewalk_chalk_masterpiece',
        'Sidewalk Chalk Masterpiece',
        'Sidewalk chalk review pointing pedestrians into the shop.',
        'instagram',
        '{"primary":"#F8C4FF","secondary":"#8BE9FD","accent":"#FFEE93"}'::JSONB,
        '{"headline":"Chalkboard","body":"Montserrat Alternates"}'::JSONB,
        '["#curbappeal","#sidewalksign","#donutdrop"]'::JSONB,
        '{
            "style_adjectives":["concrete grain","chalk dust","sun-cast shadow","street leaf"],
            "texture_options":["chalk particles","footprint smudge","fallen leaf"],
            "palette_swaps":[["#F8C4FF","#FFEE93"],["#FFD6E0","#C8F7FF"]],
            "camera_styles":["top-down sidewalk","high noon shadow","street vignette"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'sidewalk_chalk_masterpiece',
    'Sidewalk Chalk Masterpiece',
    'foot_traffic',
    'instagram',
    'base',
    $$High-angle view of sunlit sidewalk chalk art outside the entrance. Vibrant lettering commands “{{headline}}” with supportive lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Concrete grain, chalk dust, leaf drift, and viewer shadow stop foot traffic cold.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Sidewalk Chalk Masterpiece',
    '["sidewalk_chalk","curbside","foot_traffic"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 11: Bakery String Tag
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bakery',
        'bakery_string_tag',
        'Bakery String Tag',
        'Gift tag review attached to pastry box with twine.',
        'instagram',
        '{"primary":"#F7CAD0","secondary":"#F8EDEB","accent":"#C9184A"}'::JSONB,
        '{"headline":"Allura","body":"Quicksand"}'::JSONB,
        '["#sweetgift","#officetreat","#croissantcrush"]'::JSONB,
        '{
            "style_adjectives":["twine fibers","tag shadow","marble counter","display case glow"],
            "texture_options":["felt-tip strokes","twine fray","box fold"],
            "palette_swaps":[["#F7CAD0","#C9184A"],["#FAD2E1","#FF4D6D"]],
            "camera_styles":["macro tag","soft pastry light","shallow depth"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'bakery_string_tag',
    'Bakery String Tag',
    'bakery',
    'instagram',
    'base',
    $$Macro focus on a pastel pastry box tied with red-and-white baker’s twine. Dangling tag reads “{{headline}}” with lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Twine fibers, marble counter, and pastry case bokeh make the review the perfect gift.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bakery String Tag',
    '["bakers_twine","gift_tag","pastry_box"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 12: Bathroom Mirror Selfie
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'nightlife',
        'bathroom_mirror_selfie',
        'Bathroom Mirror Selfie',
        'Mirror selfie review written in lipstick with nightlife reflection.',
        'instagram',
        '{"primary":"#FF4F8B","secondary":"#1F1B2C","accent":"#9C89FF"}'::JSONB,
        '{"headline":"Marker Felt","body":"Montserrat"}'::JSONB,
        '["#vibesimmaculate","#nightout","#ugcenergy"]'::JSONB,
        '{
            "style_adjectives":["lipstick streak","mirror ghosting","flash flare","graffiti ambience"],
            "texture_options":["lip print","tile reflection","red neon"],
            "palette_swaps":[["#FF4F8B","#9C89FF"],["#FF006E","#845EC2"]],
            "camera_styles":["portrait mirror","flash pop","bathroom graffiti"]
        }'::JSONB
    )
    RETURNING id
)
INSERT INTO creative_prompt_templates (
    id, account_id, slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active, metadata,
    created_by, created_at, updated_at, theme_id, display_name,
    variation_tags, input_schema
)
SELECT
    uuid_generate_v4(),
    NULL,
    'bathroom_mirror_selfie',
    'Bathroom Mirror Selfie',
    'nightlife',
    'instagram',
    'base',
    $$Portrait mirror selfie scene framed by graffiti tile. Lipstick lettering on glass yells “{{headline}}” with vibrant lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Flash flare, reflection ghosting, and neon spill prove the vibe is viral.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bathroom Mirror Selfie',
    '["mirror_selfie","lipstick_text","nightlife_vibe"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================

