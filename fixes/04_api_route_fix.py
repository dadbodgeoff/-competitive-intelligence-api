"""
FIX 4: API Route - api/routes/menu/recipes.py
Changes: Simplify to only accept invoice_item_id (remove backward compatibility)
"""

# ============================================================================
# CHANGE: AddIngredientRequest model (Line ~40)
# ============================================================================

# REPLACE:
class AddIngredientRequest(BaseModel):
    invoice_item_id: Optional[str] = None  # New: direct link to invoice_items (source of truth)
    inventory_item_id: Optional[str] = None  # Deprecated: kept for backward compatibility
    menu_item_price_id: Optional[str] = None
    quantity_per_serving: float
    unit_of_measure: str
    notes: Optional[str] = None
    
    def get_item_id(self) -> str:
        """Get the item ID, preferring invoice_item_id over inventory_item_id"""
        if self.invoice_item_id:
            return self.invoice_item_id
        if self.inventory_item_id:
            return self.inventory_item_id
        raise ValueError("Either invoice_item_id or inventory_item_id must be provided")

# WITH (SIMPLIFIED):
class AddIngredientRequest(BaseModel):
    invoice_item_id: str  # Required - direct link to invoice_items (source of truth)
    menu_item_price_id: Optional[str] = None
    quantity_per_serving: float
    unit_of_measure: str
    notes: Optional[str] = None

# ============================================================================
# CHANGE: add_menu_ingredient endpoint (Line ~110)
# ============================================================================

# REPLACE:
@router.post("/items/{menu_item_id}/ingredients")
async def add_menu_ingredient(
    menu_item_id: str,
    request: AddIngredientRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Add ingredient to menu item recipe
    WRITES to menu_item_ingredients (menu owns this)
    READS from invoice_items (source of truth for pricing)
    """
    try:
        # Get the item ID (supports both invoice_item_id and inventory_item_id for backward compatibility)
        item_id = request.get_item_id()
        
        result = await recipe_service.add_ingredient(
            menu_item_id=menu_item_id,
            invoice_item_id=item_id,
            quantity_per_serving=request.quantity_per_serving,
            unit_of_measure=request.unit_of_measure,
            user_id=current_user,
            menu_item_price_id=request.menu_item_price_id,
            notes=request.notes
        )

# WITH (SIMPLIFIED):
@router.post("/items/{menu_item_id}/ingredients")
async def add_menu_ingredient(
    menu_item_id: str,
    request: AddIngredientRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Add ingredient to menu item recipe
    WRITES to menu_item_ingredients (menu owns this)
    READS from invoice_items (source of truth for pricing)
    """
    try:
        result = await recipe_service.add_ingredient(
            menu_item_id=menu_item_id,
            invoice_item_id=request.invoice_item_id,  # ✅ Direct use - no fallback
            quantity_per_serving=request.quantity_per_serving,
            unit_of_measure=request.unit_of_measure,
            user_id=current_user,
            menu_item_price_id=request.menu_item_price_id,
            notes=request.notes
        )

# ============================================================================
# Summary of Changes
# ============================================================================
"""
1. Remove Optional from invoice_item_id (make it required)
2. Remove inventory_item_id field completely
3. Remove get_item_id() helper method
4. Simplify add_menu_ingredient to use invoice_item_id directly
"""
