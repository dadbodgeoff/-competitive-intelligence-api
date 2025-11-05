#!/usr/bin/env python3
"""
Real Free Tier LLM Analysis Service - WORKING VERSION
"""
import google.generativeai as genai
import os
import json
import time
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class RealFreeTierLLMService:
    """Real LLM processing for free tier"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("Google Gemini API key not found. Using fallback analysis.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        self.max_competitors = 2
        self.max_reviews_per_competitor = 10
        self.max_input_tokens = 1000
        self.max_output_tokens = 500
        self.timeout_seconds = 30
    
    async def analyze_competitors_free_tier(self, restaurant_name: str, restaurant_location: str, restaurant_category: str, competitors_data: Dict[str, List[Dict]]) -> Dict:
        """Process real competitor data into actionable insights"""
        
        if not competitors_data:
            return self._get_fallback_analysis(restaurant_name, restaurant_category)
        
        total_reviews = sum(len(reviews) for reviews in competitors_data.values())
        logger.info(f"real_free_tier_analysis_started: restaurant={restaurant_name}, competitor_count={len(competitors_data)}, total_reviews={total_reviews}")
        
        if not self.model:
            return self._get_fallback_analysis(restaurant_name, restaurant_category, competitors_data)
        
        try:
            # Optimize data for cost efficiency
            optimized_data = self._optimize_competitor_data(competitors_data)
            self._last_optimized_data = optimized_data  # Store for later reference
            
            # Call the actual LLM
            llm_response = await self._call_llm_with_timeout(restaurant_name, restaurant_location, restaurant_category, optimized_data)
            
            if llm_response:
                # Add evidence data to response
                llm_response['evidence_reviews'] = self._extract_evidence_from_optimized(optimized_data)
                return llm_response
            else:
                logger.warning(f"LLM returned empty response for {restaurant_name}, using fallback")
                return self._get_fallback_analysis(restaurant_name, restaurant_category, optimized_data)
                
        except Exception as e:
            logger.error(f"Real free tier LLM analysis failed for {restaurant_name}: {str(e)}")
            return self._get_fallback_analysis(restaurant_name, restaurant_category, competitors_data)
    
    def _optimize_competitor_data(self, competitors_data: Dict[str, List[Dict]]) -> Dict[str, List[Dict]]:
        """Strategic review selection: Select best 10 from 35 reviews per competitor"""
        optimized = {}
        
        for competitor_id, reviews in competitors_data.items():
            if not reviews:
                continue
            
            competitor_name = reviews[0].get('competitor_name', 'Unknown Competitor')
            
            # Filter quality reviews
            quality_reviews = [r for r in reviews if len(r.get('text', '')) > 20 and r.get('rating') is not None]
            if not quality_reviews:
                continue
            
            # Apply recency boost to all reviews
            quality_reviews = self._apply_recency_boost(quality_reviews)
            
            # Segment by rating
            negative_reviews = [r for r in quality_reviews if r.get('rating', 0) <= 2]
            positive_reviews = [r for r in quality_reviews if r.get('rating', 0) == 5]
            neutral_reviews = [r for r in quality_reviews if 3 <= r.get('rating', 0) <= 4]
            
            # Sort each segment by final_score (quality + recency)
            negative_reviews.sort(key=lambda x: x.get('final_score', 0), reverse=True)
            positive_reviews.sort(key=lambda x: x.get('final_score', 0), reverse=True)
            neutral_reviews.sort(key=lambda x: x.get('final_score', 0), reverse=True)
            
            # Strategic selection: 4 negative, 4 positive, 2 neutral (10 total)
            selected = []
            selected_negative = negative_reviews[:4]  # Top 4 negative
            selected_positive = positive_reviews[:4]  # Top 4 positive
            selected_neutral = neutral_reviews[:2]    # Top 2 neutral
            
            selected.extend(selected_negative)
            selected.extend(selected_positive)
            selected.extend(selected_neutral)
            
            # If we don't have enough in a category, fill with best available
            if len(selected) < 10:
                remaining = [r for r in quality_reviews if r not in selected]
                remaining.sort(key=lambda x: x.get('final_score', 0), reverse=True)
                selected.extend(remaining[:10 - len(selected)])
            
            # Optimize for token cost and track evidence
            optimized_reviews = []
            evidence_reviews = {
                'negative': [],
                'positive': [],
                'neutral': []
            }
            
            for review in selected:
                rating = review.get('rating', 0)
                review_data = {
                    'competitor_name': competitor_name,
                    'rating': rating,
                    'text': review.get('text', '')[:150],  # Slightly longer for context
                    'quality_score': review.get('quality_score', 0),
                    'is_negative': rating <= 2,
                    'is_positive': rating == 5,
                    'full_text': review.get('text', ''),  # Keep full text for evidence
                    'date': review.get('date', '')
                }
                optimized_reviews.append(review_data)
                
                # Categorize for evidence display
                if rating <= 2:
                    evidence_reviews['negative'].append(review_data)
                elif rating == 5:
                    evidence_reviews['positive'].append(review_data)
                else:
                    evidence_reviews['neutral'].append(review_data)
            
            optimized[competitor_id] = {
                'reviews': optimized_reviews,
                'evidence': evidence_reviews  # Track for API response
            }
        
        # Limit to max competitors
        if len(optimized) > self.max_competitors:
            sorted_competitors = sorted(optimized.items(), key=lambda x: len(x[1]['reviews']), reverse=True)
            optimized = dict(sorted_competitors[:self.max_competitors])
        
        return optimized
    
    def _extract_evidence_from_optimized(self, optimized_data: Dict) -> Dict:
        """Extract evidence reviews from optimized data for API response"""
        evidence_by_competitor = {}
        
        for competitor_id, data in optimized_data.items():
            if isinstance(data, dict) and 'evidence' in data:
                # Get competitor name from reviews
                competitor_name = "Unknown"
                if 'reviews' in data and data['reviews']:
                    competitor_name = data['reviews'][0].get('competitor_name', 'Unknown')
                
                evidence_by_competitor[competitor_name] = data['evidence']
        
        return evidence_by_competitor
    
    def _apply_recency_boost(self, reviews: List[Dict]) -> List[Dict]:
        """Add recency boost to quality scores"""
        from datetime import datetime, timedelta
        
        now = datetime.now()
        
        for review in reviews:
            base_quality = review.get('quality_score', 0.5)
            review_date = review.get('review_date')
            
            if not review_date:
                review['final_score'] = base_quality
                continue
            
            # Parse review_date if it's a string
            if isinstance(review_date, str):
                try:
                    # Handle various date formats
                    if 'T' in review_date:
                        review_date = datetime.fromisoformat(review_date.replace('Z', '+00:00'))
                    else:
                        review_date = datetime.strptime(review_date, '%Y-%m-%d')
                except:
                    review['final_score'] = base_quality
                    continue
            
            # Calculate days old
            days_old = (now - review_date).days
            
            # Apply recency boost
            if days_old <= 30:
                recency_boost = 0.3
            elif days_old <= 90:
                recency_boost = 0.2
            elif days_old <= 180:
                recency_boost = 0.1
            else:
                recency_boost = 0.0
            
            review['final_score'] = min(1.0, base_quality + recency_boost)
        
        return reviews

    def get_cost_estimate(self, competitor_count: int, avg_reviews_per_competitor: int) -> Dict[str, float]:
        """Estimate cost for free tier analysis"""
        estimated_input_tokens = min((competitor_count * avg_reviews_per_competitor * 25), self.max_input_tokens)
        estimated_output_tokens = self.max_output_tokens
        input_cost_per_1k = 0.000125
        output_cost_per_1k = 0.000375
        input_cost = (estimated_input_tokens / 1000) * input_cost_per_1k
        output_cost = (estimated_output_tokens / 1000) * output_cost_per_1k
        total_cost = input_cost + output_cost
        return {
            "estimated_cost": round(total_cost, 4),
            "input_tokens": estimated_input_tokens,
            "output_tokens": estimated_output_tokens,
            "input_cost": round(input_cost, 4),
            "output_cost": round(output_cost, 4)
        }
    
    def _get_fallback_analysis(self, restaurant_name: str, restaurant_category: str, competitors_data: Optional[Dict] = None) -> Dict:
        """Generate fallback analysis when LLM is unavailable"""
        competitor_names = []
        total_reviews = 0
        
        if competitors_data:
            for reviews in competitors_data.values():
                if reviews:
                    competitor_names.append(reviews[0].get('competitor_name', 'Unknown'))
                    total_reviews += len(reviews)
        
        fallback_insights = []
        
        if competitor_names:
            fallback_insights.append({
                "category": "opportunity",
                "title": "Service Differentiation Opportunity",
                "description": f"{restaurant_name} can differentiate from competitors like {', '.join(competitor_names[:2])} by focusing on exceptional service quality.",
                "confidence": "medium",
                "significance": 65.0,
                "proof_quote": "Based on competitive analysis patterns",
                "mention_count": max(1, total_reviews // 10),
                "competitor_source": competitor_names[0] if competitor_names else "Multiple Sources"
            })
        else:
            fallback_insights = [{
                "category": "opportunity",
                "title": "Service Excellence Focus",
                "description": f"{restaurant_name} should prioritize exceptional customer service to build competitive advantage.",
                "confidence": "medium",
                "significance": 60.0,
                "proof_quote": "General competitive analysis principles",
                "mention_count": 1,
                "competitor_source": "Market Analysis"
            }]
        
        return {
            "actionable_insights": fallback_insights,
            "analysis_summary": {
                "total_reviews_analyzed": total_reviews,
                "competitors_count": len(competitor_names),
                "analysis_date": datetime.now().isoformat(),
                "fallback_reason": "LLM unavailable or timeout"
            },
            "filtering_metadata": {
                "tier": "free",
                "filtered_at": datetime.now().isoformat(),
                "total_insights_generated": len(fallback_insights),
                "quality_insights": len(fallback_insights),
                "final_insights": len(fallback_insights),
                "confidence_threshold": "medium_and_above",
                "is_fallback": True
            }
        }
    
    async def _call_llm_with_timeout(self, restaurant_name: str, restaurant_location: str, restaurant_category: str, optimized_data: Dict) -> Optional[Dict]:
        """Call LLM with timeout protection"""
        try:
            # Build the prompt
            prompt = self._build_prompt(restaurant_name, restaurant_location, restaurant_category, optimized_data)
            
            logger.info(f"Calling Gemini API for {restaurant_name} with {len(optimized_data)} competitors")
            logger.info(f"Prompt length: {len(prompt)} characters")
            
            # Call Gemini API with timeout
            start_time = time.time()
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(self.model.generate_content, prompt),
                    timeout=self.timeout_seconds
                )
                processing_time = time.time() - start_time
                
                logger.info(f"LLM response received in {processing_time:.2f}s for {restaurant_name}")
                logger.info(f"Response length: {len(response.text)} characters")
            except Exception as e:
                logger.error(f"Error during LLM API call: {str(e)}")
                raise
            
            # Parse and validate response
            parsed_response = self._parse_llm_response(response.text)
            
            if parsed_response:
                # Add metadata
                parsed_response['analysis_summary']['processing_time_seconds'] = round(processing_time, 2)
                parsed_response['filtering_metadata']['is_fallback'] = False
                return parsed_response
            else:
                logger.warning(f"Failed to parse LLM response for {restaurant_name}")
                return None
                
        except asyncio.TimeoutError:
            logger.warning(f"LLM call timed out after {self.timeout_seconds}s for {restaurant_name}")
            return None
        except Exception as e:
            logger.error(f"LLM call failed for {restaurant_name}: {str(e)}")
            return None
    
    def _build_prompt(self, restaurant_name: str, restaurant_location: str, restaurant_category: str, optimized_data: Dict) -> str:
        """Build the prompt for the LLM"""
        
        # Load the prompt template
        prompt_template_path = "prompts/free_tier_llm_prompt.txt"
        try:
            with open(prompt_template_path, 'r', encoding='utf-8') as f:
                prompt_template = f.read()
        except FileNotFoundError:
            logger.error(f"Prompt template not found at {prompt_template_path}")
            prompt_template = self._get_default_prompt_template()
        
        # Format competitor data
        competitor_reviews_text = ""
        for competitor_id, data in optimized_data.items():
            if not data or 'reviews' not in data:
                continue
            reviews = data['reviews']
            if not reviews:
                continue
            competitor_name = reviews[0].get('competitor_name', 'Unknown')
            competitor_reviews_text += f"\n### {competitor_name}\n"
            for review in reviews:
                rating = review.get('rating', 'N/A')
                text = review.get('text', '')
                competitor_reviews_text += f"- Rating: {rating}/5 - {text}\n"
        
        # Fill in the template
        prompt = prompt_template.replace("{{RESTAURANT_NAME}}", restaurant_name)
        prompt = prompt.replace("{{RESTAURANT_LOCATION}}", restaurant_location)
        prompt = prompt.replace("{{RESTAURANT_CATEGORY}}", restaurant_category)
        prompt = prompt.replace("{{COMPETITOR_REVIEWS}}", competitor_reviews_text)
        prompt = prompt.replace("{{COMPETITOR_COUNT}}", str(len(optimized_data)))
        
        return prompt
    
    def _get_default_prompt_template(self) -> str:
        """Default prompt template if file not found"""
        return """# COMPETITIVE ANALYSIS - FREE TIER

Analyze {{COMPETITOR_COUNT}} competitors for {{RESTAURANT_NAME}}.

For each competitor, generate EXACTLY 2 insights:
1. ONE weakness from negative reviews (1-2⭐)
2. ONE strength from positive reviews (5⭐)

Competitor Reviews:
{{COMPETITOR_REVIEWS}}

Return JSON format:
{
  "actionable_insights": [
    {
      "category": "opportunity|threat|watch",
      "title": "Brief title",
      "description": "Actionable description",
      "confidence": "high|medium|low",
      "significance": 0-100,
      "proof_quote": "Exact quote",
      "mention_count": number,
      "competitor_source": "Competitor name"
    }
  ]
}

Generate EXACTLY 4 insights (2 per competitor). Use exact quotes from reviews."""
    
    def _parse_llm_response(self, response_text: str) -> Optional[Dict]:
        """Parse and validate LLM response"""
        try:
            # Save full response for debugging
            with open('llm_response_debug.txt', 'w', encoding='utf-8') as f:
                f.write(response_text)
            logger.info(f"Full LLM response saved to llm_response_debug.txt")
            logger.info(f"Response preview (first 500 chars): {response_text[:500]}")
            
            # Try to extract JSON from response - look for ```json blocks first
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                # Try to find raw JSON
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start == -1 or json_end == 0:
                    logger.error("No JSON found in LLM response")
                    return None
                
                json_text = response_text[json_start:json_end]
            
            logger.info(f"Extracted JSON (first 300 chars): {json_text[:300]}")
            parsed = json.loads(json_text)
            
            # Validate structure
            if 'actionable_insights' not in parsed:
                logger.error("Missing 'actionable_insights' in LLM response")
                return None
            
            insights = parsed['actionable_insights']
            if not isinstance(insights, list) or len(insights) == 0:
                logger.error("Invalid or empty insights list")
                return None
            
            # Validate each insight
            valid_insights = []
            for insight in insights:
                if self._validate_insight(insight):
                    valid_insights.append(insight)
            
            if not valid_insights:
                logger.error("No valid insights after validation")
                return None
            
            # Build complete response
            total_reviews = 0
            if hasattr(self, '_last_optimized_data'):
                for data in self._last_optimized_data.values():
                    if isinstance(data, dict) and 'reviews' in data:
                        total_reviews += len(data['reviews'])
                    elif isinstance(data, list):
                        total_reviews += len(data)
            
            return {
                "actionable_insights": valid_insights,
                "analysis_summary": {
                    "total_reviews_analyzed": total_reviews,
                    "competitors_count": len(self._last_optimized_data) if hasattr(self, '_last_optimized_data') else 0,
                    "analysis_date": datetime.now().isoformat()
                },
                "filtering_metadata": {
                    "tier": "free",
                    "filtered_at": datetime.now().isoformat(),
                    "total_insights_generated": len(valid_insights),
                    "quality_insights": len(valid_insights),
                    "final_insights": len(valid_insights),
                    "confidence_threshold": "medium_and_above"
                }
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from LLM response: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error parsing LLM response: {str(e)}")
            return None
    
    def _validate_insight(self, insight: Dict) -> bool:
        """Validate a single insight"""
        required_fields = ['category', 'title', 'description']
        
        for field in required_fields:
            if field not in insight or not insight[field]:
                logger.warning(f"Insight missing required field: {field}")
                return False
        
        # Set defaults for optional fields
        if 'confidence' not in insight:
            insight['confidence'] = 'medium'
        if 'significance' not in insight:
            insight['significance'] = 50.0
        if 'proof_quote' not in insight:
            insight['proof_quote'] = ''
        if 'mention_count' not in insight:
            insight['mention_count'] = 1
        if 'competitor_source' not in insight:
            insight['competitor_source'] = 'Multiple Sources'
        
        return True
