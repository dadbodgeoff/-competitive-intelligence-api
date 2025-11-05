-- Simple fix: Make the trigger not fail auth user creation
-- Run this in Supabase SQL Editor

-- Drop and recreate the function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Try to insert into public.users, but don't fail if it errors
    BEGIN
        INSERT INTO public.users (
            id, 
            first_name, 
            last_name,
            subscription_tier,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            'free',
            true,
            NOW(),
            NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error but don't fail the trigger
            RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    END;
    
    -- Always return NEW so auth user creation succeeds
    RETURN NEW;
END;
$$;

-- Verify it exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
