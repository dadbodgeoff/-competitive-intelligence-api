from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.account_service import AccountService
from services.scheduling import ClockService

router = APIRouter(prefix="/timeclock", tags=["Time Clock"])


class PinClockRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


@router.post("/pin")
async def toggle_clock_with_pin(payload: PinClockRequest):
    """Toggle clock-in/out for a member via 4-digit PIN."""
    account_service = AccountService()
    try:
        user_record = account_service.lookup_user_by_pin(payload.pin)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid PIN")

    account_id = user_record.get("primary_account_id")
    if not account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account context missing for this member. Ask an admin to link your profile.",
        )

    member_user_id = user_record["id"]
    if not account_service.ensure_active_member(account_id, member_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Member is not active on this account")

    clock_service = ClockService(account_id=account_id)
    live_session = clock_service.get_live_session_for_member(member_user_id)
    display_name = " ".join(filter(None, [user_record.get("first_name"), user_record.get("last_name")])).strip() or "Team member"

    if live_session:
        try:
            entry = clock_service.end_shift(
                shift_id=live_session["shift_id"],
                member_user_id=member_user_id,
                source="pin_kiosk",
            )
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

        return {
            "status": "clocked_out",
            "account_id": account_id,
            "member_user_id": member_user_id,
            "member_name": display_name,
            "shift_id": live_session["shift_id"],
            "entry_id": entry["id"],
            "occurred_at": entry["clock_out_at"],
            "message": f"{display_name} clocked out successfully.",
        }

    try:
        shift_id = clock_service.find_shift_for_member(member_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    try:
        session = clock_service.start_shift(
            shift_id=shift_id,
            member_user_id=member_user_id,
            source="pin_kiosk",
        )
    except (ValueError, PermissionError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "status": "clocked_in",
        "account_id": account_id,
        "member_user_id": member_user_id,
        "member_name": display_name,
        "shift_id": shift_id,
        "session_id": session["id"],
        "occurred_at": session["started_at"],
        "message": f"Welcome {display_name}! You're now clocked in.",
    }


