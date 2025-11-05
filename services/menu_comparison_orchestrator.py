"""
Menu Comparison Orchestrator
Coordinates the entire menu comparison workflow
Separation of Concerns: Orchestrates services, no direct API/DB calls
"""
import logging
import asyncio
from typing import Dict, List, AsyncGenerator, Any

from services.competitor_discovery_service import CompetitorDiscoveryService
from services.competitor_menu_parser import CompetitorMenuParser
from services.menu_comparison_llm import MenuComparisonLLM
from services.menu_comparison_storage import MenuComparisonStorage
from services.menu_storage_service import MenuStorageService

logger = logging.getLogger(__name__)


class MenuComparisonOrchestrator:
    """
    Orchestrate menu comparison workflow
    
    Workflow:
    1. Discover 5 competitors
    2. User selects 2 competitors
    3. Parse selected competitor menus
    4. Compare with user's menu
    5. Generate insights
    6. Store results
    """
    
    def __init__(self):
        from services.competitor_exclusion_service import CompetitorExclusionService
        from database.supabase_client import get_supabase_client
        
        supabase_client = get_supabase_client()
        self.exclusion_service = CompetitorExclusionService(supabase_client)
        self.discovery_service = CompetitorDiscoveryService(self.exclusion_service)
        self.menu_parser = CompetitorMenuParser()
        self.comparison_llm = MenuComparisonLLM()
        self.storage = MenuComparisonStorage()
        self.menu_storage = MenuStorageService()
        logger.info("✅ Menu Comparison Orchestrator initialized")
    
    async def discover_competitors(
        self,
        user_id: str,
        user_menu_id: str,
        restaurant_name: str,
        location: str,
        category: str = "restaurant",
        radius_miles: float = 3.0
    ) -> Dict:
        """
        Phase 1: Discover competitors
        
        Args:
            user_id: User ID
            user_menu_id: User's menu ID
            restaurant_name: Restaurant name
            location: Location string
            category: Restaurant category
            radius_miles: Search radius
            
        Returns:
            {
                "analysis_id": str,
                "competitors": [...],
                "competitors_found": int
            }
        """
        logger.info(f"🔍 Phase 1: Discovering competitors")
        
        try:
            # Create analysis session
            analysis_id = self.storage.create_analysis(
                user_id=user_id,
                user_menu_id=user_menu_id,
                restaurant_name=restaurant_name,
                location=location
            )
            
            # Get excluded competitors (analyzed in last 14 days)
            excluded_place_ids = await self.exclusion_service.get_excluded_place_ids(
                user_id=user_id,
                analysis_type='menu'
            )
            
            # Find competitors (excluding recently analyzed ones)
            competitors = await self.discovery_service.find_competitors(
                location=location,
                restaurant_name=restaurant_name,
                category=category,
                radius_miles=radius_miles,
                max_results=5,
                user_id=user_id,
                excluded_place_ids=excluded_place_ids
            )
            
            if not competitors:
                # No new competitors found - fetch ALL competitors (including previously analyzed)
                logger.info("⚠️ No new competitors found, fetching previously analyzed competitors for re-analysis option")
                all_competitors = await self.discovery_service.find_competitors(
                    location=location,
                    restaurant_name=restaurant_name,
                    category=category,
                    radius_miles=radius_miles,
                    max_results=10,
                    user_id=user_id,
                    excluded_place_ids=[]  # Don't exclude any - show all
                )
                
                self.storage.update_analysis_status(
                    analysis_id=analysis_id,
                    status="pending_selection"
                )
                
                return {
                    "analysis_id": analysis_id,
                    "competitors": all_competitors,
                    "selected_competitors": [],
                    "status": "pending_selection",
                    "message": f"Found {len(all_competitors)} competitors (all have been analyzed recently). You can select competitors to re-analyze."
                }
            
            # Auto-select top 2 competitors based on review count and rating
            # Sort by: 1) review_count (descending), 2) rating (descending)
            sorted_competitors = sorted(
                competitors,
                key=lambda c: (c.review_count or 0, c.rating or 0),
                reverse=True
            )
            
            # Select top 2
            selected_competitors = sorted_competitors[:2]
            selected_ids = [c.place_id for c in selected_competitors]
            
            logger.info(f"✅ Auto-selected top 2 competitors:")
            for comp in selected_competitors:
                logger.info(f"   - {comp.business_name} ({comp.review_count} reviews, {comp.rating}⭐)")
            
            # Store competitors
            competitor_data = [
                {
                    "place_id": c.place_id,
                    "business_name": c.business_name,
                    "address": c.address,
                    "latitude": c.latitude,
                    "longitude": c.longitude,
                    "rating": c.rating,
                    "review_count": c.review_count,
                    "price_level": c.price_level,
                    "distance_miles": c.distance_miles,
                    "phone": c.phone,
                    "website": c.website,
                    "menu_url": c.menu_url,
                    "types": c.types
                }
                for c in competitors
            ]
            
            # Store competitors and get their database IDs
            stored_competitors = self.storage.store_competitors(
                analysis_id=analysis_id,
                competitors=competitor_data
            )
            
            # Get database IDs for the selected competitors (by place_id)
            selected_db_ids = [
                comp['id'] for comp in stored_competitors 
                if comp['place_id'] in selected_ids
            ]
            
            # Auto-select top 2 competitors using database UUIDs
            if selected_db_ids:
                self.storage.mark_competitors_selected(
                    analysis_id=analysis_id,
                    competitor_ids=selected_db_ids
                )
            
            # Update status to selecting (valid status)
            self.storage.update_analysis_status(
                analysis_id=analysis_id,
                status="selecting",
                current_step=f"Auto-selected top 2 competitors: {', '.join([c.business_name for c in selected_competitors])}"
            )
            
            logger.info(f"✅ Phase 1 complete: {len(competitors)} competitors found, top 2 auto-selected")
            
            return {
                "analysis_id": analysis_id,
                "competitors": stored_competitors,  # Return stored competitors with database UUIDs
                "competitors_found": len(competitors),
                "selected_competitors": selected_db_ids,  # Return database UUIDs, not place_ids
                "auto_selected": True
            }
            
        except Exception as e:
            logger.error(f"❌ Phase 1 failed: {e}")
            raise
    
    async def analyze_selected_competitors(
        self,
        analysis_id: str,
        user_id: str,
        competitor_ids: List[str]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Phase 2: Analyze selected competitors (streaming)
        
        Args:
            analysis_id: Analysis session ID
            user_id: User ID
            competitor_ids: List of 2 competitor IDs
            
        Yields:
            Progress events as analysis proceeds
        """
        logger.info(f"🧠 Phase 2: Analyzing selected competitors")
        
        try:
            # Mark competitors as selected
            self.storage.mark_competitors_selected(
                analysis_id=analysis_id,
                competitor_ids=competitor_ids
            )
            
            yield {
                "type": "competitors_selected",
                "data": {
                    "message": "Starting menu analysis...",
                    "progress": 10
                }
            }
            
            # Get analysis data
            analysis_data = self.storage.get_analysis(analysis_id, user_id)
            if not analysis_data:
                raise Exception("Analysis not found")
            
            # Get user's menu
            user_menu_id = analysis_data['analysis']['user_menu_id']
            user_menu = await self.menu_storage.get_active_menu(user_id)
            
            if not user_menu:
                raise Exception("User menu not found")
            
            yield {
                "type": "user_menu_loaded",
                "data": {
                    "message": "User menu loaded",
                    "progress": 20
                }
            }
            
            # Parse competitor menus
            competitor_menus = []
            selected_competitors = [
                c for c in analysis_data['competitors']
                if c['id'] in competitor_ids
            ]
            
            for i, competitor in enumerate(selected_competitors):
                progress = 20 + (i + 1) * 25  # 20-70%
                
                # Check if we already have a recent menu snapshot for this competitor
                existing_menu = self.storage.get_latest_competitor_menu(competitor['id'])
                
                if existing_menu and len(existing_menu) > 0:
                    logger.info(f"✅ Using cached menu for {competitor['business_name']} ({len(existing_menu)} items)")
                    
                    competitor_menus.append({
                        "competitor_name": competitor['business_name'],
                        "items": existing_menu
                    })
                    
                    yield {
                        "type": "competitor_menu_cached",
                        "data": {
                            "competitor_name": competitor['business_name'],
                            "items_found": len(existing_menu),
                            "message": f"Using cached menu ({len(existing_menu)} items)",
                            "progress": progress
                        }
                    }
                    continue
                
                yield {
                    "type": "parsing_competitor_menu",
                    "data": {
                        "competitor_name": competitor['business_name'],
                        "message": f"Parsing {competitor['business_name']} menu...",
                        "progress": progress
                    }
                }
                
                # Parse menu
                menu_url = competitor.get('menu_url') or competitor.get('website')
                if not menu_url:
                    logger.warning(f"⚠️  No menu URL for {competitor['business_name']}")
                    continue
                
                parse_result = await self.menu_parser.parse_competitor_menu(
                    menu_url=menu_url,
                    competitor_name=competitor['business_name'],
                    menu_source="google_places"
                )
                
                if parse_result['metadata']['success']:
                    # Store parsed menu
                    self.storage.store_competitor_menu(
                        competitor_id=competitor['id'],
                        analysis_id=analysis_id,
                        menu_items=parse_result['menu_items'],
                        menu_source="google_places",
                        menu_url=menu_url,
                        parse_metadata=parse_result['metadata']
                    )
                    
                    competitor_menus.append({
                        "competitor_name": competitor['business_name'],
                        "items": parse_result['menu_items']
                    })
                    
                    yield {
                        "type": "competitor_menu_parsed",
                        "data": {
                            "competitor_name": competitor['business_name'],
                            "items_found": len(parse_result['menu_items']),
                            "message": f"Parsed {len(parse_result['menu_items'])} items",
                            "progress": progress
                        }
                    }
            
            if not competitor_menus:
                raise Exception("Failed to parse any competitor menus")
            
            # Run LLM comparison
            yield {
                "type": "llm_analysis_started",
                "data": {
                    "message": "Analyzing pricing differences...",
                    "progress": 75
                }
            }
            
            comparison_result = await self.comparison_llm.analyze_menu_comparison(
                user_menu=user_menu,
                competitor_menus=competitor_menus,
                restaurant_name=analysis_data['analysis']['restaurant_name']
            )
            
            # Store insights
            if comparison_result['insights']:
                self.storage.store_insights(
                    analysis_id=analysis_id,
                    insights=comparison_result['insights']
                )
            
            # Update analysis status
            self.storage.update_analysis_status(
                analysis_id=analysis_id,
                status="completed",
                current_step="Analysis complete"
            )
            
            yield {
                "type": "analysis_complete",
                "data": {
                    "message": "Analysis complete!",
                    "insights_generated": len(comparison_result['insights']),
                    "progress": 100
                }
            }
            
            logger.info(f"✅ Phase 2 complete: {len(comparison_result['insights'])} insights")
            
        except Exception as e:
            logger.error(f"❌ Phase 2 failed: {e}")
            self.storage.update_analysis_status(
                analysis_id=analysis_id,
                status="failed",
                error_message=str(e)
            )
            
            yield {
                "type": "error",
                "data": {
                    "message": str(e),
                    "error": str(e)
                }
            }
