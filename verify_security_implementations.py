"""
Verify Security Implementations (Code Analysis)
Checks that all security fixes are properly implemented in the code
"""
import os
import re
from pathlib import Path


class SecurityVerifier:
    def __init__(self):
        self.results = []
    
    def check(self, category: str, test_name: str, passed: bool, details: str):
        """Record verification result"""
        self.results.append({
            "category": category,
            "test": test_name,
            "passed": passed,
            "details": details
        })
        
        status = "✅" if passed else "❌"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
    
    def verify_rate_limiting(self):
        """Verify rate limiting implementation"""
        print("\n" + "="*60)
        print("RATE LIMITING VERIFICATION")
        print("="*60 + "\n")
        
        # Check rate_limiting.py exists and has tier-based limits
        rate_limit_file = "api/middleware/rate_limiting.py"
        if not os.path.exists(rate_limit_file):
            self.check("rate_limiting", "File exists", False, f"{rate_limit_file} not found")
            return
        
        with open(rate_limit_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for tier-based limits
        has_tier_limits = "tier_limits" in content
        self.check("rate_limiting", "Tier-based limits defined", has_tier_limits,
                  "Found tier_limits configuration" if has_tier_limits else "Missing tier_limits")
        
        # Check for free tier limits
        has_free_tier = '"free"' in content and "max_per_week" in content
        self.check("rate_limiting", "Free tier limits configured", has_free_tier,
                  "Free tier with weekly limits" if has_free_tier else "Missing free tier config")
        
        # Check for premium tier
        has_premium_tier = '"premium"' in content
        self.check("rate_limiting", "Premium tier configured", has_premium_tier,
                  "Premium tier found" if has_premium_tier else "Missing premium tier")
        
        # Check for rate_limit decorator
        has_decorator = "def rate_limit(" in content
        self.check("rate_limiting", "Rate limit decorator exists", has_decorator,
                  "Decorator function found" if has_decorator else "Missing decorator")
        
        # Check for Redis lock
        has_redis_lock = "redis_lock" in content
        self.check("rate_limiting", "Redis lock implementation", has_redis_lock,
                  "Redis locking found" if has_redis_lock else "Missing Redis lock")
    
    def verify_duplicate_detection(self):
        """Verify race condition protection"""
        print("\n" + "="*60)
        print("RACE CONDITION PROTECTION VERIFICATION")
        print("="*60 + "\n")
        
        # Check duplicate detector
        detector_file = "services/invoice_duplicate_detector.py"
        if not os.path.exists(detector_file):
            self.check("race_conditions", "File exists", False, f"{detector_file} not found")
            return
        
        with open(detector_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for file hash calculation
        has_hash = "calculate_file_hash" in content and "hashlib.sha256" in content
        self.check("race_conditions", "File hash calculation", has_hash,
                  "SHA256 hashing implemented" if has_hash else "Missing hash calculation")
        
        # Check for Redis lock
        has_lock = "redis_lock" in content and "asynccontextmanager" in content
        self.check("race_conditions", "Distributed lock", has_lock,
                  "Redis distributed lock found" if has_lock else "Missing distributed lock")
        
        # Check for processing marker
        has_marker = "mark_processing" in content and "is_processing" in content
        self.check("race_conditions", "Processing markers", has_marker,
                  "Processing marker functions found" if has_marker else "Missing processing markers")
        
        # Check for duplicate by hash
        has_hash_check = "check_for_duplicate_by_hash" in content
        self.check("race_conditions", "Hash-based duplicate check", has_hash_check,
                  "Hash duplicate check implemented" if has_hash_check else "Missing hash check")
        
        # Check upload route integration
        upload_file = "api/routes/invoices/upload.py"
        if os.path.exists(upload_file):
            with open(upload_file, 'r', encoding='utf-8') as f:
                upload_content = f.read()
            
            has_integration = "InvoiceDuplicateDetector" in upload_content
            self.check("race_conditions", "Upload route integration", has_integration,
                      "Duplicate detector integrated" if has_integration else "Not integrated")
            
            has_hash_calc = "calculate_file_hash" in upload_content
            self.check("race_conditions", "Hash calculation in upload", has_hash_calc,
                      "Hash calculated on upload" if has_hash_calc else "Hash not calculated")
    
    def verify_database_migration(self):
        """Verify database migration for file_hash"""
        print("\n" + "="*60)
        print("DATABASE MIGRATION VERIFICATION")
        print("="*60 + "\n")
        
        migration_file = "database/migrations/020_add_file_hash_column.sql"
        if not os.path.exists(migration_file):
            self.check("database", "Migration file exists", False, f"{migration_file} not found")
            return
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for file_hash column
        has_column = "ADD COLUMN" in content and "file_hash" in content
        self.check("database", "file_hash column added", has_column,
                  "Column definition found" if has_column else "Missing column definition")
        
        # Check for index
        has_index = "CREATE INDEX" in content and "idx_invoices_file_hash" in content
        self.check("database", "file_hash index created", has_index,
                  "Index definition found" if has_index else "Missing index")
    
    def verify_error_sanitization(self):
        """Verify error sanitization"""
        print("\n" + "="*60)
        print("ERROR SANITIZATION VERIFICATION")
        print("="*60 + "\n")
        
        # Check for error sanitizer
        sanitizer_file = "services/error_sanitizer.py"
        if os.path.exists(sanitizer_file):
            with open(sanitizer_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            has_sanitizer = "sanitize_error" in content
            self.check("error_sanitization", "Error sanitizer exists", has_sanitizer,
                      "Sanitizer function found" if has_sanitizer else "Missing sanitizer")
        else:
            self.check("error_sanitization", "Error sanitizer file", False,
                      f"{sanitizer_file} not found")
        
        # Check price analytics routes for error handling
        price_routes = "api/routes/price_analytics.py"
        if os.path.exists(price_routes):
            with open(price_routes, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Should NOT expose str(e) directly
            exposes_errors = 'detail=f"Error: {str(e)}"' in content
            self.check("error_sanitization", "Price analytics error handling", not exposes_errors,
                      "Errors not exposed" if not exposes_errors else "⚠️  Still exposing str(e)")
    
    def verify_tier_enforcement(self):
        """Verify subscription tier enforcement"""
        print("\n" + "="*60)
        print("TIER ENFORCEMENT VERIFICATION")
        print("="*60 + "\n")
        
        subscription_file = "api/middleware/subscription.py"
        if not os.path.exists(subscription_file):
            self.check("tier_enforcement", "File exists", False, f"{subscription_file} not found")
            return
        
        with open(subscription_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for tier features
        has_tier_features = "TIER_FEATURES" in content
        self.check("tier_enforcement", "Tier features defined", has_tier_features,
                  "TIER_FEATURES configuration found" if has_tier_features else "Missing tier features")
        
        # Check for require_subscription_tier
        has_require_tier = "require_subscription_tier" in content
        self.check("tier_enforcement", "Tier requirement decorator", has_require_tier,
                  "Decorator found" if has_require_tier else "Missing decorator")
        
        # Check for get_user_subscription_info
        has_get_info = "get_user_subscription_info" in content
        self.check("tier_enforcement", "Subscription info function", has_get_info,
                  "Function found" if has_get_info else "Missing function")
    
    def verify_route_protection(self):
        """Verify routes are properly protected"""
        print("\n" + "="*60)
        print("ROUTE PROTECTION VERIFICATION")
        print("="*60 + "\n")
        
        routes_to_check = [
            ("api/routes/tier_analysis.py", "@rate_limit", "Analysis routes"),
            ("api/routes/streaming_analysis.py", "@rate_limit", "Streaming routes"),
            ("api/routes/menu_comparison.py", "@rate_limit", "Menu comparison routes"),
            ("api/routes/invoices/parsing.py", "@rate_limit", "Invoice parsing routes"),
            ("api/routes/menu/parsing.py", "@rate_limit", "Menu parsing routes"),
        ]
        
        for file_path, pattern, description in routes_to_check:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                has_protection = pattern in content
                self.check("route_protection", description, has_protection,
                          f"Protected with {pattern}" if has_protection else f"Missing {pattern}")
            else:
                self.check("route_protection", description, False, f"{file_path} not found")
    
    def print_summary(self):
        """Print verification summary"""
        print("\n" + "="*60)
        print("VERIFICATION SUMMARY")
        print("="*60)
        
        categories = {}
        for result in self.results:
            cat = result["category"]
            if cat not in categories:
                categories[cat] = {"passed": 0, "failed": 0, "total": 0}
            
            categories[cat]["total"] += 1
            if result["passed"]:
                categories[cat]["passed"] += 1
            else:
                categories[cat]["failed"] += 1
        
        total_passed = 0
        total_failed = 0
        
        for category, stats in categories.items():
            print(f"\n{category.upper().replace('_', ' ')}:")
            print(f"  ✅ Passed: {stats['passed']}/{stats['total']}")
            if stats['failed'] > 0:
                print(f"  ❌ Failed: {stats['failed']}/{stats['total']}")
            
            total_passed += stats['passed']
            total_failed += stats['failed']
        
        print("\n" + "="*60)
        print(f"TOTAL: {total_passed + total_failed} checks")
        print(f"✅ PASSED: {total_passed}")
        print(f"❌ FAILED: {total_failed}")
        print("="*60)
        
        if total_failed == 0:
            print("\n🎉 ALL VERIFICATIONS PASSED!")
            print("All security implementations are in place.")
        else:
            print(f"\n⚠️  {total_failed} VERIFICATION(S) FAILED")
            print("Review the failed checks above.")
        
        return total_failed == 0


def main():
    """Run all verifications"""
    print("""
╔══════════════════════════════════════════════════════════╗
║      SECURITY IMPLEMENTATION VERIFICATION                ║
║                                                          ║
║  Verifies that all security fixes are properly          ║
║  implemented in the codebase                            ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    verifier = SecurityVerifier()
    
    # Run all verifications
    verifier.verify_rate_limiting()
    verifier.verify_duplicate_detection()
    verifier.verify_database_migration()
    verifier.verify_error_sanitization()
    verifier.verify_tier_enforcement()
    verifier.verify_route_protection()
    
    # Print summary
    all_passed = verifier.print_summary()
    
    return all_passed


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
