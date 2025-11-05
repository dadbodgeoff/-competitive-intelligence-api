#!/usr/bin/env python3
"""
Consolidate all SQL files into a single production schema file.
This finds ALL .sql files in your database folder and lists them.

Usage:
    python consolidate_all_sql.py
"""

import os
from pathlib import Path
from datetime import datetime

# ANSI colors
BLUE = '\033[94m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'

def find_all_sql_files():
    """Find all SQL files in database directory"""
    database_dir = Path("database")
    
    if not database_dir.exists():
        print(f"{RED}❌ database/ directory not found{RESET}")
        return []
    
    sql_files = []
    
    # Find all .sql files recursively
    for sql_file in database_dir.rglob("*.sql"):
        sql_files.append(sql_file)
    
    return sorted(sql_files)

def categorize_files(sql_files):
    """Categorize SQL files by type"""
    categories = {
        "core": [],
        "migrations": [],
        "setup": [],
        "verification": [],
        "updates": [],
        "other": []
    }
    
    for file in sql_files:
        file_str = str(file).lower()
        
        if "migrations" in file_str:
            categories["migrations"].append(file)
        elif file.name == "schema.sql":
            categories["core"].append(file)
        elif "setup" in file_str or "system" in file_str:
            categories["setup"].append(file)
        elif "verify" in file_str or "check" in file_str or "audit" in file_str:
            categories["verification"].append(file)
        elif "update" in file_str or "upgrade" in file_str or "fix" in file_str:
            categories["updates"].append(file)
        else:
            categories["other"].append(file)
    
    return categories

def main():
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}SQL Files Consolidation Analysis{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    # Find all SQL files
    sql_files = find_all_sql_files()
    
    if not sql_files:
        print(f"{RED}No SQL files found in database/ directory{RESET}\n")
        return
    
    print(f"Found {GREEN}{len(sql_files)}{RESET} SQL files\n")
    
    # Categorize files
    categories = categorize_files(sql_files)
    
    # Display by category
    print(f"{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}1. CORE SCHEMA{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    for file in categories["core"]:
        print(f"  {GREEN}✓{RESET} {file}")
    if not categories["core"]:
        print(f"  {YELLOW}⚠ No core schema.sql found{RESET}")
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}2. NUMBERED MIGRATIONS (Run in order){RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    for file in categories["migrations"]:
        print(f"  {GREEN}✓{RESET} {file}")
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}3. SETUP/SYSTEM FILES{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    for file in categories["setup"]:
        print(f"  {YELLOW}⚠{RESET} {file}")
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}4. UPDATES/FIXES{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    for file in categories["updates"]:
        print(f"  {YELLOW}⚠{RESET} {file}")
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}5. VERIFICATION SCRIPTS (Don't run in prod){RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    for file in categories["verification"]:
        print(f"  {BLUE}ℹ{RESET} {file}")
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}6. OTHER FILES{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    for file in categories["other"]:
        print(f"  {YELLOW}?{RESET} {file}")
    
    # Summary
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}SUMMARY{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    print(f"Core Schema:        {len(categories['core'])} files")
    print(f"Migrations:         {len(categories['migrations'])} files")
    print(f"Setup/System:       {len(categories['setup'])} files")
    print(f"Updates/Fixes:      {len(categories['updates'])} files")
    print(f"Verification:       {len(categories['verification'])} files")
    print(f"Other:              {len(categories['other'])} files")
    print(f"\n{GREEN}Total:              {len(sql_files)} files{RESET}")
    
    # Recommendations
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}RECOMMENDATIONS FOR PRODUCTION{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    print(f"{GREEN}✓ MUST RUN:{RESET}")
    print(f"  1. Core schema (schema.sql)")
    print(f"  2. All numbered migrations (in order)")
    
    print(f"\n{YELLOW}⚠ REVIEW THESE:{RESET}")
    print(f"  - Setup/System files (may have important schema changes)")
    print(f"  - Updates/Fixes (may contain critical fixes)")
    
    print(f"\n{RED}✗ DON'T RUN:{RESET}")
    print(f"  - Verification scripts (these are for checking, not creating)")
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}BEST APPROACH: Use pg_dump{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    print("Instead of running all these files individually, use pg_dump to")
    print("export your COMPLETE current database schema:")
    print()
    print(f"{GREEN}pg_dump --schema-only \"your-connection-string\" > database/production_schema.sql{RESET}")
    print()
    print("This captures EVERYTHING that's currently in your dev database,")
    print("including all the ad-hoc changes and updates.")
    print()
    print("See GET_COMPLETE_DATABASE.md for detailed instructions.")
    print()

if __name__ == '__main__':
    main()
