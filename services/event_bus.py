"""
Event Bus for RestaurantIQ
Enables async decoupling of operations with Redis pub/sub for cross-instance communication.

Features:
- In-memory handlers for local processing
- Redis pub/sub for distributed events across instances
- Event persistence for debugging and replay
- Graceful fallback when Redis unavailable
"""
import asyncio
import json
import logging
import os
import threading
from typing import Dict, Callable, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

# Configuration
EVENT_LOG_MAX_SIZE = int(os.getenv("EVENT_LOG_MAX_SIZE", "1000"))
REDIS_EVENT_CHANNEL_PREFIX = "events:"


@dataclass
class EventRecord:
    """Structured event record."""
    event_type: str
    data: Dict[str, Any]
    timestamp: str
    source_instance: str
    handlers_triggered: int = 0
    redis_published: bool = False


class EventBus:
    """
    Production-grade event bus with Redis pub/sub support.
    
    Supports both local handlers and distributed events via Redis.
    """
    
    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}
        self._event_log: List[EventRecord] = []
        self._instance_id = f"{os.getpid()}_{id(self)}"
        self._redis = None
        self._redis_enabled = False
        self._subscriber_thread: Optional[threading.Thread] = None
        self._running = False
        
        # Initialize Redis connection
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection for pub/sub."""
        try:
            from services.redis_client import cache
            if cache.enabled and cache.client:
                self._redis = cache.client
                self._redis_enabled = True
                logger.info(f"✅ Event bus using Redis pub/sub (instance: {self._instance_id})")
                
                # Start subscriber thread for distributed events
                self._start_subscriber()
            else:
                logger.info("⚠️ Event bus using in-memory only (Redis unavailable)")
        except ImportError:
            logger.info("⚠️ Event bus using in-memory only (redis_client not found)")
        except Exception as e:
            logger.warning(f"⚠️ Event bus Redis init failed: {e}")
    
    def _start_subscriber(self):
        """Start background thread to listen for Redis pub/sub events."""
        if not self._redis_enabled or self._subscriber_thread:
            return
        
        self._running = True
        self._subscriber_thread = threading.Thread(
            target=self._redis_subscriber_loop,
            daemon=True,
            name="EventBusSubscriber"
        )
        self._subscriber_thread.start()
        logger.info("📡 Event bus Redis subscriber started")
    
    def _redis_subscriber_loop(self):
        """Background loop to receive Redis pub/sub messages."""
        try:
            # Create a separate connection for subscribing
            pubsub = self._redis.pubsub()
            pubsub.psubscribe(f"{REDIS_EVENT_CHANNEL_PREFIX}*")
            
            for message in pubsub.listen():
                if not self._running:
                    break
                
                if message["type"] == "pmessage":
                    try:
                        channel = message["channel"]
                        event_type = channel.replace(REDIS_EVENT_CHANNEL_PREFIX, "")
                        payload = json.loads(message["data"])
                        
                        # Skip events from this instance (already processed locally)
                        if payload.get("source_instance") == self._instance_id:
                            continue
                        
                        logger.debug(f"📥 Received distributed event: {event_type}")
                        
                        # Trigger local handlers for distributed event
                        self._trigger_handlers_sync(event_type, payload.get("data", {}))
                        
                    except Exception as e:
                        logger.error(f"Error processing Redis event: {e}")
            
            pubsub.close()
            
        except Exception as e:
            logger.error(f"Redis subscriber loop error: {e}")
            self._redis_enabled = False
    
    def _trigger_handlers_sync(self, event_type: str, data: Dict):
        """Trigger handlers synchronously (for Redis subscriber thread)."""
        if event_type not in self._handlers:
            return
        
        for handler in self._handlers[event_type]:
            try:
                # Run async handler in new event loop
                if asyncio.iscoroutinefunction(handler):
                    asyncio.run(handler(data))
                else:
                    handler(data)
            except Exception as e:
                logger.error(f"Handler error for {event_type}: {e}")
    
    def on(self, event_type: str):
        """
        Decorator to register an event handler.
        
        Usage:
            @event_bus.on("invoice.saved")
            async def process_invoice(data: Dict):
                # Handle event
        """
        def decorator(handler: Callable):
            if event_type not in self._handlers:
                self._handlers[event_type] = []
            self._handlers[event_type].append(handler)
            logger.info(f"📝 Registered handler for event: {event_type}")
            return handler
        return decorator
    
    def register_handler(self, event_type: str, handler: Callable):
        """Register a handler programmatically."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
        logger.info(f"📝 Registered handler for event: {event_type}")
    
    def emit(self, event_type: str, data: Dict, distributed: bool = True):
        """
        Emit an event (fire and forget).
        
        Args:
            event_type: Event name (e.g., "invoice.saved")
            data: Event payload
            distributed: If True, publish to Redis for other instances
        
        Returns immediately, handlers run in background.
        """
        # Create event record
        event = EventRecord(
            event_type=event_type,
            data=data,
            timestamp=datetime.utcnow().isoformat(),
            source_instance=self._instance_id,
            handlers_triggered=len(self._handlers.get(event_type, []))
        )
        
        # Log event
        self._log_event(event)
        
        logger.info(f"📤 Event emitted: {event_type} ({event.handlers_triggered} handlers)")
        
        # Publish to Redis for distributed processing
        if distributed and self._redis_enabled:
            try:
                channel = f"{REDIS_EVENT_CHANNEL_PREFIX}{event_type}"
                payload = {
                    "data": data,
                    "source_instance": self._instance_id,
                    "timestamp": event.timestamp
                }
                self._redis.publish(channel, json.dumps(payload, default=str))
                event.redis_published = True
                logger.debug(f"📡 Event published to Redis: {event_type}")
            except Exception as e:
                logger.error(f"Failed to publish event to Redis: {e}")
        
        # Trigger local handlers asynchronously
        self._trigger_handlers_async(event_type, data)
    
    def _trigger_handlers_async(self, event_type: str, data: Dict):
        """Trigger handlers asynchronously."""
        if event_type not in self._handlers:
            return
        
        for handler in self._handlers[event_type]:
            try:
                if asyncio.iscoroutinefunction(handler):
                    # Async handler
                    try:
                        loop = asyncio.get_running_loop()
                        asyncio.create_task(handler(data))
                    except RuntimeError:
                        # No running loop, run in thread
                        thread = threading.Thread(
                            target=lambda: asyncio.run(handler(data)),
                            daemon=True
                        )
                        thread.start()
                else:
                    # Sync handler - run in thread
                    thread = threading.Thread(
                        target=lambda h=handler, d=data: h(d),
                        daemon=True
                    )
                    thread.start()
            except Exception as e:
                logger.error(f"❌ Failed to trigger handler for {event_type}: {e}")
    
    async def emit_async(self, event_type: str, data: Dict, distributed: bool = True):
        """
        Emit an event and wait for all local handlers to complete.
        
        Use this when you need to ensure processing completes.
        """
        event = EventRecord(
            event_type=event_type,
            data=data,
            timestamp=datetime.utcnow().isoformat(),
            source_instance=self._instance_id,
            handlers_triggered=len(self._handlers.get(event_type, []))
        )
        
        self._log_event(event)
        
        logger.info(f"📤 Event emitted (sync): {event_type}")
        
        # Publish to Redis
        if distributed and self._redis_enabled:
            try:
                channel = f"{REDIS_EVENT_CHANNEL_PREFIX}{event_type}"
                payload = {
                    "data": data,
                    "source_instance": self._instance_id,
                    "timestamp": event.timestamp
                }
                self._redis.publish(channel, json.dumps(payload, default=str))
                event.redis_published = True
            except Exception as e:
                logger.error(f"Failed to publish event to Redis: {e}")
        
        # Wait for local handlers
        if event_type in self._handlers:
            tasks = []
            for handler in self._handlers[event_type]:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        tasks.append(asyncio.create_task(handler(data)))
                    else:
                        # Wrap sync handler
                        tasks.append(asyncio.to_thread(handler, data))
                except Exception as e:
                    logger.error(f"❌ Failed to trigger handler for {event_type}: {e}")
            
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
    
    def _log_event(self, event: EventRecord):
        """Log event with size limit."""
        self._event_log.append(event)
        
        # Trim log if too large
        if len(self._event_log) > EVENT_LOG_MAX_SIZE:
            self._event_log = self._event_log[-EVENT_LOG_MAX_SIZE:]
    
    def get_event_log(self, limit: int = 100, event_type: Optional[str] = None) -> List[Dict]:
        """Get recent events for debugging."""
        events = self._event_log
        
        if event_type:
            events = [e for e in events if e.event_type == event_type]
        
        return [asdict(e) for e in events[-limit:]]
    
    def clear_event_log(self):
        """Clear event log."""
        self._event_log.clear()
        logger.info("Event log cleared")
    
    def get_registered_handlers(self) -> Dict[str, int]:
        """Get count of handlers per event type."""
        return {event_type: len(handlers) for event_type, handlers in self._handlers.items()}
    
    def get_stats(self) -> Dict[str, Any]:
        """Get event bus statistics."""
        return {
            "instance_id": self._instance_id,
            "redis_enabled": self._redis_enabled,
            "registered_event_types": len(self._handlers),
            "total_handlers": sum(len(h) for h in self._handlers.values()),
            "event_log_size": len(self._event_log),
            "handlers_by_type": self.get_registered_handlers()
        }
    
    def shutdown(self):
        """Gracefully shutdown the event bus."""
        self._running = False
        if self._subscriber_thread:
            self._subscriber_thread.join(timeout=2)
        logger.info("Event bus shutdown complete")


# Global event bus instance
_event_bus: Optional[EventBus] = None


def get_event_bus() -> EventBus:
    """Get the global event bus instance."""
    global _event_bus
    if _event_bus is None:
        _event_bus = EventBus()
    return _event_bus


# Convenience functions for backward compatibility
def on(event_type: str):
    """Decorator to register an event handler."""
    return get_event_bus().on(event_type)


def emit_event(event_type: str, data: Dict, distributed: bool = True):
    """Emit an event (fire and forget)."""
    get_event_bus().emit(event_type, data, distributed)


async def emit_event_async(event_type: str, data: Dict, distributed: bool = True):
    """Emit an event and wait for handlers."""
    await get_event_bus().emit_async(event_type, data, distributed)


def get_event_log(limit: int = 100) -> List[Dict]:
    """Get recent events for debugging."""
    return get_event_bus().get_event_log(limit)


def clear_event_log():
    """Clear event log."""
    get_event_bus().clear_event_log()


def get_registered_handlers() -> Dict[str, int]:
    """Get count of handlers per event type."""
    return get_event_bus().get_registered_handlers()
