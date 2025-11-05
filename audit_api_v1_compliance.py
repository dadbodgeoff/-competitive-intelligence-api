"""
API v1 Compliance Audit
Finds all API routes that don't follow the /api/v1/ convention
"""
import os
import re
from pathlib import Path

def audit_backend_routes():
    """Check all Python route files for non-v1 prefixes"""
    print("=" * 80)
    print("BACKEND API ROUTES AUDIT")
    print("=" * 80)
    
    issues = []
    api_routes_dir = Path("api/routes")
    
    # Pattern to find APIRouter declarations
    router_pattern = re.compile(r'router\s*=\s*APIRouter\s*\(\s*prefix\s*=\s*["\']([^"\']+)["\']')
    
    for py_file in api_routes_dir.rglob("*.py"):
        if py_file.name == "__init__.py":
            continue
            
        with open(py_file, 'r', encoding='utf-8') as f:
            content = f.read()
            matches = router_pattern.findall(content)
            
            for prefix in matches:
                # Check if it starts with /api/ but not /api/v1/
                if prefix.startswith('/api/') and not prefix.startswith('/api/v1/'):
                    issues.append({
                        'file': str(py_file),
                        'prefix': prefix,
                        'type': 'backend'
                    })
                    print(f"\n❌ ISSUE FOUND:")
                    print(f"   File: {py_file}")
                    print(f"   Prefix: {prefix}")
                    print(f"   Should be: {prefix.replace('/api/', '/api/v1/', 1)}")
    
    if not issues:
        print("\n✅ All backend routes use /api/v1/ prefix!")
    
    return issues


def audit_frontend_api_calls():
    """Check all frontend API service files for non-v1 calls"""
    print("\n" + "=" * 80)
    print("FRONTEND API CALLS AUDIT")
    print("=" * 80)
    
    issues = []
    frontend_api_dir = Path("frontend/src/services/api")
    
    # Patterns to find API calls
    patterns = [
        re.compile(r'[\'"`](/api/[^v][^\'"`]*)[\'"`]'),  # Matches /api/ but not /api/v
        re.compile(r'apiClient\.(get|post|put|delete|patch)\s*\(\s*[\'"`](/api/[^v][^\'"`]*)[\'"`]'),
    ]
    
    for ts_file in frontend_api_dir.rglob("*.ts"):
        if ts_file.name.endswith('.d.ts'):
            continue
            
        with open(ts_file, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                for pattern in patterns:
                    matches = pattern.findall(line)
                    for match in matches:
                        # Extract the path (handle tuple results from regex groups)
                        path = match[1] if isinstance(match, tuple) else match
                        
                        # Check if it's an API path without v1
                        if path.startswith('/api/') and not path.startswith('/api/v1/'):
                            issues.append({
                                'file': str(ts_file),
                                'line': line_num,
                                'path': path,
                                'type': 'frontend'
                            })
                            print(f"\n❌ ISSUE FOUND:")
                            print(f"   File: {ts_file}")
                            print(f"   Line: {line_num}")
                            print(f"   Path: {path}")
                            print(f"   Code: {line.strip()}")
                            print(f"   Should be: {path.replace('/api/', '/api/v1/', 1)}")
    
    if not issues:
        print("\n✅ All frontend API calls use /api/v1/ prefix!")
    
    return issues


def audit_main_py_registrations():
    """Check api/main.py for route registrations"""
    print("\n" + "=" * 80)
    print("MAIN.PY ROUTE REGISTRATIONS AUDIT")
    print("=" * 80)
    
    issues = []
    main_file = Path("api/main.py")
    
    # Pattern to find app.include_router calls
    include_pattern = re.compile(r'app\.include_router\s*\([^,]+,\s*prefix\s*=\s*["\']([^"\']+)["\']')
    
    with open(main_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            matches = include_pattern.findall(line)
            for prefix in matches:
                if prefix.startswith('/api/') and not prefix.startswith('/api/v1/'):
                    issues.append({
                        'file': str(main_file),
                        'line': line_num,
                        'prefix': prefix,
                        'type': 'registration'
                    })
                    print(f"\n❌ ISSUE FOUND:")
                    print(f"   Line: {line_num}")
                    print(f"   Prefix: {prefix}")
                    print(f"   Code: {line.strip()}")
                    print(f"   Should be: {prefix.replace('/api/', '/api/v1/', 1)}")
    
    if not issues:
        print("\n✅ All route registrations in main.py use /api/v1/ prefix!")
    
    return issues


def generate_summary(backend_issues, frontend_issues, registration_issues):
    """Generate summary report"""
    print("\n" + "=" * 80)
    print("AUDIT SUMMARY")
    print("=" * 80)
    
    total_issues = len(backend_issues) + len(frontend_issues) + len(registration_issues)
    
    print(f"\nTotal Issues Found: {total_issues}")
    print(f"  - Backend Routes: {len(backend_issues)}")
    print(f"  - Frontend API Calls: {len(frontend_issues)}")
    print(f"  - Main.py Registrations: {len(registration_issues)}")
    
    if total_issues == 0:
        print("\n🎉 SUCCESS! All API routes follow the /api/v1/ convention!")
    else:
        print("\n⚠️  ACTION REQUIRED: Fix the issues listed above")
        print("\nQuick Fix Pattern:")
        print("  Backend:  prefix='/api/xxx' → prefix='/api/v1/xxx'")
        print("  Frontend: '/api/xxx' → '/api/v1/xxx'")
    
    return total_issues


def main():
    print("\n🔍 Starting API v1 Compliance Audit...\n")
    
    # Run all audits
    backend_issues = audit_backend_routes()
    frontend_issues = audit_frontend_api_calls()
    registration_issues = audit_main_py_registrations()
    
    # Generate summary
    total = generate_summary(backend_issues, frontend_issues, registration_issues)
    
    print("\n" + "=" * 80)
    print("AUDIT COMPLETE")
    print("=" * 80 + "\n")
    
    return total


if __name__ == "__main__":
    exit_code = main()
    exit(0 if exit_code == 0 else 1)
