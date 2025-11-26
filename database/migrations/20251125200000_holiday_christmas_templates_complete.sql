-- Holiday & Christmas Template Collection
-- 30 Premium Templates for Restaurant Holiday Marketing
-- Generated: 2025-11-25

-- ============================================================================
-- INSTAGRAM SQUARE (1:1) TEMPLATES - 12 Templates
-- ============================================================================

-- 1. Christmas Feast Hero Shot
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-christmas-feast-hero', 'Christmas Feast Hero Shot', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
CINEMATIC SQUARE 1:1 PHOTOGRAPH — A masterpiece of holiday food photography that belongs in a luxury lifestyle magazine.

THE HERO: A magnificent prime rib roast OR glazed ham, perfectly cooked, resting on an heirloom serving platter. The meat glistens with rendered fat and herb crust—you can almost hear it sizzle. A few slices have been carved to reveal the perfect medium-rare interior (for prime rib) or the pink, juicy center (for ham). Fresh rosemary and thyme sprigs cascade around the base. Whole roasted garlic cloves and pearl onions nestle alongside.

THE TABLE SETTING: This is a FEAST. The hero protein is surrounded by:
- A copper pot of creamy mashed potatoes with a melting butter pat and chive garnish
- Roasted Brussels sprouts with crispy pancetta and balsamic glaze in a cast iron skillet
- A gravy boat with rich, glossy jus—a spoon mid-pour frozen in time
- Cranberry sauce in a crystal dish, its deep ruby color catching the light
- Fresh dinner rolls in a linen-lined basket, steam still rising
- A bottle of red wine, partially poured into crystal glasses

THE ATMOSPHERE:
- Lighting: Warm, golden, as if lit by a combination of candlelight and a nearby fireplace. Soft shadows create depth. A subtle warm glow from off-frame suggests holiday lights.
- Background: Soft focus reveals a decorated mantle with stockings, or a Christmas tree with twinkling lights creating beautiful bokeh circles.
- Table surface: Rich dark wood or elegant marble with a linen runner in cream or deep green.
- Subtle holiday elements: A sprig of holly, a few pine cones, a ribbon in burgundy or gold.

TYPOGRAPHY OVERLAY (elegant, sophisticated):
"{{headline}}"
"{{menu_description}}"
"{{price_info}}"
"{{reservation_cta}}"

The composition follows the rule of thirds. The hero protein commands attention but the eye travels naturally across the abundance. This image makes you HUNGRY. It makes you want to gather your loved ones. It IS Christmas dinner.

TECHNICAL: Shot with a medium telephoto lens (85mm equivalent) at f/2.8 for selective focus. The depth of field keeps the hero sharp while the background melts into warm, glowing bokeh. Color grading is warm but not orange—rich, natural, appetizing.
$PROMPT$,
'v1', TRUE,
'{"style": "luxury_feast_hero", "holiday_type": "christmas", "food_focus": "prime_rib_ham", "visual_complexity": "high", "input_schema": {"required": ["headline", "menu_description"], "optional": ["price_info", "reservation_cta"], "defaults": {"price_info": "Prix Fixe Menu Available", "reservation_cta": "Reserve Your Table"}}, "variation_rules": {"style_adjectives": ["magazine-worthy luxury", "warm candlelit glow", "abundant feast energy", "family gathering warmth"], "protein_options": ["prime rib roast", "glazed honey ham", "herb-crusted beef tenderloin", "roasted turkey"], "lighting_moods": ["candlelit intimate", "fireplace warm", "golden hour through window", "twinkling lights bokeh"], "camera_styles": ["45-degree hero angle", "overhead feast spread", "eye-level dramatic"]}}'::JSONB);

-- 2. Holiday Cocktail Collection
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-cocktail-collection', 'Holiday Cocktail Collection', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — A stunning lineup of holiday cocktails that sparkles with festive sophistication. This is the drink menu that makes people say "I'll have one of each."

THE LINEUP: Four to five signature holiday cocktails arranged in a visually dynamic composition—not a boring straight line, but staggered heights and depths creating visual interest.

FEATURED COCKTAILS (left to right, varying heights):
- A classic Christmas red cocktail: Cranberry martini or poinsettia in a coupe glass, deep ruby red, sugared rim with a fresh cranberry and rosemary sprig garnish
- A creamy winter white: Eggnog cocktail or white Russian variation in a rocks glass, topped with fresh grated nutmeg, cinnamon stick stirrer
- A festive green: Midori sour or green apple martini in a Nick & Nora glass, bright and jewel-toned, thin apple slice garnish
- A golden champagne cocktail: French 75 or champagne cocktail in a flute, bubbles rising, gold sugar rim, lemon twist
- A warm spiced option: Hot toddy or mulled wine in a clear glass mug, steam rising visibly, star anise and orange wheel floating

THE SETTING:
- Surface: Dark marble bar top or rich mahogany, reflecting the drinks subtly
- Background: Soft focus bar back with bottles, warm ambient lighting, perhaps a glimpse of holiday garland or twinkling lights
- Props: Scattered garnish elements—fresh cranberries, rosemary sprigs, cinnamon sticks, orange peels, star anise creating a "bartender's mise en place" aesthetic
- Ice: Crystal clear, perfectly formed cubes or spheres where appropriate

LIGHTING: Dramatic bar lighting—a key light from above creating highlights on the glass rims and liquid surfaces, warm backlighting creating glow through the drinks, subtle rim lighting on the glassware. The drinks GLOW.

TYPOGRAPHY — Elegant, celebratory:
"{{headline}}"
"{{cocktail_menu_title}}"
"{{featured_drinks}}"
"{{price_range}}"
"{{availability}}"

This image is ASPIRATIONAL. It's the start of a perfect holiday evening. It's celebration in a glass.

TECHNICAL: Shot at f/4 to keep all drinks reasonably sharp while softening the background. Careful attention to reflections and highlights. Color grading emphasizes the jewel tones of each drink.
$PROMPT$,
'v1', TRUE,
'{"style": "cocktail_lineup", "holiday_type": "christmas", "food_focus": "drinks", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["cocktail_menu_title", "featured_drinks", "price_range", "availability"], "defaults": {"cocktail_menu_title": "Holiday Cocktail Menu", "price_range": "$12-16", "availability": "Available Now Through New Year''s"}}, "variation_rules": {"style_adjectives": ["sophisticated celebration", "jewel-toned elegance", "bar-worthy glamour", "festive sparkle"], "cocktail_styles": ["classic holiday", "modern craft", "warm and cozy", "champagne celebration"], "lighting_moods": ["dramatic bar lighting", "warm intimate glow", "sparkle and shine"], "camera_styles": ["lineup hero shot", "45-degree arrangement", "close-up detail"]}}'::JSONB);

-- 3. Gingerbread House Display
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-gingerbread-display', 'Gingerbread House Display', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — A breathtaking gingerbread creation that showcases pastry artistry and holiday magic. This is the centerpiece that stops traffic in the restaurant lobby.

THE HERO: An elaborate gingerbread house (or village) that demonstrates true pastry craftsmanship:
- Architecture: A detailed Victorian-style house OR a charming village scene with multiple structures
- Construction: Perfectly assembled walls with visible texture of the gingerbread, royal icing "snow" on rooftops with realistic drip patterns
- Decoration: Intricate piped details—window frames, door trim, icicles hanging from eaves
- Candy elements: Thoughtfully placed—peppermint disc pathway, gumdrop landscaping, pretzel stick fencing, candy cane lamp posts
- Lighting: Warm LED glow from inside the house, visible through windows, creating magical illumination

SURROUNDING ELEMENTS:
- "Snow" base: Powdered sugar or coconut flakes creating a winter landscape
- Miniature trees: Rosemary sprigs or sugar cone trees with powdered sugar snow
- Tiny details: A sugar glass frozen pond, fondant snowman, miniature presents
- Scattered elements: Extra candies, broken gingerbread pieces suggesting "construction," a small bowl of royal icing

THE SETTING:
- Display surface: Elegant cake stand or rustic wooden board
- Background: Soft focus restaurant interior with holiday decorations, warm lighting, perhaps guests admiring in the distance
- Lighting: The internal glow of the house is the star, supplemented by warm ambient light that catches the sugar crystals and candy surfaces

ATMOSPHERE: This image captures WONDER. The craftsmanship that makes adults feel like children again. The magic of the season made edible.

TYPOGRAPHY — Whimsical yet elegant:
"{{headline}}"
"{{display_description}}"
"{{event_info}}"
"{{cta}}"

TECHNICAL: Shot at eye level with the house to create immersive perspective. Shallow depth of field keeps the house sharp while background melts away. Careful attention to capturing the internal glow without overexposure.
$PROMPT$,
'v1', TRUE,
'{"style": "pastry_showcase", "holiday_type": "christmas", "food_focus": "desserts", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["display_description", "event_info", "cta"], "defaults": {"display_description": "House-Made Gingerbread Creation", "event_info": "On Display Through December 25", "cta": "Visit Us This Holiday Season"}}, "variation_rules": {"style_adjectives": ["magical craftsmanship", "childhood wonder", "pastry artistry", "holiday centerpiece"], "gingerbread_styles": ["Victorian mansion", "cozy cottage", "village scene", "fantasy castle"], "lighting_moods": ["internal warm glow", "soft ambient", "magical sparkle"], "camera_styles": ["eye-level immersive", "45-degree showcase", "detail close-up"]}}'::JSONB);


-- 4. Cozy Fireplace Dining Scene
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-fireplace-dining', 'Cozy Fireplace Dining Scene', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The ultimate cozy holiday dining experience. This image IS the feeling of winter warmth and celebration.

THE SCENE: A beautifully set table for two positioned near a crackling fireplace. The composition captures both the intimate dining setup and the warm glow of the fire.

THE TABLE:
- Setting: Crisp white linens with a subtle holiday runner in deep green or burgundy
- Place settings: Fine china with gold or silver trim, polished silverware, crystal wine glasses catching firelight
- Centerpiece: Low arrangement of pine, eucalyptus, and red berries with pillar candles
- The food: Two elegantly plated entrées—perhaps filet mignon with red wine reduction, or pan-seared salmon with herb butter. Steam rises subtly. Sides in small dishes nearby.
- Wine: A bottle of red wine, two glasses poured, the wine catching the firelight with a deep ruby glow

THE FIREPLACE:
- Real flames visible, dancing and creating dynamic warm light
- Mantle decorated with holiday greenery, stockings, perhaps a few elegant ornaments
- The fire provides the primary light source, creating warm shadows and highlights

THE ATMOSPHERE:
- Background: Soft focus reveals more of the restaurant—other tables, holiday decorations, twinkling lights
- Human element: Perhaps two hands reaching across the table, or wine glasses mid-toast (no faces)
- Sound implied: You can almost hear the fire crackle, the soft holiday music

LIGHTING: Predominantly firelight—warm, flickering, romantic. Supplemented by candlelight from the table. The overall color temperature is warm amber and gold. Shadows are soft and inviting.

TYPOGRAPHY — Romantic, intimate:
"{{headline}}"
"{{dining_experience}}"
"{{reservation_info}}"
"{{romantic_cta}}"

This image sells an EXPERIENCE, not just a meal. It's the perfect holiday date night. It's where memories are made.

TECHNICAL: Shot with a wide aperture (f/2.0) to create dreamy bokeh from the fire and background lights. The table is sharp, everything else melts into warm glow. Long exposure consideration for fire movement.
$PROMPT$,
'v1', TRUE,
'{"style": "romantic_atmosphere", "holiday_type": "christmas", "food_focus": "fine_dining", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["dining_experience", "reservation_info", "romantic_cta"], "defaults": {"dining_experience": "Fireside Dining Experience", "reservation_info": "Reservations Recommended", "romantic_cta": "Book Your Holiday Evening"}}, "variation_rules": {"style_adjectives": ["romantic warmth", "intimate celebration", "cozy luxury", "fireside magic"], "dining_styles": ["couples dinner", "small celebration", "anniversary special", "proposal setting"], "lighting_moods": ["firelight dominant", "candlelit romance", "warm amber glow"], "camera_styles": ["wide scene setter", "table detail focus", "over-shoulder intimate"]}}'::JSONB);

-- 5. Christmas Brunch Spread
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-christmas-brunch', 'Christmas Brunch Spread', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Christmas morning brunch perfection. The meal that makes waking up early on Christmas absolutely worth it.

THE SPREAD: A generous brunch table captured from a 45-degree overhead angle, showcasing abundance and variety.

HERO ELEMENTS:
- A stunning eggs Benedict: Perfectly poached eggs with golden hollandaise cascading down, on a bed of smoked salmon or Canadian bacon, fresh chives scattered
- French toast or pancake stack: Thick-cut brioche French toast dusted with powdered sugar, fresh berries cascading, maple syrup mid-pour from a small pitcher
- Breakfast meat platter: Crispy bacon strips and maple-glazed sausage links arranged artfully
- Fresh fruit: A bowl of winter fruits—pomegranate seeds like rubies, sliced citrus, fresh berries

SUPPORTING CAST:
- A basket of fresh pastries: Croissants, cinnamon rolls with cream cheese drizzle, mini muffins
- Orange juice in a glass pitcher, champagne bottle nearby suggesting mimosas
- Coffee service: A French press or elegant carafe, steam rising from a poured cup
- Small dishes: Whipped butter, house-made jam, cream cheese

THE SETTING:
- Table: Light wood or white marble, bright and fresh feeling
- Linens: Crisp white napkins, perhaps a subtle holiday pattern
- Holiday touches: A small poinsettia, pine sprigs, a wrapped gift in the corner
- Natural light: Bright morning sun streaming through a window, creating beautiful highlights and soft shadows

ATMOSPHERE: This is Christmas morning JOY. The anticipation of presents combined with the comfort of an incredible meal. Family gathering energy.

TYPOGRAPHY — Bright, celebratory:
"{{headline}}"
"{{brunch_menu_title}}"
"{{serving_times}}"
"{{reservation_cta}}"

TECHNICAL: Bright, airy photography style. Shot in natural morning light with fill to open shadows. Colors are vibrant but natural—the orange of yolks, the red of berries, the golden brown of toast.
$PROMPT$,
'v1', TRUE,
'{"style": "brunch_abundance", "holiday_type": "christmas", "food_focus": "breakfast", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["brunch_menu_title", "serving_times", "reservation_cta"], "defaults": {"brunch_menu_title": "Christmas Day Brunch", "serving_times": "9am - 2pm", "reservation_cta": "Reserve Your Table"}}, "variation_rules": {"style_adjectives": ["morning celebration", "abundant joy", "family gathering", "bright and festive"], "brunch_styles": ["classic American", "European continental", "Southern comfort", "healthy fresh"], "lighting_moods": ["bright morning light", "soft window glow", "airy and fresh"], "camera_styles": ["overhead spread", "45-degree abundance", "hero dish focus"]}}'::JSONB);

-- 6. Hot Cocoa & Dessert Bar
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-cocoa-dessert-bar', 'Holiday Hot Cocoa & Dessert Bar', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Pure holiday indulgence. A hot cocoa and dessert spread that triggers childhood nostalgia while maintaining sophisticated appeal.

THE HERO: A large, rustic ceramic mug of rich hot chocolate, topped with an ABSURD mountain of house-made whipped cream, a drizzle of chocolate sauce, crushed peppermint pieces, and a full-size candy cane hooked on the rim. Steam rises visibly, curling into the air. The cocoa is so thick and rich you can see its viscosity.

THE SPREAD: Surrounding the hero cocoa:
- A tiered stand displaying an array of holiday cookies: perfectly decorated sugar cookies (trees, stars, snowflakes with royal icing), chocolate crinkle cookies dusted with powdered sugar, gingerbread men with personality
- A slice of yule log cake (bûche de Noël) showing the spiral interior, dusted with powdered sugar "snow," decorated with meringue mushrooms and rosemary "trees"
- Mini cheesecakes topped with cranberry compote
- A small bowl of house-made marshmallows (some toasted golden)
- Chocolate truffles dusted with cocoa powder
- A pot of melted chocolate for dipping with strawberries alongside

THE SETTING:
- Surface: Rustic wood table or marble counter with holiday runner
- Background: Soft focus kitchen or café setting with warm lighting, perhaps a chalkboard menu visible, string lights creating bokeh
- Props: Scattered candy canes, cinnamon sticks, star anise, a small wrapped gift, pine sprigs

LIGHTING: Warm, cozy, inviting. The kind of light that makes you want to wrap your hands around that mug. Soft shadows, golden tones, the steam catching the light beautifully.

TYPOGRAPHY — Playful but polished:
"{{headline}}"
"{{cocoa_description}}"
"{{dessert_feature}}"
"{{availability}}"

This image is COMFORT. It's the reward after holiday shopping. It's the treat you deserve. It's childhood magic with adult sophistication.
$PROMPT$,
'v1', TRUE,
'{"style": "cozy_indulgence", "holiday_type": "christmas", "food_focus": "desserts_cocoa", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["cocoa_description", "dessert_feature", "availability"], "defaults": {"cocoa_description": "House-Made Hot Cocoa with All the Fixings", "dessert_feature": "Holiday Dessert Bar Now Open", "availability": "Available Through December 31"}}, "variation_rules": {"style_adjectives": ["childhood nostalgia", "cozy indulgence", "sweet abundance", "warm comfort"], "cocoa_variations": ["classic with whipped cream", "peppermint mocha", "salted caramel", "Mexican spiced"], "dessert_options": ["cookie assortment", "yule log cake", "gingerbread house", "pie selection"], "camera_styles": ["overhead spread", "45-degree hero mug", "close-up steam detail"]}}'::JSONB);

-- 7. Holiday Appetizer Platter
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-appetizer-platter', 'Holiday Appetizer Platter', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The ultimate holiday party starter. A stunning appetizer spread that makes guests gasp when it hits the table.

THE HERO PLATTER: A large, impressive grazing board or tiered appetizer display featuring:

SAVORY SELECTIONS:
- Bacon-wrapped dates stuffed with goat cheese, glistening with honey glaze
- Prosciutto-wrapped asparagus spears, perfectly grilled
- Brie en croûte: A wheel of brie wrapped in golden puff pastry, partially cut to show the melty interior, topped with cranberry compote
- Stuffed mushrooms with herbed cream cheese, golden and bubbling
- Smoked salmon roses on cucumber rounds with dill cream
- Caprese skewers with cherry tomatoes, fresh mozzarella, and basil

ACCOMPANIMENTS:
- An array of artisan crackers and crostini
- Small bowls of accompaniments: fig jam, honey with honeycomb, grainy mustard
- Olives and cornichons in small dishes
- Fresh herbs scattered throughout: rosemary, thyme, sage

THE ARRANGEMENT:
- Varying heights and textures create visual interest
- Colors pop: the red of tomatoes, green of herbs, golden brown of pastry
- Negative space allows each element to shine
- A few items "in action"—a hand reaching for a date, a knife mid-spread on brie

THE SETTING:
- Surface: Elegant slate board, marble slab, or rustic wood
- Background: Holiday party atmosphere—soft focus guests, twinkling lights, festive decor
- Props: Wine glasses, cocktail napkins in holiday colors, small plates stacked ready for use

LIGHTING: Warm party lighting—bright enough to showcase the food, warm enough to feel festive. Highlights on the glossy glazes and melted cheese.

TYPOGRAPHY — Sophisticated party vibes:
"{{headline}}"
"{{platter_name}}"
"{{serving_info}}"
"{{order_cta}}"

This image says: "Your holiday party just got elevated."

TECHNICAL: Shot from 45-degree angle to show depth and variety. Selective focus keeps hero items sharp while creating appetizing blur on supporting elements.
$PROMPT$,
'v1', TRUE,
'{"style": "party_platter", "holiday_type": "christmas", "food_focus": "appetizers", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["platter_name", "serving_info", "order_cta"], "defaults": {"platter_name": "Holiday Appetizer Collection", "serving_info": "Serves 8-12 Guests", "order_cta": "Order for Your Party"}}, "variation_rules": {"style_adjectives": ["party elegance", "abundant variety", "sophisticated grazing", "festive abundance"], "platter_styles": ["grazing board", "tiered display", "passed appetizers", "charcuterie focus"], "lighting_moods": ["party bright", "warm intimate", "dramatic spotlight"], "camera_styles": ["overhead spread", "45-degree hero", "detail vignettes"]}}'::JSONB);


-- 8. Christmas Cookie Decorating
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-cookie-decorating', 'Christmas Cookie Decorating', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Interactive holiday magic. A cookie decorating scene that appeals to families and triggers the desire to participate.

THE SCENE: A cookie decorating station in beautiful, organized chaos—the kind of mess that looks intentional and inviting.

THE COOKIES:
- An array of freshly baked sugar cookies in holiday shapes: Christmas trees, stars, snowflakes, gingerbread people, candy canes, ornaments
- Some cookies are blank canvases, perfectly golden and waiting
- Some are mid-decoration, showing the process
- Some are finished masterpieces with intricate royal icing designs

THE DECORATING SUPPLIES:
- Piping bags filled with different colored royal icing: white, red, green, gold
- Small bowls of sprinkles: nonpareils, sanding sugar, jimmies in holiday colors
- Edible glitter and luster dust
- Small candies for decoration: mini M&Ms, silver dragées, candy pearls
- A palette of food coloring for custom colors

THE ACTION:
- Hands in frame (adult and child hands ideally) actively decorating a cookie
- A piping bag mid-squeeze, icing flowing onto a cookie
- The sense of activity and participation

THE SETTING:
- Surface: Butcher block or marble counter dusted with flour and powdered sugar
- Background: Warm kitchen setting, perhaps a stand mixer visible, holiday decorations
- Props: Rolling pin, cookie cutters scattered, a glass of milk, a plate of finished cookies

LIGHTING: Bright, cheerful kitchen lighting. Natural light from a window supplemented by warm overhead. The kind of light that makes everything look clean and inviting.

TYPOGRAPHY — Fun, family-friendly:
"{{headline}}"
"{{event_name}}"
"{{event_details}}"
"{{booking_info}}"

This image sells EXPERIENCE and MEMORY-MAKING. It's not just cookies—it's quality time, tradition, and holiday joy.

TECHNICAL: Bright and airy photography style. Shot from above or 45-degree angle to capture the full spread. Fast shutter to freeze any action. Colors are vibrant and cheerful.
$PROMPT$,
'v1', TRUE,
'{"style": "interactive_family", "holiday_type": "christmas", "food_focus": "desserts", "visual_complexity": "high", "input_schema": {"required": ["headline", "event_name"], "optional": ["event_details", "booking_info"], "defaults": {"event_details": "All Ages Welcome", "booking_info": "Reserve Your Spot"}}, "variation_rules": {"style_adjectives": ["family fun", "interactive joy", "creative activity", "memory making"], "event_styles": ["family workshop", "kids party", "date night activity", "corporate team building"], "lighting_moods": ["bright cheerful", "warm kitchen", "natural daylight"], "camera_styles": ["overhead action", "45-degree spread", "hands detail close-up"]}}'::JSONB);

-- 9. Mulled Wine & Charcuterie
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-mulled-wine-charcuterie', 'Mulled Wine & Charcuterie Pairing', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — Sophisticated holiday indulgence. The perfect pairing of warm spiced wine and artisanal charcuterie for the discerning palate.

THE MULLED WINE:
- A clear glass mug or traditional ceramic cup filled with deep ruby mulled wine
- Steam rising visibly, carrying the implied scent of spices
- Visible aromatics floating: orange wheel, cinnamon stick, star anise, whole cloves
- A second serving vessel: a copper pot or glass carafe keeping more wine warm
- The wine GLOWS with warmth and depth

THE CHARCUTERIE:
- An elegant board featuring:
  - Thinly sliced prosciutto di Parma, draped in delicate folds
  - Spicy coppa and bresaola
  - Aged manchego and creamy gorgonzola
  - Honeycomb with honey dipper
  - Marcona almonds and candied walnuts
  - Fresh and dried figs
  - Cornichons and whole grain mustard
  - Artisan crackers and crusty bread slices
  - Dark chocolate pieces (pairing with the wine)

THE SETTING:
- Surface: Dark slate or aged wood board
- Background: Intimate wine bar or cozy restaurant corner, soft focus with warm lighting
- Props: A wine bottle, additional glasses, linen napkins, perhaps a candle
- Holiday touches: Subtle—a sprig of pine, a few cranberries, nothing overwhelming

LIGHTING: Warm, intimate, romantic. The kind of lighting that makes wine glow and cheese look irresistible. Candlelight supplemented by soft ambient. Deep shadows create mood.

ATMOSPHERE: This is ADULT holiday indulgence. Sophisticated, sensual, slow. The antidote to holiday chaos.

TYPOGRAPHY — Elegant, refined:
"{{headline}}"
"{{pairing_description}}"
"{{price_info}}"
"{{availability}}"

TECHNICAL: Shot at f/2.8 for selective focus. The steam from the wine catches the light beautifully. Color grading emphasizes warm tones and the deep red of the wine.
$PROMPT$,
'v1', TRUE,
'{"style": "sophisticated_pairing", "holiday_type": "christmas", "food_focus": "charcuterie_wine", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["pairing_description", "price_info", "availability"], "defaults": {"pairing_description": "House Mulled Wine & Artisan Board", "price_info": "Pairing for Two: $45", "availability": "Available Nightly"}}, "variation_rules": {"style_adjectives": ["sophisticated warmth", "adult indulgence", "intimate pairing", "sensory experience"], "wine_styles": ["classic mulled red", "white mulled wine", "mulled cider alternative", "spiked hot chocolate"], "board_styles": ["classic charcuterie", "cheese focused", "Mediterranean mezze", "dessert pairing"], "camera_styles": ["45-degree pairing shot", "overhead spread", "steam detail close-up"]}}'::JSONB);

-- 10. Holiday Gift Card Promotion
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-gift-card-promo', 'Holiday Gift Card Promotion', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The perfect gift, beautifully presented. A gift card promotion that feels luxurious and thoughtful, not transactional.

THE HERO: An elegant gift card presentation:
- The gift card itself: Beautifully designed, perhaps with embossed or foil details, in a premium holder or envelope
- Presented in a gift box: Small, elegant box in holiday colors (deep green, burgundy, gold, or classic black) with satin ribbon
- Multiple cards fanned or stacked to suggest "give to everyone on your list"

THE SETTING:
- Surface: Luxurious—velvet fabric, marble, or rich wood
- Surrounding elements that suggest "gift giving":
  - Wrapped presents in coordinating colors and elegant paper
  - Fresh holiday greenery: pine branches, eucalyptus, holly
  - Ribbon curls and bows
  - A few ornaments catching the light
  - Perhaps a pen for writing a gift message

THE ATMOSPHERE:
- Background: Soft focus holiday scene—could be near a tree, by a fireplace, or in an elegant setting
- Lighting: Warm, golden, gift-giving morning light or intimate evening glow
- The feeling of ANTICIPATION—the joy of giving

BONUS OFFER VISUAL (if applicable):
- A subtle visual representation of the bonus: "Buy $100, Get $20" shown elegantly
- Perhaps two cards—one larger (the purchase) and one smaller (the bonus)

TYPOGRAPHY — Gift-worthy elegance:
"{{headline}}"
"{{offer_details}}"
"{{bonus_info}}"
"{{purchase_cta}}"
"{{expiration}}"

This image makes gift cards feel SPECIAL, not like a last-minute cop-out. It's the gift of experience, beautifully wrapped.

TECHNICAL: Clean, bright photography with careful attention to the gift card design details. Shallow depth of field keeps focus on the card while holiday elements create festive bokeh.
$PROMPT$,
'v1', TRUE,
'{"style": "luxury_gifting", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "medium", "input_schema": {"required": ["headline", "offer_details"], "optional": ["bonus_info", "purchase_cta", "expiration"], "defaults": {"bonus_info": "Buy $100, Get $20 Bonus", "purchase_cta": "Purchase In-Store or Online", "expiration": "Offer Valid Through December 24"}}, "variation_rules": {"style_adjectives": ["luxury gifting", "thoughtful presentation", "elegant simplicity", "gift-giving joy"], "presentation_styles": ["boxed elegant", "envelope classic", "multiple cards spread", "single hero"], "lighting_moods": ["morning gift opening", "evening intimate", "bright and cheerful"], "camera_styles": ["hero product shot", "lifestyle context", "detail close-up"]}}'::JSONB);

-- 11. New Year's Eve Champagne Toast
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-nye-champagne-toast', 'New Year''s Eve Champagne Toast', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — The moment of celebration. A champagne toast that captures the magic, anticipation, and glamour of New Year's Eve.

THE HERO: Champagne glasses mid-toast:
- Two or more crystal champagne flutes, caught at the moment of clinking or just raised
- The champagne is ALIVE: bubbles rising in perfect streams, the golden liquid catching light
- Condensation on the glasses suggests perfectly chilled
- The glasses are elegant—fine crystal, perhaps with gold rims

THE CHAMPAGNE:
- A premium bottle visible: Moët, Veuve Clicquot, or house champagne with elegant label
- The bottle is in an ice bucket, or recently poured
- Perhaps a second bottle suggesting abundance

THE SETTING:
- Background: New Year's Eve party atmosphere
  - Soft focus reveals other celebrants, sparklers, confetti
  - Twinkling lights and perhaps a glimpse of a clock approaching midnight
  - Gold and silver decorations, balloons, streamers
- Table setting: Elegant—white linens, candles, perhaps remnants of a beautiful dinner
- Props: Party elements—a "2026" decoration, noisemakers, a masquerade mask

THE MOMENT:
- Hands holding the glasses (elegant, perhaps with festive nail polish or a watch catching light)
- The sense of ANTICIPATION—the countdown is happening
- Joy and celebration implied in the composition

LIGHTING: Dramatic party lighting. Sparkle and shine. The champagne GLOWS. Fairy lights create beautiful bokeh. Perhaps a spotlight effect on the toast.

TYPOGRAPHY — Glamorous celebration:
"{{headline}}"
"{{event_name}}"
"{{event_details}}"
"{{ticket_info}}"
"{{reservation_cta}}"

This image IS New Year's Eve. It's the promise of new beginnings, celebrated in style.

TECHNICAL: Fast shutter to freeze the toast moment. Wide aperture for dreamy background. Careful attention to capturing the bubbles and sparkle.
$PROMPT$,
'v1', TRUE,
'{"style": "celebration_glamour", "holiday_type": "new_years", "food_focus": "drinks", "visual_complexity": "high", "input_schema": {"required": ["headline", "event_name"], "optional": ["event_details", "ticket_info", "reservation_cta"], "defaults": {"event_details": "Ring in 2026 With Us", "ticket_info": "Tickets Include Champagne Toast", "reservation_cta": "Reserve Your Spot"}}, "variation_rules": {"style_adjectives": ["glamorous celebration", "midnight magic", "sparkling anticipation", "new beginnings"], "champagne_styles": ["classic toast", "champagne tower", "bottle service", "intimate pour"], "lighting_moods": ["party sparkle", "dramatic spotlight", "golden glow", "midnight magic"], "camera_styles": ["toast action shot", "champagne detail", "party atmosphere wide"]}}'::JSONB);

-- 12. Winter Wonderland Dessert Table
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-winter-dessert-table', 'Winter Wonderland Dessert Table', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
SQUARE 1:1 PHOTOGRAPH — A breathtaking dessert display that transforms sweets into a winter fantasy. This is the dessert table that becomes the centerpiece of any holiday event.

THE DISPLAY: A multi-tiered, elaborately styled dessert table with a cohesive "winter wonderland" theme:

HERO DESSERTS:
- A stunning white cake: Multi-tiered, covered in pristine white fondant or buttercream, decorated with sugar snowflakes, edible silver leaf, and cascading sugar crystals
- Yule log (Bûche de Noël): Chocolate bark texture, dusted with powdered sugar snow, decorated with meringue mushrooms and marzipan holly

SUPPORTING SWEETS:
- White chocolate truffles dusted with edible glitter
- Snowball cookies (Russian tea cakes) piled in a crystal bowl
- Peppermint bark pieces arranged on a silver tray
- Mini pavlovas topped with sugared cranberries
- White chocolate-dipped strawberries
- Macarons in winter colors: white, silver, pale blue, blush pink
- Sugar cookies decorated as snowflakes with royal icing

THE STYLING:
- Display pieces: Varying heights using cake stands, pedestals, and risers in white, silver, and crystal
- "Snow" elements: Faux snow fabric, scattered sugar crystals, white feathers
- Winter touches: Silver branches, white roses, eucalyptus, pinecones painted white
- Lighting elements: LED candles, fairy lights woven through the display

THE SETTING:
- Background: Elegant event space with soft focus holiday decorations
- Table: Draped in white or silver fabric with texture
- The overall effect: A FANTASY. A snow queen's feast. Magical and ethereal.

LIGHTING: Bright but soft, emphasizing the whites and silvers. Sparkle from the crystals and glitter. The desserts GLOW.

TYPOGRAPHY — Ethereal elegance:
"{{headline}}"
"{{dessert_menu_title}}"
"{{event_info}}"
"{{booking_cta}}"

This image is ASPIRATIONAL. It's the dessert table of dreams. It makes people want to host an event just to have this.

TECHNICAL: Bright, high-key photography. Shot to capture the full spread while maintaining detail. Careful white balance to keep whites pure without going blue.
$PROMPT$,
'v1', TRUE,
'{"style": "fantasy_dessert", "holiday_type": "christmas", "food_focus": "desserts", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["dessert_menu_title", "event_info", "booking_cta"], "defaults": {"dessert_menu_title": "Winter Wonderland Dessert Collection", "event_info": "Available for Private Events", "booking_cta": "Book Your Holiday Celebration"}}, "variation_rules": {"style_adjectives": ["ethereal fantasy", "winter magic", "elegant abundance", "snow queen aesthetic"], "theme_variations": ["all white winter", "silver and blue", "rose gold winter", "classic red and white"], "lighting_moods": ["bright ethereal", "soft romantic", "sparkle and shine"], "camera_styles": ["full table spread", "hero cake focus", "detail vignettes"]}}'::JSONB);


-- ============================================================================
-- INSTAGRAM STORIES (9:16) TEMPLATES - 10 Templates
-- ============================================================================

-- 1. Christmas Eve Dinner Countdown
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-christmas-eve-countdown', 'Christmas Eve Dinner Countdown', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Urgency meets elegance. This is the "don't miss out" moment wrapped in holiday magic.

THE SCENE: A glimpse into the restaurant's Christmas Eve transformation. The frame captures a beautifully set table in the foreground—crisp white linens, gleaming silverware, crystal glasses catching candlelight, a small centerpiece of red roses and pine. In the soft-focus background, the restaurant glows: a Christmas tree with warm white lights, garland draped along the bar, other tables being prepared.

The mood is ANTICIPATION. The calm before the beautiful storm of Christmas Eve service.

LIGHTING: Predominantly warm candlelight from the table's centerpiece candles, supplemented by the soft glow of Christmas lights. The overall feeling is intimate, special, once-a-year magical.

COMPOSITION FOR VERTICAL FORMAT:
- Lower third: The beautifully set table, sharp and inviting
- Middle: Transition zone with soft focus elements
- Upper third: The glowing restaurant atmosphere, Christmas tree creating height

TYPOGRAPHY — Bold but elegant, creating urgency without desperation:
"{{headline}}"
"CHRISTMAS EVE"
"{{event_date}}"
"{{seating_times}}"
"{{special_menu_teaser}}"
"{{spots_remaining}}"
"{{cta}}"

Design elements: A subtle countdown timer graphic element. Perhaps a small animated snow effect (implied for the static image—soft white particles). The Instagram countdown sticker placement is considered in the layout.

The vertical format emphasizes the height of the Christmas tree in background, the elegance of the table setting, the aspiration of the evening.

This story makes viewers immediately think: "I need to book this NOW before it's gone."
$PROMPT$,
'v1', TRUE,
'{"style": "elegant_urgency", "holiday_type": "christmas_eve", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "event_date"], "optional": ["seating_times", "special_menu_teaser", "spots_remaining", "cta"], "defaults": {"seating_times": "5pm · 7pm · 9pm Seatings", "special_menu_teaser": "Five-Course Prix Fixe", "spots_remaining": "Limited Tables Remain", "cta": "Link in Bio to Reserve"}}, "variation_rules": {"style_adjectives": ["elegant urgency", "intimate anticipation", "once-a-year special", "candlelit magic"], "urgency_levels": ["limited tables", "almost sold out", "final seats", "book now"], "camera_styles": ["table setting hero", "restaurant atmosphere wide", "detail vignette"]}}'::JSONB);

-- 2. Holiday Menu Reveal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-menu-reveal', 'Holiday Menu Reveal', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — The big reveal. Building anticipation for your special holiday menu with cinematic drama.

THE SCENE: A dramatic presentation of the holiday menu, designed to create excitement and desire.

VISUAL CONCEPT: A beautifully designed menu card or booklet, partially open, with glimpses of the dishes:
- The menu itself: Elegant paper stock, perhaps with embossed or foil details, holiday-themed design
- Surrounding the menu: Artfully arranged ingredients that hint at the dishes—fresh herbs, a truffle, cranberries, a cinnamon stick
- In the background: Soft focus of one of the actual dishes, steam rising, creating anticipation

ALTERNATIVE CONCEPT: A "peek behind the curtain" approach:
- Chef's hands plating a dish, the menu visible on the pass
- The kitchen in action, holiday specials being prepared
- A sense of exclusive access

LIGHTING: Dramatic, spotlight effect on the menu. Warm tones. The feeling of a theatrical reveal.

COMPOSITION FOR VERTICAL:
- The menu or hero dish commands the center
- Negative space at top and bottom for text overlay
- Leading lines draw the eye to the key information

TYPOGRAPHY — Dramatic reveal energy:
"{{headline}}"
"{{menu_title}}"
"{{course_preview}}"
"{{price_info}}"
"{{availability_dates}}"
"{{cta}}"

The story should feel like an EXCLUSIVE PREVIEW. Like the viewer is getting first access to something special.

INTERACTIVE ELEMENTS: Consider placement for poll stickers ("Which course are you most excited for?") or question stickers ("What's your must-have holiday dish?").
$PROMPT$,
'v1', TRUE,
'{"style": "dramatic_reveal", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "menu_title"], "optional": ["course_preview", "price_info", "availability_dates", "cta"], "defaults": {"course_preview": "Four Courses of Holiday Magic", "price_info": "$85 per person", "availability_dates": "December 20-25", "cta": "Swipe Up for Full Menu"}}, "variation_rules": {"style_adjectives": ["dramatic reveal", "exclusive preview", "anticipation building", "behind the scenes"], "reveal_styles": ["menu card hero", "dish preview", "kitchen action", "ingredient tease"], "lighting_moods": ["dramatic spotlight", "warm intimate", "kitchen bright"], "camera_styles": ["menu detail", "chef action", "dish preview"]}}'::JSONB);

-- 3. "Book Now" Reservation Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-book-now-push', 'Holiday Reservation Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Pure conversion focus. A visually stunning push to drive immediate reservations.

THE SCENE: The most aspirational view of your holiday dining experience:
- A wide shot of the restaurant in full holiday glory
- Every table set beautifully, candles lit, Christmas tree glowing
- The sense of a FULL restaurant (but with YOUR table waiting)
- Perhaps a "Reserved" sign on a beautifully set table in the foreground

ALTERNATIVE APPROACH: The "last table" concept:
- A single beautifully set table, spotlight effect
- Empty chairs waiting to be filled
- The implication: This could be YOUR table

LIGHTING: Warm, inviting, the restaurant at its most beautiful. The kind of lighting that makes you want to BE there.

COMPOSITION FOR VERTICAL:
- Full use of the vertical frame to show the restaurant's scale and beauty
- Clear space for text overlay with booking information
- The eye is drawn to the "available" table

URGENCY ELEMENTS:
- Visual countdown or calendar graphic
- "Only X tables remaining" indicator
- Date prominently displayed

TYPOGRAPHY — Clear, urgent, actionable:
"{{headline}}"
"{{urgency_message}}"
"{{date_info}}"
"{{time_slots}}"
"{{cta}}"
"{{booking_method}}"

This story has ONE job: Get the viewer to book NOW. Every element supports that goal.

INTERACTIVE: Link sticker placement is crucial. Consider countdown sticker to reservation deadline.
$PROMPT$,
'v1', TRUE,
'{"style": "conversion_focused", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "urgency_message"], "optional": ["date_info", "time_slots", "cta", "booking_method"], "defaults": {"date_info": "Christmas Eve & Christmas Day", "time_slots": "Limited Seatings Available", "cta": "Book Now", "booking_method": "Link in Bio or Call"}}, "variation_rules": {"style_adjectives": ["urgent conversion", "aspirational dining", "last chance", "don''t miss out"], "urgency_styles": ["countdown timer", "tables remaining", "almost full", "final call"], "lighting_moods": ["restaurant glamour", "intimate warmth", "festive glow"], "camera_styles": ["wide restaurant", "single table focus", "reserved sign detail"]}}'::JSONB);

-- 4. Behind-the-Scenes Kitchen Prep
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-kitchen-bts', 'Behind-the-Scenes Holiday Kitchen', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Authentic, engaging, humanizing. A peek into the kitchen during holiday prep that builds connection and anticipation.

THE SCENE: The kitchen in action, preparing for holiday service:

OPTION A - THE PREP:
- Mise en place for holiday dishes: bowls of prepped ingredients, sauces reducing, stocks simmering
- Chef's hands working: rolling pasta, seasoning a roast, piping decorations on desserts
- The organized chaos of a professional kitchen before service

OPTION B - THE CRAFT:
- Close-up of a signature holiday dish being plated
- The precision and artistry of professional cooking
- Steam, sizzle, the sensory experience of cooking

OPTION C - THE TEAM:
- The kitchen team in action, working together
- Camaraderie and focus
- The human element behind the food

LIGHTING: Bright kitchen lighting, but styled to feel warm and inviting rather than harsh. The gleam of stainless steel, the colors of fresh ingredients popping.

COMPOSITION FOR VERTICAL:
- Action in the center of frame
- Movement implied (a hand in motion, steam rising)
- Authentic but aesthetically pleasing

TYPOGRAPHY — Casual, authentic voice:
"{{headline}}"
"{{prep_description}}"
"{{dish_teaser}}"
"{{team_message}}"
"{{cta}}"

This story builds TRUST and CONNECTION. It shows the care and craft behind the holiday experience.

INTERACTIVE: Great opportunity for question stickers ("What holiday dish should we feature?") or polls ("Turkey or ham this year?").
$PROMPT$,
'v1', TRUE,
'{"style": "authentic_bts", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["prep_description", "dish_teaser", "team_message", "cta"], "defaults": {"prep_description": "Holiday Prep in Full Swing", "dish_teaser": "Wait Until You See What''s Coming", "team_message": "Our Team is Ready for You", "cta": "Reserve Your Table"}}, "variation_rules": {"style_adjectives": ["authentic behind-scenes", "kitchen action", "craft and care", "team spirit"], "bts_styles": ["prep action", "plating artistry", "team camaraderie", "ingredient showcase"], "lighting_moods": ["bright kitchen", "warm and inviting", "action focused"], "camera_styles": ["hands detail", "wide kitchen", "over-shoulder chef"]}}'::JSONB);

-- 5. Holiday Special of the Day
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-daily-special', 'Holiday Special of the Day', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Daily engagement driver. A mouthwatering feature of today's holiday special that creates urgency and desire.

THE HERO: One stunning dish, photographed to perfection:
- The daily special in all its glory: perfectly plated, steam rising if hot, garnishes fresh and vibrant
- Shot from the most appetizing angle (usually 45 degrees for plated dishes, overhead for bowls)
- Every detail matters: the glisten of sauce, the char marks, the fresh herbs

COMPOSITION FOR VERTICAL:
- The dish commands the center-lower portion of the frame
- Generous negative space above for text
- Perhaps a hint of the table setting or holiday decor in soft focus

SUPPORTING ELEMENTS:
- A fork or spoon entering the frame, about to take a bite
- A wine pairing suggestion visible (glass in soft focus)
- The plate on a beautifully set holiday table

LIGHTING: Food photography perfection. The dish is the STAR. Warm, appetizing light that makes textures pop and colors sing.

TYPOGRAPHY — Daily feature energy:
"{{headline}}"
"TODAY'S SPECIAL"
"{{dish_name}}"
"{{dish_description}}"
"{{price}}"
"{{availability}}"

This story should make viewers HUNGRY and create FOMO. Today only. Don't miss it.

INTERACTIVE: Poll sticker ("Would you try this?"), emoji slider for excitement level.
$PROMPT$,
'v1', TRUE,
'{"style": "daily_feature", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "dish_name"], "optional": ["dish_description", "price", "availability"], "defaults": {"dish_description": "Chef''s Holiday Creation", "price": "Market Price", "availability": "While Supplies Last"}}, "variation_rules": {"style_adjectives": ["mouthwatering hero", "daily urgency", "chef''s feature", "limited availability"], "dish_styles": ["plated entree", "comfort classic", "seasonal special", "dessert feature"], "lighting_moods": ["food photography perfect", "warm appetizing", "dramatic spotlight"], "camera_styles": ["45-degree hero", "overhead flat lay", "action bite shot"]}}'::JSONB);


-- 6. Gift Card Last-Minute Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-gift-card-reminder', 'Gift Card Last-Minute Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Last-minute gifting salvation. A visually appealing reminder that gift cards are the perfect solution for procrastinators.

THE SCENE: Gift card as hero, styled for maximum appeal:
- The gift card beautifully presented: in an elegant box, with ribbon, looking like a GIFT not an afterthought
- Surrounding holiday chaos (in a charming way): wrapping paper, scissors, ribbon, suggesting last-minute wrapping
- OR: A calm, elegant presentation that says "the perfect gift, no stress"

URGENCY VISUAL ELEMENTS:
- Calendar showing December 23rd or 24th
- Clock suggesting time running out
- "Last chance" visual treatment

COMPOSITION FOR VERTICAL:
- Gift card hero in the center
- Holiday elements framing top and bottom
- Clear space for urgent messaging

LIGHTING: Bright, cheerful, gift-giving energy. The gift card should look premium and desirable.

TYPOGRAPHY — Urgent but helpful:
"{{headline}}"
"{{urgency_message}}"
"{{gift_card_offer}}"
"{{purchase_options}}"
"{{cta}}"

The tone is HELPFUL, not pushy. "We've got you covered" energy.

INTERACTIVE: Link sticker to purchase page is essential. Countdown sticker to purchase deadline.
$PROMPT$,
'v1', TRUE,
'{"style": "last_minute_gifting", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "urgency_message"], "optional": ["gift_card_offer", "purchase_options", "cta"], "defaults": {"gift_card_offer": "The Gift They''ll Actually Love", "purchase_options": "Available Online & In-Store", "cta": "Buy Now - Instant Delivery"}}, "variation_rules": {"style_adjectives": ["last minute salvation", "helpful urgency", "perfect gift", "no stress solution"], "urgency_styles": ["countdown timer", "last day", "hours remaining", "still time"], "lighting_moods": ["bright cheerful", "gift-giving warm", "urgent but friendly"], "camera_styles": ["gift card hero", "lifestyle context", "urgency focused"]}}'::JSONB);

-- 7. Christmas Day Hours Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-christmas-hours', 'Christmas Day Hours Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Essential information, beautifully delivered. Christmas Day hours that are clear, helpful, and on-brand.

THE SCENE: The restaurant in its holiday best, serving as backdrop for important information:
- The exterior of the restaurant decorated for Christmas: wreaths, lights, welcoming
- OR: The interior, warm and inviting, ready for guests
- The feeling: "We're here for you on Christmas"

COMPOSITION FOR VERTICAL:
- Beautiful restaurant imagery as background
- Clear, readable text overlay with hours information
- Holiday graphic elements framing the information

INFORMATION HIERARCHY:
1. "Christmas Day Hours" - largest, most prominent
2. Open/Closed status - immediately clear
3. Specific hours if open
4. Special notes (reservations required, limited menu, etc.)

LIGHTING: Warm, welcoming, festive. The restaurant looks like a place you'd WANT to spend Christmas.

TYPOGRAPHY — Clear, informative, warm:
"{{headline}}"
"CHRISTMAS DAY"
"{{hours_info}}"
"{{special_notes}}"
"{{contact_info}}"
"{{holiday_message}}"

This story is UTILITY with warmth. People need this information—deliver it beautifully.

DESIGN: Consider a "save this" prompt. Make it screenshot-worthy.
$PROMPT$,
'v1', TRUE,
'{"style": "informational_warm", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "hours_info"], "optional": ["special_notes", "contact_info", "holiday_message"], "defaults": {"special_notes": "Reservations Recommended", "contact_info": "Call for Details", "holiday_message": "Merry Christmas from Our Family to Yours"}}, "variation_rules": {"style_adjectives": ["clear utility", "warm informational", "helpful service", "holiday welcome"], "status_options": ["open special hours", "closed for holiday", "limited hours", "brunch only"], "lighting_moods": ["welcoming exterior", "warm interior", "festive glow"], "camera_styles": ["exterior establishing", "interior welcoming", "detail with text"]}}'::JSONB);

-- 8. Holiday Party Booking CTA
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-party-booking', 'Holiday Party Booking CTA', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Event booking driver. Showcasing your private event capabilities for holiday parties.

THE SCENE: Your private dining or event space at its most impressive:
- A beautifully set private dining room or event space
- Long table set for a group: elegant place settings, centerpieces, candles
- Holiday decorations that show what's possible
- The sense of an EXCLUSIVE, special experience

ALTERNATIVE: A party in progress (tastefully):
- Guests enjoying themselves (backs to camera, no faces)
- Raised glasses, laughter implied
- The energy of celebration

COMPOSITION FOR VERTICAL:
- The space or party scene fills the frame
- Text overlay areas clearly defined
- The aspiration is clear: "This could be YOUR party"

LIGHTING: Event lighting at its best. Warm, flattering, celebratory. The space looks AMAZING.

TYPOGRAPHY — Event booking focus:
"{{headline}}"
"{{event_type}}"
"{{capacity_info}}"
"{{package_highlights}}"
"{{booking_urgency}}"
"{{cta}}"

This story sells the EXPERIENCE of hosting your holiday party here. Easy, impressive, memorable.

INTERACTIVE: Link to event inquiry form. Consider "DM us" CTA for personal touch.
$PROMPT$,
'v1', TRUE,
'{"style": "event_showcase", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "event_type"], "optional": ["capacity_info", "package_highlights", "booking_urgency", "cta"], "defaults": {"capacity_info": "Groups of 10-50", "package_highlights": "Custom Menus Available", "booking_urgency": "Prime Dates Filling Fast", "cta": "Inquire Now"}}, "variation_rules": {"style_adjectives": ["event elegance", "party showcase", "private dining luxury", "celebration ready"], "event_styles": ["corporate party", "family gathering", "friends celebration", "office holiday"], "lighting_moods": ["event glamour", "intimate private dining", "party energy"], "camera_styles": ["wide room showcase", "table setting detail", "party atmosphere"]}}'::JSONB);

-- 9. Countdown to New Year's Eve
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-nye-countdown', 'Countdown to New Year''s Eve', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Building anticipation for the biggest night of the year. NYE countdown that creates excitement and drives bookings.

THE SCENE: New Year's Eve glamour and anticipation:
- Champagne bottles chilling, glasses ready
- "2026" decorations, balloons, sparkle
- The restaurant transformed for NYE: gold and silver, glitter, elegance
- A clock approaching midnight (or stylized countdown graphic)

THE VIBE: EXCITEMENT. ANTICIPATION. GLAMOUR. This is THE night.

COMPOSITION FOR VERTICAL:
- Celebratory elements fill the frame
- Countdown number or timer prominent
- Space for event details and booking CTA

VISUAL ELEMENTS:
- Sparkle and shine everywhere
- Gold, silver, black color palette
- Confetti, streamers, party elements
- The promise of an unforgettable night

LIGHTING: Party lighting. Sparkle. Drama. The kind of lighting that makes everyone look good and feel special.

TYPOGRAPHY — Countdown energy:
"{{headline}}"
"{{days_until}}"
"NEW YEAR'S EVE"
"{{event_highlights}}"
"{{ticket_info}}"
"{{cta}}"

This story creates FOMO. The viewer should think: "I NEED to be there."

INTERACTIVE: Countdown sticker is essential. Link to tickets/reservations.
$PROMPT$,
'v1', TRUE,
'{"style": "nye_anticipation", "holiday_type": "new_years", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "days_until"], "optional": ["event_highlights", "ticket_info", "cta"], "defaults": {"event_highlights": "Live Music · Champagne Toast · Prix Fixe Menu", "ticket_info": "Tickets On Sale Now", "cta": "Get Your Tickets"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "NYE glamour", "party anticipation", "celebration building"], "countdown_styles": ["days remaining", "hours countdown", "final tickets", "almost here"], "lighting_moods": ["party sparkle", "glamour gold", "midnight magic"], "camera_styles": ["celebration setup", "champagne hero", "countdown focus"]}}'::JSONB);

-- 10. Thank You / Season's Greetings
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-seasons-greetings', 'Season''s Greetings Thank You', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
VERTICAL 9:16 INSTAGRAM STORY — Heartfelt connection. A genuine thank you and holiday greeting that strengthens community bonds.

THE SCENE: Warm, authentic, human:

OPTION A - THE TEAM:
- The restaurant team gathered, smiling, in holiday attire
- In front of the restaurant or Christmas tree
- Genuine warmth and gratitude
- Perhaps holding a "Thank You" sign or holiday greeting

OPTION B - THE RESTAURANT:
- The restaurant at its most beautiful, empty but inviting
- Holiday decorations, warm lighting
- The sense of a place that's been home to many celebrations
- Nostalgic, grateful energy

OPTION C - CUSTOMER MOMENTS:
- A collage or montage of happy moments from the year
- Celebrations, gatherings, special occasions hosted
- The community you've built

LIGHTING: Warm, soft, emotional. The kind of lighting that feels like a hug.

COMPOSITION FOR VERTICAL:
- Human element or restaurant beauty as hero
- Generous space for heartfelt message
- Holiday frame or border elements

TYPOGRAPHY — Genuine, warm, grateful:
"{{headline}}"
"{{gratitude_message}}"
"{{holiday_wish}}"
"{{looking_ahead}}"
"{{signature}}"

This story is about CONNECTION, not selling. It's the human moment in the holiday rush.

TONE: Sincere. Not salesy. Genuinely grateful for the community.
$PROMPT$,
'v1', TRUE,
'{"style": "heartfelt_gratitude", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "gratitude_message"], "optional": ["holiday_wish", "looking_ahead", "signature"], "defaults": {"holiday_wish": "Wishing You Joy This Holiday Season", "looking_ahead": "See You in the New Year", "signature": "With Gratitude, The [Restaurant] Family"}}, "variation_rules": {"style_adjectives": ["heartfelt gratitude", "genuine warmth", "community connection", "holiday spirit"], "greeting_styles": ["team photo", "restaurant beauty", "customer montage", "simple elegant"], "lighting_moods": ["warm emotional", "soft nostalgic", "genuine natural"], "camera_styles": ["team group shot", "restaurant establishing", "collage montage"]}}'::JSONB);


-- ============================================================================
-- FACEBOOK POSTS TEMPLATES - 5 Templates
-- ============================================================================

-- 1. Holiday Catering Menu Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-catering-showcase', 'Holiday Catering Menu Showcase', 'all_verticals', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — The ultimate "let us handle your holiday party" image. Professional, abundant, impressive.

THE SCENE: A catering spread laid out on an elegant buffet table, photographed as if guests are about to arrive. This is the moment of perfect readiness.

THE SPREAD (left to right, creating visual flow):
- Charcuterie and cheese board: An impressive grazing board with aged cheeses, cured meats, honeycomb, fig jam, marcona almonds, fresh and dried fruits, artisan crackers. Garnished with rosemary and edible flowers.
- Carved meat station: A partially carved beef tenderloin or turkey breast on a cutting board, professional carving tools nearby, au jus in a warming vessel
- Hot dishes in elegant chafing dishes: Glimpses of sides—green bean almondine, scalloped potatoes, glazed carrots
- Bread basket: Assorted artisan rolls and bread, wrapped in linen
- Dessert display: Mini desserts on a tiered stand—petit fours, chocolate-dipped strawberries, mini tarts

THE SETTING:
- Table: Long banquet table with floor-length white linen, subtle holiday greenery runner down the center
- Background: Elegant event space—could be a private dining room, a decorated venue, soft holiday lighting
- Details: Stacked plates ready for guests, linen napkins fanned, serving utensils polished and placed

LIGHTING: Professional event lighting—bright enough to showcase the food clearly, but warm enough to feel festive. Perhaps uplighting on walls in warm amber.

TYPOGRAPHY — Professional, trustworthy, impressive:
"{{headline}}"
"{{catering_tagline}}"

HOLIDAY CATERING PACKAGES:
• {{package1}}
• {{package2}}
• {{package3}}

"{{order_deadline}}"
"{{contact_info}}"

This image says: "Your holiday party is handled. We've got this. You just show up and take the credit."

TECHNICAL: Wide angle to capture the full spread. Shot at f/5.6 for good depth of field across the table. Color grading is natural and appetizing.
$PROMPT$,
'v1', TRUE,
'{"style": "professional_catering", "holiday_type": "christmas", "food_focus": "full_spread", "visual_complexity": "very_high", "input_schema": {"required": ["headline", "catering_tagline"], "optional": ["package1", "package2", "package3", "order_deadline", "contact_info"], "defaults": {"package1": "Intimate Gathering (10-20 guests)", "package2": "Holiday Party (25-50 guests)", "package3": "Corporate Celebration (50+ guests)", "order_deadline": "Order by December 15 for Christmas delivery"}}, "variation_rules": {"style_adjectives": ["professional abundance", "event-ready elegance", "impressive spread", "catering excellence"], "spread_styles": ["buffet layout", "station setup", "family-style platters", "cocktail reception"], "camera_styles": ["wide establishing shot", "detail vignettes", "overhead spread"]}}'::JSONB);

-- 2. Christmas Prix Fixe Menu Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-prix-fixe-menu', 'Christmas Prix Fixe Menu Announcement', 'all_verticals', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — The complete holiday dining experience in one stunning image. A prix fixe menu announcement that sells the entire experience.

THE COMPOSITION: A carefully styled "menu progression" showing all courses:

LEFT SIDE - STARTERS:
- An elegant appetizer: perhaps seared scallops on a bed of butternut squash purée, or a composed salad with pomegranate and goat cheese
- A soup course: creamy bisque or consommé in an elegant bowl, garnished beautifully

CENTER - THE MAIN:
- The hero entrée: A perfectly cooked protein (beef tenderloin, duck breast, or rack of lamb) with elegant plating
- Accompaniments artfully arranged: roasted vegetables, potato preparation, sauce pooled or drizzled
- This is the STAR of the composition

RIGHT SIDE - FINALE:
- Dessert: A stunning holiday dessert—perhaps a chocolate soufflé, pear tart, or elegant plated dessert
- Coffee service: A demitasse cup, perhaps with petit fours

THE SETTING:
- All dishes on a beautifully set table with holiday elements
- Consistent elegant plateware throughout
- Wine pairings visible: different glasses for each course
- Soft holiday decor in background: candles, greenery, warm lighting

LIGHTING: Restaurant ambiance lighting. Warm, sophisticated, the kind of lighting that makes food look irresistible and the experience feel special.

TYPOGRAPHY — Menu announcement elegance:
"{{headline}}"
"{{menu_title}}"

"{{course1_name}}" — {{course1_description}}
"{{course2_name}}" — {{course2_description}}
"{{course3_name}}" — {{course3_description}}
"{{course4_name}}" — {{course4_description}}

"{{price_info}}"
"{{availability}}"
"{{reservation_cta}}"

This image sells a COMPLETE EXPERIENCE. Not just food, but an evening, a memory, a celebration.

TECHNICAL: Careful composition to show all courses while maintaining visual hierarchy. The main course is largest/most prominent. Shot at f/4 for selective focus that guides the eye.
$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase", "holiday_type": "christmas", "food_focus": "full_menu", "visual_complexity": "very_high", "input_schema": {"required": ["headline", "menu_title", "price_info"], "optional": ["course1_name", "course1_description", "course2_name", "course2_description", "course3_name", "course3_description", "course4_name", "course4_description", "availability", "reservation_cta"], "defaults": {"course1_name": "First Course", "course1_description": "Seasonal Selection", "course2_name": "Second Course", "course2_description": "Chef''s Choice", "course3_name": "Main Course", "course3_description": "Holiday Feature", "course4_name": "Dessert", "course4_description": "Sweet Finale", "availability": "December 24-25", "reservation_cta": "Reserve Your Table"}}, "variation_rules": {"style_adjectives": ["complete experience", "menu progression", "fine dining elegance", "holiday celebration"], "menu_styles": ["four course", "five course", "tasting menu", "family style"], "lighting_moods": ["restaurant ambiance", "candlelit elegant", "warm sophisticated"], "camera_styles": ["progression layout", "hero main focus", "overhead spread"]}}'::JSONB);

-- 3. Holiday Hours & Closures
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-hours-closures', 'Holiday Hours & Closures', 'all_verticals', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Essential information delivered beautifully. Holiday hours that are clear, shareable, and on-brand.

THE SCENE: The restaurant exterior or interior at its holiday best, serving as an elegant backdrop for important scheduling information.

OPTION A - EXTERIOR:
- The restaurant's facade decorated for the holidays
- Wreaths on doors, lights in windows, welcoming and warm
- Perhaps light snow falling or fresh snow on the ground
- The sense of a destination worth visiting

OPTION B - INTERIOR:
- The dining room set and ready, holiday decorations in place
- Empty but inviting—waiting for guests
- Warm lighting, festive atmosphere
- The promise of what awaits

THE INFORMATION OVERLAY:
- Clean, highly readable typography
- Calendar-style layout for multiple dates
- Clear open/closed indicators
- Special notes for each day

LIGHTING: Warm, welcoming, festive. The restaurant looks like a place you'd want to spend the holidays.

TYPOGRAPHY — Clear, organized, helpful:
"{{headline}}"

HOLIDAY HOURS:
{{christmas_eve_hours}}
{{christmas_day_hours}}
{{nye_hours}}
{{new_years_day_hours}}

"{{special_notes}}"
"{{contact_info}}"
"{{holiday_message}}"

This post is UTILITY. People need this information. Deliver it clearly and beautifully so they save and share it.

DESIGN: Consider a "save this post" prompt. Make it screenshot-worthy and shareable.
$PROMPT$,
'v1', TRUE,
'{"style": "informational_elegant", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "low", "input_schema": {"required": ["headline", "christmas_eve_hours", "christmas_day_hours"], "optional": ["nye_hours", "new_years_day_hours", "special_notes", "contact_info", "holiday_message"], "defaults": {"nye_hours": "New Year''s Eve: Special Event", "new_years_day_hours": "New Year''s Day: Closed", "special_notes": "Reservations Recommended for All Holiday Dates", "holiday_message": "Happy Holidays from Our Family to Yours"}}, "variation_rules": {"style_adjectives": ["clear utility", "elegant informational", "shareable reference", "holiday welcome"], "layout_styles": ["calendar format", "list format", "graphic schedule", "simple text"], "lighting_moods": ["welcoming exterior", "warm interior", "festive glow"], "camera_styles": ["exterior establishing", "interior welcoming", "detail backdrop"]}}'::JSONB);

-- 4. Private Event Space Promotion
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-private-events', 'Private Event Space Promotion', 'all_verticals', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Showcase your private event capabilities. The image that makes event planners say "this is the place."

THE SCENE: Your private dining room or event space transformed for a holiday celebration:

THE SPACE:
- A beautifully set long table or multiple round tables
- Elegant holiday centerpieces: low arrangements of pine, candles, seasonal flowers
- Place settings that show attention to detail: charger plates, multiple glasses, folded napkins
- The room decorated for the holidays: garland, subtle lights, perhaps a small tree

THE DETAILS:
- Menu cards at each place setting
- Wine bottles ready to pour
- A gift or party favor at each seat
- The sense of a CURATED experience

THE ATMOSPHERE:
- Warm, intimate lighting—candles supplemented by soft ambient
- The feeling of exclusivity and special occasion
- Perhaps a glimpse of the main restaurant through a doorway, showing the private nature of the space

LIGHTING: Event lighting perfection. Warm, flattering, the kind of lighting that makes everyone look good in photos. Candles create intimacy.

TYPOGRAPHY — Event booking focus:
"{{headline}}"
"{{space_name}}"

"{{capacity_info}}"
"{{amenities}}"
"{{package_options}}"

"{{booking_urgency}}"
"{{contact_cta}}"

This image sells the EASE of hosting here. "Your event, handled beautifully."

TECHNICAL: Wide angle to show the full space. Shot at golden hour or with carefully controlled lighting to create warmth. Attention to symmetry and elegance.
$PROMPT$,
'v1', TRUE,
'{"style": "event_space_showcase", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "high", "input_schema": {"required": ["headline", "space_name"], "optional": ["capacity_info", "amenities", "package_options", "booking_urgency", "contact_cta"], "defaults": {"capacity_info": "Accommodates 20-60 Guests", "amenities": "Private Bar · Custom Menus · A/V Available", "package_options": "Packages Starting at $75/person", "booking_urgency": "Holiday Dates Booking Now", "contact_cta": "Contact Our Events Team"}}, "variation_rules": {"style_adjectives": ["private elegance", "event-ready luxury", "intimate celebration", "exclusive experience"], "space_styles": ["private dining room", "semi-private area", "full buyout", "outdoor covered"], "lighting_moods": ["candlelit intimate", "event bright", "warm ambient"], "camera_styles": ["wide room showcase", "table detail", "atmospheric mood"]}}'::JSONB);

-- 5. Year-End Thank You to Customers
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-year-end-thanks', 'Year-End Thank You to Customers', 'all_verticals', 'facebook_post', 'base',
$PROMPT$
LANDSCAPE 16:9 PHOTOGRAPH — Heartfelt community connection. A genuine year-end thank you that strengthens relationships and builds loyalty.

THE SCENE: Authentic, warm, human—this is about CONNECTION, not selling.

OPTION A - THE TEAM:
- Your entire team gathered together, genuine smiles
- In the restaurant, perhaps in front of the bar or kitchen
- Holiday attire or matching aprons
- A "Thank You" banner or sign
- The PEOPLE behind the experience

OPTION B - MEMORY COLLAGE:
- A thoughtfully arranged collage of moments from the year
- Happy guests (with permission), special events, milestones
- Behind-the-scenes moments, team celebrations
- The story of your year in images

OPTION C - THE RESTAURANT:
- Your restaurant at its most beautiful, empty and peaceful
- Holiday decorations, warm lighting
- The sense of a place that's hosted countless celebrations
- Nostalgic, grateful energy

LIGHTING: Warm, soft, emotional. Natural light or soft artificial that feels genuine, not staged.

TYPOGRAPHY — Genuine, heartfelt:
"{{headline}}"

"{{gratitude_message}}"

"{{year_highlights}}"

"{{looking_forward}}"

"{{signature}}"

This post is about GRATITUDE and COMMUNITY. It's the human moment that reminds people why they love your restaurant.

TONE: Sincere, warm, genuine. Not a sales pitch. A real thank you.
$PROMPT$,
'v1', TRUE,
'{"style": "community_gratitude", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "medium", "input_schema": {"required": ["headline", "gratitude_message"], "optional": ["year_highlights", "looking_forward", "signature"], "defaults": {"year_highlights": "What a Year It''s Been", "looking_forward": "We Can''t Wait to See You in the New Year", "signature": "With Gratitude, The [Restaurant] Family"}}, "variation_rules": {"style_adjectives": ["genuine gratitude", "community warmth", "year in review", "heartfelt thanks"], "content_styles": ["team photo", "memory collage", "restaurant beauty", "milestone celebration"], "lighting_moods": ["warm natural", "soft emotional", "genuine authentic"], "camera_styles": ["team group shot", "collage layout", "restaurant establishing"]}}'::JSONB);


-- ============================================================================
-- CAROUSEL / MULTI-IMAGE TEMPLATES - 3 Templates
-- ============================================================================

-- 1. 12 Days of Holiday Specials
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-carousel-12-days', '12 Days of Holiday Specials', 'all_verticals', 'instagram_carousel', 'base',
$PROMPT$
MULTI-SLIDE INSTAGRAM CAROUSEL (5 slides) — A save-worthy, share-worthy countdown campaign that builds anticipation and drives repeat visits.

---
SLIDE 1 - THE HOOK:
Square 1:1 with maximum visual impact and intrigue.

Background: A beautifully wrapped gift box in luxurious paper (deep green with gold ribbon, or burgundy with silver), slightly open with warm golden light spilling out, suggesting magic inside. Holiday elements surround it—pine branches, ornaments, cinnamon sticks.

Bold, festive typography:
"{{headline}}"
"12 DAYS OF"
"HOLIDAY SPECIALS"
"{{date_range}}"
"Swipe to see what's coming →"

The feeling: Something special is about to happen. You don't want to miss this.

---
SLIDE 2 - DAYS 1-4:
Clean, scannable layout with food photography thumbnails.

"DAYS 1-4"

Day 1: {{day1_special}} — Small circular photo of the dish/drink
Day 2: {{day2_special}} — Small circular photo
Day 3: {{day3_special}} — Small circular photo
Day 4: {{day4_special}} — Small circular photo

Each special has a brief description and the date.
Background: Subtle holiday pattern or solid deep green/burgundy.

---
SLIDE 3 - DAYS 5-8:
Same format, building momentum.

"DAYS 5-8"

Day 5: {{day5_special}}
Day 6: {{day6_special}}
Day 7: {{day7_special}}
Day 8: {{day8_special}}

Perhaps a "HALFWAY THERE!" banner element.

---
SLIDE 4 - DAYS 9-12:
The grand finale specials.

"DAYS 9-12"
"THE GRAND FINALE"

Day 9: {{day9_special}}
Day 10: {{day10_special}}
Day 11: {{day11_special}}
Day 12: {{day12_special}} — This one should be the BIGGEST, most exciting special. Larger photo, more emphasis.

---
SLIDE 5 - CTA:
Final slide driving action.

"{{cta_headline}}"
"📌 SAVE THIS POST"
"🔔 Turn on notifications"
"📍 {{location}}"
"{{final_message}}"

Background: Return to the gift box imagery from slide 1, now fully open with all the "gifts" (food items) spilling out in a magical cascade.

---
DESIGN CONSISTENCY: Same typography, color palette (greens, golds, burgundies), and holiday elements across all slides. Professional, cohesive, campaign-quality.
$PROMPT$,
'v1', TRUE,
'{"style": "countdown_campaign", "holiday_type": "christmas", "slide_count": 5, "visual_complexity": "high", "input_schema": {"required": ["headline", "date_range"], "optional": ["day1_special", "day2_special", "day3_special", "day4_special", "day5_special", "day6_special", "day7_special", "day8_special", "day9_special", "day10_special", "day11_special", "day12_special", "cta_headline", "location", "final_message"], "defaults": {"cta_headline": "Don''t Miss a Single Day", "final_message": "See you for the holidays! 🎄"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "daily anticipation", "save-worthy utility", "campaign cohesion"], "special_types": ["featured dish", "drink special", "dessert feature", "prix fixe menu", "gift card bonus"], "camera_styles": ["gift box hero", "food thumbnail grid", "magical reveal"]}}'::JSONB);

-- 2. Holiday Menu Deep Dive
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-carousel-menu-deep-dive', 'Holiday Menu Deep Dive', 'all_verticals', 'instagram_carousel', 'base',
$PROMPT$
MULTI-SLIDE INSTAGRAM CAROUSEL (4 slides) — A comprehensive showcase of your holiday menu that tells a complete culinary story.

---
SLIDE 1 - THE COVER / APPETIZERS:
Square 1:1, setting the stage and showcasing starters.

THE VISUAL: A stunning spread of holiday appetizers:
- Elegant charcuterie arrangement with seasonal elements
- Soup course in an elegant bowl, steam rising
- Composed salad with winter ingredients (pomegranate, pear, candied nuts)
- Perhaps oysters on ice or shrimp cocktail for luxury

Typography:
"{{headline}}"
"{{menu_title}}"
"HOLIDAY MENU"
"Swipe for the Full Experience →"

"STARTERS"
Brief descriptions of 2-3 appetizer options

Background: Holiday table setting, warm lighting, festive but elegant.

---
SLIDE 2 - MAIN COURSES:
The heroes of the menu.

THE VISUAL: Two or three stunning entrée options:
- Prime rib or beef tenderloin, perfectly cooked, sliced to show doneness
- Roasted turkey or duck with crispy skin, elegant plating
- Seafood option: perhaps lobster tail or pan-seared halibut
- Each with their accompaniments visible

Typography:
"MAIN COURSES"
"{{main1_name}}" — {{main1_description}}
"{{main2_name}}" — {{main2_description}}
"{{main3_name}}" — {{main3_description}}

The mains should look IRRESISTIBLE. This is where the decision is made.

---
SLIDE 3 - DESSERTS:
The sweet finale.

THE VISUAL: Holiday dessert showcase:
- Yule log (Bûche de Noël) with beautiful decoration
- Pumpkin or pecan pie slice with whipped cream
- Chocolate dessert option
- Perhaps a cheese course with honeycomb

Typography:
"SWEET ENDINGS"
"{{dessert1_name}}" — {{dessert1_description}}
"{{dessert2_name}}" — {{dessert2_description}}
"{{dessert3_name}}" — {{dessert3_description}}

The desserts should trigger cravings. The perfect end to the meal.

---
SLIDE 4 - DRINKS & CTA:
Beverage pairings and booking information.

THE VISUAL: Holiday cocktails and wine:
- Signature holiday cocktails
- Wine bottles with elegant labels
- Perhaps hot drinks: mulled wine, spiked cocoa
- Coffee service

Typography:
"HOLIDAY LIBATIONS"
"{{drink_highlights}}"

"{{price_info}}"
"{{availability}}"
"{{reservation_cta}}"

---
DESIGN CONSISTENCY: Cohesive color palette (burgundy, gold, forest green), consistent typography, holiday elements that tie all slides together. Each slide should stand alone but clearly belong to the series.
$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase_carousel", "holiday_type": "christmas", "slide_count": 4, "visual_complexity": "very_high", "input_schema": {"required": ["headline", "menu_title"], "optional": ["main1_name", "main1_description", "main2_name", "main2_description", "main3_name", "main3_description", "dessert1_name", "dessert1_description", "dessert2_name", "dessert2_description", "dessert3_name", "dessert3_description", "drink_highlights", "price_info", "availability", "reservation_cta"], "defaults": {"price_info": "Prix Fixe: $95 per person", "availability": "December 24-25", "reservation_cta": "Reserve Your Table Now"}}, "variation_rules": {"style_adjectives": ["complete menu journey", "course by course", "culinary storytelling", "save-worthy reference"], "menu_styles": ["prix fixe progression", "a la carte highlights", "tasting menu", "family style"], "camera_styles": ["spread showcase", "hero dish focus", "detail close-ups"]}}'::JSONB);

-- 3. "Why Celebrate With Us" Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-carousel-why-celebrate', 'Why Celebrate With Us Feature', 'all_verticals', 'instagram_carousel', 'base',
$PROMPT$
MULTI-SLIDE INSTAGRAM CAROUSEL (3 slides) — A compelling case for choosing your restaurant for holiday celebrations. Sells the complete experience.

---
SLIDE 1 - THE FOOD:
Square 1:1 showcasing culinary excellence.

THE VISUAL: Your most stunning holiday dish or spread:
- A hero shot of your signature holiday offering
- Could be the full feast spread, or one perfect dish
- Steam, glisten, texture—all the food photography excellence
- The image should make viewers HUNGRY

Typography:
"{{headline}}"
"WHY CELEBRATE WITH US"
"Swipe to See →"

"THE FOOD"
"{{food_description}}"

The message: Our food is EXCEPTIONAL. This is not ordinary holiday dining.

---
SLIDE 2 - THE ATMOSPHERE:
The experience beyond the plate.

THE VISUAL: Your restaurant at its holiday best:
- The dining room decorated, tables set, candles lit
- Christmas tree, fireplace, twinkling lights
- The FEELING of the space—warm, welcoming, special
- Perhaps a glimpse of happy diners (backs to camera)

Typography:
"THE ATMOSPHERE"
"{{atmosphere_description}}"

Highlight what makes your space special:
- Historic building? Mention it.
- Fireplace? Feature it.
- View? Show it.
- Live music? Hint at it.

The message: This is a DESTINATION. An experience. A memory in the making.

---
SLIDE 3 - THE SERVICE & CTA:
The human element and call to action.

THE VISUAL: The team and the experience:
- Staff in action: pouring wine, presenting dishes, genuine smiles
- The human warmth that makes hospitality special
- Perhaps a sommelier recommending wine, or a chef greeting guests
- The sense of being CARED FOR

Typography:
"THE SERVICE"
"{{service_description}}"

"{{testimonial}}" — if available, a brief guest quote

"{{cta_headline}}"
"{{availability}}"
"{{reservation_cta}}"
"{{contact_info}}"

The message: You'll be taken care of. This is hospitality at its finest.

---
DESIGN CONSISTENCY: Each slide has the same frame/border treatment, consistent typography, cohesive color palette. The three slides tell a complete story: Food + Atmosphere + Service = The Perfect Holiday Celebration.
$PROMPT$,
'v1', TRUE,
'{"style": "experience_showcase", "holiday_type": "christmas", "slide_count": 3, "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["food_description", "atmosphere_description", "service_description", "testimonial", "cta_headline", "availability", "reservation_cta", "contact_info"], "defaults": {"food_description": "Crafted with Care, Served with Love", "atmosphere_description": "Where Holiday Magic Comes to Life", "service_description": "Hospitality That Feels Like Family", "cta_headline": "Make This Holiday Unforgettable", "availability": "Now Booking Holiday Reservations", "reservation_cta": "Reserve Your Table"}}, "variation_rules": {"style_adjectives": ["complete experience", "three pillars", "compelling case", "decision driver"], "focus_areas": ["food excellence", "atmosphere magic", "service warmth", "value proposition"], "camera_styles": ["food hero", "atmosphere wide", "service action"]}}'::JSONB);

-- ============================================================================
-- END OF HOLIDAY & CHRISTMAS TEMPLATE COLLECTION
-- ============================================================================

-- Summary:
-- Instagram Square (1:1): 12 templates
-- Instagram Stories (9:16): 10 templates  
-- Facebook Posts: 5 templates
-- Carousel/Multi-Image: 3 templates
-- TOTAL: 30 templates
