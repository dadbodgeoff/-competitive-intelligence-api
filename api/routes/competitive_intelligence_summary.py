"""
Competitive Intelligence Summary API Routes
Quick summary endpoints for dashboard display
"""
from fastapi import APIRouter, Depends, HTTPException
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_service_client
from services.error_sanitizer import ErrorSanitizer
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/competitive-intelligence", tags=["competitive_intelligence"])


@router.get("/latest-analysis-summary")
async def get_latest_analysis_summary(
    current_user: str = Depends(get_current_user)
):
    """
    Get summary of most recent competitor review analysis
    
    Returns:
        {
            "has_analysis": true,
            "analysis_id": "uuid",
            "created_at": "2025-10-20",
            "days_ago": 5,
            "competitors_analyzed": 3,
            "total_insights": 12,
            "top_insight": {
                "title": "...",
                "category": "opportunity"
            }
        }
    """
    try:
        supabase = get_supabase_service_client()
        
        # Get most recent analysis
        analysis_result = supabase.table("analyses")\
            .select("id, created_at, status")\
            .eq("user_id", current_user)\
            .eq("status", "completed")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not analysis_result.data:
            return {
                "has_analysis": False,
                "message": "No completed analyses found"
            }
        
        analysis = analysis_result.data[0]
        analysis_id = analysis['id']
        
        # Get insights count and top insight
        insights_result = supabase.table("insights")\
            .select("id, title, category, confidence")\
            .eq("analysis_id", analysis_id)\
            .order("significance", desc=True)\
            .execute()
        
        # Get competitors count from analysis metadata
        competitors_result = supabase.table("competitors")\
            .select("id")\
            .eq("analysis_id", analysis_id)\
            .execute()
        
        # Calculate days ago
        from datetime import datetime
        created_at = datetime.fromisoformat(analysis['created_at'].replace('Z', '+00:00'))
        days_ago = (datetime.now(created_at.tzinfo) - created_at).days
        
        top_insight = None
        if insights_result.data:
            top = insights_result.data[0]
            top_insight = {
                "title": top['title'],
                "category": top['category']
            }
        
        return {
            "has_analysis": True,
            "analysis_id": analysis_id,
            "created_at": analysis['created_at'],
            "days_ago": days_ago,
            "competitors_analyzed": len(competitors_result.data),
            "total_insights": len(insights_result.data),
            "top_insight": top_insight
        }
        
    except Exception as e:
        logger.error(f"Error fetching latest analysis summary: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch analysis summary"
        )


@router.get("/latest-menu-comparison-summary")
async def get_latest_menu_comparison_summary(
    current_user: str = Depends(get_current_user)
):
    """
    Get summary of most recent menu comparison
    
    Returns:
        {
            "has_comparison": true,
            "analysis_id": "uuid",
            "created_at": "2025-10-20",
            "days_ago": 5,
            "competitors_compared": 3,
            "total_insights": 8,
            "pricing_summary": {
                "items_overpriced": 5,
                "items_underpriced": 3,
                "avg_price_difference_percent": -8.5
            }
        }
    """
    try:
        supabase = get_supabase_service_client()
        
        # Get most recent menu comparison
        comparison_result = supabase.table("competitor_menu_analyses")\
            .select("id, created_at, status, competitors_selected")\
            .eq("user_id", current_user)\
            .eq("status", "completed")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not comparison_result.data:
            return {
                "has_comparison": False,
                "message": "No completed menu comparisons found"
            }
        
        comparison = comparison_result.data[0]
        analysis_id = comparison['id']
        
        # Get insights
        insights_result = supabase.table("menu_comparison_insights")\
            .select("id, insight_type, price_difference_percent")\
            .eq("analysis_id", analysis_id)\
            .execute()
        
        # Calculate pricing summary
        items_overpriced = 0
        items_underpriced = 0
        price_diffs = []
        
        for insight in insights_result.data:
            price_diff = insight.get('price_difference_percent')
            if price_diff:
                price_diffs.append(price_diff)
                if price_diff > 0:
                    items_overpriced += 1
                elif price_diff < 0:
                    items_underpriced += 1
        
        avg_price_diff = sum(price_diffs) / len(price_diffs) if price_diffs else 0
        
        # Calculate days ago
        from datetime import datetime
        created_at = datetime.fromisoformat(comparison['created_at'].replace('Z', '+00:00'))
        days_ago = (datetime.now(created_at.tzinfo) - created_at).days
        
        return {
            "has_comparison": True,
            "analysis_id": analysis_id,
            "created_at": comparison['created_at'],
            "days_ago": days_ago,
            "competitors_compared": comparison['competitors_selected'],
            "total_insights": len(insights_result.data),
            "pricing_summary": {
                "items_overpriced": items_overpriced,
                "items_underpriced": items_underpriced,
                "avg_price_difference_percent": round(avg_price_diff, 2)
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching latest menu comparison summary: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch menu comparison summary"
        )
