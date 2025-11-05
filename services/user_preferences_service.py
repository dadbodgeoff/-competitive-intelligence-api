"""
User Preferences Service
Manages user-specific inventory preferences
Pattern: Follows services/inventory_service.py structure
"""
import os
from typing import Dict, Optional
from decimal import Decimal
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class UserPreferencesService:
    """Manage user inventory preferences"""
    
    # Default preferences
    DEFAULT_WASTE_BUFFERS = {
        "proteins": 1.0,
        "produce": 1.8,
        "dairy": 1.2,
        "dry_goods": 0.5,
        "frozen": 0.8,
        "beverages": 0.3,
        "disposables": 0.2,
        "cleaning": 0.1,
        "paper_goods": 0.1,
        "smallwares": 0.0
    }
    
    DEFAULT_CATEGORY_ORDER = [
        "proteins", "produce", "dairy", "dry_goods", "frozen",
        "beverages", "disposables", "cleaning", "paper_goods", "smallwares"
    ]
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def get_preferences(self, user_id: str) -> Dict:
        """
        Get user preferences (create defaults if missing)
        
        Args:
            user_id: User ID
        
        Returns:
            User preferences dict
        """
        result = self.client.table("user_inventory_preferences").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if result.data:
            logger.info(f"Retrieved preferences for user {user_id}")
            return result.data[0]
        
        # Create default preferences
        logger.info(f"Creating default preferences for user {user_id}")
        return self._create_default_preferences(user_id)
    
    def _create_default_preferences(self, user_id: str) -> Dict:
        """
        Create default preferences for user
        
        Args:
            user_id: User ID
        
        Returns:
            Created preferences
        """
        default_prefs = {
            "user_id": user_id,
            "default_waste_buffers": self.DEFAULT_WASTE_BUFFERS,
            "low_stock_threshold_days": 3.0,
            "price_increase_alert_percent": 5.0,
            "preferred_weight_unit": "lb",
            "preferred_volume_unit": "ga",
            "show_unit_conversions": True,
            "group_by_vendor": False,
            "default_category_order": self.DEFAULT_CATEGORY_ORDER,
            "hidden_categories": []
        }
        
        result = self.client.table("user_inventory_preferences").insert(
            default_prefs
        ).execute()
        
        return result.data[0]
    
    def update_preferences(self, user_id: str, updates: Dict) -> Dict:
        """
        Update user preferences
        
        Args:
            user_id: User ID
            updates: Dict of fields to update
        
        Returns:
            Updated preferences
        """
        # Ensure preferences exist
        self.get_preferences(user_id)
        
        # Update
        result = self.client.table("user_inventory_preferences").update(
            updates
        ).eq("user_id", user_id).execute()
        
        logger.info(f"Updated preferences for user {user_id}: {list(updates.keys())}")
        
        return result.data[0] if result.data else {}
    
    def get_waste_buffer(self, user_id: str, category: str) -> Decimal:
        """
        Get waste buffer percentage for category
        
        Args:
            user_id: User ID
            category: Item category
        
        Returns:
            Waste buffer as Decimal (e.g., 1.0 = 100%, 1.8 = 180%)
        """
        prefs = self.get_preferences(user_id)
        
        waste_buffers = prefs.get('default_waste_buffers', self.DEFAULT_WASTE_BUFFERS)
        
        # Get buffer for category, default to 1.0
        buffer = waste_buffers.get(category, 1.0)
        
        return Decimal(str(buffer))
    
    def get_alert_threshold(self, user_id: str) -> Decimal:
        """
        Get low stock alert threshold in days
        
        Args:
            user_id: User ID
        
        Returns:
            Threshold in days as Decimal
        """
        prefs = self.get_preferences(user_id)
        
        threshold = prefs.get('low_stock_threshold_days', 3.0)
        
        return Decimal(str(threshold))
    
    def get_price_alert_threshold(self, user_id: str) -> Decimal:
        """
        Get price increase alert threshold percentage
        
        Args:
            user_id: User ID
        
        Returns:
            Threshold percentage as Decimal (e.g., 5.0 = 5%)
        """
        prefs = self.get_preferences(user_id)
        
        threshold = prefs.get('price_increase_alert_percent', 5.0)
        
        return Decimal(str(threshold))
    
    def get_preferred_unit(self, user_id: str, unit_type: str) -> str:
        """
        Get preferred unit for type
        
        Args:
            user_id: User ID
            unit_type: 'weight' or 'volume'
        
        Returns:
            Preferred unit (lb, ga, etc.)
        """
        prefs = self.get_preferences(user_id)
        
        if unit_type == 'weight':
            return prefs.get('preferred_weight_unit', 'lb')
        elif unit_type == 'volume':
            return prefs.get('preferred_volume_unit', 'ga')
        else:
            return 'ea'
    
    def should_show_unit_conversions(self, user_id: str) -> bool:
        """
        Check if user wants to see unit conversions
        
        Args:
            user_id: User ID
        
        Returns:
            True if conversions should be shown
        """
        prefs = self.get_preferences(user_id)
        
        return prefs.get('show_unit_conversions', True)
    
    def get_category_order(self, user_id: str) -> list:
        """
        Get user's preferred category order
        
        Args:
            user_id: User ID
        
        Returns:
            List of categories in preferred order
        """
        prefs = self.get_preferences(user_id)
        
        return prefs.get('default_category_order', self.DEFAULT_CATEGORY_ORDER)
    
    def get_hidden_categories(self, user_id: str) -> list:
        """
        Get user's hidden categories
        
        Args:
            user_id: User ID
        
        Returns:
            List of hidden category names
        """
        prefs = self.get_preferences(user_id)
        
        return prefs.get('hidden_categories', [])
    
    def reset_to_defaults(self, user_id: str) -> Dict:
        """
        Reset user preferences to defaults
        
        Args:
            user_id: User ID
        
        Returns:
            Reset preferences
        """
        updates = {
            "default_waste_buffers": self.DEFAULT_WASTE_BUFFERS,
            "low_stock_threshold_days": 3.0,
            "price_increase_alert_percent": 5.0,
            "preferred_weight_unit": "lb",
            "preferred_volume_unit": "ga",
            "show_unit_conversions": True,
            "group_by_vendor": False,
            "default_category_order": self.DEFAULT_CATEGORY_ORDER,
            "hidden_categories": []
        }
        
        logger.info(f"Resetting preferences to defaults for user {user_id}")
        
        return self.update_preferences(user_id, updates)
