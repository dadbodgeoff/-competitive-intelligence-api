"""
Background task helpers and cache warmers.

These helpers centralize all of the "fire after response" work so API
endpoints can stay thin while still preparing cached payloads for the
Landing demos, dashboard, price analytics, and COGS tracker.
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime
from typing import Iterable, Sequence

from database.supabase_client import get_supabase_service_client
from services.dashboard_analytics_service import DashboardAnalyticsService
from services.menu_recipe_service import MenuRecipeService
from services.price_analytics_service import PriceAnalyticsService
from services.ordering.tasks import (
    enqueue_delivery_pattern_detection,
    enqueue_feature_refresh,
    enqueue_forecast_generation,
    enqueue_normalization_job,
    warm_forecast_cache,
)
from services.redis_client import cache

logger = logging.getLogger(__name__)

# TTLs (seconds) – overridable via environment for tuning without code changes.
DASHBOARD_CACHE_TTL = int(os.getenv("DASHBOARD_CACHE_TTL", "300"))
PRICE_ANALYTICS_CACHE_TTL = int(os.getenv("PRICE_ANALYTICS_CACHE_TTL", "300"))
COGS_CACHE_TTL = int(os.getenv("COGS_CACHE_TTL", "240"))


def _cache_set(key: str, data, ttl: int) -> None:
    """Persist payloads with metadata when Redis is enabled."""
    if not cache.enabled:
        return

    payload = {
        "data": data,
        "generated_at": datetime.utcnow().isoformat(),
    }

    cache.set(key, payload, ttl=ttl)


def get_cached_payload(key: str):
    """Fetch cached payload data."""
    if not cache.enabled:
        return None

    cached = cache.get(key)
    if isinstance(cached, dict):
        return cached.get("data")
    return cached


# ---------------------------------------------------------------------------
# Cache key helpers – shared between routes and warmers
# ---------------------------------------------------------------------------
def dashboard_monthly_key(user_id: str) -> str:
    return f"dashboard:monthly_summary:{user_id}"


def dashboard_vendor_key(user_id: str, days: int) -> str:
    return f"dashboard:vendor_scorecard:{user_id}:{days}"


def dashboard_category_key(user_id: str, days: int) -> str:
    return f"dashboard:category_spend:{user_id}:{days}"


def dashboard_weekly_key(user_id: str, weeks: int) -> str:
    return f"dashboard:weekly_trend:{user_id}:{weeks}"


def price_dashboard_key(user_id: str, days_back: int) -> str:
    return f"price:dashboard_summary:{user_id}:{days_back}"


def price_savings_key(user_id: str, min_savings: float, days_back: int) -> str:
    return f"price:savings:{user_id}:{min_savings}:{days_back}"


def price_anomalies_key(user_id: str, min_change: float, days_back: int) -> str:
    return f"price:anomalies:{user_id}:{min_change}:{days_back}"


def recipe_snapshot_key(user_id: str, menu_item_id: str) -> str:
    return f"cogs:recipe:{user_id}:{menu_item_id}"


def store_recipe_snapshot(user_id: str, menu_item_id: str, payload) -> None:
    """Persist a freshly computed recipe snapshot."""
    _cache_set(recipe_snapshot_key(user_id, menu_item_id), payload, COGS_CACHE_TTL)


# ---------------------------------------------------------------------------
# Cache warmers
# ---------------------------------------------------------------------------
def warm_dashboard_cache(user_id: str) -> None:
    """
    Fetches the high-traffic dashboard widgets and stores them so the next
    request can be served straight from Redis.
    """
    logger.info("🔥 Warming dashboard cache for user %s", user_id)
    supabase = get_supabase_service_client()
    service = DashboardAnalyticsService(supabase)

    try:
        _cache_set(dashboard_monthly_key(user_id), service.get_monthly_summary(user_id), DASHBOARD_CACHE_TTL)
        _cache_set(dashboard_vendor_key(user_id, 90), service.get_vendor_scorecard(user_id, days=90), DASHBOARD_CACHE_TTL)
        _cache_set(
            dashboard_category_key(user_id, 30),
            service.get_spending_by_category(user_id, days=30),
            DASHBOARD_CACHE_TTL,
        )
        _cache_set(
            dashboard_weekly_key(user_id, 8),
            service.get_weekly_trend(user_id, weeks=8),
            DASHBOARD_CACHE_TTL,
        )
    except Exception as exc:
        logger.exception("Dashboard cache warmer failed for %s: %s", user_id, exc)


def warm_price_analytics_cache(user_id: str) -> None:
    """Pre-compute the heaviest price analytics payloads."""
    logger.info("🔥 Warming price analytics cache for user %s", user_id)
    supabase = get_supabase_service_client()
    service = PriceAnalyticsService(supabase)

    try:
        _cache_set(
            price_dashboard_key(user_id, 90),
            service.get_dashboard_summary(user_id, days_back=90),
            PRICE_ANALYTICS_CACHE_TTL,
        )
        _cache_set(
            price_savings_key(user_id, 5.0, 90),
            service.find_savings_opportunities(user_id, min_savings_percent=5.0, days_back=90),
            PRICE_ANALYTICS_CACHE_TTL,
        )
        _cache_set(
            price_anomalies_key(user_id, 20.0, 90),
            service.detect_price_anomalies(user_id, days_back=90, min_change_percent=20.0),
            PRICE_ANALYTICS_CACHE_TTL,
        )
    except Exception as exc:
        logger.exception("Price analytics cache warmer failed for %s: %s", user_id, exc)


async def _build_recipe_snapshots(user_id: str, menu_item_ids: Sequence[str]) -> None:
    """Fetch menu recipes in batch and cache each snapshot."""
    seen: set[str] = set()
    unique_ids = []
    for item_id in menu_item_ids:
        if not item_id or item_id in seen:
            continue
        seen.add(item_id)
        unique_ids.append(item_id)
    if not unique_ids:
        return

    logger.info("🔥 Warming %d COGS snapshots for user %s", len(unique_ids), user_id)
    supabase = get_supabase_service_client()
    recipe_service = MenuRecipeService(supabase)

    try:
        recipes = await recipe_service.get_recipes_batch(menu_item_ids=unique_ids, user_id=user_id)
    except Exception as exc:
        logger.exception("Failed to build recipe snapshots for %s: %s", user_id, exc)
        return

    for menu_item_id, payload in (recipes or {}).items():
        _cache_set(recipe_snapshot_key(user_id, menu_item_id), payload, COGS_CACHE_TTL)


def refresh_recipe_snapshots(user_id: str, menu_item_ids: Iterable[str]) -> None:
    """Public entry-point for background tasks to refresh recipe caches."""
    ids = [item_id for item_id in menu_item_ids if item_id]
    if not ids:
        return

    async def runner():
        await _build_recipe_snapshots(user_id, ids)

    _run_async_task(runner())


def _run_async_task(coro) -> None:
    """
    Fire-and-forget helper that works whether we're already inside an event loop
    (FastAPI workers) or not (CLI scripts/tests).
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(coro)
    else:
        loop.create_task(coro)


# ---------------------------------------------------------------------------
# High-level orchestrators
# ---------------------------------------------------------------------------
def run_post_invoice_upload_tasks(user_id: str, session_id: str, *, is_guest: bool = False) -> None:
    """
    Triggered after a successful invoice upload (guest or authenticated) to
    keep the landing demos and dashboards fresh.
    """
    logger.info(
        "Scheduling post-upload cache warmers for user=%s session=%s guest=%s",
        user_id,
        session_id,
        is_guest,
    )
    warm_dashboard_cache(user_id)
    if not is_guest:
        warm_price_analytics_cache(user_id)
        enqueue_normalization_job(user_id)
        enqueue_feature_refresh(user_id)
        enqueue_forecast_generation(user_id)
        enqueue_delivery_pattern_detection(user_id)
        warm_forecast_cache(user_id)


def run_post_recipe_change_tasks(user_id: str, menu_item_ids: Iterable[str]) -> None:
    """
    Whenever COGS data mutates we refresh its snapshots and, because menu
    changes often follow invoice price shifts, we also warm the price summary.
    """
    refresh_recipe_snapshots(user_id, menu_item_ids)
    warm_price_analytics_cache(user_id)


# Expose cache helpers so route handlers can read cached payloads.
__all__ = [
    "dashboard_category_key",
    "dashboard_monthly_key",
    "dashboard_vendor_key",
    "dashboard_weekly_key",
    "price_anomalies_key",
    "price_dashboard_key",
    "price_savings_key",
    "recipe_snapshot_key",
    "store_recipe_snapshot",
    "refresh_recipe_snapshots",
    "run_post_invoice_upload_tasks",
    "run_post_recipe_change_tasks",
    "warm_dashboard_cache",
    "warm_price_analytics_cache",
    "warm_forecast_cache",
    "get_cached_payload",
]

