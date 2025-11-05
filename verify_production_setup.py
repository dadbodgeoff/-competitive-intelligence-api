#!/usr/bin/env python3
"""
Production Environment Verification Script

Checks that all critical secrets are properly configured and different from dev.
Run this before deploying to production.

Usage:
    python verify_production_setup.py
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple

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


def check_secret_strength(key: str, value: str) -> Tuple[bool, str]:
    """Check if a secret meets minimum security requirements."""
    if not value or value.startswith('your-') or value.startswith('GENERATE-'):
        return False, "Not set or using placeholder"
    
    if key == 'JWT_SECRET_KEY':
        if len(value) < 32:
            return False, f"Too short ({len(value)} chars, need 32+)"
        if value == 'your-super-secret-jwt-key-change-this-in-production-2024':
            return False, "Using dev secret!"
        return True, f"Strong ({len(value)} chars)"
    
    if 'SUPABASE' in key:
        if 'syxquxgynoinzwhwkosa' in value:
            return False, "Using dev Supabase project!"
        if len(value) < 20:
            return False, "Too short"
        return True, "OK"
    
    if 'API_KEY' in key or 'KEY' in key:
        if len(value) < 20:
            return False, "Too short for API key"
        return True, "OK"
    
    return True, "OK"


def main():
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}Production Environment Verification{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    # Load environment files
    dev_env = load_env_file('.env')
    prod_env = load_env_file('.env.production')
    
    if not prod_env:
        print(f"{RED}❌ ERROR: .env.production file not found!{RESET}")
        print(f"\n{YELLOW}Create it by running:{RESET}")
        print(f"  cp .env.production.example .env.production")
        print(f"  # Then edit .env.production with your production values\n")
        sys.exit(1)
    
    # Critical secrets that MUST be set and different from dev
    critical_secrets = [
        'JWT_SECRET_KEY',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
    ]
    
    # Important secrets that should be set
    important_secrets = [
        'GOOGLE_GEMINI_API_KEY',
        'GOOGLE_PLACES_API_KEY',
        'SERPAPI_KEY',
        'OUTSCRAPER_API_KEY',
    ]
    
    # Configuration that should be production-ready
    prod_configs = {
        'APP_ENV': 'production',
        'CSP_REPORT_ONLY': 'false',
        'COOKIE_SECURE': 'true',
    }
    
    errors: List[str] = []
    warnings: List[str] = []
    passed: List[str] = []
    
    # Check critical secrets
    print(f"{BLUE}Checking Critical Secrets:{RESET}\n")
    for secret in critical_secrets:
        prod_value = prod_env.get(secret, '')
        dev_value = dev_env.get(secret, '')
        
        # Check if set
        if not prod_value or prod_value.startswith('your-') or prod_value.startswith('GENERATE-'):
            errors.append(f"{secret}: Not set or using placeholder")
            print(f"  {RED}❌ {secret}: Not configured{RESET}")
            continue
        
        # Check if different from dev
        if prod_value == dev_value:
            errors.append(f"{secret}: Same as dev environment!")
            print(f"  {RED}❌ {secret}: Using dev secret!{RESET}")
            continue
        
        # Check strength
        is_strong, message = check_secret_strength(secret, prod_value)
        if not is_strong:
            errors.append(f"{secret}: {message}")
            print(f"  {RED}❌ {secret}: {message}{RESET}")
        else:
            passed.append(f"{secret}: {message}")
            print(f"  {GREEN}✓ {secret}: {message}{RESET}")
    
    # Check important secrets
    print(f"\n{BLUE}Checking API Keys:{RESET}\n")
    for secret in important_secrets:
        prod_value = prod_env.get(secret, '')
        dev_value = dev_env.get(secret, '')
        
        if not prod_value or prod_value.startswith('your-'):
            warnings.append(f"{secret}: Not set")
            print(f"  {YELLOW}⚠ {secret}: Not configured{RESET}")
            continue
        
        if prod_value == dev_value:
            warnings.append(f"{secret}: Same as dev (consider separate keys)")
            print(f"  {YELLOW}⚠ {secret}: Using same key as dev{RESET}")
            continue
        
        is_strong, message = check_secret_strength(secret, prod_value)
        if is_strong:
            passed.append(f"{secret}: {message}")
            print(f"  {GREEN}✓ {secret}: {message}{RESET}")
        else:
            warnings.append(f"{secret}: {message}")
            print(f"  {YELLOW}⚠ {secret}: {message}{RESET}")
    
    # Check production configurations
    print(f"\n{BLUE}Checking Production Settings:{RESET}\n")
    for config, expected in prod_configs.items():
        actual = prod_env.get(config, '').lower()
        if actual == expected.lower():
            passed.append(f"{config}: {actual}")
            print(f"  {GREEN}✓ {config}: {actual}{RESET}")
        else:
            warnings.append(f"{config}: Expected '{expected}', got '{actual}'")
            print(f"  {YELLOW}⚠ {config}: Expected '{expected}', got '{actual}'{RESET}")
    
    # Summary
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}Summary:{RESET}\n")
    print(f"  {GREEN}✓ Passed: {len(passed)}{RESET}")
    print(f"  {YELLOW}⚠ Warnings: {len(warnings)}{RESET}")
    print(f"  {RED}❌ Errors: {len(errors)}{RESET}")
    
    if errors:
        print(f"\n{RED}CRITICAL ERRORS - DO NOT DEPLOY:{RESET}")
        for error in errors:
            print(f"  • {error}")
        print(f"\n{YELLOW}Fix these issues before deploying to production!{RESET}\n")
        sys.exit(1)
    
    if warnings:
        print(f"\n{YELLOW}WARNINGS - Review before deploying:{RESET}")
        for warning in warnings:
            print(f"  • {warning}")
        print(f"\n{YELLOW}These won't block deployment but should be addressed.{RESET}\n")
    
    if not errors and not warnings:
        print(f"\n{GREEN}✓ All checks passed! Production environment is ready.{RESET}\n")
        sys.exit(0)
    
    if not errors:
        print(f"\n{GREEN}✓ No critical errors. Review warnings and deploy when ready.{RESET}\n")
        sys.exit(0)


if __name__ == '__main__':
    main()
