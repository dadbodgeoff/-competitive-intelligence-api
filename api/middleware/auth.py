from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from datetime import datetime, timedelta
from api.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS
from database.supabase_client import get_supabase_client

security = HTTPBearer()

async def get_current_user(
    request: Request,
    supabase = Depends(get_supabase_client)
):
    """
    Extract and validate JWT token from httpOnly cookie or Authorization header
    Supports both methods for backwards compatibility during migration
    """
    token = None
    
    # DEBUG: Log all cookies received
    print(f"🍪 Cookies received: {list(request.cookies.keys())}")
    print(f"🔍 Cookie values: {dict(request.cookies)}")
    
    # Try cookie first (new secure method)
    token = request.cookies.get("access_token")
    print(f"🎫 Access token from cookie: {'Found' if token else 'NOT FOUND'}")
    
    # Fallback to Authorization header (old method - for backwards compatibility)
    if not token:
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            print(f"🎫 Access token from header: Found")
    
    if not token:
        print(f"❌ NO TOKEN FOUND - Returning 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        # Verify token expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )

        # Optional: Verify user still exists in Supabase
        try:
            user = supabase.auth.admin.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
        except Exception:
            # If we can't verify with Supabase, still accept the token
            # (for offline scenarios)
            pass

        return user_id

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

async def get_current_user_optional(
    request: Request,
    supabase = Depends(get_supabase_client)
) -> Optional[str]:
    """
    Try to get current user, but don't require authentication
    """
    try:
        # Extract token from header
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            return None

        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        return user_id

    except (jwt.PyJWTError, IndexError):
        return None

def create_jwt_token(user_id: str) -> str:
    """
    Create a JWT token for the user
    """
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }

    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt
