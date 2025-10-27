#!/usr/bin/env python3
"""
Menu Scraping Utilities
Supporting functions for web scraping and menu extraction
"""
import re
import requests
import asyncio
import logging
from typing import Optional, Dict, List
from urllib.parse import urljoin, urlparse
import time
from bs4 import BeautifulSoup
import json

logger = logging.getLogger(__name__)

class MenuScrapingUtils:
    """Utility functions for menu web scraping"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Rate limiting
        self.last_request_time = 0
        self.min_delay = 1.0  # Minimum 1 second between requests
    
    async def _rate_limit(self):
        """Implement rate limiting between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            await asyncio.sleep(self.min_delay - time_since_last)
        
        self.last_request_time = time.time()
    
    def url_exists(self, url: str, timeout: int = 10) -> bool:
        """
        Check if URL exists without downloading full content
        
        Args:
            url: URL to check
            timeout: Request timeout in seconds
            
        Returns:
            True if URL exists and returns 200, False otherwise
        """
        try:
            response = self.session.head(url, timeout=timeout, allow_redirects=True)
            return response.status_code == 200
        except Exception as e:
            logger.debug(f"URL check failed for {url}: {e}")
            return False
    
    async def fetch_html(self, url: str, timeout: int = 15) -> Optional[str]:
        """
        Fetch HTML content from URL with rate limiting
        
        Args:
            url: URL to fetch
            timeout: Request timeout in seconds
            
        Returns:
            HTML content or None if failed
        """
        await self._rate_limit()
        
        try:
            logger.info(f"Fetching HTML from: {url}")
            response = self.session.get(url, timeout=timeout, allow_redirects=True)
            response.raise_for_status()
            
            return response.text
            
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout fetching {url}")
            return None
        except requests.exceptions.RequestException as e:
            logger.warning(f"Request failed for {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}")
            return None
    
    def generate_restaurant_slug(self, name: str) -> str:
        """
        Convert restaurant name to URL-friendly slug
        
        Args:
            name: Restaurant name
            
        Returns:
            URL-friendly slug
        """
        if not name:
            return ""
        
        # Convert to lowercase and clean up
        slug = name.lower()
        
        # Remove possessive apostrophes (Tony's -> tonys)
        slug = re.sub(r"'s\b", 's', slug)
        
        # Remove other special characters except spaces and hyphens
        slug = re.sub(r'[^\w\s-]', '', slug)
        
        # Replace spaces and multiple hyphens with single hyphen
        slug = re.sub(r'[-\s]+', '-', slug)
        
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        
        # Remove common restaurant words that might interfere with URLs
        common_words = ['restaurant', 'cafe', 'bar', 'grill', 'kitchen', 'house', 'place']
        for word in common_words:
            # Remove word if it's at the end
            slug = re.sub(f'-{word}$', '', slug)
            slug = re.sub(f'^{word}-', '', slug)
        
        return slug
    
    def validate_menu_quality(self, menu: Dict) -> bool:
        """
        Validate that extracted menu meets minimum quality standards
        
        Args:
            menu: Extracted menu dictionary
            
        Returns:
            True if menu meets quality standards
        """
        if not menu or not isinstance(menu, dict):
            logger.debug("Menu validation failed: not a dictionary")
            return False
        
        categories = menu.get('categories', [])
        if not categories or len(categories) == 0:
            logger.debug("Menu validation failed: no categories")
            return False
        
        # Count items with both name and price
        total_items_with_prices = 0
        total_items = 0
        
        for category in categories:
            if not isinstance(category, dict):
                continue
                
            items = category.get('items', [])
            for item in items:
                if not isinstance(item, dict):
                    continue
                    
                total_items += 1
                
                # Check if item has name and price
                if (item.get('name') and 
                    item.get('price') is not None and 
                    self._is_valid_price(item.get('price'))):
                    total_items_with_prices += 1
        
        # Must have at least 3 items with valid prices
        if total_items_with_prices < 3:
            logger.debug(f"Menu validation failed: only {total_items_with_prices} items with prices")
            return False
        
        # At least 50% of items should have prices
        if total_items > 0 and (total_items_with_prices / total_items) < 0.5:
            logger.debug(f"Menu validation failed: only {total_items_with_prices}/{total_items} items have prices")
            return False
        
        logger.debug(f"Menu validation passed: {total_items_with_prices} items with prices")
        return True
    
    def _is_valid_price(self, price) -> bool:
        """Check if price is valid (number > 0)"""
        try:
            if isinstance(price, str):
                # Remove currency symbols and convert
                price_str = re.sub(r'[^\d.]', '', price)
                price_num = float(price_str)
            else:
                price_num = float(price)
            
            return price_num > 0 and price_num < 1000  # Reasonable price range
        except (ValueError, TypeError):
            return False
    
    def extract_json_ld(self, html: str) -> List[Dict]:
        """
        Extract JSON-LD structured data from HTML
        
        Args:
            html: HTML content
            
        Returns:
            List of JSON-LD objects
        """
        json_ld_objects = []
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            scripts = soup.find_all('script', type='application/ld+json')
            
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    json_ld_objects.append(data)
                except json.JSONDecodeError as e:
                    logger.debug(f"Failed to parse JSON-LD: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting JSON-LD: {e}")
        
        return json_ld_objects
    
    def clean_price_string(self, price_str: str) -> Optional[float]:
        """
        Clean and convert price string to float
        
        Args:
            price_str: Raw price string (e.g., "$12.99", "12.99", "12,99")
            
        Returns:
            Float price or None if invalid
        """
        if not price_str:
            return None
        
        try:
            # Remove currency symbols and whitespace
            cleaned = re.sub(r'[^\d.,]', '', str(price_str))
            
            # Handle European decimal format (12,99 -> 12.99)
            if ',' in cleaned and '.' not in cleaned:
                cleaned = cleaned.replace(',', '.')
            
            # Remove thousands separators (1,234.99 -> 1234.99)
            if ',' in cleaned and '.' in cleaned:
                cleaned = cleaned.replace(',', '')
            
            price = float(cleaned)
            
            # Validate reasonable price range
            if 0 < price < 1000:
                return round(price, 2)
            
        except (ValueError, TypeError):
            pass
        
        return None
    
    def normalize_menu_structure(self, raw_menu: Dict, competitor_name: str) -> Dict:
        """
        Normalize extracted menu to standard structure
        
        Args:
            raw_menu: Raw extracted menu data
            competitor_name: Name of the competitor
            
        Returns:
            Normalized menu structure
        """
        normalized = {
            'competitor_name': competitor_name,
            'categories': []
        }
        
        # Handle different input structures
        if 'categories' in raw_menu:
            categories = raw_menu['categories']
        elif 'sections' in raw_menu:
            categories = raw_menu['sections']
        elif 'menu' in raw_menu:
            categories = raw_menu['menu']
        else:
            # Try to extract from top level
            categories = [raw_menu] if raw_menu else []
        
        for category in categories:
            if not isinstance(category, dict):
                continue
            
            normalized_category = {
                'name': self._extract_category_name(category),
                'items': []
            }
            
            # Extract items from category
            items = self._extract_category_items(category)
            
            for item in items:
                normalized_item = self._normalize_menu_item(item)
                if normalized_item:
                    normalized_category['items'].append(normalized_item)
            
            # Only add category if it has items
            if normalized_category['items']:
                normalized['categories'].append(normalized_category)
        
        return normalized
    
    def _extract_category_name(self, category: Dict) -> str:
        """Extract category name from various possible fields"""
        possible_names = ['name', 'title', 'category', 'section', 'heading']
        
        for field in possible_names:
            if field in category and category[field]:
                return str(category[field]).strip()
        
        return "Menu Items"
    
    def _extract_category_items(self, category: Dict) -> List[Dict]:
        """Extract items from category using various possible field names"""
        possible_items = ['items', 'products', 'dishes', 'food', 'menuItems']
        
        for field in possible_items:
            if field in category and isinstance(category[field], list):
                return category[field]
        
        return []
    
    def _normalize_menu_item(self, item: Dict) -> Optional[Dict]:
        """Normalize a single menu item"""
        if not isinstance(item, dict):
            return None
        
        # Extract name
        name = None
        for field in ['name', 'title', 'dish', 'item']:
            if field in item and item[field]:
                name = str(item[field]).strip()
                break
        
        if not name:
            return None
        
        # Extract price
        price = None
        for field in ['price', 'cost', 'amount', 'value']:
            if field in item:
                price = self.clean_price_string(str(item[field]))
                if price is not None:
                    break
        
        # Extract description
        description = None
        for field in ['description', 'desc', 'details', 'ingredients']:
            if field in item and item[field]:
                description = str(item[field]).strip()
                break
        
        normalized_item = {
            'name': name,
            'price': price,
        }
        
        if description:
            normalized_item['description'] = description
        
        return normalized_item

# Global utility instance
menu_utils = MenuScrapingUtils()