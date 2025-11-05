"""
Inventory Transaction Service
Records all inventory changes with audit trail
"""
import os
from typing import Dict, List
from decimal import Decimal
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

from services.unit_converter import UnitConverter

load_dotenv()
logger = logging.getLogger(__name__)


class InventoryTransactionService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.unit_converter = UnitConverter()
    
    def record_purchase(
        self,
        user_id: str,
        inventory_item_id: str,
        quantity: Decimal,
        unit_cost: Decimal,
        invoice_id: str,
        invoice_date: str,
        pack_size: str = None
    ) -> Dict:
        """
        Record inventory purchase transaction
        
        Args:
            invoice_date: Business date from invoice (YYYY-MM-DD)
            pack_size: Optional pack size for unit conversion (e.g., "12 x 2 lb")
        
        Returns:
            Transaction record
        """
        # Convert to base units if pack size provided
        if pack_size:
            base_quantity, base_unit = self.unit_converter.calculate_total_quantity(
                pack_size, int(quantity)
            )
            logger.info(f"Unit conversion: {quantity} × {pack_size} = {base_quantity} {base_unit}")
            quantity = base_quantity
        
        # Get current quantity
        item_result = self.client.table("inventory_items").select(
            "current_quantity, name"
        ).eq("id", inventory_item_id).execute()
        
        if not item_result.data:
            raise ValueError(f"Inventory item {inventory_item_id} not found")
        
        item = item_result.data[0]
        current_qty = Decimal(str(item['current_quantity']))
        new_qty = current_qty + Decimal(str(quantity))
        
        # Create transaction record
        transaction_record = {
            "user_id": user_id,
            "inventory_item_id": inventory_item_id,
            "transaction_type": "purchase",
            "quantity_change": float(quantity),
            "running_balance": float(new_qty),
            "reference_id": invoice_id,
            "reference_type": "invoice",
            "unit_cost": float(unit_cost),
            "total_cost": float(Decimal(str(quantity)) * Decimal(str(unit_cost))),
            "transaction_date": invoice_date  # Use invoice date, not current time
        }
        
        transaction_result = self.client.table("inventory_transactions").insert(
            transaction_record
        ).execute()
        
        # Update inventory item
        self.client.table("inventory_items").update({
            "current_quantity": float(new_qty),
            "last_purchase_price": float(unit_cost),
            "last_purchase_date": datetime.utcnow().date().isoformat()
        }).eq("id", inventory_item_id).execute()
        
        logger.info(f"📊 Purchase recorded: {item['name']} +{quantity} → {new_qty}")
        
        return transaction_result.data[0]
    
    def get_transaction_history(
        self,
        item_id: str,
        user_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """
        Get transaction history for item
        
        Returns:
            List of transactions
        """
        result = self.client.table("inventory_transactions").select("*").eq(
            "inventory_item_id", item_id
        ).eq("user_id", user_id).order(
            "transaction_date", desc=True
        ).limit(limit).execute()
        
        return result.data
    
    def calculate_running_balance(self, item_id: str, user_id: str) -> Decimal:
        """
        Calculate running balance from all transactions
        
        Returns:
            Current balance
        """
        result = self.client.table("inventory_transactions").select(
            "quantity_change"
        ).eq("inventory_item_id", item_id).eq("user_id", user_id).execute()
        
        total = sum(Decimal(str(t['quantity_change'])) for t in result.data)
        return total
