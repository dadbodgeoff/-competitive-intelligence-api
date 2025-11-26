-- ============================================================================
-- MIGRATION: New Year's Eve & Day Templates (No Food Imagery)
-- ============================================================================
-- Description: NYE/NYD templates focused on atmosphere, events, and celebration
--              NO AI-generated food - relies on venue ambiance and graphics
-- Date: 2025-11-25
-- Total Templates: 12
-- ============================================================================

-- =====================================================
-- INSTAGRAM SQUARE (1:1) - 5 TEMPLATES
-- =====================================================

-- 1. NYE Event Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-sq-event', 'New Years Eve Event Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic announcing the New Year's Eve event. Glamorous, celebratory, the biggest night of the year energy.

Background: Luxurious celebration aesthetic—could be champagne gold textures, glittering bokeh lights, elegant black and gold, or the venue dressed for NYE. No food—pure celebration vibes.

Bold, glamorous typography:

"{{headline}}"

NEW YEAR'S EVE
{{year}}

"{{event_name}}"

"{{event_time}}"

"{{ticket_info}}"

What's Included:
{{inclusion1}}
{{inclusion2}}
{{inclusion3}}

"{{reservation_cta}}"

The design screams CELEBRATION. Sparkle, glamour, the promise of an unforgettable night. This is the event people plan their whole holiday season around.

Champagne bubbles, confetti hints, midnight magic. The visual language of New Year's Eve.

Urgency: NYE sells out. Make that clear.$PROMPT$,
'v1', TRUE,
'{"style": "glamorous_celebration", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline", "year", "event_time", "reservation_cta"], "optional": ["event_name", "ticket_info", "inclusion1", "inclusion2", "inclusion3"], "defaults": {"event_name": "Ring in the New Year", "ticket_info": "Limited tickets available", "inclusion1": "Champagne toast at midnight", "inclusion2": "Live entertainment", "inclusion3": "Party favors"}}, "variation_rules": {"style_adjectives": ["glamorous NYE", "celebration luxury", "midnight magic", "unforgettable night"], "color_palettes": ["black gold", "champagne silver", "midnight blue gold", "rose gold blush"], "celebration_elements": ["champagne bubbles", "confetti", "sparklers", "clock motifs"]}}'::JSONB);

-- 2. NYE Reservation Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-sq-reservations', 'NYE Reservations Now Open', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic announcing NYE reservations are open. Urgency-focused, action-driving, elegant.

Background: Sophisticated NYE aesthetic—elegant venue setup, champagne-toned colors, or luxurious texture. The feeling of an exclusive, sought-after experience. No food.

Clear, urgent typography:

"{{headline}}"

NEW YEAR'S EVE
RESERVATIONS NOW OPEN

"{{seating_times}}"

"{{special_features}}"

"{{price_info}}"

"{{booking_cta}}"

"{{urgency_note}}"

The message: This is THE night, and tables go fast. If you want to celebrate here, act now.

Elegant urgency—not desperate, just honest about demand. The kind of place where NYE reservations are a hot commodity.

Clear path to book. No friction.$PROMPT$,
'v1', TRUE,
'{"style": "elegant_urgency", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline", "booking_cta"], "optional": ["seating_times", "special_features", "price_info", "urgency_note"], "defaults": {"seating_times": "Seatings at 6pm, 8pm, 10pm", "special_features": "Special NYE experience", "urgency_note": "Tables go fast—book now"}}, "variation_rules": {"style_adjectives": ["elegant urgency", "exclusive access", "high demand", "act now"], "booking_angles": ["limited availability", "prime times filling", "don''t miss out", "secure your spot"]}}'::JSONB);

-- 3. Countdown to Midnight
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-sq-countdown', 'Countdown to Midnight Promo', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic building excitement for the midnight countdown. The anticipation of the final moments of the year.

Background: Dramatic countdown aesthetic—could feature a stylized clock approaching midnight, champagne glasses ready to toast, or sparkler/firework hints. Elegant, exciting. No food.

Countdown-focused typography:

"{{headline}}"

"{{countdown_text}}"

MIDNIGHT COUNTDOWN

"{{venue_name}}"

"{{what_to_expect}}"

"{{champagne_note}}"

"{{final_cta}}"

The design captures that specific NYE energy—the anticipation, the excitement, the collective moment when the clock strikes twelve.

Clock imagery, countdown numbers, the visual tension of almost-midnight. Everyone watching, waiting, ready to celebrate.

This is where you want to be when the ball drops.$PROMPT$,
'v1', TRUE,
'{"style": "countdown_anticipation", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline", "countdown_text"], "optional": ["venue_name", "what_to_expect", "champagne_note", "final_cta"], "defaults": {"what_to_expect": "Live countdown on the big screen", "champagne_note": "Champagne toast included", "final_cta": "Be here for the moment"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "midnight anticipation", "collective moment", "ball drop energy"], "countdown_elements": ["clock face", "countdown numbers", "champagne ready", "sparkler hints"]}}'::JSONB);

-- 4. NYE Atmosphere Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-sq-atmosphere', 'NYE Venue Atmosphere Showcase', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph showcasing the venue transformed for New Year's Eve. Pure atmosphere—no food, just the magic of the celebration space.

The scene: The restaurant/bar dressed to the nines for NYE. Balloons, streamers, glitter, champagne towers, photo backdrops, the works. The space looks like a PARTY waiting to happen.

Minimal typography overlay:

"{{headline}}"

"{{tagline}}"

"{{reservation_cta}}"

The image sells the experience. This is what NYE looks like here—glamorous, fun, the place to be.

Capture the details: Balloon arches, champagne displays, party decor, the bar ready for celebration. The transformation from regular night to THE night.

No people necessary—or glamorous silhouettes adding energy. The decorated space is the star.

The message: This is where memories are made.$PROMPT$,
'v1', TRUE,
'{"style": "party_showcase", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline"], "optional": ["tagline", "reservation_cta"], "defaults": {"tagline": "This is how we do NYE", "reservation_cta": "Limited spots remaining"}}, "variation_rules": {"style_adjectives": ["party transformation", "glamorous setup", "celebration ready", "NYE magic"], "decor_elements": ["balloons", "streamers", "champagne display", "photo backdrop", "glitter", "party favors"]}}'::JSONB);

-- 5. New Year's Day Recovery
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-sq-nyd-recovery', 'New Years Day Recovery Brunch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic promoting New Year's Day—the recovery day. Warm, welcoming, the antidote to last night's celebration.

Background: Cozy, bright, fresh-start energy. Could be warm morning light through windows, coffee steam aesthetic, or clean fresh design. The visual opposite of NYE glamour—comfort and recovery. No food imagery.

Friendly, relatable typography:

"{{headline}}"

NEW YEAR'S DAY
{{nyd_date}}

"{{recovery_message}}"

"{{hours}}"

"{{special_offer}}"

"{{vibe_description}}"

The tone is: We get it. Last night was a lot. Come recover with us.

Humor welcome here—this is the relatable post-party content. Cozy, comforting, no judgment.

The fresh start energy of January 1st. New year, same great spot to recover.$PROMPT$,
'v1', TRUE,
'{"style": "recovery_cozy", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline", "nyd_date", "hours"], "optional": ["recovery_message", "special_offer", "vibe_description"], "defaults": {"recovery_message": "We''ve got you", "special_offer": "Bloody Mary bar open", "vibe_description": "Cozy vibes, no judgment"}}, "variation_rules": {"style_adjectives": ["recovery cozy", "fresh start", "post-party comfort", "no judgment zone"], "recovery_vibes": ["cozy morning", "fresh start", "comfort food", "hair of the dog"]}}'::JSONB);

-- =====================================================
-- INSTAGRAM STORIES (9:16) - 5 TEMPLATES
-- =====================================================

-- 6. NYE Countdown Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-story-countdown', 'NYE Event Countdown Story', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with countdown to NYE. Designed for Instagram's countdown sticker—building anticipation for the big night.

Background: Glamorous NYE aesthetic—sparkles, champagne tones, celebration energy. Exciting, luxurious. No food.

Anticipation-building typography:

"{{headline}}"

NEW YEAR'S EVE

"{{event_teaser}}"

Large clear space for Instagram countdown sticker.

"{{what_awaits}}"

"{{cta}}"

The design creates NYE FOMO. The countdown sticker makes it interactive and real—people can set reminders, share to their stories.

Glamorous but not over-the-top. The countdown is the star.

Works with or without the sticker, but designed for maximum impact with it.$PROMPT$,
'v1', TRUE,
'{"style": "countdown_glamour", "holiday_type": "new_years", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "event_teaser"], "optional": ["what_awaits", "cta"], "defaults": {"what_awaits": "Champagne, countdown, celebration", "cta": "Set your reminder 🥂"}}, "variation_rules": {"style_adjectives": ["countdown glamour", "NYE anticipation", "celebration building", "FOMO creating"]}}'::JSONB);

-- 7. NYE Last Call Reservations
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-story-lastcall', 'NYE Last Call for Reservations', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with urgent last-call energy for NYE reservations. Time is running out—act now.

Background: Elegant urgency—could be glamorous NYE aesthetic with urgent design elements, or sophisticated countdown feel. No food.

Urgent typography:

"🚨 {{headline}} 🚨"

"{{urgency_message}}"

NEW YEAR'S EVE

"{{availability_status}}"

"{{remaining_options}}"

"{{booking_cta}}"

"{{deadline}}"

The design is urgent but classy. Not desperate—just honest that time is running out for the most popular night of the year.

For the procrastinators who suddenly realize NYE is almost here. This is their wake-up call.

Clear action path. No friction.$PROMPT$,
'v1', TRUE,
'{"style": "urgent_lastcall", "holiday_type": "new_years", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "urgency_message", "booking_cta"], "optional": ["availability_status", "remaining_options", "deadline"], "defaults": {"availability_status": "Almost sold out", "remaining_options": "Limited 8pm & 10pm seatings", "deadline": "Book by Friday"}}, "variation_rules": {"style_adjectives": ["urgent elegant", "last call", "time running out", "act now"]}}'::JSONB);

-- 8. NYE Behind the Scenes Prep
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-story-bts', 'NYE Prep Behind the Scenes', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story showing behind-the-scenes NYE preparation. Authentic, exciting, building anticipation through insider access.

Background: Real candid shots of NYE prep—decorating, setting up, the team getting ready for the big night. Authentic moments of transformation. No food prep.

Casual, excited typography:

"{{headline}}"

"{{caption}}"

"{{prep_detail}}"

"{{excitement_note}}"

The vibe is: "Look what we're creating for you." The transformation happening, the excitement building, the team energy.

Could show: Balloon installations, champagne tower setup, photo backdrop creation, party favor prep, the venue mid-transformation.

Authentic > polished. Insider access that builds anticipation and connection.

Makes people feel like they're part of something special.$PROMPT$,
'v1', TRUE,
'{"style": "authentic_prep", "holiday_type": "new_years", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline"], "optional": ["caption", "prep_detail", "excitement_note"], "defaults": {"caption": "Getting ready for the big night ✨", "excitement_note": "It''s going to be epic"}}, "variation_rules": {"style_adjectives": ["authentic prep", "insider access", "transformation reveal", "team excitement"], "prep_moments": ["decorating", "setup", "champagne tower", "balloon arch", "photo backdrop"]}}'::JSONB);

-- 9. Midnight Moment Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-story-midnight', 'Midnight Moment Teaser', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story teasing the midnight moment. What happens when the clock strikes twelve—the champagne, the countdown, the celebration.

Background: Dramatic midnight aesthetic—could be champagne glasses ready to toast, clock approaching 12, sparkler imagery, or confetti moment. The anticipation of THE moment. No food.

Dramatic typography:

"{{headline}}"

"11:59..."

"{{midnight_promise}}"

"{{champagne_detail}}"

"{{celebration_hint}}"

"{{cta}}"

The design captures that specific moment—the last seconds of the year, the collective breath before the celebration explodes.

Champagne ready, countdown imminent, the promise of what's about to happen.

This is the moment. Where will you be?$PROMPT$,
'v1', TRUE,
'{"style": "midnight_drama", "holiday_type": "new_years", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "midnight_promise"], "optional": ["champagne_detail", "celebration_hint", "cta"], "defaults": {"champagne_detail": "Champagne toast for all", "celebration_hint": "Confetti, cheers, new beginnings", "cta": "Be here for midnight"}}, "variation_rules": {"style_adjectives": ["midnight drama", "countdown climax", "celebration peak", "the moment"]}}'::JSONB);

-- 10. Happy New Year Post-Event
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-story-happynewyear', 'Happy New Year Celebration Post', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story posted right after midnight or on New Year's Day. Celebration, gratitude, fresh start energy.

Background: Post-celebration glow—could be confetti aftermath, champagne bubbles, sunrise/fresh start imagery, or warm celebratory aesthetic. The joy of a new year begun. No food.

Celebratory typography:

"{{headline}}"

"{{year}}"

"{{celebration_message}}"

"{{gratitude_note}}"

"{{looking_forward}}"

The tone is: We made it! What a night! Here's to the new year!

Could be posted at 12:01am (immediate celebration) or January 1st morning (reflection and gratitude).

Joyful, grateful, forward-looking. The energy of new beginnings.$PROMPT$,
'v1', TRUE,
'{"style": "celebration_joy", "holiday_type": "new_years", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "year"], "optional": ["celebration_message", "gratitude_note", "looking_forward"], "defaults": {"celebration_message": "What a night!", "gratitude_note": "Thank you for celebrating with us", "looking_forward": "Here''s to an amazing year ahead"}}, "variation_rules": {"style_adjectives": ["celebration joy", "new year energy", "fresh start", "gratitude glow"]}}'::JSONB);

-- =====================================================
-- FACEBOOK POSTS - 2 TEMPLATES
-- =====================================================

-- 11. NYE Event Facebook
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-fb-event', 'NYE Event Facebook Announcement', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 comprehensive NYE event announcement for Facebook. All the details people need to plan and book.

Background: Glamorous NYE venue shot or elegant celebration graphic. The space ready for the biggest night of the year. No food—focus on atmosphere and event details.

Complete event information:

"{{headline}}"

NEW YEAR'S EVE {{year}}

"{{event_name}}"

📅 {{event_date}}
🕐 {{event_time}}
📍 {{venue_name}}

WHAT'S INCLUDED:
✨ {{inclusion1}}
✨ {{inclusion2}}
✨ {{inclusion3}}
✨ {{inclusion4}}

💰 {{pricing_info}}

"{{dress_code}}"

"{{booking_info}}"

"{{contact_details}}"

Facebook is where people research and plan. Give them everything: what, when, where, how much, how to book.

Professional, comprehensive, shareable. The post that gets tagged when friends are planning NYE.$PROMPT$,
'v1', TRUE,
'{"style": "event_comprehensive", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline", "year", "event_date", "event_time", "booking_info"], "optional": ["event_name", "venue_name", "inclusion1", "inclusion2", "inclusion3", "inclusion4", "pricing_info", "dress_code", "contact_details"], "defaults": {"event_name": "New Year''s Eve Celebration", "inclusion1": "Champagne toast at midnight", "inclusion2": "Live DJ/entertainment", "inclusion3": "Party favors & photo ops", "inclusion4": "Countdown celebration", "dress_code": "Festive cocktail attire encouraged"}}, "variation_rules": {"style_adjectives": ["comprehensive event", "all details included", "planning friendly", "shareable reference"]}}'::JSONB);

-- 12. NYE Recap/Thank You Facebook
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('nye-fb-recap', 'NYE Celebration Recap Thank You', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 post-NYE recap and thank you. Celebrating the night, thanking guests, welcoming the new year.

Background: Celebration aftermath aesthetic—could be confetti-covered venue, champagne glasses, happy crowd moments (with permission), or elegant "we did it" design. Joyful, grateful. No food focus.

Celebratory, grateful message:

"{{headline}}"

"{{opening}}"

"{{night_highlight}}"

"{{gratitude_message}}"

"{{new_year_wish}}"

"{{looking_ahead}}"

"{{signature}}"

This is the post that closes out the celebration and opens the new year. Gratitude for everyone who celebrated together, excitement for what's ahead.

Could include: A few event photos (venue shots, crowd energy, decor), the energy of the night captured.

Relationship-building content. The kind of post that makes people glad they chose to celebrate with you.$PROMPT$,
'v1', TRUE,
'{"style": "recap_gratitude", "holiday_type": "new_years", "food_focus": "none", "input_schema": {"required": ["headline", "gratitude_message"], "optional": ["opening", "night_highlight", "new_year_wish", "looking_ahead", "signature"], "defaults": {"opening": "What. A. Night.", "night_highlight": "You made it unforgettable", "new_year_wish": "Wishing you an incredible year ahead", "looking_ahead": "Can''t wait to see you in the new year", "signature": "— The [Restaurant] Team"}}, "variation_rules": {"style_adjectives": ["recap celebration", "gratitude glow", "new year welcome", "community appreciation"]}}'::JSONB);

-- =====================================================
-- END OF NEW YEAR'S TEMPLATES
-- =====================================================

-- Summary:
-- Instagram Square (1:1): 5 templates
-- Instagram Stories (9:16): 5 templates
-- Facebook Posts: 2 templates
-- TOTAL: 12 templates (all no-food focused)
