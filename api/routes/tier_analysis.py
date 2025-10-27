#!/usr/bin/env python3
"""
Tier-based Analysis API Routes
Supports both free and premium analysis tiers
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
import uuid
import logging
from typing import Dict, Any

from api.schemas.analysis_schemas import (
    AnalysisRequest, AnalysisResponse, AnalysisTier
)
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_client, get_supabase_service_client
from services.analysis_service_orchestrator import AnalysisServiceOrchestrator
from services.google_places_service import GooglePlacesService
from services.review_fetching_service import ReviewFetchingService
from services.enhanced_analysis_storage import EnhancedAnalysisStorage

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analysis"])

# Initialize services
orchestrator = AnalysisServiceOrchestrator()
places_service = GooglePlacesService()
review_service = ReviewFetchingService()

@router.post("/run", response_model=AnalysisResponse)
async def run_tier_analysis(
    request: AnalysisRequest,
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
        
        # Validate tier permissions (placeholder - implement based on your auth system)
        if request.tier == AnalysisTier.PREMIUM:
            # TODO: Check if user has premium subscription
            # For now, allow all users to test premium
            pass
        
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        logger.info(f"🔵 ANALYSIS_START: analysis_id={analysis_id}, user_id={current_user}, restaurant={request.restaurant_name}, tier={request.tier.value}")
        logger.info(f"🔵 USER_CONTEXT: current_user={current_user}, type={type(current_user)}")
        
        # Get cost estimate
        cost_estimate = orchestrator.get_cost_estimate(
            tier=request.tier.value,
            competitor_count=request.competitor_count or (3 if request.tier == AnalysisTier.FREE else 5),
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
        
        # Store in database using service client to bypass RLS
        service_client = get_supabase_service_client()
        insert_result = service_client.table("analyses").insert(analysis_data).execute()
        
        # CRITICAL LOGGING: Verify analysis was stored
        logger.info(f"🔵 ANALYSIS_CREATED: analysis_id={analysis_id}, user_id={current_user}")
        logger.info(f"🔵 INSERT_RESULT: {insert_result.data}")
        
        # Immediately verify it can be found
        verify_result = service_client.table("analyses").select("*").eq("id", analysis_id).execute()
        logger.info(f"🔵 IMMEDIATE_VERIFY: Found {len(verify_result.data)} records for analysis_id={analysis_id}")
        if verify_result.data:
            stored_analysis = verify_result.data[0]
            logger.info(f"🔵 STORED_DATA: user_id={stored_analysis.get('user_id')}, status={stored_analysis.get('status')}")
        
        # Phase 1: Discover competitors
        logger.info(f"discovering_competitors: analysis_id={analysis_id}")
        
        competitors = places_service.find_competitors(
            restaurant_name=request.restaurant_name,
            location=request.location,
            category=request.category or "restaurant",
            radius_miles=3.0,
            max_results=3 if request.tier == AnalysisTier.FREE else 5
        )
        
        if not competitors:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No competitors found in the specified area"
            )
        
        # Store competitors
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
            service_client.table("competitors").upsert(competitor_data).execute()
            
            # ✅ FIX: Also store in analysis_competitors linking table
            analysis_competitor_data = {
                "analysis_id": analysis_id,
                "competitor_id": competitor.place_id,
                "competitor_name": competitor.name,
                "rating": competitor.rating,
                "review_count": competitor.review_count,
                "distance_miles": competitor.distance_miles
            }
            service_client.table("analysis_competitors").upsert(analysis_competitor_data).execute()
        
        logger.info(f"competitors_discovered: analysis_id={analysis_id}, competitor_count={len(competitors)}")
        
        # Phase 2: Fetch reviews
        logger.info(f"fetching_reviews: analysis_id={analysis_id}")
        
        competitors_with_reviews = {}
        for competitor in competitors:
            place_id = competitor.place_id
            name = competitor.name
            
            if place_id:
                reviews = await review_service.fetch_competitor_reviews(
                    competitor_place_id=place_id,
                    competitor_name=name,
                    max_reviews=15 if request.tier == AnalysisTier.FREE else 30
                )
                
                # Convert ReviewData objects to dicts for LLM
                review_dicts = []
                for review in reviews:
                    review_dict = {
                        'competitor_name': name,
                        'rating': review.rating,
                        'text': review.text,
                        'date': review.review_date.isoformat() if review.review_date else 'Unknown',
                        'author': review.author_name,
                        'quality_score': review.quality_score
                    }
                    review_dicts.append(review_dict)
                
                competitors_with_reviews[place_id] = review_dicts
                
                # Store reviews in database
                for review in reviews:
                    review_data = {
                        "id": review.review_id,
                        "competitor_id": place_id,
                        "external_id": review.external_id,
                        "source": review.source,
                        "author_name": review.author_name,
                        "rating": review.rating,
                        "text": review.text,
                        "review_date": review.review_date.isoformat() if review.review_date else None,
                        "language": review.language,
                        "quality_score": review.quality_score,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    try:
                        service_client.table("reviews").insert(review_data).execute()
                    except Exception as e:
                        logger.warning(f"Failed to store review {review.review_id}: {e}")
        
        total_reviews = sum(len(reviews) for reviews in competitors_with_reviews.values())
        logger.info(f"reviews_fetched: analysis_id={analysis_id}, total_reviews={total_reviews}")
        
        # Phase 3: LLM Analysis using orchestrator
        logger.info(f"starting_llm_analysis: analysis_id={analysis_id}, tier={request.tier.value}")
        
        analysis_result = await orchestrator.analyze_competitors(
            restaurant_name=request.restaurant_name,
            restaurant_location=request.location,
            restaurant_category=request.category or "restaurant",
            competitors_data=competitors_with_reviews,
            tier=request.tier.value
        )
        
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
        
        logger.info(f"tier_analysis_completed: analysis_id={analysis_id}, tier={request.tier.value}, insights_count={len(insights_stored)}, processing_time={analysis_result.get('metadata', {}).get('processing_time_seconds', 0)}")
        
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
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/tiers/comparison")
async def get_tier_comparison():
    """Get comparison of analysis tiers and features"""
    return orchestrator.get_tier_comparison()

@router.post("/tiers/estimate-cost")
async def estimate_analysis_cost(
    tier: AnalysisTier,
    competitor_count: int = 5,
    avg_reviews_per_competitor: int = 25
):
    """Estimate cost for analysis based on parameters"""
    return orchestrator.get_cost_estimate(
        tier=tier.value,
        competitor_count=competitor_count,
        avg_reviews_per_competitor=avg_reviews_per_competitor
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
        
        # CRITICAL LOGGING: Debug database state
        logger.info(f"🔍 STATUS_CHECK: analysis_id={analysis_id}, user_id={current_user}")
        
        # Check if analysis exists at all
        analysis_exists = service_client.table("analyses").select("id, user_id, restaurant_name, status").eq("id", analysis_id).execute()
        logger.info(f"🔍 ANALYSIS_EXISTS: {analysis_exists.data}")
        
        # Check all analyses for this user
        user_analyses = service_client.table("analyses").select("id, user_id, restaurant_name, status").eq("user_id", current_user).execute()
        logger.info(f"🔍 USER_ANALYSES: Found {len(user_analyses.data)} analyses for user {current_user}")
        
        # The actual query we're using
        analysis_response = service_client.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()
        logger.info(f"🔍 QUERY_RESULT: {len(analysis_response.data)} records found")
        
        if analysis_exists.data and not analysis_response.data:
            existing = analysis_exists.data[0]
            logger.error(f"🚨 USER_ID_MISMATCH: Analysis exists with user_id={existing.get('user_id')}, but querying for user_id={current_user}")
            logger.error(f"🚨 MISMATCH_DETAILS: existing_user={existing.get('user_id')}, query_user={current_user}, match={existing.get('user_id') == current_user}")
        
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
    logger.info(f"🚨 DEBUG: GET_ANALYSIS_RESULT CALLED FOR {analysis_id}")
    logger.info(f"🔍 STEP_1: Starting analysis result fetch")
    logger.info(f"🔍 STEP_1: analysis_id={analysis_id}")
    logger.info(f"🔍 STEP_1: current_user={current_user}")
    
    try:
        # Use service client to bypass RLS since we're validating user via JWT
        logger.info(f"🔍 STEP_2: Getting service client")
        service_client = get_supabase_service_client()
        logger.info(f"🔍 STEP_2: Service client obtained")
        
        logger.info(f"🔍 STEP_3: Querying analyses table for analysis_id={analysis_id}, user_id={current_user}")
        analysis_response = service_client.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()
        logger.info(f"🔍 STEP_3: Query executed - found {len(analysis_response.data) if analysis_response.data else 0} records")
        
        if not analysis_response.data:
            logger.error(f"🔍 STEP_3: ANALYSIS NOT FOUND - analysis_id={analysis_id}, user_id={current_user}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        analysis = analysis_response.data[0]
        logger.info(f"🔍 STEP_3: Analysis retrieved - status={analysis.get('status')}, category={analysis.get('category')}, tier={analysis.get('tier')}")
        
        # DEBUG: Log the analysis data
        logger.info(f"🔍 ANALYSIS_DATA: {analysis}")
        logger.info(f"🔍 TIER_VALUE: {analysis.get('tier', 'NOT_FOUND')}")
        logger.info(f"🔍 ANALYSIS_KEYS: {list(analysis.keys())}")
        
        # Get competitors from analysis_competitors table
        logger.info(f"🔍 STEP_4: Querying analysis_competitors table")
        competitors_response = service_client.table("analysis_competitors").select("*").eq("analysis_id", analysis_id).execute()
        
        # Get competitor details separately and combine
        competitors = []
        for comp in competitors_response.data:
            competitor_id = comp.get("competitor_id")
            
            # Get full competitor details
            competitor_details_response = service_client.table("competitors").select("address, google_place_id").eq("id", competitor_id).execute()
            competitor_details = competitor_details_response.data[0] if competitor_details_response.data else {}
            
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