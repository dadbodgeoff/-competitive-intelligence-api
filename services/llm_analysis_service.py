#!/usr/bin/env python3
"""
LLM Analysis Service using Google Gemini API
Transforms competitor review data into actionable business insights
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

@dataclass
class AnalysisInsight:
    """Structured insight from competitor analysis"""
    category: str  # 'threat', 'opportunity', 'watch'
    title: str
    description: str
    confidence: str  # 'high', 'medium', 'low'
    mention_count: int
    significance: float
    proof_quote: Optional[str]
    competitor_name: Optional[str]

class LLMAnalysisService:
    """Service for analyzing competitor reviews using Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("Google Gemini API key not found. Using mock analysis.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def analyze_competitors(
        self,
        restaurant_name: str,
        restaurant_location: str,
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]]
    ) -> Dict:
        """
        Analyze competitor reviews and generate actionable insights
        
        Args:
            restaurant_name: User's restaurant name
            restaurant_location: User's restaurant location
            restaurant_category: Type of restaurant (pizza, burger, etc.)
            competitors_data: Dict of competitor_id -> list of reviews
            
        Returns:
            Structured analysis with insights and recommendations
        """
        
        if not self.model:
            return self._get_mock_analysis(restaurant_name, competitors_data)
        
        try:
            # Build the analysis prompt
            prompt = self._build_analysis_prompt(
                restaurant_name, restaurant_location, restaurant_category, competitors_data
            )
            
            logger.info(f"Starting LLM analysis for {restaurant_name}")
            start_time = time.time()
            
            # Call Gemini API
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=4000,
                    response_mime_type="application/json"
                )
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"LLM analysis completed in {elapsed_time:.2f} seconds")
            
            # Parse and validate response
            analysis_result = self._parse_gemini_response(response.text)
            
            # Add confidence scoring
            scored_analysis = self._add_confidence_scores(analysis_result, competitors_data)
            
            # Filter low-confidence insights
            filtered_analysis = self._filter_insights(scored_analysis)
            
            logger.info(f"Analysis complete: {len(filtered_analysis.get('insights', []))} insights generated")
            
            return filtered_analysis
            
        except Exception as e:
            logger.error(f"LLM analysis failed: {str(e)}")
            return self._get_mock_analysis(restaurant_name, competitors_data)
    
    def _build_analysis_prompt(
        self, 
        restaurant_name: str, 
        restaurant_location: str, 
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]]
    ) -> str:
        """Build the analysis prompt for Gemini"""
        
        # Count total reviews
        total_reviews = sum(len(reviews) for reviews in competitors_data.values())
        
        prompt = f"""# COMPETITIVE INTELLIGENCE ANALYSIS

You are an expert restaurant business analyst. Analyze competitor reviews to provide actionable insights for {restaurant_name}, a {restaurant_category} restaurant in {restaurant_location}.

## COMPETITOR DATA:
Below are {len(competitors_data)} competing restaurants with their recent reviews:

"""
        
        # Add competitor data
        for i, (competitor_id, reviews) in enumerate(competitors_data.items(), 1):
            if not reviews:
                continue
                
            competitor_name = reviews[0].get('competitor_name', f'Competitor {i}')
            avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews) if reviews else 0
            
            prompt += f"""
### COMPETITOR {i}: {competitor_name}
- Average Rating: {avg_rating:.1f} stars
- Reviews Analyzed: {len(reviews)}

**Recent Reviews:**
"""
            
            # Add up to 20 reviews per competitor to stay within token limits
            for review in reviews[:20]:
                rating = review.get('rating', 0)
                text = review.get('text', '')
                date = review.get('date', 'Unknown')
                author = review.get('author', 'Anonymous')
                
                prompt += f"[{date}] {rating}/5 - {author}: {text}\n"
        
        prompt += f"""

## YOUR TASK:
Analyze ALL competitor reviews and provide:

1. **Top Competitor Strengths** - What are competitors doing exceptionally well?
2. **Competitor Weaknesses** - What are their consistent pain points?
3. **Menu Items with Buzz** - Specific dishes getting attention (positive or negative)
4. **Service Insights** - Patterns in service quality, speed, staff behavior
5. **Operational Insights** - Delivery, cleanliness, atmosphere, pricing feedback
6. **Actionable Recommendations** - Specific steps {restaurant_name} should take

## ANALYSIS RULES:
- Base insights on actual review content only
- Count mentions accurately (if 3 people mention something, mentions = 3)
- Include exact quotes as proof
- Focus on patterns (3+ mentions = significant pattern)
- Categorize insights as threats, opportunities, or watch items
- Be specific and actionable

## JSON OUTPUT FORMAT:
{{
  "analysis_summary": {{
    "total_reviews_analyzed": {total_reviews},
    "competitors_count": {len(competitors_data)},
    "analysis_date": "{datetime.now().isoformat()}"
  }},
  "competitor_insights": [
    {{
      "competitor_name": "Name",
      "strengths": [
        {{
          "insight": "Specific strength",
          "proof_quote": "Exact review quote",
          "mention_count": 5,
          "significance": 25.0
        }}
      ],
      "weaknesses": [
        {{
          "insight": "Specific weakness", 
          "proof_quote": "Exact review quote",
          "mention_count": 3,
          "significance": 15.0
        }}
      ],
      "popular_items": [
        {{
          "item_name": "Menu item",
          "sentiment": "positive/negative/mixed",
          "mention_count": 8,
          "sample_quote": "Review quote"
        }}
      ]
    }}
  ],
  "actionable_insights": [
    {{
      "category": "threat/opportunity/watch",
      "title": "Brief insight title",
      "description": "Detailed actionable recommendation for {restaurant_name}",
      "priority": "high/medium/low",
      "proof_quote": "Supporting quote from reviews",
      "competitor_source": "Which competitor this came from"
    }}
  ],
  "key_recommendations": [
    "Specific action item 1 for {restaurant_name}",
    "Specific action item 2 for {restaurant_name}",
    "Specific action item 3 for {restaurant_name}"
  ]
}}

Provide intelligence that {restaurant_name} can act on TODAY. Be direct, factual, and actionable.
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse and validate Gemini's JSON response"""
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            # Parse JSON
            analysis = json.loads(cleaned_text)
            
            # Validate required fields
            required_fields = ['analysis_summary', 'competitor_insights', 'actionable_insights']
            for field in required_fields:
                if field not in analysis:
                    logger.warning(f"Missing field in LLM response: {field}")
                    analysis[field] = []
            
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}")
            logger.error(f"Response text: {response_text[:500]}...")
            raise
    
    def _add_confidence_scores(self, analysis: Dict, competitors_data: Dict) -> Dict:
        """Add confidence scores based on mention counts and significance"""
        
        # Calculate total reviews for significance scoring
        total_reviews = sum(len(reviews) for reviews in competitors_data.values())
        
        # Score actionable insights
        for insight in analysis.get('actionable_insights', []):
            mention_count = insight.get('mention_count', 1)
            significance = (mention_count / total_reviews * 100) if total_reviews > 0 else 0
            
            # Determine confidence level
            if significance >= 10.0:  # 10%+ of reviews mention this
                confidence = 'high'
            elif significance >= 5.0:  # 5-10% mention this
                confidence = 'medium'
            else:
                confidence = 'low'
            
            insight['confidence'] = confidence
            insight['significance'] = round(significance, 2)
        
        # Score competitor insights
        for competitor in analysis.get('competitor_insights', []):
            for strength in competitor.get('strengths', []):
                mention_count = strength.get('mention_count', 1)
                significance = strength.get('significance', 0)
                if significance >= 15.0:
                    strength['confidence'] = 'high'
                elif significance >= 8.0:
                    strength['confidence'] = 'medium'
                else:
                    strength['confidence'] = 'low'
            
            for weakness in competitor.get('weaknesses', []):
                mention_count = weakness.get('mention_count', 1)
                significance = weakness.get('significance', 0)
                if significance >= 15.0:
                    weakness['confidence'] = 'high'
                elif significance >= 8.0:
                    weakness['confidence'] = 'medium'
                else:
                    weakness['confidence'] = 'low'
        
        return analysis
    
    def _filter_insights(self, analysis: Dict) -> Dict:
        """Filter out low-confidence insights"""
        
        # Filter actionable insights
        high_quality_insights = [
            insight for insight in analysis.get('actionable_insights', [])
            if insight.get('confidence', 'low') in ['high', 'medium']
        ]
        analysis['actionable_insights'] = high_quality_insights
        
        # Filter competitor insights
        for competitor in analysis.get('competitor_insights', []):
            competitor['strengths'] = [
                s for s in competitor.get('strengths', [])
                if s.get('confidence', 'low') in ['high', 'medium']
            ]
            competitor['weaknesses'] = [
                w for w in competitor.get('weaknesses', [])
                if w.get('confidence', 'low') in ['high', 'medium']
            ]
        
        # Add filtering metadata
        analysis['filtering_metadata'] = {
            'filtered_at': datetime.now().isoformat(),
            'confidence_threshold': 'medium_and_above',
            'total_insights': len(high_quality_insights)
        }
        
        return analysis
    
    def _get_mock_analysis(self, restaurant_name: str, competitors_data: Dict) -> Dict:
        """Generate mock analysis for development/testing"""
        
        competitor_names = []
        total_reviews = 0
        
        for reviews in competitors_data.values():
            if reviews:
                competitor_names.append(reviews[0].get('competitor_name', 'Unknown'))
                total_reviews += len(reviews)
        
        return {
            "analysis_summary": {
                "total_reviews_analyzed": total_reviews,
                "competitors_count": len(competitors_data),
                "analysis_date": datetime.now().isoformat()
            },
            "competitor_insights": [
                {
                    "competitor_name": competitor_names[0] if competitor_names else "Sample Competitor",
                    "strengths": [
                        {
                            "insight": "Exceptional pizza crust quality",
                            "proof_quote": "The crust was perfectly crispy and flavorful",
                            "mention_count": 8,
                            "significance": 40.0,
                            "confidence": "high"
                        }
                    ],
                    "weaknesses": [
                        {
                            "insight": "Slow service during peak hours",
                            "proof_quote": "Waited 25 minutes for our order",
                            "mention_count": 5,
                            "significance": 25.0,
                            "confidence": "medium"
                        }
                    ],
                    "popular_items": [
                        {
                            "item_name": "Margherita Pizza",
                            "sentiment": "positive",
                            "mention_count": 12,
                            "sample_quote": "Best margherita pizza in the area!"
                        }
                    ]
                }
            ],
            "actionable_insights": [
                {
                    "category": "opportunity",
                    "title": "Improve Service Speed",
                    "description": f"{restaurant_name} should focus on faster service during peak hours to differentiate from competitors who struggle with wait times.",
                    "priority": "high",
                    "confidence": "high",
                    "significance": 25.0,
                    "proof_quote": "Multiple competitors have consistent complaints about slow service",
                    "competitor_source": competitor_names[0] if competitor_names else "Sample Competitor"
                },
                {
                    "category": "threat",
                    "title": "Crust Quality Competition",
                    "description": f"Competitors are receiving high praise for crust quality. {restaurant_name} should ensure their crust recipe and preparation meets or exceeds this standard.",
                    "priority": "medium",
                    "confidence": "high",
                    "significance": 40.0,
                    "proof_quote": "Customers consistently praise competitor crust quality",
                    "competitor_source": competitor_names[0] if competitor_names else "Sample Competitor"
                }
            ],
            "key_recommendations": [
                f"Implement faster order processing system to beat competitor wait times",
                f"Conduct crust quality audit against top-rated competitors",
                f"Train staff on peak-hour efficiency to capitalize on competitor weaknesses"
            ],
            "filtering_metadata": {
                "filtered_at": datetime.now().isoformat(),
                "confidence_threshold": "medium_and_above",
                "total_insights": 2
            }
        }