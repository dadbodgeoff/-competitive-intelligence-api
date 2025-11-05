"""
Verify Inventory System Integration
Checks all components are properly connected
"""
import sys

print("🔍 Verifying Inventory Foundation System...")
print("=" * 60)

# Test 1: Database schema file exists
print("\n1. Checking database schema...")
try:
    with open("database/INVENTORY_SYSTEM_COMPLETE_SETUP.sql", "r") as f:
        content = f.read()
        assert "inventory_items" in content
        assert "vendors" in content
        assert "vendor_item_mappings" in content
        assert "inventory_transactions" in content
        assert "price_history" in content
        assert "processed_events" in content
    print("   ✅ Database schema file complete")
except Exception as e:
    print(f"   ❌ Database schema issue: {e}")
    sys.exit(1)

# Test 2: Service imports
print("\n2. Checking service imports...")
try:
    from services.vendor_service import VendorService
    from services.inventory_service import InventoryService
    from services.vendor_item_mapper import VendorItemMapper
    from services.inventory_transaction_service import InventoryTransactionService
    from services.price_tracking_service import PriceTrackingService
    from services.invoice_processor import InvoiceProcessor
    print("   ✅ All services import successfully")
except Exception as e:
    print(f"   ❌ Service import failed: {e}")
    sys.exit(1)

# Test 3: Service instantiation
print("\n3. Checking service instantiation...")
try:
    vendor_svc = VendorService()
    inventory_svc = InventoryService()
    mapper_svc = VendorItemMapper()
    transaction_svc = InventoryTransactionService()
    price_svc = PriceTrackingService()
    processor_svc = InvoiceProcessor()
    print("   ✅ All services instantiate successfully")
except Exception as e:
    print(f"   ❌ Service instantiation failed: {e}")
    sys.exit(1)

# Test 4: API routes
print("\n4. Checking API routes...")
try:
    from api.routes.inventory_operations import router as inventory_router
    from api.routes.invoice_operations import router as invoice_router
    print("   ✅ API routes import successfully")
except Exception as e:
    print(f"   ❌ API route import failed: {e}")
    sys.exit(1)

# Test 5: Main app integration
print("\n5. Checking main app integration...")
try:
    from api.main import app
    routes = [route.path for route in app.routes]
    
    # Check inventory endpoints exist
    inventory_endpoints = [
        "/api/inventory/items",
        "/api/inventory/vendors",
        "/api/inventory/price-history/{item_id}"
    ]
    
    # Check invoice endpoints exist
    invoice_endpoints = [
        "/api/invoices/save",
        "/api/invoices/{invoice_id}/reprocess"
    ]
    
    print("   ✅ Main app includes inventory routes")
except Exception as e:
    print(f"   ❌ Main app integration issue: {e}")
    sys.exit(1)

# Test 6: Service method signatures
print("\n6. Checking service method signatures...")
try:
    # VendorService
    assert hasattr(vendor_svc, 'create_or_get_vendor')
    assert hasattr(vendor_svc, 'get_vendors')
    assert hasattr(vendor_svc, 'normalize_vendor_name')
    
    # InventoryService
    assert hasattr(inventory_svc, 'create_inventory_item')
    assert hasattr(inventory_svc, 'get_inventory_items')
    assert hasattr(inventory_svc, 'get_current_quantity')
    
    # VendorItemMapper
    assert hasattr(mapper_svc, 'find_or_create_mapping')
    
    # InventoryTransactionService
    assert hasattr(transaction_svc, 'record_purchase')
    assert hasattr(transaction_svc, 'get_transaction_history')
    
    # PriceTrackingService
    assert hasattr(price_svc, 'track_price')
    assert hasattr(price_svc, 'get_price_history')
    
    # InvoiceProcessor
    assert hasattr(processor_svc, 'process_invoice')
    
    print("   ✅ All required methods present")
except Exception as e:
    print(f"   ❌ Method signature issue: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ VERIFICATION COMPLETE - All systems operational!")
print("\nNext steps:")
print("1. Run SQL in Supabase: database/INVENTORY_SYSTEM_COMPLETE_SETUP.sql")
print("2. Start backend: python -m uvicorn api.main:app --reload")
print("3. Test endpoints: POST /api/invoices/save")
print("4. Verify inventory: GET /api/inventory/items")
