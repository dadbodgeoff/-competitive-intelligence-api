#!/usr/bin/env python3
import requests
import json
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 10  # 10 second timeout

def test_auth_flow():
    print("🚀 Testing Authentication Flow")
    
    # Test 1: Health check
    print("\n1. Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health", timeout=TIMEOUT)
        print(f"✅ Health: {response.status_code}")
    except Exception as e:
        print(f"❌ Health failed: {e}")
        return
    
    # Test 2: Registration
    print("\n2. Testing Registration...")
    test_email = f"test_{int(time.time())}@example.com"
    reg_data = {
        "email": test_email,
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=reg_data, timeout=TIMEOUT)
        print(f"Registration Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('access_token')
            print(f"✅ Registration successful! Token: {token[:20] if token else 'None'}...")
            
            # Test 3: Protected endpoint
            print("\n3. Testing Protected Endpoint...")
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=TIMEOUT)
            print(f"Me endpoint Status: {me_response.status_code}")
            
            if me_response.status_code == 200:
                user_data = me_response.json()
                print(f"✅ User data: {user_data.get('email', 'No email')}")
            else:
                print(f"❌ Me endpoint failed: {me_response.text[:100]}")
                
        else:
            print(f"❌ Registration failed: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_auth_flow()