from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.scheduling import SchedulingShiftService

router = APIRouter()


class ShiftCreateRequest(BaseModel):
    day_id: str
    week_id: str
    shift_type: str = Field(default="other")
    start_time: str
    end_time: str
    role_label: Optional[str] = None
    break_minutes: Optional[int] = Field(default=None, ge=0)
    wage_type: Optional[str] = None
    wage_rate: Optional[float] = Field(default=None, ge=0)
    wage_currency: Optional[str] = None
    notes: Optional[str] = None
    assigned_member_id: Optional[str] = None


class ShiftAssignRequest(BaseModel):
    member_user_id: str
    wage_override: Optional[float] = Field(default=None, ge=0)
    wage_type_override: Optional[str] = None


class ShiftUpdateRequest(BaseModel):
    shift_type: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    break_minutes: Optional[int] = Field(default=None, ge=0)
    role_label: Optional[str] = None
    notes: Optional[str] = None


def _get_account_id(user_id: str) -> str:
    account_service = AccountService()
    try:
        return account_service.get_primary_account_id(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/shifts", status_code=status.HTTP_201_CREATED)
async def create_shift(
    payload: ShiftCreateRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingShiftService(account_id)
    shift = service.create_shift(
        day_id=payload.day_id,
        week_id=payload.week_id,
        shift_type=payload.shift_type,
        start_time=payload.start_time,
        end_time=payload.end_time,
        role_label=payload.role_label,
        break_minutes=payload.break_minutes,
        wage_type=payload.wage_type,
        wage_rate=payload.wage_rate,
        wage_currency=payload.wage_currency,
        notes=payload.notes,
        assigned_member_id=payload.assigned_member_id,
    )
    return {"shift": shift}


@router.post("/shifts/{shift_id}/assign")
async def assign_shift_member(
    shift_id: str,
    payload: ShiftAssignRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingShiftService(account_id)
    assignment = service.assign_member(
        shift_id,
        payload.member_user_id,
        wage_override=payload.wage_override,
        wage_type_override=payload.wage_type_override,
    )
    return {"assignment": assignment}


@router.delete("/shifts/{shift_id}/assign/{member_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unassign_shift_member(
    shift_id: str,
    member_user_id: str,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingShiftService(account_id)
    service.unassign_member(shift_id, member_user_id)
    return {}


@router.put("/shifts/{shift_id}")
async def update_shift(
    shift_id: str,
    payload: ShiftUpdateRequest,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    service = SchedulingShiftService(account_id)
    shift = service.update_shift(
        shift_id,
        shift_type=payload.shift_type,
        start_time=payload.start_time,
        end_time=payload.end_time,
        break_minutes=payload.break_minutes,
        role_label=payload.role_label,
        notes=payload.notes,
    )
    return {"shift": shift}

