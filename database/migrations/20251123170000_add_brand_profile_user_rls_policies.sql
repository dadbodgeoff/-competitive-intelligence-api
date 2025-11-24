-- Migration: Add User-Level RLS Policies for Brand Profiles
-- Description: Allows users to manage their own account's brand profiles
-- Date: 2025-11-23

-- Drop existing service-role-only policy (we'll keep it but add user policies)
-- The service role policy allows backend to manage profiles on behalf of users

-- Add user-level policies for direct access

-- Policy 1: Users can view brand profiles for their accounts
CREATE POLICY "users_view_own_brand_profiles" ON creative_brand_profiles
    FOR SELECT
    USING (
        account_id IN (
            SELECT account_id FROM account_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 2: Users can create brand profiles for their accounts
CREATE POLICY "users_create_brand_profiles" ON creative_brand_profiles
    FOR INSERT
    WITH CHECK (
        account_id IN (
            SELECT account_id FROM account_members 
            WHERE user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Policy 3: Users can update brand profiles for their accounts
CREATE POLICY "users_update_brand_profiles" ON creative_brand_profiles
    FOR UPDATE
    USING (
        account_id IN (
            SELECT account_id FROM account_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        account_id IN (
            SELECT account_id FROM account_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 4: Users can delete brand profiles for their accounts
CREATE POLICY "users_delete_brand_profiles" ON creative_brand_profiles
    FOR DELETE
    USING (
        account_id IN (
            SELECT account_id FROM account_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add comment explaining the policy structure
COMMENT ON POLICY "users_view_own_brand_profiles" ON creative_brand_profiles IS 
    'Allows users to view brand profiles for accounts they belong to';
COMMENT ON POLICY "users_create_brand_profiles" ON creative_brand_profiles IS 
    'Allows users to create brand profiles for accounts they belong to';
COMMENT ON POLICY "users_update_brand_profiles" ON creative_brand_profiles IS 
    'Allows users to update brand profiles for accounts they belong to';
COMMENT ON POLICY "users_delete_brand_profiles" ON creative_brand_profiles IS 
    'Allows users to delete brand profiles for accounts they belong to';

