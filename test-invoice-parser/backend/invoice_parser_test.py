"""
Standalone Invoice Parser Test Endpoint
Uses Gemini 1.5 Pro Vision to parse food service invoices
"""
import os
import base64
import time
import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import google.generativeai as genai
from pydantic import BaseModel

# Configure Gemini
GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GOOGLE_GEMINI_API_KEY not found in environment")

genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/api/test", tags=["invoice-parser-test"])

INVOICE_PARSING_PROMPT = """You are parsing a food service distributor invoice. Extract all data accurately.

INPUT: Food service invoice (may be multi-page)

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

CRITICAL PARSING RULES:

1. Line Items:
   - Extract ONLY actual product lines
   - Item numbers are typically 6 digits (e.g., 519229, 468398)
   - Skip section headers like "** DRY **" or "** REFRIGERATED **"
   - Skip summary rows at bottom

2. Descriptions:
   - May span multiple lines
   - Combine all description text into one string
   - Include special notes if part of item (like "MASS Q3 COMPLIANT")
   - Exclude generic warnings (like "EMERGENCY PHONE")

3. Pack Sizes:
   - Formatted as quantity + unit (e.g., "24 8 OZ", "1 15 LB", "12 3 CT")
   - Sometimes includes descriptor (e.g., "8 8.5 LB LB")
   - Capture exactly as shown

4. Prices:
   - Unit price is per pack, not per individual item
   - May have 4 decimal places (e.g., 67.5100)
   - Extended price is quantity × unit price

5. Categories:
   - Note which section each item is in (DRY, REFRIGERATED, FROZEN)
   - Use section headers to determine category

6. Totals:
   - Subtotal is before tax
   - Tax is separate line
   - Total includes tax

EXAMPLE from a typical invoice:
{
  "item_number": "468398",
  "description": "RANRNCH BEEF PATTY 2/1 RND SPECIA",
  "quantity": 10,
  "pack_size": "24 8 OZ",
  "unit_price": 56.65,
  "extended_price": 566.50,
  "category": "REFRIGERATED"
}

Return ONLY valid JSON, no additional text."""


class ParseMetrics(BaseModel):
    parse_time_seconds: float
    tokens_used: Optional[int] = None
    estimated_cost: Optional[float] = None


class ParseResponse(BaseModel):
    success: bool
    parsed_data: Optional[dict] = None
    raw_response: Optional[str] = None
    metrics: ParseMetrics
    error: Optional[str] = None


@router.post("/parse-invoice")
async def parse_invoice(file: UploadFile = File(...)) -> JSONResponse:
    """
    Parse a food service invoice using Gemini 1.5 Pro Vision
    Accepts PDF or image files
    """
    start_time = time.time()
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Determine mime type
        mime_type = file.content_type
        if not mime_type:
            # Guess from extension
            ext = file.filename.lower().split('.')[-1]
            mime_map = {
                'pdf': 'application/pdf',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg'
            }
            mime_type = mime_map.get(ext, 'application/octet-stream')
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Prepare the file for Gemini
        file_data = {
            'mime_type': mime_type,
            'data': base64.b64encode(file_content).decode('utf-8')
        }
        
        # Generate content
        response = model.generate_content([
            INVOICE_PARSING_PROMPT,
            file_data
        ])
        
        parse_time = time.time() - start_time
        
        # Extract JSON from response
        raw_text = response.text
        
        # Try to parse JSON (handle markdown code blocks)
        json_text = raw_text.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.startswith('```'):
            json_text = json_text[3:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        parsed_data = json.loads(json_text)
        
        # Calculate metrics
        tokens_used = None
        estimated_cost = None
        
        if hasattr(response, 'usage_metadata'):
            tokens_used = (
                response.usage_metadata.prompt_token_count + 
                response.usage_metadata.candidates_token_count
            )
            # Gemini 1.5 Pro pricing (approximate)
            # Input: $0.00125 per 1K tokens, Output: $0.005 per 1K tokens
            input_cost = (response.usage_metadata.prompt_token_count / 1000) * 0.00125
            output_cost = (response.usage_metadata.candidates_token_count / 1000) * 0.005
            estimated_cost = input_cost + output_cost
        
        return JSONResponse({
            "success": True,
            "parsed_data": parsed_data,
            "raw_response": raw_text,
            "metrics": {
                "parse_time_seconds": round(parse_time, 2),
                "tokens_used": tokens_used,
                "estimated_cost": round(estimated_cost, 6) if estimated_cost else None
            }
        })
        
    except json.JSONDecodeError as e:
        parse_time = time.time() - start_time
        return JSONResponse({
            "success": False,
            "error": f"Failed to parse JSON response: {str(e)}",
            "raw_response": raw_text if 'raw_text' in locals() else None,
            "metrics": {
                "parse_time_seconds": round(parse_time, 2),
                "tokens_used": None,
                "estimated_cost": None
            }
        }, status_code=500)
        
    except Exception as e:
        parse_time = time.time() - start_time
        return JSONResponse({
            "success": False,
            "error": str(e),
            "metrics": {
                "parse_time_seconds": round(parse_time, 2),
                "tokens_used": None,
                "estimated_cost": None
            }
        }, status_code=500)
