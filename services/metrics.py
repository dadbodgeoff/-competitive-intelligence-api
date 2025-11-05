"""
Simple Metrics Tracking for Beta
Tracks business events to database for analysis
"""
import os
import logging
from datetime import datetime
from typing import Dict, Optional
from supabase import create_client, Client

logger = logging.getLogger(__name__)


class SimpleMetrics:
    """Lightweight metrics tracking using Supabase"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            logger.warning("Metrics disabled: Supabase credentials not found")
            self.client = None
        else:
            self.client: Client = create_client(supabase_url, supabase_key)
    
    def track_event(self, user_id: str, event_name: str, properties: Optional[Dict] = None):
        """
        Track a business event
        
        Args:
            user_id: User who triggered the event
            event_name: Name of the event (e.g., "invoice_uploaded", "analysis_completed")
            properties: Additional event data (e.g., {"vendor": "sysco", "items": 50})
        """
        if not self.client:
            return  # Metrics disabled
        
        try:
            self.client.table("metrics_events").insert({
                "user_id": user_id,
                "event_name": event_name,
                "properties": properties or {},
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            logger.debug(f"📊 Tracked: {event_name} for user {user_id[:8]}...")
            
        except Exception as e:
            # Never let metrics break the app
            logger.error(f"Failed to track metric: {e}")
    
    def track_error(self, user_id: Optional[str], error_type: str, context: Dict):
        """Track errors for analysis"""
        self.track_event(
            user_id or "anonymous",
            "error_occurred",
            {
                "error_type": error_type,
                **context
            }
        )
    
    def track_revenue_event(self, user_id: str, event_name: str, amount: float, properties: Optional[Dict] = None):
        """Track revenue-related events"""
        props = properties or {}
        props["amount"] = amount
        self.track_event(user_id, event_name, props)


# Global instance
metrics = SimpleMetrics()


# Convenience functions for common events
def track_user_signup(user_id: str, tier: str = "free"):
    """Track new user signup"""
    metrics.track_event(user_id, "user_signup", {"tier": tier})


def track_invoice_uploaded(user_id: str, vendor: str, item_count: int):
    """Track invoice upload"""
    metrics.track_event(user_id, "invoice_uploaded", {
        "vendor": vendor,
        "item_count": item_count
    })


def track_analysis_completed(user_id: str, tier: str, competitor_count: int, duration_seconds: float):
    """Track completed analysis"""
    metrics.track_event(user_id, "analysis_completed", {
        "tier": tier,
        "competitor_count": competitor_count,
        "duration_seconds": duration_seconds
    })


def track_subscription_change(user_id: str, from_tier: str, to_tier: str):
    """Track subscription tier changes"""
    metrics.track_event(user_id, "subscription_changed", {
        "from_tier": from_tier,
        "to_tier": to_tier
    })


def track_menu_uploaded(user_id: str, item_count: int):
    """Track menu upload"""
    metrics.track_event(user_id, "menu_uploaded", {
        "item_count": item_count
    })


def track_menu_comparison(user_id: str, competitor_count: int):
    """Track menu comparison"""
    metrics.track_event(user_id, "menu_comparison_completed", {
        "competitor_count": competitor_count
    })
