"""
OrderingForecastService
-----------------------
Orchestrates forecast generation using UsageCalculator and ForecastCalculator.

Key Rules:
1. Items need at least 2 orders to be forecasted
2. Uses 28-day window, falls back to 60 days
3. Items only appear on their vendor's delivery dates
4. Provides confidence score and chain-of-thought explanation
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import Dict, Iterable, List, Optional

from database.supabase_client import get_supabase_service_client
from services.ordering.cache_service import OrderingCacheService
from services.ordering.delivery_pattern_service import DeliveryPatternService
from services.ordering.usage_calculator import UsageCalculator
from services.ordering.forecast_calculator import ForecastCalculator

logger = logging.getLogger(__name__)


class OrderingForecastService:
    """Generate and retrieve predictive ordering forecasts."""

    DEFAULT_BUFFER = 0.5
    FORECAST_COUNT = 4

    def __init__(self) -> None:
        self.client = get_supabase_service_client()
        self.cache = OrderingCacheService()
        self.patterns = DeliveryPatternService()
        self.usage_calc = UsageCalculator()
        self.forecast_calc = ForecastCalculator()

    def get_predictions(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]] = None,
    ) -> List[dict]:
        """Return stored forecasts for the user."""
        query = (
            self.client.table("inventory_item_forecasts")
            .select("*, normalized_ingredients(canonical_name)")
            .eq("user_id", user_id)
            .order("vendor_name")
            .order("forecast_date")
            .order("order_index")
        )

        if normalized_item_ids:
            ids = list(normalized_item_ids)
            query = query.in_("normalized_item_id", ids)

        forecasts = query.execute().data or []

        # Enrich with names
        for f in forecasts:
            ingredient = f.pop("normalized_ingredients", None) or {}
            f["canonical_name"] = ingredient.get("canonical_name")
            if not f.get("item_name"):
                f["item_name"] = f.get("canonical_name") or f.get("normalized_item_id")

        return forecasts

    def get_user_buffer(self, user_id: str) -> float:
        """Get user's forecast buffer setting."""
        try:
            result = (
                self.client.table("user_inventory_preferences")
                .select("forecast_buffer")
                .eq("user_id", user_id)
                .execute()
            )
            if result.data and result.data[0].get("forecast_buffer") is not None:
                return float(result.data[0]["forecast_buffer"])
        except Exception:
            pass
        return self.DEFAULT_BUFFER

    def generate_forecasts(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]] = None,
    ) -> None:
        """Generate forecasts for all qualifying items."""
        buffer = self.get_user_buffer(user_id)
        vendor_patterns = self._get_vendor_patterns(user_id)
        item_usage = self.usage_calc.calculate(user_id, normalized_item_ids)

        if not item_usage:
            logger.info(f"[Ordering] No items with sufficient history for user={user_id}")
            return

        today = date.today()
        payload = []

        for item_key, usage in item_usage.items():
            vendor = usage.get("vendor_name")
            if not vendor:
                continue

            # Get delivery dates for this vendor only
            pattern = vendor_patterns.get(vendor, {})
            weekdays = pattern.get("weekdays", [])
            pattern_conf = pattern.get("confidence", 0.5)

            delivery_dates = self.forecast_calc.get_delivery_dates(weekdays, today, self.FORECAST_COUNT)
            if not delivery_dates:
                delivery_dates = self.forecast_calc.estimate_delivery_dates(
                    usage.get("deliveries_per_week", 1.0), today, self.FORECAST_COUNT
                )

            # Calculate forecast
            weekly_usage = usage.get("weekly_case_usage", 0)
            deliveries_per_week = usage.get("deliveries_per_week", 1.0)
            forecast_qty = self.forecast_calc.calculate_quantity(weekly_usage, deliveries_per_week, buffer)
            confidence = self.forecast_calc.calculate_confidence(
                usage.get("window_days", 28), usage.get("order_count", 0), pattern_conf
            )
            explanation = self.forecast_calc.build_explanation(usage, buffer, forecast_qty)

            # Create records for each delivery date
            for idx, delivery_date in enumerate(delivery_dates):
                payload.append(self._build_record(
                    user_id, usage, vendor, delivery_date, idx, today,
                    forecast_qty, confidence, explanation, buffer
                ))

        self._save_forecasts(user_id, payload, today)

    def _get_vendor_patterns(self, user_id: str) -> Dict[str, Dict]:
        """Get vendor delivery patterns as lookup."""
        patterns = self.patterns.get_patterns(user_id)
        return {
            p["vendor_name"]: {
                "weekdays": p.get("delivery_weekdays", []),
                "confidence": p.get("confidence_score", 0.5),
            }
            for p in patterns
        }

    def _build_record(
        self,
        user_id: str,
        usage: Dict,
        vendor: str,
        delivery_date: date,
        order_index: int,
        today: date,
        forecast_qty: int,
        confidence: float,
        explanation: Dict,
        buffer: float,
    ) -> Dict:
        """Build a single forecast record."""
        days_ahead = (delivery_date - today).days
        return {
            "user_id": user_id,
            "normalized_item_id": usage.get("normalized_item_id"),
            "normalized_ingredient_id": usage.get("normalized_ingredient_id"),
            "forecast_date": delivery_date.isoformat(),
            "delivery_date": delivery_date.isoformat(),
            "horizon_days": max(days_ahead, 0),
            "lead_time_days": max(days_ahead, 0),
            "forecast_quantity": float(forecast_qty),
            "vendor_name": vendor,
            "delivery_window_label": self.forecast_calc.format_delivery_label(delivery_date, vendor),
            "order_index": order_index,
            "item_name": usage.get("item_name"),
            "base_unit": usage.get("base_unit", "case"),
            "confidence_score": confidence,
            "forecast_explanation": explanation,
            "data_window_days": usage.get("window_days"),
            "order_count_in_window": usage.get("order_count"),
            "total_cases_in_window": usage.get("total_cases"),
            "weekly_case_usage": usage.get("weekly_case_usage"),
            "buffer_applied": buffer,
            "model_version": "v2_case_based",
            "model_params": {
                "method": "case_based_weekly_average",
                "window_days": usage.get("window_days"),
                "order_count": usage.get("order_count"),
                "buffer": buffer,
            },
            "generated_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

    def _save_forecasts(self, user_id: str, payload: List[Dict], today: date) -> None:
        """Save forecasts to database."""
        if not payload:
            logger.info(f"[Ordering] No forecasts generated for user={user_id}")
            return

        try:
            # Clean old forecasts
            stale = (today - timedelta(days=30)).isoformat()
            self.client.table("inventory_item_forecasts").delete().eq("user_id", user_id).lt("forecast_date", stale).execute()
            self.client.table("inventory_item_forecasts").delete().eq("user_id", user_id).gte("forecast_date", today.isoformat()).execute()

            # Insert new
            self.client.table("inventory_item_forecasts").insert(payload).execute()
            logger.info(f"[Ordering] Generated {len(payload)} forecasts for user={user_id}")
            self.cache.warm_forecasts(user_id, payload)
        except Exception as e:
            logger.exception(f"[Ordering] Failed to save forecasts: {e}")
