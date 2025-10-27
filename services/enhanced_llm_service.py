#!/usr/bin/env python3
"""
Enhanced LLM Analysis Service with v2.0 Strategic Prompt
"""
import google.generativeai as genai
import os
import json
import time
from typing import List, Dict, Optional
from datetime import datetime
import logging
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class EnhancedLLMAnalysisService:
    """Enhanced LLM service with strategic v2.0 prompt"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("Google Gemini API key not found.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def analyze_competitors_enhanced(
        self,
        restaurant_name: str,
        restaurant_location: str,
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]]
    ) -> Dict:
        """Enhanced strategic analysis with v2.0 prompt"""
        
        if not self.model:
            return self._get_mock_enhanced_analysis(restaurant_name, competitors_data)
        
        try:
            # Build optimized enhanced prompt
            prompt = self._build_enhanced_prompt(
                restaurant_name, restaurant_location, restaurant_category, competitors_data
            )
            
            logger.info(f"Starting optimized enhanced LLM analysis for {restaurant_name}")
            start_time = time.time()
            
            # Add timeout protection
            import asyncio
            
            async def call_enhanced_llm():
                return self.model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1,
                        max_output_tokens=2000,  # Reduced for faster response
                        response_mime_type="application/json"
                    ),
                    safety_settings=[
                        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                    ]
                )
            
            try:
                # Try enhanced analysis with 20s timeout
                response = await asyncio.wait_for(call_enhanced_llm(), timeout=20.0)
                
                elapsed_time = time.time() - start_time
                logger.info(f"Enhanced LLM analysis completed in {elapsed_time:.2f} seconds")
                
                # Parse response
                analysis_result = self._parse_enhanced_response(response.text)
                
                return analysis_result
                
            except asyncio.TimeoutError:
                logger.warning(f"Enhanced LLM timeout for {restaurant_name}, using fallback")
                
                # Fallback to mock enhanced analysis
                return self._get_mock_enhanced_analysis(restaurant_name, competitors_data)
            
        except Exception as e:
            logger.error(f"Enhanced LLM analysis failed: {str(e)}")
            return self._get_mock_enhanced_analysis(restaurant_name, competitors_data)
    
    def _build_enhanced_prompt(
        self, 
        restaurant_name: str, 
        restaurant_location: str, 
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]]
    ) -> str:
        """
        PRODUCTION-OPTIMIZED ENHANCED PROMPT
        Target: 1,200-1,400 tokens (vs 2,000+)
        Performance: <15 seconds
        """
        
        total_reviews = sum(len(reviews) for reviews in competitors_data.values())
        
        prompt = f"""# COMPETITIVE ANALYSIS - STRATEGIC TIER

Analyze {len(competitors_data)} competitors for {restaurant_name} ({restaurant_category} in {restaurant_location}).

## COMPETITORS:
"""
        
        # Add competitor data with optimization
        for i, (competitor_id, reviews) in enumerate(competitors_data.items(), 1):
            if not reviews:
                continue
                
            competitor_name = reviews[0].get('competitor_name', f'Competitor {i}')
            avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews) if reviews else 0
            
            prompt += f"""
### {i}. {competitor_name} ({avg_rating:.1f}⭐, {len(reviews)} reviews)
"""
            
            # OPTIMIZATION: Top 10 reviews instead of 15, truncate to 80 chars
            top_reviews = self._select_top_reviews(reviews, limit=10)
            
            for review in top_reviews:
                rating = review.get('rating', 0)
                text = review.get('text', '')[:80]  # Truncate to save tokens
                
                prompt += f"[{rating}⭐] {text}...\n"
        
        
        # COMPACT OUTPUT STRUCTURE
        prompt += f"""

## OUTPUT (JSON):
{{
  "strategic_recommendations": [
    {{"recommendation": "Title", "rationale": "Why", "evidence": "Quote", "investment": "$X-Y", "roi_timeline": "X days", "expected_outcome": "X% increase"}}
  ],
  "quick_wins": [
    {{"opportunity": "Title", "impact_level": "high/medium/low", "timeline": "X weeks", "evidence": "Quote"}}
  ],
  "threat_assessment": [
    {{"description": "Threat", "threat_level": "high/medium/low", "evidence": "Quote", "recommended_response": "Action"}}
  ],
  "market_gaps": [
    {{"gap_type": "Gap", "opportunity_size": "high/medium/low", "evidence": "Quote"}}
  ]
}}

## RULES:
- 3-5 strategic recommendations (most impactful)
- 2-4 quick wins (easy to implement)
- 1-3 threats (significant risks)
- 1-3 market gaps (underserved segments)
- Include evidence quotes
- Keep descriptions concise

### 3. COMPETITIVE THREATS
Monitor these emerging competitive risks:
- **Price Competition**: Evidence of aggressive pricing or value positioning
- **Service Excellence**: Competitors setting new service standards
- **Innovation Leaders**: New menu items/concepts gaining customer traction

### 4. QUICK WIN OPPORTUNITIES
Find advantages {restaurant_name} can implement within 30 days:
- **Service Improvements**: Based on competitor weaknesses
- **Menu Additions**: Popular items competitors don't execute well
- **Operational Fixes**: Common pain points across all competitors
- **Marketing Angles**: Underutilized positioning opportunities

## ANALYSIS RULES:
- **Evidence-Based**: Every insight needs 3+ review mentions OR 1 clear pattern
- **ROI-Focused**: Prioritize insights by implementation cost vs. competitive impact
- **Category-Specific**: Apply {restaurant_category} industry expertise
- **Actionable**: Every recommendation must be implementable within 90 days
- **Competitive**: Focus on differentiation opportunities, not just improvement

## ENHANCED JSON OUTPUT:
{{
  "executive_summary": {{
    "market_opportunity_score": "1-10 scale",
    "competitive_intensity": "low/medium/high",
    "primary_recommendation": "Single most important action for {restaurant_name}",
    "expected_impact": "Specific business outcome expected"
  }},
  
  "market_analysis": {{
    "market_maturity": "emerging/growing/mature/saturated",
    "price_range_analysis": {{
      "budget_segment": ["competitor_names_in_this_segment"],
      "mid_range_segment": ["competitor_names_in_this_segment"], 
      "premium_segment": ["competitor_names_in_this_segment"],
      "underserved_segment": "Which price point has opportunity"
    }},
    "service_style_breakdown": {{
      "fast_casual": ["competitor_names"],
      "full_service": ["competitor_names"],
      "counter_service": ["competitor_names"],
      "gap_opportunity": "What service style is missing"
    }}
  }},
  
  "competitive_positioning": [
    {{
      "competitor_name": "Name",
      "market_position": {{
        "price_point": "budget/mid/premium",
        "service_style": "fast-casual/full-service/counter",
        "quality_tier": "basic/good/exceptional",
        "unique_selling_point": "What makes them different"
      }},
      "performance_trends": {{
        "customer_satisfaction": "improving/stable/declining",
        "common_complaints": ["top_3_complaint_themes"],
        "standout_strengths": ["top_3_strength_themes"]
      }}
    }}
  ],

  "market_gaps": [
    {{
      "gap_type": "service/menu/price/experience/convenience",
      "description": "Specific unmet customer need",
      "evidence": "Review quotes showing this demand",
      "opportunity_size": "high/medium/low",
      "implementation_difficulty": "easy/medium/hard",
      "competitive_advantage_potential": "high/medium/low"
    }}
  ],

  "threat_assessment": [
    {{
      "threat_level": "critical/high/medium/low",
      "threat_type": "pricing/quality/service/innovation/location",
      "competitor_source": "Which competitor poses this threat",
      "description": "Specific threat to {restaurant_name}",
      "evidence": "Review-based proof of this threat",
      "recommended_response": "How {restaurant_name} should respond",
      "timeline": "immediate/30_days/90_days"
    }}
  ],

  "quick_wins": [
    {{
      "opportunity": "Specific improvement {restaurant_name} can make",
      "category": "service/menu/operations/marketing/atmosphere",
      "impact_level": "high/medium/low",
      "implementation_cost": "low/medium/high", 
      "timeline": "1_week/1_month/3_months",
      "success_metrics": "How to measure if this worked",
      "competitive_advantage": "Why this beats competitors specifically",
      "evidence": "Review quotes supporting this opportunity"
    }}
  ],

  "strategic_recommendations": [
    {{
      "priority": 1,
      "recommendation": "Primary strategic move for {restaurant_name}",
      "rationale": "Why this is #1 priority based on competitive landscape",
      "implementation_steps": ["Specific step 1", "Specific step 2", "Specific step 3"],
      "expected_outcome": "Measurable business result expected",
      "competitive_moat": "How this creates lasting advantage over these competitors",
      "investment_required": "Estimated cost/effort needed",
      "roi_timeline": "When to expect returns"
    }}
  ]
}}

## FINAL INSTRUCTION:
Provide {restaurant_name} with a strategic competitive intelligence briefing that their management team can execute THIS WEEK. Focus on the 3 most impactful opportunities that will differentiate them from these specific competitors in {restaurant_location}.

Be ruthlessly practical and strategic. Every insight should answer: "What should we do differently starting Monday to gain competitive advantage?"
"""
        
        return prompt
    
    def _select_top_reviews(self, reviews: List[Dict], limit: int = 10) -> List[Dict]:
        """
        Select most informative reviews to reduce token usage
        Priority: Extreme ratings (1⭐ or 5⭐), longer text, recent dates
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
            
            # Avoid very short reviews
            if text_length < 20:
                score -= 2
            
            scored_reviews.append((score, review))
        
        # Sort by score and return top N
        scored_reviews.sort(key=lambda x: x[0], reverse=True)
        return [review for score, review in scored_reviews[:limit]]
    
    def _parse_enhanced_response(self, response_text: str) -> Dict:
        """Parse enhanced JSON response"""
        try:
            # Clean response
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            # Parse JSON
            analysis = json.loads(cleaned_text)
            
            # Add metadata
            analysis['analysis_metadata'] = {
                'version': 'v2.0_enhanced',
                'analysis_date': datetime.now().isoformat(),
                'estimated_cost': 0.25,
                'prompt_type': 'strategic_competitive_intelligence'
            }
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse enhanced JSON response: {e}")
            raise
    
    def _get_mock_enhanced_analysis(self, restaurant_name: str, competitors_data: Dict) -> Dict:
        """Mock enhanced analysis for testing"""
        return {
            "executive_summary": {
                "market_opportunity_score": "7/10",
                "competitive_intensity": "medium",
                "primary_recommendation": f"{restaurant_name} should focus on service speed and consistency to differentiate from slower competitors",
                "expected_impact": "15-20% improvement in customer satisfaction and repeat visits"
            },
            "market_analysis": {
                "market_maturity": "mature",
                "price_range_analysis": {
                    "budget_segment": ["Competitor A"],
                    "mid_range_segment": ["Competitor B", "Competitor C"],
                    "premium_segment": [],
                    "underserved_segment": "Premium segment has opportunity"
                }
            },
            "strategic_recommendations": [
                {
                    "priority": 1,
                    "recommendation": f"Implement express lunch service to capture time-conscious customers",
                    "rationale": "All competitors struggle with lunch rush wait times",
                    "implementation_steps": ["Hire additional lunch staff", "Create express menu", "Add online ordering"],
                    "expected_outcome": "25% increase in lunch revenue within 60 days",
                    "competitive_moat": "First in market with guaranteed 10-minute lunch service"
                }
            ],
            "analysis_metadata": {
                "version": "v2.0_enhanced_mock",
                "analysis_date": datetime.now().isoformat(),
                "estimated_cost": 0.25,
                "prompt_type": "strategic_competitive_intelligence"
            }
        }