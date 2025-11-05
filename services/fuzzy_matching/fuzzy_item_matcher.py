"""
Fuzzy Item Matcher
Main matching service orchestrator
"""
import os
from typing import Dict, List, Optional
from decimal import Decimal
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

from .similarity_calculator import SimilarityCalculator
from .text_normalizer import TextNormalizer
from .match_config import MatchConfig

load_dotenv()
logger = logging.getLogger(__name__)


class FuzzyItemMatcher:
    """Main fuzzy matching service"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.calculator = SimilarityCalculator()
        self.normalizer = TextNormalizer()
        self.config = MatchConfig()
    
    def find_similar_items(
        self,
        target_name: str,
        user_id: str,
        category: Optional[str] = None,
        threshold: float = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Find similar items using multi-stage filtering
        
        Stages:
        1. PostgreSQL trigram (fast pre-filter)
        2. Salient overlap check (fast)
        3. Advanced similarity (expensive)
        
        Args:
            target_name: Item name to match
            user_id: User ID
            category: Optional category filter
            threshold: Minimum similarity (default: config.THRESHOLDS['trigram_filter'])
            limit: Max results
        
        Returns:
            List of similar items with similarity scores
        """
        if threshold is None:
            threshold = self.config.THRESHOLDS['trigram_filter']
        
        # Normalize target
        normalized_target = self.normalizer.normalize_text(target_name)
        target_tokens = self.normalizer.tokenize(target_name)
        
        logger.info(f"🔍 Finding similar items for: {target_name}")
        logger.debug(f"   Normalized: {normalized_target}")
        logger.debug(f"   Tokens: {target_tokens}")
        
        # Stage 1: PostgreSQL trigram search (fast)
        candidates = self._trigram_search(
            normalized_target,
            user_id,
            category,
            threshold,
            self.config.MAX_CANDIDATES
        )
        
        logger.info(f"   Stage 1 (trigram): {len(candidates)} candidates")
        
        if not candidates:
            return []
        
        # Stage 2: Salient overlap filter (fast)
        filtered_candidates = []
        for candidate in candidates:
            candidate_tokens = self.normalizer.tokenize(candidate['normalized_name'])
            
            if self.calculator.has_salient_overlap(target_tokens, candidate_tokens):
                filtered_candidates.append(candidate)
        
        logger.info(f"   Stage 2 (salient): {len(filtered_candidates)} candidates")
        
        if not filtered_candidates:
            return []
        
        # Stage 3: Advanced similarity (expensive)
        target_item = {
            'name': target_name,
            'normalized_name': normalized_target,
            'category': category
        }
        
        results = []
        for candidate in filtered_candidates:
            similarity = self.calculator.calculate_advanced_similarity(
                target_item,
                candidate
            )
            
            if similarity >= self.config.THRESHOLDS['min_similarity']:
                results.append({
                    **candidate,
                    'similarity_score': similarity
                })
        
        # Sort by similarity (descending)
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        logger.info(f"   Stage 3 (advanced): {len(results)} matches")
        
        return results[:limit]
    
    def _trigram_search(
        self,
        normalized_name: str,
        user_id: str,
        category: Optional[str],
        threshold: float,
        limit: int
    ) -> List[Dict]:
        """
        PostgreSQL trigram similarity search
        
        Uses pg_trgm extension for fast pre-filtering
        """
        try:
            # Use Supabase client methods only (no raw SQL to prevent injection)
            # Note: Supabase client doesn't support similarity() directly
            # We'll fetch more results and filter in Python
            
            # Execute via Supabase RPC (if available) or direct query
            # For now, use table query with ilike as fallback
            result = self.client.table("inventory_items").select(
                "id, name, normalized_name, category, unit_of_measure, current_quantity, last_purchase_price"
            ).eq("user_id", user_id)
            
            if category:
                result = result.eq("category", category)
            
            # Note: Supabase client doesn't support similarity() directly
            # We'll fetch more results and filter in Python
            result = result.limit(limit * 3).execute()
            
            # Filter by simple similarity
            candidates = []
            for item in result.data:
                sim = self.calculator.calculate_simple_similarity(
                    normalized_name,
                    item['normalized_name']
                )
                if sim > threshold:
                    item['trigram_similarity'] = sim
                    candidates.append(item)
            
            # Sort by similarity
            candidates.sort(key=lambda x: x.get('trigram_similarity', 0), reverse=True)
            
            return candidates[:limit]
            
        except Exception as e:
            logger.error(f"Trigram search failed: {e}")
            return []
    
    def calculate_similarity(self, target_item: Dict, candidate_item: Dict) -> float:
        """
        Calculate detailed similarity score
        
        Args:
            target_item: Item to match (must have 'name' or 'normalized_name')
            candidate_item: Candidate item from database
        
        Returns:
            Similarity score 0.0 to 1.0
        """
        return self.calculator.calculate_advanced_similarity(target_item, candidate_item)
    
    def find_best_match(
        self,
        target_item: Dict,
        user_id: str
    ) -> Optional[Dict]:
        """
        Find best matching item above confidence threshold
        
        Args:
            target_item: Item to match (must have 'name', 'category')
            user_id: User ID
        
        Returns:
            Best match with similarity score, or None if no good match
        """
        target_name = target_item.get('name', '')
        category = target_item.get('category')
        
        if not target_name:
            return None
        
        # Find similar items
        similar_items = self.find_similar_items(
            target_name=target_name,
            user_id=user_id,
            category=category,
            threshold=self.config.THRESHOLDS['trigram_filter'],
            limit=10
        )
        
        if not similar_items:
            return None
        
        # Get best match
        best_match = similar_items[0]
        
        # Check if it meets minimum threshold
        if best_match['similarity_score'] >= self.config.THRESHOLDS['review_match']:
            return best_match
        
        return None
    
    def get_match_recommendation(self, similarity_score: float) -> Dict:
        """
        Get match recommendation based on similarity score
        
        Returns:
            {
                'action': 'auto_match' | 'review' | 'create_new',
                'confidence': 'high' | 'medium' | 'low',
                'needs_review': bool
            }
        """
        if similarity_score >= self.config.THRESHOLDS['auto_match']:
            return {
                'action': 'auto_match',
                'confidence': 'high',
                'needs_review': False
            }
        elif similarity_score >= self.config.THRESHOLDS['review_match']:
            return {
                'action': 'review',
                'confidence': 'medium',
                'needs_review': True
            }
        else:
            return {
                'action': 'create_new',
                'confidence': 'low',
                'needs_review': False
            }
