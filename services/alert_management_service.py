"""
Alert Management Service
Manages alert acknowledgments and dismissals
Pattern: Follows services/user_preferences_service.py structure
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class AlertManagementService:
    """Manage alert acknowledgments and dismissals"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def acknowledge_alert(self, user_id: str, alert_data: dict) -> Dict:
        """
        Mark alert as acknowledged
        
        Args:
            user_id: User ID
            alert_data: Dict with alert_type, alert_key, item_description, vendor_name, notes
        
        Returns:
            Created acknowledgment record
        """
        result = self.client.table('alert_acknowledgments').insert({
            'user_id': user_id,
            'alert_type': alert_data['alert_type'],
            'alert_key': alert_data['alert_key'],
            'item_description': alert_data['item_description'],
            'vendor_name': alert_data.get('vendor_name'),
            'dismissed': False,
            'notes': alert_data.get('notes')
        }).execute()
        
        logger.info(f"Acknowledged alert for user {user_id}: {alert_data['alert_key']}")
        return result.data[0] if result.data else {}
    
    def dismiss_alert(self, user_id: str, alert_key: str, alert_type: str) -> Dict:
        """
        Dismiss an alert
        
        Args:
            user_id: User ID
            alert_key: Unique alert identifier
            alert_type: Type of alert (price_increase or savings_opportunity)
        
        Returns:
            Updated acknowledgment record
        """
        result = self.client.table('alert_acknowledgments').upsert({
            'user_id': user_id,
            'alert_type': alert_type,
            'alert_key': alert_key,
            'dismissed': True
        }).execute()
        
        logger.info(f"Dismissed alert for user {user_id}: {alert_key}")
        return result.data[0] if result.data else {}
    
    def get_dismissed_alerts(self, user_id: str, alert_type: str) -> List[str]:
        """
        Get list of dismissed alert keys
        
        Args:
            user_id: User ID
            alert_type: Type of alert to filter
        
        Returns:
            List of dismissed alert keys
        """
        result = self.client.table('alert_acknowledgments')\
            .select('alert_key')\
            .eq('user_id', user_id)\
            .eq('alert_type', alert_type)\
            .eq('dismissed', True)\
            .execute()
        return [r['alert_key'] for r in result.data]
