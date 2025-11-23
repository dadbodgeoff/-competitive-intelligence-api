"""
Usage Limits API Routes
Centralized endpoints for checking usage limits
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
import logging

from services.usage_limit_service import get_usage_limit_service
from api.middleware.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/usage", tags=["usage-limits"])

usage_service = get_usage_limit_service()


@router.get("/check/{operation_type}")
async def check_usage_limit(
    operation_type: str,
    current_user: str = Depends(get_current_user)
):
    """
    Check if user can perform a specific operation
    
    Path params:
        operation_type: One of:
            - invoice_upload
            - free_analysis
            - menu_comparison
            - menu_upload
            - premium_analysis
    
    Returns:
        {
            "success": true,
            "allowed": bool,
            "current_usage": int,
            "limit": int,
            "reset_date": str,
            "message": str,
            "subscription_tier": str
        }
    """
    valid_types = [
        'invoice_upload',
        'free_analysis',
        'menu_comparison',
        'menu_upload',
        'premium_analysis',
        'image_generation'
    ]
    
    if operation_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid operation type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        allowed, details = usage_service.check_limit(current_user, operation_type)
        
        return JSONResponse({
            "success": True,
            "allowed": allowed,
            "current_usage": details['current_usage'],
            "limit": details['limit_value'],
            "reset_date": details['reset_date'],
            "message": details['message'],
            "subscription_tier": details['subscription_tier']
        })
        
    except Exception as e:
        logger.error(f"Failed to check usage limit: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/summary")
async def get_usage_summary(
    current_user: str = Depends(get_current_user)
):
    """
    Get complete usage summary for current user
    
    Returns:
        {
            "subscription_tier": str,
            "unlimited": bool,
            "weekly": {
                "invoice_uploads": {"used": int, "limit": int, "reset_date": str},
                "free_analyses": {"used": int, "limit": int, "reset_date": str},
                "menu_comparisons": {"used": int, "limit": int, "reset_date": str},
                "menu_uploads": {"used": int, "limit": int, "reset_date": str},
                "premium_analyses": {"used": int, "limit": int, "reset_date": str}
            },
            "monthly": {
                "bonus_invoices": {"used": int, "limit": int, "reset_date": str}
            }
        }
    """
    try:
        summary = usage_service.get_usage_summary(current_user)
        
        if 'error' in summary:
            return JSONResponse({
                "success": False,
                "error": summary['error']
            }, status_code=500)
        
        return JSONResponse(summary)
        
    except Exception as e:
        logger.error(f"Failed to get usage summary: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/history")
async def get_usage_history(
    operation_type: str = None,
    limit: int = 100,
    current_user: str = Depends(get_current_user)
):
    """
    Get usage history (audit trail) for current user
    
    Query params:
        operation_type: Filter by operation type (optional)
        limit: Max records to return (default: 100)
    
    Returns:
        {
            "success": true,
            "history": [
                {
                    "timestamp": str,
                    "operation_type": str,
                    "operation_id": str,
                    "subscription_tier": str,
                    "metadata": dict
                }
            ]
        }
    """
    try:
        history = usage_service.get_usage_history(
            user_id=current_user,
            operation_type=operation_type,
            limit=min(limit, 1000)  # Cap at 1000
        )
        
        return JSONResponse({
            "success": True,
            "history": history
        })
        
    except Exception as e:
        logger.error(f"Failed to get usage history: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
