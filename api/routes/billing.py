"""
Billing API Routes
Handles Stripe checkout, customer portal, webhooks, and subscription management.
"""

import os
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Depends, Header
from pydantic import BaseModel

from api.middleware.auth import get_current_user
from services.stripe_service import stripe_service
from services.email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["billing"])

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class CheckoutRequest(BaseModel):
    plan_slug: str  # 'premium_monthly', 'premium_yearly', 'enterprise_monthly'
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PortalResponse(BaseModel):
    portal_url: str


class SubscriptionResponse(BaseModel):
    has_subscription: bool
    plan_name: Optional[str] = None
    status: Optional[str] = None
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False


class InvoiceItem(BaseModel):
    id: str
    amount_cents: int
    currency: str
    status: str
    invoice_number: Optional[str] = None
    invoice_pdf_url: Optional[str] = None
    paid_at: Optional[str] = None
    created_at: str


class InvoicesResponse(BaseModel):
    invoices: list[InvoiceItem]


# ============================================================================
# CHECKOUT ENDPOINTS
# ============================================================================

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    request_body: CheckoutRequest,
    req: Request,
    current_user: str = Depends(get_current_user)
):
    """
    Create a Stripe Checkout session for subscription upgrade.
    Returns URL to redirect user to Stripe Checkout.
    """
    from database.supabase_client import get_supabase_service_client
    
    user_id = current_user  # get_current_user returns user_id string
    
    # Get email from Supabase Auth (email is in auth.users, not public.users)
    service_client = get_supabase_service_client()
    try:
        user_response = service_client.auth.admin.get_user_by_id(user_id)
        email = user_response.user.email if user_response.user else None
    except Exception as e:
        logger.error(f"Failed to get user email for {user_id}: {e}")
        email = None
    
    if not email:
        raise HTTPException(status_code=400, detail="User email not found")
    
    # Default URLs if not provided
    base_url = os.getenv("FRONTEND_URL", "https://app.restaurantiq.us")
    success_url = request_body.success_url or f"{base_url}/settings/billing/success"
    cancel_url = request_body.cancel_url or f"{base_url}/settings/billing"
    
    try:
        result = stripe_service.create_checkout_session(
            user_id=user_id,
            email=email,
            plan_slug=request_body.plan_slug,
            success_url=success_url,
            cancel_url=cancel_url,
        )
        
        return CheckoutResponse(
            checkout_url=result["checkout_url"],
            session_id=result["session_id"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Checkout error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


# ============================================================================
# CUSTOMER PORTAL
# ============================================================================

@router.post("/portal", response_model=PortalResponse)
async def create_portal_session(
    current_user: str = Depends(get_current_user)
):
    """
    Create a Stripe Customer Portal session.
    Returns URL to redirect user to manage their subscription.
    """
    user_id = current_user  # get_current_user returns user_id string
    
    base_url = os.getenv("FRONTEND_URL", "https://app.restaurantiq.us")
    return_url = f"{base_url}/settings/billing"
    
    try:
        portal_url = stripe_service.create_portal_session(
            user_id=user_id,
            return_url=return_url
        )
        
        return PortalResponse(portal_url=portal_url)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Portal error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create portal session")


# ============================================================================
# SUBSCRIPTION STATUS
# ============================================================================

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription_status(
    current_user: str = Depends(get_current_user)
):
    """
    Get current user's subscription status.
    """
    user_id = current_user  # get_current_user returns user_id string
    
    try:
        subscription = stripe_service.get_subscription(user_id)
        
        if not subscription:
            return SubscriptionResponse(has_subscription=False)
        
        return SubscriptionResponse(
            has_subscription=True,
            plan_name=subscription.get("plan_name"),
            status=subscription.get("status"),
            current_period_end=subscription.get("current_period_end"),
            cancel_at_period_end=subscription.get("cancel_at_period_end", False)
        )
        
    except Exception as e:
        logger.error(f"Subscription status error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription status")


@router.post("/subscription/cancel")
async def cancel_subscription(
    current_user: str = Depends(get_current_user)
):
    """
    Cancel current subscription at end of billing period.
    """
    from database.supabase_client import get_supabase_service_client
    
    user_id = current_user  # get_current_user returns user_id string
    
    try:
        stripe_service.cancel_subscription(user_id, at_period_end=True)
        
        # Get user details from Supabase Auth
        service_client = get_supabase_service_client()
        try:
            user_response = service_client.auth.admin.get_user_by_id(user_id)
            user_email = user_response.user.email if user_response.user else None
            user_metadata = user_response.user.user_metadata or {} if user_response.user else {}
            first_name = user_metadata.get("first_name", "there")
        except Exception:
            user_email = None
            first_name = "there"
        
        # Get subscription details for email
        subscription = stripe_service.get_subscription(user_id)
        if subscription and user_email:
            email_service.send_subscription_canceled(
                user_id=user_id,
                email=user_email,
                first_name=first_name,
                end_date=subscription.get("current_period_end", "your billing period end")
            )
        
        return {"success": True, "message": "Subscription will be canceled at end of billing period"}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Cancel subscription error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")


# ============================================================================
# INVOICES / PAYMENT HISTORY
# ============================================================================

@router.get("/invoices", response_model=InvoicesResponse)
async def get_invoices(
    limit: int = 10,
    current_user: str = Depends(get_current_user)
):
    """
    Get user's payment history / invoices.
    """
    user_id = current_user  # get_current_user returns user_id string
    
    try:
        invoices = stripe_service.get_invoices(user_id, limit=limit)
        
        return InvoicesResponse(
            invoices=[
                InvoiceItem(
                    id=inv["id"],
                    amount_cents=inv["amount_cents"],
                    currency=inv["currency"],
                    status=inv["status"],
                    invoice_number=inv.get("invoice_number"),
                    invoice_pdf_url=inv.get("invoice_pdf_url"),
                    paid_at=inv.get("paid_at"),
                    created_at=inv["created_at"]
                )
                for inv in invoices
            ]
        )
        
    except Exception as e:
        logger.error(f"Get invoices error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get invoices")


# ============================================================================
# STRIPE WEBHOOKS
# ============================================================================

@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """
    Handle Stripe webhook events.
    This endpoint should NOT require authentication - Stripe calls it directly.
    """
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")
    
    # Get raw body
    payload = await request.body()
    
    try:
        # Verify signature and get event
        event = stripe_service.verify_webhook(payload, stripe_signature)
        
        # Process the event
        stripe_service.handle_webhook_event(event)
        
        return {"received": True}
        
    except ValueError as e:
        logger.error(f"Webhook verification failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        # Return 200 to prevent Stripe from retrying (we logged the error)
        return {"received": True, "error": str(e)}


# ============================================================================
# PRICING PLANS (Public)
# ============================================================================

@router.get("/plans")
async def get_pricing_plans():
    """
    Get available pricing plans (public endpoint).
    """
    from database.supabase_client import get_supabase_service_client
    
    client = get_supabase_service_client()
    
    result = client.table("pricing_plans").select(
        "plan_slug, plan_name, tier, amount_cents, currency, interval, description, features, is_featured, display_order"
    ).eq("is_active", True).order("display_order").execute()
    
    return {"plans": result.data or []}
