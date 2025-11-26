-- Migration: Gift Cards & Weather-Triggered Content Templates
-- Description: Adds 26 new creative prompt templates for gift card promotions and weather-triggered content
-- Date: 2025-11-25

-- ============================================================================
-- GIFT CARD TEMPLATES (12 total)
-- ============================================================================

-- ============================================================================
-- GIFT CARD - INSTAGRAM SQUARE (6 templates)
-- ============================================================================

-- 1. Holiday Gift Card (winter holidays)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-sq-holiday', 'Holiday Gift Card Promotion', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting gift cards as the perfect holiday gift. Warm, festive, gift-giving energy.

Scene: A beautifully wrapped gift card presentation—the card in an elegant envelope or gift box, surrounded by holiday elements. Could include: wrapped presents, ribbon, evergreen sprigs, ornaments, warm string lights bokeh, or seasonal flowers.

The gift card itself is the hero—visible, attractive, clearly a restaurant gift card but styled like a luxury item.

Warm, inviting typography:
"{{headline}}"
"{{subheadline}}"

GIFT CARDS AVAILABLE
• {{option1}}
• {{option2}}
• {{option3}}

"{{bonus_offer}}"
"{{purchase_cta}}"

The lighting is warm and cozy—holiday warmth without being cheesy. The scene suggests thoughtful gifting, not last-minute desperation.

The vibe: The gift they actually want. Thoughtful, delicious, easy.
$PROMPT$,
'v1', TRUE,
'{"style": "holiday_warmth", "category": "gift_cards", "season": "holiday", "input_schema": {"required": ["headline"], "optional": ["subheadline", "option1", "option2", "option3", "bonus_offer", "purchase_cta"], "defaults": {"subheadline": "Give the gift of great food", "option1": "$25", "option2": "$50", "option3": "$100", "bonus_offer": "Buy $50, get $10 bonus card FREE", "purchase_cta": "Available in-store & online"}}, "variation_rules": {"style_adjectives": ["holiday warmth", "thoughtful gifting", "cozy festive", "luxury presentation"], "holiday_elements": ["wrapped presents", "evergreen sprigs", "string lights", "ribbon"], "camera_styles": ["gift presentation hero", "flat lay festive", "card in envelope"]}}'::JSONB);

-- 2. Corporate/Bulk Gift Card Program
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-sq-corporate', 'Corporate Gift Card Program', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph targeting businesses for bulk gift card orders. Professional, polished, B2B energy while still feeling warm.

Scene: A stack or spread of gift cards arranged professionally—like a corporate gift presentation. Could include: branded packaging, multiple cards fanned out, a gift box with company logo placeholder, or cards with a "Thank You" sleeve.

The setting suggests business gifting: clean desk surface, professional but warm lighting, maybe a subtle office plant or quality pen nearby.

Professional typography:
"{{headline}}"
"{{subheadline}}"

PERFECT FOR:
• {{use_case1}}
• {{use_case2}}
• {{use_case3}}

"{{bulk_incentive}}"
"{{contact_cta}}"

The design bridges corporate and hospitality—professional enough for a business decision-maker, warm enough to represent your restaurant.

The vibe: Impress your team/clients. Easy, appreciated, memorable.
$PROMPT$,
'v1', TRUE,
'{"style": "professional_warm", "category": "gift_cards", "audience": "b2b", "input_schema": {"required": ["headline"], "optional": ["subheadline", "use_case1", "use_case2", "use_case3", "bulk_incentive", "contact_cta"], "defaults": {"subheadline": "The gift your team will love", "use_case1": "Employee appreciation", "use_case2": "Client thank-yous", "use_case3": "Holiday bonuses", "bulk_incentive": "10% off orders of 20+ cards", "contact_cta": "Email us for corporate orders"}}, "variation_rules": {"style_adjectives": ["professional polished", "B2B appropriate", "corporate gifting", "bulk presentation"], "corporate_elements": ["stacked cards", "branded packaging", "thank you sleeves"], "camera_styles": ["professional spread", "bulk stack hero", "corporate gift box"]}}'::JSONB);

-- 3. "Give the Gift of..." (year-round generic)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-sq-give-gift', 'Give the Gift Of...', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph with the classic "give the gift of great food" messaging. Versatile, works year-round, emotionally resonant.

Scene: A gift card being handed from one person to another—just the hands visible, creating a human connection moment. Or: a gift card tucked into a greeting card, birthday present, or "just because" gift setting.

The gift card is clearly visible and attractive. The scene suggests the joy of giving (and receiving).

Warm, emotional typography:
"{{headline}}"
"Give the Gift of {{gift_description}}"
"{{emotional_hook}}"

GIFT CARDS FROM ${{min_amount}}

"{{occasion_suggestions}}"
"{{purchase_cta}}"

The lighting is warm and personal. The scene feels like a genuine moment of generosity, not a transaction.

The vibe: More personal than cash, more flexible than a thing. The gift that says "I know you."
$PROMPT$,
'v1', TRUE,
'{"style": "emotional_giving", "category": "gift_cards", "season": "year_round", "input_schema": {"required": ["headline", "gift_description"], "optional": ["emotional_hook", "min_amount", "occasion_suggestions", "purchase_cta"], "defaults": {"emotional_hook": "Because they deserve something delicious", "min_amount": "25", "occasion_suggestions": "Birthdays · Thank Yous · Just Because", "purchase_cta": "Available in-store & online"}}, "variation_rules": {"style_adjectives": ["emotional connection", "giving moment", "personal thoughtful", "year-round versatile"], "giving_scenes": ["hands exchanging", "card in greeting card", "gift wrap moment"], "camera_styles": ["hands exchange close-up", "gift presentation", "card reveal moment"]}}'::JSONB);


-- 4. Mother's Day Gift Card
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-sq-mothers-day', 'Mother''s Day Gift Card', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting gift cards as the perfect Mother's Day gift. Elegant, appreciative, celebratory of moms.

Scene: A gift card presentation with feminine, spring-inspired styling. Could include: fresh flowers (peonies, roses, tulips), a beautiful brunch setting, elegant tea service, or a wrapped gift with soft ribbon. The gift card is prominently displayed, perhaps tucked into a card that says "Mom" or alongside a small bouquet.

The setting feels like a special occasion—Mother's Day brunch vibes, soft morning light, elegant but not stuffy.

Appreciative typography:
"{{headline}}"
"{{subheadline}}"

TREAT MOM TO:
• {{experience1}}
• {{experience2}}
• {{experience3}}

"{{gift_message}}"
"{{purchase_cta}}"

The lighting is soft and flattering—the golden glow of a special morning. Colors lean toward soft pinks, creams, and spring greens.

The vibe: She deserves a break. Give her a meal she doesn't have to cook (or clean up after).
$PROMPT$,
'v1', TRUE,
'{"style": "elegant_appreciation", "category": "gift_cards", "season": "mothers_day", "input_schema": {"required": ["headline"], "optional": ["subheadline", "experience1", "experience2", "experience3", "gift_message", "purchase_cta"], "defaults": {"subheadline": "She deserves something special", "experience1": "Brunch with the family", "experience2": "A night off from cooking", "experience3": "Her favorite meal, on you", "gift_message": "The gift she actually wants", "purchase_cta": "Order by May 10th for Mother''s Day"}}, "variation_rules": {"style_adjectives": ["elegant feminine", "spring celebration", "appreciative warm", "brunch vibes"], "mothers_day_elements": ["fresh flowers", "brunch setting", "soft ribbon", "Mom card"], "camera_styles": ["gift with flowers", "brunch table setting", "elegant presentation"]}}'::JSONB);

-- 5. Father's Day / Graduation Gift Card
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-sq-fathers-day-grad', 'Father''s Day & Graduation Gift Card', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting gift cards for Father's Day or graduation celebrations. Celebratory, proud, achievement-focused.

Scene: A gift card presentation with masculine or celebratory styling. Could include: a gift card with a "Congrats Grad" or "Dad" card, graduation cap and tassel nearby, a nice watch or tie as props, or a celebratory dinner setting. The gift card is the hero, styled as a premium gift.

The setting suggests celebration and achievement—could work for either Dad or a graduate. Clean, sophisticated, proud.

Celebratory typography:
"{{headline}}"
"{{subheadline}}"

CELEBRATE WITH:
• {{celebration1}}
• {{celebration2}}
• {{celebration3}}

"{{gift_message}}"
"{{purchase_cta}}"

The lighting is warm but not overly soft—confident, celebratory. Colors can be classic (navy, burgundy, gold) or school colors for graduation.

The vibe: They worked hard. They deserve a great meal. Celebrate their wins.
$PROMPT$,
'v1', TRUE,
'{"style": "celebratory_proud", "category": "gift_cards", "season": "fathers_day_graduation", "input_schema": {"required": ["headline"], "optional": ["subheadline", "celebration1", "celebration2", "celebration3", "gift_message", "purchase_cta"], "defaults": {"subheadline": "Celebrate their achievement", "celebration1": "A celebratory dinner", "celebration2": "Their favorite restaurant", "celebration3": "A night they''ll remember", "gift_message": "For the grad or dad who has everything", "purchase_cta": "Gift cards available now"}}, "variation_rules": {"style_adjectives": ["celebratory proud", "achievement focused", "sophisticated classic", "milestone moment"], "celebration_elements": ["graduation cap", "congrats card", "celebratory setting", "premium styling"], "camera_styles": ["gift card hero", "celebration props", "achievement moment"]}}'::JSONB);

-- 6. Valentine's Day / Date Night Gift Card
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-sq-valentines', 'Valentine''s Day Date Night Gift Card', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting gift cards as the perfect Valentine's Day or date night gift. Romantic, intimate, couple-focused.

Scene: A gift card presentation with romantic styling. Could include: the gift card in a red envelope, roses or romantic flowers nearby, candlelight ambiance, two wine glasses, or a beautifully set table for two. The gift card suggests a romantic experience to come.

The setting is intimate and romantic—date night energy, soft candlelight, the promise of a special evening together.

Romantic typography:
"{{headline}}"
"{{subheadline}}"

GIVE THE GIFT OF:
• {{experience1}}
• {{experience2}}
• {{experience3}}

"{{romantic_message}}"
"{{purchase_cta}}"

The lighting is warm and intimate—candlelight glow, soft focus on background elements. Colors are romantic: deep reds, soft pinks, warm golds.

The vibe: Skip the teddy bear. Give them an experience. A date night they'll actually remember.
$PROMPT$,
'v1', TRUE,
'{"style": "romantic_intimate", "category": "gift_cards", "season": "valentines", "input_schema": {"required": ["headline"], "optional": ["subheadline", "experience1", "experience2", "experience3", "romantic_message", "purchase_cta"], "defaults": {"subheadline": "The perfect date night awaits", "experience1": "A romantic dinner for two", "experience2": "An unforgettable evening", "experience3": "Quality time together", "romantic_message": "Better than flowers, lasts longer than chocolate", "purchase_cta": "Order by Feb 12th for Valentine''s Day"}}, "variation_rules": {"style_adjectives": ["romantic intimate", "date night", "candlelit warm", "couple focused"], "valentines_elements": ["red envelope", "roses", "candlelight", "wine glasses", "table for two"], "camera_styles": ["romantic setting", "gift with roses", "intimate ambiance"]}}'::JSONB);


-- ============================================================================
-- GIFT CARD - INSTAGRAM STORIES (4 templates)
-- ============================================================================

-- 7. Last Minute E-Gift Card (urgent)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-story-egift-urgent', 'Last Minute E-Gift Card', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for last-minute gift card purchases. Urgent, helpful, saves-the-day energy.

Background: Dynamic, urgent design—could use bold colors, "LAST MINUTE" graphics, or clock/countdown imagery. But still on-brand and not panicked.

Urgent but helpful typography:
"{{headline}}"
"{{urgency_message}}"

E-GIFT CARDS
✓ Instant delivery
✓ Sent via email or text
✓ No shipping needed

"{{amount_options}}"
"{{cta}}"

The design acknowledges the panic of last-minute gifting while positioning your e-gift card as the hero solution. Helpful, not judgmental.

Space for swipe-up link.

The vibe: We've got you. Crisis averted. They'll never know you forgot.
$PROMPT$,
'v1', TRUE,
'{"style": "urgent_helpful", "category": "gift_cards", "frame_count": 1, "input_schema": {"required": ["headline", "urgency_message"], "optional": ["amount_options", "cta"], "defaults": {"amount_options": "$25 · $50 · $75 · $100 · Custom", "cta": "Send now →"}}, "variation_rules": {"style_adjectives": ["urgent helpful", "last minute save", "instant solution", "crisis averted"], "urgency_elements": ["clock graphic", "LAST MINUTE badge", "instant delivery icons"], "camera_styles": ["bold urgent design", "phone sending graphic", "instant delivery visual"]}}'::JSONB);

-- 8. Gift Card Bonus Offer (buy $X get $Y free)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-story-bonus-offer', 'Gift Card Bonus Offer', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story promoting a gift card bonus offer. Value-focused, exciting, limited-time energy.

Background: Eye-catching design that highlights the bonus value. Could show: gift cards with a "BONUS" sticker, a visual representation of the deal (e.g., $50 card + $10 bonus card), or celebratory graphics suggesting extra value.

Value-focused typography:
"{{headline}}"
"{{deal_highlight}}"

THE DEAL:
Buy ${{purchase_amount}}
Get ${{bonus_amount}} FREE

"{{value_message}}"
"{{time_limit}}"
"{{cta}}"

The design makes the math obvious—they're getting more than they're paying for. The bonus feels like a real win, not a gimmick.

Space for swipe-up link.

The vibe: Smart gifting. You're basically getting free money. Don't miss this.
$PROMPT$,
'v1', TRUE,
'{"style": "value_excitement", "category": "gift_cards", "frame_count": 1, "input_schema": {"required": ["headline", "purchase_amount", "bonus_amount"], "optional": ["deal_highlight", "value_message", "time_limit", "cta"], "defaults": {"deal_highlight": "BONUS CARD DEAL", "value_message": "That''s $60 of food for $50", "time_limit": "Limited time only", "cta": "Get the deal →"}}, "variation_rules": {"style_adjectives": ["value focused", "bonus excitement", "smart deal", "limited time"], "bonus_elements": ["BONUS sticker", "card stack visual", "free badge", "deal math"], "camera_styles": ["bonus card reveal", "deal breakdown", "value highlight"]}}'::JSONB);

-- 9. "Still Need a Gift?" Holiday Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-story-holiday-reminder', 'Still Need a Gift? Holiday Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story as a gentle holiday reminder for procrastinators. Helpful, understanding, solution-oriented.

Background: Holiday-themed but with a sense of urgency. Could show: a calendar with days crossed off, a gift list with items unchecked, or a cozy holiday scene with a gift card as the obvious solution.

Understanding typography:
"{{headline}}"
"{{empathy_message}}"

GIFT CARDS:
✓ Everyone loves food
✓ Always the right size
✓ Never gets returned

"{{holiday_deadline}}"
"{{availability}}"
"{{cta}}"

The design is empathetic—we've all been there. The gift card is positioned as the smart solution, not the lazy one.

Space for swipe-up link.

The vibe: No judgment. We've got the perfect solution. You're welcome.
$PROMPT$,
'v1', TRUE,
'{"style": "empathetic_helpful", "category": "gift_cards", "season": "holiday", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["empathy_message", "holiday_deadline", "availability", "cta"], "defaults": {"empathy_message": "We''ve all been there", "holiday_deadline": "Order by Dec 23rd for Christmas", "availability": "E-gift cards deliver instantly", "cta": "Save the day →"}}, "variation_rules": {"style_adjectives": ["empathetic helpful", "procrastinator friendly", "solution focused", "no judgment"], "reminder_elements": ["calendar countdown", "gift list", "deadline badge"], "camera_styles": ["holiday reminder", "countdown visual", "solution reveal"]}}'::JSONB);

-- 10. Birthday Gift Card Suggestion
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-story-birthday', 'Birthday Gift Card Suggestion', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story suggesting gift cards as the perfect birthday present. Celebratory, fun, year-round relevant.

Background: Birthday celebration vibes—could include: balloons, confetti, birthday cake candles, party decorations, or a wrapped gift with the gift card visible. Festive but not childish.

Celebratory typography:
"{{headline}}"
"{{birthday_message}}"

THE PERFECT BIRTHDAY GIFT:
🎂 They pick what they want
🎁 No awkward returns
🎉 Delicious guaranteed

"{{amount_suggestion}}"
"{{cta}}"

The design feels like a birthday party—fun, celebratory, but sophisticated enough for adult birthdays too.

Space for swipe-up link.

The vibe: Skip the guessing game. Give them exactly what they want: a great meal.
$PROMPT$,
'v1', TRUE,
'{"style": "birthday_celebration", "category": "gift_cards", "season": "year_round", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["birthday_message", "amount_suggestion", "cta"], "defaults": {"birthday_message": "Know someone with a birthday coming up?", "amount_suggestion": "Gift cards from $25", "cta": "Send birthday wishes →"}}, "variation_rules": {"style_adjectives": ["birthday celebration", "fun festive", "year-round relevant", "party vibes"], "birthday_elements": ["balloons", "confetti", "candles", "wrapped gift"], "camera_styles": ["birthday party setup", "gift reveal", "celebration moment"]}}'::JSONB);


-- ============================================================================
-- GIFT CARD - FACEBOOK (2 templates)
-- ============================================================================

-- 11. Gift Card Availability Announcement (Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-fb-availability', 'Gift Card Availability Announcement', 'all_verticals', 'facebook', 'base',
$PROMPT$
Facebook-optimized image (1200x630 or 1:1) announcing gift card availability. Informative, inviting, shareable.

Scene: An attractive display of your gift cards—could be a single card beautifully styled, multiple denominations fanned out, or a gift card in an elegant presentation box. The setting is warm and inviting, suggesting the restaurant experience the card represents.

Clear, informative typography:
"{{headline}}"
"{{subheadline}}"

GIFT CARDS NOW AVAILABLE
{{denomination_list}}

"{{purchase_options}}"
"{{special_offer}}"

WHERE TO BUY:
• {{purchase_location1}}
• {{purchase_location2}}

The design is clean and shareable—works well in Facebook's feed format. The gift card is clearly the hero, but the restaurant's personality comes through.

The vibe: The perfect gift is now available. Easy to buy, easy to give, always appreciated.
$PROMPT$,
'v1', TRUE,
'{"style": "informative_inviting", "category": "gift_cards", "season": "year_round", "input_schema": {"required": ["headline"], "optional": ["subheadline", "denomination_list", "purchase_options", "special_offer", "purchase_location1", "purchase_location2"], "defaults": {"subheadline": "The gift of great food", "denomination_list": "$25 · $50 · $75 · $100 · Custom amounts", "purchase_options": "Physical cards & e-gift cards available", "special_offer": "", "purchase_location1": "In-store", "purchase_location2": "Online at our website"}}, "variation_rules": {"style_adjectives": ["informative clear", "inviting warm", "shareable friendly", "announcement style"], "display_elements": ["single card hero", "denomination spread", "presentation box"], "camera_styles": ["product announcement", "gift display", "availability showcase"]}}'::JSONB);

-- 12. Corporate Gifting Solutions (B2B Facebook)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('giftcard-fb-corporate', 'Corporate Gifting Solutions', 'all_verticals', 'facebook', 'base',
$PROMPT$
Facebook-optimized image (1200x630 or 1:1) targeting businesses for corporate gift card orders. Professional, B2B-focused, solution-oriented.

Scene: A professional presentation of bulk gift cards—could show: a stack of cards in branded packaging, gift cards with corporate "Thank You" sleeves, or a business-appropriate gift arrangement. The setting suggests corporate gifting: clean, professional, but still warm.

Professional typography:
"{{headline}}"
"{{subheadline}}"

CORPORATE GIFT CARD PROGRAM

IDEAL FOR:
• {{use_case1}}
• {{use_case2}}
• {{use_case3}}
• {{use_case4}}

"{{bulk_benefit}}"
"{{contact_info}}"

The design speaks to business decision-makers—professional enough for a corporate environment, but warm enough to represent hospitality.

The vibe: Impress your team and clients. Bulk ordering made easy. Everyone loves a great meal.
$PROMPT$,
'v1', TRUE,
'{"style": "professional_b2b", "category": "gift_cards", "audience": "b2b", "input_schema": {"required": ["headline"], "optional": ["subheadline", "use_case1", "use_case2", "use_case3", "use_case4", "bulk_benefit", "contact_info"], "defaults": {"subheadline": "Bulk gift card solutions for your business", "use_case1": "Employee appreciation", "use_case2": "Client gifts", "use_case3": "Holiday bonuses", "use_case4": "Team celebrations", "bulk_benefit": "Volume discounts available", "contact_info": "Contact us for corporate orders"}}, "variation_rules": {"style_adjectives": ["professional B2B", "corporate appropriate", "bulk focused", "business solution"], "corporate_elements": ["bulk card stack", "branded packaging", "corporate sleeves"], "camera_styles": ["professional product shot", "bulk display", "corporate presentation"]}}'::JSONB);

-- ============================================================================
-- WEATHER-TRIGGERED TEMPLATES (14 total)
-- ============================================================================

-- ============================================================================
-- RAINY DAY TEMPLATES (4 templates)
-- ============================================================================

-- 13. Rainy Day Soup Special (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-rainy-soup', 'Rainy Day Soup Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph capturing the cozy comfort of soup on a rainy day. The scene evokes warmth and shelter from the storm.

Hero: A steaming bowl of hearty soup—the steam is visible and dramatic, rising into the frame. The soup looks rich, chunky, soul-warming. A crusty bread slice or grilled cheese sits alongside.

The setting suggests rainy day coziness: perhaps a rain-streaked window visible in the background (soft focus), warm interior lighting, a cozy sweater sleeve visible holding the spoon, condensation on the window.

Comforting typography:
"{{headline}}"
"{{weather_hook}}"

"{{soup_name}}"
"${{soup_price}}"

"{{comfort_message}}"
"{{availability}}"

The lighting is warm tungsten—the golden glow of being inside while it's gray outside. The soup is the warm hug you need.

The vibe: Come in from the rain. We've got you. Comfort in a bowl.
$PROMPT$,
'v1', TRUE,
'{"style": "cozy_comfort", "category": "weather", "trigger": "rain", "food_focus": "soup", "input_schema": {"required": ["headline", "soup_name", "soup_price"], "optional": ["weather_hook", "comfort_message", "availability"], "defaults": {"weather_hook": "Perfect weather for...", "comfort_message": "Warm up with us", "availability": "While it lasts"}}, "variation_rules": {"style_adjectives": ["cozy rainy day", "warm comfort", "shelter from storm", "soul-warming"], "weather_elements": ["rain-streaked window", "gray sky background", "warm interior glow", "steam rising"], "soup_types": ["tomato bisque", "chicken noodle", "loaded potato", "French onion", "chili"], "camera_styles": ["soup hero with steam", "cozy setting wide", "spoon lift action"]}}'::JSONB);

-- 14. Cozy Comfort Food (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-rainy-comfort', 'Rainy Day Comfort Food', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing hearty comfort food perfect for a rainy day. Warm, indulgent, soul-satisfying.

Hero: Classic comfort food that makes you feel better—could be: mac and cheese with a golden crust, a steaming pot pie with flaky pastry, meatloaf with mashed potatoes, or a rich pasta dish. The food looks homemade, generous, deeply satisfying.

The setting suggests cozy indoor dining: warm lighting, perhaps a rain-blurred window in the background, a comfortable booth or table setting. The atmosphere says "stay awhile."

Comforting typography:
"{{headline}}"
"{{weather_hook}}"

"{{dish_name}}"
"{{dish_description}}"
"${{dish_price}}"

"{{comfort_message}}"

The lighting is warm and inviting—the kind of golden glow that makes you want to settle in. The food is the star, but the rainy day context makes it irresistible.

The vibe: Rainy days call for comfort food. This is the hug you need. Come get cozy.
$PROMPT$,
'v1', TRUE,
'{"style": "hearty_comfort", "category": "weather", "trigger": "rain", "food_focus": "comfort_food", "input_schema": {"required": ["headline", "dish_name", "dish_price"], "optional": ["weather_hook", "dish_description", "comfort_message"], "defaults": {"weather_hook": "Rainy day comfort", "dish_description": "Just like grandma made", "comfort_message": "The perfect rainy day meal"}}, "variation_rules": {"style_adjectives": ["hearty comfort", "soul satisfying", "rainy day indulgence", "homestyle warmth"], "weather_elements": ["rain-blurred window", "cozy booth", "warm interior", "stay awhile vibe"], "comfort_foods": ["mac and cheese", "pot pie", "meatloaf", "pasta", "casserole"], "camera_styles": ["comfort food hero", "cozy setting", "steam and warmth"]}}'::JSONB);


-- 15. "Perfect Day to Stay In" Delivery Push (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-rainy-delivery', 'Rainy Day Delivery Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story promoting delivery on a rainy day. Cozy, convenient, stay-home energy.

Background: The contrast between miserable outside and cozy inside. Could show: rain on a window with warm interior behind, a cozy couch setup with delivery bags arriving, or a split-screen of rain outside vs. food inside.

Cozy convenience typography:
"{{headline}}"
"{{weather_hook}}"

WHY GO OUT?
🌧️ It's pouring
🛋️ Your couch is calling
🍽️ We deliver

"{{delivery_message}}"
"{{delivery_info}}"
"{{cta}}"

The design makes staying in feel like the smart choice, not the lazy one. Delivery is positioned as self-care.

Space for swipe-up link or delivery app buttons.

The vibe: Don't be a hero. Stay dry. We'll bring the food to you.
$PROMPT$,
'v1', TRUE,
'{"style": "cozy_convenience", "category": "weather", "trigger": "rain", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["weather_hook", "delivery_message", "delivery_info", "cta"], "defaults": {"weather_hook": "Perfect day to stay in", "delivery_message": "Hot food, delivered to your door", "delivery_info": "Free delivery over $30", "cta": "Order now →"}}, "variation_rules": {"style_adjectives": ["cozy convenience", "stay home smart", "delivery comfort", "rainy day in"], "weather_elements": ["rain on window", "cozy couch", "delivery arrival", "inside vs outside"], "camera_styles": ["cozy interior", "delivery moment", "rain contrast"]}}'::JSONB);

-- 16. Rainy Day Coffee/Tea Special (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-rainy-coffee', 'Rainy Day Coffee & Tea Special', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story promoting hot beverages on a rainy day. Cozy, warming, perfect-for-the-weather energy.

Background: The ultimate rainy day beverage moment. Could show: hands wrapped around a steaming mug, a latte with beautiful foam art, rain streaking down a café window, or a cozy corner with a hot drink.

Warming typography:
"{{headline}}"
"{{weather_hook}}"

"{{drink_name}}"
"${{drink_price}}"

"{{warming_message}}"
"{{time_offer}}"
"{{cta}}"

The design captures that specific rainy day coffee shop feeling—the warmth of the mug, the sound of rain, the permission to slow down.

Space for swipe-up link.

The vibe: Rainy days were made for hot drinks. Come warm up. Stay awhile.
$PROMPT$,
'v1', TRUE,
'{"style": "warming_cozy", "category": "weather", "trigger": "rain", "food_focus": "hot_drinks", "frame_count": 1, "input_schema": {"required": ["headline", "drink_name", "drink_price"], "optional": ["weather_hook", "warming_message", "time_offer", "cta"], "defaults": {"weather_hook": "Rainy day essentials", "warming_message": "Warm up from the inside", "time_offer": "All day today", "cta": "Come get cozy →"}}, "variation_rules": {"style_adjectives": ["warming cozy", "rainy day café", "hot drink comfort", "slow down moment"], "weather_elements": ["rain on window", "steaming mug", "cozy corner", "hands on cup"], "drink_types": ["latte", "cappuccino", "hot chocolate", "chai", "tea"], "camera_styles": ["hands on mug", "latte art hero", "café window rain"]}}'::JSONB);

-- ============================================================================
-- HOT WEATHER TEMPLATES (4 templates)
-- ============================================================================

-- 17. Beat the Heat Frozen Drinks (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-heat-frozen', 'Beat the Heat Frozen Drinks', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph of refreshing frozen drinks that scream "cool down." The image should make viewers feel cooler just looking at it.

Hero: Frosty frozen drinks—margaritas, smoothies, slushies, or frozen lemonades. The glasses are frosted, condensation dripping, ice crystals visible. Colors are vibrant and refreshing: lime green, strawberry pink, mango orange, blue raspberry.

The setting suggests hot weather relief: bright sunlight (but the drinks are in shade), maybe a patio setting, sunglasses nearby, or a fan visible. The contrast between hot outside and cold drink is key.

Refreshing typography:
"{{headline}}"
"{{temperature_hook}}"

FROZEN {{drink_type}}
• {{flavor1}} — ${{price1}}
• {{flavor2}} — ${{price2}}
• {{flavor3}} — ${{price3}}

"{{cooling_message}}"
"{{time_limit}}"

The lighting is bright and summery but the drinks look ICE cold. Condensation is the hero texture—you can almost feel the cold glass.

The vibe: It's too hot. We have the solution. Brain freeze never felt so good.
$PROMPT$,
'v1', TRUE,
'{"style": "refreshing_cool", "category": "weather", "trigger": "heat", "food_focus": "frozen_drinks", "input_schema": {"required": ["headline", "drink_type", "flavor1", "price1"], "optional": ["temperature_hook", "flavor2", "price2", "flavor3", "price3", "cooling_message", "time_limit"], "defaults": {"temperature_hook": "It''s HOT out there", "cooling_message": "Cool down with us", "time_limit": "All summer long"}}, "variation_rules": {"style_adjectives": ["ice cold refreshing", "summer relief", "frosty frozen", "beat the heat"], "weather_elements": ["bright sunlight", "patio setting", "sunglasses prop", "condensation drips"], "drink_types": ["margaritas", "smoothies", "slushies", "frozen lemonades", "frosé"], "camera_styles": ["frozen drink hero", "condensation close-up", "multiple flavors spread"]}}'::JSONB);

-- 18. Ice Cream / Frozen Dessert Special (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-heat-icecream', 'Hot Weather Ice Cream Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph of irresistible frozen desserts perfect for hot weather. Indulgent, refreshing, summer treat energy.

Hero: A gorgeous frozen dessert—could be: a towering ice cream sundae, artisan gelato scoops, a milkshake with all the toppings, or an ice cream sandwich. The dessert is slightly melting (just enough to show it's cold), with toppings that add color and texture.

The setting suggests summer indulgence: bright, cheerful lighting, maybe a pool or patio visible in background, summer colors throughout. The dessert looks like the reward for surviving the heat.

Indulgent typography:
"{{headline}}"
"{{heat_hook}}"

"{{dessert_name}}"
"{{dessert_description}}"
"${{dessert_price}}"

"{{treat_message}}"
"{{availability}}"

The lighting is bright summer daylight but the dessert looks refreshingly cold. The slight melt adds urgency—eat it before it melts!

The vibe: You deserve this. It's hot. Treat yourself. Cold, creamy, perfect.
$PROMPT$,
'v1', TRUE,
'{"style": "summer_indulgence", "category": "weather", "trigger": "heat", "food_focus": "frozen_desserts", "input_schema": {"required": ["headline", "dessert_name", "dessert_price"], "optional": ["heat_hook", "dessert_description", "treat_message", "availability"], "defaults": {"heat_hook": "Beat the heat", "dessert_description": "Cool, creamy, perfect", "treat_message": "You''ve earned this", "availability": "While supplies last"}}, "variation_rules": {"style_adjectives": ["summer indulgence", "frozen treat", "heat relief", "creamy cold"], "weather_elements": ["bright summer light", "slight melt", "summer colors", "heat contrast"], "dessert_types": ["ice cream sundae", "gelato", "milkshake", "ice cream sandwich", "frozen yogurt"], "camera_styles": ["sundae hero", "scoop stack", "melting moment"]}}'::JSONB);


-- 19. Iced Coffee / Cold Brew Push (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-heat-icedcoffee', 'Hot Weather Iced Coffee Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story promoting iced coffee and cold brew on a hot day. Refreshing, energizing, beat-the-heat energy.

Background: The perfect iced coffee moment. Could show: a sweating glass of cold brew with ice, an iced latte being poured, coffee ice cubes in milk, or someone enjoying iced coffee in the summer heat.

Refreshing typography:
"{{headline}}"
"{{heat_hook}}"

"{{drink_name}}"
"${{drink_price}}"

☕ Cold brewed for {{brew_time}}
🧊 Served over ice
⚡ All the caffeine, none of the heat

"{{cooling_message}}"
"{{cta}}"

The design captures that first sip of cold coffee on a hot day—the relief, the energy, the refreshment.

Space for swipe-up link.

The vibe: Too hot for hot coffee. Cold brew to the rescue. Stay cool, stay caffeinated.
$PROMPT$,
'v1', TRUE,
'{"style": "refreshing_energy", "category": "weather", "trigger": "heat", "food_focus": "iced_coffee", "frame_count": 1, "input_schema": {"required": ["headline", "drink_name", "drink_price"], "optional": ["heat_hook", "brew_time", "cooling_message", "cta"], "defaults": {"heat_hook": "Too hot for hot coffee?", "brew_time": "24 hours", "cooling_message": "Cool down, power up", "cta": "Get your fix →"}}, "variation_rules": {"style_adjectives": ["refreshing energy", "cold caffeine", "summer coffee", "beat the heat"], "weather_elements": ["sweating glass", "ice cubes", "summer heat", "condensation"], "drink_types": ["cold brew", "iced latte", "iced americano", "nitro cold brew", "iced mocha"], "camera_styles": ["iced coffee pour", "condensation hero", "ice cube detail"]}}'::JSONB);

-- 20. "Too Hot to Cook" Takeout Promo (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-heat-takeout', 'Too Hot to Cook Takeout Promo', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story promoting takeout when it's too hot to cook. Practical, relatable, heat-wave survival energy.

Background: The contrast between a hot kitchen and the ease of takeout. Could show: a thermometer showing high temps, an oven with a "NOPE" sign, takeout containers looking refreshingly easy, or AC vent with takeout bags.

Relatable typography:
"{{headline}}"
"{{heat_hook}}"

WHY HEAT UP YOUR KITCHEN?
🔥 It's {{temperature}}° outside
🍳 Your stove will make it worse
📦 We already cooked it for you

"{{takeout_message}}"
"{{ordering_info}}"
"{{cta}}"

The design validates the decision to not cook—it's not lazy, it's smart. Takeout is positioned as the logical choice.

Space for swipe-up link or ordering buttons.

The vibe: Your kitchen is already hot enough. Let us do the cooking. Stay cool.
$PROMPT$,
'v1', TRUE,
'{"style": "practical_relatable", "category": "weather", "trigger": "heat", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["heat_hook", "temperature", "takeout_message", "ordering_info", "cta"], "defaults": {"heat_hook": "Too hot to cook?", "temperature": "95", "takeout_message": "Skip the hot kitchen", "ordering_info": "Pickup or delivery available", "cta": "Order takeout →"}}, "variation_rules": {"style_adjectives": ["practical smart", "heat wave survival", "no-cook solution", "takeout logic"], "weather_elements": ["thermometer", "hot kitchen contrast", "AC relief", "takeout ease"], "camera_styles": ["takeout hero", "temperature display", "kitchen contrast"]}}'::JSONB);

-- ============================================================================
-- COLD WEATHER / SNOW TEMPLATES (4 templates)
-- ============================================================================

-- 21. Snow Day Hot Chocolate (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-snow-cocoa', 'Snow Day Hot Chocolate', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for a snow day hot beverage special. Cozy, whimsical, winter wonderland energy.

Background: The warmth of being inside during a snowstorm. Could show: snow falling outside a window (soft focus), cozy interior with warm lighting, winter decorations, or a fireplace glow.

Hero: A gorgeous hot chocolate, latte, or warm cider—topped with whipped cream, marshmallows, or cinnamon. Steam rises invitingly. The mug looks warm and holdable.

Cozy typography:
"{{headline}}"
"{{snow_hook}}"

"{{drink_name}}"
"${{drink_price}}"

"{{warmth_message}}"
"{{cta}}"

Design elements: Could include snowflake graphics, cozy textures (knit patterns, plaid), or winter color palette (deep reds, forest greens, cream).

The vibe: Snow day = treat yourself day. Come warm up. Hot drinks and good vibes.
$PROMPT$,
'v1', TRUE,
'{"style": "cozy_winter", "category": "weather", "trigger": "snow", "frame_count": 1, "food_focus": "hot_drinks", "input_schema": {"required": ["headline", "drink_name", "drink_price"], "optional": ["snow_hook", "warmth_message", "cta"], "defaults": {"snow_hook": "Baby, it''s cold outside", "warmth_message": "Warm up with us", "cta": "Open all snow day ❄️"}}, "variation_rules": {"style_adjectives": ["cozy winter", "snow day treat", "warm inside", "winter wonderland"], "weather_elements": ["snow falling", "frosted window", "fireplace glow", "winter decorations"], "drink_types": ["hot chocolate", "peppermint mocha", "apple cider", "chai latte"], "camera_styles": ["steaming mug hero", "cozy hands holding", "window snow background"]}}'::JSONB);

-- 22. Warm Up With Us - Hot Drinks (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-cold-warmup', 'Cold Weather Warm Up Drinks', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting hot beverages on a cold day. Warming, inviting, come-in-from-the-cold energy.

Hero: A selection of warming drinks—could be: a steaming latte with foam art, hot cider with cinnamon stick, mulled wine, or a classic hot chocolate. Steam is visible and inviting. The drinks look like warmth in a cup.

The setting suggests cold weather refuge: perhaps frost on a window, winter light, cozy interior warmth, mittens or a scarf nearby. The contrast between cold outside and warm inside is key.

Warming typography:
"{{headline}}"
"{{cold_hook}}"

HOT DRINKS MENU:
• {{drink1}} — ${{price1}}
• {{drink2}} — ${{price2}}
• {{drink3}} — ${{price3}}

"{{warmth_message}}"
"{{availability}}"

The lighting is warm tungsten—the golden glow of a cozy café on a cold day. The steam from the drinks is the hero element.

The vibe: It's freezing out there. Come warm up. We've got just what you need.
$PROMPT$,
'v1', TRUE,
'{"style": "warming_refuge", "category": "weather", "trigger": "cold", "food_focus": "hot_drinks", "input_schema": {"required": ["headline", "drink1", "price1"], "optional": ["cold_hook", "drink2", "price2", "drink3", "price3", "warmth_message", "availability"], "defaults": {"cold_hook": "Come in from the cold", "warmth_message": "Warm up from the inside", "availability": "All winter long"}}, "variation_rules": {"style_adjectives": ["warming refuge", "cold weather comfort", "cozy café", "winter warmth"], "weather_elements": ["frost on window", "winter light", "cozy interior", "mittens scarf props"], "drink_types": ["latte", "hot cider", "mulled wine", "hot chocolate", "chai"], "camera_styles": ["hot drinks lineup", "steam hero", "cozy setting wide"]}}'::JSONB);


-- 23. Hearty Winter Specials (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-cold-hearty', 'Hearty Winter Specials', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing hearty, warming dishes perfect for cold weather. Substantial, comforting, winter-fuel energy.

Hero: A hearty winter dish that warms you from the inside—could be: a rich beef stew, shepherd's pie, braised short ribs, a loaded baked potato, or a steaming bowl of chili. The portion looks generous, the dish looks deeply satisfying.

The setting suggests cold weather dining: warm interior lighting, perhaps a glimpse of gray winter sky through a window, rustic table setting, hearty bread on the side. The food is the antidote to the cold.

Hearty typography:
"{{headline}}"
"{{cold_hook}}"

"{{dish_name}}"
"{{dish_description}}"
"${{dish_price}}"

"{{warming_message}}"
"{{pairing_suggestion}}"

The lighting is warm and rich—the golden glow of a hearty meal on a cold night. The food looks substantial enough to fuel you through winter.

The vibe: Cold weather calls for serious food. This will warm you up. Hearty, satisfying, perfect.
$PROMPT$,
'v1', TRUE,
'{"style": "hearty_substantial", "category": "weather", "trigger": "cold", "food_focus": "hearty_dishes", "input_schema": {"required": ["headline", "dish_name", "dish_price"], "optional": ["cold_hook", "dish_description", "warming_message", "pairing_suggestion"], "defaults": {"cold_hook": "Cold weather comfort", "dish_description": "Hearty, warming, satisfying", "warming_message": "The perfect cold weather meal", "pairing_suggestion": "Pairs perfectly with a glass of red"}}, "variation_rules": {"style_adjectives": ["hearty substantial", "winter fuel", "warming comfort", "cold weather antidote"], "weather_elements": ["gray winter sky", "warm interior", "rustic setting", "hearty bread"], "dish_types": ["beef stew", "shepherd''s pie", "braised short ribs", "chili", "pot roast"], "camera_styles": ["hearty dish hero", "generous portion", "rustic table setting"]}}'::JSONB);

-- 24. "We're Open" Snow Day Announcement (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-snow-open', 'Snow Day We''re Open Announcement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story announcing you're open during a snow day. Reassuring, welcoming, brave-the-storm energy.

Background: Snow falling or accumulated, but your restaurant looking warm and welcoming. Could show: your storefront with lights on in the snow, a "WE'RE OPEN" sign in a snowy window, or the cozy interior visible through a frosty door.

Reassuring typography:
"{{headline}}"
"{{snow_message}}"

YES, WE'RE OPEN! ❄️

"{{hours_today}}"
"{{what_to_expect}}"

"{{welcome_message}}"
"{{safety_note}}"
"{{cta}}"

The design reassures customers that you're there for them—warm, welcoming, ready to serve despite the weather.

Space for location/hours info.

The vibe: The snow won't stop us. Come warm up. We're here for you.
$PROMPT$,
'v1', TRUE,
'{"style": "reassuring_welcoming", "category": "weather", "trigger": "snow", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["snow_message", "hours_today", "what_to_expect", "welcome_message", "safety_note", "cta"], "defaults": {"snow_message": "It''s snowing, but we''re cozy inside", "hours_today": "Open regular hours", "what_to_expect": "Hot drinks, warm food, good vibes", "welcome_message": "Come warm up with us", "safety_note": "Drive safe!", "cta": "See you soon ❄️"}}, "variation_rules": {"style_adjectives": ["reassuring welcoming", "snow day brave", "warm refuge", "open despite weather"], "weather_elements": ["snow falling", "warm storefront", "frosty window", "WE''RE OPEN sign"], "camera_styles": ["storefront in snow", "warm interior glimpse", "welcoming entrance"]}}'::JSONB);

-- ============================================================================
-- NICE WEATHER / SEASONAL TEMPLATES (2 templates)
-- ============================================================================

-- 25. Patio Season Opening (Square)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-sq-patio-open', 'Patio Season Opening', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph announcing patio season is OPEN. The excitement of the first beautiful day after a long winter.

Scene: Your patio at its best—tables set, umbrellas up, string lights ready, plants fresh. The space looks inviting and ready for guests. Golden hour lighting or bright sunny day.

No people yet (or just hints of staff preparing)—the anticipation of the season beginning. Everything is clean, fresh, new.

Celebratory typography:
"{{headline}}"
"{{weather_celebration}}"

"PATIO {{status}}"

"{{first_day_special}}"
"{{hours_info}}"
"{{reservation_cta}}"

The lighting is that perfect spring/early summer golden glow. The image makes you want to grab a table immediately.

The vibe: Winter is OVER. Get outside. First come, first served for the best seats.
$PROMPT$,
'v1', TRUE,
'{"style": "spring_celebration", "category": "weather", "trigger": "nice_weather", "input_schema": {"required": ["headline", "status"], "optional": ["weather_celebration", "first_day_special", "hours_info", "reservation_cta"], "defaults": {"weather_celebration": "Finally! ☀️", "status": "NOW OPEN", "first_day_special": "Rosé all day", "hours_info": "Weather permitting", "reservation_cta": "Reserve your spot"}}, "variation_rules": {"style_adjectives": ["spring celebration", "patio season", "golden hour glow", "fresh start"], "patio_elements": ["string lights", "umbrellas", "fresh plants", "set tables"], "camera_styles": ["patio wide establishing", "table setting detail", "golden hour atmosphere"]}}'::JSONB);

-- 26. First Nice Day Celebration (Story)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('weather-story-nice-day', 'First Nice Day Celebration', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story celebrating the first beautiful day of the season. Excited, spontaneous, get-outside energy.

Background: The joy of perfect weather—could show: blue sky and sunshine, your patio filling up, people enjoying outdoor dining, or a "PERFECT WEATHER" celebration graphic.

Excited typography:
"{{headline}}"
"{{weather_excitement}}"

TODAY'S FORECAST:
☀️ {{temperature}}° and perfect
🍹 Patio drinks
🌿 Fresh air dining

"{{special_offer}}"
"{{outdoor_message}}"
"{{cta}}"

The design captures that spontaneous "drop everything, it's beautiful out" energy. The first nice day is an event.

Space for swipe-up link.

The vibe: THIS IS IT. The day we've been waiting for. Get outside. Celebrate.
$PROMPT$,
'v1', TRUE,
'{"style": "spontaneous_celebration", "category": "weather", "trigger": "nice_weather", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["weather_excitement", "temperature", "special_offer", "outdoor_message", "cta"], "defaults": {"weather_excitement": "FINALLY! ☀️", "temperature": "72", "special_offer": "Patio specials all day", "outdoor_message": "Best seats in the house are outside", "cta": "Grab a table →"}}, "variation_rules": {"style_adjectives": ["spontaneous celebration", "perfect weather", "get outside", "first nice day"], "weather_elements": ["blue sky", "sunshine", "outdoor dining", "patio scene"], "camera_styles": ["sunny patio", "outdoor celebration", "perfect weather moment"]}}'::JSONB);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
