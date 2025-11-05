#!/usr/bin/env python3
"""
API Endpoint Verification Script
Tests that all frontend API calls use correct URL patterns for production
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def find_api_calls(file_path: Path) -> List[Tuple[int, str, str]]:
    """Find all API calls in a file and return (line_num, pattern, full_line)"""
    api_calls = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines, 1):
        # Skip comments
        if line.strip().startswith('//') or line.strip().startswith('*'):
            continue
            
        # Pattern 1: fetch calls
        fetch_match = re.search(r'fetch\([`\'"]([^`\'"]+)[`\'"]', line)
        if fetch_match:
            url = fetch_match.group(1)
            if 'api' in url.lower() or url.startswith('/'):
                api_calls.append((i, url, line.strip()))
        
        # Pattern 2: axios/apiClient calls
        axios_match = re.search(r'\.(get|post|put|delete|patch)\([`\'"]([^`\'"]+)[`\'"]', line)
        if axios_match:
            url = axios_match.group(2)
            if 'api' in url.lower() or url.startswith('/'):
                api_calls.append((i, url, line.strip()))
        
        # Pattern 3: baseURL or baseUrl definitions
        base_match = re.search(r'base(?:URL|Url)\s*[:=]\s*([^,\n]+)', line)
        if base_match:
            value = base_match.group(1).strip()
            api_calls.append((i, f"BASE_URL: {value}", line.strip()))
    
    return api_calls

def check_url_pattern(url: str, file_path: str) -> Tuple[bool, str]:
    """Check if URL follows correct pattern"""
    
    # Skip external URLs
    if url.startswith('http://') or url.startswith('https://'):
        if 'localhost' in url:
            return False, f"❌ Hardcoded localhost URL"
        return True, "✓ External URL (OK)"
    
    # Check for BASE_URL definitions
    if url.startswith('BASE_URL:'):
        value = url.replace('BASE_URL:', '').strip()
        if 'localhost:8000' in value:
            return False, f"❌ Hardcoded localhost:8000 in baseURL"
        if "VITE_API_URL || ''" in value or 'VITE_API_URL || ""' in value:
            return True, "✓ Correct: VITE_API_URL || ''"
        if "VITE_API_URL || '/api'" in value:
            return True, "✓ Acceptable: VITE_API_URL || '/api'"
        return False, f"❌ Incorrect baseURL pattern"
    
    # Check API paths
    if url.startswith('/api/'):
        return True, "✓ Correct: /api/* path"
    
    if url.startswith('${baseUrl}') or url.startswith('${baseURL}'):
        return True, "✓ Uses baseUrl variable"
    
    if url.startswith('/') and 'api' not in url:
        return False, f"❌ Missing /api/ prefix"
    
    return True, "✓ OK"

def verify_module(module_name: str, file_patterns: List[str]) -> Dict:
    """Verify all files in a module"""
    results = {
        'module': module_name,
        'files_checked': 0,
        'total_endpoints': 0,
        'passed': 0,
        'failed': 0,
        'issues': []
    }
    
    frontend_dir = Path('frontend/src')
    
    for pattern in file_patterns:
        # Handle glob patterns
        if '*' in pattern:
            files = list(frontend_dir.glob(pattern))
        else:
            file_path = frontend_dir / pattern
            files = [file_path] if file_path.exists() else []
        
        for file_path in files:
            if not file_path.exists():
                continue
                
            results['files_checked'] += 1
            api_calls = find_api_calls(file_path)
            
            for line_num, url, full_line in api_calls:
                results['total_endpoints'] += 1
                is_valid, message = check_url_pattern(url, str(file_path))
                
                if is_valid:
                    results['passed'] += 1
                else:
                    results['failed'] += 1
                    try:
                        rel_path = str(file_path.relative_to(Path.cwd()))
                    except ValueError:
                        rel_path = str(file_path)
                    
                    results['issues'].append({
                        'file': rel_path,
                        'line': line_num,
                        'url': url,
                        'message': message,
                        'code': full_line
                    })
    
    return results

def main():
    print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}API Endpoint Verification - Production Readiness Check{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    # Define modules and their file patterns
    modules = {
        'Authentication & Analysis': [
            'services/ReviewAnalysisAPIService.ts',
            'stores/authStore.ts',
            'components/auth/**/*.tsx',
            'components/analysis/**/*.tsx',
            'pages/*Analysis*.tsx'
        ],
        'Invoice Processing': [
            'hooks/useInvoiceParseStream.ts',
            'hooks/useSaveStream.ts',
            'components/invoice/**/*.tsx',
            'pages/Invoice*.tsx'
        ],
        'Menu Management': [
            'hooks/useMenuParseStream.ts',
            'components/menu/**/*.tsx',
            'pages/Menu*.tsx',
            'services/api/menuRecipeApi.ts'
        ],
        'Menu Comparison': [
            'services/api/menuComparisonApi.ts',
            'pages/*Comparison*.tsx'
        ],
        'Price Analytics': [
            'services/api/analyticsApi.ts',
            'pages/PriceAnalyticsDashboard.tsx'
        ],
        'Streaming Analysis': [
            'hooks/useStreamingAnalysis.ts'
        ],
        'Usage Limits': [
            'hooks/useUsageLimits.ts',
            'components/dashboard/UsageLimitsWidget.tsx'
        ],
        'Shared API Client': [
            'services/api/client.ts'
        ]
    }
    
    all_results = []
    total_passed = 0
    total_failed = 0
    
    for module_name, patterns in modules.items():
        print(f"\n{Colors.YELLOW}📦 Module: {module_name}{Colors.RESET}")
        print(f"{Colors.YELLOW}{'─'*80}{Colors.RESET}")
        
        results = verify_module(module_name, patterns)
        all_results.append(results)
        
        total_passed += results['passed']
        total_failed += results['failed']
        
        print(f"  Files checked: {results['files_checked']}")
        print(f"  Endpoints found: {results['total_endpoints']}")
        print(f"  {Colors.GREEN}✓ Passed: {results['passed']}{Colors.RESET}")
        
        if results['failed'] > 0:
            print(f"  {Colors.RED}✗ Failed: {results['failed']}{Colors.RESET}")
            
            for issue in results['issues']:
                print(f"\n  {Colors.RED}Issue in {issue['file']}:{issue['line']}{Colors.RESET}")
                print(f"    URL: {issue['url']}")
                print(f"    {issue['message']}")
                print(f"    Code: {issue['code'][:100]}...")
        else:
            print(f"  {Colors.GREEN}✓ All endpoints correct!{Colors.RESET}")
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    total_modules = len(all_results)
    modules_passed = sum(1 for r in all_results if r['failed'] == 0)
    
    print(f"Total Modules: {total_modules}")
    print(f"Modules Passed: {Colors.GREEN}{modules_passed}{Colors.RESET}")
    print(f"Modules with Issues: {Colors.RED if total_modules - modules_passed > 0 else Colors.GREEN}{total_modules - modules_passed}{Colors.RESET}")
    print(f"\nTotal Endpoints: {total_passed + total_failed}")
    print(f"{Colors.GREEN}✓ Passed: {total_passed}{Colors.RESET}")
    print(f"{Colors.RED}✗ Failed: {total_failed}{Colors.RESET}")
    
    if total_failed == 0:
        print(f"\n{Colors.GREEN}{'='*80}{Colors.RESET}")
        print(f"{Colors.GREEN}✅ ALL MODULES READY FOR PRODUCTION!{Colors.RESET}")
        print(f"{Colors.GREEN}{'='*80}{Colors.RESET}\n")
        return 0
    else:
        print(f"\n{Colors.RED}{'='*80}{Colors.RESET}")
        print(f"{Colors.RED}❌ ISSUES FOUND - FIX BEFORE DEPLOYING{Colors.RESET}")
        print(f"{Colors.RED}{'='*80}{Colors.RESET}\n")
        return 1

if __name__ == '__main__':
    exit(main())
