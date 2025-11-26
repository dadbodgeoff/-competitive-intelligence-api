-- Holiday & Christmas Templates for Bar & Grill
-- 30 templates with extremely high visual expectations for Nano Banana
-- Focused on bar & grill vertical: wings, burgers, beers, TVs, casual festive vibes

-- ============================================================================
-- INSTAGRAM SQUARE (1:1) - 12 TEMPLATES
-- ============================================================================

-- 1. Holiday Wings & Beer Bucket Hero
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-wings-beer-hero', 'Holiday Wings & Beer Bucket Hero', 'bar_grill', 'instagram_square', 'base',
$PROMPT$CINEMATIC SQUARE 1:1 PHOTOGRAPH — Magazine-cover worthy bar & grill holiday hero shot. This is what holiday gatherings at your favorite neighborhood spot LOOK like.

THE HERO WINGS: A massive oval platter overflowing with 30+ perfectly glazed wings arranged in two distinct sections. One half glistens with a rich cranberry-bourbon glaze—deep ruby red with caramelized edges, you can see the sticky sauce pooling. The other half showcases classic buffalo with that iconic orange-red sheen, sauce clinging to every crispy crevice. Steam rises subtly from the pile. The wings show TEXTURE—crispy skin visible through the glaze, char marks from the fryer, meat pulling away from the bone slightly. Celery and carrot sticks fan out on one side, three ramekins of blue cheese and ranch with visible herbs.

THE BEER SPREAD: A galvanized steel bucket packed with crushed ice, 6 craft beer bottles emerging at angles—condensation streaming down the glass, labels partially visible but not the focus. Beside it, TWO frosty pint glasses of amber ale, perfect 1-inch heads, the glass so cold it's frosted white at the base, beads of moisture catching the light. The beer GLOWS golden-amber in the warm bar lighting like liquid treasure.

THE BAR SETTING: A weathered oak bar top with decades of character—you can see the grain, the patina, maybe a few ring marks that tell stories. The wood is warm-toned, slightly sticky-looking in the best way.

BACKGROUND (soft focus, f/2.0 bokeh):
- Three TV screens showing holiday sports, their blue-white glow adding atmosphere
- String lights draped along the bar back, creating circular bokeh orbs
- Garland with red bows wrapped around beer tap handles
- A vintage neon "OPEN" sign casting pink-red glow
- Blurred figures of happy patrons, motion blur suggesting laughter and movement
- Bottles backlit on shelves creating amber silhouettes

HOLIDAY TOUCHES (authentic, not overdone):
- Red and green cocktail napkins in a chrome holder
- A small potted Norfolk pine with a single strand of lights on the bar
- Candy canes in a pint glass
- A Santa hat casually draped over a tap handle

LIGHTING MASTERCLASS: This is BAR LIGHTING perfected—warm tungsten 2700K from vintage fixtures overhead creating pools of golden light, the cool blue glow of TV screens adding contrast, neon signs casting colored edges, string lights adding sparkle points throughout the bokeh. The wings and beer are KEY LIT to look absolutely irresistible—slightly backlit to show the steam, front-lit to show the glaze texture.

TYPOGRAPHY ZONE (lower third, bold but not blocking food):

"{{headline}}"

"{{wing_special}}"
"{{beer_deal}}"

"{{holiday_hours}}"

EMOTIONAL IMPACT: This image screams "THIS is where you want to be." Cold beer, hot wings, good friends, holiday vibes without the pretension. It's not fancy—it's BETTER than fancy. It's YOUR spot, dressed up just enough for the season.

TECHNICAL SPECS: Shot with 50mm f/1.8 equivalent, focused on the wing platter with beer bucket in mid-ground. Depth of field creates creamy background blur while keeping hero elements tack-sharp. Color grading emphasizes warm ambers, rich reds, and golden tones. Slight vignette draws eye to center. No artificial HDR look—this is REAL bar photography elevated.$PROMPT$,
'v1', TRUE,
'{"style": "bar_grill_holiday_hero", "holiday_type": "christmas", "food_focus": "wings_beer", "visual_complexity": "very_high", "input_schema": {"required": ["headline", "wing_special"], "optional": ["beer_deal", "holiday_hours"], "defaults": {"beer_deal": "Bucket Specials All Season", "holiday_hours": "Open Christmas Eve til 10pm"}}, "variation_rules": {"style_adjectives": ["magazine-worthy bar shot", "warm tungsten atmosphere", "friends gathering energy", "authentic holiday casual"], "wing_flavors": ["cranberry-bourbon glaze", "honey-sriracha holiday", "garlic parmesan snow", "classic buffalo"], "beer_styles": ["craft bucket variety", "domestic bucket", "seasonal ale flight", "local brewery feature"], "lighting_moods": ["warm bar tungsten", "neon accent glow", "TV screen ambiance", "string light bokeh"]}}'::JSONB);

-- 2. Holiday Burger & Craft Beer Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-burger-craft', 'Holiday Burger & Craft Beer Feature', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The ultimate bar & grill comfort food elevated for the holidays. This burger is a GIFT.

THE HERO BURGER: A towering double-patty masterpiece on a brioche bun that glistens with butter. The construction from bottom up: toasted bottom bun with visible grill marks, special sauce spreading to the edges, crisp iceberg lettuce, thick-cut tomato, TWO smashed patties with crispy lacy edges and perfect Maillard crust, MOLTEN American cheese draped over each patty creating cheese waterfalls down the sides, caramelized onions piled high, three strips of thick-cut bacon with visible fat marbling, a crown of crispy onion strings, top bun with sesame seeds catching the light. A wooden skewer with a small flag or pick holds it together. The burger is CUT IN HALF, revealing the cross-section: you can see the medium-pink interior of the beef, the cheese pull stretching between the halves, the sauce dripping down.

THE BEER PAIRING: A tulip glass of rich, dark winter ale or porter beside the burger—the beer is nearly black with a tan head, condensation on the glass. Alternatively, a copper-colored seasonal amber in a proper pint glass. The beer COMPLEMENTS the burger visually.

THE PLATE: Served on a wooden board or metal tray lined with parchment paper. A generous pile of hand-cut fries with visible potato skin edges, seasoned with herbs and coarse salt, some standing upright against the burger. A small ramekin of house-made aioli or special sauce.

THE SETTING: Dark wood table or bar top. Background shows the bar atmosphere in soft focus—bottles, TVs, string lights, the warm glow of a neighborhood spot during the holidays.

HOLIDAY ELEMENTS:
- A sprig of rosemary tucked next to the burger (herb garnish that reads "holiday")
- Red and green napkin visible at edge of frame
- Warm string light bokeh in background
- Maybe a small wrapped gift box or ornament as prop

LIGHTING: Dramatic side lighting creating shadows that show the burger's HEIGHT and TEXTURE. Warm color temperature. The cheese should GLOW. The beer should look refreshing. Steam or heat haze optional but effective.

TYPOGRAPHY:

"{{headline}}"

"{{burger_name}}"
"{{burger_description}}"

"{{price_info}}"

This image makes you CRAVE. It's indulgent, it's satisfying, it's exactly what you want on a cold December night.$PROMPT$,
'v1', TRUE,
'{"style": "burger_hero_dramatic", "holiday_type": "christmas", "food_focus": "burger_beer", "visual_complexity": "high", "input_schema": {"required": ["headline", "burger_name"], "optional": ["burger_description", "price_info"], "defaults": {"burger_description": "Double smashed patties, aged cheddar, bacon, caramelized onions", "price_info": "Limited Time Holiday Menu"}}, "variation_rules": {"style_adjectives": ["dramatic side-lit", "cheese pull glory", "indulgent comfort", "craft pairing"], "burger_styles": ["double smash", "classic stack", "bacon tower", "mushroom swiss"], "beer_pairings": ["winter porter", "amber ale", "craft lager", "seasonal stout"]}}'::JSONB);

-- 3. Loaded Holiday Nachos Spectacular
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-loaded-nachos', 'Loaded Holiday Nachos Spectacular', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The ultimate shareable bar food, holiday edition. This nacho platter is OBSCENE in the best way.

THE NACHO MOUNTAIN: An oversized oval platter or cast iron skillet OVERFLOWING with loaded nachos. This is architectural—built UP, not just spread flat. Layers upon layers:

BASE: House-made tortilla chips, some whole, some broken, creating texture variety. You can see the salt crystals and lime zest on them.

THE PROTEIN: Generous portions of slow-smoked pulled pork with a HOLIDAY TWIST—glazed with a cranberry-chipotle BBQ sauce that's deep red-brown and glossy. Visible bark pieces. OR braised short rib with red wine reduction. The meat is PILED, not sprinkled.

THE CHEESE: Three-cheese blend MELTED to perfection—you can see the STRETCH, the pull, cheese bridges connecting chip to chip. Some spots have that perfect golden-brown broiled cheese crisp. Queso drizzled over the top, still steaming.

THE TOPPINGS (abundant, colorful):
- Fresh pico de gallo with visible tomato chunks, white onion, cilantro
- Sliced jalapeños (pickled AND fresh)
- Black beans scattered throughout
- Dollops of sour cream (at least 5-6 visible)
- Guacamole in generous scoops, bright green
- Pickled red onions adding pink color pops
- Fresh cilantro leaves scattered on top
- A drizzle of chipotle crema in artistic lines

THE PRESENTATION: Served on a wooden board or directly on the bar top with parchment underneath. Lime wedges on the side. Maybe a small bowl of extra salsa.

BACKGROUND: Bar atmosphere—someone's hand reaching for a chip (showing scale and creating action), beer glasses visible, TV glow, string lights.

LIGHTING: Overhead with fill—showing the HEIGHT of the nacho pile, the glossy cheese, the steam rising. Warm tones throughout.

TYPOGRAPHY:

"{{headline}}"

"{{nacho_name}}"
"{{description}}"

"{{sharing_note}}"

This image is ABUNDANCE. It's "we're all sharing this." It's the centerpiece of the table that everyone gathers around.$PROMPT$,
'v1', TRUE,
'{"style": "shareable_abundance", "holiday_type": "christmas", "food_focus": "nachos", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["nacho_name", "description", "sharing_note"], "defaults": {"nacho_name": "Holiday Loaded Nachos", "description": "Cranberry-chipotle pulled pork, three-cheese blend, all the fixings", "sharing_note": "Perfect for sharing (or not, we don''t judge)"}}, "variation_rules": {"style_adjectives": ["mountain of abundance", "cheese pull glory", "shareable feast", "bar food elevated"], "protein_options": ["cranberry-chipotle pulled pork", "braised short rib", "smoked brisket", "beer-braised chicken"], "cheese_styles": ["three-cheese blend", "queso flood", "smoked gouda feature", "pepper jack heat"]}}'::JSONB);


-- 4. Spiked Holiday Cocktails Lineup
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-cocktail-lineup', 'Spiked Holiday Cocktails Lineup', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — A stunning lineup of holiday cocktails that makes everyone want to order all of them. Bar & grill drinks done FESTIVE.

THE LINEUP (4 cocktails arranged in a slight arc, each distinct):

1. SPIKED HOT COCOA (far left): Clear glass Irish coffee mug so you can see the layers—dark chocolate at bottom, creamy cocoa above, MOUNTAIN of fresh whipped cream on top. Chocolate sauce drizzled artistically. Mini marshmallows (some toasted golden). A full candy cane hooked on the rim. Steam rising visibly. A mini bottle of Baileys or Kahlua positioned beside it.

2. CRANBERRY MOSCOW MULE (center left): Copper mug FROSTED with condensation, ice visible at top. Garnished with a skewer of fresh cranberries (red jewels), a lime wheel, and a sprig of rosemary. The drink itself is pink-red, festive and bright.

3. BOOZY EGGNOG (center right): Rocks glass with the creamy, pale yellow nog. Freshly grated nutmeg visible on top. A cinnamon stick stirrer. The glass has a sugared rim with gold sugar crystals. Rich, indulgent, classic.

4. PEPPERMINT MARTINI (far right): Elegant martini glass with a candy cane-striped rim (crushed peppermint). The drink is creamy white/pink. Garnished with a mini candy cane and chocolate shavings. A few crushed peppermint pieces floating.

THE BAR SETTING: The cocktails are arranged on a dark wood or black granite bar top. Behind them, the bar back is visible in soft focus—bottles with holiday ribbon tied around them, string lights, garland, maybe a small Christmas tree on the back bar.

LIGHTING: Backlit slightly to make the drinks GLOW. Each cocktail catches the light differently—the copper mug reflects warm light, the martini glass sparkles, the cocoa steam catches light beautifully. Warm overall with cool accent from any blue bottles in background.

PROPS: Scattered cranberries, cinnamon sticks, candy cane pieces on the bar surface. A cocktail napkin with holiday print.

TYPOGRAPHY:

"{{headline}}"

"{{cocktail_menu_title}}"

"{{price_info}}"

"{{availability}}"

This image is CELEBRATION. It's "which one are you getting?" It's the reason you came out instead of staying home.$PROMPT$,
'v1', TRUE,
'{"style": "cocktail_lineup_festive", "holiday_type": "christmas", "food_focus": "drinks", "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["cocktail_menu_title", "price_info", "availability"], "defaults": {"cocktail_menu_title": "Holiday Cocktail Menu", "price_info": "$10-12 Each", "availability": "Available Through New Year''s"}}, "variation_rules": {"style_adjectives": ["glowing backlit drinks", "festive lineup", "bar celebration", "cocktail artistry"], "cocktail_options": ["spiked cocoa", "cranberry mule", "boozy eggnog", "peppermint martini", "hot toddy", "mulled wine"], "presentation_styles": ["lineup arc", "triangle arrangement", "single hero", "flight board"]}}'::JSONB);

-- 5. Game Day Holiday Watch Party
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-gameday-holiday', 'Game Day Holiday Watch Party', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — Where sports and holidays COLLIDE. The ultimate bar & grill December scene.

THE TV WALL: Multiple large screens visible (3-5), showing football or basketball. The screens provide that iconic blue-white glow that defines sports bar atmosphere. One screen might show a holiday bowl game graphic or festive sports content.

THE FOOD SPREAD (foreground, in focus): A high-top table loaded with game day AND holiday favorites:
- A platter of wings (half traditional buffalo, half holiday cranberry glaze)
- A bucket of beers on ice, bottles emerging
- A basket of loaded potato skins with bacon and chive
- Soft pretzel bites with beer cheese dip
- A few pint glasses of beer, condensation dripping

THE CROWD ENERGY: In the mid-ground, you can see other patrons—backs of heads, raised arms cheering, the blur of movement. People wearing team jerseys AND Santa hats. The energy is PALPABLE.

HOLIDAY DECORATIONS MEETING SPORTS:
- Garland wrapped around the TV mounting brackets
- String lights along the ceiling
- A small Christmas tree in the corner with sports ornaments
- Red and green mixed with team colors
- Staff wearing Santa hats or elf ears

THE BAR ITSELF: Visible in the background—bottles backlit, taps ready, bartenders in motion. The bar back has garland and lights.

LIGHTING: The complex, beautiful lighting of a sports bar during the holidays—TV glow (cool), bar lighting (warm), string lights (sparkle), neon signs (color accents). It all comes together in that specific atmosphere you can FEEL.

TYPOGRAPHY:

"{{headline}}"

"{{game_info}}"

"{{specials}}"

"{{cta}}"

This image captures a MOMENT. It's the roar of the crowd, the clink of glasses, the holidays spent exactly where you want to be—with your people, watching the game, eating great food.$PROMPT$,
'v1', TRUE,
'{"style": "sports_holiday_fusion", "holiday_type": "christmas", "food_focus": "appetizers_beer", "visual_complexity": "very_high", "input_schema": {"required": ["headline"], "optional": ["game_info", "specials", "cta"], "defaults": {"game_info": "Every Game · Every Screen", "specials": "Holiday Game Day Specials", "cta": "Your Crew is Already Here"}}, "variation_rules": {"style_adjectives": ["sports bar energy", "holiday fusion", "crowd excitement", "TV glow atmosphere"], "sports_events": ["holiday bowl games", "NBA Christmas", "NFL playoffs", "college football"], "food_combos": ["wings and buckets", "nachos and pitchers", "sliders and shots", "appetizer sampler"]}}'::JSONB);

-- 6. Holiday Happy Hour Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-happy-hour', 'Holiday Happy Hour Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The after-work holiday escape. Happy hour elevated for the season.

THE SCENE: A cozy corner of the bar during that golden 4-7pm window. The light outside the windows (if visible) is that late afternoon winter glow—blue hour approaching.

THE DRINKS (hero focus): A beautiful arrangement of happy hour offerings:
- Two craft beers in proper glassware, one amber, one darker, both with perfect heads
- A classic margarita with salted rim and lime, served in a festive red-rimmed glass
- A glass of red wine, rich and inviting
- Maybe a shot of whiskey neat, amber and glowing

THE FOOD: Happy hour appetizers arranged nearby:
- A small plate of crispy fried pickles with ranch
- Spinach artichoke dip in a small skillet with tortilla chips
- A few sliders on a small board
- Bowl of seasoned nuts

THE SETTING: The bar top is warm wood, worn in the right places. A happy hour menu or table tent is visible. The background shows the bar decorated for holidays—subtle but present. Other patrons visible as warm blurs, the after-work crowd unwinding.

HOLIDAY TOUCHES:
- String lights reflecting in the glassware
- A small poinsettia plant on the bar
- Red napkins
- Maybe someone in the background wearing a holiday sweater

LIGHTING: That perfect happy hour light—warm, golden, the day transitioning to evening. The drinks catch the light beautifully. Cozy and inviting.

TYPOGRAPHY:

"{{headline}}"

"{{happy_hour_times}}"

"{{drink_specials}}"

"{{food_specials}}"

This image is RELIEF. It's the exhale after a long day. It's "I deserve this." It's the holidays done right—no stress, just good drinks and good vibes.$PROMPT$,
'v1', TRUE,
'{"style": "happy_hour_cozy", "holiday_type": "christmas", "food_focus": "appetizers_drinks", "visual_complexity": "medium", "input_schema": {"required": ["headline", "happy_hour_times"], "optional": ["drink_specials", "food_specials"], "defaults": {"drink_specials": "$5 Drafts · $6 Wells · $7 Wine", "food_specials": "Half-Price Apps"}}, "variation_rules": {"style_adjectives": ["after-work relief", "golden hour cozy", "holiday unwind", "casual elegance"], "drink_focuses": ["craft beer flight", "wine selection", "cocktail trio", "beer and shot"], "food_options": ["fried apps", "dip trio", "slider sampler", "wings"]}}'::JSONB);

-- 7. Holiday Brunch at the Bar
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-brunch', 'Holiday Brunch at the Bar', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — Weekend brunch, bar & grill style, with holiday flair. This isn't your fancy brunch—it's BETTER.

THE HERO PLATE: A massive brunch platter that means business:
- Three eggs cooked to order (over-medium, yolks intact and ready to run)
- A pile of crispy hash browns, golden and shredded, some pieces extra crispy
- Four strips of thick-cut bacon, perfectly rendered, fat glistening
- Two fat sausage links, grilled with char marks
- A short stack of fluffy pancakes with a pat of butter melting down the sides
- A small pitcher of warm maple syrup

THE DRINKS: The essential brunch beverages:
- A Bloody Mary in a tall glass, loaded with garnishes—celery, bacon strip, pickle spear, olives, maybe a slider on top. The drink is deep red, spicy-looking.
- A mimosa in a champagne flute, bright orange and bubbly
- A mug of hot coffee, steam rising

THE SETTING: A booth or table near the bar. Morning light coming through windows (if applicable). The bar visible in background, quieter than evening but still alive. TVs might show morning sports or holiday programming.

HOLIDAY ELEMENTS:
- A small wrapped gift box as table decor
- Red and green napkins
- Maybe a mini Christmas tree centerpiece
- String lights visible in background
- Staff in Santa hats

LIGHTING: Bright but warm—morning light mixed with interior warmth. The food should look FRESH, just out of the kitchen. Eggs should glisten, bacon should shine.

TYPOGRAPHY:

"{{headline}}"

"{{brunch_hours}}"

"{{brunch_special}}"

"{{bottomless_deal}}"

This image is WEEKEND. It's sleeping in then treating yourself. It's the holidays without the pressure—just good food, good drinks, good times.$PROMPT$,
'v1', TRUE,
'{"style": "weekend_brunch_hearty", "holiday_type": "christmas", "food_focus": "brunch", "visual_complexity": "high", "input_schema": {"required": ["headline", "brunch_hours"], "optional": ["brunch_special", "bottomless_deal"], "defaults": {"brunch_special": "The Full Send Brunch Platter $16", "bottomless_deal": "Bottomless Mimosas $15"}}, "variation_rules": {"style_adjectives": ["hearty weekend fuel", "morning indulgence", "bar brunch vibes", "holiday morning"], "brunch_styles": ["full platter", "eggs benedict", "chicken and waffles", "breakfast burrito"], "drink_options": ["bloody mary bar", "mimosa flight", "irish coffee", "spiked cider"]}}'::JSONB);


-- 8. Holiday Gift Card Promotion
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-gift-card', 'Holiday Gift Card Promotion', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The perfect gift for the bar & grill lover in your life. Gift cards made GIFTABLE.

THE HERO: A physical gift card (or stack of 2-3) displayed beautifully. The card design should suggest bar & grill vibes—maybe featuring a beer mug, wings, or the restaurant logo. The cards are arranged on a festive surface, perhaps:
- Nestled in a small gift box with tissue paper
- Arranged with a red ribbon bow
- Displayed in a kraft paper envelope with holiday stamps

THE SETTING: A bar top or wooden surface with holiday props:
- Pine branches and pine cones arranged artfully
- A few small wrapped presents
- String lights creating bokeh in background
- Maybe a beer glass or cocktail partially visible (suggesting what the gift card buys)
- Scattered cranberries or small ornaments
- A handwritten gift tag that says "Cheers!" or "To: Beer Lover"

THE ATMOSPHERE: Warm, gift-giving energy. The bar is visible in soft focus behind—bottles, lights, the promise of good times. This is a GIFT that people actually WANT.

LIGHTING: Warm and inviting, holiday-appropriate. The gift card should be clearly visible and readable. Soft shadows, golden tones.

TYPOGRAPHY (prominent, sales-focused):

"{{headline}}"

"{{bonus_offer}}"

"{{gift_card_amounts}}"

"{{purchase_cta}}"

"{{expiration_note}}"

This image solves the "what do I get them?" problem. It's the gift that says "I know you, and I know you'd rather have wings and beer than another sweater."$PROMPT$,
'v1', TRUE,
'{"style": "gift_card_festive", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "medium", "input_schema": {"required": ["headline", "bonus_offer"], "optional": ["gift_card_amounts", "purchase_cta", "expiration_note"], "defaults": {"gift_card_amounts": "$25 · $50 · $100", "purchase_cta": "Available In-Store & Online", "expiration_note": "Bonus offer valid through 12/24"}}, "variation_rules": {"style_adjectives": ["gift-giving warmth", "holiday shopping solved", "bar lover perfect gift", "festive presentation"], "bonus_types": ["buy $50 get $10 free", "buy $100 get $25 free", "free appetizer with purchase", "bonus card included"], "presentation_styles": ["gift box display", "ribbon wrapped", "envelope style", "stack arrangement"]}}'::JSONB);

-- 9. New Year's Eve Countdown Party
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-nye-party', 'New Year''s Eve Countdown Party', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The NYE party you actually want to go to. No fancy dress code, no pretension—just your favorite bar going ALL OUT.

THE SCENE: The bar is TRANSFORMED for New Year's Eve. Maximum festive energy.

THE DRINKS (hero focus): Champagne and celebration drinks front and center:
- Multiple champagne flutes filled with bubbly, bubbles visibly rising
- A bottle of champagne (or sparkling wine) in an ice bucket, label partially visible
- Maybe some champagne being POURED, frozen mid-action, the golden liquid cascading
- Festive cocktails in the background—something with gold shimmer or sparkle

THE DECORATIONS: NYE at a bar & grill means:
- "2026" balloons or signage (use {{new_year}} placeholder)
- Gold and silver streamers
- Confetti scattered on the bar (some mid-air if possible)
- Party hats, noisemakers, those curly blower things
- A disco ball reflection or sparkle effect
- Countdown clock graphic element
- Black, gold, and silver color scheme

THE CROWD: People visible in background—dressed up but not formal, excited energy, maybe someone wearing a "Happy New Year" tiara or glasses shaped like the year.

THE BAR: Decorated to the max. Bottles with gold ribbon, staff in festive attire, TVs showing the ball drop countdown or NYE programming.

LIGHTING: Dramatic and celebratory—lots of sparkle, maybe some uplighting in gold, the champagne catching light beautifully. More dramatic than typical bar lighting.

TYPOGRAPHY:

"{{headline}}"

"NEW YEAR'S EVE"
"{{event_date}}"

"{{party_details}}"

"{{ticket_info}}"

"{{countdown_time}}"

This image is ANTICIPATION. It's the best night of the year at the best place to spend it. No velvet ropes, no attitude—just celebration.$PROMPT$,
'v1', TRUE,
'{"style": "nye_celebration", "holiday_type": "new_years", "food_focus": "drinks", "visual_complexity": "very_high", "input_schema": {"required": ["headline", "event_date"], "optional": ["party_details", "ticket_info", "countdown_time", "new_year"], "defaults": {"party_details": "DJ · Champagne Toast · Party Favors", "ticket_info": "No Cover · No Reservations Required", "countdown_time": "Countdown at Midnight", "new_year": "2026"}}, "variation_rules": {"style_adjectives": ["celebration explosion", "champagne sparkle", "countdown energy", "party atmosphere"], "drink_focuses": ["champagne tower", "bubbly pour", "cocktail sparkle", "toast moment"], "decor_styles": ["balloon arch", "confetti explosion", "disco glam", "gold and black"]}}'::JSONB);

-- 10. Cozy Winter Comfort Food
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-comfort-food', 'Cozy Winter Comfort Food', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — When it's cold outside, this is what you NEED. Bar & grill comfort food at its finest.

THE HERO DISH: A steaming bowl or plate of ultimate comfort—choose one:

OPTION A - LOADED CHILI: A deep bowl of house-made chili, thick and hearty, topped with shredded cheddar cheese melting into it, a dollop of sour cream, diced onions, and sliced jalapeños. Served with a side of cornbread, butter melting on top. Steam rising visibly.

OPTION B - POT PIE: A personal-sized chicken pot pie in a cast iron skillet, golden puff pastry top with a crack showing the creamy filling beneath. Steam escaping. Served with a side salad.

OPTION C - MAC & CHEESE: A skillet of baked mac and cheese with a golden-brown breadcrumb crust, cheese bubbling at the edges. Maybe topped with pulled pork or bacon. A spoon digging in, showing the cheese pull.

THE SETTING: A cozy booth or table. Outside the window (if visible), you can see it's cold—maybe snow, maybe just grey winter sky. Inside is WARM. A beer or hot drink beside the food. Warm lighting, the feeling of refuge from the cold.

HOLIDAY/WINTER TOUCHES:
- A candle on the table
- Warm wood tones everywhere
- Maybe a fireplace visible in background (if the bar has one)
- String lights
- Cozy textures—flannel napkin, rustic dishware

LIGHTING: Warm, golden, COZY. The food should look hot and steaming. The whole image should make you feel warm just looking at it.

TYPOGRAPHY:

"{{headline}}"

"{{dish_name}}"
"{{dish_description}}"

"{{comfort_tagline}}"

This image is a HUG. It's coming in from the cold. It's exactly what you need on a winter day.$PROMPT$,
'v1', TRUE,
'{"style": "winter_comfort_cozy", "holiday_type": "winter", "food_focus": "comfort_food", "visual_complexity": "medium", "input_schema": {"required": ["headline", "dish_name"], "optional": ["dish_description", "comfort_tagline"], "defaults": {"dish_description": "House-made, soul-warming, perfect for cold days", "comfort_tagline": "Warm Up With Us"}}, "variation_rules": {"style_adjectives": ["soul-warming comfort", "cozy refuge", "winter essential", "hearty satisfaction"], "dish_options": ["loaded chili", "chicken pot pie", "baked mac and cheese", "beef stew", "french onion soup"], "setting_styles": ["window booth", "bar seat", "cozy corner", "fireplace adjacent"]}}'::JSONB);

-- 11. Holiday Appetizer Sampler
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-app-sampler', 'Holiday Appetizer Sampler', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — Can't decide? Get them ALL. The ultimate shareable appetizer spread.

THE SAMPLER PLATTER: A large wooden board, slate, or oversized plate featuring a VARIETY of bar favorites:

SECTION 1 - WINGS: 6-8 wings, half buffalo, half BBQ or holiday glaze. Celery, carrot, blue cheese cup.

SECTION 2 - MOZZARELLA STICKS: 4-5 golden fried mozzarella sticks, one broken open showing the cheese pull. Marinara cup beside them.

SECTION 3 - LOADED POTATO SKINS: 4 potato skin halves loaded with cheese, bacon, sour cream, chives.

SECTION 4 - ONION RINGS: A small stack of beer-battered onion rings, golden and crispy. Ranch or special sauce.

SECTION 5 - SPINACH DIP: A small cast iron or bread bowl with creamy spinach artichoke dip, tortilla chips fanned around it.

CENTER: A small ramekin of house sauce or extra dipping options.

THE PRESENTATION: Everything arranged for visual appeal AND functionality—you can see each item clearly, nothing is hidden. The board is FULL but organized. Garnishes of parsley or herbs add color pops.

THE SETTING: Bar table or high-top. Multiple hands reaching in from different angles (showing it's for SHARING). Beer glasses visible. The bar atmosphere in background.

HOLIDAY TOUCHES:
- Red and green garnishes where appropriate
- Festive napkins
- String lights in bokeh background
- Maybe a small holiday decoration on the table

LIGHTING: Even, appetizing lighting that shows off each item. Everything should look hot, fresh, crispy, melty as appropriate.

TYPOGRAPHY:

"{{headline}}"

"{{sampler_name}}"
"{{item_list}}"

"{{price}}"
"{{sharing_note}}"

This image is DECISION PARALYSIS SOLVED. It's "let's just get the sampler." It's the table centerpiece everyone gathers around.$PROMPT$,
'v1', TRUE,
'{"style": "sampler_abundance", "holiday_type": "christmas", "food_focus": "appetizers", "visual_complexity": "high", "input_schema": {"required": ["headline", "sampler_name"], "optional": ["item_list", "price", "sharing_note"], "defaults": {"item_list": "Wings · Mozz Sticks · Potato Skins · Onion Rings · Spinach Dip", "price": "$24.99", "sharing_note": "Perfect for 3-4 people"}}, "variation_rules": {"style_adjectives": ["variety abundance", "shareable feast", "decision solved", "bar favorites collection"], "sampler_combos": ["classic combo", "wing-focused", "fried favorites", "dip trio"], "presentation_styles": ["wooden board", "divided platter", "slate display", "basket arrangement"]}}'::JSONB);

-- 12. Festive Dessert & After-Dinner Drinks
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-sq-dessert-drinks', 'Festive Dessert & After-Dinner Drinks', 'bar_grill', 'instagram_square', 'base',
$PROMPT$SQUARE 1:1 PHOTOGRAPH — The perfect ending to a holiday meal at the bar. Dessert and drinks that make you stay for "just one more."

THE DESSERT: Bar & grill desserts done festive:
- A warm brownie sundae: rich chocolate brownie, vanilla ice cream melting over it, hot fudge drizzle, whipped cream, cherry on top. Served in a cast iron skillet or on a plate.
- OR: A slice of holiday pie (pumpkin, pecan, or apple) with a scoop of ice cream and caramel drizzle
- OR: Fried cheesecake bites dusted with powdered sugar, raspberry sauce for dipping

THE DRINKS: After-dinner indulgence:
- An Irish Coffee in a clear glass mug—layers visible, whipped cream on top, steam rising
- OR: A glass of bourbon or whiskey, neat, amber and glowing
- OR: A dessert cocktail—chocolate martini, salted caramel shot, or peppermint something

THE PAIRING: The dessert and drink are positioned together, clearly a PAIR. They complement each other visually and conceptually.

THE SETTING: A cozy corner of the bar, end of the night vibes. Warm lighting, intimate feeling. Maybe other empty plates visible suggesting a meal just finished. The bar in soft focus behind.

HOLIDAY TOUCHES:
- Powdered sugar "snow" on the dessert
- Peppermint or candy cane garnish
- Cinnamon stick in the drink
- Warm string lights
- A small candle

LIGHTING: Warm, intimate, indulgent. The dessert should look DECADENT. The drink should glow. This is the reward.

TYPOGRAPHY:

"{{headline}}"

"{{dessert_name}}"
"{{drink_pairing}}"

"{{price_info}}"

This image is INDULGENCE. It's "we're not leaving yet." It's the sweet ending to a great night.$PROMPT$,
'v1', TRUE,
'{"style": "dessert_indulgence", "holiday_type": "christmas", "food_focus": "dessert_drinks", "visual_complexity": "medium", "input_schema": {"required": ["headline"], "optional": ["dessert_name", "drink_pairing", "price_info"], "defaults": {"dessert_name": "Warm Brownie Sundae", "drink_pairing": "Paired with Irish Coffee", "price_info": "Dessert + Drink $14"}}, "variation_rules": {"style_adjectives": ["indulgent ending", "sweet reward", "after-dinner treat", "stay longer vibes"], "dessert_options": ["brownie sundae", "holiday pie", "fried cheesecake", "molten lava cake"], "drink_pairings": ["irish coffee", "bourbon neat", "dessert martini", "port wine"]}}'::JSONB);


-- ============================================================================
-- INSTAGRAM STORIES (9:16) - 10 TEMPLATES
-- ============================================================================

-- 13. Holiday Party Countdown Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-party-countdown', 'Holiday Party Countdown', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Urgency meets bar & grill energy. The "don't miss the party" moment.

THE SCENE: The bar is READY. Shot from behind the bar looking out, or from a prime spot showing the full setup:
- The bar top gleaming, freshly wiped, glasses lined up
- Holiday cocktails pre-batched and ready in pitchers
- Garland and lights everywhere
- TVs showing holiday content
- Staff in Santa hats doing final prep

THE ENERGY: Anticipation. The calm before the storm. You can FEEL that this place is about to go off.

FOCAL POINT: A row of festive cocktails lined up on the bar—cranberry red, champagne gold, mint green—backlit and GLOWING. Or a champagne tower being built. Something that says "PARTY."

BACKGROUND DETAILS:
- String lights creating vertical lines of bokeh
- The bar back decorated with garland and ribbon
- A "Happy Holidays" or event banner
- Other staff moving with purpose (motion blur)

LIGHTING: Warm bar lighting with holiday sparkle. The cocktails should glow. Neon signs add color. It's inviting and exciting.

TYPOGRAPHY (bold, creating FOMO):

"{{headline}}"

"HOLIDAY PARTY"
"{{event_date}}"

"{{party_time}}"

"{{specials_teaser}}"

"{{rsvp_note}}"

SPACE FOR: Instagram countdown sticker placement in the design.

This story makes viewers think: "I NEED to be there. This is THE spot."$PROMPT$,
'v1', TRUE,
'{"style": "party_countdown_urgency", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "event_date"], "optional": ["party_time", "specials_teaser", "rsvp_note"], "defaults": {"party_time": "8pm - Close", "specials_teaser": "Drink Specials All Night", "rsvp_note": "No Cover · Just Show Up"}}, "variation_rules": {"style_adjectives": ["anticipation energy", "bar ready shot", "FOMO inducing", "party prep vibes"], "focal_points": ["cocktail lineup", "champagne setup", "decorated bar", "staff prep"]}}'::JSONB);

-- 14. Daily Holiday Special Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-daily-special', 'Daily Holiday Special', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Today's special, holiday edition. Quick, appetizing, action-driving.

THE HERO: A single dish or drink, shot to PERFECTION, taking up the majority of the frame:
- Could be today's featured holiday cocktail, garnished beautifully, condensation visible
- Could be a holiday-themed food special—cranberry glazed wings, peppermint dessert, seasonal burger
- The item is CENTERED and DOMINANT in the frame

THE STYLING: Minimal but impactful:
- Clean background or bar setting in soft focus
- Maybe a hand holding the drink or reaching for the food (adds human element)
- Holiday props minimal—a candy cane, some cranberries, a pine sprig
- The focus is 100% on the SPECIAL

LIGHTING: Dramatic, appetizing. Side light or backlight to create depth. The special should look IRRESISTIBLE.

TYPOGRAPHY (clear, scannable):

"{{day_label}}" (e.g., "TUESDAY SPECIAL")

"{{headline}}"

"{{special_name}}"
"{{special_description}}"

"{{price}}"

"{{availability}}" (e.g., "Today Only" or "While Supplies Last")

DESIGN: Clean, modern, the food/drink is the star. Maybe a subtle holiday border or frame element.

This story is QUICK IMPACT. Scroll, see, want, come in.$PROMPT$,
'v1', TRUE,
'{"style": "daily_special_hero", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "special_name", "price"], "optional": ["day_label", "special_description", "availability"], "defaults": {"day_label": "TODAY''S SPECIAL", "special_description": "Limited time holiday favorite", "availability": "Available Today Only"}}, "variation_rules": {"style_adjectives": ["hero focus", "quick impact", "appetizing simplicity", "daily urgency"], "special_types": ["holiday cocktail", "seasonal dish", "featured beer", "dessert special"]}}'::JSONB);

-- 15. Behind the Scenes Kitchen/Bar Prep
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-bts-prep', 'Behind the Scenes Holiday Prep', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Authentic behind-the-scenes content. Show the WORK that goes into the holiday magic.

THE SCENE (choose one or combine):

KITCHEN ACTION:
- A cook plating wings, sauce being drizzled
- Burgers on the flat top, cheese being laid on
- Prep work—vegetables being chopped, sauces being made
- The pass with tickets hanging, food ready to go out

BAR PREP:
- Bartender crafting a holiday cocktail, mid-pour or mid-shake
- Garnish prep—cutting citrus, skewering cranberries
- Bottles being arranged, bar being set up
- Ice being scooped, glasses being frosted

THE VIBE: Real, authentic, not overly polished. This is the WORK. Show hands, motion blur, the energy of a working kitchen/bar. Staff might be wearing Santa hats or holiday aprons.

HOLIDAY ELEMENTS:
- Holiday music playing (implied—maybe a speaker visible)
- Decorations visible in the background
- Festive ingredients—cranberries, peppermint, seasonal items
- Staff in holiday spirit

LIGHTING: Natural kitchen/bar lighting. Not overly styled—this is REAL. Maybe slightly warm-graded for that cozy feel.

TYPOGRAPHY (casual, authentic):

"{{headline}}"

"{{prep_description}}"

"{{tease_line}}"

"{{cta}}"

This story builds CONNECTION. It's "look what we're making for you." It's authenticity that builds trust and anticipation.$PROMPT$,
'v1', TRUE,
'{"style": "bts_authentic", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline"], "optional": ["prep_description", "tease_line", "cta"], "defaults": {"prep_description": "Getting ready for the holiday rush", "tease_line": "This could be yours tonight...", "cta": "Come see us 🎄"}}, "variation_rules": {"style_adjectives": ["authentic real", "working kitchen", "prep energy", "behind the magic"], "scene_types": ["kitchen action", "bar prep", "plating moment", "cocktail crafting"]}}'::JSONB);

-- 16. Holiday Hours Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-hours', 'Holiday Hours Announcement', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Essential info, beautifully presented. Holiday hours that people will actually SAVE.

THE BACKGROUND: A beautiful shot of the bar/restaurant that captures its essence:
- The bar lit up at night, warm and inviting
- A cozy booth with holiday decorations
- The exterior with holiday lights (if applicable)
- A signature dish or drink with holiday styling

The image should be slightly DARKENED or have an overlay to make text readable.

TYPOGRAPHY (clear, scannable, SAVE-WORTHY):

"{{headline}}"

"HOLIDAY HOURS"

"Christmas Eve: {{christmas_eve_hours}}"
"Christmas Day: {{christmas_day_hours}}"
"New Year's Eve: {{nye_hours}}"
"New Year's Day: {{nyd_hours}}"

"{{special_note}}"

"📌 Save This Post"

DESIGN ELEMENTS:
- Clean, organized layout
- Holiday icons or small graphics (tree, ornament, champagne glass)
- Brand colors incorporated
- Easy to read at a glance

This story is UTILITY. It answers the question "are they open?" It gets SAVED and SHARED.$PROMPT$,
'v1', TRUE,
'{"style": "utility_hours", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "christmas_eve_hours", "christmas_day_hours"], "optional": ["nye_hours", "nyd_hours", "special_note"], "defaults": {"nye_hours": "4pm - 2am", "nyd_hours": "12pm - 10pm", "special_note": "Reservations recommended for NYE"}}, "variation_rules": {"style_adjectives": ["utility focused", "save-worthy", "clear information", "holiday essential"], "background_options": ["bar interior", "exterior lights", "food hero", "cozy booth"]}}'::JSONB);

-- 17. Gift Card Last Minute Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-giftcard-urgent', 'Gift Card Last Minute Reminder', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Last-minute gift solution with URGENCY. Save someone's holiday shopping panic.

THE VISUAL: Gift card presentation with urgency elements:
- A gift card displayed beautifully—maybe being handed over, or in a gift box
- Holiday wrapping, ribbon, festive presentation
- A clock or countdown element suggesting urgency
- Maybe someone looking relieved/happy receiving it

THE URGENCY DESIGN:
- Bold colors—red for urgency
- "LAST CHANCE" or "STILL NEED A GIFT?" energy
- Countdown or deadline clearly visible
- Action-oriented layout

BACKGROUND: The bar in soft focus, suggesting what the gift card GETS you—good times, good food, good drinks.

TYPOGRAPHY (urgent but helpful, not desperate):

"{{headline}}"

"{{urgency_line}}"

"GIFT CARDS"
"{{bonus_offer}}"

"{{deadline}}"

"{{purchase_options}}"

"{{cta}}"

This story is PROBLEM-SOLVING. It's "I got you." It's the answer to last-minute gift panic.$PROMPT$,
'v1', TRUE,
'{"style": "gift_urgency", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "urgency_line"], "optional": ["bonus_offer", "deadline", "purchase_options", "cta"], "defaults": {"bonus_offer": "Buy $50, Get $10 FREE", "deadline": "Offer ends 12/24", "purchase_options": "In-Store or Online", "cta": "Link in Bio 🎁"}}, "variation_rules": {"style_adjectives": ["urgent helpful", "last minute solution", "gift panic solver", "deadline driven"], "urgency_levels": ["last chance", "final days", "ends tomorrow", "today only"]}}'::JSONB);

-- 18. NYE Countdown Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-nye-countdown', 'NYE Countdown Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — New Year's Eve hype builder. Countdown energy that creates FOMO.

THE VISUAL: Maximum NYE energy:
- Champagne being poured, bubbles visible, golden liquid cascading
- OR: The bar decorated for NYE—balloons, streamers, "2026" signage
- OR: A champagne toast moment, glasses clinking (frozen in time)
- OR: Party prep—confetti cannons ready, party favors laid out

THE ENERGY: Celebration, anticipation, "this is going to be EPIC" vibes.

DESIGN ELEMENTS:
- Gold, silver, black color scheme
- Sparkle effects, glitter, shine
- Countdown numbers prominent
- Party/celebration iconography

TYPOGRAPHY (celebratory, exciting):

"{{headline}}"

"{{days_until}}" (e.g., "3 DAYS")

"NEW YEAR'S EVE"
"{{event_date}}"

"{{party_highlights}}"

"{{ticket_info}}"

"{{cta}}"

SPACE FOR: Instagram countdown sticker.

This story builds ANTICIPATION. It's the hype before the party. It makes people commit NOW.$PROMPT$,
'v1', TRUE,
'{"style": "nye_hype", "holiday_type": "new_years", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "event_date"], "optional": ["days_until", "party_highlights", "ticket_info", "cta"], "defaults": {"days_until": "COUNTDOWN", "party_highlights": "DJ · Champagne Toast · Midnight Balloon Drop", "ticket_info": "No Cover Before 10pm", "cta": "Tag Your NYE Crew 🥂"}}, "variation_rules": {"style_adjectives": ["celebration hype", "countdown energy", "party anticipation", "NYE excitement"], "visual_focuses": ["champagne pour", "party setup", "toast moment", "decoration reveal"]}}'::JSONB);

-- 19. Thank You / Season's Greetings
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-thank-you', 'Season''s Greetings Thank You', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Genuine gratitude and holiday wishes. Connection with your community.

THE VISUAL: Warm, authentic, community-focused:
- The staff gathered together, smiling, maybe in holiday attire (Santa hats, ugly sweaters)
- OR: The bar/restaurant looking its best, warm and inviting, empty but ready
- OR: A montage-style layout with moments from the year
- OR: A simple, beautiful shot of the space with holiday decorations

THE FEELING: Gratitude, warmth, community. This isn't selling anything—it's THANKING.

DESIGN: Warm, heartfelt, on-brand:
- Warm color grading
- Maybe a subtle holiday border or frame
- Personal, not corporate
- Could include the restaurant logo subtly

TYPOGRAPHY (sincere, warm):

"{{headline}}"

"{{gratitude_message}}"

"{{holiday_wish}}"

"{{signature}}" (e.g., "— The [Restaurant Name] Family")

"{{new_year_tease}}"

This story is HEART. It's remembering that behind the business is a community. It builds loyalty and connection.$PROMPT$,
'v1', TRUE,
'{"style": "gratitude_warmth", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "gratitude_message"], "optional": ["holiday_wish", "signature", "new_year_tease"], "defaults": {"holiday_wish": "Wishing you a wonderful holiday season", "signature": "— Your Friends at the Bar", "new_year_tease": "See you in the New Year! 🎉"}}, "variation_rules": {"style_adjectives": ["heartfelt genuine", "community connection", "gratitude warmth", "holiday spirit"], "visual_options": ["staff photo", "empty bar beauty", "year montage", "decorated space"]}}'::JSONB);

-- 20. "We're Open" Holiday Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-were-open', 'We''re Open Holiday Reminder', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Quick, clear, "yes we're open" communication. Answers the question before they ask.

THE VISUAL: The bar/restaurant looking OPEN and READY:
- The "OPEN" neon sign lit up, glowing
- OR: The door/entrance with holiday decorations, clearly welcoming
- OR: Inside shot showing activity—staff ready, TVs on, bar stocked
- OR: A drink being poured or food being plated—action that says "we're here"

THE MESSAGE: Crystal clear—WE ARE OPEN. Come in.

DESIGN: Simple, bold, unmistakable:
- Large, clear text
- The word "OPEN" prominent
- Today's hours clearly stated
- Inviting, not desperate

TYPOGRAPHY:

"{{headline}}"

"WE'RE OPEN"
"{{today_label}}"

"{{hours}}"

"{{what_to_expect}}"

"{{cta}}"

This story is UTILITY + INVITATION. It answers "are they open?" and adds "and here's why you should come."$PROMPT$,
'v1', TRUE,
'{"style": "open_announcement", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "hours"], "optional": ["today_label", "what_to_expect", "cta"], "defaults": {"today_label": "TODAY", "what_to_expect": "Full menu · Holiday drinks · Games on", "cta": "Come hang with us 🍺"}}, "variation_rules": {"style_adjectives": ["clear utility", "welcoming invitation", "open for business", "holiday ready"], "visual_options": ["neon open sign", "welcoming entrance", "active bar shot", "food/drink action"]}}'::JSONB);

-- 21. Flash Sale / Limited Time Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-flash-sale', 'Holiday Flash Sale', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Limited time offer with URGENCY. Creates immediate action.

THE VISUAL: The deal, front and center:
- The item on special—wings, drinks, appetizers—looking AMAZING
- OR: A graphic-heavy design with the deal prominently displayed
- OR: Action shot—someone enjoying the special, beer being poured, wings being eaten

URGENCY ELEMENTS:
- Timer or countdown graphic
- "LIMITED TIME" or "TODAY ONLY" prominent
- Bold colors that demand attention
- Scarcity messaging

DESIGN: High impact, quick read:
- The deal is UNMISSABLE
- Price or discount clearly shown
- Time limitation clear
- Action step obvious

TYPOGRAPHY (urgent, exciting):

"{{headline}}"

"{{flash_deal}}"

"{{original_price}}" (struck through)
"{{sale_price}}"

"{{time_limit}}"

"{{cta}}"

This story creates URGENCY. It's "act now or miss out." It drives immediate traffic.$PROMPT$,
'v1', TRUE,
'{"style": "flash_urgency", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "low", "input_schema": {"required": ["headline", "flash_deal", "sale_price"], "optional": ["original_price", "time_limit", "cta"], "defaults": {"original_price": "", "time_limit": "Today 4-7pm Only", "cta": "Don''t Miss Out! 🔥"}}, "variation_rules": {"style_adjectives": ["urgent action", "limited time", "deal focused", "scarcity driven"], "deal_types": ["happy hour extension", "BOGO wings", "bucket special", "appetizer deal"]}}'::JSONB);

-- 22. Holiday Event Booking CTA
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-story-event-booking', 'Holiday Event Booking CTA', 'bar_grill', 'instagram_story', 'base',
$PROMPT$VERTICAL 9:16 INSTAGRAM STORY — Drive private event and party bookings. B2B and group focused.

THE VISUAL: The private event EXPERIENCE:
- A private room or sectioned area set up for a party
- OR: A group enjoying themselves—laughing, toasting, eating (faces can be blurred)
- OR: The party spread—food platters, drink buckets, the full setup
- OR: Before/after style—empty space transformed into party mode

THE APPEAL: Show what booking with you GETS them:
- Great space
- Amazing food and drinks
- No stress—you handle everything
- The perfect holiday party

DESIGN: Professional but fun:
- Shows capability
- Highlights the experience
- Clear call to action
- Contact info prominent

TYPOGRAPHY:

"{{headline}}"

"{{event_pitch}}"

"{{package_highlights}}"

"{{capacity_info}}"

"{{booking_cta}}"

"{{contact_info}}"

This story is LEAD GENERATION. It's targeting the person planning the office party or friend group gathering.$PROMPT$,
'v1', TRUE,
'{"style": "event_booking_cta", "holiday_type": "christmas", "frame_count": 1, "visual_complexity": "medium", "input_schema": {"required": ["headline", "event_pitch"], "optional": ["package_highlights", "capacity_info", "booking_cta", "contact_info"], "defaults": {"package_highlights": "Custom menus · Drink packages · Private space", "capacity_info": "Groups of 15-50", "booking_cta": "Book Your Holiday Party", "contact_info": "DM or call to reserve"}}, "variation_rules": {"style_adjectives": ["professional capability", "party experience", "stress-free hosting", "group gathering"], "visual_options": ["private room setup", "group celebration", "party spread", "space transformation"]}}'::JSONB);


-- ============================================================================
-- FACEBOOK POSTS - 5 TEMPLATES
-- ============================================================================

-- 23. Holiday Party Packages (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-fb-party-packages', 'Holiday Party Packages', 'bar_grill', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 PHOTOGRAPH — The ultimate "let us host your holiday party" image. Shows capability, abundance, and FUN.

THE SCENE: A private party area or section of the bar set up for a holiday gathering. This is bar & grill party hosting at its BEST.

THE SPREAD (the "wow" factor):
- A MASSIVE wing platter—50+ wings in multiple flavors, arranged beautifully, steam rising
- Slider tower or board—mini burgers stacked, variety of toppings
- Loaded fry bar or nacho mountain
- Multiple beer buckets filled with ice and bottles
- Pitchers of beer and cocktails
- Shot flight boards ready to go

THE SETUP:
- Long tables pushed together, kraft paper or simple linens
- String lights overhead
- TVs visible in background
- "Reserved" sign or party banner
- Holiday decorations—garland, small tree, festive touches
- Stacked plates, napkin dispensers, organized chaos

THE ENERGY: Ready for a PARTY. You can feel the anticipation. This space is about to be filled with laughter and good times.

LIGHTING: Warm bar lighting with holiday sparkle. Food lit to look HOT and FRESH. Inviting and exciting.

TYPOGRAPHY (professional but fun):

"{{headline}}"

"{{party_tagline}}"

HOLIDAY PARTY PACKAGES:
• {{package1}}
• {{package2}}
• {{package3}}

"{{booking_deadline}}"

"{{contact_info}}"

This image says: "We've got this. You just bring your people and have the best party ever."$PROMPT$,
'v1', TRUE,
'{"style": "party_package_showcase", "holiday_type": "christmas", "food_focus": "party_spread", "visual_complexity": "very_high", "input_schema": {"required": ["headline", "party_tagline"], "optional": ["package1", "package2", "package3", "booking_deadline", "contact_info"], "defaults": {"package1": "The Starter (10-15 people) — Wings, Sliders, Beer Bucket $199", "package2": "The Full Send (20-30 people) — Full Spread + Private Area $399", "package3": "The Blowout (40+) — Full Buyout Available", "booking_deadline": "Book by Dec 10 for Holiday Dates"}}, "variation_rules": {"style_adjectives": ["party abundance", "hosting capability", "group celebration", "bar food feast"], "spread_styles": ["wing-focused", "variety sampler", "slider bar", "full spread"]}}'::JSONB);

-- 24. Holiday Menu Announcement (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-fb-menu-announce', 'Holiday Menu Announcement', 'bar_grill', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 OR SQUARE 1:1 PHOTOGRAPH — Announcing the holiday menu with IMPACT. Makes people want to try everything.

THE LAYOUT: A curated spread of holiday menu highlights, styled for maximum appeal:

HERO ITEMS (3-4 dishes arranged beautifully):
- Holiday-glazed wings (cranberry bourbon, honey sriracha, etc.)
- A seasonal burger or sandwich
- A festive appetizer (loaded holiday nachos, stuffed potato skins)
- A holiday cocktail or drink

Each item is identifiable and looks INCREDIBLE. The arrangement is intentional—not cluttered, but abundant.

THE STYLING:
- Dark wood or slate surface
- Holiday props minimal but present—pine sprigs, cranberries, cinnamon sticks
- Each dish on appropriate servingware
- Garnishes fresh and vibrant
- Steam or heat visible where appropriate

BACKGROUND: The bar atmosphere in soft focus—bottles, lights, the promise of good times.

LIGHTING: Professional food photography lighting—each item looks its best. Warm overall with good contrast.

TYPOGRAPHY (menu announcement style):

"{{headline}}"

"{{menu_intro}}"

FEATURING:
• {{item1}}
• {{item2}}
• {{item3}}
• {{item4}}

"{{availability}}"

"{{cta}}"

This image is ANTICIPATION. It's "I need to try all of these." It drives visits and orders.$PROMPT$,
'v1', TRUE,
'{"style": "menu_announcement", "holiday_type": "christmas", "food_focus": "menu_variety", "visual_complexity": "high", "input_schema": {"required": ["headline", "menu_intro"], "optional": ["item1", "item2", "item3", "item4", "availability", "cta"], "defaults": {"item1": "Cranberry Bourbon Wings", "item2": "Holiday Burger with Brie & Cranberry", "item3": "Loaded Holiday Nachos", "item4": "Spiked Hot Cocoa & Festive Cocktails", "availability": "Available Now Through New Year''s", "cta": "Come taste the season"}}, "variation_rules": {"style_adjectives": ["menu showcase", "seasonal variety", "holiday flavors", "limited time appeal"], "layout_styles": ["spread arrangement", "hero with supporting", "grid layout", "diagonal flow"]}}'::JSONB);

-- 25. Holiday Hours & Info Post (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-fb-hours-info', 'Holiday Hours & Info', 'bar_grill', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 OR SQUARE 1:1 — Essential holiday information, beautifully presented. The post people SAVE and SHARE.

THE BACKGROUND: A beautiful, representative image of the bar/restaurant:
- The bar looking warm and inviting, decorated for holidays
- OR: The exterior with holiday lights at night
- OR: A signature food/drink shot with holiday styling
- OR: The space empty but beautifully lit, ready for guests

The image should be slightly DARKENED or have a tasteful overlay to ensure text readability.

THE INFORMATION (clear, organized, complete):

HOLIDAY HOURS:
- Christmas Eve hours
- Christmas Day hours (or "Closed - Merry Christmas!")
- New Year's Eve hours
- New Year's Day hours

SPECIAL NOTES:
- Reservation recommendations
- Special events happening
- Menu notes (limited menu, special menu, etc.)
- Any closures or changes

TYPOGRAPHY (clear, scannable):

"{{headline}}"

HOLIDAY HOURS

Christmas Eve: {{christmas_eve}}
Christmas Day: {{christmas_day}}
New Year's Eve: {{nye}}
New Year's Day: {{nyd}}

"{{special_notes}}"

"{{closing_message}}"

This post is UTILITY. It answers questions before they're asked. It gets saved, shared, and referenced.$PROMPT$,
'v1', TRUE,
'{"style": "info_utility", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "low", "input_schema": {"required": ["headline", "christmas_eve", "christmas_day", "nye", "nyd"], "optional": ["special_notes", "closing_message"], "defaults": {"special_notes": "Reservations recommended for NYE", "closing_message": "Happy Holidays from all of us! 🎄"}}, "variation_rules": {"style_adjectives": ["clear utility", "save-worthy info", "holiday essential", "community service"], "background_options": ["decorated bar", "exterior lights", "food hero", "empty beauty shot"]}}'::JSONB);

-- 26. Year-End Thank You Post (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-fb-thank-you', 'Year-End Thank You', 'bar_grill', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 OR SQUARE 1:1 — Genuine gratitude post. Community connection and relationship building.

THE VISUAL (authentic, warm, community-focused):

OPTION A - TEAM PHOTO: The staff gathered together, smiling, in holiday attire. Real people, real smiles. Maybe holding a "Thank You" sign or champagne glasses raised.

OPTION B - COMMUNITY MONTAGE: A collage of moments from the year—busy nights, happy customers (with permission), events hosted, milestones celebrated.

OPTION C - THE SPACE: The bar/restaurant looking its absolute best, warm and inviting, representing what you've built together with your community.

OPTION D - SIMPLE ELEGANCE: A beautifully styled holiday image with heartfelt text overlay—less about showing, more about saying.

THE FEELING: Gratitude, warmth, reflection, excitement for the future. This isn't selling—it's THANKING.

DESIGN: Warm, heartfelt, on-brand but personal:
- Warm color grading
- Personal touches
- Not overly corporate
- Genuine emotion

TYPOGRAPHY (sincere, from the heart):

"{{headline}}"

"{{gratitude_message}}"

"{{year_reflection}}"

"{{future_tease}}"

"{{signature}}"

This post builds LOYALTY. It reminds people that behind the bar is a family, a team, a community. It's the post that gets the most genuine engagement.$PROMPT$,
'v1', TRUE,
'{"style": "gratitude_community", "holiday_type": "christmas", "food_focus": "none", "visual_complexity": "medium", "input_schema": {"required": ["headline", "gratitude_message"], "optional": ["year_reflection", "future_tease", "signature"], "defaults": {"year_reflection": "What a year it''s been", "future_tease": "Can''t wait to see you in the New Year", "signature": "— The [Restaurant] Family"}}, "variation_rules": {"style_adjectives": ["heartfelt genuine", "community gratitude", "year reflection", "relationship building"], "visual_options": ["team photo", "year montage", "beautiful space", "simple elegance"]}}'::JSONB);

-- 27. NYE Event Announcement (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-fb-nye-event', 'NYE Event Announcement', 'bar_grill', 'facebook_post', 'base',
$PROMPT$LANDSCAPE 16:9 — The big New Year's Eve event announcement. Creates excitement and drives RSVPs/attendance.

THE VISUAL: Maximum NYE celebration energy:
- The bar TRANSFORMED for NYE—balloons, streamers, "2026" signage, gold and silver everywhere
- OR: Champagne focus—bottles, glasses, bubbles, the golden glow of celebration
- OR: The party in action (from a previous year or staged)—crowd energy, confetti, excitement
- OR: The setup/prep—showing what's coming, building anticipation

THE ENERGY: This is THE party. This is where you want to be. No fancy dress code, no pretension—just the best NYE at your favorite bar.

DESIGN: Celebratory, exciting, event-focused:
- Gold, silver, black color scheme
- Sparkle and shine
- Event details clear and prominent
- Party energy in every element

TYPOGRAPHY (event announcement style):

"{{headline}}"

NEW YEAR'S EVE {{year}}
{{event_date}}

"{{event_description}}"

FEATURING:
• {{feature1}}
• {{feature2}}
• {{feature3}}
• {{feature4}}

"{{ticket_info}}"

"{{rsvp_cta}}"

This post is EVENT MARKETING. It creates FOMO, drives RSVPs, and positions you as THE place to be on NYE.$PROMPT$,
'v1', TRUE,
'{"style": "nye_event_announcement", "holiday_type": "new_years", "food_focus": "drinks", "visual_complexity": "high", "input_schema": {"required": ["headline", "event_date", "event_description"], "optional": ["year", "feature1", "feature2", "feature3", "feature4", "ticket_info", "rsvp_cta"], "defaults": {"year": "2026", "feature1": "Live DJ All Night", "feature2": "Champagne Toast at Midnight", "feature3": "Party Favors & Noisemakers", "feature4": "Balloon Drop & Confetti Cannon", "ticket_info": "No Cover Before 10pm · $10 After", "rsvp_cta": "RSVP on Facebook or Just Show Up!"}}, "variation_rules": {"style_adjectives": ["celebration announcement", "party energy", "NYE excitement", "event marketing"], "visual_options": ["decorated venue", "champagne focus", "party action", "setup anticipation"]}}'::JSONB);


-- ============================================================================
-- INSTAGRAM CAROUSELS - 3 TEMPLATES
-- ============================================================================

-- 28. 12 Days of Holiday Specials Carousel
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-carousel-12-days', '12 Days of Holiday Specials', 'bar_grill', 'instagram_carousel', 'base',
$PROMPT$MULTI-SLIDE INSTAGRAM CAROUSEL (5 slides) — A save-worthy countdown campaign that builds anticipation and drives repeat visits. This is CONTENT MARKETING that works.

---

SLIDE 1 - THE HOOK:
Square 1:1 with maximum intrigue and holiday energy.

VISUAL: A beautifully wrapped gift box in festive paper (deep green with gold ribbon, or red with silver), slightly open with warm golden light spilling out—suggesting magic inside. Holiday elements surround it: pine branches, ornaments, string lights creating bokeh, maybe a beer bottle or wing peeking out of the box.

TYPOGRAPHY (bold, intriguing):

"{{headline}}"

"12 DAYS OF"
"HOLIDAY SPECIALS"

"{{date_range}}"

"Swipe to see what's coming →"

THE FEELING: Something special is about to happen. You don't want to miss this.

---

SLIDE 2 - DAYS 1-4:
Clean, scannable layout with food/drink photography.

"DAYS 1-4"

Each day features:
- Small circular or square photo of the special
- Day number
- Special name
- Brief description or price

Day 1: {{day1}} — Photo of wings or featured item
Day 2: {{day2}} — Photo of drink or deal
Day 3: {{day3}} — Photo of appetizer or special
Day 4: {{day4}} — Photo of featured item

DESIGN: Grid or list layout, easy to scan, each special clearly identified.

---

SLIDE 3 - DAYS 5-8:
Same format, building momentum.

"DAYS 5-8"

Day 5: {{day5}}
Day 6: {{day6}}
Day 7: {{day7}}
Day 8: {{day8}}

Maybe a "HALFWAY THERE!" banner or element.

---

SLIDE 4 - DAYS 9-12:
The grand finale specials—these should be the BIGGEST deals.

"DAYS 9-12"
"THE GRAND FINALE"

Day 9: {{day9}}
Day 10: {{day10}}
Day 11: {{day11}}
Day 12: {{day12}} — This one is the BIGGEST. Larger photo, more emphasis. The finale.

---

SLIDE 5 - CTA:
Final slide driving action and saves.

"{{cta_headline}}"

"📌 SAVE THIS POST"
"🔔 Turn on notifications"
"📍 {{location}}"

"{{final_message}}"

VISUAL: Return to the gift box imagery, now fully open with all the "gifts" (food and drink items) spilling out in a magical cascade. Or a collage of all 12 specials.

---

DESIGN CONSISTENCY: Same typography, color palette (holiday greens, golds, reds), and bar & grill energy across all slides. Professional, cohesive, campaign-quality.$PROMPT$,
'v1', TRUE,
'{"style": "countdown_campaign", "holiday_type": "christmas", "slide_count": 5, "visual_complexity": "high", "input_schema": {"required": ["headline", "date_range"], "optional": ["day1", "day2", "day3", "day4", "day5", "day6", "day7", "day8", "day9", "day10", "day11", "day12", "cta_headline", "location", "final_message"], "defaults": {"day1": "$5 Draft Beers", "day2": "Half-Price Wings", "day3": "BOGO Appetizers", "day4": "$6 Holiday Cocktails", "day5": "Free Dessert with Entree", "day6": "$10 Burger & Beer", "day7": "Kids Eat Free", "day8": "Double Points Day", "day9": "$15 Buckets", "day10": "Half-Price Nachos", "day11": "Free App with $30 Purchase", "day12": "THE BIG ONE - 50% Off Everything", "cta_headline": "Don''t Miss a Single Day", "final_message": "See you for the holidays! 🎄"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "daily anticipation", "save-worthy utility", "campaign cohesion"], "special_types": ["drink deals", "food specials", "combo offers", "percentage off", "BOGO deals"]}}'::JSONB);

-- 29. Holiday Menu Deep Dive Carousel
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-carousel-menu', 'Holiday Menu Deep Dive', 'bar_grill', 'instagram_carousel', 'base',
$PROMPT$MULTI-SLIDE INSTAGRAM CAROUSEL (4 slides) — A complete tour of the holiday menu. Each slide makes you hungrier than the last.

---

SLIDE 1 - COVER/APPETIZERS:
Square 1:1 introducing the holiday menu with appetizer focus.

VISUAL: A spread of holiday appetizers—loaded nachos with holiday twist, stuffed potato skins, holiday wings, spinach dip—arranged beautifully on a dark wood surface. Steam rising, cheese pulling, everything looking FRESH.

TYPOGRAPHY:

"{{headline}}"

"HOLIDAY MENU"

"Swipe for the full lineup →"

APPETIZER HIGHLIGHTS:
• {{app1}}
• {{app2}}
• {{app3}}

---

SLIDE 2 - MAINS/ENTREES:
The main event—burgers, sandwiches, entrees.

VISUAL: Hero shots of 2-3 main dishes. A holiday burger with brie and cranberry, a festive sandwich, maybe a hearty entree. Each dish styled to perfection, garnishes fresh, steam visible.

TYPOGRAPHY:

"MAINS"

• {{main1}}
• {{main2}}
• {{main3}}

Brief descriptions or prices for each.

---

SLIDE 3 - DRINKS:
The holiday drink menu—cocktails, beers, warm drinks.

VISUAL: A lineup of holiday cocktails and drinks—spiked cocoa, cranberry mule, boozy eggnog, seasonal beers. Glasses frosted, garnishes festive, the drinks GLOWING.

TYPOGRAPHY:

"HOLIDAY DRINKS"

• {{drink1}}
• {{drink2}}
• {{drink3}}
• {{drink4}}

---

SLIDE 4 - DESSERTS & CTA:
Sweet endings and call to action.

VISUAL: Dessert spread—brownie sundae, holiday pie, festive treats. Plus a final beauty shot of the bar/restaurant.

TYPOGRAPHY:

"SWEET ENDINGS"

• {{dessert1}}
• {{dessert2}}

"{{availability}}"

"{{cta}}"

"📌 Save for your next visit"

---

DESIGN: Consistent styling across all slides—same fonts, colors, layout structure. Each slide is a complete thought but part of a cohesive whole.$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase_carousel", "holiday_type": "christmas", "slide_count": 4, "visual_complexity": "high", "input_schema": {"required": ["headline"], "optional": ["app1", "app2", "app3", "main1", "main2", "main3", "drink1", "drink2", "drink3", "drink4", "dessert1", "dessert2", "availability", "cta"], "defaults": {"app1": "Holiday Loaded Nachos", "app2": "Cranberry BBQ Wings", "app3": "Stuffed Potato Skins", "main1": "Holiday Burger — Brie, Cranberry, Arugula", "main2": "Festive French Dip", "main3": "Winter Comfort Bowl", "drink1": "Spiked Hot Cocoa", "drink2": "Cranberry Moscow Mule", "drink3": "Boozy Eggnog", "drink4": "Seasonal Craft Beers", "dessert1": "Warm Brownie Sundae", "dessert2": "Holiday Pie Slice", "availability": "Available through New Year''s", "cta": "Come taste the season"}}, "variation_rules": {"style_adjectives": ["menu journey", "category showcase", "appetite building", "complete offering"], "category_focuses": ["appetizer heavy", "drink focused", "balanced spread", "dessert feature"]}}'::JSONB);

-- 30. Why Celebrate With Us Carousel
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('holiday-bg-carousel-why-us', 'Why Celebrate With Us', 'bar_grill', 'instagram_carousel', 'base',
$PROMPT$MULTI-SLIDE INSTAGRAM CAROUSEL (3 slides) — Selling the EXPERIENCE, not just the food. Why YOUR bar is THE holiday destination.

---

SLIDE 1 - THE FOOD:
Square 1:1 showcasing the food experience.

VISUAL: A stunning spread of your best dishes—wings, burgers, nachos, appetizers—arranged in an abundant, appetizing display. This is the "look at what you get" shot. Steam, cheese pulls, fresh garnishes, the works.

TYPOGRAPHY:

"WHY CELEBRATE WITH US"

"THE FOOD"

"{{food_headline}}"

"{{food_description}}"

• {{food_point1}}
• {{food_point2}}
• {{food_point3}}

"Swipe →"

---

SLIDE 2 - THE ATMOSPHERE:
The vibe, the energy, the FEELING of being there.

VISUAL: The bar/restaurant in full holiday glory—decorated, lit up, maybe with happy patrons (blurred or backs). TVs glowing, string lights twinkling, the bar stocked and ready. This is the "look at where you'll be" shot.

TYPOGRAPHY:

"THE ATMOSPHERE"

"{{atmosphere_headline}}"

"{{atmosphere_description}}"

• {{atmosphere_point1}}
• {{atmosphere_point2}}
• {{atmosphere_point3}}

---

SLIDE 3 - THE EXPERIENCE/CTA:
The complete package and call to action.

VISUAL: A combination shot—maybe a group toast, a table full of food and drinks, the moment of celebration. Or a beautiful exterior shot with holiday lights. This is the "this could be you" shot.

TYPOGRAPHY:

"THE EXPERIENCE"

"{{experience_headline}}"

"{{value_props}}"

"{{cta}}"

"{{booking_info}}"

"📍 {{location}}"

---

DESIGN: Each slide builds on the last. The progression is: FOOD → PLACE → FEELING. By the end, they're convinced.$PROMPT$,
'v1', TRUE,
'{"style": "experience_selling", "holiday_type": "christmas", "slide_count": 3, "visual_complexity": "medium", "input_schema": {"required": ["food_headline", "atmosphere_headline", "experience_headline"], "optional": ["food_description", "food_point1", "food_point2", "food_point3", "atmosphere_description", "atmosphere_point1", "atmosphere_point2", "atmosphere_point3", "value_props", "cta", "booking_info", "location"], "defaults": {"food_description": "Bar favorites with holiday flair", "food_point1": "House-made everything", "food_point2": "Holiday specials you won''t find anywhere else", "food_point3": "Portions meant for sharing", "atmosphere_description": "Your home away from home, dressed up for the season", "atmosphere_point1": "Big screens for every game", "atmosphere_point2": "Holiday decorations without the stuffiness", "atmosphere_point3": "The regulars, the staff, the vibe", "value_props": "Great food. Cold drinks. Good people. No pretension.", "cta": "This is where you want to be", "booking_info": "Walk-ins welcome · Large parties call ahead"}}, "variation_rules": {"style_adjectives": ["experience focused", "value proposition", "destination marketing", "emotional appeal"], "slide_focuses": ["food hero", "atmosphere showcase", "experience promise"]}}'::JSONB);

-- ============================================================================
-- END OF HOLIDAY BAR & GRILL TEMPLATES
-- 30 Total Templates:
-- - 12 Instagram Square (1:1)
-- - 10 Instagram Stories (9:16)
-- - 5 Facebook Posts
-- - 3 Instagram Carousels
-- ============================================================================
