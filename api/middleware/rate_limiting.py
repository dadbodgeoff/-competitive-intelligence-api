"""
Rate Limiting Middleware
Prevents abuse of expensive operations like LLM parsing
"""
import time
from typing import Dict, Optional, Callable
from fastapi import HTTPException, status, Request, Depends
from collections import defaultdict, deque
from functools import wraps
import inspect
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """In-memory rate limiter for expensive operations with tier-based limits"""
    
    def __init__(self):
        # Store request timestamps per user per operation
        self.requests: Dict[str, Dict[str, deque]] = defaultdict(lambda: defaultdict(deque))
        
        # Tier-based rate limits
        self.tier_limits = {
            "free": {
                "invoice_parse": {
                    "max_concurrent": 2,
                    "max_per_hour": 10,
                    "max_per_day": 20  # 20 invoices per day for free tier
                },
                "menu_parse": {
                    "max_concurrent": 1,
                    "max_per_hour": 2,
                    "max_per_day": 3  # 3 menus per day for free tier
                },
                "analysis": {
                    "max_concurrent": 1,
                    "max_per_hour": 2,
                    "max_per_week": 2  # 2 reviews per week for free tier
                },
                "menu_comparison": {
                    "max_concurrent": 1,
                    "max_per_hour": 1,
                    "max_per_day": 2  # 2 menu comparisons per day for free tier
                }
            },
            "premium": {
                "invoice_parse": {
                    "max_concurrent": 5,
                    "max_per_hour": 50,
                    "max_per_day": 200  # 200 invoices per day
                },
                "menu_parse": {
                    "max_concurrent": 3,
                    "max_per_hour": 20,
                    "max_per_day": 50  # 50 menus per day
                },
                "analysis": {
                    "max_concurrent": 3,
                    "max_per_hour": 20,
                    "max_per_week": -1  # Unlimited reviews for premium
                },
                "menu_comparison": {
                    "max_concurrent": 3,
                    "max_per_hour": 10,
                    "max_per_day": 50  # 50 comparisons per day
                }
            },
            "enterprise": {
                "invoice_parse": {
                    "max_concurrent": 10,
                    "max_per_hour": -1,  # Unlimited
                    "max_per_day": -1
                },
                "menu_parse": {
                    "max_concurrent": 10,
                    "max_per_hour": -1,
                    "max_per_day": -1
                },
                "analysis": {
                    "max_concurrent": 10,
                    "max_per_hour": -1,
                    "max_per_week": -1
                },
                "menu_comparison": {
                    "max_concurrent": 10,
                    "max_per_hour": -1,
                    "max_per_day": -1
                }
            }
        }
        
        # Track concurrent operations
        self.concurrent: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    
    def check_rate_limit(self, user_id: str, operation: str, user_tier: str = "free") -> bool:
        """
        Check if user can perform operation based on their subscription tier
        
        Args:
            user_id: User ID
            operation: Operation type
            user_tier: User's subscription tier (free, premium, enterprise)
            
        Returns:
            True if allowed, False if rate limited
        """
        # Get limits for user's tier
        if user_tier not in self.tier_limits:
            user_tier = "free"  # Default to free tier
        
        tier_config = self.tier_limits[user_tier]
        if operation not in tier_config:
            return True  # No limits defined for this operation
        
        limits = tier_config[operation]
        current_time = time.time()
        
        # Check concurrent limit
        if self.concurrent[user_id][operation] >= limits["max_concurrent"]:
            logger.warning(f"User {user_id} ({user_tier}) hit concurrent limit for {operation}")
            return False
        
        # Clean old requests (older than 7 days for weekly limits)
        user_requests = self.requests[user_id][operation]
        week_ago = current_time - (7 * 24 * 3600)
        while user_requests and user_requests[0] < week_ago:
            user_requests.popleft()
        
        # Check per-hour limit
        if "max_per_hour" in limits and limits["max_per_hour"] != -1:
            hour_ago = current_time - 3600
            hour_requests = sum(1 for req_time in user_requests if req_time > hour_ago)
            if hour_requests >= limits["max_per_hour"]:
                logger.warning(f"User {user_id} ({user_tier}) hit per-hour limit for {operation}")
                return False
        
        # Check per-day limit
        if "max_per_day" in limits and limits["max_per_day"] != -1:
            day_ago = current_time - (24 * 3600)
            day_requests = sum(1 for req_time in user_requests if req_time > day_ago)
            if day_requests >= limits["max_per_day"]:
                logger.warning(f"User {user_id} ({user_tier}) hit per-day limit for {operation}")
                return False
        
        # Check per-week limit
        if "max_per_week" in limits and limits["max_per_week"] != -1:
            week_requests = len(user_requests)  # Already cleaned old requests above
            if week_requests >= limits["max_per_week"]:
                logger.warning(f"User {user_id} ({user_tier}) hit per-week limit for {operation}")
                return False
        
        return True
    
    def record_request(self, user_id: str, operation: str):
        """Record a new request"""
        current_time = time.time()
        self.requests[user_id][operation].append(current_time)
        self.concurrent[user_id][operation] += 1
    
    def release_request(self, user_id: str, operation: str):
        """Release a concurrent slot"""
        if self.concurrent[user_id][operation] > 0:
            self.concurrent[user_id][operation] -= 1
    
    def get_limits_info(self, user_id: str, operation: str, user_tier: str = "free") -> Dict:
        """Get current usage info for user"""
        if user_tier not in self.tier_limits:
            user_tier = "free"
        
        tier_config = self.tier_limits[user_tier]
        if operation not in tier_config:
            return {}
        
        limits = tier_config[operation]
        current_time = time.time()
        
        # Clean old requests
        user_requests = self.requests[user_id][operation]
        week_ago = current_time - (7 * 24 * 3600)
        while user_requests and user_requests[0] < week_ago:
            user_requests.popleft()
        
        hour_ago = current_time - 3600
        hour_requests = sum(1 for req_time in user_requests if req_time > hour_ago)
        
        day_ago = current_time - (24 * 3600)
        day_requests = sum(1 for req_time in user_requests if req_time > day_ago)
        
        week_requests = len(user_requests)
        
        info = {
            "operation": operation,
            "tier": user_tier,
            "concurrent_used": self.concurrent[user_id][operation],
            "concurrent_limit": limits["max_concurrent"]
        }
        
        if "max_per_hour" in limits:
            info["hour_used"] = hour_requests
            info["hour_limit"] = limits["max_per_hour"]
        
        if "max_per_day" in limits:
            info["day_used"] = day_requests
            info["day_limit"] = limits["max_per_day"]
        
        if "max_per_week" in limits:
            info["week_used"] = week_requests
            info["week_limit"] = limits["max_per_week"]
        
        return info


# Global rate limiter instance
rate_limiter = RateLimiter()


async def get_user_tier(user_id: str) -> str:
    """Get user's subscription tier from database"""
    try:
        from database.supabase_client import get_supabase_service_client
        service_client = get_supabase_service_client()
        
        result = service_client.table("users").select("subscription_tier").eq(
            "id", user_id
        ).single().execute()
        
        if result.data:
            return result.data.get("subscription_tier", "free")
        return "free"
    except Exception as e:
        logger.error(f"Failed to get user tier: {e}")
        return "free"  # Default to free tier on error


def check_rate_limit(operation: str):
    """
    Dependency to check rate limits
    
    Args:
        operation: Operation type to check
    """
    async def _check_limit(request: Request):
        # Extract user ID from request (assumes auth middleware ran first)
        user_id = getattr(request.state, 'user_id', None)
        if not user_id:
            # If no user ID, allow request (auth will handle it)
            return
        
        # Get user's subscription tier
        user_tier = await get_user_tier(user_id)
        
        if not rate_limiter.check_rate_limit(user_id, operation, user_tier):
            limits_info = rate_limiter.get_limits_info(user_id, operation, user_tier)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "operation": operation,
                    "limits": limits_info,
                    "retry_after": 3600  # Suggest retry after 1 hour
                }
            )
        
        # Record the request
        rate_limiter.record_request(user_id, operation)
        
        # Store operation info for cleanup
        request.state.rate_limit_operation = operation
        request.state.rate_limit_user_id = user_id
    
    return _check_limit


def release_rate_limit(request: Request):
    """Release rate limit slot (call this after operation completes)"""
    operation = getattr(request.state, 'rate_limit_operation', None)
    user_id = getattr(request.state, 'rate_limit_user_id', None)
    
    if operation and user_id:
        rate_limiter.release_request(user_id, operation)


# Convenience dependencies
check_invoice_parse_limit = check_rate_limit("invoice_parse")
check_menu_parse_limit = check_rate_limit("menu_parse")
check_analysis_limit = check_rate_limit("analysis")


def rate_limit(operation: str):
    """
    Decorator for rate limiting endpoints with tier-based limits
    
    Usage:
        @router.post("/expensive-operation")
        @rate_limit("analysis")
        async def expensive_operation(...):
            pass
    
    Args:
        operation: Operation type to rate limit
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from kwargs
            request = kwargs.get('request')
            if not request:
                # Try to find request in args (must be starlette.requests.Request, not Pydantic models)
                for arg in args:
                    if isinstance(arg, Request) and hasattr(arg, 'state'):
                        request = arg
                        break
            
            if not request:
                logger.warning(f"Rate limit decorator: No request found for {func.__name__}")
                return await func(*args, **kwargs)
            
            # Extract user ID from request state (set by auth middleware)
            user_id = getattr(request.state, 'user_id', None) if hasattr(request, 'state') else None
            
            # If no user_id in state, try to get from current_user parameter
            if not user_id and 'current_user' in kwargs:
                user_id = kwargs['current_user']
            
            if not user_id:
                logger.warning(f"Rate limit: No user_id found for {func.__name__}")
                return await func(*args, **kwargs)
            
            # Get user's subscription tier
            user_tier = await get_user_tier(user_id)
            
            # Check rate limit
            if not rate_limiter.check_rate_limit(user_id, operation, user_tier):
                limits_info = rate_limiter.get_limits_info(user_id, operation, user_tier)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "operation": operation,
                        "limits": limits_info,
                        "retry_after": 3600  # Suggest retry after 1 hour
                    }
                )
            
            # Record the request
            rate_limiter.record_request(user_id, operation)
            
            try:
                # Execute the function
                result = await func(*args, **kwargs)
                return result
            finally:
                # Release the concurrent slot
                rate_limiter.release_request(user_id, operation)
        
        try:
            wrapper.__signature__ = inspect.signature(func)
        except (ValueError, TypeError):
            pass

        return wrapper
    return decorator