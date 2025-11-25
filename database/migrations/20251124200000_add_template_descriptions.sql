-- ============================================================================
-- MIGRATION: Add User-Friendly Template Descriptions
-- ============================================================================
-- Description : Adds description and use_case columns to templates so users
--               can easily understand what each template creates.
-- Author      : Kiro
-- Date        : 2025-11-24
-- ============================================================================

-- Add new columns for user-friendly descriptions
ALTER TABLE creative_prompt_templates
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS use_case TEXT,
    ADD COLUMN IF NOT EXISTS best_for TEXT[];

COMMENT ON COLUMN creative_prompt_templates.description IS 'User-friendly description of what image this template creates';
COMMENT ON COLUMN creative_prompt_templates.use_case IS 'Primary use case (e.g., Instagram Post, Menu Board, Weekly Special)';
COMMENT ON COLUMN creative_prompt_templates.best_for IS 'Array of scenarios this template works well for';

-- Update existing pizza templates with descriptions
UPDATE creative_prompt_templates SET
    description = 'A dramatic bar scene with cocktails and pizza on a tray, featuring a rustic chalkboard menu with your pairings and prices.',
    use_case = 'Instagram Post',
    best_for = ARRAY['Happy Hour Promos', 'Drink Pairings', 'Bar Menu']
WHERE slug = 'cocktail_pizza_pairings';

UPDATE creative_prompt_templates SET
    description = 'Stacked pizza boxes in golden sunlight with your featured pizza on top, chalk marker specials on the box lid, and a QR code.',
    use_case = 'Delivery App Hero',
    best_for = ARRAY['Delivery Promos', 'Weekend Specials', 'App Listings']
WHERE slug = 'pizza_box_stack_special';

UPDATE creative_prompt_templates SET
    description = 'A cozy pizzeria scene with a wood-fired oven glow, featuring your daily specials on a rustic chalkboard.',
    use_case = 'Instagram Post',
    best_for = ARRAY['Daily Specials', 'Atmosphere Shots', 'Brand Building']
WHERE slug LIKE '%daily_special%' OR slug LIKE '%wood_fired%';

UPDATE creative_prompt_templates SET
    description = 'Mouthwatering close-up of your signature pizza with perfect cheese pull and fresh toppings.',
    use_case = 'Menu Photo',
    best_for = ARRAY['Menu Items', 'Food Photography', 'Social Media']
WHERE slug LIKE '%hero%' OR slug LIKE '%signature%';

UPDATE creative_prompt_templates SET
    description = 'Family-style pizza spread on a rustic table, perfect for showcasing your party or catering options.',
    use_case = 'Catering Promo',
    best_for = ARRAY['Party Packages', 'Catering', 'Family Deals']
WHERE slug LIKE '%family%' OR slug LIKE '%party%';

UPDATE creative_prompt_templates SET
    description = 'Seasonal holiday-themed pizza scene with festive decorations and your special holiday menu.',
    use_case = 'Holiday Promo',
    best_for = ARRAY['Holiday Specials', 'Seasonal Menu', 'Limited Time Offers']
WHERE slug LIKE '%holiday%' OR slug LIKE '%winter%' OR slug LIKE '%christmas%';

UPDATE creative_prompt_templates SET
    description = 'Eye-catching promotional image with bold typography announcing your special offer or discount.',
    use_case = 'Promo Graphic',
    best_for = ARRAY['Flash Sales', 'Discounts', 'Limited Time Offers']
WHERE slug LIKE '%promo%' OR slug LIKE '%deal%' OR slug LIKE '%discount%';

UPDATE creative_prompt_templates SET
    description = 'Professional event announcement with your event details beautifully displayed.',
    use_case = 'Event Announcement',
    best_for = ARRAY['Live Music', 'Special Events', 'Grand Openings']
WHERE slug LIKE '%event%' OR slug LIKE '%live%' OR slug LIKE '%music%';

UPDATE creative_prompt_templates SET
    description = 'Hiring announcement with a welcoming restaurant atmosphere and your job details.',
    use_case = 'Hiring Post',
    best_for = ARRAY['Job Postings', 'Team Building', 'Recruitment']
WHERE slug LIKE '%hiring%' OR slug LIKE '%job%' OR slug LIKE '%career%';

UPDATE creative_prompt_templates SET
    description = 'Customer review highlight with appetizing food imagery and your best testimonial.',
    use_case = 'Social Proof',
    best_for = ARRAY['Reviews', 'Testimonials', 'Reputation Building']
WHERE slug LIKE '%review%' OR slug LIKE '%testimonial%';

-- Set default description for any templates without one
UPDATE creative_prompt_templates SET
    description = 'Professional restaurant marketing image customized with your details.',
    use_case = 'Marketing',
    best_for = ARRAY['Social Media', 'Marketing']
WHERE description IS NULL;
