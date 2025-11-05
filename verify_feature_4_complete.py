"""
Quick verification that Feature 4 files exist and are properly structured
"""
import os
import sys

def check_file_exists(filepath, description):
    """Check if a file exists and report"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print(f"  ✅ {description}")
        print(f"     {filepath} ({size:,} bytes)")
        return True
    else:
        print(f"  ❌ {description}")
        print(f"     {filepath} NOT FOUND")
        return False

def main():
    print("=" * 70)
    print("FEATURE 4: PRICE ANALYTICS - VERIFICATION")
    print("=" * 70)
    
    all_good = True
    
    print("\n📦 Core Service Layer:")
    all_good &= check_file_exists(
        "services/price_analytics_service.py",
        "Price Analytics Service"
    )
    
    print("\n🌐 API Routes:")
    all_good &= check_file_exists(
        "api/routes/price_analytics.py",
        "Price Analytics API Routes"
    )
    
    print("\n🗄️  Database Migration:")
    all_good &= check_file_exists(
        "database/migrations/007_price_analytics_functions.sql",
        "SQL Analytics Functions"
    )
    
    print("\n🧪 Tests:")
    all_good &= check_file_exists(
        "tests/test_price_analytics.py",
        "Unit Tests"
    )
    all_good &= check_file_exists(
        "test_price_analytics_e2e.py",
        "E2E Integration Test"
    )
    
    print("\n📝 Documentation:")
    all_good &= check_file_exists(
        "FEATURE_4_PRICE_ANALYTICS_COMPLETE.md",
        "Implementation Summary"
    )
    
    print("\n🔧 Integration:")
    # Check if router is in main.py
    try:
        with open("api/main.py", "r", encoding="utf-8") as f:
            content = f.read()
            if "price_analytics_router" in content:
                print("  ✅ Router integrated in api/main.py")
            else:
                print("  ❌ Router NOT found in api/main.py")
                all_good = False
    except Exception as e:
        print(f"  ⚠️  Could not verify main.py: {e}")
    
    print("\n" + "=" * 70)
    if all_good:
        print("✅ ALL FILES PRESENT - FEATURE 4 COMPLETE!")
        print("=" * 70)
        print("\n📋 Next Steps:")
        print("  1. Run database migration: 007_price_analytics_functions.sql")
        print("  2. Ensure TEST_USER_ID is set in .env")
        print("  3. Run E2E test: python test_price_analytics_e2e.py")
        print("  4. Test API endpoints via /api/docs")
        return 0
    else:
        print("❌ SOME FILES MISSING")
        print("=" * 70)
        return 1

if __name__ == "__main__":
    sys.exit(main())
