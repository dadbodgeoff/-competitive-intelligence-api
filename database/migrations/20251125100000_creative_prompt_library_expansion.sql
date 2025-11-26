-- ============================================================================
-- MIGRATION: Creative Prompt Library Expansion
-- ============================================================================
-- Description : Adds 50+ new themes and templates across 20 restaurant categories
--               including Fine Dining, BBQ, Seafood, Asian, Mexican, Brunch,
--               Events, Behind-the-Scenes, Seasonal, and more.
-- Author      : Kiro
-- Date        : 2025-11-25
-- Dependencies: 20251122221000_creative_theme_support.sql
-- ============================================================================

-- First, add a unique constraint on templates if it doesn't exist
-- This allows safe re-runs of the migration
CREATE UNIQUE INDEX IF NOT EXISTS idx_creative_templates_slug_unique
    ON creative_prompt_templates(slug)
    WHERE account_id IS NULL;

-- ============================================================================
-- PART 1: FINE DINING COLLECTION
-- ============================================================================

-- Theme: Fine Dining Tasting Menu
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'fine_dining',
    'fine_dining_tasting',
    'Fine Dining Tasting Menu',
    'Elegant candlelit scenes for tasting menus, wine pairings, and chef''s table experiences.',
    'instagram',
    '{"primary":"#FFFFFF","secondary":"#722F37","accent":"#D4AF37"}'::JSONB,
    '{"headline":"Cormorant Garamond","body":"Lato"}'::JSONB,
    '["#finedining","#tastingmenu","#chefstable","#datenight"]'::JSONB,
    '{
        "style_adjectives":["candlelit intimate warmth","crisp linen texture","refined understated elegance","Michelin-worthy presentation"],
        "texture_options":["linen weave visible in light","wine glass condensation beads","gold foil catching candlelight"],
        "palette_swaps":[["#FFFFFF","#722F37"],["#F5F5DC","#2F4F4F"],["#FFFAF0","#8B4513"]],
        "camera_styles":["overhead flat lay centered","45-degree intimate angle","eye-level across table"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Template: Fine Dining Tasting Menu
INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'fine_dining_tasting_menu',
    'White Tablecloth Tasting Menu',
    'fine_dining',
    'instagram',
    'base',
    $PROMPT$Intimate overhead photograph of a pristine white linen tablecloth corner at an upscale restaurant during evening service. Natural candlelight flickers across the scene, casting warm golden pools of light.

A leather-bound menu card with subtle gold foil embossing lies open, displaying elegant typography:

"{{event_name}}"
"{{course_count}}-Course Tasting Experience"
"${{price_per_guest}} per guest"

• {{course1_name}}
• {{course2_name}}
• {{course3_name}}
• {{course4_name}}

"{{reservation_cta}}"

A single perfect amuse-bouche rests on a handcrafted ceramic plate—micro greens with edible flowers, a single droplet of reduction catching the light. A crystal wine glass filled with deep burgundy wine sits nearby, condensation just beginning to form on the stem.

Fresh seasonal flowers in a small brass vase occupy the soft-focus background. The white tablecloth shows subtle texture from professional pressing. Polished silverware reflects the ambient candlelight.

Shot with shallow depth of field, the menu card sharp while the background falls into creamy bokeh. Warm color temperature around 3200K. The feeling of an intimate celebration about to begin.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'),
    'Tasting Menu Card',
    '["fine_dining","candlelit","elegant","tasting_menu"]'::JSONB,
    '{
        "required": ["event_name", "course_count", "price_per_guest"],
        "optional": ["course1_name", "course2_name", "course3_name", "course4_name", "reservation_cta"],
        "types": {"price_per_guest": "currency", "course_count": "integer"},
        "defaults": {"course1_name": "Seasonal Amuse", "course2_name": "Garden Composition", "course3_name": "Ocean Selection", "course4_name": "Chef''s Finale", "reservation_cta": "Reserve Your Evening"},
        "examples": {"event_name": "Autumn Harvest Dinner", "course_count": "5", "price_per_guest": "185"}
    }'::JSONB,
    'Elegant tasting menu announcement with candlelit fine dining atmosphere and leather-bound menu card.',
    'Special Event',
    ARRAY['Tasting Menus', 'Prix Fixe Dinners', 'Wine Dinners']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'fine_dining_tasting_menu');


-- Template: Chef's Table Kitchen Pass
INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'chefs_table_kitchen_pass',
    'Chef''s Table Kitchen Pass',
    'fine_dining',
    'instagram',
    'base',
    $PROMPT$Eye-level photograph through the pass window into an open kitchen during service. Polished copper pans hang above, catching the warm kitchen light. A chef in crisp whites plates a dish with tweezers, focused and precise.

A small slate board propped against the stainless steel pass reads in white chalk:

"{{headline}}"
"Tonight's Chef's Table"
• {{dish1}} – {{description1}}
• {{dish2}} – {{description2}}
"{{seats_remaining}} seats remaining"

Steam rises from the plate being assembled, kitchen flames dance softly in the background. Motion-blurred line cooks work in the background, creating a sense of controlled chaos and professional energy.

The pass window frames the scene like a theater, with the chef as the performer. Warm tungsten lighting from the kitchen contrasts with cooler ambient light in the dining room. Sharp focus on the slate board and the dish being plated, with the background activity falling into soft focus.

Professional kitchen energy meets intimate dining experience. The feeling of being invited backstage at a culinary performance.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'),
    'Kitchen Pass View',
    '["fine_dining","kitchen","chefs_table","action"]'::JSONB,
    '{
        "required": ["headline", "dish1", "dish2"],
        "optional": ["description1", "description2", "seats_remaining"],
        "types": {"seats_remaining": "integer"},
        "defaults": {"description1": "locally sourced", "description2": "house specialty", "seats_remaining": "4"},
        "examples": {"headline": "Behind the Pass", "dish1": "Wagyu Tartare", "dish2": "Butter-Poached Lobster"}
    }'::JSONB,
    'Dynamic kitchen pass view with chef plating and slate board menu for chef''s table experiences.',
    'Experience Promo',
    ARRAY['Chef''s Table', 'Kitchen Tours', 'Special Experiences']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'chefs_table_kitchen_pass');

-- Template: Wine Pairing Announcement
INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'wine_pairing_announcement',
    'Wine Pairing Announcement',
    'fine_dining',
    'instagram',
    'base',
    $PROMPT$Dramatic side-lit photograph of a wine bottle and crystal decanter on a marble surface. The wine catches the light, revealing deep burgundy tones with ruby highlights at the edges.

An elegant calligraphy card on heavy cream stock leans against the bottle:

"{{wine_name}}"
"Paired with {{dish_name}}"
"{{tasting_notes}}"
"${{pairing_price}} with any entrée"

The decanter shows the wine breathing, with subtle legs forming on the glass. A single wine glass in the background, partially filled, catches a reflection of candlelight. The marble surface shows natural veining, adding texture and luxury.

Soft candlelight bokeh in the background suggests an intimate dining room. The lighting is dramatic but not harsh—a single source from the side creating depth and dimension. The overall feeling is of a sommelier's recommendation, trusted and refined.

Shot with a 50mm lens equivalent, shallow depth of field keeping the card and bottle sharp while the background falls away. Color grading leans warm with preserved deep reds.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fine_dining_tasting'),
    'Wine Pairing Feature',
    '["wine","pairing","elegant","sommelier"]'::JSONB,
    '{
        "required": ["wine_name", "dish_name", "pairing_price"],
        "optional": ["tasting_notes"],
        "types": {"pairing_price": "currency"},
        "defaults": {"tasting_notes": "Notes of dark cherry, tobacco, and earth"},
        "examples": {"wine_name": "2019 Barolo Riserva", "dish_name": "Braised Short Rib", "pairing_price": "28"}
    }'::JSONB,
    'Sophisticated wine pairing announcement with dramatic lighting and sommelier-style presentation.',
    'Beverage Feature',
    ARRAY['Wine Pairings', 'Sommelier Picks', 'Special Bottles']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'wine_pairing_announcement');

-- ============================================================================
-- PART 2: FAST CASUAL COLLECTION
-- ============================================================================

-- Theme: Fast Casual Fresh
INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'fast_casual',
    'fast_casual_fresh',
    'Fast Casual Fresh',
    'Bright, energetic scenes for build-your-own concepts and grab-and-go displays.',
    'instagram',
    '{"primary":"#4CAF50","secondary":"#FFFFFF","accent":"#FF9800"}'::JSONB,
    '{"headline":"Poppins","body":"Open Sans"}'::JSONB,
    '["#fastcasual","#healthyeats","#buildyourown","#freshfood"]'::JSONB,
    '{
        "style_adjectives":["bright natural daylight","clean modern lines","fresh ingredient colors","energetic atmosphere"],
        "texture_options":["stainless steel gleam","fresh vegetable textures","condensation on glass"],
        "palette_swaps":[["#4CAF50","#FF9800"],["#2196F3","#FFC107"],["#8BC34A","#E91E63"]],
        "camera_styles":["wide counter shot","eye-level customer view","overhead ingredient display"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = NOW();

-- Template: Order Counter Chalkboard
INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'order_counter_chalkboard',
    'Order Counter Chalkboard',
    'fast_casual',
    'instagram',
    'base',
    $PROMPT$Wide photograph of a busy fast-casual counter during lunch rush. Customers in soft focus queue in the background, creating a sense of popularity and energy. Natural daylight streams through large windows.

A large A-frame chalkboard dominates the foreground, hand-lettered in colorful chalk:

"{{headline}}"
BUILD YOUR OWN:
1. {{base_option}} – ${{base_price}}
2. {{protein_option}} – +${{protein_price}}
3. {{topping_option}} – FREE
"{{speed_promise}}"

Behind the counter, colorful bowls are being assembled by staff in branded aprons. Fresh ingredients in stainless steel containers are visible—vibrant greens, grains, proteins. The counter is clean and organized, suggesting efficiency.

The lighting is bright and welcoming—natural daylight supplemented by modern pendant lights. The color palette is fresh and healthy: greens, whites, natural wood tones. The overall feeling is quick-service energy with artisan quality.

Shot at eye level, the chalkboard sharp and readable, with the activity behind falling into a pleasant blur that suggests bustling business.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'),
    'Build Your Own Board',
    '["fast_casual","chalkboard","build_your_own","lunch"]'::JSONB,
    '{
        "required": ["headline", "base_option", "base_price"],
        "optional": ["protein_option", "protein_price", "topping_option", "speed_promise"],
        "types": {"base_price": "currency", "protein_price": "currency"},
        "defaults": {"protein_option": "Add Protein", "protein_price": "4", "topping_option": "Unlimited Toppings", "speed_promise": "Ready in 5 minutes"},
        "examples": {"headline": "Build Your Bowl", "base_option": "Grain Base", "base_price": "9.50"}
    }'::JSONB,
    'Energetic fast-casual counter scene with build-your-own menu on A-frame chalkboard.',
    'Daily Menu',
    ARRAY['Bowl Concepts', 'Build Your Own', 'Lunch Rush']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'order_counter_chalkboard');

-- Template: Grab-and-Go Cooler
INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'grab_and_go_cooler',
    'Grab-and-Go Cooler Display',
    'fast_casual',
    'instagram',
    'base',
    $PROMPT$Close-up photograph of a refrigerated display case with condensation forming on the glass. The fog creates a fresh, just-stocked feeling. LED strip lighting illuminates the contents from above.

Finger-wiped text through the condensation reveals:

"{{headline}}"
• {{item1}} – ${{price1}}
• {{item2}} – ${{price2}}
• {{item3}} – ${{price3}}
"{{freshness_claim}}"

Through the glass, colorful salads in clear containers are visible—vibrant greens, purple cabbage, orange carrots, white quinoa. Wraps in kraft paper sleeves, sandwiches in eco-friendly packaging. Everything looks fresh and appetizing.

The condensation beads catch the light, adding texture and suggesting cold freshness. The display is well-organized, with items neatly arranged and facing forward. Price tags are visible but secondary to the food.

Shot straight-on at the display, shallow depth of field keeping the finger-written text sharp while the products behind have a slight soft focus. The overall feeling is healthy, convenient, grab-and-go freshness.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'fast_casual_fresh'),
    'Cooler Display',
    '["grab_and_go","fresh","cooler","healthy"]'::JSONB,
    '{
        "required": ["headline", "item1", "price1"],
        "optional": ["item2", "price2", "item3", "price3", "freshness_claim"],
        "types": {"price1": "currency", "price2": "currency", "price3": "currency"},
        "defaults": {"item2": "Protein Bowl", "price2": "12", "item3": "Fresh Wrap", "price3": "10", "freshness_claim": "Made Fresh Daily"},
        "examples": {"headline": "Grab & Go", "item1": "Garden Salad", "price1": "9"}
    }'::JSONB,
    'Fresh grab-and-go cooler display with condensation effect and finger-written specials.',
    'Convenience',
    ARRAY['Grab and Go', 'Healthy Options', 'Quick Lunch']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'grab_and_go_cooler');


-- ============================================================================
-- PART 3: BAKERY & CAFÉ COLLECTION
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'bakery',
    'bakery_morning_light',
    'Bakery Morning Light',
    'Warm golden morning scenes for pastry cases, custom cakes, and coffee menus.',
    'instagram',
    '{"primary":"#D4A574","secondary":"#FFFFFF","accent":"#8B4513"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lora"}'::JSONB,
    '["#bakery","#freshbaked","#pastry","#coffeeshop"]'::JSONB,
    '{
        "style_adjectives":["golden morning warmth","flour dust in light beams","cozy neighborhood feel","artisan craftsmanship"],
        "texture_options":["flaky pastry layers","powdered sugar dust","warm wood grain"],
        "palette_swaps":[["#D4A574","#8B4513"],["#F5DEB3","#654321"],["#FFE4C4","#A0522D"]],
        "camera_styles":["pastry case angle","overhead flat lay","warm interior wide"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'pastry_case_morning',
    'Pastry Case Morning Light',
    'bakery',
    'instagram',
    'base',
    $PROMPT$Golden morning light streaming through a bakery window onto a glass pastry case. Dust motes float in the light beams, creating a magical, early-morning atmosphere. The warmth of fresh baking fills the scene.

A small chalkboard easel on the counter displays in white and pink chalk:

"{{headline}}"
Fresh This Morning:
• {{pastry1}} – ${{price1}}
• {{pastry2}} – ${{price2}}
• {{pastry3}} – ${{price3}}
"{{coffee_pairing}}"

Inside the case, croissants with visible flaky layers catch the light, their golden-brown surfaces glistening. Pain au chocolat with chocolate peeking through, fruit danishes with glazed tops, cinnamon rolls with cream cheese frosting. Powdered sugar dust settles on some items.

The counter is warm wood, worn smooth from years of service. A small vase with a single flower adds a homey touch. The background shows the bakery interior in soft focus—more pastries, a coffee machine, perhaps a customer at the register.

Shot at a slight angle to show both the chalkboard and the case contents. Warm color temperature emphasizing the golden morning light. The feeling of a neighborhood bakery just opening for the day.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    'Morning Pastry Case',
    '["bakery","morning","pastry","golden_hour"]'::JSONB,
    '{
        "required": ["headline", "pastry1", "price1"],
        "optional": ["pastry2", "price2", "pastry3", "price3", "coffee_pairing"],
        "types": {"price1": "currency", "price2": "currency", "price3": "currency"},
        "defaults": {"pastry2": "Pain au Chocolat", "price2": "4.50", "pastry3": "Almond Croissant", "price3": "5", "coffee_pairing": "Pairs perfectly with our house blend"},
        "examples": {"headline": "Baked Fresh", "pastry1": "Butter Croissant", "price1": "3.75"}
    }'::JSONB,
    'Warm morning bakery scene with golden light streaming onto pastry case and chalkboard menu.',
    'Daily Feature',
    ARRAY['Morning Specials', 'Pastry Features', 'Bakery Marketing']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'pastry_case_morning');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'custom_cake_showcase',
    'Custom Cake Showcase',
    'bakery',
    'instagram',
    'base',
    $PROMPT$Hero photograph of a stunning custom cake on a marble pedestal stand. Soft studio-style lighting creates gentle shadows and highlights the cake's details. The background is clean and uncluttered.

An elegant tent card in front of the cake reads in gold script:

"{{headline}}"
"Custom Cakes for {{occasion}}"
Starting at ${{base_price}}
"{{lead_time}} advance notice required"
"{{contact_cta}}"

The cake itself is a work of art—smooth fondant or textured buttercream, delicate sugar flowers, perhaps gold leaf accents or fresh berries. The craftsmanship is evident in every detail. A cake server and small plates nearby suggest it's ready to be served.

Scattered edible flowers and a few loose petals on the marble surface add organic beauty. The lighting is soft and flattering, no harsh shadows. The color palette is elegant—whites, creams, soft pastels, with pops of color from decorations.

Shot at a slight angle to show the cake's height and dimension. Shallow depth of field keeps the cake and card sharp while the background falls away. The feeling is celebration-ready, special occasion worthy.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    'Custom Cake Feature',
    '["cake","custom","celebration","elegant"]'::JSONB,
    '{
        "required": ["headline", "occasion", "base_price"],
        "optional": ["lead_time", "contact_cta"],
        "types": {"base_price": "currency"},
        "defaults": {"lead_time": "72-hour", "contact_cta": "Call to order"},
        "examples": {"headline": "Made to Celebrate", "occasion": "Your Special Day", "base_price": "85"}
    }'::JSONB,
    'Elegant custom cake showcase with marble pedestal and celebration-ready presentation.',
    'Special Orders',
    ARRAY['Custom Cakes', 'Wedding Cakes', 'Celebration Orders']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'custom_cake_showcase');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'coffee_menu_board',
    'Coffee Menu Board',
    'cafe',
    'instagram',
    'base',
    $PROMPT$Warm interior photograph of a coffee bar with espresso machine steam rising in the background. The scene captures the essence of a specialty coffee shop—craft, care, and community.

A large wooden menu board with hand-painted white lettering dominates the frame:

"{{headline}}"
ESPRESSO
• {{drink1}} – ${{price1}}
• {{drink2}} – ${{price2}}
SPECIALTY
• {{drink3}} – ${{price3}}
• {{drink4}} – ${{price4}}
"{{seasonal_special}}"

In the foreground, a perfectly poured latte with intricate latte art sits on a ceramic saucer. Coffee beans are scattered artfully on the wooden counter. The barista's hands are visible in motion blur, working the espresso machine.

The lighting is warm and inviting—a mix of natural light from windows and warm Edison bulbs. The color palette is earthy: wood tones, cream, coffee browns, with pops of green from plants. The espresso machine gleams, well-maintained and professional.

Shot at eye level, the menu board readable and the latte art visible. The background activity creates energy without distraction. The feeling is of a third-wave coffee shop where craft matters.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bakery_morning_light'),
    'Coffee Shop Menu',
    '["coffee","cafe","espresso","latte_art"]'::JSONB,
    '{
        "required": ["headline", "drink1", "price1", "drink2", "price2"],
        "optional": ["drink3", "price3", "drink4", "price4", "seasonal_special"],
        "types": {"price1": "currency", "price2": "currency", "price3": "currency", "price4": "currency"},
        "defaults": {"drink3": "Cortado", "price3": "4.50", "drink4": "Cold Brew", "price4": "5", "seasonal_special": "Ask about our seasonal special"},
        "examples": {"headline": "Crafted Daily", "drink1": "Espresso", "price1": "3", "drink2": "Americano", "price2": "3.50"}
    }'::JSONB,
    'Third-wave coffee shop scene with wooden menu board and latte art in foreground.',
    'Beverage Menu',
    ARRAY['Coffee Shops', 'Espresso Bars', 'Cafe Marketing']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'coffee_menu_board');

-- ============================================================================
-- PART 4: BBQ & SMOKEHOUSE COLLECTION
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'bbq',
    'bbq_smokehouse',
    'BBQ Smokehouse',
    'Authentic smoky scenes with dramatic lighting, butcher paper, and pitmaster craftsmanship.',
    'instagram',
    '{"primary":"#8B0000","secondary":"#D2691E","accent":"#F5DEB3"}'::JSONB,
    '{"headline":"Oswald","body":"Roboto Slab"}'::JSONB,
    '["#bbq","#smokehouse","#lowandslowbbq","#pitmaster"]'::JSONB,
    '{
        "style_adjectives":["smoky dramatic atmosphere","ember glow warmth","authentic pitmaster craft","rustic wood textures"],
        "texture_options":["billowing smoke","meat bark detail","butcher paper grain"],
        "palette_swaps":[["#8B0000","#D2691E"],["#4A0E0E","#CD853F"],["#722F37","#DEB887"]],
        "camera_styles":["smoker door dramatic","overhead platter","meat counter eye-level"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'smoker_door_announcement',
    'Smoker Door Announcement',
    'bbq',
    'instagram',
    'base',
    $PROMPT$Dramatic photograph of a commercial smoker with the door cracked open, smoke billowing out into the frame. The smoke catches the light, creating depth and atmosphere. Orange ember glow is visible inside.

Heat-resistant chalk on the smoker door reads:

"{{headline}}"
"Smoked {{hours}} hours over {{wood_type}}"
• {{meat1}} – ${{price1}}/lb
• {{meat2}} – ${{price2}}/lb
"{{sellout_warning}}"

Through the cracked door, meat is visible on the racks—brisket with a dark bark, ribs glistening, perhaps a whole pork shoulder. The smoke rings are visible on the meat closest to the opening. A pitmaster's gloved hand rests on the door handle.

The lighting is dramatic—the warm glow from inside the smoker contrasting with the cooler ambient light outside. The smoker itself shows use: seasoned metal, some char marks, clearly a working piece of equipment, not a prop.

Shot at eye level with the smoker door, the chalk text readable through the smoke. The feeling is of authentic BBQ craftsmanship, low and slow, worth the wait.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'),
    'Smoker Door Feature',
    '["bbq","smoker","pitmaster","dramatic"]'::JSONB,
    '{
        "required": ["headline", "hours", "wood_type", "meat1", "price1"],
        "optional": ["meat2", "price2", "sellout_warning"],
        "types": {"price1": "currency", "price2": "currency", "hours": "integer"},
        "defaults": {"meat2": "Pulled Pork", "price2": "16", "sellout_warning": "First come, first served"},
        "examples": {"headline": "Low & Slow", "hours": "14", "wood_type": "Post Oak", "meat1": "Brisket", "price1": "24"}
    }'::JSONB,
    'Dramatic smoker door shot with billowing smoke and pitmaster authenticity.',
    'Daily Feature',
    ARRAY['BBQ Specials', 'Pitmaster Features', 'Smokehouse Marketing']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'smoker_door_announcement');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'butcher_paper_bbq_platter',
    'Butcher Paper BBQ Platter',
    'bbq',
    'instagram',
    'base',
    $PROMPT$Overhead photograph of a loaded BBQ platter on brown butcher paper. The paper is spread across a wooden table, edges crinkled and slightly grease-stained from the feast. This is BBQ done right.

Black marker directly on the butcher paper labels each item:

"{{headline}}"
← {{meat1}}
← {{meat2}}
← {{side1}} | {{side2}} →
"Feeds {{people}} – ${{price}}"

The meats are sliced and arranged: brisket showing perfect smoke rings, ribs with bones exposed, pulled pork in a mound. Sides in small paper cups: coleslaw, beans, mac and cheese, pickles. White bread slices, raw onion, jalapeños scattered around.

Sauce cups with different BBQ sauces—red, vinegar-based, maybe a mustard sauce. Smoke still rises from the freshly sliced meat. The abundance is the point—this is a feast meant for sharing.

Shot directly overhead, the entire spread visible. Natural lighting, perhaps from a window to the side creating soft shadows. The feeling is of a communal BBQ experience, friends and family gathering around.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'bbq_smokehouse'),
    'BBQ Feast Platter',
    '["bbq","platter","butcher_paper","feast"]'::JSONB,
    '{
        "required": ["headline", "meat1", "meat2", "people", "price"],
        "optional": ["side1", "side2"],
        "types": {"people": "integer", "price": "currency"},
        "defaults": {"side1": "Slaw", "side2": "Beans"},
        "examples": {"headline": "The Pitmaster''s Platter", "meat1": "Brisket", "meat2": "Ribs", "people": "4", "price": "65"}
    }'::JSONB,
    'Overhead BBQ feast on butcher paper with hand-labeled meats and communal presentation.',
    'Feast Feature',
    ARRAY['Party Platters', 'Family Meals', 'BBQ Feasts']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'butcher_paper_bbq_platter');


-- ============================================================================
-- PART 5: SEAFOOD COLLECTION
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'seafood',
    'seafood_fresh_catch',
    'Seafood Fresh Catch',
    'Ocean-fresh scenes with ice displays, raw bars, and coastal authenticity.',
    'instagram',
    '{"primary":"#1E3A5F","secondary":"#87CEEB","accent":"#FFD700"}'::JSONB,
    '{"headline":"Libre Baskerville","body":"Source Sans Pro"}'::JSONB,
    '["#seafood","#freshcatch","#rawbar","#oceantoplate"]'::JSONB,
    '{
        "style_adjectives":["ocean-fresh sparkle","ice crystal clarity","coastal authenticity","luxurious presentation"],
        "texture_options":["crushed ice crystals","shell textures","lemon wedge freshness"],
        "palette_swaps":[["#1E3A5F","#87CEEB"],["#2C3E50","#3498DB"],["#1A237E","#4FC3F7"]],
        "camera_styles":["ice display eye-level","tower low-angle","overhead raw bar"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'ice_display_fresh_catch',
    'Ice Display Fresh Catch',
    'seafood',
    'instagram',
    'base',
    $PROMPT$Eye-level photograph of a seafood ice display case with whole fish arranged on crushed ice. The ice crystals catch the light, creating sparkle and suggesting cold freshness. Lemon wedges and parsley garnish the display.

A small chalkboard stake planted in the ice reads:

"{{headline}}"
"Today's Catch"
• {{fish1}} – ${{price1}}/lb
• {{fish2}} – ${{price2}}/lb
"{{freshness_claim}}"

The fish are pristine—clear eyes, bright red gills, scales glistening. Whole fish are arranged artfully, perhaps a large salmon or snapper as the centerpiece. Shellfish might be visible: oysters, clams, mussels in their shells.

The display case is professional, stainless steel and glass. A fishmonger in a white coat and apron is visible in the background, perhaps filleting or arranging. The lighting is bright and clean, emphasizing freshness.

Shot at display level, the chalkboard readable, the fish looking as fresh as possible. The feeling is of a fish market or high-end seafood restaurant where quality is paramount. Ocean-to-table authenticity.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seafood_fresh_catch'),
    'Fresh Catch Display',
    '["seafood","fresh","ice_display","market"]'::JSONB,
    '{
        "required": ["headline", "fish1", "price1"],
        "optional": ["fish2", "price2", "freshness_claim"],
        "types": {"price1": "currency", "price2": "currency"},
        "defaults": {"fish2": "Local Catch", "price2": "Market Price", "freshness_claim": "Delivered fresh daily"},
        "examples": {"headline": "From the Boats", "fish1": "Wild Salmon", "price1": "28"}
    }'::JSONB,
    'Ocean-fresh seafood ice display with whole fish and market authenticity.',
    'Daily Fresh',
    ARRAY['Fish Markets', 'Daily Catch', 'Seafood Restaurants']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'ice_display_fresh_catch');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'raw_bar_tower',
    'Raw Bar Tower',
    'seafood',
    'instagram',
    'base',
    $PROMPT$Dramatic low-angle photograph of a tiered seafood tower on crushed ice. The tower rises impressively, three tiers of shellfish and crustaceans. Champagne flutes are visible in the soft-focus background.

An elegant tent card at the base of the tower displays:

"{{headline}}"
THE TOWER – ${{price}}
• {{item1_count}} {{item1}}
• {{item2_count}} {{item2}}
• {{item3_count}} {{item3}}
"{{pairing_suggestion}}"

The tower is loaded: oysters on the half shell with their liquor glistening, pink shrimp with tails curled, crab legs cracked and ready, perhaps lobster claws. Mignonette sauce, cocktail sauce, and lemon wedges are arranged around the base.

The ice is pristine, the seafood arranged with care. Condensation forms on the metal stand. The background suggests an upscale restaurant—white tablecloth, candlelight, perhaps a water view through windows.

Shot from below looking up at the tower, emphasizing its impressive height. The lighting is dramatic but appetizing. The feeling is of celebration, special occasion, worth-the-splurge indulgence.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seafood_fresh_catch'),
    'Seafood Tower',
    '["seafood","raw_bar","tower","celebration"]'::JSONB,
    '{
        "required": ["headline", "price", "item1_count", "item1"],
        "optional": ["item2_count", "item2", "item3_count", "item3", "pairing_suggestion"],
        "types": {"price": "currency", "item1_count": "integer", "item2_count": "integer", "item3_count": "integer"},
        "defaults": {"item2_count": "6", "item2": "Jumbo Shrimp", "item3_count": "2", "item3": "Lobster Tails", "pairing_suggestion": "Pairs perfectly with Champagne"},
        "examples": {"headline": "The Grand Plateau", "price": "125", "item1_count": "12", "item1": "East Coast Oysters"}
    }'::JSONB,
    'Impressive tiered seafood tower with oysters, shrimp, and celebration presentation.',
    'Celebration Feature',
    ARRAY['Raw Bars', 'Special Occasions', 'Seafood Towers']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'raw_bar_tower');

-- ============================================================================
-- PART 6: MEXICAN & TAQUERIA COLLECTION
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'mexican',
    'mexican_street_food',
    'Mexican Street Food',
    'Vibrant taqueria scenes with papel picado, trompo action, and fiesta energy.',
    'instagram',
    '{"primary":"#E63946","secondary":"#F4A261","accent":"#2A9D8F"}'::JSONB,
    '{"headline":"Bebas Neue","body":"Montserrat"}'::JSONB,
    '["#tacos","#mexicanfood","#taqueria","#streettacos"]'::JSONB,
    '{
        "style_adjectives":["vibrant fiesta colors","authentic street energy","sizzling action","papel picado festivity"],
        "texture_options":["cilantro freshness","lime juice drip","tortilla char marks"],
        "palette_swaps":[["#E63946","#2A9D8F"],["#D62828","#F77F00"],["#C1121F","#669BBC"]],
        "camera_styles":["taco truck window","overhead taco spread","trompo action shot"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'taco_truck_specials',
    'Taco Truck Specials',
    'mexican',
    'instagram',
    'base',
    $PROMPT$Vibrant photograph of a taco truck window with colorful papel picado banners strung above. The colors pop: pink, orange, green, yellow. The energy is festive and authentic.

A hand-painted menu board on the truck reads:

"{{headline}}"
TACOS
• {{taco1}} – ${{price1}}
• {{taco2}} – ${{price2}}
• {{taco3}} – ${{price3}}
"{{salsa_bar_note}}"

Through the window, the trompo is visible—al pastor meat rotating, pineapple on top, edges crisping. A cook works the flat-top, assembling tacos with practiced speed. Corn tortillas warm on the comal.

In the foreground, a tray of tacos is being handed out: double-stacked tortillas, generous meat portions, topped with cilantro and onion. Lime wedges on the side. The colors are vivid: red salsa, green cilantro, white onion, orange meat.

Shot at the service window, capturing both the menu and the action inside. The lighting is natural, perhaps late afternoon golden hour. The feeling is of authentic Mexican street food, the real deal.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'),
    'Taco Truck Menu',
    '["mexican","tacos","street_food","trompo"]'::JSONB,
    '{
        "required": ["headline", "taco1", "price1"],
        "optional": ["taco2", "price2", "taco3", "price3", "salsa_bar_note"],
        "types": {"price1": "currency", "price2": "currency", "price3": "currency"},
        "defaults": {"taco2": "Carnitas", "price2": "3.50", "taco3": "Barbacoa", "price3": "4", "salsa_bar_note": "Free salsa bar with every order"},
        "examples": {"headline": "Tacos de la Casa", "taco1": "Al Pastor", "price1": "3.50"}
    }'::JSONB,
    'Authentic taco truck scene with papel picado, trompo action, and vibrant street food energy.',
    'Street Food',
    ARRAY['Taco Trucks', 'Taquerias', 'Mexican Street Food']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'taco_truck_specials');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'margarita_happy_hour',
    'Margarita Happy Hour',
    'mexican',
    'instagram',
    'base',
    $PROMPT$Golden hour patio photograph with salt-rimmed margarita glasses in the foreground. The glasses catch the warm sunlight, the lime green liquid glowing. Condensation runs down the sides.

A colorful chalkboard sign on the table reads:

"{{headline}}"
"${{marg_price}} {{marg_type}} Margaritas"
"+ ${{upgrade_price}} for {{premium_option}}"
"{{time_restriction}}"

The margaritas are perfect: salt crystals visible on the rim, lime wheel garnish, maybe a jalapeño slice for a spicy version. A bowl of chips and fresh guacamole sits nearby, a lime wedge squeezed over the top.

The patio setting is festive: colorful tiles, maybe a painted mural visible, string lights beginning to glow as the sun sets. Other guests are visible in soft focus, enjoying drinks and conversation. The vibe is relaxed, celebratory.

Shot at table level, the margaritas prominent, the sign readable, the patio atmosphere providing context. The lighting is golden and warm. The feeling is of the perfect happy hour, fiesta vibes, good times ahead.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'mexican_street_food'),
    'Margarita Special',
    '["mexican","margarita","happy_hour","patio"]'::JSONB,
    '{
        "required": ["headline", "marg_price", "marg_type"],
        "optional": ["upgrade_price", "premium_option", "time_restriction"],
        "types": {"marg_price": "currency", "upgrade_price": "currency"},
        "defaults": {"upgrade_price": "3", "premium_option": "Top-Shelf Tequila", "time_restriction": "3-6pm Daily"},
        "examples": {"headline": "Margarita Hour", "marg_price": "7", "marg_type": "House"}
    }'::JSONB,
    'Golden hour patio scene with salt-rimmed margaritas and fiesta happy hour vibes.',
    'Happy Hour',
    ARRAY['Happy Hour', 'Margarita Specials', 'Patio Season']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'margarita_happy_hour');


-- ============================================================================
-- PART 7: ASIAN COLLECTION
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'asian',
    'asian_comfort',
    'Asian Comfort',
    'Steamy ramen bowls, elegant sushi, and dim sum spreads with authentic atmosphere.',
    'instagram',
    '{"primary":"#1A1A2E","secondary":"#E94560","accent":"#F5F5DC"}'::JSONB,
    '{"headline":"Noto Sans JP","body":"Inter"}'::JSONB,
    '["#ramen","#sushi","#dimsum","#asianfood"]'::JSONB,
    '{
        "style_adjectives":["dramatic steam rising","umami-rich presentation","Japanese minimalist elegance","communal sharing warmth"],
        "texture_options":["noodle texture detail","steam atmosphere","chopstick action"],
        "palette_swaps":[["#1A1A2E","#E94560"],["#2D2D44","#FF6B6B"],["#16213E","#E94560"]],
        "camera_styles":["ramen bowl close-up","sushi counter overhead","dim sum spread wide"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'ramen_steam_shot',
    'Ramen Steam Shot',
    'asian',
    'instagram',
    'base',
    $PROMPT$Dramatic close-up photograph of a steaming ramen bowl with chopsticks lifting noodles. Steam rises dramatically, catching the light and creating atmosphere. The bowl is deep and ceramic, traditional style.

A small wooden sign or table tent in the background reads:

"{{headline}}"
"{{broth_type}} Broth"
"{{hours}}-Hour Simmer"
"${{price}}"
"{{topping_customization}}"

The ramen is perfect: wavy noodles glistening, a soft-boiled egg cut in half revealing the jammy orange yolk, chashu pork slices with caramelized edges, nori sheet standing upright, green onions scattered, perhaps some corn or bamboo shoots.

The broth is rich and cloudy (tonkotsu) or clear and amber (shoyu), with small pools of chili oil floating on top. The bowl sits on a wooden counter or tray, perhaps with a spoon and extra condiments nearby.

Shot at bowl level, the steam prominent, the noodle lift creating action. The lighting is warm and moody, perhaps from above. The feeling is of comfort food perfection, a bowl worth waiting for.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'asian_comfort'),
    'Ramen Bowl Feature',
    '["ramen","steam","noodles","comfort"]'::JSONB,
    '{
        "required": ["headline", "broth_type", "price"],
        "optional": ["hours", "topping_customization"],
        "types": {"price": "currency", "hours": "integer"},
        "defaults": {"hours": "12", "topping_customization": "Add extra toppings +$2 each"},
        "examples": {"headline": "Soul in a Bowl", "broth_type": "Tonkotsu", "price": "16"}
    }'::JSONB,
    'Dramatic ramen bowl with rising steam, noodle lift, and umami-rich presentation.',
    'Signature Dish',
    ARRAY['Ramen Shops', 'Noodle Houses', 'Japanese Restaurants']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'ramen_steam_shot');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'sushi_omakase_board',
    'Sushi Omakase Board',
    'asian',
    'instagram',
    'base',
    $PROMPT$Elegant overhead photograph of a hinoki wood sushi counter. The blonde wood is pristine, showing subtle grain. The composition is minimal and intentional, every element placed with purpose.

A brushstroke-style menu card on handmade paper reads:

"{{headline}}"
"{{course_count}}-Piece Omakase"
"${{price}} per person"
"{{reservation_note}}"

Fresh nigiri are arranged in a precise line: salmon with its orange glow, tuna in deep red, yellowtail with its subtle pink, perhaps uni with its golden color, each piece a small work of art. The rice is perfectly formed, the fish draped just so.

A small dish of soy sauce, a mound of pickled ginger, a dab of wasabi complete the setting. The sushi chef's hands might be visible at the edge of frame, placing the final piece. A sake cup sits nearby.

Shot directly overhead, the arrangement geometric and intentional. The lighting is soft and even, no harsh shadows. The color palette is natural: wood tones, the colors of the fish, white rice. The feeling is of Japanese precision and respect for ingredients.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'asian_comfort'),
    'Omakase Experience',
    '["sushi","omakase","japanese","elegant"]'::JSONB,
    '{
        "required": ["headline", "course_count", "price"],
        "optional": ["reservation_note"],
        "types": {"price": "currency", "course_count": "integer"},
        "defaults": {"reservation_note": "Reservations required"},
        "examples": {"headline": "Chef''s Selection", "course_count": "12", "price": "95"}
    }'::JSONB,
    'Elegant sushi omakase presentation on hinoki wood with Japanese minimalist aesthetic.',
    'Premium Experience',
    ARRAY['Sushi Bars', 'Omakase', 'Japanese Fine Dining']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'sushi_omakase_board');

-- ============================================================================
-- PART 8: BRUNCH COLLECTION
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'brunch',
    'brunch_vibes',
    'Brunch Vibes',
    'Bright morning scenes with eggs Benedict, pancake stacks, and avocado toast aesthetics.',
    'instagram',
    '{"primary":"#F8B400","secondary":"#FFFFFF","accent":"#4A7C59"}'::JSONB,
    '{"headline":"Quicksand","body":"Nunito"}'::JSONB,
    '["#brunch","#weekendbrunch","#brunchtime","#sundaybrunch"]'::JSONB,
    '{
        "style_adjectives":["bright morning light","indulgent weekend vibes","Instagram-worthy presentation","leisurely atmosphere"],
        "texture_options":["hollandaise drizzle","syrup pour","avocado smash"],
        "palette_swaps":[["#F8B400","#4A7C59"],["#FFD93D","#6BCB77"],["#FFC300","#2D6A4F"]],
        "camera_styles":["hero plate angle","overhead flat lay","sauce pour action"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'eggs_benedict_hero',
    'Eggs Benedict Hero',
    'brunch',
    'instagram',
    'base',
    $PROMPT$Close-up hero photograph of eggs Benedict with hollandaise sauce being drizzled from above. The sauce catches the light, golden and glossy, pooling around the perfectly poached eggs. The yolk is about to be broken.

A small table tent or menu card reads:

"{{headline}}"
"{{dish_name}}"
"${{price}}"
"{{description}}"
"{{brunch_hours}}"

The Benedict is classic: toasted English muffin, Canadian bacon or smoked salmon visible at the edges, poached eggs with whites set and yolks still runny, hollandaise coating everything. Fresh chives are scattered on top.

The plate sits on a marble table or wooden surface. A mimosa or bloody mary is visible in soft focus, along with a coffee cup. Natural morning light streams in from a window, creating a bright, fresh feeling.

Shot at plate level, the sauce drizzle creating action and appetite appeal. The lighting is bright and airy, weekend morning vibes. The feeling is of a leisurely brunch, no rush, pure indulgence.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'brunch_vibes'),
    'Eggs Benedict Feature',
    '["brunch","eggs_benedict","hollandaise","indulgent"]'::JSONB,
    '{
        "required": ["headline", "dish_name", "price"],
        "optional": ["description", "brunch_hours"],
        "types": {"price": "currency"},
        "defaults": {"description": "House-made hollandaise, farm-fresh eggs", "brunch_hours": "Brunch served Sat-Sun 9am-2pm"},
        "examples": {"headline": "Weekend Indulgence", "dish_name": "Classic Eggs Benedict", "price": "18"}
    }'::JSONB,
    'Indulgent eggs Benedict with hollandaise drizzle action and weekend brunch atmosphere.',
    'Signature Dish',
    ARRAY['Brunch Specials', 'Eggs Benedict', 'Weekend Features']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'eggs_benedict_hero');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'avocado_toast_flatlay',
    'Avocado Toast Flat Lay',
    'brunch',
    'instagram',
    'base',
    $PROMPT$Overhead flat lay photograph of artfully arranged avocado toast on a ceramic plate. The composition is intentional, every element placed for visual impact. The colors pop: green avocado, white plate, colorful toppings.

A small card or branded napkin reads:

"{{headline}}"
"{{toast_name}}"
"${{price}}"
"{{add_ons}}"

The toast is on thick-cut sourdough, perfectly toasted with visible char marks. The avocado is smashed but chunky, bright green. Toppings are artfully arranged: everything bagel seasoning, microgreens, radish slices, a poached egg with runny yolk, chili flakes, flaky salt.

The plate sits on a marble surface or light wood table. A latte with art is nearby, perhaps a small succulent plant, a pair of sunglasses—lifestyle elements that suggest the brunch aesthetic. Natural light from above, bright and airy.

Shot directly overhead, the flat lay composition intentional and balanced. The lighting is bright, no shadows. The feeling is of modern brunch culture, Instagram-worthy, healthy but indulgent.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'brunch_vibes'),
    'Avo Toast Feature',
    '["brunch","avocado_toast","flatlay","instagram"]'::JSONB,
    '{
        "required": ["headline", "toast_name", "price"],
        "optional": ["add_ons"],
        "types": {"price": "currency"},
        "defaults": {"add_ons": "Add egg +$3 | Add smoked salmon +$6"},
        "examples": {"headline": "Toast of the Town", "toast_name": "Loaded Avo Toast", "price": "14"}
    }'::JSONB,
    'Instagram-worthy avocado toast flat lay with lifestyle elements and modern brunch aesthetic.',
    'Trendy Feature',
    ARRAY['Avocado Toast', 'Instagram Posts', 'Healthy Brunch']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'avocado_toast_flatlay');


-- ============================================================================
-- PART 9: EVENTS & SPECIAL OCCASIONS
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'events',
    'special_events',
    'Special Events',
    'Grand openings, anniversaries, live music, and private event announcements.',
    'instagram',
    '{"primary":"#FFD700","secondary":"#1A1A2E","accent":"#E63946"}'::JSONB,
    '{"headline":"Playfair Display","body":"Raleway"}'::JSONB,
    '["#grandopening","#anniversary","#livemusic","#privateevent"]'::JSONB,
    '{
        "style_adjectives":["celebratory energy","milestone excitement","festive atmosphere","special occasion elegance"],
        "texture_options":["balloon reflections","ribbon textures","confetti scatter"],
        "palette_swaps":[["#FFD700","#1A1A2E"],["#C9B037","#2C3E50"],["#F4D03F","#1B2631"]],
        "camera_styles":["entrance hero","celebration wide","intimate detail"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'grand_opening_announcement',
    'Grand Opening Announcement',
    'events',
    'instagram',
    'base',
    $PROMPT$Celebratory photograph of a restaurant entrance with a "Grand Opening" ribbon about to be cut. Balloons frame the doorway, staff in crisp uniforms stand ready inside. The energy is excitement and anticipation.

A large banner or A-frame sign reads:

"{{headline}}"
"{{restaurant_name}}"
"NOW OPEN"
"{{opening_date}}"
"{{special_offer}}"
"{{address}}"

The entrance is inviting: warm light spills out from inside, the interior visible through windows showing a beautiful space ready for guests. Perhaps a red carpet leads to the door, or flower arrangements flank the entrance.

Staff members are visible, smiling and ready. Maybe the owner or chef stands with scissors ready to cut the ribbon. The neighborhood is visible in the background, establishing location.

Shot from the street looking at the entrance, the sign prominent, the celebration evident. The lighting is bright and welcoming. The feeling is of a new beginning, a neighborhood gaining something special.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'),
    'Grand Opening',
    '["grand_opening","celebration","new_restaurant","ribbon_cutting"]'::JSONB,
    '{
        "required": ["headline", "restaurant_name", "opening_date"],
        "optional": ["special_offer", "address"],
        "defaults": {"special_offer": "Free appetizer with any entrée - opening week only", "address": "123 Main Street"},
        "examples": {"headline": "We''re Open!", "restaurant_name": "The Corner Kitchen", "opening_date": "December 1st"}
    }'::JSONB,
    'Celebratory grand opening scene with ribbon cutting and new restaurant excitement.',
    'Grand Opening',
    ARRAY['Grand Openings', 'New Restaurants', 'Launch Events']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'grand_opening_announcement');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'anniversary_celebration',
    'Anniversary Celebration',
    'events',
    'instagram',
    'base',
    $PROMPT$Warm photograph of a restaurant interior decorated for an anniversary celebration. A large number display (1, 5, 10, etc.) is prominent, perhaps made of flowers or balloons. The space shows its character and history.

A beautifully designed sign or poster reads:

"{{headline}}"
"{{years}} Years of {{tagline}}"
"Thank you, {{city}}"
"{{celebration_details}}"
"{{date_range}}"

The restaurant shows its personality: maybe photos on the wall from opening day, the original menu framed, staff who've been there from the start. Regulars might be visible, raising glasses in a toast.

Decorations are tasteful: perhaps gold accents for a milestone year, flowers, candles. A special anniversary menu or cake might be visible. The lighting is warm and nostalgic, celebrating history while looking forward.

Shot to capture both the anniversary display and the restaurant's character. The feeling is of gratitude, community, and celebration of a journey.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'),
    'Anniversary Feature',
    '["anniversary","milestone","celebration","gratitude"]'::JSONB,
    '{
        "required": ["headline", "years", "tagline"],
        "optional": ["city", "celebration_details", "date_range"],
        "types": {"years": "integer"},
        "defaults": {"city": "our community", "celebration_details": "Special menu all month", "date_range": "All November"},
        "examples": {"headline": "Cheers to Us", "years": "10", "tagline": "Serving Our Community"}
    }'::JSONB,
    'Warm anniversary celebration with milestone display and nostalgic restaurant atmosphere.',
    'Milestone',
    ARRAY['Anniversaries', 'Milestones', 'Thank You Posts']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'anniversary_celebration');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'live_music_night',
    'Live Music Night',
    'events',
    'instagram',
    'base',
    $PROMPT$Atmospheric photograph of a restaurant or bar set up for live music. A small stage or performance area is visible, instruments ready, perhaps a microphone stand with warm spotlight. The venue has character.

A poster or chalkboard sign announces:

"{{headline}}"
"{{performer_name}}"
"{{music_genre}}"
"{{event_date}}"
"{{time}} | {{cover_charge}}"
"{{reservation_note}}"

The space is set for the evening: tables arranged for viewing, candles lit, the bar stocked and ready. Perhaps early arrivals are finding seats, drinks in hand. The stage lighting creates atmosphere—warm spots, maybe some color.

The venue's personality shows: exposed brick, vintage posters, string lights, whatever makes it unique. The instruments on stage (guitar, keyboard, drums) suggest the type of music. The feeling is anticipation of a great night.

Shot to capture both the announcement and the venue atmosphere. The lighting is moody and inviting. The feeling is of a special night out, music and good food combining.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'special_events'),
    'Live Music Event',
    '["live_music","entertainment","nightlife","event"]'::JSONB,
    '{
        "required": ["headline", "performer_name", "event_date", "time"],
        "optional": ["music_genre", "cover_charge", "reservation_note"],
        "defaults": {"music_genre": "Live Music", "cover_charge": "No Cover", "reservation_note": "Reserve your table"},
        "examples": {"headline": "Live Tonight", "performer_name": "The Jazz Trio", "event_date": "Friday, Dec 15", "time": "8pm"}
    }'::JSONB,
    'Atmospheric live music venue with stage setup and anticipation of a great night.',
    'Entertainment',
    ARRAY['Live Music', 'Entertainment Nights', 'Event Promos']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'live_music_night');

-- ============================================================================
-- PART 10: BEHIND THE SCENES & HIRING
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'behind_scenes',
    'behind_the_scenes',
    'Behind the Scenes',
    'Kitchen action, chef spotlights, and team hiring posts with authentic energy.',
    'instagram',
    '{"primary":"#2C3E50","secondary":"#ECF0F1","accent":"#E74C3C"}'::JSONB,
    '{"headline":"Montserrat","body":"Open Sans"}'::JSONB,
    '["#behindthescenes","#kitchenlife","#meetchef","#nowhiring"]'::JSONB,
    '{
        "style_adjectives":["authentic kitchen energy","professional craftsmanship","team camaraderie","real working environment"],
        "texture_options":["flame action","steam rising","stainless steel gleam"],
        "palette_swaps":[["#2C3E50","#E74C3C"],["#34495E","#E67E22"],["#1A252F","#C0392B"]],
        "camera_styles":["kitchen action wide","chef portrait","team group shot"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'kitchen_action_shot',
    'Kitchen Action Shot',
    'behind_scenes',
    'instagram',
    'base',
    $PROMPT$Dynamic photograph of a professional kitchen during service. Flames leap from a pan, steam rises, the energy is controlled chaos. This is where the magic happens.

A small slate or branded element reads:

"{{headline}}"
"{{kitchen_message}}"
"{{team_credit}}"

The kitchen is alive: a cook flips something in a sauté pan, flames rising dramatically. Another plates with precision, tweezers in hand. The pass is lined with tickets, the expeditor calling orders. Stainless steel gleams, mise en place is organized.

The team wears clean whites or branded aprons, focused and professional. The equipment is serious: commercial ranges, hood vents, heat lamps. This is a real working kitchen, not a set.

Shot at eye level in the kitchen, capturing the action and energy. The lighting is the kitchen's own—bright work lights, the warm glow of flames. The feeling is of respect for the craft, the hard work behind every plate.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes'),
    'Kitchen Action',
    '["kitchen","action","flames","behind_scenes"]'::JSONB,
    '{
        "required": ["headline"],
        "optional": ["kitchen_message", "team_credit"],
        "defaults": {"kitchen_message": "Where passion meets plate", "team_credit": "Our incredible kitchen team"},
        "examples": {"headline": "Behind the Pass"}
    }'::JSONB,
    'Dynamic kitchen action with flames, steam, and professional culinary energy.',
    'Kitchen Life',
    ARRAY['Behind the Scenes', 'Kitchen Features', 'Team Posts']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'kitchen_action_shot');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'were_hiring',
    'We''re Hiring',
    'behind_scenes',
    'instagram',
    'base',
    $PROMPT$Welcoming photograph of a restaurant team gathered together, smiling and genuine. They represent different roles: kitchen, front of house, management. The restaurant provides a warm backdrop.

A prominent sign or banner reads:

"{{headline}}"
"JOIN OUR TEAM"
"Now Hiring: {{positions}}"
"{{benefits_highlight}}"
"{{apply_cta}}"

The team looks happy and cohesive: diverse, professional, like people you'd want to work with. They might be in uniform or branded apparel, gathered at the bar, in the dining room, or at the entrance.

The restaurant behind them looks like a great place to work: clean, well-maintained, with character. Maybe there's a "team member of the month" board visible, or photos of staff events. The atmosphere suggests a positive workplace culture.

Shot to include the whole team and the hiring message clearly. The lighting is bright and welcoming. The feeling is of opportunity, belonging, a team worth joining.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'behind_the_scenes'),
    'Hiring Post',
    '["hiring","team","recruitment","opportunity"]'::JSONB,
    '{
        "required": ["headline", "positions"],
        "optional": ["benefits_highlight", "apply_cta"],
        "defaults": {"benefits_highlight": "Competitive pay • Flexible hours • Meal benefits", "apply_cta": "Apply in person or online"},
        "examples": {"headline": "Grow With Us", "positions": "Line Cooks, Servers, Hosts"}
    }'::JSONB,
    'Welcoming team photo with hiring announcement and positive workplace culture.',
    'Recruitment',
    ARRAY['Hiring Posts', 'Recruitment', 'Team Building']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'were_hiring');


-- ============================================================================
-- PART 11: SEASONAL & HOLIDAY
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'seasonal',
    'seasonal_celebrations',
    'Seasonal Celebrations',
    'Fall harvest, holiday catering, summer patio, and Valentine''s Day themes.',
    'instagram',
    '{"primary":"#D35400","secondary":"#F39C12","accent":"#27AE60"}'::JSONB,
    '{"headline":"Playfair Display","body":"Lora"}'::JSONB,
    '["#seasonal","#holidaymenu","#fallmenu","#summermenu"]'::JSONB,
    '{
        "style_adjectives":["seasonal warmth","holiday festivity","harvest abundance","celebration atmosphere"],
        "texture_options":["autumn leaves","holiday decorations","summer sunshine"],
        "palette_swaps":[["#D35400","#27AE60"],["#C0392B","#196F3D"],["#E67E22","#2ECC71"]],
        "camera_styles":["seasonal spread overhead","holiday table setting","patio wide shot"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'fall_harvest_menu',
    'Fall Harvest Menu',
    'seasonal',
    'instagram',
    'base',
    $PROMPT$Warm autumn photograph of a rustic table setting with fall harvest elements. Pumpkins, gourds, and autumn leaves create a seasonal frame. The colors are rich: oranges, deep reds, golden yellows, warm browns.

A menu card or chalkboard sign reads:

"{{headline}}"
"{{season}} Specials"
• {{dish1}} – ${{price1}}
• {{dish2}} – ${{price2}}
• {{dish3}} – ${{price3}}
"{{availability}}"

The table shows autumn abundance: perhaps a butternut squash soup in a bread bowl, a salad with roasted beets and goat cheese, a pork chop with apple compote. The dishes use seasonal ingredients, colors matching the decor.

The setting is cozy: maybe a fireplace glow in the background, warm wood tones, candlelight. Dried corn, wheat stalks, or cinnamon sticks might accent the scene. The feeling is of harvest, warmth, comfort food season.

Shot at table level, the seasonal elements framing the food and sign. The lighting is warm, golden hour or candlelight. The feeling is of autumn's bounty, a menu worth celebrating.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'),
    'Fall Menu Feature',
    '["fall","harvest","seasonal","autumn"]'::JSONB,
    '{
        "required": ["headline", "season", "dish1", "price1"],
        "optional": ["dish2", "price2", "dish3", "price3", "availability"],
        "types": {"price1": "currency", "price2": "currency", "price3": "currency"},
        "defaults": {"dish2": "Harvest Salad", "price2": "14", "dish3": "Apple Cider Pork", "price3": "26", "availability": "Available through November"},
        "examples": {"headline": "Taste of Autumn", "season": "Fall", "dish1": "Butternut Squash Soup", "price1": "10"}
    }'::JSONB,
    'Warm autumn harvest scene with seasonal dishes and cozy fall atmosphere.',
    'Seasonal Menu',
    ARRAY['Fall Menus', 'Harvest Specials', 'Seasonal Features']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'fall_harvest_menu');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'holiday_catering_menu',
    'Holiday Catering Menu',
    'seasonal',
    'instagram',
    'base',
    $PROMPT$Festive photograph of a holiday spread ready for a celebration. A beautifully roasted turkey or ham takes center stage, surrounded by classic sides. Holiday decorations frame the scene tastefully.

An elegant menu card reads:

"{{headline}}"
"{{holiday}} Catering"
"Feeds {{guest_count}} guests"
"${{package_price}}"
Includes:
• {{main_dish}}
• {{side1}}
• {{side2}}
"{{order_deadline}}"

The spread is abundant: the main protein glistening with glaze, mashed potatoes with a butter pool, green beans almondine, cranberry sauce, dinner rolls. Everything looks homemade and delicious.

The setting has holiday touches: perhaps evergreen sprigs, candles, elegant serving ware, a glimpse of a decorated tree or fireplace. The table is set for a gathering, multiple place settings visible.

Shot overhead or at a slight angle to capture the full spread. The lighting is warm and festive. The feeling is of holiday tradition, the stress of cooking lifted, celebration made easy.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'),
    'Holiday Catering',
    '["holiday","catering","thanksgiving","christmas"]'::JSONB,
    '{
        "required": ["headline", "holiday", "guest_count", "package_price", "main_dish"],
        "optional": ["side1", "side2", "order_deadline"],
        "types": {"guest_count": "integer", "package_price": "currency"},
        "defaults": {"side1": "Mashed Potatoes & Gravy", "side2": "Seasonal Vegetables", "order_deadline": "Order by Dec 20"},
        "examples": {"headline": "Let Us Do the Cooking", "holiday": "Holiday", "guest_count": "10", "package_price": "199", "main_dish": "Herb-Roasted Turkey"}
    }'::JSONB,
    'Festive holiday catering spread with traditional dishes and celebration atmosphere.',
    'Holiday Catering',
    ARRAY['Holiday Catering', 'Thanksgiving', 'Christmas Menus']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'holiday_catering_menu');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'summer_patio_season',
    'Summer Patio Season',
    'seasonal',
    'instagram',
    'base',
    $PROMPT$Bright summer photograph of a restaurant patio in full swing. Umbrellas provide shade, string lights are ready for evening, plants and flowers add color. The energy is relaxed and social.

A colorful sign or menu board reads:

"{{headline}}"
"Patio Season is Here!"
"{{summer_special}}"
"${{special_price}}"
"{{patio_hours}}"

The patio is inviting: comfortable seating, tables set with fresh flowers, perhaps a view of the street or a garden. Guests are enjoying themselves—cold drinks, light summer fare, conversation and laughter.

Summer drinks are prominent: a pitcher of sangria, frozen margaritas, iced tea with lemon. The food is seasonal: a colorful salad, grilled fish, fresh fruit. Everything looks refreshing and light.

Shot to capture the patio atmosphere and the summer vibe. The lighting is bright natural daylight, blue sky visible. The feeling is of summer's best moments, outdoor dining at its finest.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'seasonal_celebrations'),
    'Patio Season',
    '["summer","patio","outdoor","seasonal"]'::JSONB,
    '{
        "required": ["headline", "summer_special", "special_price"],
        "optional": ["patio_hours"],
        "types": {"special_price": "currency"},
        "defaults": {"patio_hours": "Patio open daily 11am-10pm"},
        "examples": {"headline": "Summer on the Patio", "summer_special": "Grilled Fish Tacos & Margarita", "special_price": "22"}
    }'::JSONB,
    'Bright summer patio scene with outdoor dining and refreshing seasonal atmosphere.',
    'Patio Season',
    ARRAY['Summer Menus', 'Patio Season', 'Outdoor Dining']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'summer_patio_season');

-- ============================================================================
-- PART 12: SOCIAL PROOF & REVIEWS
-- ============================================================================

INSERT INTO creative_prompt_themes (
    restaurant_vertical, theme_slug, name, description, campaign_channel,
    default_palette, default_fonts, default_hashtags, variation_rules
)
VALUES (
    'social_proof',
    'social_proof_community',
    'Social Proof & Community',
    'Customer reviews, awards, and community giveback posts.',
    'instagram',
    '{"primary":"#F1C40F","secondary":"#2C3E50","accent":"#E74C3C"}'::JSONB,
    '{"headline":"Merriweather","body":"Source Sans Pro"}'::JSONB,
    '["#customerreview","#awardwinning","#community","#thankyou"]'::JSONB,
    '{
        "style_adjectives":["authentic testimonial","proud achievement","community connection","genuine gratitude"],
        "texture_options":["star ratings","award plaques","community gathering"],
        "palette_swaps":[["#F1C40F","#2C3E50"],["#F39C12","#34495E"],["#D4AC0D","#1A252F"]],
        "camera_styles":["review highlight","award display","community event"]
    }'::JSONB
)
ON CONFLICT (theme_slug) DO UPDATE SET updated_at = NOW();

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'customer_review_highlight',
    'Customer Review Highlight',
    'social_proof',
    'instagram',
    'base',
    $PROMPT$Warm photograph of a beautifully plated dish with a customer review quote overlaid or on a card. The food validates the praise. The feeling is authentic recommendation.

A review card or elegant text treatment reads:

"{{review_quote}}"
— {{reviewer_name}}, {{review_source}}
★★★★★

"{{dish_featured}}"
"{{cta_message}}"

The dish mentioned in the review is the hero: perfectly plated, appetizing, clearly the star. The setting is the actual restaurant—recognizable elements in the background, authentic atmosphere.

The review feels real: maybe it's shown on a phone screen, printed on a card, or elegantly typeset. The five stars are prominent. The overall impression is of earned praise, not manufactured marketing.

Shot to feature both the food and the review. The lighting is warm and appetizing. The feeling is of social proof, a recommendation from a real person, trust earned.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community'),
    'Review Feature',
    '["review","testimonial","social_proof","five_star"]'::JSONB,
    '{
        "required": ["review_quote", "reviewer_name"],
        "optional": ["review_source", "dish_featured", "cta_message"],
        "defaults": {"review_source": "Google Review", "dish_featured": "Try it for yourself", "cta_message": "Reserve your table"},
        "examples": {"review_quote": "Best meal I''ve had in years. The pasta was absolutely perfect.", "reviewer_name": "Sarah M."}
    }'::JSONB,
    'Authentic customer review highlight with featured dish and five-star presentation.',
    'Social Proof',
    ARRAY['Customer Reviews', 'Testimonials', 'Social Proof']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'customer_review_highlight');

INSERT INTO creative_prompt_templates (
    slug, name, restaurant_vertical, campaign_channel,
    prompt_section, prompt_body, prompt_version, is_active,
    theme_id, display_name, variation_tags, input_schema,
    description, use_case, best_for
)
SELECT
    'local_award_winner',
    'Local Award Winner',
    'social_proof',
    'instagram',
    'base',
    $PROMPT$Proud photograph showcasing a restaurant award or recognition. The award itself is visible—a plaque, certificate, or trophy—displayed in the restaurant. The achievement is celebrated but not boastful.

A sign or graphic reads:

"{{headline}}"
"{{award_name}}"
"{{award_year}}"
"{{award_category}}"
"{{thank_you_message}}"

The award is displayed prominently: maybe on a shelf with other accolades, framed on the wall, or held by the chef/owner. The restaurant provides context—this is where the award-winning food is made.

Other elements of credibility might be visible: press clippings, other awards, photos with food critics or celebrities. The overall impression is of earned recognition, a track record of excellence.

Shot to feature the award while showing the restaurant context. The lighting is professional and flattering. The feeling is of pride in achievement, gratitude to the community that voted or recognized.$PROMPT$,
    'v1',
    TRUE,
    (SELECT id FROM creative_prompt_themes WHERE theme_slug = 'social_proof_community'),
    'Award Feature',
    '["award","recognition","best_of","achievement"]'::JSONB,
    '{
        "required": ["headline", "award_name", "award_year"],
        "optional": ["award_category", "thank_you_message"],
        "defaults": {"award_category": "Best Restaurant", "thank_you_message": "Thank you for voting!"},
        "examples": {"headline": "We''re Honored", "award_name": "Best New Restaurant", "award_year": "2024"}
    }'::JSONB,
    'Proud award display with restaurant context and achievement celebration.',
    'Recognition',
    ARRAY['Awards', 'Best Of Lists', 'Recognition Posts']
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM creative_prompt_templates WHERE slug = 'local_award_winner');

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
    theme_count INTEGER;
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO theme_count FROM creative_prompt_themes;
    SELECT COUNT(*) INTO template_count FROM creative_prompt_templates;
    
    RAISE NOTICE 'Creative Prompt Library Expansion Complete';
    RAISE NOTICE 'Total themes: %', theme_count;
    RAISE NOTICE 'Total templates: %', template_count;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
