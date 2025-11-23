-- ============================================================================
-- Migration: Seed Now Hiring Creative Themes & Templates
-- Section: Nano Banana – Talent Acquisition Campaigns
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Selvedge Apron Crew
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'hipster_service',
        'selvedge_apron_crew',
        'Selvedge Apron Crew',
        'Denim apron hiring poster with screen-printed typography.',
        'instagram',
        '{"primary":"#1F3A5F","secondary":"#F7F9FB","accent":"#C08457"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Work Sans"}'::JSONB,
        '["#nowhiring","#baristalife","#joinourcrew"]'::JSONB,
        '{
            "style_adjectives":["raw denim weave","screen print distress","brass hardware","clean cafe lighting"],
            "texture_options":["embroidered edge","leather strap patina","tile grout shadow"],
            "palette_swaps":[["#1F3A5F","#F7F9FB"],["#283C63","#E6E6EA"]],
            "camera_styles":["straight-on apron","macro fabric detail","bright tile backdrop"]
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
    'selvedge_apron_crew',
    'Selvedge Apron Crew',
    'hipster_service',
    'instagram',
    'base',
    $$Close-up of a selvedge denim apron on a subway-tile wall. Distressed white ink reads “{{headline}}” with stacked calls:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  “{{cta_line}}”  Brass rivets, leather straps, and a hanging portafilter put style behind the hiring message.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Selvedge Apron Crew',
    '["denim_apron","screen_print","hipster_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Kitchen Pass Heat Lamp
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'culinary_backline',
        'kitchen_pass_heatlamp',
        'Kitchen Pass Heat Lamp',
        'Grease pencil hiring call written across the stainless pass.',
        'instagram',
        '{"primary":"#FF6B35","secondary":"#FFD166","accent":"#2F4858"}'::JSONB,
        '{"headline":"Anton","body":"Roboto Condensed"}'::JSONB,
        '["#linecooklife","#kitchenpass","#wearehiring"]'::JSONB,
        '{
            "style_adjectives":["heat lamp glow","stainless reflections","china marker wax","service urgency"],
            "texture_options":["smudged marker","finger drag","steam haze"],
            "palette_swaps":[["#FF6B35","#FFD166"],["#F95738","#F4D35E"]],
            "camera_styles":["eye-level pass","shallow depth kitchen","orange flood lighting"]
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
    'kitchen_pass_heatlamp',
    'Kitchen Pass Heat Lamp',
    'culinary_backline',
    'instagram',
    'base',
    $$Eye-level look across a stainless kitchen pass bathed in orange heat lamps. Grease pencil scrawl shouts “{{headline}}” with stacked lines:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  “{{cta_line}}”  Chef motion blur, garnish plates, and hot reflections sell the urgency.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kitchen Pass Heat Lamp',
    '["heatlamp","grease_pencil","linecook_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Empty Tap Handle
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'craft_bar',
        'empty_tap_handle',
        'Empty Tap Handle',
        'Vacant tap handle with hang tag invite for bartenders.',
        'instagram',
        '{"primary":"#8C5E34","secondary":"#F6E0B5","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"League Spartan","body":"Fira Sans"}'::JSONB,
        '["#bartenderwanted","#craftbeerjobs","#taproomteam"]'::JSONB,
        '{
            "style_adjectives":["wood grain","bar bokeh","condensation drip","twine tag"],
            "texture_options":["ink stamp","tag curl","metal sheen"],
            "palette_swaps":[["#8C5E34","#F6E0B5"],["#7A4419","#FFEAC2"]],
            "camera_styles":["low-angle taps","shallow depth bar","warm ambient"]
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
    'empty_tap_handle',
    'Empty Tap Handle',
    'craft_bar',
    'instagram',
    'base',
    $$Low-angle view of a tap lineup with one plain wooden handle. Kraft-tag tied with twine reads “{{headline}}” then lines:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  “{{cta_line}}”  Condensation, bottle bokeh, and wood grain make the open slot impossible to ignore.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Empty Tap Handle',
    '["tap_handle","hang_tag","bartender_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Espresso Grounds Spill
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'coffee_shop',
        'espresso_grounds_spill',
        'Espresso Grounds Spill',
        'Negative-space hiring call carved into fresh espresso grounds.',
        'instagram',
        '{"primary":"#3F2F2F","secondary":"#F7F4F0","accent":"#B88846"}'::JSONB,
        '{"headline":"Archivo Black","body":"Prompt"}'::JSONB,
        '["#baristahiring","#coffeecareers","#wakeuplocal"]'::JSONB,
        '{
            "style_adjectives":["granular grounds","negative space lettering","marble sheen","morning ritual"],
            "texture_options":["bean scatter","tamper mark","pitcher reflection"],
            "palette_swaps":[["#3F2F2F","#F7F4F0"],["#2F1B10","#EFE7DD"]],
            "camera_styles":["top-down macro","studio daylight","coffee tools"]
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
    'espresso_grounds_spill',
    'Espresso Grounds Spill',
    'coffee_shop',
    'instagram',
    'base',
    $$Top-down macro of espresso grounds shaped into bold negative space text. Marble peeks through spelling “{{headline}}” with support lines:  • {{bullet1}}  • {{bullet2}}  “{{cta_line}}”  Milk pitcher, tamper, and stray beans prove this call is for true coffee devotees.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Espresso Grounds Spill',
    '["coffee_grounds","negative_space","barista_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Knife Roll Invitation
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'knife_roll_invitation',
        'Knife Roll Invitation',
        'Vintage knife roll with invitation card in empty slot.',
        'instagram',
        '{"primary":"#6B4226","secondary":"#F2E9E4","accent":"#9A8C98"}'::JSONB,
        '{"headline":"Cinzel","body":"Crimson Text"}'::JSONB,
        '["#hiringchefs","#culinarycareer","#souschefsearch"]'::JSONB,
        '{
            "style_adjectives":["worn leather","blade gleam","butcher block grain","respectful tone"],
            "texture_options":["patina scratch","cardstock bevel","steel reflection"],
            "palette_swaps":[["#6B4226","#F2E9E4"],["#5A3825","#ECE2D0"]],
            "camera_styles":["high-angle knife roll","dramatic lighting","focused composition"]
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
    'knife_roll_invitation',
    'Knife Roll Invitation',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle on a weathered leather knife roll spread across butcher block. A crisp card tucked in the empty slot declares “{{headline}}” with refined lines:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  “{{cta_line}}”  Blade shine and leather patina make the position feel elite.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Knife Roll Invitation',
    '["knife_roll","prestige_hiring","fine_dining_team"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: 86 Board Now Hiring
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'high_volume_kitchen',
        'eighty_six_board',
        '86 Board Now Hiring',
        'Whiteboard 86 list flipped into a gritty hiring shout.',
        'instagram',
        '{"primary":"#FFFFFF","secondary":"#4A5568","accent":"#E53E3E"}'::JSONB,
        '{"headline":"Permanent Marker","body":"Montserrat"}'::JSONB,
        '["#kitchenculture","#86badattitudes","#cookwanted"]'::JSONB,
        '{
            "style_adjectives":["dry erase ghosting","fluorescent glare","marker urgency","back-of-house grit"],
            "texture_options":["towel drape","tape residue","smudge trail"],
            "palette_swaps":[["#FFFFFF","#E53E3E"],["#F7FAFC","#C53030"]],
            "camera_styles":["medium shot board","green fluorescent","handwritten chaos"]
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
    'eighty_six_board',
    '86 Board Now Hiring',
    'high_volume_kitchen',
    'instagram',
    'base',
    $$Medium shot of a smudged kitchen whiteboard under fluorescent glare. Blue and red marker list “{{headline}}” followed by lines:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  “{{cta_line}}”  Crossed-out menu items, grease smears, and towel drape prove it is straight from the line.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    '86 Board Now Hiring',
    '["whiteboard","back_of_house","gritty_hiring"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================

