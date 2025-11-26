-- Migration: Instagram Story Templates (No Food Imagery)
-- Description: 35 typography-focused Instagram Story templates for restaurants
-- Date: 2025-11-25

-- ============================================================================
-- SINGLE FRAME TEMPLATES (15 templates)
-- ============================================================================

-- 1. Hours Update / Schedule Change
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-hours-update', 'Hours Update Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with bold, modern typography on a textured background. No food imagery—pure graphic design impact.

Background: {{background_style}} texture with subtle grain that adds warmth and authenticity. Soft shadows create depth without distraction.

Large, attention-grabbing headline in a clean sans-serif font:
"{{headline}}"

Clear, highly readable hours display with strong visual hierarchy:
{{day_range}}
{{hours_line1}}
{{hours_line2}}

"{{additional_note}}"

Small logo or wordmark positioned in the bottom corner with breathing room. The design is clean, scannable in 2-3 seconds while scrolling. High contrast ensures readability on any device brightness.

Color palette: {{color_mood}} tones that feel professional yet approachable. Think: the kind of story that actually gets screenshotted and saved. Useful information, beautifully presented.
$PROMPT$,
'v1', TRUE,
'{"style": "typography_utility", "frame_count": 1, "content_type": "hours_update", "input_schema": {"required": ["headline", "day_range", "hours_line1"], "optional": ["hours_line2", "additional_note", "background_style", "color_mood"], "defaults": {"background_style": "warm concrete", "additional_note": "See you soon!", "color_mood": "warm neutral"}}}'::JSONB);

-- 2. Now Hiring Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-hiring', 'Now Hiring Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with energetic, welcoming typography. No food—focus on opportunity and team culture.

Background: {{background_style}}—could be a soft-focus shot of empty restaurant interior, kitchen equipment silhouettes, or abstract brand pattern. Warm, inviting lighting.

Bold headline that commands attention:
"{{headline}}"

Position details with clear hierarchy:
"{{position_title}}"
{{position_type}}

Key benefits or culture highlights:
• {{benefit1}}
• {{benefit2}}
• {{benefit3}}

Clear call-to-action:
"{{cta}}"
{{application_method}}

The energy is optimistic and inclusive—this feels like joining a family, not filling a slot. Professional but human. The kind of post that makes someone tag a friend who's job hunting.

Design note: Leave space for Instagram's native link sticker near the bottom third.
$PROMPT$,
'v1', TRUE,
'{"style": "recruitment_welcoming", "frame_count": 1, "content_type": "hiring", "input_schema": {"required": ["headline", "position_title"], "optional": ["position_type", "benefit1", "benefit2", "benefit3", "cta", "application_method", "background_style"], "defaults": {"headline": "WE''RE HIRING", "position_type": "Full-time & Part-time", "benefit1": "Flexible scheduling", "benefit2": "Team meals included", "benefit3": "Growth opportunities", "cta": "Join our team", "application_method": "DM us or apply in person", "background_style": "soft-focus restaurant interior"}}}'::JSONB);

-- 3. Holiday Closure Notice
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-holiday-closure', 'Holiday Closure Notice', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with warm, festive typography. No food imagery—elegant seasonal design.

Background: {{seasonal_style}} aesthetic—subtle holiday textures, soft bokeh lights, or elegant seasonal patterns. Nothing garish or overly commercial.

Warm, appreciative headline:
"{{headline}}"

Clear closure information:
"{{closure_dates}}"
{{closure_reason}}

Heartfelt message:
"{{gratitude_message}}"

Return information:
"{{return_info}}"

Small decorative elements that match the season—could be subtle snowflakes, autumn leaves, spring florals, or summer rays depending on the holiday. Never overwhelming.

The tone is grateful and warm—thanking guests for their support while clearly communicating the schedule. Professional holiday card energy, not corporate memo.

Logo placement in corner with seasonal accent.
$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_elegant", "frame_count": 1, "content_type": "holiday_closure", "input_schema": {"required": ["headline", "closure_dates"], "optional": ["closure_reason", "gratitude_message", "return_info", "seasonal_style"], "defaults": {"headline": "Holiday Hours", "closure_reason": "Spending time with our families", "gratitude_message": "Thank you for an amazing year!", "return_info": "Back to regular hours soon", "seasonal_style": "warm festive"}}}'::JSONB);

-- 4. Weather Alert / Status Update
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-weather-alert', 'Weather Alert Status', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with clear, urgent-but-calm typography. No food—pure information design.

Background: {{weather_mood}} gradient or texture that reflects conditions—stormy grays for bad weather, bright for reopening, warm amber for caution.

Clear status indicator at top:
"{{status_badge}}"

Main headline:
"{{headline}}"

Detailed information:
{{status_details}}
{{time_info}}

Safety-first message:
"{{safety_message}}"

Updates promise:
"{{update_info}}"

The design balances urgency with reassurance. Not panic-inducing, but clearly important. High contrast for quick scanning. The kind of update that shows you care about your community's safety.

Icon or simple graphic element representing weather condition—abstract, not cartoonish.
$PROMPT$,
'v1', TRUE,
'{"style": "alert_informative", "frame_count": 1, "content_type": "weather_status", "input_schema": {"required": ["headline", "status_badge"], "optional": ["status_details", "time_info", "safety_message", "update_info", "weather_mood"], "defaults": {"status_badge": "⚠️ WEATHER UPDATE", "safety_message": "Stay safe out there!", "update_info": "Check back for updates", "weather_mood": "stormy gradient"}}}'::JSONB);


-- 5. Thank You / Milestone Celebration
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-milestone', 'Milestone Celebration', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with celebratory, heartfelt typography. No food—pure gratitude and achievement.

Background: {{celebration_style}}—confetti particles, subtle sparkle effects, or elegant gradient. Festive but sophisticated.

Celebratory headline with impact:
"{{headline}}"

The milestone:
"{{milestone_number}}"
{{milestone_type}}

Gratitude message:
"{{thank_you_message}}"

Personal touch:
"{{personal_note}}"

Subtle celebratory elements—could be abstract confetti, gentle sparkles, or elegant flourishes. Never tacky or over-the-top.

The energy is genuine appreciation, not bragging. This milestone belongs to the community as much as the restaurant. Warm, inclusive, celebratory.

Space for engagement: "Help us celebrate! 🎉"
$PROMPT$,
'v1', TRUE,
'{"style": "celebration_grateful", "frame_count": 1, "content_type": "milestone", "input_schema": {"required": ["headline", "milestone_number"], "optional": ["milestone_type", "thank_you_message", "personal_note", "celebration_style"], "defaults": {"headline": "WOW!", "milestone_type": "and counting", "thank_you_message": "This is all because of YOU", "personal_note": "From our family to yours—thank you!", "celebration_style": "elegant confetti"}}}'::JSONB);

-- 6. Poll Question / This or That
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-poll', 'Poll Question Engagement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame designed for maximum engagement. No food imagery—typography and design that begs interaction.

Background: {{poll_style}}—split design, bold color blocks, or playful pattern that creates visual tension between options.

Attention-grabbing question:
"{{question}}"

Clear options presentation:
"{{option_a}}"
vs.
"{{option_b}}"

Engagement prompt:
"{{engagement_cta}}"

Design specifically accommodates Instagram's native poll sticker—leave clear space in the center-bottom area. The visual design should complement, not compete with, the interactive element.

The vibe is playful and inviting. Low-stakes fun that makes people want to participate. Could be serious preference gathering or just community bonding.

Optional: Small text teasing what you'll do with results: "{{results_tease}}"
$PROMPT$,
'v1', TRUE,
'{"style": "engagement_playful", "frame_count": 1, "content_type": "poll", "input_schema": {"required": ["question", "option_a", "option_b"], "optional": ["engagement_cta", "results_tease", "poll_style"], "defaults": {"engagement_cta": "Vote now! 👆", "results_tease": "Winner gets added to the menu...", "poll_style": "bold split design"}}}'::JSONB);

-- 7. Inspirational Quote
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-quote', 'Inspirational Quote', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with elegant, thoughtful typography. No food—pure inspiration and brand voice.

Background: {{quote_aesthetic}}—minimalist texture, soft gradient, or atmospheric photography of restaurant space (empty tables, window light, architectural details).

The quote, beautifully typeset:
"{{quote_text}}"

Attribution:
— {{quote_attribution}}

Optional context or reflection:
"{{reflection}}"

Typography is the hero here. Consider:
- Elegant serif for timeless wisdom
- Bold sans-serif for motivational punch
- Script accent for warmth
- Mixed weights for emphasis

The design feels like something worth saving and sharing. Not generic motivational poster energy—authentic to your brand voice.

Subtle brand element in corner. The quote should feel discovered, not advertised.
$PROMPT$,
'v1', TRUE,
'{"style": "inspirational_elegant", "frame_count": 1, "content_type": "quote", "input_schema": {"required": ["quote_text"], "optional": ["quote_attribution", "reflection", "quote_aesthetic"], "defaults": {"quote_attribution": "Our Team", "quote_aesthetic": "minimalist warm"}}}'::JSONB);

-- 8. Event Countdown Teaser
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-countdown', 'Event Countdown Teaser', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame building anticipation. No food—mystery and excitement through design.

Background: {{countdown_mood}}—dramatic lighting, abstract shapes, or moody textures that create intrigue.

Countdown display with impact:
"{{days_until}}"
DAYS

Event teaser:
"{{event_teaser}}"

Hint without revealing:
"{{hint_text}}"

Call-to-action:
"{{cta}}"

Design specifically accommodates Instagram's native countdown sticker—leave prominent space for it. The visual should amplify the anticipation.

The energy is "something's coming." Mysterious but exciting, not frustrating. Give enough to intrigue, hold back enough to build anticipation.

Optional: "Set a reminder 🔔" prompt near countdown sticker area.
$PROMPT$,
'v1', TRUE,
'{"style": "anticipation_dramatic", "frame_count": 1, "content_type": "countdown", "input_schema": {"required": ["days_until", "event_teaser"], "optional": ["hint_text", "cta", "countdown_mood"], "defaults": {"hint_text": "You''re not ready for this...", "cta": "Mark your calendar", "countdown_mood": "dramatic moody"}}}'::JSONB);

-- 9. "We're Back" / Reopening
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-reopening', 'Reopening Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with triumphant, welcoming energy. No food—celebration of return.

Background: {{reopening_style}}—bright, optimistic lighting. Could be doors opening, light streaming in, or fresh clean interior shot.

Bold, celebratory headline:
"{{headline}}"

The news:
"{{reopening_message}}"
{{reopening_date}}

What to expect:
"{{whats_new}}"

Warm invitation:
"{{invitation}}"

The energy is "we missed you too." Genuine excitement to welcome people back, not just a business announcement. Warm, bright, optimistic.

Design feels like a fresh start—clean, bright, full of possibility. The visual equivalent of opening curtains to let sunlight in.

Clear CTA for reservations or visits.
$PROMPT$,
'v1', TRUE,
'{"style": "triumphant_welcoming", "frame_count": 1, "content_type": "reopening", "input_schema": {"required": ["headline", "reopening_message"], "optional": ["reopening_date", "whats_new", "invitation", "reopening_style"], "defaults": {"headline": "WE''RE BACK!", "reopening_date": "Starting this week", "whats_new": "Same love, fresh energy", "invitation": "Can''t wait to see you", "reopening_style": "bright optimistic"}}}'::JSONB);

-- 10. Staff Birthday / Work Anniversary
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-staff-celebration', 'Staff Celebration', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame celebrating a team member. No food—human connection and appreciation.

Background: {{celebration_type}} aesthetic—birthday balloons and confetti, or anniversary elegance with subtle gold accents.

Celebration headline:
"{{headline}}"

The honoree:
"{{staff_name}}"
{{staff_role}}

The occasion:
"{{occasion_details}}"

Personal touch:
"{{personal_message}}"

Community invitation:
"{{community_cta}}"

Space for real photo of team member (not AI-generated)—design frames it beautifully.

The energy is genuine appreciation. This person matters to your team and your guests should know it. Warm, personal, celebratory without being over-the-top.

Makes followers feel like insiders who know the team.
$PROMPT$,
'v1', TRUE,
'{"style": "team_appreciation", "frame_count": 1, "content_type": "staff_celebration", "input_schema": {"required": ["headline", "staff_name", "occasion_details"], "optional": ["staff_role", "personal_message", "community_cta", "celebration_type"], "defaults": {"headline": "HAPPY BIRTHDAY!", "personal_message": "We''re so lucky to have you!", "community_cta": "Say happy birthday next time you''re in! 🎂", "celebration_type": "birthday festive"}}}'::JSONB);


-- 11. Community Shoutout / Local Love
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-community', 'Community Shoutout', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame celebrating local community. No food—neighborhood pride and connection.

Background: {{community_style}}—local neighborhood aesthetic, community textures, or warm welcoming tones.

Community-focused headline:
"{{headline}}"

The shoutout:
"{{shoutout_recipient}}"
{{shoutout_reason}}

Your connection:
"{{connection_story}}"

Community message:
"{{community_message}}"

Tag prompt:
"{{tag_cta}}"

The energy is "we're all in this together." Genuine appreciation for the neighborhood, local businesses, community members. Not performative—authentic local love.

Design feels rooted in place. Could include subtle local references, neighborhood colors, or community symbols.

Encourages tagging and sharing—builds real community connections.
$PROMPT$,
'v1', TRUE,
'{"style": "community_authentic", "frame_count": 1, "content_type": "community_shoutout", "input_schema": {"required": ["headline", "shoutout_recipient"], "optional": ["shoutout_reason", "connection_story", "community_message", "tag_cta", "community_style"], "defaults": {"headline": "LOCAL LOVE 💛", "shoutout_reason": "For being amazing neighbors", "community_message": "Supporting each other, always", "tag_cta": "Tag a local business you love!", "community_style": "warm neighborhood"}}}'::JSONB);

-- 12. Reservation Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-reservation', 'Reservation Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with helpful, actionable information. No food—pure utility design.

Background: {{reservation_style}}—elegant restaurant interior elements, table settings without food, or sophisticated brand pattern.

Clear headline:
"{{headline}}"

Reservation information:
"{{availability_info}}"
{{time_slots}}

How to book:
"{{booking_method}}"

Pro tip:
"{{pro_tip}}"

Urgency (if applicable):
"{{urgency_note}}"

Design is clean and scannable. This is utility content—make it easy to act on. Clear visual hierarchy guides the eye from headline to action.

Space for link sticker to reservation platform. The kind of story people screenshot when planning their week.

Professional but not cold. Helpful concierge energy.
$PROMPT$,
'v1', TRUE,
'{"style": "utility_elegant", "frame_count": 1, "content_type": "reservation_reminder", "input_schema": {"required": ["headline", "booking_method"], "optional": ["availability_info", "time_slots", "pro_tip", "urgency_note", "reservation_style"], "defaults": {"headline": "BOOK YOUR TABLE", "availability_info": "This weekend is filling up!", "pro_tip": "Best availability: weekday evenings", "urgency_note": "Limited spots remaining", "reservation_style": "elegant minimal"}}}'::JSONB);

-- 13. WiFi Password Share
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-wifi', 'WiFi Password Share', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with practical, saveable information. No food—pure utility with personality.

Background: {{wifi_style}}—cozy cafe interior vibes, laptop-friendly aesthetic, or clean minimal design.

Friendly headline:
"{{headline}}"

Network information:
📶 Network: {{network_name}}
🔑 Password: {{password}}

Helpful context:
"{{context_message}}"

Personality touch:
"{{personality_note}}"

Save prompt:
"{{save_cta}}"

Design is screenshot-worthy. Large, readable text for the important info. This is the kind of practical content that builds goodwill—you're making their life easier.

Could include subtle coffee cup icon, laptop illustration, or cozy work-from-here vibes. Welcoming to remote workers and students.

The password should be the most prominent element after the headline.
$PROMPT$,
'v1', TRUE,
'{"style": "utility_friendly", "frame_count": 1, "content_type": "wifi_share", "input_schema": {"required": ["network_name", "password"], "optional": ["headline", "context_message", "personality_note", "save_cta", "wifi_style"], "defaults": {"headline": "FREE WIFI ☕", "context_message": "Stay as long as you like", "personality_note": "Your office away from office", "save_cta": "📌 Screenshot this!", "wifi_style": "cozy workspace"}}}'::JSONB);

-- 14. Playlist / Vibe Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-playlist', 'Playlist Vibe Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame with musical, atmospheric energy. No food—pure vibe and mood.

Background: {{playlist_aesthetic}}—vinyl record textures, sound wave graphics, moody atmospheric lighting, or abstract musical elements.

Vibe-setting headline:
"{{headline}}"

Playlist info:
"{{playlist_name}}"
{{playlist_description}}

Featured tracks or artists:
🎵 {{track1}}
🎵 {{track2}}
🎵 {{track3}}

Listen prompt:
"{{listen_cta}}"

The energy matches the music—could be chill lo-fi vibes, upbeat brunch energy, romantic dinner mood, or late-night cocktail atmosphere.

Design feels like album art or a music poster. Typography and colors reflect the sonic mood. This is brand-building through atmosphere.

Space for Spotify/Apple Music link sticker. Shareable for music lovers.
$PROMPT$,
'v1', TRUE,
'{"style": "atmospheric_musical", "frame_count": 1, "content_type": "playlist", "input_schema": {"required": ["headline", "playlist_name"], "optional": ["playlist_description", "track1", "track2", "track3", "listen_cta", "playlist_aesthetic"], "defaults": {"headline": "NOW PLAYING", "playlist_description": "The soundtrack to your meal", "listen_cta": "Follow our playlist 🎧", "playlist_aesthetic": "vinyl warm"}}}'::JSONB);

-- 15. Review Highlight (Text Only)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-1f-review', 'Review Highlight', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story frame showcasing customer love. No food, no screenshots—elegant text presentation.

Background: {{review_style}}—sophisticated gradient, subtle texture, or soft-focus restaurant ambiance.

Social proof indicator:
"{{review_source}}"
⭐⭐⭐⭐⭐

The review quote, beautifully typeset:
"{{review_text}}"

Attribution:
— {{reviewer_name}}

Gratitude response:
"{{thank_you_note}}"

The design elevates the testimonial—this isn't a lazy screenshot, it's a designed piece that shows you value feedback. Large quotation marks, elegant typography, breathing room.

The energy is humble gratitude, not bragging. Let the customer's words speak for themselves.

Subtle CTA: "Share your experience with us" or similar invitation for more reviews.
$PROMPT$,
'v1', TRUE,
'{"style": "testimonial_elegant", "frame_count": 1, "content_type": "review_highlight", "input_schema": {"required": ["review_text"], "optional": ["review_source", "reviewer_name", "thank_you_note", "review_style"], "defaults": {"review_source": "From our guests", "reviewer_name": "A happy guest", "thank_you_note": "Reviews like this make it all worth it 🙏", "review_style": "sophisticated gradient"}}}'::JSONB);

-- ============================================================================
-- TWO-FRAME SEQUENCE TEMPLATES (10 templates)
-- ============================================================================

-- 1. Teaser → Reveal Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-teaser-reveal', 'Teaser to Reveal Sequence', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence creating anticipation and payoff. No food imagery required.

FRAME 1 - THE TEASER:
Vertical 9:16 frame with mysterious, intriguing energy. Dark or moody background with dramatic lighting—shadows, silhouettes, abstract shapes.

Bold typography, partially obscured or with blur effect:
"{{teaser_headline}}"
"{{teaser_subtext}}"

Visual elements that hint but don't reveal: extreme close-ups of textures, equipment silhouettes, hands in motion, architectural details.

"Tap to find out →"

The vibe: something's coming. You need to know what. Curiosity is irresistible.

---

FRAME 2 - THE REVEAL:
Same dimensions, energy shifts to celebration and clarity. Brighter, more open, triumphant.

Full reveal typography:
"{{reveal_headline}}"
"{{reveal_details}}"

Key information:
• {{detail1}}
• {{detail2}}
• {{detail3}}

Clear call-to-action:
"{{cta}}"

The payoff feels worth the wait. Satisfying, not anticlimactic. Clear next steps for interested viewers.

Space for link sticker or swipe-up area.
$PROMPT$,
'v1', TRUE,
'{"style": "anticipation_payoff", "frame_count": 2, "content_type": "announcement", "input_schema": {"required": ["teaser_headline", "reveal_headline"], "optional": ["teaser_subtext", "reveal_details", "detail1", "detail2", "detail3", "cta"], "defaults": {"teaser_subtext": "Coming soon...", "cta": "Link in bio", "detail1": "", "detail2": "", "detail3": ""}}}'::JSONB);

-- 2. Question → Answer
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-qa', 'Question and Answer', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence for FAQ or community Q&A. No food required—educational and engaging.

FRAME 1 - THE QUESTION:
Vertical 9:16 frame with curious, inviting energy. Background suggests thoughtfulness—could be question mark motifs, thinking pose silhouette, or clean minimal design.

The question prominently displayed:
"{{question}}"

Context if needed:
"{{question_context}}"

Visual cue to continue:
"We get asked this a lot..."
"Tap for the answer →"

Design accommodates Instagram's question sticker if you want to collect more questions.

---

FRAME 2 - THE ANSWER:
Same dimensions, energy shifts to helpful and informative. Brighter, clearer, more open.

The answer:
"{{answer}}"

Additional context:
{{additional_info}}

Helpful follow-up:
"{{follow_up}}"

Invitation for more questions:
"{{more_questions_cta}}"

The tone is helpful expert, not condescending. You're sharing knowledge, building trust. Educational content that positions you as the authority.
$PROMPT$,
'v1', TRUE,
'{"style": "educational_helpful", "frame_count": 2, "content_type": "qa", "input_schema": {"required": ["question", "answer"], "optional": ["question_context", "additional_info", "follow_up", "more_questions_cta"], "defaults": {"question_context": "You asked...", "follow_up": "Hope that helps!", "more_questions_cta": "Got more questions? Ask away!"}}}'::JSONB);


-- 3. Before → After (Renovation/Setup)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-before-after', 'Before and After Transformation', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence showing transformation. No food—focus on space, design, or setup.

FRAME 1 - BEFORE:
Vertical 9:16 frame showing the starting point. Could be:
- Empty space before renovation
- Bare tables before event setup
- Raw materials before arrangement
- Morning prep scene before service

"{{before_label}}"
{{before_context}}

The image should be honest but not unflattering—this is about transformation, not embarrassment. Documentary feel.

"Swipe to see the magic →"

---

FRAME 2 - AFTER:
Same angle, same dimensions—the transformation revealed. Dramatic improvement visible.

"{{after_label}}"
{{after_context}}

The reveal should feel satisfying. Good lighting, styled but authentic. The kind of transformation that makes people say "wow."

Celebration of the work:
"{{celebration_message}}"

Credit if applicable:
"{{credit}}"

This format works for renovations, event setups, seasonal decor changes, or daily transformation from closed to open.
$PROMPT$,
'v1', TRUE,
'{"style": "transformation_documentary", "frame_count": 2, "content_type": "before_after", "input_schema": {"required": ["before_label", "after_label"], "optional": ["before_context", "after_context", "celebration_message", "credit"], "defaults": {"before_label": "BEFORE", "after_label": "AFTER", "celebration_message": "What a difference!", "credit": ""}}}'::JSONB);

-- 4. Problem → Solution
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-problem-solution', 'Problem to Solution', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence addressing a common pain point. No food—relatable problem-solving.

FRAME 1 - THE PROBLEM:
Vertical 9:16 frame with relatable frustration energy. Visual tension—could use red/orange tones, frustrated emoji, or "ugh" typography.

The problem statement:
"{{problem_headline}}"
"{{problem_description}}"

Relatable context:
"{{relatable_moment}}"

The vibe: "We get it. This is annoying." Empathy before solution.

"Sound familiar? →"

---

FRAME 2 - THE SOLUTION:
Same dimensions, energy shifts to relief and helpfulness. Calmer colors, cleaner design.

The solution:
"{{solution_headline}}"
"{{solution_description}}"

How you help:
• {{benefit1}}
• {{benefit2}}
• {{benefit3}}

Call-to-action:
"{{cta}}"

The tone is "we've got you." Not salesy—genuinely helpful. Position your offering as the answer to a real problem.
$PROMPT$,
'v1', TRUE,
'{"style": "empathy_solution", "frame_count": 2, "content_type": "problem_solution", "input_schema": {"required": ["problem_headline", "solution_headline"], "optional": ["problem_description", "relatable_moment", "solution_description", "benefit1", "benefit2", "benefit3", "cta"], "defaults": {"relatable_moment": "We''ve all been there...", "cta": "Let us help"}}}'::JSONB);

-- 5. Monday Mood → Friday Mood
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-mood-contrast', 'Mood Contrast Sequence', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence playing with relatable mood contrast. No food—pure vibe and humor.

FRAME 1 - THE FIRST MOOD:
Vertical 9:16 frame capturing {{mood1_name}} energy. Visual style matches the mood—could be muted colors, slower energy, contemplative.

"{{mood1_label}}"

Visual representation:
- Empty coffee cup
- Quiet restaurant morning
- Hands wrapped around mug
- Contemplative window view

"{{mood1_caption}}"

Relatable, not depressing. The kind of mood everyone recognizes.

---

FRAME 2 - THE SECOND MOOD:
Same dimensions, energy transforms completely. Vibrant, alive, celebratory.

"{{mood2_label}}"

Visual representation:
- Bustling energy
- Lights and atmosphere
- Celebration vibes
- Full house feeling

"{{mood2_caption}}"

The contrast should be satisfying and relatable. This is community bonding through shared experience.

"{{cta}}"

Works for: Monday/Friday, Morning/Night, January/Summer, Before coffee/After coffee
$PROMPT$,
'v1', TRUE,
'{"style": "relatable_contrast", "frame_count": 2, "content_type": "mood_contrast", "input_schema": {"required": ["mood1_label", "mood2_label"], "optional": ["mood1_name", "mood1_caption", "mood2_caption", "cta"], "defaults": {"mood1_name": "Monday", "mood1_label": "MONDAY", "mood2_label": "FRIDAY", "mood1_caption": "Surviving...", "mood2_caption": "THRIVING!", "cta": "Which mood are you today?"}}}'::JSONB);

-- 6. Empty → Full (Restaurant Capacity)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-empty-full', 'Empty to Full Transformation', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence showing the restaurant coming alive. No food—focus on space and energy.

FRAME 1 - EMPTY:
Vertical 9:16 frame of the restaurant space before guests arrive. Beautiful in its emptiness—clean tables, perfect setup, anticipation in the air.

"{{empty_label}}"
{{empty_time}}

The calm before the storm. Everything in place, waiting. There's beauty in the preparation.

"{{empty_caption}}"

Lighting suggests time of day—morning prep light or pre-service golden hour.

---

FRAME 2 - FULL:
Same angle, same space—now alive with energy. Tables occupied (people can be silhouettes or blur), atmosphere transformed.

"{{full_label}}"
{{full_time}}

The energy shift is palpable. Warm lighting, movement, life.

"{{full_caption}}"

Gratitude message:
"{{gratitude}}"

This celebrates both the preparation and the payoff. Shows the work that goes into creating the experience.
$PROMPT$,
'v1', TRUE,
'{"style": "transformation_energy", "frame_count": 2, "content_type": "empty_full", "input_schema": {"required": ["empty_label", "full_label"], "optional": ["empty_time", "full_time", "empty_caption", "full_caption", "gratitude"], "defaults": {"empty_label": "4:00 PM", "full_label": "8:00 PM", "empty_caption": "The calm before...", "full_caption": "This is why we do it", "gratitude": "Thank you for filling our tables 🙏"}}}'::JSONB);

-- 7. Guess → Reveal Game
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-guess-reveal', 'Guess and Reveal Game', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence creating an interactive guessing game. No food—engagement through mystery.

FRAME 1 - THE GUESS:
Vertical 9:16 frame with playful mystery energy. Show something partially hidden, blurred, or from an unusual angle.

"{{guess_prompt}}"

Visual clues without giving it away:
- Extreme close-up of texture or material
- Silhouette or shadow
- Partial view with rest obscured
- Abstract representation

"{{hint}}"

Space for Instagram quiz sticker or poll with options:
A) {{option_a}}
B) {{option_b}}
C) {{option_c}}

"Tap to reveal →"

---

FRAME 2 - THE REVEAL:
Full reveal with celebration energy. The answer is clear and satisfying.

"{{reveal_headline}}"
"{{reveal_answer}}"

Context or fun fact:
"{{fun_fact}}"

Engagement follow-up:
"{{follow_up}}"

The game should be fun, not frustrating. Clues should be fair. Winners feel smart, everyone learns something.
$PROMPT$,
'v1', TRUE,
'{"style": "interactive_playful", "frame_count": 2, "content_type": "guess_game", "input_schema": {"required": ["guess_prompt", "reveal_answer"], "optional": ["hint", "option_a", "option_b", "option_c", "reveal_headline", "fun_fact", "follow_up"], "defaults": {"guess_prompt": "CAN YOU GUESS?", "reveal_headline": "THE ANSWER IS...", "hint": "Here''s a hint...", "follow_up": "Did you get it right?"}}}'::JSONB);

-- 8. Did You Know? → Fact
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-did-you-know', 'Did You Know Fact Reveal', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence sharing interesting information. No food—educational and brand-building.

FRAME 1 - THE HOOK:
Vertical 9:16 frame with curious, intriguing energy. Design suggests "interesting information incoming."

"{{hook_headline}}"

Teaser that creates curiosity:
"{{teaser}}"

Visual could include:
- Question mark motifs
- Lightbulb imagery
- Thinking/curious aesthetic
- Brand-relevant abstract elements

"Bet you didn't know this... →"

---

FRAME 2 - THE FACT:
Same dimensions, energy shifts to "mind blown" or "now you know." Satisfying information delivery.

"{{fact_headline}}"

The interesting fact:
"{{fact_content}}"

Why it matters:
"{{why_it_matters}}"

Share prompt:
"{{share_cta}}"

The fact should be genuinely interesting—not obvious, not obscure. The kind of thing people share because it makes them look smart. Builds brand as knowledgeable and interesting.
$PROMPT$,
'v1', TRUE,
'{"style": "educational_engaging", "frame_count": 2, "content_type": "did_you_know", "input_schema": {"required": ["hook_headline", "fact_content"], "optional": ["teaser", "fact_headline", "why_it_matters", "share_cta"], "defaults": {"hook_headline": "DID YOU KNOW?", "teaser": "This might surprise you...", "fact_headline": "HERE''S THE THING:", "share_cta": "Share this with someone who''d find it interesting!"}}}'::JSONB);

-- 9. Poll Results → Thank You
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-poll-results', 'Poll Results Thank You', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence sharing poll results and gratitude. No food—community engagement celebration.

FRAME 1 - THE RESULTS:
Vertical 9:16 frame with data visualization energy. Clean, clear presentation of results.

"{{results_headline}}"

The poll question reminder:
"{{original_question}}"

Results display:
{{option_a}}: {{percent_a}}%
{{option_b}}: {{percent_b}}%

Visual representation—could be bar chart, pie chart, or creative infographic style.

"{{results_commentary}}"

Total votes celebration:
"{{vote_count}} votes!"

---

FRAME 2 - THE THANK YOU:
Same dimensions, energy shifts to gratitude and next steps.

"{{thank_you_headline}}"

What you're doing with the results:
"{{action_taken}}"

Appreciation message:
"{{appreciation}}"

Next engagement invitation:
"{{next_poll_tease}}"

This closes the loop—people who voted feel heard. Shows you actually use feedback. Builds trust for future engagement.
$PROMPT$,
'v1', TRUE,
'{"style": "data_gratitude", "frame_count": 2, "content_type": "poll_results", "input_schema": {"required": ["original_question", "option_a", "option_b", "percent_a", "percent_b"], "optional": ["results_headline", "results_commentary", "vote_count", "thank_you_headline", "action_taken", "appreciation", "next_poll_tease"], "defaults": {"results_headline": "THE RESULTS ARE IN!", "results_commentary": "And the winner is...", "thank_you_headline": "THANK YOU!", "appreciation": "Your voice matters to us", "next_poll_tease": "Stay tuned for the next poll..."}}}'::JSONB);

-- 10. Old Photo → Now (Throwback)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-2f-throwback', 'Throwback Then and Now', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Two-frame Instagram Story sequence celebrating history and growth. No food—focus on space, team, or milestones.

FRAME 1 - THEN:
Vertical 9:16 frame with nostalgic, vintage energy. Space for real historical photo (not AI-generated).

"{{then_label}}"
{{then_year}}

Frame design suggests old photo—could include:
- Vintage photo border/texture
- Sepia or faded color treatment
- Old-school typography
- Nostalgic design elements

"{{then_caption}}"

Context:
"{{then_context}}"

"Look how far we've come →"

---

FRAME 2 - NOW:
Same subject, present day. Fresh, vibrant, proud.

"{{now_label}}"
{{now_year}}

Modern, clean design treatment. The contrast with Frame 1 should be striking.

"{{now_caption}}"

Reflection:
"{{reflection}}"

Gratitude:
"{{gratitude}}"

This celebrates journey and growth. Authentic, not boastful. The kind of content that makes long-time customers feel like family and new ones want to be part of the story.
$PROMPT$,
'v1', TRUE,
'{"style": "nostalgic_proud", "frame_count": 2, "content_type": "throwback", "input_schema": {"required": ["then_label", "now_label"], "optional": ["then_year", "now_year", "then_caption", "then_context", "now_caption", "reflection", "gratitude"], "defaults": {"then_label": "THEN", "now_label": "NOW", "then_caption": "Where it all began", "now_caption": "Where we are today", "reflection": "So much has changed, so much stays the same", "gratitude": "Thank you for being part of our journey"}}}'::JSONB);


-- ============================================================================
-- THREE-TO-FOUR FRAME SEQUENCE TEMPLATES (10 templates)
-- ============================================================================

-- 1. Staff Spotlight Introduction (3 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-3f-staff-spotlight', 'Staff Spotlight Series', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Three-frame Instagram Story sequence introducing a team member. Human-focused, no food required.

FRAME 1 - INTRODUCTION:
Vertical 9:16 frame with warm, approachable energy. Sets up the series.

Visual options (no AI-generated people):
- Empty restaurant interior with beautiful lighting
- Kitchen equipment/workspace
- Hands holding tools of the trade
- Abstract brand pattern or texture

Typography introduces the series:
"{{series_title}}"
"Meet {{staff_name}}"
"{{staff_role}}"

Warm, inviting colors. The feeling of "let me introduce you to someone special."

---

FRAME 2 - THE PERSON:
Space designed for a real photo of the team member (not AI-generated). Frame includes:

- Photo placeholder area (center or rule-of-thirds placement)
- Name and title overlay
- Design elements that frame the photo beautifully

Fun fact or quote:
"{{fun_fact_label}}"
"{{fun_fact}}"

Or their favorite thing:
"{{favorite_label}}: {{favorite_thing}}"

The design makes a real photo look professional, not like an afterthought.

---

FRAME 3 - CONNECTION:
Final frame that creates engagement and warmth.

"{{closing_message}}"

Engagement options:
- "Say hi next time you're in!"
- Question sticker area: "What should we ask {{staff_name}}?"
- Emoji slider for appreciation

Tenure celebration:
"{{staff_name}} has been with us {{tenure}}"

Small logo. Warm sign-off energy. Makes followers feel like insiders who know the team.
$PROMPT$,
'v1', TRUE,
'{"style": "human_connection", "frame_count": 3, "content_type": "staff_spotlight", "input_schema": {"required": ["series_title", "staff_name", "staff_role"], "optional": ["fun_fact_label", "fun_fact", "favorite_label", "favorite_thing", "closing_message", "tenure"], "defaults": {"series_title": "MEET THE TEAM", "fun_fact_label": "Fun fact", "favorite_label": "Favorite menu item", "closing_message": "We''re lucky to have them!", "tenure": "since the beginning"}}}'::JSONB);

-- 2. Weekly Schedule Breakdown (4 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-4f-week-schedule', 'Weekly Schedule Breakdown', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Four-frame Instagram Story sequence showing the week's schedule/events. Utility content that gets saved.

FRAME 1 - HEADER:
Vertical 9:16 frame establishing the week. Bold, clear typography.

"{{headline}}"
"{{week_label}}"

Visual: Calendar-inspired design, brand colors, clean layout. Could include:
- Week date range
- Seasonal/thematic decoration (subtle)
- Brand pattern or texture background

"Tap through for details →"

---

FRAME 2 - EARLY WEEK:
Monday through Wednesday details.

"{{monday_label}}"
{{monday_info}}

"{{tuesday_label}}"
{{tuesday_info}}

"{{wednesday_label}}"
{{wednesday_info}}

Clean, scannable layout. Icons or simple graphics for each day. High contrast text for quick reading.

---

FRAME 3 - LATE WEEK:
Thursday through Saturday details.

"{{thursday_label}}"
{{thursday_info}}

"{{friday_label}}"
{{friday_info}}

"{{saturday_label}}"
{{saturday_info}}

Same visual language as Frame 2 for consistency. The week builds momentum.

---

FRAME 4 - SUNDAY + CTA:
Final day plus call-to-action.

"{{sunday_label}}"
{{sunday_info}}

"{{closing_message}}"

"{{cta}}"

Save/share prompt: "📌 Save this for later!"

Contact info or reservation link placement area. This is the kind of utility content people actually screenshot.
$PROMPT$,
'v1', TRUE,
'{"style": "utility_schedule", "frame_count": 4, "content_type": "weekly_schedule", "input_schema": {"required": ["headline", "week_label"], "optional": ["monday_label", "monday_info", "tuesday_label", "tuesday_info", "wednesday_label", "wednesday_info", "thursday_label", "thursday_info", "friday_label", "friday_info", "saturday_label", "saturday_info", "sunday_label", "sunday_info", "closing_message", "cta"], "defaults": {"monday_label": "MONDAY", "tuesday_label": "TUESDAY", "wednesday_label": "WEDNESDAY", "thursday_label": "THURSDAY", "friday_label": "FRIDAY", "saturday_label": "SATURDAY", "sunday_label": "SUNDAY", "closing_message": "See you this week!", "cta": "Reserve your spot"}}}'::JSONB);

-- 3. How to Make a Reservation Guide (3 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-3f-reservation-guide', 'Reservation How-To Guide', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Three-frame Instagram Story sequence guiding guests through the reservation process. No food—pure helpful utility.

FRAME 1 - INTRODUCTION:
Vertical 9:16 frame with helpful, welcoming energy.

"{{headline}}"
"{{subheadline}}"

Visual: Clean, instructional design. Could show:
- Phone/device mockup (abstract)
- Calendar icon
- Clock/time elements
- Welcoming restaurant interior (empty)

"Here's how to book your table →"

Sets expectation: this will be easy and quick.

---

FRAME 2 - THE STEPS:
Clear, numbered instructions.

"{{step1_label}}"
{{step1_instruction}}

"{{step2_label}}"
{{step2_instruction}}

"{{step3_label}}"
{{step3_instruction}}

Visual hierarchy makes steps scannable. Numbers or icons for each step. The design should feel like a friendly guide, not a manual.

Pro tip if applicable:
"💡 {{pro_tip}}"

---

FRAME 3 - CONFIRMATION + CTA:
Final frame with clear action and reassurance.

"{{confirmation_message}}"

What to expect:
"{{expectation}}"

Direct link/action:
"{{cta}}"
{{booking_link_note}}

Reassurance:
"{{reassurance}}"

Space for link sticker. The goal: someone can book immediately after watching.
$PROMPT$,
'v1', TRUE,
'{"style": "instructional_friendly", "frame_count": 3, "content_type": "reservation_guide", "input_schema": {"required": ["headline"], "optional": ["subheadline", "step1_label", "step1_instruction", "step2_label", "step2_instruction", "step3_label", "step3_instruction", "pro_tip", "confirmation_message", "expectation", "cta", "booking_link_note", "reassurance"], "defaults": {"headline": "HOW TO BOOK", "subheadline": "It''s easier than you think", "step1_label": "STEP 1", "step1_instruction": "Click the link in our bio", "step2_label": "STEP 2", "step2_instruction": "Choose your date and time", "step3_label": "STEP 3", "step3_instruction": "Confirm your details", "pro_tip": "Book 2-3 days ahead for weekend tables", "confirmation_message": "That''s it!", "cta": "Book now", "reassurance": "Questions? DM us anytime"}}}'::JSONB);

-- 4. Restaurant History Story (4 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-4f-history', 'Restaurant History Story', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Four-frame Instagram Story sequence telling your restaurant's origin story. No food—focus on journey and people.

FRAME 1 - THE BEGINNING:
Vertical 9:16 frame with nostalgic, origin-story energy.

"{{chapter1_title}}"
{{chapter1_year}}

"{{chapter1_story}}"

Visual: Space for historical photo or vintage-styled design. Could show:
- Original location exterior
- Founding team (photo placeholder)
- First logo or signage
- Neighborhood then

The feeling of "where it all started."

---

FRAME 2 - THE JOURNEY:
Growth and challenges chapter.

"{{chapter2_title}}"
{{chapter2_year}}

"{{chapter2_story}}"

Visual: Transition period imagery. Could show:
- Renovation in progress
- Team growth
- Milestone moments
- Community connections

Honest about the journey—not just highlights.

---

FRAME 3 - THE EVOLUTION:
How you became who you are today.

"{{chapter3_title}}"
{{chapter3_year}}

"{{chapter3_story}}"

Visual: More recent history. Could show:
- Current space taking shape
- Team traditions forming
- Community becoming family
- Values in action

---

FRAME 4 - TODAY & TOMORROW:
Present day and future vision.

"{{chapter4_title}}"

"{{chapter4_story}}"

Gratitude:
"{{gratitude_message}}"

Invitation:
"{{invitation}}"

"{{cta}}"

The story should feel authentic, not polished PR. Real journey, real people, real gratitude.
$PROMPT$,
'v1', TRUE,
'{"style": "narrative_authentic", "frame_count": 4, "content_type": "history", "input_schema": {"required": ["chapter1_title", "chapter1_story"], "optional": ["chapter1_year", "chapter2_title", "chapter2_year", "chapter2_story", "chapter3_title", "chapter3_year", "chapter3_story", "chapter4_title", "chapter4_story", "gratitude_message", "invitation", "cta"], "defaults": {"chapter1_title": "THE BEGINNING", "chapter2_title": "THE JOURNEY", "chapter3_title": "THE EVOLUTION", "chapter4_title": "TODAY", "gratitude_message": "Thank you for being part of our story", "invitation": "The next chapter includes you", "cta": "Come be part of it"}}}'::JSONB);

-- 5. Event Countdown Sequence (3 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-3f-event-countdown', 'Event Countdown Sequence', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Three-frame Instagram Story sequence building anticipation for an upcoming event. No food—pure excitement and information.

FRAME 1 - THE ANNOUNCEMENT:
Vertical 9:16 frame with exciting, attention-grabbing energy.

"{{announcement_headline}}"

Event name:
"{{event_name}}"
{{event_tagline}}

Date prominently displayed:
"{{event_date}}"

Visual: Dramatic, event-appropriate design. Could include:
- Event-themed graphics
- Countdown aesthetic
- Venue preview (no food)
- Abstract excitement elements

"Mark your calendars! →"

---

FRAME 2 - THE DETAILS:
What guests need to know.

"{{details_headline}}"

Key information:
📅 {{date_detail}}
⏰ {{time_detail}}
📍 {{location_detail}}
💰 {{price_detail}}

What to expect:
"{{what_to_expect}}"

Special notes:
"{{special_notes}}"

Space for Instagram countdown sticker.

---

FRAME 3 - THE CTA:
Clear action and urgency.

"{{cta_headline}}"

Why act now:
"{{urgency_message}}"

How to book/attend:
"{{booking_instructions}}"

"{{final_cta}}"

Contact for questions:
"{{contact_info}}"

Space for link sticker. The goal: convert interest into action.
$PROMPT$,
'v1', TRUE,
'{"style": "event_excitement", "frame_count": 3, "content_type": "event_countdown", "input_schema": {"required": ["event_name", "event_date"], "optional": ["announcement_headline", "event_tagline", "details_headline", "date_detail", "time_detail", "location_detail", "price_detail", "what_to_expect", "special_notes", "cta_headline", "urgency_message", "booking_instructions", "final_cta", "contact_info"], "defaults": {"announcement_headline": "SAVE THE DATE", "details_headline": "HERE''S WHAT YOU NEED TO KNOW", "cta_headline": "DON''T MISS OUT", "urgency_message": "Limited spots available", "final_cta": "Reserve your spot now", "contact_info": "DM us with questions"}}}'::JSONB);


-- 6. Behind-the-Scenes Tour - Space Only (4 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-4f-bts-tour', 'Behind the Scenes Space Tour', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Four-frame Instagram Story sequence giving a tour of your space. No food—focus on environment, equipment, and atmosphere.

FRAME 1 - WELCOME:
Vertical 9:16 frame with inviting, exclusive-access energy.

"{{welcome_headline}}"
"{{welcome_subtext}}"

Visual: Entrance or exterior shot. The threshold moment—about to go behind the curtain.

"Come on in... →"

The feeling of being let into somewhere special.

---

FRAME 2 - THE HEART:
Kitchen or main workspace tour.

"{{area1_name}}"

"{{area1_description}}"

Visual options (no food):
- Equipment and tools
- Workstations ready for action
- Organization systems
- The space where magic happens

Interesting detail:
"{{area1_detail}}"

---

FRAME 3 - THE SOUL:
Dining room or guest-facing space.

"{{area2_name}}"

"{{area2_description}}"

Visual options:
- Table settings (no food)
- Lighting and ambiance
- Design details
- The view guests experience

Story behind the space:
"{{area2_story}}"

---

FRAME 4 - THE SECRET:
Hidden gem or special detail.

"{{area3_name}}"

"{{area3_description}}"

Visual: Something most guests don't see or notice:
- Storage/cellar
- Special equipment
- Hidden design detail
- Staff favorite spot

"{{closing_message}}"

"{{cta}}"

Makes followers feel like insiders. The kind of content that builds connection and curiosity.
$PROMPT$,
'v1', TRUE,
'{"style": "exclusive_tour", "frame_count": 4, "content_type": "bts_tour", "input_schema": {"required": ["welcome_headline"], "optional": ["welcome_subtext", "area1_name", "area1_description", "area1_detail", "area2_name", "area2_description", "area2_story", "area3_name", "area3_description", "closing_message", "cta"], "defaults": {"welcome_headline": "BEHIND THE SCENES", "welcome_subtext": "A look at what you don''t usually see", "area1_name": "THE KITCHEN", "area1_description": "Where it all comes together", "area2_name": "THE DINING ROOM", "area2_description": "Where memories are made", "area3_name": "THE SECRET SPOT", "area3_description": "Our favorite hidden corner", "closing_message": "Now you know our secrets!", "cta": "Come see it in person"}}}'::JSONB);

-- 7. Customer Testimonial Series - Text Only (3 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-3f-testimonials', 'Customer Testimonial Series', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Three-frame Instagram Story sequence showcasing customer love. No food, no screenshots—elegant text presentation.

FRAME 1 - INTRODUCTION:
Vertical 9:16 frame setting up the social proof.

"{{intro_headline}}"
"{{intro_subtext}}"

Visual: Elegant, testimonial-ready design. Could include:
- Large quotation marks
- Star ratings graphic
- Warm, appreciative colors
- Abstract gratitude elements

"Here's what you're saying... →"

---

FRAME 2 - THE TESTIMONIALS:
Multiple quotes, beautifully presented.

"{{quote1}}"
— {{attribution1}}

"{{quote2}}"
— {{attribution2}}

"{{quote3}}"
— {{attribution3}}

Design treats each quote with respect—proper typography, breathing room, visual hierarchy. Not cramped or rushed.

Source indicators if applicable (Google, Yelp, etc.)

---

FRAME 3 - GRATITUDE + INVITATION:
Thank you and call for more.

"{{gratitude_headline}}"

"{{gratitude_message}}"

Invitation for more reviews:
"{{review_invitation}}"

Where to leave reviews:
"{{review_platforms}}"

"{{closing_cta}}"

The tone is humble gratitude. These words mean everything. Encourages more feedback without being pushy.
$PROMPT$,
'v1', TRUE,
'{"style": "testimonial_series", "frame_count": 3, "content_type": "testimonials", "input_schema": {"required": ["quote1", "attribution1"], "optional": ["intro_headline", "intro_subtext", "quote2", "attribution2", "quote3", "attribution3", "gratitude_headline", "gratitude_message", "review_invitation", "review_platforms", "closing_cta"], "defaults": {"intro_headline": "IN YOUR WORDS", "intro_subtext": "What our guests are saying", "attribution1": "A happy guest", "gratitude_headline": "THANK YOU", "gratitude_message": "These words keep us going", "review_invitation": "Had a great experience? We''d love to hear about it!", "closing_cta": "Share your story with us"}}}'::JSONB);

-- 8. Seasonal Transition Announcement (3 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-3f-seasonal', 'Seasonal Transition Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Three-frame Instagram Story sequence announcing seasonal changes. No food—focus on atmosphere and anticipation.

FRAME 1 - FAREWELL:
Vertical 9:16 frame with bittersweet, transitional energy.

"{{farewell_headline}}"

"{{farewell_message}}"

Visual: Outgoing season aesthetic—could be:
- Seasonal decor being packed away
- Last glimpse of seasonal atmosphere
- Nostalgic seasonal elements
- Time-passing visual metaphor

"{{farewell_note}}"

"But something new is coming... →"

---

FRAME 2 - THE TRANSITION:
The change is happening.

"{{transition_headline}}"

"{{transition_message}}"

Visual: In-between moment—could be:
- Transformation in progress
- Seasonal elements mixing
- Fresh start energy
- Anticipation building

What's changing:
• {{change1}}
• {{change2}}
• {{change3}}

---

FRAME 3 - WELCOME:
New season arrival.

"{{welcome_headline}}"

"{{welcome_message}}"

Visual: New season in full glory—could be:
- Fresh seasonal decor
- New atmosphere preview
- Seasonal color palette
- Excitement and freshness

"{{invitation}}"

"{{cta}}"

The sequence should feel like turning a page—honoring what was while embracing what's coming.
$PROMPT$,
'v1', TRUE,
'{"style": "seasonal_transition", "frame_count": 3, "content_type": "seasonal", "input_schema": {"required": ["farewell_headline", "welcome_headline"], "optional": ["farewell_message", "farewell_note", "transition_headline", "transition_message", "change1", "change2", "change3", "welcome_message", "invitation", "cta"], "defaults": {"farewell_headline": "GOODBYE SUMMER", "farewell_message": "It''s been amazing", "transition_headline": "CHANGE IS IN THE AIR", "transition_message": "We''re getting ready for something special", "welcome_headline": "HELLO FALL", "welcome_message": "A new season of memories awaits", "invitation": "Come experience the new vibe", "cta": "See you soon"}}}'::JSONB);

-- 9. "A Day at [Restaurant]" Timeline (4 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-4f-day-timeline', 'A Day at Restaurant Timeline', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Four-frame Instagram Story sequence showing a typical day. No food—focus on rhythm, energy, and behind-the-scenes.

FRAME 1 - MORNING:
Vertical 9:16 frame with early morning energy. Quiet, preparatory, hopeful.

"{{morning_time}}"
"{{morning_headline}}"

"{{morning_description}}"

Visual options (no food):
- First light through windows
- Coffee being made (for staff)
- Doors being unlocked
- Morning prep rituals

The calm before the day begins.

---

FRAME 2 - MIDDAY:
Energy building, momentum growing.

"{{midday_time}}"
"{{midday_headline}}"

"{{midday_description}}"

Visual options:
- Team in motion (silhouettes/blur)
- Tables being set
- Energy ramping up
- Controlled chaos beauty

The rhythm of service finding its groove.

---

FRAME 3 - EVENING:
Peak energy, full swing.

"{{evening_time}}"
"{{evening_headline}}"

"{{evening_description}}"

Visual options:
- Warm lighting
- Full house atmosphere (no faces needed)
- Candles lit
- The magic hour

When everything comes together.

---

FRAME 4 - NIGHT:
Winding down, reflection.

"{{night_time}}"
"{{night_headline}}"

"{{night_description}}"

Visual options:
- Last guests leaving
- Lights dimming
- Team moment
- Quiet satisfaction

"{{closing_reflection}}"

"{{cta}}"

Shows the full arc of a day—the work, the energy, the reward. Humanizes the operation.
$PROMPT$,
'v1', TRUE,
'{"style": "day_narrative", "frame_count": 4, "content_type": "day_timeline", "input_schema": {"required": ["morning_headline", "evening_headline"], "optional": ["morning_time", "morning_description", "midday_time", "midday_headline", "midday_description", "evening_time", "evening_description", "night_time", "night_headline", "night_description", "closing_reflection", "cta"], "defaults": {"morning_time": "6:00 AM", "morning_headline": "THE QUIET HOURS", "morning_description": "Before the world wakes up", "midday_time": "12:00 PM", "midday_headline": "THE RUSH BEGINS", "midday_description": "Energy building", "evening_time": "7:00 PM", "evening_headline": "THE MAGIC HOUR", "evening_description": "When it all comes together", "night_time": "11:00 PM", "night_headline": "THE WIND DOWN", "night_description": "Another day, another memory", "closing_reflection": "This is what we do. This is why we love it.", "cta": "Come be part of our day"}}}'::JSONB);

-- 10. New Feature/Service Announcement (3 frames)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('story-3f-new-feature', 'New Feature Service Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Three-frame Instagram Story sequence announcing something new. No food—focus on the service/feature itself.

FRAME 1 - THE NEWS:
Vertical 9:16 frame with exciting announcement energy.

"{{announcement_badge}}"

"{{headline}}"
"{{subheadline}}"

Visual: Fresh, new, exciting design. Could include:
- "NEW" badge or ribbon
- Sparkle/shine effects
- Brand colors amplified
- Celebration elements

"Here's what you need to know... →"

---

FRAME 2 - THE DETAILS:
What it is and why it matters.

"{{feature_name}}"

"{{feature_description}}"

Benefits:
✓ {{benefit1}}
✓ {{benefit2}}
✓ {{benefit3}}

How it works:
"{{how_it_works}}"

Visual: Could show the feature in action (if applicable) or abstract representation of the benefit.

---

FRAME 3 - HOW TO ACCESS:
Clear path to trying it.

"{{access_headline}}"

"{{access_instructions}}"

Availability:
"{{availability}}"

Special offer if applicable:
"{{special_offer}}"

"{{cta}}"

Space for link sticker or action button.

The sequence should make the new thing feel valuable and accessible. Not just "we have this now" but "here's why you'll love it."
$PROMPT$,
'v1', TRUE,
'{"style": "announcement_exciting", "frame_count": 3, "content_type": "new_feature", "input_schema": {"required": ["headline", "feature_name"], "optional": ["announcement_badge", "subheadline", "feature_description", "benefit1", "benefit2", "benefit3", "how_it_works", "access_headline", "access_instructions", "availability", "special_offer", "cta"], "defaults": {"announcement_badge": "✨ NEW ✨", "subheadline": "You asked, we listened", "access_headline": "TRY IT NOW", "access_instructions": "Here''s how to get started", "availability": "Available now", "cta": "Learn more"}}}'::JSONB);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
