#!/usr/bin/env python3
"""
Generate a cryptographically secure JWT secret for production use.

Usage:
    python generate_jwt_secret.py
"""

import secrets
import string

def generate_jwt_secret(length: int = 64) -> str:
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + '-_'
    return ''.join(secrets.choice(alphabet) for _ in range(length))

if __name__ == '__main__':
    print("\n" + "="*70)
    print("JWT Secret Generator")
    print("="*70 + "\n")
    
    secret = generate_jwt_secret(64)
    
    print("Your new JWT secret (64 characters):\n")
    print(f"  {secret}\n")
    print("Copy this to your .env.production file as JWT_SECRET_KEY\n")
    print("⚠️  Keep this secret secure! Never commit it to git.\n")
    print("="*70 + "\n")
