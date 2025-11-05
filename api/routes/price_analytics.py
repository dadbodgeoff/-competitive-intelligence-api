"""
Price Analytics API Routes V2 - Source of Truth Pattern
Thin controllers - business logic in service layer
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_service_client
from services.price_analytics_service import PriceAnalyticsService
from services.error_sanitizer import ErrorSanitizer

router = APIRouter(prefix="/api/v1/analytics", tags=["price_analytics"])


@router.get("/price-comparison")
async def get_price_comparison_by_description(
    item_description: str = Query(..., description="Item description to search for"),
    days_back: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """
    Compare prices across vendors for an item (by description)
    
    Queries invoice_items directly - no inventory processing needed
    """
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        return service.get_price_comparison(current_user, item_description, days_back)
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch price comparison data"
        )


@router.get("/price-trends")
async def get_price_trends_by_description(
    item_description: str = Query(..., description="Item description"),
    days: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """Get price trend data for an item"""
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        trends = service.get_price_trends(current_user, item_description, days)
        return {
            "item_description": item_description,
            "trends": trends,
            "data_points": len(trends)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch price trends"
        )


@router.get("/savings-opportunities")
async def get_savings_opportunities(
    min_savings_percent: float = Query(5.0, ge=0, le=100),
    days_back: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """Find items where switching vendors could save money"""
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        opportunities = service.find_savings_opportunities(current_user, min_savings_percent, days_back)
        return {
            "opportunities": opportunities,
            "total_opportunities": len(opportunities)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to find savings opportunities"
        )


@router.get("/vendor-performance")
async def get_vendor_performance(
    vendor_name: str = Query(..., description="Vendor name"),
    days_back: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """Get vendor pricing performance"""
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        result = service.get_vendor_performance(current_user, vendor_name, days_back)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch vendor performance"
        )


@router.get("/price-anomalies")
async def get_price_anomalies(
    days_back: int = Query(90, ge=1, le=365),
    min_change_percent: float = Query(20.0, ge=0, le=100),
    current_user: str = Depends(get_current_user)
):
    """Detect unusual price changes"""
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        anomalies = service.detect_price_anomalies(current_user, days_back, min_change_percent)
        return {
            "anomalies": anomalies,
            "total_anomalies": len(anomalies)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to detect price anomalies"
        )


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    days_back: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """Get summary analytics for dashboard"""
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        return service.get_dashboard_summary(current_user, days_back)
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch dashboard summary"
        )


@router.get("/items-list")
async def get_items_list(
    days_back: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """Get list of all items with recent purchase data"""
    try:
        supabase = get_supabase_service_client()
        service = PriceAnalyticsService(supabase)
        items = service.get_items_list(current_user, days_back)
        return {
            "items": items,
            "total_items": len(items)
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch items list"
        )


@router.get("/item-history")
async def get_item_purchase_history(
    item_description: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get purchase history for a specific item
    Returns all purchases of this item with dates, vendors, prices
    """
    try:
        service = PriceAnalyticsService()
        history = service.get_item_purchase_history(current_user, item_description)
        
        return {
            "success": True,
            "item_description": item_description,
            "purchases": history,
            "total_purchases": len(history)
        }
    except Exception as e:
        logger.error(f"Error fetching item history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
