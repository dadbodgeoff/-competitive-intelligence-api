-- Seed a demo user and account for landing page demos
-- This allows the creative generation to work without authentication

-- Create demo user in auth.users first (if using Supabase auth)
-- Note: This assumes you're using Supabase. Adjust if using different auth.
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
)
VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'demo@restaurantiq.com',
    crypt('demo-password-not-for-login', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Demo User"}'::jsonb,
    false,
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Create demo account with owner_user_id
INSERT INTO accounts (id, owner_user_id, name, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Demo Account',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create account membership for demo user
INSERT INTO account_members (
    account_id,
    user_id,
    role,
    status,
    invited_by,
    invited_at,
    joined_at,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'owner',
    'active',
    '00000000-0000-0000-0000-000000000002'::uuid,
    NOW(),
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (account_id, user_id) DO UPDATE
SET role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Link demo user to demo account via account_members (already done by create_account_with_owner)
-- The public.users table doesn't have email or subscription_tier columns
-- Update the public.users profile if it exists
INSERT INTO users (id, primary_account_id, default_account_role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'owner',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET primary_account_id = EXCLUDED.primary_account_id,
    default_account_role = EXCLUDED.default_account_role,
    updated_at = NOW();

-- Initialize usage limits for demo user (set high limits)
INSERT INTO user_usage_limits (
    user_id,
    account_id,
    weekly_invoice_uploads,
    weekly_free_analyses,
    weekly_reset_date,
    monthly_bonus_invoices,
    monthly_reset_date,
    weekly_menu_comparisons,
    weekly_menu_uploads,
    weekly_premium_analyses,
    weekly_image_generations,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    0,
    0,
    NOW() + INTERVAL '7 days',
    0,
    NOW() + INTERVAL '28 days',
    0,
    0,
    0,
    0,  -- Start at 0, will increment with each demo
    NOW(),
    NOW()
)
ON CONFLICT (account_id, user_id) DO NOTHING;

-- Create a default brand profile for demo
INSERT INTO creative_brand_profiles (
    id,
    account_id,
    user_id,
    brand_name,
    palette,
    is_default,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Demo Restaurant',
    '{"primary":"#10b981"}'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;
