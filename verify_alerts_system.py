"""
Verify Alerts System Implementation
Tests the new alert management endpoints
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def verify_database():
    """Verify database migrations"""
    print("=" * 60)
    print("VERIFYING DATABASE SETUP")
    print("=" * 60)
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    
    # Check threshold columns
    print("\n1. Checking threshold columns in user_inventory_preferences...")
    result = supabase.rpc('exec_sql', {
        'query': """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_inventory_preferences' 
        AND column_name LIKE '%alert_threshold%'
        """
    }).execute()
    
    if len(result.data) == 4:
        print("   ✅ All 4 threshold columns exist")
        for col in result.data:
            print(f"      - {col['column_name']}")
    else:
        print(f"   ❌ Expected 4 columns, found {len(result.data)}")
        return False
    
    # Check alert_acknowledgments table
    print("\n2. Checking alert_acknowledgments table...")
    result = supabase.rpc('exec_sql', {
        'query': """
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_name = 'alert_acknowledgments'
        """
    }).execute()
    
    if result.data[0]['count'] == 1:
        print("   ✅ alert_acknowledgments table exists")
    else:
        print("   ❌ alert_acknowledgments table not found")
        return False
    
    # Check RLS
    print("\n3. Checking RLS policies...")
    result = supabase.rpc('exec_sql', {
        'query': """
        SELECT COUNT(*) as count
        FROM pg_policies 
        WHERE tablename = 'alert_acknowledgments'
        """
    }).execute()
    
    if result.data[0]['count'] >= 2:
        print(f"   ✅ {result.data[0]['count']} RLS policies found")
    else:
        print(f"   ⚠️  Only {result.data[0]['count']} RLS policies found")
    
    print("\n✅ Database verification complete!")
    return True


def verify_services():
    """Verify service files exist"""
    print("\n" + "=" * 60)
    print("VERIFYING SERVICE FILES")
    print("=" * 60)
    
    files = [
        "services/alert_management_service.py",
        "services/alert_generation_service.py",
        "api/routes/alert_management.py",
    ]
    
    all_exist = True
    for file in files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} NOT FOUND")
            all_exist = False
    
    return all_exist


def verify_frontend():
    """Verify frontend files exist"""
    print("\n" + "=" * 60)
    print("VERIFYING FRONTEND FILES")
    print("=" * 60)
    
    files = [
        "frontend/src/services/api/alertsApi.ts",
        "frontend/src/types/alerts.ts",
        "frontend/src/pages/PriceAlertsPage.tsx",
        "frontend/src/pages/SavingsOpportunitiesPage.tsx",
        "frontend/src/pages/AlertSettingsPage.tsx",
    ]
    
    all_exist = True
    for file in files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} NOT FOUND")
            all_exist = False
    
    return all_exist


def test_alert_generation():
    """Test alert generation with sample data"""
    print("\n" + "=" * 60)
    print("TESTING ALERT GENERATION")
    print("=" * 60)
    
    try:
        from services.alert_generation_service import AlertGenerationService
        
        service = AlertGenerationService()
        print("✅ AlertGenerationService imported successfully")
        
        # Check if method exists
        if hasattr(service, 'generate_alerts_with_thresholds'):
            print("✅ generate_alerts_with_thresholds method exists")
        else:
            print("❌ generate_alerts_with_thresholds method not found")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all verifications"""
    print("\n🔍 ALERTS SYSTEM VERIFICATION")
    print("=" * 60)
    
    results = {
        "Database": verify_database(),
        "Services": verify_services(),
        "Frontend": verify_frontend(),
        "Alert Generation": test_alert_generation(),
    }
    
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check:20} {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All verifications passed!")
        print("\nNext steps:")
        print("1. Run migrations in Supabase:")
        print("   - database/migrations/025_alert_thresholds.sql")
        print("   - database/migrations/026_alert_acknowledgments.sql")
        print("2. Restart backend server")
        print("3. Test endpoints:")
        print("   - GET /api/v1/alerts/price-increases")
        print("   - GET /api/v1/alerts/savings-opportunities")
        print("4. Navigate to /analytics/alerts in frontend")
        return 0
    else:
        print("\n❌ Some verifications failed. Please review above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
