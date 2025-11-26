from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.scheduling.week_service import SchedulingWeekService
from services.scheduling.labor_summary_service import LaborSummaryService

router = APIRouter()


def _get_services(user_id: str):
    account_service = AccountService()
    account_id = account_service.get_primary_account_id(user_id)
    return account_id, SchedulingWeekService(account_id), account_service


@router.get("/weeks/{week_id}/grid")
async def get_scheduler_grid(week_id: str, current_user: str = Depends(get_current_user)):
    account_id, week_service, account_service = _get_services(current_user)
    week = week_service.get_week(week_id)
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")

    labor_summary = LaborSummaryService(account_id)
    
    # Only recompute if there are live sessions (active clock-ins)
    # This avoids expensive recomputation on every page load
    has_live_sessions = any(
        len(shift.get("live_sessions", [])) > 0
        for day in week.get("days", [])
        for shift in day.get("shifts", [])
    )
    
    if has_live_sessions:
        # Recompute to get accurate live labor costs
        labor_summary.recompute_week(week_id)
    
    totals = labor_summary.get_week_totals(week_id)
    members = account_service.list_members_with_compensation(account_id)
    member_lookup = {member["user_id"]: member for member in members}

    for day in week.get("days", []):
        for shift in day.get("shifts", []):
            assigned_id = shift.get("assigned_member_id")
            member = member_lookup.get(assigned_id)
            shift["assigned_member"] = member
            minutes = shift_duration_minutes(shift)
            shift["scheduled_minutes"] = minutes
            hourly_cents = resolve_shift_rate_cents(shift, member)
            if hourly_cents:
                cost = (hourly_cents * Decimal(minutes)) / Decimal(60)
                shift["scheduled_cost_cents"] = int(cost.quantize(Decimal("1")))
            else:
                shift["scheduled_cost_cents"] = 0

    return {
        "week": week,
        "members": members,
        "totals": totals,
    }


def shift_duration_minutes(shift: dict) -> int:
    start = shift.get("start_time")
    end = shift.get("end_time")
    break_minutes = shift.get("break_minutes") or 0
    if not start or not end:
        return 0
    fmt = "%H:%M:%S"
    start_dt = datetime.strptime(start, fmt)
    end_dt = datetime.strptime(end, fmt)
    delta_seconds = (end_dt - start_dt).total_seconds()
    # Handle overnight shifts (e.g., 10PM to 6AM)
    if delta_seconds < 0:
        delta_seconds += 24 * 60 * 60  # Add 24 hours
    delta = int(delta_seconds // 60)
    return max(delta - break_minutes, 0)


def resolve_shift_rate_cents(shift: dict, member: Optional[dict]) -> Optional[Decimal]:
    override = shift.get("wage_override_cents")
    if override is not None:
        return Decimal(override)
    compensation = (member or {}).get("compensation")
    if not compensation:
        return None
    return Decimal(compensation.get("rate_cents") or 0)

