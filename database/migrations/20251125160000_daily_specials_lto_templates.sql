-- ============================================================================
-- MIGRATION: Daily Specials & LTO Announcement Templates (No Food Imagery)
-- ============================================================================
-- Description: Recurring daily specials and limited-time offer announcements
--              NO AI-generated food - typography, graphics, atmosphere only
-- Date: 2025-11-25
-- Total Templates: 18
-- ============================================================================

-- =====================================================
-- DAILY SPECIALS - INSTAGRAM SQUARE (1:1) - 8 TEMPLATES
-- =====================================================

-- 1. Taco Tuesday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-taco-tuesday', 'Taco Tuesday Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 bold graphic announcing Taco Tuesday. Typography-driven, vibrant, no food imagery—pure graphic design impact.

Background: Vibrant, energetic design—could be bold color blocks, Mexican-inspired patterns (geometric, not stereotypical), textured paper, or warm sunset tones. The visual energy of Tuesday's best tradition.

Bold, fun typography:

"{{headline}}"

TACO TUESDAY

"{{deal_description}}"

"{{price_point}}"

"{{time_availability}}"

"{{extras}}"

Design elements: Could include subtle taco iconography (simple line art, not realistic), lime/citrus color accents, playful geometric shapes. The vibe is FUN—this is the weekly tradition people look forward to.

High contrast, scannable in 2 seconds. The kind of post that makes people text their friends "Taco Tuesday?"

No actual taco images—let the customer's imagination (and your real food) do that work.$PROMPT$,
'v1', TRUE,
'{"style": "bold_weekly", "day_of_week": "tuesday", "food_focus": "none", "input_schema": {"required": ["headline", "deal_description", "price_point"], "optional": ["time_availability", "extras"], "defaults": {"time_availability": "All day", "extras": "Margs on special too 🍹"}}, "variation_rules": {"style_adjectives": ["bold vibrant", "weekly tradition", "fun energetic", "Tuesday essential"], "color_palettes": ["warm sunset", "lime green coral", "bold primary", "earthy warm"], "design_elements": ["taco icon simple", "geometric Mexican", "citrus accents", "bold typography"]}}'::JSONB);

-- 2. Wing Wednesday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-wing-wednesday', 'Wing Wednesday Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 bold graphic for Wing Wednesday. Sports bar energy meets typography design. No food imagery—pure promotional impact.

Background: Bold, energetic design—could be flame/heat inspired colors, sports bar aesthetic, bold color blocks, or textured industrial feel. The energy of wing night.

Impactful typography:

"{{headline}}"

WING WEDNESDAY

"{{wing_deal}}"

"{{flavor_note}}"

"{{price_point}}"

"{{pairing_suggestion}}"

Design elements: Simple wing silhouette or icon (not realistic), flame accents, bold shapes. The vibe is BOLD—this is the midweek tradition that gets people through hump day.

Could include sauce color accents (buffalo red, honey gold) without showing actual wings.

The design makes mouths water through suggestion, not depiction. Typography does the heavy lifting.$PROMPT$,
'v1', TRUE,
'{"style": "bold_sports", "day_of_week": "wednesday", "food_focus": "none", "input_schema": {"required": ["headline", "wing_deal", "price_point"], "optional": ["flavor_note", "pairing_suggestion"], "defaults": {"flavor_note": "All flavors available", "pairing_suggestion": "Pair with $4 drafts"}}, "variation_rules": {"style_adjectives": ["bold sports energy", "wing night hype", "midweek tradition", "flavor forward"], "color_palettes": ["buffalo red orange", "honey gold brown", "flame gradient", "sports bar dark"], "design_elements": ["wing icon simple", "flame accents", "bold shapes", "sauce color hints"]}}'::JSONB);

-- 3. Thirsty Thursday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-thirsty-thursday', 'Thirsty Thursday Drinks Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for Thirsty Thursday drink specials. Bar-forward, weekend-preview energy. No food—drinks are the star (but no AI drink images either).

Background: Bar atmosphere aesthetic—could be moody bar lighting colors, cocktail-inspired color palette, neon sign aesthetic, or sophisticated dark tones with bright accents. The feeling of Thursday night at the bar.

Enticing typography:

"{{headline}}"

THIRSTY THURSDAY

"{{drink_special1}}"
"{{drink_special2}}"
"{{drink_special3}}"

"{{time_frame}}"

"{{vibe_note}}"

Design elements: Cocktail glass silhouettes, ice cube graphics, neon-style accents, bar atmosphere hints. The visual language of drinks without showing actual drinks.

The vibe: The weekend starts Thursday. Come get your thirst on.

Sophisticated but fun. The kind of post that makes people start planning their Thursday night.$PROMPT$,
'v1', TRUE,
'{"style": "bar_forward", "day_of_week": "thursday", "food_focus": "none", "input_schema": {"required": ["headline", "drink_special1"], "optional": ["drink_special2", "drink_special3", "time_frame", "vibe_note"], "defaults": {"time_frame": "4pm - close", "vibe_note": "Weekend starts here"}}, "variation_rules": {"style_adjectives": ["bar atmosphere", "weekend preview", "drink focused", "Thursday night out"], "color_palettes": ["moody bar", "neon accents", "cocktail jewel tones", "sophisticated dark"], "design_elements": ["glass silhouettes", "ice graphics", "neon style", "bar lighting"]}}'::JSONB);

-- 4. Fish Friday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-fish-friday', 'Fish Friday Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for Fish Friday specials. Classic tradition, fresh appeal. No food imagery—typography and design only.

Background: Fresh, coastal-inspired design—could be ocean blue tones, nautical patterns, weathered wood texture, or clean seafood-restaurant aesthetic. The feeling of Friday fish tradition.

Classic typography:

"{{headline}}"

FISH FRIDAY

"{{fish_special}}"

"{{price_point}}"

"{{sides_included}}"

"{{availability}}"

Design elements: Simple fish icon or wave motif, nautical accents, fresh blue-green palette. The visual language of seafood without showing actual fish.

The vibe: A tradition worth keeping. Whether it's religious observance or just good taste, Friday means fish.

Clean, appetizing through suggestion. The typography makes it sound delicious.$PROMPT$,
'v1', TRUE,
'{"style": "fresh_coastal", "day_of_week": "friday", "food_focus": "none", "input_schema": {"required": ["headline", "fish_special", "price_point"], "optional": ["sides_included", "availability"], "defaults": {"sides_included": "Served with fries & slaw", "availability": "While supplies last"}}, "variation_rules": {"style_adjectives": ["fresh coastal", "Friday tradition", "seafood classic", "clean appetizing"], "color_palettes": ["ocean blue", "seafoam green", "nautical navy", "fresh aqua"], "design_elements": ["fish icon simple", "wave motif", "nautical accents", "weathered texture"]}}'::JSONB);

-- 5. Prime Rib Saturday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-prime-rib', 'Prime Rib Saturday Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for Prime Rib Saturday. Premium, special occasion energy. No food imagery—sophisticated typography design.

Background: Rich, premium aesthetic—could be deep burgundy/wine tones, elegant dark textures, steakhouse sophistication, or warm candlelit colors. The feeling of a special Saturday dinner.

Elegant, premium typography:

"{{headline}}"

PRIME RIB SATURDAY

"{{cut_options}}"

"{{price_point}}"

"{{includes}}"

"{{reservation_note}}"

Design elements: Subtle steak knife icon, elegant borders, premium texture. The visual language of fine dining without showing actual meat.

The vibe: This is the Saturday tradition. The special dinner. The reason to dress up a little and make a night of it.

Sophisticated, appetizing through description. Makes people want to make a reservation.$PROMPT$,
'v1', TRUE,
'{"style": "premium_elegant", "day_of_week": "saturday", "food_focus": "none", "input_schema": {"required": ["headline", "cut_options", "price_point"], "optional": ["includes", "reservation_note"], "defaults": {"includes": "Includes soup or salad, potato, vegetable", "reservation_note": "Reservations recommended"}}, "variation_rules": {"style_adjectives": ["premium elegant", "Saturday special", "steakhouse sophistication", "special occasion"], "color_palettes": ["burgundy wine", "elegant dark", "warm candlelit", "rich mahogany"], "design_elements": ["knife icon", "elegant borders", "premium texture", "sophisticated type"]}}'::JSONB);

-- 6. Sunday Funday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-sunday-funday', 'Sunday Funday Specials', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for Sunday Funday. Relaxed weekend vibes, all-day celebration energy. No food imagery—fun, casual design.

Background: Bright, relaxed Sunday aesthetic—could be sunny warm tones, brunch-inspired pastels, lazy Sunday colors, or fun weekend patterns. The feeling of Sunday done right.

Fun, relaxed typography:

"{{headline}}"

SUNDAY FUNDAY

"{{brunch_deal}}"
"{{drink_deal}}"
"{{game_day_note}}"

"{{hours}}"

"{{vibe}}"

Design elements: Sun motifs, relaxed patterns, mimosa-orange accents, playful shapes. The visual language of the best day of the week.

The vibe: Sunday is for fun. Brunch, drinks, games, friends. No responsibilities, just good times.

Casual, inviting, the kind of post that makes people want to extend their weekend.$PROMPT$,
'v1', TRUE,
'{"style": "relaxed_fun", "day_of_week": "sunday", "food_focus": "none", "input_schema": {"required": ["headline", "brunch_deal"], "optional": ["drink_deal", "game_day_note", "hours", "vibe"], "defaults": {"drink_deal": "Bottomless mimosas available", "hours": "10am - 3pm", "vibe": "Good vibes only ☀️"}}, "variation_rules": {"style_adjectives": ["relaxed Sunday", "funday vibes", "weekend celebration", "no responsibilities"], "color_palettes": ["sunny warm", "mimosa orange", "brunch pastels", "lazy Sunday"], "design_elements": ["sun motif", "relaxed patterns", "playful shapes", "bright accents"]}}'::JSONB);

-- 7. Monday Blues Buster
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-monday-special', 'Monday Blues Buster Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for Monday specials—the antidote to the Monday blues. Sympathetic, deal-focused. No food imagery.

Background: Mood-lifting design—could be bright colors fighting the Monday gray, energetic patterns, or "we get it" sympathetic tones that transition to hopeful. The feeling of Monday made better.

Relatable typography:

"{{headline}}"

MONDAY SPECIAL

"{{deal_description}}"

"{{price_point}}"

"{{sympathy_note}}"

"{{hours}}"

Design elements: Could play with the Monday blues concept—gray to color transition, coffee cup icon, "hang in there" energy. The visual language of making Monday bearable.

The vibe: We know Mondays are rough. Let us help. This deal is our gift to you for surviving another Monday.

Relatable, deal-forward, the kind of post that makes Monday slightly less terrible.$PROMPT$,
'v1', TRUE,
'{"style": "mood_lifting", "day_of_week": "monday", "food_focus": "none", "input_schema": {"required": ["headline", "deal_description", "price_point"], "optional": ["sympathy_note", "hours"], "defaults": {"sympathy_note": "Because Mondays are hard", "hours": "All day"}}, "variation_rules": {"style_adjectives": ["mood lifting", "Monday cure", "sympathetic deal", "week starter"], "color_palettes": ["gray to bright", "hopeful warm", "energetic lift", "coffee tones"], "design_elements": ["mood transition", "coffee icon", "encouraging type", "deal highlight"]}}'::JSONB);

-- 8. Happy Hour Daily
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-happy-hour', 'Daily Happy Hour Announcement', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for daily happy hour. The golden hour of the day, every day. No food/drink imagery—pure promotional design.

Background: Golden hour aesthetic—warm amber tones, sunset colors, the specific light of late afternoon. The feeling of clocking out and unwinding.

Inviting typography:

"{{headline}}"

HAPPY HOUR

"{{time_frame}}"

"{{drink_deals}}"

"{{food_deals}}"

"{{daily_feature}}"

Design elements: Clock motifs, sunset gradients, golden light effects, bar silhouettes. The visual language of that perfect after-work moment.

The vibe: The best part of the day. When work ends and happy begins. Your daily reward for adulting.

Warm, inviting, the kind of post that makes people check the clock and start planning their escape.$PROMPT$,
'v1', TRUE,
'{"style": "golden_hour", "day_of_week": "daily", "food_focus": "none", "input_schema": {"required": ["headline", "time_frame", "drink_deals"], "optional": ["food_deals", "daily_feature"], "defaults": {"food_deals": "Half-price apps", "daily_feature": "Different feature each day"}}, "variation_rules": {"style_adjectives": ["golden hour", "after work reward", "daily escape", "unwind time"], "color_palettes": ["amber sunset", "golden warm", "late afternoon", "twilight transition"], "design_elements": ["clock motif", "sunset gradient", "golden light", "bar silhouette"]}}'::JSONB);


-- =====================================================
-- LTO ANNOUNCEMENTS - INSTAGRAM SQUARE (1:1) - 4 TEMPLATES
-- =====================================================

-- 9. New Menu Item Launch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-new-item', 'New Menu Item Launch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic announcing a new menu item. Excitement, curiosity, "you have to try this" energy. No food imagery—typography and design create the intrigue.

Background: Fresh, exciting design—could be bold "NEW" energy, spotlight aesthetic, or premium reveal feeling. The visual language of something special arriving.

Announcement typography:

"{{headline}}"

NEW

"{{item_name}}"

"{{item_description}}"

"{{availability}}"

"{{call_to_action}}"

Design elements: "NEW" badge or burst, spotlight effects, premium framing, excitement indicators. The design says "this is special" without showing the actual item.

The vibe: Something new just dropped. You're going to want to try this. Be one of the first.

The mystery and description make people curious. Let them discover the actual item in person.

Creates anticipation and urgency without relying on food photography.$PROMPT$,
'v1', TRUE,
'{"style": "launch_excitement", "content_type": "new_item", "food_focus": "none", "input_schema": {"required": ["headline", "item_name", "item_description"], "optional": ["availability", "call_to_action"], "defaults": {"availability": "Available now", "call_to_action": "Come try it before everyone else"}}, "variation_rules": {"style_adjectives": ["launch excitement", "new arrival", "fresh addition", "must try"], "design_elements": ["NEW badge", "spotlight effect", "premium frame", "reveal aesthetic"], "announcement_styles": ["bold reveal", "elegant introduction", "exciting drop", "premium launch"]}}'::JSONB);

-- 10. Limited Time Offer
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-limited-time', 'Limited Time Offer Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic for a limited time offer. Urgency, scarcity, "don't miss out" energy. No food imagery—the limitation is the hook.

Background: Urgent but not desperate design—could be countdown aesthetic, limited edition feel, or exclusive access vibe. The visual language of something that won't last.

Urgent typography:

"{{headline}}"

LIMITED TIME

"{{offer_name}}"

"{{offer_description}}"

"{{date_range}}"

"{{urgency_note}}"

Design elements: Calendar/countdown motifs, "limited" badges, scarcity indicators, time-sensitive framing. The design creates FOMO without showing the actual item.

The vibe: This won't be here forever. If you want it, now's the time. Don't be the one who missed out.

Urgency through limitation, not through food imagery. The scarcity sells itself.$PROMPT$,
'v1', TRUE,
'{"style": "urgent_scarcity", "content_type": "lto", "food_focus": "none", "input_schema": {"required": ["headline", "offer_name", "date_range"], "optional": ["offer_description", "urgency_note"], "defaults": {"urgency_note": "Once it''s gone, it''s gone"}}, "variation_rules": {"style_adjectives": ["urgent scarcity", "limited edition", "don''t miss out", "time sensitive"], "design_elements": ["countdown motif", "limited badge", "calendar icon", "scarcity indicator"], "urgency_levels": ["ending soon", "this week only", "while supplies last", "final days"]}}'::JSONB);

-- 11. Seasonal Menu Preview
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-seasonal-preview', 'Seasonal Menu Preview', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic previewing a seasonal menu. Anticipation, seasonal excitement, "coming soon" energy. No food imagery—seasonal aesthetic does the work.

Background: Season-appropriate design—could be fall colors for autumn menu, fresh greens for spring, warm tones for winter comfort, bright for summer. The feeling of the season, not the food.

Preview typography:

"{{headline}}"

"{{season}} MENU"

COMING {{launch_date}}

"{{preview_tease}}"

"{{highlight_items}}"

"{{anticipation_note}}"

Design elements: Seasonal motifs (leaves, snowflakes, flowers, sun—tasteful, not clip art), color palettes that evoke the season, "coming soon" framing.

The vibe: The season is changing, and so is our menu. Get excited for what's coming.

Builds anticipation through seasonal association. The menu items are described, not shown.$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_anticipation", "content_type": "seasonal_menu", "food_focus": "none", "input_schema": {"required": ["headline", "season", "launch_date"], "optional": ["preview_tease", "highlight_items", "anticipation_note"], "defaults": {"preview_tease": "New flavors, seasonal favorites", "anticipation_note": "Mark your calendars"}}, "variation_rules": {"style_adjectives": ["seasonal anticipation", "menu preview", "coming soon excitement", "seasonal transition"], "seasonal_palettes": ["fall warm", "winter cozy", "spring fresh", "summer bright"], "design_elements": ["seasonal motifs", "coming soon badge", "calendar hint", "season colors"]}}'::JSONB);

-- 12. Back by Popular Demand
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-sq-back-popular', 'Back by Popular Demand', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic announcing the return of a fan favorite. Nostalgia, excitement, "you asked, we listened" energy. No food imagery—the story sells it.

Background: Celebratory return design—could be "welcome back" aesthetic, fan favorite framing, or triumphant return feeling. The visual language of something beloved coming home.

Celebratory typography:

"{{headline}}"

BACK BY POPULAR DEMAND

"{{item_name}}"

"{{return_story}}"

"{{availability}}"

"{{fan_note}}"

Design elements: Return/comeback motifs, celebration indicators, "fan favorite" badges, welcome back framing. The design celebrates the return without showing the item.

The vibe: You asked for it. You begged for it. It's BACK. The fan favorite returns.

The story of its return—why it left, why it's back, how much people missed it—creates more desire than any photo could.$PROMPT$,
'v1', TRUE,
'{"style": "triumphant_return", "content_type": "returning_item", "food_focus": "none", "input_schema": {"required": ["headline", "item_name"], "optional": ["return_story", "availability", "fan_note"], "defaults": {"return_story": "You asked, we listened", "availability": "For a limited time", "fan_note": "Don''t miss it this time"}}, "variation_rules": {"style_adjectives": ["triumphant return", "fan favorite", "back by demand", "welcome home"], "design_elements": ["return motif", "celebration badge", "fan favorite indicator", "welcome back frame"], "return_angles": ["you asked we listened", "the wait is over", "it''s finally back", "fan favorite returns"]}}'::JSONB);

-- =====================================================
-- INSTAGRAM STORIES (9:16) - 4 TEMPLATES
-- =====================================================

-- 13. Daily Special Story Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-story-reminder', 'Daily Special Story Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story reminding followers about today's daily special. Quick, scannable, action-driving. No food imagery.

Background: Day-appropriate design—colors and energy that match the specific day's special (Taco Tuesday warmth, Wing Wednesday boldness, etc.). Quick-hit visual impact.

Reminder typography:

"{{headline}}"

"{{day_name}}"

"{{special_name}}"

"{{deal_details}}"

"{{time_info}}"

"{{cta}}"

The design is fast—this is a reminder, not a deep dive. People scrolling stories need to get the message in 2 seconds.

Day-specific visual cues without food: color associations, simple icons, energy level matching the special.

The vibe: Hey, don't forget—today's the day. Come get it.$PROMPT$,
'v1', TRUE,
'{"style": "quick_reminder", "content_type": "daily_special", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "day_name", "special_name", "deal_details"], "optional": ["time_info", "cta"], "defaults": {"time_info": "All day", "cta": "See you tonight!"}}, "variation_rules": {"style_adjectives": ["quick reminder", "day specific", "fast scannable", "action driving"], "day_energies": ["taco tuesday warm", "wing wednesday bold", "thirsty thursday cool", "fish friday fresh"]}}'::JSONB);

-- 14. LTO Countdown Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-countdown', 'LTO Ending Soon Countdown', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story creating urgency for an ending LTO. Countdown energy, last chance vibes. No food imagery.

Background: Urgent countdown aesthetic—could be timer visuals, "ending soon" energy, or last-call feeling. The visual language of time running out.

Urgent typography:

"{{headline}}"

"{{item_name}}"

"{{days_remaining}}"

"{{ending_date}}"

"{{last_chance_note}}"

"{{cta}}"

Space for Instagram countdown sticker if desired.

The design creates urgency through time, not through food imagery. The countdown is the hook.

The vibe: Time's almost up. If you haven't tried it yet, this is your last chance. Don't regret missing out.$PROMPT$,
'v1', TRUE,
'{"style": "countdown_urgent", "content_type": "lto_ending", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "item_name", "days_remaining"], "optional": ["ending_date", "last_chance_note", "cta"], "defaults": {"last_chance_note": "Don''t miss out", "cta": "Get it before it''s gone"}}, "variation_rules": {"style_adjectives": ["countdown urgent", "last chance", "ending soon", "time running out"], "urgency_indicators": ["days left", "final weekend", "last week", "ends tomorrow"]}}'::JSONB);

-- 15. New Item Teaser Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-teaser', 'New Item Teaser Story', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story teasing an upcoming menu item. Mystery, anticipation, "something's coming" energy. No food imagery—the mystery is the hook.

Background: Teaser aesthetic—could be blurred/obscured hints, "coming soon" mystery, or reveal-style design. The visual language of anticipation.

Mysterious typography:

"{{headline}}"

SOMETHING NEW IS COMING

"{{hint_text}}"

"{{launch_date}}"

"{{guess_prompt}}"

The design intentionally withholds—this is a teaser, not a reveal. Create curiosity, not satisfaction.

Could include: Silhouettes, question marks, blurred shapes, countdown elements. The mystery drives engagement.

The vibe: We're working on something special. Can you guess what it is? Stay tuned.$PROMPT$,
'v1', TRUE,
'{"style": "mystery_teaser", "content_type": "new_item_teaser", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "hint_text"], "optional": ["launch_date", "guess_prompt"], "defaults": {"launch_date": "Coming soon", "guess_prompt": "Any guesses? 👀"}}, "variation_rules": {"style_adjectives": ["mystery teaser", "coming soon", "anticipation builder", "curiosity hook"], "teaser_elements": ["silhouette", "question marks", "blurred hints", "countdown"]}}'::JSONB);

-- 16. Fan Favorite Poll Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-story-poll', 'Fan Favorite Poll Story', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with a poll about menu items or specials. Engagement-focused, community-building. No food imagery.

Background: Interactive, fun design—playful colors, poll-ready layout, engagement energy. Designed for Instagram's poll sticker.

Engaging typography:

"{{headline}}"

"{{poll_question}}"

Clear space for Instagram poll sticker.

"{{context}}"

"{{result_tease}}"

The design is built around the poll—it needs the sticker to feel complete. This is about engagement, not announcement.

Could be: "Which special should come back?" "What's your favorite day?" "New item name vote?" etc.

The vibe: We want to hear from you. Your vote matters. Help us decide.$PROMPT$,
'v1', TRUE,
'{"style": "interactive_poll", "content_type": "engagement", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "poll_question"], "optional": ["context", "result_tease"], "defaults": {"context": "Vote now!", "result_tease": "Results coming soon"}}, "variation_rules": {"style_adjectives": ["interactive engagement", "community voice", "poll ready", "vote matters"], "poll_types": ["bring back vote", "favorite pick", "name the item", "this or that"]}}'::JSONB);

-- =====================================================
-- FACEBOOK POSTS - 2 TEMPLATES
-- =====================================================

-- 17. Weekly Specials Roundup
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-fb-weekly-roundup', 'Weekly Specials Roundup', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 graphic showing all weekly specials at a glance. Utility content that gets saved and shared. No food imagery.

Background: Clean, organized design—could be calendar-style layout, day-by-day breakdown, or weekly planner aesthetic. The visual language of useful information.

Comprehensive typography:

"{{headline}}"

WEEKLY SPECIALS

MONDAY: {{monday_special}}
TUESDAY: {{tuesday_special}}
WEDNESDAY: {{wednesday_special}}
THURSDAY: {{thursday_special}}
FRIDAY: {{friday_special}}
SATURDAY: {{saturday_special}}
SUNDAY: {{sunday_special}}

"{{happy_hour_note}}"

"{{save_reminder}}"

The design prioritizes utility—this is the post people save and reference all week. Clear, scannable, shareable.

Each day gets equal visual weight. Easy to find what you're looking for.

The vibe: Your weekly guide to saving money and eating well. Save this post.$PROMPT$,
'v1', TRUE,
'{"style": "utility_reference", "content_type": "weekly_roundup", "food_focus": "none", "input_schema": {"required": ["headline", "tuesday_special", "wednesday_special"], "optional": ["monday_special", "thursday_special", "friday_special", "saturday_special", "sunday_special", "happy_hour_note", "save_reminder"], "defaults": {"monday_special": "Monday Blues Buster", "thursday_special": "Thirsty Thursday", "friday_special": "Fish Friday", "saturday_special": "Prime Rib Night", "sunday_special": "Sunday Funday", "happy_hour_note": "Happy Hour daily 3-6pm", "save_reminder": "📌 Save this post!"}}, "variation_rules": {"style_adjectives": ["utility reference", "weekly guide", "save worthy", "shareable schedule"], "layout_styles": ["calendar grid", "day by day list", "weekly planner", "organized breakdown"]}}'::JSONB);

-- 18. LTO Launch Facebook
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('lto-fb-launch', 'LTO Launch Facebook Announcement', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 comprehensive LTO launch announcement for Facebook. All the details for the new offering. No food imagery.

Background: Launch-appropriate design—exciting, premium, or seasonal depending on the LTO. The visual language of something special arriving.

Complete announcement:

"{{headline}}"

INTRODUCING

"{{item_name}}"

"{{item_description}}"

"{{what_makes_it_special}}"

Available: {{availability_dates}}
Price: {{price_info}}

"{{how_to_order}}"

"{{urgency_note}}"

Facebook is where people read details. Give them the full story: what it is, why it's special, when they can get it, how long it lasts.

The description does the selling. Paint a picture with words, not images.

The vibe: Here's everything you need to know about our exciting new offering. Come try it.$PROMPT$,
'v1', TRUE,
'{"style": "launch_comprehensive", "content_type": "lto_launch", "food_focus": "none", "input_schema": {"required": ["headline", "item_name", "item_description", "availability_dates"], "optional": ["what_makes_it_special", "price_info", "how_to_order", "urgency_note"], "defaults": {"what_makes_it_special": "A limited-time creation you won''t want to miss", "how_to_order": "Available for dine-in and takeout", "urgency_note": "Get it while you can!"}}, "variation_rules": {"style_adjectives": ["launch comprehensive", "full details", "story telling", "description forward"], "launch_types": ["seasonal item", "chef special", "limited collaboration", "fan request"]}}'::JSONB);

-- =====================================================
-- END OF DAILY SPECIALS & LTO TEMPLATES
-- =====================================================

-- Summary:
-- Daily Specials Instagram Square: 8 templates
-- LTO Instagram Square: 4 templates
-- Instagram Stories: 4 templates
-- Facebook Posts: 2 templates
-- TOTAL: 18 templates (all no-food focused)
