"""
Menu Parser Service
Extracts menu items from PDF/image using Gemini Vision API
Pattern: Follows services/invoice_parser_service.py
"""
import os
import time
import logging
from typing import Dict
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class MenuParserService:
    """Parse restaurant menus using Gemini Vision API"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        genai.configure(api_key=api_key)
        self.model_name = "gemini-2.0-flash-exp"
    
    async def parse_menu(
        self,
        file_url: str,
        user_id: str,
        restaurant_name_hint: str = None
    ) -> Dict:
        """
        Parse menu from file URL using Gemini Vision API
        
        Args:
            file_url: URL to menu file (PDF or image)
            user_id: User ID for logging
            restaurant_name_hint: Restaurant name to use (not extracted from menu)
            
        Returns:
            {
                "menu_data": {
                    "restaurant_name": str (from hint or default),
                    "menu_items": [...]
                },
                "metadata": {
                    "model_used": str,
                    "parse_time_seconds": float,
                    "cost": float,
                    "items_extracted": int,
                    "success": bool
                }
            }
        """
        logger.info(f"🍕 Starting menu parse")
        logger.debug(f"File URL: {file_url}")
        
        start_time = time.time()
        
        try:
            # Download file from URL first (Gemini needs local file)
            import requests
            import tempfile
            
            logger.info("📥 Downloading file from URL...")
            response = requests.get(file_url)
            response.raise_for_status()
            
            # Save to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(response.content)
                temp_path = temp_file.name
            
            logger.info(f"✅ File downloaded to: {temp_path}")
            
            # Upload file to Gemini
            logger.info("📤 Uploading file to Gemini...")
            uploaded_file = genai.upload_file(temp_path)
            logger.info(f"✅ File uploaded: {uploaded_file.name}")
            
            # Wait for processing
            while uploaded_file.state.name == "PROCESSING":
                logger.info("⏳ Processing file...")
                time.sleep(2)
                uploaded_file = genai.get_file(uploaded_file.name)
            
            if uploaded_file.state.name == "FAILED":
                raise ValueError("File processing failed")
            
            logger.info(f"✅ File ready: {uploaded_file.state.name}")
            
            # Create prompt
            prompt = self._build_extraction_prompt(restaurant_name_hint)
            
            # Call Gemini
            logger.info(f"🤖 Calling {self.model_name} for extraction...")
            model = genai.GenerativeModel(self.model_name)
            
            response = model.generate_content(
                [uploaded_file, prompt],
                generation_config={
                    "temperature": 0.1,  # Low for accuracy
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                    "response_mime_type": "application/json",  # Force valid JSON output
                }
            )
            
            parse_time = time.time() - start_time
            logger.info(f"✅ Extraction complete in {parse_time:.2f}s")
            
            # Log raw response for debugging
            logger.info("=" * 80)
            logger.info("📋 RAW GEMINI RESPONSE (first 500 chars):")
            logger.info(response.text[:500])
            logger.info("=" * 80)
            
            # Save full response to file for debugging (only in debug mode)
            if os.getenv("DEBUG_MODE") == "true":
                import uuid
                debug_dir = "debug_logs"
                os.makedirs(debug_dir, exist_ok=True)
                debug_file = os.path.join(debug_dir, f"gemini_response_{uuid.uuid4().hex[:8]}_{int(time.time())}.json")
                with open(debug_file, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                logger.debug(f"Full response saved to: {debug_file}")
            
            # Parse response
            menu_data = self._parse_response(response.text)
            
            # Log parsed structure
            logger.info("=" * 80)
            logger.info("📊 PARSED MENU DATA STRUCTURE:")
            logger.info(f"   Keys in menu_data: {list(menu_data.keys())}")
            logger.info(f"   Number of menu_items: {len(menu_data.get('menu_items', []))}")
            
            # Log first 3 items as samples
            sample_items = menu_data.get('menu_items', [])[:3]
            for idx, item in enumerate(sample_items):
                logger.info(f"   Sample Item {idx + 1}:")
                logger.info(f"      - category: {item.get('category')}")
                logger.info(f"      - item_name: {item.get('item_name')}")
                logger.info(f"      - prices: {item.get('prices')}")
            logger.info("=" * 80)
            
            # Add restaurant_name from hint or default
            menu_data["restaurant_name"] = restaurant_name_hint or "My Restaurant"
            logger.info(f"📝 Using restaurant name: {menu_data['restaurant_name']}")
            
            # Clean up
            genai.delete_file(uploaded_file.name)
            logger.info("🗑️  Cleaned up uploaded file")
            
            # Clean up temp file
            if 'temp_path' in locals():
                os.unlink(temp_path)
                logger.info("🗑️  Cleaned up temp file")
            
            # Calculate cost (Gemini Flash 2.0 pricing)
            estimated_cost = 0.002  # ~$0.001-0.003 per menu
            
            metadata = {
                "model_used": self.model_name,
                "parse_time_seconds": round(parse_time, 2),
                "cost": estimated_cost,
                "items_extracted": len(menu_data.get("menu_items", [])),
                "success": True
            }
            
            logger.info(f"📊 Extracted {metadata['items_extracted']} items")
            
            return {
                "menu_data": menu_data,
                "metadata": metadata
            }
            
        except Exception as e:
            parse_time = time.time() - start_time
            logger.error(f"❌ Menu parsing failed: {e}")
            
            return {
                "menu_data": None,
                "metadata": {
                    "model_used": self.model_name,
                    "parse_time_seconds": round(parse_time, 2),
                    "cost": 0.0,
                    "items_extracted": 0,
                    "success": False,
                    "error": str(e)
                }
            }
    
    def _build_extraction_prompt(self, restaurant_name_hint: str = None) -> str:
        """Build Gemini extraction prompt - loads from prompts/menu_parsing_prompt.md"""
        
        # Load the detailed prompt from file
        prompt_path = "prompts/menu_parsing_prompt.md"
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                prompt_content = f.read()
            
            logger.info(f"📄 Loaded prompt from file: {len(prompt_content)} chars")
            
            # Remove the title line if present
            if prompt_content.startswith("# Menu Parsing Prompt Template"):
                lines = prompt_content.split('\n')
                prompt_content = '\n'.join(lines[2:])  # Skip title and blank line
            
            logger.info(f"📄 Final prompt length: {len(prompt_content)} chars")
            return prompt_content.strip()
            
        except FileNotFoundError:
            logger.warning(f"⚠️  Prompt file not found at {prompt_path}, using fallback")
            # Fallback to inline prompt if file not found
            return self._get_fallback_prompt()
    
    def _get_fallback_prompt(self) -> str:
        """Fallback prompt if file not found"""
        return """You are a restaurant menu data extraction expert. Extract ALL menu items from this menu image.

For each menu item, extract:
- category (e.g., "Appetizers", "Wings", "Pizza", "Salads", "Pasta", "Calzone")
- item_name (full name of the dish)
- description (any description text)
- prices (array of all price points with size labels if applicable)
- options (any flavor/style options mentioned)
- notes (special instructions like "Please Allow 15 Minutes" or "Market Price")

CRITICAL RULES FOR ACCURATE EXTRACTION:

1. IDENTIFY ACTUAL MENU ITEMS vs HEADERS
   - SKIP category headers in ALL CAPS: "WINGS", "APPETIZERS", "SALADS", "PIZZA", "ITALIAN PASTA ENTRÉES"
   - SKIP section intro text: "All entrees served with...", "Dressings available:"
   - SKIP topping/ingredient lists without prices
   - ONLY extract items that have BOTH a specific dish name AND a price
   
   Examples:
   ❌ "WINGS" (just category header) → SKIP
   ✅ "JUMBO SIZED WINGS - 8pc $10, 18pc $20" → EXTRACT
   ❌ "SALADS" (just category header) → SKIP
   ✅ "CAESAR SALAD - $6" → EXTRACT

2. CAPTURE ALL PRICE VARIATIONS
   - For items with multiple sizes, create ONE item with ALL prices in the prices array
   - Common size labels: Small/Medium/Large/X-Large, 6"/12"/18", Cup/Bowl, 4pc/8pc/12pc
   - Example: "Pizza - Sm $8, Lg $12, XL $14" → 3 prices in one item

3. PRESERVE EXACT PRICING
   - Keep all decimal places as shown ($8.50, not $8.5)
   - Never invent prices - if unclear, set to 0 and add note

4. DO NOT EXTRACT RESTAURANT NAME
   - Do not include restaurant_name in the output
   - Focus only on menu items

Return ONLY valid JSON in this exact format:
{
  "menu_items": [
    {
      "category": "string",
      "item_name": "string",
      "description": "string or null",
      "prices": [
        {
          "size": "string or null",
          "price": number
        }
      ],
      "options": ["string"] or null,
      "notes": "string or null"
    }
  ]
}

Extract every actual menu item you can see. Be thorough and accurate."""
    
    def _clean_json_response(self, text: str) -> str:
        """Clean and repair common JSON issues from LLM responses"""
        import re
        
        # Remove markdown code blocks
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*$', '', text)
        text = text.strip()
        
        # Remove any text before first {
        first_brace = text.find('{')
        if first_brace > 0:
            logger.warning(f"⚠️  Removing {first_brace} chars before JSON")
            text = text[first_brace:]
        
        # Remove any text after last }
        last_brace = text.rfind('}')
        if last_brace > 0 and last_brace < len(text) - 1:
            logger.warning(f"⚠️  Removing {len(text) - last_brace - 1} chars after JSON")
            text = text[:last_brace + 1]
        
        # Fix common escape issues
        text = text.replace('\\n', ' ')  # Replace newlines with spaces
        
        return text.strip()
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini response into structured data with robust error handling"""
        import json
        
        # Clean the response
        cleaned_text = self._clean_json_response(response_text)
        
        # Parse JSON
        try:
            menu_data = json.loads(cleaned_text)
            return menu_data
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {e}")
            logger.error(f"Cleaned response (first 500 chars): {cleaned_text[:500]}...")
            logger.error(f"Original response (first 500 chars): {response_text[:500]}...")
            raise ValueError(f"Failed to parse Gemini response: {e}")
