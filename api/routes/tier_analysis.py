#!/usr/bin/env python3
"""
Tier-based Analysis API Routes
Supports both free and premium analysis tiers
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime
import uuid
import logging
from typing import Dict, Any, Optional

from api.schemas.analysis_schemas import (
    AnalysisRequest, AnalysisResponse, AnalysisTier
)
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit
from database.supabase_client import get_supabase_client, get_supabase_service_client
from services.analysis_service_orchestrator import AnalysisServiceOrchestrator
from services.outscraper_service import OutscraperService
from services.enhanced_analysis_storage import EnhancedAnalysisStorage
from services.error_sanitizer import ErrorSanitizer
from services.performance_profiler import PerformanceProfiler

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analysis"])

# Initialize services
orchestrator = AnalysisServiceOrchestrator()
outscraper_service = OutscraperService()

@router.post("/run", response_model=AnalysisResponse)
@rate_limit("analysis")
async def run_tier_analysis(
    request: AnalysisRequest,
    force_refresh: bool = Query(False, description="Skip cache and fetch fresh data"),
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Run competitive analysis with tier support
    
    Tiers:
    - free: 3 competitors, basic insights, $0.11 cost
    - premium: 5 competitors, strategic analysis, $0.25 cost
    """
    
    try:
        # Validate input
        if not request.restaurant_name or not request.location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant name and location are required"
            )
        
        # Check usage limits based on tier
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        
        operation_type = 'premium_analysis' if request.tier == AnalysisTier.PREMIUM else 'free_analysis'
        allowed, limit_details = usage_service.check_limit(current_user, operation_type)
        
        if not allowed:
            logger.warning(f"Analysis blocked for user {current_user}: {limit_details['message']}")
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
        
        # Validate tier permissions
        if request.tier == AnalysisTier.PREMIUM:
            # Fetch user's actual subscription tier from database
            service_client = get_supabase_service_client()
            user_profile = service_client.table("users").select("subscription_tier").eq("id", current_user).execute()
            
            if not user_profile.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User profile not found. Please contact support."
                )
            
            user_tier = user_profile.data[0].get("subscription_tier", "free")
            
            # Only premium and enterprise users can access premium analysis
            if user_tier not in ["premium", "enterprise"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Premium analysis requires a premium subscription. Please upgrade your account to access advanced features including 5 competitors, strategic insights, and comprehensive market analysis."
                )
        
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Initialize performance profiler
        profiler = PerformanceProfiler(analysis_id)
        profiler.start_step("SETUP: Initialize analysis", {
            'restaurant': request.restaurant_name,
            'location': request.location,
            'tier': request.tier.value
        })
        
        logger.info(f"🔵 ANALYSIS_START: analysis_id={analysis_id}, tier={request.tier.value}")
        logger.debug(f"User context validated")
        
        # Get cost estimate
        cost_estimate = orchestrator.get_cost_estimate(
            tier=request.tier.value,
            competitor_count=request.competitor_count or (2 if request.tier == AnalysisTier.FREE else 5),
            avg_reviews_per_competitor=20
        )
        
        # Create analysis record
        analysis_data = {
            "id": analysis_id,
            "user_id": current_user,
            "restaurant_name": request.restaurant_name,
            "location": request.location,
            "category": request.category or "restaurant",
            "tier": request.tier.value,
            "estimated_cost": cost_estimate['estimated_cost'],
            "status": "processing",
            "created_at": datetime.utcnow().isoformat()
        }
        
        profiler.end_step()
        profiler.start_step("DB: Create analysis record")
        
        # Store in database using service client to bypass RLS
        service_client = get_supabase_service_client()
        insert_result = service_client.table("analyses").insert(analysis_data).execute()
        
        # Verify analysis was stored
        logger.info(f"🔵 ANALYSIS_CREATED: analysis_id={analysis_id}")
        logger.debug(f"Insert result: {len(insert_result.data)} records")
        
        # Immediately verify it can be found
        verify_result = service_client.table("analyses").select("*").eq("id", analysis_id).execute()
        logger.debug(f"Verification: Found {len(verify_result.data)} records for analysis_id={analysis_id}")
        
        profiler.end_step()
        profiler.start_step("OUTSCRAPER: Parallel competitor discovery + review collection")
        
        # Phase 1 & 2: Discover competitors AND fetch reviews (OPTIMIZED PARALLEL)
        logger.info(f"🚀 starting_parallel_analysis: analysis_id={analysis_id}")
        
        # Use optimized parallel method (3-5x faster) with smart caching
        analysis_results = outscraper_service.analyze_competitors_parallel(
            location=request.location,
            restaurant_name=request.restaurant_name,
            category=request.category or "restaurant",
            max_competitors=2 if request.tier == AnalysisTier.FREE else 5,
            force_refresh=force_refresh
        )
        
        competitors = analysis_results.get('competitors', [])
        competitors_with_reviews = analysis_results.get('reviews', {})
        timing = analysis_results.get('timing', {})
        
        logger.info(f"⚡ parallel_analysis_complete: {timing.get('total_seconds', 0):.1f}s, {timing.get('reviews_count', 0)} reviews")
        profiler.end_step({
            'competitors_found': len(competitors),
            'total_reviews': timing.get('reviews_count', 0),
            'outscraper_time': timing.get('total_seconds', 0)
        })
        
        profiler.start_step("DB: Batch store competitors")
        
        if not competitors:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No competitors found in the specified area"
            )
        
        # Store competitors (BATCHED for performance)
        competitor_data_list = []
        analysis_competitor_data_list = []
        
        for competitor in competitors:
            competitor_data = {
                "id": competitor.place_id,  # Use place_id as primary key (it's VARCHAR, not UUID)
                "analysis_id": analysis_id,
                "name": competitor.name,
                "address": competitor.address,
                "rating": competitor.rating,
                "review_count": competitor.review_count,
                "distance_miles": competitor.distance_miles,
                "place_id": competitor.place_id,
                "latitude": competitor.latitude,
                "longitude": competitor.longitude,
                "google_rating": competitor.rating,
                "google_review_count": competitor.review_count,
                "category": request.category or "restaurant",
                "created_at": datetime.utcnow().isoformat()
            }
            competitor_data_list.append(competitor_data)
            
            # Also prepare analysis_competitors linking table data
            analysis_competitor_data = {
                "analysis_id": analysis_id,
                "competitor_id": competitor.place_id,
                "competitor_name": competitor.name,
                "rating": competitor.rating,
                "review_count": competitor.review_count,
                "distance_miles": competitor.distance_miles
            }
            analysis_competitor_data_list.append(analysis_competitor_data)
        
        # Batch upsert competitors
        if competitor_data_list:
            service_client.table("competitors").upsert(competitor_data_list).execute()
        
        # Batch upsert analysis_competitors
        if analysis_competitor_data_list:
            service_client.table("analysis_competitors").upsert(analysis_competitor_data_list).execute()
        
        logger.info(f"competitors_stored_batch: analysis_id={analysis_id}, competitor_count={len(competitors)}")
        profiler.end_step({'competitors_count': len(competitors)})
        
        profiler.start_step("DB: Batch store reviews")
        # Store reviews in database (BATCHED for performance)
        all_review_data = []
        for place_id, reviews in competitors_with_reviews.items():
            for review in reviews:
                review_data = {
                    "id": review.get('review_id'),
                    "competitor_id": place_id,
                    "external_id": review.get('review_id'),
                    "source": review.get('source', 'outscraper'),
                    "author_name": review.get('author_name'),
                    "rating": review.get('rating'),
                    "text": review.get('text'),
                    "review_date": review.get('date'),
                    "language": review.get('language', 'en'),
                    "quality_score": review.get('quality_score'),
                    "created_at": datetime.utcnow().isoformat()
                }
                all_review_data.append(review_data)
        
        # Batch upsert all reviews at once (handles duplicates gracefully)
        if all_review_data:
            try:
                service_client.table("reviews").upsert(all_review_data).execute()
                logger.info(f"reviews_stored_batch: analysis_id={analysis_id}, total_reviews={len(all_review_data)}")
            except Exception as e:
                logger.error(f"Failed to batch upsert reviews: {e}")
                # Fallback to individual upserts if batch fails
                for review_data in all_review_data:
                    try:
                        service_client.table("reviews").upsert(review_data).execute()
                    except Exception as e2:
                        logger.warning(f"Failed to upsert individual review: {e2}")
        
        total_reviews = sum(len(reviews) for reviews in competitors_with_reviews.values())
        logger.info(f"reviews_stored: analysis_id={analysis_id}, total_reviews={total_reviews}")
        profiler.end_step({'reviews_count': total_reviews})
        
        profiler.start_step("LLM: Gemini analysis")
        # Phase 3: LLM Analysis using orchestrator
        logger.info(f"starting_llm_analysis: analysis_id={analysis_id}, tier={request.tier.value}")
        
        analysis_result = await orchestrator.analyze_competitors(
            restaurant_name=request.restaurant_name,
            restaurant_location=request.location,
            restaurant_category=request.category or "restaurant",
            competitors_data=competitors_with_reviews,
            tier=request.tier.value
        )
        
        profiler.end_step({'insights_generated': len(analysis_result.get('actionable_insights', []))})
        
        profiler.start_step("DB: Batch store insights and evidence")
        # Phase 4: Store insights using enhanced storage service
        storage_service = EnhancedAnalysisStorage(supabase)
        insights_stored = storage_service.store_analysis_results(
            analysis_id=analysis_id,
            analysis_result=analysis_result,
            tier=request.tier.value
        )
        
        # Store analysis metadata
        storage_service.store_analysis_metadata(
            analysis_id=analysis_id,
            analysis_result=analysis_result,
            tier=request.tier.value
        )
        
        # Update analysis status
        completion_data = {
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "insights_generated": len(insights_stored),
            "actual_cost": analysis_result.get('metadata', {}).get('target_cost', cost_estimate['estimated_cost'])
        }
        
        service_client.table("analyses").update(completion_data).eq("id", analysis_id).execute()
        profiler.end_step({'insights_stored': len(insights_stored)})
        
        # Save performance report
        profiler.start_step("FINALIZE: Save performance report")
        report_file = profiler.save_report()
        profiler.end_step({'report_file': report_file})
        
        # Increment usage counter after successful analysis
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        usage_service.increment_usage(
            user_id=current_user,
            operation_type=operation_type,
            operation_id=analysis_id,
            metadata={'tier': request.tier.value, 'competitors': len(competitors_dict)}
        )
        
        logger.info(f"tier_analysis_completed: analysis_id={analysis_id}, tier={request.tier.value}, insights_count={len(insights_stored)}, processing_time={analysis_result.get('metadata', {}).get('processing_time_seconds', 0)}")
        logger.info(f"📊 Performance report: {report_file}")
        
        # Convert CompetitorInfo objects to dictionary format for response
        competitors_dict = []
        for comp in competitors:
            competitor_data = {
                "competitor_id": comp.place_id,
                "competitor_name": comp.name,
                "rating": comp.rating,
                "review_count": comp.review_count,
                "distance_miles": comp.distance_miles,
                "address": comp.address,
                "place_id": comp.place_id
            }
            competitors_dict.append(competitor_data)
        
        # Build response
        response = AnalysisResponse(
            analysis_id=analysis_id,
            status="completed",
            restaurant_name=request.restaurant_name,
            location=request.location,
            category=request.category,
            tier=request.tier.value,
            competitors=competitors_dict,
            insights=insights_stored,
            evidence_reviews=analysis_result.get('evidence_reviews'),
            metadata=analysis_result.get('metadata', {}),
            created_at=analysis_data['created_at'],
            completed_at=completion_data['completed_at'],
            processing_time_seconds=int(analysis_result.get('metadata', {}).get('processing_time_seconds', 0))
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"tier_analysis_failed: analysis_id={analysis_id if 'analysis_id' in locals() else 'unknown'}, error={str(e)}")
        
        # Update analysis status to failed if we have an ID
        if 'analysis_id' in locals():
            try:
                service_client = get_supabase_service_client()
                service_client.table("analyses").update({
                    "status": "failed",
                    "error_message": str(e),
                    "completed_at": datetime.utcnow().isoformat()
                }).eq("id", analysis_id).execute()
            except:
                pass
        
        raise ErrorSanitizer.create_http_exception(
            e,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            user_message="Analysis failed. Please try again or contact support."
        )

@router.get("/tiers/comparison")
async def get_tier_comparison(current_user: str = Depends(get_current_user)):
    """Get comparison of analysis tiers and features"""
    return orchestrator.get_tier_comparison()

@router.post("/tiers/estimate-cost")
async def estimate_analysis_cost(
    tier: AnalysisTier,
    competitor_count: int = 5,
    avg_reviews_per_competitor: int = 25,
    current_user: str = Depends(get_current_user)
):
    """Estimate cost for analysis based on parameters"""
    return orchestrator.get_cost_estimate(
        tier=tier.value,
        competitor_count=competitor_count,
        avg_reviews_per_competitor=avg_reviews_per_competitor
    )

@router.get("/cache/stats")
async def get_cache_stats(current_user: str = Depends(get_current_user)):
    """Get Redis cache statistics"""
    from services.redis_client import cache
    return cache.get_stats()

@router.post("/cache/invalidate")
async def invalidate_cache(
    location: Optional[str] = None,
    place_id: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """Invalidate cache for specific location or competitor"""
    from services.outscraper_service import OutscraperService
    
    if not location and not place_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either location or place_id"
        )
    
    service = OutscraperService()
    service.invalidate_cache(location=location, place_id=place_id)
    
    return {
        "message": "Cache invalidated successfully",
        "location": location,
        "place_id": place_id
    }


# IMPORTANT: This route MUST be defined BEFORE /{analysis_id} routes
# to prevent "analyses" from being matched as a UUID parameter
@router.get("/analyses", response_model=list)
async def get_user_analyses(
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get all analyses for the current user
    Returns list of analyses with basic info including restaurant_name, tier, and insights count
    """
    try:
        service_client = get_supabase_service_client()
        response = service_client.table('analyses').select(
            'id, restaurant_name, location, category, tier, competitor_count, status, created_at, updated_at, insights_generated'
        ).eq('user_id', current_user).order('created_at', desc=True).execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch analyses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analyses"
        )


@router.get("/{analysis_id}/status")
async def get_analysis_status(
    analysis_id: str,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """Get analysis status for progress tracking"""
    try:
        # Use service client to bypass RLS since we're validating user via JWT
        service_client = get_supabase_service_client()
        
        # Debug database state
        logger.debug(f"🔍 STATUS_CHECK: analysis_id={analysis_id}")
        
        # Check if analysis exists
        analysis_exists = service_client.table("analyses").select("id, status").eq("id", analysis_id).execute()
        logger.debug(f"Analysis exists: {len(analysis_exists.data) > 0}")
        
        # The actual query we're using
        analysis_response = service_client.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()
        logger.debug(f"Query result: {len(analysis_response.data)} records found")
        
        if analysis_exists.data and not analysis_response.data:
            logger.error(f"🚨 Authorization mismatch for analysis {analysis_id}")
        
        if not analysis_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        analysis = analysis_response.data[0]
        analysis_status = analysis.get('status', 'unknown')
        
        # Calculate progress based on status
        progress_map = {
            'pending': 0,
            'processing': 50,
            'completed': 100,
            'failed': 0,
            'cancelled': 0
        }
        
        progress_percentage = progress_map.get(analysis_status, 0)
        
        # Add current step information
        current_step = None
        estimated_remaining = None
        
        if analysis_status == 'processing':
            current_step = "Analyzing competitor reviews..."
            estimated_remaining = 30  # seconds
        elif analysis_status == 'completed':
            current_step = "Analysis complete"
            estimated_remaining = 0
        elif analysis_status == 'pending':
            current_step = "Starting analysis..."
            estimated_remaining = 60
        elif analysis_status == 'failed':
            current_step = "Analysis failed"
            estimated_remaining = 0
        
        return {
            "analysis_id": analysis_id,
            "status": analysis_status,
            "progress_percentage": progress_percentage,
            "current_step": current_step,
            "estimated_time_remaining_seconds": estimated_remaining,
            "error_message": analysis.get("error_message") if analysis_status == 'failed' else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis status {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analysis status"
        )

@router.get("/{analysis_id}")
async def get_analysis_result(
    analysis_id: str,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """Get analysis result by ID"""
    print(f"🚨 DEBUG: GET_ANALYSIS_RESULT CALLED FOR {analysis_id}")
    logger.debug(f"GET_ANALYSIS_RESULT called for {analysis_id}")
    logger.debug(f"Starting analysis result fetch")
    
    try:
        # Use service client to bypass RLS since we're validating user via JWT
        logger.debug(f"Getting service client")
        service_client = get_supabase_service_client()
        
        logger.debug(f"Querying analyses table for analysis_id={analysis_id}")
        analysis_response = service_client.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()
        
        if not analysis_response.data:
            logger.error(f"Analysis not found: {analysis_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        analysis = analysis_response.data[0]
        logger.debug(f"Analysis retrieved - status={analysis.get('status')}, tier={analysis.get('tier')}")
        
        # Get competitors from analysis_competitors table
        logger.debug(f"Querying analysis_competitors table")
        competitors_response = service_client.table("analysis_competitors").select("*").eq("analysis_id", analysis_id).execute()
        
        # Get all competitor IDs for batch query
        competitor_ids = [comp.get("competitor_id") for comp in competitors_response.data]
        
        # Batch query: Get all competitor details in one query
        competitor_details_map = {}
        if competitor_ids:
            all_details_response = service_client.table("competitors").select("id, address, google_place_id").in_("id", competitor_ids).execute()
            competitor_details_map = {detail['id']: detail for detail in all_details_response.data}
        
        # Combine data
        competitors = []
        for comp in competitors_response.data:
            competitor_id = comp.get("competitor_id")
            competitor_details = competitor_details_map.get(competitor_id, {})
            
            competitor_data = {
                "competitor_id": competitor_id,
                "competitor_name": comp.get("competitor_name"),
                "rating": comp.get("rating"),
                "review_count": comp.get("review_count"),
                "distance_miles": comp.get("distance_miles"),
                "address": competitor_details.get("address"),
                "place_id": competitor_details.get("google_place_id") or competitor_id
            }
            competitors.append(competitor_data)
        logger.info(f"🔍 STEP_4: Found {len(competitors) if competitors else 0} competitors")
        if competitors:
            logger.info(f"🔍 STEP_4: First competitor: {competitors[0]}")
        
        # Get 3 sample reviews per competitor for evidence
        for competitor in competitors:
            competitor_id = competitor.get("competitor_id")
            reviews_response = service_client.table("reviews").select("rating, text, review_date").eq("competitor_id", competitor_id).limit(3).execute()
            competitor["sample_reviews"] = reviews_response.data if reviews_response.data else []
        
        # Initialize storage service for evidence retrieval
        storage_service = EnhancedAnalysisStorage(service_client)
        
        # Get insights with competitor names
        logger.info(f"🔍 STEP_5: Querying insights table")
        insights_response = service_client.table("insights").select("*").eq("analysis_id", analysis_id).execute()
        
        # Ensure competitor_name is populated for insights
        insights = []
        for insight in insights_response.data:
            # If competitor_name is missing, try to get it from analysis_competitors
            if not insight.get("competitor_name") and insight.get("competitor_id"):
                # Find the competitor name from our competitors data
                competitor_name = None
                for comp in competitors:
                    if comp.get("competitor_id") == insight.get("competitor_id"):
                        competitor_name = comp.get("competitor_name")
                        break
                insight["competitor_name"] = competitor_name or "Multiple Sources"
            elif not insight.get("competitor_name"):
                insight["competitor_name"] = "Multiple Sources"
            
            insights.append(insight)
        logger.info(f"🔍 STEP_5: Found {len(insights) if insights else 0} insights")
        if insights:
            logger.info(f"🔍 STEP_5: First insight: {insights[0]}")
        
        # DEBUG: Log raw analysis data
        logger.info(f"🔍 RAW_ANALYSIS: {analysis}")
        logger.info(f"🔍 TIER_VALUE: '{analysis.get('tier', 'NOT_FOUND')}'")
        logger.info(f"🔍 COMPETITORS_COUNT: {len(competitors)}")
        logger.info(f"🔍 INSIGHTS_COUNT: {len(insights)}")
        
        # Build response data first
        logger.info(f"🔍 STEP_6: Building response data")
        response_data = {
            "analysis_id": analysis_id,
            "status": analysis.get('status', 'unknown'),
            "restaurant_name": analysis.get('restaurant_name', ''),
            "location": analysis.get('location', ''),
            "category": analysis.get('category', 'restaurant'),
            "tier": analysis.get('tier', 'free'),
            "competitors": competitors,
            "insights": insights,
            "evidence_reviews": storage_service.get_evidence_reviews(analysis_id),
            "metadata": {
                'tier': analysis.get('tier', 'free'),
                'estimated_cost': analysis.get('estimated_cost', 0.0),
                'actual_cost': analysis.get('actual_cost', 0.0),
                'insights_generated': len(insights),
                'competitors_analyzed': len(competitors)
            },
            "created_at": analysis.get('created_at', ''),
            "completed_at": analysis.get('completed_at'),
            "processing_time_seconds": 0  # Calculate if needed
        }
        logger.info(f"🔍 STEP_6: Response data built - category={response_data.get('category')}, competitors_count={len(competitors)}, insights_count={len(insights)}")
        
        # DEBUG: Log the response data before validation
        logger.info(f"🔍 RESPONSE_DATA_KEYS: {list(response_data.keys())}")
        logger.info(f"🔍 TIER_IN_RESPONSE: '{response_data.get('tier', 'MISSING')}'")
        
        # Try to build response with detailed error handling
        try:
            logger.info("🔍 ATTEMPTING_PYDANTIC_VALIDATION...")
            result = AnalysisResponse(**response_data)
            logger.info("🔍 PYDANTIC_VALIDATION_SUCCESS!")
            return result
        except Exception as validation_error:
            logger.error(f"🔍 PYDANTIC_VALIDATION_FAILED: {validation_error}")
            logger.error(f"🔍 VALIDATION_ERROR_TYPE: {type(validation_error)}")
            logger.error(f"🔍 RESPONSE_DATA_FULL: {response_data}")
            raise
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analysis"
        )

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete an analysis and all related data
    Cascades to: insights, analysis_competitors, evidence_reviews
    """
    try:
        service_client = get_supabase_service_client()
        
        # Verify ownership
        analysis = service_client.table("analyses").select("id").eq("id", analysis_id).eq("user_id", current_user).execute()
        
        if not analysis.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Delete related data first (cascade)
        # Delete insights
        service_client.table("insights").delete().eq("analysis_id", analysis_id).execute()
        
        # Delete analysis_competitors
        service_client.table("analysis_competitors").delete().eq("analysis_id", analysis_id).execute()
        
        # Delete evidence_reviews
        service_client.table("evidence_reviews").delete().eq("analysis_id", analysis_id).execute()
        
        # Delete the analysis itself
        service_client.table("analyses").delete().eq("id", analysis_id).execute()
        
        logger.info(f"analysis_deleted: analysis_id={analysis_id}, user_id={current_user}")
        
        return {"message": "Analysis deleted successfully", "analysis_id": analysis_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete analysis"
        )
