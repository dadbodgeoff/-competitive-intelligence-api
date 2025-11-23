-- ============================================================================
-- Migration: Seed Winter / Holiday Creative Themes & Templates (Part 2)
-- Created: 2025-11-22
-- ============================================================================

-- Theme 7: Powdered Brownie Snowfall
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bakery',
        'powdered_brownie_snowfall',
        'Powdered Brownie Snowfall',
        'Powdered sugar stenciled lettering over decadent brownie stacks.',
        'instagram',
        '{"primary":"#2B1B17","secondary":"#FFFFFF","accent":"#C7A27C"}'::JSONB,
        '{"headline":"Grand Hotel","body":"Nunito"}'::JSONB,
        '["#holidaydesserts","#sweetseason","#bakerymagic"]'::JSONB,
        '{
            "style_adjectives":["powder sugar","brownie gloss","warm kitchen","sparkle bokeh"],
            "texture_options":["sugar stencil","fudge sheen","cooling rack"],
            "palette_swaps":[["#2B1B17","#FFFFFF"],["#3C2720","#F5E6CA"]],
            "camera_styles":["top-down dessert","macro crumb","warm kitchen blur"]
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
    'powdered_brownie_snowfall',
    'Powdered Brownie Snowfall',
    'bakery',
    'instagram',
    'base',
    $$Top-down macro of a brownie stack on a cooling rack blanketed in powdered sugar. Stenciled negative space reveals “{{headline}}” with sweet treats:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  A sugar sifter and cocoa station blur softly in the warm holiday kitchen background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Powdered Brownie Snowfall',
    '["powder_sugar","brownie_stack","holiday_treats"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 8: Enamel Pot Steam
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'comfort_food',
        'enamel_pot_steam',
        'Enamel Pot Steam',
        'Glossy dutch ovens with steam plumes and homey reflections.',
        'instagram',
        '{"primary":"#B3171E","secondary":"#F1C27D","accent":"#F8F5F1"}'::JSONB,
        '{"headline":"Alegreya Sans SC","body":"Karla"}'::JSONB,
        '["#soupszn","#comfortfood","#winterkitchen"]'::JSONB,
        '{
            "style_adjectives":["gloss enamel","steam plume","home kitchen","rustic loaf"],
            "texture_options":["marker on enamel","steam blur","wood tabletop"],
            "palette_swaps":[["#B3171E","#F1C27D"],["#9E1C21","#F0D1A4"]],
            "camera_styles":["high-angle pot","steam glow","homey vignette"]
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
    'enamel_pot_steam',
    'Enamel Pot Steam',
    'comfort_food',
    'instagram',
    'base',
    $$High-angle view of a bright enamel dutch oven with the lid ajar, releasing thick steam. White grease marker contrasts on the glossy lid with “{{headline}}” and hearty comforts:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  A ladle, crusty bread, and window reflection complete the homestyle winter vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Enamel Pot Steam',
    '["enamel_pot","steam","comfort"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 9: Roasted Root Parchment
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'farm_to_table',
        'roasted_root_parchment',
        'Roasted Root Parchment',
        'Oil-stained parchment with marker menu amid roasted winter veggies.',
        'instagram',
        '{"primary":"#8C4A2F","secondary":"#D8A657","accent":"#F6E7CB"}'::JSONB,
        '{"headline":"Amatic SC","body":"Merriweather"}'::JSONB,
        '["#winterharvest","#farmtotable","#rootveggies"]'::JSONB,
        '{
            "style_adjectives":["roast caramel","oil stains","herb scatter","sheet pan glow"],
            "texture_options":["parchment grease","marker bleed","char edges"],
            "palette_swaps":[["#8C4A2F","#D8A657"],["#854D0E","#F2CC8F"]],
            "camera_styles":["overhead sheet pan","food styling","warm kitchen light"]
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
    'roasted_root_parchment',
    'Roasted Root Parchment',
    'farm_to_table',
    'instagram',
    'base',
    $$Overhead sheet pan of caramelized winter root vegetables on oil-stained parchment. Black marker scrawl on a clear patch reads “{{headline}}” with farm-fresh dishes:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Herbs, charred edges, and honeyed light emphasize rustic freshness.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Roasted Root Parchment',
    '["parchment","root_veg","farmhouse"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 10: Ice Rink Scrape
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'sports_bar',
        'ice_rink_scrape',
        'Ice Rink Scrape',
        'Carved lettering in scarred ice with arena lighting.',
        'instagram',
        '{"primary":"#0B132B","secondary":"#1C2541","accent":"#5BC0BE"}'::JSONB,
        '{"headline":"Anton","body":"Roboto"}'::JSONB,
        '["#gamenight","#hockeybar","#sportsfans"]'::JSONB,
        '{
            "style_adjectives":["scarred ice","arena blue","frost shavings","cold intensity"],
            "texture_options":["ice carve","blade scratch","puck mark"],
            "palette_swaps":[["#0B132B","#5BC0BE"],["#1B1B2F","#00A8E8"]],
            "camera_styles":["macro ice surface","top-down rink","cool spotlight"]
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
    'ice_rink_scrape',
    'Ice Rink Scrape',
    'sports_bar',
    'instagram',
    'base',
    $$Extreme close-up of a frozen rink surface etched with skate scratches. Deeply carved letters announce “{{headline}}” with arena-ready deals:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Ice shavings pile along the grooves while a puck and cool arena lights frame the scene.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Ice Rink Scrape',
    '["ice_carve","arena_light","sports"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 11: Wood Burner Brand
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'ski_lodge',
        'wood_burner_brand',
        'Wood Burner Brand',
        'Branded wood slices with char smoke and lodge ambiance.',
        'instagram',
        '{"primary":"#5A3825","secondary":"#A47149","accent":"#F2E2CE"}'::JSONB,
        '{"headline":"Rye","body":"Cabin"}'::JSONB,
        '["#mountainlodge","#apresski","#woodfire"]'::JSONB,
        '{
            "style_adjectives":["char edge","pine grain","smoke wisp","plaid warmth"],
            "texture_options":["wood brand","charcoal ash","lantern glow"],
            "palette_swaps":[["#5A3825","#A47149"],["#4E342E","#D7B899"]],
            "camera_styles":["macro wood slice","tabletop lodge","warm rustic"]
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
    'wood_burner_brand',
    'Wood Burner Brand',
    'ski_lodge',
    'instagram',
    'base',
    $$Macro shot of a pine log slice used as a coaster, freshly branded with dark lettering reading “{{headline}}” alongside mountain fare:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  A wisp of smoke trails upward while an axe handle, lantern, and plaid cloth blur in the lodge background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Wood Burner Brand',
    '["wood_brand","lodge","smoke_wisp"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 12: Custom Creator Lab
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cross_vertical',
        'custom_creator_lab',
        'Custom Creator Lab',
        'Guided freeform builder that pairs best-practice tips with open creative space.',
        'instagram',
        '{"primary":"#3A7CA5","secondary":"#F4F1DE","accent":"#81B29A"}'::JSONB,
        '{"headline":"Playfair Display","body":"DM Sans"}'::JSONB,
        '["#creativebrief","#brandvoice","#storyfirst"]'::JSONB,
        '{
            "style_adjectives":["story-driven","human voice","hero focus","texture-rich"],
            "texture_options":["soft light leak","handwritten accent","motion blur","grain overlay"],
            "palette_swaps":[["#3A7CA5","#F4F1DE"],["#81B29A","#F2CC8F"]],
            "camera_styles":["flexible POV","macro detail","lifestyle wide","flat lay hybrid"]
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
    'custom_creator_lab',
    'Custom Creator Lab',
    'cross_vertical',
    'instagram',
    'base',
    $$Headline: {{headline}}

Scene Overview: {{scene_description}}

Hero Elements: {{hero_items}}

Lighting & Mood: {{lighting_mood}}

CTA: {{cta_line}}

Optional Notes: {{supporting_props}}$$,
    'v1',
    TRUE,
    '{
        "guidance_blocks": [
            {
                "title": "Creative Framework",
                "bullets": [
                    "Anchor one hero subject or dish before layering atmosphere.",
                    "Pair a sensory cue with each visual detail you add.",
                    "Reserve space for a clear CTA with an action verb."
                ]
            },
            {
                "title": "Voice & Tone Reminders",
                "bullets": [
                    "Keep sentences active and precise; swap generic adjectives for specifics.",
                    "Blend brand voice keywords with seasonal or local references.",
                    "Mention lighting and environment so the generator can stage the scene."
                ]
            }
        ],
        "quick_start_prompts": [
            {
                "label": "Product Spotlight",
                "template": "Headline: {{headline}}\\nScene: Describe the hero product on its stage with lighting.\\nDetails: Note two supporting props or textures.\\nCTA: {{cta_line}}"
            },
            {
                "label": "Lifestyle Story",
                "template": "Headline: {{headline}}\\nMoment: Explain who is in the scene and what they are doing.\\nSetting: Outline environment, lighting, and mood.\\nCTA: {{cta_line}}"
            }
        ],
        "ui": {
            "show_guided_toggle": true,
            "default_palette_suggestions": ["neon night", "soft neutral", "high contrast"],
            "default_font_suggestions": ["Playfair Display", "Montserrat", "DM Sans"]
        }
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Custom Creator Lab',
    '["custom","guided","freeform"]'::JSONB,
    '{
        "required": ["headline","scene_description","hero_items","lighting_mood","cta_line"],
        "optional": ["supporting_props","color_palette","tone_keywords","camera_notes","texture_focus"],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Social Proof Scene Builder
-- ============================================================================
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cross_vertical',
        'social_proof_scene_builder',
        'Social Proof Scene Builder',
        'Transforms customer reviews into immersive visual scenes that feel earned, tactile, and proudly displayed.',
        'instagram',
        '{"primary":"#F7D488","secondary":"#1F2933","accent":"#EF5D60"}'::JSONB,
        '{"headline":"Playfair Display","body":"DM Sans"}'::JSONB,
        '["#socialproof","#earnedpraise","#scrollstopper"]'::JSONB,
        '{
            "style_adjectives":["earned","tactile","scene-driven","authentic brag"],
            "texture_options":["thermal paper","leather sheen","felt board","neon glass","chalk dust","wet cardstock"],
            "palette_swaps":[["#F7D488","#1F2933"],["#EF5D60","#0F172A"]],
            "camera_styles":["macro product proof","lifestyle POV","hero close-up","low depth of field"]
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
    $$Extreme close-up macro of a stainless order spike piercing a crumpled thermal receipt mid-rush. The printed header screams “{{headline_text}}” with the kitchen shorthand review:
 • {{line_one}}
 • {{line_two}}
 • {{line_three}}
 “{{signature}}”
Heat-lamp glow and blurred chef motion prove the line is slammed while pride drips off the spike. Grease translucency detail: {{ambient_detail}}$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Back-of-house flex that shows reviews live on the line.",
        "recommended_usage": ["burger joints","diners","high-volume kitchens"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kitchen Ticket Spike',
    '["social_proof","thermal_receipt","back_of_house"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","line_three","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    'Guest Check Leather',
    'fine_dining',
    'instagram',
    'base',
    $$High-angle POV over a tuxedoed table: a black leather guest check presenter lies open on crisp linen. The merchant copy gleams with handwritten ink reading “{{headline_text}}” followed by:
 • {{line_one}}
 • {{line_two}}
 • {{line_three}}
 “{{signature}}”
A foil-wrapped chocolate mint, card edge, and candlelit reflections deliver the upscale thank-you energy guests brag about.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Fine dining gratitude captured in leather and candlelight.",
        "recommended_usage": ["steakhouses","Italian","date-night venues"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Guest Check Leather',
    '["social_proof","guest_check","romantic"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","line_three","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    $$Eye-level in a dim bar, the painted brick wall glows with custom neon bending the review into light: “{{headline_text}}” stacked with {{line_one}}, {{line_two}}, and “{{signature}}”. Hot pink and cyan illumination wraps mortar cracks, monstera leaves, and bar glass reflections so the praise literally lights the room.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Nightlife testimonial immortalized as bespoke neon signage.",
        "recommended_usage": ["bars","clubs","gastropubs"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Neon Brick Quote',
    '["social_proof","neon_sign","nightlife"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    'tip_jar_sticky_note',
    'Tip Jar Sticky Note',
    'cafe',
    'instagram',
    'base',
    $$Counter-level close-up of an overstuffed glass tip jar, bills crumpled against the glass. A taped note scrawled in bold Sharpie reads “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Sunlit espresso blur and peeling tape corners prove the love is spontaneous and real.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Counter-service praise that feels handwritten and immediate.",
        "recommended_usage": ["cafes","bakeries","coffee trailers"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Tip Jar Sticky Note',
    '["social_proof","tip_jar","counter_service"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    $$Straight-on hero of a dusty felt letter board framed in oak. White plastic letters slot in to proclaim “{{headline_text}}”, {{line_one}}, {{line_two}}, and “{{signature}}”. Styled props like {{ambient_detail}} finish the influencer-perfect arrangement that makes the review photo-ready.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Instagram-ready letter board featuring fan devotion.",
        "recommended_usage": ["brunch cafes","boutiques","lifestyle concepts"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Letter Board Announcement',
    '["social_proof","letter_board","flat_lay"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    'fine_dining',
    'instagram',
    'base',
    $$Low-angle focus on a cream cardstock table tent with gold trim reading “{{headline_text}}” and lines {{line_one}}, {{line_two}}, plus “{{signature}}”. Crystal stems, soft bokeh service, and warm sconces blur behind to prove the table is held for those who rave.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "VIP reservation energy framed as gratitude signage.",
        "recommended_usage": ["wine bars","bistros","anniversary venues"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Reserved Table Tent',
    '["social_proof","table_tent","vip"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    'stapled_receipt_takeout',
    'Stapled Receipt Takeout',
    'takeout',
    'instagram',
    'base',
    $$Macro of a kraft paper bag fold stapled tight with a thermal receipt. The staple crunch frames “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Background stacks of bags and service lights amplify the must-have delivery flex.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Delivery praise captured at the pass window.",
        "recommended_usage": ["ghost kitchens","pickup counters","delivery-first brands"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Stapled Receipt Takeout',
    '["social_proof","takeout_bag","stapled_receipt"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    'soggy_coaster_note',
    'Soggy Coaster Note',
    'sports_bar',
    'instagram',
    'base',
    $$Top-down view of a damp cardboard coaster stained by a frosty pint ring. Blue pen handwriting spells “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Ink bleed, peanut shells, and amber bar glow sell the lived-in loyalty.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Dive-bar love note soaked into the coaster.",
        "recommended_usage": ["breweries","dive bars","sports lounges"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Soggy Coaster Note',
    '["social_proof","beer_coaster","amber_glow"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    'crayon_tablecloth_review',
    'Crayon Tablecloth Review',
    'family_dining',
    'instagram',
    'base',
    $$Close-up of a butcher-paper table cover covered in wax crayon joy. Childlike scrawl announces “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Loose crayons, chocolate milk glass, and bright lighting telegraph family love.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Family dining praise preserved in kid art.",
        "recommended_usage": ["Italian","family diners","pizza nights"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Crayon Tablecloth Review',
    '["social_proof","crayon_art","family_dining"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    $$High-angle on sunlit sidewalk chalk art outside the door. Thick pastel script shouts “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Concrete grit, dust clouds, stray leaves, and passerby shadow turn the review into a curbside CTA.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Street chalk hype that stops pedestrians.",
        "recommended_usage": ["cafes","ice cream","walk-up counters"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Sidewalk Chalk Masterpiece',
    '["social_proof","sidewalk_chalk","curb_appeal"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    $$Close-up of a pastel pastry box tied with red-and-white baker’s twine. A dangling tag proclaims “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Fiber fray, marble counter glint, and case blur sell the gift-worthy brag.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "Gifting energy captured on bakery packaging.",
        "recommended_usage": ["patisseries","donut shops","dessert gifting"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bakery String Tag',
    '["social_proof","bakery_box","gift_ready"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

WITH theme AS (
    SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_scene_builder'
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
    $$Portrait mirror selfie moment in a neon-splashed restroom. Lipstick lettering across the glass shouts “{{headline_text}}” with {{line_one}}, {{line_two}}, and “{{signature}}”. Flash bloom, graffiti layers, and disco reflections scream viral vibe check.$$,
    'v1',
    TRUE,
    '{
        "social_proof_context": "UGC-style mirror proclamation of the venue’s vibe.",
        "recommended_usage": ["nightclubs","cocktail bars","gen-z hangouts"]
    }'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Bathroom Mirror Selfie',
    '["social_proof","mirror_selfie","ugc"]'::JSONB,
    '{
        "required": ["headline_text","line_one","line_two","signature"],
        "optional": ["ambient_detail"],
        "types": {}
    }'::JSONB;

-- ============================================================================
-- End of Migration
-- ============================================================================

