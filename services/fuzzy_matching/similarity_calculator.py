"""
Similarity Calculator
Multi-factor similarity algorithm for inventory item matching
"""
import re
from typing import Dict, List, Set, Optional
from decimal import Decimal
import math

try:
    import Levenshtein
    HAS_LEVENSHTEIN = True
except ImportError:
    HAS_LEVENSHTEIN = False

try:
    import jellyfish
    HAS_JELLYFISH = True
except ImportError:
    HAS_JELLYFISH = False

from .text_normalizer import TextNormalizer
from .match_config import MatchConfig


class SimilarityCalculator:
    """Calculate multi-factor similarity between inventory items"""
    
    def __init__(self):
        self.normalizer = TextNormalizer()
        self.config = MatchConfig()
    
    def calculate_advanced_similarity(self, item1: Dict, item2: Dict) -> float:
        """
        Multi-factor weighted similarity
        
        Components:
        - 55% name similarity (trigram cosine)
        - 25% token similarity (weighted Jaccard)
        - 15% size similarity (quantity-based)
        - 5% category similarity
        
        Returns:
            Similarity score 0.0 to 1.0
        """
        # Extract fields
        name1 = item1.get('name', '') or item1.get('normalized_name', '')
        name2 = item2.get('name', '') or item2.get('normalized_name', '')
        
        category1 = item1.get('category', '')
        category2 = item2.get('category', '')
        
        # Calculate components
        name_sim = self.trigram_cosine_similarity(name1, name2)
        token_sim = self.weighted_jaccard_similarity(
            self.normalizer.tokenize(name1),
            self.normalizer.tokenize(name2)
        )
        
        # Size similarity
        size1 = self.normalizer.extract_size(name1)
        size2 = self.normalizer.extract_size(name2)
        size_sim = self.size_similarity(size1, size2)
        
        # Category similarity
        cat_sim = 1.0 if category1 == category2 else 0.0
        
        # Weighted combination
        total_similarity = (
            self.config.WEIGHTS['name_similarity'] * name_sim +
            self.config.WEIGHTS['token_similarity'] * token_sim +
            self.config.WEIGHTS['size_similarity'] * size_sim +
            self.config.WEIGHTS['category_similarity'] * cat_sim
        )
        
        return round(total_similarity, 4)
    
    def trigram_cosine_similarity(self, text1: str, text2: str) -> float:
        """
        Character-level trigram cosine similarity
        
        More robust than simple string distance for typos and variations
        """
        if not text1 or not text2:
            return 0.0
        
        # Normalize
        text1 = self.normalizer.normalize_text(text1)
        text2 = self.normalizer.normalize_text(text2)
        
        if text1 == text2:
            return 1.0
        
        # Use Levenshtein if available (faster)
        if HAS_LEVENSHTEIN:
            ratio = Levenshtein.ratio(text1, text2)
            return ratio
        
        # Fallback: trigram cosine
        trigrams1 = self._get_trigrams(text1)
        trigrams2 = self._get_trigrams(text2)
        
        if not trigrams1 or not trigrams2:
            return 0.0
        
        # Cosine similarity
        intersection = trigrams1 & trigrams2
        if not intersection:
            return 0.0
        
        numerator = len(intersection)
        denominator = math.sqrt(len(trigrams1) * len(trigrams2))
        
        return numerator / denominator if denominator > 0 else 0.0
    
    def _get_trigrams(self, text: str) -> Set[str]:
        """Extract character trigrams from text"""
        # Add padding
        padded = f"  {text}  "
        trigrams = set()
        
        for i in range(len(padded) - 2):
            trigrams.add(padded[i:i+3])
        
        return trigrams
    
    def weighted_jaccard_similarity(self, tokens1: List[str], tokens2: List[str]) -> float:
        """
        Token-level similarity with stopword weighting
        
        Salient words (longer, distinctive) get higher weight
        """
        if not tokens1 or not tokens2:
            return 0.0
        
        set1 = set(tokens1)
        set2 = set(tokens2)
        
        if set1 == set2:
            return 1.0
        
        # Weight tokens by length (longer = more distinctive)
        def token_weight(token: str) -> float:
            if len(token) >= 5:
                return 2.0
            elif len(token) >= 3:
                return 1.5
            else:
                return 1.0
        
        # Weighted intersection
        intersection = set1 & set2
        weighted_intersection = sum(token_weight(t) for t in intersection)
        
        # Weighted union
        union = set1 | set2
        weighted_union = sum(token_weight(t) for t in union)
        
        if weighted_union == 0:
            return 0.0
        
        return weighted_intersection / weighted_union
    
    def size_similarity(self, size1: Optional[Decimal], size2: Optional[Decimal]) -> float:
        """
        Quantity-based matching with tolerance bands
        
        Returns:
            1.0 if sizes match within tolerance
            0.5 if sizes are close
            0.0 if sizes are very different or missing
        """
        # If either size is missing, neutral score
        if size1 is None or size2 is None:
            return 0.5
        
        # Exact match
        if size1 == size2:
            return 1.0
        
        # Calculate ratio
        ratio = float(min(size1, size2) / max(size1, size2))
        
        # Tolerance bands
        if ratio >= 0.95:  # Within 5%
            return 1.0
        elif ratio >= 0.85:  # Within 15%
            return 0.8
        elif ratio >= 0.70:  # Within 30%
            return 0.5
        elif ratio >= 0.50:  # Within 50%
            return 0.3
        else:
            return 0.0
    
    def has_salient_overlap(self, tokens1: List[str], tokens2: List[str]) -> bool:
        """
        Quick pre-filter: do items share any salient words?
        
        Returns:
            True if items share at least one distinctive word
        """
        # Extract salient words (length >= 3)
        salient1 = {t for t in tokens1 if len(t) >= self.config.SALIENT_WORD_MIN_LENGTH}
        salient2 = {t for t in tokens2 if len(t) >= self.config.SALIENT_WORD_MIN_LENGTH}
        
        if not salient1 or not salient2:
            return False
        
        # Check for overlap
        overlap = salient1 & salient2
        return len(overlap) > 0
    
    def calculate_simple_similarity(self, text1: str, text2: str) -> float:
        """
        Simple text similarity (for quick checks)
        
        Uses Levenshtein ratio if available, else trigram
        """
        if not text1 or not text2:
            return 0.0
        
        text1 = self.normalizer.normalize_text(text1)
        text2 = self.normalizer.normalize_text(text2)
        
        if text1 == text2:
            return 1.0
        
        if HAS_LEVENSHTEIN:
            return Levenshtein.ratio(text1, text2)
        
        return self.trigram_cosine_similarity(text1, text2)
