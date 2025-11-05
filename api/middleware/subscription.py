"""
Subscription Tier Enforcement Middleware
Ensures users can only access features for their tier
"""
from fastapi import Depends, HTTPException, status
from typing import List, Optional
import logging
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)

# Feature definitions by tier
TIER_FEATURES = {
    "free": {
        "max_analyses_per_month": 5,
        "max_competitors_per_analysis": 3,
        "max_reviews_per_competitor": 50,
        "features": ["basic_analysis", "competitor_discovery", "basic_insights"]
    },
    "premium": {
        "max_analyses_per_month": -1,  # Unlimited
        "max_competitors_per_analysis": 5,
        "max_reviews_per_competitor": 150,
        "features": ["basic_analysis", "competitor_discovery", "basic_insights", 
                    "strategic_insights", "evidence_reviews", "market_intelligence"]
    },
    "enterprise": {
        "max_analyses_per_month": -1,  # Unlimited
        "max_competitors_per_analysis": 10,
        "max_reviews_per_competitor": 300,
        "features": ["basic_analysis", "competitor_discovery", "basic_insights", 
                    "strategic_insights", "evidence_reviews", "market_intelligence",
                    "custom_reports", "api_access", "priority_support"]
    }
}


async def get_user_subscription_info(user_id: str) -> dict:
    """Get user's current subscription information"""
    try:
        service_client = get_supabase_service_client()
        
        result = service_client.rpc('get_user_subscription_details', {
            'target_user_id': user_id
        }).execute()
        
        if not result.data or len(result.data) == 0:
            # Default to free tier if no subscription found
            return {
                "subscription_tier": "free",
                "is_active": True,
                "features": TIER_FEATURES["free"]["features"]
            }
        
        details = result.data[0]
        tier = details.get("subscription_tier", "free")
        
        return {
            "subscription_tier": tier,
            "is_active": details.get("is_active", True),
            "features": TIER_FEATURES.get(tier, TIER_FEATURES["free"])["features"]
        }
        
    except Exception as e:
        logger.error(f"Failed to get subscription info for user {user_id}: {e}")
        # Default to free tier on error
        return {
            "subscription_tier": "free",
            "is_active": True,
            "features": TIER_FEATURES["free"]["features"]
        }


def require_subscription_tier(required_tier: str):
    """
    Decorator to require minimum subscription tier
    
    Args:
        required_tier: Minimum tier required ("free", "premium", "enterprise")
    """
    async def check_tier(current_user: str = Depends(get_current_user)):
        subscription_info = await get_user_subscription_info(current_user)
        
        if not subscription_info["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Subscription is not active"
            )
        
        user_tier = subscription_info["subscription_tier"]
        tier_hierarchy = ["free", "premium", "enterprise"]
        
        required_level = tier_hierarchy.index(required_tier)
        user_level = tier_hierarchy.index(user_tier) if user_tier in tier_hierarchy else 0
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"This feature requires {required_tier} tier. Current tier: {user_tier}"
            )
        
        return {
            "user_id": current_user,
            "subscription_tier": user_tier,
            "subscription_info": subscription_info
        }
    
    return check_tier


def require_feature(feature_name: str):
    """
    Decorator to require specific feature access
    
    Args:
        feature_name: Feature name to check
    """
    async def check_feature(current_user: str = Depends(get_current_user)):
        subscription_info = await get_user_subscription_info(current_user)
        
        if not subscription_info["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Subscription is not active"
            )
        
        if feature_name not in subscription_info["features"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Feature '{feature_name}' not available in your subscription tier"
            )
        
        return {
            "user_id": current_user,
            "subscription_tier": subscription_info["subscription_tier"],
            "subscription_info": subscription_info
        }
    
    return check_feature


async def check_usage_limits(user_id: str, operation: str) -> bool:
    """
    Check if user has exceeded usage limits for their tier
    Uses atomic database function to prevent race conditions
    
    Args:
        user_id: User ID
        operation: Operation type:
            - 'invoice_upload'
            - 'free_analysis'
            - 'menu_comparison'
            - 'menu_upload'
            - 'premium_analysis'
        
    Returns:
        True if within limits, False if exceeded
        
    Raises:
        HTTPException: If limit exceeded with details
    """
    try:
        from services.usage_limit_service import get_usage_limit_service
        
        usage_service = get_usage_limit_service()
        
        # Check limit (atomic, race-condition safe)
        allowed, details = usage_service.check_limit(user_id, operation)
        
        if not allowed:
            # Format user-friendly error message
            reset_date = details.get('reset_date', 'unknown')
            current = details.get('current_usage', 0)
            limit = details.get('limit_value', 0)
            tier = details.get('subscription_tier', 'free')
            
            error_messages = {
                'invoice_upload': f"You've reached your free tier limit of {limit} invoice upload(s) per week (plus 2 bonus per month). Resets: {reset_date}. Upgrade to Premium for unlimited uploads.",
                'free_analysis': f"You've reached your free tier limit of {limit} free analyses per week. Resets: {reset_date}. Upgrade to Premium for unlimited analyses.",
                'menu_comparison': f"You've reached your free tier limit of {limit} menu comparison per week. Resets: {reset_date}. Upgrade to Premium for unlimited comparisons.",
                'menu_upload': f"You've reached your free tier limit of {limit} menu upload per week. Resets: {reset_date}. Upgrade to Premium for unlimited uploads.",
                'premium_analysis': f"You've reached your free tier limit of {limit} premium analysis per week. Resets: {reset_date}. Upgrade to Premium for unlimited analyses."
            }
            
            error_message = error_messages.get(
                operation,
                f"Usage limit exceeded. {details.get('message', '')} Upgrade to Premium for unlimited access."
            )
            
            logger.warning(
                f"Usage limit exceeded: user={user_id}, operation={operation}, "
                f"usage={current}/{limit}, reset={reset_date}"
            )
            
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    'error': 'usage_limit_exceeded',
                    'message': error_message,
                    'current_usage': current,
                    'limit': limit,
                    'reset_date': reset_date,
                    'subscription_tier': tier,
                    'upgrade_url': '/pricing'
                }
            )
        
        logger.info(f"Usage check passed: user={user_id}, operation={operation}")
        return True
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking usage limits: {e}")
        # Fail closed - deny access on error to prevent abuse
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify usage limits. Please try again."
        )


# Convenience dependencies
require_premium = require_subscription_tier("premium")
require_enterprise = require_subscription_tier("enterprise")

# Feature-specific dependencies
require_strategic_insights = require_feature("strategic_insights")
require_market_intelligence = require_feature("market_intelligence")
require_api_access = require_feature("api_access")