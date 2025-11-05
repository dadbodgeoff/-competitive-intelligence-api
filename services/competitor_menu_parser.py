"""
Competitor Menu Parser Service
Parses competitor menus using Gemini 2.0 Flash
Separation of Concerns: Only handles menu parsing, no discovery or comparison
"""
import os
import time
import logging
from typing import Dict, List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class CompetitorMenuParser:
    """
    Parse competitor menus using Gemini 2.0 Flash
    
    Responsibilities:
    - Scrape/download competitor menu
    - Parse menu with Gemini
    - Extract items and pricing
    - Return structured data
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        genai.configure(api_key=api_key)
        # Use Gemini 2.0 Flash Experimental - proven to work best for menu extraction
        self.model_name = "models/gemini-2.0-flash-exp"
        logger.info(f"✅ Competitor Menu Parser initialized ({self.model_name})")
    
    async def parse_competitor_menu(
        self,
        menu_url: str,
        competitor_name: str,
        menu_source: str = "google_places"
    ) -> Dict:
        """
        Parse competitor menu using Gemini's web search capabilities
        
        Args:
            menu_url: URL to menu (or business website)
            competitor_name: Competitor business name
            menu_source: Where menu was obtained from
            
        Returns:
            {
                "menu_items": [...],
                "metadata": {
                    "model_used": str,
                    "parse_time_seconds": float,
                    "cost": float,
                    "items_extracted": int,
                    "success": bool
                }
            }
        """
        logger.info(f"🍕 Parsing menu for: {competitor_name}")
        logger.info(f"   Using web search approach")
        
        start_time = time.time()
        
        try:
            # Build web search prompt using the successful approach
            prompt = self._build_web_search_prompt(competitor_name, menu_url)
            
            # Call Gemini 2.0 Flash Experimental with proven configuration
            logger.info(f"🤖 Calling {self.model_name} with web search...")
            model = genai.GenerativeModel(self.model_name)
            
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.95,
                    "max_output_tokens": 8192,
                }
            )
            
            parse_time = time.time() - start_time
            logger.info(f"✅ Parsing complete in {parse_time:.2f}s")
            
            # Parse response using the successful format
            menu_data = self._parse_response(response.text)
            
            # Convert to the expected format for the system
            menu_items = self._convert_to_menu_items(menu_data)
            
            # Calculate cost (Gemini 2.0 Flash pricing)
            estimated_cost = 0.01  # ~$0.005-0.015 per menu with web search
            
            metadata = {
                "model_used": self.model_name,
                "parse_time_seconds": round(parse_time, 2),
                "cost": estimated_cost,
                "items_extracted": len(menu_items),
                "success": True,
                "sources": menu_data.get("metadata", {}).get("sources", []),
                "data_quality": menu_data.get("metadata", {}).get("data_quality", "unknown")
            }
            
            logger.info(f"📊 Extracted {metadata['items_extracted']} items from {len(metadata['sources'])} sources")
            
            return {
                "menu_items": menu_items,
                "metadata": metadata
            }
            
        except Exception as e:
            parse_time = time.time() - start_time
            logger.error(f"❌ Menu parsing failed: {e}")
            
            return {
                "menu_items": [],
                "metadata": {
                    "model_used": self.model_name,
                    "parse_time_seconds": round(parse_time, 2),
                    "cost": 0.0,
                    "items_extracted": 0,
                    "success": False,
                    "error": str(e)
                }
            }
    
    def _build_web_search_prompt(self, competitor_name: str, menu_url: str) -> str:
        """Build web search prompt for Gemini"""
        
        return f"""# TASK: Extract Menu Information for Competitor Analysis

You are a data extraction assistant. Your job is to find and structure the menu details for a restaurant competitor from online sources.

## TARGET COMPETITOR:
- Business Name: {competitor_name}
- Website (if available): {menu_url}

## EXTRACTION REQUIREMENTS:
Search for the current menu of this business and extract details with the following criteria:

### 1. FULL MENU CATEGORIES
Extract all main categories (e.g., Appetizers, Pizzas, Salads, Desserts) with their sub-items.

### 2. ITEM DETAILS - CRITICAL RULES
For each item, you MUST include:
- item_name: The specific dish name (NOT category headers like "Appetizers" or "Pizza")
- prices: At least one price with $ amount (REQUIRED - skip items without prices)
- description: Item description (optional, can be empty string if not available)
- sizes: Size options if multiple prices exist (optional)

**IMPORTANT**: 
- ONLY extract actual menu items that have BOTH a name AND a price
- SKIP category section headers (e.g., "Wings & Flatbreads", "Burgers & Sandwiches")
- SKIP navigation links or menu section names without prices
- If an item has a name but NO price, DO NOT include it

### 3. SPECIALS AND DEALS
Extract any daily specials, combos, or promotions with details and prices.

If you can't find complete details, extract as much as available and note limitations.

## OUTPUT FORMAT (JSON):
Return your findings in this exact JSON structure:
{{
  "competitor_name": "{competitor_name}",
  "data_collection_date": "2025-11-02",
  "menu_categories": {{
    "appetizers": [
      {{
        "item_name": "Mozzarella Sticks",
        "description": "Fried cheese sticks served with marinara sauce",
        "sizes": ["Small (6 pcs)", "Large (12 pcs)"],
        "prices": ["$7.99", "$12.99"],
        "notes": "Vegetarian"
      }}
    ],
    "pizzas": [
      {{
        "item_name": "Cheese Pizza",
        "description": "Classic cheese pizza with tomato sauce",
        "sizes": ["Small", "Medium", "Large"],
        "prices": ["$9.99", "$12.99", "$15.99"],
        "notes": ""
      }}
    ],
    "specials": [
      {{
        "item_name": "Family Deal",
        "description": "Large pizza, wings, and soda",
        "prices": ["$29.99"],
        "notes": "Available after 5 PM"
      }}
    ]
  }},
  "metadata": {{
    "total_items_extracted": 50,
    "sources": ["website URLs found"],
    "data_quality": "high|medium|low",
    "limitations": "Any limitations encountered during extraction"
  }}
}}

## IMPORTANT RULES:
1. **ONLY extract items with PRICES** - Every item MUST have at least one price in the "prices" array
2. **SKIP category headers** - Do NOT extract section names like "Appetizers", "Wings & Flatbreads", "Burgers & Sandwiches"
3. **Extract actual dishes** - Look for specific items like "Buffalo Wings - $12.99", "Cheeseburger - $9.99"
4. Include sizes or options if listed (e.g., small/large)
5. Use exact prices with currency (e.g., $10.99)
6. Descriptions are optional - if not available, use empty string ""
7. Deduplicate items if they appear in multiple sources
8. Include source URLs in metadata for verification

## EXAMPLES OF WHAT TO EXTRACT:
✅ GOOD: "Buffalo Wings" with prices ["$8.99", "$14.99"] - This is a menu item
✅ GOOD: "Margherita Pizza" with prices ["$12.99"] - This is a menu item
❌ BAD: "Wings & Flatbreads" with no prices - This is just a category header
❌ BAD: "Appetizers" with no prices - This is just a section name

## SEARCH STRATEGY:
- Start with a web search: "{competitor_name} menu" or "{competitor_name} current menu prices"
- Visit reliable sources like the official site, delivery platforms (Grubhub, DoorDash, Uber Eats)
- Look for actual menu PDFs, online ordering pages, or delivery platform listings
- Cross-reference multiple sources for accuracy

Begin extraction now."""
    
    def _get_fallback_prompt(self, competitor_name: str) -> str:
        """Fallback prompt if file not found"""
        return f"""Extract ALL menu items from this {competitor_name} menu.

For each item, extract:
- category (e.g., "Appetizers", "Pizza", "Pasta")
- item_name (full name)
- description (if available)
- prices (array with size/price pairs)

RULES:
1. SKIP category headers (e.g., "PIZZA", "APPETIZERS")
2. ONLY extract items with both name AND price
3. Capture ALL price variations (Small/Large/etc)
4. Keep exact pricing ($8.50, not $8.5)

Return ONLY valid JSON:
{{
  "menu_items": [
    {{
      "category": "string",
      "item_name": "string",
      "description": "string or null",
      "prices": [
        {{
          "size": "string or null",
          "price": number
        }}
      ]
    }}
  ]
}}"""
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini response into structured data"""
        import json
        
        # Remove markdown code blocks
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        try:
            menu_data = json.loads(response_text)
            return menu_data
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {e}")
            logger.error(f"Response preview: {response_text[:500]}...")
            raise ValueError(f"Failed to parse Gemini response: {e}")
    
    def _convert_to_menu_items(self, menu_data: Dict) -> List[Dict]:
        """Convert the successful Gemini format to our system's expected format"""
        menu_items = []
        
        menu_categories = menu_data.get("menu_categories", {})
        
        for category_name, items in menu_categories.items():
            if not isinstance(items, list):
                continue
                
            for item in items:
                # Convert from successful format to system format
                menu_item = {
                    "category": category_name.title(),
                    "item_name": item.get("item_name", ""),
                    "description": item.get("description", ""),
                    "prices": []
                }
                
                # Handle different price formats
                sizes = item.get("sizes", [])
                prices = item.get("prices", [])
                
                if len(sizes) == len(prices):
                    # Sizes and prices match up
                    for size, price in zip(sizes, prices):
                        menu_item["prices"].append({
                            "size": size,
                            "price": self._parse_price(price)
                        })
                elif len(prices) == 1 and not sizes:
                    # Single price, no size
                    menu_item["prices"].append({
                        "size": None,
                        "price": self._parse_price(prices[0])
                    })
                elif len(prices) > 0:
                    # Multiple prices, assume they're different sizes
                    for i, price in enumerate(prices):
                        size_name = sizes[i] if i < len(sizes) else f"Option {i+1}"
                        menu_item["prices"].append({
                            "size": size_name,
                            "price": self._parse_price(price)
                        })
                
                # Keep items that have a name and at least one price entry
                # Description is optional - we want items even without descriptions
                if menu_item["item_name"] and len(menu_item["prices"]) > 0:
                    menu_items.append(menu_item)
        
        return menu_items
    
    def _parse_price(self, price_str: str) -> float:
        """Parse price string to float"""
        if isinstance(price_str, (int, float)):
            return float(price_str)
        
        # Remove $ and convert to float
        price_clean = str(price_str).replace("$", "").replace(",", "").strip()
        try:
            return float(price_clean)
        except ValueError:
            logger.warning(f"Could not parse price: {price_str}")
            return 0.0
