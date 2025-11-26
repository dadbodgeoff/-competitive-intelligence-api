"""
Usage Calculator for Ordering Module
Calculates item usage statistics from invoice history.
"""
from __future__ import annotations

import logging
from collections import defaultdict
from datetime import date, timedelta
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
from uuid import UUID

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class UsageCalculator:
    """Calculate item usage from invoice history."""

    MIN_ORDERS_REQUIRED = 2
    PRIMARY_WINDOW_DAYS = 28
    FALLBACK_WINDOW_DAYS = 60

    def __init__(self):
        self.client = get_supabase_service_client()

    def calculate(
        self,
        user_id: str,
        normalized_item_ids: Optional[Iterable[str]] = None,
    ) -> Dict[str, Dict]:
        """
        Calculate usage stats for items with at least 2 orders.
        Uses 28-day window, falls back to 60 days if insufficient.
        """
        today = date.today()
        cutoff_28d = (today - timedelta(days=self.PRIMARY_WINDOW_DAYS)).isoformat()
        cutoff_60d = (today - timedelta(days=self.FALLBACK_WINDOW_DAYS)).isoformat()

        facts = self._fetch_facts(user_id, cutoff_60d, normalized_item_ids)
        if not facts:
            return {}

        invoice_item_ids = list({f.get("invoice_item_id") for f in facts if f.get("invoice_item_id")})
        vendor_map = self._get_vendor_map(user_id, invoice_item_ids)
        name_map = self._get_name_map(invoice_item_ids)

        # Group by item and enrich
        item_facts: Dict[str, List[Dict]] = defaultdict(list)
        for fact in facts:
            item_key = fact.get("normalized_ingredient_id") or fact.get("normalized_item_id")
            if item_key:
                fact["vendor_name"] = vendor_map.get(fact.get("invoice_item_id"))
                fact["item_name"] = name_map.get(fact.get("invoice_item_id"))
                item_facts[item_key].append(fact)

        return self._compute_usage(item_facts, cutoff_28d)

    def _fetch_facts(
        self,
        user_id: str,
        cutoff: str,
        normalized_item_ids: Optional[Iterable[str]],
    ) -> List[Dict]:
        """Fetch invoice facts within the window."""
        query = (
            self.client.table("inventory_item_facts")
            .select("normalized_item_id, normalized_ingredient_id, quantity, base_unit, delivery_date, invoice_item_id")
            .eq("user_id", user_id)
            .gte("delivery_date", cutoff)
            .order("delivery_date", desc=True)
        )

        if normalized_item_ids:
            ids = list(normalized_item_ids)
            uuid_ids = [i for i in ids if self._is_uuid(i)]
            slug_ids = [i for i in ids if not self._is_uuid(i)]
            if uuid_ids:
                query = query.in_("normalized_ingredient_id", uuid_ids)
            elif slug_ids:
                query = query.in_("normalized_item_id", slug_ids)

        return query.execute().data or []

    def _get_vendor_map(self, user_id: str, invoice_item_ids: List[str]) -> Dict[str, str]:
        """Map invoice_item_id -> vendor_name."""
        if not invoice_item_ids:
            return {}

        result: Dict[str, str] = {}
        for i in range(0, len(invoice_item_ids), 200):
            chunk = invoice_item_ids[i:i + 200]
            items = self.client.table("invoice_items").select("id, invoice_id").in_("id", chunk).execute().data or []
            invoice_ids = list({r["invoice_id"] for r in items if r.get("invoice_id")})
            
            if invoice_ids:
                invoices = (
                    self.client.table("invoices")
                    .select("id, vendor_name")
                    .eq("user_id", user_id)
                    .in_("id", invoice_ids)
                    .execute().data or []
                )
                inv_vendor = {inv["id"]: inv.get("vendor_name") for inv in invoices}
                for item in items:
                    vendor = inv_vendor.get(item.get("invoice_id"))
                    if vendor:
                        result[item["id"]] = vendor
        return result

    def _get_name_map(self, invoice_item_ids: List[str]) -> Dict[str, str]:
        """Map invoice_item_id -> description."""
        if not invoice_item_ids:
            return {}

        result: Dict[str, str] = {}
        for i in range(0, len(invoice_item_ids), 200):
            chunk = invoice_item_ids[i:i + 200]
            items = self.client.table("invoice_items").select("id, description").in_("id", chunk).execute().data or []
            for item in items:
                if item.get("description"):
                    result[item["id"]] = item["description"]
        return result

    def _compute_usage(
        self,
        item_facts: Dict[str, List[Dict]],
        cutoff_28d: str,
    ) -> Dict[str, Dict]:
        """Compute usage statistics for each item."""
        usage_data: Dict[str, Dict] = {}

        for item_key, facts in item_facts.items():
            # Find primary vendor
            vendor_counts: Dict[str, int] = defaultdict(int)
            for f in facts:
                if f.get("vendor_name"):
                    vendor_counts[f["vendor_name"]] += 1

            if not vendor_counts:
                continue

            primary_vendor = max(vendor_counts.keys(), key=lambda v: vendor_counts[v])
            vendor_facts = [f for f in facts if f.get("vendor_name") == primary_vendor]

            # Try 28-day window
            facts_28d = [f for f in vendor_facts if f.get("delivery_date", "") >= cutoff_28d]
            orders_28d = len(set(f["delivery_date"] for f in facts_28d))

            if orders_28d >= self.MIN_ORDERS_REQUIRED:
                window_days = self.PRIMARY_WINDOW_DAYS
                window_facts = facts_28d
                order_count = orders_28d
            else:
                # Fallback to 60-day
                orders_60d = len(set(f["delivery_date"] for f in vendor_facts))
                if orders_60d < self.MIN_ORDERS_REQUIRED:
                    continue
                window_days = self.FALLBACK_WINDOW_DAYS
                window_facts = vendor_facts
                order_count = orders_60d

            total_qty = sum(self._safe_float(f.get("quantity")) or 0 for f in window_facts)
            weeks = window_days / 7
            weekly_usage = total_qty / weeks if weeks > 0 else 0
            deliveries_per_week = order_count / weeks if weeks > 0 else 1

            latest = window_facts[0] if window_facts else {}
            usage_data[item_key] = {
                "normalized_item_id": latest.get("normalized_item_id"),
                "normalized_ingredient_id": latest.get("normalized_ingredient_id"),
                "vendor_name": primary_vendor,
                "item_name": latest.get("item_name") or item_key,
                "base_unit": latest.get("base_unit", "case"),
                "window_days": window_days,
                "order_count": order_count,
                "total_cases": round(total_qty, 2),
                "weekly_case_usage": round(weekly_usage, 2),
                "deliveries_per_week": round(deliveries_per_week, 2),
            }

        return usage_data

    @staticmethod
    def _safe_float(value) -> Optional[float]:
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _is_uuid(value: str) -> bool:
        try:
            UUID(str(value))
            return True
        except (ValueError, TypeError):
            return False
