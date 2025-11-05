"""
Price Analytics API Routes
Endpoints for advanced price intelligence and vendor comparison
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from services.price_analytics_service import PriceAnalyticsService
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/analytics", tags=["price_analytics"])


@router.get("/price-comparison/{item_id}")
async def get_price_comparison(
    item_id: str,
    days_back: int = Query(90, ge=1, le=365, description="Days of history to analyze"),
    current_user: str = Depends(get_current_user)
):
    """
    Compare prices across all vendors for a specific item
    
    Returns vendor pricing comparison with best vendor and potential savings
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        result = service.get_cross_vendor_comparison(
            item_id=item_id,
            user_id=current_user,
            days_back=days_back
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing prices: {str(e)}")


@router.get("/price-trends/{item_id}")
async def get_price_trends(
    item_id: str,
    days: int = Query(90, ge=1, le=365, description="Days of trend data"),
    current_user: str = Depends(get_current_user)
):
    """
    Get price trend data for charting
    
    Returns time-series price data suitable for visualization
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        trends = service.get_price_trends(
            item_id=item_id,
            user_id=current_user,
            days=days
        )
        return {"item_id": item_id, "trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trends: {str(e)}")


@router.get("/savings-opportunities")
async def get_savings_opportunities(
    min_savings_percent: float = Query(5.0, ge=0, le=100, description="Minimum savings % to report"),
    days_back: int = Query(90, ge=1, le=365, description="Days of history to analyze"),
    current_user: str = Depends(get_current_user)
):
    """
    Find items where switching vendors could save money
    
    Returns list of opportunities sorted by estimated monthly savings
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        opportunities = service.find_savings_opportunities(
            user_id=current_user,
            min_savings_percent=min_savings_percent,
            days_back=days_back
        )
        
        total_monthly_savings = sum(opp['estimated_monthly_savings'] for opp in opportunities)
        
        return {
            "opportunities": opportunities,
            "total_opportunities": len(opportunities),
            "estimated_total_monthly_savings": total_monthly_savings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding opportunities: {str(e)}")


@router.get("/vendor-performance/{vendor_id}")
async def get_vendor_performance(
    vendor_id: str,
    days_back: int = Query(90, ge=1, le=365, description="Days of history to analyze"),
    current_user: str = Depends(get_current_user)
):
    """
    Get vendor pricing performance metrics
    
    Returns comprehensive vendor performance analysis including competitive score
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        performance = service.get_vendor_performance(
            vendor_id=vendor_id,
            user_id=current_user,
            days_back=days_back
        )
        return performance
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing vendor: {str(e)}")


@router.get("/price-anomalies")
async def get_price_anomalies(
    days_back: int = Query(90, ge=1, le=365, description="Days of history to analyze"),
    std_dev_threshold: float = Query(2.0, ge=1.0, le=5.0, description="Standard deviation threshold"),
    current_user: str = Depends(get_current_user)
):
    """
    Detect unusual price changes (spikes or drops)
    
    Returns list of price anomalies sorted by severity
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        anomalies = service.detect_price_anomalies(
            user_id=current_user,
            days_back=days_back,
            std_dev_threshold=std_dev_threshold
        )
        
        # Summarize by severity
        severity_counts = {"high": 0, "medium": 0, "low": 0}
        for anomaly in anomalies:
            severity_counts[anomaly['severity']] += 1
        
        return {
            "anomalies": anomalies,
            "total_anomalies": len(anomalies),
            "severity_breakdown": severity_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    days_back: int = Query(90, ge=1, le=365, description="Days of history to analyze"),
    current_user: str = Depends(get_current_user)
):
    """
    Get summary analytics for dashboard display
    
    Returns key metrics: savings opportunities, anomalies, vendor count
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        
        # Get savings opportunities
        opportunities = service.find_savings_opportunities(
            user_id=current_user,
            min_savings_percent=5.0,
            days_back=days_back
        )
        
        # Get anomalies
        anomalies = service.detect_price_anomalies(
            user_id=current_user,
            days_back=days_back,
            std_dev_threshold=2.0
        )
        
        # Get vendor count
        vendors_response = supabase.table('vendors')\
            .select('id', count='exact')\
            .eq('user_id', current_user)\
            .execute()
        
        total_savings = sum(opp['estimated_monthly_savings'] for opp in opportunities)
        high_severity_anomalies = len([a for a in anomalies if a['severity'] == 'high'])
        
        return {
            "total_savings_opportunities": len(opportunities),
            "estimated_monthly_savings": total_savings,
            "price_anomalies": len(anomalies),
            "high_severity_anomalies": high_severity_anomalies,
            "active_vendors": vendors_response.count,
            "analysis_period_days": days_back
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


@router.get("/item-price-metrics")
async def get_item_price_metrics(
    item_id: Optional[str] = Query(None, description="Specific item ID (optional, returns all if omitted)"),
    current_user: str = Depends(get_current_user)
):
    """
    Get price tracking metrics for items
    
    Returns last paid price, 7-day average, 28-day average for each item
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        metrics = service.get_item_price_metrics(
            user_id=current_user,
            item_id=item_id
        )
        return {
            "items": metrics,
            "total_items": len(metrics)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching price metrics: {str(e)}")


@router.get("/items-price-summary")
async def get_items_price_summary(
    current_user: str = Depends(get_current_user)
):
    """
    Get simplified price summary for all items
    
    Returns overview with trends and recent data indicators
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        summary = service.get_all_items_price_summary(user_id=current_user)
        return {
            "items": summary,
            "total_items": len(summary)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching price summary: {str(e)}")


@router.get("/items-with-price-changes")
async def get_items_with_price_changes(
    min_change_percent: float = Query(10.0, ge=0, le=100, description="Minimum % change to report"),
    days_to_compare: int = Query(7, description="Compare to 7-day or 28-day average", ge=7, le=28),
    current_user: str = Depends(get_current_user)
):
    """
    Get items with significant price changes
    
    Returns items where current price differs significantly from recent average
    """
    try:
        supabase = get_supabase_client()
        service = PriceAnalyticsService(supabase)
        changes = service.get_items_with_price_changes(
            user_id=current_user,
            min_change_percent=min_change_percent,
            days_to_compare=days_to_compare
        )
        return {
            "items": changes,
            "total_items": len(changes),
            "comparison_period": f"{days_to_compare}_days"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting price changes: {str(e)}")
