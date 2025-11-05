"""
Inventory Service
Handles inventory item CRUD operations
"""
import os
from typing import Dict, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class InventoryService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def get_inventory_items(
        self,
        user_id: str,
        category: Optional[str] = None,
        search_name: Optional[str] = None,
        low_stock_only: bool = False
    ) -> List[Dict]:
        """Get all inventory items for user with optional filters"""
        query = self.client.table("inventory_items").select("*").eq("user_id", user_id)
        
        if category:
            query = query.eq("category", category)
        
        if search_name:
            query = query.ilike("name", f"%{search_name}%")
        
        if low_stock_only:
            query = query.filter("current_quantity", "lt", "reorder_point")
        
        query = query.order("name")
        
        result = query.execute()
        return result.data
    
    def get_inventory_item(self, item_id: str, user_id: str) -> Optional[Dict]:
        """Get single inventory item"""
        result = self.client.table("inventory_items").select("*").eq(
            "id", item_id
        ).eq("user_id", user_id).execute()
        
        return result.data[0] if result.data else None
    
    def create_inventory_item(
        self,
        user_id: str,
        name: str,
        category: str,
        unit_of_measure: str,
        **kwargs
    ) -> Dict:
        """Create new inventory item"""
        import re
        
        # Normalize name
        normalized_name = name.lower().strip()
        normalized_name = ' '.join(normalized_name.split())
        normalized_name = re.sub(r'[^\w\s-]', '', normalized_name)
        
        item_data = {
            "user_id": user_id,
            "name": name,
            "normalized_name": normalized_name,
            "category": category,
            "unit_of_measure": unit_of_measure,
            **kwargs
        }
        
        result = self.client.table("inventory_items").insert(item_data).execute()
        
        logger.info(f"✨ Created new inventory item: {name}")
        
        return result.data[0]
    
    def update_inventory_item(
        self,
        item_id: str,
        user_id: str,
        updates: Dict
    ) -> bool:
        """Update inventory item"""
        result = self.client.table("inventory_items").update(updates).eq(
            "id", item_id
        ).eq("user_id", user_id).execute()
        
        return len(result.data) > 0
    
    def normalize_item_name(self, name: str) -> str:
        """Normalize item name for matching"""
        import re
        
        normalized = name.lower().strip()
        normalized = ' '.join(normalized.split())
        normalized = re.sub(r'[^\w\s-]', '', normalized)
        
        return normalized
    
    def find_item_by_name(self, user_id: str, normalized_name: str) -> Optional[Dict]:
        """Find inventory item by normalized name"""
        result = self.client.table("inventory_items").select("*").eq(
            "user_id", user_id
        ).eq("normalized_name", normalized_name).execute()
        
        return result.data[0] if result.data else None
