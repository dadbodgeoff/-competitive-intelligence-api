#!/usr/bin/env python3
"""
Free Tier LLM Analysis Service - Cost Optimized
Target: $0.11 per analysis (3 competitors, compact prompt, focused insights)
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

class FreeTierLLMService:
    """
    FREE TIER: Cost-optimized competitive analysis
    - 3 competitors maximum
    - Compact prompt (600 tokens vs 1600)
    - Focused insights (3-5 vs 8-12)
    - Target cost: $0.11 per analysis
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("Google Gemini API key not found. Using mock analysis.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Use latest model
        
        # Cost optimization settings
        self.max_competitors = 3  # Reduce from 5 to 3
        self.max_reviews_per_competitor = 15  # Reduce from 20+ to 15
        self.max_output_tokens = 800  # Reduce from 4000 to 800
        self.target_insights = 4  # Focus on top 4 insights
    
    async def analyze_competitors_free_tier(
        self,
        restaurant_name: str,
        restaurant_location: str,
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]]
    ) -> Dict:
        """
        Free tier competitive analysis - optimized for cost and speed
        
        Returns actionable_insights structure (compatible with existing storage)
        """
        
        if not self.model:
            return self._get_mock_free_analysis(restaurant_name, competitors_data)
        
        try:
            # COST OPTIMIZATION: Limit to 3 competitors
            limited_competitors = self._limit_competitors(competitors_data, self.max_competitors)
            
            # Build compact prompt
            prompt = self._build_compact_prompt(
                restaurant_name, restaurant_location, restaurant_category, limited_competitors
            )
            
            # Log token estimates for cost tracking
            estimated_input_tokens = len(prompt.split()) * 1.3  # Rough estimate
            logger.info("free_tier_analysis_started", 
                       restaurant=restaurant_name,
                       competitor_count=len(limited_competitors),
                       estimated_input_tokens=int(estimated_input_tokens))
            
            start_time = time.time()
            
            # Call Gemini with cost controls
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=self.max_output_tokens,  # Strict limit
                    response_mime_type="application/json"
                )
            )
            
            elapsed_time = time.time() - start_time
            
            # Log actual token usage for cost tracking
            if hasattr(response, 'usage_metadata'):
                logger.info("free_tier_analysis_completed",
                           input_tokens=response.usage_metadata.prompt_token_count,
                           output_tokens=response.usage_metadata.candidates_token_count,
                           total_tokens=response.usage_metadata.total_token_count,
                           elapsed_time=elapsed_time,
                           estimated_cost=self._calculate_cost(response.usage_metadata))
            
            # Parse response
            analysis_result = self._parse_free_tier_response(response.text)
            
            # Add confidence scoring (works with actionable_insights structure)
            scored_analysis = self._add_confidence_scores(analysis_result, limited_competitors)
            
            # Filter to top insights only
            filtered_analysis = self._filter_top_insights(scored_analysis)
            
            logger.info(f"Free tier analysis complete: {len(filtered_analysis.get('actionable_insights', []))} insights")
            
            return filtered_analysis
            
        except Exception as e:
            logger.error(f"Free tier LLM analysis failed: {str(e)}")
            return self._get_mock_free_analysis(restaurant_name, competitors_data)
    
    def _limit_competitors(self, competitors_data: Dict, max_count: int) -> Dict:
        """Limit competitors to reduce API costs"""
        if len(competitors_data) <= max_count:
            return competitors_data
        
        # Sort by review count (more reviews = better data quality)
        sorted_competitors = sorted(
            competitors_data.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )
        
        # Take top N competitors
        limited = dict(sorted_competitors[:max_count])
        
        logger.info(f"Limited competitors from {len(competitors_data)} to {len(limited)} for cost optimization")
        return limited
    
    def _build_compact_prompt(
        self,
        restaurant_name: str,
        restaurant_location: str,
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]]
    ) -> str:
        """
        Build compact prompt optimized for token efficiency
        Target: 600 tokens (vs 1600 for enhanced)
        """
        
        total_reviews = sum(len(reviews) for reviews in competitors_data.values())
        
        prompt = f"""# COMPETITIVE ANALYSIS - FREE TIER

Analyze {len(competitors_data)} competitors for {restaurant_name} ({restaurant_category} in {restaurant_location}).

## COMPETITORS:
"""
        
        # Add competitor data in compact format
        for i, (competitor_id, reviews) in enumerate(competitors_data.items(), 1):
            if not reviews:
                continue
            
            competitor_name = reviews[0].get('competitor_name', f'Competitor {i}')
            avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews) if reviews else 0
            
            prompt += f"\n### {i}. {competitor_name} ({avg_rating:.1f}⭐, {len(reviews)} reviews)\n"
            
            # Select only TOP reviews for analysis (most informative)
            top_reviews = self._select_top_reviews(reviews, limit=self.max_reviews_per_competitor)
            
            for review in top_reviews:
                rating = review.get('rating', 0)
                text = review.get('text', '')[:150]  # Truncate long reviews
                prompt += f"- [{rating}⭐] {text}...\n"
        
        # Compact output format
        prompt += f"""
## TASK: Find {self.target_insights} TOP actionable insights for {restaurant_name}.

## OUTPUT (JSON):
{{
  "analysis_summary": {{
    "total_reviews_analyzed": {total_reviews},
    "competitors_count": {len(competitors_data)},
    "analysis_date": "{datetime.now().isoformat()}"
  }},
  "actionable_insights": [
    {{
      "category": "opportunity/threat/watch",
      "title": "Brief insight title",
      "description": "What {restaurant_name} should do",
      "confidence": "high/medium/low",
      "proof_quote": "Exact review quote",
      "mention_count": 5,
      "competitor_source": "Which competitor"
    }}
  ]
}}

## RULES:
- Find ONLY the {self.target_insights} most actionable insights
- Include proof quotes from reviews
- Count actual mentions accurately
- Focus on what {restaurant_name} can act on immediately
- Keep descriptions brief but specific
"""
        
        return prompt
    
    def _select_top_reviews(self, reviews: List[Dict], limit: int = 15) -> List[Dict]:
        """
        Select most informative reviews to reduce token usage
        
        Priority:
        1. Extreme ratings (1⭐ or 5⭐) - more informative
        2. Longer text (more detail)
        3. Recent dates
        """
        
        scored_reviews = []
        for review in reviews:
            score = 0
            
            # Extreme ratings are more informative
            rating = review.get('rating', 3)
            if rating in [1, 5]:
                score += 3
            elif rating in [2, 4]:
                score += 1
            
            # Longer reviews have more detail
            text_length = len(review.get('text', ''))
            if text_length > 100:
                score += 2
            elif text_length > 50:
                score += 1
            
            # Avoid very short reviews (low quality)
            if text_length < 20:
                score -= 2
            
            scored_reviews.append((score, review))
        
        # Sort by score and return top N
        scored_reviews.sort(key=lambda x: x[0], reverse=True)
        top_reviews = [review for score, review in scored_reviews[:limit]]
        
        logger.debug(f"Selected {len(top_reviews)} top reviews from {len(reviews)} total")
        return top_reviews
    
    def _parse_free_tier_response(self, response_text: str) -> Dict:
        """Parse free tier JSON response"""
        try:
            # Clean response
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            # Parse JSON
            analysis = json.loads(cleaned_text)
            
            # Validate required fields
            if 'actionable_insights' not in analysis:
                logger.warning("Missing actionable_insights in free tier response")
                analysis['actionable_insights'] = []
            
            if 'analysis_summary' not in analysis:
                analysis['analysis_summary'] = {
                    "total_reviews_analyzed": 0,
                    "competitors_count": 0,
                    "analysis_date": datetime.now().isoformat()
                }
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse free tier JSON response: {e}")
            logger.error(f"Response text: {response_text[:500]}...")
            raise
    
    def _add_confidence_scores(self, analysis: Dict, competitors_data: Dict) -> Dict:
        """Add confidence scores to actionable insights"""
        
        total_reviews = sum(len(reviews) for reviews in competitors_data.values())
        
        for insight in analysis.get('actionable_insights', []):
            mention_count = insight.get('mention_count', 1)
            significance = (mention_count / total_reviews * 100) if total_reviews > 0 else 0
            
            # Free tier confidence thresholds (slightly lower than premium)
            if significance >= 8.0:  # 8%+ of reviews mention this
                confidence = 'high'
            elif significance >= 4.0:  # 4-8% mention this
                confidence = 'medium'
            else:
                confidence = 'low'
            
            insight['confidence'] = confidence
            insight['significance'] = round(significance, 2)
        
        return analysis
    
    def _filter_top_insights(self, analysis: Dict) -> Dict:
        """Filter to top insights only (free tier gets fewer insights)"""
        
        insights = analysis.get('actionable_insights', [])
        
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
        
        # Limit to target number of insights
        top_insights = quality_insights[:self.target_insights]
        
        analysis['actionable_insights'] = top_insights
        
        # Add filtering metadata
        analysis['filtering_metadata'] = {
            'tier': 'free',
            'filtered_at': datetime.now().isoformat(),
            'total_insights_generated': len(insights),
            'quality_insights': len(quality_insights),
            'final_insights': len(top_insights),
            'confidence_threshold': 'medium_and_above'
        }
        
        # Add upgrade teaser (conversion optimization)
        analysis['upgrade_preview'] = {
            'available_in_premium': [
                'Market Gap Analysis: 2-3 underserved segments identified',
                'Strategic Roadmap: 90-day implementation plan with ROI projections',
                'Menu Intelligence: 8+ buzz items analyzed across competitors',
                '2 Additional Competitors: Wider market view (5 vs 3 competitors)',
                'Implementation Timeline: Week-by-week action plan',
                'Success Metrics: KPIs and measurement framework'
            ],
            'upgrade_benefits': {
                'more_insights': '8-12 strategic insights vs 4 tactical',
                'deeper_analysis': '3x more detailed recommendations',
                'roi_focus': 'Investment planning with expected returns',
                'competitive_moat': 'Build lasting competitive advantages'
            },
            'upgrade_cta': 'Upgrade to Premium for strategic growth planning'
        }
        
        return analysis
    
    def _calculate_cost(self, usage_metadata) -> float:
        """Calculate estimated cost based on token usage"""
        if not usage_metadata:
            return 0.0
        
        # Gemini 2.0 Flash pricing (as of 2024)
        input_cost_per_token = 0.000000075  # $0.075 per 1M tokens
        output_cost_per_token = 0.0000003   # $0.30 per 1M tokens
        
        input_cost = usage_metadata.prompt_token_count * input_cost_per_token
        output_cost = usage_metadata.candidates_token_count * output_cost_per_token
        
        total_cost = input_cost + output_cost
        return round(total_cost, 4)
    
    def _get_mock_free_analysis(self, restaurant_name: str, competitors_data: Dict) -> Dict:
        """Generate mock free tier analysis for development/testing"""
        
        competitor_names = []
        total_reviews = 0
        
        for reviews in competitors_data.values():
            if reviews:
                competitor_names.append(reviews[0].get('competitor_name', 'Unknown'))
                total_reviews += len(reviews)
        
        return {
            "analysis_summary": {
                "total_reviews_analyzed": total_reviews,
                "competitors_count": min(len(competitors_data), self.max_competitors),
                "analysis_date": datetime.now().isoformat()
            },
            "actionable_insights": [
                {
                    "category": "opportunity",
                    "title": "Service Speed Advantage",
                    "description": f"{restaurant_name} should focus on faster service to beat competitor wait times of 25-45 minutes.",
                    "confidence": "high",
                    "significance": 28.5,
                    "proof_quote": "Waited 35 minutes for our pizza, way too long",
                    "mention_count": 8,
                    "competitor_source": competitor_names[0] if competitor_names else "Sample Competitor"
                },
                {
                    "category": "threat",
                    "title": "Crust Quality Competition",
                    "description": f"Competitors receiving praise for crust quality. {restaurant_name} should audit recipe.",
                    "confidence": "high",
                    "significance": 22.0,
                    "proof_quote": "The crust was perfectly crispy and flavorful",
                    "mention_count": 6,
                    "competitor_source": competitor_names[0] if competitor_names else "Sample Competitor"
                },
                {
                    "category": "opportunity",
                    "title": "Parking Convenience Gap",
                    "description": f"Competitors struggle with limited parking. {restaurant_name} should highlight parking availability.",
                    "confidence": "medium",
                    "significance": 15.5,
                    "proof_quote": "Had to park three blocks away, very inconvenient",
                    "mention_count": 4,
                    "competitor_source": competitor_names[1] if len(competitor_names) > 1 else "Sample Competitor"
                },
                {
                    "category": "watch",
                    "title": "Price Sensitivity Monitoring",
                    "description": f"Some customers mention pricing concerns. {restaurant_name} should monitor competitor pricing changes.",
                    "confidence": "medium",
                    "significance": 12.0,
                    "proof_quote": "Getting expensive for what you get",
                    "mention_count": 3,
                    "competitor_source": competitor_names[2] if len(competitor_names) > 2 else "Sample Competitor"
                }
            ],
            "filtering_metadata": {
                "tier": "free",
                "filtered_at": datetime.now().isoformat(),
                "total_insights_generated": 4,
                "quality_insights": 4,
                "final_insights": 4,
                "confidence_threshold": "medium_and_above"
            }
        }