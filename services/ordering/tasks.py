"""
Background task helpers for predictive ordering.

These functions currently execute synchronously inside the request/response
cycle so we can deliver value without introducing a dedicated worker queue.
"""
from __future__ import annotations

import logging
from typing import Iterable, Optional

from services.ordering.cache_service import OrderingCacheService
from services.ordering.delivery_pattern_service import DeliveryPatternService
from services.ordering.feature_service import OrderingFeatureService
from services.ordering.forecast_service import OrderingForecastService
from services.ordering.normalization_service import OrderingNormalizationService

logger = logging.getLogger(__name__)


def enqueue_normalization_job(
    user_id: str,
    invoice_item_ids: Optional[Iterable[str]] = None,
) -> None:
    """Normalize invoice items into inventory_item_facts."""
    try:
        service = OrderingNormalizationService(user_id=user_id)
        service.normalize_invoice_items(invoice_item_ids)
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Normalization job failed for user=%s: %s", user_id, exc)


def enqueue_feature_refresh(
    user_id: str,
    normalized_item_ids: Optional[Iterable[str]] = None,
) -> None:
    """Recompute rolling features for the supplied items."""
    try:
        service = OrderingFeatureService(user_id=user_id)
        service.refresh_features(normalized_item_ids)
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Feature refresh failed for user=%s: %s", user_id, exc)


def enqueue_forecast_generation(
    user_id: str,
    normalized_item_ids: Optional[Iterable[str]] = None,
) -> None:
    """Generate forecasts using the latest engineered features."""
    try:
        service = OrderingForecastService()
        service.generate_forecasts(user_id, normalized_item_ids)
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Forecast generation failed for user=%s: %s", user_id, exc)


def enqueue_delivery_pattern_detection(user_id: str) -> None:
    """Refresh vendor delivery schedules so forecasts align with real delivery days."""
    try:
        service = DeliveryPatternService()
        service.detect_and_save(user_id)
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Delivery pattern detection failed for user=%s: %s", user_id, exc)


def warm_forecast_cache(user_id: str) -> None:
    """Warm Redis with the latest forecasts for the user."""
    try:
        forecast_service = OrderingForecastService()
        forecasts = forecast_service.get_predictions(user_id)
        cache_service = OrderingCacheService()
        cache_service.warm_forecasts(user_id, forecasts)
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Forecast cache warm failed for user=%s: %s", user_id, exc)

