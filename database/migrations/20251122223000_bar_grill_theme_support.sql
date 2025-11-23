-- ============================================================================
-- MIGRATION: Bar & Grill Creative Themes
-- ============================================================================
-- Description : Seeds creative prompt themes and templates tailored for bar,
--               grill, and gastropub operators with production-ready prompts.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 20251122221000_creative_theme_support.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Theme 1: Mirror Selfie Moment
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'mirror_selfie_moment',
        'Mirror Selfie Moment',
        'Nightlife mirror selfies with neon reflections and chalk lettering.',
        'instagram',
        '{"primary":"#FF4C7B","secondary":"#2EC5FF","accent":"#F9F871"}'::JSONB,
        '{"headline":"Anton","body":"Montserrat"}'::JSONB,
        '["#latenightbites","#bartenderlife","#afterhours"]'::JSONB,
        '{
            "style_adjectives":["mirror glow","neon haze","smoky ambiance","crowded nightlife"],
            "texture_options":["fogged glass","chalk dust","light leaks"],
            "palette_swaps":[["#FF4C7B","#2EC5FF"],["#F72585","#7209B7"]],
            "camera_styles":["low-angle selfie","over-the-shoulder","wide nightlife scene"]
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
    'mirror_selfie_menu',
    'Mirror Selfie Menu',
    'bar_grill',
    'instagram',
    'base',
    $$Photorealistic low-angle hero shot inside a packed craft beer bar at {{scene_time}} on a {{scene_day}}. A bartender takes a mirror selfie as the back-bar mirror glows with LED rim lighting and chalk marker lettering:  “{{headline}}”  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}} – ${{item3_price}}  “{{cta_line}}”  Neon beer signs bleed magenta and cyan across the fogged glass, smoke tendrils curl through the reflection, bottles catch rainbow flares, and the crowd blurs into a roar while the phone flash reveals floating dust motes.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Mirror Selfie Moment',
    '["mirror","neon","nightlife"]'::JSONB,
    '{
        "required": ["scene_time","scene_day","headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 2: Butcher Paper Lineup
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'butcher_paper_lineup',
        'Butcher Paper Lineup',
        'Overhead butcher-paper flatlays filled with bar bites and marker ink.',
        'instagram',
        '{"primary":"#E07A5F","secondary":"#C27D38","accent":"#F2CC8F"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Roboto"}'::JSONB,
        '["#gamedaygrub","#butcherpaper","#gastropub"]'::JSONB,
        '{
            "style_adjectives":["edison warmth","overhead feast","marker ink bleed","tabletop chaos"],
            "texture_options":["butcher paper fiber","sea salt scatter","sauce smears"],
            "palette_swaps":[["#E07A5F","#C27D38"],["#915B3C","#F7C59F"]],
            "camera_styles":["flat lay overhead","angled tabletop","macro food detail"]
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
    'butcher_paper_tableside',
    'Butcher Paper Tableside',
    'bar_grill',
    'instagram',
    'base',
    $$High-angle foodie flat lay on brown butcher paper at a buzzing gastropub. Thick black marker scrawls “{{headline}}” with a casual underline above the menu:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}} – ${{item3_price}}  “{{cta_line}}”  Honey-glazed wings, frosty pint rings, scattered sea salt, peppercorns, and a blurred hand stealing fries create the perfect chaotic realism under warm Edison bulb light.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Butcher Paper Flatlay',
    '["butcher_paper","flatlay","gastropub"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 3: Chef Pass Heat Lamp
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'chef_pass_heatlamp',
        'Chef’s Pass Heat Lamp',
        'Kitchen pass tiles with grease pencil announcements and steaming plates.',
        'instagram',
        '{"primary":"#FFA94D","secondary":"#FFFFFF","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"Oswald","body":"Lato"}'::JSONB,
        '["#freshcatch","#chefspecial","#behindthepass"]'::JSONB,
        '{
            "style_adjectives":["heat lamp glow","kitchen hustle","tile reflections","steam trails"],
            "texture_options":["grease pencil wax","tile gloss","steam haze"],
            "palette_swaps":[["#FFA94D","#FFFFFF"],["#FFB347","#F0F0F0"]],
            "camera_styles":["eye-level pass","shallow depth of field","over-the-bar focus"]
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
    'chefs_pass_tiles',
    'Chef Pass Tiles',
    'bar_grill',
    'instagram',
    'base',
    $$Eye-level view past chrome beer taps toward glossy white subway tiles lit by golden heat lamps. Bold grease pencil handwriting reads “{{headline}}” with today’s menu:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  “{{cta_line}}”  A frosty pilsner and taco plate glow in the foreground while a motion-blurred chef streaks past, steam drifting through the frame for a fresh-from-the-pass flex.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Chef’s Pass Moment',
    '["heat_lamp","kitchen_pass","fresh_catch"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 4: Golden Hour Window Splash
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'golden_hour_window',
        'Golden Hour Window',
        'Sun-drenched exterior window paint promos with patio vibes.',
        'instagram',
        '{"primary":"#FFD166","secondary":"#EF476F","accent":"#118AB2"}'::JSONB,
        '{"headline":"Pacifico","body":"Nunito"}'::JSONB,
        '["#happyhour","#patioseason","#goldenhour"]'::JSONB,
        '{
            "style_adjectives":["golden hour sun","window paint texture","street reflections","crowd energy"],
            "texture_options":["window brush strokes","glass streaks","flare leaks"],
            "palette_swaps":[["#FFD166","#EF476F"],["#FFB703","#FB8500"]],
            "camera_styles":["street-level window","angled exterior","lens flare shot"]
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
    'golden_hour_window_splash',
    'Golden Hour Window Splash',
    'bar_grill',
    'instagram',
    'base',
    $$Exterior eye-level shot through a glowing plate-glass window at {{scene_time}}. Neon-yellow and white window paint bubbles out: “{{headline}}”  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}} – ${{item3_price}}  “{{cta_line}}”  The glass reflects passing cars and trees while happy patrons clink glasses inside, sun flare streaking across the lettering with visible brush textures.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Golden Hour Window',
    '["window_paint","golden_hour","patio_vibes"]'::JSONB,
    '{
        "required": ["scene_time","headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 5: Whiskey Barrel High-Top
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'whiskey_barrel_hightop',
        'Whiskey Barrel High-Top',
        'Rustic barrel tabletops with chalk dust and bourbon glow.',
        'instagram',
        '{"primary":"#7F5539","secondary":"#B08968","accent":"#F2E9E4"}'::JSONB,
        '{"headline":"Cinzel","body":"Source Sans Pro"}'::JSONB,
        '["#whiskeybar","#smokehouse","#bourbontime"]'::JSONB,
        '{
            "style_adjectives":["barrel patina","chalk dust","intimate lighting","alligator skin whiskey"],
            "texture_options":["chalk smear","wood grain","peanut shells"],
            "palette_swaps":[["#7F5539","#B08968"],["#5A3D2B","#D4A373"]],
            "camera_styles":["top-down macro","angled detail","spotlit centerpiece"]
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
    'whiskey_barrel_specials',
    'Whiskey Barrel Specials',
    'bar_grill',
    'instagram',
    'base',
    $$Close-up high-angle shot of an aged oak whiskey barrel used as a high-top table. Dusty white chalk scrawls “{{headline}}” with nightly specials:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}}  “{{cta_line}}”  A leather coaster cradles a glass of amber bourbon catching the light while peanut shells and worn wood grain add tactile drama.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Whiskey Barrel High-Top',
    '["barrel","chalk","bourbon"]'::JSONB,
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
-- Theme 6: Game Day Fridge
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'gameday_fridge_fog',
        'Game Day Fridge',
        'Condensation-heavy beer fridge messaging with finger-written text.',
        'instagram',
        '{"primary":"#00A6FB","secondary":"#F8F9FA","accent":"#1B1B1E"}'::JSONB,
        '{"headline":"Archivo Black","body":"Inter"}'::JSONB,
        '["#gameday","#coldbeer","#tailgate"]'::JSONB,
        '{
            "style_adjectives":["cold condensation","cool blue lighting","macro droplets","clear reveal"],
            "texture_options":["fog wipe","droplet streaks","frosted glass"],
            "palette_swaps":[["#00A6FB","#F8F9FA"],["#4CC9F0","#F1FAEE"]],
            "camera_styles":["macro fridge door","angled condensation","dim merch lighting"]
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
    'gameday_fridge_glass',
    'Game Day Fridge Glass',
    'bar_grill',
    'instagram',
    'base',
    $$Macro shot of a commercial beer fridge door drenched in condensation. Finger-wiped negative-space lettering reveals “{{headline}}” with cold deals:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}}  “{{cta_line}}”  Behind the letters, colorful cans glow under blue LED strips while droplets bead around the text for an icy refreshment flex.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Game Day Fridge',
    '["condensation","macro","beer_fridge"]'::JSONB,
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
-- Theme 7: Corrugated Graffiti Wall
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'corrugated_graffiti_wall',
        'Corrugated Graffiti Wall',
        'Spray paint drip typography on corrugated steel with neon reflections.',
        'instagram',
        '{"primary":"#FF4C7D","secondary":"#2CE3F2","accent":"#FFD166"}'::JSONB,
        '{"headline":"Russo One","body":"Poppins"}'::JSONB,
        '["#weekendvibes","#industrialbar","#neonnights"]'::JSONB,
        '{
            "style_adjectives":["spray paint drips","metallic reflections","neon wash","industrial grit"],
            "texture_options":["paint drip","metal sheen","rust patina"],
            "palette_swaps":[["#FF4C7D","#2CE3F2"],["#FF6F91","#08D9D6"]],
            "camera_styles":["medium wall shot","angled graffiti","motion blur passing"]
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
    'corrugated_graffiti_menu',
    'Corrugated Graffiti Menu',
    'bar_grill',
    'instagram',
    'base',
    $$Interior medium shot of galvanized corrugated steel splashed with hot pink and teal graffiti. Drip-style spray paint proclaims “{{headline}}” above the lineup:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}} – ${{item3_price}}  “{{cta_line}}”  Neon reflections flow down the ridges while a blurred server hustles past a bar stool in the foreground.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Corrugated Graffiti Wall',
    '["spray_paint","industrial","neon_reflection"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 8: Cocktail Napkin Notes
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'cocktail_napkin_note',
        'Cocktail Napkin Note',
        'Ballpoint pen scribbles on textured napkins with condensation rings.',
        'instagram',
        '{"primary":"#FDF6EC","secondary":"#0A3D62","accent":"#C44536"}'::JSONB,
        '{"headline":"Dancing Script","body":"Open Sans"}'::JSONB,
        '["#speakeasy","#secretmenu","#bartenderschoice"]'::JSONB,
        '{
            "style_adjectives":["macro napkin fiber","ink bleed","mahogany glow","condensation ring"],
            "texture_options":["ink smear","paper wrinkle","wet ring"],
            "palette_swaps":[["#FDF6EC","#0A3D62"],["#FBF3E4","#1B3A4B"]],
            "camera_styles":["macro top-down","angled close-up","intimate bar top"]
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
    'cocktail_napkin_secret',
    'Cocktail Napkin Secret',
    'bar_grill',
    'instagram',
    'base',
    $$Macro shot of a textured cocktail napkin on polished mahogany. Blue ink handwriting reads “{{headline}}” with favorites listed:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}} – ${{item3_price}}  “{{cta_line}}”  A crystal rocks glass rests on the corner, condensation bleeding the ink where a ring overlaps the letters while warm bottle bokeh fills the background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Cocktail Napkin Secret',
    '["napkin","ink_bleed","speakeasy"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 9: Beer Flight Paddle
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'beer_flight_paddle',
        'Beer Flight Paddle',
        'Sunlit beer flight paddles with chalk marker labels and vibrant liquid.',
        'instagram',
        '{"primary":"#F4A261","secondary":"#264653","accent":"#E9C46A"}'::JSONB,
        '{"headline":"League Spartan","body":"Lora"}'::JSONB,
        '["#beerflight","#tastingroom","#craftbrew"]'::JSONB,
        '{
            "style_adjectives":["sunlit patio","glass refraction","chalk labels","refreshing condensation"],
            "texture_options":["chalk marker","wood grain","condensation beads"],
            "palette_swaps":[["#F4A261","#264653"],["#E5989B","#6D597A"]],
            "camera_styles":["eye-level flight","angled paddle","shallow depth outdoors"]
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
    'beer_flight_of_month',
    'Beer Flight of the Month',
    'bar_grill',
    'instagram',
    'base',
    $$Close-up of a wooden tasting paddle on a sunlit picnic table with four colorful beers. A black chalk strip lists “{{headline}}” and numbered pours:  1. {{item1_name}}  2. {{item2_name}}  3. {{item3_name}}  4. {{item4_name}}  “{{cta_line}}”  Sunlight passes through the glasses casting golden shadows while string lights and greenery blur in the background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Beer Flight Paddle',
    '["beer_flight","chalk","patio"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","item4_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 10: Kraft Paper Scroll
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'kraft_paper_scroll',
        'Kraft Paper Scroll',
        'Industrial kraft paper scroll menus against brick with permanent marker.',
        'instagram',
        '{"primary":"#8C3A11","secondary":"#FF9F1C","accent":"#1C1C1C"}'::JSONB,
        '{"headline":"Fugaz One","body":"Barlow"}'::JSONB,
        '["#kitchenspecials","#brickandmortar","#livemusic"]'::JSONB,
        '{
            "style_adjectives":["spotlit scroll","brick texture","marker boldness","industrial ambiance"],
            "texture_options":["paper curl","marker bleed","brick mortar"],
            "palette_swaps":[["#8C3A11","#FF9F1C"],["#7C3F00","#FF784E"]],
            "camera_styles":["medium wall shot","angled scroll","motion blur passersby"]
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
    'kraft_scroll_specials',
    'Kraft Scroll Specials',
    'bar_grill',
    'instagram',
    'base',
    $$Medium shot of a brown kraft paper scroll hanging on a red brick wall with a black metal dispenser. Bold black marker hand-lettering announces “{{headline}}” and specials:  • {{item1_name}} – ${{item1_price}}  • {{item2_name}} – ${{item2_price}}  • {{item3_name}} – ${{item3_price}}  “{{cta_line}}”  Neon signage casts a subtle glow while a blurred server strolls past, the paper edges gently curling.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Kraft Paper Scroll',
    '["kraft_paper","industrial","brick_wall"]'::JSONB,
    '{
        "required": ["headline","item1_name","item1_price","item2_name","item2_price","item3_name","item3_price","cta_line"],
        "optional": [],
        "types": {
            "item1_price": "currency",
            "item2_price": "currency",
            "item3_price": "currency"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- Theme 11: Foil Wrap Cure
-- ============================================================================

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'bar_grill',
        'foil_wrap_cure',
        'Foil Wrap Cure',
        'Late-night foil-wrapped comfort food with sharpie annotations.',
        'instagram',
        '{"primary":"#C0C0C0","secondary":"#FF3131","accent":"#1E1E1E"}'::JSONB,
        '{"headline":"Permanent Marker","body":"Titillium Web"}'::JSONB,
        '["#latenightcure","#afterhours","#dinervibes"]'::JSONB,
        '{
            "style_adjectives":["flash photography","foil glare","greasy nostalgia","diner energy"],
            "texture_options":["foil crinkle","marker matte","fluorescent hotspot"],
            "palette_swaps":[["#C0C0C0","#FF3131"],["#E0E0E0","#FF6B6B"]],
            "camera_styles":["macro foil wrap","angled tray","high-contrast flash"]
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
    'foil_wrap_late_night',
    'Foil Wrap Late Night',
    'bar_grill',
    'instagram',
    'base',
    $$High-angle macro shot of a foil-wrapped burger resting on a red plastic tray under bright fluorescent light. Thick black marker scrawls “{{headline}}” with the cure-all lineup:  • {{item1_name}}  • {{item2_name}}  • {{item3_name}}  “{{cta_line}}”  The foil crinkles explode with specular highlights while a ketchup cup and grease-stained napkins complete the gritty late-night vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Foil Wrap Cure',
    '["foil","late_night","flash_photo"]'::JSONB,
    '{
        "required": ["headline","item1_name","item2_name","item3_name","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

