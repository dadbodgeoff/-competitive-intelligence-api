"""
Fuzzy Matching Configuration
Thresholds and weights for similarity matching
"""


class MatchConfig:
    """Configuration for fuzzy matching algorithm"""
    
    # Similarity component weights (must sum to 1.0)
    WEIGHTS = {
        'name_similarity': 0.55,      # Trigram cosine similarity
        'token_similarity': 0.25,     # Weighted Jaccard
        'size_similarity': 0.15,      # Quantity-based matching
        'category_similarity': 0.05   # Category match bonus
    }
    
    # Confidence thresholds
    THRESHOLDS = {
        'auto_match': 0.95,       # Auto-match items (very high confidence) - Raised from 0.88 to prevent duplicates
        'review_match': 0.85,     # Suggest for review (high confidence) - Raised from 0.80
        'min_similarity': 0.70,   # Minimum to consider as candidate
        'trigram_filter': 0.3     # PostgreSQL trigram pre-filter
    }
    
    # Text processing
    SALIENT_WORD_MIN_LENGTH = 3
    MAX_CANDIDATES = 50
    
    # Stopwords (domain-specific for food service)
    CUSTOM_STOPWORDS = {
        # Common words
        'the', 'and', 'or', 'with', 'of', 'in', 'a', 'an',
        # Quality descriptors (not distinctive)
        'boneless', 'bnls', 'iqf', 'case', 'fresh', 'frozen',
        'organic', 'free-range', 'grass-fed', 'local', 'bulk',
        'premium', 'select', 'choice', 'prime',
        # Vendor names (should be removed)
        'sysco', 'us foods', 'usf', 'brand',
        # Package terms
        'pack', 'pkg', 'box', 'bag'
    }
    
    # Unit normalization map
    UNIT_MAP = {
        # Weight
        'lb': 'pound', 'lbs': 'pound', 'pound': 'pound', 'pounds': 'pound',
        'oz': 'ounce', 'ounce': 'ounce', 'ounces': 'ounce',
        'kg': 'kilogram', 'kilogram': 'kilogram',
        'g': 'gram', 'gram': 'gram', 'grams': 'gram',
        # Volume
        'ga': 'gallon', 'gal': 'gallon', 'gallon': 'gallon', 'gallons': 'gallon',
        'qt': 'quart', 'quart': 'quart', 'quarts': 'quart',
        'pt': 'pint', 'pint': 'pint', 'pints': 'pint',
        'l': 'liter', 'lt': 'liter', 'liter': 'liter', 'liters': 'liter',
        'ml': 'milliliter', 'milliliter': 'milliliter',
        # Count
        'ea': 'each', 'each': 'each',
        'pc': 'each', 'pcs': 'each', 'piece': 'each', 'pieces': 'each',
        'ct': 'count', 'count': 'count',
        'dz': 'dozen', 'dozen': 'dozen'
    }
    
    # Size extraction patterns (regex)
    SIZE_PATTERNS = [
        r'(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds)',
        r'(\d+(?:\.\d+)?)\s*(oz|ounce|ounces)',
        r'(\d+(?:\.\d+)?)\s*(kg|kilogram)',
        r'(\d+(?:\.\d+)?)\s*(g|gram|grams)',
        r'(\d+(?:\.\d+)?)\s*(ga|gal|gallon)',
        r'(\d+(?:\.\d+)?)\s*(qt|quart)',
        r'(\d+(?:\.\d+)?)\s*(l|lt|liter)',
    ]
    
    # Conversion to grams (for size comparison)
    UNIT_TO_GRAMS = {
        'pound': 453.592,
        'ounce': 28.3495,
        'kilogram': 1000.0,
        'gram': 1.0,
        'gallon': 3785.41,  # ml
        'quart': 946.353,   # ml
        'liter': 1000.0,    # ml
        'milliliter': 1.0,
        'each': None,       # Not convertible
        'count': None,
        'dozen': None
    }
