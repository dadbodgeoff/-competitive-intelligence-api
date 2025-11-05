#!/usr/bin/env python3
"""
Subscription Management API Routes
Handles user subscription tier management (simulates post-payment flow)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_service_client
from services.error_sanitizer import ErrorSanitizer

logger = logging.getLogger(__name__)
router = APIRouter(tags=["subscription"])

# Request/Response Models
class SubscriptionStatus(BaseModel):
    user_id: str
    email: str
    subscription_tier: str
    started_at: str
    expires_at: Optional[str] = None
    is_active: bool
    payment_provider: str

class SubscriptionUpgradeRequest(BaseModel):
    user_email: str
    new_tier: str
    reason: Optional[str] = "Manual upgrade"

class SubscriptionHistoryItem(BaseModel):
    id: str
    previous_tier: Optional[str]
    new_tier: str
    change_reason: Optional[str]
    changed_at: str

class TierInfo(BaseModel):
    name: str
    cost_per_analysis: float
    competitors_analyzed: int
    insights_provided: str
    features: List[str]
    use_cases: List[str]

@router.get("/status", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user: str = Depends(get_current_user)
):
    """
    Get current user's subscription status
    """
    try:
        service_client = get_supabase_service_client()
        
        # Get user details using the helper function
        result = service_client.rpc('get_user_subscription_details', {
            'target_user_id': current_user
        }).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User subscription details not found"
            )
        
        details = result.data[0]
        
        return SubscriptionStatus(
            user_id=details['user_id'],
            email=details['email'],
            subscription_tier=details['subscription_tier'],
            started_at=details['started_at'],
            expires_at=details['expires_at'],
            is_active=details['is_active'],
            payment_provider=details['payment_provider']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get subscription status for user {current_user}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription status"
        )

@router.get("/history")
async def get_subscription_history(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page (max 100)"),
    current_user: str = Depends(get_current_user)
):
    """
    Get user's subscription change history with pagination
    
    Query params:
    - page: Page number (1-indexed, default 1)
    - per_page: Results per page (1-100, default 50)
    
    Returns:
    - data: List of subscription history items
    - pagination: Metadata (page, per_page, total_count, total_pages, has_next, has_prev)
    """
    try:
        service_client = get_supabase_service_client()
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Get total count
        count_result = service_client.table("subscription_history")\
            .select("*", count="exact")\
            .eq("user_id", current_user)\
            .execute()
        total_count = count_result.count if hasattr(count_result, 'count') else 0
        
        # Get paginated data
        history = service_client.table("subscription_history")\
            .select("*")\
            .eq("user_id", current_user)\
            .order("changed_at", desc=True)\
            .range(offset, offset + per_page - 1)\
            .execute()
        
        # Format data
        data = [
            {
                "id": item['id'],
                "previous_tier": item.get('previous_tier'),
                "new_tier": item['new_tier'],
                "change_reason": item.get('change_reason'),
                "changed_at": item['changed_at']
            }
            for item in history.data
        ]
        
        # Calculate pagination metadata
        total_pages = (total_count + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return {
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev,
                "next_page": page + 1 if has_next else None,
                "prev_page": page - 1 if has_prev else None
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get subscription history for user {current_user}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription history"
        )

@router.get("/tiers", response_model=dict)
async def get_available_tiers(current_user: str = Depends(get_current_user)):
    """
    Get information about available subscription tiers
    """
    return {
        "tiers": {
            "free": TierInfo(
                name="Free Tier",
                cost_per_analysis=0.11,
                competitors_analyzed=3,
                insights_provided="3-4 focused insights",
                features=[
                    "Competitor strengths/weaknesses",
                    "Actionable recommendations",
                    "Proof quotes from reviews",
                    "Confidence scoring",
                    "Basic threat/opportunity identification"
                ],
                use_cases=[
                    "Monthly competitive monitoring",
                    "Quick competitor check",
                    "Basic market awareness"
                ]
            ),
            "premium": TierInfo(
                name="Premium Tier",
                cost_per_analysis=0.35,
                competitors_analyzed=5,
                insights_provided="25 strategic insights (5 per competitor)",
                features=[
                    "Everything in Free tier, PLUS:",
                    "5 strategic insights per competitor",
                    "150 reviews collected per competitor",
                    "35 evidence reviews per competitor",
                    "Strategic business intelligence",
                    "Competitive threat assessment",
                    "Market opportunity analysis",
                    "Operational excellence insights"
                ],
                use_cases=[
                    "Strategic business planning",
                    "Competitive positioning",
                    "Market expansion decisions",
                    "Investment planning",
                    "Operational improvements"
                ]
            )
        },
        "upgrade_benefits": {
            "more_competitors": "5 vs 3 competitors analyzed",
            "deeper_insights": "3x more strategic recommendations",
            "evidence_reviews": "35 reviews per competitor for validation",
            "market_intelligence": "Identify underserved market segments",
            "competitive_moat": "Build lasting competitive advantages"
        }
    }

@router.post("/admin/upgrade")
async def admin_upgrade_user(
    upgrade_request: SubscriptionUpgradeRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Admin endpoint to upgrade a user's subscription
    NOTE: In production, this should be restricted to admin users only
    For now, this simulates the post-payment subscription upgrade flow
    """
    try:
        service_client = get_supabase_service_client()
        
        # Validate tier
        if upgrade_request.new_tier not in ["free", "premium", "enterprise"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tier: {upgrade_request.new_tier}. Must be 'free', 'premium', or 'enterprise'"
            )
        
        # Get target user ID by email
        auth_user = service_client.table("users")\
            .select("id")\
            .eq("email", upgrade_request.user_email)\
            .execute()
        
        if not auth_user.data:
            # Try auth.users table
            from supabase import create_client
            import os
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
            admin_client = create_client(supabase_url, supabase_key)
            
            # Search by email in auth.users
            users = admin_client.auth.admin.list_users()
            target_user = None
            for user in users:
                if user.email == upgrade_request.user_email:
                    target_user = user
                    break
            
            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User not found with email: {upgrade_request.user_email}"
                )
            
            target_user_id = target_user.id
        else:
            target_user_id = auth_user.data[0]['id']
        
        # Use the database function to update subscription
        service_client.rpc('update_user_subscription_tier', {
            'target_user_id': target_user_id,
            'new_tier': upgrade_request.new_tier,
            'admin_user_id': current_user,
            'reason': upgrade_request.reason
        }).execute()
        
        logger.info(f"User {upgrade_request.user_email} upgraded to {upgrade_request.new_tier} by {current_user}")
        
        return {
            "success": True,
            "message": f"Successfully upgraded {upgrade_request.user_email} to {upgrade_request.new_tier}",
            "user_email": upgrade_request.user_email,
            "new_tier": upgrade_request.new_tier
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upgrade user {upgrade_request.user_email}: {e}")
        raise ErrorSanitizer.create_http_exception(
            e,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            user_message="Failed to upgrade subscription. Please contact support."
        )

@router.post("/admin/downgrade")
async def admin_downgrade_user(
    downgrade_request: SubscriptionUpgradeRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Admin endpoint to downgrade a user's subscription
    NOTE: In production, this should be restricted to admin users only
    """
    # Reuse the upgrade logic since it's the same function
    return await admin_upgrade_user(downgrade_request, current_user)
