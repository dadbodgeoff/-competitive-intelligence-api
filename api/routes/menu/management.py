"""
Menu Management Routes
Handles save, list, get, delete operations
Pattern: Follows api/routes/invoices/management.py
"""
import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
import logging
import time

from services.menu_storage_service import MenuStorageService
from services.menu_validator_service import MenuValidatorService
from api.middleware.auth import get_current_user
from services.demo_seed_service import demo_seed_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/menu", tags=["menu-operations"])

# Initialize services
storage_service = MenuStorageService()
validator_service = MenuValidatorService()


# Pydantic models
class SaveMenuRequest(BaseModel):
    menu_data: dict
    parse_metadata: dict
    file_url: str


@router.post("/save")
async def save_menu(
    request: SaveMenuRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Save parsed/reviewed menu to database
    
    This is the ONLY write to database - happens after user confirmation
    Stores menu header, categories, items, and prices
    
    Free tier: 1 menu upload per week
    Premium: Unlimited
    """
    save_start = time.time()
    
    try:
        # Check usage limits (free tier: 1 menu upload per week)
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        
        allowed, limit_details = usage_service.check_limit(current_user, 'menu_upload')
        
        if not allowed:
            logger.warning(f"Menu upload blocked for user {current_user}: {limit_details['message']}")
            raise HTTPException(
                status_code=429,
                detail={
                    'error': 'Usage limit exceeded',
                    'message': limit_details['message'],
                    'current_usage': limit_details['current_usage'],
                    'limit': limit_details['limit_value'],
                    'reset_date': limit_details['reset_date'],
                    'subscription_tier': limit_details['subscription_tier']
                }
            )
        
        # Validate before saving
        validation = validator_service.validate_menu(request.menu_data)
        
        if not validation['valid']:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid menu data: {validation['errors']}"
            )
        
        # Save to database (single transaction)
        menu_id = await storage_service.save_menu(
            menu_data=request.menu_data,
            file_url=request.file_url,
            user_id=current_user,
            parse_metadata=request.parse_metadata
        )
        
        save_time = time.time() - save_start
        
        # Increment usage counter (only after successful save)
        usage_service.increment_usage(
            user_id=current_user,
            operation_type='menu_upload',
            operation_id=menu_id,
            metadata={
                'items_count': len(request.menu_data.get('menu_items', [])),
                'save_time_seconds': round(save_time, 2)
            }
        )
        
        logger.info(f"✅ Menu {menu_id} saved successfully in {save_time:.2f}s")

        try:
            asyncio.get_running_loop().create_task(
                asyncio.to_thread(demo_seed_service.mark_seed_consumed, current_user)
            )
        except RuntimeError:
            demo_seed_service.mark_seed_consumed(current_user)
        
        return JSONResponse({
            "success": True,
            "menu_id": menu_id,
            "items_saved": len(request.menu_data.get('menu_items', [])),
            "save_time_seconds": round(save_time, 2),
            "usage_info": {
                'current_usage': limit_details['current_usage'] + 1,
                'limit': limit_details['limit_value'],
                'reset_date': limit_details['reset_date']
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Save failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/current")
async def get_current_menu(
    include_items: bool = Query(True, description="Include full item details (slower)"),
    current_user: str = Depends(get_current_user)
):
    """
    Get user's active menu
    
    Query params:
    - include_items: If false, only returns menu header and category names (fast)
    
    Returns menu header, categories, items, and prices
    """
    try:
        menu = await storage_service.get_active_menu(current_user, include_items=include_items)
        
        if not menu:
            return JSONResponse({
                "success": True,
                "menu": None,
                "message": "No active menu found"
            })
        
        return JSONResponse({
            "success": True,
            "menu": menu['menu'],
            "categories": menu['categories']
        })
        
    except Exception as e:
        logger.error(f"❌ Get menu failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/summary")
async def get_menu_summary(
    current_user: str = Depends(get_current_user)
):
    """
    Get lightweight menu summary (fast - no items)
    
    Returns just menu header and category names for quick page load
    """
    try:
        menu = await storage_service.get_active_menu(current_user, include_items=False)
        
        if not menu:
            return JSONResponse({
                "success": True,
                "menu": None,
                "message": "No active menu found"
            })
        
        return JSONResponse({
            "success": True,
            "menu": menu['menu'],
            "categories": menu['categories']
        })
        
    except Exception as e:
        logger.error(f"❌ Get menu summary failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/upload-limit")
async def check_menu_upload_limit(
    current_user: str = Depends(get_current_user)
):
    """
    Check if user can upload a menu
    
    Returns usage limit details for menu uploads
    """
    try:
        from services.usage_limit_service import get_usage_limit_service
        usage_service = get_usage_limit_service()
        
        allowed, limit_details = usage_service.check_limit(current_user, 'menu_upload')
        
        return JSONResponse({
            "success": True,
            "allowed": allowed,
            "current_usage": limit_details['current_usage'],
            "limit": limit_details['limit_value'],
            "reset_date": limit_details['reset_date'],
            "message": limit_details['message'],
            "subscription_tier": limit_details['subscription_tier']
        })
        
    except Exception as e:
        logger.error(f"❌ Check menu upload limit failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/list")
async def list_menus(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page (max 100)"),
    current_user: str = Depends(get_current_user)
):
    """
    List user's menus with pagination
    
    Query params:
    - page: Page number (1-indexed, default 1)
    - per_page: Results per page (1-100, default 50)
    
    Returns:
    - data: List of menus
    - pagination: Metadata (page, per_page, total_count, total_pages, has_next, has_prev)
    """
    try:
        # Calculate offset from page
        offset = (page - 1) * per_page
        
        menus = await storage_service.list_menus(
            user_id=current_user,
            limit=per_page,
            offset=offset
        )
        
        # Calculate pagination metadata
        total_count = menus['count']
        total_pages = (total_count + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return JSONResponse({
            "success": True,
            "data": menus['data'],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev,
                "next_page": page + 1 if has_next else None,
                "prev_page": page - 1 if has_prev else None
            }
        })
        
    except Exception as e:
        logger.error(f"❌ List menus failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.delete("/{menu_id}")
async def archive_menu(
    menu_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Archive menu (soft delete)
    
    This action can be undone by reactivating the menu
    """
    try:
        success = await storage_service.archive_menu(
            menu_id=menu_id,
            user_id=current_user
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Menu not found"
            )
        
        return JSONResponse({
            "success": True,
            "message": "Menu archived successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Archive failed: {e}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
