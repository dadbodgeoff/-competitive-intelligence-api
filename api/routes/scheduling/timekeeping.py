from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.scheduling import ClockService, LaborSummaryService

router = APIRouter()


class ClockInRequest(BaseModel):
    source: str = Field(default="self")


class ClockOutRequest(BaseModel):
    source: str = Field(default="self")
    note: Optional[str] = None
    break_minutes: Optional[int] = Field(default=0, ge=0)


class HeartbeatRequest(BaseModel):
    pass


def _get_clock_service(user_id: str) -> ClockService:
    account_service = AccountService()
    try:
        account_id = account_service.get_primary_account_id(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return ClockService(account_id=account_id)


def _get_account_id(user_id: str) -> str:
    account_service = AccountService()
    try:
        return account_service.get_primary_account_id(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/shifts/{shift_id}/clock-in")
async def clock_in_shift(
    shift_id: str,
    payload: ClockInRequest,
    current_user: str = Depends(get_current_user),
):
    service = _get_clock_service(current_user)
    try:
        session = service.start_shift(shift_id=shift_id, member_user_id=current_user, source=payload.source)
    except (ValueError, PermissionError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"session": session}


@router.post("/shifts/{shift_id}/clock-out")
async def clock_out_shift(
    shift_id: str,
    payload: ClockOutRequest,
    current_user: str = Depends(get_current_user),
):
    service = _get_clock_service(current_user)
    try:
        entry = service.end_shift(
            shift_id=shift_id,
            member_user_id=current_user,
            source=payload.source,
            note=payload.note,
            break_minutes=payload.break_minutes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"entry": entry}


@router.post("/shifts/{shift_id}/heartbeat")
async def heartbeat_shift(
    shift_id: str,
    current_user: str = Depends(get_current_user),
):
    service = _get_clock_service(current_user)
    try:
        session = service.heartbeat(shift_id=shift_id, member_user_id=current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"session": session}


@router.get("/weeks/{week_id}/timesheet")
async def get_week_timesheet(
    week_id: str,
    current_user: str = Depends(get_current_user),
):
    account_id = _get_account_id(current_user)
    summary_service = LaborSummaryService(account_id=account_id)
    # recompute week to ensure latest snapshot
    summary_service.recompute_week(week_id)

    day_summaries = (
        summary_service.client.table("scheduling_labor_day_summary")
        .select("*")
        .eq("account_id", account_id)
        .eq("week_id", week_id)
        .order("schedule_date")
        .execute()
    ).data or []

    augmented_days = []
    for day in day_summaries:
        components = summary_service.get_day_actual_components(day["day_id"])
        day["completed_minutes"] = components["completed_minutes"]
        day["completed_cost_cents"] = components["completed_cost_cents"]
        day["in_progress_minutes"] = components["live_minutes"]
        day["in_progress_cost_cents"] = components["live_cost_cents"]
        day["actual_minutes"] = components["total_minutes"]
        day["actual_cost_cents"] = components["total_cost_cents"]
        augmented_days.append(day)

    week_summary = (
        summary_service.client.table("scheduling_labor_week_summary")
        .select("*")
        .eq("account_id", account_id)
        .eq("week_id", week_id)
        .limit(1)
        .execute()
    ).data

    week_components = summary_service.get_week_actual_components(week_id)
    week_payload = week_summary[0] if week_summary else None
    if week_payload:
        week_payload["completed_minutes"] = week_components["completed_minutes"]
        week_payload["completed_cost_cents"] = week_components["completed_cost_cents"]
        week_payload["in_progress_minutes"] = week_components["live_minutes"]
        week_payload["in_progress_cost_cents"] = week_components["live_cost_cents"]
        week_payload["actual_minutes"] = week_components["total_minutes"]
        week_payload["actual_cost_cents"] = week_components["total_cost_cents"]
    else:
        week_payload = {
            "week_id": week_id,
            "account_id": account_id,
            "completed_minutes": week_components["completed_minutes"],
            "completed_cost_cents": week_components["completed_cost_cents"],
            "in_progress_minutes": week_components["live_minutes"],
            "in_progress_cost_cents": week_components["live_cost_cents"],
            "actual_minutes": week_components["total_minutes"],
            "actual_cost_cents": week_components["total_cost_cents"],
        }

    return {
        "week": week_payload,
        "days": augmented_days,
    }

