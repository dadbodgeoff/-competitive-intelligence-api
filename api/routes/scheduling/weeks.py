from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, ValidationInfo, field_validator

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.scheduling import SchedulingWeekService

router = APIRouter()


class DayForecastPayload(BaseModel):
    date: date
    expected_sales: Optional[float] = Field(default=None, ge=0)
    expected_guest_count: Optional[int] = Field(default=None, ge=0)


class WeekCreateRequest(BaseModel):
    week_start_date: date
    expected_sales_total: Optional[float] = Field(default=None, ge=0)
    expected_guest_count: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = None
    day_forecasts: Optional[List[DayForecastPayload]] = None
    copy_from_week_id: Optional[str] = None
    copy_shifts: bool = False
    copy_forecasts: bool = False

    @field_validator("copy_shifts", "copy_forecasts", mode="before")
    @classmethod
    def copy_flags_require_source(cls, value: bool, info: ValidationInfo):
        if value and not info.data.get("copy_from_week_id"):
            raise ValueError(f"{info.field_name} requires copy_from_week_id to be set")
        return value


class WeekUpdateRequest(BaseModel):
    status: Optional[str] = Field(default=None)
    expected_sales_total: Optional[float] = Field(default=None, ge=0)
    expected_guest_count: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = None


class DayForecastUpdateRequest(BaseModel):
    expected_sales: Optional[float] = Field(default=None, ge=0)
    expected_guest_count: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = None


def _get_account_id(user_id: str) -> str:
    account_service = AccountService()
    try:
        return account_service.get_primary_account_id(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/weeks")
async def list_scheduling_weeks(
    limit: int = Query(4, ge=1, le=12),
    status: Optional[str] = Query(None),
    include_days: bool = Query(True),
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingWeekService(account_id)
    weeks = service.list_weeks(limit=limit, status=status, include_days=include_days)
    return {"weeks": weeks}


@router.post("/weeks", status_code=status.HTTP_201_CREATED)
async def create_scheduling_week(
    payload: WeekCreateRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingWeekService(account_id)
    week = service.create_week(
        week_start_date=payload.week_start_date,
        expected_sales_total=payload.expected_sales_total,
        expected_guest_count=payload.expected_guest_count,
        notes=payload.notes,
        day_forecasts=[
            {
                "date": forecast.date.isoformat(),
                "expected_sales": forecast.expected_sales,
                "expected_guest_count": forecast.expected_guest_count,
            }
            for forecast in payload.day_forecasts or []
        ],
        copy_from_week_id=payload.copy_from_week_id,
        copy_shifts=payload.copy_shifts,
        copy_forecasts=payload.copy_forecasts,
    )
    return {"week": week}


@router.get("/weeks/{week_id}")
async def get_scheduling_week(
    week_id: str,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingWeekService(account_id)
    week = service.get_week(week_id)
    if not week:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Week not found")
    return {"week": week}


@router.patch("/weeks/{week_id}")
async def update_scheduling_week(
    week_id: str,
    payload: WeekUpdateRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingWeekService(account_id)
    week = service.update_week(
        week_id,
        status=payload.status,
        expected_sales_total=payload.expected_sales_total,
        expected_guest_count=payload.expected_guest_count,
        notes=payload.notes,
    )
    return {"week": week}


@router.put("/days/{day_id}/forecast")
async def update_day_forecast(
    day_id: str,
    payload: DayForecastUpdateRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingWeekService(account_id)
    day = service.update_day_forecast(
        day_id,
        expected_sales=payload.expected_sales,
        expected_guest_count=payload.expected_guest_count,
        notes=payload.notes,
    )
    return {"day": day}

