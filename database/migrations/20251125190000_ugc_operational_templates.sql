-- Migration: UGC and Operational Templates
-- Description: 30 templates for user-generated content campaigns and operational announcements
-- Categories: UGC (14 templates), Operational (16 templates)
-- All templates designed WITHOUT AI-generated food imagery

-- ============================================================================
-- SECTION 1: USER-GENERATED CONTENT - INSTAGRAM SQUARE (7 templates)
-- ============================================================================

-- 1. UGC: "Tag Us" Campaign
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-tag-us', 'Tag Us Campaign', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic encouraging customers to tag the restaurant in their posts. Engaging, fun, community-building.

Scene options (NO AI FOOD - use these instead):
- Phone screen mockup showing Instagram with restaurant tagged
- Collage-style frame with space for "your photo here"
- Camera/phone graphic with tag icon
- Restaurant interior/atmosphere shot with overlay graphics

The design invites participation—it's asking for something, not just announcing.

Engaging, friendly typography:
"{{headline}}"
"TAG US IN YOUR PHOTOS"
"{{handle}}"
"{{incentive}}"
"{{hashtag}}"
"{{what_to_share}}"

Design elements: Camera icons, tag symbols, Instagram-style frames, "📸" emoji graphics, user photo placeholders.

The vibe is community, not corporate. "We want to see YOUR experience."

The feeling: Share your moment. We might feature you. Be part of our community.
$PROMPT$,
'v1', TRUE,
'{"style": "community_engagement", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["headline", "handle"], "optional": ["incentive", "hashtag", "what_to_share"], "defaults": {"incentive": "We feature our favorites!", "hashtag": "#YourRestaurantName", "what_to_share": "Your food, your friends, your experience"}}, "variation_rules": {"style_adjectives": ["community building", "participatory", "fun engaging", "user-focused"], "design_elements": ["phone mockup", "photo frame", "camera icon", "tag symbol"], "camera_styles": ["graphic design", "mockup style", "collage frame"]}}'::JSONB);

-- 2. UGC: Photo Contest Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-photo-contest', 'Photo Contest Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing a photo contest. Exciting, prize-focused, clear rules.

Scene: Contest-style graphic design—no food photos needed. Options:
- Trophy/award graphic with camera icon
- "CONTEST" banner style design
- Prize showcase (gift card, merch, free meals represented graphically)
- Polaroid-style frames waiting to be filled

The design creates excitement about winning, not just participating.

Contest-style typography:
"{{headline}}"
"PHOTO CONTEST"
"{{contest_theme}}"
HOW TO ENTER:
1. {{step1}}
2. {{step2}}
3. {{step3}}
PRIZE: {{prize_description}}
"{{deadline}}"
"{{winner_announcement}}"

Design elements: Trophy icons, star bursts, "WIN" badges, countdown graphics, prize imagery (gift cards, etc.).

The vibe is competition meets community. Everyone has a chance.

The feeling: Your photo could win. Enter now. Show us what you've got.
$PROMPT$,
'v1', TRUE,
'{"style": "contest_excitement", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["headline", "contest_theme", "prize_description"], "optional": ["step1", "step2", "step3", "deadline", "winner_announcement"], "defaults": {"step1": "Take a photo at our restaurant", "step2": "Post and tag us @handle", "step3": "Use #ContestHashtag", "deadline": "Entries close Sunday", "winner_announcement": "Winner announced Monday!"}}, "variation_rules": {"style_adjectives": ["contest excitement", "prize focused", "competitive fun", "clear rules"], "design_elements": ["trophy icon", "star burst", "WIN badge", "prize showcase"], "camera_styles": ["graphic contest style", "banner design", "prize feature"]}}'::JSONB);

-- 3. UGC: Review Request (Google/Yelp)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-review-request', 'Review Request', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic asking for reviews. Grateful, not desperate. Makes leaving a review feel easy and appreciated.

Scene: Clean, appreciative design—no food needed. Options:
- Star rating graphic (5 stars highlighted)
- Review platform logos (Google, Yelp, TripAdvisor) tastefully displayed
- "Thank you" focused design with review CTA
- QR code for easy review access

The design is grateful and makes the ask feel small and meaningful.

Appreciative typography:
"{{headline}}"
"{{gratitude_message}}"
"LEAVE US A REVIEW"
{{platform_options}}
"{{why_it_matters}}"
"{{qr_or_link_note}}"

Design elements: Star ratings, heart icons, review platform logos, QR code placeholder, "Thank You" graphics.

The tone is genuine gratitude, not begging. "If you enjoyed your experience..."

The feeling: Your opinion matters. It takes 30 seconds. Help others find us.
$PROMPT$,
'v1', TRUE,
'{"style": "grateful_request", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["headline"], "optional": ["gratitude_message", "platform_options", "why_it_matters", "qr_or_link_note"], "defaults": {"gratitude_message": "Loved your visit?", "platform_options": "Google · Yelp · TripAdvisor", "why_it_matters": "Your reviews help others discover us", "qr_or_link_note": "Scan to review"}}, "variation_rules": {"style_adjectives": ["grateful appreciative", "easy ask", "genuine thanks", "community support"], "design_elements": ["star rating", "platform logos", "QR code", "thank you graphic"], "camera_styles": ["clean graphic", "review focused", "gratitude design"]}}'::JSONB);

-- 4. UGC: Customer Spotlight Frame
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-customer-spotlight', 'Customer Spotlight Frame', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 template frame for featuring customer photos/content. The frame is the template—customer's photo goes inside.

Scene: A branded frame/border design with space for customer content. Options:
- Polaroid-style frame with restaurant branding
- Instagram-style repost frame
- "Featured Customer" badge design
- Decorative border with logo and handle

The frame makes ANY customer photo look polished and on-brand when featured.

Frame typography elements:
"{{frame_title}}"
"{{customer_handle}}"
[CUSTOMER PHOTO AREA - clearly marked space]
"{{caption_area}}"
"{{thank_you_message}}"
"{{handle}}"

Design elements: Branded borders, "Featured" badges, repost indicators, customer credit space, logo placement.

The frame celebrates the customer while maintaining brand consistency.

The feeling: We see you. We appreciate you. You're part of our story.
$PROMPT$,
'v1', TRUE,
'{"style": "feature_frame", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["frame_title"], "optional": ["customer_handle", "caption_area", "thank_you_message", "handle"], "defaults": {"frame_title": "CUSTOMER SPOTLIGHT", "thank_you_message": "Thanks for sharing!", "handle": "@YourRestaurant"}}, "variation_rules": {"style_adjectives": ["branded frame", "customer celebration", "repost style", "community feature"], "frame_styles": ["polaroid", "instagram repost", "featured badge", "decorative border"], "camera_styles": ["frame template", "border design", "spotlight style"]}}'::JSONB);

-- 5. UGC: "Share Your Experience" Prompt
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-share-experience', 'Share Your Experience Prompt', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic inviting customers to share their dining experience. Open-ended, welcoming, story-focused.

Scene options (NO AI FOOD):
- Speech bubble or quote graphic design
- "Your Story" placeholder with decorative elements
- Conversation-style layout with prompts
- Journal/diary aesthetic with writing space imagery

The design encourages storytelling, not just photo sharing.

Inviting typography:
"{{headline}}"
"SHARE YOUR EXPERIENCE"
"{{prompt_question}}"
"{{what_we_want}}"
"{{how_to_share}}"
"{{handle}}"
"{{hashtag}}"

Design elements: Speech bubbles, quote marks, story icons, heart reactions, conversation graphics.

The vibe is "we want to hear from you"—genuine curiosity about their experience.

The feeling: Your story matters. Tell us about your visit. We're listening.
$PROMPT$,
'v1', TRUE,
'{"style": "storytelling_invite", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["headline"], "optional": ["prompt_question", "what_we_want", "how_to_share", "handle", "hashtag"], "defaults": {"prompt_question": "What made your visit special?", "what_we_want": "Your stories, your moments, your memories", "how_to_share": "Tag us or use our hashtag", "hashtag": "#YourRestaurantStories"}}, "variation_rules": {"style_adjectives": ["storytelling", "welcoming", "conversation starter", "experience focused"], "design_elements": ["speech bubble", "quote marks", "story icon", "conversation graphic"], "camera_styles": ["quote design", "journal style", "conversation layout"]}}'::JSONB);

-- 6. UGC: Hashtag Campaign Launch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-hashtag-launch', 'Hashtag Campaign Launch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic launching a new hashtag campaign. Bold, memorable, movement-starting.

Scene options (NO AI FOOD):
- Large hashtag as hero element with decorative treatment
- "#" symbol stylized with brand colors
- Social media feed mockup showing hashtag in use
- Movement/community graphic with hashtag central

The hashtag is the star—make it impossible to forget.

Campaign launch typography:
"{{headline}}"
"{{main_hashtag}}" (LARGE, prominent)
"{{campaign_description}}"
"{{how_to_participate}}"
"{{what_happens}}"
"{{handle}}"

Design elements: Bold hashtag styling, social proof mockups, community icons, trending graphics.

The vibe is "join the movement"—this hashtag means something.

The feeling: Be part of something. Use this hashtag. Join our community.
$PROMPT$,
'v1', TRUE,
'{"style": "campaign_launch", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["headline", "main_hashtag"], "optional": ["campaign_description", "how_to_participate", "what_happens", "handle"], "defaults": {"campaign_description": "Share your moments with us", "how_to_participate": "Use our hashtag when you post", "what_happens": "We feature our favorites weekly"}}, "variation_rules": {"style_adjectives": ["bold launch", "movement starting", "hashtag hero", "community building"], "design_elements": ["large hashtag", "social mockup", "community icons", "trending graphic"], "camera_styles": ["hashtag feature", "campaign style", "movement design"]}}'::JSONB);

-- 7. UGC: User Photo Repost Template
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-sq-repost-template', 'User Photo Repost Template', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 branded template for reposting customer content. Professional frame that credits the original creator.

Scene: Repost-style frame design. Options:
- "Repost" indicator with original creator credit
- Branded border with "📷 by @username" space
- "Community Feature" styled frame
- Minimal frame that lets customer content shine

The template adds brand polish while clearly crediting the customer.

Repost frame elements:
"{{repost_label}}"
[USER CONTENT AREA]
"📷 {{credit_prefix}} {{customer_handle}}"
"{{appreciation_note}}"
"{{handle}}"

Design elements: Repost arrows, camera credit icons, branded corners, minimal borders, credit badges.

The customer content is the hero—the frame just adds context and credit.

The feeling: Great content from our community. Credit where it's due. Thank you for sharing.
$PROMPT$,
'v1', TRUE,
'{"style": "repost_credit", "category": "ugc", "has_food_imagery": false, "input_schema": {"required": ["repost_label"], "optional": ["credit_prefix", "customer_handle", "appreciation_note", "handle"], "defaults": {"repost_label": "COMMUNITY FEATURE", "credit_prefix": "Photo by", "appreciation_note": "Thanks for sharing!", "handle": "@YourRestaurant"}}, "variation_rules": {"style_adjectives": ["repost style", "credit focused", "community feature", "minimal frame"], "design_elements": ["repost arrow", "camera credit", "branded corner", "credit badge"], "camera_styles": ["repost frame", "credit template", "feature border"]}}'::JSONB);


-- ============================================================================
-- SECTION 2: USER-GENERATED CONTENT - INSTAGRAM STORIES (7 templates)
-- ============================================================================

-- 8. UGC Story: "Tag Us to Be Featured" Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-tag-featured', 'Tag Us to Be Featured Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story reminding followers to tag for a chance to be featured. Quick, engaging, action-driving.

Background options (NO AI FOOD):
- Restaurant atmosphere/interior shot
- Phone mockup showing tagged post
- "Featured" badge graphic on vibrant background
- Camera/photo icon animation style

The story creates FOMO—"you could be featured next."

Quick, punchy typography:
"{{headline}}"
"TAG US"
"{{handle}}"
"{{incentive}}"
"{{featured_note}}"

Design elements: Tag icons, camera graphics, "Featured" badges, swipe-up style arrows, Instagram UI elements.

Story-optimized: Bold text, high contrast, readable in 3 seconds.

The feeling: Tag us. Get featured. It's that simple.
$PROMPT$,
'v1', TRUE,
'{"style": "feature_reminder", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "handle"], "optional": ["incentive", "featured_note"], "defaults": {"incentive": "Get featured on our page!", "featured_note": "We share our favorites"}}, "variation_rules": {"style_adjectives": ["quick reminder", "feature focused", "action driving", "FOMO creating"], "design_elements": ["tag icon", "featured badge", "camera graphic", "Instagram UI"], "camera_styles": ["atmosphere shot", "phone mockup", "badge graphic"]}}'::JSONB);

-- 9. UGC Story: Contest Entry Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-contest-reminder', 'Contest Entry Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story reminding followers about an ongoing contest. Urgency-focused, deadline-driven.

Background options (NO AI FOOD):
- Countdown timer graphic
- Trophy/prize icon on bold background
- "LAST CHANCE" style urgent design
- Contest entry mockup

The story creates urgency—time is running out to enter.

Urgent typography:
"{{headline}}"
"{{contest_name}}"
"{{time_remaining}}"
"{{how_to_enter}}"
"{{prize_reminder}}"
"DON'T MISS OUT"

Design elements: Countdown numbers, clock icons, "ENDS SOON" badges, prize graphics, urgency indicators.

Story-optimized: High urgency, clear deadline, simple entry reminder.

The feeling: Contest ending soon. Enter now. Don't miss your chance.
$PROMPT$,
'v1', TRUE,
'{"style": "contest_urgency", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "contest_name"], "optional": ["time_remaining", "how_to_enter", "prize_reminder"], "defaults": {"time_remaining": "Ends tonight!", "how_to_enter": "Tag us + use #hashtag", "prize_reminder": "Win a $50 gift card"}}, "variation_rules": {"style_adjectives": ["urgent reminder", "deadline focused", "last chance", "FOMO driving"], "design_elements": ["countdown timer", "clock icon", "ENDS SOON badge", "prize graphic"], "camera_styles": ["countdown design", "urgency graphic", "timer style"]}}'::JSONB);

-- 10. UGC Story: "Leave a Review" Quick Ask
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-review-ask', 'Leave a Review Quick Ask', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story asking for reviews. Quick, appreciative, easy action.

Background options (NO AI FOOD):
- 5-star rating graphic
- Review platform icons (Google, Yelp)
- "Thank You" focused design
- QR code prominent for easy access

The story makes reviewing feel quick and appreciated.

Quick ask typography:
"{{headline}}"
"{{gratitude}}"
"LEAVE A REVIEW"
"{{platform}}"
"{{time_estimate}}"
[QR CODE or LINK STICKER area]

Design elements: Star ratings, platform logos, QR codes, heart icons, "30 seconds" time indicators.

Story-optimized: One clear ask, easy action, genuine thanks.

The feeling: Loved your visit? 30 seconds to review. We'd appreciate it.
$PROMPT$,
'v1', TRUE,
'{"style": "quick_review_ask", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["gratitude", "platform", "time_estimate"], "defaults": {"gratitude": "Enjoyed your visit?", "platform": "Google · Yelp", "time_estimate": "Takes 30 seconds"}}, "variation_rules": {"style_adjectives": ["quick ask", "appreciative", "easy action", "time conscious"], "design_elements": ["star rating", "platform logo", "QR code", "time indicator"], "camera_styles": ["review graphic", "platform feature", "QR prominent"]}}'::JSONB);

-- 11. UGC Story: Customer Photo Feature Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-customer-feature', 'Customer Photo Feature Story', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story template for featuring customer photos. Celebration-focused, credit-giving.

Background: Story frame designed to showcase customer content. Options:
- Polaroid-style story frame
- "Featured" banner with photo space
- Branded story border
- "📸 by @customer" credit frame

The customer's content is the hero—the frame celebrates them.

Feature frame elements:
"{{feature_label}}"
[CUSTOMER PHOTO AREA - full story height]
"📷 {{customer_handle}}"
"{{appreciation}}"
"{{cta}}"

Design elements: Feature badges, photo credits, branded frames, celebration graphics, "Thank you" elements.

Story-optimized: Customer content prominent, clear credit, celebration vibe.

The feeling: Look at this amazing photo from our community. Thank you for sharing.
$PROMPT$,
'v1', TRUE,
'{"style": "customer_celebration", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["feature_label"], "optional": ["customer_handle", "appreciation", "cta"], "defaults": {"feature_label": "CUSTOMER FEATURE", "appreciation": "Thanks for sharing!", "cta": "Tag us to be featured"}}, "variation_rules": {"style_adjectives": ["celebration focused", "credit giving", "community feature", "customer hero"], "design_elements": ["feature badge", "photo credit", "branded frame", "celebration graphic"], "camera_styles": ["polaroid frame", "feature banner", "credit frame"]}}'::JSONB);

-- 12. UGC Story: "Show Us Your Order" Engagement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-show-order', 'Show Us Your Order Engagement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story asking customers to share what they ordered. Interactive, fun, community-building.

Background options (NO AI FOOD):
- "Show us" text with camera icon
- Question sticker style design
- Interactive poll/question aesthetic
- "Your turn" engagement graphic

The story invites participation—what did YOU get?

Engaging typography:
"{{headline}}"
"SHOW US YOUR ORDER"
"{{prompt}}"
"{{how_to_share}}"
"{{handle}}"
"{{hashtag}}"

Design elements: Camera icons, question marks, "Your turn" graphics, share arrows, engagement stickers.

Story-optimized: Interactive feel, clear prompt, easy participation.

The feeling: What did you order? Show us! We want to see.
$PROMPT$,
'v1', TRUE,
'{"style": "order_engagement", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["prompt", "how_to_share", "handle", "hashtag"], "defaults": {"prompt": "What did you get today?", "how_to_share": "Reply to this story or tag us!", "hashtag": "#MyOrder"}}, "variation_rules": {"style_adjectives": ["interactive", "fun engagement", "community building", "participation focused"], "design_elements": ["camera icon", "question mark", "your turn graphic", "share arrow"], "camera_styles": ["engagement style", "interactive design", "question prompt"]}}'::JSONB);

-- 13. UGC Story: Poll - "What Should We Post?"
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-poll-content', 'Poll What Should We Post', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story with a poll asking followers what content they want to see. Interactive, community-driven.

Background options (NO AI FOOD):
- Poll sticker style design
- "You decide" graphic
- Two-option comparison layout
- Question mark with options

The story gives followers a voice in content decisions.

Poll typography:
"{{headline}}"
"YOU DECIDE"
"{{poll_question}}"
[POLL STICKER AREA]
Option A: {{option_a}}
Option B: {{option_b}}
"{{engagement_note}}"

Design elements: Poll graphics, voting indicators, "Your choice" badges, comparison layouts, question styling.

Story-optimized: Clear options, easy voting, community involvement.

The feeling: You tell us. What do you want to see? Your vote counts.
$PROMPT$,
'v1', TRUE,
'{"style": "community_poll", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "poll_question"], "optional": ["option_a", "option_b", "engagement_note"], "defaults": {"option_a": "Behind the scenes", "option_b": "Menu sneak peeks", "engagement_note": "Vote now!"}}, "variation_rules": {"style_adjectives": ["interactive poll", "community driven", "voting focused", "engagement style"], "design_elements": ["poll graphic", "voting indicator", "comparison layout", "question styling"], "camera_styles": ["poll design", "voting style", "option comparison"]}}'::JSONB);

-- 14. UGC Story: "Add Yours" Story Prompt
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ugc-story-add-yours', 'Add Yours Story Prompt', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story designed for the "Add Yours" sticker feature. Chain-starting, viral potential.

Background options (NO AI FOOD):
- "Add Yours" sticker style design
- Chain/link graphic showing participation
- "Join the trend" aesthetic
- Prompt card style layout

The story starts a chain—designed for the Add Yours feature.

Chain-starting typography:
"{{headline}}"
"ADD YOURS"
"{{prompt}}"
[ADD YOURS STICKER AREA]
"{{participation_note}}"
"{{handle}}"

Design elements: Chain links, "Add Yours" styling, trend indicators, participation counters, viral graphics.

Story-optimized: Clear prompt, Add Yours sticker ready, chain-starting energy.

The feeling: Start a chain. Add yours. Let's see everyone's.
$PROMPT$,
'v1', TRUE,
'{"style": "add_yours_chain", "category": "ugc", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "prompt"], "optional": ["participation_note", "handle"], "defaults": {"participation_note": "Add yours to the chain!", "handle": "@YourRestaurant"}}, "variation_rules": {"style_adjectives": ["chain starting", "viral potential", "trend setting", "participation focused"], "design_elements": ["chain link", "Add Yours styling", "trend indicator", "participation counter"], "camera_styles": ["Add Yours design", "chain style", "trend graphic"]}}'::JSONB);


-- ============================================================================
-- SECTION 3: OPERATIONAL/UTILITY - INSTAGRAM SQUARE (8 templates)
-- ============================================================================

-- 15. OPS: New Location Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-new-location', 'New Location Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing a new restaurant location. Exciting, expansion energy, community welcome.

Scene options (NO FOOD):
- Map pin graphic on stylized map
- Storefront exterior (if available) or architectural rendering
- "Coming Soon" construction/progress imagery
- City/neighborhood skyline or landmarks

The design celebrates growth while welcoming a new community.

Expansion typography:
"{{headline}}"
"NEW LOCATION"
"{{neighborhood_name}}"
"{{address}}"
"OPENING {{opening_date}}"
"{{excitement_message}}"
"{{follow_for_updates}}"

Design elements: Map pins, location markers, "Coming Soon" badges, city graphics, expansion arrows.

The vibe is growth and excitement—"We're coming to YOUR neighborhood."

The feeling: We're growing. Your neighborhood is next. Get ready.
$PROMPT$,
'v1', TRUE,
'{"style": "expansion_excitement", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline", "neighborhood_name", "opening_date"], "optional": ["address", "excitement_message", "follow_for_updates"], "defaults": {"excitement_message": "We can''t wait to meet you!", "follow_for_updates": "Follow for opening updates"}}, "variation_rules": {"style_adjectives": ["expansion excitement", "new community", "growth celebration", "coming soon energy"], "design_elements": ["map pin", "location marker", "coming soon badge", "city graphic"], "camera_styles": ["map style", "storefront exterior", "neighborhood feature"]}}'::JSONB);

-- 16. OPS: Expanded/New Hours
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-new-hours', 'Expanded Hours Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing new or expanded hours. Clear, useful, save-worthy information.

Scene: Clean, informational design—no food needed. Options:
- Clock graphic with new hours highlighted
- Schedule/calendar style layout
- "NEW" badge with hours display
- Day-by-day breakdown design

The design prioritizes clarity—this should be screenshot-worthy.

Clear, useful typography:
"{{headline}}"
"NEW HOURS"
{{hours_display}}
"{{effective_date}}"
"{{reason_or_context}}"
"{{save_reminder}}"

Design elements: Clock icons, calendar graphics, "NEW" badges, day labels, time displays.

The information is the hero. Beautiful but functional.

The feeling: Good news—we're open more. Save this. Plan your visit.
$PROMPT$,
'v1', TRUE,
'{"style": "informational_clear", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline", "hours_display"], "optional": ["effective_date", "reason_or_context", "save_reminder"], "defaults": {"effective_date": "Starting this week", "save_reminder": "📌 Save this post!"}}, "variation_rules": {"style_adjectives": ["clear informational", "save-worthy", "useful update", "schedule focused"], "design_elements": ["clock icon", "calendar graphic", "NEW badge", "time display"], "camera_styles": ["schedule layout", "hours display", "informational design"]}}'::JSONB);

-- 17. OPS: Reservation System Launch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-reservations', 'Reservation System Launch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing online reservations are now available. Convenience-focused, action-driving.

Scene: Tech-forward but warm design—no food needed. Options:
- Phone screen showing reservation interface (mockup)
- Calendar with "BOOK" button graphic
- "Reserve Now" button-style design
- QR code for easy booking access

The design makes booking feel easy and modern.

Convenience typography:
"{{headline}}"
"NOW TAKING RESERVATIONS"
"{{booking_platform}}"
"{{how_to_book}}"
"{{benefits}}"
"{{special_occasions}}"
"{{cta}}"

Design elements: Calendar icons, booking buttons, phone mockups, QR codes, checkmark confirmations.

The vibe is "we made it easy for you."

The feeling: No more waiting. Book your table. Guaranteed seat.
$PROMPT$,
'v1', TRUE,
'{"style": "convenience_modern", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline"], "optional": ["booking_platform", "how_to_book", "benefits", "special_occasions", "cta"], "defaults": {"booking_platform": "OpenTable · Resy · Direct", "how_to_book": "Book online or call", "benefits": "Skip the wait · Guaranteed table", "cta": "Reserve now →"}}, "variation_rules": {"style_adjectives": ["convenience focused", "modern booking", "easy access", "tech-forward"], "design_elements": ["calendar icon", "book button", "phone mockup", "QR code"], "camera_styles": ["booking interface", "button design", "reservation graphic"]}}'::JSONB);

-- 18. OPS: App Download Promotion
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-app-download', 'App Download Promotion', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic promoting the restaurant's app. Benefits-focused, download-driving.

Scene: App-focused design—no food needed. Options:
- Phone mockup showing app interface
- App icon hero with download badges
- App Store / Google Play buttons prominent
- QR code for instant download

The design sells the app's benefits, not just its existence.

App promotion typography:
"{{headline}}"
"DOWNLOAD OUR APP"
{{benefit1}}
{{benefit2}}
{{benefit3}}
"{{exclusive_offer}}"
[App Store / Google Play badges]
"{{qr_instruction}}"

Design elements: Phone mockups, app store badges, QR codes, benefit icons, download arrows.

The vibe is "your experience, upgraded."

The feeling: The app makes everything better. Download now. Exclusive perks await.
$PROMPT$,
'v1', TRUE,
'{"style": "app_promotion", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline"], "optional": ["benefit1", "benefit2", "benefit3", "exclusive_offer", "qr_instruction"], "defaults": {"benefit1": "✓ Order ahead", "benefit2": "✓ Earn rewards", "benefit3": "✓ Exclusive offers", "exclusive_offer": "Get 10% off your first app order", "qr_instruction": "Scan to download"}}, "variation_rules": {"style_adjectives": ["app promotion", "benefits focused", "download driving", "tech convenience"], "design_elements": ["phone mockup", "app store badges", "QR code", "benefit icons"], "camera_styles": ["app interface", "download focused", "benefit showcase"]}}'::JSONB);

-- 19. OPS: WiFi/Amenities Info
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-wifi-amenities', 'WiFi and Amenities Info', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic sharing WiFi info or amenity announcements. Useful, shareable, customer-service focused.

Scene: Clean, helpful design—no food needed. Options:
- WiFi symbol with password display
- Amenity icons (WiFi, outlets, parking, etc.)
- "Good to Know" information card style
- QR code for WiFi connection

The design is purely helpful—information people actually want.

Helpful typography:
"{{headline}}"
"{{amenity_type}}"
"{{details}}"
"{{password_or_info}}"
"{{additional_amenities}}"
"{{friendly_note}}"

Design elements: WiFi symbols, outlet icons, parking graphics, information card styling, QR codes.

The vibe is "we thought of everything."

The feeling: We've got you covered. Work here. Stay awhile. You're welcome.
$PROMPT$,
'v1', TRUE,
'{"style": "helpful_utility", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline", "amenity_type"], "optional": ["details", "password_or_info", "additional_amenities", "friendly_note"], "defaults": {"friendly_note": "Stay awhile ☕"}}, "variation_rules": {"style_adjectives": ["helpful utility", "customer service", "information focused", "amenity showcase"], "amenity_types": ["WiFi", "Parking", "Outlets", "Accessibility", "Pet-friendly"], "design_elements": ["wifi symbol", "amenity icons", "info card", "QR code"], "camera_styles": ["information display", "amenity graphic", "utility design"]}}'::JSONB);

-- 20. OPS: Parking Information
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-parking', 'Parking Information', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic explaining parking options. Clear, helpful, reduces friction for visits.

Scene: Parking-focused design—no food needed. Options:
- Map showing parking locations
- Parking icons with directional arrows
- "Where to Park" information card
- Lot/garage graphic with details

The design removes a barrier to visiting—parking anxiety solved.

Parking info typography:
"{{headline}}"
"PARKING INFO"
"{{parking_options}}"
"{{validation_info}}"
"{{street_parking}}"
"{{tips}}"
"{{address_reminder}}"

Design elements: Parking icons, map graphics, directional arrows, "P" symbols, validation badges.

The vibe is "we made it easy to visit."

The feeling: Don't stress about parking. Here's exactly where to go.
$PROMPT$,
'v1', TRUE,
'{"style": "parking_guide", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline", "parking_options"], "optional": ["validation_info", "street_parking", "tips", "address_reminder"], "defaults": {"tips": "Arrive early on weekends", "address_reminder": "We''re at [address]"}}, "variation_rules": {"style_adjectives": ["helpful guide", "friction reducing", "clear directions", "visitor friendly"], "design_elements": ["parking icon", "map graphic", "directional arrow", "P symbol"], "camera_styles": ["map layout", "parking guide", "direction focused"]}}'::JSONB);

-- 21. OPS: "We're Moving" / Relocation
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-relocation', 'We Are Moving Relocation', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing a location move. Exciting transition, clear new address, continuity message.

Scene: Moving/transition design—no food needed. Options:
- Moving box/arrow graphic showing transition
- Map with "old → new" location pins
- "New Home" celebration design
- Address comparison layout

The design frames the move as exciting, not disruptive.

Relocation typography:
"{{headline}}"
"WE'RE MOVING"
"{{transition_message}}"
"NEW ADDRESS:"
"{{new_address}}"
"{{opening_date}}"
"{{last_day_old}}"
"{{excitement}}"

Design elements: Moving arrows, location pins, "New Home" badges, transition graphics, map elements.

The vibe is "same great experience, better location."

The feeling: We're moving to serve you better. Here's where to find us.
$PROMPT$,
'v1', TRUE,
'{"style": "exciting_transition", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline", "new_address", "opening_date"], "optional": ["transition_message", "last_day_old", "excitement"], "defaults": {"transition_message": "Same team, new home", "excitement": "We can''t wait to welcome you!"}}, "variation_rules": {"style_adjectives": ["exciting transition", "new chapter", "continuity focused", "address clear"], "design_elements": ["moving arrow", "location pin", "New Home badge", "transition graphic"], "camera_styles": ["transition design", "map comparison", "moving style"]}}'::JSONB);

-- 22. OPS: Temporary Closure Notice
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-sq-temp-closure', 'Temporary Closure Notice', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing a temporary closure. Clear, professional, reassuring about return.

Scene: Clean, informational design—no food needed. Options:
- Calendar with closure dates marked
- "Temporarily Closed" professional badge
- Countdown to reopening
- "See You Soon" hopeful design

The design is honest and reassuring—we'll be back.

Closure notice typography:
"{{headline}}"
"TEMPORARILY CLOSED"
"{{closure_dates}}"
"{{reason}}"
"{{reopening_date}}"
"{{apology_note}}"
"{{follow_for_updates}}"

Design elements: Calendar marks, closure badges, countdown graphics, "See You Soon" messaging, date displays.

The tone is professional and reassuring, not alarming.

The feeling: We're closed briefly. Here's when we're back. Thank you for understanding.
$PROMPT$,
'v1', TRUE,
'{"style": "professional_notice", "category": "operational", "has_food_imagery": false, "input_schema": {"required": ["headline", "closure_dates", "reopening_date"], "optional": ["reason", "apology_note", "follow_for_updates"], "defaults": {"apology_note": "We appreciate your patience", "follow_for_updates": "Follow for reopening updates"}}, "variation_rules": {"style_adjectives": ["professional notice", "reassuring", "clear dates", "temporary focus"], "design_elements": ["calendar mark", "closure badge", "countdown graphic", "date display"], "camera_styles": ["notice design", "calendar style", "professional layout"]}}'::JSONB);


-- ============================================================================
-- SECTION 4: OPERATIONAL/UTILITY - INSTAGRAM STORIES (8 templates)
-- ============================================================================

-- 23. OPS Story: "We're Open" Confirmation
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-were-open', 'We Are Open Confirmation', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story confirming you're open. Simple, clear, timely—especially useful for holidays or unusual circumstances.

Background: Restaurant atmosphere without food focus. Options:
- Interior shot showing lights on, ready for guests
- "OPEN" sign lit up
- Staff preparing/welcoming
- Door open, inviting entrance

The message is simple: YES, we're open. Come on in.

Clear, welcoming typography:
"{{headline}}"
"WE'RE OPEN"
"{{today_hours}}"
"{{special_note}}"
"{{cta}}"

Design elements: "OPEN" graphics, checkmarks, welcome messaging, hours display.

Especially useful for: holidays when people wonder, after closures, unusual hours.

The feeling: Wondering if we're open? We are. Come see us.
$PROMPT$,
'v1', TRUE,
'{"style": "confirmation_welcome", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["today_hours", "special_note", "cta"], "defaults": {"today_hours": "Regular hours today", "cta": "See you soon!"}}, "variation_rules": {"style_adjectives": ["confirmation clear", "welcoming", "timely update", "open for business"], "scene_types": ["interior ready", "open sign", "staff welcoming", "door entrance"], "camera_styles": ["atmosphere shot", "open confirmation", "welcome scene"]}}'::JSONB);

-- 24. OPS Story: Holiday Hours Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-holiday-hours', 'Holiday Hours Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story reminding followers of holiday hours. Timely, save-worthy, prevents wasted trips.

Background options (NO AI FOOD):
- Holiday-themed graphic design
- Calendar with holiday marked
- Clock with special hours
- Festive but informational design

The story prevents confusion—know before you go.

Holiday hours typography:
"{{headline}}"
"{{holiday_name}} HOURS"
"{{hours_display}}"
"{{special_note}}"
"{{save_reminder}}"

Design elements: Holiday icons, calendar graphics, clock displays, festive accents, save indicators.

Story-optimized: Clear hours, holiday context, screenshot-worthy.

The feeling: Holiday hours alert. Save this. Plan accordingly.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_info", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "holiday_name", "hours_display"], "optional": ["special_note", "save_reminder"], "defaults": {"save_reminder": "📌 Screenshot this!"}}, "variation_rules": {"style_adjectives": ["holiday themed", "informational", "save-worthy", "timely reminder"], "design_elements": ["holiday icon", "calendar graphic", "clock display", "festive accent"], "camera_styles": ["holiday design", "hours display", "festive informational"]}}'::JSONB);

-- 25. OPS Story: "Book Now" Reservation Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-book-now', 'Book Now Reservation Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story pushing reservations. Urgency for popular times, easy booking action.

Background options (NO AI FOOD):
- Calendar showing availability
- "Book Now" button-style design
- Phone mockup with reservation app
- "Tables filling up" urgency graphic

The story creates urgency for booking, especially for popular times.

Booking push typography:
"{{headline}}"
"BOOK NOW"
"{{urgency_message}}"
"{{occasion}}"
"{{how_to_book}}"
[LINK STICKER / SWIPE UP area]

Design elements: Calendar icons, booking buttons, urgency indicators, availability graphics, action arrows.

Story-optimized: Clear urgency, easy action, one tap to book.

The feeling: Tables filling up. Book now. Don't miss out.
$PROMPT$,
'v1', TRUE,
'{"style": "booking_urgency", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["urgency_message", "occasion", "how_to_book"], "defaults": {"urgency_message": "Weekend tables filling fast!", "occasion": "Date night · Celebrations · Groups", "how_to_book": "Tap to reserve"}}, "variation_rules": {"style_adjectives": ["booking urgency", "action driving", "availability focused", "easy booking"], "design_elements": ["calendar icon", "book button", "urgency indicator", "availability graphic"], "camera_styles": ["booking design", "urgency style", "action focused"]}}'::JSONB);

-- 26. OPS Story: App Feature Highlight
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-app-feature', 'App Feature Highlight', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story highlighting a specific app feature. Benefit-focused, download-driving.

Background options (NO AI FOOD):
- Phone mockup showing specific feature
- Feature icon with benefit text
- Before/after comparison (with app vs without)
- App interface screenshot style

The story sells ONE feature, not the whole app.

Feature highlight typography:
"{{headline}}"
"{{feature_name}}"
"{{benefit_description}}"
"{{how_it_works}}"
"{{download_cta}}"
[APP STORE LINK area]

Design elements: Phone mockups, feature icons, benefit callouts, app store badges, download arrows.

Story-optimized: One feature, clear benefit, easy download.

The feeling: Did you know our app does this? Download and try it.
$PROMPT$,
'v1', TRUE,
'{"style": "feature_spotlight", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "feature_name"], "optional": ["benefit_description", "how_it_works", "download_cta"], "defaults": {"benefit_description": "Makes your experience even better", "download_cta": "Download free"}}, "variation_rules": {"style_adjectives": ["feature focused", "benefit driven", "app promotion", "single feature"], "design_elements": ["phone mockup", "feature icon", "benefit callout", "download arrow"], "camera_styles": ["app interface", "feature showcase", "benefit highlight"]}}'::JSONB);

-- 27. OPS Story: "Find Us" Location/Directions
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-find-us', 'Find Us Location Directions', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story with location and directions. Helpful for new visitors, shareable.

Background options (NO AI FOOD):
- Map graphic with pin
- Storefront exterior photo
- Landmark-based directions
- "Find Us" wayfinding design

The story helps people find you—especially useful for hidden gems or complex locations.

Directions typography:
"{{headline}}"
"FIND US"
"{{address}}"
"{{landmark_directions}}"
"{{parking_note}}"
"{{maps_cta}}"
[LOCATION STICKER area]

Design elements: Map pins, direction arrows, landmark icons, address displays, navigation graphics.

Story-optimized: Clear address, helpful landmarks, tap for maps.

The feeling: Here's exactly where we are. Easy to find. See you soon.
$PROMPT$,
'v1', TRUE,
'{"style": "wayfinding_helpful", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "address"], "optional": ["landmark_directions", "parking_note", "maps_cta"], "defaults": {"landmark_directions": "Look for the [landmark]", "maps_cta": "Tap for directions"}}, "variation_rules": {"style_adjectives": ["wayfinding", "helpful directions", "location focused", "visitor friendly"], "design_elements": ["map pin", "direction arrow", "landmark icon", "address display"], "camera_styles": ["map style", "storefront exterior", "wayfinding design"]}}'::JSONB);

-- 28. OPS Story: Service Update (kitchen closed, etc.)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-service-update', 'Service Update Notice', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story announcing a service change. Clear, timely, prevents disappointment.

Background options (NO AI FOOD):
- Information card style design
- Alert/notice graphic
- Service icon with update text
- Professional announcement layout

The story sets expectations—know before you arrive.

Service update typography:
"{{headline}}"
"SERVICE UPDATE"
"{{update_details}}"
"{{timeframe}}"
"{{alternative}}"
"{{apology_note}}"

Design elements: Alert icons, information badges, service icons, update indicators, notice styling.

Story-optimized: Clear update, timeframe, alternatives if applicable.

The feeling: Heads up on a change. Here's what to know. Thanks for understanding.
$PROMPT$,
'v1', TRUE,
'{"style": "service_notice", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "update_details"], "optional": ["timeframe", "alternative", "apology_note"], "defaults": {"apology_note": "Thanks for your patience"}}, "variation_rules": {"style_adjectives": ["clear notice", "timely update", "expectation setting", "professional"], "design_elements": ["alert icon", "info badge", "service icon", "notice styling"], "camera_styles": ["info card", "alert design", "notice layout"]}}'::JSONB);

-- 29. OPS Story: "Back Open" After Closure
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-back-open', 'Back Open After Closure', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story announcing reopening after a closure. Celebratory, welcoming, "we missed you" energy.

Background options (NO AI FOOD):
- "OPEN" sign lit up
- Doors opening graphic
- Welcome back celebration design
- Staff ready and welcoming

The story celebrates being back—we missed you, come see us.

Reopening typography:
"{{headline}}"
"WE'RE BACK"
"{{reopening_message}}"
"{{hours}}"
"{{what_to_expect}}"
"{{welcome_back}}"

Design elements: "OPEN" graphics, celebration elements, welcome messaging, door/entrance imagery, "We missed you" text.

Story-optimized: Celebratory energy, clear we're open, welcoming tone.

The feeling: We're back! We missed you. Come celebrate with us.
$PROMPT$,
'v1', TRUE,
'{"style": "reopening_celebration", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["reopening_message", "hours", "what_to_expect", "welcome_back"], "defaults": {"reopening_message": "The wait is over", "welcome_back": "We missed you!"}}, "variation_rules": {"style_adjectives": ["celebratory", "welcoming back", "we missed you", "reopening energy"], "design_elements": ["OPEN graphic", "celebration element", "welcome message", "door imagery"], "camera_styles": ["open sign", "welcome design", "celebration style"]}}'::JSONB);

-- 30. OPS Story: Contact Info / How to Reach Us
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('ops-story-contact-info', 'Contact Info How to Reach Us', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story with contact information. Useful, save-worthy, all info in one place.

Background options (NO AI FOOD):
- Contact card style design
- Phone/email icons with info
- "Reach Us" information layout
- QR code for contact saving

The story is a digital business card—all contact info, easy to save.

Contact info typography:
"{{headline}}"
"REACH US"
"📞 {{phone}}"
"✉️ {{email}}"
"📍 {{address}}"
"{{social_handles}}"
"{{hours_summary}}"
"{{save_note}}"

Design elements: Contact icons, phone/email graphics, address displays, social icons, QR codes for contact.

Story-optimized: All info visible, easy to screenshot, save-worthy.

The feeling: Here's how to reach us. Save this. We're here for you.
$PROMPT$,
'v1', TRUE,
'{"style": "contact_card", "category": "operational", "has_food_imagery": false, "frame_count": 1, "input_schema": {"required": ["headline", "phone"], "optional": ["email", "address", "social_handles", "hours_summary", "save_note"], "defaults": {"save_note": "📌 Save for later"}}, "variation_rules": {"style_adjectives": ["contact card", "information complete", "save-worthy", "digital business card"], "design_elements": ["contact icon", "phone graphic", "email icon", "QR code"], "camera_styles": ["contact card", "info layout", "business card style"]}}'::JSONB);

-- ============================================================================
-- END OF MIGRATION: 30 UGC & OPERATIONAL TEMPLATES
-- ============================================================================
-- Summary:
-- UGC Instagram Square (7): tag-us, photo-contest, review-request, customer-spotlight, 
--                           share-experience, hashtag-launch, repost-template
-- UGC Instagram Stories (7): tag-featured, contest-reminder, review-ask, customer-feature,
--                            show-order, poll-content, add-yours
-- OPS Instagram Square (8): new-location, new-hours, reservations, app-download,
--                           wifi-amenities, parking, relocation, temp-closure
-- OPS Instagram Stories (8): were-open, holiday-hours, book-now, app-feature,
--                            find-us, service-update, back-open, contact-info
-- ============================================================================
