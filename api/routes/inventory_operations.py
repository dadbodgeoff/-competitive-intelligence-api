"""
Inventory Operations API Routes
Handles inventory items, vendors, transactions, and price tracking
Pattern: Follows api/routes/invoice_operations.py structure
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from services.inventory_service import InventoryService
from services.vendor_service import VendorService
from services.inventory_transaction_service import InventoryTransactionService
from services.price_tracking_service import PriceTrackingService
from services.fuzzy_matching.fuzzy_item_matcher import FuzzyItemMatcher
from services.alert_generation_service import AlertGenerationService
from api.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory-operations"])

inventory_service = InventoryService()
vendor_service = VendorService()
transaction_service = InventoryTransactionService()
price_service = PriceTrackingService()
fuzzy_matcher = FuzzyItemMatcher()
alert_service = AlertGenerationService()


@router.get("/items")
async def list_inventory_items(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    low_stock: bool = Query(False),
    current_user: str = Depends(get_current_user)
):
    """
    List all inventory items for user
    
    Query params:
    - category: Filter by category
    - search: Search by name
    - low_stock: Only show low stock items
    """
    try:
        items = inventory_service.get_inventory_items(
            user_id=current_user,
            category=category,
            search_name=search,
            low_stock_only=low_stock
        )
        
        return JSONResponse({
            "success": True,
            "items": items,
            "count": len(items)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/items/{item_id}")
async def get_inventory_item(
    item_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get single inventory item with details
    
    Includes: current quantity, last purchase info, recent transactions
    """
    try:
        item = inventory_service.get_inventory_item(item_id, current_user)
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Get recent transactions
        transactions = transaction_service.get_transaction_history(
            item_id=item_id,
            user_id=current_user,
            limit=10
        )
        
        # Get price history
        price_history = price_service.get_price_history(
            inventory_item_id=item_id,
            user_id=current_user,
            days=90
        )
        
        return JSONResponse({
            "success": True,
            "item": item,
            "recent_transactions": transactions,
            "price_history": price_history
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/items/{item_id}/transactions")
async def get_item_transactions(
    item_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: str = Depends(get_current_user)
):
    """
    Get transaction history for inventory item
    
    Returns all inventory movements (purchases, depletions, adjustments)
    """
    try:
        transactions = transaction_service.get_transaction_history(
            item_id=item_id,
            user_id=current_user,
            limit=limit
        )
        
        return JSONResponse({
            "success": True,
            "transactions": transactions,
            "count": len(transactions)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/vendors")
async def list_vendors(
    active_only: bool = Query(True),
    current_user: str = Depends(get_current_user)
):
    """
    List all vendors for user
    
    Query params:
    - active_only: Only show active vendors (default: true)
    """
    try:
        vendors = vendor_service.get_vendors(
            user_id=current_user,
            active_only=active_only
        )
        
        return JSONResponse({
            "success": True,
            "vendors": vendors,
            "count": len(vendors)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/vendors/{vendor_id}/stats")
async def get_vendor_stats(
    vendor_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get vendor statistics
    
    Returns: invoice count, total spend, average invoice, last order date
    """
    try:
        stats = vendor_service.get_vendor_stats(
            vendor_id=vendor_id,
            user_id=current_user
        )
        
        return JSONResponse({
            "success": True,
            "stats": stats
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/price-history/{item_id}")
async def get_price_history(
    item_id: str,
    days: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """
    Get price history for inventory item across all vendors
    
    Query params:
    - days: Number of days to look back (default: 90)
    """
    try:
        history = price_service.get_price_history(
            inventory_item_id=item_id,
            user_id=current_user,
            days=days
        )
        
        # Detect anomalies
        anomalies = price_service.detect_price_anomalies(
            inventory_item_id=item_id,
            user_id=current_user
        )
        
        return JSONResponse({
            "success": True,
            "price_history": history,
            "anomalies": anomalies,
            "count": len(history)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/alerts")
async def get_inventory_alerts(
    unread_only: bool = Query(False),
    severity: Optional[str] = Query(None),
    current_user: str = Depends(get_current_user)
):
    """
    Get inventory alerts for user
    
    Query params:
    - unread_only: Only show unread alerts (default: false)
    - severity: Filter by severity (warning, info, error)
    """
    try:
        query = alert_service.client.table("inventory_alerts").select("*").eq(
            "user_id", current_user
        )
        
        if unread_only:
            query = query.is_("read_at", "null")
        
        if severity:
            query = query.eq("severity", severity)
        
        query = query.is_("dismissed_at", "null").order("created_at", desc=True).limit(50)
        
        result = query.execute()
        
        return JSONResponse({
            "success": True,
            "alerts": result.data,
            "count": len(result.data)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/alerts/generate")
async def trigger_alert_generation(
    current_user: str = Depends(get_current_user)
):
    """
    Manually trigger alert generation
    
    Runs all alert checks and returns summary
    """
    try:
        summary = alert_service.run_all_alert_checks(current_user)
        
        return JSONResponse({
            "success": True,
            "summary": summary,
            "message": f"Generated {summary['total_alerts']} alerts"
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/alerts/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Dismiss an alert
    """
    try:
        success = alert_service.dismiss_alert(alert_id, current_user)
        
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return JSONResponse({
            "success": True,
            "message": "Alert dismissed"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Mark alert as read
    """
    try:
        success = alert_service.mark_alert_read(alert_id, current_user)
        
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return JSONResponse({
            "success": True,
            "message": "Alert marked as read"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)



@router.get("/items/{item_id}/similar")
async def find_similar_items(
    item_id: str,
    threshold: float = Query(0.7, ge=0.0, le=1.0),
    limit: int = Query(10, ge=1, le=50),
    current_user: str = Depends(get_current_user)
):
    """
    Find similar items to help identify duplicates
    
    Query params:
    - threshold: Minimum similarity score (0.0-1.0, default: 0.7)
    - limit: Max results (default: 10)
    
    Returns items with similarity scores
    """
    try:
        # Get the target item
        item = inventory_service.get_inventory_item(item_id, current_user)
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Find similar items
        similar_items = fuzzy_matcher.find_similar_items(
            target_name=item['name'],
            user_id=current_user,
            category=item.get('category'),
            threshold=threshold,
            limit=limit + 1  # +1 to exclude self
        )
        
        # Remove the item itself from results
        similar_items = [
            item for item in similar_items
            if item['id'] != item_id
        ][:limit]
        
        return JSONResponse({
            "success": True,
            "target_item": {
                "id": item['id'],
                "name": item['name'],
                "category": item.get('category')
            },
            "similar_items": similar_items,
            "count": len(similar_items)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/matches/pending-review")
async def get_pending_matches(
    limit: int = Query(50, ge=1, le=200),
    current_user: str = Depends(get_current_user)
):
    """
    Get vendor item mappings that need manual review
    
    Returns items with match_method='fuzzy_review' that need confirmation
    """
    try:
        from services.vendor_item_mapper import VendorItemMapper
        mapper = VendorItemMapper()
        
        # Query mappings that need review
        result = mapper.client.table("vendor_item_mappings").select(
            """
            id,
            vendor_id,
            vendor_item_number,
            vendor_description,
            inventory_item_id,
            match_confidence,
            match_method,
            matched_at,
            vendor_pack_size,
            vendors (name),
            inventory_items (name, category, unit_of_measure)
            """
        ).eq("user_id", current_user).eq(
            "needs_review", True
        ).order("matched_at", desc=True).limit(limit).execute()
        
        return JSONResponse({
            "success": True,
            "pending_matches": result.data,
            "count": len(result.data)
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/matches/{mapping_id}/confirm")
async def confirm_match(
    mapping_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    User confirms a fuzzy match is correct
    
    Updates match_method to 'fuzzy_confirmed' and clears needs_review flag
    """
    try:
        from services.vendor_item_mapper import VendorItemMapper
        mapper = VendorItemMapper()
        
        # Update mapping
        result = mapper.client.table("vendor_item_mappings").update({
            "match_method": "fuzzy_confirmed",
            "needs_review": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", mapping_id).eq("user_id", current_user).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Mapping not found")
        
        return JSONResponse({
            "success": True,
            "message": "Match confirmed",
            "mapping": result.data[0]
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.post("/matches/{mapping_id}/reject")
async def reject_match(
    mapping_id: str,
    correct_item_id: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    User rejects a fuzzy match
    
    Either links to correct item (if correct_item_id provided) or creates new item
    
    Body params:
    - correct_item_id: Optional UUID of correct inventory item
    """
    try:
        from services.vendor_item_mapper import VendorItemMapper
        mapper = VendorItemMapper()
        
        # Get the mapping
        mapping_result = mapper.client.table("vendor_item_mappings").select("*").eq(
            "id", mapping_id
        ).eq("user_id", current_user).execute()
        
        if not mapping_result.data:
            raise HTTPException(status_code=404, detail="Mapping not found")
        
        mapping = mapping_result.data[0]
        
        if correct_item_id:
            # Link to correct item
            result = mapper.client.table("vendor_item_mappings").update({
                "inventory_item_id": correct_item_id,
                "match_method": "manual",
                "match_confidence": 1.0,
                "needs_review": False,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", mapping_id).eq("user_id", current_user).execute()
            
            return JSONResponse({
                "success": True,
                "message": "Mapping updated to correct item",
                "mapping": result.data[0]
            })
        else:
            # Create new inventory item
            new_item = inventory_service.create_inventory_item(
                user_id=current_user,
                name=mapping['vendor_description'],
                category=mapping.get('category', 'dry_goods'),
                unit_of_measure="ea"
            )
            
            # Update mapping
            result = mapper.client.table("vendor_item_mappings").update({
                "inventory_item_id": new_item['id'],
                "match_method": "new",
                "match_confidence": 1.0,
                "needs_review": False,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", mapping_id).eq("user_id", current_user).execute()
            
            return JSONResponse({
                "success": True,
                "message": "New inventory item created",
                "new_item": new_item,
                "mapping": result.data[0]
            })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/cross-vendor-prices/{item_id}")
async def get_cross_vendor_prices(
    item_id: str,
    days: int = Query(90, ge=1, le=365),
    current_user: str = Depends(get_current_user)
):
    """
    Get price comparison across all vendors for this item
    
    Uses fuzzy matching to find same item from different vendors
    
    Query params:
    - days: Number of days to look back (default: 90)
    """
    try:
        # Get the item
        item = inventory_service.get_inventory_item(item_id, current_user)
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Get all vendor mappings for this item
        from services.vendor_item_mapper import VendorItemMapper
        mapper = VendorItemMapper()
        
        mappings_result = mapper.client.table("vendor_item_mappings").select(
            """
            id,
            vendor_id,
            vendor_item_number,
            vendor_description,
            last_price,
            last_ordered_date,
            vendor_pack_size,
            vendors (name)
            """
        ).eq("user_id", current_user).eq(
            "inventory_item_id", item_id
        ).execute()
        
        # Get price history for each vendor
        vendor_prices = []
        for mapping in mappings_result.data:
            price_history = price_service.get_price_history(
                inventory_item_id=item_id,
                user_id=current_user,
                vendor_id=mapping['vendor_id'],
                days=days
            )
            
            vendor_prices.append({
                "vendor_name": mapping['vendors']['name'],
                "vendor_item_number": mapping['vendor_item_number'],
                "vendor_description": mapping['vendor_description'],
                "current_price": mapping['last_price'],
                "last_ordered": mapping['last_ordered_date'],
                "pack_size": mapping['vendor_pack_size'],
                "price_history": price_history
            })
        
        # Sort by current price (lowest first)
        vendor_prices.sort(key=lambda x: x['current_price'] or float('inf'))
        
        return JSONResponse({
            "success": True,
            "item": {
                "id": item['id'],
                "name": item['name'],
                "category": item.get('category')
            },
            "vendor_prices": vendor_prices,
            "vendor_count": len(vendor_prices),
            "lowest_price": vendor_prices[0]['current_price'] if vendor_prices else None,
            "highest_price": vendor_prices[-1]['current_price'] if vendor_prices else None
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


@router.get("/fuzzy-matching/stats")
async def get_fuzzy_matching_stats(
    current_user: str = Depends(get_current_user)
):
    """
    Get fuzzy matching statistics
    
    Returns:
    - Total mappings by method
    - Pending review count
    - Average confidence scores
    """
    try:
        from services.vendor_item_mapper import VendorItemMapper
        mapper = VendorItemMapper()
        
        # Get all mappings
        all_mappings = mapper.client.table("vendor_item_mappings").select(
            "match_method, match_confidence, needs_review"
        ).eq("user_id", current_user).execute()
        
        # Calculate stats
        total = len(all_mappings.data)
        by_method = {}
        pending_review = 0
        confidence_sum = 0
        
        for mapping in all_mappings.data:
            method = mapping['match_method']
            by_method[method] = by_method.get(method, 0) + 1
            
            if mapping['needs_review']:
                pending_review += 1
            
            if mapping['match_confidence']:
                confidence_sum += float(mapping['match_confidence'])
        
        avg_confidence = confidence_sum / total if total > 0 else 0
        
        return JSONResponse({
            "success": True,
            "stats": {
                "total_mappings": total,
                "by_method": by_method,
                "pending_review": pending_review,
                "average_confidence": round(avg_confidence, 3),
                "auto_match_rate": by_method.get('fuzzy_auto', 0) / total if total > 0 else 0
            }
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)
