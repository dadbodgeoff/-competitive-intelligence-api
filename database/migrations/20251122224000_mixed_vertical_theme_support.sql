-- ============================================================================
-- MIGRATION: Mixed Vertical Creative Themes
-- ============================================================================
-- Description : Seeds multi-vertical creative themes/templates covering
--               pizza takeout, healthy bowls, lunch rush, bakery mornings,
--               cafes, fine dining, diners, omakase, tacos, steakhouse,
--               southern comfort, and ice cream promos.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 20251122221000_creative_theme_support.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper macro to seed template (for clarity inside file use repeated statements)

-- ============================================================================
-- Theme 1: Game Over Bundle (Pizza Night)
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cross_vertical',
        'game_over_bundle',
        'Game Over Bundle',
        'Pizza night gaming energy with greasy cardboard lid handwriting.',
        'instagram',
        '{"primary":"#FF6F61","secondary":"#F4D35E","accent":"#1B1F3A"}'::JSONB,
        '{"headline":"Bangers","body":"Roboto"}'::JSONB,
        '["#pizzanight","#latenightdelivery","#gameon"]'::JSONB,
        '{
            "style_adjectives":["tv glow","cardboard grease","dog cameo","living room chaos"],
            "texture_options":["grease stain","pen skip","cardboard corrugation"],
            "palette_swaps":[["#FF6F61","#F4D35E"],["#F95738","#2E294E"]],
            "camera_styles":["low-angle coffee table","wide living room","cinematic ambient light"]
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
    'game_over_bundle',
    'Game Over Pizza Bundle',
    'cross_vertical',
    'instagram',
    'base',
    $$Low-angle wide shot from a coffee table perspective. A pizza box lid flipped open reveals gooey pepperoni under flickering TV glow. Ballpoint pen handwriting skips across corrugated cardboard: “{{headline}}”  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Grease stains halo the text, melted cheese glistens blue from the screen, and a dog nose sneaks into frame for cozy Friday night vibes.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Game Over Bundle',
    '["pizza_night","cardboard","tv_glow"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;
-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- ============================================================================
-- Theme 10: Butcher's Cut Cleaver
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'steakhouse',
        'butchers_cut_cleaver',
        'Butcher’s Cut Cleaver',
        'Dramatic cleaver-on-block visuals with marker lettering on steel.',
        'instagram',
        '{"primary":"#6B2C2C","secondary":"#E63946","accent":"#F5EAEA"}'::JSONB,
        '{"headline":"Oswald","body":"Raleway"}'::JSONB,
        '["#steakhouse","#butcherscut","#redwine"]'::JSONB,
        '{
            "style_adjectives":["cleaver sheen","dramatic lighting","wood block texture","peppercorn scatter"],
            "texture_options":["marker matting","steel grain","salt crystals"],
            "palette_swaps":[["#6B2C2C","#E63946"],["#4A1F1F","#F28482"]],
            "camera_styles":["close-up cleaver","angled butcher block","rembrandt lighting"]
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
    'butchers_cut_cleaver',
    'Butcher’s Cut Cleaver',
    'steakhouse',
    'instagram',
    'base',
    $$Cinematic close-up of a heavy stainless cleaver embedded in a butcher block. Black dry-erase marker across the blade proclaims “{{headline}}” with cuts:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Peppercorns and sea salt scatter on the wood while a glass of red wine blurs in the background for bold steakhouse drama.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Butcher’s Cut Cleaver',
    '["cleaver","steakhouse","dramatic_light"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 11: Cast Iron Comforts
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'southern_comfort',
        'cast_iron_comforts',
        'Cast Iron Comforts',
        'Flour-stenciled lettering on cast iron skillets with soul-food warmth.',
        'instagram',
        '{"primary":"#432818","secondary":"#F6AA1C","accent":"#EAD7C5"}'::JSONB,
        '{"headline":"Abril Fatface","body":"Nunito"}'::JSONB,
        '["#soulfoodsunday","#castiron","#comfortfood"]'::JSONB,
        '{
            "style_adjectives":["warm kitchen glow","flour dust","iron sheen","comfort textures"],
            "texture_options":["flour stencil","cast iron patina","napkin checkered"],
            "palette_swaps":[["#432818","#F6AA1C"],["#5E3023","#FA9F42"]],
            "camera_styles":["top-down skillet","angled kitchen","homey lighting"]
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
    'cast_iron_comforts',
    'Cast Iron Comforts',
    'southern_comfort',
    'instagram',
    'base',
    $$Top-down shot of a seasoned cast-iron skillet dusted with white flour through a stencil. Powdered lettering reads “{{headline}}” with southern staples:  • {{item1_name}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}}  “{{cta_line}}”  A red-and-white napkin, honey bowl, and handle grip frame the skillet with soul-food warmth.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Cast Iron Comforts',
    '["cast_iron","flour_stencil","soul_food"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 12: Ice Cream Frost Wipe
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'ice_cream',
        'ice_cream_frost_wipe',
        'Ice Cream Frost Wipe',
        'Frosted sneeze guards with finger-wiped lettering over colorful tubs.',
        'instagram',
        '{"primary":"#6BCBFF","secondary":"#FFB6C1","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Fredoka One","body":"Quicksand"}'::JSONB,
        '["#icecreamtime","#summercool","#frozendreams"]'::JSONB,
        '{
            "style_adjectives":["frosted glass","negative space lettering","playful reflections","cool tones"],
            "texture_options":["frost crystals","wipe trails","condensed vapor"],
            "palette_swaps":[["#6BCBFF","#FFB6C1"],["#8EC5FC","#E0C3FC"]],
            "camera_styles":["through glass","macro frost","bright dessert counter"]
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
    'ice_cream_frost_wipe',
    'Ice Cream Frost Wipe',
    'ice_cream',
    'instagram',
    'base',
    $$Eye-level shot through a frosted ice cream cabinet sneeze guard. Finger-wiped letters spell “{{headline}}” with chill treats:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}}  “{{cta_line}}”  Colorful tubs glow behind the clear letters while ice crystals jag the edges and a child’s reflection points excitedly.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Ice Cream Frost Wipe',
    '["frosted_glass","ice_cream","finger_wipe"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- Theme 2: Power Bowl Grind
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'healthy_bowls',
        'power_bowl_grind',
        'Power Bowl Grind',
        'Corporate desk salad containers with grease pencil handwriting.',
        'instagram',
        '{"primary":"#2EC4B6","secondary":"#E71D36","accent":"#011627"}'::JSONB,
        '{"headline":"Montserrat","body":"Inter"}'::JSONB,
        '["#powerbowl","#lunchfuel","#mealprep"]'::JSONB,
        '{
            "style_adjectives":["monitor glow","condensation beads","plastic refraction","desk hustle"],
            "texture_options":["grease pencil wax","plastic stress mark","lid reflection"],
            "palette_swaps":[["#2EC4B6","#E71D36"],["#28A9AB","#FF6F59"]],
            "camera_styles":["high-angle desk","macro condensation","office vignette"]
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
    'power_bowl_grind',
    'Power Bowl Deal',
    'healthy_bowls',
    'instagram',
    'base',
    $$High-angle desktop shot of a sealed plastic salad container packed with greens and grilled protein. Blue grease pencil handwriting on the lid reads “{{headline}}” with lineup:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Computer monitor light reflects off the lid while condensation collects near the proteins for a corporate grind fuel-up.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Power Bowl Grind',
    '["takeout_lid","desk_lunch","healthy_fuel"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 3: City Bench Lunch Rush
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fast_casual',
        'city_bench_lunch',
        'City Bench Lunch Rush',
        'Urban midday hustle with paper bag marker text and harsh sunlight.',
        'instagram',
        '{"primary":"#F77F00","secondary":"#003049","accent":"#EAE2B7"}'::JSONB,
        '{"headline":"Permanent Marker","body":"Open Sans"}'::JSONB,
        '["#lunchtime","#streetfood","#cityliving"]'::JSONB,
        '{
            "style_adjectives":["noon sun","paper fiber","urban grit","motion blur pigeon"],
            "texture_options":["grease bleed","bag crinkle","marker saturation"],
            "palette_swaps":[["#F77F00","#003049"],["#FF924C","#264653"]],
            "camera_styles":["bench-level","street candid","high-contrast shadows"]
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
    'city_bench_lunch',
    'City Bench Lunch',
    'fast_casual',
    'instagram',
    'base',
    $$Eye-level street photo of a grease-stained paper bag on a park bench under harsh noon sun. Thick marker letters declare “{{headline}}” with combo:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Crinkles warp the text, purple sheen appears in greasy spots, a pigeon blurs by, and city traffic bokehs the background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'City Bench Lunch',
    '["paper_bag","street_food","high_noon"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 4: Flour Carved Morning Bake
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bakery',
        'flour_carved_morning',
        'Flour Carved Morning',
        'Bakery workbench with flour-carved lettering and sunlight shafts.',
        'instagram',
        '{"primary":"#F7DAD9","secondary":"#D8A47F","accent":"#6F4E37"}'::JSONB,
        '{"headline":"Playfair Display","body":"Work Sans"}'::JSONB,
        '["#freshbaked","#morningrush","#artisanbread"]'::JSONB,
        '{
            "style_adjectives":["flour dust","sunbeam","artisan hands","wood grain"],
            "texture_options":["flour carve","smoke puff","bench scratches"],
            "palette_swaps":[["#F7DAD9","#D8A47F"],["#F9E1B5","#C89F7C"]],
            "camera_styles":["macro bench","angled sunbeam","high-contrast morning"]
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
    'flour_carved_menu',
    'Flour Carved Menu',
    'bakery',
    'instagram',
    'base',
    $$Cinematic low-angle macro of a bakery workbench as a sunbeam cuts through flour dust. Menu text is carved into a thick layer of flour: “{{headline}}”  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}}  “{{cta_line}}”  A baker’s hands knead dough in the background while warm light versus cool shadows show wood grain under the flour.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Flour Carved Morning',
    '["flour_carve","sunbeam","artisan_bakery"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 5: Barista Foam POV
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'cafe',
        'barista_foam_pov',
        'Barista Foam POV',
        'Latte art POV with cocoa dust text and cafe hustle.',
        'instagram',
        '{"primary":"#C68B59","secondary":"#8C4A2F","accent":"#F7E7CE"}'::JSONB,
        '{"headline":"Playball","body":"Lato"}'::JSONB,
        '["#latteart","#cafelife","#morningfuel"]'::JSONB,
        '{
            "style_adjectives":["microfoam sheen","powder typography","cafe blur","steam aura"],
            "texture_options":["cocoa dust","foam swirl","condensation drip"],
            "palette_swaps":[["#C68B59","#8C4A2F"],["#D4A373","#6F4518"]],
            "camera_styles":["top-down cup","barista POV","macro foam detail"]
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
    'barista_foam_pov',
    'Barista POV Foam',
    'cafe',
    'instagram',
    'base',
    $$Extreme top-down POV into a wide latte cup. Cocoa powder lettering floats atop silky foam: “{{headline}}”  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}}  “{{cta_line}}”  Golden micro-bubbles shimmer in track lighting while condensation beads down the cup and a bustling cafe blurs below.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Barista Foam POV',
    '["latte_art","cocoa_dust","cafe_pov"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 6: Candlelit Bottle Special
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'fine_dining',
        'candlelit_bottle_special',
        'Candlelit Bottle Special',
        'Gold paint marker lettering on wine bottle with romantic candle glow.',
        'instagram',
        '{"primary":"#D4AF37","secondary":"#1A1A1A","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Cormorant Garamond","body":"Raleway"}'::JSONB,
        '["#datenight","#winepairing","#cheflife"]'::JSONB,
        '{
            "style_adjectives":["candle reflection","glass curvature","romantic bokeh","linen texture"],
            "texture_options":["gold marker","wine glass distortion","soft shadow"],
            "palette_swaps":[["#D4AF37","#1A1A1A"],["#E6C200","#2D2A32"]],
            "camera_styles":["portrait bottle","intimate table","shallow depth low-light"]
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
    'candlelit_bottle_special',
    'Candlelit Bottle Special',
    'fine_dining',
    'instagram',
    'base',
    $$Portrait shot of a dark wine bottle centerpiece beside a tall candle. Metallic gold paint marker wraps the bottle with “{{headline}}” and specials:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  The flame reflects inside the letters while table linens, stemware, and soft bokeh create elegant date-night vibes.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Candlelit Bottle',
    '["wine_bottle","romantic","gold_marker"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 7: Chrome Napkin Special
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'diner',
        'chrome_napkin_special',
        'Chrome Napkin Special',
        'Retro diner napkin dispenser with grease pencil lettering and neon reflections.',
        'instagram',
        '{"primary":"#FF3131","secondary":"#00A8E8","accent":"#F1FAEE"}'::JSONB,
        '{"headline":"Rubik Mono One","body":"Poppins"}'::JSONB,
        '["#dinervibes","#earlybird","#breakfastspecial"]'::JSONB,
        '{
            "style_adjectives":["chrome reflection","grease pencil sheen","retro neon","checkerboard floor"],
            "texture_options":["wax pencil","smudge","formica gloss"],
            "palette_swaps":[["#FF3131","#00A8E8"],["#FF4D6D","#4CC9F0"]],
            "camera_styles":["macro chrome","angled diner","fish-eye reflection"]
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
    'chrome_napkin_special',
    'Chrome Napkin Special',
    'diner',
    'instagram',
    'base',
    $$Macro portrait of a chrome napkin dispenser on a formica countertop. Red grease pencil scrawls “{{headline}}” with breakfast favorites:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Maple syrup glows amber nearby, neon signage warps across the chrome, and vintage nostalgia drips from every reflection.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Chrome Napkin',
    '["diner","chrome","grease_pencil"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 8: Wet Slate Omakase
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'sushi',
        'wet_slate_omakase',
        'Wet Slate Omakase',
        'Moody wet slate boards with liquid chalk calligraphy.',
        'instagram',
        '{"primary":"#1F2A44","secondary":"#FFFFFF","accent":"#FF6F59"}'::JSONB,
        '{"headline":"Sawarabi Mincho","body":"Noto Sans"}'::JSONB,
        '["#omakase","#sushilife","#chefstable"]'::JSONB,
        '{
            "style_adjectives":["wet slate sheen","chalk calligraphy","dim ambience","sashimi glow"],
            "texture_options":["water streak","stone grain","chalk crisp"],
            "palette_swaps":[["#1F2A44","#FFFFFF"],["#0F172A","#F8F9FA"]],
            "camera_styles":["overhead slate","moody spotlight","high-dynamic range"]
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
    'wet_slate_omakase',
    'Wet Slate Omakase',
    'sushi',
    'instagram',
    'base',
    $$Overhead shot of a wet black slate board streaked with water. Bright white liquid chalk script reads “{{headline}}” with omakase items:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Sashimi, wasabi, and chopsticks frame the calligraphy, moisture gleaming under moody lighting for Michelin-level drama.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Wet Slate Omakase',
    '["wet_slate","liquid_chalk","omakase"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 9: Taco Tuesday Basket
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'taqueria',
        'taco_tuesday_basket',
        'Taco Tuesday Basket',
        'Wax paper baskets with marker lettering and grease window.',
        'instagram',
        '{"primary":"#FFB400","secondary":"#FF6B6B","accent":"#2B2D42"}'::JSONB,
        '{"headline":"Luckiest Guy","body":"Montserrat"}'::JSONB,
        '["#tacotuesday","#streettacos","#happyhour"]'::JSONB,
        '{
            "style_adjectives":["wax paper texture","grease transparency","vibrant toppings","street food energy"],
            "texture_options":["grease spot","marker bleed","lime juice sheen"],
            "palette_swaps":[["#FFB400","#FF6B6B"],["#FF9F1C","#E63946"]],
            "camera_styles":["top-down basket","macro toppings","color pop food porn"]
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
    'taco_tuesday_basket',
    'Taco Tuesday Basket',
    'taqueria',
    'instagram',
    'base',
    $$High-angle close-up of a red plastic basket lined with checkered wax paper. Bold marker lettering on the paper proclaims “{{headline}}” with specials:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  Grease stains create translucent windows across the ink while tacos, lime wedges, and cilantro surround the message in vibrant street-food color.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Taco Tuesday Basket',
    '["wax_paper","street_tacos","marker"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;
-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
