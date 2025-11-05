"""
Competitor Exclusion Service
Prevents re-analyzing the same competitors within a cooldown period
"""
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from supabase import Client

logger = logging.getLogger(__name__)


class CompetitorExclusionService:
    """Manages competitor exclusion to prevent duplicate analyses"""
    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
        self.cooldown_days = 14  # Don't re-analyze same competitor for 14 days
    
    async def get_excluded_place_ids(
        self,
        user_id: str,
        analysis_type: str = 'both'  # 'menu', 'review', or 'both'
    ) -> List[str]:
        """
        Get list of place_ids that should be excluded from discovery
        
        Args:
            user_id: User ID
            analysis_type: Type of analysis ('menu', 'review', or 'both')
        
        Returns:
            List of place_ids to exclude
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=self.cooldown_days)
            excluded_ids = set()
            
            # Get excluded competitors from menu comparisons
            if analysis_type in ['menu', 'both']:
                menu_excluded = await self._get_menu_comparison_exclusions(
                    user_id, cutoff_date
                )
                excluded_ids.update(menu_excluded)
            
            # Get excluded competitors from review analyses
            if analysis_type in ['review', 'both']:
                review_excluded = await self._get_review_analysis_exclusions(
                    user_id, cutoff_date
                )
                excluded_ids.update(review_excluded)
            
            logger.info(
                f"🚫 Excluding {len(excluded_ids)} competitors for user {user_id[:8]} "
                f"(analyzed in last {self.cooldown_days} days)"
            )
            
            return list(excluded_ids)
            
        except Exception as e:
            logger.error(f"❌ Failed to get excluded competitors: {e}")
            # Return empty list on error - don't block discovery
            return []
    
    async def _get_menu_comparison_exclusions(
        self,
        user_id: str,
        cutoff_date: datetime
    ) -> List[str]:
        """Get place_ids from recent menu comparisons"""
        try:
            # Query competitor_businesses via join with competitor_menu_analyses
            # since competitor_businesses doesn't have user_id directly
            result = self.client.table("competitor_businesses").select(
                "place_id, competitor_menu_analyses!inner(user_id, created_at)"
            ).eq(
                "competitor_menu_analyses.user_id", user_id
            ).gte(
                "competitor_menu_analyses.created_at", cutoff_date.isoformat()
            ).execute()
            
            place_ids = [row['place_id'] for row in result.data if row.get('place_id')]
            
            logger.info(
                f"📋 Found {len(place_ids)} competitors from menu comparisons "
                f"since {cutoff_date.date()}"
            )
            
            return place_ids
            
        except Exception as e:
            logger.error(f"❌ Failed to get menu comparison exclusions: {e}")
            return []
    
    async def _get_review_analysis_exclusions(
        self,
        user_id: str,
        cutoff_date: datetime
    ) -> List[str]:
        """Get place_ids from recent review analyses"""
        try:
            # Query analysis_competitors junction table via analyses
            result = self.client.table("analysis_competitors").select(
                "competitor_id, analyses!inner(user_id, status, created_at)"
            ).eq(
                "analyses.user_id", user_id
            ).eq(
                "analyses.status", "completed"
            ).gte(
                "analyses.created_at", cutoff_date.isoformat()
            ).execute()
            
            # competitor_id in analysis_competitors is the place_id
            place_ids = [row['competitor_id'] for row in result.data if row.get('competitor_id')]
            
            logger.info(
                f"📋 Found {len(place_ids)} competitors from review analyses "
                f"since {cutoff_date.date()}"
            )
            
            return place_ids
            
        except Exception as e:
            logger.error(f"❌ Failed to get review analysis exclusions: {e}")
            return []
    
    def filter_competitors(
        self,
        competitors: List[Dict],
        excluded_place_ids: List[str]
    ) -> List[Dict]:
        """
        Filter out excluded competitors from discovery results
        
        Args:
            competitors: List of competitor dicts with 'place_id' field
            excluded_place_ids: List of place_ids to exclude
        
        Returns:
            Filtered list of competitors
        """
        if not excluded_place_ids:
            return competitors
        
        excluded_set = set(excluded_place_ids)
        filtered = [
            c for c in competitors 
            if c.get('place_id') not in excluded_set
        ]
        
        excluded_count = len(competitors) - len(filtered)
        if excluded_count > 0:
            logger.info(
                f"🚫 Filtered out {excluded_count} previously analyzed competitors"
            )
        
        return filtered
    
    async def mark_competitors_analyzed(
        self,
        user_id: str,
        place_ids: List[str],
        analysis_type: str
    ) -> None:
        """
        Mark competitors as analyzed (for tracking purposes)
        Note: This is implicit through the analysis records, but can be used
        for explicit tracking if needed in the future
        
        Args:
            user_id: User ID
            place_ids: List of place_ids that were analyzed
            analysis_type: Type of analysis ('menu' or 'review')
        """
        logger.info(
            f"✅ Marked {len(place_ids)} competitors as analyzed "
            f"for user {user_id[:8]} ({analysis_type})"
        )
        # Currently implicit through analysis records
        # Could add explicit tracking table if needed
