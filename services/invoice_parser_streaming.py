"""
Invoice Parser Streaming Service
Streams real-time parsing progress to frontend via SSE
Pattern: Follows services/streaming_orchestrator.py
"""
import asyncio
import json
import time
from typing import AsyncGenerator, Dict, Optional
from services.invoice_parser_service import InvoiceParserService
from services.invoice_post_processor import InvoicePostProcessor
from services.invoice_validator_service import InvoiceValidatorService
from services.error_classifier import classify_invoice_error, get_user_friendly_message


class InvoiceParserStreaming:
    def __init__(self):
        self.parser = InvoiceParserService()
        self.post_processor = InvoicePostProcessor()
        self.validator = InvoiceValidatorService()
    
    async def parse_invoice_streaming(
        self,
        file_url: str,
        user_id: str,
        vendor_hint: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream invoice parsing progress and results
        
        Yields SSE events:
        - parsing_started
        - parsing_progress (heartbeat every 5s)
        - parsed_data
        - validation_complete
        - error
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"🚀 Starting invoice parsing stream")
            logger.debug(f"File URL provided")
            logger.debug(f"Vendor hint: {vendor_hint or 'None'}")
            
            # Event 1: Start parsing
            yield self._format_sse_event(
                "parsing_started",
                {
                    "status": "parsing",
                    "message": "Processing your invoice...",
                    "timestamp": time.time()
                }
            )
            # Force flush with a small delay
            await asyncio.sleep(0.1)
            
            logger.info("✅ Sent parsing_started event")
            
            # Start parse in background task
            logger.info("🔄 Creating parse task...")
            parse_task = asyncio.create_task(
                self.parser.parse_invoice(
                    file_url=file_url,
                    vendor_hint=vendor_hint,
                    user_id=user_id
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
                # Force flush
                await asyncio.sleep(0.1)
            
            # Get parse result
            logger.info("⏳ Waiting for parse task to complete...")
            result = await parse_task
            logger.info(f"✅ Parse completed! Model: {result['metadata'].get('model_used')}, Time: {result['metadata'].get('parse_time_seconds')}s")
            logger.info(f"📊 Extracted {len(result['invoice_data'].get('line_items', []))} line items")
            
            # Event 2: Parsed data (with post-processing already applied)
            yield self._format_sse_event(
                "parsed_data",
                {
                    "status": "parsed",
                    "invoice_data": result['invoice_data'],
                    "metadata": result['metadata'],
                    "timestamp": time.time()
                }
            )
            await asyncio.sleep(0.1)  # Force flush
            
            logger.info("✅ Sent parsed_data event")
            
            # Event 3: Validation complete
            validation = self.validator.validate_invoice(result['invoice_data'])
            
            yield self._format_sse_event(
                "validation_complete",
                {
                    "status": "ready",
                    "validation": validation,
                    "post_processing": result['invoice_data'].get('post_processing', {}),
                    "message": "Invoice ready for review",
                    "timestamp": time.time()
                }
            )
            await asyncio.sleep(0.1)  # Force flush
            
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
        return classify_invoice_error(error)
    
    def _get_user_friendly_error(self, error_type: str, error: Exception) -> str:
        """Get user-friendly error message"""
        return get_user_friendly_message(error_type, error)
