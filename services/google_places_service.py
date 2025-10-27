#!/usr/bin/env python3
"""
Google Places API Service for Competitor Discovery
"""
import googlemaps
import os
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import logging
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class CompetitorInfo:
    """Competitor information from Google Places"""
    place_id: str
    name: str
    address: str
    latitude: float
    longitude: float
    rating: Optional[float]
    review_count: Optional[int]
    price_level: Optional[int]
    distance_miles: Optional[float]
    phone: Optional[str]
    website: Optional[str]
    business_status: str
    types: List[str]

class GooglePlacesService:
    """Service for interacting with Google Places API"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_PLACES_API_KEY")
        if not self.api_key:
            logger.warning("Google Places API key not found. Using mock data.")
            self.client = None
        else:
            self.client = googlemaps.Client(key=self.api_key)
    
    def geocode_location(self, location: str) -> Optional[Tuple[float, float]]:
        """Convert address/location string to lat/lng coordinates"""
        if not self.client:
            # Mock geocoding for development
            mock_locations = {
                "new york, ny": (40.7128, -74.0060),
                "chicago, il": (41.8781, -87.6298),
                "los angeles, ca": (34.0522, -118.2437),
                "miami, fl": (25.7617, -80.1918)
            }
            location_lower = location.lower()
            for key, coords in mock_locations.items():
                if key in location_lower:
                    return coords
            return (40.7128, -74.0060)  # Default to NYC
        
        try:
            # Try geocoding API first
            geocode_result = self.client.geocode(location)
            if geocode_result:
                location_data = geocode_result[0]['geometry']['location']
                return (location_data['lat'], location_data['lng'])
        except Exception as e:
            logger.warning(f"Geocoding API failed for {location}: {e}")
            
        try:
            # Fallback: Use Places API text search for geocoding
            places_result = self.client.places(query=location)
            if places_result.get('results'):
                location_data = places_result['results'][0]['geometry']['location']
                return (location_data['lat'], location_data['lng'])
        except Exception as e:
            logger.error(f"Places text search failed for {location}: {e}")
        
        return None
    
    def find_competitors(
        self, 
        location: str, 
        restaurant_name: str,
        category: str = "restaurant",
        radius_miles: float = 2.0,
        max_results: int = 20
    ) -> List[CompetitorInfo]:
        """Find competitor restaurants near the given location"""
        
        # Get coordinates for the location
        coords = self.geocode_location(location)
        if not coords:
            logger.error(f"Could not geocode location: {location}")
            return []
        
        lat, lng = coords
        radius_meters = int(radius_miles * 1609.34)  # Convert miles to meters
        
        if not self.client:
            # Return mock competitors for development
            return self._get_mock_competitors(lat, lng, restaurant_name, category)
        
        try:
            # Search for nearby restaurants
            places_result = self.client.places_nearby(
                location=(lat, lng),
                radius=radius_meters,
                type='restaurant',
                keyword=category if category != 'restaurant' else None
            )
            
            competitors = []
            for place in places_result.get('results', [])[:max_results]:
                # Skip if it's the same restaurant
                if self._is_same_restaurant(place['name'], restaurant_name):
                    continue
                
                competitor = self._parse_place_data(place, lat, lng)
                if competitor:
                    competitors.append(competitor)
            
            # Sort by rating and distance
            competitors.sort(key=lambda x: (x.rating or 0, -(x.distance_miles or 999)), reverse=True)
            
            return competitors[:max_results]
            
        except Exception as e:
            logger.error(f"Places API search failed: {e}")
            return self._get_mock_competitors(lat, lng, restaurant_name, category)
    
    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """Get detailed information about a specific place"""
        if not self.client:
            return None
        
        try:
            details = self.client.place(
                place_id=place_id,
                fields=['name', 'formatted_address', 'geometry', 'rating', 
                       'user_ratings_total', 'price_level', 'formatted_phone_number',
                       'website', 'business_status', 'types', 'reviews']
            )
            return details.get('result')
        except Exception as e:
            logger.error(f"Failed to get place details for {place_id}: {e}")
            return None
    
    def _parse_place_data(self, place: Dict, origin_lat: float, origin_lng: float) -> Optional[CompetitorInfo]:
        """Parse Google Places API response into CompetitorInfo"""
        try:
            location = place['geometry']['location']
            lat, lng = location['lat'], location['lng']
            
            # Calculate distance
            distance = self._calculate_distance(origin_lat, origin_lng, lat, lng)
            
            return CompetitorInfo(
                place_id=place['place_id'],
                name=place['name'],
                address=place.get('vicinity', ''),
                latitude=lat,
                longitude=lng,
                rating=place.get('rating'),
                review_count=place.get('user_ratings_total'),
                price_level=place.get('price_level'),
                distance_miles=distance,
                phone=None,  # Not available in nearby search
                website=None,  # Not available in nearby search
                business_status=place.get('business_status', 'OPERATIONAL'),
                types=place.get('types', [])
            )
        except Exception as e:
            logger.error(f"Failed to parse place data: {e}")
            return None
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points in miles using Haversine formula"""
        import math
        
        # Convert to radians
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in miles
        r = 3956
        return c * r
    
    def _is_same_restaurant(self, place_name: str, target_name: str) -> bool:
        """Check if two restaurant names refer to the same place"""
        place_lower = place_name.lower().strip()
        target_lower = target_name.lower().strip()
        
        # Exact match
        if place_lower == target_lower:
            return True
        
        # Check if one is contained in the other (for variations like "Joe's Pizza" vs "Joe's")
        if len(place_lower) > 3 and len(target_lower) > 3:
            if place_lower in target_lower or target_lower in place_lower:
                return True
        
        return False
    
    def _get_mock_competitors(self, lat: float, lng: float, restaurant_name: str, category: str) -> List[CompetitorInfo]:
        """Generate mock competitor data for development/testing"""
        mock_competitors = [
            CompetitorInfo(
                place_id="mock_place_1",
                name="Tony's Italian Kitchen",
                address="123 Main St",
                latitude=lat + 0.001,
                longitude=lng + 0.001,
                rating=4.5,
                review_count=150,
                price_level=2,
                distance_miles=0.2,
                phone="(555) 123-4567",
                website="https://tonysitalian.com",
                business_status="OPERATIONAL",
                types=["restaurant", "food", "establishment"]
            ),
            CompetitorInfo(
                place_id="mock_place_2",
                name="Bella Vista Restaurant",
                address="456 Oak Ave",
                latitude=lat + 0.002,
                longitude=lng - 0.001,
                rating=4.2,
                review_count=89,
                price_level=3,
                distance_miles=0.4,
                phone="(555) 987-6543",
                website="https://bellavista.com",
                business_status="OPERATIONAL",
                types=["restaurant", "food", "establishment"]
            ),
            CompetitorInfo(
                place_id="mock_place_3",
                name="Corner Bistro",
                address="789 Pine St",
                latitude=lat - 0.001,
                longitude=lng + 0.002,
                rating=4.0,
                review_count=67,
                price_level=2,
                distance_miles=0.6,
                phone="(555) 456-7890",
                website=None,
                business_status="OPERATIONAL",
                types=["restaurant", "food", "establishment"]
            )
        ]
        
        # Filter out if same name as target restaurant
        return [c for c in mock_competitors if not self._is_same_restaurant(c.name, restaurant_name)]