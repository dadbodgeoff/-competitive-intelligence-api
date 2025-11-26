"""
OrderingNormalizationService
----------------------------
Transforms raw invoice_items rows into normalized facts stored in
`inventory_item_facts`. This keeps predictive ordering derived data
decoupled from the invoice source-of-truth.
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Dict, Iterable, List, Optional

from database.supabase_client import get_supabase_service_client
from services.price_analytics_service import normalize_item_name
from services.unit_converter import UnitConverter

logger = logging.getLogger(__name__)


class OrderingNormalizationService:
    """Normalize invoice items into inventory_item_facts."""

    DEFAULT_LOOKBACK_DAYS = 365

    def __init__(self, *, user_id: str) -> None:
        self.user_id = user_id
        self.client = get_supabase_service_client()
        self.converter = UnitConverter()
        self._ingredient_cache: Dict[str, str] = {}

    def normalize_invoice_items(
        self,
        invoice_item_ids: Optional[Iterable[str]] = None,
    ) -> None:
        """
        Normalize the specified invoice items (or recent items when none are
        provided) into the inventory_item_facts table.
        """
        records = self._fetch_invoice_items(invoice_item_ids)
        if not records:
            logger.info("[Ordering] No invoice items found for normalization (user=%s)", self.user_id)
            return

        facts_payload = []
        mappings_payload = []
        price_history_payload = []
        log_payload = []
        seen_invoice_item_ids = set()

        for record in records:
            invoice_item_id = record["id"]
            if invoice_item_id in seen_invoice_item_ids:
                continue  # Supabase sometimes returns duplicates when joins are involved
            seen_invoice_item_ids.add(invoice_item_id)

            fact = self._build_fact_record(record)
            if fact:
                ingredient_id = fact["normalized_ingredient_id"]
                facts_payload.append(fact)

                mapping_record = self._build_mapping_record(record, fact, ingredient_id)
                if mapping_record:
                    mappings_payload.append(mapping_record)

                price_record = self._build_price_history_record(record, fact, ingredient_id)
                if price_record:
                    price_history_payload.append(price_record)

                log_record = self._build_log_record(record, fact, ingredient_id)
                if log_record:
                    log_payload.append(log_record)

        if not facts_payload:
            logger.info("[Ordering] No valid normalization records produced (user=%s)", self.user_id)
            return

        try:
            self.client.table("inventory_item_facts").upsert(
                facts_payload,
                on_conflict="user_id,invoice_item_id",
            ).execute()
            logger.info(
                "[Ordering] Normalized %s invoice items for user=%s",
                len(facts_payload),
                self.user_id,
            )
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("[Ordering] Failed to upsert inventory_item_facts for user=%s: %s", self.user_id, exc)

        if mappings_payload:
            try:
                self.client.table("ingredient_mappings").upsert(
                    mappings_payload,
                    on_conflict="invoice_item_id",
                ).execute()
                logger.info(
                    "[Ordering] Upserted %s ingredient mappings for user=%s",
                    len(mappings_payload),
                    self.user_id,
                )
            except Exception as exc:  # pylint: disable=broad-except
                logger.exception("[Ordering] Failed to upsert ingredient_mappings for user=%s: %s", self.user_id, exc)

        if price_history_payload:
            try:
                self.client.table("ingredient_price_history").upsert(
                    price_history_payload,
                    on_conflict="invoice_item_id",
                ).execute()
                logger.info(
                    "[Ordering] Upserted %s ingredient price records for user=%s",
                    len(price_history_payload),
                    self.user_id,
                )
            except Exception as exc:  # pylint: disable=broad-except
                logger.exception("[Ordering] Failed to upsert ingredient_price_history for user=%s: %s", self.user_id, exc)

        if log_payload:
            try:
                self.client.table("invoice_item_logs").insert(log_payload).execute()
            except Exception as exc:  # pylint: disable=broad-except
                logger.exception("[Ordering] Failed to insert invoice_item_logs for user=%s: %s", self.user_id, exc)

    # ---------------------------------------------------------------------#
    # Internal helpers
    # ---------------------------------------------------------------------#
    def _fetch_invoice_items(
        self,
        invoice_item_ids: Optional[Iterable[str]],
    ) -> list:
        """Fetch invoice items (with invoice header join) for normalization."""
        query = (
            self.client.table("invoice_items")
            .select(
                "id, description, quantity, pack_size, unit_price, extended_price, category, "
                "invoices!inner(id, user_id, invoice_date, invoice_number, vendor_name)"
            )
            .eq("invoices.user_id", self.user_id)
        )

        if invoice_item_ids:
            query = query.in_("id", list(invoice_item_ids))
        else:
            cutoff = (date.today() - timedelta(days=self.DEFAULT_LOOKBACK_DAYS)).isoformat()
            query = query.gte("invoices.invoice_date", cutoff)

        result = query.execute()
        return result.data or []

    def _build_fact_record(self, record: Dict) -> Optional[Dict]:
        """Convert a raw invoice_item row into a normalized fact payload."""
        invoice_info = record.get("invoices") or {}
        invoice_date = invoice_info.get("invoice_date")
        if not invoice_date:
            return None

        quantity = self._safe_decimal(record.get("quantity"))
        if quantity is None:
            quantity = Decimal("0")

        pack_size = (record.get("pack_size") or "").strip()
        description = record.get("description") or "Unknown Item"
        normalized_item_id = normalize_item_name(description)

        anomaly_flags = []
        metadata: Dict[str, Optional[str]] = {
            "pack_size": pack_size or None,
            "unit_price": record.get("unit_price"),
            "extended_price": record.get("extended_price"),
        }

        try:
            if pack_size:
                total_quantity, base_unit = self.converter.calculate_total_quantity(pack_size, quantity)
            else:
                anomaly_flags.append("missing_pack_size")
                total_quantity = Decimal(quantity)
                base_unit = "ea"
        except Exception as exc:  # pylint: disable=broad-except
            logger.warning(
                "[Ordering] Failed to convert pack size '%s' (user=%s, item=%s): %s",
                pack_size,
                self.user_id,
                record.get("id"),
                exc,
            )
            anomaly_flags.append("pack_size_conversion_failed")
            total_quantity = Decimal(quantity)
            base_unit = "ea"

        if total_quantity is None:
            total_quantity = Decimal("0")

        if base_unit is None:
            base_unit = "ea"

        if total_quantity <= 0:
            anomaly_flags.append("non_positive_quantity")

        metadata.update(
            {
                "original_quantity": str(quantity),
                "converted_quantity": str(total_quantity),
                "converted_unit": base_unit,
            }
        )

        ingredient_id = self._get_or_create_ingredient_id(normalized_item_id)
        if ingredient_id is None:
            logger.warning("[Ordering] Failed to resolve normalized ingredient for '%s' (user=%s)", normalized_item_id, self.user_id)
            return None

        fact_record = {
            "user_id": self.user_id,
            "invoice_item_id": record["id"],
            "normalized_item_id": normalized_item_id,
            "normalized_ingredient_id": ingredient_id,
            "delivery_date": invoice_date,
            "base_quantity": float(total_quantity),
            "base_unit": base_unit,
            "pack_description": pack_size or None,
            "source_invoice_number": invoice_info.get("invoice_number"),
            "anomaly_flags": anomaly_flags or None,
            "metadata": metadata,
            "updated_at": datetime.utcnow().isoformat(),
        }

        fact_record.setdefault("created_at", datetime.utcnow().isoformat())
        return fact_record

    def _get_or_create_ingredient_id(self, canonical_name: str) -> Optional[str]:
        if canonical_name in self._ingredient_cache:
            return self._ingredient_cache[canonical_name]

        try:
            result = (
                self.client.table("normalized_ingredients")
                .select("id")
                .eq("user_id", self.user_id)
                .eq("canonical_name", canonical_name)
                .limit(1)
                .execute()
            )
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("[Ordering] Failed to query normalized_ingredients for user=%s: %s", self.user_id, exc)
            return None

        if result.data:
            ingredient_id = result.data[0]["id"]
            self._ingredient_cache[canonical_name] = ingredient_id
            return ingredient_id

        try:
            insert_result = (
                self.client.table("normalized_ingredients")
                .insert(
                    {
                        "user_id": self.user_id,
                        "canonical_name": canonical_name,
                    }
                )
                .select("id")
                .execute()
            )
            if not insert_result.data:
                return None
            ingredient_id = insert_result.data[0]["id"]
            self._ingredient_cache[canonical_name] = ingredient_id
            return ingredient_id
        except Exception as exc:  # pylint: disable=broad-except
            # Handle race condition: another request may have inserted the same ingredient
            error_str = str(exc).lower()
            if "duplicate" in error_str or "unique" in error_str or "23505" in error_str:
                # Retry the select
                try:
                    retry_result = (
                        self.client.table("normalized_ingredients")
                        .select("id")
                        .eq("user_id", self.user_id)
                        .eq("canonical_name", canonical_name)
                        .limit(1)
                        .execute()
                    )
                    if retry_result.data:
                        ingredient_id = retry_result.data[0]["id"]
                        self._ingredient_cache[canonical_name] = ingredient_id
                        return ingredient_id
                except Exception:
                    pass
            logger.exception("[Ordering] Failed to insert normalized_ingredients for user=%s: %s", self.user_id, exc)
            return None

    def _build_mapping_record(
        self,
        record: Dict,
        fact_record: Dict,
        ingredient_id: str,
    ) -> Optional[Dict]:
        invoice_info = record.get("invoices") or {}
        return {
            "user_id": self.user_id,
            "normalized_ingredient_id": ingredient_id,
            "invoice_item_id": record["id"],
            "source_name": record.get("description"),
            "source_pack": record.get("pack_size"),
            "vendor_name": invoice_info.get("vendor_name"),
            "confidence": None,
            "metadata": {
                "normalized_item_slug": fact_record.get("normalized_item_id"),
                "pack_description": fact_record.get("pack_description"),
                "anomaly_flags": fact_record.get("anomaly_flags"),
            },
        }

    def _build_price_history_record(
        self,
        record: Dict,
        fact_record: Dict,
        ingredient_id: str,
    ) -> Optional[Dict]:
        invoice_info = record.get("invoices") or {}
        invoice_id = invoice_info.get("id")
        invoice_date = invoice_info.get("invoice_date")
        if not invoice_id or not invoice_date:
            return None

        return {
            "user_id": self.user_id,
            "normalized_ingredient_id": ingredient_id,
            "invoice_item_id": record["id"],
            "invoice_id": invoice_id,
            "invoice_date": invoice_date,
            "base_quantity": fact_record.get("base_quantity"),
            "base_unit": fact_record.get("base_unit"),
            "unit_price": self._safe_number(record.get("unit_price")),
            "extended_price": self._safe_number(record.get("extended_price")),
            "pack_description": fact_record.get("pack_description"),
            "vendor_name": invoice_info.get("vendor_name"),
            "metadata": {
                "normalized_item_slug": fact_record.get("normalized_item_id"),
                "source_invoice_number": fact_record.get("source_invoice_number"),
            },
        }

    def _build_log_record(
        self,
        record: Dict,
        fact_record: Dict,
        ingredient_id: str,
    ) -> Optional[Dict]:
        return {
            "invoice_item_id": record["id"],
            "user_id": self.user_id,
            "action": "normalized",
            "payload": {
                "normalized_ingredient_id": ingredient_id,
                "normalized_item_id": fact_record.get("normalized_item_id"),
                "base_quantity": fact_record.get("base_quantity"),
                "base_unit": fact_record.get("base_unit"),
                "anomaly_flags": fact_record.get("anomaly_flags"),
            },
        }

    @staticmethod
    def _safe_decimal(value) -> Optional[Decimal]:
        """Safely coerce any numeric value to Decimal."""
        if value is None:
            return None
        try:
            return Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError):
            return None

    @staticmethod
    def _safe_number(value) -> Optional[float]:
        decimal_value = OrderingNormalizationService._safe_decimal(value)
        return float(decimal_value) if decimal_value is not None else None


