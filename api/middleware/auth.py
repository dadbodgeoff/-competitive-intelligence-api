from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, NamedTuple
import jwt
from datetime import datetime, timedelta
from api.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS
from database.supabase_client import get_supabase_client, get_supabase_service_client

security = HTTPBearer()

class AuthenticatedUser(NamedTuple):
    id: str
    account_id: str
    role: str

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

        user_id: Optional[str] = payload.get("sub")
        account_id: Optional[str] = payload.get("acc")
        role: Optional[str] = payload.get("role")
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

        if not account_id or not role:
            try:
                service_client = get_supabase_service_client()
                user_profile = service_client.table("public.users").select(
                    "primary_account_id, default_account_role"
                ).eq("id", user_id).limit(1).execute()
                if user_profile.data:
                    account_id = user_profile.data[0].get("primary_account_id")
                    role = user_profile.data[0].get("default_account_role", "member")
            except Exception:
                account_id = account_id or ""
                role = role or "member"

        if not account_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No account associated with this user"
            )

        auth_context = AuthenticatedUser(
            id=user_id,
            account_id=account_id,
            role=role or "member"
        )
        request.state.auth_context = auth_context
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

def create_jwt_token(user_id: str, account_id: str, role: str) -> str:
    """
    Create a JWT token for the user
    """
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "acc": account_id,
        "role": role
    }

    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def get_auth_context(request: Request) -> AuthenticatedUser:
    """
    Retrieve the authenticated user context that includes account and role.
    """
    auth_context = getattr(request.state, "auth_context", None)
    if not auth_context:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication context is missing"
        )
    return auth_context


async def get_current_membership(
    request: Request,
    _: str = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    FastAPI dependency that provides the authenticated user with account context.
    """
    return get_auth_context(request)
