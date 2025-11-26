from __future__ import annotations

import logging
from datetime import date, datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional, Tuple

from zoneinfo import ZoneInfo

from database.supabase_client import get_supabase_service_client
from services.account_service import AccountService
from services.scheduling.labor_summary_service import LaborSummaryService
from services.scheduling.week_service import SchedulingWeekService
from services.scheduling.shift_service import SchedulingShiftService

logger = logging.getLogger(__name__)


class ClockService:
    """Manage clock-in/out workflows for scheduled shifts."""

    PIN_EARLY_GRACE_MINUTES = 60
    PIN_LATE_GRACE_MINUTES = 180

    def __init__(self, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()
        self.account_service = AccountService()
        self.summary_service = LaborSummaryService(account_id=account_id)
        self.week_service = SchedulingWeekService(account_id)
        self.shift_service = SchedulingShiftService(account_id)
        self._tzinfo: Optional[ZoneInfo] = None

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

        # Warn if rate is zero (but allow clock-in)
        if rate_info.rate_cents == 0:
            logger.warning(
                "Clock-in for shift %s user %s has zero rate - compensation may not be configured",
                shift_id,
                member_user_id,
            )

        payload = {
            "account_id": self.account_id,
            "shift_id": shift_id,
            "member_user_id": member_user_id,
            "started_at": now,
            "last_heartbeat_at": now,
            "clock_in_source": source,
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

    def get_live_session_for_member(self, member_user_id: str) -> Optional[Dict]:
        """Return the current live session for a member regardless of shift."""
        result = (
            self.client.table("scheduling_shift_live_sessions")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("member_user_id", member_user_id)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    def find_shift_for_member(self, member_user_id: str) -> Tuple[str, bool]:
        """Resolve the best shift to clock into for a member using heuristics.
        
        Returns:
            Tuple of (shift_id, is_unscheduled) where is_unscheduled indicates
            if an ad-hoc shift was created because the member wasn't scheduled.
        """
        assignments = (
            self.client.table("scheduling_shift_assignments")
            .select("shift_id")
            .eq("account_id", self.account_id)
            .eq("member_user_id", member_user_id)
            .execute()
        ).data or []

        shift_ids = [row["shift_id"] for row in assignments if row.get("shift_id")]
        if not shift_ids:
            logger.info("No scheduled shifts assigned to user %s; creating ad-hoc shift", member_user_id)
            return self._create_ad_hoc_shift(member_user_id), True

        shifts = (
            self.client.table("scheduling_shifts")
            .select("id, day_id, start_time, end_time, break_minutes")
            .eq("account_id", self.account_id)
            .in_("id", shift_ids)
            .execute()
        ).data or []

        if not shifts:
            raise ValueError("Scheduled shifts for this member could not be located")

        day_ids = list({shift["day_id"] for shift in shifts if shift.get("day_id")})
        days_lookup: Dict[str, date] = {}
        if day_ids:
            day_rows = (
                self.client.table("scheduling_days")
                .select("id, schedule_date")
                .eq("account_id", self.account_id)
                .in_("id", day_ids)
                .execute()
            ).data or []
            for row in day_rows:
                schedule_date = row.get("schedule_date")
                if schedule_date:
                    days_lookup[row["id"]] = datetime.fromisoformat(schedule_date).date()

        tzinfo = self._get_timezone()
        now_local = datetime.now(tzinfo)
        grace_before = timedelta(minutes=self.PIN_EARLY_GRACE_MINUTES)
        grace_after = timedelta(minutes=self.PIN_LATE_GRACE_MINUTES)

        best_active: Optional[Tuple[datetime, Dict]] = None
        best_upcoming: Optional[Tuple[datetime, Dict]] = None

        for shift in shifts:
            day_id = shift.get("day_id")
            schedule_date = days_lookup.get(day_id)
            if not schedule_date:
                continue

            start_time_str = shift.get("start_time")
            end_time_str = shift.get("end_time")
            if not start_time_str or not end_time_str:
                continue

            start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
            end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()

            start_dt = datetime.combine(schedule_date, start_time, tzinfo=tzinfo)
            end_dt = datetime.combine(schedule_date, end_time, tzinfo=tzinfo)
            if end_dt <= start_dt:
                end_dt += timedelta(days=1)

            if start_dt - grace_before <= now_local <= end_dt + grace_after:
                if not best_active or start_dt < best_active[0]:
                    best_active = (start_dt, shift)
            elif start_dt > now_local:
                if not best_upcoming or start_dt < best_upcoming[0]:
                    best_upcoming = (start_dt, shift)

        chosen = best_active[1] if best_active else (best_upcoming[1] if best_upcoming else None)
        if not chosen:
            logger.info("No eligible scheduled shift window for user %s; creating ad-hoc shift", member_user_id)
            return self._create_ad_hoc_shift(member_user_id), True
        return chosen["id"], False

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

    def _get_timezone(self) -> ZoneInfo:
        if self._tzinfo:
            return self._tzinfo
        tz_name = "UTC"
        settings = (
            self.client.table("scheduling_settings")
            .select("timezone")
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        ).data
        if settings and settings[0].get("timezone"):
            tz_name = settings[0]["timezone"]
        try:
            self._tzinfo = ZoneInfo(tz_name)
        except Exception:
            logger.warning("Invalid timezone %s for account %s; defaulting to UTC", tz_name, self.account_id)
            self._tzinfo = ZoneInfo("UTC")
        return self._tzinfo

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

    def _ensure_day_for_date(self, schedule_date: date) -> Tuple[str, str]:
        """Ensure there is a scheduling day for the given date and return (week_id, day_id)."""
        day_result = (
            self.client.table("scheduling_days")
            .select("id, week_id")
            .eq("account_id", self.account_id)
            .eq("schedule_date", schedule_date.isoformat())
            .limit(1)
            .execute()
        )
        if day_result.data:
            row = day_result.data[0]
            return row["week_id"], row["id"]

        week_start = schedule_date - timedelta(days=schedule_date.weekday())
        week_result = (
            self.client.table("scheduling_weeks")
            .select("id")
            .eq("account_id", self.account_id)
            .eq("week_start_date", week_start.isoformat())
            .limit(1)
            .execute()
        )
        if week_result.data:
            week_id = week_result.data[0]["id"]
        else:
            week = self.week_service.create_week(week_start_date=week_start)
            week_id = week["id"]

        # After ensuring the week, try fetching (it may have been created by create_week)
        day_result = (
            self.client.table("scheduling_days")
            .select("id, week_id")
            .eq("account_id", self.account_id)
            .eq("schedule_date", schedule_date.isoformat())
            .limit(1)
            .execute()
        )
        if day_result.data:
            row = day_result.data[0]
            return row["week_id"], row["id"]

        insert_result = (
            self.client.table("scheduling_days")
            .insert(
                {
                    "account_id": self.account_id,
                    "week_id": week_id,
                    "schedule_date": schedule_date.isoformat(),
                    "created_at": datetime.utcnow().isoformat(),
                }
            )
            .execute()
        )
        day = insert_result.data[0]
        return day["week_id"], day["id"]

    def _create_ad_hoc_shift(self, member_user_id: str) -> str:
        """Create a same-day ad-hoc shift so unscheduled members can clock in."""
        tzinfo = self._get_timezone()
        now_local = datetime.now(tzinfo)
        schedule_date = now_local.date()
        week_id, day_id = self._ensure_day_for_date(schedule_date)

        start_time = (now_local - timedelta(minutes=5)).time().strftime("%H:%M:%S")
        end_time = (now_local + timedelta(hours=8)).time().strftime("%H:%M:%S")

        shift = self.shift_service.create_shift(
            day_id=day_id,
            week_id=week_id,
            shift_type="unscheduled",
            start_time=start_time,
            end_time=end_time,
            role_label="Unscheduled",
            notes="Auto-created from PIN clock-in",
            assigned_member_id=member_user_id,
        )
        logger.info("Created ad-hoc shift %s for user %s on %s", shift["id"], member_user_id, schedule_date)
        return shift["id"]

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

