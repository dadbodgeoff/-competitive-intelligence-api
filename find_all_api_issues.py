#!/usr/bin/env python3
"""
Comprehensive API Endpoint Finder
Finds ALL API calls in frontend and checks for correct /api prefix
"""

import os
import re
from pathlib import Path

def find_all_api_calls():
    """Find every single API call in the frontend"""
    frontend_dir = Path('frontend/src')
    issues = []
    all_calls = []
    
    # Find all TypeScript and TSX files
    ts_files = list(frontend_dir.rglob('*.ts'))
    tsx_files = list(frontend_dir.rglob('*.tsx'))
    all_files = ts_files + tsx_files
    
    for file_path in all_files:
        if not file_path.exists():
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
        except:
            continue
        
        for i, line in enumerate(lines, 1):
            # Skip comments
            if line.strip().startswith('//') or line.strip().startswith('*'):
                continue
            
            # Pattern 1: fetch calls
            fetch_matches = re.finditer(r'fetch\([`\'"]([^`\'"]+)[`\'"]', line)
            for match in fetch_matches:
                url = match.group(1)
                if 'http' not in url and ('api' in url.lower() or url.startswith('/')):
                    all_calls.append({
                        'file': str(file_path),
                        'line': i,
                        'url': url,
                        'type': 'fetch'
                    })
            
            # Pattern 2: fetch with template literal
            fetch_template = re.finditer(r'fetch\(\$\{[^}]+\}([^`\'"\)]+)', line)
            for match in fetch_matches:
                url = match.group(1)
                if url and ('api' in url.lower() or url.startswith('/')):
                    all_calls.append({
                        'file': str(file_path),
                        'line': i,
                        'url': f'${{...}}{url}',
                        'type': 'fetch-template'
                    })
            
            # Pattern 3: apiClient calls
            api_matches = re.finditer(r'apiClient\.(get|post|put|delete|patch)\([`\'"]([^`\'"]+)[`\'"]', line)
            for match in api_matches:
                url = match.group(2)
                all_calls.append({
                    'file': str(file_path),
                    'line': i,
                    'url': url,
                    'type': f'apiClient.{match.group(1)}'
                })
            
            # Pattern 4: axios calls
            axios_matches = re.finditer(r'axios\.(get|post|put|delete|patch)\([`\'"]([^`\'"]+)[`\'"]', line)
            for match in axios_matches:
                url = match.group(2)
                all_calls.append({
                    'file': str(file_path),
                    'line': i,
                    'url': url,
                    'type': f'axios.{match.group(1)}'
                })
            
            # Pattern 5: baseURL definitions
            base_matches = re.finditer(r'base(?:URL|Url)\s*[:=]\s*([^,\n;]+)', line)
            for match in base_matches:
                value = match.group(1).strip()
                all_calls.append({
                    'file': str(file_path),
                    'line': i,
                    'url': f'BASE_URL: {value}',
                    'type': 'baseURL'
                })
    
    # Analyze each call
    for call in all_calls:
        url = call['url']
        
        # Skip external URLs
        if url.startswith('http://') or url.startswith('https://'):
            if 'localhost' not in url:
                continue
            else:
                issues.append({**call, 'issue': 'Hardcoded localhost URL'})
                continue
        
        # Check baseURL definitions
        if url.startswith('BASE_URL:'):
            value = url.replace('BASE_URL:', '').strip()
            if 'localhost:8000' in value:
                issues.append({**call, 'issue': 'Hardcoded localhost:8000 in baseURL'})
            elif "VITE_API_URL || '/api'" in value:
                # This is WRONG - should be empty string
                issues.append({**call, 'issue': "Should be: VITE_API_URL || '' (empty string)"})
            continue
        
        # Check if URL starts with /api/
        if not url.startswith('/api/') and not url.startswith('${'):
            # Check if it's a relative path that should have /api
            if url.startswith('/') and 'api' not in url:
                issues.append({**call, 'issue': 'Missing /api/ prefix'})
            elif url.startswith('/v1/') or url.startswith('/menu') or url.startswith('/invoices'):
                issues.append({**call, 'issue': 'Missing /api prefix'})
    
    return all_calls, issues

def main():
    print("\n" + "="*80)
    print("COMPREHENSIVE API ENDPOINT AUDIT")
    print("="*80 + "\n")
    
    all_calls, issues = find_all_api_calls()
    
    print(f"📊 Total API calls found: {len(all_calls)}")
    print(f"❌ Issues found: {len(issues)}\n")
    
    if issues:
        print("="*80)
        print("ISSUES REQUIRING FIXES:")
        print("="*80 + "\n")
        
        for issue in issues:
            print(f"📁 {issue['file']}:{issue['line']}")
            print(f"   Type: {issue['type']}")
            print(f"   URL: {issue['url']}")
            print(f"   ❌ {issue['issue']}")
            print()
    else:
        print("✅ No issues found! All API calls are correctly formatted.\n")
    
    # Group by file
    files_with_issues = {}
    for issue in issues:
        file = issue['file']
        if file not in files_with_issues:
            files_with_issues[file] = []
        files_with_issues[file].append(issue)
    
    if files_with_issues:
        print("="*80)
        print(f"FILES NEEDING FIXES: {len(files_with_issues)}")
        print("="*80 + "\n")
        for file, file_issues in files_with_issues.items():
            print(f"📁 {file} ({len(file_issues)} issues)")
    
    return len(issues)

if __name__ == '__main__':
    exit_code = main()
    exit(0 if exit_code == 0 else 1)
