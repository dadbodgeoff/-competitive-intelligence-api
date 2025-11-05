#!/usr/bin/env python3
"""
List all migrations in order with instructions for running them.

Usage:
    python list_migrations.py
"""

import os
from pathlib import Path

# ANSI colors
BLUE = '\033[94m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def main():
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}Database Migrations - Run in Supabase SQL Editor{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    migrations = [
        {
            "order": 1,
            "file": "database/schema.sql",
            "name": "Core Schema",
            "description": "Creates users, subscriptions, invoices, inventory tables"
        },
        {
            "order": 2,
            "file": "database/migrations/002_inventory_foundation.sql",
            "name": "Inventory Foundation",
            "description": "Sets up inventory management system"
        },
        {
            "order": 3,
            "file": "database/migrations/003_reference_data.sql",
            "name": "Reference Data",
            "description": "Adds units, categories, and reference data"
        },
        {
            "order": 4,
            "file": "database/migrations/004_fuzzy_matching_setup.sql",
            "name": "Fuzzy Matching",
            "description": "Sets up fuzzy matching for invoice items"
        },
        {
            "order": 5,
            "file": "database/migrations/005_unit_conversion_fields.sql",
            "name": "Unit Conversions",
            "description": "Adds unit conversion fields"
        },
        {
            "order": 6,
            "file": "database/migrations/006_user_preferences.sql",
            "name": "User Preferences",
            "description": "Creates user preferences table"
        },
        {
            "order": 7,
            "file": "database/migrations/007_price_analytics_functions.sql",
            "name": "Price Analytics",
            "description": "Adds price analytics functions"
        },
        {
            "order": 8,
            "file": "database/migrations/008_relax_extended_price_constraint.sql",
            "name": "Price Constraints",
            "description": "Relaxes extended price constraints"
        },
        {
            "order": 9,
            "file": "database/migrations/009_price_tracking_columns.sql",
            "name": "Price Tracking Columns",
            "description": "Adds price tracking columns"
        },
        {
            "order": 10,
            "file": "database/migrations/010_standardize_timestamps.sql",
            "name": "Standardize Timestamps",
            "description": "Standardizes timestamp columns"
        },
        {
            "order": 11,
            "file": "database/migrations/011_item_price_tracking_FIXED.sql",
            "name": "Item Price Tracking",
            "description": "Creates item price tracking table"
        },
        {
            "order": 12,
            "file": "database/migrations/012_menu_management_system.sql",
            "name": "Menu Management",
            "description": "Creates menu and menu items tables"
        },
        {
            "order": 13,
            "file": "database/migrations/013_menu_item_ingredients.sql",
            "name": "Menu Ingredients",
            "description": "Adds recipe/plate costing system"
        },
        {
            "order": 14,
            "file": "database/migrations/014_competitor_menu_comparison.sql",
            "name": "Menu Comparison",
            "description": "Adds competitor menu comparison"
        },
        {
            "order": 15,
            "file": "database/migrations/015_transactional_delete.sql",
            "name": "Safe Deletion",
            "description": "Adds transactional delete functions"
        },
        {
            "order": 16,
            "file": "database/migrations/019_atomic_usage_limits.sql",
            "name": "Usage Limits",
            "description": "Adds atomic usage limit tracking"
        },
        {
            "order": 17,
            "file": "database/migrations/020_add_file_hash_column.sql",
            "name": "File Hashing",
            "description": "Adds file hash for duplicate detection"
        },
        {
            "order": 18,
            "file": "database/migrations/021_enable_rls_critical_tables.sql",
            "name": "Row Level Security",
            "description": "Enables RLS on critical tables"
        },
        {
            "order": 19,
            "file": "database/migrations/022_fix_function_search_paths.sql",
            "name": "Function Search Paths",
            "description": "Fixes function search paths"
        },
    ]
    
    print(f"{YELLOW}Instructions:{RESET}")
    print("1. Go to Supabase Dashboard → SQL Editor")
    print("2. Click 'New query'")
    print("3. For each migration below:")
    print("   - Open the file in your editor")
    print("   - Copy the entire contents")
    print("   - Paste into SQL Editor")
    print("   - Click 'Run' (or Ctrl+Enter)")
    print("   - Wait for success message")
    print("   - Move to next migration\n")
    
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    for migration in migrations:
        file_path = migration['file']
        exists = os.path.exists(file_path)
        status = f"{GREEN}✓{RESET}" if exists else f"{YELLOW}⚠{RESET}"
        
        print(f"{status} {BLUE}Migration {migration['order']:2d}:{RESET} {migration['name']}")
        print(f"   File: {file_path}")
        print(f"   {migration['description']}")
        
        if not exists:
            print(f"   {YELLOW}⚠ File not found!{RESET}")
        
        print()
    
    print(f"{BLUE}{'='*70}{RESET}\n")
    print(f"{GREEN}After running all migrations:{RESET}")
    print("1. Verify tables exist in Supabase Table Editor")
    print("2. Run: python verify_production_setup.py")
    print("3. Test connection works\n")
    
    # Count existing files
    existing = sum(1 for m in migrations if os.path.exists(m['file']))
    total = len(migrations)
    
    print(f"Found {existing}/{total} migration files\n")
    
    if existing < total:
        print(f"{YELLOW}⚠ Some migration files are missing!{RESET}")
        print("Check that you're running this from the project root directory.\n")

if __name__ == '__main__':
    main()
