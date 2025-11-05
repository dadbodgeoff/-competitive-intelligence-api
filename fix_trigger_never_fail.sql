-- FINAL FIX: Make trigger never fail auth user creation
-- This ensures registration always succeeds even if profile creation fails

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    v_error_message text;
BEGIN
    -- Wrap everything in a BEGIN/EXCEPTION block
    BEGIN
        -- Try to insert into public.users
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
        ON CONFLICT (id) DO NOTHING;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Capture error but don't re-raise it
            GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
            RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, v_error_message;
            -- Continue execution - don't fail the trigger
    END;
    
    -- ALWAYS return NEW so auth user creation succeeds
    RETURN NEW;
END;
$$;

-- Verify the function was updated
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    provolatile as volatility
FROM pg_proc 
WHERE proname = 'handle_new_user';
