#!/usr/bin/env python3
"""
Streaming Analysis Orchestrator
Coordinates streaming analysis with real-time progress updates
"""
import asyncio
import logging
from typing import Dict, List, AsyncGenerator, Any
from datetime import datetime

from api.schemas.analysis_schemas import AnalysisRequest
from services.outscraper_service import OutscraperService
from services.analysis_service_orchestrator import AnalysisServiceOrchestrator
from services.enhanced_analysis_storage import EnhancedAnalysisStorage
from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)

class StreamingOrchestrator:
    """
    Orchestrates streaming analysis with real-time progress updates
    """
    
    def __init__(self):
        from services.competitor_exclusion_service import CompetitorExclusionService
        from database.supabase_client import get_supabase_client
        
        self.outscraper_service = OutscraperService()
        self.analysis_orchestrator = AnalysisServiceOrchestrator()
        supabase_client = get_supabase_client()
        self.exclusion_service = CompetitorExclusionService(supabase_client)
    
    async def stream_analysis(
        self,
        analysis_id: str,
        request: AnalysisRequest,
        current_user: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream analysis progress with real-time updates
        
        Yields events:
        - competitors_found: When competitor discovery completes
        - competitor_reviews: When each competitor's reviews are collected
        - llm_analysis_started: When LLM processing begins
        - insights_generated: When individual insights are created
        """
        
        try:
            # Get excluded competitors (analyzed in last 14 days)
            excluded_place_ids = await self.exclusion_service.get_excluded_place_ids(
                user_id=current_user,
                analysis_type='review'
            )
            
            # Phase 1 & 2: Use the PROVEN parallel method (competitors + reviews together)
            logger.info(f"🔍 Starting PARALLEL competitor analysis")
            
            analysis_results = await asyncio.to_thread(
                self.outscraper_service.analyze_competitors_parallel,
                location=request.location,
                restaurant_name=request.restaurant_name,
                category=request.category or "restaurant",
                max_competitors=2 if request.tier.value == "free" else 5,
                force_refresh=False,
                excluded_place_ids=excluded_place_ids,
                tier=request.tier.value
            )
            
            competitors = analysis_results.get('competitors', [])
            competitors_with_reviews = analysis_results.get('reviews', {})
            
            if not competitors:
                yield {
                    'type': 'error',
                    'data': {'error': 'No competitors found in the specified area'}
                }
                return
            
            # Store competitors in database
            service_client = get_supabase_service_client()
            competitor_data_list = []
            analysis_competitor_data_list = []
            
            for competitor in competitors:
                # Store in competitors table (matches actual production schema)
                competitor_data = {
                    "id": competitor.place_id,
                    "name": competitor.name,
                    "address": competitor.address,
                    "latitude": competitor.latitude,
                    "longitude": competitor.longitude,
                    "google_place_id": competitor.place_id,
                    "place_id": competitor.place_id,  # Duplicate column for compatibility
                    "rating": competitor.rating,
                    "review_count": competitor.review_count,
                    "google_rating": competitor.rating,
                    "google_review_count": competitor.review_count,
                    "analysis_id": analysis_id,
                    "distance_miles": competitor.distance_miles,
                    "created_at": datetime.utcnow().isoformat()
                }
                competitor_data_list.append(competitor_data)
                
                analysis_competitor_data = {
                    "analysis_id": analysis_id,
                    "competitor_id": competitor.place_id,
                    "competitor_name": competitor.name,
                    "rating": competitor.rating,
                    "review_count": competitor.review_count,
                    "distance_miles": competitor.distance_miles
                }
                analysis_competitor_data_list.append(analysis_competitor_data)
            
            # Batch store competitors
            if competitor_data_list:
                try:
                    result = service_client.table("competitors").upsert(
                        competitor_data_list,
                        on_conflict='id'
                    ).execute()
                    logger.info(f"✅ Stored {len(competitor_data_list)} competitors in database")
                except Exception as e:
                    logger.error(f"❌ Failed to store competitors: {e}")
                    
            if analysis_competitor_data_list:
                try:
                    result = service_client.table("analysis_competitors").upsert(analysis_competitor_data_list).execute()
                    logger.info(f"✅ Stored {len(analysis_competitor_data_list)} analysis_competitor records")
                except Exception as e:
                    logger.error(f"❌ Failed to store analysis_competitors: {e}")
            
            yield {
                'type': 'competitors_found',
                'data': {
                    'step': f'Found {len(competitors)} competitors',
                    'competitors': [
                        {
                            'competitor_id': comp.place_id,
                            'competitor_name': comp.name,
                            'rating': comp.rating,
                            'review_count': comp.review_count,
                            'distance_miles': comp.distance_miles,
                            'address': comp.address
                        }
                        for comp in competitors
                    ],
                    'progress': 20
                }
            }
            
            # Reviews are already collected by analyze_competitors_parallel!
            total_reviews = sum(len(reviews) for reviews in competitors_with_reviews.values())
            logger.info(f"📝 Reviews collected via parallel method: {total_reviews} total reviews")
            
            # Store all reviews in database (batch operation)
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
            
            # Batch upsert all reviews
            if all_review_data:
                service_client.table("reviews").upsert(
                    all_review_data,
                    on_conflict='competitor_id,source,external_id'
                ).execute()
            
            # Stream single progress update for review collection
            yield {
                'type': 'competitor_reviews',
                'data': {
                    'step': f'Collected {total_reviews} reviews from {len(competitors)} competitors',
                    'total_reviews': total_reviews,
                    'progress': 70
                }
            }
            
            # Phase 3: LLM Analysis (streaming insights)
            logger.info(f"🧠 Starting LLM analysis with {total_reviews} reviews")
            
            yield {
                'type': 'llm_analysis_started',
                'data': {
                    'step': 'Analyzing competitor insights...',
                    'total_reviews': total_reviews,
                    'progress': 70
                }
            }
            
            # Run LLM analysis
            analysis_result = await self.analysis_orchestrator.analyze_competitors(
                restaurant_name=request.restaurant_name,
                restaurant_location=request.location,
                restaurant_category=request.category or "restaurant",
                competitors_data=competitors_with_reviews,
                tier=request.tier.value
            )
            
            # Store insights and stream them one by one
            storage_service = EnhancedAnalysisStorage(service_client)
            insights = analysis_result.get('actionable_insights', [])
            
            for i, insight in enumerate(insights):
                # Store individual insight
                insight_data = {
                    "analysis_id": analysis_id,
                    "competitor_id": insight.get('competitor_id'),
                    "competitor_name": insight.get('competitor_source', 'Multiple Sources'),
                    "category": insight.get('category', 'opportunity'),
                    "title": insight.get('title', ''),
                    "description": insight.get('description', ''),
                    "confidence": insight.get('confidence', 'medium'),
                    "mention_count": insight.get('mention_count', 0),
                    "significance": insight.get('significance', 0.0),
                    "proof_quote": insight.get('proof_quote', ''),
                    "created_at": datetime.utcnow().isoformat()
                }
                
                service_client.table("insights").insert(insight_data).execute()
                
                # Stream individual insight
                progress = 70 + (i + 1) * (25 / len(insights))  # 70-95% for insights
                
                yield {
                    'type': 'insight_generated',
                    'data': {
                        'step': f'Generated insight: {insight.get("title", "New insight")}',
                        'insight': insight,
                        'insights_completed': i + 1,
                        'total_insights': len(insights),
                        'progress': int(progress)
                    }
                }
                
                # Small delay for streaming effect
                await asyncio.sleep(0.2)
            
            # Store analysis metadata
            storage_service.store_analysis_metadata(
                analysis_id=analysis_id,
                analysis_result=analysis_result,
                tier=request.tier.value
            )
            
            logger.info(f"✅ Streaming analysis completed for {request.restaurant_name}")
            
        except Exception as e:
            logger.error(f"Streaming analysis failed: {str(e)}")
            yield {
                'type': 'error',
                'data': {'error': str(e)}
            }