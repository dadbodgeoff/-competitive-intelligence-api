"""
Menu Recipe Service
Handles recipe management and COGS calculations for plate costing
READ ONLY access to inventory_items (invoice source of truth)
WRITE access to menu_item_ingredients (menu owns this)
"""
import logging
from typing import Dict, List, Optional
from supabase import Client
from datetime import datetime

logger = logging.getLogger(__name__)


class MenuRecipeService:
    """
    Manage menu item recipes and calculate COGS
    
    Architecture:
    - READ ONLY from inventory_items (invoice source of truth)
    - WRITE to menu_item_ingredients (menu owns this)
    - Never modifies invoice/inventory data
    """
    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
    
    async def search_inventory_items(
        self,
        user_id: str,
        query: str,
        limit: int = 20
    ) -> List[Dict]:
        """
        Search invoice items using FUZZY MATCHING (not ILIKE)
        Returns items from invoice_items with pack size and calculated unit cost
        
        Args:
            user_id: User ID
            query: Search query (fuzzy match on description)
            limit: Max results
            
        Returns:
            List of invoice items with pricing info, pack details, and match confidence
        """
        logger.info(f"🔍 FUZZY searching invoice items (SOURCE OF TRUTH) for: '{query}' (user: {user_id})")
        
        try:
            from services.fuzzy_matching.fuzzy_item_matcher import FuzzyItemMatcher
            from services.unit_converter import UnitConverter
            from decimal import Decimal
            
            converter = UnitConverter()
            matcher = FuzzyItemMatcher()
            
            # Step 1: Get all invoice items for this user (join through invoices table)
            # Note: invoice_items doesn't have user_id, need to join with invoices
            all_items_result = self.client.table("invoice_items").select(
                "id, description, pack_size, unit_price, created_at, invoice_id, invoices!inner(user_id)"
            ).eq("invoices.user_id", user_id).order("created_at", desc=True).execute()
            
            all_items = all_items_result.data or []
            logger.info(f"📦 Loaded {len(all_items)} total invoice items for fuzzy matching")
            
            if not all_items:
                return []
            
            # Step 2: Fuzzy match against invoice item descriptions
            # Create candidate items for fuzzy matching
            candidates = []
            seen_descriptions = {}
            
            for item in all_items:
                desc = item["description"].lower().strip()
                # Keep most recent of each unique description
                if desc not in seen_descriptions:
                    seen_descriptions[desc] = True
                    candidates.append({
                        "id": item["id"],
                        "name": item["description"],
                        "normalized_name": desc,
                        "pack_size": item.get("pack_size"),
                        "unit_price": item.get("unit_price"),
                        "created_at": item.get("created_at"),
                        "invoice_id": item.get("invoice_id")
                    })
            
            logger.info(f"🔍 Fuzzy matching '{query}' against {len(candidates)} unique items")
            
            # Step 3: Use fuzzy matching to find similar items
            matched_items = []
            query_normalized = query.lower().strip()
            
            for candidate in candidates:
                # Calculate similarity using the fuzzy matcher's calculator
                similarity = matcher.calculator.calculate_simple_similarity(
                    query_normalized,
                    candidate["normalized_name"]
                )
                
                # Lower threshold for search (show more results)
                if similarity >= 0.2:  # 20% similarity threshold
                    candidate["similarity_score"] = similarity
                    candidate["match_confidence"] = matcher.get_match_recommendation(similarity)
                    matched_items.append(candidate)
            
            # Sort by similarity (best matches first)
            matched_items.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            # Limit results
            matched_items = matched_items[:limit]
            
            logger.info(f"✅ Found {len(matched_items)} fuzzy matches")
            
            # Step 4: Transform for frontend with calculated unit costs
            enhanced_items = []
            for item in matched_items:
                vendor_pack_size = item.get("pack_size")
                pack_price = float(item.get("unit_price") or 0)
                calculated_unit_cost = None
                base_unit = None
                warnings = []
                similarity_score = item.get("similarity_score", 0)
                match_confidence = item.get("match_confidence", {})
                
                # Calculate unit cost from pack (if available)
                # Store BOTH per-weight and per-piece costs for flexible recipe entry
                unit_cost_per_weight = None
                weight_unit = None
                unit_cost_per_piece = None
                
                if vendor_pack_size and pack_price and pack_price > 0:
                    try:
                        cost_weight, w_unit, cost_piece, error = converter.calculate_unit_cost_from_pack(
                            Decimal(str(pack_price)),
                            vendor_pack_size
                        )
                        if error:
                            warnings.append(error)
                            logger.warning(f"   Failed to calculate unit cost: {error}")
                        else:
                            if cost_weight:
                                unit_cost_per_weight = float(cost_weight)
                                weight_unit = w_unit
                                logger.info(f"   Calculated: ${unit_cost_per_weight:.4f}/{weight_unit} for {item['name']}")
                            if cost_piece:
                                unit_cost_per_piece = float(cost_piece)
                                logger.info(f"   Calculated: ${unit_cost_per_piece:.4f}/ea for {item['name']}")
                            
                            # For display, prefer weight-based cost (more useful for recipes)
                            if unit_cost_per_weight:
                                calculated_unit_cost = unit_cost_per_weight
                                base_unit = weight_unit
                            elif unit_cost_per_piece:
                                calculated_unit_cost = unit_cost_per_piece
                                base_unit = "ea"
                    except Exception as e:
                        warnings.append(f"Calculation error: {str(e)}")
                        logger.error(f"   Calculation error: {e}")
                else:
                    if not vendor_pack_size:
                        warnings.append("Pack size not available")
                    elif not pack_price or pack_price <= 0:
                        warnings.append("Unit price not available")
                
                # If no calculated cost, use pack price as fallback
                if calculated_unit_cost is None:
                    calculated_unit_cost = pack_price
                    base_unit = "ea"  # Assume per-unit if can't calculate
                    if pack_price > 0:
                        warnings.append("Using pack price as unit cost (calculation unavailable)")
                
                enhanced_items.append({
                    "id": item["id"],  # invoice_item_id for reference
                    "name": item["name"],
                    "description": item["name"],
                    "pack_size": vendor_pack_size,
                    "pack_price": pack_price,
                    "calculated_unit_cost": calculated_unit_cost,
                    "base_unit": base_unit,
                    "unit_of_measure": base_unit,  # For compatibility
                    # Include BOTH costs for flexible recipe entry
                    "unit_cost_per_weight": unit_cost_per_weight,
                    "weight_unit": weight_unit,
                    "unit_cost_per_piece": unit_cost_per_piece,
                    "last_purchase_date": item.get("created_at"),
                    "last_purchase_price": pack_price,
                    "warnings": warnings,
                    "source": "invoice_items",  # Mark as coming from source of truth
                    "similarity_score": similarity_score,  # Add fuzzy match score
                    "match_confidence": match_confidence  # Add confidence level
                })
            
            return enhanced_items
            
        except Exception as e:
            logger.error(f"❌ Search failed: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to search invoice items: {str(e)}")
    
    async def get_recipe(
        self,
        menu_item_id: str,
        user_id: str,
        price_id: Optional[str] = None
    ) -> Dict:
        """
        Get recipe with current costs for a menu item
        
        Args:
            menu_item_id: Menu item ID
            user_id: User ID (for security)
            price_id: Optional specific size/price variant
            
        Returns:
            Recipe with ingredients and COGS calculation
        """
        logger.info(f"📋 Getting recipe for menu item: {menu_item_id}")
        
        try:
            # Verify menu item belongs to user
            menu_check = self.client.table("menu_items").select(
                "id, item_name, menu_id"
            ).eq("id", menu_item_id).execute()
            
            if not menu_check.data:
                logger.error(f"❌ Menu item not found: {menu_item_id}")
                raise Exception("Menu item not found")
            
            menu_item = menu_check.data[0]
            logger.info(f"✅ Found menu item: {menu_item['item_name']}, menu_id: {menu_item['menu_id']}")
            
            # Verify ownership via restaurant_menus
            owner_check = self.client.table("restaurant_menus").select("id, user_id").eq(
                "id", menu_item["menu_id"]
            ).eq("user_id", user_id).execute()
            
            if not owner_check.data:
                logger.error(f"❌ Unauthorized: user does not own menu {menu_item['menu_id']}")
                raise Exception("Unauthorized")
            
            logger.info(f"✅ User authorized")
            
            # Get menu item prices
            prices_result = self.client.table("menu_item_prices").select("*").eq(
                "menu_item_id", menu_item_id
            ).execute()
            
            # Get ingredients with current costs (JOIN with invoice_items - SOURCE OF TRUTH)
            ingredients_query = self.client.table("menu_item_ingredients").select(
                "id, invoice_item_id, quantity_per_serving, unit_of_measure, notes, "
                "menu_item_price_id"
            ).eq("menu_item_id", menu_item_id)
            
            if price_id:
                ingredients_query = ingredients_query.eq("menu_item_price_id", price_id)
            
            ingredients_result = ingredients_query.execute()
            
            # Enrich with inventory data and calculate costs with unit conversion (READ ONLY)
            from services.unit_converter import UnitConverter
            from decimal import Decimal
            
            converter = UnitConverter()
            enriched_ingredients = []
            total_cogs = 0.0
            recipe_warnings = []
            
            # OPTIMIZATION: Fetch all invoice items in one query to avoid N+1
            ingredient_ids = [ing.get("invoice_item_id") for ing in ingredients_result.data or [] if ing.get("invoice_item_id")]
            
            invoice_items_map = {}
            if ingredient_ids:
                invoice_items_result = self.client.table("invoice_items").select(
                    "id, description, pack_size, unit_price, created_at, invoice_id"
                ).in_("id", ingredient_ids).execute()
                
                # Create a map for quick lookup
                invoice_items_map = {item["id"]: item for item in invoice_items_result.data}
            
            for ing in ingredients_result.data or []:
                invoice_item_id = ing.get("invoice_item_id")
                
                if not invoice_item_id:
                    logger.warning(f"   Ingredient {ing['id']} has no invoice_item_id - skipping")
                    continue
                
                # Get invoice item from map (no additional query)
                invoice_item = invoice_items_map.get(invoice_item_id)
                
                if not invoice_item:
                    logger.error(f"   Invoice item {invoice_item_id} not found!")
                    continue
                item_name = invoice_item["description"]
                recipe_qty = float(ing["quantity_per_serving"])
                recipe_unit = ing["unit_of_measure"]
                
                vendor_pack_size = invoice_item.get("pack_size")
                pack_price = float(invoice_item.get("unit_price") or 0)
                calculated_unit_cost = None
                base_unit = None
                converted_qty = None
                converted_unit = None
                ingredient_warnings = []
                
                logger.info(f"   Processing: {item_name}, pack={vendor_pack_size}, price=${pack_price}")
                
                # Calculate unit cost from pack
                if vendor_pack_size and pack_price:
                    unit_cost_weight, weight_unit, unit_cost_piece, error = converter.calculate_unit_cost_from_pack(
                        Decimal(str(pack_price)),
                        vendor_pack_size
                    )
                    if error:
                        ingredient_warnings.append(error)
                    else:
                        # Determine which cost to use based on recipe unit
                        if recipe_unit.lower() in ['ea', 'each', 'pc', 'pcs', 'piece', 'pieces']:
                            # Recipe is in pieces - use per-piece cost if available
                            if unit_cost_piece:
                                calculated_unit_cost = float(unit_cost_piece)
                                base_unit = "ea"
                                converted_qty = recipe_qty  # Already in pieces
                                converted_unit = "ea"
                            elif unit_cost_weight:
                                # Fallback to weight cost
                                calculated_unit_cost = float(unit_cost_weight)
                                base_unit = weight_unit
                                conv_qty, conv_error = converter.convert_recipe_to_pack_unit(
                                    Decimal(str(recipe_qty)),
                                    recipe_unit,
                                    weight_unit
                                )
                                if conv_qty:
                                    converted_qty = float(conv_qty)
                                    converted_unit = weight_unit
                                else:
                                    ingredient_warnings.append(conv_error or "Unit conversion failed")
                        else:
                            # Recipe is in weight/volume - use weight cost
                            if unit_cost_weight:
                                base_unit = weight_unit
                                        
                                # Check if recipe unit matches pack unit
                                if recipe_unit.lower() == weight_unit.lower():
                                    # Units match - use cost directly
                                    calculated_unit_cost = float(unit_cost_weight)
                                    converted_qty = recipe_qty
                                    converted_unit = recipe_unit
                                else:
                                    # Units differ - need to convert BOTH quantity AND price
                                    # Convert recipe quantity to pack unit
                                    conv_qty, conv_error = converter.convert_recipe_to_pack_unit(
                                        Decimal(str(recipe_qty)),
                                        recipe_unit,
                                        weight_unit
                                    )
                                    if conv_qty:
                                        # Quantity converted successfully
                                        converted_qty = float(conv_qty)
                                        converted_unit = weight_unit
                                        calculated_unit_cost = float(unit_cost_weight)
                                    else:
                                        # Conversion failed - try converting the price instead
                                        # Convert price from pack unit to recipe unit
                                        price_conv_qty, price_conv_error = converter.convert_recipe_to_pack_unit(
                                            Decimal('1.0'),
                                            weight_unit,
                                            recipe_unit
                                        )
                                        if price_conv_qty:
                                            # Price converted: $X/pack_unit → $Y/recipe_unit
                                            calculated_unit_cost = float(unit_cost_weight / price_conv_qty)
                                            converted_qty = recipe_qty
                                            converted_unit = recipe_unit
                                            base_unit = recipe_unit  # Update base_unit to match converted price
                                            logger.info(f"   Converted price: ${unit_cost_weight}/{weight_unit} → ${calculated_unit_cost:.4f}/{recipe_unit}")
                                        else:
                                            ingredient_warnings.append(conv_error or price_conv_error or "Unit conversion failed")
                            else:
                                ingredient_warnings.append("Weight cost not available")
                else:
                    ingredient_warnings.append("Pack size not available")
                
                # Calculate ingredient cost
                if calculated_unit_cost and converted_qty is not None:
                    # Use calculated unit cost with converted quantity
                    ingredient_cost = calculated_unit_cost * converted_qty
                elif calculated_unit_cost:
                    # Have unit cost but no conversion - use recipe qty directly
                    ingredient_cost = calculated_unit_cost * recipe_qty
                    converted_qty = recipe_qty
                    converted_unit = recipe_unit
                    ingredient_warnings.append(f"Using recipe quantity directly ({recipe_qty} {recipe_unit})")
                else:
                    # Fallback - no cost available
                    ingredient_cost = 0
                    calculated_unit_cost = 0
                    converted_qty = recipe_qty
                    converted_unit = recipe_unit
                    ingredient_warnings.append("No cost data available")
                
                total_cogs += ingredient_cost
                
                enriched_ingredients.append({
                    "id": ing["id"],
                    "invoice_item_id": invoice_item_id,
                    "invoice_item_description": item_name,
                    "pack_size": vendor_pack_size,
                    "pack_price": pack_price or float(invoice_item.get("unit_price") or 0),
                    "calculated_unit_cost": calculated_unit_cost,
                    "base_unit": base_unit,
                    "quantity_per_serving": recipe_qty,
                    "unit_of_measure": recipe_unit,
                    "converted_quantity": converted_qty,
                    "converted_unit": converted_unit,
                    "line_cost": round(ingredient_cost, 2),
                    "last_purchase_date": invoice_item.get("created_at"),
                    "notes": ing.get("notes"),
                    "warnings": ingredient_warnings
                })
                
                if ingredient_warnings:
                    recipe_warnings.extend(ingredient_warnings)
            
            # Calculate margins
            menu_price = float(prices_result.data[0]["price"]) if prices_result.data else 0
            gross_profit = menu_price - total_cogs
            food_cost_percent = (total_cogs / menu_price * 100) if menu_price > 0 else 0
            
            logger.info(f"✅ Recipe loaded: {len(enriched_ingredients)} ingredients, COGS: ${total_cogs:.2f}")
            if recipe_warnings:
                logger.warning(f"⚠️  Recipe has {len(recipe_warnings)} warnings")
            
            return {
                "menu_item": {
                    "id": menu_item_id,
                    "name": menu_item["item_name"],
                    "prices": prices_result.data or []
                },
                "ingredients": enriched_ingredients,
                "total_cogs": round(total_cogs, 2),
                "menu_price": menu_price,
                "gross_profit": round(gross_profit, 2),
                "food_cost_percent": round(food_cost_percent, 1),
                "warnings": list(set(recipe_warnings))  # Deduplicate warnings
            }
            
        except Exception as e:
            logger.error(f"❌ Get recipe failed: {e}")
            raise
    
    async def get_recipes_batch(
        self,
        menu_item_ids: list[str],
        user_id: str
    ) -> Dict[str, Dict]:
        """
        OPTIMIZED: Get recipes for multiple menu items in ONE database round-trip
        Eliminates N+1 queries by fetching all data in batches
        
        Returns:
            Dict mapping menu_item_id -> recipe data
        """
        logger.info(f"📦 Batch loading {len(menu_item_ids)} recipes")
        
        try:
            from services.unit_converter import UnitConverter
            from decimal import Decimal
            
            converter = UnitConverter()
            
            # Step 1: Verify all menu items belong to user (ONE query with IN clause)
            menu_items_result = self.client.table("menu_items").select(
                "id, item_name, menu_id"
            ).in_("id", menu_item_ids).execute()
            
            if not menu_items_result.data:
                return {}
            
            menu_items_map = {item["id"]: item for item in menu_items_result.data}
            menu_ids = list(set(item["menu_id"] for item in menu_items_result.data))
            
            # Step 2: Verify ownership (ONE query)
            owner_check = self.client.table("restaurant_menus").select("id").in_(
                "id", menu_ids
            ).eq("user_id", user_id).execute()
            
            authorized_menu_ids = {menu["id"] for menu in owner_check.data}
            
            # Filter to authorized items only
            authorized_item_ids = [
                item_id for item_id, item in menu_items_map.items()
                if item["menu_id"] in authorized_menu_ids
            ]
            
            if not authorized_item_ids:
                logger.warning("No authorized menu items found")
                return {}
            
            # Step 3: Get all prices (ONE query)
            prices_result = self.client.table("menu_item_prices").select("*").in_(
                "menu_item_id", authorized_item_ids
            ).execute()
            
            prices_map = {}
            for price in prices_result.data:
                menu_item_id = price["menu_item_id"]
                if menu_item_id not in prices_map:
                    prices_map[menu_item_id] = []
                prices_map[menu_item_id].append(price)
            
            # Step 4: Get all ingredients (ONE query)
            ingredients_result = self.client.table("menu_item_ingredients").select(
                "id, menu_item_id, invoice_item_id, quantity_per_serving, "
                "unit_of_measure, notes, menu_item_price_id"
            ).in_("menu_item_id", authorized_item_ids).execute()
            
            # Group ingredients by menu item
            ingredients_by_item = {}
            all_invoice_item_ids = set()
            
            for ing in ingredients_result.data:
                menu_item_id = ing["menu_item_id"]
                if menu_item_id not in ingredients_by_item:
                    ingredients_by_item[menu_item_id] = []
                ingredients_by_item[menu_item_id].append(ing)
                
                if ing.get("invoice_item_id"):
                    all_invoice_item_ids.add(ing["invoice_item_id"])
            
            # Step 5: Get all invoice items (ONE query)
            invoice_items_map = {}
            if all_invoice_item_ids:
                invoice_items_result = self.client.table("invoice_items").select(
                    "id, description, pack_size, unit_price, created_at"
                ).in_("id", list(all_invoice_item_ids)).execute()
                
                invoice_items_map = {item["id"]: item for item in invoice_items_result.data}
            
            # Step 6: Build recipes for each item
            recipes = {}
            
            for menu_item_id in authorized_item_ids:
                menu_item = menu_items_map.get(menu_item_id)
                if not menu_item:
                    continue
                
                ingredients = ingredients_by_item.get(menu_item_id, [])
                prices = prices_map.get(menu_item_id, [])
                
                # Calculate COGS
                enriched_ingredients = []
                total_cogs = 0.0
                
                for ing in ingredients:
                    invoice_item_id = ing.get("invoice_item_id")
                    if not invoice_item_id:
                        continue
                    
                    invoice_item = invoice_items_map.get(invoice_item_id)
                    if not invoice_item:
                        continue
                    
                    recipe_qty = float(ing["quantity_per_serving"])
                    recipe_unit = ing["unit_of_measure"]
                    pack_price = float(invoice_item.get("unit_price") or 0)
                    vendor_pack_size = invoice_item.get("pack_size")
                    
                    # Quick cost calculation (simplified for batch performance)
                    ingredient_cost = 0
                    calculated_unit_cost = None
                    
                    if vendor_pack_size and pack_price:
                        unit_cost_weight, weight_unit, unit_cost_piece, _ = converter.calculate_unit_cost_from_pack(
                            Decimal(str(pack_price)),
                            vendor_pack_size
                        )
                        
                        if unit_cost_weight:
                            calculated_unit_cost = float(unit_cost_weight)
                            ingredient_cost = calculated_unit_cost * recipe_qty
                        elif unit_cost_piece:
                            calculated_unit_cost = float(unit_cost_piece)
                            ingredient_cost = calculated_unit_cost * recipe_qty
                    
                    total_cogs += ingredient_cost
                    
                    enriched_ingredients.append({
                        "id": ing["id"],
                        "invoice_item_id": invoice_item_id,
                        "invoice_item_description": invoice_item["description"],
                        "pack_size": vendor_pack_size,
                        "pack_price": pack_price,
                        "calculated_unit_cost": calculated_unit_cost,
                        "quantity_per_serving": recipe_qty,
                        "unit_of_measure": recipe_unit,
                        "line_cost": round(ingredient_cost, 2),
                        "notes": ing.get("notes")
                    })
                
                # Calculate margins
                menu_price = float(prices[0]["price"]) if prices else 0
                gross_profit = menu_price - total_cogs
                food_cost_percent = (total_cogs / menu_price * 100) if menu_price > 0 else 0
                
                recipes[menu_item_id] = {
                    "menu_item": {
                        "id": menu_item_id,
                        "name": menu_item["item_name"],
                        "prices": prices
                    },
                    "ingredients": enriched_ingredients,
                    "total_cogs": round(total_cogs, 2),
                    "menu_price": menu_price,
                    "gross_profit": round(gross_profit, 2),
                    "food_cost_percent": round(food_cost_percent, 1)
                }
            
            logger.info(f"✅ Batch loaded {len(recipes)} recipes with {len(all_invoice_item_ids)} unique ingredients")
            return recipes
            
        except Exception as e:
            logger.error(f"❌ Batch get recipes failed: {e}", exc_info=True)
            raise
    
    async def add_ingredient(
        self,
        menu_item_id: str,
        invoice_item_id: str,  # Invoice item ID from search (SOURCE OF TRUTH)
        quantity_per_serving: float,
        unit_of_measure: str,
        user_id: str,
        menu_item_price_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Dict:
        """
        Add ingredient to menu item recipe
        
        Flow:
        1. Get invoice_item details (SOURCE OF TRUTH - READ ONLY)
        2. Calculate unit cost from pack size
        3. Save to menu_item_ingredients (RECIPE STORAGE) - links directly to invoice_item
        
        Args:
            menu_item_id: Menu item ID
            invoice_item_id: Invoice item ID from search (SOURCE OF TRUTH)
            quantity_per_serving: Amount used per serving
            unit_of_measure: Unit (ea, oz, lb, etc.)
            user_id: User ID (for security)
            menu_item_price_id: Optional specific size
            notes: Optional notes
            
        Returns:
            Dict with ingredient_id, warnings, and calculated_cost
        """
        logger.info(f"➕ Adding ingredient to menu item: {menu_item_id}")
        
        try:
            from services.unit_converter import UnitConverter
            from decimal import Decimal
            
            converter = UnitConverter()
            warnings = []
            calculated_cost = None
            
            # Verify menu item belongs to user
            menu_check = self.client.table("menu_items").select(
                "menu_id"
            ).eq("id", menu_item_id).execute()
            
            if not menu_check.data:
                raise Exception("Menu item not found")
            
            owner_check = self.client.table("restaurant_menus").select("id").eq(
                "id", menu_check.data[0]["menu_id"]
            ).eq("user_id", user_id).execute()
            
            if not owner_check.data:
                raise Exception("Unauthorized")
            
            # Step 1: Get invoice_item details (SOURCE OF TRUTH - READ ONLY)
            logger.info(f"   Looking up invoice_item: {invoice_item_id}")
            invoice_item_result = self.client.table("invoice_items").select(
                "id, description, pack_size, unit_price, invoices!inner(user_id)"
            ).eq("id", invoice_item_id).eq("invoices.user_id", user_id).execute()
            
            if not invoice_item_result.data:
                raise Exception("Invoice item not found or unauthorized")
            
            invoice_item = invoice_item_result.data[0]
            item_name = invoice_item["description"]
            vendor_pack_size = invoice_item.get("pack_size")
            pack_price = float(invoice_item.get("unit_price") or 0)
            
            logger.info(f"   Found invoice item: {item_name}, pack={vendor_pack_size}, price=${pack_price}")
            
            # Step 2: Calculate unit cost and validate unit compatibility
            if vendor_pack_size and pack_price:
                # Calculate unit cost from pack
                unit_cost_weight, weight_unit, unit_cost_piece, error = converter.calculate_unit_cost_from_pack(
                    Decimal(str(pack_price)),
                    vendor_pack_size
                )
                
                if error:
                    warnings.append(error)
                else:
                    # Determine which cost to use based on recipe unit
                    if unit_of_measure.lower() in ['ea', 'each', 'pc', 'pcs', 'piece', 'pieces']:
                        # Recipe is in pieces
                        if unit_cost_piece:
                            calculated_cost = float(unit_cost_piece * Decimal(str(quantity_per_serving)))
                        elif unit_cost_weight:
                            warnings.append("Using weight cost for piece-based recipe")
                            conv_qty, conv_error = converter.convert_recipe_to_pack_unit(
                                Decimal(str(quantity_per_serving)),
                                unit_of_measure,
                                weight_unit
                            )
                            if conv_qty:
                                calculated_cost = float(unit_cost_weight * conv_qty)
                            else:
                                warnings.append(conv_error or "Unit conversion failed")
                    else:
                        # Recipe is in weight/volume
                        if unit_cost_weight:
                            # Validate unit compatibility
                            is_compatible, compat_error = converter.validate_unit_compatibility(
                                unit_of_measure,
                                weight_unit
                            )
                            
                            if not is_compatible:
                                warnings.append(compat_error)
                            else:
                                # Calculate cost
                                conv_qty, conv_error = converter.convert_recipe_to_pack_unit(
                                    Decimal(str(quantity_per_serving)),
                                    unit_of_measure,
                                    weight_unit
                                )
                                if conv_qty:
                                    calculated_cost = float(unit_cost_weight * conv_qty)
                                else:
                                    warnings.append(conv_error or "Unit conversion failed")
                        else:
                            warnings.append("Weight cost not available")
            else:
                warnings.append("Pack size not available")
            
            # Step 3: Insert ingredient (WRITE to menu_item_ingredients)
            # Links directly to invoice_item_id (no inventory_item intermediary needed)
            ingredient_data = {
                "menu_item_id": menu_item_id,
                "invoice_item_id": invoice_item_id,  # Direct link to source of truth
                "quantity_per_serving": quantity_per_serving,
                "unit_of_measure": unit_of_measure,
                "menu_item_price_id": menu_item_price_id,
                "notes": notes,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("menu_item_ingredients").insert(
                ingredient_data
            ).execute()
            
            ingredient_id = result.data[0]["id"]
            logger.info(f"✅ Ingredient added: {ingredient_id}")
            if warnings:
                logger.warning(f"⚠️  Warnings: {', '.join(warnings)}")
            
            return {
                "ingredient_id": ingredient_id,
                "warnings": warnings,
                "calculated_cost": calculated_cost
            }
            
        except Exception as e:
            logger.error(f"❌ Add ingredient failed: {e}")
            raise
    
    async def update_ingredient(
        self,
        ingredient_id: str,
        user_id: str,
        quantity_per_serving: Optional[float] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        Update ingredient quantity or notes
        
        Args:
            ingredient_id: Ingredient ID
            user_id: User ID (for security)
            quantity_per_serving: New quantity
            notes: New notes
            
        Returns:
            Success boolean
        """
        logger.info(f"✏️  Updating ingredient: {ingredient_id}")
        
        try:
            # Verify ownership
            ing_check = self.client.table("menu_item_ingredients").select(
                "menu_item_id"
            ).eq("id", ingredient_id).execute()
            
            if not ing_check.data:
                raise Exception("Ingredient not found")
            
            menu_item_id = ing_check.data[0]["menu_item_id"]
            
            menu_check = self.client.table("menu_items").select(
                "menu_id"
            ).eq("id", menu_item_id).execute()
            
            owner_check = self.client.table("restaurant_menus").select("id").eq(
                "id", menu_check.data[0]["menu_id"]
            ).eq("user_id", user_id).execute()
            
            if not owner_check.data:
                raise Exception("Unauthorized")
            
            # Update ingredient (WRITE to menu_item_ingredients)
            updates = {"updated_at": datetime.utcnow().isoformat()}
            
            if quantity_per_serving is not None:
                updates["quantity_per_serving"] = quantity_per_serving
            
            if notes is not None:
                updates["notes"] = notes
            
            self.client.table("menu_item_ingredients").update(updates).eq(
                "id", ingredient_id
            ).execute()
            
            logger.info(f"✅ Ingredient updated")
            return True
            
        except Exception as e:
            logger.error(f"❌ Update ingredient failed: {e}")
            raise
    
    async def remove_ingredient(
        self,
        ingredient_id: str,
        user_id: str
    ) -> bool:
        """
        Remove ingredient from menu item
        
        Args:
            ingredient_id: Ingredient ID
            user_id: User ID (for security)
            
        Returns:
            Success boolean
        """
        logger.info(f"🗑️  Removing ingredient: {ingredient_id}")
        
        try:
            # Verify ownership (same as update)
            ing_check = self.client.table("menu_item_ingredients").select(
                "menu_item_id"
            ).eq("id", ingredient_id).execute()
            
            if not ing_check.data:
                raise Exception("Ingredient not found")
            
            menu_item_id = ing_check.data[0]["menu_item_id"]
            
            menu_check = self.client.table("menu_items").select(
                "menu_id"
            ).eq("id", menu_item_id).execute()
            
            owner_check = self.client.table("restaurant_menus").select("id").eq(
                "id", menu_check.data[0]["menu_id"]
            ).eq("user_id", user_id).execute()
            
            if not owner_check.data:
                raise Exception("Unauthorized")
            
            # Delete ingredient (DELETE from menu_item_ingredients)
            self.client.table("menu_item_ingredients").delete().eq(
                "id", ingredient_id
            ).execute()
            
            logger.info(f"✅ Ingredient removed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Remove ingredient failed: {e}")
            raise
