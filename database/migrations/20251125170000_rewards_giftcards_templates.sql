-- Migration: Rewards & Loyalty Program Templates
-- Description: 12 templates for loyalty programs and rewards promotions
-- Note: Gift card templates already exist in 20251125140000_giftcards_weather_templates.sql

-- =====================================================
-- REWARDS PROGRAM TEMPLATES (12 total)
-- =====================================================

-- =====================================================
-- REWARDS - INSTAGRAM SQUARE (5 templates)
-- =====================================================

-- 1. Loyalty Program Launch/Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-sq-program-launch', 'Loyalty Program Launch Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph announcing a new loyalty/rewards program. Clean, modern design that feels premium but accessible.

Scene: A beautifully styled flat lay or tabletop featuring a physical loyalty card (or phone showing app) as the hero. Surrounding elements suggest the rewards: a coffee cup, a dessert, a wrapped gift box—items that represent "free stuff."

The loyalty card/phone is crisp and in focus. Soft, warm lighting. Maybe some confetti or celebratory elements subtly scattered.

Bold, exciting typography:
"{{headline}}"
"{{program_name}}"

HOW IT WORKS:
• {{step1}}
• {{step2}}
• {{step3}}

"{{signup_incentive}}"
"{{cta}}"

The design feels like joining an exclusive club, not signing up for spam. Premium paper textures, gold or brand-color accents, clean lines.

The vibe: You'd be crazy not to join. Free stuff awaits.$PROMPT$,
'v1', TRUE,
'{"style": "premium_launch", "category": "rewards", "input_schema": {"required": ["headline", "program_name"], "optional": ["step1", "step2", "step3", "signup_incentive", "cta"], "defaults": {"step1": "Sign up free", "step2": "Earn points every visit", "step3": "Redeem for rewards", "signup_incentive": "Get 100 bonus points when you join!", "cta": "Link in bio to sign up"}}, "variation_rules": {"style_adjectives": ["premium exclusive", "clean modern", "celebratory launch", "club membership vibe"], "reward_visuals": ["coffee cup", "dessert plate", "gift box", "loyalty card"], "camera_styles": ["flat lay overhead", "card hero angled", "phone app display"]}}'::JSONB);

-- 2. Punch Card Promotion (Buy X Get 1 Free)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-sq-punch-card', 'Punch Card Promotion', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph featuring a classic punch card loyalty system. Nostalgic but fresh—the timeless appeal of "buy X, get one free."

Hero: A physical punch card with several punches already filled in (showing progress toward the reward). The card sits on a wooden counter or table, maybe with a stamp or hole punch nearby. A cup of coffee, sandwich, or the "free item" is partially visible, representing the goal.

The punch card design is clean and on-brand—not cheap-looking. Quality cardstock feel.

Clear, compelling typography:
"{{headline}}"
"{{punch_count}} {{item_name}}s = 1 FREE"
"{{current_status}}"
"{{urgency_message}}"
"{{how_to_get}}"

The lighting is warm and inviting. The scene feels achievable—you're already partway there. The free item looks delicious and worth the effort.

The vibe: Simple, satisfying, almost there. Keep coming back.$PROMPT$,
'v1', TRUE,
'{"style": "nostalgic_simple", "category": "rewards", "input_schema": {"required": ["headline", "punch_count", "item_name"], "optional": ["current_status", "urgency_message", "how_to_get"], "defaults": {"current_status": "You might be closer than you think!", "urgency_message": "Cards expire end of month", "how_to_get": "Ask for your card at checkout"}}, "variation_rules": {"style_adjectives": ["nostalgic charm", "simple satisfying", "progress visible", "achievable goal"], "item_types": ["coffee", "sandwich", "smoothie", "pizza slice", "taco"], "camera_styles": ["punch card hero", "progress close-up", "reward item tease"]}}'::JSONB);

-- 3. Double Points Day/Event
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-sq-double-points', 'Double Points Day Event', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph promoting a double points day or bonus points event. High energy, urgency, celebration.

Scene: Dynamic composition featuring the "2X" or "DOUBLE" concept visually. Could be: two identical dishes side by side, a loyalty card with "x2" graphic overlay, or a split-screen effect showing points multiplying.

Bold graphic elements: large "2X" typography, arrows pointing up, multiplication symbols, or stacked coins/points icons. The restaurant's signature dish or drink is prominently featured.

Energetic typography:
"{{headline}}"
"{{event_name}}"
"{{date_time}}"

EARN 2X POINTS ON:
{{qualifying_items}}

"{{bonus_details}}"
"{{cta}}"

The design pops with energy—bold colors, dynamic angles. Creates urgency without feeling desperate.

The vibe: Today's the day. Don't miss out. Your points are about to skyrocket.$PROMPT$,
'v1', TRUE,
'{"style": "high_energy_promo", "category": "rewards", "input_schema": {"required": ["headline", "event_name", "date_time"], "optional": ["qualifying_items", "bonus_details", "cta"], "defaults": {"qualifying_items": "All menu items", "bonus_details": "Members only • No minimum purchase", "cta": "Show your app to earn"}}, "variation_rules": {"style_adjectives": ["high energy", "urgency driven", "celebration mode", "points explosion"], "visual_elements": ["2X graphics", "multiplication symbols", "stacked points", "dual dishes"], "camera_styles": ["dynamic angle", "split screen effect", "bold graphic overlay"]}}'::JSONB);

-- 4. Referral Program ("Bring a Friend")
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-sq-referral', 'Referral Program - Bring a Friend', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph promoting a referral/bring-a-friend rewards program. Social, shareable, win-win energy.

Scene: Two people (friends) enjoying a meal together—could show just their hands clinking glasses, sharing a dish, or a cozy table for two. The scene emphasizes connection and sharing. Alternatively: two loyalty cards side by side, or a "share" icon concept.

The mood is warm, social, celebratory. Natural lighting, genuine moment feel.

Friendly, inviting typography:
"{{headline}}"
"{{referral_tagline}}"

HOW IT WORKS:
"{{step1}}"
"{{step2}}"
"{{step3}}"

YOU GET: {{referrer_reward}}
THEY GET: {{referee_reward}}

"{{cta}}"

The design emphasizes mutual benefit—both parties win. Not pushy or MLM-feeling, just genuine sharing.

The vibe: Good food is better shared. Bring your people, everyone wins.$PROMPT$,
'v1', TRUE,
'{"style": "social_sharing", "category": "rewards", "input_schema": {"required": ["headline", "referrer_reward", "referee_reward"], "optional": ["referral_tagline", "step1", "step2", "step3", "cta"], "defaults": {"referral_tagline": "Share the love, earn the rewards", "step1": "Share your unique code", "step2": "Friend signs up & orders", "step3": "You both get rewarded", "cta": "Find your code in the app"}}, "variation_rules": {"style_adjectives": ["social warmth", "win-win energy", "friendship focused", "shareable moment"], "social_scenes": ["friends toasting", "sharing dish", "two cards together", "table for two"], "camera_styles": ["hands detail", "cozy table scene", "dual card layout"]}}'::JSONB);

-- 5. Tier/Status Level Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-sq-tier-status', 'Tier Status Level Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$Square 1:1 photograph announcing loyalty tier levels or status achievements. Premium, aspirational, exclusive.

Scene: Elegant presentation of tier levels—could be three cards in bronze/silver/gold arrangement, a podium-style display, or a single premium "VIP" or "Gold" card as hero. Luxurious textures: velvet, marble, metallic accents.

The highest tier should look genuinely desirable. Premium materials, sophisticated lighting.

Aspirational typography:
"{{headline}}"
"{{program_name}} TIERS"

{{tier1_name}}: {{tier1_benefits}}
{{tier2_name}}: {{tier2_benefits}}
{{tier3_name}}: {{tier3_benefits}}

"{{current_tier_message}}"
"{{upgrade_cta}}"

The design creates aspiration without alienation. Every tier has value, but higher tiers are clearly more desirable.

The vibe: You're on your way up. VIP status awaits. Worth the journey.$PROMPT$,
'v1', TRUE,
'{"style": "premium_aspirational", "category": "rewards", "input_schema": {"required": ["headline", "program_name"], "optional": ["tier1_name", "tier1_benefits", "tier2_name", "tier2_benefits", "tier3_name", "tier3_benefits", "current_tier_message", "upgrade_cta"], "defaults": {"tier1_name": "BRONZE", "tier1_benefits": "Earn 1 pt per $1", "tier2_name": "SILVER", "tier2_benefits": "1.5x points + birthday reward", "tier3_name": "GOLD", "tier3_benefits": "2x points + exclusive offers", "current_tier_message": "Check your status in the app", "upgrade_cta": "Keep earning to level up"}}, "variation_rules": {"style_adjectives": ["premium luxury", "aspirational tiers", "VIP exclusive", "status symbol"], "tier_visuals": ["bronze silver gold cards", "podium display", "metallic textures", "velvet backdrop"], "camera_styles": ["tiered arrangement", "single VIP hero", "luxury flat lay"]}}'::JSONB);


-- =====================================================
-- REWARDS - INSTAGRAM STORIES (5 templates)
-- =====================================================

-- 6. Member Exclusive Offer (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-story-member-exclusive', 'Member Exclusive Offer', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story for a members-only exclusive offer. Creates FOMO for non-members while rewarding loyalty.

Background: Elegant, slightly mysterious—could be a dark gradient with gold accents, velvet texture, or "VIP" aesthetic. The feeling of being behind the velvet rope.

Bold, exclusive typography:
"{{headline}}"
"MEMBERS ONLY"
"{{offer_description}}"
"{{offer_details}}"

Valid: {{valid_dates}}

"{{non_member_cta}}"

Design elements: Could include a subtle lock icon, "exclusive" badge, member card graphic, or VIP stamp. The offer itself should feel genuinely special—not just 10% off.

Space for swipe-up or link sticker.

The vibe: This is why you joined. Non-members are missing out. Exclusivity that feels earned, not elitist.$PROMPT$,
'v1', TRUE,
'{"style": "vip_exclusive", "category": "rewards", "frame_count": 1, "input_schema": {"required": ["headline", "offer_description"], "optional": ["offer_details", "valid_dates", "non_member_cta"], "defaults": {"valid_dates": "This week only", "non_member_cta": "Not a member? Join free →"}}, "variation_rules": {"style_adjectives": ["VIP exclusive", "velvet rope energy", "earned privilege", "FOMO-inducing"], "exclusive_elements": ["gold accents", "lock icon", "member badge", "VIP stamp"], "camera_styles": ["dark elegant gradient", "textured luxury", "membership card feature"]}}'::JSONB);

-- 7. Points Balance Reminder (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-story-points-reminder', 'Points Balance Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story reminding members to check/use their points. Engagement-focused, drives app opens or visits.

Background: Clean, branded design with subtle celebration elements—confetti, sparkles, or reward imagery. Not cluttered, but energetic.

Attention-grabbing typography:
"{{headline}}"
"Have you checked your points lately?"
"{{points_example}}"
"{{reward_tease}}"
"{{expiration_warning}}"
"{{cta}}"

Design includes space for interactive elements—could prompt users to screenshot and share their balance, or include a "check now" button graphic.

The vibe: You might have free stuff waiting. Don't let points expire. Quick dopamine hit of checking your balance.$PROMPT$,
'v1', TRUE,
'{"style": "engagement_reminder", "category": "rewards", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["points_example", "reward_tease", "expiration_warning", "cta"], "defaults": {"points_example": "500 points = FREE entrée", "reward_tease": "You might be closer than you think!", "expiration_warning": "Points expire Dec 31", "cta": "Check your balance →"}}, "variation_rules": {"style_adjectives": ["engagement focused", "celebration energy", "urgency subtle", "dopamine trigger"], "reminder_elements": ["confetti", "sparkles", "reward preview", "points counter"], "camera_styles": ["clean branded", "app screenshot style", "reward tease"]}}'::JSONB);

-- 8. "Almost There" Progress Nudge (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-story-almost-there', 'Almost There Progress Nudge', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story nudging members who are close to earning a reward. Progress-focused, motivating.

Background: Clean design with a prominent progress bar or visual showing "almost complete" status. Could be a circular progress indicator, horizontal bar at 80-90%, or punch card with one spot left.

The reward they're about to earn should be visible and appetizing—a photo of the free item, gift card, or exclusive perk.

Motivating typography:
"{{headline}}"
"{{progress_message}}"

[PROGRESS VISUAL: {{progress_percent}}% complete]

"{{points_needed}} more {{points_unit}} to go!"
"{{reward_preview}}"
"{{urgency_message}}"
"{{cta}}"

The design creates a "so close!" feeling. The finish line is visible. One more visit seals the deal.

The vibe: You're THIS close. Don't stop now. The reward is right there.$PROMPT$,
'v1', TRUE,
'{"style": "progress_motivation", "category": "rewards", "frame_count": 1, "input_schema": {"required": ["headline", "progress_message"], "optional": ["progress_percent", "points_needed", "points_unit", "reward_preview", "urgency_message", "cta"], "defaults": {"progress_percent": "85", "points_needed": "50", "points_unit": "points", "reward_preview": "FREE entrée waiting for you", "urgency_message": "One more visit!", "cta": "Come finish what you started →"}}, "variation_rules": {"style_adjectives": ["progress focused", "finish line visible", "motivating nudge", "so close energy"], "progress_visuals": ["circular indicator", "horizontal bar", "punch card almost full", "steps remaining"], "camera_styles": ["progress bar hero", "reward preview tease", "clean motivational"]}}'::JSONB);

-- 9. Birthday Reward Reminder (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-story-birthday-reward', 'Birthday Reward Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story reminding members about birthday rewards. Celebratory, personal, warm.

Background: Festive birthday elements—balloons, confetti, candles, cake imagery, or party decorations. Warm, celebratory colors. Not childish, but genuinely festive.

The birthday reward should be prominently featured—whether it's a free dessert, discount, or special treat.

Celebratory typography:
"{{headline}}"
"{{birthday_message}}"

🎂 YOUR BIRTHDAY REWARD:
"{{reward_description}}"

"{{redemption_details}}"
"{{validity_period}}"
"{{cta}}"

Design feels like a genuine birthday card, not a marketing email. Personal touch matters.

The vibe: We remembered! Come celebrate with us. Your special treat awaits.$PROMPT$,
'v1', TRUE,
'{"style": "birthday_celebration", "category": "rewards", "frame_count": 1, "input_schema": {"required": ["headline", "reward_description"], "optional": ["birthday_message", "redemption_details", "validity_period", "cta"], "defaults": {"birthday_message": "It''s your month to celebrate!", "redemption_details": "Show your app to redeem", "validity_period": "Valid during your birthday month", "cta": "Claim your birthday treat →"}}, "variation_rules": {"style_adjectives": ["birthday festive", "personal celebration", "warm genuine", "party energy"], "birthday_elements": ["balloons", "confetti", "candles", "cake", "party decorations"], "camera_styles": ["festive background", "reward hero", "birthday card style"]}}'::JSONB);

-- 10. New Reward Available Alert (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-story-new-reward', 'New Reward Available Alert', 'all_verticals', 'instagram_story', 'base',
$PROMPT$Vertical 9:16 Instagram Story announcing a new reward option in the program. Exciting, fresh, discovery-focused.

Background: "New" or "Just Added" energy—could feature a spotlight effect, "NEW" badge, unwrapping/reveal aesthetic, or fresh product photography of the new reward.

The new reward should be the hero—beautifully photographed, desirable, clearly worth earning.

Exciting typography:
"{{headline}}"
"{{new_badge}}"

"{{reward_name}}"
{{points_required}} points

"{{reward_description}}"
"{{limited_message}}"
"{{cta}}"

Design creates discovery excitement—like finding a new item on a menu you love.

The vibe: Something new to earn! Fresh reason to keep collecting. The program keeps getting better.$PROMPT$,
'v1', TRUE,
'{"style": "new_discovery", "category": "rewards", "frame_count": 1, "input_schema": {"required": ["headline", "reward_name", "points_required"], "optional": ["new_badge", "reward_description", "limited_message", "cta"], "defaults": {"new_badge": "✨ JUST ADDED", "reward_description": "Our newest reward option", "limited_message": "Available while supplies last", "cta": "Start earning →"}}, "variation_rules": {"style_adjectives": ["new discovery", "fresh addition", "reveal excitement", "program evolution"], "new_elements": ["NEW badge", "spotlight effect", "unwrapping visual", "fresh photography"], "camera_styles": ["reward hero spotlight", "reveal moment", "new item showcase"]}}'::JSONB);

-- =====================================================
-- REWARDS - FACEBOOK/MULTI-FORMAT (2 templates)
-- =====================================================

-- 11. Program Benefits Explainer
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-fb-benefits-explainer', 'Rewards Program Benefits Explainer', 'all_verticals', 'facebook', 'base',
$PROMPT$Facebook feed image (1200x630 or square) explaining the full benefits of a loyalty/rewards program. Educational, comprehensive, compelling.

Scene: Clean, infographic-style layout that clearly communicates program value. Could feature: the loyalty card/app as hero with benefit callouts, a visual "journey" from signup to rewards, or a benefits grid layout.

The design should answer "Why should I join?" at a glance. Real food photography integrated with clean graphics.

Clear, benefit-focused typography:
"{{headline}}"
"{{program_name}}"

WHY JOIN?
✓ {{benefit1}}
✓ {{benefit2}}
✓ {{benefit3}}
✓ {{benefit4}}

"{{signup_incentive}}"
"{{social_proof}}"
"{{cta}}"

The layout is scannable—someone scrolling should understand the value in 2 seconds. Not cluttered, but comprehensive.

The vibe: Here's everything you get. It's a no-brainer. Join the thousands who already have.$PROMPT$,
'v1', TRUE,
'{"style": "educational_comprehensive", "category": "rewards", "input_schema": {"required": ["headline", "program_name"], "optional": ["benefit1", "benefit2", "benefit3", "benefit4", "signup_incentive", "social_proof", "cta"], "defaults": {"benefit1": "Earn points on every purchase", "benefit2": "Exclusive member-only offers", "benefit3": "Free birthday reward", "benefit4": "Early access to new items", "signup_incentive": "Get 100 bonus points when you join!", "social_proof": "Join 10,000+ members", "cta": "Sign up free today"}}, "variation_rules": {"style_adjectives": ["educational clear", "benefit focused", "comprehensive value", "scannable layout"], "layout_styles": ["benefits grid", "journey visual", "card with callouts", "infographic style"], "camera_styles": ["clean infographic", "card hero with benefits", "journey progression"]}}'::JSONB);

-- 12. Member Appreciation/Thank You
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('rewards-fb-member-appreciation', 'Member Appreciation Thank You', 'all_verticals', 'facebook', 'base',
$PROMPT$Facebook feed image (1200x630 or square) thanking loyal members. Warm, genuine, community-focused.

Scene: Heartfelt, community-oriented imagery. Could feature: a collage of happy customers (with permission), the team holding a "Thank You" sign, a beautifully set table "reserved for members," or a warm restaurant interior shot.

The feeling is genuine gratitude, not corporate obligation. Real warmth.

Heartfelt typography:
"{{headline}}"
"{{thank_you_message}}"

"{{milestone_celebration}}"
"{{member_stats}}"

"{{appreciation_offer}}"
"{{cta}}"

Design elements could include: heart icons, community imagery, milestone numbers, or member testimonial quotes.

The vibe: We genuinely appreciate you. You're not just a number. This community matters to us.$PROMPT$,
'v1', TRUE,
'{"style": "genuine_gratitude", "category": "rewards", "input_schema": {"required": ["headline", "thank_you_message"], "optional": ["milestone_celebration", "member_stats", "appreciation_offer", "cta"], "defaults": {"milestone_celebration": "Celebrating 1 year of our rewards family!", "member_stats": "10,000+ members strong", "appreciation_offer": "Enjoy double points this week as our thank you", "cta": "Thank you for being part of our family"}}, "variation_rules": {"style_adjectives": ["genuine warmth", "community focused", "heartfelt gratitude", "real appreciation"], "appreciation_visuals": ["team thank you", "customer collage", "reserved table", "warm interior"], "camera_styles": ["community warmth", "team genuine", "member celebration"]}}'::JSONB);

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Templates: 12 (Rewards only)
-- 
-- Note: Gift card templates (12) already exist in:
-- database/migrations/20251125140000_giftcards_weather_templates.sql
--
-- REWARDS (12):
--   Instagram Square (5):
--     1. rewards-sq-program-launch - Loyalty Program Launch
--     2. rewards-sq-punch-card - Punch Card Promotion
--     3. rewards-sq-double-points - Double Points Day
--     4. rewards-sq-referral - Referral Program
--     5. rewards-sq-tier-status - Tier Status Levels
--   Instagram Stories (5):
--     6. rewards-story-member-exclusive - Member Exclusive Offer
--     7. rewards-story-points-reminder - Points Balance Reminder
--     8. rewards-story-almost-there - Almost There Progress Nudge
--     9. rewards-story-birthday-reward - Birthday Reward Reminder
--     10. rewards-story-new-reward - New Reward Alert
--   Facebook (2):
--     11. rewards-fb-benefits-explainer - Program Benefits Explainer
--     12. rewards-fb-member-appreciation - Member Appreciation
