"""
OrderingFeatureService
----------------------
Calculates rolling aggregates and engineered metrics for normalized items. The
results are persisted in `inventory_item_features` and feed forecasting.
"""
from __future__ import annotations

import logging
import statistics
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Dict, Iterable, List, Optional, Tuple

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class OrderingFeatureService:
    """Generate rolling features for predictive ordering."""

    LOOKBACK_DAYS = 180

    def __init__(self, *, user_id: str) -> None:
        self.user_id = user_id
        self.client = get_supabase_service_client()

    def refresh_features(
        self,
        normalized_item_ids: Optional[Iterable[str]] = None,
    ) -> None:
        """
        Refresh engineered features for the provided normalized items (or all
        tracked items when none are supplied).
        """
        facts = self._fetch_facts(normalized_item_ids)
        if not facts:
            logger.info("[Ordering] No inventory facts available for feature refresh (user=%s)", self.user_id)
            return

        grouped = self._group_facts_by_item(facts)
        today = date.today()
        feature_rows = []
        usage_rows = []

        for ingredient_id, group in grouped.items():
            entries = group["entries"]
            if not entries:
                continue

            metrics = self._calculate_metrics(entries, today)
            if metrics is None:
                continue

            feature_rows.append(
                {
                    "user_id": self.user_id,
                    "normalized_item_id": group["slug"],
                    "normalized_ingredient_id": ingredient_id,
                    "feature_date": today.isoformat(),
                    "avg_quantity_7d": metrics["avg_7d"],
                    "avg_quantity_28d": metrics["avg_28d"],
                    "avg_quantity_90d": metrics["avg_90d"],
                    "variance_28d": metrics["variance_28d"],
                    "weekday_seasonality": metrics["seasonality"],
                    "lead_time_days": None,  # Placeholder—requires vendor order history
                    "last_delivery_date": metrics["last_delivery"].isoformat(),
                    "generated_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )

            usage = self._calculate_usage(entries, today)
            if usage:
                usage_rows.append(
                    {
                        "user_id": self.user_id,
                        "normalized_item_id": group["slug"],
                        "normalized_ingredient_id": ingredient_id if ingredient_id != group["slug"] else None,
                        "average_weekly_usage": usage["weekly_usage"],
                        "average_reorder_interval_days": usage["reorder_interval"],
                        "deliveries_per_week": usage["deliveries_per_week"],
                        "units_per_delivery": usage["units_per_delivery"],
                        "last_delivery_date": usage["last_delivery"].isoformat(),
                        "last_invoice_item_id": usage["last_invoice_item_id"],
                        "pack_units_per_case": usage["pack_units_per_case"],
                        "suggested_case_label": usage["pack_label"],
                        "generated_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                    }
                )

        if not feature_rows:
            logger.info("[Ordering] No feature rows generated (user=%s)", self.user_id)
            return

        try:
            self.client.table("inventory_item_features").upsert(feature_rows).execute()
            if usage_rows:
                self.client.table("inventory_item_usage_metrics").upsert(usage_rows).execute()
            logger.info(
                "[Ordering] Refreshed ordering features for %s items (user=%s)",
                len(feature_rows),
                self.user_id,
            )
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("[Ordering] Failed to upsert inventory_item_features for user=%s: %s", self.user_id, exc)

    # ---------------------------------------------------------------------#
    # Internal helpers
    # ---------------------------------------------------------------------#
    def _fetch_facts(self, normalized_item_ids: Optional[Iterable[str]]) -> List[Dict]:
        cutoff = (date.today() - timedelta(days=self.LOOKBACK_DAYS)).isoformat()
        query = (
            self.client.table("inventory_item_facts")
            .select(
                "normalized_item_id, normalized_ingredient_id, delivery_date, base_quantity, base_unit, "
                "invoice_item_id, pack_description"
            )
            .eq("user_id", self.user_id)
            .gte("delivery_date", cutoff)
        )
        if normalized_item_ids:
            query = query.in_("normalized_item_id", list(normalized_item_ids))

        result = query.execute()
        return result.data or []

    @staticmethod
    def _group_facts_by_item(
        facts: List[Dict],
    ) -> Dict[str, Dict[str, object]]:
        grouped: Dict[str, Dict[str, object]] = defaultdict(lambda: {"entries": [], "slug": None})
        for fact in facts:
            try:
                delivery = date.fromisoformat(fact["delivery_date"])
            except (TypeError, ValueError):
                continue

            quantity = fact.get("base_quantity")
            if quantity is None:
                continue

            ingredient_id = fact.get("normalized_ingredient_id") or fact["normalized_item_id"]
            group = grouped[ingredient_id]
            group["slug"] = fact.get("normalized_item_id") or ingredient_id
            group["entries"].append(
                (
                    delivery,
                    float(quantity),
                    fact.get("base_unit"),
                    fact.get("invoice_item_id"),
                    fact.get("pack_description"),
                )
            )

        for group in grouped.values():
            group["entries"].sort(key=lambda entry: entry[0], reverse=True)
        return grouped

    @staticmethod
    def _calculate_metrics(
        entries: List[Tuple[date, float, Optional[str]]],
        today: date,
    ) -> Optional[Dict]:
        if not entries:
            return None

        def values_within(days: int) -> List[float]:
            cutoff = today - timedelta(days=days)
            return [qty for delivery, qty, *_ in entries if delivery >= cutoff]

        avg_7d = OrderingFeatureService._safe_average(values_within(7))
        avg_28d = OrderingFeatureService._safe_average(values_within(28))
        avg_90d = OrderingFeatureService._safe_average(values_within(90))

        variance_28d = OrderingFeatureService._safe_variance(values_within(28))

        seasonality_window = today - timedelta(days=28)
        weekday_buckets: Dict[int, List[float]] = defaultdict(list)
        for delivery, qty, *_ in entries:
            if delivery >= seasonality_window:
                weekday_buckets[delivery.weekday()].append(qty)

        if weekday_buckets:
            seasonality = {
                str(weekday): OrderingFeatureService._safe_average(values)
                for weekday, values in weekday_buckets.items()
                if values
            }
        else:
            seasonality = None

        return {
            "avg_7d": avg_7d,
            "avg_28d": avg_28d,
            "avg_90d": avg_90d,
            "variance_28d": variance_28d,
            "seasonality": seasonality,
            "last_delivery": entries[0][0],
        }

    @staticmethod
    def _calculate_usage(
        entries: List[Tuple[date, float, Optional[str]]],
        today: date,
    ) -> Optional[Dict]:
        if len(entries) < 2:
            return None

        deliveries = sorted(entries, key=lambda entry: entry[0])
        total_quantity = sum(quantity for _, quantity, *_ in deliveries)
        span_days = (deliveries[-1][0] - deliveries[0][0]).days or 1
        weeks_span = span_days / 7
        weekly_usage = total_quantity / weeks_span if weeks_span > 0 else total_quantity

        intervals = [
            (deliveries[i][0] - deliveries[i - 1][0]).days
            for i in range(1, len(deliveries))
            if (deliveries[i][0] - deliveries[i - 1][0]).days > 0
        ]
        reorder_interval = sum(intervals) / len(intervals) if intervals else None

        deliveries_per_week = len(deliveries) / weeks_span if weeks_span > 0 else None
        if reorder_interval:
            deliveries_per_week = 7 / reorder_interval

        units_per_delivery = total_quantity / len(deliveries)

        last_delivery = deliveries[-1][0]
        last_delivery_entry = deliveries[-1]
        pack_units_per_case = last_delivery_entry[1] if last_delivery_entry[1] else None
        pack_label = last_delivery_entry[4] or (last_delivery_entry[2] or "case")
        last_invoice_item_id = last_delivery_entry[3]

        return {
            "weekly_usage": weekly_usage,
            "reorder_interval": reorder_interval,
            "deliveries_per_week": deliveries_per_week,
            "units_per_delivery": units_per_delivery,
            "last_delivery": last_delivery,
            "last_invoice_item_id": last_invoice_item_id,
            "pack_units_per_case": pack_units_per_case,
            "pack_label": pack_label,
        }

    @staticmethod
    def _safe_average(values: List[float]) -> Optional[float]:
        if not values:
            return None
        return float(sum(values) / len(values))

    @staticmethod
    def _safe_variance(values: List[float]) -> Optional[float]:
        if not values or len(values) < 2:
            return None
        try:
            return float(statistics.variance(values))
        except statistics.StatisticsError:
            return None


