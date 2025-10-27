#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

# Test with a proper email format
test_data = {
    "email": "testuser@gmail.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
}

print("Testing registration with proper email...")
try:
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=test_data, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")