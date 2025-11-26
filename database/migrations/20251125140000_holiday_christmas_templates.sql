-- ============================================================================
-- MIGRATION: Christmas & Holiday Season Templates (No Food Imagery)
-- ============================================================================
-- Description: Holiday templates focused on atmosphere, typography, and events
--              NO AI-generated food - relies on venue ambiance and graphics
-- Date: 2025-11-25
-- Total Templates: 15
-- ============================================================================

-- =====================================================
-- INSTAGRAM SQUARE (1:1) - 6 TEMPLATES
-- =====================================================

-- 1. Holiday Hours Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-hours', 'Holiday Hours Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic announcing holiday hours. Elegant, festive typography on a sophisticated seasonal background. No food—pure information design.

Background: Rich, warm texture—could be deep burgundy, forest green, or champagne gold with subtle holiday texture. Think velvet, brushed metal with warm tones, or elegant paper texture. Festive but not cheesy—no cartoon snowflakes or clip art.

Centered, elegant typography:

"{{headline}}"

HOLIDAY HOURS

{{date1}}: {{hours1}}
{{date2}}: {{hours2}}
{{date3}}: {{hours3}}
{{date4}}: {{hours4}}

"{{closing_message}}"

Design elements: Subtle gold accents, thin decorative lines, maybe a simple wreath outline or star motif. The aesthetic is upscale restaurant, not mall Santa.

High contrast for readability. The kind of post people screenshot and save. Useful information, beautifully presented.

Logo or wordmark tastefully placed.$PROMPT$,
'v1', TRUE,
'{"style": "elegant_holiday", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "date1", "hours1", "date2", "hours2"], "optional": ["date3", "hours3", "date4", "hours4", "closing_message"], "defaults": {"closing_message": "Wishing you a wonderful holiday season"}}, "variation_rules": {"style_adjectives": ["elegant festive", "sophisticated seasonal", "upscale holiday", "warm luxurious"], "color_palettes": ["burgundy gold", "forest green cream", "champagne silver", "deep red white"], "typography_styles": ["serif elegant", "modern minimal", "classic script accent"]}}'::JSONB);

-- 2. Holiday Party Booking
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-party-booking', 'Holiday Party Booking Promo', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 promotional graphic for holiday party bookings. Sophisticated, aspirational—selling the experience, not the food.

Background: Elegant venue atmosphere—could be a beautifully set private dining room, twinkling string lights, candlelit tables, or festive bar setup. The space looks magical, ready for celebration. Warm, inviting lighting. No food visible—focus on ambiance.

Bold, inviting typography overlay:

"{{headline}}"

BOOK YOUR HOLIDAY PARTY

"{{venue_feature}}"
"{{capacity_info}}"
"{{package_teaser}}"

"{{booking_cta}}"
"{{contact_info}}"

The image sells the EXPERIENCE: the atmosphere, the setting, the feeling of celebrating with your people in a special place. Fairy lights, candles, elegant table settings—the visual language of celebration.

Urgency element: "{{availability_note}}"

This is where memories are made. Book before it's too late.$PROMPT$,
'v1', TRUE,
'{"style": "venue_aspirational", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "booking_cta"], "optional": ["venue_feature", "capacity_info", "package_teaser", "contact_info", "availability_note"], "defaults": {"venue_feature": "Private & semi-private spaces", "capacity_info": "Groups of 10-50", "package_teaser": "Custom menus available", "availability_note": "Limited dates remaining"}}, "variation_rules": {"style_adjectives": ["venue showcase", "celebration atmosphere", "private event elegance", "festive ambiance"], "venue_elements": ["string lights", "candlelit tables", "private room", "decorated bar"], "camera_styles": ["wide venue shot", "intimate table setting", "atmospheric lighting"]}}'::JSONB);

-- 3. Gift Card Holiday Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-giftcard', 'Holiday Gift Card Promotion', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 graphic promoting gift cards as the perfect holiday gift. Elegant product shot of gift card packaging or beautiful typography-focused design.

Background: Luxurious holiday texture—velvet, metallic shimmer, or elegant wrapping paper aesthetic. Rich colors: deep red, emerald, gold, or sophisticated neutrals with holiday accents.

If showing gift card: Beautifully photographed gift card with elegant packaging, ribbon, maybe a gift box. The card itself is the hero—no food.

If typography-focused: Bold, gift-tag inspired design.

"{{headline}}"

THE PERFECT GIFT

"{{gift_card_offer}}"
"{{bonus_offer}}"

"{{purchase_options}}"

"{{urgency_note}}"

The vibe: This is a GIFT, not just a transaction. Thoughtful, personal, appreciated. The kind of present that shows you know someone.

Design feels giftable—like the post itself could be a gift tag.$PROMPT$,
'v1', TRUE,
'{"style": "gift_elegant", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "gift_card_offer"], "optional": ["bonus_offer", "purchase_options", "urgency_note"], "defaults": {"bonus_offer": "Buy $100, get $20 bonus", "purchase_options": "Available in-store & online", "urgency_note": "Perfect stocking stuffer 🎁"}}, "variation_rules": {"style_adjectives": ["gift elegant", "luxurious packaging", "thoughtful present", "holiday giving"], "presentation_styles": ["gift card hero", "typography gift tag", "wrapped package", "ribbon accent"], "color_palettes": ["red gold", "green silver", "champagne cream", "classic holiday"]}}'::JSONB);

-- 4. Festive Atmosphere Showcase
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-atmosphere', 'Holiday Atmosphere Showcase', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph showcasing the restaurant's holiday transformation. Pure atmosphere—no food, just the magic of the decorated space.

The scene: The restaurant dressed for the holidays. String lights twinkling, garland draped, maybe a tree in the corner, candles glowing on tables. The bar decorated and gleaming. The space feels MAGICAL.

Minimal typography overlay:

"{{headline}}"

"{{tagline}}"

"{{reservation_cta}}"

The image does the heavy lifting. This is about showing people what it FEELS like to be here during the holidays. The warmth, the glow, the festive energy.

Capture the details: The way light catches ornaments, the warmth of candlelight, the cozy corners, the bar ready for celebration.

No people necessary—or just soft-focus silhouettes adding life. The space is the star.

The message: This is where you want to spend the holidays.$PROMPT$,
'v1', TRUE,
'{"style": "atmosphere_showcase", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline"], "optional": ["tagline", "reservation_cta"], "defaults": {"tagline": "The season is here", "reservation_cta": "Reserve your table"}}, "variation_rules": {"style_adjectives": ["magical atmosphere", "festive transformation", "holiday warmth", "twinkling elegance"], "decor_elements": ["string lights", "garland", "candles", "tree", "ornaments", "wreaths"], "camera_styles": ["wide venue", "detail vignettes", "bar showcase", "intimate corner"]}}'::JSONB);

-- 5. Holiday Special Event
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-special-event', 'Holiday Special Event Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 event announcement graphic for a special holiday event. Could be Christmas Eve dinner, holiday brunch, Santa visit, ugly sweater party, etc.

Background: Festive but sophisticated—could be venue atmosphere with holiday decor, elegant graphic design, or textured seasonal background. No food imagery.

Event-focused typography:

"{{headline}}"

"{{event_name}}"

"{{event_date}}"
"{{event_time}}"

"{{event_description}}"

"{{ticket_info}}"
"{{reservation_cta}}"

The design matches the event vibe:
- Elegant dinner = sophisticated, candlelit aesthetic
- Fun party = playful, energetic graphics
- Family event = warm, welcoming feel

Clear hierarchy: What, When, How to book. Everything else is supporting.

Creates anticipation and urgency. This is a special occasion—don't miss it.$PROMPT$,
'v1', TRUE,
'{"style": "event_announcement", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "event_name", "event_date", "event_time"], "optional": ["event_description", "ticket_info", "reservation_cta"], "defaults": {"reservation_cta": "Reserve now—limited availability"}}, "variation_rules": {"style_adjectives": ["special occasion", "festive event", "holiday celebration", "seasonal gathering"], "event_types": ["Christmas Eve dinner", "holiday brunch", "ugly sweater party", "Santa brunch", "holiday cocktail party"], "design_vibes": ["elegant formal", "fun festive", "family friendly", "upscale casual"]}}'::JSONB);

-- 6. Season's Greetings
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-sq-greetings', 'Seasons Greetings Card', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 holiday greeting card from the restaurant. Warm, genuine, beautifully designed. This is relationship-building, not selling.

Background: Elegant holiday design—could be the decorated venue in soft focus, a sophisticated pattern, or rich textured background. Warm, inviting colors.

Heartfelt typography:

"{{headline}}"

"{{message}}"

"{{signature}}"

"{{year}}"

The design feels like a real holiday card—the kind you'd actually send to someone you care about. Personal, warm, genuine.

Could include: Subtle holiday motifs (not cheesy), the restaurant's personality, maybe a nod to the year's highlights.

No sales pitch. No CTA. Just genuine appreciation and warm wishes. The kind of post that makes people feel good about supporting your business.

This is about connection, not conversion.$PROMPT$,
'v1', TRUE,
'{"style": "heartfelt_greeting", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "message"], "optional": ["signature", "year"], "defaults": {"signature": "With gratitude,\nThe [Restaurant] Family", "year": "2025"}}, "variation_rules": {"style_adjectives": ["heartfelt genuine", "warm personal", "elegant holiday card", "relationship building"], "message_tones": ["grateful", "warm wishes", "looking forward", "thank you"], "design_styles": ["classic card", "modern minimal", "venue backdrop", "illustrated accent"]}}'::JSONB);


-- =====================================================
-- INSTAGRAM STORIES (9:16) - 6 TEMPLATES
-- =====================================================

-- 7. Holiday Countdown Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-countdown', 'Holiday Event Countdown', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story building anticipation for a holiday event. Designed to work with Instagram's countdown sticker.

Background: Festive atmosphere—twinkling lights, holiday decor, or elegant seasonal graphics. Warm, magical feeling. No food.

Excitement-building typography:

"{{headline}}"

"{{event_name}}"

"{{event_date}}"

Large clear space for Instagram countdown sticker.

"{{teaser}}"

"{{cta}}"

The design creates holiday FOMO. Something special is coming, and the countdown makes it feel real and urgent.

Festive but not overwhelming. The countdown sticker is the interactive element—the design supports it.

Works with or without the sticker, but designed for it.$PROMPT$,
'v1', TRUE,
'{"style": "countdown_festive", "holiday_type": "christmas", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "event_name", "event_date"], "optional": ["teaser", "cta"], "defaults": {"teaser": "You don''t want to miss this", "cta": "Set your reminder ⏰"}}, "variation_rules": {"style_adjectives": ["countdown excitement", "holiday anticipation", "festive urgency", "event teaser"], "event_types": ["Christmas Eve", "holiday party", "special dinner", "seasonal event"]}}'::JSONB);

-- 8. Holiday Poll Engagement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-poll', 'Holiday Poll Engagement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with a fun holiday-themed poll question. Engagement-focused, designed for Instagram's poll sticker.

Background: Playful holiday aesthetic—could be festive colors, twinkling lights blur, or fun seasonal pattern. Energetic but on-brand.

Fun, engaging question:

"{{question}}"

Clear space for Instagram poll sticker with two options.

"{{poll_context}}"

Example questions:
- "Eggnog or hot cocoa?"
- "Real tree or fake tree?"
- "Holiday party: dressy or ugly sweater?"
- "Christmas Eve dinner: in or out?"

The design is intentionally incomplete—needs the poll to feel finished. Interactive, fun, gets people engaged with your brand during the busy season.

Light, playful, seasonal. Not selling anything—just connecting.$PROMPT$,
'v1', TRUE,
'{"style": "interactive_holiday", "holiday_type": "christmas", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["question"], "optional": ["poll_context"], "defaults": {"poll_context": "Vote now! 👆"}}, "variation_rules": {"style_adjectives": ["playful festive", "engagement focused", "fun seasonal", "interactive holiday"], "question_types": ["preference poll", "this or that", "holiday habits", "seasonal debate"]}}'::JSONB);

-- 9. Last Minute Reservations
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-lastminute', 'Last Minute Holiday Reservations', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story creating urgency for last-minute holiday reservations. Time-sensitive, action-driving.

Background: Festive venue atmosphere or elegant holiday graphic. Warm but urgent energy. No food.

Urgent typography:

"{{headline}}"

"{{availability_message}}"

"{{dates_available}}"

"{{time_slots}}"

"{{booking_cta}}"

"{{contact_method}}"

The design screams "act now"—but elegantly. Not desperate, just honest about limited availability.

Could include: A visual indicator of remaining spots, urgency colors (without being alarming), clear action steps.

For people who procrastinated on holiday plans. This is their lifeline.$PROMPT$,
'v1', TRUE,
'{"style": "urgent_elegant", "holiday_type": "christmas", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "availability_message", "booking_cta"], "optional": ["dates_available", "time_slots", "contact_method"], "defaults": {"contact_method": "Link in bio to book"}}, "variation_rules": {"style_adjectives": ["urgent elegant", "last chance", "limited availability", "act now"], "urgency_levels": ["filling fast", "almost full", "final spots", "last call"]}}'::JSONB);

-- 10. Holiday Thank You
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-thankyou', 'Holiday Season Thank You', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story expressing genuine holiday gratitude. Warm, heartfelt, relationship-focused.

Background: Soft, warm holiday atmosphere—could be the venue with twinkling lights, elegant seasonal texture, or warm color gradient. Cozy, genuine feeling.

Heartfelt typography:

"{{headline}}"

"{{gratitude_message}}"

"{{highlight}}"

"{{warm_closing}}"

"{{signature}}"

The tone is genuine appreciation—not performative. This is for the regulars, the supporters, the people who made the year special.

No sales pitch. No CTA (except maybe "see you soon"). Just real gratitude during a season that's all about appreciation.

The kind of story that makes people feel good about where they spend their time and money.$PROMPT$,
'v1', TRUE,
'{"style": "heartfelt_gratitude", "holiday_type": "christmas", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "gratitude_message"], "optional": ["highlight", "warm_closing", "signature"], "defaults": {"warm_closing": "Wishing you a beautiful holiday season", "signature": "— The whole team"}}, "variation_rules": {"style_adjectives": ["genuine gratitude", "heartfelt holiday", "warm appreciation", "relationship focused"], "gratitude_types": ["year in review", "customer appreciation", "community thanks", "team gratitude"]}}'::JSONB);

-- 11. Holiday Behind the Scenes
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-bts', 'Holiday Decorating Behind the Scenes', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story showing behind-the-scenes holiday decorating or prep. Authentic, human, community-building.

Background: Real candid shots of the team decorating, setting up holiday displays, or preparing the space for the season. Authentic moments, not staged perfection.

Casual, friendly typography:

"{{headline}}"

"{{caption}}"

"{{fun_detail}}"

The vibe is: "Come behind the curtain with us." Real people doing real work to make the holidays special.

Could show: Hanging lights, decorating the tree, setting up displays, the team in holiday spirit. Faces welcome here—this is about the people.

Authentic > polished. The kind of content that makes followers feel like insiders.

No food prep—focus on decor and atmosphere creation.$PROMPT$,
'v1', TRUE,
'{"style": "authentic_bts", "holiday_type": "christmas", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline"], "optional": ["caption", "fun_detail"], "defaults": {"caption": "Getting ready for the season ✨", "fun_detail": ""}}, "variation_rules": {"style_adjectives": ["authentic candid", "behind the scenes", "team moments", "insider access"], "bts_moments": ["decorating", "tree setup", "light hanging", "team celebration"]}}'::JSONB);

-- 12. Holiday Gift Card Reminder Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-story-giftcard', 'Holiday Gift Card Story Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story reminding followers about gift cards as holiday gifts. Quick, scannable, action-oriented.

Background: Elegant holiday aesthetic—gift card packaging, festive colors, or sophisticated seasonal design. No food.

Quick-hit typography:

"{{headline}}"

"{{value_prop}}"

"{{offer_details}}"

"{{purchase_cta}}"

Swipe up or link sticker integration space.

"{{urgency}}"

The design is gift-focused: ribbons, bows, elegant packaging vibes. This is about giving, not eating.

Fast to consume, easy to act on. For the person scrolling who suddenly remembers they need a gift.

Clear path to purchase. No friction.$PROMPT$,
'v1', TRUE,
'{"style": "gift_reminder", "holiday_type": "christmas", "frame_count": 1, "food_focus": "none", "input_schema": {"required": ["headline", "purchase_cta"], "optional": ["value_prop", "offer_details", "urgency"], "defaults": {"value_prop": "The gift they actually want", "offer_details": "Bonus card with purchase", "urgency": "Last-minute gift? We got you 🎁"}}, "variation_rules": {"style_adjectives": ["gift focused", "quick reminder", "easy action", "last minute solution"], "gift_angles": ["perfect gift", "they''ll love it", "never expires", "instant delivery"]}}'::JSONB);

-- =====================================================
-- FACEBOOK POSTS - 3 TEMPLATES
-- =====================================================

-- 13. Holiday Hours Facebook
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-hours', 'Holiday Hours Facebook Post', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 graphic for Facebook announcing holiday hours. Comprehensive, shareable, designed for the platform where people actually check hours.

Background: Elegant holiday design—venue atmosphere with festive decor, or sophisticated seasonal graphic. Warm, professional. No food.

Complete hours information:

"{{headline}}"

HOLIDAY HOURS

Christmas Eve (Dec 24): {{christmas_eve_hours}}
Christmas Day (Dec 25): {{christmas_day_hours}}
New Year's Eve (Dec 31): {{nye_hours}}
New Year's Day (Jan 1): {{nyd_hours}}

"{{special_note}}"

"{{reservation_reminder}}"

The design prioritizes utility—this is the post people will search for when they're planning. Make it easy to find the information.

Shareable format. Clear, scannable, professional. The kind of post that gets saved and referenced.

Logo and contact info included.$PROMPT$,
'v1', TRUE,
'{"style": "utility_comprehensive", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "christmas_eve_hours", "christmas_day_hours"], "optional": ["nye_hours", "nyd_hours", "special_note", "reservation_reminder"], "defaults": {"special_note": "Regular hours resume January 2nd", "reservation_reminder": "Reservations recommended for holiday dining"}}, "variation_rules": {"style_adjectives": ["comprehensive utility", "shareable reference", "professional holiday", "easy to find"], "info_completeness": ["full schedule", "key dates", "special notes", "contact included"]}}'::JSONB);

-- 14. Holiday Party Booking Facebook
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-party', 'Holiday Party Booking Facebook', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 photograph promoting holiday party bookings on Facebook. Venue-focused, aspirational, designed for event planning decision-makers.

The image: Beautiful private dining space or event setup decorated for the holidays. Elegant table settings, festive decor, ambient lighting. The space looks ready for celebration. No food—focus on the venue and atmosphere.

Comprehensive event information:

"{{headline}}"

BOOK YOUR HOLIDAY CELEBRATION

{{venue_options}}

What's Included:
• {{inclusion1}}
• {{inclusion2}}
• {{inclusion3}}
• {{inclusion4}}

"{{capacity_info}}"

"{{booking_process}}"

"{{contact_info}}"

"{{availability_note}}"

Facebook is where event planners research. Give them everything they need to make a decision or take the next step.

Professional, comprehensive, action-oriented.$PROMPT$,
'v1', TRUE,
'{"style": "event_comprehensive", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "venue_options", "contact_info"], "optional": ["inclusion1", "inclusion2", "inclusion3", "inclusion4", "capacity_info", "booking_process", "availability_note"], "defaults": {"inclusion1": "Dedicated event space", "inclusion2": "Custom menu options", "inclusion3": "Full bar service", "inclusion4": "Event coordination", "capacity_info": "Groups from 10-75", "booking_process": "Call or email to start planning", "availability_note": "Prime dates booking fast"}}, "variation_rules": {"style_adjectives": ["venue showcase", "event planning", "comprehensive info", "decision enabling"], "venue_features": ["private room", "semi-private", "full buyout", "bar area"]}}'::JSONB);

-- 15. Holiday Community Thank You
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('holiday-fb-thankyou', 'Holiday Community Thank You', 'all_verticals', 'facebook_post', 'base',
$PROMPT$Landscape 16:9 or square 1:1 heartfelt thank you post for the Facebook community. Year-end gratitude, relationship-building, genuine appreciation.

Background: Warm, inviting—could be the team together, the venue looking beautiful, or elegant holiday design. Authentic and personal. No food focus.

Genuine message:

"{{headline}}"

"{{opening_message}}"

"{{year_highlight}}"

"{{gratitude_specifics}}"

"{{looking_forward}}"

"{{warm_closing}}"

"{{signature}}"

This is the post that reminds people why they love supporting local restaurants. Real gratitude, real connection, real community.

No sales pitch. No promotion. Just genuine appreciation for the people who made the year possible.

The kind of post that gets heartfelt comments and shares. Relationship over transaction.$PROMPT$,
'v1', TRUE,
'{"style": "community_gratitude", "holiday_type": "christmas", "food_focus": "none", "input_schema": {"required": ["headline", "opening_message", "warm_closing"], "optional": ["year_highlight", "gratitude_specifics", "looking_forward", "signature"], "defaults": {"year_highlight": "What a year it''s been", "looking_forward": "Can''t wait to see what next year brings", "signature": "With gratitude,\nThe [Restaurant] Family"}}, "variation_rules": {"style_adjectives": ["genuine community", "heartfelt gratitude", "year end reflection", "relationship building"], "gratitude_angles": ["customer appreciation", "community support", "team recognition", "milestone celebration"]}}'::JSONB);

-- =====================================================
-- END OF CHRISTMAS/HOLIDAY TEMPLATES
-- =====================================================

-- Summary:
-- Instagram Square (1:1): 6 templates
-- Instagram Stories (9:16): 6 templates
-- Facebook Posts: 3 templates
-- TOTAL: 15 templates (all no-food focused)
