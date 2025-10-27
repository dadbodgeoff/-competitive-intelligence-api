"""
LEGACY ANALYSIS ROUTES - DEPRECATED
====================================
This file contains the original analysis system and is now DEPRECATED.

⚠️  WARNING: This is legacy code kept for backward compatibility only.
🔄 MIGRATION: Use api/routes/tier_analysis.py for new development.
📍 ROUTES: Now mounted at /api/v1/legacy/analysis/*
📅 REMOVAL: Planned for future version.

For new development, use the tier-based analysis system in tier_analysis.py
which supports both free and premium tiers with enhanced features.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from datetime import datetime
import uuid
from api.schemas.analysis_schemas import (
    AnalysisRequest, AnalysisResponse, AnalysisStatusResponse, AnalysisStatus
)
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_client, get_user_supabase_client
from services.analysis_service import AnalysisService

router = APIRouter()
analysis_service = AnalysisService()

@router.post("/run", response_model=AnalysisResponse)
async def run_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Start a competitor analysis
    Returns immediately with 202 status and queues the analysis job
    """
    try:
        # Validate input
        if not request.restaurant_name or not request.location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant name and location are required"
            )

        # Generate analysis ID
        analysis_id = str(uuid.uuid4())

        # Create analysis record in database
        analysis_data = {
            "id": analysis_id,
            "user_id": current_user,
            "restaurant_name": request.restaurant_name,
            "location": request.location,
            "category": request.category or "restaurant",
            "review_sources": [source for source in request.review_sources],
            "time_range": request.time_range,
            "competitor_count": request.competitor_count,
            "exclude_seen": request.exclude_seen,
            "status": AnalysisStatus.PENDING,
            "created_at": datetime.utcnow().isoformat()
        }

        # Debug logging
        print(f"🔍 ANALYSIS DEBUG: Starting analysis for user {current_user}")
        print(f"🔍 ANALYSIS DEBUG: Analysis data: {analysis_data}")
        
        # Ensure user exists in users table (required for foreign key)
        print(f"🔍 ANALYSIS DEBUG: Checking if user exists in users table...")
        try:
            # Use service client to bypass RLS for admin operations
            from database.supabase_client import get_supabase_service_client
            service_client = get_supabase_service_client()
            
            user_check = service_client.table("users").select("id").eq("id", current_user).execute()
            print(f"🔍 ANALYSIS DEBUG: User check result: {user_check.data}")
            
            if not user_check.data:
                print(f"🔍 ANALYSIS DEBUG: User not found, creating user record with service client...")
                # Create user record if it doesn't exist (using service client to bypass RLS)
                user_data = {
                    "id": current_user,
                    "subscription_tier": "free",
                    "is_active": True
                }
                user_create_result = service_client.table("users").insert(user_data).execute()
                print(f"🔍 ANALYSIS DEBUG: User creation result: {user_create_result.data}")
            else:
                print(f"🔍 ANALYSIS DEBUG: User exists, proceeding...")
        except Exception as e:
            print(f"❌ ANALYSIS DEBUG: User check/creation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"User setup failed: {str(e)}"
            )

        # Insert analysis into Supabase using service client
        print(f"🔍 ANALYSIS DEBUG: Inserting analysis record with service client...")
        try:
            result = service_client.table("analyses").insert(analysis_data).execute()
            print(f"🔍 ANALYSIS DEBUG: Analysis insert result: {result.data}")
            print(f"🔍 ANALYSIS DEBUG: Analysis insert error (if any): {getattr(result, 'error', None)}")
            
            if not result.data:
                print(f"❌ ANALYSIS DEBUG: No data returned from insert")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create analysis record - no data returned"
                )
        except Exception as e:
            print(f"❌ ANALYSIS DEBUG: Analysis insert failed: {e}")
            print(f"❌ ANALYSIS DEBUG: Exception type: {type(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create analysis record: {str(e)}"
            )

        # Queue background job for analysis
        print(f"🔍 ANALYSIS DEBUG: Queuing background task...")
        try:
            background_tasks.add_task(
                analysis_service.process_analysis,
                analysis_id,
                current_user,
                request
            )
            print(f"🔍 ANALYSIS DEBUG: Background task queued successfully")
        except Exception as e:
            print(f"❌ ANALYSIS DEBUG: Background task failed: {e}")
            print(f"❌ ANALYSIS DEBUG: Background task exception type: {type(e)}")
            import traceback
            print(f"❌ ANALYSIS DEBUG: Background task traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to start analysis: {str(e)}"
            )

        # Return immediate response with 202 status
        print(f"🔍 ANALYSIS DEBUG: Creating response object...")
        try:
            response = AnalysisResponse(
                analysis_id=analysis_id,
                status=AnalysisStatus.PENDING.value,  # Convert enum to string
                restaurant_name=request.restaurant_name,
                location=request.location,
                category=request.category or "restaurant",
                tier="free",  # Add required tier field
                competitors=[],  # Will be populated during processing
                insights=[],     # Will be populated during processing
                metadata={
                    "estimated_time_seconds": 45,
                    "review_sources": request.review_sources,  # Already strings, no .value needed
                    "competitor_count": request.competitor_count
                },
                created_at=datetime.utcnow().isoformat()
            )
            print(f"🔍 ANALYSIS DEBUG: Response object created successfully")
            return response
        except Exception as e:
            print(f"❌ ANALYSIS DEBUG: Response creation failed: {e}")
            print(f"❌ ANALYSIS DEBUG: Response exception type: {type(e)}")
            import traceback
            print(f"❌ ANALYSIS DEBUG: Response traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create response: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start analysis: {str(e)}"
        )

@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    analysis_id: str,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get real-time status of an analysis
    """
    try:
        # Get analysis from database
        result = supabase.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )

        analysis = result.data[0]
        status_enum = AnalysisStatus(analysis["status"])

        # Calculate progress based on status
        progress_map = {
            AnalysisStatus.PENDING: 0,
            AnalysisStatus.PROCESSING: 25,
            AnalysisStatus.COMPLETED: 100,
            AnalysisStatus.FAILED: 0,
            AnalysisStatus.CANCELLED: 0
        }

        progress_percentage = progress_map.get(status_enum, 0)

        # Add current step information
        current_step = None
        estimated_remaining = None

        if status_enum == AnalysisStatus.PROCESSING:
            current_step = "Analyzing competitor reviews..."
            estimated_remaining = 30  # seconds
        elif status_enum == AnalysisStatus.COMPLETED:
            current_step = "Analysis complete"
            estimated_remaining = 0

        return AnalysisStatusResponse(
            analysis_id=analysis_id,
            status=status_enum,
            progress_percentage=progress_percentage,
            current_step=current_step,
            estimated_time_remaining_seconds=estimated_remaining,
            error_message=analysis.get("error_message") if status_enum == AnalysisStatus.FAILED else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analysis status: {str(e)}"
        )

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get complete analysis results
    """
    try:
        # Get analysis from database
        result = supabase.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )

        analysis = result.data[0]

        if analysis["status"] != AnalysisStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail="Analysis is still processing"
            )

        # Get insights from database
        insights_result = supabase.table("insights").select("*").eq("analysis_id", analysis_id).execute()
        raw_insights = insights_result.data if insights_result.data else []
        
        # Ensure competitor_name is populated for insights
        insights = []
        for insight in raw_insights:
            # If competitor_name is missing, try to get it from competitors data
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

        # Get competitors from analysis_competitors table
        competitors_result = supabase.table("analysis_competitors").select("*").eq("analysis_id", analysis_id).execute()
        
        # Get competitor details separately and combine
        competitors = []
        for comp in competitors_result.data:
            competitor_id = comp.get("competitor_id")
            
            # Get full competitor details
            competitor_details_result = supabase.table("competitors").select("address, google_place_id").eq("id", competitor_id).execute()
            competitor_details = competitor_details_result.data[0] if competitor_details_result.data else {}
            
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

        # Transform insights to response format
        formatted_insights = []
        for insight in insights:
            formatted_insights.append({
                "id": insight["id"],
                "category": insight["category"],
                "title": insight["title"],
                "description": insight["description"],
                "confidence": insight["confidence"],
                "mention_count": insight["mention_count"],
                "significance": insight["significance"],
                "competitor_id": insight.get("competitor_id"),
                "competitor_name": insight.get("competitor_name", "Multiple Sources"),
                "proof_quote": insight.get("proof_quote"),
                "type": insight["category"]  # Map category to type for frontend compatibility
            })

        # Transform competitors to response format with both old and new field names for compatibility
        formatted_competitors = []
        for competitor in competitors:
            formatted_competitors.append({
                # Backend field names (what we store)
                "competitor_id": competitor["competitor_id"],
                "competitor_name": competitor["competitor_name"],
                "rating": competitor.get("rating"),
                "review_count": competitor.get("review_count"),
                "distance_miles": competitor.get("distance_miles"),
                "address": competitor.get("address"),
                "place_id": competitor.get("place_id"),
                
                # Frontend expected field names (for compatibility)
                "id": competitor["competitor_id"],
                "name": competitor["competitor_name"]
            })

        return AnalysisResponse(
            analysis_id=analysis_id,
            status=AnalysisStatus(analysis["status"]),
            restaurant_name=analysis["restaurant_name"],
            location=analysis["location"],
            category=analysis.get("category", "restaurant"),
            tier=analysis.get("tier", "free"),
            competitors=formatted_competitors,
            insights=formatted_insights,
            metadata={
                "processing_time_seconds": analysis.get("processing_time_seconds"),
                "total_reviews_analyzed": analysis.get("total_reviews_analyzed"),
                "llm_provider": analysis.get("llm_provider"),
                "tier": analysis.get("tier", "free")
            },
            created_at=analysis["created_at"],
            completed_at=analysis.get("completed_at"),
            processing_time_seconds=analysis.get("processing_time_seconds")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analysis: {str(e)}"
        )
