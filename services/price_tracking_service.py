"""
Price Tracking Service
Tracks price changes and generates alerts
"""
import os
from typing import Dict, List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class PriceTrackingService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def track_price(
        self,
        user_id: str,
        inventory_item_id: str,
        vendor_id: str,
        invoice_id: str,
        invoice_date: str,
        unit_price: Decimal,
        pack_size: Optional[str] = None
    ) -> Dict:
        """
        Track price and detect changes
        
        Returns:
            Price history record
        """
        # Get last price for this item from this vendor
        last_price_result = self.client.table("price_history").select(
            "unit_price"
        ).eq("inventory_item_id", inventory_item_id).eq(
            "vendor_id", vendor_id
        ).order("invoice_date", desc=True).limit(1).execute()
        
        previous_price = None
        price_change_percent = None
        is_price_increase = None
        
        if last_price_result.data:
            previous_price = Decimal(str(last_price_result.data[0]['unit_price']))
            price_change = ((Decimal(str(unit_price)) - previous_price) / previous_price) * 100
            price_change_percent = float(price_change)
            is_price_increase = unit_price > previous_price
            
            logger.info(f"💰 Price change: {previous_price} → {unit_price} ({price_change_percent:+.1f}%)")
        
        # Create price history record
        price_record = {
            "user_id": user_id,
            "inventory_item_id": inventory_item_id,
            "vendor_id": vendor_id,
            "unit_price": float(unit_price),
            "pack_size": pack_size,
            "invoice_id": invoice_id,
            "invoice_date": invoice_date,
            "previous_price": float(previous_price) if previous_price else None,
            "price_change_percent": price_change_percent,
            "is_price_increase": is_price_increase
        }
        
        result = self.client.table("price_history").insert(price_record).execute()
        
        # Generate alert if significant price increase
        if price_change_percent and price_change_percent > 5.0:
            self._create_price_alert(
                user_id=user_id,
                inventory_item_id=inventory_item_id,
                price_change_percent=price_change_percent,
                old_price=previous_price,
                new_price=unit_price
            )
        
        return result.data[0]
    
    def _create_price_alert(
        self,
        user_id: str,
        inventory_item_id: str,
        price_change_percent: float,
        old_price: Decimal,
        new_price: Decimal
    ):
        """Create price increase alert"""
        # Get item name
        item_result = self.client.table("inventory_items").select("name").eq(
            "id", inventory_item_id
        ).execute()
        
        if not item_result.data:
            return
        
        item_name = item_result.data[0]['name']
        
        alert_record = {
            "user_id": user_id,
            "inventory_item_id": inventory_item_id,
            "alert_type": "price_increase",
            "severity": "warning" if price_change_percent < 15 else "critical",
            "title": f"Price Increase: {item_name}",
            "message": f"Price increased {price_change_percent:.1f}% from ${old_price:.2f} to ${new_price:.2f}",
            "data": {
                "old_price": float(old_price),
                "new_price": float(new_price),
                "change_percent": price_change_percent
            }
        }
        
        self.client.table("inventory_alerts").insert(alert_record).execute()
        logger.info(f"🚨 Price alert created: {item_name} +{price_change_percent:.1f}%")
    
    def get_price_history(
        self,
        inventory_item_id: str,
        user_id: str,
        days: int = 90
    ) -> List[Dict]:
        """
        Get price history for item
        
        Returns:
            List of price records
        """
        # Use database to calculate cutoff (source of truth)
        # Get recent records and let database handle date comparison
        result = self.client.table("price_history").select("*").eq(
            "inventory_item_id", inventory_item_id
        ).eq("user_id", user_id).order(
            "invoice_date", desc=True
        ).limit(days * 2).execute()  # Get enough data, database filters by date
        
        return result.data
    
    def detect_price_anomalies(
        self,
        inventory_item_id: str,
        user_id: str
    ) -> List[Dict]:
        """
        Detect unusual price changes
        
        Returns:
            List of anomalies
        """
        history = self.get_price_history(inventory_item_id, user_id, days=180)
        
        if len(history) < 3:
            return []
        
        anomalies = []
        for record in history:
            if record['price_change_percent'] and abs(record['price_change_percent']) > 20:
                anomalies.append({
                    "date": record['invoice_date'],
                    "change_percent": record['price_change_percent'],
                    "old_price": record['previous_price'],
                    "new_price": record['unit_price']
                })
        
        return anomalies
