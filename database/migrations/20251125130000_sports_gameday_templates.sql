-- Sports & Game Day Templates Migration
-- Generated: 2025-11-25
-- Total Templates: 26 (10 Instagram Square, 8 Instagram Stories, 5 Facebook Posts, 3 Carousels)

-- =====================================================
-- INSTAGRAM SQUARE (1:1) - 10 TEMPLATES
-- =====================================================

-- 1. Game Day Wings Special (Classic)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-wings-special', 'Game Day Wings Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing the electric energy of game day at a sports bar. The scene is alive with anticipation—multiple TV screens visible in the soft-focus background showing pre-game coverage, their blue glow adding atmosphere.

Hero focus: A massive platter of crispy wings glistening with sauce, arranged on a branded paper-lined basket or slate board. Steam rises subtly. The wings show perfect char and glaze—buffalo red, honey gold, or smoky brown depending on flavor.

Prominent chalkboard, table tent, or bold graphic overlay displays:
"{{headline}}"
"{{wing_flavor}} WINGS"
"{{wing_count}} for ${{wing_price}}"
"{{game_reference}}"
"{{time_info}}"

Supporting elements: Celery and carrot sticks, blue cheese and ranch cups, a frosty beer mug with condensation, napkin stack. Maybe a jersey or team colors subtly visible in the background.

The lighting mixes warm tungsten from the bar with the cool TV glow—that specific sports bar ambiance. Crowd energy implied through motion blur of people in background.

This is where you want to be on game day.$PROMPT$,
'v1', TRUE,
'{"style": "sports_bar_energy", "sports_type": "generic", "food_focus": "wings", "input_schema": {"required": ["headline", "wing_flavor", "wing_count", "wing_price"], "optional": ["game_reference", "time_info"], "defaults": {"game_reference": "Every Game Day", "time_info": "During all games"}}, "variation_rules": {"style_adjectives": ["electric game day energy", "TV glow atmosphere", "crowd anticipation", "sports bar authentic"], "sauce_options": ["buffalo red", "honey BBQ gold", "garlic parmesan", "mango habanero"], "camera_styles": ["hero platter overhead", "45-degree with TV background", "close-up sauce drip"]}}'::JSONB);

-- 2. Bucket & Pitcher Deal
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-bucket-pitcher', 'Bucket & Pitcher Game Day Deal', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph of the ultimate game day drink setup. A metal bucket filled with ice and bottled beers (labels visible but not the focus), alongside a frosty pitcher of draft beer with perfect head. Condensation drips down everything—it's cold and ready.

The scene is set at a high-top or bar table with the game visible on screens in the background. Friends' hands reaching for bottles add human energy without showing faces.

Bold signage or graphic overlay:
"{{headline}}"
"{{bucket_count}} BUCKET — ${{bucket_price}}"
"{{pitcher_size}} PITCHER — ${{pitcher_price}}"
"{{combo_deal}}"
"{{availability}}"

Supporting elements: Game day snacks in soft focus (nachos, pretzels), team-colored napkins or coasters, maybe a scoreboard graphic element.

The lighting is warm bar ambiance with TV glow. The feeling of settling in with your crew for a long game. Cold drinks, good company, big screens.

This is how you do game day right.$PROMPT$,
'v1', TRUE,
'{"style": "drink_deal_hero", "sports_type": "generic", "food_focus": "drinks", "input_schema": {"required": ["headline", "bucket_count", "bucket_price", "pitcher_size", "pitcher_price"], "optional": ["combo_deal", "availability"], "defaults": {"combo_deal": "Add wings for $10", "availability": "Game days only"}}, "variation_rules": {"style_adjectives": ["ice cold refreshing", "crew gathering energy", "bar table setup", "condensation detail"], "drink_options": ["domestic bucket", "import bucket", "craft pitcher", "margarita pitcher"], "camera_styles": ["bucket hero overhead", "pitcher pour action", "table spread wide"]}}'::JSONB);

-- 3. Nacho/Appetizer Platter Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-nacho-platter', 'Game Day Nacho Platter Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph of an absolutely loaded nacho platter that demands attention. This is the centerpiece of any game day table—a mountain of tortilla chips buried under melted cheese, jalapeños, sour cream dollops, guacamole, pico de gallo, and your choice of protein.

The platter sits on a rustic wooden board or large oval plate, steam rising from the freshly melted cheese. Cheese pull moment captured—a chip being lifted with that perfect stretch of melted goodness.

Multiple TV screens glow in the background showing the game. The bar atmosphere is palpable—warm lighting, crowd energy suggested through soft-focus figures.

Bold typography overlay:
"{{headline}}"
"LOADED {{nacho_style}} NACHOS"
"${{nacho_price}}"
"{{protein_options}}"
"{{game_day_note}}"

Supporting elements: Frosty beer glasses, extra salsa cups, lime wedges. Hands reaching in from the edges—this is meant to be shared.

The vibe: This platter is the reason your crew picks this spot. Shareable, craveable, game day essential.$PROMPT$,
'v1', TRUE,
'{"style": "shareable_feast", "sports_type": "generic", "food_focus": "nachos", "input_schema": {"required": ["headline", "nacho_style", "nacho_price"], "optional": ["protein_options", "game_day_note"], "defaults": {"protein_options": "Add chicken, beef, or carnitas", "game_day_note": "Perfect for sharing"}}, "variation_rules": {"style_adjectives": ["loaded indulgent", "cheese pull moment", "shareable feast", "game day essential"], "topping_options": ["classic supreme", "BBQ chicken", "carne asada", "buffalo chicken"], "camera_styles": ["overhead spread", "cheese pull action", "45-degree hero"]}}'::JSONB);


-- 4. Happy Hour Game Day Extension
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-happy-hour-extension', 'Happy Hour Game Day Extension', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph announcing extended happy hour for game day. The bar is set up beautifully—a lineup of craft cocktails, beer flights, and discounted appetizers arranged artfully on the bar top.

The scene captures that golden hour bar moment—warm lighting, the promise of a great evening ahead. TV screens in the background show pre-game coverage, setting the stage.

Clean, bold typography overlay:
"{{headline}}"
"HAPPY HOUR EXTENDED"
"{{start_time}} - {{end_time}}"
"{{drink_special}}"
"{{food_special}}"
"{{game_reference}}"

The drinks are the stars: perfectly garnished cocktails, beers with ideal head, maybe a signature game day drink in team colors (without logos). Condensation on glasses catches the light.

Supporting elements: Small plates of discounted apps, cocktail napkins, the warm wood of the bar. A bartender's hands in motion adds energy.

The message: Game day means happy hour doesn't end early. Stay longer, save more, watch it all.$PROMPT$,
'v1', TRUE,
'{"style": "happy_hour_extended", "sports_type": "generic", "food_focus": "drinks", "input_schema": {"required": ["headline", "start_time", "end_time", "drink_special"], "optional": ["food_special", "game_reference"], "defaults": {"food_special": "Half-price apps", "game_reference": "Every game day"}}, "variation_rules": {"style_adjectives": ["golden hour warmth", "bar lineup beauty", "extended celebration", "pre-game anticipation"], "drink_options": ["craft cocktails", "beer flights", "wine specials", "signature drinks"], "camera_styles": ["bar lineup wide", "drink detail hero", "bartender action"]}}'::JSONB);

-- 5. Rivalry Game Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-rivalry-game', 'Rivalry Game Announcement', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph with intense rivalry energy. The sports bar is split down the middle—one side decorated in one team's colors, the other side in the opponent's colors. No actual logos, just the color schemes creating visual tension.

The TV wall dominates the background, screens showing matchup graphics or team imagery. The atmosphere is charged—you can feel the anticipation of a big rivalry game.

Bold, confrontational typography:
"{{headline}}"
"{{team1}} vs {{team2}}"
"{{game_date}}"
"{{game_time}}"
"PICK YOUR SIDE"
"{{rivalry_special}}"

The scene shows both fan sections—maybe team-colored drinks, divided seating areas, friendly competition energy. Hands raised, cheering poses in soft focus.

Supporting elements: Team-colored napkins and cups on each side, maybe a "house divided" sign, scoreboard graphic element.

The vibe: This isn't just a game—it's THE game. Bragging rights on the line. Where will you be standing when it's over?$PROMPT$,
'v1', TRUE,
'{"style": "rivalry_intensity", "sports_type": "generic", "food_focus": "none", "input_schema": {"required": ["headline", "team1", "team2", "game_date", "game_time"], "optional": ["rivalry_special"], "defaults": {"rivalry_special": "Wear your colors for $1 off drinks"}}, "variation_rules": {"style_adjectives": ["intense rivalry energy", "house divided", "pick your side", "bragging rights"], "rivalry_types": ["college football", "NFL division", "NBA conference", "hockey classic"], "camera_styles": ["split venue wide", "TV wall hero", "crowd energy blur"]}}'::JSONB);

-- 6. Playoff Watch Party
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-playoff-party', 'Playoff Watch Party', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing playoff intensity. The stakes are higher, the energy is electric. The sports bar is packed (implied through crowd blur), every screen showing the same crucial game.

The scene is dramatic—maybe slightly darker lighting with the TV glow more prominent, creating that focused playoff atmosphere. Everyone is locked in.

Bold, urgent typography:
"{{headline}}"
"{{playoff_round}}"
"{{matchup}}"
"{{game_date}} · {{game_time}}"
"{{special_offer}}"
"WIN OR GO HOME"

The food and drinks reflect the elevated stakes: premium platters, championship-worthy spreads, maybe champagne on ice (just in case). Everything feels bigger, more important.

Supporting elements: Playoff bracket graphics, "Road to the Championship" elements, intense crowd reactions in background.

The vibe: This is what we've been waiting for. Every play matters. Every moment counts. Be here for history.$PROMPT$,
'v1', TRUE,
'{"style": "playoff_intensity", "sports_type": "generic", "food_focus": "none", "input_schema": {"required": ["headline", "playoff_round", "matchup", "game_date", "game_time"], "optional": ["special_offer"], "defaults": {"special_offer": "Playoff specials all game"}}, "variation_rules": {"style_adjectives": ["playoff intensity", "win or go home", "championship stakes", "every play matters"], "playoff_types": ["NFL Playoffs", "March Madness", "NBA Playoffs", "NHL Playoffs", "World Series"], "camera_styles": ["dramatic TV glow", "packed house wide", "intense crowd focus"]}}'::JSONB);

-- 7. Sunday Funday Brunch + Games
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-sunday-funday', 'Sunday Funday Brunch + Games', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph blending brunch vibes with game day energy. The best of both worlds—a beautiful brunch spread with TVs showing Sunday games in the background.

The scene is bright and inviting: morning light mixing with the bar atmosphere. A table loaded with brunch favorites—eggs benedict, chicken and waffles, breakfast burritos—alongside mimosa flights and bloody marys.

Cheerful, energetic typography:
"{{headline}}"
"SUNDAY FUNDAY"
"BRUNCH + GAMES"
"{{brunch_time}}"
"{{mimosa_deal}}"
"{{bloody_mary_deal}}"
"{{game_schedule}}"

The drinks are colorful and Instagram-worthy: bright orange mimosas, loaded bloody marys with all the garnishes, maybe a boozy coffee drink. The food is hearty and satisfying.

Supporting elements: Sunday newspaper, relaxed crowd in background, maybe someone in a jersey enjoying brunch. The vibe is leisurely but excited.

The message: Start your Sunday right. Great food, bottomless drinks, and all the games. This is how Sundays should be.$PROMPT$,
'v1', TRUE,
'{"style": "sunday_funday", "sports_type": "football", "food_focus": "brunch", "input_schema": {"required": ["headline", "brunch_time", "mimosa_deal"], "optional": ["bloody_mary_deal", "game_schedule"], "defaults": {"bloody_mary_deal": "Build-your-own Bloody Mary bar", "game_schedule": "All Sunday games on our screens"}}, "variation_rules": {"style_adjectives": ["brunch meets game day", "Sunday funday vibes", "leisurely excitement", "best of both worlds"], "brunch_options": ["eggs benedict", "chicken and waffles", "breakfast burrito", "avocado toast"], "camera_styles": ["brunch spread overhead", "mimosa flight hero", "table scene wide"]}}'::JSONB);

-- 8. Monday Night Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-monday-night', 'Monday Night Football Special', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing Monday Night Football energy. The work week just started, but tonight we celebrate. The bar is set up for the primetime game—big screens prominent, the crowd settling in for the main event.

The scene has that specific Monday night feel: people still in work clothes loosening ties, the relief of the first game of the week, the anticipation of primetime football.

Bold, primetime typography:
"{{headline}}"
"MONDAY NIGHT FOOTBALL"
"{{matchup}}"
"KICKOFF {{kickoff_time}}"
"{{food_special}}"
"{{drink_special}}"

The food special is the hero: maybe a burger and beer combo, a Monday-specific deal that makes the start of the week better. Steam rising, cheese melting, the perfect comfort food.

Supporting elements: Work bags under barstools, loosened ties, the transition from work to play. TV countdown graphics, the ESPN Monday Night Football aesthetic (without logos).

The vibe: Monday doesn't have to be boring. This is the cure for the case of the Mondays.$PROMPT$,
'v1', TRUE,
'{"style": "monday_night_primetime", "sports_type": "football", "food_focus": "burgers", "input_schema": {"required": ["headline", "matchup", "kickoff_time", "food_special"], "optional": ["drink_special"], "defaults": {"drink_special": "$4 domestic drafts"}}, "variation_rules": {"style_adjectives": ["primetime energy", "work week escape", "Monday night cure", "after work celebration"], "food_options": ["burger and beer combo", "wing special", "pizza deal", "appetizer sampler"], "camera_styles": ["burger hero with TV", "bar scene wide", "after-work crowd"]}}'::JSONB);


-- 9. March Madness Bracket Challenge
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-march-madness', 'March Madness Bracket Challenge', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph capturing March Madness energy. Multiple games on multiple screens—the chaos and excitement of tournament basketball. The bar is set up for an all-day viewing marathon.

The scene shows the unique March Madness setup: maybe a bracket board visible, multiple TVs showing different games, the frenetic energy of upset alerts and buzzer beaters.

Tournament-style typography:
"{{headline}}"
"MARCH MADNESS"
"{{round_name}}"
"{{bracket_prize}}"
"{{viewing_schedule}}"
"EVERY GAME. EVERY UPSET."

The atmosphere is electric but marathon-ready: comfortable seating for long viewing sessions, shareable appetizers, pitchers for the table. People checking phones for other scores, the multi-screen experience.

Supporting elements: Printed brackets on tables, pencils for updates, maybe a leaderboard for the bar's bracket pool. The communal experience of tournament watching.

The vibe: This is bracket season. Cinderellas and busted brackets. Be here for every moment of madness.$PROMPT$,
'v1', TRUE,
'{"style": "tournament_madness", "sports_type": "basketball", "food_focus": "shareable", "input_schema": {"required": ["headline", "round_name"], "optional": ["bracket_prize", "viewing_schedule"], "defaults": {"bracket_prize": "Win our bracket pool - $500 prize!", "viewing_schedule": "All games, all day"}}, "variation_rules": {"style_adjectives": ["tournament chaos", "bracket madness", "upset energy", "marathon viewing"], "round_options": ["First Four", "Round of 64", "Sweet 16", "Elite Eight", "Final Four", "Championship"], "camera_styles": ["multi-screen chaos", "bracket board focus", "crowd reaction wide"]}}'::JSONB);

-- 10. Championship Game Event
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-sq-championship', 'Championship Game Event', 'bar_grill', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph for THE biggest game of the year. Championship energy—the bar transformed for the ultimate viewing experience. This is an EVENT, not just a game.

The scene is premium: maybe special decorations, a red carpet feel, the biggest screen front and center. The atmosphere suggests this is a destination, not just a bar with a TV.

Championship-worthy typography:
"{{headline}}"
"{{championship_name}}"
"{{matchup}}"
"{{game_date}}"
"DOORS OPEN {{doors_time}}"
"KICKOFF {{kickoff_time}}"
"{{ticket_info}}"
"{{special_features}}"

The setup is elevated: maybe a buffet spread, premium drink packages, reserved seating areas. Champagne ready for the winners. The production value is higher.

Supporting elements: Championship trophy graphics (generic), confetti ready, photo backdrop for fans, maybe a halftime show viewing area.

The vibe: This is the one. The game everyone's been waiting for. The only place to watch it. Reserve your spot—this will sell out.$PROMPT$,
'v1', TRUE,
'{"style": "championship_premium", "sports_type": "big_game", "food_focus": "premium", "input_schema": {"required": ["headline", "championship_name", "matchup", "game_date", "kickoff_time"], "optional": ["doors_time", "ticket_info", "special_features"], "defaults": {"doors_time": "2 hours before kickoff", "ticket_info": "Reserve your spot - limited capacity", "special_features": "Buffet, drink specials, prizes"}}, "variation_rules": {"style_adjectives": ["championship premium", "ultimate event", "destination viewing", "once a year"], "championship_types": ["Super Bowl", "World Series", "NBA Finals", "Stanley Cup", "College Championship", "World Cup Final"], "camera_styles": ["venue showcase wide", "premium setup hero", "event atmosphere"]}}'::JSONB);

-- =====================================================
-- INSTAGRAM STORIES (9:16) - 8 TEMPLATES
-- =====================================================

-- 1. Watch Party Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-watch-party', 'Watch Party Announcement', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with high-energy game day announcement. Dynamic, urgent, designed to create FOMO.

Background: The bar setup for game day—multiple screens visible, maybe showing the teams' logos or pre-game graphics. String lights, team decorations, the buzz of preparation. Could be slightly motion-blurred to convey energy.

Bold, attention-grabbing typography:
"{{headline}}"
"{{team1}} vs {{team2}}"
"{{game_date}}"
"{{game_time}}"
"{{special_offer}}"
"{{cta}}"

Design elements: Could include subtle team color accents (without using actual logos—copyright), sports iconography (generic football, basketball, etc.), countdown energy.

Space for Instagram countdown sticker if applicable.

The vibe: This is THE place to watch. Don't miss it. Your couch can't compete with this.$PROMPT$,
'v1', TRUE,
'{"style": "urgent_fomo", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "team1", "team2", "game_date", "game_time"], "optional": ["special_offer", "cta"], "defaults": {"special_offer": "Drink specials all game", "cta": "Tag your crew 👇"}}, "variation_rules": {"style_adjectives": ["high-energy urgent", "FOMO-inducing", "crowd anticipation", "big game energy"], "sports_icons": ["football", "basketball", "baseball", "hockey", "soccer"], "camera_styles": ["bar setup wide", "TV wall focus", "crowd energy blur"]}}'::JSONB);

-- 2. Score Prediction Poll
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-prediction', 'Score Prediction Engagement', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story designed for engagement—a score prediction or game pick that begs for interaction.

Background: Sports bar atmosphere with screens showing team matchup graphics or pre-game coverage. Energy and anticipation. Could be slightly darkened to make text pop.

Bold, playful typography:
"{{headline}}"
"{{team1}}"
vs
"{{team2}}"
"WHO YOU GOT? 🏈"

Clear space in the middle for Instagram poll sticker or slider.

"{{prize_incentive}}"
"{{game_time_reminder}}"

The design is intentionally incomplete—it NEEDS the poll sticker to work. Interactive, fun, gets people invested before they even show up.

The vibe: We want to know what you think. Be part of the action. Bragging rights on the line.$PROMPT$,
'v1', TRUE,
'{"style": "interactive_engagement", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "team1", "team2"], "optional": ["prize_incentive", "game_time_reminder"], "defaults": {"prize_incentive": "Closest guess wins a free app!", "game_time_reminder": "Kickoff at 7pm"}}, "variation_rules": {"style_adjectives": ["interactive playful", "poll-ready design", "engagement focused", "prediction energy"], "poll_types": ["winner pick", "score prediction", "MVP guess", "first scorer"], "camera_styles": ["TV matchup background", "bar atmosphere blur", "team colors accent"]}}'::JSONB);

-- 3. "We're Open" Game Day Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-were-open', 'Game Day We Are Open Reminder', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story serving as a game day reminder that you're open and ready. Simple, clear, effective.

Background: The bar looking pristine and ready—TVs on, tables set, maybe staff doing final prep. The calm before the storm. Clean, inviting, professional.

Clear, welcoming typography:
"{{headline}}"
"WE'RE OPEN"
"{{game_name}}"
"{{game_time}}"
"DOORS OPEN {{open_time}}"
"{{seating_note}}"
"{{special_teaser}}"

The image should feel like an invitation—come on in, we're ready for you. Not crowded yet, but the energy is building.

Supporting elements: Maybe a "GAME DAY" neon sign, TVs showing pre-game, the bar fully stocked and gleaming.

The vibe: We're here, we're ready, come watch with us. First come, first served—don't wait too long.$PROMPT$,
'v1', TRUE,
'{"style": "welcoming_reminder", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "game_name", "game_time"], "optional": ["open_time", "seating_note", "special_teaser"], "defaults": {"open_time": "2 hours before kickoff", "seating_note": "First come, first served", "special_teaser": "Game day specials ready"}}, "variation_rules": {"style_adjectives": ["welcoming invitation", "ready and waiting", "calm before storm", "professional setup"], "time_contexts": ["early morning", "afternoon", "evening primetime"], "camera_styles": ["venue ready wide", "bar setup clean", "TV wall inviting"]}}'::JSONB);

-- 4. Halftime Special Flash Sale
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-halftime-flash', 'Halftime Special Flash Sale', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story announcing a halftime flash sale. Urgent, time-limited, designed to drive immediate action.

Background: The bar during halftime—people stretching, ordering, the brief pause in action. TVs showing halftime coverage or analysis. The energy is still high but there's a window.

Urgent, flash-sale typography:
"⚡ HALFTIME FLASH ⚡"
"{{headline}}"
"{{deal_description}}"
"{{original_price}} → ${{sale_price}}"
"HALFTIME ONLY"
"{{time_limit}}"
"ORDER NOW 🏃"

The design screams urgency: maybe a countdown timer graphic, flashing elements, bold colors. This deal won't last.

The featured item should be visible and appetizing—whatever's on special, make it look irresistible.

The vibe: You have 15 minutes. This deal disappears at kickoff. Move fast.$PROMPT$,
'v1', TRUE,
'{"style": "flash_sale_urgent", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "deal_description", "sale_price"], "optional": ["original_price", "time_limit"], "defaults": {"original_price": "", "time_limit": "15 minutes only"}}, "variation_rules": {"style_adjectives": ["flash sale urgent", "time-limited FOMO", "halftime hustle", "act now energy"], "deal_types": ["appetizer special", "drink deal", "combo offer", "dessert flash"], "camera_styles": ["featured item hero", "timer overlay", "urgent graphics"]}}'::JSONB);


-- 5. Post-Game Celebration/Recap
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-postgame', 'Post-Game Celebration Recap', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story capturing the post-game energy. Whether celebrating a win or commiserating a loss, the community moment after the final whistle.

Background: The bar right after the game—either jubilant celebration (high-fives, cheering, maybe confetti) or the quiet solidarity of a tough loss. Real emotion, real community.

Celebratory or reflective typography:
"{{headline}}"
"FINAL SCORE"
"{{team1}} {{score1}} - {{score2}} {{team2}}"
"{{reaction_text}}"
"{{next_game_tease}}"
"{{closing_cta}}"

For wins: Energy, celebration, maybe champagne popping, the joy of victory shared with your bar family.
For losses: Solidarity, "we'll get 'em next time" energy, the comfort of being with fellow fans.

The vibe: This is why you watch here—for these moments, win or lose. The shared experience. See you next game.$PROMPT$,
'v1', TRUE,
'{"style": "postgame_community", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "team1", "team2", "score1", "score2"], "optional": ["reaction_text", "next_game_tease", "closing_cta"], "defaults": {"reaction_text": "What a game!", "next_game_tease": "See you next week", "closing_cta": "Thanks for watching with us 🙌"}}, "variation_rules": {"style_adjectives": ["celebration energy", "community moment", "shared experience", "win or lose together"], "outcome_types": ["big win celebration", "close game thriller", "tough loss solidarity", "overtime drama"], "camera_styles": ["crowd celebration", "final score TV", "community moment"]}}'::JSONB);

-- 6. "Seats Filling Up" Urgency
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-seats-filling', 'Seats Filling Up Urgency', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story creating urgency—the bar is filling up fast and you need to get here NOW.

Background: A real shot of the bar getting crowded. Tables filling, the bar getting busy, but still some spots visible. The energy is building, the crowd is growing.

Urgent, FOMO-inducing typography:
"🚨 {{headline}} 🚨"
"SEATS FILLING FAST"
"{{game_name}}"
"{{current_status}}"
"{{time_warning}}"
"GET HERE NOW"
"{{remaining_note}}"

The image should show real crowd energy—not empty, not packed, but that tipping point where you know it's about to be full.

Maybe a graphic element showing capacity: "75% FULL" or similar urgency indicator.

The vibe: This is your last chance. We're almost at capacity. If you're coming, come NOW.$PROMPT$,
'v1', TRUE,
'{"style": "capacity_urgency", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "game_name"], "optional": ["current_status", "time_warning", "remaining_note"], "defaults": {"current_status": "Bar seating only remaining", "time_warning": "30 min to kickoff", "remaining_note": "First come, first served"}}, "variation_rules": {"style_adjectives": ["filling fast urgency", "last chance FOMO", "capacity warning", "get here now"], "capacity_levels": ["filling up", "almost full", "bar only", "standing room"], "camera_styles": ["crowd building wide", "busy bar shot", "filling tables"]}}'::JSONB);

-- 7. Game Day Countdown
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-countdown', 'Game Day Countdown', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story building anticipation with a countdown to the big game. Designed to work with Instagram's countdown sticker.

Background: The bar in preparation mode—maybe staff setting up, TVs being tuned, the anticipation of what's coming. Or a hype video style with quick cuts of game day energy.

Countdown-focused typography:
"{{headline}}"
"{{game_name}}"
"{{team1}} vs {{team2}}"
"COUNTDOWN TO KICKOFF"

Large, clear space for Instagram countdown sticker.

"{{game_date}}"
"{{game_time}}"
"{{reminder_cta}}"
"Set your reminder ⏰"

The design builds anticipation—maybe a clock graphic, countdown numbers, the tension of waiting for something big.

The vibe: The countdown is on. Set your reminder. Don't miss this one.$PROMPT$,
'v1', TRUE,
'{"style": "countdown_anticipation", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "game_name", "team1", "team2", "game_date", "game_time"], "optional": ["reminder_cta"], "defaults": {"reminder_cta": "Tap to set reminder"}}, "variation_rules": {"style_adjectives": ["countdown anticipation", "building excitement", "reminder focused", "don''t miss it"], "countdown_contexts": ["days away", "hours away", "tomorrow", "tonight"], "camera_styles": ["prep mode setup", "countdown graphic", "anticipation build"]}}'::JSONB);

-- 8. MVP of the Night (Staff/Customer Spotlight)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-story-mvp-spotlight', 'MVP of the Night Spotlight', 'bar_grill', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story spotlighting the MVP of the night—could be a staff member who crushed it, a regular customer, or the best-dressed fan.

Background: The bar atmosphere with the spotlight subject as the clear focus. Maybe they're holding a drink, wearing team gear, or just being celebrated by the crowd.

Fun, celebratory typography:
"🏆 {{headline}} 🏆"
"TONIGHT'S MVP"
"{{mvp_name}}"
"{{mvp_reason}}"
"{{recognition}}"
"{{community_cta}}"

The image should feel authentic and community-focused—real people, real moments, real appreciation.

Space for tagging the person if it's a customer (with permission).

The vibe: We see you. We appreciate you. You made tonight special. This is what community looks like.$PROMPT$,
'v1', TRUE,
'{"style": "community_spotlight", "sports_type": "generic", "frame_count": 1, "input_schema": {"required": ["headline", "mvp_name", "mvp_reason"], "optional": ["recognition", "community_cta"], "defaults": {"recognition": "Free appetizer on us!", "community_cta": "Who should be next week''s MVP?"}}, "variation_rules": {"style_adjectives": ["community celebration", "authentic spotlight", "real appreciation", "local hero"], "mvp_types": ["best dressed fan", "loudest supporter", "prediction winner", "staff superstar", "loyal regular"], "camera_styles": ["person spotlight", "celebration moment", "community candid"]}}'::JSONB);

-- =====================================================
-- FACEBOOK POSTS - 5 TEMPLATES
-- =====================================================

-- 1. Big Game Event Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-fb-big-game', 'Big Game Event Announcement', 'bar_grill', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 photograph designed for Facebook event promotion. The full sports bar experience in one compelling image.

Wide shot of the venue set up for the big game: multiple large screens (the biggest prominently featured), tables arranged for optimal viewing, the bar stocked and ready. The space looks inviting but not yet crowded—the calm before the storm.

Professional event-style typography overlay:
"{{headline}}"
"{{event_name}}"
"{{game_date}} · {{game_time}}"

GAME DAY SPECIALS:
• {{special1}}
• {{special2}}
• {{special3}}

"{{reservation_note}}"
"{{contact_info}}"

The image should work as a Facebook event cover or feed post. Clean, professional, but with energy. Shows off the venue's screens and capacity.

The vibe: This is a DESTINATION for the big game, not just another bar with a TV. Come early, stay late, this is where it's happening.$PROMPT$,
'v1', TRUE,
'{"style": "event_professional", "sports_type": "big_game", "input_schema": {"required": ["headline", "event_name", "game_date", "game_time"], "optional": ["special1", "special2", "special3", "reservation_note", "contact_info"], "defaults": {"special1": "$5 Game Day Beers", "special2": "Half-Price Apps at Kickoff", "special3": "Prizes & Giveaways", "reservation_note": "Reserve your spot—we fill up fast!"}}, "variation_rules": {"style_adjectives": ["venue showcase", "event professional", "big game energy", "destination vibe"], "event_types": ["Super Bowl", "Championship", "Playoffs", "Rivalry Game", "March Madness"], "camera_styles": ["wide venue establishing", "TV wall hero", "bar ready shot"]}}'::JSONB);

-- 2. Weekly Schedule Post
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-fb-weekly-schedule', 'Weekly Game Schedule Post', 'bar_grill', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 image designed as a weekly game schedule reference. Utility content that gets saved and shared.

Background: Sports bar atmosphere—TV wall, bar setup, game day energy. Could be a branded graphic background or real venue photo with overlay.

Clean, scannable schedule layout:
"{{headline}}"
"{{week_label}}"

SCHEDULE:
"{{day1}}: {{games1}}"
"{{day2}}: {{games2}}"
"{{day3}}: {{games3}}"
"{{day4}}: {{games4}}"
"{{day5}}: {{games5}}"

"{{weekly_special}}"
"{{cta}}"

The design prioritizes readability—clear hierarchy, easy to scan, works at small sizes in the feed. Each day clearly separated.

Supporting elements: Sports iconography, team color accents (generic), maybe highlight the biggest game of the week.

The vibe: Your one-stop reference for the week's games. Save this post. Share with your crew. Plan your week around the games.$PROMPT$,
'v1', TRUE,
'{"style": "utility_schedule", "sports_type": "multi_sport", "input_schema": {"required": ["headline", "week_label"], "optional": ["day1", "games1", "day2", "games2", "day3", "games3", "day4", "games4", "day5", "games5", "weekly_special", "cta"], "defaults": {"weekly_special": "Happy hour during all weekday games", "cta": "Save this post!"}}, "variation_rules": {"style_adjectives": ["clean schedule", "utility focused", "save-worthy", "shareable reference"], "schedule_types": ["NFL week", "NBA week", "College football Saturday", "Mixed sports"], "camera_styles": ["branded graphic", "venue background", "clean overlay"]}}'::JSONB);

-- 3. Viewing Party RSVP Event
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-fb-rsvp-event', 'Viewing Party RSVP Event', 'bar_grill', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 photograph optimized for Facebook Event creation. This is about driving RSVPs and creating a sense of exclusive access.

The venue shot emphasizes capacity and the viewing experience: the best seats in the house, the premium screen setup, maybe VIP or reserved sections visible.

Event-focused typography:
"{{headline}}"
"{{event_name}}"
"{{game_matchup}}"
"{{event_date}} · {{event_time}}"

"LIMITED CAPACITY"
"{{capacity_note}}"
"{{rsvp_incentive}}"
"{{rsvp_cta}}"

The image should make people want to secure their spot. Show the premium experience they'll get if they RSVP.

Supporting elements: Reserved table signs, VIP section, the exclusive feel of being on the list.

The vibe: This isn't just showing up—this is being part of something. RSVP to guarantee your spot. Don't be the one watching from home because you waited too long.$PROMPT$,
'v1', TRUE,
'{"style": "rsvp_exclusive", "sports_type": "big_game", "input_schema": {"required": ["headline", "event_name", "game_matchup", "event_date", "event_time"], "optional": ["capacity_note", "rsvp_incentive", "rsvp_cta"], "defaults": {"capacity_note": "Only 150 spots available", "rsvp_incentive": "RSVPs get first drink free", "rsvp_cta": "Click Interested or Going to reserve"}}, "variation_rules": {"style_adjectives": ["exclusive access", "limited capacity", "RSVP urgency", "premium experience"], "event_types": ["Championship viewing", "Playoff party", "Rivalry game", "Season opener"], "camera_styles": ["premium seating showcase", "VIP section", "capacity emphasis"]}}'::JSONB);


-- 4. Game Day Menu Feature
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-fb-menu-feature', 'Game Day Menu Feature', 'bar_grill', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 photograph showcasing the game day menu. Food-forward content that makes people hungry and ready to order.

The scene is a beautiful spread of game day favorites: wings, nachos, sliders, loaded fries, mozzarella sticks—the greatest hits of bar food, all looking absolutely perfect.

Menu-style typography overlay:
"{{headline}}"
"GAME DAY MENU"

"{{item1}} — ${{price1}}"
"{{item2}} — ${{price2}}"
"{{item3}} — ${{price3}}"
"{{item4}} — ${{price4}}"

"{{combo_deal}}"
"{{availability}}"

The food photography is hero-quality: steam rising, cheese pulling, sauces glistening. This should make people's mouths water.

Background shows the sports bar atmosphere—TVs visible, the context of where this food will be enjoyed.

The vibe: This is what game day tastes like. Come hungry, leave happy. Every item is a winner.$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase", "sports_type": "generic", "food_focus": "spread", "input_schema": {"required": ["headline", "item1", "price1", "item2", "price2"], "optional": ["item3", "price3", "item4", "price4", "combo_deal", "availability"], "defaults": {"combo_deal": "Game Day Combo: Wings + Pitcher $25", "availability": "Available during all games"}}, "variation_rules": {"style_adjectives": ["food hero spread", "menu showcase", "appetite appeal", "game day feast"], "food_categories": ["wings variety", "shareable apps", "burger lineup", "nacho styles"], "camera_styles": ["spread overhead", "hero items 45-degree", "steam and sizzle"]}}'::JSONB);

-- 5. Sports Bar Atmosphere Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-fb-atmosphere', 'Sports Bar Atmosphere Showcase', 'bar_grill', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 photograph showcasing the full sports bar experience. This is about selling the VENUE, not a specific game or deal.

Wide establishing shot of the bar at its best: multiple screens showing different games, the bar fully stocked and gleaming, comfortable seating, the perfect game-watching setup.

Venue-focused typography:
"{{headline}}"
"{{venue_name}}"
"{{screen_count}} SCREENS"
"{{seating_capacity}}"
"{{unique_features}}"
"{{tagline}}"

The image should answer the question: "Why should I watch here instead of at home?" Show the screens, the atmosphere, the community, the experience.

Supporting elements: Happy customers (faces blurred or backs to camera), the bar in action, maybe a signature feature (giant screen, outdoor patio, private viewing rooms).

The vibe: This is your home away from home for sports. Better screens, better sound, better company, better drinks. Your couch can't compete.$PROMPT$,
'v1', TRUE,
'{"style": "venue_showcase", "sports_type": "generic", "food_focus": "none", "input_schema": {"required": ["headline", "venue_name"], "optional": ["screen_count", "seating_capacity", "unique_features", "tagline"], "defaults": {"screen_count": "20+", "seating_capacity": "Full bar and table seating", "unique_features": "Sound on for every game", "tagline": "Your game day headquarters"}}, "variation_rules": {"style_adjectives": ["venue showcase", "experience selling", "home away from home", "destination sports bar"], "venue_features": ["giant main screen", "outdoor viewing", "private rooms", "surround sound"], "camera_styles": ["wide establishing", "TV wall hero", "bar atmosphere"]}}'::JSONB);

-- =====================================================
-- CAROUSEL/MULTI-IMAGE - 3 TEMPLATES
-- =====================================================

-- 1. Weekly Game Schedule Carousel (4-5 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-carousel-schedule', 'Weekly Game Schedule Carousel', 'bar_grill', 'instagram_carousel', 'base',
$PROMPT$Multi-slide Instagram carousel (4-5 slides) showing the week's game schedule. Utility content that gets saved and shared.

SLIDE 1 - COVER:
Square 1:1 with bold headline and week identifier.
"{{headline}}"
"{{week_label}}"
Background: Sports bar atmosphere, TV wall, or branded graphic. Sets the tone.
"Swipe for full schedule →"

---

SLIDE 2 - EARLY WEEK:
Clean schedule layout for Monday-Wednesday.
"{{monday_games}}"
"{{tuesday_games}}"
"{{wednesday_games}}"
Each game shows: Teams, Time, and any special (e.g., "Wing Night!")

---

SLIDE 3 - LATE WEEK:
Thursday-Saturday schedule.
"{{thursday_games}}"
"{{friday_games}}"
"{{saturday_games}}"
Highlight any big matchups or prime time games.

---

SLIDE 4 - SUNDAY/FINALE:
Sunday games (often the biggest day) plus any specials.
"{{sunday_games}}"
"{{weekly_specials}}"

---

SLIDE 5 - CTA:
Final slide with call-to-action.
"{{cta_headline}}"
"{{reservation_info}}"
"{{contact}}"
"📌 Save this post!"

Consistent design language across all slides. Scannable, useful, shareable.$PROMPT$,
'v1', TRUE,
'{"style": "utility_schedule", "sports_type": "multi_sport", "slide_count": 5, "input_schema": {"required": ["headline", "week_label"], "optional": ["monday_games", "tuesday_games", "wednesday_games", "thursday_games", "friday_games", "saturday_games", "sunday_games", "weekly_specials", "cta_headline", "reservation_info", "contact"], "defaults": {"cta_headline": "Don''t Miss a Game", "weekly_specials": "Happy Hour during all weekday games"}}, "variation_rules": {"style_adjectives": ["clean schedule layout", "utility focused", "save-worthy", "shareable reference"], "sports_seasons": ["NFL Sunday", "College Saturday", "NBA/NHL nightly", "MLB summer"], "camera_styles": ["branded graphic", "bar atmosphere", "TV schedule style"]}}'::JSONB);

-- 2. Game Day Menu Breakdown Carousel (3-4 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-carousel-menu', 'Game Day Menu Breakdown Carousel', 'bar_grill', 'instagram_carousel', 'base',
$PROMPT$Multi-slide Instagram carousel (3-4 slides) breaking down the game day menu by category. Food-forward content that drives orders.

SLIDE 1 - COVER:
Square 1:1 hero shot of the full game day spread.
"{{headline}}"
"GAME DAY MENU"
"Swipe to see the lineup →"
Beautiful overhead or 45-degree shot of multiple dishes together.

---

SLIDE 2 - WINGS & APPS:
Focus on wings and appetizers.
"WINGS & STARTERS"
"{{wings_description}}"
"{{wings_price}}"
"{{app1}} — ${{app1_price}}"
"{{app2}} — ${{app2_price}}"
Hero shot of wings with sauce options visible, maybe a sampler platter.

---

SLIDE 3 - MAINS & SHAREABLES:
Burgers, sandwiches, nachos, shareable platters.
"MAINS & SHAREABLES"
"{{main1}} — ${{main1_price}}"
"{{main2}} — ${{main2_price}}"
"{{shareable}} — ${{shareable_price}}"
"Perfect for the whole crew"
Food photography showing portion sizes, shareability.

---

SLIDE 4 - DRINKS & DEALS:
Drink specials and combo deals.
"DRINKS & DEALS"
"{{drink_special1}}"
"{{drink_special2}}"
"{{combo_deal}}"
"{{cta}}"
Frosty beers, cocktails, the drink lineup.

Consistent design language, each slide makes you hungrier than the last.$PROMPT$,
'v1', TRUE,
'{"style": "menu_breakdown", "sports_type": "generic", "food_focus": "full_menu", "slide_count": 4, "input_schema": {"required": ["headline", "wings_description", "wings_price"], "optional": ["app1", "app1_price", "app2", "app2_price", "main1", "main1_price", "main2", "main2_price", "shareable", "shareable_price", "drink_special1", "drink_special2", "combo_deal", "cta"], "defaults": {"app1": "Loaded Nachos", "app1_price": "14", "main1": "Game Day Burger", "main1_price": "16", "drink_special1": "$5 Draft Beers", "combo_deal": "Wings + Pitcher: $25", "cta": "See you game day!"}}, "variation_rules": {"style_adjectives": ["menu breakdown", "category focused", "appetite building", "order driving"], "food_categories": ["wings variety", "appetizer sampler", "burger lineup", "shareable platters"], "camera_styles": ["category hero shots", "detail close-ups", "spread overheads"]}}'::JSONB);

-- 3. "Why Watch Here" Feature List Carousel (3 slides)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('sports-carousel-why-watch', 'Why Watch Here Feature Carousel', 'bar_grill', 'instagram_carousel', 'base',
$PROMPT$Multi-slide Instagram carousel (3 slides) selling the sports bar experience. Venue marketing that converts couch-watchers to customers.

SLIDE 1 - THE SCREENS:
Square 1:1 showcasing the TV setup.
"{{headline}}"
"WHY WATCH HERE?"
"{{screen_count}} SCREENS"
"{{main_screen_feature}}"
"Every game. Every angle."
"Swipe for more reasons →"
Hero shot of the TV wall, the main screen, the multi-game setup.

---

SLIDE 2 - THE EXPERIENCE:
The atmosphere and amenities.
"THE EXPERIENCE"
"{{atmosphere_feature1}}"
"{{atmosphere_feature2}}"
"{{atmosphere_feature3}}"
"{{sound_feature}}"
Show the crowd energy, the bar setup, the vibe. Real people enjoying games (faces blurred).

---

SLIDE 3 - THE FOOD & DRINKS:
The menu advantage.
"THE FOOD & DRINKS"
"{{food_highlight}}"
"{{drink_highlight}}"
"{{service_note}}"
"{{final_cta}}"
"Your couch can't compete. 🏆"
Food and drink hero shots, the full package.

Each slide answers a different objection to leaving the house. By slide 3, they're convinced.$PROMPT$,
'v1', TRUE,
'{"style": "venue_selling", "sports_type": "generic", "food_focus": "highlight", "slide_count": 3, "input_schema": {"required": ["headline", "screen_count"], "optional": ["main_screen_feature", "atmosphere_feature1", "atmosphere_feature2", "atmosphere_feature3", "sound_feature", "food_highlight", "drink_highlight", "service_note", "final_cta"], "defaults": {"main_screen_feature": "100-inch main screen", "atmosphere_feature1": "Best seats in the house", "atmosphere_feature2": "Fellow fans who get it", "atmosphere_feature3": "No cleanup required", "sound_feature": "Game sound on—always", "food_highlight": "Wings that beat delivery", "drink_highlight": "Ice cold drafts on tap", "service_note": "Order from your seat", "final_cta": "See you game day"}}, "variation_rules": {"style_adjectives": ["venue selling", "objection handling", "couch competition", "experience focused"], "selling_points": ["screen quality", "sound system", "crowd energy", "food quality", "drink selection", "no cleanup"], "camera_styles": ["TV wall hero", "atmosphere wide", "food and drink combo"]}}'::JSONB);

-- =====================================================
-- END OF SPORTS & GAME DAY TEMPLATES
-- =====================================================

-- Summary:
-- Instagram Square (1:1): 10 templates
-- Instagram Stories (9:16): 8 templates  
-- Facebook Posts: 5 templates
-- Carousels: 3 templates
-- TOTAL: 26 templates
