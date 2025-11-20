from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, Iterable, List, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class LaborSummaryService:
    """Recompute labor summaries for days and weeks."""

    def __init__(self, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()

    def recompute_for_shift(self, *, shift_id: str) -> None:
        """Recompute day/week summaries for a specific shift."""
        shift = (
            self.client.table("scheduling_shifts")
            .select("id, day_id, week_id")
            .eq("id", shift_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        if not shift.data:
            logger.warning("Attempted to recompute shift summaries for missing shift %s", shift_id)
            return

        shift_record = shift.data[0]
        day_id = shift_record["day_id"]
        week_id = shift_record["week_id"]

        self.recompute_day(day_id)
        self.recompute_week(week_id)

    def recompute_day(self, day_id: str) -> None:
        day = (
            self.client.table("scheduling_days")
            .select("id, week_id, schedule_date")
            .eq("id", day_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        if not day.data:
            logger.warning("Cannot recompute labor day summary; day %s not found", day_id)
            return

        schedule_date = day.data[0]["schedule_date"]
        week_id = day.data[0]["week_id"]

        scheduled_minutes, scheduled_cost = self._compute_scheduled_for_day(day_id)
        actual_components = self._compute_actual_for_day(day_id)
        actual_minutes = actual_components["total_minutes"]
        actual_cost = actual_components["total_cost_cents"]

        payload = {
            "account_id": self.account_id,
            "week_id": week_id,
            "day_id": day_id,
            "schedule_date": schedule_date,
            "scheduled_minutes": scheduled_minutes,
            "scheduled_cost_cents": scheduled_cost,
            "actual_minutes": actual_minutes,
            "actual_cost_cents": actual_cost,
            "updated_at": datetime.utcnow().isoformat(),
        }

        self.client.table("scheduling_labor_day_summary").upsert(
            payload,
            on_conflict="account_id,day_id",
        ).execute()

    def recompute_week(self, week_id: str) -> None:
        week = (
            self.client.table("scheduling_weeks")
            .select("id, week_start_date")
            .eq("id", week_id)
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )
        if not week.data:
            logger.warning("Cannot recompute labor week summary; week %s not found", week_id)
            return

        day_ids = self._day_ids_for_week(week_id)
        for day_id in day_ids:
            self.recompute_day(day_id)

        day_summary_result = (
            self.client.table("scheduling_labor_day_summary")
            .select("scheduled_minutes, scheduled_cost_cents, actual_minutes, actual_cost_cents")
            .eq("account_id", self.account_id)
            .eq("week_id", week_id)
            .execute()
        )

        scheduled_minutes = sum(ds.get("scheduled_minutes", 0) for ds in (day_summary_result.data or []))
        scheduled_cost = sum(ds.get("scheduled_cost_cents", 0) for ds in (day_summary_result.data or []))
        week_components = self._aggregate_week_components(day_ids)

        payload = {
            "account_id": self.account_id,
            "week_id": week_id,
            "week_start_date": week.data[0]["week_start_date"],
            "scheduled_minutes": scheduled_minutes,
            "scheduled_cost_cents": scheduled_cost,
            "actual_minutes": week_components["total_minutes"],
            "actual_cost_cents": week_components["total_cost_cents"],
            "updated_at": datetime.utcnow().isoformat(),
        }

        self.client.table("scheduling_labor_week_summary").upsert(
            payload,
            on_conflict="account_id,week_id",
        ).execute()

    def get_week_totals(self, week_id: str) -> Dict:
        week_record = (
            self.client.table("scheduling_weeks")
            .select("scheduled_minutes, scheduled_labor_cents, expected_sales_total")
            .eq("account_id", self.account_id)
            .eq("id", week_id)
            .limit(1)
            .execute()
        )
        if not week_record.data:
            return {}
        totals = week_record.data[0]
        scheduled_sales = totals.get("expected_sales_total") or 0
        labor_cents = totals.get("scheduled_labor_cents") or 0
        totals["labor_percent"] = (
            (labor_cents / 100) / scheduled_sales * 100 if scheduled_sales else None
        )

        week_summary = (
            self.client.table("scheduling_labor_week_summary")
            .select("actual_minutes, actual_cost_cents, variance_minutes, variance_cost_cents")
            .eq("account_id", self.account_id)
            .eq("week_id", week_id)
            .limit(1)
            .execute()
        )
        if week_summary.data:
            summary = week_summary.data[0]
            totals["actual_minutes"] = summary.get("actual_minutes") or 0
            totals["actual_cost_cents"] = summary.get("actual_cost_cents") or 0
            totals["variance_minutes"] = summary.get("variance_minutes")
            totals["variance_cost_cents"] = summary.get("variance_cost_cents")

        day_ids = self._day_ids_for_week(week_id)
        live_components = self._aggregate_week_components(day_ids)
        totals["completed_minutes"] = live_components["completed_minutes"]
        totals["completed_cost_cents"] = live_components["completed_cost_cents"]
        totals["in_progress_minutes"] = live_components["live_minutes"]
        totals["in_progress_cost_cents"] = live_components["live_cost_cents"]
        totals["actual_minutes"] = live_components["total_minutes"]
        totals["actual_cost_cents"] = live_components["total_cost_cents"]

        if scheduled_sales:
            totals["actual_labor_percent"] = (
                (totals["actual_cost_cents"] / 100) / scheduled_sales * 100
            )
        return totals

    # ------------------------------------------------------------------#
    # Internal helpers
    # ------------------------------------------------------------------#
    def _compute_scheduled_for_day(self, day_id: str) -> tuple[int, int]:
        shifts_result = (
            self.client.table("scheduling_shifts")
            .select("id, start_time, end_time, break_minutes, wage_override_cents, assigned_member_id")
            .eq("account_id", self.account_id)
            .eq("day_id", day_id)
            .execute()
        )
        total_minutes = 0
        total_cost = 0

        for shift in shifts_result.data or []:
            duration = self._minutes_between(shift["start_time"], shift["end_time"])
            if duration <= 0:
                continue
            break_minutes = shift.get("break_minutes") or 0
            paid_minutes = max(duration - break_minutes, 0)
            total_minutes += paid_minutes

            hourly_rate_cents = self._resolve_shift_rate(shift)
            if hourly_rate_cents:
                total_cost += int(hourly_rate_cents * (paid_minutes / 60))

        return total_minutes, total_cost

    def _compute_actual_for_day(self, day_id: str) -> Dict[str, int]:
        return self._compute_actual_components(day_id)

    def get_day_actual_components(self, day_id: str) -> Dict[str, int]:
        """Expose completed vs live breakdown for a single day."""
        return self._compute_actual_components(day_id)

    def get_week_actual_components(self, week_id: str) -> Dict[str, int]:
        """Aggregate completed vs live breakdown across a week."""
        day_ids = self._day_ids_for_week(week_id)
        return self._aggregate_week_components(day_ids)

    def _compute_actual_components(self, day_id: str) -> Dict[str, int]:
        shift_ids = self._shift_ids_for_day(day_id)
        if not shift_ids:
            return {
                "completed_minutes": 0,
                "completed_cost_cents": 0,
                "live_minutes": 0,
                "live_cost_cents": 0,
                "total_minutes": 0,
                "total_cost_cents": 0,
            }

        entries = (
            self.client.table("scheduling_shift_clock_entries")
            .select("total_minutes, break_minutes, effective_rate_cents, shift_id")
            .eq("account_id", self.account_id)
            .in_("shift_id", shift_ids)
            .execute()
        )

        completed_minutes = 0
        completed_cost = 0
        for entry in entries.data or []:
            minutes = max(entry.get("total_minutes") or 0, 0)
            break_minutes = max(entry.get("break_minutes") or 0, 0)
            paid_minutes = max(minutes - break_minutes, 0)
            rate_cents = entry.get("effective_rate_cents") or 0

            completed_minutes += paid_minutes
            completed_cost += int(rate_cents * (paid_minutes / 60))

        live_sessions = (
            self.client.table("scheduling_shift_live_sessions")
            .select("started_at, started_rate_cents, started_rate_type, shift_id")
            .eq("account_id", self.account_id)
            .in_("shift_id", shift_ids)
            .execute()
        )

        live_minutes = 0
        live_cost = 0
        now = datetime.now(timezone.utc)
        for session in live_sessions.data or []:
            started_at_raw = session.get("started_at")
            if not started_at_raw:
                continue
            try:
                started_at = datetime.fromisoformat(started_at_raw)
            except ValueError:
                continue
            elapsed_minutes = max(int((now - started_at).total_seconds() // 60), 0)
            rate_cents = session.get("started_rate_cents") or 0
            rate_type = (session.get("started_rate_type") or "hourly").lower()

            live_minutes += elapsed_minutes
            if rate_type != "salary":
                live_cost += int(rate_cents * (elapsed_minutes / 60))

        total_minutes = completed_minutes + live_minutes
        total_cost = completed_cost + live_cost

        return {
            "completed_minutes": completed_minutes,
            "completed_cost_cents": completed_cost,
            "live_minutes": live_minutes,
            "live_cost_cents": live_cost,
            "total_minutes": total_minutes,
            "total_cost_cents": total_cost,
        }

    def _shift_ids_for_day(self, day_id: str) -> Iterable[str]:
        result = (
            self.client.table("scheduling_shifts")
            .select("id")
            .eq("account_id", self.account_id)
            .eq("day_id", day_id)
            .execute()
        )
        return [row["id"] for row in (result.data or [])]

    def _day_ids_for_week(self, week_id: str) -> List[str]:
        result = (
            self.client.table("scheduling_days")
            .select("id")
            .eq("account_id", self.account_id)
            .eq("week_id", week_id)
            .execute()
        )
        return [row["id"] for row in (result.data or [])]

    def _aggregate_week_components(self, day_ids: List[str]) -> Dict[str, int]:
        totals = {
            "completed_minutes": 0,
            "completed_cost_cents": 0,
            "live_minutes": 0,
            "live_cost_cents": 0,
            "total_minutes": 0,
            "total_cost_cents": 0,
        }
        for day_id in day_ids:
            components = self._compute_actual_components(day_id)
            totals["completed_minutes"] += components["completed_minutes"]
            totals["completed_cost_cents"] += components["completed_cost_cents"]
            totals["live_minutes"] += components["live_minutes"]
            totals["live_cost_cents"] += components["live_cost_cents"]
        totals["total_minutes"] = totals["completed_minutes"] + totals["live_minutes"]
        totals["total_cost_cents"] = totals["completed_cost_cents"] + totals["live_cost_cents"]
        return totals

    def _resolve_shift_rate(self, shift: Dict) -> Optional[int]:
        override = shift.get("wage_override_cents")
        if override:
            return int(override)
        member_id = shift.get("assigned_member_id")
        if not member_id:
            return None
        result = (
            self.client.table("account_member_compensation")
            .select("rate_cents")
            .eq("account_id", self.account_id)
            .eq("user_id", member_id)
            .is_("ends_at", None)
            .limit(1)
            .execute()
        )
        if result.data:
            return int(result.data[0].get("rate_cents") or 0)
        return None

    @staticmethod
    def _minutes_between(start_time: str, end_time: str) -> int:
        if not start_time or not end_time:
            return 0
        start = datetime.strptime(start_time, "%H:%M:%S")
        end = datetime.strptime(end_time, "%H:%M:%S")
        delta = end - start
        return max(int(delta.total_seconds() // 60), 0)

