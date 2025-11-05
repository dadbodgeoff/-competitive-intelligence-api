#!/usr/bin/env python3
"""
Simple verification that security fixes are in place
"""

def check_file_changes():
    """Check that the security fixes are present in the code"""
    print("🔍 VERIFYING SECURITY FIXES IN CODE")
    print("=" * 50)
    
    fixes_verified = 0
    total_fixes = 0
    
    # Check 1: User ID filter in invoice storage
    total_fixes += 1
    try:
        with open("services/invoice_storage_service.py", "r") as f:
            content = f.read()
            if '.eq("user_id", user_id).execute()' in content:
                print("✅ Invoice storage now filters by user_id")
                fixes_verified += 1
            else:
                print("❌ Invoice storage missing user_id filter")
    except Exception as e:
        print(f"❌ Could not check invoice storage: {e}")
    
    # Check 2: Authentication on tier comparison
    total_fixes += 1
    try:
        with open("api/routes/tier_analysis.py", "r") as f:
            content = f.read()
            if 'async def get_tier_comparison(current_user: str = Depends(get_current_user))' in content:
                print("✅ Tier comparison endpoint now requires authentication")
                fixes_verified += 1
            else:
                print("❌ Tier comparison endpoint missing authentication")
    except Exception as e:
        print(f"❌ Could not check tier analysis: {e}")
    
    # Check 3: Authentication on subscription tiers
    total_fixes += 1
    try:
        with open("api/routes/subscription.py", "r") as f:
            content = f.read()
            if 'async def get_available_tiers(current_user: str = Depends(get_current_user))' in content:
                print("✅ Subscription tiers endpoint now requires authentication")
                fixes_verified += 1
            else:
                print("❌ Subscription tiers endpoint missing authentication")
    except Exception as e:
        print(f"❌ Could not check subscription routes: {e}")
    
    # Check 4: Decimal precision in price analytics
    total_fixes += 1
    try:
        with open("services/price_analytics_service.py", "r") as f:
            content = f.read()
            if 'Decimal(str(item[\'unit_price\']))' in content:
                print("✅ Price analytics now uses Decimal precision")
                fixes_verified += 1
            else:
                print("❌ Price analytics still using float precision")
    except Exception as e:
        print(f"❌ Could not check price analytics: {e}")
    
    # Check 5: Decimal precision in invoice storage
    total_fixes += 1
    try:
        with open("services/invoice_storage_service.py", "r") as f:
            content = f.read()
            if 'Decimal(str(item[\'quantity\']))' in content:
                print("✅ Invoice storage now uses Decimal precision")
                fixes_verified += 1
            else:
                print("❌ Invoice storage still using float precision")
    except Exception as e:
        print(f"❌ Could not check invoice storage precision: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 SECURITY FIXES VERIFICATION: {fixes_verified}/{total_fixes} APPLIED")
    
    if fixes_verified == total_fixes:
        print("✅ ALL CRITICAL SECURITY FIXES HAVE BEEN APPLIED!")
        print("\n🛡️ Your system is now significantly more secure:")
        print("  • User data is properly isolated")
        print("  • API endpoints require authentication") 
        print("  • Financial calculations maintain precision")
        print("\n📋 Next steps:")
        print("  1. Test with actual user login")
        print("  2. Upload a test invoice to verify calculations")
        print("  3. Rotate API keys in production .env")
    else:
        print(f"⚠️  {total_fixes - fixes_verified} fixes still need attention")
    
    return fixes_verified == total_fixes

def check_decimal_import():
    """Check that Decimal is properly imported"""
    print("\n💰 CHECKING DECIMAL IMPORTS")
    print("-" * 30)
    
    files_to_check = [
        "services/price_analytics_service.py",
        "services/invoice_storage_service.py"
    ]
    
    for file_path in files_to_check:
        try:
            with open(file_path, "r") as f:
                content = f.read()
                if "from decimal import Decimal" in content:
                    print(f"✅ {file_path} imports Decimal")
                else:
                    print(f"❌ {file_path} missing Decimal import")
        except Exception as e:
            print(f"❌ Could not check {file_path}: {e}")

if __name__ == "__main__":
    success = check_file_changes()
    check_decimal_import()
    
    if success:
        print("\n🚀 READY FOR TESTING!")
        print("Your security fixes are in place and ready to test.")
    else:
        print("\n⚠️  ADDITIONAL FIXES NEEDED")
        print("Some security issues still need to be addressed.")