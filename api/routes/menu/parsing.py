"""
Menu Parsing Routes
Handles menu parsing with Gemini
Pattern: Follows api/routes/invoices/parsing.py
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
from pydantic import BaseModel
import logging

from services.menu_parser_service import MenuParserService
from services.menu_parser_streaming import MenuParserStreaming
from services.menu_validator_service import MenuValidatorService
from services.error_sanitizer import sanitize_parsing_error
from api.middleware.auth import get_current_user
from api.middleware.rate_limiting import rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/menu", tags=["menu-operations"])

# Initialize services
parser_service = MenuParserService()
streaming_parser = MenuParserStreaming()
validator_service = MenuValidatorService()


# Pydantic models
class ParseRequest(BaseModel):
    file_url: str
    restaurant_name_hint: Optional[str] = None


@router.get("/parse-stream")
@rate_limit("menu_parse")
async def parse_menu_stream(
    file_url: str,
    restaurant_name_hint: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Stream menu parsing progress and results (SSE)
    
    Real-time events:
    - parsing_started
    - parsing_progress (every 10s)
    - parsed_data
    - validation_complete
    - error
    
    Frontend holds data in memory until user confirms save
    """
    return StreamingResponse(
        streaming_parser.parse_menu_streaming(
            file_url=file_url,
            user_id=current_user,
            restaurant_name_hint=restaurant_name_hint
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Content-Encoding": "none",  # Prevent compression buffering
        }
    )


@router.post("/parse")
@rate_limit("menu_parse")
async def parse_menu(
    request: ParseRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Parse uploaded menu using Gemini Flash (non-streaming)
    
    Takes 20-40 seconds depending on menu complexity
    Returns: Parsed menu data with validation results
    
    NOTE: Use /parse-stream for better UX with real-time progress
    """
    # Check usage limits (free tier: 1/week)
    from api.middleware.subscription import check_usage_limits
    await check_usage_limits(current_user, "menu_upload")
    
    try:
        # Parse with Gemini
        result = await parser_service.parse_menu(
            file_url=request.file_url,
            user_id=current_user,
            restaurant_name_hint=request.restaurant_name_hint
        )
        
        if not result['metadata']['success']:
            raise Exception(result['metadata'].get('error', 'Parsing failed'))
        
        # Validate parsed data
        validation = validator_service.validate_menu(result['menu_data'])
        
        # Increment usage counter after successful parse
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        usage_service.increment_usage(
            user_id=current_user,
            operation_type='menu_upload',
            operation_id=None,  # Will be set when menu is saved
            metadata={'restaurant': result['menu_data'].get('restaurant_name')}
        )
        
        return JSONResponse({
            "success": True,
            "menu_data": result['menu_data'],
            "metadata": result['metadata'],
            "validation": validation
        })
        
    except Exception as e:
        logger.error(f"❌ Parse failed: {e}")
        return JSONResponse({
            "success": False,
            "error": sanitize_parsing_error(e),
            "metadata": {
                "model_used": None,
                "parse_time_seconds": 0,
                "success": False
            }
        }, status_code=500)
