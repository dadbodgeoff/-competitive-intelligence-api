"""
Fuzzy Matching Module for Inventory Item Deduplication

This module provides production-grade fuzzy matching to automatically
deduplicate inventory items across vendors and enable cross-vendor price comparison.
"""

from .fuzzy_item_matcher import FuzzyItemMatcher
from .similarity_calculator import SimilarityCalculator
from .text_normalizer import TextNormalizer
from .match_config import MatchConfig

__all__ = [
    'FuzzyItemMatcher',
    'SimilarityCalculator',
    'TextNormalizer',
    'MatchConfig'
]
