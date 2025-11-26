"""
Background task helpers for predictive ordering.

These functions currently execute synchronously inside the request/response
cycle so we can deliver value without introducing a dedicated worker queue.
"""
from __future__ import annotations

import logging
from typing import Dict, Iterable, List, Optional

from services.ordering.cache_service import OrderingCacheService
from services.ordering.delivery_pattern_service import DeliveryPatternService
from services.ordering.feature_service import OrderingFeatureService
from services.ordering.forecast_service import OrderingForecastService
from services.ordering.normalization_service import OrderingNormalizationService

logger = logging.getLogger(__name__)


def enqueue_normalization_job(
    user_id: str,
    invoice_item_ids: Optional[Iterable[str]] = None,
) -> Dict[str, object]:
    """Normalize invoice items into inventory_item_facts."""
    try:
        service = OrderingNormalizationService(user_id=user_id)
        service.normalize_invoice_items(invoice_item_ids)
        return {"status": "success", "user_id": user_id}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Normalization job failed for user=%s: %s", user_id, exc)
        return {"status": "error", "user_id": user_id, "error": str(exc)}


def enqueue_feature_refresh(
    user_id: str,
    normalized_item_ids: Optional[Iterable[str]] = None,
) -> Dict[str, object]:
    """Recompute rolling features for the supplied items."""
    try:
        service = OrderingFeatureService(user_id=user_id)
        service.refresh_features(normalized_item_ids)
        return {"status": "success", "user_id": user_id}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Feature refresh failed for user=%s: %s", user_id, exc)
        return {"status": "error", "user_id": user_id, "error": str(exc)}


def enqueue_forecast_generation(
    user_id: str,
    normalized_item_ids: Optional[Iterable[str]] = None,
) -> Dict[str, object]:
    """Generate forecasts using the latest engineered features."""
    try:
        service = OrderingForecastService()
        service.generate_forecasts(user_id, normalized_item_ids)
        return {"status": "success", "user_id": user_id}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Forecast generation failed for user=%s: %s", user_id, exc)
        return {"status": "error", "user_id": user_id, "error": str(exc)}


def enqueue_delivery_pattern_detection(user_id: str) -> Dict[str, object]:
    """Refresh vendor delivery schedules so forecasts align with real delivery days."""
    try:
        service = DeliveryPatternService()
        service.detect_and_save(user_id)
        return {"status": "success", "user_id": user_id}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Delivery pattern detection failed for user=%s: %s", user_id, exc)
        return {"status": "error", "user_id": user_id, "error": str(exc)}


def warm_forecast_cache(user_id: str) -> Dict[str, object]:
    """Warm Redis with the latest forecasts for the user."""
    try:
        forecast_service = OrderingForecastService()
        forecasts = forecast_service.get_predictions(user_id)
        cache_service = OrderingCacheService()
        cache_service.warm_forecasts(user_id, forecasts)
        return {"status": "success", "user_id": user_id, "forecasts_cached": len(forecasts)}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[Ordering] Forecast cache warm failed for user=%s: %s", user_id, exc)
        return {"status": "error", "user_id": user_id, "error": str(exc)}


def run_full_ordering_pipeline(
    user_id: str,
    invoice_item_ids: Optional[List[str]] = None,
) -> Dict[str, object]:
    """
    Run the complete ordering pipeline for a user.
    
    This is the main entry point for triggering ordering updates after
    invoice processing completes.
    
    Steps:
    1. Normalize invoice items into facts
    2. Refresh rolling features and usage metrics
    3. Detect vendor delivery patterns
    4. Generate forecasts
    5. Warm the cache
    
    Returns:
        Dict with status and results from each step
    """
    results: Dict[str, object] = {"user_id": user_id, "steps": {}}
    
    # Step 1: Normalize
    norm_result = enqueue_normalization_job(user_id, invoice_item_ids)
    results["steps"]["normalization"] = norm_result
    if norm_result.get("status") == "error":
        results["status"] = "partial_failure"
        logger.warning("[Ordering] Pipeline continuing despite normalization error for user=%s", user_id)
    
    # Step 2: Features
    feature_result = enqueue_feature_refresh(user_id)
    results["steps"]["features"] = feature_result
    if feature_result.get("status") == "error":
        results["status"] = "partial_failure"
        logger.warning("[Ordering] Pipeline continuing despite feature refresh error for user=%s", user_id)
    
    # Step 3: Delivery patterns
    pattern_result = enqueue_delivery_pattern_detection(user_id)
    results["steps"]["patterns"] = pattern_result
    if pattern_result.get("status") == "error":
        results["status"] = "partial_failure"
        logger.warning("[Ordering] Pipeline continuing despite pattern detection error for user=%s", user_id)
    
    # Step 4: Forecasts
    forecast_result = enqueue_forecast_generation(user_id)
    results["steps"]["forecasts"] = forecast_result
    if forecast_result.get("status") == "error":
        results["status"] = "partial_failure"
        logger.warning("[Ordering] Pipeline continuing despite forecast generation error for user=%s", user_id)
    
    # Step 5: Cache
    cache_result = warm_forecast_cache(user_id)
    results["steps"]["cache"] = cache_result
    
    # Set final status
    if results.get("status") != "partial_failure":
        results["status"] = "success"
    
    logger.info("[Ordering] Full pipeline completed for user=%s with status=%s", user_id, results["status"])
    return results

