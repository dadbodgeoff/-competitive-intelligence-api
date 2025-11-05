"""
Alert Management API Routes
Endpoints for price alerts and savings opportunities
Pattern: Follows api/routes/price_analytics.py structure
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import logging

from api.middleware.auth import get_current_user
from services.alert_management_service import AlertManagementService
from services.alert_generation_service import AlertGenerationService
from services.user_preferences_service import UserPreferencesService
from services.error_sanitizer import ErrorSanitizer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


# Request models
class DismissAlertRequest(BaseModel):
    alert_key: str
    alert_type: str


class UpdateThresholdsRequest(BaseModel):
    price_alert_threshold_7day: Optional[float] = None
    price_alert_threshold_28day: Optional[float] = None
    price_drop_alert_threshold_7day: Optional[float] = None
    price_drop_alert_threshold_28day: Optional[float] = None


@router.get("/price-increases")
async def get_price_increase_alerts(
    current_user: str = Depends(get_current_user)
):
    """Get price increase alerts based on user thresholds"""
    try:
        # Get user thresholds
        prefs_service = UserPreferencesService()
        prefs = prefs_service.get_preferences(current_user)
        
        thresholds = {
            'increase_7day': prefs.get('price_alert_threshold_7day', 10.0),
            'increase_28day': prefs.get('price_alert_threshold_28day', 15.0),
            'decrease_7day': prefs.get('price_drop_alert_threshold_7day', 10.0),
            'decrease_28day': prefs.get('price_drop_alert_threshold_28day', 15.0)
        }
        
        # Generate alerts
        alert_gen_service = AlertGenerationService()
        alerts = alert_gen_service.generate_alerts_with_thresholds(current_user, thresholds)
        
        # Get dismissed alerts
        alert_mgmt_service = AlertManagementService()
        dismissed = alert_mgmt_service.get_dismissed_alerts(current_user, 'price_increase')
        
        # Filter out dismissed
        active_alerts = [a for a in alerts['negative_alerts'] if a['alert_key'] not in dismissed]
        
        return {
            'alerts': active_alerts,
            'total_count': len(active_alerts),
            'thresholds': thresholds
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch price increase alerts"
        )


@router.get("/savings-opportunities")
async def get_savings_opportunities(
    current_user: str = Depends(get_current_user)
):
    """Get savings opportunity alerts based on user thresholds"""
    try:
        # Get user thresholds
        prefs_service = UserPreferencesService()
        prefs = prefs_service.get_preferences(current_user)
        
        thresholds = {
            'increase_7day': prefs.get('price_alert_threshold_7day', 10.0),
            'increase_28day': prefs.get('price_alert_threshold_28day', 15.0),
            'decrease_7day': prefs.get('price_drop_alert_threshold_7day', 10.0),
            'decrease_28day': prefs.get('price_drop_alert_threshold_28day', 15.0)
        }
        
        # Generate alerts
        alert_gen_service = AlertGenerationService()
        alerts = alert_gen_service.generate_alerts_with_thresholds(current_user, thresholds)
        
        # Get dismissed alerts
        alert_mgmt_service = AlertManagementService()
        dismissed = alert_mgmt_service.get_dismissed_alerts(current_user, 'savings_opportunity')
        
        # Filter out dismissed
        active_alerts = [a for a in alerts['positive_alerts'] if a['alert_key'] not in dismissed]
        
        return {
            'alerts': active_alerts,
            'total_count': len(active_alerts),
            'thresholds': thresholds
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch savings opportunities"
        )


@router.post("/dismiss")
async def dismiss_alert(
    request: DismissAlertRequest,
    current_user: str = Depends(get_current_user)
):
    """Dismiss an alert"""
    try:
        alert_service = AlertManagementService()
        alert_service.dismiss_alert(current_user, request.alert_key, request.alert_type)
        return {"success": True, "message": "Alert dismissed successfully"}
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to dismiss alert"
        )


@router.put("/thresholds")
async def update_thresholds(
    request: UpdateThresholdsRequest,
    current_user: str = Depends(get_current_user)
):
    """Update user alert thresholds"""
    try:
        prefs_service = UserPreferencesService()
        
        # Build updates dict (only include provided values)
        updates = {}
        if request.price_alert_threshold_7day is not None:
            updates['price_alert_threshold_7day'] = request.price_alert_threshold_7day
        if request.price_alert_threshold_28day is not None:
            updates['price_alert_threshold_28day'] = request.price_alert_threshold_28day
        if request.price_drop_alert_threshold_7day is not None:
            updates['price_drop_alert_threshold_7day'] = request.price_drop_alert_threshold_7day
        if request.price_drop_alert_threshold_28day is not None:
            updates['price_drop_alert_threshold_28day'] = request.price_drop_alert_threshold_28day
        
        if not updates:
            raise HTTPException(status_code=400, detail="No threshold values provided")
        
        prefs_service.update_preferences(current_user, updates)
        return {"success": True, "message": "Thresholds updated successfully", "updated": updates}
    except HTTPException:
        raise
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to update thresholds"
        )
