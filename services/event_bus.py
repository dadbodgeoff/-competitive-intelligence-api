"""
Simple Event Bus for Invoice Processing
Enables async decoupling of invoice save from inventory processing

Phase 1: In-memory event bus (current)
Phase 2: Redis pub/sub (future)
Phase 3: RabbitMQ/Kafka (production scale)
"""
import asyncio
import logging
from typing import Dict, Callable, List
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory event handlers registry
_handlers: Dict[str, List[Callable]] = {}

# Event log for debugging
_event_log: List[Dict] = []


def on(event_type: str):
    """
    Decorator to register an event handler
    
    Usage:
        @on("invoice.saved")
        async def process_invoice(data: Dict):
            # Handle event
    """
    def decorator(handler: Callable):
        if event_type not in _handlers:
            _handlers[event_type] = []
        _handlers[event_type].append(handler)
        logger.info(f"📝 Registered handler for event: {event_type}")
        return handler
    return decorator


def emit_event(event_type: str, data: Dict):
    """
    Emit an event (fire and forget)
    
    Args:
        event_type: Event name (e.g., "invoice.saved")
        data: Event payload (e.g., {"invoice_id": "...", "user_id": "..."})
    
    Returns immediately, handlers run in background
    """
    # Log event
    event_record = {
        "event_type": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "handlers_triggered": len(_handlers.get(event_type, []))
    }
    _event_log.append(event_record)
    
    logger.info(f"📤 Event emitted: {event_type} with {len(_handlers.get(event_type, []))} handlers")
    
    # Trigger handlers asynchronously
    if event_type in _handlers:
        for handler in _handlers[event_type]:
            try:
                # Get or create event loop
                try:
                    loop = asyncio.get_running_loop()
                    # We're in an async context, create task
                    asyncio.create_task(handler(data))
                except RuntimeError:
                    # No running loop, we're in sync context
                    # Create new loop and run in thread
                    import threading
                    def run_handler():
                        asyncio.run(handler(data))
                    thread = threading.Thread(target=run_handler, daemon=True)
                    thread.start()
            except Exception as e:
                logger.error(f"❌ Failed to trigger handler for {event_type}: {e}")


async def emit_event_async(event_type: str, data: Dict):
    """
    Emit an event and wait for all handlers to complete
    
    Use this when you need to ensure processing completes
    """
    event_record = {
        "event_type": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "handlers_triggered": len(_handlers.get(event_type, []))
    }
    _event_log.append(event_record)
    
    logger.info(f"📤 Event emitted (sync): {event_type}")
    
    if event_type in _handlers:
        tasks = []
        for handler in _handlers[event_type]:
            try:
                tasks.append(asyncio.create_task(handler(data)))
            except Exception as e:
                logger.error(f"❌ Failed to trigger handler for {event_type}: {e}")
        
        # Wait for all handlers
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)


def get_event_log(limit: int = 100) -> List[Dict]:
    """Get recent events for debugging"""
    return _event_log[-limit:]


def clear_event_log():
    """Clear event log"""
    _event_log.clear()


def get_registered_handlers() -> Dict[str, int]:
    """Get count of handlers per event type"""
    return {event_type: len(handlers) for event_type, handlers in _handlers.items()}
