import redis
import time
from fastapi import HTTPException, Request, Depends, status
from api.config import REDIS_URL, RATE_LIMIT_FREE_TIER, RATE_LIMIT_PRO_TIER, RATE_LIMIT_WINDOW_MINUTES
from api.middleware.auth import get_current_user_optional
from typing import Optional

# Redis client
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

class RateLimitExceeded(HTTPException):
    def __init__(self, retry_after: int):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

def get_user_tier(user_id: Optional[str]) -> str:
    """
    Get user subscription tier (simplified - expand based on your user model)
    """
    if user_id:
        # TODO: Query user tier from database
        # For now, default to pro tier for authenticated users
        return "pro"
    return "free"

def get_rate_limit(tier: str) -> int:
    """Get rate limit for user tier"""
    return RATE_LIMIT_PRO_TIER if tier == "pro" else RATE_LIMIT_FREE_TIER

async def check_rate_limit(
    request: Request,
    user_id: Optional[str] = Depends(get_current_user_optional)
):
    """
    Check rate limit for the current user/endpoint combination
    """
    try:
        # Determine user tier
        tier = get_user_tier(user_id)
        limit = get_rate_limit(tier)

        # Create rate limit key
        # Format: rate_limit:{tier}:{user_id}:{endpoint}:{window}
        endpoint = request.url.path
        window_start = int(time.time() // 60)  # 1-minute windows
        key = f"rate_limit:{tier}:{user_id or 'anonymous'}:{endpoint}:{window_start}"

        # Check current count
        current_count = redis_client.get(key)

        if current_count is None:
            # First request in this window
            redis_client.setex(key, 60, 1)  # Set to expire in 60 seconds
            return  # Allow request

        current_count = int(current_count)

        if current_count >= limit:
            # Rate limit exceeded
            retry_after = 60 - (int(time.time()) % 60)  # Seconds until next window
            raise RateLimitExceeded(retry_after)

        # Increment counter
        redis_client.incr(key)

    except redis.RedisError:
        # If Redis is down, allow request but log warning
        # In production, you might want to fail closed instead
        print("WARNING: Redis rate limiting unavailable")
        return

# Rate limit decorator for specific endpoints
def rate_limit(limit: int = None, window_minutes: int = None):
    """
    Decorator to apply rate limiting to specific endpoints
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Get request object from kwargs
            request = kwargs.get('request')
            if request:
                # Apply rate limiting logic here
                user_id = kwargs.get('current_user')
                tier = get_user_tier(user_id)
                endpoint_limit = limit or get_rate_limit(tier)

                # Use the check_rate_limit function
                await check_rate_limit(request, user_id)

            return await func(*args, **kwargs)
        return wrapper
    return decorator
