from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from database.supabase_client import get_supabase_service_client
from services.account_service import AccountService
from services.scheduling.labor_summary_service import LaborSummaryService

logger = logging.getLogger(__name__)


class SchedulingShiftService:
    """Manage shifts and assignments for an account."""

    def __init__(self, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()
        self.account_service = AccountService()
        self.labor_summary_service = LaborSummaryService(account_id=account_id)

    def create_shift(
        self,
        *,
        day_id: str,
        week_id: str,
        shift_type: str,
        start_time: str,
        end_time: str,
        role_label: Optional[str] = None,
        break_minutes: Optional[int] = None,
        wage_type: Optional[str] = None,
        wage_rate: Optional[float] = None,
        wage_currency: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a shift for a specific scheduling day."""
        if not self._day_belongs_to_account(day_id):
            raise ValueError("Day does not belong to the account")

        payload = {
            "account_id": self.account_id,
            "week_id": week_id,
            "day_id": day_id,
            "shift_type": shift_type,
            "start_time": start_time,
            "end_time": end_time,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        if role_label is not None:
            payload["role_label"] = role_label
        if break_minutes is not None:
            payload["break_minutes"] = break_minutes
        if wage_type is not None:
            payload["wage_type"] = wage_type
        if wage_rate is not None:
            payload["wage_rate"] = wage_rate
        if wage_currency is not None:
            payload["wage_currency"] = wage_currency
        if notes is not None:
            payload["notes"] = notes

        result = self.client.table("scheduling_shifts").insert(payload).execute()
        shift_record = result.data[0]
        self.labor_summary_service.recompute_for_shift(shift_id=shift_record["id"])
        return shift_record

    def assign_member(
        self,
        shift_id: str,
        member_user_id: str,
        *,
        wage_override: Optional[float] = None,
        wage_type_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Assign an account member to a shift."""
        if not self._shift_belongs_to_account(shift_id):
            raise ValueError("Shift does not belong to the account")

        if not self.account_service.ensure_active_member(self.account_id, member_user_id):
            raise ValueError("User is not an active member of this account")

        wage_override_cents: Optional[int] = None
        if wage_override is not None:
            wage_override_cents = int(wage_override * 100)
        update_payload: Dict[str, Any] = {
            "assigned_member_id": member_user_id,
            "wage_override_cents": wage_override_cents,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if wage_type_override:
            update_payload["wage_override_currency"] = wage_type_override

        result = (
            self.client.table("scheduling_shifts")
            .update(update_payload)
            .eq("id", shift_id)
            .eq("account_id", self.account_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Shift not found")
        self.labor_summary_service.recompute_for_shift(shift_id=shift_id)
        shift_record = result.data[0]

        created_at = shift_record.get("created_at") or datetime.utcnow().isoformat()
        updated_at = shift_record.get("updated_at") or created_at

        assignment: Dict[str, Any] = {
            "shift_id": shift_id,
            "account_id": self.account_id,
            "member_user_id": member_user_id,
            "wage_override": (
                float(wage_override) if wage_override is not None
                else (
                    float(shift_record["wage_override_cents"]) / 100
                    if shift_record.get("wage_override_cents") is not None
                    else None
                )
            ),
            "wage_type_override": wage_type_override,
            "created_at": created_at,
            "updated_at": updated_at,
        }
        return assignment

    def unassign_member(self, shift_id: str, member_user_id: str) -> None:
        """Remove an assignment from a shift."""
        if not self._shift_belongs_to_account(shift_id):
            raise ValueError("Shift does not belong to the account")

        (
            self.client.table("scheduling_shifts")
            .update(
                {
                    "assigned_member_id": None,
                    "wage_override_cents": None,
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )
            .eq("id", shift_id)
            .eq("account_id", self.account_id)
            .execute()
        )
        self.labor_summary_service.recompute_for_shift(shift_id=shift_id)

    def update_shift(
        self,
        shift_id: str,
        *,
        shift_type: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        break_minutes: Optional[int] = None,
        role_label: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not self._shift_belongs_to_account(shift_id):
            raise ValueError("Shift does not belong to the account")

        payload: Dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}
        if shift_type is not None:
            payload["shift_type"] = shift_type
        if start_time is not None:
            payload["start_time"] = start_time
        if end_time is not None:
            payload["end_time"] = end_time
        if break_minutes is not None:
            payload["break_minutes"] = break_minutes
        if role_label is not None:
            payload["role_label"] = role_label
        if notes is not None:
            payload["notes"] = notes
        result = (
            self.client.table("scheduling_shifts")
            .update(payload)
            .eq("id", shift_id)
            .eq("account_id", self.account_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Shift not found")
        self.labor_summary_service.recompute_for_shift(shift_id=shift_id)
        return result.data[0]

    # ------------------------------------------------------------------#
    # Helpers
    # ------------------------------------------------------------------#
    def _day_belongs_to_account(self, day_id: str) -> bool:
        result = (
            self.client.table("scheduling_days")
            .select("id")
            .eq("id", day_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        return bool(result.data)

    def _shift_belongs_to_account(self, shift_id: str) -> bool:
        result = (
            self.client.table("scheduling_shifts")
            .select("id")
            .eq("id", shift_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        return bool(result.data)

