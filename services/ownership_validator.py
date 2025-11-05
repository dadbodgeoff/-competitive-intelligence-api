"""
Data Ownership Validation Service
Prevents Insecure Direct Object Reference (IDOR) vulnerabilities
"""
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class OwnershipValidator:
    """
    Validates that users can only access their own data.
    
    Security Best Practice:
    - Always verify ownership before returning sensitive data
    - Use service client (bypasses RLS) for ownership checks
    - Log unauthorized access attempts for security monitoring
    """
    
    @staticmethod
    def verify_ownership(
        resource_user_id: str,
        current_user_id: str,
        resource_type: str = "resource",
        resource_id: Optional[str] = None
    ) -> None:
        """
        Verify that the current user owns the resource.
        
        Args:
            resource_user_id: User ID from the resource
            current_user_id: Current authenticated user ID
            resource_type: Type of resource (for logging)
            resource_id: Resource ID (for logging)
            
        Raises:
            HTTPException: 403 if ownership verification fails
        """
        if resource_user_id != current_user_id:
            # Log unauthorized access attempt
            logger.warning(
                f"🚨 SECURITY: Unauthorized access attempt",
                extra={
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "resource_owner": resource_user_id,
                    "attempted_by": current_user_id,
                    "severity": "HIGH"
                }
            )
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. You don't have permission to access this {resource_type}."
            )
    
    @staticmethod
    async def verify_invoice_ownership(
        invoice_id: str,
        current_user_id: str
    ) -> Dict[str, Any]:
        """
        Verify invoice ownership and return invoice data.
        
        Args:
            invoice_id: Invoice ID to verify
            current_user_id: Current authenticated user ID
            
        Returns:
            Invoice data if ownership verified
            
        Raises:
            HTTPException: 404 if not found, 403 if not owned by user
        """
        supabase = get_supabase_service_client()
        
        # Fetch invoice with service client (bypasses RLS)
        result = supabase.table("invoices").select("*").eq("id", invoice_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        invoice = result.data[0]
        
        # Verify ownership
        OwnershipValidator.verify_ownership(
            resource_user_id=invoice["user_id"],
            current_user_id=current_user_id,
            resource_type="invoice",
            resource_id=invoice_id
        )
        
        return invoice
    
    @staticmethod
    async def verify_menu_ownership(
        menu_id: str,
        current_user_id: str
    ) -> Dict[str, Any]:
        """
        Verify menu ownership and return menu data.
        
        Args:
            menu_id: Menu ID to verify
            current_user_id: Current authenticated user ID
            
        Returns:
            Menu data if ownership verified
            
        Raises:
            HTTPException: 404 if not found, 403 if not owned by user
        """
        supabase = get_supabase_service_client()
        
        result = supabase.table("menus").select("*").eq("id", menu_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found"
            )
        
        menu = result.data[0]
        
        OwnershipValidator.verify_ownership(
            resource_user_id=menu["user_id"],
            current_user_id=current_user_id,
            resource_type="menu",
            resource_id=menu_id
        )
        
        return menu
    
    @staticmethod
    async def verify_analysis_ownership(
        analysis_id: str,
        current_user_id: str
    ) -> Dict[str, Any]:
        """
        Verify analysis ownership and return analysis data.
        
        Args:
            analysis_id: Analysis ID to verify
            current_user_id: Current authenticated user ID
            
        Returns:
            Analysis data if ownership verified
            
        Raises:
            HTTPException: 404 if not found, 403 if not owned by user
        """
        supabase = get_supabase_service_client()
        
        result = supabase.table("analyses").select("*").eq("id", analysis_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        analysis = result.data[0]
        
        OwnershipValidator.verify_ownership(
            resource_user_id=analysis["user_id"],
            current_user_id=current_user_id,
            resource_type="analysis",
            resource_id=analysis_id
        )
        
        return analysis
    
    @staticmethod
    async def verify_menu_comparison_ownership(
        analysis_id: str,
        current_user_id: str
    ) -> Dict[str, Any]:
        """
        Verify menu comparison ownership and return data.
        
        Args:
            analysis_id: Menu comparison analysis ID to verify
            current_user_id: Current authenticated user ID
            
        Returns:
            Menu comparison data if ownership verified
            
        Raises:
            HTTPException: 404 if not found, 403 if not owned by user
        """
        supabase = get_supabase_service_client()
        
        result = supabase.table("menu_comparison_analyses").select("*").eq("id", analysis_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu comparison not found"
            )
        
        comparison = result.data[0]
        
        OwnershipValidator.verify_ownership(
            resource_user_id=comparison["user_id"],
            current_user_id=current_user_id,
            resource_type="menu_comparison",
            resource_id=analysis_id
        )
        
        return comparison
    
    @staticmethod
    async def verify_menu_item_ownership(
        menu_item_id: str,
        current_user_id: str
    ) -> Dict[str, Any]:
        """
        Verify menu item ownership (via parent menu) and return data.
        
        Args:
            menu_item_id: Menu item ID to verify
            current_user_id: Current authenticated user ID
            
        Returns:
            Menu item data if ownership verified
            
        Raises:
            HTTPException: 404 if not found, 403 if not owned by user
        """
        supabase = get_supabase_service_client()
        
        # Get menu item with parent menu
        result = supabase.table("menu_items").select("*, menus(user_id)").eq("id", menu_item_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu item not found"
            )
        
        menu_item = result.data[0]
        
        # Verify ownership via parent menu
        if not menu_item.get("menus"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent menu not found"
            )
        
        OwnershipValidator.verify_ownership(
            resource_user_id=menu_item["menus"]["user_id"],
            current_user_id=current_user_id,
            resource_type="menu_item",
            resource_id=menu_item_id
        )
        
        return menu_item


# Convenience functions for common use cases

async def verify_invoice_ownership(invoice_id: str, current_user_id: str) -> Dict[str, Any]:
    """Verify invoice ownership - convenience function"""
    return await OwnershipValidator.verify_invoice_ownership(invoice_id, current_user_id)


async def verify_menu_ownership(menu_id: str, current_user_id: str) -> Dict[str, Any]:
    """Verify menu ownership - convenience function"""
    return await OwnershipValidator.verify_menu_ownership(menu_id, current_user_id)


async def verify_analysis_ownership(analysis_id: str, current_user_id: str) -> Dict[str, Any]:
    """Verify analysis ownership - convenience function"""
    return await OwnershipValidator.verify_analysis_ownership(analysis_id, current_user_id)


async def verify_menu_comparison_ownership(analysis_id: str, current_user_id: str) -> Dict[str, Any]:
    """Verify menu comparison ownership - convenience function"""
    return await OwnershipValidator.verify_menu_comparison_ownership(analysis_id, current_user_id)


async def verify_menu_item_ownership(menu_item_id: str, current_user_id: str) -> Dict[str, Any]:
    """Verify menu item ownership - convenience function"""
    return await OwnershipValidator.verify_menu_item_ownership(menu_item_id, current_user_id)


# Example usage:
"""
from services.ownership_validator import verify_invoice_ownership

@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    current_user: str = Depends(get_current_user)
):
    # Verify ownership and get invoice in one call
    invoice = await verify_invoice_ownership(invoice_id, current_user)
    
    # If we get here, ownership is verified
    return invoice
"""
