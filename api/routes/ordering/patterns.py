"""Delivery pattern endpoints for predictive ordering."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from api.middleware.auth import get_current_user
from services.ordering.delivery_pattern_service import DeliveryPatternService

router = APIRouter(prefix="/api/v1/ordering", tags=["ordering"])


@router.get("/delivery-patterns")
async def list_delivery_patterns(current_user: str = Depends(get_current_user)):
    """Return stored vendor delivery schedules for the authenticated user."""
    service = DeliveryPatternService()
    patterns = service.get_patterns(current_user)
    return {"patterns": patterns}


@router.post("/delivery-patterns/detect")
async def detect_delivery_patterns(current_user: str = Depends(get_current_user)):
    """
    Re-run historical analysis to detect vendor delivery weekdays.

    Returns the refreshed schedules persisted to vendor_delivery_schedules.
    """
    service = DeliveryPatternService()
    patterns = service.detect_and_save(current_user)
    return {"patterns": patterns, "refreshed": True}

