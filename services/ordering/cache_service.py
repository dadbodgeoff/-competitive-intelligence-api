"""
OrderingCacheService
--------------------
Centralizes Redis cache helpers for predictive ordering responses.

For now, this simply exposes cache key helpers and warmers that log their
invocation. Once the forecasting pipeline is in place they will hydrate the
cache with fresh forecasts.
"""
from __future__ import annotations

import logging
from typing import Iterable, Optional

from services.redis_client import cache

logger = logging.getLogger(__name__)


class OrderingCacheService:
    """Wrapper around Redis for predictive ordering data."""

    FORECAST_TTL = 300  # seconds

    @staticmethod
    def forecast_cache_key(user_id: str, ingredient_identifier: str) -> str:
        return f"ordering:forecast:{user_id}:{ingredient_identifier}"

    def warm_forecasts(
        self,
        user_id: str,
        forecasts: Iterable[dict],
    ) -> None:
        """Persist forecasts in Redis so the API can respond instantly."""
        if not cache.enabled:
            return

        for forecast in forecasts:
            ingredient_key = forecast.get("normalized_ingredient_id") or forecast.get("normalized_item_id")
            if not ingredient_key:
                continue

            key = self.forecast_cache_key(user_id, ingredient_key)
            cache.set(key, forecast, ttl=self.FORECAST_TTL)
            logger.debug("[Ordering] cache set for %s", key)

    def get_cached_forecast(
        self,
        user_id: str,
        ingredient_identifier: str,
    ) -> Optional[dict]:
        """Fetch a cached forecast if present."""
        if not cache.enabled:
            return None

        key = self.forecast_cache_key(user_id, ingredient_identifier)
        value = cache.get(key)
        if isinstance(value, dict):
            return value
        return None


