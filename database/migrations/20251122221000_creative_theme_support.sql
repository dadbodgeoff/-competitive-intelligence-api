-- ============================================================================
-- MIGRATION: Creative Theme & Variation Support
-- ============================================================================
-- Description : Adds creative prompt themes, template metadata, variation
--               history, and seeds initial pizza prompt catalog.
-- Author      : GPT-5 Codex
-- Date        : 2025-11-22
-- Dependencies: 20251122205000_creative_image_generation_module.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------------
-- Theme catalog
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creative_prompt_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_vertical TEXT NOT NULL,
    theme_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    campaign_channel TEXT NOT NULL DEFAULT 'instagram',
    mood_board_urls JSONB NOT NULL DEFAULT '[]'::JSONB,
    default_palette JSONB NOT NULL DEFAULT '{}'::JSONB,
    default_fonts JSONB NOT NULL DEFAULT '{}'::JSONB,
    default_hashtags JSONB NOT NULL DEFAULT '[]'::JSONB,
    variation_rules JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(theme_slug)
);

-- --------------------------------------------------------------------------
-- Template metadata enhancements
-- --------------------------------------------------------------------------

ALTER TABLE creative_prompt_templates
    ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES creative_prompt_themes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS variation_tags JSONB NOT NULL DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS input_schema JSONB NOT NULL DEFAULT '{}'::JSONB;

ALTER TABLE creative_generation_jobs
    ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES creative_prompt_themes(id),
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES creative_prompt_templates(id);

-- --------------------------------------------------------------------------
-- Variation history
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creative_variation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES creative_generation_jobs(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES creative_prompt_themes(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES creative_prompt_templates(id) ON DELETE CASCADE,
    style_seed TEXT NOT NULL,
    noise_level NUMERIC(4,2),
    style_notes JSONB NOT NULL DEFAULT '[]'::JSONB,
    texture TEXT,
    palette JSONB NOT NULL DEFAULT '{}'::JSONB,
    variation_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_variations_recent
    ON creative_variation_history(account_id, theme_id, created_at DESC);

-- --------------------------------------------------------------------------
-- Seed: Pizza-focused themes & templates
-- --------------------------------------------------------------------------

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'cocktail_pairings_night',
        'Cocktail Pairings Night',
        'Low-light cocktail pairings with artisan pizzas and chalk typography.',
        'instagram',
        '{"primary":"#F0544F","secondary":"#F6BD60","accent":"#FFFFFF"}'::JSONB,
        '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
        '["#pizzanight","#craftcocktails","#datenight"]'::JSONB,
        '{
            "style_adjectives":["warm edison bulbs","moody film grain","bar-top reflections","handcrafted details"],
            "texture_options":["chalk dust","glass condensation","bokeh light orbs"],
            "palette_swaps":[["#F0544F","#F6BD60"],["#2C3E50","#E63946"]],
            "camera_styles":["cinematic close-up","shallow depth of field","wide bar angle"]
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
    'cocktail_pizza_pairings',
    'Cocktail + Pizza Pairings',
    'pizza',
    'instagram',
    'base',
    $$Photorealistic low-light bar scene. A black round tray holds two perfectly garnished {{cocktail_1}} and {{cocktail_2}} with condensation, plus a sizzling cast-iron skillet of {{pizza_name}} with epic cheese pull. Center: rustic wooden-framed chalkboard with beautiful hand-lettered white/pink/yellow chalk:  “Perfect Pairings Tonight”  • {{pizza_1}} + {{cocktail_1}} – ${{price_1}}  • {{pizza_2}} + {{cocktail_2}} – ${{price_2}}  • {{pizza_3}} + {{cocktail_3}} – ${{price_3}}  “Ask about our ${{flight_price}} flight + pizza deal”  Small doodles of cocktail glasses and pizza slices. Blurred bottles and warm Edison bulbs in background, ultra-cinematic, 8k food photography.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Cocktail Pairings Tray',
    '["low_light","bar_scene","chalk_typography"]'::JSONB,
    '{
        "required": ["pizza_name","pizza_1","pizza_2","pizza_3","price_1","price_2","price_3","cocktail_1","cocktail_2","cocktail_3","flight_price"],
        "optional": [],
        "types": {
            "price_1": "currency",
            "price_2": "currency",
            "price_3": "currency",
            "flight_price": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'delivery_power_stack',
        'Delivery Power Stack',
        'Golden-hour delivery stack with chalk marker offers and QR promotion.',
        'instagram',
        '{"primary":"#E76F51","secondary":"#F4A261","accent":"#264653"}'::JSONB,
        '{"headline":"Bebas Neue","body":"Lato"}'::JSONB,
        '["#deliverydeals","#pizzaboxart","#weekendvibes"]'::JSONB,
        '{
            "style_adjectives":["sunlit counter glow","steam rising","chalk marker energy","handwritten doodles"],
            "texture_options":["lens flare","sunlit dust particles","subtle film grain"],
            "palette_swaps":[["#E76F51","#F4A261"],["#E63946","#F1FAEE"]],
            "camera_styles":["hero angle","tabletop close-up","wide delivery stack"]
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
    'pizza_box_stack_special',
    'Weekend Delivery Special',
    'pizza',
    'instagram',
    'base',
    $$Golden-hour photorealistic shot on marble counter near window. Tall stack of 5 kraft pizza boxes, top box open with steam rising and cheese pull from {{featured_pizza}}. Second box lid covered in colorful chalk marker:  “{{promotion_title}}” in huge playful script  “{{deal_line}}”  1. {{pizza_1}} – ${{price_1}}  2. {{pizza_2}} – ${{price_2}}  3. {{pizza_3}} – ${{price_3}}  {{qr_text}} with actual scannable QR code drawn in chalk  Cute heart-eye pizza doodle. Natural sunlight, ultra-appetizing, ready for delivery-app hero image.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Delivery Box Stack',
    '["sunlit","delivery","chalk_marker","qr_code"]'::JSONB,
    '{
        "required": ["featured_pizza","promotion_title","deal_line","pizza_1","price_1","pizza_2","price_2","pizza_3","price_3","qr_text"],
        "optional": [],
        "types": {
            "price_1": "currency",
            "price_2": "currency",
            "price_3": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'family_supper_series',
        'Family Supper Series',
        'Brown butcher paper feast with arrows and doodles for communal dining.',
        'instagram',
        '{"primary":"#E07A5F","secondary":"#F2CC8F","accent":"#81B29A"}'::JSONB,
        '{"headline":"Playfair Display","body":"Raleway"}'::JSONB,
        '["#familystyle","#sundaysupper","#italianfeast"]'::JSONB,
        '{
            "style_adjectives":["candlelit warmth","overhead feast","handwritten arrows","shared plates"],
            "texture_options":["butcher paper grain","wine stains","chalk smudges"],
            "palette_swaps":[["#E07A5F","#F2CC8F"],["#CB997E","#FFE8D6"]],
            "camera_styles":["flat lay","wide communal table","tight detail on hands"]
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
    'butcher_paper_sunday_supper',
    'Butcher Paper Sunday Supper',
    'pizza',
    'instagram',
    'base',
    $$Overhead photorealistic shot of long wooden communal table covered in brown butcher paper. Full Italian feast laid out: giant {{main_pizza}}, spaghetti & meatballs, caprese, rigatoni, wine bottles. Chalk marker directly on paper:  “{{event_name}} – ${{price}} (feeds {{people}})”  Arrows pointing to every dish labeling them, kid doodles, wine stains, Parmesan dust. Hands reaching in, warm candlelight, the ultimate FOMO family-style photo.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Family-Style Feast',
    '["overhead","butcher_paper","family_style"]'::JSONB,
    '{
        "required": ["main_pizza","event_name","price","people"],
        "optional": [],
        "types": {
            "price": "currency",
            "people": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'artisan_dough_lab',
        'Artisan Dough Lab',
        'Macro dough artistry with fermentation flex and flour explosions.',
        'instagram',
        '{"primary":"#F4F1DE","secondary":"#3D405B","accent":"#E07A5F"}'::JSONB,
        '{"headline":"Cinzel","body":"Source Sans Pro"}'::JSONB,
        '["#artisanpizza","#doughlife","#pizzalab"]'::JSONB,
        '{
            "style_adjectives":["golden-hour glow","flour burst","macro texture","bench craft"],
            "texture_options":["flour haze","grain overlay","light leaks"],
            "palette_swaps":[["#F4F1DE","#3D405B"],["#FFF8E7","#2C3E50"]],
            "camera_styles":["macro close-up","cinematic side angle","dramatic backlight"]
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
    'chalk_on_dough_ball',
    'Chalk on Proofed Dough',
    'pizza',
    'instagram',
    'base',
    $$Extreme macro, golden-hour light. Perfectly proofed {{dough_type}} dough ball on floured wooden bench, flour exploding in air. Hand-written directly on dough in edible white chalk marker:  “{{dough_claim}}”  “{{date}} :)”  Shallow depth of field, window light, the artisan flex every pizzeria needs.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Dough Lab Close-Up',
    '["macro","flour_burst","artisan"]'::JSONB,
    '{
        "required": ["dough_type","dough_claim","date"],
        "optional": [],
        "types": {
            "date": "date"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'parmigiano_showstopper',
        'Parmigiano Showstopper',
        'Huge Parmigiano wheel chalkboard announcing specials and events.',
        'instagram',
        '{"primary":"#FFD166","secondary":"#EF476F","accent":"#073B4C"}'::JSONB,
        '{"headline":"Abril Fatface","body":"Nunito"}'::JSONB,
        '["#parmnight","#cheeseshower","#italianstyle"]'::JSONB,
        '{
            "style_adjectives":["dramatic spotlight","cheese shavings flying","chalkboard carve","brick warmth"],
            "texture_options":["cheese dust","lens flare","warm vignette"],
            "palette_swaps":[["#FFD166","#EF476F"],["#F4E285","#2F4858"]],
            "camera_styles":["hero shot","angled close-up","wide ambience"]
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
    'parm_wheel_event',
    'Giant Parmigiano Wheel',
    'pizza',
    'instagram',
    'base',
    $$Hero shot: massive 80-lb wheel of Parmigiano-Reggiano cracked open like a book on wooden table. Cut face turned into chalkboard with blue/yellow/pink chalk:  “{{event_name}} – Unlimited Shavings with Any Pizza ${{price}}”  Flying cheese-shaving doodles  “{{day_and_time}}”  Cheese knife stabbed in, shavings scattered, warm restaurant lighting, brick wall background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Parm Night Feature',
    '["cheese_wheel","event_promo","chalk_typography"]'::JSONB,
    '{
        "required": ["event_name","price","day_and_time"],
        "optional": [],
        "types": {
            "price": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'secret_menu_whispers',
        'Secret Menu Whispers',
        'Speakeasy chalkboard teasing limited secret pizzas.',
        'instagram',
        '{"primary":"#1B263B","secondary":"#415A77","accent":"#E0E1DD"}'::JSONB,
        '{"headline":"Cormorant Garamond","body":"Roboto"}'::JSONB,
        '["#secretmenu","#speakeasy","#onlytonight"]'::JSONB,
        '{
            "style_adjectives":["low-light mystery","candle glow","chalk whispers","exclusive vibe"],
            "texture_options":["smoky haze","neon reflections","grain"],
            "palette_swaps":[["#1B263B","#E0E1DD"],["#111827","#F5F3F0"]],
            "camera_styles":["bar close-up","hand interaction","moody macro"]
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
    'secret_menu_chalkboard',
    'Secret Menu Chalkboard',
    'pizza',
    'instagram',
    'base',
    $$Moody speakeasy bar close-up. Small vintage chalkboard propped against liquor bottles, tattooed bartender hand reaching. Text in whispery white chalk:  “Ask for the Secret Pizza – Only {{quantity}} made tonight”  “{{secret_pizza_name}} – ${{price}}”  Tiny skull or flame doodle. Red low light, ultra-exclusive vibe.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Secret Pizza Whisper',
    '["low_light","exclusive","bar"]'::JSONB,
    '{
        "required": ["quantity","secret_pizza_name","price"],
        "optional": [],
        "types": {
            "price": "currency",
            "quantity": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'guerilla_window_marketing',
        'Guerrilla Window Marketing',
        'Foggy car window messaging with neon reflections and rainy ambiance.',
        'instagram',
        '{"primary":"#0D3B66","secondary":"#F95738","accent":"#EEF4ED"}'::JSONB,
        '{"headline":"Antonio","body":"Inter"}'::JSONB,
        '["#streetmarketing","#rainynight","#pizzalove"]'::JSONB,
        '{
            "style_adjectives":["rainy neon","urban reflections","handwritten fog","street energy"],
            "texture_options":["raindrops","fogged glass","neon bokeh"],
            "palette_swaps":[["#0D3B66","#F95738"],["#1C2541","#3A506B"]],
            "camera_styles":["street documentary","angled exterior","close-up message"]
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
    'foggy_window_message',
    'Foggy Window Guerilla',
    'pizza',
    'instagram',
    'base',
    $$Nighttime rainy street shot. Fogged-up car window with finger-written + chalk marker message visible from outside:  “Best pizza in the city → {{directions}}”  “{{restaurant_name}}”  “{{todays_special}}” + pizza doodle  Blurry neon {{restaurant_name}} sign reflecting, raindrops, authentic viral marketing gold.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Rainy Window Teaser',
    '["rainy","neon","street_marketing"]'::JSONB,
    '{
        "required": ["directions","restaurant_name","todays_special"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'brick_wall_popups',
        'Brick Wall Pop-Ups',
        'Large-format brick wall chalkboard for multi-course events.',
        'instagram',
        '{"primary":"#E07A5F","secondary":"#3D405B","accent":"#F2CC8F"}'::JSONB,
        '{"headline":"Oswald","body":"PT Sans"}'::JSONB,
        '["#popupdinner","#winepairing","#soldout"]'::JSONB,
        '{
            "style_adjectives":["packed crowd","string lights","ornate chalk typography","celebratory energy"],
            "texture_options":["brick texture","chalk dust","motion blur"],
            "palette_swaps":[["#E07A5F","#3D405B"],["#8D99AE","#EDF2F4"]],
            "camera_styles":["wide crowd","mid shot wall","over-the-shoulder"]
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
    'brick_wall_popup_event',
    'Brick Wall Pop-Up Chalkboard',
    'pizza',
    'instagram',
    'base',
    $$Wide cinematic shot inside packed restaurant. Entire exposed-brick wall is a giant ornate chalkboard announcing:  “{{event_title}}”  “{{subtitle}} – {{date}} – ${{price}} pp”  5-course menu with wine pairings listed in beautiful typography and illustrations. String lights, smiling crowd in foreground, pure sold-out FOMO.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Brick Wall Pop-Up',
    '["wide_event","chalkwall","crowd_energy"]'::JSONB,
    '{
        "required": ["event_title","subtitle","date","price"],
        "optional": [],
        "types": {
            "date": "date",
            "price": "currency"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'oven_dome_heat',
        'Oven Dome Heat',
        'Blazing oven dome chalk callouts highlighting temperature prowess.',
        'instagram',
        '{"primary":"#FF7F50","secondary":"#FFD166","accent":"#2D3142"}'::JSONB,
        '{"headline":"League Spartan","body":"Muli"}'::JSONB,
        '["#woodfiredpizza","#leopardcrust","#ovenready"]'::JSONB,
        '{
            "style_adjectives":["fire glow","heat shimmer","brick patina","temperature flex"],
            "texture_options":["ember sparks","smoke wisps","lens flare"],
            "palette_swaps":[["#FF7F50","#FFD166"],["#EF233C","#FFB703"]],
            "camera_styles":["macro oven","angled dome","firebox close-up"]
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
    'chalk_on_oven_dome',
    'Chalk on Wood-Fired Oven',
    'pizza',
    'instagram',
    'base',
    $$Close-up of blazing brick pizza oven dome. Heat-resistant white/yellow chalk directly on bricks:  “Tonight the oven is running {{temperature}} – perfect leopard-spotted crust”  Small flame thermometer doodle. Visible flames inside, flour on floor, heat shimmer, the most badass pizza photo possible.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Oven Dome Flex',
    '["fire","oven","chalk","temperature"]'::JSONB,
    '{
        "required": ["temperature"],
        "optional": [],
        "types": {
            "temperature": "string"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'take_home_dessert',
        'Take-Home Dessert',
        'Mason jar tiramisu tray ready for upsell photos.',
        'instagram',
        '{"primary":"#F2E9E4","secondary":"#C9ADA7","accent":"#4A4E69"}'::JSONB,
        '{"headline":"Quicksand","body":"Work Sans"}'::JSONB,
        '["#dessertporn","#tiramisu","#takehome"]'::JSONB,
        '{
            "style_adjectives":["soft window light","cocoa dust","tray presentation","cozy textures"],
            "texture_options":["cocoa smudge","linen folds","bokeh glow"],
            "palette_swaps":[["#F2E9E4","#C9ADA7"],["#FFF1E6","#BC8A5F"]],
            "camera_styles":["top-down","45-degree dessert","macro bite"]
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
    'take_home_tiramisu',
    'Take-Home Tiramisu Tray',
    'pizza',
    'instagram',
    'base',
    $$Top-down natural-light shot. Wooden tray holding 8 mason jars of layered tiramisu dusted with cocoa. Small chalkboard sign in center dusted with cocoa “chalk smudges”:  “Take-Home Tiramisu – ${{single_price}} each”  “or {{bundle_quantity}} for ${{bundle_price}}”  Spoon in one jar, soft window light, instantly shareable dessert porn.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Tiramisu Upsell',
    '["dessert","top_down","chalk_sign"]'::JSONB,
    '{
        "required": ["single_price","bundle_quantity","bundle_price"],
        "optional": [],
        "types": {
            "single_price": "currency",
            "bundle_price": "currency",
            "bundle_quantity": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'monthly_signature_pie',
        'Monthly Signature Pie',
        'Vintage scale balancing pizza of the month with seasonal props.',
        'instagram',
        '{"primary":"#D4A373","secondary":"#CCD5AE","accent":"#6B705C"}'::JSONB,
        '{"headline":"Josefin Sans","body":"Merriweather"}'::JSONB,
        '["#pizzaofthemonth","#seasonalslice","#limitedrun"]'::JSONB,
        '{
            "style_adjectives":["golden-hour warmth","vintage brass","seasonal props","balanced composition"],
            "texture_options":["light leaks","dust motes","film grain"],
            "palette_swaps":[["#D4A373","#CCD5AE"],["#BC6C25","#F4A261"]],
            "camera_styles":["side profile","hero close-up","45-degree product"]
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
    'pizza_of_month_scale',
    'Pizza of the Month Scale',
    'pizza',
    'instagram',
    'base',
    $$Golden-hour shot. Antique brass scale with gorgeous {{monthly_pizza}} perfectly balanced on one side. Hanging chalkboard tag:  “{{month}} Pizza of the Month – {{pizza_name}}”  Ingredients: {{ingredient_list}}  ${{price}}  “Only {{quantity}} made daily”  Autumn leaves scattered (or seasonal props), warm wood background.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Pizza of the Month',
    '["seasonal","vintage","scale"]'::JSONB,
    '{
        "required": ["monthly_pizza","month","pizza_name","price","quantity","ingredient_list"],
        "optional": [],
        "types": {
            "price": "currency",
            "quantity": "integer"
        }
    }'::JSONB
FROM theme;

WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pizza',
        'waitlist_social_proof',
        'Waitlist Social Proof',
        'Host stand chalkboard flexing sold-out nights and online ordering.',
        'instagram',
        '{"primary":"#8D99AE","secondary":"#EDF2F4","accent":"#EF233C"}'::JSONB,
        '{"headline":"Montserrat","body":"Poppins"}'::JSONB,
        '["#fullybooked","#hoststand","#linkinbio"]'::JSONB,
        '{
            "style_adjectives":["entrance glow","crowd blur","chalkboard pop","hospitality vibe"],
            "texture_options":["motion blur","light trails","chalk dust"],
            "palette_swaps":[["#8D99AE","#EF233C"],["#2B2D42","#F8F9FA"]],
            "camera_styles":["host stand close-up","crowd background","entrance angle"]
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
    'host_stand_waitlist',
    'Host Stand Waitlist Flex',
    'pizza',
    'instagram',
    'base',
    $$Intimate shot of packed restaurant entrance. A-frame chalkboard at host stand:  “Fully committed tonight – next table {{time}}”  “Or order online & skip the wait → {{online_callout}}”  Blurred happy crowd laughing in background, candles glowing, turns a wait into social proof marketing.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Host Stand Flex',
    '["entrance","crowd","chalkboard"]'::JSONB,
    '{
        "required": ["time","online_callout"],
        "optional": [],
        "types": {
            "time": "string"
        }
    }'::JSONB
FROM theme;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

