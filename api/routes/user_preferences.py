"""
User Preferences API Routes
Handles user inventory preference management
Pattern: Follows api/routes/inventory_operations.py structure
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List

from services.user_preferences_service import UserPreferencesService
from api.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/preferences", tags=["user-preferences"])

preferences_service = UserPreferencesService()


# Pydantic models
class PreferencesUpdate(BaseModel):
    default_waste_buffers: Optional[Dict[str, float]] = None
    low_stock_threshold_days: Optional[float] = None
    price_increase_alert_percent: Optional[float] = None
    preferred_weight_unit: Optional[str] = None
    preferred_volume_unit: Optional[str] = None
    show_unit_conversions: Optional[bool] = None
    group_by_vendor: Optional[bool] = None
    default_category_order: Optional[List[str]] = None
    hidden_categories: Optional[List[str]] = None


@router.get("/")
async def get_preferences(
    current_user: str = Depends(get_current_user)
):
    """
    Get user's inventory preferences
    
    Creates default preferences if none exist
    """
    try:
        prefs = preferences_service.get_preferences(current_user)
        
        return JSONResponse({
            "success": True,
            "preferences": prefs
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.put("/")
async def update_preferences(
    updates: PreferencesUpdate,
    current_user: str = Depends(get_current_user)
):
    """
    Update user's inventory preferences
    
    Only provided fields will be updated
    """
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = updates.dict(exclude_none=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=400,
                detail="No updates provided"
            )
        
        updated_prefs = preferences_service.update_preferences(
            current_user,
            update_dict
        )
        
        return JSONResponse({
            "success": True,
            "preferences": updated_prefs,
            "message": "Preferences updated successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/reset")
async def reset_preferences(
    current_user: str = Depends(get_current_user)
):
    """
    Reset user preferences to defaults
    """
    try:
        reset_prefs = preferences_service.reset_to_defaults(current_user)
        
        return JSONResponse({
            "success": True,
            "preferences": reset_prefs,
            "message": "Preferences reset to defaults"
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/waste-buffer/{category}")
async def get_waste_buffer(
    category: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get waste buffer for specific category
    
    Returns percentage as decimal (1.0 = 100%, 1.8 = 180%)
    """
    try:
        buffer = preferences_service.get_waste_buffer(current_user, category)
        
        return JSONResponse({
            "success": True,
            "category": category,
            "waste_buffer": float(buffer),
            "waste_buffer_percent": float(buffer * 100)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/alert-threshold")
async def get_alert_threshold(
    current_user: str = Depends(get_current_user)
):
    """
    Get low stock alert threshold
    
    Returns threshold in days
    """
    try:
        threshold = preferences_service.get_alert_threshold(current_user)
        
        return JSONResponse({
            "success": True,
            "threshold_days": float(threshold)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/defaults")
async def get_defaults():
    """
    Get default preference values
    
    No authentication required - returns system defaults
    """
    return JSONResponse({
        "success": True,
        "defaults": {
            "waste_buffers": preferences_service.DEFAULT_WASTE_BUFFERS,
            "low_stock_threshold_days": 3.0,
            "price_increase_alert_percent": 5.0,
            "preferred_weight_unit": "lb",
            "preferred_volume_unit": "ga",
            "show_unit_conversions": True,
            "group_by_vendor": False,
            "category_order": preferences_service.DEFAULT_CATEGORY_ORDER
        }
    })
