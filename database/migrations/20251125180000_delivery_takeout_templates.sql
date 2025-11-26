-- Migration: Delivery, Takeout, Family Meals & Catering Templates
-- Description: 30 templates for off-premise dining promotions
-- Categories: delivery (10), takeout (8), family_meal (6), catering (6)

-- ============================================================================
-- DELIVERY TEMPLATES - Instagram Square (5)
-- ============================================================================

-- 1. "We Deliver" General Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-sq-we-deliver', 'We Deliver Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph announcing delivery service. The focus is on convenience and the joy of restaurant food at home.

Scene options:
- Branded delivery bags/boxes arranged attractively, ready to go
- Food being packaged with care (hands visible, quality containers)
- Delivery setup at the restaurant (bags lined up, organized)
- A doorstep delivery moment (bag on welcome mat, door in background)

The packaging looks premium—not sad takeout containers. Branded elements visible. The food inside is implied but not the focus.

Clear, convenient typography:
"{{headline}}"
"WE DELIVER"
{{delivery_description}}

ORDER NOW:
• {{order_method1}}
• {{order_method2}}
• {{order_method3}}

"{{delivery_area}}"
"{{minimum_order}}"

The lighting is bright and clean—this food is fresh, not sitting around. The vibe is "restaurant quality, your location."

The feeling: Why go out when we come to you? Same great food. Your couch.
$PROMPT$,
'v1', TRUE,
'{"style": "convenience_quality", "category": "delivery", "input_schema": {"required": ["headline"], "optional": ["delivery_description", "order_method1", "order_method2", "order_method3", "delivery_area", "minimum_order"], "defaults": {"delivery_description": "Your favorites, delivered fresh", "order_method1": "Our website", "order_method2": "DoorDash", "order_method3": "UberEats", "delivery_area": "Delivering within 5 miles", "minimum_order": "No minimum order"}}, "variation_rules": {"style_adjectives": ["convenience focused", "quality packaging", "fresh delivery", "restaurant at home"], "packaging_scenes": ["branded bags ready", "careful packaging", "doorstep delivery", "organized pickup"], "camera_styles": ["packaging hero", "delivery setup", "doorstep moment"]}}'::JSONB);

-- 2. Delivery App Promo (DoorDash/UberEats/etc.)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-sq-app-promo', 'Delivery App Promo', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic promoting ordering through a specific delivery app. Clean, app-focused design that drives action.

Scene: Could be photography or graphic design focused:
- Phone screen showing the app/restaurant listing (mockup style)
- Delivery bag with app branding visible
- Split design: restaurant food + app logo
- "Order on [App]" graphic treatment

The design acknowledges the partnership while keeping your restaurant as the hero.

App-partnership typography:
"{{headline}}"
"ORDER ON {{app_name}}"
"{{promo_code}}"
"{{promo_description}}"
"{{promo_terms}}"
"{{cta}}"

The design uses the app's brand colors as accents while maintaining your restaurant's identity. Clear call-to-action to open the app.

The feeling: We're on your favorite app. Easy ordering. Special deal just for you.
$PROMPT$,
'v1', TRUE,
'{"style": "app_partnership", "category": "delivery", "input_schema": {"required": ["headline", "app_name"], "optional": ["promo_code", "promo_description", "promo_terms", "cta"], "defaults": {"promo_description": "Free delivery on your first order", "promo_terms": "New customers only", "cta": "Order now →"}}, "variation_rules": {"style_adjectives": ["app partnership", "easy ordering", "promo focused", "action driving"], "app_names": ["DoorDash", "UberEats", "Grubhub", "Postmates", "Caviar"], "design_styles": ["phone mockup", "split design", "app logo feature", "promo code hero"], "camera_styles": ["graphic design", "phone screen", "bag with branding"]}}'::JSONB);

-- 3. Delivery Radius/Area Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-sq-radius', 'Delivery Area Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing delivery coverage area. Map-inspired design that's clear and helpful.

Scene options:
- Stylized map graphic with delivery radius highlighted
- Neighborhood names/landmarks in attractive typography
- Delivery vehicle/bike with route visualization
- "We deliver to YOU" personalized feel with location pins

The design makes it easy to understand "do they deliver to me?" at a glance.

Location-focused typography:
"{{headline}}"
"NOW DELIVERING TO"

{{neighborhood1}}
{{neighborhood2}}
{{neighborhood3}}
{{neighborhood4}}

"{{radius_description}}"
"{{delivery_fee_info}}"
"{{order_cta}}"

The design feels local and community-connected. Colors are warm and welcoming—we're coming to YOUR neighborhood.

The feeling: We're in your area. Your neighborhood. We've got you covered.
$PROMPT$,
'v1', TRUE,
'{"style": "local_coverage", "category": "delivery", "input_schema": {"required": ["headline"], "optional": ["neighborhood1", "neighborhood2", "neighborhood3", "neighborhood4", "radius_description", "delivery_fee_info", "order_cta"], "defaults": {"neighborhood1": "Downtown", "neighborhood2": "Midtown", "neighborhood3": "Westside", "neighborhood4": "University District", "radius_description": "5-mile delivery radius", "delivery_fee_info": "$3.99 delivery fee", "order_cta": "Check if we deliver to you"}}, "variation_rules": {"style_adjectives": ["local coverage", "neighborhood focused", "community connected", "area expansion"], "map_styles": ["radius highlight", "neighborhood names", "route visualization", "location pins"], "camera_styles": ["map graphic", "location design", "neighborhood showcase"]}}'::JSONB);


-- 4. New Delivery Partnership Launch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-sq-partnership', 'New Delivery Partnership Launch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 announcement graphic for a new delivery partnership. Exciting, newsworthy, launch energy.

Scene options:
- Dual branding: restaurant logo + delivery partner logo
- "Now on [Platform]" celebratory design
- Launch day visual with confetti/celebration elements
- Partnership handshake concept (abstract, not literal)

The design feels like an announcement worth sharing. New + exciting.

Partnership launch typography:
"{{headline}}"
"NOW AVAILABLE ON"
"{{partner_name}}"

"{{launch_promo}}"
"{{promo_code}}"
"{{promo_terms}}"

"{{launch_date}}"
"{{cta}}"

Bold, celebratory colors. The energy says "this is news!" Both brands are represented but your restaurant leads.

The feeling: Big news! We're now on [Platform]. Celebrate with a special deal.
$PROMPT$,
'v1', TRUE,
'{"style": "launch_celebration", "category": "delivery", "input_schema": {"required": ["headline", "partner_name"], "optional": ["launch_promo", "promo_code", "promo_terms", "launch_date", "cta"], "defaults": {"launch_promo": "Get 20% off your first order", "promo_terms": "Limited time offer", "launch_date": "Starting today", "cta": "Order now on " }}, "variation_rules": {"style_adjectives": ["launch excitement", "partnership celebration", "newsworthy", "dual branding"], "launch_visuals": ["dual logos", "celebration elements", "now available badge", "partnership graphic"], "camera_styles": ["announcement design", "launch graphic", "celebration layout"]}}'::JSONB);

-- 5. Delivery Hours/Availability
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-sq-hours', 'Delivery Hours & Availability', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 informational graphic showing delivery hours and availability. Clear, helpful, reference-worthy.

Scene options:
- Clock/time visual with delivery hours highlighted
- Day-of-week schedule in attractive grid format
- "When we deliver" infographic style
- Delivery bag with clock overlay

The design is save-worthy—something customers screenshot for reference.

Schedule-focused typography:
"{{headline}}"
"DELIVERY HOURS"

{{schedule_line1}}
{{schedule_line2}}
{{schedule_line3}}

"{{cutoff_info}}"
"{{holiday_note}}"
"{{order_cta}}"

Clean, organized layout. Easy to read at a glance. The information hierarchy is crystal clear.

The feeling: Here's when we deliver. Plan accordingly. We've got your schedule covered.
$PROMPT$,
'v1', TRUE,
'{"style": "informational_clear", "category": "delivery", "input_schema": {"required": ["headline"], "optional": ["schedule_line1", "schedule_line2", "schedule_line3", "cutoff_info", "holiday_note", "order_cta"], "defaults": {"schedule_line1": "Mon-Thu: 11am - 9pm", "schedule_line2": "Fri-Sat: 11am - 10pm", "schedule_line3": "Sunday: 12pm - 8pm", "cutoff_info": "Last order 30 min before close", "holiday_note": "Hours may vary on holidays", "order_cta": "Order anytime we are open"}}, "variation_rules": {"style_adjectives": ["informational", "reference worthy", "clear schedule", "save-worthy"], "schedule_visuals": ["clock graphic", "day grid", "infographic style", "time overlay"], "camera_styles": ["schedule design", "hours graphic", "availability layout"]}}'::JSONB);

-- ============================================================================
-- DELIVERY TEMPLATES - Instagram Stories (5)
-- ============================================================================

-- 6. "Too Tired to Cook" Evening Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-story-tired', 'Too Tired to Cook Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for that end-of-day "I don't want to cook" moment. Relatable, helpful, timely.

Background: Cozy home setting that says "evening wind-down." Options:
- Couch with blanket, TV remote visible
- Kitchen with clean counters (no cooking happening)
- Phone in hand, ready to order
- Delivery bag arriving at door

The vibe is "we get it, you're tired."

Relatable, helpful typography:
"{{headline}}"
"{{relatable_message}}"
"WE'VE GOT DINNER"
"{{order_prompt}}"
"{{delivery_time}}"
"{{cta}}"

Design is warm and cozy—evening colors, relaxed energy. This isn't urgent, it's understanding.

Space for swipe-up or link sticker.

The feeling: Long day? Same. Let us handle dinner. You rest.
$PROMPT$,
'v1', TRUE,
'{"style": "relatable_helpful", "category": "delivery", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["relatable_message", "order_prompt", "delivery_time", "cta"], "defaults": {"relatable_message": "Long day? We get it.", "order_prompt": "Skip the cooking tonight", "delivery_time": "Delivered in 30-45 min", "cta": "Order now →"}}, "variation_rules": {"style_adjectives": ["relatable tired", "evening comfort", "no judgment", "we understand"], "home_scenes": ["couch comfort", "clean kitchen", "phone ordering", "delivery arriving"], "camera_styles": ["cozy home", "evening mood", "relatable moment"]}}'::JSONB);

-- 7. Free Delivery Promo
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-story-free', 'Free Delivery Promotion', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story announcing free delivery. Urgent, deal-focused, action-driving.

Background: Dynamic, promotional energy. Options:
- Delivery bag with "FREE DELIVERY" graphic overlay
- Motion blur of delivery in progress
- Bold graphic design with delivery iconography
- Split: food + delivery vehicle/bag

The design screams "DEAL" without being cheap-looking.

Promotional typography:
"{{headline}}"
"FREE DELIVERY"
"{{promo_details}}"
"{{promo_code}}"
"{{minimum_order}}"
"{{expiration}}"
"{{cta}}"

Bold colors, clear hierarchy, urgency without desperation. This is a real deal worth acting on.

Space for swipe-up link.

The feeling: Free delivery? Yes please. Limited time. Order now.
$PROMPT$,
'v1', TRUE,
'{"style": "deal_urgency", "category": "delivery", "frame_count": 1, "input_schema": {"required": ["headline", "promo_details"], "optional": ["promo_code", "minimum_order", "expiration", "cta"], "defaults": {"minimum_order": "On orders $25+", "expiration": "This weekend only", "cta": "Order now →"}}, "variation_rules": {"style_adjectives": ["deal urgency", "free delivery excitement", "action driving", "limited time"], "promo_visuals": ["delivery bag hero", "motion blur", "bold graphics", "split design"], "camera_styles": ["promotional graphic", "deal showcase", "urgency design"]}}'::JSONB);

-- 8. "Order Now" Lunch Rush Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-story-lunch', 'Lunch Rush Order Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story targeting the lunch ordering window. Time-sensitive, appetite-triggering.

Background: Midday energy, lunch-ready visuals. Options:
- Clock showing 11:30am with food imagery
- Office/desk setting with delivery arriving
- Lunch spread being unpacked
- "Beat the rush" countdown energy

The timing is specific—this is for RIGHT NOW ordering.

Time-sensitive typography:
"{{headline}}"
"LUNCH IS CALLING"
"{{time_message}}"
"{{lunch_special}}"
"{{delivery_time}}"
"{{cta}}"

Bright, energetic midday colors. The urgency is "order now, eat soon" not "last chance ever."

Space for swipe-up link.

The feeling: It's almost lunch. You're hungry. We deliver fast. Order now.
$PROMPT$,
'v1', TRUE,
'{"style": "lunch_urgency", "category": "delivery", "frame_count": 1, "time_specific": "lunch", "input_schema": {"required": ["headline"], "optional": ["time_message", "lunch_special", "delivery_time", "cta"], "defaults": {"time_message": "Order by 11:30 for noon delivery", "lunch_special": "Lunch combos starting at $12", "delivery_time": "30-minute delivery", "cta": "Order lunch →"}}, "variation_rules": {"style_adjectives": ["lunch urgency", "midday hunger", "time sensitive", "beat the rush"], "lunch_scenes": ["clock timing", "office delivery", "lunch unpack", "countdown energy"], "camera_styles": ["midday bright", "lunch timing", "urgency moment"]}}'::JSONB);

-- 9. Delivery Tracking Excitement ("On its way!")
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-story-tracking', 'Delivery On Its Way Excitement', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story capturing the excitement of tracking your delivery. Anticipation, excitement, almost-there energy.

Background: The "waiting for delivery" moment. Options:
- Phone screen showing delivery tracking map
- Window watching, anticipation pose
- Door with "delivery arriving" notification overlay
- Countdown/ETA visual treatment

The vibe is excited anticipation—the best part of ordering delivery.

Anticipation typography:
"{{headline}}"
"YOUR ORDER IS"
"ON ITS WAY"
"{{eta_message}}"
"{{tracking_prompt}}"
"{{excitement_line}}"

Animated energy—motion lines, tracking dots, arrival countdown. The excitement is building.

The feeling: It's coming! Track it. Get ready. Almost there!
$PROMPT$,
'v1', TRUE,
'{"style": "anticipation_excitement", "category": "delivery", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["eta_message", "tracking_prompt", "excitement_line"], "defaults": {"eta_message": "Arriving in 15 minutes", "tracking_prompt": "Track your order in real-time", "excitement_line": "Get ready for deliciousness"}}, "variation_rules": {"style_adjectives": ["anticipation building", "tracking excitement", "almost there", "delivery incoming"], "tracking_scenes": ["phone map", "window watching", "door notification", "countdown visual"], "camera_styles": ["anticipation moment", "tracking screen", "arrival excitement"]}}'::JSONB);

-- 10. Weather + Delivery ("Stay in, we deliver")
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('delivery-story-weather', 'Weather Day Delivery Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for bad weather days. Cozy inside, let us brave the elements.

Background: Weather-aware, stay-inside energy. Options:
- Rain on window with cozy interior
- Snow falling outside, warm inside
- Stormy weather graphic with delivery bag
- "Stay cozy" home scene with weather visible

The message: the weather is bad, but your dinner doesn't have to be.

Weather-aware typography:
"{{headline}}"
"{{weather_message}}"
"STAY IN"
"WE'LL DELIVER"
"{{comfort_food_prompt}}"
"{{delivery_assurance}}"
"{{cta}}"

Cozy, warm colors inside contrasting with the weather outside. The feeling is "you're smart to stay in."

Space for swipe-up link.

The feeling: Nasty weather? Stay cozy. We've got this. Delivery is on.
$PROMPT$,
'v1', TRUE,
'{"style": "weather_cozy", "category": "delivery", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["weather_message", "comfort_food_prompt", "delivery_assurance", "cta"], "defaults": {"weather_message": "Rainy day? Perfect delivery day.", "comfort_food_prompt": "Comfort food, delivered", "delivery_assurance": "We deliver rain or shine", "cta": "Order now →"}}, "variation_rules": {"style_adjectives": ["weather aware", "cozy inside", "stay in comfort", "brave the elements"], "weather_scenes": ["rain window", "snow falling", "stormy graphic", "cozy contrast"], "camera_styles": ["weather mood", "cozy interior", "contrast design"]}}'::JSONB);


-- ============================================================================
-- TAKEOUT TEMPLATES - Instagram Square (4)
-- ============================================================================

-- 11. Takeout Tuesday Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-sq-tuesday', 'Takeout Tuesday Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting a weekly takeout special. Tuesday becomes a reason to order.

Scene: Takeout containers arranged attractively—the "unboxing" moment at home. Options:
- Containers open on a home table, food visible but focus on the spread
- Family/couple hands reaching for containers (no faces needed)
- Takeout bag being opened, anticipation moment
- Kitchen counter with takeout spread, home setting visible

The setting is clearly HOME—not the restaurant. Cozy, comfortable, "no cooking tonight" energy.

Weekly special typography:
"{{headline}}"
TAKEOUT TUESDAY
{{deal_description}}

• {{item1}} — ${{price1}}
• {{item2}} — ${{price2}}

"{{savings_callout}}"
"{{order_instructions}}"

The lighting is warm home lighting—not restaurant lighting. The vibe is "Tuesday night sorted."

The feeling: Skip the cooking. It's Takeout Tuesday. We've got dinner covered.
$PROMPT$,
'v1', TRUE,
'{"style": "weekly_ritual", "category": "takeout", "day_specific": "tuesday", "input_schema": {"required": ["headline", "deal_description"], "optional": ["item1", "price1", "item2", "price2", "savings_callout", "order_instructions"], "defaults": {"savings_callout": "Save 20% every Tuesday", "order_instructions": "Order by 5pm for dinner"}}, "variation_rules": {"style_adjectives": ["weekly ritual", "home comfort", "no cooking tonight", "Tuesday tradition"], "home_scenes": ["unboxing moment", "family reaching", "bag opening", "counter spread"], "camera_styles": ["home table spread", "hands reaching", "anticipation moment"]}}'::JSONB);

-- 12. Curbside Pickup Announcement
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-sq-curbside', 'Curbside Pickup Announcement', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting curbside pickup service. Convenience, speed, no-contact ease.

Scene: The curbside pickup experience. Options:
- Car at designated curbside spot, staff approaching with bag
- "Curbside Pickup" signage with parking spot visible
- Bag being handed through car window (hands visible)
- Designated pickup zone with clear signage

The focus is on how EASY this is—order ahead, pull up, food appears.

Convenience-focused typography:
"{{headline}}"
"CURBSIDE PICKUP"
"{{convenience_message}}"

HOW IT WORKS:
1. {{step1}}
2. {{step2}}
3. {{step3}}

"{{wait_time}}"
"{{cta}}"

Bright, clear lighting. The vibe is "this is so easy" not "pandemic necessity."

The feeling: Don't even get out of your car. We bring it to you. Easy.
$PROMPT$,
'v1', TRUE,
'{"style": "convenience_ease", "category": "takeout", "input_schema": {"required": ["headline"], "optional": ["convenience_message", "step1", "step2", "step3", "wait_time", "cta"], "defaults": {"convenience_message": "Stay in your car, we come to you", "step1": "Order online or by phone", "step2": "Pull into curbside spot", "step3": "We bring your order out", "wait_time": "Ready in 15-20 minutes", "cta": "Order for curbside pickup"}}, "variation_rules": {"style_adjectives": ["curbside convenience", "no contact ease", "stay in car", "effortless pickup"], "curbside_scenes": ["car at spot", "signage visible", "window handoff", "pickup zone"], "camera_styles": ["curbside moment", "convenience showcase", "easy pickup"]}}'::JSONB);

-- 13. Online Ordering Launch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-sq-online', 'Online Ordering Launch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 graphic announcing online ordering capability. Modern, tech-forward, convenient.

Scene: Digital ordering made visual. Options:
- Phone/tablet showing online ordering interface (mockup)
- QR code with "Scan to Order" treatment
- Website/app screenshot with food imagery
- "Order Online" graphic with device imagery

The design feels modern and easy—not complicated tech.

Digital ordering typography:
"{{headline}}"
"ORDER ONLINE"
"{{launch_message}}"

"{{website_url}}"
"{{qr_prompt}}"

BENEFITS:
• {{benefit1}}
• {{benefit2}}
• {{benefit3}}

"{{launch_promo}}"
"{{cta}}"

Clean, modern design. The tech feels accessible, not intimidating.

The feeling: We're online now. Order from anywhere. So convenient.
$PROMPT$,
'v1', TRUE,
'{"style": "modern_digital", "category": "takeout", "input_schema": {"required": ["headline"], "optional": ["launch_message", "website_url", "qr_prompt", "benefit1", "benefit2", "benefit3", "launch_promo", "cta"], "defaults": {"launch_message": "Skip the phone, order online", "website_url": "order.restaurant.com", "qr_prompt": "Scan to order", "benefit1": "See full menu with photos", "benefit2": "Customize your order", "benefit3": "Pay ahead, skip the wait", "launch_promo": "10% off your first online order", "cta": "Order now at"}}, "variation_rules": {"style_adjectives": ["modern digital", "tech forward", "easy online", "convenient ordering"], "digital_scenes": ["phone mockup", "QR code", "website screenshot", "device imagery"], "camera_styles": ["digital design", "tech showcase", "modern layout"]}}'::JSONB);

-- 14. Takeout Family Bundle
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-sq-bundle', 'Takeout Family Bundle', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing a takeout bundle deal. Value, variety, feeds everyone.

Scene: Bundle contents displayed attractively. Options:
- All bundle items arranged together, showing variety
- Takeout containers with bundle contents visible
- "What's included" flat lay style
- Family unpacking the bundle at home

The quantity and variety are the heroes—this is a DEAL.

Bundle value typography:
"{{headline}}"
"FAMILY BUNDLE"
"{{bundle_description}}"

INCLUDES:
• {{item1}}
• {{item2}}
• {{item3}}
• {{item4}}

"${{bundle_price}}"
"{{value_statement}}"
"{{feeds_count}}"
"{{order_cta}}"

The lighting shows off the abundance. The vibe is "so much food, such good value."

The feeling: One order, everyone's happy. Great value. Easy dinner.
$PROMPT$,
'v1', TRUE,
'{"style": "bundle_value", "category": "takeout", "input_schema": {"required": ["headline", "bundle_price"], "optional": ["bundle_description", "item1", "item2", "item3", "item4", "value_statement", "feeds_count", "order_cta"], "defaults": {"bundle_description": "Everything you need for family dinner", "item1": "Choice of 2 entrees", "item2": "2 large sides", "item3": "Fresh bread", "item4": "Dessert for 4", "value_statement": "Save $15 vs ordering separately", "feeds_count": "Feeds 4-6", "order_cta": "Order your bundle today"}}, "variation_rules": {"style_adjectives": ["bundle value", "family variety", "deal showcase", "abundance display"], "bundle_scenes": ["items arranged", "containers visible", "flat lay", "family unpacking"], "camera_styles": ["bundle spread", "value showcase", "variety display"]}}'::JSONB);

-- ============================================================================
-- TAKEOUT TEMPLATES - Instagram Stories (4)
-- ============================================================================

-- 15. "Ready for Pickup" Notification Style
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-story-ready', 'Ready for Pickup Notification', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story mimicking a pickup notification. Playful, notification-style design.

Background: Notification/alert style design. Options:
- Phone notification mockup "Your order is ready!"
- Pickup counter with bag ready and waiting
- "READY" badge/stamp graphic treatment
- Split: notification + actual food ready

The design plays with the notification format we all know and love.

Notification-style typography:
"{{headline}}"

[Notification style box]
"YOUR ORDER IS READY"
"{{pickup_message}}"

"{{pickup_location}}"
"{{pickup_window}}"
"{{cta}}"

Playful but clear. The notification format is familiar and attention-grabbing.

The feeling: *ding* Your food is ready. Come get it. It's waiting for you.
$PROMPT$,
'v1', TRUE,
'{"style": "notification_playful", "category": "takeout", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["pickup_message", "pickup_location", "pickup_window", "cta"], "defaults": {"pickup_message": "Swing by and grab it", "pickup_location": "Pickup at front counter", "pickup_window": "Ready in 15 minutes", "cta": "Order for pickup →"}}, "variation_rules": {"style_adjectives": ["notification style", "playful alert", "ready waiting", "familiar format"], "notification_scenes": ["phone mockup", "counter ready", "ready badge", "split design"], "camera_styles": ["notification design", "alert style", "ready moment"]}}'::JSONB);

-- 16. Quick Lunch Takeout Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-story-lunch', 'Quick Lunch Takeout Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for quick lunch takeout. Speed, convenience, back-to-work energy.

Background: Lunch break efficiency. Options:
- Person grabbing takeout bag, on-the-go energy
- Lunch container at desk/workspace
- Quick pickup moment at counter
- Clock showing lunch hour with takeout ready

The vibe is "quick lunch break, no time wasted."

Speed-focused typography:
"{{headline}}"
"LUNCH BREAK?"
"{{speed_message}}"
"{{lunch_deal}}"
"{{ready_time}}"
"{{cta}}"

Energetic, efficient design. Bright lunch-hour colors. The message is "fast and delicious."

Space for swipe-up link.

The feeling: Short lunch break? We're fast. In and out. Back to work with great food.
$PROMPT$,
'v1', TRUE,
'{"style": "lunch_efficiency", "category": "takeout", "frame_count": 1, "time_specific": "lunch", "input_schema": {"required": ["headline"], "optional": ["speed_message", "lunch_deal", "ready_time", "cta"], "defaults": {"speed_message": "Order ahead, skip the line", "lunch_deal": "Lunch specials from $10", "ready_time": "Ready in 10 minutes", "cta": "Order lunch →"}}, "variation_rules": {"style_adjectives": ["lunch efficiency", "quick break", "no time wasted", "fast pickup"], "lunch_scenes": ["grabbing bag", "desk lunch", "counter pickup", "clock timing"], "camera_styles": ["efficiency moment", "quick grab", "lunch speed"]}}'::JSONB);

-- 17. Weekend Takeout Reminder
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-story-weekend', 'Weekend Takeout Reminder', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for weekend takeout. Relaxed, treat-yourself, weekend vibes.

Background: Weekend relaxation energy. Options:
- Cozy weekend morning/afternoon home scene
- Takeout spread for weekend movie night
- Lazy weekend "no cooking" energy
- Outdoor weekend activity + takeout combo

The vibe is "it's the weekend, you deserve this."

Weekend relaxation typography:
"{{headline}}"
"{{weekend_message}}"
"WEEKEND TAKEOUT"
"{{treat_yourself}}"
"{{weekend_special}}"
"{{cta}}"

Relaxed, warm weekend colors. The energy is "slow down and enjoy."

Space for swipe-up link.

The feeling: It's the weekend. No cooking required. Treat yourself.
$PROMPT$,
'v1', TRUE,
'{"style": "weekend_relaxation", "category": "takeout", "frame_count": 1, "day_specific": "weekend", "input_schema": {"required": ["headline"], "optional": ["weekend_message", "treat_yourself", "weekend_special", "cta"], "defaults": {"weekend_message": "Weekend plans: takeout + relaxation", "treat_yourself": "You deserve a break from cooking", "weekend_special": "Weekend family specials available", "cta": "Order now →"}}, "variation_rules": {"style_adjectives": ["weekend relaxation", "treat yourself", "no cooking", "lazy weekend"], "weekend_scenes": ["cozy home", "movie night", "lazy energy", "outdoor activity"], "camera_styles": ["weekend mood", "relaxation vibe", "treat moment"]}}'::JSONB);

-- 18. "Skip the Wait" Order Ahead
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('takeout-story-ahead', 'Skip the Wait Order Ahead', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story promoting order-ahead for pickup. Skip the line, smart ordering.

Background: The contrast of waiting vs. not waiting. Options:
- Split: long line vs. walking past to pickup
- "Skip the line" graphic with arrow
- Person breezing past with their order
- Order-ahead phone screen + ready pickup

The message is clear: order ahead = no waiting.

Skip-the-line typography:
"{{headline}}"
"SKIP THE WAIT"
"{{order_ahead_message}}"

HOW IT WORKS:
{{step1}}
{{step2}}
{{step3}}

"{{time_saved}}"
"{{cta}}"

Dynamic, efficient design. The contrast between waiting and not waiting is visual.

Space for swipe-up link.

The feeling: Why wait in line? Order ahead. Walk in, grab, go.
$PROMPT$,
'v1', TRUE,
'{"style": "efficiency_smart", "category": "takeout", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["order_ahead_message", "step1", "step2", "step3", "time_saved", "cta"], "defaults": {"order_ahead_message": "Order now, pick up when ready", "step1": "Order on your phone", "step2": "Get a ready notification", "step3": "Walk in and grab", "time_saved": "Save 15+ minutes", "cta": "Order ahead →"}}, "variation_rules": {"style_adjectives": ["skip the wait", "order ahead smart", "no line", "efficient pickup"], "ahead_scenes": ["line contrast", "skip graphic", "breezing past", "phone to pickup"], "camera_styles": ["efficiency contrast", "skip moment", "smart ordering"]}}'::JSONB);


-- ============================================================================
-- FAMILY MEALS TEMPLATES - Instagram Square (3)
-- ============================================================================

-- 19. Family Meal Deal (feeds 4-6)
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('family-sq-meal-deal', 'Family Meal Deal', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing a family meal package. The value and abundance are the heroes.

Scene: A complete family meal spread—enough food for 4-6 people, arranged to show abundance and variety. Options:
- Overhead shot of full spread on family table
- Containers arranged showing everything included
- Family-style serving dishes (not individual plates)
- The "feeds the whole family" visual impact

The quantity is impressive. The variety is clear. The value is obvious.

Value-focused typography:
"{{headline}}"
"FAMILY MEAL"
"FEEDS {{feed_count}}"
{{meal_description}}

INCLUDES:
• {{item1}}
• {{item2}}
• {{item3}}
• {{item4}}

"${{total_price}}"
"{{value_comparison}}"
"{{order_cta}}"

The lighting shows off the abundance—everything looks plentiful and delicious. The vibe is "dinner for the whole family, sorted."

The feeling: One order. Everyone's fed. No stress. Great value.
$PROMPT$,
'v1', TRUE,
'{"style": "abundance_value", "category": "family_meal", "input_schema": {"required": ["headline", "feed_count", "total_price"], "optional": ["meal_description", "item1", "item2", "item3", "item4", "value_comparison", "order_cta"], "defaults": {"meal_description": "Everything you need for family dinner", "item1": "Choice of 2 proteins", "item2": "3 family-size sides", "item3": "Fresh bread or rolls", "item4": "Dessert for the table", "value_comparison": "Over $80 value", "order_cta": "Order for tonight"}}, "variation_rules": {"style_adjectives": ["abundance showcase", "family value", "everyone fed", "no stress dinner"], "meal_displays": ["overhead spread", "containers arranged", "family-style dishes", "quantity impact"], "camera_styles": ["overhead abundance", "spread wide", "value showcase"]}}'::JSONB);

-- 20. Date Night Meal for Two
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('family-sq-date-night', 'Date Night Meal for Two', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing a romantic dinner for two package. Intimate, special, date-night worthy.

Scene: An elegant meal for two, set up for romance. Options:
- Two-person spread on intimate table setting
- Candles, wine glasses, romantic lighting
- "Dinner for two" elegant presentation
- Home date night setup with restaurant-quality food

The presentation is elevated—this is a special occasion, not just dinner.

Romance-focused typography:
"{{headline}}"
"DATE NIGHT IN"
"DINNER FOR TWO"
{{meal_description}}

INCLUDES:
• {{appetizer}}
• {{entree1}}
• {{entree2}}
• {{dessert}}
• {{beverage}}

"${{price}}"
"{{romantic_tagline}}"
"{{order_cta}}"

Warm, romantic lighting. The vibe is "restaurant-quality date night at home."

The feeling: Skip the reservation. Date night at home. Just as special.
$PROMPT$,
'v1', TRUE,
'{"style": "romantic_intimate", "category": "family_meal", "input_schema": {"required": ["headline", "price"], "optional": ["meal_description", "appetizer", "entree1", "entree2", "dessert", "beverage", "romantic_tagline", "order_cta"], "defaults": {"meal_description": "Restaurant-quality romance at home", "appetizer": "Shareable appetizer", "entree1": "His entrée", "entree2": "Her entrée", "dessert": "Dessert to share", "beverage": "Bottle of wine", "romantic_tagline": "No reservation required", "order_cta": "Order your date night"}}, "variation_rules": {"style_adjectives": ["romantic intimate", "date night special", "elevated home dining", "couples focused"], "date_scenes": ["intimate table", "candlelit setting", "elegant presentation", "home romance"], "camera_styles": ["romantic lighting", "intimate spread", "date night mood"]}}'::JSONB);

-- 21. Weekly Family Meal Subscription/Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('family-sq-weekly', 'Weekly Family Meal Special', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting a recurring weekly family meal special. Ritual, convenience, weekly tradition.

Scene: The weekly family meal tradition. Options:
- Calendar/day-of-week visual with family meal
- "Every [Day]" recurring theme
- Family gathered around weekly meal
- Subscription/recurring order concept

The message is "make this your weekly thing."

Weekly ritual typography:
"{{headline}}"
"{{day_name}} FAMILY MEAL"
"EVERY WEEK"
{{meal_description}}

THIS WEEK'S MENU:
• {{item1}}
• {{item2}}
• {{item3}}

"${{weekly_price}}"
"{{subscription_benefit}}"
"{{order_cta}}"

Warm, consistent, reliable energy. The vibe is "your weekly dinner tradition."

The feeling: Make [Day] family meal night. We've got it covered. Every week.
$PROMPT$,
'v1', TRUE,
'{"style": "weekly_tradition", "category": "family_meal", "input_schema": {"required": ["headline", "day_name", "weekly_price"], "optional": ["meal_description", "item1", "item2", "item3", "subscription_benefit", "order_cta"], "defaults": {"meal_description": "A new menu every week", "item1": "Chef''s choice protein", "item2": "Seasonal sides", "item3": "Fresh-baked dessert", "subscription_benefit": "Subscribe & save 15%", "order_cta": "Start your weekly tradition"}}, "variation_rules": {"style_adjectives": ["weekly tradition", "recurring ritual", "family routine", "consistent convenience"], "weekly_scenes": ["calendar visual", "day highlight", "family gathered", "subscription concept"], "camera_styles": ["tradition moment", "weekly ritual", "recurring theme"]}}'::JSONB);

-- ============================================================================
-- FAMILY MEALS TEMPLATES - Instagram Stories (3)
-- ============================================================================

-- 22. "Feed the Family" Weeknight Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('family-story-weeknight', 'Feed the Family Weeknight Push', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for busy weeknight family dinner solution. Relatable, helpful, time-saving.

Background: Busy weeknight energy. Options:
- Clock showing dinner time, family meal ready
- Tired parent energy + easy dinner solution
- Kids at table, family meal arriving
- "Dinner solved" relief moment

The vibe is "we know weeknights are crazy."

Weeknight relief typography:
"{{headline}}"
"{{weeknight_message}}"
"FAMILY DINNER"
"SOLVED"
"{{meal_highlight}}"
"{{feeds_info}}"
"{{price}}"
"{{cta}}"

Warm, relieving energy. The message is "we've got dinner handled."

Space for swipe-up link.

The feeling: Busy weeknight? Family hungry? We've got dinner. You're welcome.
$PROMPT$,
'v1', TRUE,
'{"style": "weeknight_relief", "category": "family_meal", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["weeknight_message", "meal_highlight", "feeds_info", "price", "cta"], "defaults": {"weeknight_message": "Busy night? We''ve got dinner.", "meal_highlight": "Complete family meal ready to go", "feeds_info": "Feeds 4-6", "price": "Starting at $45", "cta": "Order family dinner →"}}, "variation_rules": {"style_adjectives": ["weeknight relief", "busy family", "dinner solved", "time saving"], "weeknight_scenes": ["dinner time clock", "tired parent", "kids waiting", "relief moment"], "camera_styles": ["weeknight mood", "relief energy", "family solution"]}}'::JSONB);

-- 23. Sunday Family Dinner Special
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('family-story-sunday', 'Sunday Family Dinner Special', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story for Sunday family dinner tradition. Special, gathering, end-of-week celebration.

Background: Sunday dinner gathering energy. Options:
- Extended family table setting
- Sunday afternoon relaxed preparation
- Multi-generational gathering implied
- "Sunday dinner" traditional warmth

The vibe is "Sunday dinner is special."

Sunday tradition typography:
"{{headline}}"
"SUNDAY DINNER"
"{{sunday_message}}"
"{{meal_description}}"
"{{gathering_prompt}}"
"{{price}}"
"{{order_deadline}}"
"{{cta}}"

Warm, golden Sunday afternoon light. The energy is "gather the family."

Space for swipe-up link.

The feeling: Sunday dinner tradition. Bring everyone together. We'll handle the food.
$PROMPT$,
'v1', TRUE,
'{"style": "sunday_tradition", "category": "family_meal", "frame_count": 1, "day_specific": "sunday", "input_schema": {"required": ["headline"], "optional": ["sunday_message", "meal_description", "gathering_prompt", "price", "order_deadline", "cta"], "defaults": {"sunday_message": "The whole family, together", "meal_description": "Complete Sunday dinner for the family", "gathering_prompt": "Gather around the table", "price": "Family meals from $55", "order_deadline": "Order by Saturday for Sunday pickup", "cta": "Order Sunday dinner →"}}, "variation_rules": {"style_adjectives": ["Sunday tradition", "family gathering", "end of week", "special occasion"], "sunday_scenes": ["extended family", "afternoon prep", "multi-generational", "traditional warmth"], "camera_styles": ["Sunday light", "gathering mood", "tradition moment"]}}'::JSONB);

-- 24. Family Meal Unboxing/What's Included
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('family-story-unboxing', 'Family Meal Unboxing', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story showing what's included in a family meal. Reveal, abundance, value showcase.

Background: The unboxing/reveal moment. Options:
- Hands opening family meal package
- Items being laid out one by one
- "What's inside" reveal sequence
- Full spread after unboxing

The vibe is "look at all this food!"

Unboxing reveal typography:
"{{headline}}"
"WHAT'S INSIDE"
"OUR FAMILY MEAL"

✓ {{item1}}
✓ {{item2}}
✓ {{item3}}
✓ {{item4}}
✓ {{item5}}

"{{value_statement}}"
"{{feeds_info}}"
"{{cta}}"

Exciting reveal energy. Each item feels like a bonus. The abundance is impressive.

Space for swipe-up link.

The feeling: Look at everything you get! So much food. Such great value.
$PROMPT$,
'v1', TRUE,
'{"style": "unboxing_reveal", "category": "family_meal", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["item1", "item2", "item3", "item4", "item5", "value_statement", "feeds_info", "cta"], "defaults": {"item1": "2 generous proteins", "item2": "3 family-size sides", "item3": "Fresh bread", "item4": "House salad", "item5": "Dessert for everyone", "value_statement": "Over $90 value for $59", "feeds_info": "Feeds 4-6 hungry people", "cta": "Get yours →"}}, "variation_rules": {"style_adjectives": ["unboxing excitement", "reveal moment", "abundance showcase", "value display"], "unboxing_scenes": ["hands opening", "items laid out", "reveal sequence", "full spread"], "camera_styles": ["unboxing moment", "reveal energy", "abundance shot"]}}'::JSONB);


-- ============================================================================
-- CATERING TEMPLATES - Instagram Square (3)
-- ============================================================================

-- 25. Catering Services Overview
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('catering-sq-overview', 'Catering Services Overview', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph promoting catering services. Professional, abundant, event-ready.

Scene: Catering setup that looks impressive and professional. Options:
- Buffet-style spread with chafing dishes and serving equipment
- Boxed lunch/individual meal packages stacked and ready
- Catering trays arranged for pickup
- Event setup in progress (no guests, just the impressive spread)

The scale suggests "we can handle your event." Professional presentation, not home-style.

Professional catering typography:
"{{headline}}"
"CATERING & EVENTS"
{{catering_description}}

PERFECT FOR:
• {{occasion1}}
• {{occasion2}}
• {{occasion3}}

"{{minimum_info}}"
"{{lead_time}}"
"{{contact_cta}}"

The lighting is bright and professional—this is business-ready food service. The vibe is "we've got your event covered."

The feeling: Big event? We scale. Professional quality. Stress-free hosting.
$PROMPT$,
'v1', TRUE,
'{"style": "professional_scale", "category": "catering", "input_schema": {"required": ["headline"], "optional": ["catering_description", "occasion1", "occasion2", "occasion3", "minimum_info", "lead_time", "contact_cta"], "defaults": {"catering_description": "Let us cater your next event", "occasion1": "Office meetings & lunches", "occasion2": "Parties & celebrations", "occasion3": "Corporate events", "minimum_info": "Starting at $15/person", "lead_time": "48-hour advance notice", "contact_cta": "Request a quote today"}}, "variation_rules": {"style_adjectives": ["professional catering", "event-ready", "scalable service", "stress-free hosting"], "catering_displays": ["buffet setup", "boxed lunches", "tray arrangement", "event spread"], "camera_styles": ["professional spread", "scale showcase", "event setup"]}}'::JSONB);

-- 26. Corporate Catering / Office Lunch
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('catering-sq-corporate', 'Corporate Catering & Office Lunch', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph targeting corporate/office catering. Professional, efficient, business-appropriate.

Scene: Office catering setup. Options:
- Conference room with catering spread
- Individual boxed lunches arranged professionally
- Office kitchen/break room catering setup
- Meeting table with catering trays

The setting is clearly BUSINESS—professional, organized, appropriate for work.

Corporate-focused typography:
"{{headline}}"
"CORPORATE CATERING"
{{corporate_description}}

WE OFFER:
• {{service1}}
• {{service2}}
• {{service3}}

"{{pricing_info}}"
"{{delivery_info}}"
"{{corporate_cta}}"

Clean, professional design. The vibe is "we understand business needs."

The feeling: Impress your team. Impress your clients. Professional catering made easy.
$PROMPT$,
'v1', TRUE,
'{"style": "corporate_professional", "category": "catering", "input_schema": {"required": ["headline"], "optional": ["corporate_description", "service1", "service2", "service3", "pricing_info", "delivery_info", "corporate_cta"], "defaults": {"corporate_description": "Fuel your team with great food", "service1": "Individual boxed lunches", "service2": "Buffet-style spreads", "service3": "Breakfast meetings", "pricing_info": "From $12/person", "delivery_info": "Free delivery for orders over $150", "corporate_cta": "Set up a corporate account"}}, "variation_rules": {"style_adjectives": ["corporate professional", "business appropriate", "office ready", "team focused"], "corporate_scenes": ["conference room", "boxed lunches", "break room", "meeting table"], "camera_styles": ["professional setup", "corporate environment", "business catering"]}}'::JSONB);

-- 27. Party/Event Catering Packages
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('catering-sq-party', 'Party & Event Catering Packages', 'all_verticals', 'instagram_square', 'base',
$PROMPT$
Square 1:1 photograph showcasing party/event catering packages. Celebratory, abundant, party-ready.

Scene: Party catering that looks festive and impressive. Options:
- Party spread with decorative elements
- Appetizer platters arranged for a celebration
- Event buffet with party atmosphere
- Catering setup at a celebration venue

The vibe is CELEBRATION—this is party food, not corporate lunch.

Party-focused typography:
"{{headline}}"
"PARTY CATERING"
{{party_description}}

PACKAGES FOR:
• {{package1}}
• {{package2}}
• {{package3}}

"{{guest_range}}"
"{{starting_price}}"
"{{party_cta}}"

Festive, celebratory colors. The energy is "let's party!"

The feeling: Your party, our food. Celebrate without the stress. We've got the catering.
$PROMPT$,
'v1', TRUE,
'{"style": "celebration_festive", "category": "catering", "input_schema": {"required": ["headline"], "optional": ["party_description", "package1", "package2", "package3", "guest_range", "starting_price", "party_cta"], "defaults": {"party_description": "Make your celebration delicious", "package1": "Birthday parties", "package2": "Graduation celebrations", "package3": "Holiday gatherings", "guest_range": "Packages for 10-100+ guests", "starting_price": "Starting at $200", "party_cta": "Plan your party menu"}}, "variation_rules": {"style_adjectives": ["celebration festive", "party ready", "event catering", "gathering focused"], "party_scenes": ["party spread", "appetizer platters", "event buffet", "venue setup"], "camera_styles": ["celebration setup", "party atmosphere", "festive spread"]}}'::JSONB);

-- ============================================================================
-- CATERING TEMPLATES - Instagram Stories (3)
-- ============================================================================

-- 28. "Planning an Event?" Inquiry Push
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('catering-story-inquiry', 'Planning an Event Inquiry', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story prompting catering inquiries. Helpful, inviting, low-pressure.

Background: Event planning energy. Options:
- Calendar/planning visual with catering imagery
- "Big event coming up?" question format
- Event types collage (wedding, corporate, party)
- Catering consultation concept

The vibe is "let us help you plan."

Inquiry-focused typography:
"{{headline}}"
"PLANNING AN EVENT?"
"{{inquiry_message}}"

WE CATER:
{{event_type1}}
{{event_type2}}
{{event_type3}}

"{{consultation_offer}}"
"{{contact_prompt}}"
"{{cta}}"

Inviting, helpful design. The message is "we're here to help, not hard sell."

Space for swipe-up or contact link.

The feeling: Got an event? Let's talk. We make catering easy.
$PROMPT$,
'v1', TRUE,
'{"style": "helpful_inquiry", "category": "catering", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["inquiry_message", "event_type1", "event_type2", "event_type3", "consultation_offer", "contact_prompt", "cta"], "defaults": {"inquiry_message": "Let us handle the food", "event_type1": "Corporate events", "event_type2": "Private parties", "event_type3": "Special occasions", "consultation_offer": "Free catering consultation", "contact_prompt": "Tell us about your event", "cta": "Get a quote →"}}, "variation_rules": {"style_adjectives": ["helpful inquiry", "planning assistance", "low pressure", "consultation focused"], "inquiry_scenes": ["calendar planning", "question format", "event collage", "consultation concept"], "camera_styles": ["planning mood", "inquiry design", "helpful energy"]}}'::JSONB);

-- 29. Catering Menu Highlights
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('catering-story-menu', 'Catering Menu Highlights', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story showcasing catering menu highlights. Appetizing, variety, options showcase.

Background: Catering menu items featured. Options:
- Hero shots of popular catering items
- Menu category showcase (apps, mains, desserts)
- "Most popular" catering selections
- Tray/platter presentations

The focus is on the FOOD—what you can order for your event.

Menu showcase typography:
"{{headline}}"
"CATERING FAVORITES"

{{category1}}: {{item1}}
{{category2}}: {{item2}}
{{category3}}: {{item3}}

"{{customization_note}}"
"{{full_menu_prompt}}"
"{{cta}}"

Appetizing food photography. The variety shows "we have options for everyone."

Space for swipe-up to full menu.

The feeling: Look at this menu. So many options. Your guests will love it.
$PROMPT$,
'v1', TRUE,
'{"style": "menu_showcase", "category": "catering", "frame_count": 1, "input_schema": {"required": ["headline"], "optional": ["category1", "item1", "category2", "item2", "category3", "item3", "customization_note", "full_menu_prompt", "cta"], "defaults": {"category1": "Appetizers", "item1": "Signature platters", "category2": "Mains", "item2": "Chef''s specialties", "category3": "Desserts", "item3": "Sweet endings", "customization_note": "Customize for dietary needs", "full_menu_prompt": "See our full catering menu", "cta": "View menu →"}}, "variation_rules": {"style_adjectives": ["menu showcase", "variety display", "options focused", "appetizing presentation"], "menu_scenes": ["hero food shots", "category showcase", "popular items", "tray presentations"], "camera_styles": ["food hero", "menu variety", "appetizing display"]}}'::JSONB);

-- 30. Catering Testimonial/Success Story
INSERT INTO creative_prompt_templates (slug, name, restaurant_vertical, campaign_channel, prompt_section, prompt_body, prompt_version, is_active, metadata)
VALUES ('catering-story-testimonial', 'Catering Success Story', 'all_verticals', 'instagram_story', 'base',
$PROMPT$
Vertical 9:16 Instagram Story featuring catering success/testimonial. Social proof, trust-building, real results.

Background: Successful catering event imagery. Options:
- Event photo with catering spread (no identifiable faces)
- Quote/testimonial graphic treatment
- Before/after: empty table → catered spread
- "Another successful event" celebration

The message is "we've done this before, successfully."

Testimonial typography:
"{{headline}}"

"{{testimonial_quote}}"
— {{testimonial_source}}

"{{event_type}}"
"{{guest_count}}"

"{{success_stat}}"
"{{trust_message}}"
"{{cta}}"

Trustworthy, professional design. The social proof builds confidence.

Space for swipe-up link.

The feeling: Don't just take our word for it. See what others say. We deliver.
$PROMPT$,
'v1', TRUE,
'{"style": "social_proof", "category": "catering", "frame_count": 1, "input_schema": {"required": ["headline", "testimonial_quote", "testimonial_source"], "optional": ["event_type", "guest_count", "success_stat", "trust_message", "cta"], "defaults": {"event_type": "Corporate Event", "guest_count": "150 guests", "success_stat": "500+ events catered", "trust_message": "Trusted by local businesses", "cta": "Book your event →"}}, "variation_rules": {"style_adjectives": ["social proof", "testimonial trust", "success story", "real results"], "testimonial_scenes": ["event photo", "quote graphic", "before after", "success celebration"], "camera_styles": ["testimonial design", "trust building", "success showcase"]}}'::JSONB);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Templates: 30
-- 
-- DELIVERY (10):
--   Square: we-deliver, app-promo, radius, partnership, hours
--   Story: tired, free, lunch, tracking, weather
--
-- TAKEOUT (8):
--   Square: tuesday, curbside, online, bundle
--   Story: ready, lunch, weekend, ahead
--
-- FAMILY MEALS (6):
--   Square: meal-deal, date-night, weekly
--   Story: weeknight, sunday, unboxing
--
-- CATERING (6):
--   Square: overview, corporate, party
--   Story: inquiry, menu, testimonial
-- ============================================================================
