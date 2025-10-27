"""
Menu Analysis Engine - Week 2 Day 2
Processes extracted menus and generates competitive insights using LLM analysis
"""

import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import asyncio
import os
import google.generativeai as genai
from dataclasses import dataclass

# Import our existing services
from services.menu_extraction_service import MenuExtractionService
from services.menu_scraping_utils import MenuScrapingUtils

@dataclass
class MenuAnalysisResult:
    """Structured result from menu analysis"""
    user_menu_items: List[Dict]
    competitor_menus: List[Dict]
    item_matches: List[Dict]
    pricing_insights: Dict
    menu_gaps: List[Dict]
    recommendations: List[Dict]
    analysis_metadata: Dict

class MenuAnalysisEngine:
    """
    Core engine for menu competitive analysis
    Follows patterns from existing LLM services
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with Gemini API key (reuse existing)"""
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Google Gemini API key required")
            
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Initialize extraction services
        self.extraction_service = MenuExtractionService()
        self.utils = MenuScrapingUtils()
        
        # Analysis configuration
        self.max_items_per_analysis = 50  # Prevent token overflow
        self.confidence_threshold = 0.7
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def analyze_menu_competition(
        self, 
        user_menu: Dict, 
        competitors: List[Dict],
        tier: str = "free"
    ) -> MenuAnalysisResult:
        """
        Complete menu competitive analysis pipeline
        
        Args:
            user_menu: User's menu data with items and prices
            competitors: List of competitor data from Places API
            tier: "free" or "premium" for different analysis depth
            
        Returns:
            MenuAnalysisResult with comprehensive analysis
        """
        start_time = datetime.now()
        
        try:
            # Step 1: Extract competitor menus
            self.logger.info(f"Extracting menus for {len(competitors)} competitors")
            competitor_menus = await self._extract_competitor_menus(competitors)
            
            # Step 2: Normalize and validate all menus
            normalized_user_menu = self._normalize_menu_data(user_menu)
            normalized_competitor_menus = [
                self._normalize_menu_data(menu) for menu in competitor_menus
            ]
            
            # Step 3: Intelligent item matching
            self.logger.info("Performing intelligent item matching")
            item_matches = await self._match_menu_items(
                normalized_user_menu, 
                normalized_competitor_menus
            )
            
            # Step 4: Pricing analysis
            self.logger.info("Analyzing pricing patterns")
            pricing_insights = await self._analyze_pricing_patterns(
                normalized_user_menu, 
                item_matches, 
                tier
            )
            
            # Step 5: Menu gap analysis
            self.logger.info("Identifying menu gaps")
            menu_gaps = await self._identify_menu_gaps(
                normalized_user_menu, 
                normalized_competitor_menus
            )
            
            # Step 6: Generate recommendations
            self.logger.info("Generating strategic recommendations")
            recommendations = await self._generate_recommendations(
                pricing_insights, 
                menu_gaps, 
                tier
            )
            
            # Calculate processing metadata
            processing_time = (datetime.now() - start_time).total_seconds()
            
            analysis_metadata = {
                "processing_time_seconds": processing_time,
                "competitors_analyzed": len(competitor_menus),
                "items_matched": len(item_matches),
                "tier": tier,
                "analysis_date": datetime.now().isoformat(),
                "success_rate": len(competitor_menus) / len(competitors) if competitors else 0
            }
            
            return MenuAnalysisResult(
                user_menu_items=normalized_user_menu.get("items", []),
                competitor_menus=normalized_competitor_menus,
                item_matches=item_matches,
                pricing_insights=pricing_insights,
                menu_gaps=menu_gaps,
                recommendations=recommendations,
                analysis_metadata=analysis_metadata
            )
            
        except Exception as e:
            self.logger.error(f"Menu analysis failed: {str(e)}")
            raise
    
    async def _extract_competitor_menus(self, competitors: List[Dict]) -> List[Dict]:
        """Extract menus from competitor data"""
        extracted_menus = []
        
        for competitor in competitors:
            try:
                # Use our existing extraction service
                menu_data = await self.extraction_service.extract_menu(competitor)
                if menu_data and self.utils.validate_menu_quality(menu_data):
                    extracted_menus.append({
                        "competitor_name": competitor.get("name", "Unknown"),
                        "competitor_id": competitor.get("place_id", ""),
                        "menu_data": menu_data,
                        "extraction_method": menu_data.get("extraction_method", "unknown")
                    })
            except Exception as e:
                self.logger.warning(f"Failed to extract menu for {competitor.get('name')}: {str(e)}")
                continue
        
        return extracted_menus
    
    def _normalize_menu_data(self, menu_data: Dict) -> Dict:
        """Normalize menu data to consistent structure"""
        if not menu_data:
            return {"items": [], "categories": []}
        
        # Handle different menu formats
        items = []
        categories = set()
        
        # Extract items from various formats
        if "items" in menu_data:
            items = menu_data["items"]
        elif "menu_data" in menu_data and "items" in menu_data["menu_data"]:
            items = menu_data["menu_data"]["items"]
        elif "categories" in menu_data:
            # Flatten category-based structure
            for category in menu_data["categories"]:
                if "items" in category:
                    for item in category["items"]:
                        item["category"] = category.get("name", "Other")
                        items.append(item)
        
        # Normalize each item
        normalized_items = []
        for item in items:
            if not isinstance(item, dict):
                continue
                
            normalized_item = {
                "name": str(item.get("name", "")).strip(),
                "price": self.utils.clean_price_string(item.get("price", "")),
                "description": str(item.get("description", "")).strip(),
                "category": str(item.get("category", "Other")).strip(),
                "size": str(item.get("size", "")).strip()
            }
            
            # Only include items with valid names and prices
            if normalized_item["name"] and normalized_item["price"] is not None:
                normalized_items.append(normalized_item)
                categories.add(normalized_item["category"])
        
        return {
            "items": normalized_items,
            "categories": list(categories),
            "total_items": len(normalized_items)
        }
    
    async def _match_menu_items(
        self, 
        user_menu: Dict, 
        competitor_menus: List[Dict]
    ) -> List[Dict]:
        """Use LLM to intelligently match menu items across restaurants"""
        
        user_items = user_menu.get("items", [])
        if not user_items:
            return []
        
        # Prepare competitor items for matching
        all_competitor_items = []
        for comp_menu in competitor_menus:
            comp_name = comp_menu.get("competitor_name", "Unknown")
            for item in comp_menu.get("menu_data", {}).get("items", []):
                all_competitor_items.append({
                    **item,
                    "competitor_name": comp_name
                })
        
        if not all_competitor_items:
            return []
        
        # Limit items to prevent token overflow
        user_items_sample = user_items[:self.max_items_per_analysis]
        competitor_items_sample = all_competitor_items[:self.max_items_per_analysis * 2]
        
        # Build LLM prompt for item matching
        prompt = self._build_item_matching_prompt(user_items_sample, competitor_items_sample)
        
        try:
            response = await self.model.generate_content_async(prompt)
            matches_data = json.loads(response.text)
            
            # Validate and structure matches
            validated_matches = []
            for match in matches_data.get("matches", []):
                if match.get("confidence", 0) >= self.confidence_threshold:
                    validated_matches.append({
                        "user_item": match.get("user_item", {}),
                        "competitor_matches": match.get("competitor_matches", []),
                        "confidence": match.get("confidence", 0),
                        "match_reasoning": match.get("reasoning", "")
                    })
            
            return validated_matches
            
        except Exception as e:
            self.logger.error(f"Item matching failed: {str(e)}")
            return []
    
    def _build_item_matching_prompt(self, user_items: List[Dict], competitor_items: List[Dict]) -> str:
        """Build prompt for LLM item matching"""
        
        return f"""
You are a restaurant menu analysis expert. Match similar menu items between the user's menu and competitor menus.

USER'S MENU ITEMS:
{json.dumps(user_items, indent=2)}

COMPETITOR MENU ITEMS:
{json.dumps(competitor_items, indent=2)}

MATCHING RULES:
1. Match items that are fundamentally the same dish (e.g., "Margherita Pizza" matches "Classic Cheese Pizza")
2. Consider size variations (12" vs Large vs Medium)
3. Ignore minor description differences
4. Account for different naming conventions
5. Only match if confidence is >70%

Return JSON in this exact format:
{{
  "matches": [
    {{
      "user_item": {{"name": "Margherita Pizza", "price": 12.99, "category": "Pizza"}},
      "competitor_matches": [
        {{
          "name": "Classic Cheese Pizza",
          "price": 11.50,
          "competitor_name": "Tony's Pizza",
          "size_comparison": "similar",
          "price_difference": 1.49
        }}
      ],
      "confidence": 0.85,
      "reasoning": "Both are basic cheese pizzas with tomato sauce"
    }}
  ]
}}

Focus on finding the most obvious matches first. Be conservative with confidence scores.
"""
    
    async def _analyze_pricing_patterns(
        self, 
        user_menu: Dict, 
        item_matches: List[Dict], 
        tier: str
    ) -> Dict:
        """Analyze pricing patterns and generate insights"""
        
        if not item_matches:
            return {
                "market_position": "insufficient_data",
                "pricing_summary": {},
                "recommendations": []
            }
        
        # Calculate pricing statistics
        pricing_stats = {
            "total_matches": len(item_matches),
            "overpriced_items": 0,
            "underpriced_items": 0,
            "competitively_priced": 0,
            "average_price_difference": 0,
            "price_differences": []
        }
        
        detailed_analysis = []
        
        for match in item_matches:
            user_item = match["user_item"]
            competitor_matches = match["competitor_matches"]
            
            if not competitor_matches:
                continue
            
            # Calculate market average for this item
            competitor_prices = [cm["price"] for cm in competitor_matches if cm.get("price")]
            if not competitor_prices:
                continue
            
            market_avg = sum(competitor_prices) / len(competitor_prices)
            user_price = user_item.get("price", 0)
            
            if user_price == 0:
                continue
            
            price_diff = user_price - market_avg
            price_diff_percent = (price_diff / market_avg) * 100
            
            # Categorize pricing
            if price_diff_percent > 10:
                pricing_stats["overpriced_items"] += 1
                position = "overpriced"
            elif price_diff_percent < -10:
                pricing_stats["underpriced_items"] += 1
                position = "underpriced"
            else:
                pricing_stats["competitively_priced"] += 1
                position = "competitive"
            
            pricing_stats["price_differences"].append(price_diff_percent)
            
            detailed_analysis.append({
                "item_name": user_item["name"],
                "user_price": user_price,
                "market_average": round(market_avg, 2),
                "price_difference": round(price_diff, 2),
                "price_difference_percent": round(price_diff_percent, 1),
                "position": position,
                "competitor_count": len(competitor_prices),
                "competitor_range": {
                    "min": min(competitor_prices),
                    "max": max(competitor_prices)
                }
            })
        
        # Calculate overall statistics
        if pricing_stats["price_differences"]:
            pricing_stats["average_price_difference"] = round(
                sum(pricing_stats["price_differences"]) / len(pricing_stats["price_differences"]), 1
            )
        
        # Generate tier-appropriate insights
        if tier == "premium":
            insights = await self._generate_premium_pricing_insights(detailed_analysis)
        else:
            insights = self._generate_basic_pricing_insights(detailed_analysis)
        
        return {
            "pricing_statistics": pricing_stats,
            "detailed_analysis": detailed_analysis,
            "market_position": self._determine_market_position(pricing_stats),
            "insights": insights
        }
    
    def _generate_basic_pricing_insights(self, detailed_analysis: List[Dict]) -> List[Dict]:
        """Generate basic pricing insights for free tier"""
        insights = []
        
        for item in detailed_analysis:
            if item["position"] == "overpriced" and item["price_difference_percent"] > 15:
                insights.append({
                    "type": "price_reduction_opportunity",
                    "item": item["item_name"],
                    "current_price": item["user_price"],
                    "suggested_price": item["market_average"],
                    "reasoning": f"Your price is {item['price_difference_percent']}% above market average"
                })
            elif item["position"] == "underpriced" and item["price_difference_percent"] < -15:
                insights.append({
                    "type": "price_increase_opportunity",
                    "item": item["item_name"],
                    "current_price": item["user_price"],
                    "suggested_price": item["market_average"],
                    "reasoning": f"You could increase price by {abs(item['price_difference_percent'])}% to match market"
                })
        
        return insights[:5]  # Limit to top 5 for free tier
    
    async def _generate_premium_pricing_insights(self, detailed_analysis: List[Dict]) -> List[Dict]:
        """Generate strategic pricing insights for premium tier using LLM"""
        
        prompt = f"""
You are a restaurant pricing strategist. Analyze this pricing data and provide strategic recommendations.

PRICING ANALYSIS DATA:
{json.dumps(detailed_analysis, indent=2)}

Generate strategic pricing recommendations that include:
1. ROI projections for price changes
2. Implementation timelines
3. Risk assessments
4. Market positioning strategies

Return JSON format:
{{
  "strategic_recommendations": [
    {{
      "type": "premium_positioning",
      "item": "Margherita Pizza",
      "current_price": 12.99,
      "recommended_action": "Increase to $15.99",
      "strategy": "Position as artisan premium option",
      "expected_roi": "+$400/month",
      "implementation_timeline": "2 weeks",
      "risk_level": "low"
    }}
  ]
}}
"""
        
        try:
            response = await self.model.generate_content_async(prompt)
            strategic_data = json.loads(response.text)
            return strategic_data.get("strategic_recommendations", [])
        except Exception as e:
            self.logger.error(f"Premium insights generation failed: {str(e)}")
            return self._generate_basic_pricing_insights(detailed_analysis)
    
    def _determine_market_position(self, pricing_stats: Dict) -> str:
        """Determine overall market positioning"""
        total_items = pricing_stats["total_matches"]
        if total_items == 0:
            return "insufficient_data"
        
        overpriced_ratio = pricing_stats["overpriced_items"] / total_items
        underpriced_ratio = pricing_stats["underpriced_items"] / total_items
        
        if overpriced_ratio > 0.6:
            return "premium_positioned"
        elif underpriced_ratio > 0.6:
            return "value_positioned"
        elif pricing_stats["competitively_priced"] / total_items > 0.6:
            return "market_competitive"
        else:
            return "mixed_positioning"
    
    async def _identify_menu_gaps(
        self, 
        user_menu: Dict, 
        competitor_menus: List[Dict]
    ) -> List[Dict]:
        """Identify menu items/categories that competitors have but user doesn't"""
        
        user_categories = set(user_menu.get("categories", []))
        user_items = {item["name"].lower() for item in user_menu.get("items", [])}
        
        # Collect competitor offerings
        competitor_categories = set()
        competitor_items = set()
        category_frequency = {}
        item_frequency = {}
        
        for comp_menu in competitor_menus:
            comp_name = comp_menu.get("competitor_name", "Unknown")
            menu_data = comp_menu.get("menu_data", {})
            
            for item in menu_data.get("items", []):
                category = item.get("category", "Other")
                item_name = item.get("name", "").lower()
                
                competitor_categories.add(category)
                competitor_items.add(item_name)
                
                # Track frequency
                category_frequency[category] = category_frequency.get(category, 0) + 1
                item_frequency[item_name] = item_frequency.get(item_name, 0) + 1
        
        # Identify gaps
        gaps = []
        
        # Category gaps
        missing_categories = competitor_categories - user_categories
        for category in missing_categories:
            frequency = category_frequency.get(category, 0)
            if frequency >= 2:  # At least 2 competitors have this category
                gaps.append({
                    "type": "category_gap",
                    "category": category,
                    "competitor_frequency": frequency,
                    "opportunity_score": min(frequency * 20, 100)  # Max 100
                })
        
        # Popular item gaps (items that appear in multiple competitor menus)
        popular_missing_items = []
        for item_name, frequency in item_frequency.items():
            if frequency >= 2 and item_name not in user_items:
                popular_missing_items.append({
                    "type": "item_gap",
                    "item_name": item_name,
                    "competitor_frequency": frequency,
                    "opportunity_score": min(frequency * 25, 100)
                })
        
        # Sort by opportunity score and limit results
        popular_missing_items.sort(key=lambda x: x["opportunity_score"], reverse=True)
        gaps.extend(popular_missing_items[:10])  # Top 10 item gaps
        
        return gaps
    
    async def _generate_recommendations(
        self, 
        pricing_insights: Dict, 
        menu_gaps: List[Dict], 
        tier: str
    ) -> List[Dict]:
        """Generate actionable recommendations based on analysis"""
        
        recommendations = []
        
        # Pricing recommendations
        for insight in pricing_insights.get("insights", []):
            recommendations.append({
                "category": "pricing",
                "priority": "high" if abs(insight.get("price_difference_percent", 0)) > 20 else "medium",
                "title": f"Adjust pricing for {insight.get('item', 'item')}",
                "description": insight.get("reasoning", ""),
                "action": insight.get("type", ""),
                "impact": "revenue_optimization"
            })
        
        # Menu gap recommendations
        high_opportunity_gaps = [gap for gap in menu_gaps if gap.get("opportunity_score", 0) > 50]
        for gap in high_opportunity_gaps[:5]:  # Top 5 gaps
            if gap["type"] == "category_gap":
                recommendations.append({
                    "category": "menu_expansion",
                    "priority": "medium",
                    "title": f"Consider adding {gap['category']} category",
                    "description": f"{gap['competitor_frequency']} competitors offer this category",
                    "action": "category_addition",
                    "impact": "market_coverage"
                })
            else:
                recommendations.append({
                    "category": "menu_expansion",
                    "priority": "low",
                    "title": f"Consider adding {gap['item_name']}",
                    "description": f"Popular item at {gap['competitor_frequency']} competitors",
                    "action": "item_addition",
                    "impact": "competitive_parity"
                })
        
        # Market positioning recommendation
        market_position = pricing_insights.get("market_position", "")
        if market_position == "premium_positioned":
            recommendations.append({
                "category": "strategy",
                "priority": "low",
                "title": "Premium positioning detected",
                "description": "Your prices are generally above market - ensure quality justifies premium",
                "action": "quality_validation",
                "impact": "brand_positioning"
            })
        elif market_position == "value_positioned":
            recommendations.append({
                "category": "strategy",
                "priority": "medium",
                "title": "Value positioning detected",
                "description": "Your prices are below market - consider selective price increases",
                "action": "price_optimization",
                "impact": "profit_margin"
            })
        
        # Sort by priority
        priority_order = {"high": 3, "medium": 2, "low": 1}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 0), reverse=True)
        
        # Limit recommendations based on tier
        max_recommendations = 10 if tier == "premium" else 5
        return recommendations[:max_recommendations]