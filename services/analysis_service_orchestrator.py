#!/usr/bin/env python3
"""
Analysis Service Orchestrator
Routes analysis requests to appropriate service based on tier
"""
from typing import Dict, List, Optional
import logging
from datetime import datetime

from services.real_free_tier_llm_service import RealFreeTierLLMService
from services.premium_tier_llm_service import PremiumTierLLMService

logger = logging.getLogger(__name__)

class AnalysisServiceOrchestrator:
    """
    Routes analysis requests to correct service based on tier
    
    Tiers:
    - free: Cost-optimized basic analysis ($0.11 target)
    - premium: Strategic business consulting ($0.25 current)
    """
    
    def __init__(self):
        self.free_service = RealFreeTierLLMService()
        self.premium_service = PremiumTierLLMService()
        
        # Cost tracking
        self.target_costs = {
            'free': 0.11,
            'premium': 0.35  # Higher cost for 150 reviews + 5 insights per competitor
        }
    
    async def analyze_competitors(
        self,
        restaurant_name: str,
        restaurant_location: str,
        restaurant_category: str,
        competitors_data: Dict[str, List[Dict]],
        tier: str = "free"
    ) -> Dict:
        """
        Route analysis to appropriate service based on tier
        
        Args:
            restaurant_name: User's restaurant name
            restaurant_location: User's restaurant location  
            restaurant_category: Type of restaurant
            competitors_data: Dict of competitor_id -> list of reviews
            tier: "free" or "premium"
            
        Returns:
            Analysis results with tier metadata
        """
        
        # Validate tier
        if tier not in ["free", "premium"]:
            logger.warning(f"Invalid tier '{tier}', defaulting to free")
            tier = "free"
        
        # Log routing decision
        logger.info(f"analysis_routing_started: tier={tier}, competitor_count={len(competitors_data)}, total_reviews={sum(len(reviews) for reviews in competitors_data.values())}")
        
        start_time = datetime.now()
        
        try:
            if tier == "premium":
                # Route to enhanced service
                logger.info(f"routing_to_premium_tier")
                
                result = await self.premium_service.analyze_competitors_premium_tier(
                    restaurant_name=restaurant_name,
                    restaurant_location=restaurant_location,
                    restaurant_category=restaurant_category,
                    competitors_data=competitors_data
                )
                
                # Add premium tier metadata
                result = self._add_tier_metadata(result, tier, start_time)
                
            else:
                # Route to free tier service
                logger.info(f"routing_to_free_tier")
                
                result = await self.free_service.analyze_competitors_free_tier(
                    restaurant_name=restaurant_name,
                    restaurant_location=restaurant_location,
                    restaurant_category=restaurant_category,
                    competitors_data=competitors_data
                )
                
                # Add free tier metadata
                result = self._add_tier_metadata(result, tier, start_time)
            
            # Log completion
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.info(f"analysis_routing_completed: tier={tier}, processing_time_seconds={processing_time}, insights_count={len(result.get('actionable_insights', []))}")
            
            return result
            
        except Exception as e:
            logger.error(f"analysis_routing_failed: tier={tier}, error={str(e)}")
            
            # Return fallback mock analysis
            return self._get_fallback_analysis(restaurant_name, tier, competitors_data)
    
    def _add_tier_metadata(self, result: Dict, tier: str, start_time: datetime) -> Dict:
        """Add tier-specific metadata to analysis result"""
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Ensure metadata section exists
        if 'metadata' not in result:
            result['metadata'] = {}
        
        # Add tier information
        result['metadata'].update({
            'tier': tier,
            'target_cost': self.target_costs.get(tier, 0.0),
            'processing_time_seconds': round(processing_time, 2),
            'service_version': 'v2.0' if tier == 'premium' else 'v1.0',
            'analysis_timestamp': datetime.now().isoformat()
        })
        
        # Add tier-specific features
        if tier == 'free':
            result['metadata'].update({
                'features': [
                    'competitor_analysis',
                    'actionable_insights', 
                    'proof_quotes',
                    'confidence_scoring'
                ],
                'limitations': [
                    'max_3_competitors',
                    'basic_insights_only',
                    'no_strategic_planning',
                    'no_roi_projections'
                ]
            })
        else:  # premium
            result['metadata'].update({
                'features': [
                    'strategic_analysis',
                    'market_gap_identification',
                    'roi_projections',
                    'implementation_roadmap',
                    'competitive_positioning',
                    'buzz_items_analysis'
                ],
                'limitations': []
            })
        
        return result
    
    def get_tier_comparison(self) -> Dict:
        """Return comparison of tier features and costs"""
        return {
            'tiers': {
                'free': {
                    'cost_per_analysis': self.target_costs['free'],
                    'competitors_analyzed': 3,
                    'insights_provided': '3-4 focused insights',
                    'features': [
                        'Competitor strengths/weaknesses',
                        'Actionable recommendations',
                        'Proof quotes from reviews',
                        'Confidence scoring',
                        'Basic threat/opportunity identification'
                    ],
                    'use_cases': [
                        'Monthly competitive monitoring',
                        'Quick competitor check',
                        'Basic market awareness'
                    ],
                    'target_users': 'Small restaurants, budget-conscious owners'
                },
                'premium': {
                    'cost_per_analysis': self.target_costs['premium'],
                    'competitors_analyzed': 5,
                    'insights_provided': '25 strategic insights (5 per competitor)',
                    'reviews_analyzed': '150 per competitor (35 selected for analysis)',
                    'evidence_reviews': '35 per competitor (175 total)',
                    'features': [
                        'Everything in Free tier, PLUS:',
                        '5 strategic insights per competitor',
                        '150 reviews collected per competitor',
                        '35 evidence reviews per competitor',
                        'Strategic business intelligence',
                        'Competitive threat assessment',
                        'Market opportunity analysis',
                        'Operational excellence insights'
                    ],
                    'use_cases': [
                        'Strategic business planning',
                        'Competitive positioning',
                        'Market expansion decisions',
                        'Investment planning',
                        'Operational improvements'
                    ],
                    'target_users': 'Growing restaurants, strategic planners, multi-location operators'
                }
            },
            'upgrade_benefits': {
                'more_competitors': '5 vs 3 competitors analyzed',
                'deeper_insights': '3x more strategic recommendations',
                'roi_focus': 'Implementation plans with ROI projections',
                'market_intelligence': 'Identify underserved market segments',
                'competitive_moat': 'Build lasting competitive advantages'
            }
        }
    
    def _get_fallback_analysis(self, restaurant_name: str, tier: str, competitors_data: Dict) -> Dict:
        """Generate fallback analysis if both services fail"""
        
        competitor_count = min(len(competitors_data), 3 if tier == 'free' else 5)
        
        return {
            'analysis_summary': {
                'total_reviews_analyzed': 0,
                'competitors_count': competitor_count,
                'analysis_date': datetime.now().isoformat(),
                'status': 'fallback_mode'
            },
            'actionable_insights': [
                {
                    'category': 'opportunity',
                    'title': 'Service Analysis Unavailable',
                    'description': f'Unable to analyze competitors at this time. Please try again later.',
                    'confidence': 'low',
                    'significance': 0.0,
                    'proof_quote': 'Analysis service temporarily unavailable',
                    'mention_count': 0,
                    'competitor_source': 'System'
                }
            ],
            'metadata': {
                'tier': tier,
                'target_cost': self.target_costs.get(tier, 0.0),
                'processing_time_seconds': 0.1,
                'service_version': 'fallback',
                'analysis_timestamp': datetime.now().isoformat(),
                'status': 'error_fallback'
            }
        }
    
    def get_cost_estimate(self, tier: str, competitor_count: int, avg_reviews_per_competitor: int) -> Dict:
        """Estimate cost for analysis based on tier and data volume"""
        
        if tier == 'free':
            # Free tier limits
            actual_competitors = min(competitor_count, 3)
            actual_reviews = min(avg_reviews_per_competitor, 15)
            
            # Cost breakdown
            google_places_cost = actual_competitors * 0.01
            gemini_cost = 0.08  # Fixed for compact prompt
            total_cost = google_places_cost + gemini_cost
            
        else:  # premium
            actual_competitors = min(competitor_count, 5)
            actual_reviews = min(avg_reviews_per_competitor, 45)
            
            # Cost breakdown  
            google_places_cost = actual_competitors * 0.01
            gemini_cost = 0.20  # Enhanced prompt cost
            total_cost = google_places_cost + gemini_cost
        
        return {
            'tier': tier,
            'estimated_cost': round(total_cost, 3),
            'cost_breakdown': {
                'google_places_api': round(google_places_cost, 3),
                'gemini_llm': round(gemini_cost, 3)
            },
            'data_limits': {
                'competitors_analyzed': actual_competitors,
                'max_reviews_per_competitor': actual_reviews
            },
            'cost_factors': {
                'competitor_count_impact': f"${competitor_count * 0.01:.3f}",
                'review_volume_impact': 'Included in LLM cost',
                'tier_multiplier': '1x' if tier == 'free' else '2.3x'
            }
        }