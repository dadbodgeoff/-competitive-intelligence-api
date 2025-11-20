from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional

from database.supabase_client import get_supabase_service_client
from services.scheduling.settings_service import SchedulingSettingsService

logger = logging.getLogger(__name__)


class SchedulingWeekService:
    """Manage scheduling weeks, days, and summary retrieval."""

    def __init__(self, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()
        self.settings_service = SchedulingSettingsService(account_id)

    # ------------------------------------------------------------------#
    # Retrieval
    # ------------------------------------------------------------------#
    def list_weeks(
        self,
        *,
        limit: int = 4,
        status: Optional[str] = None,
        include_days: bool = True,
    ) -> List[Dict[str, Any]]:
        """Return recent scheduling weeks with nested days/shifts."""
        query = (
            self.client.table("scheduling_weeks")
            .select("*")
            .eq("account_id", self.account_id)
            .order("week_start_date", desc=True)
            .limit(limit)
        )
        if status:
            query = query.eq("status", status)

        weeks_result = query.execute()
        weeks = weeks_result.data or []
        if not weeks or not include_days:
            return weeks

        week_ids = [week["id"] for week in weeks]

        days_result = (
            self.client.table("scheduling_days")
            .select("*")
            .in_("week_id", week_ids)
            .order("schedule_date")
            .execute()
        )
        days = days_result.data or []

        day_ids = [day["id"] for day in days]
        shifts: List[Dict[str, Any]] = []
        assignments: List[Dict[str, Any]] = []
        if day_ids:
            shifts_result = (
                self.client.table("scheduling_shifts")
                .select("*")
                .in_("day_id", day_ids)
                .order("start_time")
                .execute()
            )
            shifts = shifts_result.data or []
            shift_ids = [shift["id"] for shift in shifts]
            if shift_ids:
                assignments_result = (
                    self.client.table("scheduling_shift_assignments")
                    .select("*")
                    .in_("shift_id", shift_ids)
                    .execute()
                )
                assignments = assignments_result.data or []

        live_sessions: List[Dict[str, Any]] = []
        latest_entries: Dict[str, Dict[str, Any]] = {}
        if shifts:
            shift_ids = [shift["id"] for shift in shifts]
            live_session_result = (
                self.client.table("scheduling_shift_live_sessions")
                .select("*")
                .in_("shift_id", shift_ids)
                .execute()
            )
            live_sessions = live_session_result.data or []

            entry_result = (
                self.client.table("scheduling_shift_clock_entries")
                .select("*")
                .in_("shift_id", shift_ids)
                .order("clock_out_at", desc=True)
                .execute()
            )
            for entry in entry_result.data or []:
                shift_id = entry["shift_id"]
                if shift_id not in latest_entries:
                    latest_entries[shift_id] = entry

        assignments_by_shift = self._group_by(assignments, "shift_id")
        live_sessions_by_shift = self._group_by(live_sessions, "shift_id")
        shifts_by_day = self._group_by(shifts, "day_id")
        days_by_week = self._group_by(days, "week_id")

        for shift_list in shifts_by_day.values():
            for shift in shift_list:
                shift_id = shift["id"]
                shift["assignments"] = assignments_by_shift.get(shift_id, [])
                shift["live_sessions"] = live_sessions_by_shift.get(shift_id, [])
                shift["latest_entry"] = latest_entries.get(shift_id)

        for week in weeks:
            week_days = days_by_week.get(week["id"], [])
            for day in week_days:
                day["shifts"] = shifts_by_day.get(day["id"], [])
            week["days"] = week_days

        return weeks

    def get_week(self, week_id: str) -> Optional[Dict[str, Any]]:
        """Return a single week with nested days and shifts."""
        result = (
            self.client.table("scheduling_weeks")
            .select("*")
            .eq("id", week_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None

        week = result.data[0]
        days_result = (
            self.client.table("scheduling_days")
            .select("*")
            .eq("week_id", week_id)
            .order("schedule_date")
            .execute()
        )
        days = days_result.data or []

        shift_ids_query = (
            self.client.table("scheduling_shifts")
            .select("*")
            .eq("week_id", week_id)
            .order("start_time")
            .execute()
        )
        shifts = shift_ids_query.data or []

        if shifts:
            shift_ids = [shift["id"] for shift in shifts]
            assignments = (
                self.client.table("scheduling_shift_assignments")
                .select("*")
                .in_("shift_id", shift_ids)
                .execute()
            ).data or []
            live_sessions = (
                self.client.table("scheduling_shift_live_sessions")
                .select("*")
                .in_("shift_id", shift_ids)
                .execute()
            ).data or []
            entries_result = (
                self.client.table("scheduling_shift_clock_entries")
                .select("*")
                .in_("shift_id", shift_ids)
                .order("clock_out_at", desc=True)
                .execute()
            )
            latest_entries: Dict[str, Dict[str, Any]] = {}
            for entry in entries_result.data or []:
                sid = entry["shift_id"]
                if sid not in latest_entries:
                    latest_entries[sid] = entry
        else:
            assignments = []
            live_sessions = []
            latest_entries = {}

        assignments_by_shift = self._group_by(assignments, "shift_id")
        live_sessions_by_shift = self._group_by(live_sessions, "shift_id")
        shifts_by_day = self._group_by(shifts, "day_id")
        for shift_list in shifts_by_day.values():
            for shift in shift_list:
                sid = shift["id"]
                shift["assignments"] = assignments_by_shift.get(sid, [])
                shift["live_sessions"] = live_sessions_by_shift.get(sid, [])
                shift["latest_entry"] = latest_entries.get(sid)

        for day in days:
            day["shifts"] = shifts_by_day.get(day["id"], [])

        week["days"] = days
        return week

    # ------------------------------------------------------------------#
    # Creation & updates
    # ------------------------------------------------------------------#
    def create_week(
        self,
        *,
        week_start_date: date,
        expected_sales_total: Optional[float] = None,
        expected_guest_count: Optional[int] = None,
        day_forecasts: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Create a new scheduling week and associated day records."""
        aligned_start = week_start_date
        week_end_date = aligned_start + timedelta(days=6)

        payload = {
            "account_id": self.account_id,
            "week_start_date": aligned_start.isoformat(),
            "week_end_date": week_end_date.isoformat(),
            "expected_sales_total": expected_sales_total,
            "expected_guest_count": expected_guest_count,
        }

        result = self.client.table("scheduling_weeks").insert(payload).execute()
        week = result.data[0]

        forecasts_by_date = {
            date.fromisoformat(item["date"]): item for item in (day_forecasts or [])
        }

        day_rows = []
        for offset in range(7):
            day_date = aligned_start + timedelta(days=offset)
            forecast = forecasts_by_date.get(day_date, {})
            day_rows.append(
                {
                    "id": str(uuid_generate_v4()),
                    "account_id": self.account_id,
                    "week_id": week["id"],
                    "schedule_date": day_date.isoformat(),
                    "expected_sales": forecast.get("expected_sales"),
                    "expected_guest_count": forecast.get("expected_guest_count"),
                    "created_at": datetime.utcnow().isoformat(),
                }
            )

        self.client.table("scheduling_days").insert(day_rows).execute()
        enriched_week = self.get_week(week["id"])
        if enriched_week:
            return enriched_week
        week["days"] = day_rows
        return week

    def update_week(
        self,
        week_id: str,
        *,
        status: Optional[str] = None,
        expected_sales_total: Optional[float] = None,
        expected_guest_count: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update week status or forecasts."""
        payload: Dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}
        if status:
            payload["status"] = status
        if expected_sales_total is not None:
            payload["expected_sales_total"] = expected_sales_total
        if expected_guest_count is not None:
            payload["expected_guest_count"] = expected_guest_count
        if notes is not None:
            payload["notes"] = notes

        result = (
            self.client.table("scheduling_weeks")
            .update(payload)
            .eq("id", week_id)
            .eq("account_id", self.account_id)
            .execute()
        )
        if not result.data:
            raise ValueError(f"Week {week_id} not found for account {self.account_id}")
        return result.data[0]

    def update_day_forecast(
        self,
        day_id: str,
        *,
        expected_sales: Optional[float] = None,
        expected_guest_count: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update forecast values for a scheduling day."""
        payload: Dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}
        if expected_sales is not None:
            payload["expected_sales"] = expected_sales
        if expected_guest_count is not None:
            payload["expected_guest_count"] = expected_guest_count
        if notes is not None:
            payload["notes"] = notes

        result = (
            self.client.table("scheduling_days")
            .update(payload)
            .eq("id", day_id)
            .eq("account_id", self.account_id)
            .execute()
        )
        if not result.data:
            raise ValueError(f"Scheduling day {day_id} not found for account {self.account_id}")
        return result.data[0]

    # ------------------------------------------------------------------#
    # Helpers
    # ------------------------------------------------------------------#
    @staticmethod
    def _group_by(items: Iterable[Dict[str, Any]], key: str) -> Dict[Any, List[Dict[str, Any]]]:
        grouped: Dict[Any, List[Dict[str, Any]]] = {}
        for item in items:
            grouped.setdefault(item[key], []).append(item)
        return grouped


def uuid_generate_v4() -> str:
    """Helper to generate UUID via Supabase RPC when local uuid unavailable."""
    import uuid

    return str(uuid.uuid4())

