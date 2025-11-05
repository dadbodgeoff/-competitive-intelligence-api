"""
Menu Comparison Storage Service
Handles database operations for menu comparison
Separation of Concerns: Only handles data persistence, no business logic
"""
import os
import logging
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class MenuComparisonStorage:
    """
    Handle database operations for menu comparison
    
    Responsibilities:
    - Store analysis sessions
    - Store discovered competitors
    - Store parsed competitor menus
    - Store comparison insights
    - Retrieve saved comparisons
    """
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        logger.info("✅ Menu Comparison Storage initialized")
    
    def create_analysis(
        self,
        user_id: str,
        user_menu_id: str,
        restaurant_name: str,
        location: str
    ) -> str:
        """
        Create new analysis session
        
        Args:
            user_id: User ID
            user_menu_id: User's menu ID
            restaurant_name: Restaurant name
            location: Location string
            
        Returns:
            analysis_id (UUID)
        """
        try:
            analysis_data = {
                "user_id": user_id,
                "user_menu_id": user_menu_id,
                "restaurant_name": restaurant_name,
                "location": location,
                "status": "discovering",
                "current_step": "Finding competitors...",
                "competitors_found": 0,
                "competitors_selected": 0,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("competitor_menu_analyses").insert(analysis_data).execute()
            analysis_id = result.data[0]['id']
            
            logger.info(f"✅ Created analysis: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"❌ Failed to create analysis: {e}")
            raise Exception(f"Failed to create analysis: {str(e)}")
    
    def update_analysis_status(
        self,
        analysis_id: str,
        status: str,
        current_step: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """Update analysis status"""
        try:
            updates = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if current_step:
                updates["current_step"] = current_step
            
            if error_message:
                updates["error_message"] = error_message
            
            if status == "completed":
                updates["completed_at"] = datetime.utcnow().isoformat()
            
            self.client.table("competitor_menu_analyses").update(updates).eq(
                "id", analysis_id
            ).execute()
            
            logger.info(f"✅ Updated analysis {analysis_id}: {status}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update analysis: {e}")
            return False
    
    def store_competitors(
        self,
        analysis_id: str,
        competitors: List[Dict]
    ) -> List[str]:
        """
        Store discovered competitors
        
        Args:
            analysis_id: Analysis session ID
            competitors: List of competitor data
            
        Returns:
            List of competitor IDs
        """
        try:
            competitor_records = []
            for comp in competitors:
                competitor_records.append({
                    "analysis_id": analysis_id,
                    "place_id": comp['place_id'],
                    "business_name": comp['business_name'],
                    "address": comp.get('address'),
                    "latitude": comp.get('latitude'),
                    "longitude": comp.get('longitude'),
                    "rating": comp.get('rating'),
                    "review_count": comp.get('review_count'),
                    "price_level": comp.get('price_level'),
                    "distance_miles": comp.get('distance_miles'),
                    "phone": comp.get('phone'),
                    "website": comp.get('website'),
                    "menu_url": comp.get('menu_url'),
                    "is_selected": False,
                    "discovery_metadata": {
                        "types": comp.get('types', [])
                    },
                    "created_at": datetime.utcnow().isoformat()
                })
            
            result = self.client.table("competitor_businesses").insert(competitor_records).execute()
            
            # Update analysis competitors_found count
            self.client.table("competitor_menu_analyses").update({
                "competitors_found": len(competitors),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", analysis_id).execute()
            
            logger.info(f"✅ Stored {len(result.data)} competitors")
            return result.data  # Return full competitor data with IDs
            
        except Exception as e:
            logger.error(f"❌ Failed to store competitors: {e}")
            raise Exception(f"Failed to store competitors: {str(e)}")
    
    def mark_competitors_selected(
        self,
        analysis_id: str,
        competitor_ids: List[str]
    ) -> bool:
        """Mark competitors as selected for analysis"""
        try:
            # Mark selected competitors
            self.client.table("competitor_businesses").update({
                "is_selected": True
            }).in_("id", competitor_ids).eq("analysis_id", analysis_id).execute()
            
            # Update analysis
            self.client.table("competitor_menu_analyses").update({
                "competitors_selected": len(competitor_ids),
                "status": "analyzing",
                "current_step": "Parsing competitor menus...",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", analysis_id).execute()
            
            logger.info(f"✅ Marked {len(competitor_ids)} competitors as selected")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to mark competitors: {e}")
            return False
    
    def store_competitor_menu(
        self,
        competitor_id: str,
        analysis_id: str,
        menu_items: List[Dict],
        menu_source: str,
        menu_url: str,
        parse_metadata: Dict
    ) -> str:
        """
        Store parsed competitor menu
        
        Args:
            competitor_id: Competitor ID
            analysis_id: Analysis session ID
            menu_items: Parsed menu items
            menu_source: Where menu was obtained
            menu_url: Menu URL
            parse_metadata: Parsing metadata
            
        Returns:
            snapshot_id (UUID)
        """
        try:
            # Create snapshot
            snapshot_data = {
                "competitor_id": competitor_id,
                "analysis_id": analysis_id,
                "menu_source": menu_source,
                "menu_url": menu_url,
                "parse_status": "completed",
                "parse_metadata": parse_metadata,
                "created_at": datetime.utcnow().isoformat(),
                "parsed_at": datetime.utcnow().isoformat()
            }
            
            snapshot_result = self.client.table("competitor_menu_snapshots").insert(snapshot_data).execute()
            snapshot_id = snapshot_result.data[0]['id']
            
            # Store menu items
            if menu_items:
                item_records = []
                for item in menu_items:
                    # Calculate price range
                    prices = item.get('prices', [])
                    if prices:
                        price_values = [p.get('price', 0) for p in prices]
                        base_price = min(price_values)
                        price_range_low = min(price_values)
                        price_range_high = max(price_values)
                    else:
                        base_price = None
                        price_range_low = None
                        price_range_high = None
                    
                    item_records.append({
                        "snapshot_id": snapshot_id,
                        "category_name": item.get('category'),
                        "item_name": item.get('item_name'),
                        "description": item.get('description'),
                        "base_price": base_price,
                        "price_range_low": price_range_low,
                        "price_range_high": price_range_high,
                        "size_variants": prices,
                        "notes": item.get('notes'),
                        "created_at": datetime.utcnow().isoformat()
                    })
                
                self.client.table("competitor_menu_items").insert(item_records).execute()
            
            logger.info(f"✅ Stored competitor menu: {snapshot_id} ({len(menu_items)} items)")
            return snapshot_id
            
        except Exception as e:
            logger.error(f"❌ Failed to store competitor menu: {e}")
            raise Exception(f"Failed to store competitor menu: {str(e)}")
    
    def store_insights(
        self,
        analysis_id: str,
        insights: List[Dict]
    ) -> List[str]:
        """Store comparison insights"""
        try:
            insight_records = []
            for insight in insights:
                insight_records.append({
                    "analysis_id": analysis_id,
                    "insight_type": insight.get('insight_type', 'opportunity'),
                    "category": insight.get('category'),
                    "title": insight.get('title'),
                    "description": insight.get('description'),
                    "user_item_name": insight.get('user_item_name'),
                    "user_item_price": insight.get('user_item_price'),
                    "competitor_item_name": insight.get('competitor_item_name'),
                    "competitor_item_price": insight.get('competitor_item_price'),
                    "competitor_business_name": insight.get('competitor_business_name'),
                    "price_difference": insight.get('price_difference'),
                    "price_difference_percent": insight.get('price_difference_percent'),
                    "confidence": insight.get('confidence', 'medium'),
                    "priority": insight.get('priority', 50),
                    "evidence": insight.get('evidence'),
                    "created_at": datetime.utcnow().isoformat()
                })
            
            result = self.client.table("menu_comparison_insights").insert(insight_records).execute()
            
            insight_ids = [r['id'] for r in result.data]
            logger.info(f"✅ Stored {len(insight_ids)} insights")
            return insight_ids
            
        except Exception as e:
            logger.error(f"❌ Failed to store insights: {e}")
            raise Exception(f"Failed to store insights: {str(e)}")
    
    def get_analysis(self, analysis_id: str, user_id: str) -> Optional[Dict]:
        """Get analysis with all related data including competitor menu items"""
        try:
            # Get analysis
            analysis_result = self.client.table("competitor_menu_analyses").select("*").eq(
                "id", analysis_id
            ).eq("user_id", user_id).execute()
            
            if not analysis_result.data:
                return None
            
            analysis = analysis_result.data[0]
            
            # Get competitors
            competitors_result = self.client.table("competitor_businesses").select("*").eq(
                "analysis_id", analysis_id
            ).execute()
            
            # Get insights
            insights_result = self.client.table("menu_comparison_insights").select("*").eq(
                "analysis_id", analysis_id
            ).order("priority", desc=True).execute()
            
            # Get competitor menu items (via snapshots)
            competitor_menus = {}
            for competitor in competitors_result.data:
                if competitor.get('is_selected'):
                    # Get the latest snapshot for this competitor
                    snapshot_result = self.client.table("competitor_menu_snapshots").select("*").eq(
                        "competitor_id", competitor['id']
                    ).order("created_at", desc=True).limit(1).execute()
                    
                    if snapshot_result.data:
                        snapshot_id = snapshot_result.data[0]['id']
                        
                        # Get menu items for this snapshot
                        items_result = self.client.table("competitor_menu_items").select("*").eq(
                            "snapshot_id", snapshot_id
                        ).execute()
                        
                        competitor_menus[competitor['id']] = items_result.data
            
            return {
                "analysis": analysis,
                "competitors": competitors_result.data,
                "insights": insights_result.data,
                "competitor_menus": competitor_menus
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get analysis: {e}")
            return None
    
    def get_latest_competitor_menu(self, competitor_id: str) -> List[Dict]:
        """
        Get the most recent menu snapshot for a competitor (if exists)
        
        This provides caching to avoid re-parsing the same competitor menu
        within a short time period.
        
        Args:
            competitor_id: Competitor business ID
            
        Returns:
            List of menu items (empty if no recent snapshot exists)
        """
        try:
            # Get the most recent snapshot for this competitor
            snapshot_result = self.client.table("competitor_menu_snapshots").select(
                "id, created_at"
            ).eq("competitor_id", competitor_id).order(
                "created_at", desc=True
            ).limit(1).execute()
            
            if not snapshot_result.data:
                return []
            
            snapshot_id = snapshot_result.data[0]['id']
            
            # Get menu items from this snapshot
            items_result = self.client.table("competitor_menu_items").select(
                "category_name, item_name, description, base_price, price_range_low, price_range_high, size_variants, notes"
            ).eq("snapshot_id", snapshot_id).execute()
            
            if not items_result.data:
                return []
            
            # Convert back to the format expected by the orchestrator
            menu_items = []
            for item in items_result.data:
                menu_items.append({
                    "category": item.get('category_name'),
                    "item_name": item.get('item_name'),
                    "description": item.get('description'),
                    "prices": item.get('size_variants', [])
                })
            
            logger.info(f"📦 Found cached menu for competitor {competitor_id}: {len(menu_items)} items")
            return menu_items
            
        except Exception as e:
            logger.error(f"❌ Failed to get cached menu: {e}")
            return []  # Return empty list on error, will trigger fresh parse
    
    def save_comparison(
        self,
        analysis_id: str,
        user_id: str,
        report_name: Optional[str] = None,
        notes: Optional[str] = None
    ) -> str:
        """Save comparison for later review"""
        try:
            save_data = {
                "analysis_id": analysis_id,
                "user_id": user_id,
                "report_name": report_name,
                "notes": notes,
                "is_archived": False,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("saved_menu_comparisons").insert(save_data).execute()
            saved_id = result.data[0]['id']
            
            logger.info(f"✅ Saved comparison: {saved_id}")
            return saved_id
            
        except Exception as e:
            logger.error(f"❌ Failed to save comparison: {e}")
            raise Exception(f"Failed to save comparison: {str(e)}")
    
    def list_saved_comparisons(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """List user's saved comparisons"""
        try:
            # Get total count
            count_result = self.client.table("saved_menu_comparisons").select(
                "id", count="exact"
            ).eq("user_id", user_id).eq("is_archived", False).execute()
            
            total_count = count_result.count
            
            # Get comparisons with analysis data
            comparisons_result = self.client.table("saved_menu_comparisons").select(
                "*, competitor_menu_analyses(*)"
            ).eq("user_id", user_id).eq("is_archived", False).order(
                "created_at", desc=True
            ).range(offset, offset + limit - 1).execute()
            
            return {
                "data": comparisons_result.data,
                "count": total_count,
                "has_more": (offset + limit) < total_count
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to list saved comparisons: {e}")
            return {"data": [], "count": 0, "has_more": False}
