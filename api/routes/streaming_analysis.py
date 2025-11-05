#!/usr/bin/env python3
"""
Streaming Analysis API Routes - Server-Sent Events Implementation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from datetime import datetime
import uuid
import json
import asyncio
import logging
from typing import Dict, Any, AsyncGenerator

from api.schemas.analysis_schemas import AnalysisRequest, AnalysisTier
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit
from database.supabase_client import get_supabase_service_client
from services.streaming_orchestrator import StreamingOrchestrator
from services.error_sanitizer import ErrorSanitizer

logger = logging.getLogger(__name__)
router = APIRouter(tags=["streaming-analysis"])

@router.post("/run/stream")
@rate_limit("analysis")
async def run_streaming_analysis(
    request: AnalysisRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Stream analysis results as they're generated using Server-Sent Events
    
    Events emitted:
    - analysis_started: Analysis begins
    - competitors_found: Competitor discovery complete
    - competitor_reviews: Reviews collected for each competitor
    - llm_analysis_started: LLM processing begins
    - insights_generated: Individual insights as they're created
    - analysis_complete: Final completion
    """
    
    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events as analysis progresses"""
        
        analysis_id = str(uuid.uuid4())
        orchestrator = StreamingOrchestrator()
        
        try:
            # Validate tier permissions
            if request.tier == AnalysisTier.PREMIUM:
                service_client = get_supabase_service_client()
                user_profile = service_client.table("users").select("subscription_tier").eq("id", current_user).execute()
                
                if not user_profile.data:
                    yield f"event: error\ndata: {json.dumps({'error': 'User profile not found'})}\n\n"
                    return
                
                user_tier = user_profile.data[0].get("subscription_tier", "free")
                if user_tier not in ["premium", "enterprise"]:
                    yield f"event: error\ndata: {json.dumps({'error': 'Premium tier requires subscription upgrade'})}\n\n"
                    return
            
            # Event 1: Analysis started
            event_data = {
                'analysis_id': analysis_id,
                'restaurant_name': request.restaurant_name,
                'location': request.location,
                'tier': request.tier.value,
                'timestamp': datetime.utcnow().isoformat()
            }
            yield f"event: analysis_started\ndata: {json.dumps(event_data)}\n\n"
            
            # Create analysis record
            analysis_data = {
                "id": analysis_id,
                "user_id": current_user,
                "restaurant_name": request.restaurant_name,
                "location": request.location,
                "category": request.category or "restaurant",
                "tier": request.tier.value,
                "status": "processing",
                "current_step": "Finding competitors...",
                "created_at": datetime.utcnow().isoformat()
            }
            
            service_client = get_supabase_service_client()
            service_client.table("analyses").insert(analysis_data).execute()
            
            # Stream the analysis process
            async for event_data in orchestrator.stream_analysis(
                analysis_id=analysis_id,
                request=request,
                current_user=current_user
            ):
                event_type = event_data.get('type')
                data = event_data.get('data', {})
                
                # Update analysis status in database
                if event_type in ['competitors_found', 'competitor_reviews', 'llm_analysis_started']:
                    service_client.table("analyses").update({
                        "current_step": data.get('step', ''),
                        "updated_at": datetime.utcnow().isoformat()
                    }).eq("id", analysis_id).execute()
                
                yield f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
            
            # Final completion
            service_client.table("analyses").update({
                "status": "completed",
                "current_step": "Analysis complete",
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", analysis_id).execute()
            
            completion_data = {
                'analysis_id': analysis_id,
                'status': 'completed',
                'timestamp': datetime.utcnow().isoformat()
            }
            yield f"event: analysis_complete\ndata: {json.dumps(completion_data)}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming analysis failed: {str(e)}")
            
            # Update analysis to failed status
            try:
                service_client.table("analyses").update({
                    "status": "failed",
                    "error_message": str(e),
                    "completed_at": datetime.utcnow().isoformat()
                }).eq("id", analysis_id).execute()
            except:
                pass
            
            error_data = {
                'error': str(e),
                'analysis_id': analysis_id
            }
            yield f"event: error\ndata: {json.dumps(error_data)}\n\n"
    
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

@router.get("/stream/{analysis_id}/status")
async def get_streaming_status(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get current status of streaming analysis"""
    
    service_client = get_supabase_service_client()
    analysis = service_client.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()
    
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis_data = analysis.data[0]
    
    return {
        "analysis_id": analysis_id,
        "status": analysis_data.get("status"),
        "current_step": analysis_data.get("current_step"),
        "created_at": analysis_data.get("created_at"),
        "updated_at": analysis_data.get("updated_at"),
        "completed_at": analysis_data.get("completed_at")
    }

@router.get("/{analysis_id}/reviews")
async def get_analysis_reviews(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get all reviews collected for an analysis"""
    
    try:
        logger.info(f"📋 Fetching reviews for analysis")
        
        service_client = get_supabase_service_client()
        
        # Verify analysis belongs to user
        analysis = service_client.table("analyses").select("id").eq("id", analysis_id).eq("user_id", current_user).execute()
        
        if not analysis.data:
            logger.warning(f"❌ Analysis not found: {analysis_id}")
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Get all reviews for this analysis through competitors
        competitors = service_client.table("analysis_competitors").select("competitor_id").eq("analysis_id", analysis_id).execute()
        
        if not competitors.data:
            logger.info(f"📋 No competitors found for analysis: {analysis_id}")
            return {"reviews": [], "total_count": 0}
        
        competitor_ids = [comp["competitor_id"] for comp in competitors.data]
        logger.info(f"📋 Found {len(competitor_ids)} competitors for analysis: {analysis_id}")
        
        # Get reviews for all competitors
        reviews = service_client.table("reviews").select("""
            id,
            competitor_id,
            external_id,
            source,
            author_name,
            rating,
            text,
            review_date,
            language,
            quality_score,
            created_at
        """).in_("competitor_id", competitor_ids).execute()
        
        logger.info(f"📋 Found {len(reviews.data)} reviews for analysis: {analysis_id}")
        
        # Get competitor names for the reviews
        competitors_info = service_client.table("competitors").select("id, name").in_("id", competitor_ids).execute()
        logger.info(f"📋 Fetched {len(competitors_info.data)} competitor names from database")
        logger.debug(f"📋 Competitor data: {competitors_info.data}")
        competitor_names = {comp["id"]: comp["name"] for comp in competitors_info.data}
        logger.info(f"📋 Competitor names mapping: {competitor_names}")
        
        # Add competitor names to reviews with error handling
        review_data = []
        for i, review in enumerate(reviews.data):
            try:
                review_dict = dict(review)
                review_dict["competitor_name"] = competitor_names.get(review["competitor_id"], "Unknown")
                
                # Ensure all fields are JSON serializable
                for key, value in review_dict.items():
                    if value is None:
                        continue
                    # Handle potential datetime objects
                    if hasattr(value, 'isoformat'):
                        review_dict[key] = value.isoformat()
                    # Handle potential non-string text
                    elif key == 'text' and not isinstance(value, str):
                        review_dict[key] = str(value)
                
                review_data.append(review_dict)
                
            except Exception as e:
                logger.error(f"❌ Error processing review {i} for analysis {analysis_id}: {e}")
                logger.error(f"❌ Problematic review data: {review}")
                # Skip this review but continue with others
                continue
        
        logger.info(f"✅ Successfully processed {len(review_data)} reviews for analysis: {analysis_id}")
        
        return {
            "reviews": review_data,
            "total_count": len(review_data)
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error fetching reviews for analysis {analysis_id}: {e}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        raise ErrorSanitizer.create_http_exception(
            e,
            status_code=500,
            user_message="Failed to fetch reviews. Please try again."
        )