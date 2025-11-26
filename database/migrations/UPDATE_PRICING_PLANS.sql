-- ============================================================================
-- UPDATE PRICING PLANS TO $99/MONTH
-- Run this after the billing migration to set correct pricing
-- ============================================================================

-- Update Premium Monthly to $99
UPDATE pricing_plans 
SET 
    amount_cents = 9900,
    description = 'For serious operators who want unlimited access',
    features = '["Unlimited invoice uploads", "50 AI image generations/month", "Unlimited competitor analyses", "Unlimited menu comparisons", "Priority support", "Data export (CSV, PDF)"]'::jsonb,
    updated_at = NOW()
WHERE plan_slug = 'premium_monthly';

-- Update Premium Yearly to $950 (save ~20%)
UPDATE pricing_plans 
SET 
    amount_cents = 95000,
    description = 'Save 20% with annual billing',
    features = '["Everything in Premium", "2 months free", "Annual billing"]'::jsonb,
    updated_at = NOW()
WHERE plan_slug = 'premium_yearly';

-- Update Enterprise to $299
UPDATE pricing_plans 
SET 
    amount_cents = 29900,
    description = 'For multi-unit operators and groups',
    features = '["Everything in Premium", "Unlimited AI generations", "Team permissions & audit logs", "Multi-location support", "Dedicated onboarding", "API access & custom integrations"]'::jsonb,
    updated_at = NOW()
WHERE plan_slug = 'enterprise_monthly';

-- Verify the updates
SELECT plan_slug, plan_name, amount_cents, amount_cents/100 as price_dollars, interval 
FROM pricing_plans 
ORDER BY display_order;
