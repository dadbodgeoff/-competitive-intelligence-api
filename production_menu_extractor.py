#!/usr/bin/env python3
"""
Production-ready menu extractor using the successful Method 1 approach
This replicates your 2.5 Flash LLM success using enhanced system instructions
"""
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def extract_competitor_menu(competitor_name, location, website=None):
    """
    Extract competitor menu using the successful enhanced system instruction method
    
    Args:
        competitor_name (str): Name of the restaurant
        location (str): Location (city, state)
        website (str, optional): Restaurant website URL
    
    Returns:
        dict: Parsed menu data or None if failed
    """
    
    # Initialize Gemini with enhanced system instruction
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY")
    if not api_key:
        raise ValueError("No Gemini API key found. Set GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY in .env")
    
    genai.configure(api_key=api_key)
    
    # Use the successful system instruction approach
    system_instruction = """You are a web-enabled restaurant menu research assistant with access to current online information. When asked about restaurant menus, you search for and provide the most up-to-date information from official websites, delivery platforms (Grubhub, DoorDash, Slice, Uber Eats), and other reliable sources.

Your responses should include:
1. Complete menu categories and items
2. Current prices with size options
3. Detailed descriptions when available
4. Source attribution when possible

Always format responses as clean, structured JSON for easy parsing."""

    model = genai.GenerativeModel(
        "models/gemini-2.5-flash",
        system_instruction=system_instruction
    )
    
    # Build the prompt
    website_info = f"\n- Website: {website}" if website else ""
    
    prompt = f"""Search for the current menu and prices of {competitor_name} in {location}.{website_info}

Please return the complete menu information in this JSON format:

{{
  "restaurant_name": "{competitor_name}",
  "location": "{location}",
  "data_collection_date": "2025-11-02",
  "menu_categories": {{
    "pizzas": [
      {{
        "name": "Cheese Pizza",
        "description": "Classic cheese pizza",
        "prices": [
          {{"size": "Small (10\\")", "price": "$10.99"}},
          {{"size": "Large (16\\")", "price": "$16.99"}}
        ]
      }}
    ],
    "appetizers": [
      {{
        "name": "Mozzarella Sticks",
        "description": "Fried cheese sticks with marinara",
        "prices": [
          {{"size": "6 pcs", "price": "$7.99"}}
        ]
      }}
    ]
  }},
  "metadata": {{
    "total_items": 0,
    "sources": ["source1.com", "source2.com"],
    "data_quality": "high",
    "extraction_method": "web_search",
    "notes": "Any relevant notes about the menu or pricing"
  }}
}}

Include all available categories like pizzas, appetizers, salads, sandwiches, wings, desserts, beverages, and specials. Provide complete pricing information with size options where available."""

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,
                "top_p": 0.95,
                "max_output_tokens": 8192,
            }
        )
        
        if not response.text:
            return None
        
        response_text = response.text.strip()
        
        # Clean JSON markers
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
            
            # Add extraction metadata
            if 'metadata' not in menu_data:
                menu_data['metadata'] = {}
            
            menu_data['metadata']['extraction_method'] = 'enhanced_system_instruction'
            menu_data['metadata']['model_used'] = 'gemini-2.5-flash'
            
            # Count total items
            total_items = 0
            for category, items in menu_data.get('menu_categories', {}).items():
                if isinstance(items, list):
                    total_items += len(items)
            
            menu_data['metadata']['total_items'] = total_items
            
            return menu_data
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing failed: {e}")
            print(f"Raw response: {response_text[:500]}...")
            return None
        
    except Exception as e:
        print(f"Menu extraction failed: {e}")
        return None


def main():
    """Test the production menu extractor"""
    
    print("🚀 PRODUCTION MENU EXTRACTOR TEST")
    print("=" * 50)
    
    # Test with Park Ave Pizza (your successful case)
    menu_data = extract_competitor_menu(
        competitor_name="Park Ave Pizza",
        location="Woonsocket, RI",
        website="https://parkavepizzari.com/"
    )
    
    if menu_data:
        print("✅ Menu extraction successful!")
        
        # Display summary
        categories = menu_data.get('menu_categories', {})
        metadata = menu_data.get('metadata', {})
        
        print(f"\n📊 SUMMARY:")
        print(f"   Restaurant: {menu_data.get('restaurant_name', 'Unknown')}")
        print(f"   Location: {menu_data.get('location', 'Unknown')}")
        print(f"   Categories: {len(categories)}")
        print(f"   Total Items: {metadata.get('total_items', 0)}")
        print(f"   Extraction Method: {metadata.get('extraction_method', 'Unknown')}")
        
        # Show categories
        print(f"\n📋 CATEGORIES:")
        for category, items in categories.items():
            item_count = len(items) if isinstance(items, list) else 0
            print(f"   - {category.title()}: {item_count} items")
        
        # Save result
        filename = f"production_menu_{menu_data.get('restaurant_name', 'unknown').lower().replace(' ', '_')}.json"
        with open(filename, 'w') as f:
            json.dump(menu_data, f, indent=2)
        
        print(f"\n💾 Full menu saved to: {filename}")
        
        # Show sample items
        print(f"\n🍕 SAMPLE ITEMS:")
        item_count = 0
        for category, items in categories.items():
            if isinstance(items, list) and item_count < 10:
                for item in items[:3]:
                    if item_count >= 10:
                        break
                    item_count += 1
                    name = item.get('name', 'Unknown')
                    prices = item.get('prices', [])
                    if prices and isinstance(prices, list) and len(prices) > 0:
                        if isinstance(prices[0], dict):
                            price_str = f"{prices[0].get('size', 'N/A')}: {prices[0].get('price', 'N/A')}"
                        else:
                            price_str = str(prices[0])
                    else:
                        price_str = "No price"
                    print(f"   {item_count}. [{category}] {name} - {price_str}")
        
        return True
    else:
        print("❌ Menu extraction failed")
        return False


if __name__ == "__main__":
    success = main()
    
    if success:
        print(f"\n🎉 SUCCESS! This method replicates your 2.5 Flash LLM experience")
        print(f"💡 Use this approach in your production menu comparison system")
    else:
        print(f"\n❌ Test failed - check your API key and try again")