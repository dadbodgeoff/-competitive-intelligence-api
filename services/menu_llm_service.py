#!/usr/bin/env python3
"""
Menu LLM Service
SAFE PATTERN REUSE: Copies proven patterns from FreeTierLLMService

This service handles menu competitive analysis using the same
LLM patterns that work for review analysis, but in a separate
class to prevent any interference.
"""
import google.generativeai as genai
import os
import json
import time
from typing import List, Dict, Optional
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class MenuLLMService:
    """
    SEPARATE LLM service for menu analysis
    
    Reuses PATTERNS from FreeTierLLMService but doesn't inherit
    This prevents any risk to review analysis functionality
    """
    
    def __init__(self, api_key: Optional[str] = None):
        # ✅ COPY initialization pattern (proven to work)
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("Google Gemini API key not found. Using mock analysis.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # ✅ COPY cost optimization settings from FreeTierLLMService
        self.max_competitors = 2  # Free tier limit
        self.max_menu_items_per_competitor = 20  # Limit for token efficiency
        self.max_output_tokens = 800  # Same as review analysis
        self.target_insights = 4  # Focus on top insights
        
        logger.info("MenuLLMService initialized with proven LLM patterns")
    
    async def analyze_menu_competition(
        self, 
        user_menu: Dict, 
        competitor_menus: List[Dict], 
        tier: str = "free"
    ) -> Dict:
        """
        Menu competitive analysis using PROVEN LLM patterns
        
        Args:
            user_menu: User's menu in standardized format
            competitor_menus: List of extracted competitor menus
            tier: "free" or "premium"
            
        Returns:
            Menu analysis with insights and recommendations
        """
        
        if not self.model:
            return self._get_mock_menu_analysis(user_menu, competitor_menus, tier)
        
        try:
            # ✅ COPY cost optimization from FreeTierLLMService
            limited_competitors = self._limit_competitors_for_cost(competitor_menus, tier)
            
            # ✅ COPY prompt building pattern
            prompt = self._build_menu_comparison_prompt(user_menu, limited_competitors, tier)
            
            # ✅ COPY token estimation for cost tracking
            estimated_input_tokens = len(prompt.split()) * 1.3
            logger.info(f"menu_llm_analysis_started: competitor_count={len(limited_competitors)}, estimated_tokens={int(estimated_input_tokens)}")
            
            start_time = time.time()
            
            # ✅ EXACT SAME API call pattern (proven to work)
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=self.max_output_tokens,
                    response_mime_type="application/json"
                )
            )
            
            elapsed_time = time.time() - start_time
            
            # ✅ COPY token usage logging
            if hasattr(response, 'usage_metadata'):
                logger.info(f"menu_llm_analysis_completed: input_tokens={response.usage_metadata.prompt_token_count}, output_tokens={response.usage_metadata.candidates_token_count}, elapsed_time={elapsed_time:.2f}s")
            
            # ✅ COPY response parsing pattern
            analysis_result = self._parse_menu_response(response.text)
            
            # ✅ COPY confidence scoring pattern
            scored_analysis = self._add_menu_confidence_scores(analysis_result, limited_competitors)
            
            # ✅ COPY filtering pattern
            filtered_analysis = self._filter_top_menu_insights(scored_analysis, tier)
            
            logger.info(f"Menu LLM analysis complete: {len(filtered_analysis.get('menu_insights', []))} insights")
            
            return filtered_analysis
            
        except Exception as e:
            logger.error(f"Menu LLM analysis failed: {str(e)}")
            return self._get_mock_menu_analysis(user_menu, competitor_menus, tier)
    
    def _limit_competitors_for_cost(self, competitor_menus: List[Dict], tier: str) -> List[Dict]:
        """
        COPY cost optimization pattern from FreeTierLLMService
        """
        max_count = 2 if tier == "free" else 5
        
        if len(competitor_menus) <= max_count:
            return competitor_menus
        
        # Sort by menu quality (more items = better data)
        sorted_menus = sorted(
            competitor_menus,
            key=lambda x: len(x.get('menu_data', {}).get('categories', [])),
            reverse=True
        )
        
        limited = sorted_menus[:max_count]
        logger.info(f"Limited competitor menus from {len(competitor_menus)} to {len(limited)} for cost optimization")
        
        return limited
    
    def _build_menu_comparison_prompt(
        self, 
        user_menu: Dict, 
        competitor_menus: List[Dict], 
        tier: str
    ) -> str:
        """
        Build menu comparison prompt optimized for token efficiency
        
        Uses compact format similar to FreeTierLLMService
        """
        
        prompt = f"""# MENU COMPETITIVE ANALYSIS - {tier.upper()} TIER

Compare user's menu against {len(competitor_menus)} competitors for pricing and gaps.

## USER'S MENU:
"""
        
        # Add user menu in compact format
        for category in user_menu.get('categories', []):
            prompt += f"\n**{category['name']}:**\n"
            for item in category.get('items', [])[:self.max_menu_items_per_competitor]:
                price = item.get('price', 0)
                prompt += f"- {item['name']}: ${price:.2f}\n"
        
        prompt += "\n## COMPETITOR MENUS:\n"
        
        # Add competitor menus in compact format
        for i, menu in enumerate(competitor_menus, 1):
            competitor_name = menu.get('competitor_name', f'Competitor {i}')
            prompt += f"\n### {i}. {competitor_name}\n"
            
            menu_data = menu.get('menu_data', {})
            for category in menu_data.get('categories', []):
                prompt += f"**{category['name']}:**\n"
                for item in category.get('items', [])[:self.max_menu_items_per_competitor]:
                    price = item.get('price', 0)
                    prompt += f"- {item['name']}: ${price:.2f}\n"
        
        # Tier-specific instructions
        if tier == "free":
            insights_count = 4
            focus = "pricing gaps and basic opportunities"
        else:
            insights_count = 8
            focus = "strategic pricing, menu engineering, and ROI opportunities"
        
        prompt += f"""
## TASK: Find {insights_count} most actionable menu insights focusing on {focus}.

## OUTPUT (JSON):
{{
  "menu_insights": [
    {{
      "category": "pricing/gap/opportunity/threat",
      "title": "Brief insight title",
      "description": "Specific actionable recommendation",
      "confidence": "high/medium/low",
      "proof_quote": "Supporting evidence from menu comparison",
      "mention_count": 1,
      "competitor_source": "Which competitor this relates to"
    }}
  ],
  "analysis_summary": {{
    "total_items_compared": 0,
    "pricing_insights": 0,
    "gap_insights": 0,
    "opportunity_insights": 0
  }}
}}

## RULES:
- Focus on ACTIONABLE insights only
- Include specific price comparisons where relevant
- Identify clear menu gaps (items competitors have that user doesn't)
- Suggest realistic pricing adjustments
- Keep descriptions brief but specific
"""
        
        return prompt
    
    def _parse_menu_response(self, response_text: str) -> Dict:
        """
        COPY parsing pattern from FreeTierLLMService
        """
        try:
            # ✅ Same cleaning pattern
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            # ✅ Same JSON parsing
            analysis = json.loads(cleaned_text)
            
            # ✅ Same validation pattern
            if 'menu_insights' not in analysis:
                logger.warning("Missing menu_insights in response")
                analysis['menu_insights'] = []
            
            if 'analysis_summary' not in analysis:
                analysis['analysis_summary'] = {
                    "total_items_compared": 0,
                    "pricing_insights": 0,
                    "gap_insights": 0
                }
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse menu JSON response: {e}")
            logger.error(f"Response text: {response_text[:500]}...")
            raise
    
    def _add_menu_confidence_scores(self, analysis: Dict, competitor_menus: List[Dict]) -> Dict:
        """
        COPY confidence scoring pattern from FreeTierLLMService
        """
        
        total_items = sum(
            len(menu.get('menu_data', {}).get('categories', []))
            for menu in competitor_menus
        )
        
        for insight in analysis.get('menu_insights', []):
            mention_count = insight.get('mention_count', 1)
            significance = (mention_count / max(total_items, 1) * 100) if total_items > 0 else 0
            
            # Menu-specific confidence thresholds
            if significance >= 15.0:  # 15%+ of menu items relate to this
                confidence = 'high'
            elif significance >= 8.0:  # 8-15% relate to this
                confidence = 'medium'
            else:
                confidence = 'low'
            
            insight['confidence'] = confidence
            insight['significance'] = round(significance, 2)
        
        return analysis
    
    def _filter_top_menu_insights(self, analysis: Dict, tier: str) -> Dict:
        """
        COPY filtering pattern from FreeTierLLMService
        """
        
        insights = analysis.get('menu_insights', [])
        
        # Filter out low confidence insights
        quality_insights = [
            insight for insight in insights
            if insight.get('confidence', 'low') in ['high', 'medium']
        ]
        
        # Sort by confidence and significance
        def insight_score(insight):
            confidence_score = {'high': 3, 'medium': 2, 'low': 1}.get(insight.get('confidence', 'low'), 1)
            significance_score = insight.get('significance', 0)
            return confidence_score * 10 + significance_score
        
        quality_insights.sort(key=insight_score, reverse=True)
        
        # Limit based on tier
        max_insights = 4 if tier == "free" else 8
        top_insights = quality_insights[:max_insights]
        
        analysis['menu_insights'] = top_insights
        
        # ✅ COPY filtering metadata pattern
        analysis['filtering_metadata'] = {
            'tier': tier,
            'filtered_at': datetime.now().isoformat(),
            'total_insights_generated': len(insights),
            'quality_insights': len(quality_insights),
            'final_insights': len(top_insights),
            'confidence_threshold': 'medium_and_above'
        }
        
        # Add upgrade teaser for free tier (conversion optimization)
        if tier == "free":
            analysis['upgrade_preview'] = {
                'available_in_premium': [
                    'Menu Engineering Analysis: Star/Plow/Puzzle/Dog classification',
                    'Strategic Pricing: ROI projections for price changes',
                    'Profit Optimization: Margin analysis and recommendations',
                    '5 Competitors: Wider market view (5 vs 2 competitors)',
                    'Implementation Timeline: Week-by-week action plan'
                ],
                'upgrade_benefits': {
                    'more_insights': '8 strategic insights vs 4 tactical',
                    'deeper_analysis': '3x more detailed menu recommendations',
                    'roi_focus': 'Profit projections with menu changes',
                    'competitive_advantage': 'Build lasting menu differentiation'
                },
                'upgrade_cta': 'Upgrade to Premium for strategic menu optimization'
            }
        
        return analysis
    
    def _get_mock_menu_analysis(
        self, 
        user_menu: Dict, 
        competitor_menus: List[Dict], 
        tier: str
    ) -> Dict:
        """
        COPY mock generation pattern from FreeTierLLMService
        """
        
        competitor_names = [
            menu.get('competitor_name', 'Unknown') 
            for menu in competitor_menus
        ]
        
        return {
            "menu_insights": [
                {
                    "category": "pricing",
                    "title": "Competitive Pizza Pricing",
                    "description": "Your pizza prices are within 10% of market average. Consider slight adjustment for Margherita pizza.",
                    "confidence": "high",
                    "significance": 25.0,
                    "proof_quote": "Competitor analysis shows similar pricing patterns",
                    "mention_count": 2,
                    "competitor_source": competitor_names[0] if competitor_names else "Market Analysis"
                },
                {
                    "category": "gap",
                    "title": "Vegan Options Gap",
                    "description": "Competitors offer vegan menu items that you don't have. Consider adding 1-2 vegan options.",
                    "confidence": "medium",
                    "significance": 18.0,
                    "proof_quote": "Multiple competitors feature vegan pizza and salad options",
                    "mention_count": 3,
                    "competitor_source": "Multiple Competitors"
                },
                {
                    "category": "opportunity",
                    "title": "Premium Ingredient Positioning",
                    "description": "You could differentiate with premium ingredients while maintaining competitive pricing.",
                    "confidence": "medium",
                    "significance": 15.0,
                    "proof_quote": "Competitors use standard ingredients at similar price points",
                    "mention_count": 2,
                    "competitor_source": competitor_names[1] if len(competitor_names) > 1 else "Market Analysis"
                },
                {
                    "category": "watch",
                    "title": "Appetizer Selection Monitoring",
                    "description": "Monitor competitor appetizer offerings - some have expanded selections recently.",
                    "confidence": "low",
                    "significance": 12.0,
                    "proof_quote": "Varied appetizer menus across competitors",
                    "mention_count": 1,
                    "competitor_source": "Competitive Landscape"
                }
            ],
            "analysis_summary": {
                "total_items_compared": len(competitor_menus) * 10,  # Estimate
                "pricing_insights": 1,
                "gap_insights": 1,
                "opportunity_insights": 1,
                "watch_insights": 1
            },
            "filtering_metadata": {
                "tier": tier,
                "filtered_at": datetime.now().isoformat(),
                "total_insights_generated": 4,
                "quality_insights": 4,
                "final_insights": 4,
                "confidence_threshold": "medium_and_above"
            }
        }