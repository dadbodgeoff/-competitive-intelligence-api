#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_full_flow():
    print("🔐 Full Authentication Test")
    
    # Step 1: Register
    print("\n1. Registration...")
    reg_data = {
        "email": "newuser@gmail.com",
        "password": "password123",
        "first_name": "Jane",
        "last_name": "Smith"
    }
    
    reg_response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=reg_data, timeout=5)
    print(f"Registration: {reg_response.status_code}")
    
    if reg_response.status_code == 200:
        reg_result = reg_response.json()
        token = reg_result['access_token']
        print(f"✅ Got token: {token[:30]}...")
        
        # Step 2: Test protected endpoint
        print("\n2. Testing /auth/me...")
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=5)
        print(f"Me endpoint: {me_response.status_code}")
        
        if me_response.status_code == 200:
            user_data = me_response.json()
            print(f"✅ User: {user_data}")
            
            # Step 3: Test analysis endpoint
            print("\n3. Testing analysis...")
            analysis_data = {
                "restaurant_name": "Test Pizza Place",
                "location": "New York, NY",
                "category": "pizza",
                "competitor_count": 3
            }
            
            analysis_response = requests.post(f"{BASE_URL}/api/v1/analysis/run", 
                                            json=analysis_data, headers=headers, timeout=5)
            print(f"Analysis: {analysis_response.status_code}")
            
            if analysis_response.status_code == 200:
                analysis_result = analysis_response.json()
                print(f"✅ Analysis started: {analysis_result['analysis_id']}")
                print("🎉 ALL TESTS PASSED!")
            else:
                print(f"❌ Analysis failed: {analysis_response.text}")
        else:
            print(f"❌ Me endpoint failed: {me_response.text}")
    else:
        print(f"❌ Registration failed: {reg_response.text}")

if __name__ == "__main__":
    test_full_flow()