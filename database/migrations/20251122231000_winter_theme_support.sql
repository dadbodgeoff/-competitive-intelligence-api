-- ============================================================================
-- Migration: Seed Winter / Holiday Creative Themes & Templates
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Snow Day Sidewalk Chalkboard
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'gastropub',
        'snow_day_sidewalk',
        'Snow Day Sidewalk Chalkboard',
        'Powder-dusted A-frame chalkboards on wintry sidewalks.',
        'instagram',
        '{"primary":"#0F4C75","secondary":"#3282B8","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Open Sans"}'::JSONB,
        '["#snowday","#wintermenu","#cozyvibes"]'::JSONB,
        '{
            "style_adjectives":["powder snow","frosty air","chalk texture","street vignette"],
            "texture_options":["snow drift","chalk dust","wet wood grain"],
            "palette_swaps":[["#0F4C75","#FFFFFF"],["#1B262C","#BBE1FA"]],
            "camera_styles":["low-angle sidewalk","street candid","soft overcast"]
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
    'snow_day_sidewalk',
    'Snow Day Sidewalk',
    'gastropub',
    'instagram',
    'base',
    $$Low-angle photo of a rustic wooden A-frame chalkboard partly buried in fresh powder. Pastel icy-blue and white chalk announce “{{headline}}” with specials:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Snow stacks on the sign frame while blurred winter boots pass behind under soft, overcast daylight.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Snow Day Sidewalk',
    '["chalkboard","snow_drift","street_scene"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Frosted Window Warmers
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'gastropub',
        'frosted_window_warmers',
        'Frosted Window Warmers',
        'Frost-traced windows glowing with interior warmth.',
        'instagram',
        '{"primary":"#1C3144","secondary":"#F2A65A","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Playfair Display","body":"Lato"}'::JSONB,
        '["#winterwarmers","#fireside","#comfortdrinks"]'::JSONB,
        '{
            "style_adjectives":["window frost","amber glow","snowfall bokeh","cozy contrast"],
            "texture_options":["fern frost","condensation","marker glow"],
            "palette_swaps":[["#1C3144","#F2A65A"],["#243B53","#F7B801"]],
            "camera_styles":["eye-level window","through-glass focus","snow foreground"]
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
    'frosted_window_warmers',
    'Frosted Window Warmers',
    'gastropub',
    'instagram',
    'base',
    $$Eye-level view from outside a snow-dusted window. Intricate ice fern patterns frame white window-marker lettering reading “{{headline}}” with cozy bites:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Snowflakes blur in front while a golden fireplace and bundled guests glow inside.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Frosted Window Warmers',
    '["window_frost","amber_glow","snowfall"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Seasonal Spice Dust
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'coffeehouse',
        'seasonal_spice_dust',
        'Seasonal Spice Dust',
        'Cocoa and cinnamon stenciled lettering on walnut counters.',
        'instagram',
        '{"primary":"#533E2D","secondary":"#C4723C","accent":"#F3E9DC"}'::JSONB,
        '{"headline":"Quincy CF","body":"Josefin Sans"}'::JSONB,
        '["#seasonalsips","#cafelife","#warmspice"]'::JSONB,
        '{
            "style_adjectives":["spice dust","warm grain","macro aroma","negative space"],
            "texture_options":["cinnamon shadow","stencil crisp","steam curl"],
            "palette_swaps":[["#533E2D","#F3E9DC"],["#3D2C2E","#E6C79C"]],
            "camera_styles":["top-down macro","moody cafe","steam highlight"]
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
    'seasonal_spice_dust',
    'Seasonal Spice Dust',
    'coffeehouse',
    'instagram',
    'base',
    $$Top-down macro of a walnut counter dusted in cocoa and cinnamon. Negative space lettering reveals the wood, spelling “{{headline}}” with seasonal sips:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Cinnamon sticks, star anise, and a steaming mug frame the warm, moody composition.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Seasonal Spice Dust',
    '["spice_dust","macro","warm_mood"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Fireside Slate Hearth
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'fireside_slate_hearth',
        'Fireside Slate Hearth',
        'Slate hearth lettering flickering under fireplace glow.',
        'instagram',
        '{"primary":"#3B3C36","secondary":"#D08C60","accent":"#F4E3CF"}'::JSONB,
        '{"headline":"Cormorant Garamond","body":"Source Sans Pro"}'::JSONB,
        '["#firesidedining","#cozyevenings","#wintermenu"]'::JSONB,
        '{
            "style_adjectives":["ember glow","chalk soot","wool texture","plaid accent"],
            "texture_options":["sooty chalk","fire bokeh","hearth stone"],
            "palette_swaps":[["#3B3C36","#D08C60"],["#2F2F2F","#E0A371"]],
            "camera_styles":["eye-level hearth","shallow depth","firelight flicker"]
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
    'fireside_slate_hearth',
    'Fireside Slate Hearth',
    'fine_dining',
    'instagram',
    'base',
    $$Eye-level focus on a dark slate hearth glowing from a roaring fireplace behind. Sooty white chalk writes “{{headline}}” with elevated courses:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Sparks drift in bokeh while a plaid wool throw and leather arm rest set a luxe, cozy tone.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Fireside Slate Hearth',
    '["hearth","firelight","luxury_cozy"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Winter Copper Cocktail
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cocktail_bar',
        'winter_copper_cocktail',
        'Winter Copper Cocktail',
        'Frost-etched copper mugs with festive garnish and fairy lights.',
        'instagram',
        '{"primary":"#7A4419","secondary":"#B34747","accent":"#F5F3EE"}'::JSONB,
        '{"headline":"Montserrat","body":"PT Sans"}'::JSONB,
        '["#wintercocktails","#moscowmule","#holidaybar"]'::JSONB,
        '{
            "style_adjectives":["copper frost","rosemary twinkle","condensation beads","festive bokeh"],
            "texture_options":["iced copper","etched lettering","sugar cranberry"],
            "palette_swaps":[["#7A4419","#F5F3EE"],["#8C5A2E","#F2D0A4"]],
            "camera_styles":["macro mug","shallow bar top","fairy light blur"]
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
    'winter_copper_cocktail',
    'Winter Copper Cocktail',
    'cocktail_bar',
    'instagram',
    'base',
    $$Extreme close-up of a hammered copper mug glazed with frost and droplets. Frost-etched lettering spells “{{headline}}” with signature drinks:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  Garnished with rosemary and sugared cranberries, fairy lights sparkle in the blurred background for a crisp holiday bar vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Winter Copper Cocktail',
    '["copper_mug","frost_etch","holiday_bar"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: Velvet Gala Menu
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'velvet_gala_menu',
        'Velvet Gala Menu',
        'Emerald velvet menus with gold foil emboss under candlelight.',
        'instagram',
        '{"primary":"#0B3D2E","secondary":"#C9A227","accent":"#F7F4EA"}'::JSONB,
        '{"headline":"Cinzel","body":"Work Sans"}'::JSONB,
        '["#holidaygala","#luxedining","#celebration"]'::JSONB,
        '{
            "style_adjectives":["velvet sheen","foil gleam","candle shadow","champagne sparkle"],
            "texture_options":["emboss glow","velvet pile","glass refraction"],
            "palette_swaps":[["#0B3D2E","#C9A227"],["#123524","#E5C07B"]],
            "camera_styles":["high-angle menu","macro texture","soft candlelight"]
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
    'velvet_gala_menu',
    'Velvet Gala Menu',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle close-up of an emerald velvet menu cover on white linen. Metallic gold foil embossing reads “{{headline}}” with event highlights:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Candlelit shadows, a crystal flute, and gleaming silverware create a luxurious celebration.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Velvet Gala Menu',
    '["velvet","gold_foil","gala"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================

