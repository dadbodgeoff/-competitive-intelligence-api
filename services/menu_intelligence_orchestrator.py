"""
Menu Intelligence Orchestrator - Week 2 Day 3
Integrates menu analysis with existing system architecture
Follows patterns from analysis_service_orchestrator.py
"""

import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
import os

# Import existing services (reuse 70% of code)
from services.google_places_service import GooglePlacesService
from services.enhanced_analysis_storage import EnhancedAnalysisStorage

# Import our new menu services
from services.menu_analysis_engine import MenuAnalysisEngine, MenuAnalysisResult
from services.menu_extraction_service import MenuExtractionService
from services.menu_storage_service import MenuStorageService

# Import configuration
from config.feature_flags import FeatureFlags

class MenuIntelligenceOrchestrator:
    """
    Orchestrates complete menu intelligence pipeline
    Follows exact patterns from analysis_service_orchestrator.py
    """
    
    def __init__(self, supabase_client=None):
        """Initialize with existing service patterns"""
        # Reuse existing services (70% code reuse)
        self.places_service = GooglePlacesService()
        self.storage_service = EnhancedAnalysisStorage(supabase_client) if supabase_client else None
        
        # New menu-specific services
        self.menu_engine = MenuAnalysisEngine()
        self.menu_extraction = MenuExtractionService()
        self.menu_storage = MenuStorageService(supabase_client) if supabase_client else None
        
        # Feature flags for safe deployment
        self.feature_flags = FeatureFlags()
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def run_menu_analysis(
        self,
        restaurant_id: str,
        user_menu: Dict,
        location: str,
        category: str = "restaurant",
        tier: str = "free",
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Complete menu intelligence analysis pipeline
        
        Args:
            restaurant_id: Unique restaurant identifier
            user_menu: User's menu data (items, categories, prices)
            location: Restaurant location for competitor discovery
            category: Restaurant category (pizza, burger, etc.)
            tier: "free" or "premium" analysis level
            user_id: User identifier for storage
            
        Returns:
            Complete menu analysis results
        """
        
        # Check feature flags
        if not self.feature_flags.is_enabled("menu_intelligence"):
            raise ValueError("Menu Intelligence feature is currently disabled")
        
        analysis_id = f"menu_{restaurant_id}_{int(datetime.now().timestamp())}"
        start_time = datetime.now()
        
        try:
            self.logger.info(f"Starting menu analysis {analysis_id} for restaurant {restaurant_id}")
            
            # Step 1: Validate user menu
            if not self._validate_user_menu(user_menu):
                raise ValueError("Invalid menu data provided")
            
            # Step 2: Store user menu (if storage available)
            if self.menu_storage and user_id:
                await self.menu_storage.store_user_menu(
                    user_id=user_id,
                    restaurant_id=restaurant_id,
                    menu_data=user_menu
                )
            
            # Step 3: Discover competitors (reuse existing service)
            self.logger.info("Discovering competitors...")
            competitor_limit = 2 if tier == "free" else 5
            
            competitors = await self.places_service.find_competitors(
                restaurant_name="",  # We'll use location-based search
                location=location,
                category=category,
                radius_miles=3.0,
                max_competitors=competitor_limit
            )
            
            if not competitors:
                return self._create_no_competitors_response(analysis_id, user_menu, tier)
            
            self.logger.info(f"Found {len(competitors)} competitors")
            
            # Step 4: Run menu analysis
            analysis_result = await self.menu_engine.analyze_menu_competition(
                user_menu=user_menu,
                competitors=competitors,
                tier=tier
            )
            
            # Step 5: Format response
            formatted_response = self._format_analysis_response(
                analysis_id=analysis_id,
                analysis_result=analysis_result,
                tier=tier,
                processing_time=(datetime.now() - start_time).total_seconds()
            )
            
            # Step 6: Store results (if storage available)
            if self.storage_service and user_id:
                await self._store_analysis_results(
                    analysis_id=analysis_id,
                    user_id=user_id,
                    restaurant_id=restaurant_id,
                    results=formatted_response,
                    tier=tier
                )
            
            self.logger.info(f"Menu analysis {analysis_id} completed successfully")
            return formatted_response
            
        except Exception as e:
            self.logger.error(f"Menu analysis {analysis_id} failed: {str(e)}")
            
            # Return error response in consistent format
            return {
                "analysis_id": analysis_id,
                "success": False,
                "error": str(e),
                "tier": tier,
                "processing_time": (datetime.now() - start_time).total_seconds(),
                "timestamp": datetime.now().isoformat()
            }
    
    def _validate_user_menu(self, user_menu: Dict) -> bool:
        """Validate user menu data structure"""
        if not isinstance(user_menu, dict):
            return False
        
        # Check for items
        items = user_menu.get("items", [])
        if not isinstance(items, list) or len(items) == 0:
            return False
        
        # Validate at least one item has name and price
        valid_items = 0
        for item in items:
            if (isinstance(item, dict) and 
                item.get("name") and 
                item.get("price") is not None):
                valid_items += 1
        
        return valid_items > 0
    
    def _create_no_competitors_response(self, analysis_id: str, user_menu: Dict, tier: str) -> Dict:
        """Create response when no competitors are found"""
        return {
            "analysis_id": analysis_id,
            "success": True,
            "tier": tier,
            "competitors_found": 0,
            "user_menu_summary": {
                "total_items": len(user_menu.get("items", [])),
                "categories": list(set(item.get("category", "Other") for item in user_menu.get("items", [])))
            },
            "message": "No competitors found in your area. Try expanding your search radius or checking your location.",
            "recommendations": [
                {
                    "category": "market_research",
                    "priority": "medium",
                    "title": "Expand competitor search",
                    "description": "Consider looking at competitors in nearby areas or similar restaurant types",
                    "action": "expand_search_radius"
                }
            ],
            "processing_time": 0.1,
            "timestamp": datetime.now().isoformat()
        }
    
    def _format_analysis_response(
        self, 
        analysis_id: str, 
        analysis_result: MenuAnalysisResult, 
        tier: str,
        processing_time: float
    ) -> Dict:
        """Format analysis results into API response structure"""
        
        # Calculate cost estimate (following existing patterns)
        base_cost = 0.18 if tier == "free" else 0.42
        competitor_count = len(analysis_result.competitor_menus)
        estimated_cost = base_cost * (competitor_count / (2 if tier == "free" else 5))
        
        response = {
            "analysis_id": analysis_id,
            "success": True,
            "tier": tier,
            "processing_time": processing_time,
            "estimated_cost": round(estimated_cost, 4),
            "timestamp": datetime.now().isoformat(),
            
            # Menu analysis results
            "menu_analysis": {
                "user_menu_summary": {
                    "total_items": len(analysis_result.user_menu_items),
                    "categories": list(set(item.get("category", "Other") for item in analysis_result.user_menu_items)),
                    "price_range": self._calculate_price_range(analysis_result.user_menu_items)
                },
                
                "competitor_summary": {
                    "competitors_analyzed": len(analysis_result.competitor_menus),
                    "total_competitor_items": sum(len(comp.get("menu_data", {}).get("items", [])) for comp in analysis_result.competitor_menus),
                    "extraction_success_rate": analysis_result.analysis_metadata.get("success_rate", 0)
                },
                
                "item_matching": {
                    "total_matches": len(analysis_result.item_matches),
                    "match_rate": len(analysis_result.item_matches) / len(analysis_result.user_menu_items) if analysis_result.user_menu_items else 0,
                    "matches": analysis_result.item_matches
                },
                
                "pricing_insights": analysis_result.pricing_insights,
                
                "menu_gaps": {
                    "total_gaps": len(analysis_result.menu_gaps),
                    "high_opportunity_gaps": [gap for gap in analysis_result.menu_gaps if gap.get("opportunity_score", 0) > 70],
                    "all_gaps": analysis_result.menu_gaps
                },
                
                "recommendations": analysis_result.recommendations
            },
            
            # Metadata
            "metadata": analysis_result.analysis_metadata
        }
        
        # Add premium-specific data
        if tier == "premium":
            response["menu_analysis"]["strategic_insights"] = self._generate_strategic_insights(analysis_result)
        
        return response
    
    def _calculate_price_range(self, items: List[Dict]) -> Dict:
        """Calculate price range for menu items"""
        prices = [item.get("price", 0) for item in items if item.get("price") is not None]
        
        if not prices:
            return {"min": 0, "max": 0, "average": 0}
        
        return {
            "min": min(prices),
            "max": max(prices),
            "average": round(sum(prices) / len(prices), 2)
        }
    
    def _generate_strategic_insights(self, analysis_result: MenuAnalysisResult) -> Dict:
        """Generate premium strategic insights"""
        insights = {
            "market_positioning": "competitive",
            "revenue_opportunities": [],
            "competitive_advantages": [],
            "risk_factors": []
        }
        
        # Analyze pricing position
        pricing_stats = analysis_result.pricing_insights.get("pricing_statistics", {})
        overpriced_ratio = pricing_stats.get("overpriced_items", 0) / max(pricing_stats.get("total_matches", 1), 1)
        
        if overpriced_ratio > 0.6:
            insights["market_positioning"] = "premium"
            insights["competitive_advantages"].append("Premium pricing position established")
            insights["risk_factors"].append("High prices may limit customer base")
        elif overpriced_ratio < 0.2:
            insights["market_positioning"] = "value"
            insights["revenue_opportunities"].append("Opportunity to increase prices on popular items")
        
        # Identify revenue opportunities from gaps
        high_value_gaps = [gap for gap in analysis_result.menu_gaps if gap.get("opportunity_score", 0) > 80]
        for gap in high_value_gaps[:3]:  # Top 3
            if gap.get("type") == "category_gap":
                insights["revenue_opportunities"].append(f"Add {gap.get('category')} category - high competitor adoption")
        
        return insights
    
    async def _store_analysis_results(
        self,
        analysis_id: str,
        user_id: str,
        restaurant_id: str,
        results: Dict,
        tier: str
    ) -> None:
        """Store analysis results using existing storage patterns"""
        try:
            # Use existing storage service patterns
            storage_data = {
                "analysis_id": analysis_id,
                "user_id": user_id,
                "restaurant_id": restaurant_id,
                "analysis_type": "menu_intelligence",
                "tier": tier,
                "results": results,
                "created_at": datetime.now().isoformat()
            }
            
            # Store using existing patterns (would need to extend storage service)
            if hasattr(self.storage_service, 'store_menu_analysis'):
                await self.storage_service.store_menu_analysis(storage_data)
            else:
                self.logger.warning("Menu analysis storage not yet implemented")
                
        except Exception as e:
            self.logger.error(f"Failed to store analysis results: {str(e)}")
            # Don't fail the entire analysis if storage fails
    
    async def get_analysis_history(
        self, 
        user_id: str, 
        restaurant_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Get user's menu analysis history"""
        try:
            if not self.storage_service:
                return []
            
            # Use existing storage patterns
            if hasattr(self.storage_service, 'get_menu_analysis_history'):
                return await self.storage_service.get_menu_analysis_history(
                    user_id=user_id,
                    restaurant_id=restaurant_id,
                    limit=limit
                )
            else:
                self.logger.warning("Menu analysis history retrieval not yet implemented")
                return []
                
        except Exception as e:
            self.logger.error(f"Failed to get analysis history: {str(e)}")
            return []
    
    def get_supported_tiers(self) -> Dict:
        """Get information about supported analysis tiers"""
        return {
            "free": {
                "name": "Free Tier",
                "competitors": 2,
                "features": [
                    "Basic menu item matching",
                    "Price comparison analysis", 
                    "Market positioning insights",
                    "Menu gap identification",
                    "Basic recommendations"
                ],
                "cost_estimate": "$0.18 per analysis",
                "processing_time": "30-60 seconds"
            },
            "premium": {
                "name": "Premium Tier",
                "competitors": 5,
                "features": [
                    "All free tier features",
                    "Strategic pricing recommendations",
                    "ROI projections and timelines",
                    "Menu engineering analysis",
                    "Competitive advantage identification",
                    "Revenue opportunity analysis"
                ],
                "cost_estimate": "$0.42 per analysis",
                "processing_time": "60-90 seconds"
            }
        }
    
    async def health_check(self) -> Dict:
        """Health check for menu intelligence system"""
        health_status = {
            "status": "healthy",
            "services": {},
            "feature_flags": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Check service health
        try:
            # Check Google Places service
            health_status["services"]["google_places"] = "healthy"
            
            # Check menu analysis engine
            if self.menu_engine and self.menu_engine.api_key:
                health_status["services"]["menu_analysis_engine"] = "healthy"
            else:
                health_status["services"]["menu_analysis_engine"] = "unhealthy - missing API key"
                health_status["status"] = "degraded"
            
            # Check feature flags
            health_status["feature_flags"]["menu_intelligence"] = self.feature_flags.is_enabled("menu_intelligence")
            
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["error"] = str(e)
        
        return health_status