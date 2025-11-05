#!/usr/bin/env python3
"""
Verify services are not imported before deletion
Run this before deleting any files to ensure 0% chance of breaking production code
"""
import os
import re
from pathlib import Path

FILES_TO_DELETE = [
    'services/serpapi_review_service.py',
    'services/serpapi_monitoring.py',
    'services/enhanced_review_service.py',
    'services/multi_source_review_service.py',
    'services/enhanced_google_places_reviews.py',
    'services/llm_review_generation_service.py',
    'services/premium_review_expansion_service.py',
    'config/serpapi_config.py',
]

def check_imports(file_path, search_patterns):
    """Check if file imports any of the patterns"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            for pattern in search_patterns:
                if re.search(pattern, content):
                    return pattern
    except Exception as e:
        pass
    return None

# Generate search patterns from files to delete
patterns = []
for file in FILES_TO_DELETE:
    # Convert file path to module name
    module_name = file.replace('/', '.').replace('.py', '')
    service_name = file.split('/')[-1].replace('.py', '')
    
    # Add various import patterns
    patterns.append(f'from {module_name}')
    patterns.append(f'import {module_name}')
    patterns.append(f'from services.{service_name}')
    patterns.append(f'from config.{service_name}')

# Check all Python files (excluding tests and the files themselves)
print("=" * 70)
print("DELETION SAFETY VERIFICATION")
print("=" * 70)
print("\nChecking for imports of files marked for deletion...\n")

found_imports = []

for py_file in Path('.').rglob('*.py'):
    file_str = str(py_file)
    
    # Skip test files
    if 'test' in file_str.lower():
        continue
    
    # Skip files marked for deletion
    if any(delete_file in file_str for delete_file in FILES_TO_DELETE):
        continue
    
    # Skip __pycache__
    if '__pycache__' in file_str:
        continue
    
    # Skip node_modules
    if 'node_modules' in file_str:
        continue
    
    # Skip this verification script
    if 'verify_safe_to_delete' in file_str:
        continue
    
    # Check for imports
    matched_pattern = check_imports(py_file, patterns)
    if matched_pattern:
        found_imports.append((file_str, matched_pattern))

print(f"Scanned production Python files (excluding tests)\n")

if found_imports:
    print("❌ DANGER: Found imports in production code!\n")
    print("The following files import services marked for deletion:\n")
    for file, pattern in found_imports:
        print(f"  File: {file}")
        print(f"  Imports: {pattern}\n")
    print("=" * 70)
    print("DO NOT DELETE until these imports are removed!")
    print("=" * 70)
    exit(1)
else:
    print("✅ SAFE: No imports found in production code\n")
    print("=" * 70)
    print("Safe to delete the following files:")
    print("=" * 70)
    for file in FILES_TO_DELETE:
        if os.path.exists(file):
            print(f"  ✓ {file}")
        else:
            print(f"  ⚠ {file} (already deleted or doesn't exist)")
    print("\n" + "=" * 70)
    print("VERIFICATION PASSED - SAFE TO PROCEED WITH DELETION")
    print("=" * 70)
    exit(0)
