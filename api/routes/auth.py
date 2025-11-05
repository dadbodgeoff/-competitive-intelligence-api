from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import TYPE_CHECKING
import logging
from api.schemas.auth_schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest
)
from api.middleware.auth import create_jwt_token, get_current_user
from api.config import COOKIE_SECURE
from database.supabase_client import get_supabase_client
from services.error_sanitizer import ErrorSanitizer, sanitize_auth_error

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from supabase import Client

router = APIRouter()

@router.post("/register")
async def register_user(
    user_data: UserRegister,
    response: Response,
    supabase = Depends(get_supabase_client)
):
    """
    Register a new user with Supabase Auth and set httpOnly cookies
    """
    try:
        logger.info(f"🔵 Registration attempt for email: {user_data.email}")
        
        # Register user with Supabase Auth
        logger.info(f"🔵 Calling Supabase sign_up...")
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name
                }
            }
        })
        logger.info(f"🔵 Supabase sign_up completed. User: {auth_response.user is not None}")

        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed"
            )

        user = auth_response.user
        user_id = user.id
        logger.info(f"✅ Auth user created with ID: {user_id}")
        
        # Manually create user profile in public.users table (fallback if trigger fails)
        try:
            logger.info(f"🔵 Attempting to create user profile in public.users...")
            from database.supabase_client import get_supabase_service_client
            service_client = get_supabase_service_client()
            result = service_client.table("users").insert({
                "id": user_id,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "subscription_tier": "free",
                "is_active": True
            }).execute()
            logger.info(f"✅ User profile created successfully: {result.data}")
        except Exception as profile_error:
            # Log but don't fail registration if profile already exists
            logger.warning(f"⚠️ User profile creation warning: {type(profile_error).__name__}: {profile_error}")
            import traceback
            logger.warning(f"⚠️ Traceback: {traceback.format_exc()}")

        # Create JWT token for immediate login
        jwt_token = create_jwt_token(user_id)

        # Set httpOnly cookies
        response.set_cookie(
            key="access_token",
            value=jwt_token,
            httponly=True,
            secure=COOKIE_SECURE,  # Environment-based: True in production
            samesite="lax",  # Changed from strict to lax for Edge compatibility
            max_age=86400,
            path="/"
        )
        
        if auth_response.session and auth_response.session.refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=auth_response.session.refresh_token,
                httponly=True,
                secure=COOKIE_SECURE,  # Environment-based: True in production
                samesite="lax",  # Changed from strict to lax for Edge compatibility
                max_age=604800,
                path="/api/v1/auth"
            )

        # Return user data only
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": getattr(user.user_metadata, 'first_name', None),
                "last_name": getattr(user.user_metadata, 'last_name', None),
                "subscription_tier": "free",
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None
            },
            "message": "Registration successful"
        }

    except Exception as e:
        logger.error(f"❌ Registration failed: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise ErrorSanitizer.create_http_exception(
            e,
            status_code=status.HTTP_400_BAD_REQUEST,
            user_message="Registration failed. Please check your information and try again."
        )

@router.post("/login")
async def login_user(
    credentials: UserLogin,
    response: Response,
    supabase = Depends(get_supabase_client)
):
    """
    Login user with Supabase Auth and set httpOnly cookies
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })

        if auth_response.user is None or auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = auth_response.user
        user_id = user.id

        # Fetch subscription tier from public.users table using service client to bypass RLS
        subscription_tier = "free"  # Default
        try:
            from database.supabase_client import get_supabase_service_client
            service_client = get_supabase_service_client()
            user_profile = service_client.table("users").select("subscription_tier").eq("id", user_id).execute()
            if user_profile.data and len(user_profile.data) > 0:
                subscription_tier = user_profile.data[0].get("subscription_tier", "free")
                logger.debug(f"Fetched subscription tier for {user_id}: {subscription_tier}")
        except Exception as e:
            logger.warning(f"Failed to fetch subscription tier for user {user_id}: {e}")
            # Continue with default 'free' tier

        # Create JWT token
        jwt_token = create_jwt_token(user_id)

        # Set httpOnly cookies (secure authentication)
        response.set_cookie(
            key="access_token",
            value=jwt_token,
            httponly=True,
            secure=COOKIE_SECURE,  # Environment-based: True in production
            samesite="lax",  # Changed from strict to lax for Edge compatibility
            max_age=86400,  # 24 hours
            path="/"
        )
        
        response.set_cookie(
            key="refresh_token",
            value=auth_response.session.refresh_token if auth_response.session else "",
            httponly=True,
            secure=COOKIE_SECURE,  # Environment-based: True in production
            samesite="lax",  # Changed from strict to lax for Edge compatibility
            max_age=604800,  # 7 days
            path="/api/v1/auth"  # Only accessible to auth endpoints
        )

        # Return user data only (NO TOKENS in response body for security)
        response_data = {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": getattr(user.user_metadata, 'first_name', None),
                "last_name": getattr(user.user_metadata, 'last_name', None),
                "subscription_tier": subscription_tier,
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None
            },
            "message": "Login successful"
        }
        logger.debug(f"Login successful for user {user_id}, cookies set")
        return response_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@router.post("/logout")
async def logout_user(
    response: Response,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Logout user and clear httpOnly cookies
    """
    try:
        # Sign out from Supabase
        supabase.auth.sign_out()
    except Exception:
        # Continue even if Supabase logout fails
        pass

    # Clear httpOnly cookies
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")

    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: str = Depends(get_current_user)
):
    """
    Get current user profile information
    """
    try:
        # Get service client for admin API access
        from database.supabase_client import get_supabase_service_client
        supabase = get_supabase_service_client()
        
        # Get user from Supabase Auth admin API
        user_response = supabase.auth.admin.get_user_by_id(current_user)

        if user_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = user_response.user

        # Fetch subscription tier from public.users table using service client to bypass RLS
        subscription_tier = "free"  # Default
        try:
            from database.supabase_client import get_supabase_service_client
            service_client = get_supabase_service_client()
            user_profile = service_client.table("users").select("subscription_tier").eq("id", current_user).execute()
            if user_profile.data and len(user_profile.data) > 0:
                subscription_tier = user_profile.data[0].get("subscription_tier", "free")
        except Exception as e:
            logger.warning(f"Failed to fetch subscription tier for user {current_user}: {e}")
            # Continue with default 'free' tier

        # Extract user metadata (it's a dict, not an object)
        user_metadata = user.user_metadata or {}
        
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user_metadata.get('first_name'),
            last_name=user_metadata.get('last_name'),
            subscription_tier=subscription_tier,
            created_at=user.created_at.isoformat() if user.created_at else None
        )

    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            user_message="Failed to retrieve user profile. Please try again."
        )

@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    supabase = Depends(get_supabase_client)
):
    """
    Refresh access token using refresh token from httpOnly cookie
    """
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token found"
        )
    
    try:
        # Refresh session with Supabase
        auth_response = supabase.auth.refresh_session(refresh_token)
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = auth_response.user.id
        
        # Create new JWT access token
        new_jwt = create_jwt_token(user_id)
        
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=new_jwt,
            httponly=True,
            secure=COOKIE_SECURE,  # Environment-based: True in production
            samesite="lax",  # Changed from strict to lax for Edge compatibility
            max_age=86400,  # 24 hours
            path="/"
        )
        
        # Update refresh token if Supabase provided a new one
        if auth_response.session.refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=auth_response.session.refresh_token,
                httponly=True,
                secure=COOKIE_SECURE,  # Environment-based: True in production
                samesite="lax",  # Changed from strict to lax for Edge compatibility
                max_age=604800,  # 7 days
                path="/api/v1/auth"
            )
        
        return {"message": "Token refreshed successfully"}
    
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e,
            status_code=status.HTTP_401_UNAUTHORIZED,
            user_message="Session refresh failed. Please log in again."
        )
