-- Final fix: Update function to properly handle RLS and permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert into public.users with explicit error handling
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
    )
    ON CONFLICT (id) DO NOTHING;  -- Don't fail if user already exists
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE WARNING 'Failed to create user profile for % (error: %)', NEW.id, SQLERRM;
        -- Still return NEW so auth user creation succeeds
        RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;

-- Verify function
SELECT proname, prosecdef, proconfig FROM pg_proc WHERE proname = 'handle_new_user';
