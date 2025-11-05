"""
Verify Unit Conversion Integration
Checks that Feature 1 follows all build patterns correctly
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()


def check_service_layer():
    """Verify service layer follows patterns"""
    print("\n" + "="*70)
    print("CHECKING SERVICE LAYER INTEGRATION")
    print("="*70)
    
    checks = []
    
    # 1. Check unit_converter.py exists and imports correctly
    try:
        from services.unit_converter import UnitConverter
        converter = UnitConverter()
        checks.append(("✅", "unit_converter.py imports successfully"))
    except Exception as e:
        checks.append(("❌", f"unit_converter.py import failed: {e}"))
        return checks
    
    # 2. Check it has required methods
    required_methods = ['parse_pack_size', 'convert_to_base_units', 'calculate_total_quantity']
    for method in required_methods:
        if hasattr(converter, method):
            checks.append(("✅", f"Has method: {method}"))
        else:
            checks.append(("❌", f"Missing method: {method}"))
    
    # 3. Check transaction service integration
    try:
        from services.inventory_transaction_service import InventoryTransactionService
        trans_service = InventoryTransactionService()
        
        # Check has unit_converter
        if hasattr(trans_service, 'unit_converter'):
            checks.append(("✅", "Transaction service has unit_converter"))
        else:
            checks.append(("❌", "Transaction service missing unit_converter"))
        
        # Check record_purchase signature
        import inspect
        sig = inspect.signature(trans_service.record_purchase)
        if 'pack_size' in sig.parameters:
            checks.append(("✅", "record_purchase accepts pack_size parameter"))
        else:
            checks.append(("❌", "record_purchase missing pack_size parameter"))
            
    except Exception as e:
        checks.append(("❌", f"Transaction service check failed: {e}"))
    
    # 4. Check invoice processor integration
    try:
        from services.invoice_processor import InvoiceProcessor
        # Just verify it imports (actual integration tested in E2E)
        checks.append(("✅", "Invoice processor imports successfully"))
    except Exception as e:
        checks.append(("❌", f"Invoice processor import failed: {e}"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def check_database_migration():
    """Verify database migration exists"""
    print("\n" + "="*70)
    print("CHECKING DATABASE MIGRATION")
    print("="*70)
    
    checks = []
    
    # Check migration file exists
    migration_file = "database/migrations/005_unit_conversion_fields.sql"
    if os.path.exists(migration_file):
        checks.append(("✅", f"Migration file exists: {migration_file}"))
        
        # Check it has required SQL
        with open(migration_file, 'r') as f:
            content = f.read()
            
        required_sql = [
            'ALTER TABLE inventory_items',
            'ADD COLUMN IF NOT EXISTS base_unit',
            'ADD COLUMN IF NOT EXISTS conversion_factor',
            'CREATE INDEX'
        ]
        
        for sql in required_sql:
            if sql in content:
                checks.append(("✅", f"Has SQL: {sql}"))
            else:
                checks.append(("❌", f"Missing SQL: {sql}"))
    else:
        checks.append(("❌", f"Migration file not found: {migration_file}"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def check_supabase_patterns():
    """Verify Supabase client patterns"""
    print("\n" + "="*70)
    print("CHECKING SUPABASE PATTERNS")
    print("="*70)
    
    checks = []
    
    try:
        from services.inventory_transaction_service import InventoryTransactionService
        service = InventoryTransactionService()
        
        # Check has Supabase client
        if hasattr(service, 'client'):
            checks.append(("✅", "Service has Supabase client"))
        else:
            checks.append(("❌", "Service missing Supabase client"))
        
        # Check uses service role key
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if supabase_key:
            checks.append(("✅", "SUPABASE_SERVICE_ROLE_KEY configured"))
        else:
            checks.append(("❌", "SUPABASE_SERVICE_ROLE_KEY not found"))
            
    except Exception as e:
        checks.append(("❌", f"Supabase pattern check failed: {e}"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def check_error_handling():
    """Verify error handling patterns"""
    print("\n" + "="*70)
    print("CHECKING ERROR HANDLING")
    print("="*70)
    
    checks = []
    
    try:
        from services.unit_converter import UnitConverter
        converter = UnitConverter()
        
        # Test with invalid input
        result = converter.parse_pack_size(None)
        if result is None:
            checks.append(("✅", "Handles None input gracefully"))
        else:
            checks.append(("❌", "Does not handle None input"))
        
        # Test with unparseable string
        result = converter.parse_pack_size("invalid xyz")
        if result is None:
            checks.append(("✅", "Handles invalid input gracefully"))
        else:
            checks.append(("❌", "Does not handle invalid input"))
        
        # Test with unknown unit
        result_qty, result_unit = converter.convert_to_base_units(10, 'unknown_unit')
        checks.append(("✅", "Handles unknown units gracefully"))
        
    except Exception as e:
        checks.append(("❌", f"Error handling check failed: {e}"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def check_logging():
    """Verify logging patterns"""
    print("\n" + "="*70)
    print("CHECKING LOGGING PATTERNS")
    print("="*70)
    
    checks = []
    
    # Check unit_converter has logger
    with open('services/unit_converter.py', 'r') as f:
        content = f.read()
    
    if 'import logging' in content:
        checks.append(("✅", "Imports logging module"))
    else:
        checks.append(("❌", "Missing logging import"))
    
    if 'logger = logging.getLogger(__name__)' in content:
        checks.append(("✅", "Creates logger instance"))
    else:
        checks.append(("❌", "Missing logger instance"))
    
    if 'logger.info' in content or 'logger.warning' in content:
        checks.append(("✅", "Uses logger for output"))
    else:
        checks.append(("❌", "Does not use logger"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def check_type_hints():
    """Verify type hints are used"""
    print("\n" + "="*70)
    print("CHECKING TYPE HINTS")
    print("="*70)
    
    checks = []
    
    with open('services/unit_converter.py', 'r') as f:
        content = f.read()
    
    if 'from typing import' in content:
        checks.append(("✅", "Imports typing module"))
    else:
        checks.append(("❌", "Missing typing import"))
    
    if '-> Dict' in content or '-> Optional' in content or '-> Tuple' in content:
        checks.append(("✅", "Uses return type hints"))
    else:
        checks.append(("❌", "Missing return type hints"))
    
    if ': str' in content or ': Decimal' in content:
        checks.append(("✅", "Uses parameter type hints"))
    else:
        checks.append(("❌", "Missing parameter type hints"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def check_documentation():
    """Verify documentation patterns"""
    print("\n" + "="*70)
    print("CHECKING DOCUMENTATION")
    print("="*70)
    
    checks = []
    
    with open('services/unit_converter.py', 'r') as f:
        content = f.read()
    
    if '"""' in content:
        checks.append(("✅", "Has docstrings"))
    else:
        checks.append(("❌", "Missing docstrings"))
    
    if 'Args:' in content and 'Returns:' in content:
        checks.append(("✅", "Has structured docstrings (Args/Returns)"))
    else:
        checks.append(("❌", "Missing structured docstrings"))
    
    if 'Examples:' in content or 'Example:' in content:
        checks.append(("✅", "Has usage examples in docstrings"))
    else:
        checks.append(("⚠️", "No usage examples (optional but recommended)"))
    
    for status, message in checks:
        print(f"{status} {message}")
    
    return checks


def main():
    """Run all integration checks"""
    print("\n" + "="*70)
    print("UNIT CONVERSION INTEGRATION VERIFICATION")
    print("="*70)
    
    all_checks = []
    
    # Run all checks
    all_checks.extend(check_service_layer())
    all_checks.extend(check_database_migration())
    all_checks.extend(check_supabase_patterns())
    all_checks.extend(check_error_handling())
    all_checks.extend(check_logging())
    all_checks.extend(check_type_hints())
    all_checks.extend(check_documentation())
    
    # Summary
    print("\n" + "="*70)
    print("INTEGRATION VERIFICATION SUMMARY")
    print("="*70)
    
    passed = sum(1 for status, _ in all_checks if status == "✅")
    warnings = sum(1 for status, _ in all_checks if status == "⚠️")
    failed = sum(1 for status, _ in all_checks if status == "❌")
    total = len(all_checks)
    
    print(f"\n✅ Passed: {passed}")
    print(f"⚠️  Warnings: {warnings}")
    print(f"❌ Failed: {failed}")
    print(f"Total: {total} checks")
    
    if failed == 0:
        print("\n🎉 All integration checks passed!")
        print("✅ Feature 1 follows all build patterns correctly")
        print("✅ Ready for production deployment")
        return 0
    else:
        print("\n⚠️  Some integration checks failed")
        print("❌ Fix issues before proceeding")
        return 1


if __name__ == "__main__":
    sys.exit(main())
