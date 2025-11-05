"""
Vendor Item Mapper Service
Maps vendor SKUs to inventory items
"""
import os
from typing import Dict, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

from services.vendor_service import VendorService
from services.inventory_service import InventoryService
from services.fuzzy_matching.fuzzy_item_matcher import FuzzyItemMatcher

load_dotenv()
logger = logging.getLogger(__name__)


class VendorItemMapper:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.vendor_service = VendorService()
        self.inventory_service = InventoryService()
        self.fuzzy_matcher = FuzzyItemMatcher()
    
    def find_or_create_mapping(
        self,
        user_id: str,
        vendor_id: str,
        vendor_item_number: str,
        vendor_description: str,
        pack_size: Optional[str],
        category: str
    ) -> Dict:
        """
        Find existing mapping or create new one
        
        Returns:
            {
                inventory_item_id: uuid,
                vendor_item_mapping_id: uuid,
                match_method: "exact" | "new",
                match_confidence: decimal,
                is_new_item: boolean
            }
        """
        # Check if mapping exists
        existing = self.client.table("vendor_item_mappings").select("*").eq(
            "user_id", user_id
        ).eq("vendor_id", vendor_id).eq(
            "vendor_item_number", vendor_item_number
        ).execute()
        
        if existing.data:
            mapping = existing.data[0]
            logger.info(f"🔗 Found existing mapping: {vendor_item_number} → {mapping['inventory_item_id']}")
            return {
                "inventory_item_id": mapping['inventory_item_id'],
                "vendor_item_mapping_id": mapping['id'],
                "match_method": mapping['match_method'],
                "match_confidence": float(mapping['match_confidence']),
                "is_new_item": False
            }
        
        # No mapping exists - try exact match on inventory
        normalized_desc = self.inventory_service.normalize_item_name(vendor_description)
        existing_item = self.inventory_service.find_item_by_name(user_id, normalized_desc)
        
        if existing_item:
            # Exact match found
            logger.info(f"✅ Exact match: {vendor_description} → {existing_item['name']}")
            
            mapping_record = {
                "user_id": user_id,
                "vendor_id": vendor_id,
                "vendor_item_number": vendor_item_number,
                "vendor_description": vendor_description,
                "inventory_item_id": existing_item['id'],
                "match_confidence": 1.0,
                "match_method": "exact",
                "matched_at": datetime.utcnow().isoformat(),
                "vendor_pack_size": pack_size,
                "needs_review": False
            }
            
            result = self.client.table("vendor_item_mappings").insert(mapping_record).execute()
            
            return {
                "inventory_item_id": existing_item['id'],
                "vendor_item_mapping_id": result.data[0]['id'],
                "match_method": "exact",
                "match_confidence": 1.0,
                "is_new_item": False
            }
        
        # No exact match - try fuzzy matching
        logger.info(f"🔍 No exact match, trying fuzzy matching for: {vendor_description}")
        
        candidates = self.fuzzy_matcher.find_similar_items(
            target_name=vendor_description,
            user_id=user_id,
            category=category,
            threshold=0.3,
            limit=5
        )
        
        if candidates:
            best_match = candidates[0]
            similarity = best_match['similarity_score']
            
            logger.info(f"   Best match: {best_match['name']} (similarity: {similarity:.2f})")
            
            # Very high confidence - auto-match (using config threshold)
            if similarity >= self.fuzzy_matcher.config.THRESHOLDS['auto_match']:
                logger.info(f"✅ Auto-match (very high confidence {similarity:.2f}): {vendor_description} → {best_match['name']}")
                
                mapping_record = {
                    "user_id": user_id,
                    "vendor_id": vendor_id,
                    "vendor_item_number": vendor_item_number,
                    "vendor_description": vendor_description,
                    "inventory_item_id": best_match['id'],
                    "match_confidence": similarity,
                    "match_method": "fuzzy_auto",
                    "matched_at": datetime.utcnow().isoformat(),
                    "vendor_pack_size": pack_size,
                    "needs_review": False
                }
                
                result = self.client.table("vendor_item_mappings").insert(mapping_record).execute()
                
                return {
                    "inventory_item_id": best_match['id'],
                    "vendor_item_mapping_id": result.data[0]['id'],
                    "match_method": "fuzzy_auto",
                    "match_confidence": similarity,
                    "is_new_item": False
                }
            
            # High confidence - flag for review (using config threshold)
            elif similarity >= self.fuzzy_matcher.config.THRESHOLDS['review_match']:
                logger.info(f"⚠️  Fuzzy match needs review ({similarity:.2f}): {vendor_description} → {best_match['name']}")
                
                mapping_record = {
                    "user_id": user_id,
                    "vendor_id": vendor_id,
                    "vendor_item_number": vendor_item_number,
                    "vendor_description": vendor_description,
                    "inventory_item_id": best_match['id'],
                    "match_confidence": similarity,
                    "match_method": "fuzzy_review",
                    "matched_at": datetime.utcnow().isoformat(),
                    "vendor_pack_size": pack_size,
                    "needs_review": True
                }
                
                result = self.client.table("vendor_item_mappings").insert(mapping_record).execute()
                
                return {
                    "inventory_item_id": best_match['id'],
                    "vendor_item_mapping_id": result.data[0]['id'],
                    "match_method": "fuzzy_review",
                    "match_confidence": similarity,
                    "is_new_item": False,
                    "needs_review": True
                }
        
        # No match - create new inventory item
        logger.info(f"🆕 Creating new item: {vendor_description}")
        
        new_item = self.inventory_service.create_inventory_item(
            user_id=user_id,
            name=vendor_description,
            category=category,
            unit_of_measure="ea"  # Default, will be updated
        )
        
        mapping_record = {
            "user_id": user_id,
            "vendor_id": vendor_id,
            "vendor_item_number": vendor_item_number,
            "vendor_description": vendor_description,
            "inventory_item_id": new_item['id'],
            "match_confidence": 1.0,
            "match_method": "new",
            "matched_at": datetime.utcnow().isoformat(),
            "vendor_pack_size": pack_size,
            "needs_review": True
        }
        
        result = self.client.table("vendor_item_mappings").insert(mapping_record).execute()
        
        return {
            "inventory_item_id": new_item['id'],
            "vendor_item_mapping_id": result.data[0]['id'],
            "match_method": "new",
            "match_confidence": 1.0,
            "is_new_item": True
        }
