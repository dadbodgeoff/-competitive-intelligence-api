from datetime import datetime
import asyncio
import logging
from typing import TYPE_CHECKING
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from api.schemas.auth_schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest
)
from api.middleware.auth import create_jwt_token, get_current_user, get_auth_context
from api.config import COOKIE_SECURE
from database.supabase_client import get_supabase_client
from services.error_sanitizer import ErrorSanitizer, sanitize_auth_error
from services.demo_seed_service import demo_seed_service
from services.account_service import AccountService

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from supabase import Client

router = APIRouter()

@router.post("/register")
async def register_user(
    background_tasks: BackgroundTasks,
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
                },
                "email_redirect_to": "https://restaurantiq.us/dashboard"
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
        
        from database.supabase_client import get_supabase_service_client
        service_client = get_supabase_service_client()

        # Create user profile in public.users table (fallback if trigger fails)
        profile_payload = {
            "id": user_id,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "subscription_tier": "free",
            "is_active": True
        }
        try:
            logger.info("🔵 Ensuring public.users profile exists...")
            service_client.table("users").upsert(profile_payload).execute()
        except Exception as profile_error:
            logger.warning("⚠️ User profile upsert warning: %s: %s", type(profile_error).__name__, profile_error)

        account_service = AccountService()
        invite_token = (user_data.invite_token or "").strip() or None
        module_access = []
        account_role = "owner"
        account_id = None
        seed_demo_dataset = False

        if invite_token:
            logger.info("🔵 Invite token detected for %s; joining existing account.", user.email)
            try:
                account_id, account_role = account_service.activate_invitation_by_token(
                    invite_token,
                    user_id=user_id,
                    email=user.email,
                )
            except ValueError as exc:
                logger.error("❌ Invitation activation failed for %s: %s", user.email, exc)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(exc),
                )
            module_access = account_service.get_account_module_access(account_id)
        else:
            # Create an account and assign ownership
            account_name = (f"{user_data.first_name or ''} {user_data.last_name or ''}").strip() or user.email.split("@")[0]
            logger.info("🔵 Creating tenant account for new owner: %s", account_name)

            account_result = None
            account_creation_error = None
            for attempt in range(3):
                try:
                    account_result = service_client.rpc(
                        "create_account_with_owner",
                        {
                            "p_owner_user_id": user_id,
                            "p_account_name": account_name
                        }
                    ).execute()
                    break
                except Exception as exc:  # pylint: disable=broad-except
                    account_creation_error = exc
                    message = str(exc)
                    # Allow Supabase a moment to finish persisting auth.users
                    if "accounts_owner_user_id_fkey" in message and attempt < 2:
                        logger.warning("⏳ Account creation race detected for %s, retrying...", user.email)
                        await asyncio.sleep(0.5)
                        continue
                    raise

            account_id = None
            if account_result is not None:
                if isinstance(account_result.data, str):
                    account_id = account_result.data
                elif isinstance(account_result.data, list) and account_result.data:
                    account_id = account_result.data[0]

            if not account_id:
                logger.error("❌ Failed to create account for user %s: %s", user_id, account_creation_error)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to initialize account"
                )

            module_access = account_service.get_account_module_access(account_id)
            seed_demo_dataset = True

        # Create JWT token for immediate login
        jwt_token = create_jwt_token(user_id, account_id, account_role)

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

        # Schedule demo dataset seeding in the background (best-effort)
        if seed_demo_dataset:
            try:
                background_tasks.add_task(demo_seed_service.seed_user, user_id)
            except Exception as exc:  # pylint: disable=broad-except
                logger.warning("Demo seed scheduling failed for %s: %s", user_id, exc)

        # Return user data only
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": getattr(user.user_metadata, 'first_name', None),
                "last_name": getattr(user.user_metadata, 'last_name', None),
                "subscription_tier": "free",
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
                "account_id": account_id,
                "account_role": account_role,
                "module_access": module_access
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
        logger.info(f"🔵 Login attempt for email: {credentials.email}")
        # Log Supabase URL being used (without exposing full key)
        from api.config import SUPABASE_URL
        logger.debug(f"🔵 Connecting to Supabase: {SUPABASE_URL}")
        
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })

        if auth_response.user is None or auth_response.session is None:
            logger.warning(f"⚠️ Login failed: auth_response.user or session is None")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = auth_response.user
        user_id = user.id
        logger.info(f"✅ Supabase authentication successful for user {user_id}")

        # Fetch subscription tier and account context
        subscription_tier = "free"  # Default
        account_id = None
        account_role = "member"
        module_access = []
        try:
            from database.supabase_client import get_supabase_service_client
            service_client = get_supabase_service_client()
            user_profile = service_client.table("users").select("subscription_tier").eq("id", user_id).execute()
            if user_profile.data and len(user_profile.data) > 0:
                subscription_tier = user_profile.data[0].get("subscription_tier", "free")
                logger.debug(f"Fetched subscription tier for {user_id}: {subscription_tier}")

            profile_context = service_client.table("users").select(
                "primary_account_id, default_account_role"
            ).eq("id", user_id).limit(1).execute()
            if profile_context.data:
                account_id = profile_context.data[0].get("primary_account_id")
                account_role = profile_context.data[0].get("default_account_role", "member")

            account_service = AccountService()

            if not account_id:
                membership = service_client.table("account_members").select(
                    "account_id, role"
                ).eq("user_id", user_id).eq("status", "active").limit(1).execute()
                if membership.data:
                    account_id = membership.data[0]["account_id"]
                    account_role = membership.data[0]["role"]
                else:
                    invite_token = (credentials.invite_token or "").strip() or None
                    if invite_token:
                        try:
                            account_id, account_role = account_service.activate_invitation_by_token(
                                invite_token,
                                user_id=user_id,
                                email=user.email,
                            )
                        except ValueError as exc:
                            logger.warning("Invitation token activation failed for %s: %s", user.email, exc)
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=str(exc),
                            )
                    if not account_id:
                        try:
                            activation = account_service.activate_pending_invitation_by_email(user.email, user_id)
                        except ValueError as exc:
                            logger.warning("Pending invitation activation failed for %s: %s", user.email, exc)
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=str(exc),
                            )
                        if activation:
                            account_id, account_role = activation

            if account_id:
                module_access = account_service.get_account_module_access(account_id)
            else:
                logger.warning("⚠️ No account found for user %s", user_id)
        except Exception as e:
            logger.warning(f"Failed to fetch account context for user {user_id}: {e}")
            # Continue with default 'free' tier

        if not account_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account context unavailable"
            )

        # Create JWT token
        jwt_token = create_jwt_token(user_id, account_id, account_role)

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
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
                "account_id": account_id,
                "account_role": account_role,
                "module_access": module_access
            },
            "message": "Login successful"
        }
        logger.info(f"✅ Login successful for user {user_id}, cookies set")
        return response_data

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the actual error for debugging
        logger.error(f"❌ Login failed: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        
        # Check if it's a Supabase-specific error
        error_message = str(e).lower()
        if "network" in error_message or "connection" in error_message or "timeout" in error_message:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable. Please try again."
            )
        elif "invalid" in error_message and "credentials" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        else:
            # Generic error - don't expose details to user
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
    request: Request,
    user_id: str = Depends(get_current_user)
):
    """
    Get current user profile information
    """
    try:
        # Get service client for admin API access
        from database.supabase_client import get_supabase_service_client
        supabase = get_supabase_service_client()
        
        # Get user from Supabase Auth admin API
        user_response = supabase.auth.admin.get_user_by_id(user_id)

        if user_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = user_response.user

        # Fetch subscription tier from public.users table using service client to bypass RLS
        subscription_tier = "free"  # Default
        account_id = None
        account_role = "member"
        module_access = []
        try:
            from database.supabase_client import get_supabase_service_client
            service_client = get_supabase_service_client()
            user_profile = service_client.table("users").select(
                "subscription_tier, primary_account_id, default_account_role"
            ).eq("id", user_id).limit(1).execute()
            if user_profile.data and len(user_profile.data) > 0:
                profile_row = user_profile.data[0]
                subscription_tier = profile_row.get("subscription_tier", "free")
                account_id = profile_row.get("primary_account_id")
                account_role = profile_row.get("default_account_role", "member")

            if not account_id:
                membership = service_client.table("account_members").select(
                    "account_id, role"
                ).eq("user_id", user_id).eq("status", "active").limit(1).execute()
                if membership.data:
                    account_id = membership.data[0].get("account_id")
                    account_role = membership.data[0].get("role", "member")

            if account_id:
                module_access_response = service_client.table("account_module_access").select(
                    "module_slug, can_access"
                ).eq("account_id", account_id).execute()
                module_access = module_access_response.data or []
        except Exception as e:
            logger.warning(f"Failed to fetch subscription tier or account context for user {user_id}: {e}")
            # Continue with default 'free' tier

        if not account_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account context unavailable"
            )

        # Extract user metadata (it's a dict, not an object)
        user_metadata = user.user_metadata or {}
        
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user_metadata.get('first_name'),
            last_name=user_metadata.get('last_name'),
            subscription_tier=subscription_tier,
            created_at=user.created_at.isoformat() if user.created_at else None,
            account_id=account_id,
            account_role=account_role,
            module_access=module_access
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
        
        # Fetch account context
        from database.supabase_client import get_supabase_service_client
        service_client = get_supabase_service_client()
        account_id = None
        account_role = "member"
        try:
            profile_context = service_client.table("users").select(
                "primary_account_id, default_account_role"
            ).eq("id", user_id).limit(1).execute()
            if profile_context.data:
                account_id = profile_context.data[0].get("primary_account_id")
                account_role = profile_context.data[0].get("default_account_role", "member")
            if not account_id:
                membership = service_client.table("account_members").select(
                    "account_id, role"
                ).eq("user_id", user_id).eq("status", "active").limit(1).execute()
                if membership.data:
                    account_id = membership.data[0].get("account_id")
                    account_role = membership.data[0].get("role", "member")
        except Exception as fetch_err:
            logger.warning("Failed to fetch account context during refresh for %s: %s", user_id, fetch_err)

        if not account_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account context unavailable"
            )

        # Create new JWT access token
        new_jwt = create_jwt_token(user_id, account_id, account_role)
        
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
