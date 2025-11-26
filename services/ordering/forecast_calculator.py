"""
Forecast Calculator for Ordering Module
Computes forecast quantities with buffer and generates explanations.
"""
from __future__ import annotations

import math
from datetime import date, timedelta
from typing import Dict, List, Optional


class ForecastCalculator:
    """Calculate forecast quantities and generate explanations."""

    DEFAULT_BUFFER = 0.5

    def calculate_quantity(
        self,
        weekly_usage: float,
        deliveries_per_week: float,
        buffer: float,
    ) -> int:
        """
        Calculate forecast quantity in whole cases.
        
        Formula: ceil((weekly_usage / deliveries_per_week) * (1 + buffer))
        """
        if deliveries_per_week <= 0:
            deliveries_per_week = 1.0

        cases_per_delivery = weekly_usage / deliveries_per_week
        buffered = cases_per_delivery * (1 + buffer)
        return max(1, math.ceil(buffered))

    def calculate_confidence(
        self,
        window_days: int,
        order_count: int,
        pattern_confidence: float,
    ) -> float:
        """
        Calculate confidence score (0-1).
        
        Factors:
        - Data recency (28d vs 60d)
        - Order count
        - Delivery pattern confidence
        """
        base = 0.5

        # Bonus for recent data
        if window_days == 28:
            base += 0.2

        # Bonus for more orders
        if order_count >= 8:
            base += 0.2
        elif order_count >= 4:
            base += 0.1

        # Average with pattern confidence
        return round(min((base + pattern_confidence) / 2, 1.0), 2)

    def build_explanation(
        self,
        usage: Dict,
        buffer: float,
        forecast_qty: int,
    ) -> Dict:
        """Build chain-of-thought explanation for display."""
        window_days = usage.get("window_days", 28)
        order_count = usage.get("order_count", 0)
        total_cases = usage.get("total_cases", 0)
        weekly_usage = usage.get("weekly_case_usage", 0)
        deliveries_per_week = usage.get("deliveries_per_week", 1)

        cases_per_delivery = weekly_usage / deliveries_per_week if deliveries_per_week > 0 else weekly_usage
        buffered = cases_per_delivery * (1 + buffer)

        return {
            "summary": f"Based on {order_count} orders over {window_days} days",
            "steps": [
                {"step": 1, "label": "Orders found", "value": order_count, "detail": f"in last {window_days} days"},
                {"step": 2, "label": "Total cases", "value": round(total_cases, 1)},
                {"step": 3, "label": "Weekly usage", "value": round(weekly_usage, 2), "detail": "cases/week"},
                {"step": 4, "label": "Deliveries/week", "value": round(deliveries_per_week, 1)},
                {"step": 5, "label": "Per delivery", "value": round(cases_per_delivery, 2), "detail": "cases"},
                {"step": 6, "label": f"With {int(buffer*100)}% buffer", "value": round(buffered, 2)},
                {"step": 7, "label": "Order quantity", "value": forecast_qty, "detail": "cases (rounded up)"},
            ],
            "data_window": f"{window_days} days",
            "buffer_percent": f"{int(buffer*100)}%",
        }

    def get_delivery_dates(
        self,
        weekdays: List[int],
        today: date,
        count: int = 4,
    ) -> List[date]:
        """Get next delivery dates based on vendor's weekdays."""
        if not weekdays:
            return []

        weekdays_set = set(weekdays)
        dates: List[date] = []
        cursor = today + timedelta(days=1)

        while len(dates) < count and (cursor - today).days <= 60:
            if cursor.weekday() in weekdays_set:
                dates.append(cursor)
            cursor += timedelta(days=1)

        return dates

    def estimate_delivery_dates(
        self,
        deliveries_per_week: float,
        today: date,
        count: int = 4,
    ) -> List[date]:
        """Estimate dates when no pattern is known."""
        if deliveries_per_week <= 0:
            deliveries_per_week = 1.0

        interval = max(1, int(round(7 / deliveries_per_week)))
        dates: List[date] = []
        cursor = today + timedelta(days=interval)

        while len(dates) < count:
            dates.append(cursor)
            cursor += timedelta(days=interval)

        return dates

    @staticmethod
    def format_delivery_label(delivery_date: date, vendor_name: Optional[str]) -> str:
        """Format delivery window label."""
        label = delivery_date.strftime("%A, %b %d").replace(" 0", " ")
        return f"{vendor_name} • {label}" if vendor_name else label
