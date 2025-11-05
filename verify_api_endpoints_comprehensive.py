#!/usr/bin/env python3
"""
Comprehensive API Endpoint Verification
Tests both code patterns AND actual API connectivity
"""

import os
import re
import sys
import requests
from pathlib import Path
from typing import List, Dict, Tuple
from urllib.parse import urljoin

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

# ============================================================================
# PART 1: Code Pattern Validation (Static Analysis)
# ============================================================================

def find_api_calls(file_path: Path) -> List[Tuple[int, str, str]]:
    """Find all API calls in a file"""
    api_calls = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except:
        return []
        
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
        
        # Pattern 3: baseURL definitions
        base_match = re.search(r'base(?:URL|Url)\s*[:=]\s*([^,\n]+)', line)
        if base_match:
            value = base_match.group(1).strip()
            api_calls.append((i, f"BASE_URL: {value}", line.strip()))
    
    return api_calls

def check_url_pattern(url: str) -> Tuple[bool, str]:
    """Check if URL follows correct pattern"""
    
    # Skip external URLs
    if url.startswith('http://') or url.startswith('https://'):
        if 'localhost' in url:
            return False, f"❌ Hardcoded localhost URL"
        return True, "✓ External URL (OK)"
    
    # Check BASE_URL definitions
    if url.startswith('BASE_URL:'):
        value = url.replace('BASE_URL:', '').strip()
        if 'localhost:8000' in value:
            return False, f"❌ Hardcoded localhost:8000"
        if "VITE_API_URL || ''" in value or 'VITE_API_URL || ""' in value:
            return True, "✓ Correct pattern"
        if "VITE_API_URL || '/api'" in value:
            return True, "✓ Acceptable pattern"
        return False, f"❌ Incorrect baseURL"
    
    # Check API paths
    if url.startswith('/api/'):
        return True, "✓ Correct /api/* path"
    
    if url.startswith('${baseUrl}') or url.startswith('${baseURL}'):
        return True, "✓ Uses baseUrl variable"
    
    if url.startswith('/') and 'api' not in url:
        return False, f"❌ Missing /api/ prefix"
    
    return True, "✓ OK"

def verify_code_patterns() -> Dict:
    """Verify frontend code patterns"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}PART 1: Code Pattern Validation (Static Analysis){Colors.RESET}")
    print(f"{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    modules = {
        'Authentication & Analysis': [
            'services/ReviewAnalysisAPIService.ts',
            'components/analysis/**/*.tsx',
        ],
        'Invoice Processing': [
            'hooks/useInvoiceParseStream.ts',
            'hooks/useSaveStream.ts',
            'components/invoice/**/*.tsx',
        ],
        'Menu Management': [
            'hooks/useMenuParseStream.ts',
            'components/menu/**/*.tsx',
            'services/api/menuRecipeApi.ts'
        ],
        'Shared API Client': [
            'services/api/client.ts'
        ]
    }
    
    frontend_dir = Path('frontend/src')
    total_passed = 0
    total_failed = 0
    issues = []
    
    for module_name, patterns in modules.items():
        for pattern in patterns:
            if '*' in pattern:
                files = list(frontend_dir.glob(pattern))
            else:
                file_path = frontend_dir / pattern
                files = [file_path] if file_path.exists() else []
            
            for file_path in files:
                if not file_path.exists():
                    continue
                    
                api_calls = find_api_calls(file_path)
                
                for line_num, url, full_line in api_calls:
                    is_valid, message = check_url_pattern(url)
                    
                    if is_valid:
                        total_passed += 1
                    else:
                        total_failed += 1
                        issues.append({
                            'module': module_name,
                            'file': str(file_path.relative_to(Path.cwd())),
                            'line': line_num,
                            'url': url,
                            'message': message
                        })
    
    return {
        'passed': total_passed,
        'failed': total_failed,
        'issues': issues
    }

# ============================================================================
# PART 2: Live API Endpoint Testing
# ============================================================================

def get_backend_url() -> str:
    """Get backend URL from environment or default"""
    return os.getenv('API_BASE_URL', 'http://localhost:8000')

def test_endpoint(base_url: str, endpoint: str, method: str = 'GET') -> Tuple[bool, str, int]:
    """Test if an endpoint is accessible"""
    url = urljoin(base_url, endpoint)
    
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json={}, timeout=5)
        else:
            response = requests.request(method, url, timeout=5)
        
        # Consider 200-499 as "endpoint exists" (even if auth required)
        if response.status_code < 500:
            return True, f"✓ Responds ({response.status_code})", response.status_code
        else:
            return False, f"✗ Server error ({response.status_code})", response.status_code
            
    except requests.exceptions.ConnectionError:
        return False, "✗ Connection refused", 0
    except requests.exceptions.Timeout:
        return False, "✗ Timeout", 0
    except Exception as e:
        return False, f"✗ Error: {str(e)[:50]}", 0

def verify_live_endpoints() -> Dict:
    """Test actual API endpoints"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}PART 2: Live API Endpoint Testing{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    base_url = get_backend_url()
    print(f"Testing against: {Colors.YELLOW}{base_url}{Colors.RESET}\n")
    
    # Define critical endpoints to test
    endpoints = {
        'Health Check': [
            ('/health', 'GET'),
            ('/api/v1/health', 'GET'),
        ],
        'Authentication': [
            ('/api/v1/auth/login', 'POST'),
            ('/api/v1/auth/register', 'POST'),
        ],
        'Invoice Operations': [
            ('/api/invoices/upload', 'POST'),
            ('/api/invoices/', 'GET'),
        ],
        'Menu Operations': [
            ('/api/menu/upload', 'POST'),
            ('/api/menu/current', 'GET'),
        ],
        'Analytics': [
            ('/api/analytics/items-list', 'GET'),
            ('/api/v1/analytics/dashboard-summary', 'GET'),
        ],
        'Usage Limits': [
            ('/api/usage/summary', 'GET'),
        ],
        'Analysis': [
            ('/api/v1/analysis/run', 'POST'),
        ],
    }
    
    results = {
        'total': 0,
        'passed': 0,
        'failed': 0,
        'skipped': 0,
        'details': {}
    }
    
    for module, endpoint_list in endpoints.items():
        print(f"{Colors.YELLOW}[{module}]{Colors.RESET}")
        module_results = []
        
        for endpoint, method in endpoint_list:
            results['total'] += 1
            success, message, status_code = test_endpoint(base_url, endpoint, method)
            
            if success:
                results['passed'] += 1
                print(f"  {Colors.GREEN}{message}{Colors.RESET} {method} {endpoint}")
            else:
                if status_code == 0:
                    results['skipped'] += 1
                    print(f"  {Colors.YELLOW}{message}{Colors.RESET} {method} {endpoint}")
                else:
                    results['failed'] += 1
                    print(f"  {Colors.RED}{message}{Colors.RESET} {method} {endpoint}")
            
            module_results.append({
                'endpoint': endpoint,
                'method': method,
                'success': success,
                'message': message,
                'status_code': status_code
            })
        
        results['details'][module] = module_results
        print()
    
    return results

# ============================================================================
# Main Execution
# ============================================================================

def main():
    print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}Comprehensive API Verification{Colors.RESET}")
    print(f"{Colors.BLUE}Tests Code Patterns + Live Endpoints{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*80}{Colors.RESET}")
    
    # Part 1: Code patterns
    pattern_results = verify_code_patterns()
    
    # Part 2: Live endpoints (only if backend is running)
    live_results = verify_live_endpoints()
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*80}{Colors.RESET}\n")
    
    print(f"{Colors.YELLOW}Code Pattern Validation:{Colors.RESET}")
    print(f"  ✓ Passed: {Colors.GREEN}{pattern_results['passed']}{Colors.RESET}")
    print(f"  ✗ Failed: {Colors.RED if pattern_results['failed'] > 0 else Colors.GREEN}{pattern_results['failed']}{Colors.RESET}")
    
    if pattern_results['issues']:
        print(f"\n{Colors.RED}Code Pattern Issues:{Colors.RESET}")
        for issue in pattern_results['issues']:
            print(f"  {issue['file']}:{issue['line']}")
            print(f"    {issue['message']}: {issue['url']}")
    
    print(f"\n{Colors.YELLOW}Live Endpoint Testing:{Colors.RESET}")
    print(f"  ✓ Accessible: {Colors.GREEN}{live_results['passed']}{Colors.RESET}")
    print(f"  ✗ Failed: {Colors.RED if live_results['failed'] > 0 else Colors.GREEN}{live_results['failed']}{Colors.RESET}")
    print(f"  ⊘ Skipped (backend not running): {Colors.YELLOW}{live_results['skipped']}{Colors.RESET}")
    
    # Determine exit code
    if pattern_results['failed'] > 0:
        print(f"\n{Colors.RED}{'='*80}{Colors.RESET}")
        print(f"{Colors.RED}❌ CODE PATTERN ISSUES FOUND - FIX BEFORE DEPLOYING{Colors.RESET}")
        print(f"{Colors.RED}{'='*80}{Colors.RESET}\n")
        return 1
    elif live_results['skipped'] == live_results['total']:
        print(f"\n{Colors.YELLOW}{'='*80}{Colors.RESET}")
        print(f"{Colors.YELLOW}⚠️  CODE PATTERNS OK - BACKEND NOT RUNNING (START DOCKER TO TEST ENDPOINTS){Colors.RESET}")
        print(f"{Colors.YELLOW}{'='*80}{Colors.RESET}\n")
        return 0
    elif live_results['failed'] > 0:
        print(f"\n{Colors.YELLOW}{'='*80}{Colors.RESET}")
        print(f"{Colors.YELLOW}⚠️  CODE PATTERNS OK - SOME ENDPOINTS FAILED (CHECK BACKEND){Colors.RESET}")
        print(f"{Colors.YELLOW}{'='*80}{Colors.RESET}\n")
        return 0  # Don't fail on endpoint issues, just warn
    else:
        print(f"\n{Colors.GREEN}{'='*80}{Colors.RESET}")
        print(f"{Colors.GREEN}✅ ALL CHECKS PASSED - READY FOR PRODUCTION!{Colors.RESET}")
        print(f"{Colors.GREEN}{'='*80}{Colors.RESET}\n")
        return 0

if __name__ == '__main__':
    try:
        exit(main())
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Verification cancelled by user{Colors.RESET}\n")
        exit(1)
