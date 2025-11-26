-- Happy Hour & Drink Specials Templates
-- Generated: 2025-11-25
-- Total: 28 templates

-- =====================================================
-- HAPPY HOUR TEMPLATES (8 total)
-- =====================================================

-- HAPPY HOUR - Instagram Square (4 templates)
-- -----------------------------------------------------

-- 1. Daily Happy Hour Announcement (general)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-sq-daily-announcement-v2', 'Daily Happy Hour Announcement', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing the golden hour energy of happy hour. The bar is the star—bottles backlit, glasses ready, the anticipation of the after-work crowd.

Scene: The bar setup during that magic transition hour. Warm lighting mixes with the last daylight through windows. The bartender's hands are visible preparing drinks or arranging garnishes. Multiple drink options are displayed—beer taps, wine glasses, cocktail setup.

Condensation on glasses. Ice in buckets. The bar looks ready and inviting.

Bold, celebratory typography:
"{{headline}}"

HAPPY HOUR
{{start_time}} - {{end_time}}

• {{drink1}} — ${{price1}}
• {{drink2}} — ${{price2}}
• {{drink3}} — ${{price3}}

"{{food_special}}"
"{{days_available}}"

The lighting is warm amber—that specific happy hour glow. The vibe is "the workday is over, reward yourself."

The feeling: Clock out. Come in. The best part of the day starts now.$PROMPT$,
'v1', TRUE,
'{"style": "golden_hour_bar", "category": "happy_hour", "input_schema": {"required": ["headline", "start_time", "end_time", "drink1", "price1"], "optional": ["drink2", "price2", "drink3", "price3", "food_special", "days_available"], "defaults": {"food_special": "Half-price apps", "days_available": "Monday - Friday"}}, "variation_rules": {"style_adjectives": ["golden hour warmth", "after-work energy", "bar anticipation", "reward yourself"], "drink_displays": ["beer taps", "wine lineup", "cocktail setup", "mixed spread"], "camera_styles": ["bar wide establishing", "drink lineup hero", "bartender action"]}}'::JSONB);

-- 2. Extended Happy Hour / Late Night Happy Hour
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-sq-extended-late-night-v2', 'Extended / Late Night Happy Hour', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph showcasing late night happy hour vibes. The energy shifts—this isn't after-work, this is after-hours.

Scene: The bar in evening mode. Moody lighting, neon accents, the intimate glow of a bar that's settled into its nighttime rhythm. Options:
- Bar top with drinks under ambient lighting
- Cocktails with dramatic backlighting
- The bartender in action, low-light expertise
- Cozy booth corner with drinks and soft lighting

The atmosphere says "the night is young" or "one more round."

Sophisticated, nightlife typography:
"{{headline}}"

LATE NIGHT HAPPY HOUR
{{start_time}} - {{end_time}}

• {{drink1}} — ${{price1}}
• {{drink2}} — ${{price2}}
• {{drink3}} — ${{price3}}

"{{late_night_food}}"
"{{nights_available}}"

The lighting is moody and intimate—amber bar lights, maybe some neon reflection. This is the second wave of happy hour for night owls.

The feeling: The night's not over. Neither are the deals. Stay a while.$PROMPT$,
'v1', TRUE,
'{"style": "late_night_moody", "category": "happy_hour", "input_schema": {"required": ["headline", "start_time", "end_time", "drink1", "price1"], "optional": ["drink2", "price2", "drink3", "price3", "late_night_food", "nights_available"], "defaults": {"late_night_food": "Late night bites available", "nights_available": "Every night"}}, "variation_rules": {"style_adjectives": ["late night vibes", "moody intimate", "night owl energy", "after-hours"], "drink_displays": ["dramatic backlit cocktails", "bar top ambient", "cozy booth drinks"], "camera_styles": ["moody low-light", "neon accent", "intimate close-up"]}}'::JSONB);

-- 3. Happy Hour Food + Drink Combo
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-sq-food-drink-combo-v2', 'Happy Hour Food + Drink Combo', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph featuring the perfect happy hour pairing—drinks AND food together. The complete happy hour experience.

Scene: A beautifully styled spread showing drinks alongside appetizers. Options:
- Beer and wings/nachos combo on bar top
- Cocktail with shareable appetizer plate
- Wine and cheese/charcuterie pairing
- Margarita with tacos or chips & guac

Both elements are heroes—the drink is cold and inviting, the food is fresh and shareable. The composition shows them as a natural pair.

Value-focused, appetizing typography:
"{{headline}}"

HAPPY HOUR COMBO
{{combo_name}}

{{drink_item}} + {{food_item}}
ONLY ${{combo_price}}

"{{savings_callout}}"
"{{time_window}}"
"{{days_available}}"

The lighting is warm and appetizing—making both the drink and food look irresistible. The vibe is "why choose when you can have both?"

The feeling: The perfect pair. One price. Happy hour done right.$PROMPT$,
'v1', TRUE,
'{"style": "combo_value", "category": "happy_hour", "input_schema": {"required": ["headline", "combo_name", "drink_item", "food_item", "combo_price"], "optional": ["savings_callout", "time_window", "days_available"], "defaults": {"savings_callout": "Save $5 on the combo", "time_window": "3pm - 6pm", "days_available": "Monday - Friday"}}, "variation_rules": {"style_adjectives": ["perfect pairing", "combo value", "shareable spread", "complete experience"], "combo_types": ["beer and wings", "cocktail and apps", "wine and cheese", "marg and tacos"], "camera_styles": ["overhead spread", "45-degree hero", "side-by-side pairing"]}}'::JSONB);


-- 4. "Best Happy Hour in Town" Brand Statement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-sq-best-in-town-v2', 'Best Happy Hour in Town', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph making a bold brand statement—this is THE happy hour destination. Confidence and quality in every detail.

Scene: The bar at its absolute best. Premium presentation, everything dialed in. Options:
- Wide shot of a stunning bar setup, fully stocked and gleaming
- Signature cocktails lined up like trophies
- The crowd enjoying themselves (motion blur, energy)
- Bartender crafting drinks with expertise

This isn't just happy hour—this is the happy hour others are measured against.

Bold, confident typography:
"{{headline}}"

"{{tagline}}"

HAPPY HOUR
{{start_time}} - {{end_time}}

{{highlight1}}
{{highlight2}}
{{highlight3}}

"{{location_callout}}"

The lighting is professional, polished—the bar looks like it belongs in a magazine. The vibe is confident without being arrogant.

The feeling: You've heard about us. Now come see why. Best happy hour in town. Period.$PROMPT$,
'v1', TRUE,
'{"style": "brand_statement", "category": "happy_hour", "input_schema": {"required": ["headline", "tagline", "start_time", "end_time"], "optional": ["highlight1", "highlight2", "highlight3", "location_callout"], "defaults": {"tagline": "The Happy Hour Others Talk About", "highlight1": "Premium wells at dive bar prices", "highlight2": "Apps starting at $5", "highlight3": "Craft cocktails $8", "location_callout": "Downtown''s favorite spot"}}, "variation_rules": {"style_adjectives": ["confident brand", "premium quality", "destination spot", "best in class"], "bar_presentations": ["stunning wide shot", "signature lineup", "crowd energy", "bartender expertise"], "camera_styles": ["magazine quality wide", "hero lineup", "lifestyle energy"]}}'::JSONB);

-- HAPPY HOUR - Instagram Stories (4 templates)
-- -----------------------------------------------------

-- 5. "It's That Time" Daily Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-story-its-time-v2', 'Happy Hour Reminder Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story as a daily happy hour reminder. Quick, punchy, "get here now" energy.

Background: The bar right now—real, in-the-moment feeling. Could be:
- Bartender setting up for happy hour
- First drinks being poured
- The bar looking ready and inviting
- Clock showing happy hour time

The vibe is "this is happening NOW, not later."

Urgent, fun typography:
"{{headline}}"

"HAPPY HOUR"
"IS HAPPENING"

{{start_time}} - {{end_time}}

"{{today_special}}"
"{{cta}}"

Design elements: Could include clock graphics, "NOW" badges, or countdown energy. The story should feel timely—posted right as happy hour starts.

Space for location sticker or "Add Yours" engagement.

The feeling: Stop scrolling. Happy hour started. Where are you?$PROMPT$,
'v1', TRUE,
'{"style": "urgent_reminder", "category": "happy_hour", "frame_count": 1, "input_schema": {"required": ["headline", "start_time", "end_time"], "optional": ["today_special", "cta"], "defaults": {"today_special": "$5 wells & drafts", "cta": "See you soon 🍻"}}, "variation_rules": {"style_adjectives": ["urgent now", "timely reminder", "get here energy", "FOMO inducing"], "timing_elements": ["clock graphic", "NOW badge", "countdown", "just started"], "camera_styles": ["bar setup real-time", "first pour", "ready and waiting"]}}'::JSONB);

-- 6. Happy Hour Countdown (starting soon)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-story-countdown-v2', 'Happy Hour Countdown Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story building anticipation—happy hour is ALMOST here. The countdown creates urgency.

Background: Pre-happy hour prep energy. Options:
- Bartender prepping garnishes, cutting limes
- Ice being loaded into wells
- Glasses being polished and lined up
- The calm before the storm at the bar

The vibe is anticipation—something good is about to happen.

Countdown-focused typography:
"{{headline}}"

"HAPPY HOUR IN"
"{{countdown_time}}"

STARTING AT {{start_time}}

"{{teaser_deal}}"
"{{cta}}"

Design elements: Countdown timer graphic, clock hands, "SOON" badges. Use Instagram's countdown sticker placement area.

The feeling: Set your alarm. Make your plans. Happy hour is coming.$PROMPT$,
'v1', TRUE,
'{"style": "anticipation_countdown", "category": "happy_hour", "frame_count": 1, "input_schema": {"required": ["headline", "countdown_time", "start_time"], "optional": ["teaser_deal", "cta"], "defaults": {"countdown_time": "1 HOUR", "teaser_deal": "$4 drafts • $5 wells • $6 wines", "cta": "Set your reminder ⏰"}}, "variation_rules": {"style_adjectives": ["building anticipation", "countdown energy", "almost time", "get ready"], "prep_scenes": ["garnish prep", "ice loading", "glass polishing", "bar setup"], "camera_styles": ["prep action", "detail close-up", "anticipation wide"]}}'::JSONB);

-- 7. "Last Call" Happy Hour Ending
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-story-last-call-v2', 'Happy Hour Last Call Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story creating urgency—happy hour is ending soon. Last chance energy.

Background: Happy hour in full swing but time running out. Options:
- Clock showing time near end of happy hour
- Bartender pouring "last round" drinks
- Busy bar with urgency overlay
- Drinks being enjoyed, time ticking

The vibe is "don't miss out"—FOMO at its finest.

Urgent, last-chance typography:
"{{headline}}"

"LAST CALL"
"HAPPY HOUR"

ENDS AT {{end_time}}

"{{minutes_left}}"
"{{final_deal}}"

Design elements: Warning colors (amber/red accents), countdown urgency, "ENDING SOON" badges. Clock graphics showing time running out.

The feeling: You've got 30 minutes. Get here or miss out. This is your last chance.$PROMPT$,
'v1', TRUE,
'{"style": "last_call_urgency", "category": "happy_hour", "frame_count": 1, "input_schema": {"required": ["headline", "end_time"], "optional": ["minutes_left", "final_deal"], "defaults": {"minutes_left": "30 MINUTES LEFT", "final_deal": "Get those happy hour prices while you can!"}}, "variation_rules": {"style_adjectives": ["last chance", "FOMO urgency", "time running out", "dont miss"], "urgency_elements": ["clock countdown", "warning colors", "ending soon badge"], "camera_styles": ["busy bar energy", "clock focus", "last pour action"]}}'::JSONB);

-- 8. Happy Hour Poll ("What are you drinking?")
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('hh-story-poll-v2', 'Happy Hour Poll Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story designed for engagement—let followers vote on their happy hour choice.

Background: Split or comparison drink setup. Options:
- Two drinks side by side (beer vs cocktail, red vs white)
- Drink options arranged for comparison
- "This or That" visual setup
- Bartender holding two options

The vibe is interactive and fun—get people engaged before they even arrive.

Playful, poll-ready typography:
"{{headline}}"

"WHAT'S YOUR"
"HAPPY HOUR ORDER?"

{{option_a}} OR {{option_b}}

"{{poll_cta}}"
"{{happy_hour_time}}"

Design elements: Clear space for Instagram poll sticker. Visual separation between options. Fun, casual energy.

The feeling: We want to know. Vote now. Then come prove your choice right.$PROMPT$,
'v1', TRUE,
'{"style": "interactive_poll", "category": "happy_hour", "frame_count": 1, "input_schema": {"required": ["headline", "option_a", "option_b"], "optional": ["poll_cta", "happy_hour_time"], "defaults": {"poll_cta": "Vote then come grab one!", "happy_hour_time": "Happy Hour 3-6pm"}}, "variation_rules": {"style_adjectives": ["interactive fun", "engagement focused", "this or that", "vote energy"], "poll_setups": ["side by side drinks", "comparison layout", "this or that split", "two options held"], "camera_styles": ["split comparison", "overhead two drinks", "bartender holding both"]}}'::JSONB);


-- =====================================================
-- DAILY DRINK SPECIALS TEMPLATES (8 total)
-- =====================================================

-- DAILY SPECIALS - Instagram Square (4 templates)
-- -----------------------------------------------------

-- 9. Wine Wednesday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-wine-wednesday-v2', 'Wine Wednesday Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph celebrating Wine Wednesday with elegance and accessibility. Wine is the hero—beautiful, approachable, ready to pour.

Scene: A wine-focused setup that feels special but not stuffy. Options:
- Wine glasses lined up with different varietals (red, white, rosé showing color gradient)
- A bottle being poured, wine catching the light
- Wine flight arrangement on a wooden board
- Sommelier/bartender hands presenting a bottle

The setting suggests midweek indulgence—you deserve this on a Wednesday.

Elegant but fun typography:
"{{headline}}"

WINE WEDNESDAY
{{deal_description}}

FEATURING:
• {{wine1}} — ${{price1}}
• {{wine2}} — ${{price2}}
• {{wine3}} — ${{price3}}

"{{bottle_deal}}"
"{{pairing_suggestion}}"

The lighting is warm and intimate—candlelight or soft ambient. The wine colors are rich and inviting. This isn't a fancy wine bar vibe—it's "treat yourself midweek."

The feeling: Wednesday just got better. You've earned this glass.$PROMPT$,
'v1', TRUE,
'{"style": "midweek_indulgence", "category": "wine", "day_specific": "wednesday", "input_schema": {"required": ["headline", "deal_description"], "optional": ["wine1", "price1", "wine2", "price2", "wine3", "price3", "bottle_deal", "pairing_suggestion"], "defaults": {"deal_description": "Half-price bottles all night", "bottle_deal": "All bottles 50% off", "pairing_suggestion": "Pairs perfectly with our cheese board"}}, "variation_rules": {"style_adjectives": ["midweek treat", "wine elegance", "accessible luxury", "you deserve this"], "wine_displays": ["color gradient lineup", "pour action", "flight board", "bottle presentation"], "camera_styles": ["wine glasses hero", "pour shot", "flight overhead"]}}'::JSONB);

-- 10. Thirsty Thursday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-thirsty-thursday-v2', 'Thirsty Thursday Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph with high-energy Thirsty Thursday vibes. The weekend is almost here—this is the pre-game.

Scene: The bar at its most energetic. Options:
- Beer buckets with ice, bottles ready to grab
- Pitchers being poured with perfect head
- Shot lineup ready to go
- Crowd energy visible in background (motion blur, hands raising glasses)

The setting screams "Thursday is the new Friday." Energy, anticipation, crew gathering.

Bold, energetic typography:
"{{headline}}"

THIRSTY THURSDAY
{{main_deal}}

• {{special1}} — ${{price1}}
• {{special2}} — ${{price2}}
• {{special3}} — ${{price3}}

"{{group_deal}}"
"{{dj_or_event}}"

The lighting is more energetic—neon accents, TV glow from sports, the buzz of a busy bar. This isn't quiet drinks—this is Thursday turning up.

The feeling: The weekend starts NOW. Grab your crew. Let's go.$PROMPT$,
'v1', TRUE,
'{"style": "pre_weekend_energy", "category": "daily_special", "day_specific": "thursday", "input_schema": {"required": ["headline", "main_deal"], "optional": ["special1", "price1", "special2", "price2", "special3", "price3", "group_deal", "dj_or_event"], "defaults": {"main_deal": "$3 Beers All Night", "group_deal": "Bucket of 5 for $12"}}, "variation_rules": {"style_adjectives": ["pre-weekend energy", "crew gathering", "Thursday turnup", "almost Friday"], "drink_displays": ["beer buckets", "pitcher pour", "shot lineup", "crowd energy"], "camera_styles": ["bucket hero", "bar energy wide", "cheers action"]}}'::JSONB);

-- 11. Margarita Monday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-margarita-monday-v2', 'Margarita Monday Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph making Monday better with margaritas. Bright, fun, the antidote to the Monday blues.

Scene: Margarita-focused celebration. Options:
- Classic margarita on the rocks with perfect salt rim and lime
- Frozen margarita with colorful swirl
- Flight of different margarita flavors
- Bartender rimming glass or pouring from shaker

The colors pop—lime green, salt white, maybe some tropical fruit colors for flavored options. Monday never looked this good.

Fun, fiesta-inspired typography:
"{{headline}}"

MARGARITA MONDAY
{{deal_description}}

• {{marg1}} — ${{price1}}
• {{marg2}} — ${{price2}}
• {{marg3}} — ${{price3}}

"{{pitcher_deal}}"
"{{taco_pairing}}"

The lighting is bright and cheerful—fighting off those Monday blues. The vibe is "Monday is actually fun here."

The feeling: Mondays don't have to be terrible. Start your week right. Margarita in hand.$PROMPT$,
'v1', TRUE,
'{"style": "monday_fiesta", "category": "cocktail", "day_specific": "monday", "input_schema": {"required": ["headline", "deal_description"], "optional": ["marg1", "price1", "marg2", "price2", "marg3", "price3", "pitcher_deal", "taco_pairing"], "defaults": {"deal_description": "$5 House Margaritas", "pitcher_deal": "Pitchers $18", "taco_pairing": "Add tacos for $3"}}, "variation_rules": {"style_adjectives": ["Monday cure", "fiesta vibes", "bright and fun", "week starter"], "marg_styles": ["classic rocks", "frozen swirl", "flavor flight", "pour action"], "camera_styles": ["hero with lime", "colorful lineup", "salt rim detail"]}}'::JSONB);

-- 12. Sunday Funday Specials
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-sq-sunday-funday-v2', 'Sunday Funday Specials', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing Sunday Funday energy—relaxed but celebratory. The weekend isn't over yet.

Scene: Sunday vibes at the bar. Options:
- Bloody Mary bar setup with all the fixings
- Mimosa tower or champagne being poured
- Beer buckets with game day energy (TVs in background)
- Casual group enjoying drinks, Sunday afternoon light

The setting is relaxed but fun—Sunday afternoon, no rush, good company, cold drinks.

Relaxed, fun typography:
"{{headline}}"

SUNDAY FUNDAY
{{main_deal}}

• {{special1}} — ${{price1}}
• {{special2}} — ${{price2}}
• {{special3}} — ${{price3}}

"{{brunch_tie_in}}"
"{{game_day_note}}"

The lighting is natural, afternoon sun—that lazy Sunday glow. The vibe is "the weekend's not over, why act like it is?"

The feeling: One more day of weekend. Make it count. Sunday Funday is calling.$PROMPT$,
'v1', TRUE,
'{"style": "weekend_extension", "category": "daily_special", "day_specific": "sunday", "input_schema": {"required": ["headline", "main_deal"], "optional": ["special1", "price1", "special2", "price2", "special3", "price3", "brunch_tie_in", "game_day_note"], "defaults": {"main_deal": "All-Day Drink Specials", "brunch_tie_in": "Brunch served until 3pm", "game_day_note": "All the games on our screens"}}, "variation_rules": {"style_adjectives": ["lazy Sunday", "weekend extension", "no rush vibes", "funday energy"], "sunday_setups": ["bloody mary bar", "mimosa tower", "beer buckets", "casual group"], "camera_styles": ["afternoon light wide", "drink spread", "relaxed lifestyle"]}}'::JSONB);

-- DAILY SPECIALS - Instagram Stories (4 templates)
-- -----------------------------------------------------

-- 13. Daily Special Announcement (generic day)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-story-announcement-v2', 'Daily Special Announcement Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story announcing today's drink special. Flexible template for any day of the week.

Background: The featured drink or drink setup for today. Options:
- Hero shot of today's special drink
- Bartender preparing the featured drink
- The drink in context at the bar
- Pour action or finishing touches

The vibe is "here's what's special TODAY"—timely and relevant.

Day-specific typography:
"{{day_name}}"
"SPECIAL"

"{{headline}}"

{{drink_name}}
${{special_price}}
(reg. ${{regular_price}})

"{{description}}"
"{{availability}}"

Design elements: Day of week prominent, price callout clear, drink as hero. Space for engagement stickers.

The feeling: Today's the day for this drink. Don't wait until tomorrow.$PROMPT$,
'v1', TRUE,
'{"style": "daily_announcement", "category": "daily_special", "frame_count": 1, "input_schema": {"required": ["day_name", "headline", "drink_name", "special_price"], "optional": ["regular_price", "description", "availability"], "defaults": {"regular_price": "10", "description": "Our featured special", "availability": "All day today"}}, "variation_rules": {"style_adjectives": ["today only", "daily feature", "timely special", "dont miss"], "drink_presentations": ["hero shot", "bartender prep", "bar context", "pour action"], "camera_styles": ["drink hero", "action shot", "context wide"]}}'::JSONB);

-- 14. "Tonight Only" Urgent Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-story-tonight-only-v2', 'Tonight Only Urgent Special Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with maximum urgency—this deal is TONIGHT ONLY. Scarcity drives action.

Background: The special drink or deal with urgency overlay. Options:
- Featured drink with dramatic lighting
- Limited quantity visual (last few bottles, special batch)
- Bartender with "tonight only" energy
- Clock or calendar element showing "today"

The vibe is exclusive and urgent—miss tonight, miss out forever.

Urgent, exclusive typography:
"{{headline}}"

"TONIGHT"
"ONLY"

{{special_name}}
${{special_price}}

"{{scarcity_note}}"
"{{time_window}}"

Design elements: "TONIGHT ONLY" badge prominent, urgency colors, countdown energy. This is not a recurring special—it's NOW.

The feeling: This won't happen again. Tonight is your only chance. Be here.$PROMPT$,
'v1', TRUE,
'{"style": "urgent_exclusive", "category": "daily_special", "frame_count": 1, "input_schema": {"required": ["headline", "special_name", "special_price"], "optional": ["scarcity_note", "time_window"], "defaults": {"scarcity_note": "Limited availability", "time_window": "5pm - Close"}}, "variation_rules": {"style_adjectives": ["tonight only", "exclusive urgent", "one night", "dont miss"], "urgency_elements": ["tonight badge", "scarcity visual", "countdown", "limited quantity"], "camera_styles": ["dramatic hero", "exclusive presentation", "urgency overlay"]}}'::JSONB);


-- 15. Drink of the Day Reveal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-story-drink-reveal-v2', 'Drink of the Day Reveal Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with reveal energy—unveiling today's featured drink. Build anticipation, then deliver.

Background: The drink being revealed or showcased. Options:
- Dramatic reveal shot (drink emerging from shadow)
- Bartender presenting the finished drink
- Close-up detail shot showing off the drink's beauty
- The drink in spotlight, everything else dark

The vibe is "drumroll please"—this is the moment of reveal.

Reveal-style typography:
"{{headline}}"

"TODAY'S"
"DRINK OF THE DAY"

"{{drink_name}}"

{{description}}
${{price}}

"{{bartender_note}}"

Design elements: Reveal animation energy, spotlight effect, "TA-DA" moment. The drink deserves this introduction.

The feeling: We've been waiting to show you this. Here it is. Today's star.$PROMPT$,
'v1', TRUE,
'{"style": "reveal_moment", "category": "daily_special", "frame_count": 1, "input_schema": {"required": ["headline", "drink_name", "price"], "optional": ["description", "bartender_note"], "defaults": {"description": "Crafted with care", "bartender_note": "Bartender''s choice"}}, "variation_rules": {"style_adjectives": ["reveal moment", "spotlight star", "ta-da energy", "featured presentation"], "reveal_styles": ["emerging from shadow", "bartender present", "detail close-up", "spotlight hero"], "camera_styles": ["dramatic reveal", "spotlight hero", "detail beauty shot"]}}'::JSONB);

-- 16. Weekly Specials Schedule Preview
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('daily-story-weekly-preview-v2', 'Weekly Specials Schedule Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story showing the full week of drink specials. Plan your week around our deals.

Background: Multi-drink spread or calendar-style layout. Options:
- Seven drinks representing each day
- Calendar graphic with drink icons
- Bar setup with variety of drinks
- Clean graphic layout with drink imagery

The vibe is "here's your week planned"—helpful and comprehensive.

Schedule-style typography:
"{{headline}}"

"THIS WEEK'S"
"DRINK SPECIALS"

MON: {{monday_special}}
TUE: {{tuesday_special}}
WED: {{wednesday_special}}
THU: {{thursday_special}}
FRI: {{friday_special}}
SAT: {{saturday_special}}
SUN: {{sunday_special}}

"{{save_this}}"

Design elements: Calendar or list layout, easy to read at a glance, "save this" energy. Designed to be screenshot-worthy.

The feeling: Your week just got planned. Save this. Thank us later.$PROMPT$,
'v1', TRUE,
'{"style": "weekly_planner", "category": "daily_special", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["monday_special", "tuesday_special", "wednesday_special", "thursday_special", "friday_special", "saturday_special", "sunday_special", "save_this"], "defaults": {"monday_special": "Margarita Monday $5", "tuesday_special": "Tequila Tuesday $4", "wednesday_special": "Wine Wednesday 50% off", "thursday_special": "Thirsty Thursday $3 beers", "friday_special": "Happy Hour Extended", "saturday_special": "Craft Cocktail Feature", "sunday_special": "Sunday Funday Specials", "save_this": "📱 Screenshot this!"}}, "variation_rules": {"style_adjectives": ["weekly planner", "save worthy", "comprehensive schedule", "plan ahead"], "layout_styles": ["calendar graphic", "list format", "drink lineup", "day icons"], "camera_styles": ["graphic layout", "multi-drink spread", "clean schedule"]}}'::JSONB);

-- =====================================================
-- FEATURED DRINKS TEMPLATES (8 total)
-- =====================================================

-- FEATURED DRINKS - Instagram Square (4 templates)
-- -----------------------------------------------------

-- 17. Cocktail of the Week
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-sq-cocktail-week', 'Cocktail of the Week Feature', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph showcasing a featured cocktail as the star. This is cocktail photography at its best—the drink is art.

Scene: A single stunning cocktail in hero position. The glass is perfect for the drink—coupe, rocks, highball, tiki mug. The garnish is intentional and beautiful. The background is moody bar atmosphere, slightly out of focus.

Details that matter:
- Condensation or frost on the glass
- Perfect ice (clear cubes, crushed, sphere)
- Garnish that tells a story (citrus twist, herb sprig, edible flower)
- Color that pops against the background

Elegant, feature-style typography:
"{{headline}}"

COCKTAIL OF THE WEEK

"{{cocktail_name}}"
{{ingredients_description}}

"${{cocktail_price}}"

"{{bartender_note}}"
"{{availability}}"

The lighting is dramatic—side-lit or backlit to make the drink glow. This cocktail deserves its moment.

The feeling: Our bartender created something special. This week only. Don't miss it.$PROMPT$,
'v1', TRUE,
'{"style": "cocktail_hero", "category": "cocktail", "input_schema": {"required": ["headline", "cocktail_name", "cocktail_price"], "optional": ["ingredients_description", "bartender_note", "availability"], "defaults": {"ingredients_description": "A perfect blend of premium spirits", "bartender_note": "Created by our head bartender", "availability": "This week only"}}, "variation_rules": {"style_adjectives": ["cocktail artistry", "dramatic lighting", "drink as hero", "bartender craft"], "glass_types": ["coupe", "rocks", "highball", "tiki", "martini"], "garnish_styles": ["citrus twist", "herb sprig", "edible flower", "fruit skewer"], "camera_styles": ["dramatic side-lit", "hero center frame", "detail close-up"]}}'::JSONB);

-- 18. Beer Feature / Tap Takeover
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-sq-beer-tap', 'Beer Feature / Tap Takeover', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph featuring craft beer with respect for the brew. Beer lovers will appreciate the details.

Scene options:
- A perfect pour from the tap, head forming beautifully
- Flight of beers showing color range (pale to dark)
- Featured pint glass with brewery branding visible
- Tap handle lineup with the featured beer prominent

The beer shows proper characteristics: appropriate head, correct color, right glassware. Beer nerds notice these things.

Craft-focused typography:
"{{headline}}"

{{feature_type}}

"{{beer_name}}"
{{brewery_name}}

{{beer_style}} · {{abv}}% ABV

"${{pint_price}} pint"

"{{tasting_notes}}"
"{{availability}}"

The lighting shows off the beer's color—amber glow for IPAs, deep ruby for stouts, golden sparkle for pilsners. The glass is the right one for the style.

The feeling: We take beer seriously. This one's special. Come taste why.$PROMPT$,
'v1', TRUE,
'{"style": "craft_beer_respect", "category": "beer", "input_schema": {"required": ["headline", "beer_name", "brewery_name", "pint_price"], "optional": ["feature_type", "beer_style", "abv", "tasting_notes", "availability"], "defaults": {"feature_type": "ON TAP NOW", "beer_style": "IPA", "abv": "6.5", "availability": "While the keg lasts"}}, "variation_rules": {"style_adjectives": ["craft beer respect", "proper pour", "beer nerd approved", "brewery spotlight"], "beer_styles": ["IPA", "Stout", "Pilsner", "Sour", "Lager", "Wheat"], "pour_types": ["tap pour action", "flight lineup", "pint hero", "tap handle focus"], "camera_styles": ["pour action", "flight overhead", "pint hero backlit"]}}'::JSONB);

-- 19. Wine Flight Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-sq-wine-flight', 'Wine Flight Feature', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph showcasing a curated wine flight. The tasting experience elevated and accessible.

Scene: A beautiful wine flight presentation. Options:
- Three or four glasses on a wooden flight board with labels
- Color gradient from light to dark wines
- Overhead shot showing the flight arrangement
- Side angle showing wine colors catching light

The presentation is educational but inviting—this is a tasting journey.

Elegant, educational typography:
"{{headline}}"

WINE FLIGHT
"{{flight_name}}"

{{wine1}} · {{region1}}
{{wine2}} · {{region2}}
{{wine3}} · {{region3}}

${{flight_price}} for the flight

"{{tasting_note}}"
"{{pairing_suggestion}}"

The lighting is warm and intimate, showing off the wine colors beautifully. The vibe is "explore with us"—wine discovery made approachable.

The feeling: Three wines. One journey. Discover your new favorite.$PROMPT$,
'v1', TRUE,
'{"style": "wine_discovery", "category": "wine", "input_schema": {"required": ["headline", "flight_name", "flight_price"], "optional": ["wine1", "region1", "wine2", "region2", "wine3", "region3", "tasting_note", "pairing_suggestion"], "defaults": {"wine1": "Sauvignon Blanc", "region1": "New Zealand", "wine2": "Pinot Noir", "region2": "Oregon", "wine3": "Cabernet", "region3": "Napa Valley", "tasting_note": "Light to bold progression", "pairing_suggestion": "Pairs with our cheese board"}}, "variation_rules": {"style_adjectives": ["wine journey", "tasting discovery", "educational elegance", "approachable sophistication"], "flight_presentations": ["wooden board", "color gradient", "overhead arrangement", "side angle"], "camera_styles": ["flight overhead", "color gradient hero", "detail with labels"]}}'::JSONB);

-- 20. Seasonal Drink Launch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-sq-seasonal-launch', 'Seasonal Drink Launch', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph launching a seasonal drink with excitement. The season's flavors in a glass.

Scene: The seasonal drink as the star with seasonal context. Options:
- Fall: Warm-toned drink with autumn leaves, cozy bar setting
- Winter: Holiday-inspired drink with festive touches
- Spring: Fresh, bright drink with floral elements
- Summer: Refreshing drink with tropical or bright summer vibes

The drink embodies the season—colors, garnishes, glassware all match the seasonal theme.

Seasonal, launch-style typography:
"{{headline}}"

"{{season}} IS HERE"

INTRODUCING
"{{drink_name}}"

{{description}}

${{price}}

"{{availability}}"
"{{seasonal_note}}"

The lighting matches the season—warm and cozy for fall/winter, bright and fresh for spring/summer. This drink IS the season.

The feeling: The season just arrived in a glass. Limited time. Taste it now.$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_launch", "category": "cocktail", "input_schema": {"required": ["headline", "season", "drink_name", "price"], "optional": ["description", "availability", "seasonal_note"], "defaults": {"description": "Seasonal flavors perfectly crafted", "availability": "Available now through the season", "seasonal_note": "Made with seasonal ingredients"}}, "variation_rules": {"style_adjectives": ["seasonal celebration", "limited time", "flavor of the season", "timely launch"], "seasonal_themes": ["fall cozy", "winter festive", "spring fresh", "summer bright"], "camera_styles": ["seasonal context hero", "drink with seasonal props", "mood lighting match"]}}'::JSONB);


-- FEATURED DRINKS - Instagram Stories (4 templates)
-- -----------------------------------------------------

-- 21. New Cocktail Teaser
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-story-cocktail-teaser', 'New Cocktail Teaser Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story teasing a new cocktail before the full reveal. Build anticipation and curiosity.

Background: Mysterious, partial reveal of the new drink. Options:
- Silhouette of the cocktail, details hidden
- Close-up of just the garnish or one element
- Bartender's hands preparing something (drink not visible)
- Ingredients laid out, final drink not shown

The vibe is "something's coming"—intrigue and anticipation.

Teaser-style typography:
"{{headline}}"

"SOMETHING NEW"
"IS COMING"

"{{hint}}"

"{{reveal_date}}"
"{{cta}}"

Design elements: Mystery energy, partial reveals, "coming soon" badges. Don't show the full drink—that's the point.

The feeling: We're working on something special. Stay tuned. You'll want to see this.$PROMPT$,
'v1', TRUE,
'{"style": "mystery_teaser", "category": "cocktail", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["hint", "reveal_date", "cta"], "defaults": {"hint": "Hint: It involves something unexpected...", "reveal_date": "Full reveal this Friday", "cta": "Turn on notifications 🔔"}}, "variation_rules": {"style_adjectives": ["mystery teaser", "coming soon", "anticipation builder", "intrigue"], "teaser_visuals": ["silhouette", "partial garnish", "prep hands", "ingredients only"], "camera_styles": ["mysterious shadow", "detail tease", "hidden reveal"]}}'::JSONB);

-- 22. Bartender's Choice Spotlight
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-story-bartender-choice', 'Bartender''s Choice Spotlight Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story featuring the bartender's personal recommendation. Human connection to the drink.

Background: The bartender with their chosen drink. Options:
- Bartender holding or presenting their pick
- Split screen: bartender portrait + drink hero
- Bartender behind the bar with drink in foreground
- Action shot of bartender making their choice

The vibe is personal recommendation—"trust me on this one."

Personal, recommendation typography:
"{{headline}}"

"{{bartender_name}}'S"
"PICK"

"{{drink_name}}"

"{{bartender_quote}}"

${{price}}

"{{try_it_cta}}"

Design elements: Personal touch, bartender's name prominent, quote from them. This is a human recommendation, not just a menu item.

The feeling: Our bartender knows their stuff. This is what they'd order. Trust them.$PROMPT$,
'v1', TRUE,
'{"style": "personal_recommendation", "category": "cocktail", "frame_count": 1, "input_schema": {"required": ["headline", "bartender_name", "drink_name", "price"], "optional": ["bartender_quote", "try_it_cta"], "defaults": {"bartender_quote": "This is what I make for myself after a long shift", "try_it_cta": "Ask for it by name"}}, "variation_rules": {"style_adjectives": ["personal pick", "bartender approved", "trust the expert", "insider recommendation"], "bartender_shots": ["holding drink", "split screen", "behind bar", "making drink"], "camera_styles": ["portrait with drink", "action making", "presentation shot"]}}'::JSONB);

-- 23. "Try This" Drink Recommendation
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-story-try-this', 'Try This Drink Recommendation Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with direct recommendation energy. Confident, helpful, "you need this."

Background: The recommended drink looking irresistible. Options:
- Hero shot of the drink, perfectly styled
- POV shot as if being handed to viewer
- The drink in an inviting setting
- Close-up showing off the best details

The vibe is friendly advice—"seriously, try this."

Direct, friendly typography:
"{{headline}}"

"TRY THIS"

"{{drink_name}}"

{{why_try_it}}

${{price}}

"{{perfect_for}}"
"{{order_cta}}"

Design elements: Direct and confident, "TRY THIS" prominent, the drink sells itself. Friendly recommendation energy.

The feeling: We're telling you—this one's good. Just trust us and order it.$PROMPT$,
'v1', TRUE,
'{"style": "direct_recommendation", "category": "cocktail", "frame_count": 1, "input_schema": {"required": ["headline", "drink_name", "price"], "optional": ["why_try_it", "perfect_for", "order_cta"], "defaults": {"why_try_it": "Refreshing, balanced, and dangerously easy to drink", "perfect_for": "Perfect for: Anyone who likes good drinks", "order_cta": "Just ask for it 👆"}}, "variation_rules": {"style_adjectives": ["direct advice", "confident recommendation", "trust us", "you need this"], "drink_presentations": ["hero irresistible", "POV handoff", "inviting setting", "detail close-up"], "camera_styles": ["hero confident", "POV perspective", "inviting wide"]}}'::JSONB);

-- 24. Behind the Bar (making the drink)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('featured-story-behind-bar', 'Behind the Bar Making Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story showing the drink being made. Process and craft on display.

Background: Action shots of drink preparation. Options:
- Shaking the cocktail shaker with motion blur
- Pouring from jigger or bottle with precision
- Muddling ingredients in the glass
- Straining into the final glass
- Adding the finishing garnish

The vibe is "watch the magic happen"—craft and skill on display.

Behind-the-scenes typography:
"{{headline}}"

"BEHIND THE BAR"

MAKING THE
"{{drink_name}}"

"{{process_note}}"

"{{come_watch}}"

Design elements: Action energy, motion blur acceptable, craft focus. This is about the process, not just the result.

The feeling: There's art in every pour. Come watch us work. Then taste the result.$PROMPT$,
'v1', TRUE,
'{"style": "craft_process", "category": "cocktail", "frame_count": 1, "input_schema": {"required": ["headline", "drink_name"], "optional": ["process_note", "come_watch"], "defaults": {"process_note": "Shaken, not stirred. Always.", "come_watch": "Come grab a seat at the bar 🍸"}}, "variation_rules": {"style_adjectives": ["craft process", "behind scenes", "bartender skill", "watch the magic"], "action_shots": ["shaking motion", "precise pour", "muddling", "straining", "garnish finish"], "camera_styles": ["action motion", "detail process", "hands at work"]}}'::JSONB);

-- =====================================================
-- BRUNCH DRINKS TEMPLATES (4 total)
-- =====================================================

-- BRUNCH DRINKS - Instagram Square (2 templates)
-- -----------------------------------------------------

-- 25. Bottomless Brunch Drinks
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('brunch-sq-bottomless', 'Bottomless Brunch Drinks', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing bottomless brunch energy—celebratory, social, indulgent. This is weekend morning done right.

Scene: The brunch drink spread in all its glory. Options:
- Mimosa tower or multiple champagne flutes with orange juice gradient
- Bloody Mary bar setup with all the fixings
- Bellinis in various fruit colors
- Pitcher of sangria with fruit visible

The setting is bright, airy, weekend morning vibes. Natural light streaming in. Friends' hands visible reaching for glasses. The energy is celebratory but relaxed.

Fun, celebratory typography:
"{{headline}}"

BOTTOMLESS {{drink_type}}
${{bottomless_price}}

{{time_limit}}

CHOOSE FROM:
• {{option1}}
• {{option2}}
• {{option3}}

"{{brunch_hours}}"
"{{reservation_note}}"

The lighting is bright and fresh—late morning sun, the optimism of a weekend with no obligations. Bubbles are visible in the champagne. Colors are vibrant.

The feeling: It's the weekend. You're with your people. The drinks keep coming. This is living.$PROMPT$,
'v1', TRUE,
'{"style": "weekend_celebration", "category": "brunch", "input_schema": {"required": ["headline", "drink_type", "bottomless_price"], "optional": ["time_limit", "option1", "option2", "option3", "brunch_hours", "reservation_note"], "defaults": {"time_limit": "90 minutes of unlimited pours", "option1": "Classic Mimosa", "option2": "Bellini", "option3": "Bloody Mary", "brunch_hours": "Sat & Sun 10am-3pm", "reservation_note": "Reservations recommended"}}, "variation_rules": {"style_adjectives": ["weekend celebration", "bottomless joy", "brunch vibes", "friends gathering"], "drink_types": ["mimosas", "bloody marys", "bellinis", "sangria", "champagne"], "brunch_scenes": ["mimosa tower", "bloody mary bar", "champagne pour", "friends cheersing"], "camera_styles": ["drink spread overhead", "pour action", "cheers moment"]}}'::JSONB);

-- 26. Brunch Cocktail Menu Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('brunch-sq-cocktail-menu', 'Brunch Cocktail Menu Feature', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph showcasing the full brunch cocktail menu. Options beyond just mimosas.

Scene: A spread of brunch cocktails showing variety. Options:
- Multiple brunch drinks arranged beautifully (mimosa, bloody, bellini, irish coffee)
- Menu-style layout with drinks as heroes
- Brunch table setting with various cocktails
- Bartender presenting brunch drink options

The message is "we have more than just mimosas"—brunch cocktail variety.

Menu-style typography:
"{{headline}}"

BRUNCH COCKTAILS

{{drink1}} — ${{price1}}
{{drink2}} — ${{price2}}
{{drink3}} — ${{price3}}
{{drink4}} — ${{price4}}

"{{bottomless_option}}"
"{{brunch_hours}}"

The lighting is bright brunch energy—morning light, fresh and inviting. The variety of drinks shows there's something for everyone.

The feeling: Whatever your brunch mood, we've got your drink. Explore the menu.$PROMPT$,
'v1', TRUE,
'{"style": "brunch_variety", "category": "brunch", "input_schema": {"required": ["headline"], "optional": ["drink1", "price1", "drink2", "price2", "drink3", "price3", "drink4", "price4", "bottomless_option", "brunch_hours"], "defaults": {"drink1": "Classic Mimosa", "price1": "8", "drink2": "Bloody Mary", "price2": "12", "drink3": "Bellini", "price3": "10", "drink4": "Irish Coffee", "price4": "11", "bottomless_option": "Go bottomless for $25", "brunch_hours": "Brunch served Sat & Sun 10am-3pm"}}, "variation_rules": {"style_adjectives": ["brunch variety", "menu showcase", "options for everyone", "beyond mimosas"], "drink_spreads": ["variety lineup", "menu layout", "table setting", "bartender presentation"], "camera_styles": ["spread overhead", "menu style", "variety hero"]}}'::JSONB);

-- BRUNCH DRINKS - Instagram Stories (2 templates)
-- -----------------------------------------------------

-- 27. "Brunch is Served" Weekend Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('brunch-story-weekend-reminder', 'Brunch is Served Weekend Reminder Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story as a weekend brunch reminder. Wake up and come drink with us.

Background: Brunch drinks ready and waiting. Options:
- Fresh mimosas just poured, bubbles rising
- Brunch table setup with drinks prominent
- Bartender preparing brunch cocktails
- Sunny patio or bright interior with brunch vibes

The vibe is "good morning, it's brunch time"—weekend energy.

Weekend morning typography:
"{{headline}}"

"BRUNCH"
"IS SERVED"

{{brunch_hours}}

"{{drink_highlight}}"
"{{reservation_cta}}"

Design elements: Weekend morning energy, bright and fresh, "NOW SERVING" badges. Posted Saturday/Sunday morning to catch the brunch crowd.

The feeling: Wake up. It's the weekend. Brunch is calling. Bring your crew.$PROMPT$,
'v1', TRUE,
'{"style": "weekend_morning", "category": "brunch", "frame_count": 1, "input_schema": {"required": ["headline", "brunch_hours"], "optional": ["drink_highlight", "reservation_cta"], "defaults": {"drink_highlight": "Bottomless mimosas $25", "reservation_cta": "Walk-ins welcome!"}}, "variation_rules": {"style_adjectives": ["weekend morning", "brunch calling", "wake up energy", "sunny vibes"], "brunch_scenes": ["fresh mimosas", "table setup", "bartender prep", "sunny patio"], "camera_styles": ["bright morning", "fresh pour", "inviting setup"]}}'::JSONB);

-- 28. Build Your Own Bloody Mary Bar
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('brunch-story-bloody-mary-bar', 'Build Your Own Bloody Mary Bar Story', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story showcasing the Bloody Mary bar experience. Interactive, customizable, over-the-top.

Background: The Bloody Mary bar in all its glory. Options:
- Full spread of toppings and garnishes
- Someone building their loaded Bloody Mary
- The most over-the-top Bloody Mary creation
- Before/after of base drink to loaded masterpiece

The vibe is "go crazy with it"—the Bloody Mary bar is an experience.

Interactive, fun typography:
"{{headline}}"

"BUILD YOUR OWN"
"BLOODY MARY BAR"

${{base_price}} base
UNLIMITED TOPPINGS

"{{topping_highlights}}"
"{{challenge}}"

Design elements: Abundance of toppings visible, interactive energy, "BUILD IT" call to action. This is an experience, not just a drink.

The feeling: Start with the base. Then go wild. Bacon? Shrimp? Slider on top? Yes to all.$PROMPT$,
'v1', TRUE,
'{"style": "interactive_experience", "category": "brunch", "frame_count": 1, "input_schema": {"required": ["headline", "base_price"], "optional": ["topping_highlights", "challenge"], "defaults": {"topping_highlights": "Bacon • Pickles • Olives • Celery • Cheese • Shrimp • And more...", "challenge": "Can you build the tallest one? 🏆"}}, "variation_rules": {"style_adjectives": ["interactive build", "over the top", "customizable experience", "go wild"], "bar_presentations": ["full topping spread", "building action", "loaded creation", "before after"], "camera_styles": ["spread abundance", "building POV", "loaded hero"]}}'::JSONB);


-- =====================================================
-- SUMMARY: 28 Happy Hour & Drink Specials Templates
-- =====================================================
-- 
-- HAPPY HOUR (8 templates):
--   Instagram Square: 4 (daily-announcement, extended-late-night, food-drink-combo, best-in-town)
--   Instagram Stories: 4 (its-time, countdown, last-call, poll)
--
-- DAILY DRINK SPECIALS (8 templates):
--   Instagram Square: 4 (wine-wednesday, thirsty-thursday, margarita-monday, sunday-funday)
--   Instagram Stories: 4 (announcement, tonight-only, drink-reveal, weekly-preview)
--
-- FEATURED DRINKS (8 templates):
--   Instagram Square: 4 (cocktail-week, beer-tap, wine-flight, seasonal-launch)
--   Instagram Stories: 4 (cocktail-teaser, bartender-choice, try-this, behind-bar)
--
-- BRUNCH DRINKS (4 templates):
--   Instagram Square: 2 (bottomless, cocktail-menu)
--   Instagram Stories: 2 (weekend-reminder, bloody-mary-bar)
-- =====================================================
