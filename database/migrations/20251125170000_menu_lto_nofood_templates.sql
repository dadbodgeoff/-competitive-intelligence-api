-- Migration: Menu Items & LTOs - NO FOOD IMAGERY Templates
-- Description: 28 templates for menu announcements, LTOs, seasonal menus, and returning favorites
-- All templates work WITHOUT AI-generated food imagery
-- Created: 2025-11-25

-- ============================================================================
-- LIMITED TIME OFFERS - INSTAGRAM SQUARE (4 templates)
-- ============================================================================

-- 1. LTO Teaser - Typography Hero
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-typography-hero', 'LTO Teaser - Typography Hero', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic design piece announcing a limited time offer. NO FOOD IMAGERY—pure typography and design impact.

Background: Rich, textured surface that evokes the item's vibe without showing it. Options:
- Deep burgundy/wine texture for rich dishes
- Fresh green gradient for salads/healthy items
- Warm amber/caramel tones for comfort food
- Cool blue/white for seafood
- Smoky charcoal for BBQ/grilled items

The background has subtle texture—could be fabric, paper, brushed metal, or abstract color gradients. NOT a photo of food.

Bold, attention-grabbing typography dominates:
"{{headline}}"
"{{item_name}}"
"{{description_line}}"
"{{availability}}"
"${{price}}"
"{{cta}}"

Design elements: Abstract shapes, ingredient silhouettes, or decorative borders. The typography IS the design—beautiful fonts, perfect spacing, hierarchy that draws the eye.

The vibe: Something special is coming/here. The name alone should make you curious. Trust the words.
$PROMPT$,
'v1', TRUE,
'{"style": "typography_hero", "category": "lto", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["description_line", "availability", "price", "cta"], "defaults": {"availability": "Limited Time Only", "cta": "Try it before it''s gone"}}, "variation_rules": {"style_adjectives": ["bold typography", "design-forward", "teaser energy", "no food needed"], "background_moods": ["rich burgundy", "fresh green", "warm amber", "cool seafood", "smoky charcoal"], "camera_styles": ["flat graphic design", "textured background", "typography showcase"]}}'::JSONB);

-- 2. LTO Ingredient Tease
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-ingredient-tease', 'LTO Ingredient Tease', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showing RAW INGREDIENTS, not the finished dish. Builds anticipation by showing what goes INTO the item.

Scene: Beautiful arrangement of key ingredients on a rustic surface—cutting board, marble, or kitchen counter. The ingredients are fresh, vibrant, and clearly high-quality.

Examples of what to show:
- Fresh herbs scattered artfully
- Whole vegetables/fruits (tomatoes, avocados, citrus)
- Spices in small bowls or scattered
- Raw proteins on butcher paper (optional)
- Cheese wheels or wedges
- Fresh pasta or bread dough
- Bottles of quality oils or sauces

The ingredients hint at the dish without showing the final product. Mystery and quality.

Typography overlay:
"{{headline}}"
"{{item_name}}"
"Made with {{key_ingredient}}"
"{{tease_line}}"
"{{availability}}"

The lighting is bright and fresh for produce, or moody and rich for indulgent items. The ingredients look so good you can imagine the dish.

The vibe: Look at what we're working with. Quality you can see. The dish is going to be incredible.
$PROMPT$,
'v1', TRUE,
'{"style": "ingredient_showcase", "category": "lto", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["key_ingredient", "tease_line", "availability"], "defaults": {"tease_line": "Coming soon", "availability": "Limited Time Only"}}, "variation_rules": {"style_adjectives": ["fresh ingredients", "quality showcase", "anticipation builder", "raw beauty"], "ingredient_types": ["fresh herbs", "whole vegetables", "artisan cheese", "quality proteins", "spices and seasonings"], "camera_styles": ["overhead ingredient spread", "rustic cutting board", "kitchen prep scene"]}}'::JSONB);

-- 3. LTO Last Chance Urgency
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-last-chance', 'LTO Last Chance Urgency', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic design creating URGENCY for an ending LTO. NO FOOD—pure countdown energy.

Background: High-contrast, attention-grabbing design. Options:
- Bold red/orange gradient suggesting urgency
- Clock or calendar graphic elements
- "FINAL DAYS" stamp or badge treatment
- Countdown numbers as design elements
- Strikethrough or "ending soon" visual treatment

The design screams TIME IS RUNNING OUT without showing the item.

Urgent typography:
"{{headline}}"
"{{item_name}}"
"{{urgency_message}}"
"ENDS {{end_date}}"
"{{days_left}} DAYS LEFT"
"{{cta}}"

Design elements: Countdown numbers, clock icons, calendar marks, exclamation points, "don't miss out" badges. The urgency is visual AND verbal.

The vibe: This is your last chance. The clock is ticking. Act now or regret it later.
$PROMPT$,
'v1', TRUE,
'{"style": "urgency_countdown", "category": "lto", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name", "end_date"], "optional": ["urgency_message", "days_left", "cta"], "defaults": {"urgency_message": "Don''t miss out", "days_left": "3", "cta": "Order now"}}, "variation_rules": {"style_adjectives": ["urgent", "countdown energy", "last chance", "FOMO inducing"], "design_elements": ["countdown numbers", "clock icons", "calendar marks", "final days stamp"], "camera_styles": ["bold graphic design", "urgency layout", "countdown focus"]}}'::JSONB);

-- 4. LTO Price Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-price-feature', 'LTO Price Feature', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic design featuring the PRICE as the hero. NO FOOD—the deal speaks for itself.

Background: Clean, bold design that makes the price pop. Options:
- Solid brand color with contrasting price
- Price tag or sale badge graphic treatment
- Retro diner/menu board aesthetic
- Modern minimalist with bold price typography
- "Special offer" burst or starburst design

The price is the star—big, bold, impossible to miss.

Deal-focused typography:
"{{headline}}"
"{{item_name}}"
"${{price}}"
"{{value_message}}"
"{{original_price}}" (crossed out if applicable)
"{{availability}}"
"{{cta}}"

Design elements: Price tags, sale badges, "special offer" bursts, value callouts. The deal is so good it sells itself.

The vibe: Look at this price. This is a steal. You'd be crazy to miss this deal.
$PROMPT$,
'v1', TRUE,
'{"style": "price_hero", "category": "lto", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name", "price"], "optional": ["value_message", "original_price", "availability", "cta"], "defaults": {"value_message": "Unbeatable value", "availability": "Limited Time Only", "cta": "Get the deal"}}, "variation_rules": {"style_adjectives": ["deal-focused", "price hero", "value forward", "sale energy"], "design_elements": ["price tags", "sale badges", "starburst", "crossed out prices"], "camera_styles": ["bold price typography", "sale graphic", "deal announcement"]}}'::JSONB);



-- ============================================================================
-- LIMITED TIME OFFERS - INSTAGRAM STORIES (4 templates)
-- ============================================================================

-- 5. LTO Countdown Teaser
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-countdown-teaser', 'LTO Countdown Teaser', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story building anticipation for an upcoming LTO. NO FOOD—mystery and countdown energy.

Background: Intriguing, mysterious design. Options:
- Blurred/obscured hint (color, shape, texture—not recognizable food)
- "Coming Soon" graphic treatment
- Countdown clock or calendar graphic
- Behind-the-scenes kitchen (no plated food visible)
- Ingredient close-ups so tight they're abstract

The visual creates curiosity without revealing.

Teaser typography:
"{{headline}}"
"{{tease_line}}"
"{{item_hint}}"
"DROPPING {{launch_date}}"
"{{hype_message}}"

Space for Instagram countdown sticker.

"{{cta}}"

The design is intentionally mysterious. You know SOMETHING is coming, but not exactly what. The countdown creates urgency.

The vibe: Something's coming. Pay attention. You'll want to be first.
$PROMPT$,
'v1', TRUE,
'{"style": "mystery_countdown", "category": "lto", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "launch_date"], "optional": ["tease_line", "item_hint", "hype_message", "cta"], "defaults": {"tease_line": "Something special is coming...", "hype_message": "Trust us on this one", "cta": "Turn on notifications 🔔"}}, "variation_rules": {"style_adjectives": ["mysterious teaser", "countdown energy", "anticipation builder", "reveal pending"], "mystery_elements": ["blurred hints", "coming soon graphics", "countdown clock", "abstract close-ups"], "camera_styles": ["mystery blur", "countdown graphic", "teaser reveal"]}}'::JSONB);

-- 6. LTO "It's Here" Launch Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-its-here', 'LTO It''s Here Launch', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story announcing an LTO has LAUNCHED. NO FOOD—pure celebration and announcement energy.

Background: Celebratory, exciting design. Options:
- Confetti or celebration graphics
- Spotlight/curtain reveal aesthetic
- Bold color explosion
- "NOW AVAILABLE" badge treatment
- Party/launch energy with abstract elements

The design screams "THE WAIT IS OVER!"

Launch typography:
"{{headline}}"
"IT'S HERE"
"{{item_name}}"
"{{item_description}}"
"${{price}}"
"{{availability}}"
"{{cta}}"

Design elements: Celebration graphics, "now available" badges, launch day energy. The announcement is the event.

The vibe: The moment you've been waiting for. It's finally here. Go get it NOW.
$PROMPT$,
'v1', TRUE,
'{"style": "launch_celebration", "category": "lto", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name"], "optional": ["item_description", "price", "availability", "cta"], "defaults": {"availability": "Available now", "cta": "Order today"}}, "variation_rules": {"style_adjectives": ["launch energy", "celebration", "announcement", "excitement"], "design_elements": ["confetti", "spotlight reveal", "now available badge", "celebration graphics"], "camera_styles": ["celebration layout", "launch announcement", "reveal energy"]}}'::JSONB);

-- 7. LTO "Ending Soon" Urgency Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-ending-soon', 'LTO Ending Soon Urgency', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story creating URGENCY for an ending LTO. NO FOOD—pure countdown pressure.

Background: High-urgency design. Options:
- Red/orange urgent color scheme
- Countdown timer graphic
- "FINAL HOURS" or "LAST CHANCE" stamp
- Clock running out visual
- Calendar with date circled/crossed

The design creates immediate FOMO.

Urgent typography:
"{{headline}}"
"{{item_name}}"
"ENDING {{end_date}}"
"{{urgency_message}}"
"{{time_left}}"
"{{cta}}"

Space for Instagram countdown sticker if applicable.

Design elements: Ticking clock, countdown numbers, "last chance" badges, urgent color scheme. Every element says ACT NOW.

The vibe: Time is almost up. This is your final warning. Don't say we didn't tell you.
$PROMPT$,
'v1', TRUE,
'{"style": "urgency_push", "category": "lto", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name", "end_date"], "optional": ["urgency_message", "time_left", "cta"], "defaults": {"urgency_message": "Last chance!", "time_left": "Only hours left", "cta": "Order before it''s gone"}}, "variation_rules": {"style_adjectives": ["urgent", "final countdown", "FOMO", "last chance"], "design_elements": ["countdown timer", "final hours stamp", "clock graphic", "urgent colors"], "camera_styles": ["urgency layout", "countdown focus", "warning design"]}}'::JSONB);

-- 8. LTO Poll - "Should We Bring It Back?"
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-poll-bring-back', 'LTO Poll - Should We Bring It Back?', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story asking followers if they want an LTO to return. NO FOOD—engagement and nostalgia energy.

Background: Nostalgic, engaging design. Options:
- Retro/throwback aesthetic
- "Remember this?" treatment
- Question mark or poll graphic elements
- Memory lane/flashback visual style
- Fan favorite badge or trophy graphic

The design invites participation and reminiscing.

Poll typography:
"{{headline}}"
"{{item_name}}"
"{{memory_prompt}}"
"{{poll_question}}"

Space for Instagram poll sticker:
"YES! 🙌" / "Please! 😭"

"{{engagement_prompt}}"

Design elements: Question marks, poll graphics, "your voice matters" messaging, throwback aesthetic. The audience feels heard.

The vibe: We're listening. Your opinion matters. Help us decide what comes back.
$PROMPT$,
'v1', TRUE,
'{"style": "engagement_poll", "category": "lto", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name", "poll_question"], "optional": ["memory_prompt", "engagement_prompt"], "defaults": {"memory_prompt": "Remember this fan favorite?", "engagement_prompt": "Vote now! Your voice matters"}}, "variation_rules": {"style_adjectives": ["engaging", "nostalgic", "interactive", "community-driven"], "design_elements": ["poll graphics", "question marks", "throwback aesthetic", "fan favorite badge"], "camera_styles": ["engagement layout", "poll focus", "interactive design"]}}'::JSONB);



-- ============================================================================
-- NEW MENU ITEMS - INSTAGRAM SQUARE (4 templates)
-- ============================================================================

-- 9. New Item - Typography Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-sq-typography', 'New Item - Typography Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic design announcing a new menu item. NO FOOD IMAGERY—the name and description do the talking.

Background: Elegant, appetizing design without showing food. Options:
- Rich textured surface (marble, wood, linen)
- Brand color gradient
- Abstract pattern suggesting the cuisine style
- Clean minimalist with bold typography
- Artistic brushstroke or paint texture

The background sets the mood; the words tell the story.

Announcement typography:
"{{headline}}"
"INTRODUCING"
"{{item_name}}"
"{{item_description}}"
"${{price}}"
"{{availability}}"
"{{cta}}"

Design elements: "NEW" badges, introduction flourishes, elegant borders. The typography is crafted and intentional—this is a proper introduction.

The vibe: Meet the newest addition to our menu. We're proud of this one. Come experience it.
$PROMPT$,
'v1', TRUE,
'{"style": "typography_announcement", "category": "new_item", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["item_description", "price", "availability", "cta"], "defaults": {"availability": "Now on the menu", "cta": "Come try it"}}, "variation_rules": {"style_adjectives": ["elegant announcement", "typography hero", "introduction energy", "menu debut"], "background_types": ["textured surface", "brand gradient", "abstract pattern", "minimalist"], "camera_styles": ["typography showcase", "announcement layout", "elegant design"]}}'::JSONB);

-- 10. New Item - Ingredient Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-sq-ingredients', 'New Item - Ingredient Showcase', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showing RAW INGREDIENTS for a new menu item. NOT the finished dish—the building blocks.

Scene: Beautiful arrangement of key ingredients on a rustic surface—cutting board, marble, or kitchen counter. Fresh, vibrant, high-quality ingredients.

What to show:
- Fresh herbs and aromatics
- Whole vegetables and fruits
- Spices in small bowls or scattered
- Quality proteins on butcher paper
- Artisan cheeses or dairy
- Fresh bread, pasta, or grains
- Premium oils, vinegars, or sauces

The ingredients tell the story of what's to come.

Typography overlay:
"{{headline}}"
"{{item_name}}"
"Made with {{key_ingredients}}"
"{{quality_message}}"
"{{availability}}"

Lighting: Bright and fresh for produce, moody and rich for indulgent items. The ingredients look premium and appetizing.

The vibe: See what goes into our newest creation. Quality ingredients, exceptional results.
$PROMPT$,
'v1', TRUE,
'{"style": "ingredient_showcase", "category": "new_item", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["key_ingredients", "quality_message", "availability"], "defaults": {"quality_message": "Quality you can taste", "availability": "Now available"}}, "variation_rules": {"style_adjectives": ["fresh ingredients", "quality showcase", "raw beauty", "premium components"], "ingredient_types": ["fresh herbs", "whole vegetables", "artisan cheese", "quality proteins", "spices"], "camera_styles": ["overhead spread", "rustic arrangement", "ingredient close-up"]}}'::JSONB);

-- 11. New Item - Chef's Special (Behind the Scenes)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-sq-chef-special', 'New Item - Chef''s Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showing the CHEF or KITCHEN, not the finished dish. The human story behind the new item.

Scene options (NO PLATED FOOD):
- Chef's hands working with ingredients (chopping, seasoning, kneading)
- Kitchen action shot with motion blur (cooking in progress)
- Chef portrait with kitchen background
- Handwritten recipe notes or menu board being written
- Kitchen tools and equipment arranged artfully

The focus is on CRAFT and the PERSON, not the final product.

Typography overlay:
"{{headline}}"
"{{chef_name}}'s {{creation_type}}"
"{{item_name}}"
"{{chef_quote}}"
"{{availability}}"
"${{price}}"

Lighting: Documentary-style—real kitchen light, authentic atmosphere. A peek behind the curtain.

The vibe: Our chef created something special. This is personal. Made with passion and expertise.
$PROMPT$,
'v1', TRUE,
'{"style": "behind_the_scenes", "category": "new_item", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["chef_name", "creation_type", "chef_quote", "availability", "price"], "defaults": {"creation_type": "Creation", "chef_quote": "I''m really proud of this one", "availability": "Now serving"}}, "variation_rules": {"style_adjectives": ["behind the scenes", "chef story", "craft focus", "authentic kitchen"], "kitchen_scenes": ["hands working", "cooking action", "chef portrait", "recipe notes"], "camera_styles": ["documentary kitchen", "chef hands close-up", "action motion blur"]}}'::JSONB);

-- 12. New Item - "Now Serving" Simple Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-sq-now-serving', 'New Item - Now Serving', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 clean, simple graphic announcing a new menu item. NO FOOD—straightforward and elegant.

Background: Clean, professional design. Options:
- Solid brand color
- Simple gradient
- Subtle texture (paper, fabric, concrete)
- Menu board or chalkboard aesthetic
- Modern minimalist with ample white space

Simple and direct—no fuss, just the announcement.

Clean typography:
"{{headline}}"
"NOW SERVING"
"{{item_name}}"
"{{brief_description}}"
"${{price}}"
"{{cta}}"

Design elements: Minimal—maybe a simple line, border, or "NEW" badge. The simplicity IS the design. Clean, confident, professional.

The vibe: New on the menu. Simple as that. Come try it.
$PROMPT$,
'v1', TRUE,
'{"style": "simple_announcement", "category": "new_item", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["brief_description", "price", "cta"], "defaults": {"cta": "Available now"}}, "variation_rules": {"style_adjectives": ["clean", "simple", "elegant", "straightforward"], "background_types": ["solid color", "simple gradient", "subtle texture", "minimalist"], "camera_styles": ["clean layout", "minimal design", "professional announcement"]}}'::JSONB);



-- ============================================================================
-- NEW MENU ITEMS - INSTAGRAM STORIES (4 templates)
-- ============================================================================

-- 13. New Item - Name Reveal Sequence (2 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-story-name-reveal', 'New Item - Name Reveal Sequence', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence revealing a new menu item name. NO FOOD—pure typography reveal.

FRAME 1 - THE TEASE:
Vertical 9:16 with mysterious energy. Background is abstract:
- Blurred colors suggesting the dish's palette
- Textured surface (wood, marble, fabric)
- Gradient in appetizing colors
- Pattern or brand graphic

Typography builds suspense:
"{{tease_headline}}"
"NEW ON THE MENU"
"_ _ _ _ _ _ _ _"
(Blanks suggesting the name length)
"{{hint_line}}"
"Tap to reveal →"

---

FRAME 2 - THE REVEAL:
Same background style but "unveiled"—brighter, clearer, celebratory.

Typography reveals:
"{{reveal_headline}}"
"{{item_name}}"
"{{item_description}}"
"${{price}}"
"{{availability}}"
"{{cta}}"

The reveal feels satisfying—worth the tap. The name is the star.

The vibe: We've been working on something. Here it is. The name says it all.
$PROMPT$,
'v1', TRUE,
'{"style": "name_reveal", "category": "new_item", "has_food_imagery": false, "frame_count": 2, "input_schema": {"required": ["tease_headline", "reveal_headline", "item_name"], "optional": ["hint_line", "item_description", "price", "availability", "cta"], "defaults": {"hint_line": "Can you guess?", "availability": "Available now", "cta": "Come try it"}}, "variation_rules": {"style_adjectives": ["reveal sequence", "name focus", "typography hero", "suspense to satisfaction"], "background_types": ["blurred colors", "textured surface", "gradient", "brand pattern"], "camera_styles": ["abstract tease", "typography reveal", "celebration frame"]}}'::JSONB);

-- 14. New Item - "Guess What's New" Teaser
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-story-guess-new', 'New Item - Guess What''s New Teaser', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story teasing a new menu item with mystery. NO FOOD—clues and intrigue only.

Background: Mysterious, intriguing design. Options:
- Abstract color hints (warm for comfort food, fresh for salads, etc.)
- Silhouette or shadow of ingredients
- Blurred kitchen scene
- Question mark graphics
- "Coming soon" treatment with hidden elements

The visual gives HINTS without revealing.

Teaser typography:
"{{headline}}"
"GUESS WHAT'S NEW"
"{{clue_1}}"
"{{clue_2}}"
"{{clue_3}}"
"{{reveal_date}}"

Space for Instagram quiz or poll sticker.

"{{engagement_prompt}}"

Design elements: Question marks, mystery graphics, clue callouts. The audience wants to solve the puzzle.

The vibe: Something new is coming. Can you figure it out? Stay tuned for the reveal.
$PROMPT$,
'v1', TRUE,
'{"style": "mystery_teaser", "category": "new_item", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["clue_1", "clue_2", "clue_3", "reveal_date", "engagement_prompt"], "defaults": {"clue_1": "Hint: It''s delicious", "reveal_date": "Reveal coming soon", "engagement_prompt": "Drop your guesses below 👇"}}, "variation_rules": {"style_adjectives": ["mysterious", "teaser energy", "clue-based", "engaging"], "design_elements": ["question marks", "silhouettes", "blurred hints", "coming soon graphics"], "camera_styles": ["mystery layout", "clue presentation", "teaser design"]}}'::JSONB);

-- 15. New Item - Launch Day Celebration
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-story-launch-day', 'New Item - Launch Day Celebration', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story celebrating a new menu item launch. NO FOOD—pure celebration energy.

Background: Festive, exciting design. Options:
- Confetti and celebration graphics
- Spotlight or stage reveal aesthetic
- Bold color explosion
- "NOW AVAILABLE" burst treatment
- Party/launch energy with abstract elements

The design says THIS IS A BIG DEAL.

Celebration typography:
"{{headline}}"
"🎉 LAUNCH DAY 🎉"
"{{item_name}}"
"IS HERE"
"{{item_description}}"
"${{price}}"
"{{launch_special}}"
"{{cta}}"

Design elements: Confetti, stars, celebration badges, "today only" callouts if applicable. The energy is infectious.

The vibe: It's finally here! We're so excited. Come celebrate with us.
$PROMPT$,
'v1', TRUE,
'{"style": "launch_celebration", "category": "new_item", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name"], "optional": ["item_description", "price", "launch_special", "cta"], "defaults": {"launch_special": "Launch day special available", "cta": "Be one of the first to try it!"}}, "variation_rules": {"style_adjectives": ["celebratory", "launch energy", "exciting", "festive"], "design_elements": ["confetti", "spotlight", "celebration badges", "party graphics"], "camera_styles": ["celebration layout", "launch announcement", "festive design"]}}'::JSONB);

-- 16. New Item - First Review/Reaction Tease
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('newitem-story-reaction-tease', 'New Item - First Reaction Tease', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story teasing reactions to a new menu item. NO FOOD—social proof and anticipation.

Background: Engaging, testimonial-style design. Options:
- Quote bubble or speech graphic
- Star rating visual (without showing food)
- Reaction emoji collage
- "First taste" badge treatment
- Customer silhouette or abstract people graphics

The design highlights REACTIONS, not the item itself.

Reaction typography:
"{{headline}}"
"{{item_name}}"
"FIRST REACTIONS:"
"{{reaction_quote_1}}"
"{{reaction_quote_2}}"
"⭐⭐⭐⭐⭐"
"{{social_proof}}"
"{{cta}}"

Design elements: Quote bubbles, star ratings, reaction emojis, "people are saying" treatment. Social proof builds desire.

The vibe: People are loving it. Don't take our word for it. Come see what the hype is about.
$PROMPT$,
'v1', TRUE,
'{"style": "reaction_tease", "category": "new_item", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name"], "optional": ["reaction_quote_1", "reaction_quote_2", "social_proof", "cta"], "defaults": {"reaction_quote_1": "\"This is incredible!\"", "reaction_quote_2": "\"My new favorite\"", "social_proof": "Join the fans", "cta": "Try it yourself"}}, "variation_rules": {"style_adjectives": ["social proof", "testimonial energy", "reaction focus", "anticipation builder"], "design_elements": ["quote bubbles", "star ratings", "reaction emojis", "testimonial layout"], "camera_styles": ["testimonial design", "reaction showcase", "social proof layout"]}}'::JSONB);



-- ============================================================================
-- SEASONAL MENUS - INSTAGRAM SQUARE (3 templates)
-- ============================================================================

-- 17. Seasonal Menu Launch - Atmosphere Focus
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('seasonal-sq-atmosphere', 'Seasonal Menu - Atmosphere Launch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph capturing the SEASON and MOOD, not the food itself. The atmosphere tells the story.

Scene options (NO PLATED FOOD):
- Fall: Pumpkins, autumn leaves, warm lighting, cozy textures, cinnamon sticks
- Winter: Evergreen sprigs, candles, frost on windows, warm drinks (cups only, not food)
- Spring: Fresh flowers, bright natural light, garden elements, pastel colors
- Summer: Bright sunshine, outdoor patio, citrus colors, refreshing vibes

The scene evokes the season powerfully. You FEEL the time of year.

Typography announces the seasonal menu:
"{{headline}}"
"{{season}} MENU"
"{{menu_description}}"

FEATURING:
• {{item1}}
• {{item2}}
• {{item3}}

"{{date_range}}"
"{{cta}}"

The seasonal elements are the visual—the menu items are listed in beautiful typography. Anticipation without fake food.

The vibe: The season is here, and so is our menu for it. Timely, fresh, exciting.
$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_atmosphere", "category": "seasonal", "has_food_imagery": false, "input_schema": {"required": ["headline", "season"], "optional": ["menu_description", "item1", "item2", "item3", "date_range", "cta"], "defaults": {"menu_description": "Fresh flavors for the season", "date_range": "Available now", "cta": "See the full menu"}}, "variation_rules": {"style_adjectives": ["seasonal mood", "atmospheric", "time-of-year energy", "no food needed"], "season_elements": {"fall": ["pumpkins", "leaves", "warm lighting", "cinnamon"], "winter": ["evergreen", "candles", "frost", "cozy"], "spring": ["flowers", "bright light", "pastels"], "summer": ["sunshine", "citrus", "outdoor"]}, "camera_styles": ["seasonal still life", "atmospheric mood", "decorative arrangement"]}}'::JSONB);

-- 18. Seasonal Menu - Item List Typography
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('seasonal-sq-item-list', 'Seasonal Menu - Item List Typography', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic design showcasing the seasonal menu as a TYPOGRAPHY piece. NO FOOD—the menu items are the design.

Background: Seasonal color palette without food imagery. Options:
- Fall: Warm oranges, deep reds, golden yellows
- Winter: Cool blues, silver, deep greens, white
- Spring: Soft pinks, fresh greens, light yellows
- Summer: Bright yellows, ocean blues, coral

The background is color and texture—abstract, seasonal, appetizing.

Menu typography as art:
"{{headline}}"
"{{season}} MENU"

{{item1}} — {{price1}}
{{item2}} — {{price2}}
{{item3}} — {{price3}}
{{item4}} — {{price4}}
{{item5}} — {{price5}}

"{{date_range}}"
"{{cta}}"

Design elements: The menu list IS the design. Beautiful typography, perfect hierarchy, elegant spacing. Like a fine restaurant menu card.

The vibe: Here's what's on offer this season. Every item sounds incredible. Which will you choose?
$PROMPT$,
'v1', TRUE,
'{"style": "menu_typography", "category": "seasonal", "has_food_imagery": false, "input_schema": {"required": ["headline", "season", "item1"], "optional": ["item2", "item3", "item4", "item5", "price1", "price2", "price3", "price4", "price5", "date_range", "cta"], "defaults": {"date_range": "Limited time", "cta": "View full menu"}}, "variation_rules": {"style_adjectives": ["menu typography", "elegant list", "seasonal colors", "design-forward"], "season_palettes": {"fall": ["warm orange", "deep red", "golden yellow"], "winter": ["cool blue", "silver", "deep green"], "spring": ["soft pink", "fresh green", "light yellow"], "summer": ["bright yellow", "ocean blue", "coral"]}, "camera_styles": ["typography showcase", "menu card design", "elegant list layout"]}}'::JSONB);

-- 19. Seasonal Ingredients Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('seasonal-sq-ingredients', 'Seasonal Ingredients Showcase', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing SEASONAL RAW INGREDIENTS. NOT finished dishes—the fresh, seasonal building blocks.

Scene: Beautiful arrangement of seasonal produce and ingredients:
- Fall: Squash, pumpkins, apples, pears, cranberries, sage, cinnamon
- Winter: Citrus, pomegranates, root vegetables, rosemary, pine
- Spring: Asparagus, peas, strawberries, ramps, fresh herbs, edible flowers
- Summer: Tomatoes, corn, berries, stone fruits, basil, zucchini

Arranged on a rustic surface—wood, marble, linen. The ingredients are the stars.

Typography overlay:
"{{headline}}"
"{{season}} FLAVORS"
"{{seasonal_message}}"
"{{menu_tease}}"
"{{availability}}"

Lighting: Bright and fresh, celebrating the season's bounty. The ingredients look peak-season perfect.

The vibe: This is what's in season. This is what we're cooking with. Fresh, local, incredible.
$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_ingredients", "category": "seasonal", "has_food_imagery": false, "input_schema": {"required": ["headline", "season"], "optional": ["seasonal_message", "menu_tease", "availability"], "defaults": {"seasonal_message": "Peak season perfection", "menu_tease": "See what we''re making", "availability": "Seasonal menu now available"}}, "variation_rules": {"style_adjectives": ["seasonal produce", "fresh ingredients", "peak season", "farm fresh"], "season_ingredients": {"fall": ["squash", "pumpkins", "apples", "cranberries"], "winter": ["citrus", "pomegranates", "root vegetables"], "spring": ["asparagus", "peas", "strawberries", "herbs"], "summer": ["tomatoes", "corn", "berries", "stone fruits"]}, "camera_styles": ["overhead produce spread", "seasonal arrangement", "ingredient showcase"]}}'::JSONB);



-- ============================================================================
-- SEASONAL MENUS - INSTAGRAM STORIES (3 templates)
-- ============================================================================

-- 20. Seasonal Menu Countdown
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('seasonal-story-countdown', 'Seasonal Menu Countdown', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story counting down to a seasonal menu launch. NO FOOD—anticipation and seasonal energy.

Background: Seasonal atmosphere without food. Options:
- Fall: Falling leaves animation style, warm amber tones
- Winter: Snowflakes, frost patterns, cozy candlelight
- Spring: Blooming flowers, fresh green gradients
- Summer: Sunshine rays, beach/outdoor vibes

The season sets the mood; the countdown builds excitement.

Countdown typography:
"{{headline}}"
"{{season}} MENU"
"ARRIVING {{launch_date}}"
"{{countdown_message}}"
"{{menu_tease}}"

Space for Instagram countdown sticker.

"{{cta}}"

Design elements: Seasonal graphics, countdown numbers, "coming soon" treatment. The season is almost here.

The vibe: The season is changing, and so is our menu. Get ready for something special.
$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_countdown", "category": "seasonal", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "season", "launch_date"], "optional": ["countdown_message", "menu_tease", "cta"], "defaults": {"countdown_message": "The wait is almost over", "menu_tease": "New flavors coming", "cta": "Set a reminder 🔔"}}, "variation_rules": {"style_adjectives": ["seasonal anticipation", "countdown energy", "seasonal transition", "excitement building"], "season_visuals": {"fall": ["falling leaves", "warm amber"], "winter": ["snowflakes", "frost", "candlelight"], "spring": ["blooming flowers", "fresh green"], "summer": ["sunshine", "outdoor vibes"]}, "camera_styles": ["seasonal countdown", "anticipation layout", "launch teaser"]}}'::JSONB);

-- 21. Seasonal Menu "It's Here" Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('seasonal-story-its-here', 'Seasonal Menu - It''s Here Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story announcing the seasonal menu has LAUNCHED. NO FOOD—celebration and seasonal energy.

Background: Celebratory seasonal design. Options:
- Fall: Harvest celebration, warm golden burst
- Winter: Holiday sparkle, cozy celebration
- Spring: Fresh bloom explosion, renewal energy
- Summer: Bright sunshine celebration, vibrant colors

The season arrives with fanfare.

Launch typography:
"{{headline}}"
"{{season}} MENU"
"IS HERE! 🎉"
"{{menu_description}}"

FEATURING:
• {{item1}}
• {{item2}}
• {{item3}}

"{{availability}}"
"{{cta}}"

Design elements: Seasonal celebration graphics, "now available" badges, launch energy. The wait is over.

The vibe: It's finally here! The season's best flavors, ready for you. Come taste the season.
$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_launch", "category": "seasonal", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "season"], "optional": ["menu_description", "item1", "item2", "item3", "availability", "cta"], "defaults": {"menu_description": "Fresh seasonal flavors", "availability": "Available now", "cta": "Come taste the season"}}, "variation_rules": {"style_adjectives": ["seasonal celebration", "launch energy", "arrival announcement", "festive"], "season_celebrations": {"fall": ["harvest celebration", "golden burst"], "winter": ["holiday sparkle", "cozy celebration"], "spring": ["bloom explosion", "renewal"], "summer": ["sunshine celebration", "vibrant"]}, "camera_styles": ["celebration layout", "seasonal launch", "announcement design"]}}'::JSONB);

-- 22. Seasonal Menu Highlights Carousel Intro
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('seasonal-story-highlights-intro', 'Seasonal Menu Highlights Intro', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story introducing seasonal menu highlights. NO FOOD—typography and seasonal design.

Background: Elegant seasonal design. Options:
- Seasonal color gradient
- Abstract seasonal pattern
- Textured surface in seasonal tones
- Seasonal element border (leaves, snowflakes, flowers, etc.)

This is the INTRO frame—sets up a carousel or series.

Intro typography:
"{{headline}}"
"{{season}} MENU HIGHLIGHTS"
"{{intro_message}}"
"SWIPE TO SEE →"

• {{highlight1}}
• {{highlight2}}
• {{highlight3}}

"{{menu_count}} new items"
"{{cta}}"

Design elements: Seasonal accents, "swipe" indicator, highlight preview. This frame makes you want to see more.

The vibe: Here's a taste of what's new this season. Swipe through to see the highlights.
$PROMPT$,
'v1', TRUE,
'{"style": "carousel_intro", "category": "seasonal", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "season"], "optional": ["intro_message", "highlight1", "highlight2", "highlight3", "menu_count", "cta"], "defaults": {"intro_message": "Our favorites this season", "menu_count": "5+", "cta": "Swipe to explore"}}, "variation_rules": {"style_adjectives": ["carousel intro", "highlight preview", "seasonal elegance", "swipe energy"], "design_elements": ["seasonal gradient", "swipe indicator", "highlight list", "seasonal border"], "camera_styles": ["intro layout", "carousel opener", "highlight preview"]}}'::JSONB);



-- ============================================================================
-- RETURNING FAVORITES - INSTAGRAM SQUARE (3 templates)
-- ============================================================================

-- 23. "Back by Popular Demand" Hype
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('returning-sq-back-demand', 'Back by Popular Demand Hype', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic celebrating the return of a fan favorite. NO FOOD—pure hype energy through design.

Background: Bold, celebratory design. Options:
- Confetti or celebration graphics
- "SOLD OUT" stamps crossed out
- Retro/vintage announcement poster style
- Bold color blocks with brand colors
- Spotlight/stage curtain reveal energy

The design screams "IT'S BACK!" without showing the item.

Hype typography:
"{{headline}}"
"{{item_name}}"
"IS BACK"
"{{return_story}}"
"{{availability}}"
"{{urgency_message}}"
"{{cta}}"

Design elements: Stars, exclamation points, "fan favorite" badges, "you asked, we listened" messaging, social proof hints.

The vibe: You loved it. You asked for it. It's HERE. Don't miss it this time.
$PROMPT$,
'v1', TRUE,
'{"style": "hype_celebration", "category": "returning", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["return_story", "availability", "urgency_message", "cta"], "defaults": {"return_story": "You asked, we listened", "availability": "For a limited time", "urgency_message": "Last time it sold out fast", "cta": "Get it while you can"}}, "variation_rules": {"style_adjectives": ["hype energy", "celebration", "fan favorite return", "urgency"], "design_elements": ["confetti", "sold out stamps", "retro poster", "spotlight reveal"], "camera_styles": ["bold graphic design", "celebration layout", "announcement poster"]}}'::JSONB);

-- 24. "Fan Favorite Returns" Celebration
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('returning-sq-fan-favorite', 'Fan Favorite Returns Celebration', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic celebrating a fan favorite's return. NO FOOD—community and celebration energy.

Background: Warm, celebratory design. Options:
- Trophy or award graphic treatment
- Heart/love graphics
- "Fan Favorite" badge or ribbon
- Community/crowd silhouette celebration
- Star rating or review highlight aesthetic

The design celebrates the FANS as much as the item.

Celebration typography:
"{{headline}}"
"FAN FAVORITE"
"{{item_name}}"
"RETURNS"
"{{fan_message}}"
"{{social_proof}}"
"{{availability}}"
"{{cta}}"

Design elements: Trophy graphics, heart icons, star ratings, "voted #1" badges, community celebration. The fans made this happen.

The vibe: This is YOUR favorite. You made it happen. Welcome back to the menu.
$PROMPT$,
'v1', TRUE,
'{"style": "fan_celebration", "category": "returning", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["fan_message", "social_proof", "availability", "cta"], "defaults": {"fan_message": "Your #1 pick is back", "social_proof": "Voted most-requested", "availability": "Back for a limited time", "cta": "Reunite with your favorite"}}, "variation_rules": {"style_adjectives": ["fan celebration", "community love", "favorite return", "appreciation"], "design_elements": ["trophy graphic", "heart icons", "fan favorite badge", "star ratings"], "camera_styles": ["celebration layout", "fan appreciation", "community design"]}}'::JSONB);

-- 25. "You Asked, We Listened" Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('returning-sq-you-asked', 'You Asked We Listened', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing a returning item based on customer demand. NO FOOD—community connection energy.

Background: Engaging, responsive design. Options:
- Speech bubble or comment graphics
- Social media notification aesthetic
- "Your voice matters" treatment
- DM/message conversation style
- Megaphone or announcement graphic

The design shows you LISTEN to your community.

Community typography:
"{{headline}}"
"YOU ASKED"
"WE LISTENED"
"{{item_name}}"
"IS BACK"
"{{customer_quote}}"
"{{response_message}}"
"{{availability}}"
"{{cta}}"

Design elements: Speech bubbles, comment icons, "thank you" messaging, community graphics. The conversation led to action.

The vibe: We heard you. Your feedback matters. Here's what you asked for.
$PROMPT$,
'v1', TRUE,
'{"style": "community_response", "category": "returning", "has_food_imagery": false, "input_schema": {"required": ["headline", "item_name"], "optional": ["customer_quote", "response_message", "availability", "cta"], "defaults": {"customer_quote": "\"Please bring it back!\"", "response_message": "Your wish is our command", "availability": "Back by popular demand", "cta": "Come get it"}}, "variation_rules": {"style_adjectives": ["community connection", "responsive", "customer-driven", "listening"], "design_elements": ["speech bubbles", "comment icons", "notification style", "megaphone"], "camera_styles": ["community layout", "conversation design", "response announcement"]}}'::JSONB);



-- ============================================================================
-- RETURNING FAVORITES - INSTAGRAM STORIES (3 templates)
-- ============================================================================

-- 26. "Guess What's Coming Back" Teaser
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('returning-story-guess-back', 'Guess What''s Coming Back Teaser', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story teasing a returning favorite. NO FOOD—mystery and nostalgia energy.

Background: Mysterious, nostalgic design. Options:
- Blurred or obscured hint graphics
- "Throwback" or "Remember?" treatment
- Question mark graphics
- Silhouette or shadow hints
- "Coming back" countdown aesthetic

The visual creates curiosity about WHAT is returning.

Teaser typography:
"{{headline}}"
"GUESS WHAT'S"
"COMING BACK"
"{{hint_1}}"
"{{hint_2}}"
"{{hint_3}}"
"{{reveal_date}}"

Space for Instagram quiz or poll sticker.

"{{engagement_prompt}}"

Design elements: Question marks, mystery graphics, throwback aesthetic, hint callouts. The guessing game is fun.

The vibe: A fan favorite is returning. Can you guess which one? The reveal is coming.
$PROMPT$,
'v1', TRUE,
'{"style": "mystery_return", "category": "returning", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["hint_1", "hint_2", "hint_3", "reveal_date", "engagement_prompt"], "defaults": {"hint_1": "Hint: You''ve been asking for it", "reveal_date": "Reveal coming soon", "engagement_prompt": "Drop your guesses! 👇"}}, "variation_rules": {"style_adjectives": ["mystery teaser", "nostalgia", "guessing game", "anticipation"], "design_elements": ["question marks", "throwback graphics", "hint callouts", "mystery blur"], "camera_styles": ["mystery layout", "teaser design", "guessing game"]}}'::JSONB);

-- 27. "It's BACK" Reveal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('returning-story-its-back', 'It''s BACK Reveal', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story revealing a returning favorite. NO FOOD—pure celebration and reveal energy.

Background: Explosive, celebratory design. Options:
- Confetti burst
- Curtain reveal aesthetic
- Spotlight moment
- "BACK" in bold, explosive typography
- Celebration graphics and stars

The design is the BIG REVEAL moment.

Reveal typography:
"{{headline}}"
"IT'S"
"BACK"
"{{item_name}}"
"{{return_message}}"
"{{availability}}"
"{{urgency_message}}"
"{{cta}}"

Design elements: Explosion graphics, confetti, spotlight, "finally" messaging, celebration energy. The moment everyone's been waiting for.

The vibe: THE WAIT IS OVER. It's back. Go get it before it's gone again.
$PROMPT$,
'v1', TRUE,
'{"style": "reveal_celebration", "category": "returning", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name"], "optional": ["return_message", "availability", "urgency_message", "cta"], "defaults": {"return_message": "Your favorite is back", "availability": "Available now", "urgency_message": "For a limited time only", "cta": "Don''t miss it this time!"}}, "variation_rules": {"style_adjectives": ["reveal moment", "celebration explosion", "big announcement", "hype"], "design_elements": ["confetti burst", "curtain reveal", "spotlight", "explosion graphics"], "camera_styles": ["reveal layout", "celebration design", "announcement moment"]}}'::JSONB);

-- 28. "Last Time It Sold Out" Urgency
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('returning-story-sold-out-urgency', 'Last Time It Sold Out Urgency', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story creating urgency for a returning item. NO FOOD—FOMO and scarcity energy.

Background: Urgent, scarcity-focused design. Options:
- "SOLD OUT" stamp (crossed out or faded)
- Limited quantity graphics
- Clock or countdown elements
- "Don't miss out" warning treatment
- Scarcity indicators (limited stock visual)

The design emphasizes this might sell out AGAIN.

Urgency typography:
"{{headline}}"
"{{item_name}}"
"IS BACK"
"{{sold_out_message}}"
"{{scarcity_warning}}"
"{{availability}}"
"{{cta}}"

Design elements: "Sold out last time" badges, limited quantity warnings, clock graphics, urgency colors (red/orange). Act fast or miss out.

The vibe: It sold out before. It will sell out again. This is your chance—don't blow it.
$PROMPT$,
'v1', TRUE,
'{"style": "scarcity_urgency", "category": "returning", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "item_name"], "optional": ["sold_out_message", "scarcity_warning", "availability", "cta"], "defaults": {"sold_out_message": "Last time it sold out in 3 days", "scarcity_warning": "Limited quantities available", "availability": "Back for a limited time", "cta": "Get yours before it''s gone"}}, "variation_rules": {"style_adjectives": ["scarcity", "urgency", "FOMO", "limited availability"], "design_elements": ["sold out stamp", "limited quantity", "countdown clock", "warning graphics"], "camera_styles": ["urgency layout", "scarcity design", "FOMO announcement"]}}'::JSONB);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
