"""
Invoice Parser Service
Uses Gemini 2.5 Flash to parse food service invoices
Pattern: Follows services/menu_llm_service.py structure
"""
import os
import base64
import time
import json
from typing import Dict, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from services.invoice_post_processor import InvoicePostProcessor

load_dotenv()

class InvoiceParserService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_GEMINI_API_KEY not found in environment")
        
        genai.configure(api_key=self.api_key)
        
        # Model configuration
        self.primary_model = "gemini-2.5-flash"
        self.fallback_model = "gemini-2.5-pro"
        self.timeout = 90
        self.max_retries = 2
        
        # Load prompt template
        self.prompt = self._load_prompt()
        
        # Initialize post-processor
        self.post_processor = InvoicePostProcessor()
    
    def _load_prompt(self) -> str:
        """Load invoice parsing prompt from file"""
        prompt_path = os.path.join("prompts", "invoice_parsing_prompt.md")
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract just the prompt text (remove markdown formatting)
                return content
        except FileNotFoundError:
            # Fallback inline prompt
            return """You are parsing a food service distributor invoice. Extract all data accurately.

OUTPUT: JSON with this exact structure:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "vendor_name": "string",
  "line_items": [
    {
      "item_number": "string",
      "description": "string",
      "quantity": number,
      "pack_size": "string",
      "unit_price": number,
      "extended_price": number,
      "category": "string (DRY|REFRIGERATED|FROZEN)"
    }
  ],
  "subtotal": number,
  "tax": number,
  "total": number
}

RULES:
- Extract ONLY actual product lines
- Skip section headers
- Combine multi-line descriptions
- Capture pack sizes exactly as shown
- Return ONLY valid JSON, no additional text"""
    
    async def parse_invoice(
        self,
        file_url: str,
        vendor_hint: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Parse invoice from file URL using Gemini
        
        Args:
            file_url: URL to invoice file (PDF or image)
            vendor_hint: Optional vendor name hint for better parsing
            user_id: User ID for logging
            
        Returns:
            Dict with invoice_data and metadata
        """
        start_time = time.time()
        
        try:
            # Download file content
            file_content = await self._download_file(file_url)
            
            # Determine mime type
            mime_type = self._get_mime_type(file_url)
            
            # Prepare file for Gemini
            file_data = {
                'mime_type': mime_type,
                'data': base64.b64encode(file_content).decode('utf-8')
            }
            
            # Add vendor hint to prompt if provided
            prompt = self.prompt
            if vendor_hint:
                prompt += f"\n\nVendor hint: This invoice is from {vendor_hint}"
            
            # Try primary model first (Flash)
            try:
                result = await self._parse_with_model(
                    self.primary_model,
                    prompt,
                    file_data
                )
                model_used = self.primary_model
            except Exception as e:
                print(f"Flash failed: {e}, trying Pro...")
                result = await self._parse_with_model(
                    self.fallback_model,
                    prompt,
                    file_data
                )
                model_used = self.fallback_model
            
            parse_time = time.time() - start_time
            
            # Post-process: auto-correct common errors
            corrected_data = self.post_processor.post_process(result['parsed_data'])
            
            return {
                "invoice_data": corrected_data,
                "raw_data": result['parsed_data'],  # Keep original for debugging
                "metadata": {
                    "model_used": model_used,
                    "parse_time_seconds": int(round(parse_time)),
                    "tokens_used": result.get('tokens_used'),
                    "cost": result.get('cost'),
                    "success": True
                }
            }
            
        except Exception as e:
            parse_time = time.time() - start_time
            raise Exception(f"Invoice parsing failed: {str(e)}")
    
    async def _parse_with_model(
        self,
        model_name: str,
        prompt: str,
        file_data: Dict
    ) -> Dict:
        """Parse with specific Gemini model"""
        model = genai.GenerativeModel(model_name)
        
        response = model.generate_content([prompt, file_data])
        
        # Extract JSON from response
        raw_text = response.text
        json_text = self._extract_json(raw_text)
        
        # Parse JSON
        parsed_data = json.loads(json_text)
        
        # Calculate metrics
        tokens_used = None
        cost = None
        
        if hasattr(response, 'usage_metadata'):
            input_tokens = response.usage_metadata.prompt_token_count
            output_tokens = response.usage_metadata.candidates_token_count
            tokens_used = input_tokens + output_tokens
            
            # Calculate cost based on model
            if 'flash' in model_name.lower():
                input_cost = (input_tokens / 1000) * 0.000075
                output_cost = (output_tokens / 1000) * 0.0003
            else:
                input_cost = (input_tokens / 1000) * 0.00125
                output_cost = (output_tokens / 1000) * 0.005
            
            cost = input_cost + output_cost
        
        return {
            'parsed_data': parsed_data,
            'tokens_used': tokens_used,
            'cost': cost
        }
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from response text (handle markdown code blocks)"""
        json_text = text.strip()
        
        # Remove markdown code blocks
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.startswith('```'):
            json_text = json_text[3:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        
        return json_text.strip()
    
    async def _download_file(self, file_url: str) -> bytes:
        """Download file from URL"""
        # If it's a local file path (for testing)
        if os.path.exists(file_url):
            with open(file_url, 'rb') as f:
                return f.read()
        
        # Otherwise download from URL
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(file_url) as response:
                if response.status != 200:
                    raise Exception(f"Failed to download file: {response.status}")
                return await response.read()
    
    def _get_mime_type(self, file_url: str) -> str:
        """Determine MIME type from file extension"""
        ext = file_url.lower().split('.')[-1]
        mime_map = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg'
        }
        return mime_map.get(ext, 'application/pdf')
