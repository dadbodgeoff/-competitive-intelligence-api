"""
Menu Storage Service
Handles file upload and database operations for menus
Pattern: Follows services/invoice_storage_service.py
"""
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class MenuStorageService:
    """Handle menu file storage and database operations"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.storage_bucket = "menus"  # Separate bucket from invoices
    
    async def upload_file(self, file, user_id: str) -> str:
        """
        Upload menu file to Supabase storage
        
        Args:
            file: UploadFile object
            user_id: User ID
            
        Returns:
            File URL for parsing
        """
        try:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = file.filename.split('.')[-1]
            filename = f"menu_{timestamp}.{file_extension}"
            file_path = f"{user_id}/{filename}"
            
            logger.info(f"📤 Uploading menu file: {file_path}")
            
            # Read file content
            content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            # Upload to Supabase storage
            result = self.client.storage.from_(self.storage_bucket).upload(
                path=file_path,
                file=content,
                file_options={"content-type": file.content_type, "upsert": "true"}
            )
            
            logger.info(f"✅ File uploaded successfully to Supabase")
            
            # Create signed URL (valid for 1 hour)
            signed_url_response = self.client.storage.from_(self.storage_bucket).create_signed_url(
                path=file_path,
                expires_in=3600  # 1 hour
            )
            
            if signed_url_response.get('signedURL'):
                file_url = signed_url_response['signedURL']
            else:
                # Fallback to public URL
                file_url = self.client.storage.from_(self.storage_bucket).get_public_url(file_path)
            
            logger.info(f"🔗 File URL: {file_url}")
            
            return file_url
            
        except Exception as e:
            logger.error(f"❌ File upload failed: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")
    
    async def save_menu(
        self,
        menu_data: Dict,
        file_url: str,
        user_id: str,
        parse_metadata: Dict
    ) -> str:
        """
        Save parsed menu to database (single transaction)
        
        Args:
            menu_data: Parsed menu data from Gemini
            file_url: URL to menu file
            user_id: User ID
            parse_metadata: Parsing metadata (model, cost, time)
            
        Returns:
            menu_id (UUID)
        """
        logger.info(f"💾 Saving menu to database")
        logger.debug("=" * 80)
        logger.debug("📥 INCOMING MENU DATA TO SAVE:")
        logger.debug(f"   Total items in menu_data: {len(menu_data.get('menu_items', []))}")
        logger.debug("=" * 80)
        
        try:
            # Archive existing active menu (if any)
            existing = self.client.table("restaurant_menus").select("id").eq(
                "user_id", user_id
            ).eq("status", "active").execute()
            
            if existing.data:
                logger.info(f"📦 Archiving existing menu: {existing.data[0]['id']}")
                self.client.table("restaurant_menus").update({
                    "status": "archived"
                }).eq("id", existing.data[0]['id']).execute()
            
            # Get next version number
            versions = self.client.table("restaurant_menus").select("menu_version").eq(
                "user_id", user_id
            ).order("menu_version", desc=True).limit(1).execute()
            
            next_version = 1
            if versions.data:
                next_version = versions.data[0]['menu_version'] + 1
            
            # Insert menu header
            restaurant_name = menu_data.get("restaurant_name", "My Restaurant")
            
            menu_record = {
                "user_id": user_id,
                "restaurant_name": restaurant_name,
                "menu_version": next_version,
                "file_url": file_url,
                "status": "active",
                "parse_metadata": parse_metadata,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            menu_result = self.client.table("restaurant_menus").insert(menu_record).execute()
            menu_id = menu_result.data[0]['id']
            
            logger.info(f"✅ Menu created: {menu_id} (version {next_version})")
            
            # Group items by category
            items_by_category = {}
            for item in menu_data.get("menu_items", []):
                category = item.get("category", "Uncategorized")
                if category not in items_by_category:
                    items_by_category[category] = []
                items_by_category[category].append(item)
            
            logger.debug("=" * 80)
            logger.debug("📊 GROUPED BY CATEGORY:")
            for cat_name, cat_items in items_by_category.items():
                logger.debug(f"   {cat_name}: {len(cat_items)} items")
            logger.debug("=" * 80)
            
            # Insert categories and items
            total_items = 0
            total_categories = 0
            
            for category_order, (category_name, items) in enumerate(items_by_category.items()):
                # Insert category
                category_record = {
                    "menu_id": menu_id,
                    "category_name": category_name,
                    "display_order": category_order,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                category_result = self.client.table("menu_categories").insert(category_record).execute()
                category_id = category_result.data[0]['id']
                total_categories += 1
                
                # Insert items for this category
                for item_order, item in enumerate(items):
                    item_record = {
                        "menu_id": menu_id,
                        "category_id": category_id,
                        "item_name": item.get("item_name", ""),
                        "description": item.get("description"),
                        "display_order": item_order,
                        "options": item.get("options"),
                        "notes": item.get("notes"),
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat()
                    }
                    
                    item_result = self.client.table("menu_items").insert(item_record).execute()
                    item_id = item_result.data[0]['id']
                    total_items += 1
                    
                    # Insert prices for this item
                    prices = item.get("prices", [])
                    if prices:
                        price_records = []
                        for price in prices:
                            price_records.append({
                                "menu_item_id": item_id,
                                "size_label": price.get("size"),
                                "price": float(price.get("price", 0)),
                                "created_at": datetime.utcnow().isoformat()
                            })
                        
                        if price_records:
                            self.client.table("menu_item_prices").insert(price_records).execute()
            
            logger.info("=" * 80)
            logger.info(f"✅ SAVE COMPLETE:")
            logger.info(f"   Menu ID: {menu_id}")
            logger.info(f"   Categories saved: {total_categories}")
            logger.info(f"   Items saved: {total_items}")
            logger.info(f"   Items received: {len(menu_data.get('menu_items', []))}")
            if total_items != len(menu_data.get('menu_items', [])):
                logger.warning(f"⚠️  MISMATCH: Received {len(menu_data.get('menu_items', []))} but saved {total_items}")
            logger.info("=" * 80)
            
            return menu_id
            
        except Exception as e:
            logger.error(f"❌ Menu save failed: {e}")
            raise Exception(f"Failed to save menu: {str(e)}")
    
    async def get_active_menu(self, user_id: str, include_items: bool = True) -> Optional[Dict]:
        """
        Get user's active menu with all items
        
        Args:
            user_id: User ID
            include_items: If False, only returns menu header and category names (fast)
        """
        
        try:
            # Get active menu
            menu_result = self.client.table("restaurant_menus").select("*").eq(
                "user_id", user_id
            ).eq("status", "active").execute()
            
            if not menu_result.data:
                return None
            
            menu = menu_result.data[0]
            menu_id = menu['id']
            
            # Get categories
            categories_result = self.client.table("menu_categories").select("*").eq(
                "menu_id", menu_id
            ).order("display_order").execute()
            
            # Fast path: just return menu header and category names
            if not include_items:
                categories = []
                for category in categories_result.data:
                    categories.append({
                        "id": category['id'],
                        "name": category.get("category_name"),
                        "description": category.get("description"),
                        "item_count": 0  # Will be populated by separate call
                    })
                
                return {
                    "menu": menu,
                    "categories": categories
                }
            
            # OPTIMIZED: Fetch all items and prices in bulk (2 queries instead of N+1)
            # Get all items for this menu
            all_items_result = self.client.table("menu_items").select("*").eq(
                "menu_id", menu_id
            ).order("category_id, display_order").execute()
            
            # Get all item IDs
            item_ids = [item['id'] for item in all_items_result.data]
            
            # Get all prices in one query
            all_prices = {}
            if item_ids:
                prices_result = self.client.table("menu_item_prices").select("*").in_(
                    "menu_item_id", item_ids
                ).order("menu_item_id, price").execute()
                
                # Group prices by item_id
                for price_record in prices_result.data:
                    item_id = price_record['menu_item_id']
                    if item_id not in all_prices:
                        all_prices[item_id] = []
                    all_prices[item_id].append({
                        "size": price_record.get("size_label"),
                        "price": price_record.get("price")
                    })
            
            # Group items by category
            items_by_category = {}
            for item in all_items_result.data:
                category_id = item['category_id']
                if category_id not in items_by_category:
                    items_by_category[category_id] = []
                
                # Transform item to match frontend format
                transformed_item = {
                    "name": item.get("item_name"),
                    "description": item.get("description"),
                    "prices": all_prices.get(item['id'], []),
                    "available": item.get("available", True),
                    "id": item.get("id")
                }
                items_by_category[category_id].append(transformed_item)
            
            # Build categories with items
            categories = []
            for category in categories_result.data:
                transformed_category = {
                    "name": category.get("category_name"),
                    "description": category.get("description"),
                    "items": items_by_category.get(category['id'], [])
                }
                categories.append(transformed_category)
            
            return {
                "menu": menu,
                "categories": categories
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get active menu: {e}")
            return None
    
    async def list_menus(self, user_id: str, limit: int = 20, offset: int = 0) -> Dict:
        """List user's menus with pagination"""
        
        try:
            # Get total count
            count_result = self.client.table("restaurant_menus").select(
                "id", count="exact"
            ).eq("user_id", user_id).execute()
            
            total_count = count_result.count
            
            # Get menus
            menus_result = self.client.table("restaurant_menus").select("*").eq(
                "user_id", user_id
            ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            return {
                "data": menus_result.data,
                "count": total_count,
                "has_more": (offset + limit) < total_count
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to list menus: {e}")
            return {"data": [], "count": 0, "has_more": False}
    
    async def archive_menu(self, menu_id: str, user_id: str) -> bool:
        """Archive a menu (soft delete)"""
        
        try:
            result = self.client.table("restaurant_menus").update({
                "status": "archived",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", menu_id).eq("user_id", user_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"❌ Failed to archive menu: {e}")
            return False
    
    async def update_menu_item(self, item_id: str, user_id: str, updates: Dict) -> bool:
        """Update a menu item"""
        
        try:
            # Verify ownership via menu_id
            item_check = self.client.table("menu_items").select(
                "menu_id"
            ).eq("id", item_id).execute()
            
            if not item_check.data:
                return False
            
            menu_id = item_check.data[0]['menu_id']
            
            # Verify user owns this menu
            menu_check = self.client.table("restaurant_menus").select("id").eq(
                "id", menu_id
            ).eq("user_id", user_id).execute()
            
            if not menu_check.data:
                return False
            
            # Update item
            item_updates = {}
            if 'item_name' in updates:
                item_updates['item_name'] = updates['item_name']
            if 'description' in updates:
                item_updates['description'] = updates['description']
            if 'options' in updates:
                item_updates['options'] = updates['options']
            if 'notes' in updates:
                item_updates['notes'] = updates['notes']
            
            if item_updates:
                item_updates['updated_at'] = datetime.utcnow().isoformat()
                self.client.table("menu_items").update(item_updates).eq("id", item_id).execute()
            
            # Update prices if provided
            if 'prices' in updates:
                # Delete existing prices
                self.client.table("menu_item_prices").delete().eq("menu_item_id", item_id).execute()
                
                # Insert new prices
                if updates['prices']:
                    price_records = []
                    for price in updates['prices']:
                        price_records.append({
                            "menu_item_id": item_id,
                            "size_label": price.get("size"),
                            "price": float(price.get("price", 0)),
                            "created_at": datetime.utcnow().isoformat()
                        })
                    
                    self.client.table("menu_item_prices").insert(price_records).execute()
            
            logger.info(f"✅ Updated menu item: {item_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update menu item: {e}")
            return False
    
    async def add_menu_item(self, user_id: str, category_id: str, item_data: Dict) -> str:
        """Add a new menu item"""
        
        try:
            # Verify user owns this category's menu
            category_check = self.client.table("menu_categories").select(
                "menu_id"
            ).eq("id", category_id).execute()
            
            if not category_check.data:
                raise Exception("Category not found")
            
            menu_id = category_check.data[0]['menu_id']
            
            menu_check = self.client.table("restaurant_menus").select("id").eq(
                "id", menu_id
            ).eq("user_id", user_id).execute()
            
            if not menu_check.data:
                raise Exception("Unauthorized")
            
            # Insert item
            item_record = {
                "menu_id": menu_id,
                "category_id": category_id,
                "item_name": item_data['item_name'],
                "description": item_data.get('description'),
                "display_order": 999,  # Add to end
                "options": item_data.get('options'),
                "notes": item_data.get('notes'),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            item_result = self.client.table("menu_items").insert(item_record).execute()
            item_id = item_result.data[0]['id']
            
            # Insert prices
            if item_data.get('prices'):
                price_records = []
                for price in item_data['prices']:
                    price_records.append({
                        "menu_item_id": item_id,
                        "size_label": price.get("size"),
                        "price": float(price.get("price", 0)),
                        "created_at": datetime.utcnow().isoformat()
                    })
                
                self.client.table("menu_item_prices").insert(price_records).execute()
            
            logger.info(f"✅ Added menu item: {item_id}")
            return item_id
            
        except Exception as e:
            logger.error(f"❌ Failed to add menu item: {e}")
            raise
    
    async def delete_menu_item(self, item_id: str, user_id: str) -> bool:
        """Delete a menu item"""
        
        try:
            # Verify ownership
            item_check = self.client.table("menu_items").select(
                "menu_id"
            ).eq("id", item_id).execute()
            
            if not item_check.data:
                return False
            
            menu_id = item_check.data[0]['menu_id']
            
            menu_check = self.client.table("restaurant_menus").select("id").eq(
                "id", menu_id
            ).eq("user_id", user_id).execute()
            
            if not menu_check.data:
                return False
            
            # Delete item (prices cascade delete)
            self.client.table("menu_items").delete().eq("id", item_id).execute()
            
            logger.info(f"✅ Deleted menu item: {item_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to delete menu item: {e}")
            return False
    
    async def get_menu_item(self, item_id: str, user_id: str) -> Optional[Dict]:
        """Get a single menu item with prices"""
        
        try:
            # Get item
            item_result = self.client.table("menu_items").select("*").eq(
                "id", item_id
            ).execute()
            
            if not item_result.data:
                return None
            
            item = item_result.data[0]
            
            # Verify ownership
            menu_check = self.client.table("restaurant_menus").select("id").eq(
                "id", item['menu_id']
            ).eq("user_id", user_id).execute()
            
            if not menu_check.data:
                return None
            
            # Get prices
            prices_result = self.client.table("menu_item_prices").select("*").eq(
                "menu_item_id", item_id
            ).order("price").execute()
            
            item['prices'] = prices_result.data
            
            return item
            
        except Exception as e:
            logger.error(f"❌ Failed to get menu item: {e}")
            return None
