"""
OrderingForecastService
-----------------------
Provides lightweight forecasting backed by rolling averages until a more
advanced model is integrated. Forecasts are stored in
`inventory_item_forecasts` and cached for fast retrieval.
"""
from __future__ import annotations

import logging
import math
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
from uuid import UUID

from database.supabase_client import get_supabase_service_client
from services.ordering.cache_service import OrderingCacheService
from services.ordering.delivery_pattern_service import DeliveryPatternService

logger = logging.getLogger(__name__)


class OrderingForecastService:
    """Generate and retrieve predictive ordering forecasts."""

    DEFAULT_HORIZON_DAYS = 7

    def __init__(self) -> None:
        self.client = get_supabase_service_client()
        self.cache = OrderingCacheService()
        self.delivery_patterns = DeliveryPatternService()

    def get_predictions(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]] = None,
    ) -> List[dict]:
        """
        Return forecast records for the given user (optionally filtered by
        normalized item).
        """
        query = (
            self.client.table("inventory_item_forecasts")
            .select("*, normalized_ingredients(canonical_name)")
            .eq("user_id", user_id)
            .order("forecast_date", desc=True)
        )
        if normalized_item_ids:
            ingredient_ids, slug_ids = self._split_identifiers(normalized_item_ids)
            if ingredient_ids:
                query = query.in_("normalized_ingredient_id", ingredient_ids)
            elif slug_ids:
                query = query.in_("normalized_item_id", slug_ids)

        result = query.execute()
        forecasts = result.data or []

        ingredient_ids = {
            forecast.get("normalized_ingredient_id") for forecast in forecasts if forecast.get("normalized_ingredient_id")
        }
        price_map: Dict[str, Dict] = {}
        if ingredient_ids:
            try:
                price_result = (
                    self.client.table("ingredient_price_history")
                    .select("normalized_ingredient_id, vendor_name, base_unit, invoice_date")
                    .in_("normalized_ingredient_id", list(ingredient_ids))
                    .order("invoice_date", desc=True)
                    .execute()
                )
                for row in price_result.data or []:
                    ingredient_id = row["normalized_ingredient_id"]
                    if ingredient_id not in price_map:
                        price_map[ingredient_id] = row
            except Exception as exc:  # pylint: disable=broad-except
                logger.debug("[Ordering] Failed to fetch price history for enrichment: %s", exc)

        # Augment with base_unit from metadata when present.
        for forecast in forecasts:
            normalized_ingredient = forecast.pop("normalized_ingredients", None) or {}
            if normalized_ingredient:
                forecast["canonical_name"] = normalized_ingredient.get("canonical_name")

            params = forecast.get("model_params") or {}
            forecast["base_unit"] = params.get("base_unit")
            self._inject_usage_metadata(forecast, params)

            if not forecast.get("item_name"):
                forecast["item_name"] = forecast.get("canonical_name") or forecast.get("normalized_item_id")

            ingredient_id = forecast.get("normalized_ingredient_id")

            price_info = price_map.get(ingredient_id) if ingredient_id else None
            if price_info:
                forecast.setdefault("vendor_name", price_info.get("vendor_name"))
                if not forecast.get("base_unit"):
                    forecast["base_unit"] = price_info.get("base_unit")

            if forecast.get("vendor_name"):
                continue

            # Fallback enrichment via invoice lineage when price history is missing
            try:
                # Get the most recent fact for this normalized item to get names
                fact_query = (
                    self.client.table("inventory_item_facts")
                    .select("invoice_item_id")
                    .eq("user_id", user_id)
                    .order("delivery_date", desc=True)
                    .limit(1)
                )
                if ingredient_id:
                    fact_query = fact_query.eq("normalized_ingredient_id", ingredient_id)
                else:
                    fact_query = fact_query.eq("normalized_item_id", forecast["normalized_item_id"])

                fact_result = fact_query.execute()
                if fact_result.data:
                    fact = fact_result.data[0]
                    invoice_item_id = fact.get("invoice_item_id")

                    # Get the original invoice item to extract names
                    item_result = self.client.table("invoice_items").select(
                        "description, invoice_id"
                    ).eq("id", invoice_item_id).execute()

                    if item_result.data:
                        item = item_result.data[0]
                        forecast["item_name"] = item.get("description", forecast["normalized_item_id"])

                        # Get vendor name from invoice
                        invoice_result = self.client.table("invoices").select(
                            "vendor_name"
                        ).eq("id", item.get("invoice_id")).execute()

                        if invoice_result.data:
                            forecast["vendor_name"] = invoice_result.data[0].get("vendor_name")
            except Exception as e:
                logger.debug(f"Could not enrich forecast {forecast['id']} with names: {e}")
                forecast.setdefault("item_name", forecast.get("normalized_item_id"))

        # Warm cache so subsequent calls are instant.
        try:
            self.cache.warm_forecasts(user_id, forecasts)
        except Exception as exc:  # pylint: disable=broad-except
            logger.warning("[Ordering] Failed to warm forecast cache for user=%s: %s", user_id, exc)

        return forecasts

    def generate_forecasts(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]] = None,
    ) -> None:
        """
        Generate baseline forecasts using rolling averages and persist them in
        the forecasts table.
        """
        features = self._fetch_latest_features(user_id, normalized_item_ids)
        if not features:
            logger.info("[Ordering] No features available for forecasting (user=%s)", user_id)
            return

        latest_units = self._fetch_latest_units(user_id, normalized_item_ids)
        usage_metrics = self._fetch_usage_metrics(user_id, normalized_item_ids)
        vendor_map = self._resolve_vendor_map(
            user_id,
            [
                info["invoice_item_id"]
                for info in latest_units.values()
                if info.get("invoice_item_id")
            ],
        )
        vendor_weekdays = self._build_vendor_pattern_map(user_id)

        today = date.today()
        payload = []

        for feature in features:
            ingredient_id = feature.get("normalized_ingredient_id")
            slug = feature.get("normalized_item_id")
            item_key = ingredient_id or slug

            baseline_quantity, source = self._coalesce_forecast_value(feature)
            forecast_quantity = baseline_quantity

            latest_info = latest_units.get(item_key) or {}
            base_unit = latest_info.get("base_unit")
            invoice_item_id = latest_info.get("invoice_item_id")
            vendor_name = vendor_map.get(invoice_item_id)
            delivery_dates = self._next_delivery_dates(
                vendor_weekdays.get(vendor_name or "", []),
                today=today,
            )
            if not delivery_dates:
                delivery_dates = [today + timedelta(days=self.DEFAULT_HORIZON_DAYS)]

            for delivery_date in delivery_dates:
                days_ahead = (delivery_date - today).days
                usage = usage_metrics.get(slug)
                model_usage_params: Dict[str, Optional[float | str | int]] = {}
                if usage:
                    weekly_usage = self._safe_float(usage.get("average_weekly_usage"))
                    deliveries_per_week = self._safe_float(usage.get("deliveries_per_week"))
                    pattern_weekdays = vendor_weekdays.get(vendor_name or "", [])
                    pattern_deliveries = len(pattern_weekdays) if pattern_weekdays else None
                    if (not deliveries_per_week or deliveries_per_week <= 0) and pattern_deliveries:
                        deliveries_per_week = float(pattern_deliveries)
                    if not deliveries_per_week or deliveries_per_week <= 0:
                        deliveries_per_week = 1.0

                    per_delivery_units = self._safe_float(usage.get("units_per_delivery"))
                    if per_delivery_units is None and weekly_usage is not None:
                        per_delivery_units = weekly_usage / deliveries_per_week
                    if per_delivery_units is not None and per_delivery_units > 0:
                        forecast_quantity = per_delivery_units
                        source = "usage_per_delivery"

                    pack_units = self._safe_float(usage.get("pack_units_per_case")) or per_delivery_units
                    suggested_boxes = None
                    if pack_units and pack_units > 0 and per_delivery_units:
                        suggested_boxes = max(1, math.ceil(per_delivery_units / pack_units))

                    model_usage_params.update(
                        {
                            "avg_weekly_usage": weekly_usage,
                            "deliveries_per_week": deliveries_per_week,
                            "units_per_delivery": per_delivery_units,
                            "pack_units_per_case": pack_units,
                            "suggested_boxes": suggested_boxes,
                            "pack_label": usage.get("suggested_case_label"),
                            "last_ordered_at": usage.get("last_delivery_date"),
                        }
                    )

                lower_bound, upper_bound = self._compute_bounds(feature, forecast_quantity)
                record = {
                    "user_id": user_id,
                    "normalized_item_id": slug,
                    "normalized_ingredient_id": ingredient_id,
                    "forecast_date": delivery_date.isoformat(),
                    "delivery_date": delivery_date.isoformat(),
                    "horizon_days": max(days_ahead, 0),
                    "lead_time_days": max(days_ahead, 0),
                    "forecast_quantity": float(forecast_quantity),
                    "lower_bound": float(lower_bound) if lower_bound is not None else None,
                    "upper_bound": float(upper_bound) if upper_bound is not None else None,
                    "vendor_name": vendor_name,
                    "delivery_window_label": self._format_delivery_label(delivery_date, vendor_name),
                    "model_version": "baseline_v1",
                    "model_params": {
                        "method": "rolling_average",
                        "source": source,
                        "base_unit": base_unit,
                        **{k: v for k, v in model_usage_params.items() if v is not None},
                    },
                    "generated_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
                payload.append(record)

        if not payload:
            logger.info("[Ordering] Forecast generation produced no records (user=%s)", user_id)
            return

        try:
            self.client.table("inventory_item_forecasts").upsert(payload).execute()
            logger.info("[Ordering] Generated %s forecasts for user=%s", len(payload), user_id)
            self.cache.warm_forecasts(user_id, payload)
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("[Ordering] Failed to upsert inventory_item_forecasts for user=%s: %s", user_id, exc)

    # ------------------------------------------------------------------#
    # Internal helpers
    # ------------------------------------------------------------------#
    def _fetch_latest_features(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]],
    ) -> List[Dict]:
        today = date.today().isoformat()
        query = (
            self.client.table("inventory_item_features")
            .select("*")
            .eq("user_id", user_id)
            .eq("feature_date", today)
        )
        if normalized_item_ids:
            ingredient_ids, slug_ids = self._split_identifiers(normalized_item_ids)
            if ingredient_ids:
                query = query.in_("normalized_ingredient_id", ingredient_ids)
            elif slug_ids:
                query = query.in_("normalized_item_id", slug_ids)

        result = query.execute()
        return result.data or []

    def _fetch_latest_units(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]],
    ) -> Dict[str, Dict[str, Optional[str]]]:
        """Return the most recent base_unit and lineage info for each normalized item."""
        query = (
            self.client.table("inventory_item_facts")
            .select("normalized_item_id, normalized_ingredient_id, base_unit, delivery_date, invoice_item_id")
            .eq("user_id", user_id)
            .order("delivery_date", desc=True)
        )
        if normalized_item_ids:
            ingredient_ids, slug_ids = self._split_identifiers(normalized_item_ids)
            if ingredient_ids:
                query = query.in_("normalized_ingredient_id", ingredient_ids)
            elif slug_ids:
                query = query.in_("normalized_item_id", slug_ids)

        result = query.execute()
        rows = result.data or []

        latest_units: Dict[str, Dict[str, Optional[str]]] = {}
        for row in rows:
            ingredient_id = row.get("normalized_ingredient_id")
            slug = row.get("normalized_item_id")
            key = ingredient_id or slug
            if key and key not in latest_units:
                latest_units[key] = {
                    "base_unit": row.get("base_unit"),
                    "invoice_item_id": row.get("invoice_item_id"),
                }
        return latest_units

    @staticmethod
    def _coalesce_forecast_value(feature: Dict) -> (float, str):
        """Select the best available rolling average for forecasting."""
        for key in ("avg_quantity_28d", "avg_quantity_90d", "avg_quantity_7d"):
            value = feature.get(key)
            if value is not None:
                return float(value), key
        return 0.0, "fallback_zero"

    @staticmethod
    def _compute_bounds(feature: Dict, forecast_quantity: float) -> (Optional[float], Optional[float]):
        variance = feature.get("variance_28d")
        if variance is None or variance < 0:
            return None, None

        std_dev = math.sqrt(variance)
        lower = max(forecast_quantity - 1.96 * std_dev, 0)
        upper = forecast_quantity + 1.96 * std_dev
        return lower, upper

    @staticmethod
    def _split_identifiers(values: Sequence[str]) -> Tuple[List[str], List[str]]:
        uuid_values: List[str] = []
        slug_values: List[str] = []
        for value in values:
            try:
                UUID(str(value))
            except (ValueError, TypeError):
                slug_values.append(value)
            else:
                uuid_values.append(value)
        return uuid_values, slug_values

    def _resolve_vendor_map(self, user_id: str, invoice_item_ids: Sequence[str]) -> Dict[str, Optional[str]]:
        if not invoice_item_ids:
            return {}

        result = {}
        ids = [value for value in invoice_item_ids if value]
        if not ids:
            return result

        for chunk_start in range(0, len(ids), 200):
            chunk = ids[chunk_start : chunk_start + 200]
            items_result = (
                self.client.table("invoice_items")
                .select("id, invoice_id")
                .in_("id", chunk)
                .execute()
            )
            invoice_ids = [row["invoice_id"] for row in items_result.data or [] if row.get("invoice_id")]
            if not invoice_ids:
                continue

            invoice_map = {}
            for invoice_chunk_start in range(0, len(invoice_ids), 200):
                invoice_chunk = invoice_ids[invoice_chunk_start : invoice_chunk_start + 200]
                invoices_result = (
                    self.client.table("invoices")
                    .select("id, vendor_name")
                    .eq("user_id", user_id)
                    .in_("id", invoice_chunk)
                    .execute()
                )
                for invoice in invoices_result.data or []:
                    invoice_map[invoice["id"]] = invoice.get("vendor_name")

            for row in items_result.data or []:
                vendor = invoice_map.get(row.get("invoice_id"))
                result[row["id"]] = vendor
        return result

    def _build_vendor_pattern_map(self, user_id: str) -> Dict[str, List[int]]:
        try:
            patterns = self.delivery_patterns.get_patterns(user_id)
        except Exception:  # pylint: disable=broad-except
            return {}

        pattern_map: Dict[str, List[int]] = {}
        for row in patterns or []:
            vendor_name = (row.get("vendor_name") or "").strip()
            if not vendor_name:
                continue
            weekdays = row.get("delivery_weekdays") or []
            pattern_map[vendor_name] = [int(day) for day in weekdays if isinstance(day, int)]
        return pattern_map

    def _fetch_usage_metrics(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]],
    ) -> Dict[str, Dict]:
        query = (
            self.client.table("inventory_item_usage_metrics")
            .select("*")
            .eq("user_id", user_id)
        )
        if normalized_item_ids:
            ingredient_ids, slug_ids = self._split_identifiers(normalized_item_ids)
            if slug_ids:
                query = query.in_("normalized_item_id", slug_ids)
            elif ingredient_ids:
                query = query.in_("normalized_ingredient_id", ingredient_ids)

        result = query.execute()
        rows = result.data or []
        return {row["normalized_item_id"]: row for row in rows if row.get("normalized_item_id")}

    @staticmethod
    def _next_delivery_dates(weekdays: Sequence[int], *, today: date, count: int = 4) -> List[date]:
        if not weekdays:
            return []

        weekdays_set = {day % 7 for day in weekdays}
        dates: List[date] = []
        cursor = today
        while len(dates) < count and (cursor - today).days <= 60:
            if cursor.weekday() in weekdays_set:
                dates.append(cursor)
            cursor += timedelta(days=1)
        return dates

    @staticmethod
    def _format_delivery_label(delivery_date: date, vendor_name: Optional[str]) -> str:
        label = delivery_date.strftime("%A, %b %d").replace(" 0", " ")
        if vendor_name:
            return f"{vendor_name} • {label}"
        return label

    @staticmethod
    def _safe_float(value) -> Optional[float]:
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _inject_usage_metadata(forecast: Dict, params: Dict) -> None:
        usage_fields = (
            "avg_weekly_usage",
            "suggested_boxes",
            "pack_label",
            "last_ordered_at",
            "units_per_delivery",
            "deliveries_per_week",
        )
        for field in usage_fields:
            value = params.get(field)
            if value is None:
                continue
            if field == "suggested_boxes":
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    continue
            elif field in {"avg_weekly_usage", "units_per_delivery", "deliveries_per_week"}:
                try:
                    value = float(value)
                except (TypeError, ValueError):
                    continue
            forecast[field] = value


