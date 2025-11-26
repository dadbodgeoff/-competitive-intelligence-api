"""
Predictive ordering endpoints.

Returns forecast data for predictive ordering based on invoice history
and detected delivery patterns.
"""
from __future__ import annotations

from datetime import date, timedelta
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
    limit: int = Query(
        200,
        ge=1,
        le=500,
        description="Maximum number of forecasts to return.",
    ),
    offset: int = Query(
        0,
        ge=0,
        description="Number of forecasts to skip for pagination.",
    ),
    from_date: Optional[str] = Query(
        None,
        description="Filter forecasts from this date (YYYY-MM-DD). Defaults to today.",
    ),
    to_date: Optional[str] = Query(
        None,
        description="Filter forecasts up to this date (YYYY-MM-DD). Defaults to 30 days from now.",
    ),
    current_user: str = Depends(get_current_user),
):
    """
    Return forecasted order quantities for the requesting user.

    Supports pagination and date filtering for efficient data retrieval.
    """
    service = OrderingForecastService()
    forecasts = service.get_predictions(current_user, item)

    # Apply date filtering
    if from_date or to_date:
        try:
            start = date.fromisoformat(from_date) if from_date else date.today()
            end = date.fromisoformat(to_date) if to_date else date.today() + timedelta(days=30)
        except ValueError:
            start = date.today()
            end = date.today() + timedelta(days=30)

        filtered = []
        for forecast in forecasts:
            forecast_date_str = forecast.get("forecast_date") or forecast.get("delivery_date")
            if not forecast_date_str:
                continue
            try:
                forecast_date = date.fromisoformat(forecast_date_str[:10])
                if start <= forecast_date <= end:
                    filtered.append(forecast)
            except ValueError:
                continue
        forecasts = filtered

    # Apply pagination
    total = len(forecasts)
    paginated = forecasts[offset : offset + limit]

    return {
        "predictions": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
    }

