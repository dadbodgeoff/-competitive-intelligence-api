from fastapi import APIRouter, Depends, HTTPException, status
from typing import TYPE_CHECKING
from api.schemas.auth_schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest
)
from api.middleware.auth import create_jwt_token, get_current_user
from database.supabase_client import get_supabase_client

if TYPE_CHECKING:
    from supabase import Client

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register_user(
    user_data: UserRegister,
    supabase = Depends(get_supabase_client)
):
    """
    Register a new user with Supabase Auth and create user profile
    """
    try:
        # Register user with Supabase Auth
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

        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed"
            )

        user_id = auth_response.user.id

        # Create JWT token for immediate login
        jwt_token = create_jwt_token(user_id)

        return TokenResponse(
            access_token=jwt_token,
            expires_in=86400  # 24 hours
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login_user(
    credentials: UserLogin,
    supabase = Depends(get_supabase_client)
):
    """
    Login user with Supabase Auth and return JWT token with user info
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

        # Create JWT token
        jwt_token = create_jwt_token(user_id)

        # Return token with user info
        response_data = {
            "access_token": jwt_token,
            "token_type": "bearer",
            "expires_in": 86400,
            "refresh_token": auth_response.session.refresh_token if auth_response.session else None,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": getattr(user.user_metadata, 'first_name', None),
                "last_name": getattr(user.user_metadata, 'last_name', None),
                "subscription_tier": "free",
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None
            }
        }
        print(f"🔵 LOGIN RESPONSE: {response_data}")
        return response_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@router.post("/logout")
async def logout_user(
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Logout user (invalidate session on Supabase side)
    """
    try:
        # Sign out from Supabase
        supabase.auth.sign_out()

        return {"message": "Successfully logged out"}

    except Exception as e:
        # Even if Supabase logout fails, we consider it successful
        # since JWT tokens are stateless
        return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get current user profile information
    """
    try:
        # Get user from Supabase Auth admin API
        user_response = supabase.auth.admin.get_user_by_id(current_user)

        if user_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user = user_response.user

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=getattr(user.user_metadata, 'first_name', None),
            last_name=getattr(user.user_metadata, 'last_name', None),
            subscription_tier="free",  # Default tier
            created_at=user.created_at.isoformat() if user.created_at else None
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )
