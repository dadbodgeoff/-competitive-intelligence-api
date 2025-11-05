"""
Verification Script for Fuzzy Matching Installation
Run this to verify the fuzzy matching system is properly installed
"""
import sys
from decimal import Decimal

def test_imports():
    """Test that all modules can be imported"""
    print("Testing imports...")
    try:
        from services.fuzzy_matching import (
            FuzzyItemMatcher,
            SimilarityCalculator,
            TextNormalizer,
            MatchConfig
        )
        print("✅ All modules imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_text_normalization():
    """Test text normalization"""
    print("\nTesting text normalization...")
    try:
        from services.fuzzy_matching import TextNormalizer
        normalizer = TextNormalizer()
        
        # Test basic normalization
        result = normalizer.normalize_text("Chicken Breast Boneless")
        assert "chicken" in result
        assert "breast" in result
        print(f"  ✅ Basic normalization: '{result}'")
        
        # Test size extraction
        size = normalizer.extract_size("Chicken Breast 10 lb")
        assert size is not None
        assert size > 4000  # Should be ~4535 grams
        print(f"  ✅ Size extraction: {size} grams")
        
        # Test tokenization
        tokens = normalizer.tokenize("Chicken Breast Boneless IQF")
        assert "chicken" in tokens
        assert "breast" in tokens
        print(f"  ✅ Tokenization: {tokens}")
        
        return True
    except Exception as e:
        print(f"❌ Text normalization failed: {e}")
        return False

def test_similarity_calculation():
    """Test similarity calculations"""
    print("\nTesting similarity calculations...")
    try:
        from services.fuzzy_matching import SimilarityCalculator
        calculator = SimilarityCalculator()
        
        # Test exact match
        item1 = {"name": "Chicken Breast", "category": "proteins"}
        item2 = {"name": "Chicken Breast", "category": "proteins"}
        sim = calculator.calculate_advanced_similarity(item1, item2)
        assert sim >= 0.90  # Should be very high (1.0 with Levenshtein, ~0.92 without)
        print(f"  ✅ Exact match: {sim:.3f}")
        
        # Test high similarity
        item3 = {"name": "Chicken Breast Boneless", "category": "proteins"}
        item4 = {"name": "Boneless Chicken Breast", "category": "proteins"}
        sim2 = calculator.calculate_advanced_similarity(item3, item4)
        assert sim2 >= 0.85
        print(f"  ✅ High similarity (reordered): {sim2:.3f}")
        
        # Test low similarity
        item5 = {"name": "Chicken Breast", "category": "proteins"}
        item6 = {"name": "Ground Beef", "category": "proteins"}
        sim3 = calculator.calculate_advanced_similarity(item5, item6)
        assert sim3 < 0.50
        print(f"  ✅ Low similarity (different items): {sim3:.3f}")
        
        return True
    except Exception as e:
        print(f"❌ Similarity calculation failed: {e}")
        return False

def test_configuration():
    """Test configuration"""
    print("\nTesting configuration...")
    try:
        from services.fuzzy_matching import MatchConfig
        config = MatchConfig()
        
        # Test weights sum to 1.0
        total = sum(config.WEIGHTS.values())
        assert abs(total - 1.0) < 0.001
        print(f"  ✅ Weights sum to 1.0: {total}")
        
        # Test thresholds are ordered
        assert config.THRESHOLDS['auto_match'] > config.THRESHOLDS['review_match']
        assert config.THRESHOLDS['review_match'] > config.THRESHOLDS['min_similarity']
        print(f"  ✅ Thresholds properly ordered")
        
        # Test stopwords exist
        assert len(config.CUSTOM_STOPWORDS) > 0
        print(f"  ✅ Stopwords configured: {len(config.CUSTOM_STOPWORDS)} words")
        
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_match_recommendations():
    """Test match recommendation logic"""
    print("\nTesting match recommendations...")
    try:
        from services.fuzzy_matching import FuzzyItemMatcher
        matcher = FuzzyItemMatcher()
        
        # High confidence
        rec1 = matcher.get_match_recommendation(0.92)
        assert rec1['action'] == 'auto_match'
        assert rec1['needs_review'] is False
        print(f"  ✅ High confidence (0.92): {rec1['action']}")
        
        # Medium confidence
        rec2 = matcher.get_match_recommendation(0.83)
        assert rec2['action'] == 'review'
        assert rec2['needs_review'] is True
        print(f"  ✅ Medium confidence (0.83): {rec2['action']}")
        
        # Low confidence
        rec3 = matcher.get_match_recommendation(0.65)
        assert rec3['action'] == 'create_new'
        print(f"  ✅ Low confidence (0.65): {rec3['action']}")
        
        return True
    except Exception as e:
        print(f"❌ Match recommendation test failed: {e}")
        return False

def check_dependencies():
    """Check optional dependencies"""
    print("\nChecking optional dependencies...")
    
    try:
        import Levenshtein
        print("  ✅ python-Levenshtein installed (faster similarity)")
    except ImportError:
        print("  ⚠️  python-Levenshtein not installed (will use fallback)")
    
    try:
        import jellyfish
        print("  ✅ jellyfish installed (phonetic algorithms)")
    except ImportError:
        print("  ⚠️  jellyfish not installed (optional)")

def main():
    """Run all verification tests"""
    print("=" * 60)
    print("Fuzzy Matching Installation Verification")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Imports", test_imports()))
    results.append(("Text Normalization", test_text_normalization()))
    results.append(("Similarity Calculation", test_similarity_calculation()))
    results.append(("Configuration", test_configuration()))
    results.append(("Match Recommendations", test_match_recommendations()))
    
    # Check dependencies
    check_dependencies()
    
    # Summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Fuzzy matching is ready to use.")
        print("\nNext steps:")
        print("1. Run database migration: database/migrations/004_fuzzy_matching_setup.sql")
        print("2. Install dependencies: pip install python-Levenshtein jellyfish")
        print("3. Process a test invoice to verify end-to-end")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
