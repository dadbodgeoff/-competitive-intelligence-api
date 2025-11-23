-- ============================================================================
-- Migration: Seed Events & Promotions Creative Themes & Templates
-- Section: Nano Banana – Experiential Campaigns
-- Created: 2025-11-22
-- ============================================================================

-- Theme 1: Gaffer Tape Setlist (Live Music)
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'live_music',
        'gaffer_tape_setlist',
        'Gaffer Tape Setlist',
        'Stage monitor with taped setlist announcing tonight’s live act.',
        'instagram',
        '{"primary":"#1B1C30","secondary":"#F8F6F0","accent":"#7C4DFF"}'::JSONB,
        '{"headline":"Anton","body":"Montserrat"}'::JSONB,
        '["#livemusic","#tonightonly","#acousticduo"]'::JSONB,
        '{
            "style_adjectives":["gaffer tape texture","stage wash lighting","monitor grille","performer pov"],
            "texture_options":["tape tear","paper wrinkle","dust motes"],
            "palette_swaps":[["#1B1C30","#7C4DFF"],["#111224","#FF61D2"]],
            "camera_styles":["low-angle monitor","stage gel lighting","shallow depth cables"]
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
    'gaffer_tape_setlist',
    'Gaffer Tape Setlist',
    'live_music',
    'instagram',
    'base',
    $$Low-angle performer POV of a stage monitor with a wrinkled paper setlist taped down by ripped black gaffer tape. Bold marker reads “{{headline}}” with electric bullet lines:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  Microphone base, guitar cable, and purple-blue stage wash make the night feel loud and real.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Gaffer Tape Setlist',
    '["live_music","gaffer_tape","stage_monitor"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 2: Pigskin Showdown (Game Day)
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'sports_bar',
        'pigskin_showdown',
        'Pigskin Showdown',
        'Macro football leather promo for game-day specials.',
        'instagram',
        '{"primary":"#8B4513","secondary":"#FFFFFF","accent":"#2F855A"}'::JSONB,
        '{"headline":"League Spartan","body":"Fira Sans"}'::JSONB,
        '["#gameday","#sundayshowdown","#wingdeal"]'::JSONB,
        '{
            "style_adjectives":["football pebbling","metallic marker sheen","field blur","sports hype"],
            "texture_options":["lace stitch","highlight glint","leather shadow"],
            "palette_swaps":[["#8B4513","#2F855A"],["#7B341E","#38A169"]],
            "camera_styles":["macro pigskin","shallow depth turf","dramatic contrast"]
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
    'pigskin_showdown',
    'Pigskin Showdown',
    'sports_bar',
    'instagram',
    'base',
    $$Extreme close-up of a pro football’s pebbled leather with white laces in frame. Metallic marker lettering shouts “{{headline}}” and lists:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  Turf-green blur and specular highlights deliver instant game-day energy.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Pigskin Showdown',
    '["football_macro","metallic_marker","sports_promo"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 3: Graphite Trivia Sheet
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'pub_event',
        'graphite_trivia_sheet',
        'Graphite Trivia Sheet',
        'Pub quiz answer sheet with erased smudges and pencil sheen.',
        'instagram',
        '{"primary":"#F5F1EB","secondary":"#3C3C3C","accent":"#C58B00"}'::JSONB,
        '{"headline":"Special Elite","body":"Kalam"}'::JSONB,
        '["#trivianight","#pubquiz","#brainfuel"]'::JSONB,
        '{
            "style_adjectives":["graphite shine","eraser dust","tabletop warmth","handwritten energy"],
            "texture_options":["pencil smear","beer ring","paper grain"],
            "palette_swaps":[["#F5F1EB","#C58B00"],["#FFF5E1","#B7791F"]],
            "camera_styles":["top-down sheet","macro pencil","warm pub lighting"]
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
    'graphite_trivia_sheet',
    'Graphite Trivia Sheet',
    'pub_event',
    'instagram',
    'base',
    $$Top-down on a pub quiz score sheet with graphite handwriting, eraser smudges, and pencil crumbs. The sheet declares “{{headline}}” with narrative lines:  • {{line1}}  • {{line2}}  • {{line3}}  Pint glass ring and amber lamp glow gamify the invite.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Graphite Trivia Sheet',
    '["trivia_night","graphite_sheen","pub_quiz"]'::JSONB,
    '{
        "required": ["headline","line1","line2","line3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 4: Spotlight Comedy Brick
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'comedy_event',
        'spotlight_comedy_brick',
        'Spotlight Comedy Brick',
        'Gobo projection on brick wall for comedy night.',
        'instagram',
        '{"primary":"#FFFFFF","secondary":"#1C1C1C","accent":"#FFB703"}'::JSONB,
        '{"headline":"Oswald","body":"Futura"}'::JSONB,
        '["#comedynight","#openmic","#laughlocal"]'::JSONB,
        '{
            "style_adjectives":["spotlight halo","brick relief","microphone silhouette","high contrast stage"],
            "texture_options":["shadow length","painted mortar","light spill"],
            "palette_swaps":[["#FFFFFF","#FFB703"],["#F8F9FA","#FBB13C"]],
            "camera_styles":["eye-level brick","single spotlight","dramatic contrast"]
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
    'spotlight_comedy_brick',
    'Spotlight Comedy Brick',
    'comedy_event',
    'instagram',
    'base',
    $$Eye-level shot of a white brick wall sliced by a tight spotlight. A microphone stand casts a shadow across projected text reading “{{headline}}” with supporting lines:  • {{line1}}  • {{line2}}  • {{line3}}  Pitch-black surroundings focus all attention on the open-mic invite.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Spotlight Comedy Brick',
    '["comedy_stage","spotlight_projection","brick_texture"]'::JSONB,
    '{
        "required": ["headline","line1","line2","line3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 5: Balloon Kids Free
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'family_promo',
        'balloon_kids_free',
        'Balloon Kids Free',
        'Latex balloon cluster featuring kids-eat-free offer.',
        'instagram',
        '{"primary":"#FFD166","secondary":"#FF6F59","accent":"#118AB2"}'::JSONB,
        '{"headline":"Fredoka One","body":"Nunito"}'::JSONB,
        '["#kidseatfree","#familyfun","#balloonday"]'::JSONB,
        '{
            "style_adjectives":["latex stretch","marker translucency","ceiling reflection","party energy"],
            "texture_options":["ribbon curl","balloon glare","ink streak"],
            "palette_swaps":[["#FFD166","#118AB2"],["#FFB703","#06D6A0"]],
            "camera_styles":["balloon close-up","bright interior","shallow depth party"]
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
    'balloon_kids_free',
    'Balloon Kids Free',
    'family_promo',
    'instagram',
    'base',
    $$Close-up of vibrant helium balloons with a yellow balloon front and center. Stretched marker letters announce “{{headline}}” followed by:  • {{bullet1}}  • {{bullet2}}  “{{cta_line}}”  Glossy reflections, curled ribbons, and ceiling lights scream kid-friendly celebration.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Balloon Kids Free',
    '["balloon_text","family_promo","party_energy"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","cta_line"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- Theme 6: Hot Sauce Challenge
WITH theme AS (
    INSERT INTO creative_prompt_themes (
        restaurant_vertical, theme_slug, name, description, campaign_channel,
        default_palette, default_fonts, default_hashtags, variation_rules
    )
    VALUES (
        'spicy_event',
        'hot_sauce_challenge',
        'Hot Sauce Challenge',
        'Spilled hot sauce typography daring guests to turn up the heat.',
        'instagram',
        '{"primary":"#E63946","secondary":"#F1FAEE","accent":"#457B9D"}'::JSONB,
        '{"headline":"Bangers","body":"Raleway"}'::JSONB,
        '["#spicychallenge","#tacotuesday","#bringtheheat"]'::JSONB,
        '{
            "style_adjectives":["viscous sauce","gloss highlights","marble counter","daredevil energy"],
            "texture_options":["chili flake","lime zest","bottle drip"],
            "palette_swaps":[["#E63946","#457B9D"],["#D62828","#1D3557"]],
            "camera_styles":["top-down spill","foodie styling","macro gloss"]
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
    'hot_sauce_challenge',
    'Hot Sauce Challenge',
    'spicy_event',
    'instagram',
    'base',
    $$Top-down of a marble counter where thick hot sauce has been drizzled into raised, glossy lettering. The spill screams “{{headline}}” with fiery lines:  • {{bullet1}}  • {{bullet2}}  • {{bullet3}}  Lime wedge, chili pepper, and sauce bottle sell the dare.$$,
    'v1',
    TRUE,
    '{}'::JSONB,
    NULL,
    NOW(),
    NOW(),
    theme.id,
    'Hot Sauce Challenge',
    '["hot_sauce","gloss_typography","spicy_promo"]'::JSONB,
    '{
        "required": ["headline","bullet1","bullet2","bullet3"],
        "optional": [],
        "types": {}
    }'::JSONB
FROM theme;

-- ============================================================================
-- End of Migration
-- ============================================================================

