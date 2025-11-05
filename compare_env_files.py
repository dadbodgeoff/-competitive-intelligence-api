#!/usr/bin/env python3
"""
Compare dev and production environment files to ensure proper separation.

Usage:
    python compare_env_files.py
"""

import os
from typing import Dict, Set

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def load_env_file(filepath: str) -> Dict[str, str]:
    """Load environment variables from a file."""
    env_vars = {}
    if not os.path.exists(filepath):
        return env_vars
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    return env_vars


def mask_secret(value: str, show_chars: int = 4) -> str:
    """Mask a secret value for display."""
    if len(value) <= show_chars * 2:
        return '*' * len(value)
    return value[:show_chars] + '*' * (len(value) - show_chars * 2) + value[-show_chars:]


def main():
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}Environment Files Comparison{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    # Load environment files
    dev_env = load_env_file('.env')
    prod_env = load_env_file('.env.production')
    
    if not dev_env:
        print(f"{RED}❌ .env file not found{RESET}\n")
        return
    
    if not prod_env:
        print(f"{RED}❌ .env.production file not found{RESET}")
        print(f"{YELLOW}Create it by running: cp .env.production.example .env.production{RESET}\n")
        return
    
    # Get all keys
    all_keys = set(dev_env.keys()) | set(prod_env.keys())
    
    # Categorize keys
    critical_secrets = {
        'JWT_SECRET_KEY',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
    }
    
    api_keys = {
        'GOOGLE_GEMINI_API_KEY',
        'GOOGLE_PLACES_API_KEY',
        'SERPAPI_KEY',
        'OUTSCRAPER_API_KEY',
    }
    
    # Compare
    print(f"{BLUE}Critical Secrets (MUST be different):{RESET}\n")
    for key in sorted(critical_secrets):
        dev_val = dev_env.get(key, '')
        prod_val = prod_env.get(key, '')
        
        if not prod_val:
            print(f"  {RED}❌ {key:35} Not set in production{RESET}")
        elif dev_val == prod_val:
            print(f"  {RED}❌ {key:35} SAME AS DEV!{RESET}")
        else:
            print(f"  {GREEN}✓ {key:35} Different ✓{RESET}")
    
    print(f"\n{BLUE}API Keys (Should be different):{RESET}\n")
    for key in sorted(api_keys):
        dev_val = dev_env.get(key, '')
        prod_val = prod_env.get(key, '')
        
        if not prod_val:
            print(f"  {YELLOW}⚠ {key:35} Not set in production{RESET}")
        elif dev_val == prod_val:
            print(f"  {YELLOW}⚠ {key:35} Same as dev{RESET}")
        else:
            print(f"  {GREEN}✓ {key:35} Different ✓{RESET}")
    
    print(f"\n{BLUE}Configuration Values:{RESET}\n")
    config_keys = all_keys - critical_secrets - api_keys
    for key in sorted(config_keys):
        dev_val = dev_env.get(key, '')
        prod_val = prod_env.get(key, '')
        
        if not prod_val and not dev_val:
            continue
        
        if dev_val == prod_val:
            print(f"  {GREEN}= {key:35} {prod_val[:40]}{RESET}")
        else:
            print(f"  {YELLOW}≠ {key:35} Dev: {dev_val[:20]} | Prod: {prod_val[:20]}{RESET}")
    
    print(f"\n{BLUE}{'='*70}{RESET}\n")


if __name__ == '__main__':
    main()
