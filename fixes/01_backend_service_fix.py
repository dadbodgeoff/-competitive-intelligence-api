"""
FIX 1: Backend Service - menu_recipe_service.py
Changes: Use invoice_item_id instead of inventory_item_id throughout
"""

# ============================================================================
# CHANGE 1: add_ingredient() method - Line ~560
# ============================================================================

# REPLACE THIS SECTION (around line 560-575):
"""
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
"""

# WITH THIS (FIXED):
"""
            # Step 3: Insert ingredient (WRITE to menu_item_ingredients)
            # Links directly to invoice_item_id (SOURCE OF TRUTH)
            ingredient_data = {
                "menu_item_id": menu_item_id,
                "invoice_item_id": invoice_item_id,  # ✅ CORRECT - Direct link to invoice_items
                "quantity_per_serving": quantity_per_serving,
                "unit_of_measure": unit_of_measure,
                "menu_item_price_id": menu_item_price_id,
                "notes": notes,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"   Saving ingredient with invoice_item_id: {invoice_item_id}")
"""

# ============================================================================
# CHANGE 2: get_recipe() method - Line ~380-420
# ============================================================================

# REPLACE THIS SECTION (around line 380-390):
"""
            # Get ingredients with current costs (JOIN with inventory_items READ ONLY)
            ingredients_query = self.client.table("menu_item_ingredients").select(
                "id, inventory_item_id, quantity_per_serving, unit_of_measure, notes, "
                "menu_item_price_id"
            ).eq("menu_item_id", menu_item_id)
"""

# WITH THIS (FIXED):
"""
            # Get ingredients with current costs (JOIN with invoice_items - SOURCE OF TRUTH)
            ingredients_query = self.client.table("menu_item_ingredients").select(
                "id, invoice_item_id, quantity_per_serving, unit_of_measure, notes, "
                "menu_item_price_id"
            ).eq("menu_item_id", menu_item_id)
"""

# REPLACE THIS SECTION (around line 400-430):
"""
            for ing in ingredients_result.data or []:
                # Get inventory item details (READ ONLY)
                inv_result = self.client.table("inventory_items").select(
                    "name, average_unit_cost, last_purchase_date, last_purchase_price"
                ).eq("id", ing["inventory_item_id"]).execute()
                
                if inv_result.data:
                    inv_item = inv_result.data[0]
                    recipe_qty = float(ing["quantity_per_serving"])
                    recipe_unit = ing["unit_of_measure"]
                    
                    # Get pack info from invoice_items (SOURCE OF TRUTH)
                    # Use ilike for fuzzy matching since inventory names may be normalized
                    invoice_items_result = self.client.table("invoice_items").select(
                        "pack_size, unit_price, created_at"
                    ).ilike("description", f"%{inv_item['name']}%").order(
                        "created_at", desc=True
                    ).limit(1).execute()
"""

# WITH THIS (FIXED - Direct query to invoice_items):
"""
            for ing in ingredients_result.data or []:
                invoice_item_id = ing.get("invoice_item_id")
                
                if not invoice_item_id:
                    logger.warning(f"   Ingredient {ing['id']} has no invoice_item_id - skipping")
                    continue
                
                # Get invoice item details (SOURCE OF TRUTH - DIRECT QUERY)
                invoice_result = self.client.table("invoice_items").select(
                    "id, description, pack_size, unit_price, created_at, invoice_id"
                ).eq("id", invoice_item_id).execute()
                
                if not invoice_result.data:
                    logger.error(f"   Invoice item {invoice_item_id} not found!")
                    continue
                
                invoice_item = invoice_result.data[0]
                item_name = invoice_item["description"]
                recipe_qty = float(ing["quantity_per_serving"])
                recipe_unit = ing["unit_of_measure"]
"""

# REPLACE THE REST OF THE LOOP (around line 430-500):
"""
                    vendor_pack_size = None
                    pack_price = None
                    calculated_unit_cost = None
                    base_unit = None
                    converted_qty = None
                    converted_unit = None
                    ingredient_warnings = []
                    
                    if invoice_items_result.data:
                        invoice_item = invoice_items_result.data[0]
                        vendor_pack_size = invoice_item.get("pack_size")
                        pack_price = float(invoice_item.get("unit_price") or 0)
                        logger.info(f"   Found invoice data: pack={vendor_pack_size}, price=${pack_price}")
"""

# WITH THIS (FIXED - Use data we already have):
"""
                vendor_pack_size = invoice_item.get("pack_size")
                pack_price = float(invoice_item.get("unit_price") or 0)
                calculated_unit_cost = None
                base_unit = None
                converted_qty = None
                converted_unit = None
                ingredient_warnings = []
                
                logger.info(f"   Processing: {item_name}, pack={vendor_pack_size}, price=${pack_price}")
"""

# KEEP THE REST OF THE UNIT CONVERSION LOGIC THE SAME (it's correct)
# Just update the final enriched_ingredients.append() call:

# REPLACE (around line 500):
"""
                    enriched_ingredients.append({
                        "id": ing["id"],
                        "inventory_item_id": ing["inventory_item_id"],
                        "inventory_item_name": inv_item["name"],
"""

# WITH THIS (FIXED):
"""
                    enriched_ingredients.append({
                        "id": ing["id"],
                        "invoice_item_id": invoice_item_id,
                        "invoice_item_description": item_name,
"""

# ============================================================================
# Summary of Changes
# ============================================================================
"""
1. add_ingredient(): Already saves to invoice_item_id ✅ (no change needed)
2. get_recipe(): 
   - Query invoice_item_id instead of inventory_item_id
   - Direct query to invoice_items (no inventory_items intermediary)
   - Return invoice_item_id and invoice_item_description in response
"""
