#!/usr/bin/env python3
"""
Enhanced Analysis Storage Service
Handles storage for both free tier (actionable_insights) and premium tier (enhanced structure)
"""
import logging
from datetime import datetime
from typing import Dict, List, Any
import re

logger = logging.getLogger(__name__)

class EnhancedAnalysisStorage:
    """
    Storage service that handles both free and premium tier response structures
    """
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    def store_analysis_results(
        self, 
        analysis_id: str, 
        analysis_result: Dict, 
        tier: str = "free"
    ) -> List[Dict]:
        """
        Store analysis results based on tier and response structure
        
        Args:
            analysis_id: Analysis ID
            analysis_result: LLM response (structure varies by tier)
            tier: "free" or "premium"
            
        Returns:
            List of stored insights
        """
        
        try:
            if tier == "free":
                return self._store_free_tier_insights(analysis_id, analysis_result)
            else:
                return self._store_premium_tier_insights(analysis_id, analysis_result)
                
        except Exception as e:
            logger.error(f"Failed to store analysis results: {e}")
            return []
    
    def _store_free_tier_insights(self, analysis_id: str, analysis_result: Dict) -> List[Dict]:
        """Store free tier insights (actionable_insights structure)"""
        
        insights_to_store = []
        
        # Free tier uses actionable_insights structure (already working)
        for i, insight in enumerate(analysis_result.get('actionable_insights', [])):
            insight_data = {
                "id": f"insight_{analysis_id}_{i}",
                "analysis_id": analysis_id,
                "category": insight.get('category', 'watch'),
                "title": insight.get('title', 'Untitled Insight'),
                "description": insight.get('description', ''),
                "confidence": insight.get('confidence', 'medium'),
                "mention_count": insight.get('mention_count', 1),
                "significance": insight.get('significance', 0.0),
                "proof_quote": insight.get('proof_quote', ''),
                "created_at": datetime.utcnow().isoformat()
            }
            
            insights_to_store.append(insight_data)
            
            # Store in database
            try:
                self.supabase.table("insights").insert(insight_data).execute()
                logger.info(f"Stored free tier insight: {insight_data['title']}")
            except Exception as e:
                logger.error(f"Error storing free tier insight: {e}")
        
        logger.info(f"Stored {len(insights_to_store)} free tier insights")
        return insights_to_store
    
    def _store_premium_tier_insights(self, analysis_id: str, analysis_result: Dict) -> List[Dict]:
        """Store premium tier insights (enhanced structure)"""
        
        insights_to_store = []
        insight_counter = 0
        
        # Extract from strategic_recommendations
        for rec in analysis_result.get('strategic_recommendations', []):
            insight_data = {
                "id": f"insight_{analysis_id}_{insight_counter}",
                "analysis_id": analysis_id,
                "category": "opportunity",
                "title": rec.get('recommendation', 'Strategic Recommendation'),
                "description": rec.get('rationale', ''),
                "confidence": "high",  # Strategic recommendations are high confidence
                "mention_count": self._extract_mention_count(rec.get('evidence', '')),
                "significance": self._calculate_significance(rec.get('evidence', ''), analysis_result),
                "proof_quote": rec.get('evidence', ''),
                "created_at": datetime.utcnow().isoformat()
            }
            
            insights_to_store.append(insight_data)
            insight_counter += 1
        
        # Extract from quick_wins
        for win in analysis_result.get('quick_wins', []):
            insight_data = {
                "id": f"insight_{analysis_id}_{insight_counter}",
                "analysis_id": analysis_id,
                "category": "opportunity",
                "title": win.get('opportunity', 'Quick Win Opportunity'),
                "description": win.get('competitive_advantage', ''),
                "confidence": win.get('impact_level', 'medium'),
                "mention_count": self._extract_mention_count(win.get('evidence', '')),
                "significance": self._calculate_significance(win.get('evidence', ''), analysis_result),
                "proof_quote": win.get('evidence', ''),
                "created_at": datetime.utcnow().isoformat()
            }
            
            insights_to_store.append(insight_data)
            insight_counter += 1
        
        # Extract from threat_assessment
        for threat in analysis_result.get('threat_assessment', []):
            insight_data = {
                "id": f"insight_{analysis_id}_{insight_counter}",
                "analysis_id": analysis_id,
                "category": "threat",
                "title": threat.get('description', 'Competitive Threat'),
                "description": threat.get('recommended_response', ''),
                "confidence": threat.get('threat_level', 'medium'),
                "mention_count": self._extract_mention_count(threat.get('evidence', '')),
                "significance": self._calculate_significance(threat.get('evidence', ''), analysis_result),
                "proof_quote": threat.get('evidence', ''),
                "created_at": datetime.utcnow().isoformat()
            }
            
            insights_to_store.append(insight_data)
            insight_counter += 1
        
        # Extract buzz items from competitive_positioning
        for competitor in analysis_result.get('competitive_positioning', []):
            competitor_name = competitor.get('competitor_name', 'Unknown')
            
            for item in competitor.get('popular_items', []):
                insight_data = {
                    "id": f"insight_{analysis_id}_{insight_counter}",
                    "analysis_id": analysis_id,
                    "category": "watch",
                    "title": f"Menu Item: {item.get('item_name', 'Unknown Item')}",
                    "description": f"Competitor {competitor_name} - {item.get('sentiment', 'mixed')} sentiment from customers",
                    "confidence": "medium",
                    "mention_count": item.get('mention_count', 1),
                    "significance": self._calculate_item_significance(item.get('mention_count', 1), analysis_result),
                    "proof_quote": item.get('sample_quote', ''),

                    "created_at": datetime.utcnow().isoformat()
                }
                
                insights_to_store.append(insight_data)
                insight_counter += 1
        
        # Store all insights in database
        for insight_data in insights_to_store:
            try:
                self.supabase.table("insights").insert(insight_data).execute()
                logger.info(f"Stored premium insight: {insight_data['title']}")
            except Exception as e:
                logger.error(f"Error storing premium insight: {e}")
        
        logger.info(f"Stored {len(insights_to_store)} premium tier insights")
        return insights_to_store
    
    def _extract_mention_count(self, evidence_text: str) -> int:
        """
        Extract mention count from evidence text
        
        Examples:
        - "18 customer complaints across 4 competitors" → 18
        - "Multiple customers mentioned slow service" → 3 (conservative estimate)
        - "Several reviews praised the crust quality" → 3
        """
        
        if not evidence_text:
            return 1
        
        # Try to find explicit numbers
        number_patterns = [
            r'(\d+)\s+(?:customer|mention|complaint|review|time)',
            r'(\d+)\s+(?:people|users|diners)',
            r'mentioned\s+(\d+)\s+times?',
            r'(\d+)\s+out\s+of\s+\d+',
        ]
        
        for pattern in number_patterns:
            match = re.search(pattern, evidence_text.lower())
            if match:
                return int(match.group(1))
        
        # Estimate based on qualitative terms
        qualitative_estimates = {
            'multiple': 3,
            'several': 3,
            'many': 5,
            'numerous': 5,
            'few': 2,
            'some': 2,
            'consistently': 4,
            'frequently': 4,
            'often': 3,
            'rarely': 1,
            'occasionally': 2
        }
        
        evidence_lower = evidence_text.lower()
        for term, count in qualitative_estimates.items():
            if term in evidence_lower:
                return count
        
        # Default to 1 if no indicators found
        return 1
    
    def _calculate_significance(self, evidence_text: str, analysis_result: Dict) -> float:
        """Calculate significance percentage based on mention count and total reviews"""
        
        mention_count = self._extract_mention_count(evidence_text)
        
        # Get total reviews from analysis summary
        total_reviews = analysis_result.get('analysis_summary', {}).get('total_reviews_analyzed', 50)
        
        if total_reviews > 0:
            significance = (mention_count / total_reviews) * 100
            return round(significance, 2)
        
        return 0.0
    
    def _calculate_item_significance(self, mention_count: int, analysis_result: Dict) -> float:
        """Calculate significance for menu items"""
        
        total_reviews = analysis_result.get('analysis_summary', {}).get('total_reviews_analyzed', 50)
        
        if total_reviews > 0:
            significance = (mention_count / total_reviews) * 100
            return round(significance, 2)
        
        return 0.0
    
    def store_analysis_metadata(self, analysis_id: str, analysis_result: Dict, tier: str) -> None:
        """Store analysis metadata"""
        
        try:
            metadata = {
                "llm_provider": "google_gemini",
                "tier": tier,
                "total_reviews_analyzed": analysis_result.get('analysis_summary', {}).get('total_reviews_analyzed', 0),
                "competitors_analyzed": analysis_result.get('analysis_summary', {}).get('competitors_count', 0),
                "insights_generated": len(analysis_result.get('actionable_insights', [])) if tier == 'free' else self._count_premium_insights(analysis_result),
                "completed_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": analysis_result.get('metadata', {}).get('processing_time_seconds', 0),
                "estimated_cost": analysis_result.get('metadata', {}).get('target_cost', 0.0)
            }
            
            self.supabase.table("analyses").update(metadata).eq("id", analysis_id).execute()
            logger.info(f"Updated analysis metadata for {analysis_id}")
            
        except Exception as e:
            logger.error(f"Error updating analysis metadata: {e}")
    
    def _count_premium_insights(self, analysis_result: Dict) -> int:
        """Count total insights in premium response"""
        
        count = 0
        count += len(analysis_result.get('strategic_recommendations', []))
        count += len(analysis_result.get('quick_wins', []))
        count += len(analysis_result.get('threat_assessment', []))
        
        # Count buzz items
        for competitor in analysis_result.get('competitive_positioning', []):
            count += len(competitor.get('popular_items', []))
        
        return count