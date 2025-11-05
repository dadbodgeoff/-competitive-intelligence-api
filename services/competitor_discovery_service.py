"""
Competitor Discovery Service
Finds nearby competitor restaurants using Google Places API
Separation of Concerns: Only handles competitor discovery, no menu parsing
"""
import os
import logging
import requests
from typing import List, Dict, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


@dataclass
class CompetitorBusiness:
    """Competitor business data from Google Places"""
    place_id: str
    business_name: str
    address: str
    latitude: float
    longitude: float
    rating: Optional[float]
    review_count: Optional[int]
    price_level: Optional[int]
    distance_miles: Optional[float]
    phone: Optional[str]
    website: Optional[str]
    menu_url: Optional[str]
    types: List[str]


class CompetitorDiscoveryService:
    """
    Discover competitor restaurants using Google Places API
    
    Responsibilities:
    - Search for nearby restaurants
    - Filter by category/type
    - Exclude user's own restaurant
    - Exclude recently analyzed competitors (14-day cooldown)
    - Return top 5 competitors
    """
    
    def __init__(self, exclusion_service=None):
        self.api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY not found in environment")
        
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        self.exclusion_service = exclusion_service  # Optional exclusion service
        logger.info("✅ Competitor Discovery Service initialized")
    
    async def find_competitors(
        self,
        location: str,
        restaurant_name: str,
        category: str = "restaurant",
        radius_miles: float = 3.0,
        max_results: int = 5,
        user_id: Optional[str] = None,
        excluded_place_ids: Optional[List[str]] = None
    ) -> List[CompetitorBusiness]:
        """
        Find competitor restaurants near location
        
        Args:
            location: Location string (e.g., "Woonsocket, RI")
            restaurant_name: User's restaurant name (to exclude from results)
            category: Restaurant category (e.g., "pizza", "italian")
            radius_miles: Search radius in miles
            max_results: Maximum competitors to return (default 5)
            user_id: User ID (for exclusion tracking)
            excluded_place_ids: Optional list of place_ids to exclude
            
        Returns:
            List of CompetitorBusiness objects
        """
        logger.info(f"🔍 Finding competitors for '{restaurant_name}' in {location}")
        logger.info(f"   Category: {category}, Radius: {radius_miles} miles")
        
        try:
            # Step 1: Geocode location to get lat/lng
            lat, lng = self._geocode_location(location)
            logger.info(f"📍 Location coordinates: {lat}, {lng}")
            
            # Step 2: Search for nearby restaurants (get more to account for exclusions)
            radius_meters = int(radius_miles * 1609.34)  # Convert miles to meters
            search_limit = max_results + 10  # Get extra for filtering
            competitors = self._search_nearby_places(
                lat=lat,
                lng=lng,
                radius_meters=radius_meters,
                category=category,
                max_results=search_limit
            )
            
            # Step 3: Filter out user's restaurant
            filtered_competitors = []
            for competitor in competitors:
                if not self._is_same_restaurant(competitor.business_name, restaurant_name):
                    filtered_competitors.append(competitor)
                else:
                    logger.info(f"   Skipping user's restaurant: {competitor.business_name}")
            
            # Step 4: Filter out excluded competitors (recently analyzed)
            if excluded_place_ids:
                excluded_set = set(excluded_place_ids)
                before_count = len(filtered_competitors)
                filtered_competitors = [
                    c for c in filtered_competitors 
                    if c.place_id not in excluded_set
                ]
                excluded_count = before_count - len(filtered_competitors)
                if excluded_count > 0:
                    logger.info(
                        f"🚫 Filtered out {excluded_count} recently analyzed competitors"
                    )
            
            # Step 5: Limit to max_results
            final_competitors = filtered_competitors[:max_results]
            
            logger.info(f"✅ Found {len(final_competitors)} competitors")
            return final_competitors
            
        except Exception as e:
            logger.error(f"❌ Competitor discovery failed: {e}")
            raise Exception(f"Failed to find competitors: {str(e)}")
    
    def _geocode_location(self, location: str) -> tuple:
        """
        Convert location string to lat/lng coordinates
        
        Args:
            location: Location string (e.g., "Woonsocket, RI")
            
        Returns:
            Tuple of (latitude, longitude)
        """
        try:
            url = f"{self.base_url}/findplacefromtext/json"
            params = {
                "input": location,
                "inputtype": "textquery",
                "fields": "geometry",
                "key": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") != "OK" or not data.get("candidates"):
                raise Exception(f"Geocoding failed: {data.get('status')}")
            
            location_data = data["candidates"][0]["geometry"]["location"]
            return location_data["lat"], location_data["lng"]
            
        except Exception as e:
            logger.error(f"❌ Geocoding failed: {e}")
            raise Exception(f"Failed to geocode location: {str(e)}")
    
    def _search_nearby_places(
        self,
        lat: float,
        lng: float,
        radius_meters: int,
        category: str,
        max_results: int
    ) -> List[CompetitorBusiness]:
        """
        Search for nearby restaurants using Google Places Nearby Search
        
        Args:
            lat: Latitude
            lng: Longitude
            radius_meters: Search radius in meters
            category: Restaurant category
            max_results: Maximum results to return
            
        Returns:
            List of CompetitorBusiness objects
        """
        try:
            url = f"{self.base_url}/nearbysearch/json"
            
            # Build search keyword based on category
            keyword = f"{category} restaurant" if category != "restaurant" else "restaurant"
            
            params = {
                "location": f"{lat},{lng}",
                "radius": radius_meters,
                "type": "restaurant",
                "keyword": keyword,
                "key": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") not in ["OK", "ZERO_RESULTS"]:
                raise Exception(f"Places search failed: {data.get('status')}")
            
            competitors = []
            for place in data.get("results", [])[:max_results]:
                competitor = self._parse_place_data(place, lat, lng)
                if competitor:
                    competitors.append(competitor)
            
            return competitors
            
        except Exception as e:
            logger.error(f"❌ Places search failed: {e}")
            raise Exception(f"Failed to search nearby places: {str(e)}")
    
    def _parse_place_data(self, place: Dict, origin_lat: float, origin_lng: float) -> Optional[CompetitorBusiness]:
        """
        Parse Google Places API response into CompetitorBusiness object
        
        Args:
            place: Place data from Google Places API
            origin_lat: Origin latitude for distance calculation
            origin_lng: Origin longitude for distance calculation
            
        Returns:
            CompetitorBusiness object or None if parsing fails
        """
        try:
            place_id = place.get("place_id")
            if not place_id:
                return None
            
            # Get place details for more info (phone, website, menu)
            details = self._get_place_details(place_id)
            
            # Calculate distance
            place_lat = place["geometry"]["location"]["lat"]
            place_lng = place["geometry"]["location"]["lng"]
            distance_miles = self._calculate_distance(
                origin_lat, origin_lng, place_lat, place_lng
            )
            
            return CompetitorBusiness(
                place_id=place_id,
                business_name=place.get("name", ""),
                address=place.get("vicinity", ""),
                latitude=place_lat,
                longitude=place_lng,
                rating=place.get("rating"),
                review_count=place.get("user_ratings_total"),
                price_level=place.get("price_level"),
                distance_miles=round(distance_miles, 2),
                phone=details.get("phone"),
                website=details.get("website"),
                menu_url=details.get("menu_url"),
                types=place.get("types", [])
            )
            
        except Exception as e:
            logger.warning(f"⚠️  Failed to parse place data: {e}")
            return None
    
    def _get_place_details(self, place_id: str) -> Dict:
        """
        Get detailed information about a place
        
        Args:
            place_id: Google Place ID
            
        Returns:
            Dict with phone, website, menu_url
        """
        try:
            url = f"{self.base_url}/details/json"
            params = {
                "place_id": place_id,
                "fields": "formatted_phone_number,website,url",
                "key": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") != "OK":
                return {}
            
            result = data.get("result", {})
            return {
                "phone": result.get("formatted_phone_number"),
                "website": result.get("website"),
                "menu_url": result.get("url")  # Google Maps URL as fallback
            }
            
        except Exception as e:
            logger.warning(f"⚠️  Failed to get place details: {e}")
            return {}
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula
        
        Args:
            lat1, lng1: Origin coordinates
            lat2, lng2: Destination coordinates
            
        Returns:
            Distance in miles
        """
        from math import radians, sin, cos, sqrt, atan2
        
        # Earth radius in miles
        R = 3959.0
        
        lat1_rad = radians(lat1)
        lng1_rad = radians(lng1)
        lat2_rad = radians(lat2)
        lng2_rad = radians(lng2)
        
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlng / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c
        return distance
    
    def _is_same_restaurant(self, place_name: str, target_name: str) -> bool:
        """
        Check if two restaurant names refer to the same place
        
        Args:
            place_name: Name from Google Places
            target_name: User's restaurant name
            
        Returns:
            True if same restaurant, False otherwise
        """
        place_lower = place_name.lower().strip()
        target_lower = target_name.lower().strip()
        
        # Exact match
        if place_lower == target_lower:
            return True
        
        # Check if one is contained in the other (for partial matches)
        if len(place_lower) > 3 and len(target_lower) > 3:
            if place_lower in target_lower or target_lower in place_lower:
                return True
        
        return False
