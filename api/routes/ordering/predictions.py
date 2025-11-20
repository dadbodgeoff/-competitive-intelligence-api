"""
Predictive ordering endpoints.

The initial implementation returns an empty forecast payload so the frontend
and API contracts can ship ahead of the modelling work.
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from api.middleware.auth import get_current_user
from services.ordering.forecast_service import OrderingForecastService

router = APIRouter(prefix="/api/v1/ordering", tags=["ordering"])


@router.get("/predictions")
async def get_ordering_predictions(
    item: Optional[List[str]] = Query(
        None,
        description="Optional list of ingredient identifiers (UUID or legacy slug) to filter forecasts.",
    ),
    current_user: str = Depends(get_current_user),
):
    """
    Return forecasted order quantities for the requesting user.

    NOTE: Predictions are currently stubbed out; the structure matches the
    intended response so the frontend can integrate early.
    """
    service = OrderingForecastService()
    forecasts = service.get_predictions(current_user, item)
    return {"predictions": forecasts}

