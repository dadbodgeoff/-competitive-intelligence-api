-- Holiday & Christmas Pizza Restaurant Templates
-- Generated: 2024-11-25
-- Total: 30 templates (12 Instagram Square, 10 Instagram Stories, 5 Facebook Posts, 3 Carousels)

-- =====================================================
-- INSTAGRAM SQUARE (1:1) - 12 TEMPLATES
-- =====================================================

-- 1. Holiday Cheese Pull Hero
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-cheese-pull-hero', 'Holiday Cheese Pull Hero', 'pizza', 'instagram_square', 'base',
$PROMPT$
CINEMATIC SQUARE 1:1 PHOTOGRAPH — The iconic cheese pull shot wrapped in holiday magic. Pizza photography meets Christmas card perfection.

THE CHEESE PULL MOMENT: A slice of pizza being lifted from a large pie, captured at the PERFECT moment of maximum cheese stretch. The slice held at 45 degrees, approximately 8 inches above the pizza, with multiple golden mozzarella strands creating that impossible, gravity-defying bridge between slice and pie.

THE PIZZA: A stunning 16-18" pizza showing:
- Perfectly melted, golden mozzarella with bubbling spots catching the warm light
- Classic pepperoni with curled edges and small grease pools, OR fresh Margherita with vibrant green basil
- Crust with ideal leopard spotting and golden-brown coloring
- The "wound" where the slice was lifted, revealing more stretchy, gooey cheese
- Steam rising subtly from the hot surface

THE HOLIDAY SETTING:
- Surface: Rustic reclaimed wood table with a deep forest green or burgundy velvet table runner
- Background: A Christmas tree with warm white lights creating beautiful circular bokeh spheres
- Props arranged naturally: Fresh pine branches with visible needles, a few red and gold ornaments, cinnamon sticks bundled with twine
- A glass of rich red wine catching the candlelight beside the pizza
- Deep red linen napkins, perhaps with subtle holiday embroidery
- Pillar candles in varying heights providing warm accent lighting
- A wrapped gift with elegant ribbon partially visible at frame edge

THE ATMOSPHERE:
- Lighting: Warm, golden, combining soft natural window light (suggesting snow falling outside) with intimate candlelight and Christmas tree glow
- The cheese strands catch and reflect the warm light beautifully, almost glowing amber
- Visible steam rises from the hot pizza, catching the light
- The feeling is COZY, CELEBRATORY, INDULGENT, GATHERING

TYPOGRAPHY ZONE (lower third, elegant holiday font):
"{{headline}}"
"{{pizza_name}}"
"{{holiday_message}}"

This image says: "This is what holiday gatherings are made of. Pizza, family, warmth, pure joy."

TECHNICAL: Shot at f/2.8 for selective focus. Cheese pull tack-sharp, background melts into warm holiday bokeh. Color grading emphasizes warm golds, rich reds, deep forest greens. Slight vignette draws eye to center.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_cheese_pull", "holiday_type": "christmas", "food_focus": "whole_pizza_slice", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "holiday_message"], "defaults": {"pizza_name": "Our Famous Cheese Pull", "holiday_message": "Made for Gathering"}}, "variation_rules": {"style_adjectives": ["festive cheese pull", "holiday warmth", "christmas bokeh magic", "cozy gathering"], "pizza_styles": ["classic pepperoni", "margherita fresh", "four cheese", "meat lovers"], "holiday_elements": ["christmas tree bokeh", "candlelight glow", "wrapped gifts", "pine and ornaments"]}}'::JSONB);

-- 2. Holiday Pizza Party Spread
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-party-spread', 'Holiday Pizza Party Spread', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The ultimate holiday pizza party spread. Multiple pizzas, abundance, celebration, gathering energy captured in one frame.

THE PIZZA SPREAD: A generous table loaded with pizza party perfection:
- THREE different pizzas visible (all large, 16-18"):
  - A classic pepperoni, perfectly made, 2-3 slices already taken showing the party is happening
  - A specialty supreme with colorful bell peppers, mushrooms, olives, sausage
  - A white pizza or Margherita for beautiful contrast
- Pizzas arranged at dynamic angles, slightly overlapping, creating visual depth
- Several slices on individual plates around the table, showing active eating
- Visible cheese pulls where slices have been lifted—the action is LIVE

THE SIDES & DRINKS:
- A rustic basket overflowing with golden garlic knots, red marinara in a small bowl
- A large wooden bowl with festive salad (mixed greens, cranberries, candied pecans, goat cheese)
- Bottles of wine (red and white) and sparkling water
- Festive glasses—some wine glasses, some with sparkling cider for kids
- A stack of holiday-themed paper plates or elegant ceramic plates

THE PARTY ELEMENTS:
- Multiple hands reaching for slices from different directions (showing GATHERING, community)
- Napkins in holiday red and green scattered naturally
- The table is FULL but organized chaos—a real, lived-in party moment
- Laughter energy—this feels ALIVE

THE HOLIDAY SETTING:
- Warm string lights visible overhead creating a canopy effect
- A small tabletop Christmas tree or holiday centerpiece with candles
- Garland with red berries draped along the table edge
- Large window in background showing snow falling or winter evening blue hour
- Warm, inviting lighting throughout—no harsh shadows

TYPOGRAPHY (celebratory, bold):
"{{headline}}"
"{{party_message}}"
"{{offer_details}}"

This image is CELEBRATION. It's "we ordered pizza for the holiday party and it was the BEST decision." Abundance, joy, togetherness, deliciousness.

TECHNICAL: Shot from slightly elevated angle to capture the full spread. f/4 for good depth across the table. Warm color temperature, rich saturation on the reds and greens.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_party_spread", "holiday_type": "christmas", "food_focus": "multiple_pizzas", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["party_message", "offer_details"], "defaults": {"party_message": "Feed the Whole Crew", "offer_details": "Party Packages Available"}}, "variation_rules": {"style_adjectives": ["party abundance", "gathering energy", "holiday celebration", "pizza feast"], "party_sizes": ["family gathering", "office party", "friend group", "large celebration"], "pizza_varieties": ["classic trio", "specialty mix", "crowd pleasers", "something for everyone"]}}'::JSONB);

-- 3. Christmas Tree Pizza
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-christmas-tree', 'Christmas Tree Pizza', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — A show-stopping Christmas tree shaped pizza that's equal parts delicious and festive. The ultimate holiday Instagram moment.

THE CHRISTMAS TREE PIZZA:
- Pizza dough shaped into a perfect Christmas tree silhouette (triangular tree with rectangular trunk)
- Approximately 18" tall, filling the frame beautifully
- Topped with:
  - Rich red marinara sauce as the base
  - Melted mozzarella creating the "snow" effect
  - GREEN toppings arranged like ornaments: fresh basil leaves, green bell pepper strips, broccoli florets
  - RED toppings as "ornaments": cherry tomatoes cut in half, red pepper pieces, pepperoni rounds
  - A yellow bell pepper STAR at the top of the tree
  - Parmesan "snow" dusted over everything
- The crust is golden, perfectly baked, with that ideal char
- Steam rising from the fresh-from-oven pizza

THE PRESENTATION:
- Pizza displayed on a large wooden cutting board or pizza peel
- Surface: Dark slate or black marble for dramatic contrast
- Surrounding the tree pizza: scattered fresh ingredients (basil leaves, cherry tomatoes, garlic cloves)
- A pizza cutter positioned nearby, ready to serve
- Small bowls of extra toppings: crushed red pepper, parmesan, ranch

THE HOLIDAY CONTEXT:
- Background: Soft focus Christmas lights creating colorful bokeh
- Pine branches framing the corners of the image
- A few wrapped presents visible at the edge
- Red and green napkins stacked nearby
- The feeling is WHIMSICAL, CREATIVE, FESTIVE

TYPOGRAPHY (playful, festive):
"{{headline}}"
"{{pizza_name}}"
"{{holiday_cta}}"

This pizza is the STAR of the holiday table. It's creative, it's delicious, it's Instagram-worthy, and it brings JOY.

TECHNICAL: Overhead shot (flat lay) to show the full tree shape. f/5.6 for sharpness across the pizza. Bright, cheerful lighting with warm undertones. Colors pop—the red and green should be vibrant.
$PROMPT$,
'v1', TRUE,
'{"style": "christmas_tree_shaped", "holiday_type": "christmas", "food_focus": "specialty_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["pizza_name", "holiday_cta"], "defaults": {"pizza_name": "Christmas Tree Pizza", "holiday_cta": "Order Your Holiday Centerpiece"}}, "variation_rules": {"style_adjectives": ["whimsical holiday", "creative festive", "instagram worthy", "show stopper"], "topping_themes": ["red and green classic", "white christmas", "colorful ornaments", "veggie tree"]}}'::JSONB);

-- 4. Cozy Night In Pizza & Movie
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-cozy-night-in', 'Cozy Night In Pizza & Movie', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The perfect cozy holiday night in: pizza delivery, a holiday movie, and pure comfort. This is HYGGE with pepperoni.

THE PIZZA MOMENT:
- A large pizza box OPEN on a coffee table, revealing a beautiful pepperoni or cheese pizza
- The pizza is clearly DELIVERY—still in the box, but looking absolutely perfect
- A slice being lifted with that gorgeous cheese pull
- OR: Pizza slices already on plates, casual eating in progress
- Steam still visible—it just arrived, it's HOT

THE COZY SETTING:
- Living room scene with a plush couch visible (soft throws, cozy pillows)
- Coffee table as the focal surface with the pizza
- A TV visible in the background showing a classic holiday movie (soft glow, blurred)
- Christmas tree in the corner with warm white lights, creating beautiful bokeh
- String lights along the wall or window adding to the glow
- A fireplace with gentle flames visible (or a candle arrangement)

THE COMFORT ELEMENTS:
- Cozy blankets draped on the couch
- Fuzzy socks visible at the edge of frame (someone's feet tucked up)
- Hot cocoa mugs with marshmallows on the coffee table
- A bowl of popcorn as a side snack
- Maybe a sleeping dog or cat curled up nearby
- The lighting is DIM, WARM, INTIMATE—evening vibes

THE DELIVERY CONTEXT:
- The pizza box has your branding visible
- Maybe a receipt or delivery bag visible at the edge
- This is EASY—no cooking, no stress, just ORDER and ENJOY

TYPOGRAPHY (warm, inviting):
"{{headline}}"
"{{comfort_message}}"
"{{delivery_cta}}"

This image says: "Skip the cooking. Order pizza. Watch holiday movies. This is the season for COZY."

TECHNICAL: Shot from couch-level perspective, intimate and immersive. f/2.8 for shallow depth, focus on pizza with cozy background blur. Very warm color temperature—golden hour indoor vibes.
$PROMPT$,
'v1', TRUE,
'{"style": "cozy_night_in", "holiday_type": "christmas", "food_focus": "delivery_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["comfort_message", "delivery_cta"], "defaults": {"comfort_message": "The Perfect Night In", "delivery_cta": "Order Delivery Now"}}, "variation_rules": {"style_adjectives": ["cozy comfort", "hygge vibes", "movie night", "delivery ease"], "comfort_elements": ["blankets and pillows", "hot cocoa", "fireplace glow", "holiday movie"]}}'::JSONB);

-- 5. Holiday Gift Card Promotion
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-gift-card', 'Holiday Gift Card Promotion', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Gift cards as the perfect holiday present for pizza lovers. Elegant, giftable, delicious potential.

THE GIFT CARD HERO:
- A beautiful gift card (physical or displayed elegantly) as the central focus
- The card designed with holiday pizza imagery or festive branding
- Card placed in an elegant gift card holder or small gift box
- OR: Card emerging from a wrapped present being opened
- Multiple denominations shown subtly ($25, $50, $100)

THE GIFT PRESENTATION:
- Gift card nestled among holiday wrapping elements:
  - Luxurious ribbon curls in red and gold
  - Elegant wrapping paper with subtle patterns
  - A gift bow, perfectly tied
  - Pine sprigs and small ornaments as accents
- Surface: Rich wood or marble with holiday runner

THE PIZZA CONNECTION:
- In the background or to the side: a beautiful pizza, slightly soft focus
- OR: Pizza imagery on the gift card itself
- OR: A pizza box wrapped with a bow, gift card tucked under the ribbon
- The connection between GIFT and PIZZA is clear

THE HOLIDAY ATMOSPHERE:
- Warm, golden lighting suggesting fireplace or candlelight
- Christmas tree lights creating soft bokeh in background
- Wrapped presents stacked nearby
- The feeling is GENEROUS, THOUGHTFUL, EASY GIFTING

TYPOGRAPHY (elegant, gift-focused):
"{{headline}}"
"{{gift_message}}"
"{{bonus_offer}}"
"{{purchase_cta}}"

This image says: "Give the gift of pizza. It's always the right size, always the right flavor, always appreciated."

TECHNICAL: Product photography style with lifestyle elements. f/4 for good depth. Rich, warm tones. The gift card should be clearly readable but the overall image feels festive, not commercial.
$PROMPT$,
'v1', TRUE,
'{"style": "gift_card_promotion", "holiday_type": "christmas", "food_focus": "gift_card", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["gift_message", "bonus_offer", "purchase_cta"], "defaults": {"gift_message": "The Gift They Actually Want", "bonus_offer": "Buy $50, Get $10 Free", "purchase_cta": "Available In-Store & Online"}}, "variation_rules": {"style_adjectives": ["elegant gifting", "thoughtful present", "easy holiday shopping", "pizza lover gift"], "gift_presentations": ["in gift box", "with ribbon", "under tree", "being opened"]}}'::JSONB);


-- 6. New Year's Eve Pizza Party
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-nye-party', 'New Year''s Eve Pizza Party', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Ring in the New Year with pizza! Champagne, confetti, countdown energy, and delicious pizza. The ultimate NYE party shot.

THE PIZZA CELEBRATION:
- A stunning pizza (or multiple pizzas) as the centerpiece
- Champagne glasses being clinked OVER the pizza—the toast moment
- OR: Pizza slices on elegant black plates with champagne alongside
- The pizza looks PREMIUM—this is a celebration, not just dinner
- Specialty toppings that feel elevated: prosciutto, arugula, truffle oil, burrata

THE NYE ELEMENTS:
- Champagne bottle (Dom Perignon style or prosecco) with condensation
- Champagne flutes filled with bubbly, bubbles visible
- Gold and silver confetti scattered on the table
- "2024" or "Happy New Year" props visible
- Sparklers creating light trails (long exposure effect)
- Party hats, noisemakers, celebration accessories
- A clock showing near midnight (11:58, 11:59)

THE PARTY ATMOSPHERE:
- Black, gold, and silver color scheme—elegant NYE palette
- Glittery tablecloth or runner
- String lights or fairy lights creating sparkle
- Multiple hands reaching, toasting, celebrating
- The energy is EXCITEMENT, ANTICIPATION, CELEBRATION

THE SETTING:
- Could be upscale home party or restaurant private event
- City lights visible through window (suggesting midnight skyline)
- Balloons in gold, silver, black
- Streamers and party decorations

TYPOGRAPHY (bold, celebratory, metallic):
"{{headline}}"
"{{nye_message}}"
"{{party_details}}"
"{{reservation_cta}}"

This image says: "Start the New Year RIGHT. With pizza, champagne, and the people you love."

TECHNICAL: Dynamic composition with movement energy. f/2.8 for sparkle bokeh. Color grading emphasizes golds, silvers, warm highlights. Slight motion blur on confetti for energy.
$PROMPT$,
'v1', TRUE,
'{"style": "nye_celebration", "holiday_type": "new_years", "food_focus": "premium_pizza", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["nye_message", "party_details", "reservation_cta"], "defaults": {"nye_message": "Ring in 2024 Right", "party_details": "Open Until 2 AM", "reservation_cta": "Reserve Your Table"}}, "variation_rules": {"style_adjectives": ["champagne celebration", "midnight magic", "nye glamour", "countdown party"], "party_elements": ["champagne toast", "confetti explosion", "sparklers", "countdown clock"]}}'::JSONB);

-- 7. Pizza by the Fireplace
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-fireplace', 'Pizza by the Fireplace', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The ultimate cozy holiday moment: hot pizza by a crackling fireplace. Pure warmth, pure comfort, pure deliciousness.

THE PIZZA:
- A beautiful large pizza on a rustic wooden board or cast iron pan
- Positioned on a coffee table or directly on a hearth stone
- Classic comfort style: pepperoni, cheese, or meat lovers
- Visibly HOT—steam rising, cheese still bubbling slightly
- A slice being lifted with that perfect cheese stretch
- The pizza GLOWS in the firelight—warm, inviting, irresistible

THE FIREPLACE SETTING:
- A real wood-burning fireplace with visible flames dancing
- The fire provides the PRIMARY light source—warm, flickering, golden
- Fireplace mantel decorated for holidays: stockings hung, garland draped, candles
- A cozy rug or blanket on the floor in front of the fire
- Perhaps someone's socked feet visible, warming by the fire

THE COZY ELEMENTS:
- Plush throw blankets in holiday plaids or rich solids
- Oversized pillows for floor seating
- A mug of hot cocoa or mulled wine beside the pizza
- A good book or holiday magazine casually placed
- Soft, warm lighting throughout—no harsh overhead lights
- The Christmas tree visible in the periphery, lights glowing

THE ATMOSPHERE:
- The feeling is INTIMATE, WARM, PEACEFUL
- Snow visible through a nearby window (optional)
- The crackle of the fire almost audible
- This is HYGGE—Danish coziness—with pizza
- Time slows down in this image

TYPOGRAPHY (warm, serif, cozy):
"{{headline}}"
"{{cozy_message}}"
"{{warmth_tagline}}"

This image says: "This is what the holidays are about. Warmth. Comfort. Good food. Slowing down."

TECHNICAL: Shot from low angle, floor level perspective. f/2.0 for dreamy firelight bokeh. Very warm color temperature—amber, gold, orange tones dominate. The fire should feel ALIVE.
$PROMPT$,
'v1', TRUE,
'{"style": "fireplace_cozy", "holiday_type": "christmas", "food_focus": "comfort_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["cozy_message", "warmth_tagline"], "defaults": {"cozy_message": "Warmth in Every Bite", "warmth_tagline": "Made for Cozy Nights"}}, "variation_rules": {"style_adjectives": ["fireplace warmth", "hygge comfort", "crackling cozy", "winter retreat"], "cozy_elements": ["blankets and pillows", "hot drinks", "stockings hung", "snow outside"]}}'::JSONB);

-- 8. Holiday Meat Lovers Feast
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-meat-lovers', 'Holiday Meat Lovers Feast', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — A carnivore's holiday dream: the ultimate meat lovers pizza in a festive setting. Abundance, indulgence, satisfaction.

THE MEAT LOVERS PIZZA:
- A LOADED large pizza absolutely covered with meats:
  - Pepperoni (classic cups with crispy edges)
  - Italian sausage crumbles, browned and flavorful
  - Crispy bacon pieces
  - Ham chunks
  - Ground beef
  - Maybe some salami or capicola for variety
- The cheese barely visible under the MOUNTAIN of meat
- Perfectly cooked—meats have char and caramelization
- Grease pools in the pepperoni cups catching the light
- The crust is sturdy, golden, able to hold this feast

THE PRESENTATION:
- Pizza on a large wooden board or rustic metal pan
- A slice being pulled showing the WEIGHT of toppings
- The cheese stretch fights against the heavy toppings
- Crushed red pepper flakes scattered on top
- A side of ranch or blue cheese for dipping

THE HOLIDAY SETTING:
- Rustic, masculine holiday aesthetic
- Dark wood table with evergreen runner
- Candles in hurricane glasses
- Pine cones and pine branches as natural decor
- A bottle of bold red wine or craft beer
- The Christmas tree in background, but the vibe is HEARTY

THE FEAST ENERGY:
- This is INDULGENCE—no holding back
- The holidays are for treating yourself
- Multiple hands reaching suggests sharing the bounty
- The feeling is GENEROUS, ABUNDANT, SATISFYING

TYPOGRAPHY (bold, hearty):
"{{headline}}"
"{{feast_name}}"
"{{meat_message}}"

This image says: "Go big this holiday. The Meat Lovers is calling."

TECHNICAL: 45-degree angle to show topping height and abundance. f/4 for good depth across the loaded pizza. Rich, saturated colors—the meats should look caramelized and delicious.
$PROMPT$,
'v1', TRUE,
'{"style": "meat_lovers_feast", "holiday_type": "christmas", "food_focus": "loaded_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["feast_name", "meat_message"], "defaults": {"feast_name": "The Holiday Meat Lovers", "meat_message": "Go Big This Season"}}, "variation_rules": {"style_adjectives": ["carnivore dream", "loaded indulgence", "meat mountain", "hearty feast"], "meat_combinations": ["classic five meat", "bacon lovers", "italian meats", "bbq meat feast"]}}'::JSONB);

-- 9. Fresh Ingredients Holiday Style
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-fresh-ingredients', 'Fresh Ingredients Holiday Style', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Celebrating the QUALITY and FRESHNESS of pizza ingredients, styled with holiday elegance. Farm-to-pizza beauty.

THE INGREDIENT SHOWCASE:
- A beautiful pizza as the anchor, but surrounded by its COMPONENTS:
  - Fresh mozzarella balls, some sliced showing the creamy interior
  - Vibrant red San Marzano tomatoes, some whole, some crushed
  - Fresh basil leaves, bright green and aromatic
  - Garlic bulbs and cloves, some roasted golden
  - Olive oil in a beautiful glass cruet
  - Fresh vegetables: bell peppers, mushrooms, onions
  - Quality meats: sliced pepperoni, crumbled sausage
  - Flour dusted on the surface, suggesting fresh dough

THE ARRANGEMENT:
- Flat lay or 45-degree angle showing the spread
- Ingredients arranged artfully but naturally—not too perfect
- The pizza in center or to one side, showing the finished product
- Small bowls and wooden boards holding different ingredients
- A rolling pin or pizza peel suggesting the craft

THE HOLIDAY STYLING:
- Surface: Marble or butcher block with holiday runner
- Pine sprigs and cranberries woven between ingredients
- Cinnamon sticks and star anise for aromatic suggestion
- Red and green ingredients emphasized (tomatoes, basil, peppers)
- Warm candlelight adding golden glow
- A small holiday plant or poinsettia at the edge

THE QUALITY MESSAGE:
- This is about CRAFT and CARE
- Fresh, quality ingredients = delicious pizza
- The holidays deserve the BEST
- Artisanal, not mass-produced

TYPOGRAPHY (elegant, quality-focused):
"{{headline}}"
"{{quality_message}}"
"{{freshness_tagline}}"

This image says: "We start with the best ingredients. You taste the difference."

TECHNICAL: Bright, clean lighting to show ingredient colors accurately. f/5.6 for good depth across the spread. Colors should be TRUE—vibrant reds, fresh greens, creamy whites.
$PROMPT$,
'v1', TRUE,
'{"style": "fresh_ingredients", "holiday_type": "christmas", "food_focus": "ingredients_showcase", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["quality_message", "freshness_tagline"], "defaults": {"quality_message": "Fresh. Quality. Delicious.", "freshness_tagline": "Taste the Difference"}}, "variation_rules": {"style_adjectives": ["farm fresh", "quality ingredients", "artisanal craft", "ingredient beauty"], "ingredient_focuses": ["cheese and tomato", "fresh vegetables", "quality meats", "herbs and aromatics"]}}'::JSONB);

-- 10. Pizza Box Stack with Holiday Ribbon
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-box-stack', 'Pizza Box Stack with Holiday Ribbon', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — A tower of pizza boxes wrapped with holiday ribbon, ready for gifting or catering. The gift of pizza, beautifully presented.

THE PIZZA BOX TOWER:
- 3-5 pizza boxes stacked elegantly
- Boxes are CLEAN, branded, professional looking
- Wrapped together with a wide satin ribbon in holiday red or gold
- A beautiful bow on top—gift-wrapped pizza tower
- The top box slightly open, revealing a gorgeous pizza inside
- Steam or warmth suggested from the fresh pizzas

THE GIFT PRESENTATION:
- The stack sits on an elegant surface (marble, dark wood)
- A gift tag attached to the ribbon with holiday message
- Pine branches and ornaments arranged at the base
- Perhaps a few loose ornaments or pinecones nearby
- The presentation says "GIFT" not just "delivery"

THE HOLIDAY CONTEXT:
- Background: Soft focus Christmas tree or holiday decor
- Warm lighting suggesting a festive home or office
- Other wrapped presents nearby for context
- The feeling is GENEROUS, THOUGHTFUL, EASY

THE CATERING ANGLE:
- This could be for:
  - Holiday party catering
  - Office celebration delivery
  - Gift for neighbors/friends
  - Easy hosting solution
- The quantity suggests FEEDING A CROWD

TYPOGRAPHY (gift-focused, elegant):
"{{headline}}"
"{{gift_message}}"
"{{catering_tagline}}"
"{{order_cta}}"

This image says: "Give the gift everyone actually wants. Pizza, wrapped with love."

TECHNICAL: Product photography style with lifestyle warmth. f/4 for good depth on the stack. Warm tones, the ribbon should POP against the boxes. Clean but festive.
$PROMPT$,
'v1', TRUE,
'{"style": "gift_box_stack", "holiday_type": "christmas", "food_focus": "catering_boxes", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["gift_message", "catering_tagline", "order_cta"], "defaults": {"gift_message": "The Gift of Pizza", "catering_tagline": "Perfect for Holiday Gatherings", "order_cta": "Order Catering Now"}}, "variation_rules": {"style_adjectives": ["gift wrapped", "catering ready", "party perfect", "generous giving"], "occasions": ["office party", "neighbor gift", "family gathering", "easy hosting"]}}'::JSONB);

-- 11. Late Night Holiday Craving
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-late-night', 'Late Night Holiday Craving', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — That late-night holiday pizza craving satisfied. After the party, after the gifts, when you NEED pizza. Moody, indulgent, perfect.

THE LATE NIGHT PIZZA:
- A pizza box open on a kitchen counter or coffee table
- The pizza is half-eaten—this is IN PROGRESS
- Someone's hand reaching for another slice
- The cheese pull is happening, even at this hour
- Maybe some crusts left behind, showing the feast
- A single slice on a plate, ready to be devoured

THE LATE NIGHT SETTING:
- Dim lighting—just the kitchen light or a single lamp
- The Christmas tree lights still on in the background, soft glow
- A clock showing late hour (11:47 PM, 1:23 AM)
- The house is quiet, everyone else asleep
- This is a PRIVATE moment of indulgence

THE CRAVING ELEMENTS:
- A glass of something to drink (soda, beer, wine)
- Maybe some leftover holiday cookies nearby
- Comfortable clothes suggested (pajama sleeve visible)
- The feeling is SATISFIED, GUILTY PLEASURE, PERFECT
- No judgment here—just deliciousness

THE MOOD:
- Moody, intimate lighting
- The pizza is the BRIGHTEST thing in frame
- Warm but dim—nighttime vibes
- The holidays are exhausting; pizza is the reward
- This is self-care, pizza edition

TYPOGRAPHY (casual, relatable):
"{{headline}}"
"{{craving_message}}"
"{{late_night_hours}}"

This image says: "We get it. Sometimes you need pizza at midnight. We're here for you."

TECHNICAL: Low light photography, f/2.0 for atmosphere. The pizza should glow against the dim surroundings. Warm color temperature but muted overall. Intimate, almost secretive feeling.
$PROMPT$,
'v1', TRUE,
'{"style": "late_night_craving", "holiday_type": "christmas", "food_focus": "comfort_pizza", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["craving_message", "late_night_hours"], "defaults": {"craving_message": "We Get It", "late_night_hours": "Open Late All Holiday Season"}}, "variation_rules": {"style_adjectives": ["midnight craving", "guilty pleasure", "late night comfort", "after party fuel"], "scenarios": ["post party", "cant sleep", "holiday stress eating", "midnight snack"]}}'::JSONB);

-- 12. Family Holiday Dinner
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-sq-family-dinner', 'Family Holiday Dinner', 'pizza', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Pizza as the centerpiece of a family holiday dinner. Not traditional, but PERFECT. Togetherness, love, deliciousness.

THE FAMILY TABLE:
- A beautifully set holiday dinner table with PIZZA as the main course
- Multiple pizzas in the center (2-3 varieties)
- The table is SET—nice plates, cloth napkins, wine glasses
- This is pizza elevated to DINNER PARTY status
- Candles lit, creating warm ambiance

THE FAMILY MOMENT:
- Multiple generations visible or suggested:
  - Adult hands serving slices
  - Kids' hands reaching excitedly
  - Grandparent's hand holding a glass
- Faces not necessary—hands tell the story
- The energy is LOVE, TOGETHERNESS, JOY
- Someone laughing (motion blur acceptable)

THE HOLIDAY SETTING:
- Dining room decorated for the holidays
- Chandelier or pendant light above, dimmed for ambiance
- China cabinet or sideboard with holiday decor visible
- The Christmas tree in the adjacent room, lights glowing
- Window showing winter evening outside

THE TABLE DETAILS:
- Holiday centerpiece (candles, greenery, ornaments)
- A salad bowl and bread basket as sides
- Wine bottle and water pitcher
- Kids' cups with holiday designs
- The table is FULL but elegant

TYPOGRAPHY (warm, family-focused):
"{{headline}}"
"{{family_message}}"
"{{tradition_tagline}}"

This image says: "Who says holiday dinner has to be turkey? Pizza brings everyone together."

TECHNICAL: Shot from end of table or elevated angle to capture the gathering. f/4 for good depth across the scene. Warm, golden lighting. The feeling should be ALIVE with family energy.
$PROMPT$,
'v1', TRUE,
'{"style": "family_dinner", "holiday_type": "christmas", "food_focus": "dinner_centerpiece", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["family_message", "tradition_tagline"], "defaults": {"family_message": "Bringing Everyone Together", "tradition_tagline": "Start a New Tradition"}}, "variation_rules": {"style_adjectives": ["family gathering", "multigenerational love", "new traditions", "togetherness"], "family_types": ["multigenerational", "young family", "extended family", "chosen family"]}}'::JSONB);


-- =====================================================
-- INSTAGRAM STORIES (9:16) - 10 TEMPLATES
-- =====================================================

-- 1. Holiday Special Pizza Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-special-announce', 'Holiday Special Pizza Announcement', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Announcing a limited-time holiday pizza with maximum impact and urgency. This is the REVEAL moment.

THE HERO PIZZA:
- A stunning overhead or 45-degree shot of a SPECIAL holiday pizza
- Options for the special:
  - "Christmas Pizza" with red and green toppings (roasted red peppers, fresh basil, cherry tomatoes, green peppers)
  - "Winter White" pizza with white garlic sauce, ricotta dollops, roasted garlic, fresh mozzarella
  - "Holiday Feast" with premium toppings: prosciutto, fig, gorgonzola, arugula
  - "Candy Cane" shaped pizza for visual impact
- The pizza fills 60% of the frame—it's the STAR
- Steam rising, cheese bubbling, FRESH from the oven
- Toppings arranged beautifully, almost artistically

THE HOLIDAY STYLING:
- Pizza on a rustic wooden board or festive holiday plate
- Holiday props around the edges (not competing with pizza):
  - Pine sprigs with berries
  - Scattered cranberries
  - Cinnamon sticks
  - Small ornaments
- Background suggests pizzeria decorated for holidays
- Warm, festive lighting—golden and inviting

THE URGENCY ELEMENTS:
- Visual cues that this is LIMITED TIME:
  - "LIMITED TIME" badge or stamp graphic
  - Calendar icon showing availability dates
  - "While supplies last" energy
- The special nature is CLEAR—this won't be here forever

TYPOGRAPHY (bold, scannable, urgent):
Upper third:
"{{headline}}" (large, attention-grabbing)
"{{limited_badge}}"

Middle (with pizza):
"{{pizza_name}}" (featured prominently)
"{{description}}"

Lower third:
"{{price}}"
"{{availability}}"
"{{cta}}" (with swipe up or tap energy)

This story creates CRAVING + URGENCY. "I need to try this before it's gone."

TECHNICAL: Vertical composition optimized for mobile. Pizza sharp and appetizing. Warm color grading. Text should be readable against the image—consider subtle overlays or text shadows.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_special_announcement", "holiday_type": "christmas", "food_focus": "specialty_pizza", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "pizza_name"], "optional": ["limited_badge", "description", "price", "availability", "cta"], "defaults": {"limited_badge": "LIMITED TIME", "description": "Our festive creation, available for a limited time", "availability": "Through December 31", "cta": "Order Now 🎄"}}, "variation_rules": {"style_adjectives": ["limited time urgency", "seasonal special", "holiday exclusive", "festive creation"], "special_types": ["christmas themed", "winter white", "holiday feast", "festive veggie"]}}'::JSONB);

-- 2. "We're Open" Holiday Hours
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-hours', 'Holiday Hours Announcement', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Clear, helpful communication about holiday hours. Informative but still visually appealing and on-brand.

THE VISUAL ANCHOR:
- A warm, inviting image of the pizzeria:
  - Storefront decorated for holidays with lights and wreaths
  - OR: Interior shot showing holiday decor and warm lighting
  - OR: A beautiful pizza with holiday styling as background
- The image sets the MOOD—we're festive, we're here for you

THE HOURS INFORMATION:
- Clear, easy-to-read schedule:
  - Christmas Eve hours
  - Christmas Day (open/closed)
  - New Year's Eve hours
  - New Year's Day hours
  - Any other relevant holiday dates
- Use icons or visual elements to make it scannable
- Consider a simple calendar or list format

THE HOLIDAY CONTEXT:
- Holiday decorations visible in the imagery
- Warm, welcoming lighting
- The message: "We're here when you need us"
- Emphasize convenience during busy holiday season

THE HELPFUL ENERGY:
- This is SERVICE—helping customers plan
- "Save this story" encouragement
- Contact info for questions
- Online ordering reminder

TYPOGRAPHY (clear, informative, warm):
Top:
"{{headline}}" (e.g., "Holiday Hours")
"{{subheadline}}"

Middle (the schedule):
"{{christmas_eve}}"
"{{christmas_day}}"
"{{nye}}"
"{{new_years_day}}"

Bottom:
"{{save_reminder}}"
"{{contact_info}}"
"{{order_online_cta}}"

This story says: "We've got you covered this holiday season. Here's when to find us."

TECHNICAL: Text must be highly readable. Consider using a semi-transparent overlay behind text. Warm but not overly dark—the information is the priority.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_hours", "holiday_type": "christmas", "food_focus": "storefront_interior", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline"], "optional": ["subheadline", "christmas_eve", "christmas_day", "nye", "new_years_day", "save_reminder", "contact_info", "order_online_cta"], "defaults": {"subheadline": "Plan Your Pizza Runs", "christmas_eve": "Dec 24: 11am - 8pm", "christmas_day": "Dec 25: CLOSED", "nye": "Dec 31: 11am - 1am", "new_years_day": "Jan 1: 12pm - 9pm", "save_reminder": "📌 Save This Post", "order_online_cta": "Order Online Anytime"}}, "variation_rules": {"style_adjectives": ["helpful information", "clear communication", "holiday planning", "customer service"]}}'::JSONB);

-- 3. Gift Card Last Minute Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-giftcard-urgent', 'Gift Card Last Minute Push', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Urgent last-minute gift card push for procrastinators. High energy, problem-solving, immediate action.

THE URGENCY VISUAL:
- Dynamic, attention-grabbing imagery:
  - Gift card being held up triumphantly
  - OR: Phone screen showing e-gift card purchase
  - OR: Gift card emerging from holiday chaos (wrapping paper, ribbons)
- The energy is FAST, SOLUTION-ORIENTED
- Clock or countdown element suggesting time running out

THE GIFT CARD HERO:
- The gift card is clearly visible and appealing
- Multiple denominations shown ($25, $50, $100)
- E-gift card option emphasized (INSTANT delivery)
- The card looks GIFTABLE—not just transactional

THE LAST MINUTE CONTEXT:
- Visual cues of holiday rush:
  - Wrapping paper scattered
  - Shopping bags
  - Calendar showing December 23/24
- The message: "Forgot someone? We've got you."
- NO JUDGMENT—just solutions

THE INSTANT GRATIFICATION:
- E-gift cards = INSTANT delivery
- "Send in seconds" messaging
- QR code or link to purchase
- The relief of solving a gift problem

TYPOGRAPHY (urgent, bold, solution-focused):
Top (attention grab):
"{{headline}}" (large, urgent)
"{{urgency_badge}}" (e.g., "LAST MINUTE SAVE")

Middle:
"{{gift_card_message}}"
"{{instant_delivery}}"
"{{denominations}}"

Bottom:
"{{bonus_offer}}"
"{{purchase_cta}}"
"{{link_prompt}}"

This story says: "Panic gift shopping? Pizza gift cards. Problem solved. You're welcome."

TECHNICAL: High contrast for urgency. Bold colors. Text must POP. The energy should feel FAST and HELPFUL.
$PROMPT$,
'v1', TRUE,
'{"style": "urgent_gift_card", "holiday_type": "christmas", "food_focus": "gift_card", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["urgency_badge", "gift_card_message", "instant_delivery", "denominations", "bonus_offer", "purchase_cta", "link_prompt"], "defaults": {"urgency_badge": "LAST MINUTE SAVE", "gift_card_message": "The Gift Everyone Wants", "instant_delivery": "E-Gift Cards Delivered Instantly", "denominations": "$25 • $50 • $100", "bonus_offer": "Buy $50, Get $10 FREE", "purchase_cta": "TAP TO PURCHASE", "link_prompt": "Link in Bio"}}, "variation_rules": {"style_adjectives": ["last minute save", "instant solution", "procrastinator friendly", "no judgment gifting"]}}'::JSONB);

-- 4. Fresh Out of the Oven (Holiday Kitchen)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-fresh-oven', 'Fresh Out of the Oven', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — The magical moment of pizza emerging from the oven, captured in a holiday-decorated kitchen. Pure pizza theater.

THE OVEN MOMENT:
- A pizza being pulled from a wood-fired or commercial oven
- The pizza peel in action, sliding under the perfect pie
- OR: Pizza just placed on the counter, still sizzling
- Visible HEAT—steam rising, cheese bubbling actively
- The crust has perfect char and color
- This is the FRESHEST moment possible

THE KITCHEN SCENE:
- Professional pizzeria kitchen OR home kitchen decorated for holidays
- The oven is the star—glowing, hot, working
- Flour dusted on surfaces, suggesting active pizza-making
- Pizza tools visible: peels, cutters, dough balls
- The energy is CRAFT, SKILL, FRESHNESS

THE HOLIDAY TOUCHES:
- Kitchen decorated subtly for holidays:
  - Garland along the hood or shelves
  - A small tree or wreath visible
  - Holiday music playing (suggested by a speaker)
  - Staff wearing Santa hats or holiday aprons
- The warmth of the oven = warmth of the season

THE SENSORY APPEAL:
- You can almost SMELL this image
- The sizzle is almost audible
- The heat radiates from the screen
- This is pizza at its PEAK moment

TYPOGRAPHY (fresh, immediate):
Top:
"{{headline}}" (e.g., "Fresh Out")
"{{freshness_badge}}"

Middle (minimal, let pizza shine):
"{{pizza_description}}"

Bottom:
"{{fresh_message}}"
"{{order_cta}}"

This story says: "This could be YOUR pizza in 20 minutes. Hot, fresh, perfect."

TECHNICAL: Capture the motion and heat. Slight motion blur acceptable on the peel. Warm color temperature—the oven glow should dominate. Steam should be visible and appetizing.
$PROMPT$,
'v1', TRUE,
'{"style": "fresh_from_oven", "holiday_type": "christmas", "food_focus": "pizza_making", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["freshness_badge", "pizza_description", "fresh_message", "order_cta"], "defaults": {"freshness_badge": "JUST NOW", "pizza_description": "Made Fresh, Made Right", "fresh_message": "Your Pizza, Minutes Away", "order_cta": "Order Now →"}}, "variation_rules": {"style_adjectives": ["oven fresh", "just made", "pizza theater", "craft moment"], "oven_types": ["wood fired", "brick oven", "commercial deck", "home oven"]}}'::JSONB);

-- 5. Daily Holiday Deal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-daily-deal', 'Daily Holiday Deal', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Today's special holiday deal, designed for daily posting throughout the season. Clear value, easy action.

THE DEAL VISUAL:
- A beautiful pizza that represents TODAY'S deal
- Could be:
  - The specific pizza on special
  - A general appetizing pizza shot
  - The deal items arranged together (pizza + sides)
- The pizza looks IRRESISTIBLE—this deal is too good
- Holiday styling in the background/props

THE DEAL STRUCTURE:
- Clear, simple offer:
  - "Large 1-Topping $10.99"
  - "BOGO 50% Off"
  - "Free Garlic Knots with Any Large"
  - "Family Deal $24.99"
- The VALUE is immediately clear
- Any restrictions noted (dine-in, delivery, etc.)

THE DAILY ELEMENT:
- "TODAY ONLY" or day-specific messaging
- Date visible (December 15, etc.)
- Creates urgency—this deal is NOW
- Encourages daily check-ins for new deals

THE HOLIDAY CONTEXT:
- Festive colors and elements in design
- Holiday-themed graphics or borders
- The deal feels like a GIFT
- Seasonal messaging woven in

TYPOGRAPHY (deal-focused, clear):
Top:
"{{day_label}}" (e.g., "TUESDAY DEAL")
"{{date}}"

Middle (the offer):
"{{headline}}" (the deal, large and clear)
"{{deal_details}}"
"{{regular_price}}" (crossed out if showing savings)

Bottom:
"{{restrictions}}"
"{{order_cta}}"
"{{promo_code}}"

This story says: "Today's deal is HERE. Don't miss it."

TECHNICAL: Clean, graphic design approach. The deal text must be instantly readable. Pizza imagery supports but doesn't overwhelm the offer. Festive but not cluttered.
$PROMPT$,
'v1', TRUE,
'{"style": "daily_deal", "holiday_type": "christmas", "food_focus": "deal_pizza", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "day_label"], "optional": ["date", "deal_details", "regular_price", "restrictions", "order_cta", "promo_code"], "defaults": {"deal_details": "All Day, All Locations", "restrictions": "Cannot combine with other offers", "order_cta": "Order Now", "promo_code": "Use Code: HOLIDAY"}}, "variation_rules": {"style_adjectives": ["daily special", "today only", "limited time", "holiday savings"], "deal_types": ["percentage off", "dollar amount", "BOGO", "free item", "bundle deal"]}}'::JSONB);

-- 6. NYE Countdown Party Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-nye-countdown', 'NYE Countdown Party Push', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — New Year's Eve party push with countdown energy. Champagne, pizza, celebration, midnight magic.

THE NYE ENERGY:
- High-energy celebration imagery:
  - Pizza with champagne glasses clinking above
  - Confetti falling around a pizza spread
  - Sparklers creating light trails
  - The countdown clock approaching midnight
- The vibe is PARTY, EXCITEMENT, ANTICIPATION

THE PIZZA PARTY:
- Pizza positioned as the NYE party food:
  - Multiple pizzas for a crowd
  - OR: Premium specialty pizza for intimate celebration
  - OR: Pizza and champagne pairing
- The pizza is CELEBRATION food, not just food
- Elevated presentation—this is a special night

THE COUNTDOWN ELEMENTS:
- Clock showing 11:5X or countdown numbers
- "3... 2... 1..." energy
- Sparkle and shimmer effects
- Gold, silver, black color palette
- Balloons, streamers, party elements

THE PARTY PLANNING:
- Encouraging advance orders
- Party package promotion
- Late-night hours reminder
- The message: "Make pizza part of your NYE"

TYPOGRAPHY (celebratory, countdown energy):
Top:
"{{headline}}" (NYE focused)
"{{countdown_element}}"

Middle:
"{{party_message}}"
"{{pizza_offer}}"

Bottom:
"{{hours}}"
"{{order_cta}}"
"{{reservation_prompt}}"

This story says: "NYE + Pizza = Perfect. Let's ring it in RIGHT."

TECHNICAL: Dynamic, energetic composition. Sparkle and light effects encouraged. Gold and silver tones. The energy should feel like a PARTY is about to happen.
$PROMPT$,
'v1', TRUE,
'{"style": "nye_countdown", "holiday_type": "new_years", "food_focus": "party_pizza", "frame_count": 1, "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["countdown_element", "party_message", "pizza_offer", "hours", "order_cta", "reservation_prompt"], "defaults": {"countdown_element": "🎊 COUNTDOWN TO 2024 🎊", "party_message": "Ring in the New Year Right", "pizza_offer": "Party Packages Available", "hours": "Open Until 2 AM", "order_cta": "Order Your NYE Pizza", "reservation_prompt": "Reserve Now"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "midnight magic", "nye celebration", "party energy"], "party_elements": ["champagne toast", "confetti", "sparklers", "balloons"]}}'::JSONB);

-- 7. Behind the Scenes Holiday Prep
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-bts', 'Behind the Scenes Holiday Prep', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Authentic behind-the-scenes content showing holiday preparation. Real, relatable, humanizing.

THE BTS MOMENT:
- Authentic kitchen/prep scenes:
  - Dough being stretched by skilled hands
  - Toppings being prepped in large quantities
  - The team working together, holiday music playing
  - Pizza boxes being stacked for a big order
- The feeling is REAL, not overly polished
- This is the WORK behind the magic

THE HOLIDAY PREP CONTEXT:
- Preparing for the holiday rush:
  - Extra dough being made
  - Special holiday ingredients arriving
  - Team decorating the restaurant
  - Practicing the holiday special pizza
- The message: "We're getting ready for YOU"

THE HUMAN ELEMENT:
- Team members visible (with permission):
  - Smiling while working
  - Wearing holiday accessories (Santa hats, festive aprons)
  - Showing pride in their craft
- Names/introductions if appropriate
- The people behind the pizza

THE AUTHENTIC ENERGY:
- Slightly imperfect = more real
- Natural lighting acceptable
- The hustle and bustle of a working kitchen
- Pride in preparation and quality

TYPOGRAPHY (casual, authentic):
Top:
"{{headline}}" (e.g., "BTS: Holiday Prep")
"{{context_line}}"

Middle (minimal):
"{{prep_message}}"

Bottom:
"{{team_message}}"
"{{anticipation_cta}}"

This story says: "Real people, real prep, real pizza. We're ready for the holidays."

TECHNICAL: Authentic, documentary style. Natural lighting preferred. Slight grain or movement acceptable—this should feel REAL, not staged. Warm and inviting despite the "raw" aesthetic.
$PROMPT$,
'v1', TRUE,
'{"style": "behind_the_scenes", "holiday_type": "christmas", "food_focus": "pizza_making", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline"], "optional": ["context_line", "prep_message", "team_message", "anticipation_cta"], "defaults": {"context_line": "Getting Ready for You", "prep_message": "Holiday Rush Prep Mode", "team_message": "From Our Family to Yours", "anticipation_cta": "Can''t Wait to Serve You"}}, "variation_rules": {"style_adjectives": ["authentic BTS", "real kitchen", "team pride", "holiday hustle"], "bts_moments": ["dough prep", "topping station", "team huddle", "decoration setup"]}}'::JSONB);

-- 8. Order Now for Holiday Delivery
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-order-delivery', 'Order Now for Holiday Delivery', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Driving delivery orders during the holiday season. Convenience, ease, deliciousness delivered.

THE DELIVERY PROMISE:
- Visual showing the delivery experience:
  - Pizza boxes at a decorated front door
  - Delivery driver handing over pizza (holiday themed)
  - Pizza being unboxed in a cozy home setting
  - The "doorbell moment" of pizza arriving
- The convenience is the HERO

THE HOLIDAY CONTEXT:
- Delivery to a home decorated for holidays:
  - Wreath on the door
  - Lights on the house
  - Snow on the ground (if appropriate)
- Inside: family waiting excitedly
- The message: "Skip the cooking, keep the cozy"

THE EASE MESSAGING:
- "Delivered to your door"
- "Hot and fresh"
- "No cooking, no cleanup"
- "More time for what matters"
- The holidays are BUSY—we make it easy

THE ORDER PROMPT:
- Clear call to action
- Delivery radius/availability
- Estimated delivery times
- Online ordering emphasis

TYPOGRAPHY (convenient, action-oriented):
Top:
"{{headline}}"
"{{convenience_message}}"

Middle:
"{{delivery_promise}}"
"{{timing}}"

Bottom:
"{{order_cta}}"
"{{delivery_details}}"
"{{link_prompt}}"

This story says: "Holiday hosting? Let us handle dinner. Delivered hot to your door."

TECHNICAL: Warm, inviting imagery. The delivery moment should feel like a GIFT arriving. Cozy home context. Clear, readable text for the CTA.
$PROMPT$,
'v1', TRUE,
'{"style": "delivery_push", "holiday_type": "christmas", "food_focus": "delivery_pizza", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["convenience_message", "delivery_promise", "timing", "order_cta", "delivery_details", "link_prompt"], "defaults": {"convenience_message": "Skip the Cooking", "delivery_promise": "Hot Pizza, Your Door", "timing": "30-45 Minutes", "order_cta": "ORDER DELIVERY", "delivery_details": "Free Delivery Over $25", "link_prompt": "Tap to Order"}}, "variation_rules": {"style_adjectives": ["delivery convenience", "doorstep magic", "easy hosting", "no stress dinner"], "delivery_contexts": ["family dinner", "party catering", "cozy night in", "busy holiday"]}}'::JSONB);

-- 9. Thank You / Season's Greetings
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-thank-you', 'Season''s Greetings Thank You', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Heartfelt holiday thank you and season's greetings from the pizzeria. Warm, genuine, community-focused.

THE GRATITUDE VISUAL:
- Warm, heartfelt imagery options:
  - The team gathered, waving, smiling (holiday attire)
  - The pizzeria exterior with holiday decorations and "Thank You" sign
  - A beautiful pizza with a handwritten "Thank You" note
  - Collage of happy customers throughout the year
- The feeling is GENUINE APPRECIATION

THE THANK YOU MESSAGE:
- Sincere gratitude for customer support
- Acknowledging the community
- Reflecting on the year
- Looking forward to the new year
- Personal, not corporate

THE HOLIDAY WARMTH:
- Season's greetings woven in
- Holiday wishes for customers and families
- The spirit of giving and gratitude
- Warm, cozy, heartfelt energy

THE COMMUNITY CONNECTION:
- "From our family to yours"
- Local business appreciation
- Years of service mentioned if relevant
- The relationship, not just the transaction

TYPOGRAPHY (warm, sincere, elegant):
Top:
"{{greeting}}" (e.g., "Happy Holidays")

Middle:
"{{thank_you_message}}"
"{{personal_note}}"

Bottom:
"{{signature}}" (owner name, team, etc.)
"{{new_year_wish}}"

This story says: "Thank you for being part of our pizza family. Happy holidays from all of us."

TECHNICAL: Warm, soft imagery. Could be slightly nostalgic in tone. The text should feel personal, like a holiday card. Elegant but not cold.
$PROMPT$,
'v1', TRUE,
'{"style": "thank_you_greeting", "holiday_type": "christmas", "food_focus": "brand_community", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["greeting", "thank_you_message"], "optional": ["personal_note", "signature", "new_year_wish"], "defaults": {"personal_note": "Your support means everything to us", "signature": "— The [Restaurant] Family", "new_year_wish": "Here''s to an amazing 2024!"}}, "variation_rules": {"style_adjectives": ["heartfelt gratitude", "community love", "holiday warmth", "genuine thanks"], "gratitude_focuses": ["customer loyalty", "community support", "year reflection", "team appreciation"]}}'::JSONB);

-- 10. Flash Sale / Limited Time
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-story-flash-sale', 'Holiday Flash Sale', 'pizza', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — High-urgency flash sale with limited time offer. Maximum impact, immediate action required.

THE URGENCY VISUAL:
- High-energy, attention-grabbing design:
  - Bold colors (red, gold, urgent)
  - Flashing/animated energy (suggested through design)
  - Timer or countdown element
  - "FLASH SALE" prominently displayed
- A delicious pizza as the reward for acting fast

THE FLASH SALE OFFER:
- Incredible, can't-miss deal:
  - "50% OFF Everything"
  - "Large Pizza $7.99"
  - "Buy One Get One FREE"
  - "Free Delivery + 30% Off"
- The deal is SO GOOD it demands action
- Clear expiration (tonight only, next 2 hours, etc.)

THE SCARCITY ELEMENTS:
- Time limit clearly stated
- "While supplies last" if applicable
- Countdown timer visual
- "Don't miss out" energy
- FOMO activation

THE HOLIDAY TIE-IN:
- "Holiday Flash Sale"
- "12 Days of Deals" connection
- "Gift to our customers"
- Festive design elements despite urgency

TYPOGRAPHY (urgent, bold, unmissable):
Top:
"{{flash_badge}}" (e.g., "⚡ FLASH SALE ⚡")
"{{time_limit}}"

Middle:
"{{headline}}" (THE DEAL - huge)
"{{deal_details}}"

Bottom:
"{{expiration}}"
"{{order_cta}}" (urgent)
"{{promo_code}}"

This story says: "DROP EVERYTHING. This deal won't last. ORDER NOW."

TECHNICAL: High contrast, bold design. Red and gold dominate. Text must be instantly readable. The energy should feel URGENT and EXCITING, not stressful.
$PROMPT$,
'v1', TRUE,
'{"style": "flash_sale", "holiday_type": "christmas", "food_focus": "deal_pizza", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "flash_badge"], "optional": ["time_limit", "deal_details", "expiration", "order_cta", "promo_code"], "defaults": {"time_limit": "TONIGHT ONLY", "deal_details": "All Pizzas, All Sizes", "expiration": "Ends at Midnight", "order_cta": "ORDER NOW →", "promo_code": "Code: FLASH"}}, "variation_rules": {"style_adjectives": ["flash urgency", "limited time", "cant miss", "act now"], "sale_types": ["percentage off", "dollar deals", "BOGO", "free items"]}}'::JSONB);


-- =====================================================
-- FACEBOOK POSTS (16:9) - 5 TEMPLATES
-- =====================================================

-- 1. Holiday Catering Packages
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-fb-catering', 'Holiday Pizza Catering Packages', 'pizza', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Pizza catering for holiday parties and gatherings. Shows capability, value, and ease of hosting with pizza.

THE CATERING SPREAD:
- A professional, impressive catering setup showing what customers GET:
- Multiple pizza boxes stacked and open, revealing variety:
  - At least 4-5 different pizzas visible
  - Classic pepperoni, supreme, veggie, specialty options
  - Pizzas look FRESH—steam, bubbling cheese
- OR: Pizzas laid out buffet-style on a beautifully decorated table
- The ABUNDANCE is clear—this feeds a CROWD

THE SIDES AND EXTRAS:
- Garlic bread or breadsticks in baskets
- Large salad bowls with festive ingredients
- Wings or other appetizers
- Desserts: cannoli, cookies, tiramisu
- Drinks: 2-liter sodas, water bottles, wine options
- Plates, napkins, serving utensils—everything needed

THE SETTING OPTIONS:
- Office party setting: Conference room decorated for holidays, team gathering
- Home party setting: Dining room with holiday decor, family celebration
- Pizzeria party room: Dedicated space for groups
- The setting shows this is EASY catering—we handle it all

THE HOLIDAY CONTEXT:
- Holiday decorations visible in the setting
- Festive tablecloths or runners
- String lights, small tree, garland
- The feeling of a PARTY about to happen or in progress
- Warm, inviting lighting throughout

THE PROFESSIONAL DETAILS:
- Serving utensils ready and arranged
- Plates and napkins stacked neatly
- Clear organization—professional presentation
- Quality is evident—these aren't cheap pizzas
- Branding visible but not overwhelming

TYPOGRAPHY (professional, value-focused):
"{{headline}}"
"{{catering_tagline}}"

HOLIDAY PARTY PACKAGES:
• {{package1}}
• {{package2}}
• {{package3}}

"{{order_deadline}}"
"{{contact_cta}}"

This image says: "Let us handle your holiday party. Easy, delicious, everyone's happy, you're the hero."

TECHNICAL: Wide shot to capture the full spread. f/5.6 for good depth across the setup. Bright, appetizing lighting. Colors should be warm and inviting. The scale should be impressive.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_catering", "holiday_type": "christmas", "food_focus": "catering_spread", "visual_complexity": "high", "input_schema": {"required": ["headline", "catering_tagline"], "optional": ["package1", "package2", "package3", "order_deadline", "contact_cta"], "defaults": {"package1": "Small Gathering (10-15) — 3 Large Pizzas + Sides $89", "package2": "Holiday Party (20-30) — 5 Large Pizzas + Sides + Salad $149", "package3": "Big Celebration (40+) — Custom Packages Available", "order_deadline": "Order 48 hours in advance", "contact_cta": "Call or Order Online"}}, "variation_rules": {"style_adjectives": ["catering professional", "party ready", "easy hosting", "crowd feeding"], "settings": ["office party", "home gathering", "party room", "buffet setup"]}}'::JSONB);

-- 2. Holiday Hours Announcement (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-fb-hours', 'Holiday Hours Announcement', 'pizza', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Clear, shareable holiday hours announcement for Facebook. Informative, warm, and helpful for planning.

THE VISUAL ANCHOR:
- A warm, inviting image that represents the pizzeria during holidays:
  - Storefront beautifully decorated with lights, wreaths, holiday signage
  - OR: Interior shot showing cozy holiday atmosphere, decorated dining area
  - OR: A gorgeous pizza with holiday styling, representing what awaits
- The image should feel WELCOMING and FESTIVE

THE HOURS DISPLAY:
- Clear, easy-to-read schedule overlaid or integrated:
  - Christmas Eve: [hours]
  - Christmas Day: [open/closed]
  - New Year's Eve: [hours]
  - New Year's Day: [hours]
  - Regular holiday season hours if different
- Use clean typography that's readable at small sizes
- Consider a simple graphic treatment (calendar, list, etc.)

THE HELPFUL CONTEXT:
- "Plan your holiday pizza runs"
- Online ordering availability noted
- Delivery vs. pickup options
- Contact info for questions
- The message: "We're here for you this holiday season"

THE SHAREABLE DESIGN:
- This should be SAVED and SHARED
- Clean enough to read when scrolling
- Festive enough to feel seasonal
- Practical information presented beautifully

TYPOGRAPHY (clear, warm, informative):
"{{headline}}"
"{{subheadline}}"

HOLIDAY HOURS:
{{christmas_eve}}
{{christmas_day}}
{{nye}}
{{new_years_day}}

"{{helpful_note}}"
"{{online_ordering}}"
"{{contact_info}}"

This image says: "We've got you covered. Here's when to find us this holiday season."

TECHNICAL: Clean, well-lit image. Text must be highly readable even at smaller Facebook preview sizes. Warm color palette. Professional but approachable.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_hours_fb", "holiday_type": "christmas", "food_focus": "storefront_brand", "visual_complexity": "low", "input_schema": {"required": ["headline"], "optional": ["subheadline", "christmas_eve", "christmas_day", "nye", "new_years_day", "helpful_note", "online_ordering", "contact_info"], "defaults": {"subheadline": "Plan Your Pizza Runs", "christmas_eve": "Christmas Eve: 11am - 8pm", "christmas_day": "Christmas Day: CLOSED (Merry Christmas!)", "nye": "New Year''s Eve: 11am - 1am", "new_years_day": "New Year''s Day: 12pm - 9pm", "helpful_note": "Order ahead for guaranteed pickup times", "online_ordering": "Order online 24/7 at [website]", "contact_info": "Questions? Call us at [phone]"}}, "variation_rules": {"style_adjectives": ["helpful planning", "clear information", "holiday service", "customer care"]}}'::JSONB);

-- 3. Family Meal Deal for Holidays
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-fb-family-deal', 'Holiday Family Meal Deal', 'pizza', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Family meal deal promotion for holiday gatherings. Value, abundance, and family togetherness.

THE FAMILY MEAL SPREAD:
- A complete family meal deal displayed beautifully:
  - 2 Large pizzas (different varieties for choice)
  - Breadsticks or garlic knots
  - A large salad
  - 2-liter drinks
  - Maybe a dessert item
- Everything arranged to show the COMPLETE meal
- The value is visually obvious—this is A LOT of food

THE FAMILY CONTEXT:
- Setting suggests family dinner:
  - Dining table set for 4-6 people
  - Holiday decorations visible
  - Warm, home-like atmosphere
- OR: The meal being enjoyed by a family (hands, plates, action)
- The energy is TOGETHERNESS, VALUE, EASE

THE HOLIDAY STYLING:
- Table has holiday runner or placemats
- Candles or holiday centerpiece
- Christmas tree lights in background bokeh
- The feeling is HOLIDAY DINNER made easy
- Warm, golden lighting throughout

THE VALUE PROPOSITION:
- The deal price prominently featured
- "Feeds 4-6" or similar sizing guidance
- Savings compared to ordering separately
- The message: "Holiday dinner, handled"

TYPOGRAPHY (value-focused, family-friendly):
"{{headline}}"
"{{deal_name}}"

THE DEAL INCLUDES:
• {{item1}}
• {{item2}}
• {{item3}}
• {{item4}}

"{{price}}"
"{{savings_message}}"
"{{availability}}"
"{{order_cta}}"

This image says: "Feed the whole family this holiday season. Great food, great value, no stress."

TECHNICAL: Overhead or 45-degree angle to show the full spread. f/4 for good depth. Warm, appetizing lighting. The abundance should be clear—this is a FEAST.
$PROMPT$,
'v1', TRUE,
'{"style": "family_meal_deal", "holiday_type": "christmas", "food_focus": "meal_deal_spread", "visual_complexity": "high", "input_schema": {"required": ["headline", "deal_name", "price"], "optional": ["item1", "item2", "item3", "item4", "savings_message", "availability", "order_cta"], "defaults": {"item1": "2 Large 2-Topping Pizzas", "item2": "Garlic Breadsticks", "item3": "Large Garden Salad", "item4": "2-Liter Soda", "savings_message": "Save $15 vs. ordering separately!", "availability": "Available for pickup or delivery", "order_cta": "Order Your Family Feast"}}, "variation_rules": {"style_adjectives": ["family value", "holiday feast", "easy dinner", "crowd pleaser"], "family_sizes": ["feeds 4", "feeds 6", "feeds 8", "party size"]}}'::JSONB);

-- 4. Year-End Thank You Post
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-fb-thank-you', 'Year-End Thank You Post', 'pizza', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Heartfelt year-end thank you post for Facebook. Genuine gratitude, community connection, looking forward.

THE GRATITUDE VISUAL:
- Warm, heartfelt imagery options:
  - The entire team gathered, smiling, in holiday attire
  - The pizzeria exterior with "Thank You" message and holiday decor
  - A collage of moments from the year (customers, events, pizzas)
  - A beautiful pizza with handwritten thank you note
- The feeling is GENUINE, WARM, APPRECIATIVE

THE YEAR IN REVIEW (optional elements):
- Subtle nods to the year's highlights:
  - Number of pizzas made
  - Community events supported
  - New menu items introduced
  - Milestones celebrated
- Not boastful—grateful

THE COMMUNITY CONNECTION:
- Acknowledging loyal customers
- Thanking the local community
- Recognizing the team's hard work
- The relationship beyond transactions
- "From our family to yours" energy

THE HOLIDAY WARMTH:
- Season's greetings woven naturally
- Holiday wishes for customers
- Hope and optimism for the new year
- The spirit of gratitude and giving

THE LOOKING FORWARD:
- Excitement for the coming year
- Teasing new things to come (optional)
- Commitment to continued quality
- Invitation to continue the journey together

TYPOGRAPHY (warm, sincere, elegant):
"{{headline}}"
"{{thank_you_message}}"

"{{year_reflection}}"
"{{community_note}}"

"{{signature}}"
"{{new_year_message}}"

This image says: "Thank you for an amazing year. We're grateful for every slice shared, every family fed, every celebration catered. Here's to more in 2024."

TECHNICAL: Warm, soft lighting. Could have a slightly nostalgic or reflective quality. The text should feel personal, like a letter. Professional but heartfelt.
$PROMPT$,
'v1', TRUE,
'{"style": "year_end_thanks", "holiday_type": "christmas", "food_focus": "brand_community", "visual_complexity": "medium", "input_schema": {"required": ["headline", "thank_you_message"], "optional": ["year_reflection", "community_note", "signature", "new_year_message"], "defaults": {"year_reflection": "What a year it''s been!", "community_note": "Your support means everything to our family", "signature": "With gratitude, The [Restaurant] Team", "new_year_message": "Here''s to an amazing 2024 together!"}}, "variation_rules": {"style_adjectives": ["heartfelt gratitude", "year reflection", "community love", "hopeful future"], "gratitude_focuses": ["customer loyalty", "community support", "team dedication", "milestone celebration"]}}'::JSONB);

-- 5. NYE Party/Event Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-fb-nye-event', 'NYE Party Event Announcement', 'pizza', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — New Year's Eve event or party announcement. Celebration, excitement, pizza as the party fuel.

THE NYE CELEBRATION VISUAL:
- High-energy New Year's Eve party imagery:
  - Pizza spread with champagne, confetti, party elements
  - The pizzeria decorated for NYE (balloons, streamers, countdown clock)
  - A glamorous pizza party setup with gold and silver accents
  - Sparklers, champagne toast, celebration energy
- The vibe is PARTY, EXCITEMENT, COUNTDOWN

THE PIZZA PARTY ELEMENTS:
- Pizza positioned as the PERFECT NYE food:
  - Multiple pizzas for sharing
  - Premium/specialty options for the occasion
  - Pizza and champagne pairing
- Late-night fuel for the celebration
- Easy, delicious, crowd-pleasing

THE NYE ATMOSPHERE:
- Gold, silver, black color palette
- Balloons, streamers, confetti
- "2024" or countdown elements
- Champagne bottles and glasses
- Sparkle and shimmer throughout
- Clock approaching midnight

THE EVENT DETAILS:
- If hosting an event: time, reservations, special menu
- If promoting orders: late-night hours, party packages
- Special NYE offerings or deals
- The message: "Ring in 2024 with us"

TYPOGRAPHY (celebratory, event-focused):
"{{headline}}"
"{{nye_tagline}}"

EVENT DETAILS:
{{event_date}}
{{event_time}}
{{special_offerings}}

"{{reservation_info}}"
"{{party_packages}}"
"{{cta}}"

This image says: "NYE plans? Sorted. Pizza, champagne, celebration. Let's do this."

TECHNICAL: Dynamic, energetic composition. Gold and silver tones dominate. Sparkle effects encouraged. The energy should feel like the BEST party of the year.
$PROMPT$,
'v1', TRUE,
'{"style": "nye_event", "holiday_type": "new_years", "food_focus": "party_pizza", "visual_complexity": "high", "input_schema": {"required": ["headline", "nye_tagline"], "optional": ["event_date", "event_time", "special_offerings", "reservation_info", "party_packages", "cta"], "defaults": {"event_date": "December 31, 2023", "event_time": "Open Until 2 AM", "special_offerings": "Special NYE Menu + Champagne Toast", "reservation_info": "Reservations recommended", "party_packages": "Party packages available for groups", "cta": "Reserve Your Spot"}}, "variation_rules": {"style_adjectives": ["nye celebration", "countdown party", "champagne and pizza", "midnight magic"], "event_types": ["dine-in party", "late night orders", "catering packages", "special menu"]}}'::JSONB);


-- =====================================================
-- INSTAGRAM CAROUSELS - 3 TEMPLATES
-- =====================================================

-- 1. 12 Days of Pizza Deals (5 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-carousel-12-days', '12 Days of Pizza Deals', 'pizza', 'instagram_carousel', 'base',
$PROMPT$
MULTI-SLIDE INSTAGRAM CAROUSEL (5 slides) — A save-worthy countdown of holiday pizza deals. Drives repeat visits, engagement, and anticipation.

---
SLIDE 1 - THE HOOK:
Square 1:1 with festive intrigue and excitement.

VISUAL: A pizza box wrapped like a Christmas present—luxurious red satin ribbon, elegant bow on top, gift tag reading "12 Days of Deals." OR a pizza emerging from a gift box with magical golden light streaming out. Holiday elements surround it: glass ornaments, fresh pine branches, twinkling string lights creating beautiful circular bokeh.

THE ENERGY: This is a GIFT to customers. Anticipation, excitement, savings ahead.

TYPOGRAPHY:
"{{headline}}"
"12 DAYS OF"
"PIZZA DEALS"
"{{date_range}}"
"Swipe to see all the deals →"

---
SLIDE 2 - DAYS 1-4:
Clean, scannable layout with pizza imagery accents.

VISUAL: Split into 4 sections or a clean list format. Small circular pizza photos or icons for each day. Holiday border or frame elements. Festive but READABLE.

CONTENT:
"DAYS 1-4"
Day 1: {{day1}} — [date]
Day 2: {{day2}} — [date]
Day 3: {{day3}} — [date]
Day 4: {{day4}} — [date]

Each deal clearly stated with the specific date it's valid.

---
SLIDE 3 - DAYS 5-8:
Continuing the countdown with building excitement.

VISUAL: Same format as Slide 2 for consistency. Maybe a "HALFWAY THERE!" banner or element. The deals are getting BETTER.

CONTENT:
"DAYS 5-8"
"HALFWAY THERE! 🎄"
Day 5: {{day5}}
Day 6: {{day6}}
Day 7: {{day7}}
Day 8: {{day8}}

---
SLIDE 4 - DAYS 9-12:
The grand finale deals—the BEST ones.

VISUAL: Same format but with extra emphasis on Day 12. Stars, sparkles, "GRAND FINALE" energy. Day 12 should visually POP as the biggest deal.

CONTENT:
"DAYS 9-12"
"THE GRAND FINALE 🌟"
Day 9: {{day9}}
Day 10: {{day10}}
Day 11: {{day11}}
Day 12: {{day12}} — THE BIGGEST DEAL (emphasized, larger, special treatment)

---
SLIDE 5 - CTA & SAVE PROMPT:
Driving action and saves.

VISUAL: All 12 deals represented as mini pizza icons, ornaments on a tree, or a festive collage. Celebratory, complete, actionable.

CONTENT:
"{{cta_headline}}"
"📌 SAVE THIS POST"
"🔔 Turn on notifications"
"Don't miss a single deal!"
"{{location}}"
"{{final_message}}"

---
DESIGN CONSISTENCY:
- Consistent holiday color scheme throughout (deep reds, forest greens, champagne golds)
- Pizza imagery woven through every slide
- Festive but clean—deals must be READABLE
- Brand colors and logo present but not overwhelming
- Each slide should work alone but flow as a series

This carousel is SAVE-WORTHY. Customers will reference it throughout the 12 days.

TECHNICAL: Consistent 1:1 format across all slides. Clean typography hierarchy. Festive design elements that don't compete with the deal information.
$PROMPT$,
'v1', TRUE,
'{"style": "countdown_deals", "holiday_type": "christmas", "slide_count": 5, "visual_complexity": "high", "input_schema": {"required": ["headline", "date_range"], "optional": ["day1", "day2", "day3", "day4", "day5", "day6", "day7", "day8", "day9", "day10", "day11", "day12", "cta_headline", "location", "final_message"], "defaults": {"day1": "$5 Off Any Large Pizza", "day2": "Free Garlic Knots with Any Order", "day3": "BOGO Slices (Dine-In)", "day4": "Free 2-Liter with Orders $25+", "day5": "$10.99 Large Cheese Pizza", "day6": "Free Delivery All Day", "day7": "Kids Eat Free (with adult purchase)", "day8": "Double Rewards Points", "day9": "$3 Off Any Medium Pizza", "day10": "Free Dessert with Large Pizza", "day11": "Family Deal $29.99 (2 Lg + Sides)", "day12": "50% OFF EVERYTHING 🎉", "cta_headline": "Don''t Miss a Single Deal!", "final_message": "Happy Holidays from our pizza family to yours! 🍕🎄"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "deal anticipation", "save-worthy", "daily surprise"], "deal_types": ["percentage off", "free items", "BOGO", "bundle deals", "loyalty bonuses"]}}'::JSONB);

-- 2. Holiday Menu Showcase (4 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-carousel-menu', 'Holiday Menu Showcase', 'pizza', 'instagram_carousel', 'base',
$PROMPT$
MULTI-SLIDE INSTAGRAM CAROUSEL (4 slides) — Showcasing the holiday menu with mouth-watering photography. Each slide features a category or hero item.

---
SLIDE 1 - THE HOOK / HERO PIZZA:
Square 1:1, maximum appetite appeal.

VISUAL: Your BEST, most photogenic pizza in full glory. The cheese pull, the perfect toppings, the steam rising. Holiday styling around it—pine branches, ornaments, candlelight creating warm bokeh. This pizza makes people STOP scrolling.

TYPOGRAPHY:
"{{headline}}"
"{{menu_intro}}"
"Our Holiday Menu"
"Swipe to explore →"

---
SLIDE 2 - SIGNATURE PIZZAS:
Showcasing 3-4 signature or popular pizzas.

VISUAL: Grid or collage of your best pizzas. Each pizza photographed beautifully with consistent styling. Holiday elements in the background or borders. Names and brief descriptions for each.

CONTENT:
"SIGNATURE PIZZAS"
{{pizza1_name}} — {{pizza1_desc}}
{{pizza2_name}} — {{pizza2_desc}}
{{pizza3_name}} — {{pizza3_desc}}
{{pizza4_name}} — {{pizza4_desc}}

Each pizza should look IRRESISTIBLE.

---
SLIDE 3 - HOLIDAY SPECIALS:
Limited-time holiday offerings.

VISUAL: Feature 2-3 holiday-specific pizzas or items. These should look SPECIAL—unique toppings, festive presentation. "Limited Time" badges or elements. The exclusivity is clear.

CONTENT:
"HOLIDAY SPECIALS ❄️"
"Available through December 31"
{{special1_name}} — {{special1_desc}}
{{special2_name}} — {{special2_desc}}
{{special3_name}} — {{special3_desc}}

---
SLIDE 4 - SIDES, DRINKS & CTA:
Complete the meal and drive action.

VISUAL: Appetizing spread of sides: garlic knots, breadsticks, salads, wings, desserts. Drinks: sodas, wine pairings. The complete meal experience. Holiday styling throughout.

CONTENT:
"COMPLETE YOUR FEAST"
SIDES: {{sides_list}}
DRINKS: {{drinks_list}}
DESSERTS: {{desserts_list}}

"{{order_cta}}"
"{{delivery_note}}"
"{{location_hours}}"

---
DESIGN CONSISTENCY:
- Consistent photography style across all slides (lighting, angles, props)
- Holiday color palette: warm golds, deep reds, forest greens
- Clean typography that doesn't compete with food photography
- Each slide should make viewers HUNGRY
- Brand presence without overwhelming the food

This carousel is a MENU in your pocket. Save-worthy, reference-able, craving-inducing.

TECHNICAL: Consistent 1:1 format. Food photography should be the hero. Text overlays should be readable but not cover the food. Warm, appetizing color grading throughout.
$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase", "holiday_type": "christmas", "slide_count": 4, "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["menu_intro", "pizza1_name", "pizza1_desc", "pizza2_name", "pizza2_desc", "pizza3_name", "pizza3_desc", "pizza4_name", "pizza4_desc", "special1_name", "special1_desc", "special2_name", "special2_desc", "special3_name", "special3_desc", "sides_list", "drinks_list", "desserts_list", "order_cta", "delivery_note", "location_hours"], "defaults": {"menu_intro": "Made Fresh, Made Right", "pizza1_name": "Classic Pepperoni", "pizza1_desc": "The one that started it all", "pizza2_name": "Supreme", "pizza2_desc": "Loaded with everything", "pizza3_name": "Margherita", "pizza3_desc": "Fresh basil, tomato, mozzarella", "pizza4_name": "Meat Lovers", "pizza4_desc": "For the carnivores", "special1_name": "Holiday Feast Pizza", "special1_desc": "Prosciutto, fig, gorgonzola, arugula", "special2_name": "Winter White", "special2_desc": "Garlic cream, ricotta, roasted garlic", "sides_list": "Garlic Knots • Wings • Salads", "drinks_list": "Sodas • Wine • Beer", "desserts_list": "Cannoli • Tiramisu • Cookies", "order_cta": "Order Now", "delivery_note": "Delivery & Pickup Available"}}, "variation_rules": {"style_adjectives": ["menu exploration", "appetite appeal", "holiday offerings", "complete meal"], "menu_focuses": ["signature pizzas", "holiday specials", "sides and extras", "complete experience"]}}'::JSONB);

-- 3. Why Order From Us This Holiday (3 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-pizza-carousel-why-us', 'Why Order From Us This Holiday', 'pizza', 'instagram_carousel', 'base',
$PROMPT$
MULTI-SLIDE INSTAGRAM CAROUSEL (3 slides) — Compelling reasons to choose your pizzeria this holiday season. Value proposition, trust building, call to action.

---
SLIDE 1 - THE HOOK / QUALITY:
Square 1:1, establishing quality and care.

VISUAL: A stunning pizza that showcases QUALITY—fresh ingredients visible, perfect execution, artisanal care evident. Behind-the-scenes element: hands stretching dough, fresh ingredients being prepped, the craft visible. Holiday styling subtle but present.

TYPOGRAPHY:
"{{headline}}"
"Why Choose Us This Holiday?"

QUALITY POINTS:
"{{quality1}}"
"{{quality2}}"
"{{quality3}}"

"Swipe for more reasons →"

---
SLIDE 2 - CONVENIENCE & VALUE:
Why ordering from you makes holiday life EASIER.

VISUAL: Delivery arriving at a decorated door, OR a family enjoying pizza without the stress of cooking, OR a party spread that was effortlessly catered. The ease and convenience is the hero.

CONTENT:
"MAKING HOLIDAYS EASIER"

"{{convenience1}}"
"{{convenience2}}"
"{{convenience3}}"
"{{value_prop}}"

The message: We handle the food so you can enjoy the moments.

---
SLIDE 3 - COMMUNITY & CTA:
Local business, community connection, call to action.

VISUAL: The team, the storefront, happy customers, community involvement. The PEOPLE behind the pizza. Holiday decorations, warm and welcoming energy.

CONTENT:
"{{community_headline}}"
"{{community_message}}"

"{{years_serving}}"
"{{local_message}}"

"{{cta_headline}}"
"{{order_cta}}"
"{{contact_info}}"

---
DESIGN CONSISTENCY:
- Each slide builds the case for choosing your pizzeria
- Authentic imagery—real team, real kitchen, real quality
- Holiday warmth throughout without being cheesy
- The progression: Quality → Convenience → Community → Action
- Trust-building through transparency and authenticity

This carousel answers "Why should I order from you?" with compelling, visual proof.

TECHNICAL: Consistent 1:1 format. Mix of food photography and brand/team imagery. Warm, trustworthy color palette. Text should be conversational and authentic.
$PROMPT$,
'v1', TRUE,
'{"style": "why_choose_us", "holiday_type": "christmas", "slide_count": 3, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["quality1", "quality2", "quality3", "convenience1", "convenience2", "convenience3", "value_prop", "community_headline", "community_message", "years_serving", "local_message", "cta_headline", "order_cta", "contact_info"], "defaults": {"quality1": "🍕 Fresh dough made daily", "quality2": "🧀 Premium mozzarella, never frozen", "quality3": "🍅 San Marzano tomatoes", "convenience1": "🚗 Fast, reliable delivery", "convenience2": "📱 Easy online ordering", "convenience3": "🎁 Catering for any size party", "value_prop": "💰 Family deals that actually feed families", "community_headline": "Your Neighborhood Pizzeria", "community_message": "Family-owned, community-loved", "years_serving": "Serving [City] for [X] years", "local_message": "Thank you for supporting local", "cta_headline": "Ready to Order?", "order_cta": "Order Online or Call", "contact_info": "[phone] • [website]"}}, "variation_rules": {"style_adjectives": ["trust building", "value proposition", "community connection", "quality showcase"], "selling_points": ["fresh ingredients", "fast delivery", "family owned", "community focused", "great value"]}}'::JSONB);

-- =====================================================
-- END OF HOLIDAY PIZZA TEMPLATES
-- =====================================================

-- Summary:
-- Instagram Square (1:1): 12 templates
-- Instagram Stories (9:16): 10 templates
-- Facebook Posts (16:9): 5 templates
-- Instagram Carousels: 3 templates
-- TOTAL: 30 templates
