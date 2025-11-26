"""
Predictive ordering services package.

This module centralizes the normalization, feature engineering, forecasting,
and caching helpers used by the ordering API and background jobs.
"""

from .normalization_service import OrderingNormalizationService
from .feature_service import OrderingFeatureService
from .forecast_service import OrderingForecastService
from .cache_service import OrderingCacheService
from .delivery_pattern_service import DeliveryPatternService
from .tasks import (
    enqueue_normalization_job,
    enqueue_feature_refresh,
    enqueue_forecast_generation,
    enqueue_delivery_pattern_detection,
    warm_forecast_cache,
    run_full_ordering_pipeline,
)

__all__ = [
    "OrderingNormalizationService",
    "OrderingFeatureService",
    "OrderingForecastService",
    "OrderingCacheService",
    "DeliveryPatternService",
    "enqueue_normalization_job",
    "enqueue_feature_refresh",
    "enqueue_forecast_generation",
    "enqueue_delivery_pattern_detection",
    "warm_forecast_cache",
    "run_full_ordering_pipeline",
]

