"""
Menu Comparison API Routes
Handles competitor menu comparison endpoints
Pattern: Follows api/routes/streaming_analysis.py
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from typing import AsyncGenerator
import json
import logging

from api.schemas.menu_comparison_schemas import (
    StartComparisonRequest,
    SelectCompetitorsRequest,
    SaveComparisonRequest,
    DiscoveryResponse,
    AnalysisStatusResponse,
    ComparisonResultsResponse,
    SavedComparisonsListResponse
)
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit
from services.menu_comparison_orchestrator import MenuComparisonOrchestrator
from services.menu_comparison_storage import MenuComparisonStorage
from services.error_sanitizer import ErrorSanitizer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/menu-comparison", tags=["menu-comparison"])

# Initialize services
orchestrator = MenuComparisonOrchestrator()
storage = MenuComparisonStorage()


@router.post("/discover", response_model=DiscoveryResponse)
@rate_limit("analysis")
async def discover_competitors(
    data: StartComparisonRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Phase 1: Discover 5 nearby competitors
    
    Returns list of competitors for user to select 2 from
    """
    try:
        # Check usage limits (free tier: 1/week)
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        
        allowed, limit_details = usage_service.check_limit(current_user, 'menu_comparison')
        
        if not allowed:
            logger.warning(f"Menu comparison blocked for user {current_user}: {limit_details['message']}")
            raise HTTPException(
                status_code=429,
                detail={
                    'error': 'Usage limit exceeded',
                    'message': limit_details['message'],
                    'current_usage': limit_details['current_usage'],
                    'limit': limit_details['limit_value'],
                    'reset_date': limit_details['reset_date'],
                    'subscription_tier': limit_details['subscription_tier']
                }
            )
        
        logger.info(f"🔍 Discovering competitors for {data.restaurant_name}")
        logger.info(f"📋 Request data: restaurant={data.restaurant_name}, location={data.location}, category={data.category}, radius={data.radius_miles}")
        logger.info(f"👤 User ID: {current_user}")
        
        # Get user's active menu
        from services.menu_storage_service import MenuStorageService
        menu_storage = MenuStorageService()
        user_menu = await menu_storage.get_active_menu(current_user)
        
        logger.info(f"📄 User menu query result: {user_menu is not None}")
        
        if not user_menu:
            logger.warning(f"❌ No active menu found for user {current_user}")
            raise HTTPException(
                status_code=404,
                detail="No active menu found. Please upload your menu first."
            )
        
        user_menu_id = user_menu['menu']['id']
        
        # Discover competitors
        result = await orchestrator.discover_competitors(
            user_id=current_user,
            user_menu_id=user_menu_id,
            restaurant_name=data.restaurant_name,
            location=data.location,
            category=data.category or "restaurant",
            radius_miles=data.radius_miles or 3.0
        )
        
        # Get selected competitor IDs from the orchestrator result
        selected_ids = result.get('selected_competitors', [])
        
        # Increment usage counter after successful discovery
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        usage_service.increment_usage(
            user_id=current_user,
            operation_type='menu_comparison',
            operation_id=result['analysis_id'],
            metadata={'restaurant': data.restaurant_name, 'competitors_found': result['competitors_found']}
        )
        
        return DiscoveryResponse(
            success=True,
            analysis_id=result['analysis_id'],
            competitors_found=result['competitors_found'],
            competitors=[
                {
                    "id": c['id'],  # Use database UUID
                    "business_name": c['business_name'],
                    "address": c.get('address'),
                    "latitude": c.get('latitude'),
                    "longitude": c.get('longitude'),
                    "rating": c.get('rating'),
                    "review_count": c.get('review_count'),
                    "price_level": c.get('price_level'),
                    "distance_miles": c.get('distance_miles'),
                    "phone": c.get('phone'),
                    "website": c.get('website'),
                    "menu_url": c.get('menu_url'),
                    "is_selected": c['id'] in selected_ids  # Mark as selected if in the list
                }
                for c in result['competitors']
            ],
            selected_competitors=selected_ids,
            message=f"Found {result['competitors_found']} competitors. Top 2 auto-selected for analysis."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Discovery failed: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to discover competitors"
        )


@router.post("/analyze/stream")
@rate_limit("analysis")
async def analyze_competitors_stream(
    data: SelectCompetitorsRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Phase 2: Analyze selected competitors (streaming)
    
    Streams progress as menus are parsed and compared
    
    Events emitted:
    - competitors_selected: Analysis started
    - user_menu_loaded: User's menu loaded
    - parsing_competitor_menu: Parsing each competitor
    - competitor_menu_parsed: Competitor menu parsed
    - llm_analysis_started: LLM comparison started
    - analysis_complete: Analysis finished
    - error: Error occurred
    """
    
    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events as analysis progresses"""
        
        try:
            # Validate competitor selection
            if len(data.competitor_ids) != 2:
                yield f"event: error\ndata: {json.dumps({'error': 'Must select exactly 2 competitors'})}\n\n"
                return
            
            # Stream analysis progress
            async for event_data in orchestrator.analyze_selected_competitors(
                analysis_id=data.analysis_id,
                user_id=current_user,
                competitor_ids=data.competitor_ids
            ):
                event_type = event_data.get('type')
                data_payload = event_data.get('data', {})
                
                yield f"event: {event_type}\ndata: {json.dumps(data_payload)}\n\n"
            
        except Exception as e:
            logger.error(f"❌ Streaming analysis failed: {e}")
            safe_error = ErrorSanitizer.sanitize_error(e, "Analysis failed")
            yield f"event: error\ndata: {json.dumps({'error': safe_error})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control"
        }
    )


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get current status of analysis"""
    
    try:
        analysis_data = storage.get_analysis(analysis_id, current_user)
        
        if not analysis_data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis = analysis_data['analysis']
        
        return AnalysisStatusResponse(
            analysis_id=analysis_id,
            status=analysis['status'],
            current_step=analysis.get('current_step'),
            competitors_found=analysis.get('competitors_found', 0),
            competitors_selected=analysis.get('competitors_selected', 0),
            error_message=analysis.get('error_message'),
            created_at=analysis['created_at'],
            updated_at=analysis['updated_at'],
            completed_at=analysis.get('completed_at')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get status: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to get analysis status"
        )


@router.get("/{analysis_id}/results", response_model=ComparisonResultsResponse)
async def get_comparison_results(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get complete comparison results"""
    
    try:
        analysis_data = storage.get_analysis(analysis_id, current_user)
        
        if not analysis_data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis = analysis_data['analysis']
        competitors = analysis_data['competitors']
        insights = analysis_data['insights']
        competitor_menus = analysis_data.get('competitor_menus', {})
        
        # Filter to selected competitors only
        selected_competitors = [c for c in competitors if c.get('is_selected')]
        
        # Count high-priority insights
        high_priority_count = len([i for i in insights if i.get('priority', 0) >= 70])
        
        return ComparisonResultsResponse(
            success=True,
            analysis_id=analysis_id,
            restaurant_name=analysis['restaurant_name'],
            location=analysis['location'],
            status=analysis['status'],
            competitors=[
                {
                    "id": c['id'],
                    "business_name": c['business_name'],
                    "address": c.get('address'),
                    "rating": c.get('rating'),
                    "review_count": c.get('review_count'),
                    "distance_miles": c.get('distance_miles'),
                    "is_selected": c.get('is_selected', False),
                    "menu_items": [
                        {
                            "id": item.get('id'),
                            "category_name": item.get('category_name'),
                            "item_name": item.get('item_name'),
                            "description": item.get('description'),
                            "base_price": item.get('base_price'),
                            "price_range_low": item.get('price_range_low'),
                            "price_range_high": item.get('price_range_high'),
                            "size_variants": item.get('size_variants', []),
                            "notes": item.get('notes')
                        }
                        for item in competitor_menus.get(c['id'], [])
                    ]
                }
                for c in selected_competitors
            ],
            insights=[
                {
                    "id": i['id'],
                    "insight_type": i['insight_type'],
                    "category": i.get('category'),
                    "title": i['title'],
                    "description": i['description'],
                    "user_item_name": i.get('user_item_name'),
                    "user_item_price": i.get('user_item_price'),
                    "competitor_item_name": i.get('competitor_item_name'),
                    "competitor_item_price": i.get('competitor_item_price'),
                    "competitor_business_name": i.get('competitor_business_name'),
                    "price_difference": i.get('price_difference'),
                    "price_difference_percent": i.get('price_difference_percent'),
                    "confidence": i['confidence'],
                    "priority": i.get('priority', 0),
                    "evidence": i.get('evidence')
                }
                for i in insights
            ],
            total_insights=len(insights),
            high_priority_insights=high_priority_count,
            metadata={
                "competitors_analyzed": len(selected_competitors),
                "analysis_status": analysis['status']
            },
            created_at=analysis['created_at'],
            completed_at=analysis.get('completed_at')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get results: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to retrieve comparison results"
        )


@router.post("/save")
async def save_comparison(
    data: SaveComparisonRequest,
    current_user: str = Depends(get_current_user)
):
    """Save comparison for later review"""
    
    try:
        logger.info(f"🔍 Save comparison request received")
        logger.info(f"📦 Request data: analysis_id={data.analysis_id}, report_name={data.report_name}")
        logger.info(f"👤 User ID: {current_user}")
        
        saved_id = storage.save_comparison(
            analysis_id=data.analysis_id,
            user_id=current_user,
            report_name=data.report_name,
            notes=data.notes
        )
        
        logger.info(f"✅ Comparison saved successfully: {saved_id}")
        
        return JSONResponse({
            "success": True,
            "saved_id": saved_id,
            "message": "Comparison saved successfully"
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to save comparison: {e}", exc_info=True)
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to save comparison"
        )


@router.get("/saved")
async def list_saved_comparisons(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page (max 100)"),
    current_user: str = Depends(get_current_user)
):
    """
    List user's saved comparisons with pagination
    
    Query params:
    - page: Page number (1-indexed, default 1)
    - per_page: Results per page (1-100, default 50)
    
    Returns:
    - data: List of saved comparisons
    - pagination: Metadata (page, per_page, total_count, total_pages, has_next, has_prev)
    """
    try:
        logger.info(f"📋 Listing saved comparisons for user {current_user}")
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        result = storage.list_saved_comparisons(
            user_id=current_user,
            limit=per_page,
            offset=offset
        )
        
        logger.info(f"📊 Found {len(result['data'])} saved comparisons (total: {result['count']})")
        
        # Transform data for response
        comparisons = []
        for item in result['data']:
            analysis = item.get('competitor_menu_analyses', {})
            
            # Get competitors count from analysis
            competitors_count = analysis.get('competitors_selected', 0) if analysis else 0
            
            # Get insights count - query separately
            insights_count = 0
            if item.get('analysis_id'):
                try:
                    insights_result = storage.client.table("menu_comparison_insights").select(
                        "id", count="exact"
                    ).eq("analysis_id", item['analysis_id']).execute()
                    insights_count = insights_result.count or 0
                except:
                    pass
            
            comparisons.append({
                "id": item['id'],
                "analysis_id": item['analysis_id'],
                "report_name": item.get('report_name') or f"{analysis.get('restaurant_name', 'Untitled')} Analysis",
                "restaurant_name": analysis.get('restaurant_name', 'Unknown'),
                "location": analysis.get('location', ''),
                "competitors_count": competitors_count,
                "insights_count": insights_count,
                "is_archived": item.get('is_archived', False),
                "created_at": item['created_at'],
                "updated_at": item['updated_at']
            })
        
        # Calculate pagination metadata
        total_count = result['count']
        total_pages = (total_count + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        logger.info(f"✅ Returning {len(comparisons)} comparisons")
        
        return {
            "success": True,
            "data": comparisons,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev,
                "next_page": page + 1 if has_next else None,
                "prev_page": page - 1 if has_prev else None
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to list saved comparisons: {e}", exc_info=True)
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to list saved comparisons"
        )


@router.delete("/saved/{saved_id}")
async def archive_saved_comparison(
    saved_id: str,
    current_user: str = Depends(get_current_user)
):
    """Archive a saved comparison"""
    
    try:
        # Update to archived
        storage.client.table("saved_menu_comparisons").update({
            "is_archived": True
        }).eq("id", saved_id).eq("user_id", current_user).execute()
        
        return JSONResponse({
            "success": True,
            "message": "Comparison archived successfully"
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to archive comparison: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to archive comparison"
        )


@router.delete("/{analysis_id}/cascade")
async def delete_analysis_cascade(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete analysis with cascade warning (like invoice delete)
    
    Deletes:
    - Analysis record
    - All competitor businesses
    - All competitor menu snapshots  
    - All competitor menu items
    - All comparison insights
    - All saved comparisons referencing this analysis
    """
    
    try:
        # Get analysis details for confirmation
        analysis_data = storage.get_analysis(analysis_id, current_user)
        
        if not analysis_data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis = analysis_data['analysis']
        competitors = analysis_data['competitors']
        insights = analysis_data['insights']
        
        # Count related data that will be deleted
        competitor_count = len(competitors)
        insights_count = len(insights)
        
        # Get menu items count
        menu_items_count = 0
        for competitor in competitors:
            items_result = storage.client.table("competitor_menu_items").select(
                "id", count="exact"
            ).eq("snapshot_id", competitor.get('snapshot_id', '')).execute()
            menu_items_count += items_result.count or 0
        
        # Get saved comparisons count
        saved_result = storage.client.table("saved_menu_comparisons").select(
            "id", count="exact"
        ).eq("analysis_id", analysis_id).eq("user_id", current_user).execute()
        saved_count = saved_result.count or 0
        
        # Perform cascade delete using database function
        delete_result = storage.client.rpc('delete_menu_analysis_cascade', {
            'target_analysis_id': analysis_id,
            'target_user_id': current_user
        }).execute()
        
        if delete_result.data and delete_result.data[0].get('success'):
            logger.info(f"✅ Cascade deleted analysis {analysis_id}")
            
            return JSONResponse({
                "success": True,
                "message": "Analysis and all related data deleted successfully",
                "deleted_counts": {
                    "analysis": 1,
                    "competitors": competitor_count,
                    "menu_items": menu_items_count,
                    "insights": insights_count,
                    "saved_comparisons": saved_count
                }
            })
        else:
            raise HTTPException(status_code=500, detail="Delete operation failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Cascade delete failed: {e}")
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to delete comparison"
        )
