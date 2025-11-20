"""
Dashboard Analytics API Routes
New endpoints for enhanced dashboard widgets
STRICT RULE: All data from invoice_items (read-only source of truth)
"""
from fastapi import APIRouter, Depends, Query
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_service_client
from services.dashboard_analytics_service import DashboardAnalyticsService
from services.error_sanitizer import ErrorSanitizer
from services.background_tasks import (
    dashboard_category_key,
    dashboard_monthly_key,
    dashboard_vendor_key,
    dashboard_weekly_key,
    get_cached_payload,
    warm_dashboard_cache,
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard_analytics"])


@router.get("/monthly-summary")
async def get_monthly_summary(
    current_user: str = Depends(get_current_user)
):
    """
    Get current month vs last month spending comparison
    
    Returns spending, item counts, and averages for current and last month
    """
    try:
        cache_key = dashboard_monthly_key(current_user)
        cached = get_cached_payload(cache_key)
        if cached:
            return cached

        warm_dashboard_cache(current_user)
        cached = get_cached_payload(cache_key)
        if cached:
            return cached

        supabase = get_supabase_service_client()
        service = DashboardAnalyticsService(supabase)
        return service.get_monthly_summary(current_user)
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch monthly summary"
        )


@router.get("/top-ordered-items")
async def get_top_ordered_items(
    days: int = Query(30, ge=1, le=365, description="Days to look back"),
    limit: int = Query(10, ge=1, le=50, description="Number of items to return"),
    current_user: str = Depends(get_current_user)
):
    """
    Get most frequently ordered items
    
    Returns items sorted by order frequency with totals and averages
    """
    try:
        supabase = get_supabase_service_client()
        service = DashboardAnalyticsService(supabase)
        items = service.get_top_ordered_items(current_user, days, limit)
        return {
            "items": items,
            "total_items": len(items),
            "days_analyzed": days
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch top ordered items"
        )


@router.get("/fastest-rising-costs")
async def get_fastest_rising_costs(
    days: int = Query(30, ge=1, le=365, description="Days to look back"),
    limit: int = Query(10, ge=1, le=50, description="Number of items to return"),
    current_user: str = Depends(get_current_user)
):
    """
    Get items with steepest price increases
    
    Returns items sorted by price increase percentage
    """
    try:
        supabase = get_supabase_service_client()
        service = DashboardAnalyticsService(supabase)
        items = service.get_fastest_rising_costs(current_user, days, limit)
        return {
            "items": items,
            "total_items": len(items),
            "days_analyzed": days
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch fastest rising costs"
        )


@router.get("/vendor-scorecard")
async def get_vendor_scorecard(
    days: int = Query(90, ge=1, le=365, description="Days to look back"),
    current_user: str = Depends(get_current_user)
):
    """
    Get vendor performance metrics
    
    Returns most used vendors, highest spend, and average order values
    """
    try:
        cache_key = None
        if days == 90:
            cache_key = dashboard_vendor_key(current_user, days)
            cached = get_cached_payload(cache_key)
            if cached:
                return cached
            warm_dashboard_cache(current_user)
            cached = get_cached_payload(cache_key)
            if cached:
                return cached

        supabase = get_supabase_service_client()
        service = DashboardAnalyticsService(supabase)
        return service.get_vendor_scorecard(current_user, days)
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch vendor scorecard"
        )


@router.get("/spending-by-category")
async def get_spending_by_category(
    days: int = Query(30, ge=1, le=365, description="Days to look back"),
    current_user: str = Depends(get_current_user)
):
    """
    Get spending breakdown by category
    
    Categories inferred from item descriptions
    """
    try:
        cache_key = None
        if days == 30:
            cache_key = dashboard_category_key(current_user, days)
            cached = get_cached_payload(cache_key)
            if cached:
                return {
                    "categories": cached,
                    "total_categories": len(cached),
                    "days_analyzed": days
                }
            warm_dashboard_cache(current_user)
            cached = get_cached_payload(cache_key)
            if cached:
                return {
                    "categories": cached,
                    "total_categories": len(cached),
                    "days_analyzed": days
                }

        supabase = get_supabase_service_client()
        service = DashboardAnalyticsService(supabase)
        categories = service.get_spending_by_category(current_user, days)
        return {
            "categories": categories,
            "total_categories": len(categories),
            "days_analyzed": days
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch spending by category"
        )


@router.get("/weekly-trend")
async def get_weekly_trend(
    weeks: int = Query(8, ge=1, le=52, description="Number of weeks to analyze"),
    current_user: str = Depends(get_current_user)
):
    """
    Get weekly spending trend for charting
    
    Returns weekly totals for the specified number of weeks
    """
    try:
        cache_key = None
        if weeks == 8:
            cache_key = dashboard_weekly_key(current_user, weeks)
            cached = get_cached_payload(cache_key)
            if cached:
                return {
                    "trend": cached,
                    "weeks_analyzed": weeks,
                    "data_points": len(cached)
                }
            warm_dashboard_cache(current_user)
            cached = get_cached_payload(cache_key)
            if cached:
                return {
                    "trend": cached,
                    "weeks_analyzed": weeks,
                    "data_points": len(cached)
                }

        supabase = get_supabase_service_client()
        service = DashboardAnalyticsService(supabase)
        trend = service.get_weekly_trend(current_user, weeks)
        return {
            "trend": trend,
            "weeks_analyzed": weeks,
            "data_points": len(trend)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch weekly trend"
        )
