"""
Invoice Analytics API Routes
Dashboard and vendor hierarchy endpoints
STRICT RULE: All data from invoice_items (read-only source of truth)
"""
from fastapi import APIRouter, Depends, Query, Request
from api.middleware.auth import get_current_membership, AuthenticatedUser
from database.supabase_client import get_supabase_service_client
from services.invoice_analytics_service import InvoiceAnalyticsService
from services.error_sanitizer import ErrorSanitizer
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api/v1/invoice-analytics", tags=["invoice_analytics"])

# Thread pool for parallel DB queries
_executor = ThreadPoolExecutor(max_workers=4)


@router.get("/dashboard-combined")
async def get_dashboard_combined(
    days_back: int = Query(90, ge=1, le=365),
    weeks: int = Query(8, ge=1, le=52),
    recent_limit: int = Query(10, ge=1, le=50),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Combined dashboard endpoint - fetches all dashboard data in parallel
    Reduces 4 API calls to 1 for faster page load
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        
        loop = asyncio.get_event_loop()
        
        # Run all queries in parallel
        summary_task = loop.run_in_executor(
            _executor, service.get_dashboard_summary, auth.account_id, days_back
        )
        vendors_task = loop.run_in_executor(
            _executor, service.get_spending_by_vendor, auth.account_id, days_back
        )
        trend_task = loop.run_in_executor(
            _executor, service.get_weekly_spending_trend, auth.account_id, weeks
        )
        recent_task = loop.run_in_executor(
            _executor, service.get_recent_invoices, auth.account_id, recent_limit
        )
        
        summary, vendors, trend, recent = await asyncio.gather(
            summary_task, vendors_task, trend_task, recent_task
        )
        
        return {
            "summary": summary,
            "vendors": {
                "vendors": vendors,
                "total_vendors": len(vendors),
                "days_analyzed": days_back
            },
            "trend": {
                "trend": trend,
                "weeks_analyzed": weeks,
                "data_points": len(trend)
            },
            "recent": {
                "invoices": recent,
                "count": len(recent)
            }
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch dashboard data"
        )


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    days_back: int = Query(90, ge=1, le=365),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get invoice dashboard summary metrics
    
    Returns total spend, invoice count, vendor count, trends
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        return service.get_dashboard_summary(auth.account_id, days_back)
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch dashboard summary"
        )


@router.get("/spending-by-vendor")
async def get_spending_by_vendor(
    days_back: int = Query(90, ge=1, le=365),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get spending breakdown by vendor
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        vendors = service.get_spending_by_vendor(auth.account_id, days_back)
        return {
            "vendors": vendors,
            "total_vendors": len(vendors),
            "days_analyzed": days_back
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch vendor spending"
        )


@router.get("/weekly-trend")
async def get_weekly_trend(
    weeks: int = Query(8, ge=1, le=52),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get weekly spending trend for charting
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        trend = service.get_weekly_spending_trend(auth.account_id, weeks)
        return {
            "trend": trend,
            "weeks_analyzed": weeks,
            "data_points": len(trend)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch weekly trend"
        )


@router.get("/recent")
async def get_recent_invoices(
    limit: int = Query(10, ge=1, le=50),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get recent invoices
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        invoices = service.get_recent_invoices(auth.account_id, limit)
        return {
            "invoices": invoices,
            "count": len(invoices)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch recent invoices"
        )


@router.get("/by-vendor")
async def get_invoices_by_vendor(
    days_back: int = Query(90, ge=1, le=365),
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get invoices grouped by vendor with totals
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        vendors = service.get_invoices_by_vendor(auth.account_id, days_back)
        return {
            "vendors": vendors,
            "total_vendors": len(vendors),
            "days_analyzed": days_back
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch invoices by vendor"
        )


@router.get("/{invoice_id}/insights")
async def get_invoice_insights(
    invoice_id: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """
    Get price insights for a specific invoice
    """
    try:
        supabase = get_supabase_service_client()
        service = InvoiceAnalyticsService(supabase)
        insights = service.get_invoice_insights(auth.account_id, invoice_id)
        return {
            "success": True,
            "invoice_id": invoice_id,
            **insights
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch invoice insights"
        )
