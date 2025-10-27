#!/usr/bin/env python3
"""
Quick test of Google Places API
"""
from services.google_places_service import GooglePlacesService
import os
from dotenv import load_dotenv

load_dotenv()

def test_places_api():
    print("🗺️ Testing Google Places API")
    
    # Test API key
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    print(f"API Key: {api_key[:20]}..." if api_key else "No API key found")
    
    # Create service
    places_service = GooglePlacesService(api_key)
    
    # Test geocoding
    print("\n1. Testing geocoding...")
    coords = places_service.geocode_location("Times Square, New York, NY")
    print(f"Coordinates: {coords}")
    
    # Test competitor search
    print("\n2. Testing competitor search...")
    competitors = places_service.find_competitors(
        location="Times Square, New York, NY",
        restaurant_name="Joe's Pizza",
        category="pizza",
        max_results=3
    )
    
    print(f"Found {len(competitors)} competitors:")
    for i, comp in enumerate(competitors, 1):
        print(f"  {i}. {comp.name}")
        print(f"     Rating: {comp.rating}")
        print(f"     Distance: {comp.distance_miles:.2f} miles")
        print(f"     Address: {comp.address}")
        print()
    
    return len(competitors) > 0

if __name__ == "__main__":
    success = test_places_api()
    if success:
        print("✅ Google Places API is working!")
    else:
        print("❌ Google Places API test failed")