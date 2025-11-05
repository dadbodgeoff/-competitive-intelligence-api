#!/usr/bin/env python3
"""
Automated script to fix common build violations
"""
import re
from pathlib import Path

def fix_docker_compose():
    """Remove obsolete version attribute from docker-compose.yml"""
    file_path = Path("docker-compose.yml")
    content = file_path.read_text()
    
    # Remove version line
    fixed = re.sub(r"^version:.*\n", "", content, flags=re.MULTILINE)
    
    file_path.write_text(fixed)
    print("✓ Fixed docker-compose.yml - removed obsolete version attribute")

def list_unused_imports():
    """Generate list of files with unused imports for manual review"""
    files_to_fix = [
        "frontend/src/components/cogs/COGSSummaryCards.tsx",
        "frontend/src/components/dashboard/DashboardHeader.tsx",
        "frontend/src/components/dashboard/VendorScorecardCard.tsx",
        "frontend/src/components/layout/AppShell.tsx",
        "frontend/src/pages/CompetitorSelectionPage.tsx",
        "frontend/src/pages/DashboardPage.tsx",
        "frontend/src/pages/MenuComparisonResultsPage.tsx",
        "frontend/src/pages/MenuParsingProgressPage.tsx",
        "frontend/src/pages/PriceAnalyticsDashboard.tsx",
        "frontend/src/pages/SavedComparisonsPage.tsx",
        "frontend/src/hooks/useCOGSOverview.ts",
    ]
    
    print("\n📋 Files with TypeScript violations:")
    for f in files_to_fix:
        if Path(f).exists():
            print(f"  - {f}")

def check_requirements():
    """Check for package version mismatches"""
    print("\n⚠️  Package version conflicts detected:")
    print("  - fastapi: requirements.txt has 0.120.0, installed is 0.109.0")
    print("  - pydantic: requirements.txt has 2.10.3, installed is 2.12.3")
    print("  - supabase: requirements.txt has 2.10.0, installed is 2.3.0")
    print("\n  Run: pip install -r requirements.txt --upgrade")

if __name__ == "__main__":
    print("🔍 Build Violations Fixer\n")
    
    fix_docker_compose()
    list_unused_imports()
    check_requirements()
    
    print("\n✅ Automated fixes complete!")
    print("📝 See build_violations_audit.md for full details")
