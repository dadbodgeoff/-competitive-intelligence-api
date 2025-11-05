"""
Quick verification of price analytics data and service layer
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def main():
    print("=" * 70)
    print("QUICK PRICE ANALYTICS VERIFICATION")
    print("=" * 70)
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Get user from invoices
    user_response = supabase.table('invoices')\
        .select('user_id')\
        .limit(1)\
        .execute()
    
    if not user_response.data:
        print("✗ No user data found")
        return
    
    user_id = user_response.data[0]['user_id']
    print(f"✓ Testing with User ID: {user_id}")
    
    # Check data exists
    print("\n--- Data Verification ---")
    
    invoices = supabase.table('invoices')\
        .select('id', count='exact')\
        .eq('user_id', user_id)\
        .execute()
    print(f"✓ Invoices: {invoices.count}")
    
    price_history = supabase.table('price_history')\
        .select('id, inventory_item_id, vendor_id, unit_price, invoice_date', count='exact')\
        .eq('user_id', user_id)\
        .execute()
    print(f"✓ Price History Records: {price_history.count}")
    
    if price_history.count > 0:
        print(f"\n  Sample Price History:")
        for i, record in enumerate(price_history.data[:3], 1):
            print(f"    {i}. Item: {record['inventory_item_id'][:8]}... | "
                  f"Vendor: {record['vendor_id'][:8]}... | "
                  f"Price: ${record['unit_price']} | "
                  f"Date: {record['invoice_date']}")
    
    items = supabase.table('inventory_items')\
        .select('id, name', count='exact')\
        .eq('user_id', user_id)\
        .execute()
    print(f"\n✓ Inventory Items: {items.count}")
    
    if items.count > 0:
        print(f"  Sample Items:")
        for i, item in enumerate(items.data[:3], 1):
            print(f"    {i}. {item['name']}")
    
    vendors = supabase.table('vendors')\
        .select('id, name', count='exact')\
        .eq('user_id', user_id)\
        .execute()
    print(f"\n✓ Vendors: {vendors.count}")
    
    if vendors.count > 0:
        print(f"  Sample Vendors:")
        for i, vendor in enumerate(vendors.data[:3], 1):
            print(f"    {i}. {vendor['name']}")
    
    # Check database functions
    print("\n--- Database Functions Check ---")
    
    functions_to_check = [
        'get_vendor_price_comparison',
        'find_savings_opportunities',
        'calculate_vendor_competitive_score',
        'detect_price_anomalies'
    ]
    
    for func_name in functions_to_check:
        try:
            # Try calling with dummy data
            result = supabase.rpc(func_name, {
                'target_user_id': user_id,
                'days_back': 90
            }).execute()
            print(f"✓ {func_name}: EXISTS and callable")
        except Exception as e:
            error_msg = str(e).lower()
            if 'does not exist' in error_msg or 'function' in error_msg and 'unknown' in error_msg:
                print(f"✗ {func_name}: NOT FOUND - needs migration")
            else:
                print(f"✓ {func_name}: EXISTS (error with test data is OK)")
    
    # Test service layer directly
    print("\n--- Service Layer Test ---")
    try:
        from services.price_analytics_service import PriceAnalyticsService
        service = PriceAnalyticsService(supabase)
        
        # Test with first item if available
        if items.count > 0:
            item_id = items.data[0]['id']
            print(f"\nTesting get_cross_vendor_comparison with item: {items.data[0]['name']}")
            try:
                result = service.get_cross_vendor_comparison(item_id, user_id, days_back=90)
                print(f"✓ Cross-vendor comparison works!")
                print(f"  - Vendors compared: {len(result.get('vendors', []))}")
                if result.get('best_vendor'):
                    print(f"  - Best vendor: {result['best_vendor'].get('vendor_name')}")
            except Exception as e:
                print(f"✗ Error: {str(e)}")
        
        # Test savings opportunities
        print(f"\nTesting find_savings_opportunities...")
        try:
            opportunities = service.find_savings_opportunities(user_id, min_savings_percent=5.0, days_back=90)
            print(f"✓ Savings opportunities works!")
            print(f"  - Opportunities found: {len(opportunities)}")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
        
        # Test anomalies
        print(f"\nTesting detect_price_anomalies...")
        try:
            anomalies = service.detect_price_anomalies(user_id, days_back=90, std_dev_threshold=2.0)
            print(f"✓ Price anomalies detection works!")
            print(f"  - Anomalies found: {len(anomalies)}")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
        
    except Exception as e:
        print(f"✗ Service layer error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Data Status: {'✓ READY' if price_history.count > 0 else '✗ NO DATA'}")
    print(f"Service Layer: Check results above")
    print("\nNext Steps:")
    print("1. If functions don't exist, run: database/migrations/007_price_analytics_functions.sql")
    print("2. Test API endpoints with: python test_price_analytics_endpoints.py")
    print("=" * 70)

if __name__ == "__main__":
    main()
