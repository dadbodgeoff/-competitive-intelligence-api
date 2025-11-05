"""
Comprehensive audit of all modules to verify Supabase is the source of truth
"""
import os
import re
from pathlib import Path

print("=" * 80)
print("DATABASE SOURCE OF TRUTH AUDIT")
print("=" * 80)
print()

# Define what we're looking for
SUPABASE_PATTERNS = [
    r'from supabase import',
    r'import supabase',
    r'supabase\.table\(',
    r'get_supabase',
]

LOCAL_STORAGE_PATTERNS = [
    r'sqlite3\.connect',
    r'\.db["\']',
    r'pickle\.dump',
    r'pickle\.load',
    r'shelve\.',
    r'open\([^)]*\.json[^)]*["\']w',  # Writing JSON files
    r'\.to_csv\(',
    r'\.to_excel\(',
]

def scan_file(filepath):
    """Scan a file for database patterns"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        uses_supabase = any(re.search(pattern, content) for pattern in SUPABASE_PATTERNS)
        uses_local = any(re.search(pattern, content) for pattern in LOCAL_STORAGE_PATTERNS)
        
        return {
            'uses_supabase': uses_supabase,
            'uses_local': uses_local,
            'content': content
        }
    except:
        return None

# Scan all Python files in key directories
directories = [
    'services',
    'api/routes',
    'database',
]

results = {
    'supabase_only': [],
    'local_only': [],
    'both': [],
    'neither': [],
}

print("📁 SCANNING DIRECTORIES:")
for directory in directories:
    print(f"   • {directory}/")
print()

all_files = []
for directory in directories:
    if os.path.exists(directory):
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.py') and not file.startswith('__'):
                    filepath = os.path.join(root, file)
                    all_files.append(filepath)

print(f"📄 Found {len(all_files)} Python files")
print()

for filepath in all_files:
    result = scan_file(filepath)
    if result:
        if result['uses_supabase'] and not result['uses_local']:
            results['supabase_only'].append(filepath)
        elif result['uses_local'] and not result['uses_supabase']:
            results['local_only'].append(filepath)
        elif result['uses_supabase'] and result['uses_local']:
            results['both'].append(filepath)
        else:
            # Check if it's a database-related file
            if any(keyword in filepath.lower() for keyword in ['database', 'storage', 'service', 'route']):
                results['neither'].append(filepath)

print("=" * 80)
print("✅ MODULES USING SUPABASE ONLY")
print("=" * 80)
print(f"Count: {len(results['supabase_only'])}")
print()
for filepath in sorted(results['supabase_only'])[:20]:
    print(f"   ✅ {filepath}")
if len(results['supabase_only']) > 20:
    print(f"   ... and {len(results['supabase_only']) - 20} more")
print()

print("=" * 80)
print("⚠️  MODULES USING LOCAL STORAGE")
print("=" * 80)
print(f"Count: {len(results['local_only'])}")
print()
if results['local_only']:
    for filepath in sorted(results['local_only']):
        print(f"   ⚠️  {filepath}")
        # Show what local storage it uses
        result = scan_file(filepath)
        if result:
            for pattern in LOCAL_STORAGE_PATTERNS:
                matches = re.findall(pattern, result['content'])
                if matches:
                    print(f"       → Uses: {pattern}")
else:
    print("   ✅ None found!")
print()

print("=" * 80)
print("🔄 MODULES USING BOTH SUPABASE AND LOCAL")
print("=" * 80)
print(f"Count: {len(results['both'])}")
print()
if results['both']:
    for filepath in sorted(results['both']):
        print(f"   🔄 {filepath}")
        result = scan_file(filepath)
        if result:
            print(f"       ✅ Has Supabase")
            for pattern in LOCAL_STORAGE_PATTERNS:
                matches = re.findall(pattern, result['content'])
                if matches:
                    print(f"       ⚠️  Also uses: {pattern}")
else:
    print("   ✅ None found!")
print()

print("=" * 80)
print("❓ DATABASE-RELATED MODULES WITH NO CLEAR STORAGE")
print("=" * 80)
print(f"Count: {len(results['neither'])}")
print()
if results['neither']:
    for filepath in sorted(results['neither']):
        print(f"   ❓ {filepath}")
else:
    print("   ✅ All modules have clear storage!")
print()

# Check specific critical modules
print("=" * 80)
print("🎯 CRITICAL MODULE CHECK")
print("=" * 80)
print()

critical_modules = [
    'services/invoice_storage_service.py',
    'services/inventory_service.py',
    'services/price_analytics_service.py',
    'services/vendor_service.py',
    'api/routes/invoices/management.py',
    'api/routes/inventory_operations.py',
    'api/routes/price_analytics.py',
]

for module in critical_modules:
    if os.path.exists(module):
        result = scan_file(module)
        if result:
            status = "✅" if result['uses_supabase'] and not result['uses_local'] else "⚠️"
            storage = []
            if result['uses_supabase']:
                storage.append("Supabase")
            if result['uses_local']:
                storage.append("Local")
            if not storage:
                storage.append("None detected")
            
            print(f"{status} {module}")
            print(f"   Storage: {', '.join(storage)}")
    else:
        print(f"❌ {module} - NOT FOUND")
    print()

# Summary
print("=" * 80)
print("📊 SUMMARY")
print("=" * 80)
print()
print(f"✅ Supabase only:        {len(results['supabase_only'])}")
print(f"⚠️  Local storage only:   {len(results['local_only'])}")
print(f"🔄 Both:                 {len(results['both'])}")
print(f"❓ Neither:              {len(results['neither'])}")
print()

if len(results['local_only']) == 0 and len(results['both']) == 0:
    print("🎉 PERFECT! All modules use Supabase as the source of truth!")
elif len(results['local_only']) > 0:
    print("⚠️  WARNING: Some modules use local storage instead of Supabase")
    print("   These need to be migrated to Supabase")
elif len(results['both']) > 0:
    print("⚠️  WARNING: Some modules use both Supabase and local storage")
    print("   Review these for potential data inconsistency")

print()
print("=" * 80)
