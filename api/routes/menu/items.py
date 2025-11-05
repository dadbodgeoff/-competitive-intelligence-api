"""
Menu Item Operations Routes
Handles CRUD operations for individual menu items
Pattern: Follows invoice item management
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import logging

from services.menu_storage_service import MenuStorageService
from api.middleware.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/menu", tags=["menu-operations"])

# Initialize services
storage_service = MenuStorageService()


# Pydantic models
class UpdateItemRequest(BaseModel):
    item_name: Optional[str] = None
    description: Optional[str] = None
    options: Optional[List[str]] = None
    notes: Optional[str] = None
    prices: Optional[List[dict]] = None  # [{"size": "Small", "price": 10.99}]


class AddItemRequest(BaseModel):
    category_id: str
    item_name: str
    description: Optional[str] = None
    options: Optional[List[str]] = None
    notes: Optional[str] = None
    prices: List[dict]  # [{"size": "Small", "price": 10.99}]


@router.patch("/items/{item_id}")
async def update_menu_item(
    item_id: str,
    request: UpdateItemRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Update a menu item
    
    Can update: name, description, options, notes, prices
    """
    try:
        success = await storage_service.update_menu_item(
            item_id=item_id,
            user_id=current_user,
            updates=request.dict(exclude_unset=True)
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Menu item not found"
            )
        
        return JSONResponse({
            "success": True,
            "message": "Menu item updated successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Update item failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/items")
async def add_menu_item(
    request: AddItemRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Add a new menu item to a category
    """
    try:
        item_id = await storage_service.add_menu_item(
            user_id=current_user,
            category_id=request.category_id,
            item_data=request.dict()
        )
        
        return JSONResponse({
            "success": True,
            "item_id": item_id,
            "message": "Menu item added successfully"
        })
        
    except Exception as e:
        logger.error(f"❌ Add item failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.delete("/items/{item_id}")
async def delete_menu_item(
    item_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete a menu item
    """
    try:
        success = await storage_service.delete_menu_item(
            item_id=item_id,
            user_id=current_user
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Menu item not found"
            )
        
        return JSONResponse({
            "success": True,
            "message": "Menu item deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete item failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/items/{item_id}")
async def get_menu_item(
    item_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get a single menu item with prices
    """
    try:
        item = await storage_service.get_menu_item(
            item_id=item_id,
            user_id=current_user
        )
        
        if not item:
            raise HTTPException(
                status_code=404,
                detail="Menu item not found"
            )
        
        return JSONResponse({
            "success": True,
            "item": item
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get item failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
