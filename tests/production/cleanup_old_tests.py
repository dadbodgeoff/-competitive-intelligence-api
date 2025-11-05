#!/usr/bin/env python3
"""
Cleanup Old Tests Script
Removes all non-production tests from the repository
Run this AFTER production tests are complete and verified
"""
import os
import shutil
from pathlib import Path
from typing import List

# Root directory (2 levels up from this script)
ROOT_DIR = Path(__file__).parent.parent.parent

# Directories to remove (old test files)
OLD_TEST_DIRS = [
    "tests/e2e_auth",
    "tests/module_tests",
    "test-invoice-parser",
]

# Individual test files to remove
OLD_TEST_FILES = [
    "tests/test_review_analysis_regression.py",
    "tests/test_real_free_tier_service.py",
    "tests/test_fuzzy_integration.py",
    "tests/test_fuzzy_matching.py",
    "tests/test_price_analytics.py",
]

# Verification/audit scripts to remove (not needed in production)
OLD_VERIFICATION_SCRIPTS = [
    "quick_verify_price_analytics.py",
    "verify_price_analytics_source_of_truth.py",
    "verify_invoice_3293561.sql",
    "verify_inventory_system.py",
    "verify_fuzzy_matching_install.py",
    "verify_invoice_ecosystem.py",
    "verify_invoice_1277265_complete.sql",
    "verify_unit_conversion_integration.py",
    "verify_simplified_workflow.py",
    "verify_menu_separation.py",
    "verify_orphaned_items_safety.py",
    "verify_price_analytics_simple.py",
    "verify_price_analytics_integration.py",
    "verify_parsing_accuracy.py",
    "verify_premium_user.sql",
    "verify_exact_user.sql",
    "verify_prod_schema.py",
    "verify_security_implementations.py",
    "verify_production_setup.py",
]

# Audit/analysis files to remove (documentation, not tests)
OLD_AUDIT_FILES = [
    "AUDIT_ANALYSIS_5cec1990.sql",
    "audit_10_invoices.py",
    "audit_database_sources.py",
    "audit_inventory_conversions.py",
    "audit_runner.py",
    "pre_production_audit.py",
]

# Seed/test data scripts to remove
OLD_SEED_SCRIPTS = [
    "seed_pizza_invoice.py",
    "seed_sysco_invoice.py",
    "comprehensive_v2_test.py",
    "check_price_tracking_data.py",
    "check_parsed_menu.py",
    "check_analysis_timing.sql",
    "check_analysis_e2b66882.sql",
    "check_nrivikings_price_data.py",
]

# Analysis/trace scripts to remove
OLD_ANALYSIS_SCRIPTS = [
    "trace_invoice_storage.py",
    "analyze_invoice_upload.py",
    "production_menu_extractor.py",
]

# Cleanup scripts to remove (after running)
OLD_CLEANUP_SCRIPTS = [
    "cleanup_obsolete_files.py",
    "cleanup_inventory_dead_code.py",
]

# Get/list scripts to remove
OLD_UTILITY_SCRIPTS = [
    "get_test_user_id.py",
    "list_migrations.py",
    "export_schema_python.py",
    "generate_schema_export_query.sql",
    "consolidate_all_sql.py",
]

# Setup scripts to remove (already run)
OLD_SETUP_SCRIPTS = [
    "setup_invoice_tables.sql",
    "setup_production.bat",
]


def confirm_cleanup() -> bool:
    """Ask user to confirm cleanup"""
    print("=" * 80)
    print("CLEANUP OLD TESTS - CONFIRMATION REQUIRED")
    print("=" * 80)
    print()
    print("This script will PERMANENTLY DELETE the following:")
    print()
    
    all_items = (
        OLD_TEST_DIRS +
        OLD_TEST_FILES +
        OLD_VERIFICATION_SCRIPTS +
        OLD_AUDIT_FILES +
        OLD_SEED_SCRIPTS +
        OLD_ANALYSIS_SCRIPTS +
        OLD_CLEANUP_SCRIPTS +
        OLD_UTILITY_SCRIPTS +
        OLD_SETUP_SCRIPTS
    )
    
    print(f"Total items to delete: {len(all_items)}")
    print()
    print("Sample items:")
    for item in all_items[:10]:
        print(f"  - {item}")
    print(f"  ... and {len(all_items) - 10} more")
    print()
    print("⚠️  WARNING: This action CANNOT be undone!")
    print()
    
    response = input("Type 'DELETE' to confirm cleanup: ")
    return response == "DELETE"


def remove_directory(dir_path: Path) -> bool:
    """Remove directory and all contents"""
    if dir_path.exists() and dir_path.is_dir():
        try:
            shutil.rmtree(dir_path)
            print(f"✅ Removed directory: {dir_path.relative_to(ROOT_DIR)}")
            return True
        except Exception as e:
            print(f"❌ Failed to remove {dir_path}: {e}")
            return False
    else:
        print(f"⏭️  Directory not found: {dir_path.relative_to(ROOT_DIR)}")
        return False


def remove_file(file_path: Path) -> bool:
    """Remove single file"""
    if file_path.exists() and file_path.is_file():
        try:
            file_path.unlink()
            print(f"✅ Removed file: {file_path.relative_to(ROOT_DIR)}")
            return True
        except Exception as e:
            print(f"❌ Failed to remove {file_path}: {e}")
            return False
    else:
        print(f"⏭️  File not found: {file_path.relative_to(ROOT_DIR)}")
        return False


def cleanup_old_tests():
    """Main cleanup function"""
    print()
    print("Starting cleanup...")
    print()
    
    removed_count = 0
    failed_count = 0
    skipped_count = 0
    
    # Remove directories
    print("Removing old test directories...")
    for dir_name in OLD_TEST_DIRS:
        dir_path = ROOT_DIR / dir_name
        if remove_directory(dir_path):
            removed_count += 1
        elif dir_path.exists():
            failed_count += 1
        else:
            skipped_count += 1
    
    print()
    
    # Remove files
    all_files = (
        OLD_TEST_FILES +
        OLD_VERIFICATION_SCRIPTS +
        OLD_AUDIT_FILES +
        OLD_SEED_SCRIPTS +
        OLD_ANALYSIS_SCRIPTS +
        OLD_CLEANUP_SCRIPTS +
        OLD_UTILITY_SCRIPTS +
        OLD_SETUP_SCRIPTS
    )
    
    print("Removing old test files...")
    for file_name in all_files:
        file_path = ROOT_DIR / file_name
        if remove_file(file_path):
            removed_count += 1
        elif file_path.exists():
            failed_count += 1
        else:
            skipped_count += 1
    
    print()
    print("=" * 80)
    print("CLEANUP COMPLETE")
    print("=" * 80)
    print(f"✅ Removed: {removed_count} items")
    print(f"⏭️  Skipped: {skipped_count} items (not found)")
    print(f"❌ Failed: {failed_count} items")
    print()
    
    if failed_count > 0:
        print("⚠️  Some items failed to delete. Please review errors above.")
    else:
        print("🎉 All old tests successfully removed!")
    
    print()
    print("Next steps:")
    print("1. Verify production tests are working: cd tests/production && ./run_all_tests.sh")
    print("2. Commit changes: git add -A && git commit -m 'Remove old tests, keep production suite only'")
    print("3. Push to repository: git push")


def main():
    """Main entry point"""
    print()
    print("CLEANUP OLD TESTS SCRIPT")
    print("=" * 80)
    print()
    print("This script removes all non-production tests from the repository.")
    print("Only tests in tests/production/ will remain.")
    print()
    
    if not confirm_cleanup():
        print()
        print("❌ Cleanup cancelled by user")
        print()
        return
    
    print()
    cleanup_old_tests()


if __name__ == "__main__":
    main()
