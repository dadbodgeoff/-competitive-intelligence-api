"""
Menu Parser Streaming Service
Streams real-time parsing progress to frontend via SSE
Pattern: Follows services/invoice_parser_streaming.py
"""
import asyncio
import json
import time
from typing import AsyncGenerator, Dict, Optional
from services.menu_parser_service import MenuParserService
from services.menu_validator_service import MenuValidatorService


class MenuParserStreaming:
    """Stream menu parsing progress via SSE"""
    
    def __init__(self):
        self.parser = MenuParserService()
        self.validator = MenuValidatorService()
    
    async def parse_menu_streaming(
        self,
        file_url: str,
        user_id: str,
        restaurant_name_hint: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream menu parsing progress and results
        
        Yields SSE events:
        - parsing_started
        - parsing_progress (heartbeat every 10s)
        - parsed_data
        - validation_complete
        - error
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"🚀 Starting menu parsing stream")
            logger.debug(f"File URL provided")
            logger.debug(f"Restaurant hint: {restaurant_name_hint or 'None'}")
            
            # Event 1: Start parsing
            yield self._format_sse_event(
                "parsing_started",
                {
                    "status": "parsing",
                    "message": "Processing your menu...",
                    "timestamp": time.time()
                }
            )
            await asyncio.sleep(0.1)  # Force flush
            
            logger.info("✅ Sent parsing_started event")
            
            # Start parse in background task
            logger.info("🔄 Creating parse task...")
            parse_task = asyncio.create_task(
                self.parser.parse_menu(
                    file_url=file_url,
                    user_id=user_id,
                    restaurant_name_hint=restaurant_name_hint
                )
            )
            logger.info("✅ Parse task created")
            
            # Send heartbeat every 5 seconds while parsing (more frequent updates)
            elapsed = 0
            heartbeat_interval = 5
            while not parse_task.done():
                await asyncio.sleep(heartbeat_interval)
                elapsed += heartbeat_interval
                
                yield self._format_sse_event(
                    "parsing_progress",
                    {
                        "status": "parsing",
                        "elapsed_seconds": elapsed,
                        "message": f"Still processing... ({elapsed}s)",
                        "timestamp": time.time()
                    }
                )
                await asyncio.sleep(0.1)  # Force flush
            
            # Get parse result
            logger.info("⏳ Waiting for parse task to complete...")
            result = await parse_task
            
            if not result['metadata']['success']:
                raise Exception(result['metadata'].get('error', 'Parsing failed'))
            
            logger.info(f"✅ Parse completed! Model: {result['metadata'].get('model_used')}, Time: {result['metadata'].get('parse_time_seconds')}s")
            logger.info("=" * 80)
            logger.info(f"📊 STREAMING: About to send parsed_data event")
            logger.info(f"   Items in result: {len(result['menu_data'].get('menu_items', []))}")
            logger.info(f"   Restaurant name: {result['menu_data'].get('restaurant_name')}")
            logger.info("=" * 80)
            
            # Event 2: Parsed data
            yield self._format_sse_event(
                "parsed_data",
                {
                    "status": "parsed",
                    "menu_data": result['menu_data'],
                    "metadata": result['metadata'],
                    "timestamp": time.time()
                }
            )
            
            logger.info("✅ Sent parsed_data event")
            
            # Event 3: Validation complete
            validation = self.validator.validate_menu(result['menu_data'])
            
            yield self._format_sse_event(
                "validation_complete",
                {
                    "status": "ready",
                    "validation": validation,
                    "message": "Menu ready for review",
                    "timestamp": time.time()
                }
            )
            
            logger.info("✅ Sent validation_complete event")
            
        except Exception as e:
            # Stream error event
            logger.error(f"❌ PARSING FAILED: {type(e).__name__}: {str(e)}")
            logger.error(f"📍 Error details:", exc_info=True)
            
            error_type = self._classify_error(e)
            logger.error(f"🏷️ Error classified as: {error_type}")
            
            yield self._format_sse_event(
                "error",
                {
                    "status": "error",
                    "error_type": error_type,
                    "message": self._get_user_friendly_error(error_type, e),
                    "technical_error": str(e),
                    "timestamp": time.time()
                }
            )
            
            logger.info("✅ Sent error event to client")
    
    def _format_sse_event(self, event: str, data: Dict) -> str:
        """Format data as Server-Sent Event"""
        return f"event: {event}\ndata: {json.dumps(data)}\n\n"
    
    def _classify_error(self, error: Exception) -> str:
        """Classify error type for user-friendly messaging"""
        error_str = str(error).lower()
        
        if "rate" in error_str or "429" in error_str:
            return "rate_limited"
        elif "timeout" in error_str:
            return "timeout"
        elif "invalid" in error_str or "corrupt" in error_str:
            return "invalid_file"
        elif "not found" in error_str or "404" in error_str:
            return "file_not_found"
        else:
            return "unknown_error"
    
    def _get_user_friendly_error(self, error_type: str, error: Exception) -> str:
        """Get user-friendly error message"""
        messages = {
            "rate_limited": "System is busy right now. Please try again in a moment.",
            "timeout": "Processing took too long. Please try again or contact support.",
            "invalid_file": "This file doesn't appear to be a valid menu. Please check and try again.",
            "file_not_found": "File not found. Please upload again.",
            "unknown_error": "Something went wrong. Our team has been notified."
        }
        
        return messages.get(error_type, f"Error: {str(error)}")
