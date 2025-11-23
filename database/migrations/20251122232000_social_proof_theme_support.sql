-- ============================================================================
-- Migration: Seed Social Proof Creative Themes & Templates (Part 1)
-- Section: Nano Banana – Social Proof Review Showcases
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Kitchen Ticket Spike
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fast_casual',
        'kitchen_ticket_spike',
        'Kitchen Ticket Spike',
        'Thermal receipt review highlight on a back-of-house order spike.',
        'instagram',
        '{"primary":"#F2A65A","secondary":"#E4E9F7","accent":"#2B2D42"}'::JSONB,
        '{"headline":"Roboto Mono","body":"Inter"}'::JSONB,
        '["#burgerlife","#kitchenrush","#servicelegend"]'::JSONB,
        '{
            "style_adjectives":["thermal paper texture","heat lamp glow","stainless steel reflections","busy kitchen energy"],
            "texture_options":["grease stain translucency","dot matrix ink","wrinkled receipt"],
            "palette_swaps":[["#F2A65A","#2B2D42"],["#F77F00","#343A40"]],
            "camera_styles":["macro spike","shallow depth kitchen","warm back-of-house lighting"]
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
    'kitchen_ticket_spike',
    'Kitchen Ticket Spike',
    'fast_casual',
    'instagram',
    'base',
    $$Macro shot of a stainless order spike holding a crumpled thermal receipt. Dot-matrix print proclaims “{{headline}}” with bullet review quotes:  • {{quote_line1}}  • {{quote_line2}}  • {{quote_line3}}  “{{attribution}}”  Heat lamp glow, chef motion blur, and grease translucency prove the kitchen stays slammed.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kitchen Ticket Spike',
    '["thermal_receipt","order_spike","heat_lamp"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","quote_line3","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Guest Check Leather Folder
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'guest_check_leather',
        'Guest Check Leather Folder',
        'Handwritten praise on a leather guest check with candlelit ambiance.',
        'instagram',
        '{"primary":"#1F1A17","secondary":"#C59D5F","accent":"#F7EBDA"}'::JSONB,
        '{"headline":"Playfair Display","body":"Cormorant Garamond"}'::JSONB,
        '["#finedining","#chefskiss","#date_night"]'::JSONB,
        '{
            "style_adjectives":["leather grain","ballpoint sheen","candle glow","tabletop luxury"],
            "texture_options":["pen pressure indent","mint wrapper shine","linen fold shadow"],
            "palette_swaps":[["#1F1A17","#C59D5F"],["#2B211A","#DAB785"]],
            "camera_styles":["high-angle check presenter","romantic lighting","shallow depth table"]
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
    'guest_check_leather',
    'Guest Check Leather Folder',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle POV of an open black leather guest check on white linen. Blue ink handwriting gushes: “{{headline}}” next lines:  • {{quote_line1}}  • {{quote_line2}}  • {{quote_line3}}  “{{attribution}}”  Chocolate mint wrapper, credit card glint, and candlelit shadows sell refined gratitude.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Guest Check Leather Folder',
    '["leather_presenter","handwritten_note","candlelight"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","quote_line3","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Neon Brick Quote
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'nightlife',
        'neon_brick_quote',
        'Neon Brick Quote',
        'Custom neon review signage glowing against distressed brick.',
        'instagram',
        '{"primary":"#FF2EC6","secondary":"#38DFFF","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"Neon Tubes","body":"Futura"}'::JSONB,
        '["#neonnight","#clubreviews","#gastropubglow"]'::JSONB,
        '{
            "style_adjectives":["neon emission","brick patina","nightlife glow","plant silhouettes"],
            "texture_options":["painted brick flake","neon halo","shadowed mortar"],
            "palette_swaps":[["#FF2EC6","#38DFFF"],["#FF006E","#70E1FF"]],
            "camera_styles":["eye-level wall","ambient bar lighting","neon focus"]
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
    'neon_brick_quote',
    'Neon Brick Quote',
    'nightlife',
    'instagram',
    'base',
    $$Eye-level shot of a distressed white brick wall lit by custom neon. Electric tubing spells “{{headline}}” then stacked lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Glowing colors halo mortar cracks while monstera leaves catch the light, proving the vibe matches the hype.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Neon Brick Quote',
    '["neon_sign","brick_texture","nightlife"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Tip Jar Sticky Note
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'coffee_shop',
        'tip_jar_sticky',
        'Tip Jar Sticky Note',
        'Tip jar review taped to glass with morning café energy.',
        'instagram',
        '{"primary":"#F7B267","secondary":"#FFE9A0","accent":"#4A4E69"}'::JSONB,
        '{"headline":"Cabin Sketch","body":"Poppins"}'::JSONB,
        '["#coffeeshoplove","#baristamagic","#morningcrowd"]'::JSONB,
        '{
            "style_adjectives":["glass refraction","cash clutter","sunlit counter","handwritten tape"],
            "texture_options":["masking tape peel","sharpie bleed","coin shine"],
            "palette_swaps":[["#F7B267","#4A4E69"],["#F8E16C","#2F3E46"]],
            "camera_styles":["close-up jar","bright window light","espresso blur"]
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
    'tip_jar_sticky',
    'Tip Jar Sticky Note',
    'coffee_shop',
    'instagram',
    'base',
    $$Close-up of a tip jar stuffed with cash and coins on a wood counter. Peeling tape note shouts “{{headline}}” with stacked review lines:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Morning sun, espresso blur, and marker strokes make the praise feel spontaneous.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Tip Jar Sticky Note',
    '["tip_jar","sharpie_note","morning_light"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Letter Board Announcement
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'brunch_spot',
        'letter_board_announcement',
        'Letter Board Announcement',
        'Felt groove board showcasing rave brunch review.',
        'instagram',
        '{"primary":"#1C1E26","secondary":"#F0D9B5","accent":"#6C757D"}'::JSONB,
        '{"headline":"Cooper Hewitt","body":"Avenir"}'::JSONB,
        '["#brunchclub","#feltboard","#instaflex"]'::JSONB,
        '{
            "style_adjectives":["felt texture","plastics letters","styled flatlay","soft studio light"],
            "texture_options":["letter misalignment","dust motes","frame grain"],
            "palette_swaps":[["#1C1E26","#F0D9B5"],["#2E313B","#FFE8D6"]],
            "camera_styles":["flatlay square","minimalist styling","diffused lighting"]
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
    'letter_board_announcement',
    'Letter Board Announcement',
    'brunch_spot',
    'instagram',
    'base',
    $$Straight-on flatlay of a black felt letter board framed in oak. White plastic letters rave: line1 “{{headline}}” line2 “{{quote_line1}}” line3 “{{quote_line2}}” line4 “{{attribution}}”. Succulent, sunglasses, and soft influencer lighting turn the review into instant social proof.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Letter Board Announcement',
    '["felt_board","flatlay","influencer_style"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: Reserved Table Tent
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'wine_bar',
        'reserved_table_tent',
        'Reserved Table Tent',
        'Elegant reservation card featuring heartfelt service review.',
        'instagram',
        '{"primary":"#F7F1E5","secondary":"#C0896C","accent":"#3D2C29"}'::JSONB,
        '{"headline":"Didot","body":"Libre Baskerville"}'::JSONB,
        '["#vipservice","#anniversarydinner","#tableset"]'::JSONB,
        '{
            "style_adjectives":["matte cardstock","gold trim","bokeh dining room","low-angle hero"],
            "texture_options":["foil glint","glass refraction","table linen"],
            "palette_swaps":[["#F7F1E5","#C0896C"],["#FFF5E1","#B17E5D"]],
            "camera_styles":["low-angle tent card","warm bokeh","shallow depth focus"]
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
    'reserved_table_tent',
    'Reserved Table Tent',
    'wine_bar',
    'instagram',
    'base',
    $$Low-angle close-up of a cream cardstock tent with gold trim. Elegant serif lines read “{{headline}}” followed by:  • {{quote_line1}}  • {{quote_line2}}  “{{attribution}}”  Crystal glass stems, warm bokeh guests, and perfect focus signal VIP treatment.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Reserved Table Tent',
    '["table_tent","vip_vibes","gold_trim"]'::JSONB,
    '{
        "required": ["headline","quote_line1","quote_line2","attribution"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================

