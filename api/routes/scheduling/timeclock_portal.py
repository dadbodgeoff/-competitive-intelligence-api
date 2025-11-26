from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.account_service import AccountService
from services.scheduling import ClockService

router = APIRouter(prefix="/timeclock", tags=["Time Clock"])


class PinClockRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class LocationPinClockRequest(BaseModel):
    location_code: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class ValidateLocationRequest(BaseModel):
    location_code: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


@router.post("/validate-location")
async def validate_location_code(payload: ValidateLocationRequest):
    """Validate a location code and return the restaurant name."""
    account_service = AccountService()
    account = account_service.get_account_by_location_code(payload.location_code)
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found. Please check your 4-digit code.",
        )
    
    return {
        "valid": True,
        "location_code": payload.location_code,
        "account_id": account["id"],
        "account_name": account.get("name", "Restaurant"),
    }


@router.post("/clock")
async def clock_with_location_and_pin(payload: LocationPinClockRequest):
    """Clock in/out using location code + PIN (two-step authentication)."""
    account_service = AccountService()
    
    # Step 1: Validate location code
    account = account_service.get_account_by_location_code(payload.location_code)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid location code.",
        )
    
    account_id = account["id"]
    
    # Step 2: Look up user by PIN within this account
    try:
        user_record = account_service.lookup_user_by_pin_in_account(
            pin=payload.pin,
            account_id=account_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid PIN for this location.",
        )
    
    member_user_id = user_record["id"]
    if not account_service.ensure_active_member(account_id, member_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Member is not active at this location.",
        )
    
    clock_service = ClockService(account_id=account_id)
    live_session = clock_service.get_live_session_for_member(member_user_id)
    display_name = (
        " ".join(filter(None, [user_record.get("first_name"), user_record.get("last_name")])).strip()
        or "Team member"
    )
    
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
            "account_name": account.get("name"),
            "member_user_id": member_user_id,
            "member_name": display_name,
            "shift_id": live_session["shift_id"],
            "entry_id": entry["id"],
            "occurred_at": entry["clock_out_at"],
            "message": f"Goodbye {display_name}! You've clocked out.",
        }
    
    try:
        shift_id, is_unscheduled = clock_service.find_shift_for_member(member_user_id)
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
    
    # Build response with optional warning for unscheduled clock-ins
    response = {
        "status": "clocked_in",
        "account_id": account_id,
        "account_name": account.get("name"),
        "member_user_id": member_user_id,
        "member_name": display_name,
        "shift_id": shift_id,
        "session_id": session["id"],
        "occurred_at": session["started_at"],
        "is_unscheduled": is_unscheduled,
    }
    
    if is_unscheduled:
        response["message"] = f"Welcome {display_name}! You're clocked in, but you're not on the schedule today. Please confirm with your manager that you have permission to work."
        response["warning"] = "You are not scheduled to work today. Please ensure you have manager approval."
    else:
        response["message"] = f"Welcome {display_name}! You're now clocked in."
    
    return response


# Legacy endpoint - kept for backwards compatibility
@router.post("/pin")
async def toggle_clock_with_pin(payload: PinClockRequest):
    """Toggle clock-in/out for a member via 4-digit PIN (legacy - global lookup)."""
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
        shift_id, is_unscheduled = clock_service.find_shift_for_member(member_user_id)
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

    # Build response with optional warning for unscheduled clock-ins
    response = {
        "status": "clocked_in",
        "account_id": account_id,
        "member_user_id": member_user_id,
        "member_name": display_name,
        "shift_id": shift_id,
        "session_id": session["id"],
        "occurred_at": session["started_at"],
        "is_unscheduled": is_unscheduled,
    }
    
    if is_unscheduled:
        response["message"] = f"Welcome {display_name}! You're clocked in, but you're not on the schedule today. Please confirm with your manager."
        response["warning"] = "You are not scheduled to work today. Please ensure you have manager approval."
    else:
        response["message"] = f"Welcome {display_name}! You're now clocked in."
    
    return response


