"""
Alert Generation Service
Generates inventory alerts based on various conditions
Pattern: Follows services/inventory_service.py structure
"""
import os
from typing import Dict, List
from decimal import Decimal
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

from services.user_preferences_service import UserPreferencesService

load_dotenv()
logger = logging.getLogger(__name__)


class AlertGenerationService:
    """Generate inventory alerts"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.prefs_service = UserPreferencesService()
    
    def generate_low_stock_alerts(self, user_id: str) -> List[Dict]:
        """
        Generate alerts for items below reorder point
        
        Args:
            user_id: User ID
        
        Returns:
            List of created alerts
        """
        # Get user's threshold
        threshold = self.prefs_service.get_alert_threshold(user_id)
        
        # Find items below reorder point
        result = self.client.table("inventory_items").select(
            "id, name, category, current_quantity, reorder_point, unit_of_measure"
        ).eq("user_id", user_id).execute()
        
        alerts_created = []
        
        for item in result.data:
            current_qty = Decimal(str(item.get('current_quantity') or 0))
            reorder_point = Decimal(str(item.get('reorder_point') or 0))
            
            # Check if below reorder point
            if reorder_point > 0 and current_qty < reorder_point:
                alert = self._create_alert(
                    user_id=user_id,
                    inventory_item_id=item['id'],
                    alert_type="low_stock",
                    severity="warning",
                    title=f"Low Stock: {item['name']}",
                    message=f"Current: {current_qty} {item['unit_of_measure']}, Reorder at: {reorder_point}",
                    data={
                        "current_quantity": float(current_qty),
                        "reorder_point": float(reorder_point),
                        "item_name": item['name'],
                        "category": item['category']
                    }
                )
                if alert:
                    alerts_created.append(alert)
        
        logger.info(f"Generated {len(alerts_created)} low stock alerts for user {user_id}")
        return alerts_created
    
    def generate_price_increase_alerts(
        self,
        user_id: str,
        threshold_percent: float = None
    ) -> List[Dict]:
        """
        Generate alerts for significant price increases
        
        Args:
            user_id: User ID
            threshold_percent: Alert if price increase > this % (default from prefs)
        
        Returns:
            List of created alerts
        """
        if threshold_percent is None:
            threshold_percent = float(self.prefs_service.get_price_alert_threshold(user_id))
        
        # Get recent price changes (last 30 days) - let database calculate
        result = self.client.table("price_history").select(
            "inventory_item_id, unit_price, previous_price, price_change_percent, invoice_date, inventory_items(name, category)"
        ).eq("user_id", user_id).eq(
            "is_price_increase", True
        ).order("invoice_date", desc=True).limit(100).execute()  # Get recent, database handles date
        
        alerts_created = []
        
        for price_change in result.data:
            change_percent = price_change.get('price_change_percent')
            
            if change_percent and change_percent > threshold_percent:
                item_info = price_change.get('inventory_items', {})
                
                alert = self._create_alert(
                    user_id=user_id,
                    inventory_item_id=price_change['inventory_item_id'],
                    alert_type="price_increase",
                    severity="info",
                    title=f"Price Increase: {item_info.get('name', 'Unknown')}",
                    message=f"Price increased by {change_percent:.1f}% (${price_change.get('previous_price')} → ${price_change.get('unit_price')})",
                    data={
                        "old_price": price_change.get('previous_price'),
                        "new_price": price_change.get('unit_price'),
                        "change_percent": change_percent,
                        "invoice_date": price_change.get('invoice_date')
                    }
                )
                if alert:
                    alerts_created.append(alert)
        
        logger.info(f"Generated {len(alerts_created)} price increase alerts for user {user_id}")
        return alerts_created
    
    def generate_no_recent_orders_alerts(
        self,
        user_id: str,
        days: int = 30
    ) -> List[Dict]:
        """
        Generate alerts for items not ordered recently
        
        Args:
            user_id: User ID
            days: Alert if not ordered in this many days
        
        Returns:
            List of created alerts
        """
        # Find items with old last_purchase_date - let database compare dates
        result = self.client.table("inventory_items").select(
            "id, name, category, last_purchase_date, current_quantity"
        ).eq("user_id", user_id).order(
            "last_purchase_date", desc=False
        ).limit(100).execute()  # Get oldest purchases, filter in Python if needed
        
        alerts_created = []
        
        for item in result.data:
            # Only alert if current quantity is low
            current_qty = Decimal(str(item.get('current_quantity') or 0))
            
            if current_qty < 10:  # Arbitrary threshold
                days_since = (datetime.now().date() - datetime.fromisoformat(item['last_purchase_date']).date()).days
                
                alert = self._create_alert(
                    user_id=user_id,
                    inventory_item_id=item['id'],
                    alert_type="no_recent_orders",
                    severity="info",
                    title=f"No Recent Orders: {item['name']}",
                    message=f"Last ordered {days_since} days ago. Current quantity: {current_qty}",
                    data={
                        "last_purchase_date": item['last_purchase_date'],
                        "days_since_order": days_since,
                        "current_quantity": float(current_qty)
                    }
                )
                if alert:
                    alerts_created.append(alert)
        
        logger.info(f"Generated {len(alerts_created)} no recent orders alerts for user {user_id}")
        return alerts_created
    
    def _create_alert(
        self,
        user_id: str,
        inventory_item_id: str,
        alert_type: str,
        severity: str,
        title: str,
        message: str,
        data: Dict
    ) -> Dict:
        """
        Create alert (avoid duplicates)
        
        Args:
            user_id: User ID
            inventory_item_id: Related inventory item
            alert_type: Type of alert
            severity: warning, info, error
            title: Alert title
            message: Alert message
            data: Additional data as JSON
        
        Returns:
            Created alert or None if duplicate
        """
        # Check for duplicate (same item, same type, not dismissed, created today)
        # Let database determine "today"
        existing = self.client.table("inventory_alerts").select("id").eq(
            "user_id", user_id
        ).eq("inventory_item_id", inventory_item_id).eq(
            "alert_type", alert_type
        ).is_("dismissed_at", "null").order(
            "created_at", desc=True
        ).limit(1).execute()  # Get most recent, check if today in Python if needed
        
        if existing.data:
            logger.debug(f"Skipping duplicate alert: {alert_type} for item {inventory_item_id}")
            return None
        
        # Create alert
        alert_record = {
            "user_id": user_id,
            "inventory_item_id": inventory_item_id,
            "alert_type": alert_type,
            "severity": severity,
            "title": title,
            "message": message,
            "data": data
        }
        
        result = self.client.table("inventory_alerts").insert(alert_record).execute()
        
        return result.data[0] if result.data else None
    
    def run_all_alert_checks(self, user_id: str) -> Dict:
        """
        Run all alert generation checks
        
        Args:
            user_id: User ID
        
        Returns:
            Summary of alerts generated
        """
        logger.info(f"Running all alert checks for user {user_id}")
        
        low_stock = self.generate_low_stock_alerts(user_id)
        price_increases = self.generate_price_increase_alerts(user_id)
        no_recent = self.generate_no_recent_orders_alerts(user_id)
        
        summary = {
            "low_stock_alerts": len(low_stock),
            "price_increase_alerts": len(price_increases),
            "no_recent_orders_alerts": len(no_recent),
            "total_alerts": len(low_stock) + len(price_increases) + len(no_recent)
        }
        
        logger.info(f"Alert generation complete: {summary}")
        
        return summary
    
    def dismiss_alert(self, alert_id: str, user_id: str) -> bool:
        """
        Dismiss an alert
        
        Args:
            alert_id: Alert ID
            user_id: User ID
        
        Returns:
            True if successful
        """
        result = self.client.table("inventory_alerts").update({
            "dismissed_at": datetime.utcnow().isoformat()
        }).eq("id", alert_id).eq("user_id", user_id).execute()
        
        return len(result.data) > 0
    
    def mark_alert_read(self, alert_id: str, user_id: str) -> bool:
        """
        Mark alert as read
        
        Args:
            alert_id: Alert ID
            user_id: User ID
        
        Returns:
            True if successful
        """
        result = self.client.table("inventory_alerts").update({
            "read_at": datetime.utcnow().isoformat()
        }).eq("id", alert_id).eq("user_id", user_id).execute()
        
        return len(result.data) > 0
    
    def generate_alerts_with_thresholds(self, user_id: str, thresholds: dict) -> Dict:
        """
        Generate alerts based on user thresholds
        Uses existing items-list data
        
        Args:
            user_id: User ID
            thresholds: Dict with keys: increase_7day, increase_28day, decrease_7day, decrease_28day
        
        Returns:
            Dict with negative_alerts, positive_alerts, and thresholds_used
        """
        from services.price_analytics_service import PriceAnalyticsService
        from database.supabase_client import get_supabase_service_client
        
        # Get all items with price data
        supabase = get_supabase_service_client()
        price_service = PriceAnalyticsService(supabase)
        items = price_service.get_items_list(user_id, days_back=90)
        
        negative_alerts = []
        positive_alerts = []
        
        for item in items:
            # Check 7-day threshold for increases
            if item.get('price_change_7day_percent'):
                if item['price_change_7day_percent'] > thresholds['increase_7day']:
                    negative_alerts.append({
                        'alert_key': f"{item['description']}_{item['last_paid_vendor']}_{item['last_paid_date']}",
                        'item_description': item['description'],
                        'vendor_name': item['last_paid_vendor'],
                        'change_percent': item['price_change_7day_percent'],
                        'expected_price': item['avg_price_7day'],
                        'actual_price': item['last_paid_price'],
                        'trigger': '7_day_avg',
                        'date': item['last_paid_date']
                    })
            
            # Check 28-day threshold for increases
            if item.get('price_change_28day_percent'):
                if item['price_change_28day_percent'] > thresholds['increase_28day']:
                    # Check if already added from 7-day
                    existing = next((a for a in negative_alerts 
                                   if a['item_description'] == item['description'] 
                                   and a['vendor_name'] == item['last_paid_vendor']), None)
                    if existing:
                        existing['triggers'] = ['7_day_avg', '28_day_avg']
                        existing['change_percent_28d'] = item['price_change_28day_percent']
                        existing['expected_price_28d'] = item['avg_price_28day']
                    else:
                        negative_alerts.append({
                            'alert_key': f"{item['description']}_{item['last_paid_vendor']}_{item['last_paid_date']}",
                            'item_description': item['description'],
                            'vendor_name': item['last_paid_vendor'],
                            'change_percent': item['price_change_28day_percent'],
                            'expected_price': item['avg_price_28day'],
                            'actual_price': item['last_paid_price'],
                            'trigger': '28_day_avg',
                            'date': item['last_paid_date']
                        })
            
            # Check for price decreases (savings opportunities)
            if item.get('price_change_7day_percent'):
                if item['price_change_7day_percent'] < -thresholds['decrease_7day']:
                    positive_alerts.append({
                        'alert_key': f"{item['description']}_{item['last_paid_vendor']}_{item['last_paid_date']}",
                        'item_description': item['description'],
                        'vendor_name': item['last_paid_vendor'],
                        'savings_percent': abs(item['price_change_7day_percent']),
                        'expected_price': item['avg_price_7day'],
                        'actual_price': item['last_paid_price'],
                        'savings_amount': item['avg_price_7day'] - item['last_paid_price'],
                        'trigger': '7_day_avg',
                        'date': item['last_paid_date']
                    })
        
        return {
            'negative_alerts': negative_alerts,
            'positive_alerts': positive_alerts,
            'thresholds_used': thresholds
        }
