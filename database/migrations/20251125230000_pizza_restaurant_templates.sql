-- Pizza Restaurant Templates Migration
-- Generated: 2025-11-25
-- 30 templates: 12 Instagram Square, 10 Instagram Stories, 5 Facebook Posts, 3 Carousels

-- =====================================================
-- INSTAGRAM SQUARE (1:1) TEMPLATES - 12 total
-- =====================================================

-- 1. Epic Cheese Pull Hero Shot
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-cheese-pull-hero', 'Epic Cheese Pull Hero Shot', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The most iconic pizza shot: THE CHEESE PULL. This image should make people stop scrolling and start drooling.

THE MOMENT: A slice of pizza being lifted from the pie, captured at the PERFECT moment of cheese pull. The slice is held by a hand (or pizza server) at approximately 45 degrees, about 6-8 inches above the pizza. The cheese stretches in multiple golden strands—some thick, some thin, creating that impossible, gravity-defying bridge between slice and pie.

THE PIZZA: A large (16-18") pizza on a traditional round pizza pan or wooden board. The pizza shows:
- Perfectly melted mozzarella, golden and bubbling in spots
- Visible toppings appropriate to style (pepperoni with curled edges and grease pools, or fresh basil and tomato for Margherita)
- Crust with ideal color—golden brown with darker spots of char
- The "wound" where the slice was lifted, showing more cheese strands

THE CHEESE DETAIL: This is CRITICAL. The cheese pull should show:
- Multiple strands at different thicknesses
- The stretch should look REAL, not artificial
- Some strands catching the light, appearing almost translucent
- The cheese on the slice still connected, not breaking
- Approximately 8-12 inches of stretch visible

THE SETTING:
- Surface: Rustic wood table, marble counter, or red-checkered tablecloth
- Background: Soft focus pizzeria atmosphere—maybe a brick oven visible, warm lighting, Italian décor elements
- Props: A stack of white plates, red pepper flakes shaker, parmesan cheese, maybe a glass of red wine or beer

LIGHTING: Warm, appetizing, slightly dramatic. Side lighting to emphasize the cheese strands and create depth. The cheese should GLOW. Overall warm color temperature suggesting a cozy Italian restaurant.

TYPOGRAPHY ZONE (lower third):
"{{headline}}"
"{{pizza_name}}"
"{{price_or_offer}}"

TECHNICAL: Shot at f/2.8-4.0 for selective focus on the cheese pull. The stretching cheese is tack-sharp, background falls off into creamy bokeh. Slight motion blur on the lifting hand is acceptable—adds to the "caught in the moment" feel.

This image is ICONIC. It's the shot that defines pizza photography. It makes people NEED pizza.$PROMPT$,
'v1', TRUE,
'{"style": "cheese_pull_hero", "food_focus": "whole_pizza_slice", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "price_or_offer"], "defaults": {"pizza_name": "House Specialty Pizza", "price_or_offer": ""}}, "variation_rules": {"style_adjectives": ["iconic cheese pull", "gravity-defying stretch", "golden gooey perfection", "caught-in-moment action"], "pizza_styles": ["pepperoni classic", "margherita fresh", "meat lovers loaded", "supreme everything"], "cheese_types": ["mozzarella stretch", "four cheese blend", "burrata center"], "camera_angles": ["45-degree lift", "side profile pull", "overhead with lift"]}}'::JSONB);

-- 2. Wood-Fired Oven Action
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-wood-fired-action', 'Wood-Fired Oven Action Shot', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The drama of wood-fired pizza making. Fire, skill, tradition.

THE ACTION: A pizza being pulled from (or placed into) a blazing wood-fired pizza oven. The pizza sits on a long wooden pizza peel, the pizzaiolo's hands visible gripping the handle. The moment is DYNAMIC—you can feel the heat, the skill, the tradition.

THE OVEN: A traditional dome-shaped wood-fired pizza oven, the interior glowing orange-red with live flames visible. The fire should be ALIVE—actual flames licking up the sides, embers glowing, the heat almost palpable. The oven mouth is the frame within the frame.

THE PIZZA: On the peel, a perfectly formed pizza ready for the oven OR just emerging with:
- Bubbling, slightly charred cheese
- Leopard-spotted crust (the signature of wood-fired)
- Toppings glistening with heat
- Steam or heat shimmer rising

THE PIZZAIOLO: Hands and arms visible, maybe wearing a traditional white chef's coat or apron. The posture suggests expertise—confident, practiced movements. Face not necessary, but the human element adds authenticity.

THE ENVIRONMENT:
- The oven is the STAR—beautiful tilework or brick surrounding it
- Stacked firewood visible nearby
- Other pizzas or ingredients in soft focus
- The warm glow of the fire illuminating the scene

LIGHTING: Dramatic contrast between the bright fire and the darker surroundings. The fire provides the key light, creating a warm, almost theatrical atmosphere. The pizza and hands are lit by the oven's glow.

TYPOGRAPHY:
"{{headline}}"
"{{oven_description}}"
"{{tradition_tagline}}"

This image is CRAFT. It's tradition. It's "this is how REAL pizza is made." It differentiates from chains and frozen pizza.$PROMPT$,
'v1', TRUE,
'{"style": "wood_fired_action", "food_focus": "pizza_making", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["oven_description", "tradition_tagline"], "defaults": {"oven_description": "Wood-Fired at 900°F", "tradition_tagline": "Tradition in Every Bite"}}, "variation_rules": {"style_adjectives": ["dramatic fire glow", "artisan craft", "traditional technique", "heat and skill"], "action_moments": ["placing in oven", "pulling from oven", "turning pizza", "checking doneness"], "oven_styles": ["neapolitan dome", "brick traditional", "modern wood-fire", "outdoor pizza oven"]}}'::JSONB);

-- 3. Pepperoni Perfection
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-pepperoni-perfection', 'Pepperoni Perfection Classic', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The KING of pizzas: Pepperoni. America's favorite, done to absolute perfection.

THE PIZZA: A full pepperoni pizza, shot from directly overhead or at a slight 15-degree angle. This pizza is PERFECT:
- Generous pepperoni coverage—not sparse, not overcrowded, just RIGHT
- Every pepperoni slice has CURLED into a cup shape from the heat
- Each cup has a small pool of rendered, glistening orange-red grease
- Some pepperonis show slight char on the edges (flavor!)
- The pepperoni is evenly distributed with mathematical precision

THE CHEESE: Golden mozzarella visible between the pepperoni:
- Bubbling in spots, showing it's fresh from the oven
- Slight browning on the peaks
- The cheese has that perfect "just set" look—not raw, not overcooked

THE CRUST: A beautiful ring of golden-brown crust:
- Puffy and airy for Neapolitan style, OR
- Thin and crispy for New York style
- Visible char spots (leoparding) for authenticity
- The crust-to-topping ratio is ideal

THE SETTING:
- Pizza on a classic round aluminum pan, wooden pizza board, or directly on marble
- Red checkered tablecloth visible at edges, OR
- Dark slate/wood surface for contrast
- Maybe a pizza cutter, red pepper flakes, or parmesan visible

LIGHTING: Bright, even lighting that makes the pepperoni GLOW. The grease pools should catch the light. Warm color temperature. This pizza looks HOT and ready to eat.

TYPOGRAPHY:
"{{headline}}"
"{{pizza_name}}"
"{{price}}"
"{{size_options}}"

This is THE classic. The one everyone knows and loves. Shot to remind people why pepperoni pizza is perfect.$PROMPT$,
'v1', TRUE,
'{"style": "pepperoni_classic", "food_focus": "whole_pizza", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "price", "size_options"], "defaults": {"pizza_name": "Classic Pepperoni", "price": "", "size_options": ""}}, "variation_rules": {"style_adjectives": ["classic perfection", "cup and char", "grease pool glory", "pepperoni paradise"], "pepperoni_styles": ["cup and char", "flat crispy", "thick cut", "spicy calabrese"], "crust_styles": ["new york thin", "neapolitan puffy", "hand-tossed", "pan style"], "camera_angles": ["direct overhead", "slight angle", "hero 45-degree"]}}'::JSONB);


-- 4. Margherita Elegance
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-margherita-elegance', 'Margherita Elegance', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The Margherita: simplicity elevated to art. Three ingredients, infinite beauty.

THE PIZZA: A pristine Margherita pizza, the colors of the Italian flag in edible form:
- Fresh mozzarella (fior di latte or buffalo) in torn pieces, melted but still showing texture
- San Marzano tomato sauce peeking through—vibrant red, not orange
- Fresh basil leaves—BRIGHT GREEN, placed after baking so they're not wilted or blackened
- A drizzle of golden extra virgin olive oil glistening on top
- Maybe a sprinkle of sea salt crystals catching the light

THE CRUST: Neapolitan-style perfection:
- Puffy, pillowy cornicione (the raised edge)
- Leopard spotting—those beautiful char bubbles
- The center is thin, slightly wet (as authentic Neapolitan should be)
- The crust looks light and airy, not dense

THE COMPOSITION: This pizza is ELEGANT:
- Shot overhead or at slight angle to show the beautiful simplicity
- The basil leaves are artfully placed, not random
- The mozzarella pools are evenly distributed
- There's negative space—you can see the sauce

THE SETTING: Upscale but authentic:
- White marble surface or light wood
- Maybe a sprig of fresh basil nearby
- A small dish of olive oil
- Clean, minimal, letting the pizza be the star
- Perhaps a wine glass edge visible

LIGHTING: Bright, natural-looking light. The colors should POP—the green of basil, red of sauce, white of cheese. This is fresh, light, Mediterranean.

TYPOGRAPHY:
"{{headline}}"
"{{pizza_name}}"
"{{authenticity_tagline}}"
"{{price}}"

This image says QUALITY. It says "we understand pizza." It's for the discerning customer who appreciates simplicity done right.$PROMPT$,
'v1', TRUE,
'{"style": "margherita_elegance", "food_focus": "whole_pizza", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "authenticity_tagline", "price"], "defaults": {"pizza_name": "Margherita D.O.C.", "authenticity_tagline": "Simple. Perfect. Authentic.", "price": ""}}, "variation_rules": {"style_adjectives": ["elegant simplicity", "italian colors", "fresh and light", "artisan authentic"], "mozzarella_types": ["fior di latte", "buffalo mozzarella", "fresh torn", "burrata center"], "basil_presentation": ["whole leaves", "chiffonade", "micro basil", "flowering basil"], "camera_angles": ["overhead flat", "slight tilt", "artistic angle"]}}'::JSONB);

-- 5. Meat Lovers Mountain
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-meat-lovers', 'Meat Lovers Mountain', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The Meat Lovers: a MOUNTAIN of protein. This pizza means business.

THE PIZZA: A fully loaded meat lovers pizza that's almost intimidating in its abundance:
- Pepperoni (cupped and charred)
- Italian sausage (crumbled, browned, glistening)
- Bacon (crispy pieces or strips)
- Ham (diced or sliced)
- Ground beef (seasoned, browned)
- Maybe salami or prosciutto for extra variety
- The toppings are GENEROUS—this pizza is LOADED

THE MEAT DETAILS:
- Each meat type is visible and identifiable
- The meats have rendered their fat—everything glistens
- Crispy edges where meats met high heat
- The variety of textures is visible—crispy bacon, soft sausage, curled pepperoni
- Cheese bubbles up between the meat pieces

THE CHEESE: Barely visible under the meat mountain, but:
- Golden and bubbling where it peeks through
- Melted around and under the meats
- Creating that glue that holds everything together

THE CRUST: Sturdy enough to hold this payload:
- Golden brown, substantial
- Visible at the edges, proving this is a real pizza
- Maybe some cheese has melted over the edge (bonus!)

THE SETTING: Hearty, substantial:
- Dark wood table or black slate
- Maybe a beer bottle or mug visible
- Red pepper flakes for those who want more heat
- The vibe is "game day" or "hungry crowd"

LIGHTING: Dramatic, making the meats look rich and satisfying. Warm tones. The fats should glisten. This pizza looks HEAVY and SATISFYING.

TYPOGRAPHY:
"{{headline}}"
"{{pizza_name}}"
"{{meat_count}}"
"{{price}}"

This image is for the HUNGRY. The meat lovers. The "go big or go home" crowd.$PROMPT$,
'v1', TRUE,
'{"style": "meat_lovers_loaded", "food_focus": "whole_pizza", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "meat_count", "price"], "defaults": {"pizza_name": "The Meat Mountain", "meat_count": "6 Premium Meats", "price": ""}}, "variation_rules": {"style_adjectives": ["loaded mountain", "protein paradise", "carnivore dream", "meat feast"], "meat_combinations": ["classic six meat", "italian meats", "bbq meats", "breakfast meats"], "presentation": ["overhead abundance", "slice lift heavy", "side profile layers"], "camera_angles": ["overhead", "45-degree hero", "close-up detail"]}}'::JSONB);

-- 6. Supreme/Everything Pizza
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-supreme-everything', 'Supreme Everything Pizza', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The Supreme: everything you want on one pizza. The crowd-pleaser.

THE PIZZA: A fully loaded supreme pizza with the classic combination:
- Pepperoni (cupped, charred edges)
- Italian sausage (crumbled, browned)
- Green bell peppers (bright green, slightly softened)
- Red onions (purple rings, caramelized edges)
- Black olives (sliced rings, glossy)
- Mushrooms (sliced, golden brown)
- Maybe jalapeños for heat
- All on a bed of golden, bubbling mozzarella

THE TOPPING DISTRIBUTION:
- Even coverage—every slice gets everything
- Colors create visual interest—green, red, purple, black, brown
- The variety is the POINT—this pizza has it ALL
- Toppings are fresh-looking, not wilted or sad

THE CHEESE: Visible between toppings:
- Golden and bubbling
- Stretchy where toppings have shifted
- The foundation that ties everything together

THE CRUST: Classic and reliable:
- Golden brown ring
- Substantial enough to hold the toppings
- Maybe some cheese overflow at edges

THE SETTING: Classic pizzeria:
- Red checkered tablecloth, OR
- Classic pizza pan on wooden table
- Parmesan shaker, red pepper flakes nearby
- The vibe is "family favorite"

LIGHTING: Bright and appetizing. Every topping should be clearly visible and look fresh. The colors should pop—this pizza is a rainbow of deliciousness.

TYPOGRAPHY:
"{{headline}}"
"{{pizza_name}}"
"{{topping_list}}"
"{{price}}"

This is the SAFE CHOICE that's never boring. The pizza everyone can agree on. The crowd-pleaser.$PROMPT$,
'v1', TRUE,
'{"style": "supreme_everything", "food_focus": "whole_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "topping_list", "price"], "defaults": {"pizza_name": "The Supreme", "topping_list": "Pepperoni, Sausage, Peppers, Onions, Olives, Mushrooms", "price": ""}}, "variation_rules": {"style_adjectives": ["loaded supreme", "everything pizza", "crowd pleaser", "classic combo"], "topping_variations": ["classic supreme", "veggie supreme", "deluxe supreme", "super supreme"], "camera_angles": ["overhead colorful", "slice showcase", "45-degree hero"]}}'::JSONB);

-- 7. Specialty Pizza Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-specialty-feature', 'Specialty Pizza Feature', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — Your SIGNATURE pizza. The one that makes you famous. The reason people drive across town.

THE PIZZA: A unique, specialty pizza that showcases creativity and quality:
- Premium, unexpected toppings (truffle oil, prosciutto, arugula, fig, gorgonzola, etc.)
- Artisan presentation—this isn't a basic pizza
- The toppings tell a STORY (BBQ chicken, white pizza, breakfast pizza, etc.)
- Quality ingredients that are VISIBLE and identifiable

THE PRESENTATION:
- This pizza looks SPECIAL—not like every other pizza
- Garnishes that elevate (fresh arugula on top, balsamic drizzle, microgreens)
- The composition is intentional, almost architectural
- Colors and textures create visual interest

THE DETAILS THAT MATTER:
- If there's meat, it's premium (prosciutto, pancetta, nduja)
- If there's cheese, it's interesting (burrata, gorgonzola, goat cheese)
- If there's sauce, it might be unique (pesto, white sauce, BBQ, garlic oil)
- Fresh herbs or greens added AFTER baking for color pop

THE SETTING: Upscale casual:
- Clean, modern surface (marble, slate, light wood)
- Minimal props—let the pizza speak
- Maybe a wine glass or craft beer
- The environment suggests quality

LIGHTING: Beautiful, almost editorial. This pizza could be in a food magazine. The lighting highlights the premium ingredients and artisan quality.

TYPOGRAPHY:
"{{headline}}"
"{{pizza_name}}"
"{{description}}"
"{{price}}"
"{{availability}}"

This image says "we're not just another pizza place." It's the signature dish that defines your restaurant.$PROMPT$,
'v1', TRUE,
'{"style": "specialty_signature", "food_focus": "whole_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline", "pizza_name"], "optional": ["description", "price", "availability"], "defaults": {"description": "", "price": "", "availability": ""}}, "variation_rules": {"style_adjectives": ["signature creation", "chef special", "house famous", "artisan unique"], "specialty_types": ["white pizza", "bbq chicken", "truffle mushroom", "fig prosciutto", "buffalo chicken", "breakfast pizza"], "presentation_styles": ["editorial elegant", "rustic artisan", "modern minimal"]}}'::JSONB);


-- 8. Pizza + Beer/Wine Pairing
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-drink-pairing', 'Pizza & Drink Pairing', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — Pizza and its perfect partner: beer or wine. The ultimate pairing.

THE COMPOSITION: A beautiful pizza alongside its ideal beverage companion:
- The pizza takes up about 60% of the frame
- The drink is positioned as the co-star, not an afterthought
- Both elements are in focus and beautifully lit
- The pairing feels INTENTIONAL and curated

THE PIZZA: A gorgeous, appetizing pizza:
- Could be any style—Margherita with wine, pepperoni with beer
- Fresh from the oven, cheese still bubbling
- A slice might be lifted or cut to show the interior
- The pizza looks perfect and ready to eat

THE DRINK:
FOR BEER:
- A frosty pint glass or craft beer bottle
- Condensation on the glass
- A nice foam head if draft
- The beer color complements the pizza (amber lager, dark stout, golden pilsner)

FOR WINE:
- A proper wine glass (red wine in a larger bowl, white in a narrower glass)
- The wine color is rich and inviting
- Maybe the bottle visible in background
- Suggests sophistication

THE SETTING: Date night or relaxed evening vibe:
- Warm, intimate lighting
- Dark wood table or bar setting
- Maybe candles or ambient restaurant lighting
- The mood is "treat yourself"

LIGHTING: Warm, romantic, appetizing. The drink should glisten. The pizza should glow. The overall feeling is indulgent and special.

TYPOGRAPHY:
"{{headline}}"
"{{pairing_name}}"
"{{pizza_name}}"
"{{drink_name}}"
"{{price}}"

This image sells the EXPERIENCE. It's not just pizza—it's an evening out. It's treating yourself.$PROMPT$,
'v1', TRUE,
'{"style": "drink_pairing", "food_focus": "pizza_and_beverage", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["pairing_name", "pizza_name", "drink_name", "price"], "defaults": {"pairing_name": "Perfect Pairing", "pizza_name": "", "drink_name": "", "price": ""}}, "variation_rules": {"style_adjectives": ["perfect pairing", "date night", "treat yourself", "elevated experience"], "drink_types": ["craft beer", "red wine", "white wine", "italian beer", "cocktail"], "pizza_pairings": ["margherita with chianti", "pepperoni with lager", "white pizza with pinot grigio"], "settings": ["intimate dinner", "bar scene", "outdoor patio"]}}'::JSONB);

-- 9. Fresh Ingredients Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-fresh-ingredients', 'Fresh Ingredients Showcase', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The ingredients that make the pizza. Fresh, quality, beautiful.

THE COMPOSITION: A stunning display of pizza ingredients arranged artfully:
- Fresh mozzarella balls or burrata, creamy and white
- San Marzano tomatoes (whole or crushed), vibrant red
- Fresh basil leaves, bright green and aromatic
- Olive oil in a small dish, golden and glistening
- Flour dusted on the surface
- Maybe a ball of fresh dough
- Garlic cloves, whole or sliced
- Various toppings arranged beautifully (pepperoni, vegetables, meats)

THE ARRANGEMENT:
- Ingredients are arranged in an aesthetically pleasing pattern
- Colors create visual harmony—red, green, white, golden
- Some ingredients in bowls, some loose on the surface
- The arrangement suggests abundance and quality
- A pizza or pizza dough might be partially visible

THE DETAILS:
- Water droplets on tomatoes and basil (freshness)
- The mozzarella looks soft and fresh
- Olive oil catches the light
- Everything looks like it was just picked or prepared

THE SETTING: Kitchen or prep area:
- Marble counter or wooden cutting board
- Flour dusted surface
- Maybe a rolling pin or pizza peel visible
- Clean, professional, but warm

LIGHTING: Bright, natural-looking light that makes everything look FRESH. The colors should be vibrant and true. This is farm-to-table, quality-first imagery.

TYPOGRAPHY:
"{{headline}}"
"{{quality_message}}"
"{{sourcing_info}}"

This image is about QUALITY. It says "we use the best ingredients." It differentiates from places using cheap, processed toppings.$PROMPT$,
'v1', TRUE,
'{"style": "ingredients_showcase", "food_focus": "raw_ingredients", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["quality_message", "sourcing_info"], "defaults": {"quality_message": "Only the Finest Ingredients", "sourcing_info": ""}}, "variation_rules": {"style_adjectives": ["farm fresh", "quality first", "artisan ingredients", "handpicked selection"], "ingredient_focus": ["italian imports", "local farm", "premium meats", "fresh vegetables"], "arrangements": ["flat lay artistic", "rustic scattered", "organized grid", "flowing composition"]}}'::JSONB);

-- 10. Pizza Box Reveal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-box-reveal', 'Pizza Box Reveal', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The pizza box opening moment. Delivery/takeout magic.

THE MOMENT: A pizza box being opened to reveal the beautiful pizza inside. This is the REVEAL—the anticipation, the first look, the "oh wow" moment.

THE BOX:
- Classic pizza box, lid being lifted or just opened
- The box could be branded (your logo) or generic
- The lid is at an angle that shows both the box and the pizza
- Steam might be escaping (it's HOT and fresh)

THE PIZZA INSIDE:
- A perfect pizza filling the box
- Cheese still bubbling or just settled
- Toppings clearly visible and appetizing
- The pizza looks like it traveled well—not a mess

THE HANDS: Someone opening the box:
- Hands lifting the lid with anticipation
- Could be delivery driver handing off, or customer opening
- The human element adds excitement

THE SETTING: Delivery/takeout context:
- Home kitchen counter or coffee table
- Doorstep delivery moment
- Couch/TV visible (movie night vibes)
- Napkins, plates ready nearby

LIGHTING: Warm, inviting. The pizza should be the brightest thing in the frame—the "treasure" being revealed. The moment should feel exciting and satisfying.

TYPOGRAPHY:
"{{headline}}"
"{{delivery_message}}"
"{{ordering_info}}"
"{{delivery_time}}"

This image sells CONVENIENCE. It's "get this delivered to your door." It's the promise of pizza night without leaving home.$PROMPT$,
'v1', TRUE,
'{"style": "box_reveal", "food_focus": "whole_pizza", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["delivery_message", "ordering_info", "delivery_time"], "defaults": {"delivery_message": "Hot & Fresh to Your Door", "ordering_info": "Order Online or Call", "delivery_time": ""}}, "variation_rules": {"style_adjectives": ["delivery magic", "box reveal", "fresh arrival", "doorstep delight"], "reveal_moments": ["lid lifting", "just opened", "handing over", "first peek"], "settings": ["home delivery", "doorstep", "couch setup", "kitchen counter"]}}'::JSONB);

-- 11. By-the-Slice Counter Display
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-slice-counter', 'By-the-Slice Counter Display', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The classic slice shop counter. Variety, accessibility, New York vibes.

THE DISPLAY: A pizza counter showing multiple pizzas ready for slicing:
- 4-6 different pizzas visible in the display case or on the counter
- Variety of toppings—cheese, pepperoni, supreme, specialty
- The pizzas are whole or have 1-2 slices removed
- Everything looks fresh and ready to serve

THE COUNTER SETUP:
- Classic pizza counter with glass display, OR
- Open counter with pizzas on stands/pans
- Heat lamps keeping everything warm
- The setup says "grab a slice"

THE VARIETY:
- Plain cheese (the classic)
- Pepperoni (the favorite)
- A veggie option
- A specialty/white pizza
- Maybe a Sicilian/square slice
- Each pizza is clearly different and identifiable

THE ENVIRONMENT: Slice shop atmosphere:
- Maybe a worker behind the counter
- Price signs visible
- The hustle and bustle of a busy pizza place
- Napkin dispensers, red pepper flakes, parmesan

LIGHTING: Bright, commercial, appetizing. The pizzas under heat lamps have that warm glow. Everything looks ready to eat RIGHT NOW.

TYPOGRAPHY:
"{{headline}}"
"{{slice_price}}"
"{{variety_message}}"
"{{location_info}}"

This image is ACCESSIBILITY. It's "come in, grab a slice, get on with your day." Quick, easy, delicious.$PROMPT$,
'v1', TRUE,
'{"style": "slice_counter", "food_focus": "multiple_pizzas", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["slice_price", "variety_message", "location_info"], "defaults": {"slice_price": "Slices from $3", "variety_message": "Fresh Slices All Day", "location_info": ""}}, "variation_rules": {"style_adjectives": ["slice shop classic", "grab and go", "new york style", "counter service"], "display_styles": ["glass case", "open counter", "rotating display", "stacked pans"], "variety_levels": ["4 varieties", "6 varieties", "8+ varieties"]}}'::JSONB);

-- 12. Late Night Pizza Craving
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-sq-late-night', 'Late Night Pizza Craving', 'pizza', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — Late night pizza. The craving that hits after midnight. The cure for hunger.

THE SCENE: A moody, late-night pizza moment:
- A pizza (or slice) in a dimly lit setting
- The pizza is the brightest element—glowing, inviting
- The vibe is "2 AM craving satisfied"
- Urban, night-time atmosphere

THE PIZZA:
- Could be a whole pizza on a table
- Or a slice being eaten
- Or a pizza box open on a bed/couch
- The pizza looks PERFECT—exactly what you need right now

THE SETTING: Late night contexts:
- City lights visible through a window
- Neon signs reflecting
- A bar or late-night restaurant
- Home after a night out
- The lighting is low, moody, atmospheric

THE MOOD:
- Slightly cinematic, almost noir
- The pizza is comfort, satisfaction, the answer
- Maybe a drink nearby (beer, soda)
- The feeling of "this is exactly what I needed"

LIGHTING: Dramatic, moody, with the pizza as the hero. Warm light on the pizza, cooler tones in the environment. The contrast makes the pizza irresistible.

TYPOGRAPHY:
"{{headline}}"
"{{late_night_message}}"
"{{hours}}"
"{{ordering_info}}"

This image targets the LATE NIGHT crowd. The bar closers, the night owls, the "I need pizza NOW" people.$PROMPT$,
'v1', TRUE,
'{"style": "late_night_craving", "food_focus": "whole_pizza_or_slice", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["late_night_message", "hours", "ordering_info"], "defaults": {"late_night_message": "Open Late. Always Ready.", "hours": "Open until 3 AM", "ordering_info": ""}}, "variation_rules": {"style_adjectives": ["late night mood", "midnight craving", "after hours", "night owl fuel"], "settings": ["city window", "neon glow", "bar scene", "home late night"], "times": ["midnight", "2am", "after the bars", "cant sleep"]}}'::JSONB);


-- =====================================================
-- INSTAGRAM STORIES (9:16) TEMPLATES - 10 total
-- =====================================================

-- 1. Slice of the Day Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-slice-of-day', 'Slice of the Day Feature', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Today's featured slice, shot to SELL. Quick impact, maximum craving.

THE HERO: A single, perfect slice of pizza, held up toward the camera or positioned on a plate/paper. The slice should:
- Fill a significant portion of the frame (this is vertical, use the height)
- Show the PROFILE—you can see the layers: crust, sauce, cheese, toppings
- Have that perfect triangular shape with a slight droop (proving it's real, not cardboard)
- Display the toppings clearly and abundantly

THE DETAILS THAT MATTER:
- Cheese slightly pulling or dripping at the tip
- Toppings visible and identifiable
- Crust with good color and texture
- Maybe a bite taken out (shows it's REAL and delicious)
- Grease glistening (this is GOOD for pizza)

THE BACKGROUND: Simple, not distracting:
- Solid color wall
- The pizzeria counter in soft focus
- A pizza box partially visible
- The rest of the pizza in background

LIGHTING: Bright, appetizing, Instagram-ready. The slice should POP. Good contrast, vibrant colors.

TYPOGRAPHY (bold, scannable):
"{{day_label}}" (e.g., "TUESDAY SLICE")
"{{headline}}"
"{{slice_name}}"
"{{slice_description}}"
"{{price}}"
"{{availability}}"

This story is QUICK CRAVING. See it, want it, come get it.$PROMPT$,
'v1', TRUE,
'{"style": "slice_feature", "food_focus": "single_slice", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "slice_name", "price"], "optional": ["day_label", "slice_description", "availability"], "defaults": {"day_label": "TODAY''S SLICE", "slice_description": "", "availability": "While supplies last"}}, "variation_rules": {"style_adjectives": ["hero slice", "quick craving", "grab and go", "daily feature"], "slice_presentations": ["held up", "on plate", "on paper", "bite taken"], "backgrounds": ["solid color", "counter blur", "pizza box", "simple clean"]}}'::JSONB);

-- 2. Fresh Out of the Oven
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-fresh-oven', 'Fresh Out of the Oven', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Just out of the oven. Steam rising. Urgency and freshness.

THE MOMENT: A pizza that has JUST come out of the oven:
- Steam visibly rising from the surface
- Cheese still actively bubbling
- The pizza is on a peel, pan, or just placed on the counter
- The oven might be visible in the background, door open

THE PIZZA:
- Any style, but it must look FRESH and HOT
- The cheese is at peak melt—bubbling, golden, perfect
- Toppings are glistening with heat
- The crust shows fresh-from-oven color

THE URGENCY ELEMENTS:
- Steam is CRITICAL—visible heat rising
- Bubbling cheese in motion
- The "just this second" feeling
- Maybe hands with oven mitts or a peel

THE SETTING:
- Kitchen/oven area visible
- The working pizzeria environment
- Heat lamps, other pizzas being made
- The energy of a busy kitchen

LIGHTING: Warm, showing the heat. The steam should catch the light. The pizza should look almost too hot to touch.

TYPOGRAPHY (urgent, exciting):
"{{headline}}"
"{{freshness_message}}"
"{{time_stamp}}" (e.g., "Just Now")
"{{cta}}"

This story creates URGENCY. It's "this pizza exists RIGHT NOW and it's perfect." FOMO fuel.$PROMPT$,
'v1', TRUE,
'{"style": "fresh_from_oven", "food_focus": "whole_pizza", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["freshness_message", "time_stamp", "cta"], "defaults": {"freshness_message": "Fresh Out of the Oven", "time_stamp": "Just Now", "cta": "Come Get It"}}, "variation_rules": {"style_adjectives": ["steaming hot", "just made", "fresh now", "oven fresh"], "oven_types": ["wood fired", "deck oven", "conveyor", "brick oven"], "urgency_elements": ["steam rising", "cheese bubbling", "just pulled", "ready now"]}}'::JSONB);

-- 3. Behind the Scenes - Dough Tossing
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-dough-toss', 'Behind the Scenes Dough Toss', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — The art of dough tossing. Skill, tradition, showmanship.

THE ACTION: A pizzaiolo tossing pizza dough in the air:
- The dough is mid-air, spinning, stretched by centrifugal force
- The pizza maker's hands are positioned to catch
- Flour dust visible in the air
- The moment is DYNAMIC and skillful

THE DOUGH:
- Perfectly round (or becoming round through the toss)
- The right thickness—thin in the middle, thicker at edges
- Flour dusted, showing texture
- Caught at the peak of the toss

THE PIZZAIOLO:
- Hands and arms visible, maybe face
- Traditional white chef coat or apron
- The posture shows expertise and confidence
- This is SKILL on display

THE ENVIRONMENT:
- Kitchen/prep area
- Flour-dusted surfaces
- Other dough balls ready
- The working pizzeria atmosphere

LIGHTING: Dramatic, catching the flour in the air. The dough should be backlit or side-lit to show its shape and the flour particles floating.

TYPOGRAPHY:
"{{headline}}"
"{{craft_message}}"
"{{tradition_tagline}}"

This story shows CRAFT. It's "we make our dough fresh, by hand, with skill." It's authenticity and tradition.$PROMPT$,
'v1', TRUE,
'{"style": "dough_toss_action", "food_focus": "dough_making", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["craft_message", "tradition_tagline"], "defaults": {"craft_message": "Handmade Fresh Daily", "tradition_tagline": "The Art of Pizza"}}, "variation_rules": {"style_adjectives": ["artisan skill", "traditional craft", "hand tossed", "pizza art"], "toss_moments": ["peak height", "spinning", "catching", "stretching"], "flour_effects": ["dust cloud", "light catching", "dramatic particles"]}}'::JSONB);

-- 4. Daily Special Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-daily-special', 'Daily Special Announcement', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Today's special pizza. Limited time, special price, get it now.

THE HERO: Today's special pizza, shot to create immediate desire:
- The pizza fills the upper 2/3 of the frame
- Shot at an angle that shows toppings AND depth
- The pizza looks special—not your everyday order
- Fresh, hot, ready to eat

THE SPECIAL ELEMENTS:
- This pizza should look DIFFERENT from the regular menu
- Unique toppings or combinations
- Maybe a seasonal ingredient
- The "limited time" feeling

THE PRESENTATION:
- Clean, focused on the pizza
- Maybe on a special board or plate
- The setting suggests "featured item"
- Props minimal—the pizza is the star

LIGHTING: Bright, appetizing, making the special toppings pop. The pizza should look irresistible and worth trying.

TYPOGRAPHY (promotional, urgent):
"{{day_label}}" (e.g., "WEDNESDAY SPECIAL")
"{{headline}}"
"{{pizza_name}}"
"{{description}}"
"{{regular_price}}" (crossed out)
"{{special_price}}"
"{{availability}}"

This story drives TRIAL. It's "try something new today at a special price." Limited time creates urgency.$PROMPT$,
'v1', TRUE,
'{"style": "daily_special", "food_focus": "whole_pizza", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "pizza_name", "special_price"], "optional": ["day_label", "description", "regular_price", "availability"], "defaults": {"day_label": "TODAY ONLY", "description": "", "regular_price": "", "availability": "While supplies last"}}, "variation_rules": {"style_adjectives": ["special feature", "limited time", "today only", "chef special"], "special_types": ["seasonal", "chef creation", "customer favorite", "throwback"], "urgency_levels": ["today only", "this week", "limited quantity"]}}'::JSONB);

-- 5. Cheese Pull Vertical
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-cheese-pull', 'Cheese Pull Vertical Story', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — The cheese pull, optimized for Stories. Maximum stretch, maximum craving.

THE PULL: A dramatic cheese pull shot vertically to maximize the stretch:
- A slice being lifted HIGH—using the full vertical frame
- The cheese stretches from bottom to top of frame
- Multiple strands of varying thickness
- The pull is at its PEAK—maximum extension

THE COMPOSITION:
- The pizza/remaining pie at the bottom of frame
- The lifted slice at the top
- The cheese strands connecting them through the middle
- The vertical format makes the pull look ENDLESS

THE CHEESE DETAILS:
- Golden, gooey, impossibly stretchy
- Some strands catching light, almost glowing
- The texture is visible—this is REAL cheese
- The moment just before it breaks

THE BACKGROUND:
- Simple, not distracting from the pull
- Maybe the pizzeria in soft focus
- Warm tones complementing the cheese color

LIGHTING: Side or back lighting to make the cheese strands GLOW. The cheese should look like golden threads. Warm, appetizing light.

TYPOGRAPHY (minimal, let the pull speak):
"{{headline}}"
"{{pizza_name}}"
"{{cta}}"

This story is PURE CRAVING. The cheese pull is the most iconic pizza image—this is it optimized for vertical.$PROMPT$,
'v1', TRUE,
'{"style": "cheese_pull_vertical", "food_focus": "slice_pull", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "cta"], "defaults": {"pizza_name": "", "cta": "Order Now"}}, "variation_rules": {"style_adjectives": ["epic stretch", "maximum pull", "golden strands", "cheese goals"], "pull_heights": ["extreme stretch", "medium pull", "just starting"], "cheese_types": ["mozzarella", "four cheese", "extra cheese"]}}'::JSONB);

-- 6. Order Now - Delivery Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-order-now', 'Order Now Delivery Push', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Order now, get pizza delivered. Clear CTA, easy action.

THE VISUAL: A compelling pizza image with strong delivery messaging:
- A beautiful pizza (whole or in box) as the hero
- The pizza looks ready to be delivered—hot, fresh, perfect
- Maybe a delivery bag, box, or doorstep context
- The image screams "ORDER THIS"

THE PIZZA:
- Appetizing, making you want it NOW
- Could be in a box (delivery context)
- Or a hero shot that makes you crave it
- Fresh, hot, ready to eat

THE DELIVERY CONTEXT:
- Pizza box with your branding
- Delivery bag visible
- Phone with ordering app
- Doorstep/home setting

THE CTA ELEMENTS:
- Clear "Order Now" messaging
- How to order (app, website, phone)
- Delivery time promise
- Maybe a promo code

LIGHTING: Bright, clear, appetizing. The pizza should look perfect. The overall image should be clean and action-oriented.

TYPOGRAPHY (clear, actionable):
"{{headline}}"
"{{delivery_promise}}"
"{{ordering_method}}"
"{{promo_code}}"
"{{cta_button}}" (styled as a button)

This story drives ORDERS. It's the direct response ad. See pizza, want pizza, order pizza.$PROMPT$,
'v1', TRUE,
'{"style": "delivery_cta", "food_focus": "whole_pizza", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "cta_button"], "optional": ["delivery_promise", "ordering_method", "promo_code"], "defaults": {"delivery_promise": "Delivered Hot & Fresh", "ordering_method": "Order on our app or website", "promo_code": ""}}, "variation_rules": {"style_adjectives": ["order now", "delivery ready", "tap to order", "get it delivered"], "delivery_contexts": ["box hero", "doorstep", "in bag", "being handed"], "cta_styles": ["button style", "swipe up", "link in bio"]}}'::JSONB);


-- 7. Limited Time Pizza Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-limited-time', 'Limited Time Pizza Announcement', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — A new, limited-time pizza. Excitement, exclusivity, urgency.

THE ANNOUNCEMENT: A new or seasonal pizza being introduced:
- The pizza is the STAR—shot beautifully, appetizingly
- The presentation suggests "special" and "new"
- The toppings are unique or seasonal
- This isn't your everyday pizza

THE PIZZA:
- A specialty or seasonal creation
- Unique toppings that stand out
- Shot to show off what makes it special
- Fresh, perfect, irresistible

THE "NEW" ELEMENTS:
- The framing suggests announcement/reveal
- Maybe a "NEW" badge or burst graphic
- The pizza could be partially revealed
- The excitement of something fresh

THE URGENCY:
- "Limited Time" messaging is clear
- End date or "while supplies last"
- The feeling that you need to try this NOW
- FOMO-inducing presentation

LIGHTING: Bright, exciting, making the new pizza look amazing. The special ingredients should pop. The overall feeling is celebratory.

TYPOGRAPHY (announcement style):
"{{new_badge}}" (e.g., "NEW!", "JUST DROPPED")
"{{headline}}"
"{{pizza_name}}"
"{{description}}"
"{{availability_dates}}"
"{{price}}"
"{{cta}}"

This story creates EXCITEMENT. It's "something new you have to try before it's gone." Launch energy.$PROMPT$,
'v1', TRUE,
'{"style": "limited_time_launch", "food_focus": "whole_pizza", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "pizza_name"], "optional": ["new_badge", "description", "availability_dates", "price", "cta"], "defaults": {"new_badge": "LIMITED TIME", "description": "", "availability_dates": "", "price": "", "cta": "Try It Now"}}, "variation_rules": {"style_adjectives": ["new launch", "limited edition", "seasonal special", "exclusive creation"], "announcement_styles": ["reveal", "just dropped", "introducing", "back by demand"], "urgency_types": ["limited time", "seasonal", "while supplies last", "this month only"]}}'::JSONB);

-- 8. Pizza Poll/This or That
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-poll', 'Pizza Poll This or That', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Interactive poll: which pizza wins? Engagement driver.

THE LAYOUT: A split-screen or comparison layout showing two pizzas:
- Two different pizzas, side by side or top/bottom
- Each pizza is clearly different and identifiable
- Both look equally appetizing (fair fight!)
- The comparison is clear and fun

THE PIZZAS:
- Option A: One style (e.g., Pepperoni, Meat Lovers, Classic)
- Option B: Contrasting style (e.g., Veggie, Margherita, Specialty)
- Both shot similarly for fair comparison
- Both look delicious—this should be a hard choice

THE POLL ELEMENTS:
- Clear "VS" or division between options
- Space for poll sticker/interaction
- Labels for each option
- The question is engaging

THE VIBE:
- Fun, playful, engaging
- Not too serious—this is entertainment
- Encourages participation
- Creates conversation

LIGHTING: Even, appetizing lighting on both pizzas. Neither should look better due to lighting—this is a fair comparison.

TYPOGRAPHY (interactive, fun):
"{{poll_question}}"
"{{option_a_name}}"
"{{option_b_name}}"
"{{engagement_prompt}}"

This story drives ENGAGEMENT. It's not about selling—it's about interaction, fun, and community building.$PROMPT$,
'v1', TRUE,
'{"style": "poll_engagement", "food_focus": "two_pizzas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["poll_question", "option_a_name", "option_b_name"], "optional": ["engagement_prompt"], "defaults": {"engagement_prompt": "Vote Now!"}}, "variation_rules": {"style_adjectives": ["fun poll", "this or that", "you decide", "battle of pizzas"], "matchup_types": ["classic vs specialty", "meat vs veggie", "thin vs thick", "traditional vs creative"], "poll_formats": ["side by side", "top bottom", "diagonal split"]}}'::JSONB);

-- 9. We're Open/Hours Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-hours', 'Hours and Open Reminder', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — We're open! Come get pizza. Simple, informative, inviting.

THE VISUAL: An inviting pizzeria scene with clear "we're open" messaging:
- The restaurant exterior or interior
- A welcoming, warm atmosphere
- Maybe pizza being made or served
- The feeling of "come on in"

THE SCENE OPTIONS:
- Storefront with "OPEN" sign lit
- Interior with customers enjoying pizza
- Counter with fresh pizzas ready
- Kitchen action showing we're working

THE ATMOSPHERE:
- Warm, inviting lighting
- The place looks GOOD—clean, welcoming
- Activity suggesting business (but not overwhelming)
- The vibe is "we're here and ready for you"

THE INFORMATION:
- Clear hours display
- Location reminder
- Any special hours (late night, holiday)
- How to find you

LIGHTING: Warm, welcoming. If exterior, the interior should glow invitingly. If interior, the space should look comfortable and appetizing.

TYPOGRAPHY (informative, clear):
"{{headline}}"
"{{hours_today}}"
"{{special_hours_note}}"
"{{location}}"
"{{cta}}"

This story is INFORMATIONAL but still appetizing. It reminds people you exist and you're ready to serve them.$PROMPT$,
'v1', TRUE,
'{"style": "hours_reminder", "food_focus": "restaurant_scene", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "hours_today"], "optional": ["special_hours_note", "location", "cta"], "defaults": {"special_hours_note": "", "location": "", "cta": "Come See Us"}}, "variation_rules": {"style_adjectives": ["were open", "come visit", "ready to serve", "doors open"], "scene_types": ["storefront", "interior warm", "counter ready", "kitchen active"], "time_contexts": ["lunch rush", "dinner time", "late night", "weekend"]}}'::JSONB);

-- 10. Flash Deal/Happy Hour
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-story-flash-deal', 'Flash Deal Happy Hour', 'pizza', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Flash deal! Limited time offer. Act NOW.

THE URGENCY: A time-sensitive deal that demands immediate action:
- A pizza (or deal combo) as the hero
- Strong promotional graphics
- The deal is CLEAR and compelling
- The time limit is obvious

THE OFFER:
- The pizza/food that's on deal
- The discount or special price
- What's included
- The value is obvious

THE TIME PRESSURE:
- Countdown feeling (hours, not days)
- "Today Only" or "Next 2 Hours"
- The urgency is REAL
- Miss it and it's gone

THE VISUAL:
- Pizza looks amazing (of course)
- Promotional graphics/badges
- Price callouts are bold
- The deal jumps off the screen

LIGHTING: Bright, attention-grabbing. The pizza should look great, but the promotional elements should also pop.

TYPOGRAPHY (urgent, promotional):
"{{deal_badge}}" (e.g., "FLASH SALE", "2 HOURS ONLY")
"{{headline}}"
"{{deal_description}}"
"{{original_price}}" (crossed out)
"{{deal_price}}"
"{{time_limit}}"
"{{cta}}"

This story drives IMMEDIATE ACTION. It's the flash sale, the happy hour, the "right now" deal.$PROMPT$,
'v1', TRUE,
'{"style": "flash_deal", "food_focus": "deal_combo", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "deal_price", "time_limit"], "optional": ["deal_badge", "deal_description", "original_price", "cta"], "defaults": {"deal_badge": "FLASH DEAL", "deal_description": "", "original_price": "", "cta": "Order Now"}}, "variation_rules": {"style_adjectives": ["flash sale", "limited hours", "act now", "dont miss"], "deal_types": ["percentage off", "bogo", "combo deal", "free item"], "time_windows": ["lunch hour", "happy hour", "late night", "2 hours only"]}}'::JSONB);

-- =====================================================
-- FACEBOOK POSTS (16:9) TEMPLATES - 5 total
-- =====================================================

-- 1. Family Meal Deal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-fb-family-deal', 'Family Meal Deal', 'pizza', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 PHOTOGRAPH — The family pizza night spread. Value, abundance, togetherness.

THE SPREAD: A table set for family pizza night, showing the COMPLETE deal:

THE PIZZAS: Two large pizzas (different varieties) as the heroes:
- One classic (pepperoni or cheese) showing broad appeal
- One specialty showing variety
- Both looking hot, fresh, perfectly made
- Positioned to show their full glory

THE SIDES:
- A basket or box of breadsticks/garlic knots with marinara
- A large salad in a bowl (garden or Caesar)
- Maybe wings or another side item
- 2-liter sodas or a pitcher of drinks

THE TABLE SETTING:
- Plates stacked or set for 4-6 people
- Napkins, red pepper flakes, parmesan
- Hands reaching in (family energy) or about to serve
- The feeling of GATHERING

THE ENVIRONMENT: Could be:
- A restaurant booth/table with family-friendly atmosphere
- A home dining table (delivery/takeout context)
- Outdoor patio setting

LIGHTING: Warm, inviting, family-friendly. Everything looks fresh and abundant. The feeling of a good deal and a good time.

TYPOGRAPHY:
"{{headline}}"
"{{deal_name}}"
INCLUDES:
• {{item1}}
• {{item2}}
• {{item3}}
• {{item4}}
"{{price}}"
"{{cta}}"

This image is VALUE + TOGETHERNESS. It's "feed the whole family without breaking the bank." It's Tuesday night sorted.$PROMPT$,
'v1', TRUE,
'{"style": "family_deal_spread", "food_focus": "full_meal", "visual_complexity": "high", "input_schema": {"required": ["headline", "deal_name", "price"], "optional": ["item1", "item2", "item3", "item4", "cta"], "defaults": {"item1": "2 Large Pizzas (any style)", "item2": "Breadsticks with Marinara", "item3": "Large Garden Salad", "item4": "2-Liter Soda", "cta": "Order Now - Feed the Family for Less"}}, "variation_rules": {"style_adjectives": ["family abundance", "value spread", "togetherness meal", "deal showcase"], "settings": ["restaurant table", "home delivery", "outdoor patio", "party setup"], "family_sizes": ["family of 4", "large gathering", "game night", "party pack"]}}'::JSONB);

-- 2. New Pizza Launch Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-fb-new-launch', 'New Pizza Launch Announcement', 'pizza', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 PHOTOGRAPH — Introducing our newest pizza creation. Launch announcement with impact.

THE HERO: The new pizza, shot as the undeniable star:
- The pizza takes center stage, beautifully lit
- The unique toppings are clearly visible and appetizing
- The presentation suggests "special" and "new"
- This pizza looks like nothing else on the menu

THE NEW PIZZA:
- Unique topping combination that stands out
- Premium ingredients visible
- Perfect execution—this is the hero shot
- The pizza that will get people talking

THE ANNOUNCEMENT ELEMENTS:
- The framing suggests a reveal or launch
- Space for "NEW" or "INTRODUCING" graphics
- The pizza could be on a pedestal or special surface
- The feeling of unveiling something special

THE SETTING:
- Clean, focused background
- Maybe ingredients that go into it visible
- The environment suggests quality and care
- Premium but accessible feeling

LIGHTING: Dramatic, editorial quality. The new pizza should look like a magazine cover. The lighting highlights what makes it special.

TYPOGRAPHY:
"{{announcement_badge}}" (e.g., "NEW", "INTRODUCING")
"{{headline}}"
"{{pizza_name}}"
"{{description}}"
"{{key_ingredients}}"
"{{price}}"
"{{availability}}"
"{{cta}}"

This image is a LAUNCH. It's the announcement that gets shared, commented on, and drives trial.$PROMPT$,
'v1', TRUE,
'{"style": "new_launch", "food_focus": "whole_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline", "pizza_name"], "optional": ["announcement_badge", "description", "key_ingredients", "price", "availability", "cta"], "defaults": {"announcement_badge": "NEW", "description": "", "key_ingredients": "", "price": "", "availability": "Available Now", "cta": "Be the First to Try It"}}, "variation_rules": {"style_adjectives": ["grand reveal", "new creation", "chef masterpiece", "menu addition"], "launch_types": ["brand new", "seasonal return", "customer request", "chef special"], "presentation_styles": ["hero pedestal", "ingredient story", "making process"]}}'::JSONB);


-- 3. Catering/Party Packages
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-fb-catering', 'Catering Party Packages', 'pizza', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 PHOTOGRAPH — Pizza catering for your event. Abundance, variety, party-ready.

THE SPREAD: A catering-scale pizza setup that shows you can handle ANY event:
- Multiple pizzas (6-10 visible) in various styles
- Stacked pizza boxes or pizzas on serving stands
- The SCALE is impressive—this feeds a crowd
- Variety of toppings showing options

THE PIZZAS:
- Different varieties clearly visible
- All looking fresh and appetizing
- Arranged for serving (buffet style)
- The quantity is impressive

THE CATERING ELEMENTS:
- Serving utensils, plates, napkins
- Maybe chafing dishes or warming setups
- Drinks, sides, salads visible
- The full catering package

THE SETTING: Event/party context:
- Office meeting room or break room
- Party venue or backyard
- Sports viewing setup
- Graduation, birthday, corporate event vibe

LIGHTING: Bright, showing the abundance. Every pizza should look good. The scale and variety should be impressive.

TYPOGRAPHY:
"{{headline}}"
"{{catering_name}}"
"{{package_description}}"
PACKAGES START AT:
"{{starting_price}}"
INCLUDES:
• {{package_item1}}
• {{package_item2}}
• {{package_item3}}
"{{booking_info}}"
"{{cta}}"

This image sells CATERING. It's "let us handle your event." It shows capability and abundance.$PROMPT$,
'v1', TRUE,
'{"style": "catering_spread", "food_focus": "multiple_pizzas", "visual_complexity": "very_high", "input_schema": {"required": ["headline", "starting_price"], "optional": ["catering_name", "package_description", "package_item1", "package_item2", "package_item3", "booking_info", "cta"], "defaults": {"catering_name": "Pizza Catering", "package_description": "Perfect for any event", "package_item1": "Assorted Pizzas", "package_item2": "Sides & Salads", "package_item3": "Plates, Napkins & Utensils", "booking_info": "Book 48 hours in advance", "cta": "Get a Quote"}}, "variation_rules": {"style_adjectives": ["party ready", "event catering", "crowd pleaser", "bulk order"], "event_types": ["office party", "birthday", "graduation", "game day", "corporate"], "scale_levels": ["small gathering", "medium event", "large party", "corporate catering"]}}'::JSONB);

-- 4. Customer Favorite Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-fb-customer-favorite', 'Customer Favorite Feature', 'pizza', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 PHOTOGRAPH — Our most popular pizza. The people's choice. Customer-validated deliciousness.

THE HERO: Your best-selling, most-loved pizza:
- The pizza that customers order again and again
- Shot to show exactly why it's the favorite
- Perfect execution of a proven winner
- The pizza looks as good as it tastes

THE PIZZA:
- Your actual best-seller (pepperoni, specialty, etc.)
- Every element is perfect
- The toppings that make it special are highlighted
- This is the "safe bet" that never disappoints

THE SOCIAL PROOF ELEMENTS:
- Maybe a "★★★★★" rating visual
- "#1 Seller" or "Customer Favorite" badge
- The feeling of "everyone loves this"
- Trust and validation

THE SETTING:
- Classic pizzeria setting
- Or customer enjoying the pizza
- The environment suggests popularity
- Warm, welcoming, familiar

LIGHTING: Appetizing, showing the pizza at its best. The lighting should make you understand why this is the favorite.

TYPOGRAPHY:
"{{social_proof_badge}}" (e.g., "#1 SELLER", "CUSTOMER FAVORITE")
"{{headline}}"
"{{pizza_name}}"
"{{description}}"
"{{customer_quote}}" (optional testimonial)
"{{stats}}" (e.g., "Over 10,000 sold!")
"{{price}}"
"{{cta}}"

This image leverages SOCIAL PROOF. It's "this is what everyone orders—and for good reason."$PROMPT$,
'v1', TRUE,
'{"style": "customer_favorite", "food_focus": "whole_pizza", "visual_complexity": "medium", "input_schema": {"required": ["headline", "pizza_name"], "optional": ["social_proof_badge", "description", "customer_quote", "stats", "price", "cta"], "defaults": {"social_proof_badge": "CUSTOMER FAVORITE", "description": "", "customer_quote": "", "stats": "", "price": "", "cta": "Try the Favorite"}}, "variation_rules": {"style_adjectives": ["peoples choice", "best seller", "fan favorite", "most ordered"], "proof_types": ["sales numbers", "star rating", "customer quote", "years running"], "presentation": ["hero shot", "being enjoyed", "multiple orders"]}}'::JSONB);

-- 5. Location/About Us Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-fb-about-location', 'Location About Us Showcase', 'pizza', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 PHOTOGRAPH — Your pizzeria, your story, your community. Brand and location showcase.

THE SCENE: Your restaurant as the star—the place, the people, the vibe:
- The restaurant interior or exterior
- The team (optional but powerful)
- The atmosphere that makes you special
- The community connection

THE RESTAURANT:
- Clean, inviting, authentic
- Your unique décor and personality
- The oven, the counter, the dining area
- What makes your place YOURS

THE PEOPLE (optional):
- The owner, the pizzaiolo, the team
- Genuine smiles, pride in work
- The human element that builds connection
- "These are the people making your pizza"

THE STORY ELEMENTS:
- Years in business, family history
- Community involvement
- What makes you different
- Your values and commitment

LIGHTING: Warm, inviting, authentic. The space should look welcoming. If people are included, they should look genuine and happy.

TYPOGRAPHY:
"{{headline}}"
"{{restaurant_name}}"
"{{story_snippet}}"
"{{years_badge}}" (e.g., "Serving [City] Since 1985")
"{{location_info}}"
"{{values_statement}}"
"{{cta}}"

This image builds BRAND. It's not selling a pizza—it's selling YOUR pizzeria. The story, the people, the place.$PROMPT$,
'v1', TRUE,
'{"style": "brand_showcase", "food_focus": "restaurant_scene", "visual_complexity": "medium", "input_schema": {"required": ["headline", "restaurant_name"], "optional": ["story_snippet", "years_badge", "location_info", "values_statement", "cta"], "defaults": {"story_snippet": "", "years_badge": "", "location_info": "", "values_statement": "", "cta": "Visit Us Today"}}, "variation_rules": {"style_adjectives": ["our story", "meet the team", "local favorite", "community pizzeria"], "focus_areas": ["interior warmth", "team pride", "history heritage", "community connection"], "story_angles": ["family owned", "years of service", "local ingredients", "community involvement"]}}'::JSONB);

-- =====================================================
-- INSTAGRAM CAROUSELS - 3 total
-- =====================================================

-- 1. Full Menu Showcase (4-5 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-carousel-menu', 'Full Menu Showcase Carousel', 'pizza', 'instagram_carousel', 'base',
$PROMPT$INSTAGRAM CAROUSEL (4-5 SLIDES, SQUARE 1:1) — Your full pizza menu, one beautiful slide at a time.

SLIDE 1 - THE HOOK:
"Our Menu" or "Pizza Perfection" title slide
- A stunning hero shot of your best pizza
- Or an artistic arrangement of multiple pizzas
- The slide that makes people swipe
- Bold typography: "{{headline}}"
- Subtext: "Swipe to see our menu →"

SLIDE 2 - CLASSIC PIZZAS:
Your traditional offerings:
- A beautiful shot of a classic pizza (cheese, pepperoni, or margherita)
- Clean, appetizing, perfect
- Typography: "THE CLASSICS"
- List 3-4 classic options with brief descriptions
- These are the reliable favorites

SLIDE 3 - SPECIALTY PIZZAS:
Your unique creations:
- A stunning specialty pizza as the hero
- The toppings that make it special are visible
- Typography: "SIGNATURE CREATIONS"
- List 3-4 specialty pizzas
- These are what make you different

SLIDE 4 - SIDES & MORE:
Complete the meal:
- Breadsticks, wings, salads, drinks
- Arranged appetizingly
- Typography: "COMPLETE YOUR ORDER"
- List popular sides and additions
- Show the full offering

SLIDE 5 - CTA/INFO:
Drive action:
- Your logo and branding
- How to order (app, website, phone, visit)
- Location info
- "{{cta}}"
- Maybe a special offer to drive immediate action

VISUAL CONSISTENCY:
- Same lighting style across all slides
- Consistent typography and brand colors
- Each slide should work alone AND as part of the series
- The swipe should feel like a journey through your menu

This carousel is your MENU in visual form. It educates, entices, and drives orders.$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase", "food_focus": "multiple_categories", "slide_count": 5, "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["classics_list", "specialties_list", "sides_list", "cta", "offer"], "defaults": {"classics_list": "Cheese, Pepperoni, Margherita, Supreme", "specialties_list": "Check our signature creations", "sides_list": "Breadsticks, Wings, Salads", "cta": "Order Now", "offer": ""}}, "variation_rules": {"style_adjectives": ["menu tour", "full offering", "pizza journey", "complete menu"], "slide_focuses": ["hero hook", "classics", "specialties", "sides", "cta"], "menu_sizes": ["compact 4 slides", "full 5 slides", "extended 6 slides"]}}'::JSONB);

-- 2. Pizza Making Process (4 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-carousel-process', 'Pizza Making Process Carousel', 'pizza', 'instagram_carousel', 'base',
$PROMPT$INSTAGRAM CAROUSEL (4 SLIDES, SQUARE 1:1) — From dough to delicious. The pizza-making journey.

SLIDE 1 - THE DOUGH:
The foundation of great pizza:
- Fresh dough being prepared, stretched, or tossed
- Flour-dusted surface, hands working the dough
- The craft and care visible
- Typography: "IT STARTS WITH THE DOUGH"
- "{{dough_description}}" (e.g., "24-hour fermented, hand-stretched daily")

SLIDE 2 - THE SAUCE & CHEESE:
Building the base:
- Sauce being ladled onto stretched dough
- Fresh mozzarella being placed
- The layers being built
- Typography: "LAYERED WITH LOVE"
- "{{sauce_cheese_description}}" (e.g., "San Marzano tomatoes, fresh mozzarella")

SLIDE 3 - THE TOPPINGS:
The finishing touches:
- Toppings being added to the pizza
- Fresh ingredients, generous portions
- The pizza taking shape
- Typography: "TOPPED TO PERFECTION"
- "{{toppings_description}}" (e.g., "Premium ingredients, generous portions")

SLIDE 4 - THE OVEN & FINISH:
The transformation:
- Pizza going into or coming out of the oven
- The finished, perfect pizza
- Steam, bubbling cheese, the final product
- Typography: "FIRED TO PERFECTION"
- "{{oven_description}}" (e.g., "Wood-fired at 900°F")
- CTA: "{{cta}}"

VISUAL STORY:
- Each slide is a chapter in the pizza's journey
- The progression should feel natural and educational
- Show the CRAFT and CARE at each step
- End with the irresistible finished product

This carousel tells your STORY. It's "this is how we make pizza, and this is why it's special."$PROMPT$,
'v1', TRUE,
'{"style": "making_process", "food_focus": "pizza_creation", "slide_count": 4, "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["dough_description", "sauce_cheese_description", "toppings_description", "oven_description", "cta"], "defaults": {"dough_description": "Fresh dough, made daily", "sauce_cheese_description": "Quality sauce and cheese", "toppings_description": "Premium toppings", "oven_description": "Perfectly baked", "cta": "Taste the Difference"}}, "variation_rules": {"style_adjectives": ["craft process", "behind the scenes", "how its made", "artisan journey"], "process_styles": ["traditional", "modern artisan", "wood-fired focus", "ingredient focus"], "detail_levels": ["overview", "detailed craft", "ingredient story"]}}'::JSONB);

-- 3. Why Choose Us (3 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('pizza-carousel-why-us', 'Why Choose Us Carousel', 'pizza', 'instagram_carousel', 'base',
$PROMPT$INSTAGRAM CAROUSEL (3 SLIDES, SQUARE 1:1) — Why choose us? Quality, tradition, value.

SLIDE 1 - QUALITY:
What makes your pizza better:
- A stunning pizza shot emphasizing quality
- Fresh ingredients visible
- The craftsmanship evident
- Typography: "{{quality_headline}}" (e.g., "QUALITY YOU CAN TASTE")
- Key quality points:
  • "{{quality_point1}}" (e.g., "Fresh dough made daily")
  • "{{quality_point2}}" (e.g., "Premium ingredients")
  • "{{quality_point3}}" (e.g., "Handcrafted with care")

SLIDE 2 - TRADITION/AUTHENTICITY:
Your story and heritage:
- The oven, the pizzaiolo, the restaurant
- The human element and history
- What makes you authentic
- Typography: "{{tradition_headline}}" (e.g., "TRADITION IN EVERY BITE")
- Key tradition points:
  • "{{tradition_point1}}" (e.g., "Family recipes since 1985")
  • "{{tradition_point2}}" (e.g., "Authentic techniques")
  • "{{tradition_point3}}" (e.g., "Local community favorite")

SLIDE 3 - VALUE/CTA:
The deal and the action:
- A compelling offer or value proposition
- Your pizza looking irresistible
- Clear call to action
- Typography: "{{value_headline}}" (e.g., "VALUE YOU'LL LOVE")
- The offer: "{{offer}}"
- CTA: "{{cta}}"
- How to order/visit

VISUAL CONSISTENCY:
- Each slide reinforces your brand
- The progression builds the case for choosing you
- End with a clear, compelling CTA
- The carousel should convert browsers to customers

This carousel is your PITCH. It's "here's why we're the right choice for your pizza."$PROMPT$,
'v1', TRUE,
'{"style": "value_proposition", "food_focus": "brand_story", "slide_count": 3, "visual_complexity": "medium", "input_schema": {"required": ["quality_headline", "tradition_headline", "value_headline", "cta"], "optional": ["quality_point1", "quality_point2", "quality_point3", "tradition_point1", "tradition_point2", "tradition_point3", "offer"], "defaults": {"quality_point1": "Fresh ingredients daily", "quality_point2": "Handcrafted with care", "quality_point3": "Quality you can taste", "tradition_point1": "Time-honored recipes", "tradition_point2": "Authentic techniques", "tradition_point3": "Community favorite", "offer": ""}}, "variation_rules": {"style_adjectives": ["brand pitch", "value story", "why us", "choose quality"], "focus_areas": ["quality first", "tradition focus", "value emphasis", "community connection"], "cta_styles": ["order now", "visit us", "try today", "taste the difference"]}}'::JSONB);

-- =====================================================
-- END OF PIZZA RESTAURANT TEMPLATES
-- =====================================================
