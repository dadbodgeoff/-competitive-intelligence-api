"""
Text Normalization for Fuzzy Matching
Preprocessing pipeline for item names
"""
import re
from typing import List, Optional, Tuple
from decimal import Decimal
from .match_config import MatchConfig


class TextNormalizer:
    """Text preprocessing for fuzzy matching"""
    
    def __init__(self):
        self.config = MatchConfig()
    
    def normalize_text(self, text: str) -> str:
        """
        Complete normalization pipeline
        
        Steps:
        1. Lowercase
        2. Remove brand names
        3. Normalize units
        4. Remove extra whitespace
        5. Remove punctuation
        """
        if not text:
            return ""
        
        # Lowercase
        normalized = text.lower().strip()
        
        # Remove brand names (common vendors)
        normalized = self.remove_brand_names(normalized)
        
        # Normalize units
        normalized = self.normalize_units(normalized)
        
        # Remove punctuation except spaces and hyphens
        normalized = re.sub(r'[^\w\s-]', ' ', normalized)
        
        # Remove extra whitespace
        normalized = ' '.join(normalized.split())
        
        return normalized
    
    def remove_brand_names(self, text: str) -> str:
        """Remove vendor/brand names from text"""
        brand_patterns = [
            r'\bsysco\b',
            r'\bus foods\b',
            r'\busf\b',
            r'\bperformance\b',
            r'\bimperial\b',
            r'\bsupreme\b',
            r'\bclassic\b',
            r'\bnatural\b',
            r'\bpremium\b',
            r'\bselect\b',
            r'\bchoice\b',
            r'\bprime\b'
        ]
        
        for pattern in brand_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        return text
    
    def normalize_units(self, text: str) -> str:
        """Standardize unit names"""
        for unit_variant, standard_unit in self.config.UNIT_MAP.items():
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(unit_variant) + r'\b'
            text = re.sub(pattern, standard_unit, text, flags=re.IGNORECASE)
        
        return text
    
    def extract_size(self, text: str) -> Optional[Decimal]:
        """
        Extract quantity in grams (or ml for liquids)
        
        Returns:
            Size in grams/ml, or None if not found
        """
        text_lower = text.lower()
        
        for pattern in self.config.SIZE_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                quantity = Decimal(match.group(1))
                unit = match.group(2)
                
                # Normalize unit
                normalized_unit = self.config.UNIT_MAP.get(unit, unit)
                
                # Convert to grams
                conversion = self.config.UNIT_TO_GRAMS.get(normalized_unit)
                if conversion:
                    return quantity * Decimal(str(conversion))
        
        return None
    
    def tokenize(self, text: str) -> List[str]:
        """
        Split into tokens, filter stopwords
        
        Returns:
            List of meaningful tokens
        """
        # Normalize first
        normalized = self.normalize_text(text)
        
        # Split on whitespace and hyphens
        tokens = re.split(r'[\s-]+', normalized)
        
        # Filter stopwords and short tokens
        filtered = [
            token for token in tokens
            if token and
            token not in self.config.CUSTOM_STOPWORDS and
            len(token) >= 2
        ]
        
        return filtered
    
    def extract_salient_words(self, text: str) -> List[str]:
        """
        Extract salient (distinctive) words for quick filtering
        
        Returns:
            List of salient words (length >= 3, not stopwords)
        """
        tokens = self.tokenize(text)
        
        salient = [
            token for token in tokens
            if len(token) >= self.config.SALIENT_WORD_MIN_LENGTH
        ]
        
        return salient
    
    def extract_core_product(self, text: str) -> str:
        """
        Extract core product name (remove size, packaging, etc.)
        
        Example: "Chicken Breast Boneless 10 lb" → "chicken breast"
        """
        # Remove size information
        text_no_size = re.sub(r'\d+(?:\.\d+)?\s*(?:lb|oz|kg|g|ga|qt|l)', '', text, flags=re.IGNORECASE)
        
        # Normalize
        normalized = self.normalize_text(text_no_size)
        
        # Take first 2-3 meaningful words
        tokens = self.tokenize(normalized)
        core_tokens = tokens[:3] if len(tokens) >= 3 else tokens
        
        return ' '.join(core_tokens)
