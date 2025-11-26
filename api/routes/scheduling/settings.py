from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, validator

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.scheduling import SchedulingSettingsService

router = APIRouter()


class SettingsUpdateRequest(BaseModel):
    week_start_day: int = Field(ge=0, le=6)
    timezone: str
    auto_publish: bool = False
    default_shift_length_minutes: int = Field(gt=0)
    overtime_threshold_minutes: Optional[int] = Field(default=None, ge=60)
    overtime_multiplier: Optional[float] = Field(default=None, ge=1.0, le=3.0)
    overtime_enabled: Optional[bool] = None


def _get_account_id(user_id: str) -> str:
    account_service = AccountService()
    try:
        return account_service.get_primary_account_id(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/settings")
async def get_scheduling_settings(current_user: str = Depends(get_current_user)):
    account_id = _get_account_id(current_user)
    service = SchedulingSettingsService(account_id)
    settings = service.get_settings()
    return {"settings": settings}


@router.put("/settings")
async def update_scheduling_settings(
    payload: SettingsUpdateRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingSettingsService(account_id)
    settings = service.update_settings(
        week_start_day=payload.week_start_day,
        timezone=payload.timezone,
        auto_publish=payload.auto_publish,
        default_shift_length_minutes=payload.default_shift_length_minutes,
        overtime_threshold_minutes=payload.overtime_threshold_minutes,
        overtime_multiplier=payload.overtime_multiplier,
        overtime_enabled=payload.overtime_enabled,
    )
    return {"settings": settings}

