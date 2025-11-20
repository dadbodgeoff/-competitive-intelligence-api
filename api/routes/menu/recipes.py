"""
Menu Recipe Routes
Handles ingredient linking and COGS calculations for plate costing
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
import logging
import os
from supabase import create_client
from dotenv import load_dotenv

from services.menu_recipe_service import MenuRecipeService
from api.middleware.auth import get_current_user
from services.background_tasks import (
    get_cached_payload,
    recipe_snapshot_key,
    run_post_recipe_change_tasks,
    store_recipe_snapshot,
)

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/menu", tags=["menu-recipes"])

# Initialize service
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_client = create_client(supabase_url, supabase_key)
recipe_service = MenuRecipeService(supabase_client)


# Pydantic models
class AddIngredientRequest(BaseModel):
    invoice_item_id: str  # Required - direct link to invoice_items (source of truth)
    menu_item_price_id: Optional[str] = None
    quantity_per_serving: float
    unit_of_measure: str
    notes: Optional[str] = None


class UpdateIngredientRequest(BaseModel):
    quantity_per_serving: Optional[float] = None
    notes: Optional[str] = None


@router.get("/debug-user")
async def debug_current_user(
    current_user: str = Depends(get_current_user)
):
    """Debug endpoint to check current user ID"""
    return JSONResponse({
        "success": True,
        "user_id": current_user,
        "user_id_type": type(current_user).__name__
    })


@router.get("/search-inventory")
async def search_inventory_items(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: str = Depends(get_current_user)
):
    """
    Search inventory items for linking to menu items
    READ ONLY access to inventory_items table
    """
    logger.info(f"🔍 Search inventory items")
    try:
        results = await recipe_service.search_inventory_items(
            user_id=current_user,
            query=q,
            limit=limit
        )
        
        return JSONResponse({
            "success": True,
            "results": results,
            "count": len(results)
        })
        
    except Exception as e:
        logger.error(f"❌ Search failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/items/batch/recipes")
async def get_batch_recipes(
    menu_ids: str = Query(..., description="Comma-separated menu item IDs"),
    current_user: str = Depends(get_current_user)
):
    """
    BATCH endpoint: Get recipes for multiple menu items in ONE request
    Dramatically reduces N+1 queries (83 requests -> 1 request)
    """
    try:
        menu_item_ids = [id.strip() for id in menu_ids.split(',') if id.strip()]
        
        if not menu_item_ids:
            return JSONResponse({
                "success": False,
                "error": "No menu item IDs provided"
            }, status_code=400)
        
        if len(menu_item_ids) > 200:
            return JSONResponse({
                "success": False,
                "error": "Maximum 200 items per batch request"
            }, status_code=400)
        
        logger.info(f"📦 Batch fetching recipes for {len(menu_item_ids)} items")
        
        # Fetch all recipes in optimized batches
        recipes = await recipe_service.get_recipes_batch(
            menu_item_ids=menu_item_ids,
            user_id=current_user
        )
        
        logger.info(f"✅ Batch loaded {len(recipes)} recipes")
        
        return JSONResponse({
            "success": True,
            "recipes": recipes,
            "count": len(recipes)
        })
        
    except Exception as e:
        logger.error(f"❌ Batch get recipes failed: {e}", exc_info=True)
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/items/{menu_item_id}/recipe")
async def get_menu_item_recipe(
    menu_item_id: str,
    price_id: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Get recipe and COGS calculation for menu item
    Joins with inventory_items (READ ONLY) for current costs
    """
    try:
        if price_id is None:
            cache_key = recipe_snapshot_key(current_user, menu_item_id)
            cached = get_cached_payload(cache_key)
            if cached:
                return JSONResponse({
                    "success": True,
                    **cached,
                    "cache_hit": True
                })

        recipe = await recipe_service.get_recipe(
            menu_item_id=menu_item_id,
            user_id=current_user,
            price_id=price_id
        )

        if price_id is None:
            store_recipe_snapshot(current_user, menu_item_id, recipe)

        return JSONResponse({
            "success": True,
            **recipe
        })
        
    except Exception as e:
        logger.error(f"❌ Get recipe failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/items/{menu_item_id}/ingredients")
async def add_menu_ingredient(
    background_tasks: BackgroundTasks,
    menu_item_id: str,
    request: AddIngredientRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Add ingredient to menu item recipe
    WRITES to menu_item_ingredients (menu owns this)
    READS from invoice_items (source of truth for pricing)
    """
    try:
        result = await recipe_service.add_ingredient(
            menu_item_id=menu_item_id,
            invoice_item_id=request.invoice_item_id,  # Direct use - links to source of truth
            quantity_per_serving=request.quantity_per_serving,
            unit_of_measure=request.unit_of_measure,
            user_id=current_user,
            menu_item_price_id=request.menu_item_price_id,
            notes=request.notes
        )
        
        response = JSONResponse({
            "success": True,
            **result  # Returns ingredient_id, warnings, calculated_cost
        })
        
        background_tasks.add_task(
            run_post_recipe_change_tasks,
            current_user,
            [menu_item_id],
        )
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Add ingredient failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=400)


@router.put("/items/{menu_item_id}/ingredients/{ingredient_id}")
async def update_menu_ingredient(
    background_tasks: BackgroundTasks,
    menu_item_id: str,
    ingredient_id: str,
    request: UpdateIngredientRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Update ingredient quantity or notes
    WRITES to menu_item_ingredients only
    """
    try:
        success = await recipe_service.update_ingredient(
            ingredient_id=ingredient_id,
            user_id=current_user,
            quantity_per_serving=request.quantity_per_serving,
            notes=request.notes
        )
        
        response = JSONResponse({
            "success": success,
            "message": "Ingredient updated successfully"
        })
        
        background_tasks.add_task(
            run_post_recipe_change_tasks,
            current_user,
            [menu_item_id],
        )
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Update ingredient failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=400)


@router.delete("/items/{menu_item_id}/ingredients/{ingredient_id}")
async def remove_menu_ingredient(
    background_tasks: BackgroundTasks,
    menu_item_id: str,
    ingredient_id: str,
    current_user: str = Depends(get_current_user),
):
    """
    Remove ingredient from menu item
    DELETES from menu_item_ingredients only
    """
    try:
        success = await recipe_service.remove_ingredient(
            ingredient_id=ingredient_id,
            user_id=current_user
        )
        
        response = JSONResponse({
            "success": success,
            "message": "Ingredient removed successfully"
        })
        
        background_tasks.add_task(
            run_post_recipe_change_tasks,
            current_user,
            [menu_item_id],
        )
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Remove ingredient failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=400)
