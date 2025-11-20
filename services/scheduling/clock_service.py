from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional, Tuple

from database.supabase_client import get_supabase_service_client
from services.account_service import AccountService
from services.scheduling.labor_summary_service import LaborSummaryService

logger = logging.getLogger(__name__)


class ClockService:
    """Manage clock-in/out workflows for scheduled shifts."""

    def __init__(self, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()
        self.account_service = AccountService()
        self.summary_service = LaborSummaryService(account_id=account_id)

    # ------------------------------------------------------------------#
    # Public API
    # ------------------------------------------------------------------#
    def start_shift(self, *, shift_id: str, member_user_id: str, source: str = "self") -> Dict:
        """Clock a member into a shift."""
        self._assert_shift_member_access(shift_id, member_user_id)

        existing_session = self._get_live_session(shift_id, member_user_id)
        if existing_session:
            logger.info("Live session already exists for shift=%s user=%s", shift_id, member_user_id)
            return existing_session

        rate_info = self._resolve_compensation(member_user_id)
        now = datetime.now(timezone.utc).isoformat()

        payload = {
            "account_id": self.account_id,
            "shift_id": shift_id,
            "member_user_id": member_user_id,
            "started_at": now,
            "last_heartbeat_at": now,
            "started_rate_cents": rate_info.rate_cents,
            "started_rate_type": rate_info.rate_type,
            "started_rate_currency": rate_info.currency,
        }
        result = self.client.table("scheduling_shift_live_sessions").insert(payload).execute()
        session = result.data[0]

        logger.info("Shift %s clock-in created for user %s", shift_id, member_user_id)
        return session

    def end_shift(
        self,
        *,
        shift_id: str,
        member_user_id: str,
        source: str = "self",
        note: Optional[str] = None,
        clock_out_at: Optional[datetime] = None,
        break_minutes: Optional[int] = None,
    ) -> Dict:
        """Clock-out a member and persist the entry."""
        session = self._get_live_session(shift_id, member_user_id)
        if not session:
            raise ValueError("No active shift session to clock out")

        self._assert_shift_member_access(shift_id, member_user_id)

        clock_in_at = datetime.fromisoformat(session["started_at"])
        end_time = clock_out_at or datetime.now(timezone.utc)
        total_minutes = max(int((end_time - clock_in_at).total_seconds() // 60), 0)

        break_total = break_minutes if break_minutes is not None else 0
        paid_minutes = max(total_minutes - break_total, 0)

        effective_rate_cents = session["started_rate_cents"] or 0
        cost_cents = self._calculate_cost_cents(effective_rate_cents, session.get("started_rate_type"), paid_minutes)

        entry_payload = {
            "account_id": self.account_id,
            "shift_id": shift_id,
            "member_user_id": member_user_id,
            "clock_in_at": clock_in_at.isoformat(),
            "clock_out_at": end_time.isoformat(),
            "clock_in_source": session.get("clock_in_source", "self"),
            "clock_out_source": source,
            "clock_out_note": note,
            "effective_rate_cents": effective_rate_cents,
            "effective_rate_type": session.get("started_rate_type", "hourly"),
            "effective_rate_currency": session.get("started_rate_currency", "USD"),
            "total_minutes": total_minutes,
            "break_minutes": break_total,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        entry_result = self.client.table("scheduling_shift_clock_entries").insert(entry_payload).execute()
        entry = entry_result.data[0]

        # Remove live session
        self.client.table("scheduling_shift_live_sessions").delete().eq("id", session["id"]).execute()

        # Update summaries
        self.summary_service.recompute_for_shift(shift_id=shift_id)

        logger.info(
            "Shift %s clock-out recorded for user %s (minutes=%s paid_minutes=%s cost=%s)",
            shift_id,
            member_user_id,
            total_minutes,
            paid_minutes,
            cost_cents,
        )
        return entry

    def heartbeat(self, *, shift_id: str, member_user_id: str) -> Dict:
        """Refresh the heartbeat timestamp of a live session."""
        session = self._get_live_session(shift_id, member_user_id)
        if not session:
            raise ValueError("No active session to heartbeat")
        now_iso = datetime.now(timezone.utc).isoformat()
        result = (
            self.client.table("scheduling_shift_live_sessions")
            .update({"last_heartbeat_at": now_iso})
            .eq("id", session["id"])
            .execute()
        )
        return result.data[0] if result.data else session

    # ------------------------------------------------------------------#
    # Helpers
    # ------------------------------------------------------------------#
    def _get_live_session(self, shift_id: str, member_user_id: str) -> Optional[Dict]:
        result = (
            self.client.table("scheduling_shift_live_sessions")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("shift_id", shift_id)
            .eq("member_user_id", member_user_id)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    def _assert_shift_member_access(self, shift_id: str, member_user_id: str) -> None:
        shift = (
            self.client.table("scheduling_shifts")
            .select("id, account_id, day_id, week_id")
            .eq("id", shift_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        if not shift.data:
            raise ValueError("Shift not found for account")

        if not self.account_service.ensure_active_member(self.account_id, member_user_id):
            raise PermissionError("User is not an active member of this account")

    def _resolve_compensation(self, member_user_id: str) -> "RateInfo":
        result = (
            self.client.table("account_member_compensation")
            .select("rate_cents, rate_type, currency")
            .eq("account_id", self.account_id)
            .eq("user_id", member_user_id)
            .is_("ends_at", None)
            .order("effective_at", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data:
            raise ValueError("No active compensation configured for this member")

        payload = result.data[0]
        return RateInfo(
            rate_cents=int(payload.get("rate_cents", 0)),
            rate_type=payload.get("rate_type", "hourly"),
            currency=payload.get("currency", "USD"),
        )

    @staticmethod
    def _calculate_cost_cents(rate_cents: int, rate_type: Optional[str], paid_minutes: int) -> int:
        if rate_cents is None:
            return 0
        rate = Decimal(rate_cents or 0)
        hours = Decimal(paid_minutes) / Decimal(60)
        if (rate_type or "hourly") == "salary":
            # Salary not currently prorated; treat as zero incremental cost.
            return 0
        cost = (rate * hours).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        return int(cost)


class RateInfo:
    """Value object for compensation snapshot."""

    def __init__(self, rate_cents: int, rate_type: str, currency: str) -> None:
        self.rate_cents = rate_cents
        self.rate_type = rate_type or "hourly"
        self.currency = currency or "USD"

    def as_dict(self) -> Dict[str, str]:
        return {
            "rate_cents": self.rate_cents,
            "rate_type": self.rate_type,
            "currency": self.currency,
        }

