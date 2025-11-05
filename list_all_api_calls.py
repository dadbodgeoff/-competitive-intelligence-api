#!/usr/bin/env python3
"""
List EVERY API call found in frontend
"""

import os
import re
from pathlib import Path

def find_all_api_calls():
    """Find every single API call in the frontend"""
    frontend_dir = Path('frontend/src')
    all_calls = []
    
    # Find all TypeScript and TSX files
    ts_files = list(frontend_dir.rglob('*.ts'))
    tsx_files = list(frontend_dir.rglob('*.tsx'))
    all_files = ts_files + tsx_files
    
    print(f"Scanning {len(all_files)} files...\n")
    
    for file_path in all_files:
        rel_path = str(file_path).replace('\\', '/')
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
            stripped = line.strip()
            if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                continue
            
            # Pattern 1: fetch calls with string literal
            if 'fetch(' in line:
                fetch_matches = re.finditer(r'fetch\(\s*[`\'"]([^`\'"]+)[`\'"]', line)
                for match in fetch_matches:
                    url = match.group(1)
                    all_calls.append({
                        'file': rel_path,
                        'line': i,
                        'url': url,
                        'type': 'fetch',
                        'code': line.strip()[:100]
                    })
            
            # Pattern 2: fetch with template literal
            if 'fetch(' in line and '${' in line:
                # Extract the template literal pattern
                template_match = re.search(r'fetch\(\s*`([^`]+)`', line)
                if template_match:
                    url = template_match.group(1)
                    all_calls.append({
                        'file': rel_path,
                        'line': i,
                        'url': url,
                        'type': 'fetch-template',
                        'code': line.strip()[:100]
                    })
            
            # Pattern 3: apiClient calls
            if 'apiClient.' in line:
                api_matches = re.finditer(r'apiClient\.(get|post|put|delete|patch)\s*\(\s*[`\'"]([^`\'"]+)[`\'"]', line)
                for match in api_matches:
                    url = match.group(2)
                    all_calls.append({
                        'file': rel_path,
                        'line': i,
                        'url': url,
                        'type': f'apiClient.{match.group(1)}',
                        'code': line.strip()[:100]
                    })
                
                # Template literals
                api_template = re.finditer(r'apiClient\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`', line)
                for match in api_template:
                    url = match.group(2)
                    all_calls.append({
                        'file': rel_path,
                        'line': i,
                        'url': url,
                        'type': f'apiClient.{match.group(1)}-template',
                        'code': line.strip()[:100]
                    })
            
            # Pattern 4: axios calls
            if 'axios.' in line and not 'axios.create' in line:
                axios_matches = re.finditer(r'axios\.(get|post|put|delete|patch)\s*\(\s*[`\'"]([^`\'"]+)[`\'"]', line)
                for match in axios_matches:
                    url = match.group(2)
                    all_calls.append({
                        'file': rel_path,
                        'line': i,
                        'url': url,
                        'type': f'axios.{match.group(1)}',
                        'code': line.strip()[:100]
                    })
            
            # Pattern 5: baseURL definitions
            if 'baseURL' in line or 'baseUrl' in line:
                base_matches = re.finditer(r'base(?:URL|Url)\s*[:=]\s*([^,\n;]+)', line)
                for match in base_matches:
                    value = match.group(1).strip()
                    all_calls.append({
                        'file': rel_path,
                        'line': i,
                        'url': f'BASE_URL: {value}',
                        'type': 'baseURL',
                        'code': line.strip()[:100]
                    })
    
    return all_calls

def main():
    print("\n" + "="*100)
    print("COMPLETE LIST OF ALL API CALLS IN FRONTEND")
    print("="*100 + "\n")
    
    all_calls = find_all_api_calls()
    
    print(f"\nTotal API calls found: {len(all_calls)}\n")
    print("="*100)
    print("DETAILED LIST:")
    print("="*100 + "\n")
    
    for i, call in enumerate(all_calls, 1):
        print(f"{i}. {call['file']}:{call['line']}")
        print(f"   Type: {call['type']}")
        print(f"   URL: {call['url']}")
        print(f"   Code: {call['code']}")
        print()

if __name__ == '__main__':
    main()

