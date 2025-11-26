-- ============================================================================
-- MIGRATION: Instagram Story Templates - Non-Food Content
-- ============================================================================
-- Description: Story templates that DON'T require AI-generated food images
--              Focus on: Typography, messaging, announcements, engagement
--              Formats: 1-frame, 2-frame sequences, 3-4 frame sequences
-- Author: Creative Director
-- Date: 2025-11-25
-- Philosophy: Real restaurant marketing that doesn't rely on fake food
-- ============================================================================

-- ============================================================================
-- SECTION 1: SINGLE FRAME STORIES (15 templates)
-- Typography-focused, announcement-style, engagement-driven
-- ============================================================================

-- 1. Hours Update
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-hours', 'Hours Update Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story frame with bold, modern typography on a textured background. No food imagery—pure graphic design impact.

Background: {{background_style}} texture—could be concrete, brushed metal, kraft paper, or chalkboard depending on brand vibe. Subtle grain adds authenticity.

Large, attention-grabbing headline in brand font:

"{{headline}}"

Clear, readable hours display:

{{day_range}}
{{hours_line1}}
{{hours_line2}}

"{{additional_note}}"

Small logo or wordmark in corner. The design is clean, scannable in 2 seconds. High contrast for readability. Professional but not corporate.

Think: the kind of story that actually gets screenshotted and saved. Useful information, beautifully presented.$PROMPT$,
'v1', TRUE,
'{"style": "typography_utility", "frame_count": 1, "content_type": "hours_update", "input_schema": {"required": ["headline", "day_range", "hours_line1"], "optional": ["hours_line2", "additional_note", "background_style"], "defaults": {"background_style": "textured concrete", "additional_note": "See you soon!"}}}'::JSONB);

-- 2. We're Hiring
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-hiring', 'Now Hiring Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story with energetic recruitment messaging. Bold typography, no food—this is about people joining the team.

Background: Warm, inviting color gradient or textured surface in brand colors. Could include subtle pattern or geometric shapes.

Dominant headline:

"{{headline}}"

Position details:

"{{position_title}}"
{{position_type}}

Key benefits in quick-scan format:
• {{benefit1}}
• {{benefit2}}
• {{benefit3}}

Clear call-to-action:
"{{cta}}"

The vibe is: we're a great place to work, and we want YOU. Energetic but professional. The kind of place where people actually want to show up.

Design feels modern, approachable—not a boring job posting.$PROMPT$,
'v1', TRUE,
'{"style": "recruitment_energetic", "frame_count": 1, "content_type": "hiring", "input_schema": {"required": ["headline", "position_title"], "optional": ["position_type", "benefit1", "benefit2", "benefit3", "cta"], "defaults": {"position_type": "Full-time & Part-time", "benefit1": "Flexible scheduling", "benefit2": "Free shift meals", "benefit3": "Growth opportunities", "cta": "DM us or apply in person"}}}'::JSONB);


-- 3. Closed for Holiday
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-closed', 'Holiday Closure Notice', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story announcing a closure with warmth, not apology. Elegant typography on a seasonally-appropriate background.

Background: Subtle seasonal texture—could be warm tones for Thanksgiving, festive for holidays, or simply elegant neutral. No cheesy clip art.

Centered, respectful typography:

"{{headline}}"

"We'll be closed {{closure_date}}"
"to {{closure_reason}}"

"Back {{return_info}}"

"{{warm_message}}"

The tone is: we're humans too, and we value time with our people. Grateful, not apologetic. Classy, not corporate.

Small decorative element if appropriate—a simple line, subtle icon, or brand mark. Nothing that screams "template."$PROMPT$,
'v1', TRUE,
'{"style": "elegant_notice", "frame_count": 1, "content_type": "closure", "input_schema": {"required": ["headline", "closure_date", "return_info"], "optional": ["closure_reason", "warm_message"], "defaults": {"closure_reason": "spend time with our team", "warm_message": "Thank you for understanding 🙏"}}}'::JSONB);

-- 4. Weather Alert
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-weather', 'Weather Update Alert', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story for weather-related updates. Clear, urgent but not panicked. Information-first design.

Background: Appropriate weather mood—could be moody grays for storms, bright for snow days, warm amber for heat advisories. Subtle, not literal weather imagery.

Bold, clear headline:

"{{headline}}"

Status update:

"{{status_message}}"

Details:
{{detail_line1}}
{{detail_line2}}

"{{safety_message}}"

Contact info or update source:
"{{update_source}}"

The design prioritizes clarity over aesthetics—but still looks professional. This is the story people check when they're wondering "are they open?"

High contrast, large text, zero ambiguity.$PROMPT$,
'v1', TRUE,
'{"style": "urgent_clear", "frame_count": 1, "content_type": "weather", "input_schema": {"required": ["headline", "status_message"], "optional": ["detail_line1", "detail_line2", "safety_message", "update_source"], "defaults": {"safety_message": "Stay safe out there", "update_source": "Check back for updates"}}}'::JSONB);

-- 5. Thank You / Milestone
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-thankyou', 'Thank You Milestone', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story expressing genuine gratitude. Warm, heartfelt typography—no stock imagery, just authentic appreciation.

Background: Warm, inviting texture or gradient. Could be brand colors softened, or neutral warmth. Feels like a handwritten note, not a corporate memo.

Heartfelt headline:

"{{headline}}"

The milestone or reason:

"{{milestone}}"

Personal message:

"{{message}}"

"{{signature}}"

The vibe is: a real person wrote this, and they mean it. Not performative gratitude—actual appreciation. The kind of story that makes regulars feel seen.

Simple, elegant, sincere. Maybe a subtle heart or hand-drawn element, but nothing cheesy.$PROMPT$,
'v1', TRUE,
'{"style": "heartfelt_gratitude", "frame_count": 1, "content_type": "milestone", "input_schema": {"required": ["headline", "milestone"], "optional": ["message", "signature"], "defaults": {"message": "We couldn''t do this without you", "signature": "— The whole team"}}}'::JSONB);

-- 6. Poll / Question Engagement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-poll', 'Engagement Poll Question', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story designed for engagement—a question that begs to be answered. Bold, playful typography with space for Instagram's native poll sticker.

Background: Fun, energetic color or pattern. Brand-appropriate but with personality. This is meant to be interactive.

Attention-grabbing question:

"{{question}}"

Clear space in the middle third for Instagram poll sticker placement (design accounts for this).

Optional context below:

"{{context}}"

The design is intentionally incomplete—it NEEDS the poll sticker to feel finished. This isn't a poster, it's a conversation starter.

Playful but on-brand. The kind of question people actually want to answer.$PROMPT$,
'v1', TRUE,
'{"style": "interactive_playful", "frame_count": 1, "content_type": "engagement", "input_schema": {"required": ["question"], "optional": ["context"], "defaults": {"context": "Vote now! 👆"}}}'::JSONB);

-- 7. Quote / Inspiration
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-quote', 'Inspirational Quote Card', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story featuring a meaningful quote. Elegant typography, thoughtful design—the kind of story people screenshot.

Background: Sophisticated texture or subtle gradient. Could be marble, linen, concrete, or soft color wash. Timeless, not trendy.

The quote, beautifully typeset:

"{{quote}}"

Attribution:

— {{attribution}}

Optional brand connection:

"{{brand_tie_in}}"

The typography is the star—proper quotation marks, thoughtful line breaks, balanced spacing. This looks like it belongs in a design magazine, not a social media template.

Shareable, saveable, screenshot-worthy.$PROMPT$,
'v1', TRUE,
'{"style": "elegant_typography", "frame_count": 1, "content_type": "quote", "input_schema": {"required": ["quote", "attribution"], "optional": ["brand_tie_in"], "defaults": {}}}'::JSONB);

-- 8. Event Countdown
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES 
('story-1f-countdown', 'Event Countdown Teaser', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story building anticipation for an upcoming event. Dramatic typography with countdown energy—designed for Instagram's countdown sticker.

Background: Dynamic, energetic—could be bold color, geometric pattern, or textured surface with movement implied. Builds excitement.

Teaser headline:

"{{headline}}"

Event name or hint:

"{{event_name}}"

Date prominently displayed:

"{{event_date}}"

Space for countdown sticker (design accounts for this placement).

"{{teaser_text}}"

The design creates FOMO. Something's coming, and you don't want to miss it. Urgent but not desperate.

Works with or without the countdown sticker—but better with it.$PROMPT$,
'v1', TRUE,
'{"style": "anticipation_builder", "frame_count": 1, "content_type": "countdown", "input_schema": {"required": ["headline", "event_name", "event_date"], "optional": ["teaser_text"], "defaults": {"teaser_text": "Mark your calendars 📅"}}}'::JSONB);
