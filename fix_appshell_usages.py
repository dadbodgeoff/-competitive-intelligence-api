#!/usr/bin/env python3
"""
Fix AppShell breadcrumbs prop usages
"""
import re
from pathlib import Path

files_to_fix = [
    "frontend/src/pages/InvoiceDetailPage.tsx",
    "frontend/src/pages/InvoiceListPage.tsx",
    "frontend/src/pages/MenuDashboard.tsx",
    "frontend/src/pages/SavedAnalysesPage.tsx",
]

for file_path in files_to_fix:
    path = Path(file_path)
    if not path.exists():
        print(f"⚠️  {file_path} not found")
        continue
    
    content = path.read_text()
    
    # Remove breadcrumbs, showBackButton, backButtonLabel, backButtonHref props
    # Pattern: match props on AppShell component
    content = re.sub(r'\s+breadcrumbs=\{[^\}]+\}', '', content)
    content = re.sub(r'\s+showBackButton=\{[^\}]+\}', '', content)
    content = re.sub(r'\s+backButtonLabel="[^"]*"', '', content)
    content = re.sub(r'\s+backButtonHref="[^"]*"', '', content)
    
    path.write_text(content)
    print(f"✓ Fixed {file_path}")

print("\n✅ All AppShell usages fixed!")
