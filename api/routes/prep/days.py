from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.prep import PrepAssignmentService, PrepDayService

router = APIRouter()


class DayCreateRequest(BaseModel):
  prep_date: date
  template_id: Optional[str] = None
  status: Optional[str] = Field(default="draft")


class DayUpdateRequest(BaseModel):
  status: Optional[str] = None
  notes: Optional[str] = None
  lock: Optional[bool] = None


class DayItemCreateRequest(BaseModel):
  name: str = Field(..., min_length=1)
  par_amount: float = Field(..., ge=0)
  on_hand_amount: float = Field(..., ge=0)
  template_item_id: Optional[str] = None
  menu_item_id: Optional[str] = None
  unit: Optional[str] = None
  notes: Optional[str] = None
  display_order: Optional[int] = None


class DayItemUpdateRequest(BaseModel):
  par_amount: Optional[float] = Field(default=None, ge=0)
  on_hand_amount: Optional[float] = Field(default=None, ge=0)
  unit: Optional[str] = None
  notes: Optional[str] = None
  display_order: Optional[int] = None
  assigned_user_id: Optional[str] = None


class AssignRequest(BaseModel):
  assigned_user_id: str


class CompleteRequest(BaseModel):
  completion_note: Optional[str] = None
  completed_at: Optional[datetime] = None


def _get_account_id(current_user: str) -> str:
  account_service = AccountService()
  try:
    return account_service.get_primary_account_id(current_user)
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


def _get_day_service(current_user: str) -> PrepDayService:
  return PrepDayService(account_id=_get_account_id(current_user))


def _get_assignment_service(current_user: str) -> PrepAssignmentService:
  return PrepAssignmentService(account_id=_get_account_id(current_user))


@router.get("/days")
async def list_prep_days(
  start: Optional[date] = Query(None),
  end: Optional[date] = Query(None),
  status_filter: Optional[str] = Query(None, alias="status"),
  current_user: str = Depends(get_current_user),
):
  service = _get_day_service(current_user)
  days = service.list_days(start=start, end=end, status=status_filter)
  return {"days": days}


@router.post("/days", status_code=status.HTTP_201_CREATED)
async def create_prep_day(payload: DayCreateRequest, current_user: str = Depends(get_current_user)):
  service = _get_day_service(current_user)
  day = service.create_day(
    prep_date=payload.prep_date,
    created_by=current_user,
    template_id=payload.template_id,
    status=payload.status or "draft",
  )
  return {"day": day}


@router.get("/days/{prep_day_id}")
async def get_prep_day(prep_day_id: str, current_user: str = Depends(get_current_user)):
  service = _get_day_service(current_user)
  day = service.get_day(prep_day_id, include_items=True)
  if not day:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prep day not found")
  return {"day": day}


@router.put("/days/{prep_day_id}")
async def update_prep_day(prep_day_id: str, payload: DayUpdateRequest, current_user: str = Depends(get_current_user)):
  service = _get_day_service(current_user)
  lock_info = {}
  if payload.lock is not None:
    lock_info = {
      "locked_by": current_user if payload.lock else None,
      "locked_at": datetime.utcnow() if payload.lock else None,
    }
  day = service.update_day(
    prep_day_id,
    status=payload.status,
    notes=payload.notes,
    locked_by=lock_info.get("locked_by"),
    locked_at=lock_info.get("locked_at"),
  )
  return {"day": day}


@router.post("/days/{prep_day_id}/items", status_code=status.HTTP_201_CREATED)
async def add_prep_day_item(prep_day_id: str, payload: DayItemCreateRequest, current_user: str = Depends(get_current_user)):
  service = _get_day_service(current_user)
  day = service.get_day(prep_day_id, include_items=False)
  if not day:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prep day not found")
  item = service.add_day_item(
    prep_day_id,
    name=payload.name,
    par_amount=payload.par_amount,
    on_hand_amount=payload.on_hand_amount,
    created_by=current_user,
    template_item_id=payload.template_item_id,
    menu_item_id=payload.menu_item_id,
    unit=payload.unit,
    notes=payload.notes,
    display_order=payload.display_order,
  )
  return {"item": item}


@router.put("/day-items/{item_id}")
async def update_prep_day_item(item_id: str, payload: DayItemUpdateRequest, current_user: str = Depends(get_current_user)):
  service = _get_day_service(current_user)
  item = service.update_day_item(
    item_id,
    par_amount=payload.par_amount,
    on_hand_amount=payload.on_hand_amount,
    unit=payload.unit,
    notes=payload.notes,
    display_order=payload.display_order,
    assigned_user_id=payload.assigned_user_id,
  )
  return {"item": item}


@router.delete("/day-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prep_day_item(item_id: str, current_user: str = Depends(get_current_user)):
  service = _get_day_service(current_user)
  service.remove_day_item(item_id, removed_by=current_user)
  return {}


@router.post("/day-items/{item_id}/assign")
async def assign_prep_day_item(item_id: str, payload: AssignRequest, current_user: str = Depends(get_current_user)):
  service = _get_assignment_service(current_user)
  item = service.assign_item(item_id, assigned_user_id=payload.assigned_user_id, assigned_by=current_user)
  return {"item": item}


@router.post("/day-items/{item_id}/complete")
async def complete_prep_day_item(item_id: str, payload: CompleteRequest, current_user: str = Depends(get_current_user)):
  service = _get_assignment_service(current_user)
  item = service.complete_item(
    item_id,
    completed_by=current_user,
    completion_note=payload.completion_note,
    completed_at=payload.completed_at,
  )
  return {"item": item}


@router.post("/day-items/{item_id}/reopen")
async def reopen_prep_day_item(item_id: str, current_user: str = Depends(get_current_user)):
  service = _get_assignment_service(current_user)
  item = service.reopen_item(item_id, reopened_by=current_user)
  return {"item": item}

