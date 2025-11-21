"""
DeliveryPatternService
----------------------

Detect recurring vendor delivery weekdays so predictive ordering can align
forecasts to real delivery windows.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Dict, Iterable, List, Sequence, Set, Tuple

from database.supabase_client import get_supabase_service_client


class DeliveryPatternService:
    """Analyze and persist vendor delivery weekday patterns."""

    LOOKBACK_DAYS = 180
    MIN_WEEKS_REQUIRED = 6
    CONSISTENCY_THRESHOLD = 0.8
    RECENT_WINDOW_DAYS = 35
    RECENT_MIN_DELIVERIES = 6
    MAX_FACT_ROWS = 2000
    CHUNK_SIZE = 200

    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    # ------------------------------------------------------------------#
    # Public APIs
    # ------------------------------------------------------------------#
    def get_patterns(self, user_id: str) -> List[Dict]:
        """Return stored delivery schedules for the user."""
        result = (
            self.client.table("vendor_delivery_schedules")
            .select("*")
            .eq("user_id", user_id)
            .order("vendor_name")
            .execute()
        )
        return result.data or []

    def detect_and_save(self, user_id: str) -> List[Dict]:
        """Analyze vendor deliveries, persist schedules, and return the latest rows."""
        patterns = self.analyze_vendor_delivery_patterns(user_id)
        self.save_patterns(user_id, patterns)
        return self.get_patterns(user_id)

    def analyze_vendor_delivery_patterns(self, user_id: str) -> List[Dict]:
        """Infer vendor delivery weekdays from the normalized invoice facts."""
        records = self._fetch_delivery_records(user_id)
        if not records:
            return []

        recent_cutoff = date.today() - timedelta(days=self.RECENT_WINDOW_DAYS)
        vendor_stats = self._build_weekday_stats(records, recent_cutoff=recent_cutoff)
        patterns: List[Dict] = []

        for vendor_name, stats in vendor_stats.items():
            weekdays: List[int] = []
            confidence_values: List[float] = []
            detection_method = "historical"

            total_weeks = len(stats["weeks"])
            if total_weeks >= self.MIN_WEEKS_REQUIRED:
                for weekday, weeks in stats["weekday_weeks"].items():
                    frequency = len(weeks) / total_weeks
                    if frequency >= self.CONSISTENCY_THRESHOLD:
                        weekdays.append(weekday)
                        confidence_values.append(frequency)

            if not weekdays:
                recent_total = stats.get("recent_total", 0)
                recent_counts: Dict[int, int] = stats.get("recent_counts", {}) or {}
                if recent_total >= self.RECENT_MIN_DELIVERIES:
                    for weekday, count in recent_counts.items():
                        if count >= 2:
                            weekdays.append(weekday)
                            confidence_values.append(count / recent_total if recent_total else 0)
                    if weekdays:
                        detection_method = "recent_window"

            if not weekdays:
                continue

            avg_confidence = sum(confidence_values) / len(confidence_values)
            patterns.append(
                {
                    "vendor_name": vendor_name,
                    "delivery_weekdays": sorted(set(weekdays)),
                    "confidence_score": round(avg_confidence, 2),
                    "detection_method": detection_method,
                }
            )

        return sorted(patterns, key=lambda row: row["vendor_name"].lower())

    def save_patterns(self, user_id: str, patterns: Sequence[Dict]) -> None:
        """Upsert detected schedules and remove stale vendors."""
        pattern_list = list(patterns or [])
        vendor_names = {row["vendor_name"] for row in pattern_list}

        existing_result = (
            self.client.table("vendor_delivery_schedules")
            .select("id, vendor_name")
            .eq("user_id", user_id)
            .execute()
        )
        existing_rows = existing_result.data or []
        stale_ids = [row["id"] for row in existing_rows if row.get("vendor_name") not in vendor_names]

        if stale_ids:
            for chunk in self._chunked(stale_ids):
                (
                    self.client.table("vendor_delivery_schedules")
                    .delete()
                    .in_("id", chunk)
                    .execute()
                )

        if not pattern_list:
            return

        now = datetime.utcnow().isoformat()
        payload = [
            {
                "user_id": user_id,
                "vendor_name": row["vendor_name"],
                "delivery_weekdays": row["delivery_weekdays"],
                "confidence_score": row["confidence_score"],
                "detection_method": row.get("detection_method", "historical"),
                "last_detected_at": now,
                "updated_at": now,
            }
            for row in pattern_list
        ]

        (
            self.client.table("vendor_delivery_schedules")
            .upsert(payload, on_conflict="user_id,vendor_name")
            .execute()
        )

    # ------------------------------------------------------------------#
    # Internal helpers
    # ------------------------------------------------------------------#
    def _fetch_delivery_records(self, user_id: str) -> List[Tuple[str, date]]:
        """Fetch vendor + delivery_date tuples for the lookback window."""
        cutoff = (date.today() - timedelta(days=self.LOOKBACK_DAYS)).isoformat()
        facts_result = (
            self.client.table("inventory_item_facts")
            .select("invoice_item_id, delivery_date")
            .eq("user_id", user_id)
            .gte("delivery_date", cutoff)
            .order("delivery_date", desc=True)
            .limit(self.MAX_FACT_ROWS)
            .execute()
        )
        facts = facts_result.data or []
        invoice_item_ids = {row.get("invoice_item_id") for row in facts if row.get("invoice_item_id")}
        if not invoice_item_ids:
            return []

        invoice_item_map = self._fetch_invoice_item_map(invoice_item_ids)
        invoice_ids = {invoice_id for invoice_id in invoice_item_map.values() if invoice_id}
        if not invoice_ids:
            return []

        invoice_vendor_map = self._fetch_invoice_vendor_map(invoice_ids, user_id)
        records: List[Tuple[str, date]] = []
        for row in facts:
            invoice_item_id = row.get("invoice_item_id")
            invoice_id = invoice_item_map.get(invoice_item_id)
            vendor_name = invoice_vendor_map.get(invoice_id)
            delivery_date_str = row.get("delivery_date")
            if not vendor_name or not delivery_date_str:
                continue
            try:
                delivery_dt = date.fromisoformat(delivery_date_str)
            except ValueError:
                continue
            records.append((vendor_name, delivery_dt))
        return records

    def _fetch_invoice_item_map(self, invoice_item_ids: Iterable[str]) -> Dict[str, str]:
        mapping: Dict[str, str] = {}
        ids = [item_id for item_id in invoice_item_ids if item_id]
        if not ids:
            return mapping

        for chunk in self._chunked(ids):
            result = (
                self.client.table("invoice_items")
                .select("id, invoice_id")
                .in_("id", chunk)
                .execute()
            )
            for row in result.data or []:
                mapping[row["id"]] = row.get("invoice_id")
        return mapping

    def _fetch_invoice_vendor_map(self, invoice_ids: Iterable[str], user_id: str) -> Dict[str, str]:
        mapping: Dict[str, str] = {}
        ids = [invoice_id for invoice_id in invoice_ids if invoice_id]
        if not ids:
            return mapping

        for chunk in self._chunked(ids):
            result = (
                self.client.table("invoices")
                .select("id, vendor_name")
                .eq("user_id", user_id)
                .in_("id", chunk)
                .execute()
            )
            for row in result.data or []:
                vendor = (row.get("vendor_name") or "").strip()
                if not vendor:
                    continue
                mapping[row["id"]] = vendor
        return mapping

    @staticmethod
    def _build_weekday_stats(
        records: Sequence[Tuple[str, date]],
        *,
        recent_cutoff: date,
    ) -> Dict[str, Dict]:
        stats: Dict[str, Dict] = {}
        for vendor_name, delivery_dt in records:
            key = vendor_name.strip()
            if not key:
                continue
            vendor_stat = stats.setdefault(
                key,
                {
                    "weeks": set(),
                    "weekday_weeks": defaultdict(set),
                    "recent_counts": defaultdict(int),
                    "recent_total": 0,
                },
            )
            iso_year, iso_week, _ = delivery_dt.isocalendar()
            week_key = (iso_year, iso_week)
            vendor_stat["weeks"].add(week_key)
            weekday = delivery_dt.weekday()
            vendor_stat["weekday_weeks"][weekday].add(week_key)
            if delivery_dt >= recent_cutoff:
                vendor_stat["recent_counts"][weekday] += 1
                vendor_stat["recent_total"] += 1
        return stats

    @classmethod
    def _chunked(cls, values: Sequence[str]) -> Iterable[Sequence[str]]:
        size = cls.CHUNK_SIZE
        for idx in range(0, len(values), size):
            yield values[idx : idx + size]

