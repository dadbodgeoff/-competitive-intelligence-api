from datetime import datetime
import asyncio
from api.schemas.analysis_schemas import AnalysisRequest, AnalysisStatus
from database.supabase_client import get_supabase_client
from services.google_places_service import GooglePlacesService
from services.review_fetching_service import ReviewFetchingService
from services.llm_analysis_service import LLMAnalysisService

class AnalysisService:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.places_service = GooglePlacesService()
        self.review_service = ReviewFetchingService()
        self.llm_service = LLMAnalysisService()

    async def process_analysis(self, analysis_id: str, user_id: str, request: AnalysisRequest):
        """
        Background task to process competitor analysis
        This is where you'll integrate with Google Places, Yelp, and LLM services
        """
        try:
            print(f"🚀 ANALYSIS SERVICE: ========== STARTING ANALYSIS ==========")
            print(f"🚀 ANALYSIS SERVICE: Analysis ID: {analysis_id}")
            print(f"🚀 ANALYSIS SERVICE: User ID: {user_id}")
            print(f"🚀 ANALYSIS SERVICE: Restaurant: {request.restaurant_name}")
            print(f"🚀 ANALYSIS SERVICE: Location: {request.location}")
            print(f"🚀 ANALYSIS SERVICE: Category: {request.category}")
            print(f"🚀 ANALYSIS SERVICE: Competitor Count: {request.competitor_count}")
            print(f"🚀 ANALYSIS SERVICE: Review Sources: {request.review_sources}")
            print(f"🚀 ANALYSIS SERVICE: Time Range: {request.time_range}")
            print(f"🚀 ANALYSIS SERVICE: Full Request: {request}")

            # Update status to processing
            print(f"🚀 ANALYSIS SERVICE: Step 1 - Updating status to PROCESSING...")
            await self._update_analysis_status(analysis_id, AnalysisStatus.PROCESSING, "Discovering competitors...")

            # Step 2: Discover competitors
            print(f"🚀 ANALYSIS SERVICE: Step 2 - Discovering competitors...")
            await asyncio.sleep(2)  # Simulate API call
            competitors = await self._discover_competitors(analysis_id, request)
            print(f"🚀 ANALYSIS SERVICE: Found {len(competitors)} competitors")

            # Step 3: Fetch reviews
            print(f"🚀 ANALYSIS SERVICE: Step 3 - Fetching reviews...")
            await self._update_analysis_status(analysis_id, AnalysisStatus.PROCESSING, "Fetching reviews...")
            reviews_data = await self._fetch_reviews(competitors)
            print(f"🚀 ANALYSIS SERVICE: Fetched {len(reviews_data)} review sets")

            # Step 4: Analyze with AI
            print(f"🚀 ANALYSIS SERVICE: Step 4 - Analyzing with AI...")
            await self._update_analysis_status(analysis_id, AnalysisStatus.PROCESSING, "Analyzing with AI...")
            insights = await self._analyze_reviews(analysis_id, reviews_data, request)
            print(f"🚀 ANALYSIS SERVICE: Generated {len(insights)} insights")

            # Step 5: Complete analysis
            print(f"🚀 ANALYSIS SERVICE: Step 5 - Completing analysis...")
            
            # ✅ CRITICAL FIX: Add buffer to ensure all data is committed before marking as completed
            # This prevents race conditions where frontend navigates before results API is ready
            print(f"🚀 ANALYSIS SERVICE: Adding 2.5s buffer to ensure data consistency...")
            await asyncio.sleep(2.5)  # Safe buffer for database commits and API readiness
            
            await self._update_analysis_status(analysis_id, AnalysisStatus.COMPLETED, "Analysis complete!")

            print(f"🚀 ANALYSIS SERVICE: ========== ANALYSIS COMPLETED ==========")
            print(f"🚀 ANALYSIS SERVICE: Analysis ID: {analysis_id}")
            print(f"🚀 ANALYSIS SERVICE: Final Status: COMPLETED")
            print(f"🚀 ANALYSIS SERVICE: Competitors: {len(competitors)}")
            print(f"🚀 ANALYSIS SERVICE: Insights: {len(insights)}")
            print(f"🚀 ANALYSIS SERVICE: =========================================")

        except Exception as e:
            print(f"❌ ANALYSIS SERVICE: Process analysis failed: {e}")
            print(f"❌ ANALYSIS SERVICE: Exception type: {type(e)}")
            import traceback
            print(f"❌ ANALYSIS SERVICE: Traceback: {traceback.format_exc()}")
            
            # Update status to failed
            try:
                await self._update_analysis_status(analysis_id, AnalysisStatus.FAILED, error_message=str(e))
            except Exception as update_error:
                print(f"❌ ANALYSIS SERVICE: Failed to update status: {update_error}")
            
            raise e

    async def _update_analysis_status(self, analysis_id: str, status: AnalysisStatus, current_step: str = None, error_message: str = None):
        """Update analysis status in database"""
        try:
            print(f"📊 ANALYSIS SERVICE: Updating status to {status} - {current_step}")
            
            update_data = {
                "status": status.value,
                "updated_at": datetime.utcnow().isoformat()
            }

            if current_step:
                update_data["current_step"] = current_step

            if error_message:
                update_data["error_message"] = error_message

            if status == AnalysisStatus.COMPLETED:
                update_data["completed_at"] = datetime.utcnow().isoformat()

            result = self.supabase.table("analyses").update(update_data).eq("id", analysis_id).execute()
            print(f"📊 ANALYSIS SERVICE: Status update result: {result.data}")

        except Exception as e:
            print(f"❌ ANALYSIS SERVICE: Status update failed: {e}")
            print(f"❌ ANALYSIS SERVICE: Status update exception type: {type(e)}")
            import traceback
            print(f"❌ ANALYSIS SERVICE: Status update traceback: {traceback.format_exc()}")
            raise e

    async def _discover_competitors(self, analysis_id: str, request: AnalysisRequest) -> list:
        """Discover competitors using Google Places API"""
        try:
            # Use Google Places service to find competitors
            competitors = self.places_service.find_competitors(
                location=request.location,
                restaurant_name=request.restaurant_name,
                category=request.category or "restaurant",
                radius_miles=2.0,
                max_results=request.competitor_count
            )
            
            stored_competitors = []
            
            # Store competitors in database
            for competitor in competitors:
                try:
                    # Store in competitors table
                    competitor_data = {
                        "id": competitor.place_id,
                        "name": competitor.name,
                        "address": competitor.address,
                        "latitude": competitor.latitude,
                        "longitude": competitor.longitude,
                        "rating": competitor.rating,
                        "review_count": competitor.review_count,
                        "google_place_id": competitor.place_id,
                        "google_rating": competitor.rating,
                        "google_review_count": competitor.review_count,
                        "category": request.category or "restaurant"
                    }
                    
                    self.supabase.table("competitors").upsert(competitor_data).execute()

                    # Link to analysis
                    analysis_competitor_data = {
                        "analysis_id": analysis_id,
                        "competitor_id": competitor.place_id,
                        "competitor_name": competitor.name,
                        "rating": competitor.rating,
                        "review_count": competitor.review_count,
                        "distance_miles": competitor.distance_miles
                    }
                    
                    self.supabase.table("analysis_competitors").upsert(analysis_competitor_data).execute()
                    
                    # Convert to dict for return
                    stored_competitors.append({
                        "id": competitor.place_id,
                        "name": competitor.name,
                        "address": competitor.address,
                        "rating": competitor.rating,
                        "review_count": competitor.review_count,
                        "distance_miles": competitor.distance_miles
                    })

                except Exception as e:
                    print(f"Error storing competitor {competitor.name}: {str(e)}")

            return stored_competitors
            
        except Exception as e:
            print(f"Error discovering competitors: {str(e)}")
            return []

    async def _fetch_reviews(self, competitors: list) -> dict:
        """Fetch reviews from competitors using Google Places API"""
        try:
            # Use review fetching service to get real reviews
            reviews_data = await self.review_service.fetch_reviews_for_analysis(
                competitors=competitors,
                max_reviews_per_competitor=50
            )
            
            # Store reviews in database
            for competitor_id, reviews in reviews_data.items():
                for review in reviews:
                    try:
                        review_data = {
                            "id": review.review_id,
                            "competitor_id": competitor_id,
                            "source": review.source,
                            "external_id": review.external_id,
                            "author_name": review.author_name,
                            "rating": review.rating,
                            "text": review.text,
                            "review_date": review.review_date.isoformat(),
                            "created_at": datetime.utcnow().isoformat()
                        }
                        
                        self.supabase.table("reviews").upsert(review_data).execute()
                        
                    except Exception as e:
                        print(f"Error storing review: {str(e)}")
            
            # Convert to simple dict format for analysis
            simple_reviews_data = {}
            for competitor_id, reviews in reviews_data.items():
                simple_reviews_data[competitor_id] = [
                    {
                        "rating": review.rating,
                        "text": review.text,
                        "date": review.review_date.isoformat(),
                        "author": review.author_name,
                        "quality_score": review.quality_score
                    }
                    for review in reviews
                ]
            
            return simple_reviews_data
            
        except Exception as e:
            print(f"Error fetching reviews: {str(e)}")
            return {}

    async def _analyze_reviews(self, analysis_id: str, reviews_data: dict, request: AnalysisRequest) -> list:
        """Analyze reviews using Google Gemini LLM"""
        try:
            # Prepare data for LLM analysis
            competitors_with_reviews = {}
            
            for competitor_id, reviews in reviews_data.items():
                if reviews:  # Only include competitors with reviews
                    # Add competitor name to reviews
                    for review in reviews:
                        review['competitor_name'] = review.get('competitor_name', 'Unknown Competitor')
                    
                    competitors_with_reviews[competitor_id] = reviews
            
            if not competitors_with_reviews:
                print("No reviews available for LLM analysis")
                return []
            
            # Call LLM analysis service
            analysis_result = await self.llm_service.analyze_competitors(
                restaurant_name=request.restaurant_name,
                restaurant_location=request.location,
                restaurant_category=request.category or "restaurant",
                competitors_data=competitors_with_reviews
            )
            
            # Convert LLM insights to database format
            insights_to_store = []
            
            for insight in analysis_result.get('actionable_insights', []):
                # Extract competitor name from proof quote or set default
                competitor_name = insight.get('competitor_name', 'Multiple Sources')
                
                insight_data = {
                    "id": f"insight_{analysis_id}_{len(insights_to_store)}",
                    "analysis_id": analysis_id,
                    "category": insight.get('category', 'watch'),
                    "title": insight.get('title', 'Untitled Insight'),
                    "description": insight.get('description', ''),
                    "confidence": insight.get('confidence', 'medium'),
                    "mention_count": insight.get('mention_count', 1),
                    "significance": insight.get('significance', 0.0),
                    "proof_quote": insight.get('proof_quote', ''),
                    "competitor_name": competitor_name,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                insights_to_store.append(insight_data)
                
                # Store in database
                try:
                    self.supabase.table("insights").insert(insight_data).execute()
                except Exception as e:
                    print(f"Error storing insight: {str(e)}")
            
            # Store analysis metadata
            try:
                analysis_metadata = {
                    "llm_provider": "google_gemini",
                    "total_reviews_analyzed": analysis_result.get('analysis_summary', {}).get('total_reviews_analyzed', 0),
                    "insights_generated": len(insights_to_store),
                    "analysis_completed_at": datetime.utcnow().isoformat()
                }
                
                self.supabase.table("analyses").update(analysis_metadata).eq("id", analysis_id).execute()
                
            except Exception as e:
                print(f"Error updating analysis metadata: {str(e)}")
            
            print(f"LLM analysis complete: {len(insights_to_store)} insights generated")
            return insights_to_store
            
        except Exception as e:
            print(f"Error in LLM analysis: {str(e)}")
            return []
