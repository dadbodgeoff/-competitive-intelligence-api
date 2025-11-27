"""
Stripe Billing Service
Handles all Stripe integration: checkout, subscriptions, webhooks, customer portal
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone

import stripe
from supabase import Client

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)

# Initialize Stripe with API key from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Price IDs - update these after creating products in Stripe Dashboard
STRIPE_PRICES = {
    "premium_monthly": os.getenv("STRIPE_PRICE_ID_PREMIUM_MONTHLY"),
    "premium_yearly": os.getenv("STRIPE_PRICE_ID_PREMIUM_YEARLY"),
    "enterprise_monthly": os.getenv("STRIPE_PRICE_ID_ENTERPRISE_MONTHLY"),
}


class StripeService:
    """
    Handles Stripe billing operations.
    
    Usage:
        service = StripeService()
        checkout_url = await service.create_checkout_session(user_id, "premium_monthly")
    """
    
    def __init__(self):
        self.client: Client = get_supabase_service_client()
        
        if not stripe.api_key:
            logger.warning("STRIPE_SECRET_KEY not configured - billing disabled")
    
    # =========================================================================
    # CUSTOMER MANAGEMENT
    # =========================================================================
    
    def get_or_create_customer(self, user_id: str, email: str, name: Optional[str] = None) -> str:
        """
        Get existing Stripe customer or create new one.
        Returns stripe_customer_id.
        """
        # Check if user already has a Stripe customer ID in subscriptions table
        # (We don't have a users table with stripe_customer_id, so check subscriptions)
        sub_result = self.client.table("subscriptions").select("stripe_customer_id").eq("user_id", user_id).limit(1).execute()
        
        if sub_result.data and sub_result.data[0].get("stripe_customer_id"):
            return sub_result.data[0]["stripe_customer_id"]
        
        # Also check if customer exists in Stripe by email
        existing_customers = stripe.Customer.list(email=email, limit=1)
        if existing_customers.data:
            logger.info(f"Found existing Stripe customer for email {email}")
            return existing_customers.data[0].id
        
        # Get user info from Supabase Auth for name
        customer_name = name
        if not customer_name:
            try:
                user_response = self.client.auth.admin.get_user_by_id(user_id)
                if user_response.user:
                    metadata = user_response.user.user_metadata or {}
                    first_name = metadata.get("first_name", "")
                    last_name = metadata.get("last_name", "")
                    customer_name = f"{first_name} {last_name}".strip()
            except Exception as e:
                logger.warning(f"Could not get user metadata for {user_id}: {e}")
        
        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=email,
            name=customer_name or None,
            metadata={
                "user_id": user_id,
                "source": "restaurantiq"
            }
        )
        
        logger.info(f"Created Stripe customer {customer.id} for user {user_id}")
        
        return customer.id
    
    # =========================================================================
    # CHECKOUT
    # =========================================================================
    
    def create_checkout_session(
        self,
        user_id: str,
        email: str,
        plan_slug: str,
        success_url: str,
        cancel_url: str,
        trial_days: Optional[int] = None
    ) -> Dict[str, str]:
        """
        Create a Stripe Checkout session for subscription.
        
        Returns:
            {"checkout_url": "https://checkout.stripe.com/...", "session_id": "cs_xxx"}
        """
        # Get or create customer
        customer_id = self.get_or_create_customer(user_id, email)
        
        # Get price ID for plan
        price_id = STRIPE_PRICES.get(plan_slug)
        if not price_id:
            # Try to get from database
            plan_result = self.client.table("pricing_plans").select("stripe_price_id").eq("plan_slug", plan_slug).single().execute()
            if plan_result.data:
                price_id = plan_result.data.get("stripe_price_id")
        
        if not price_id:
            raise ValueError(f"No Stripe price configured for plan: {plan_slug}")
        
        # Build checkout session params
        session_params = {
            "customer": customer_id,
            "payment_method_types": ["card"],
            "line_items": [{
                "price": price_id,
                "quantity": 1,
            }],
            "mode": "subscription",
            "success_url": success_url + "?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": cancel_url,
            "metadata": {
                "user_id": user_id,
                "plan_slug": plan_slug,
            },
            "subscription_data": {
                "metadata": {
                    "user_id": user_id,
                    "plan_slug": plan_slug,
                }
            },
            "allow_promotion_codes": True,
        }
        
        # Add trial if specified
        if trial_days and trial_days > 0:
            session_params["subscription_data"]["trial_period_days"] = trial_days
        
        session = stripe.checkout.Session.create(**session_params)
        
        logger.info(f"Created checkout session {session.id} for user {user_id}, plan {plan_slug}")
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
    
    # =========================================================================
    # CUSTOMER PORTAL
    # =========================================================================
    
    def create_portal_session(self, user_id: str, return_url: str) -> str:
        """
        Create a Stripe Customer Portal session for managing subscription.
        Returns portal URL.
        """
        # Get customer ID from subscriptions table
        result = self.client.table("subscriptions").select("stripe_customer_id").eq("user_id", user_id).limit(1).execute()
        
        if not result.data or not result.data[0].get("stripe_customer_id"):
            raise ValueError(f"User {user_id} has no Stripe customer")
        
        customer_id = result.data[0]["stripe_customer_id"]
        
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        
        logger.info(f"Created portal session for user {user_id}")
        
        return session.url
    
    # =========================================================================
    # SUBSCRIPTION MANAGEMENT
    # =========================================================================
    
    def get_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's active subscription details."""
        result = self.client.rpc("get_user_subscription", {"p_user_id": user_id}).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
    
    def cancel_subscription(self, user_id: str, at_period_end: bool = True) -> bool:
        """
        Cancel user's subscription.
        
        Args:
            at_period_end: If True, cancel at end of billing period. If False, cancel immediately.
        """
        subscription = self.get_subscription(user_id)
        
        if not subscription:
            raise ValueError(f"User {user_id} has no active subscription")
        
        stripe_sub_id = subscription["stripe_subscription_id"]
        
        if at_period_end:
            # Cancel at period end (user keeps access until then)
            stripe.Subscription.modify(
                stripe_sub_id,
                cancel_at_period_end=True
            )
        else:
            # Cancel immediately
            stripe.Subscription.cancel(stripe_sub_id)
        
        logger.info(f"Canceled subscription {stripe_sub_id} for user {user_id}, at_period_end={at_period_end}")
        
        return True
    
    # =========================================================================
    # WEBHOOK HANDLING
    # =========================================================================
    
    def verify_webhook(self, payload: bytes, signature: str) -> stripe.Event:
        """
        Verify webhook signature and return event.
        Raises ValueError if verification fails.
        """
        if not STRIPE_WEBHOOK_SECRET:
            raise ValueError("STRIPE_WEBHOOK_SECRET not configured")
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, STRIPE_WEBHOOK_SECRET
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise ValueError("Invalid webhook signature")
    
    def handle_webhook_event(self, event: stripe.Event) -> bool:
        """
        Process a Stripe webhook event.
        Returns True if processed successfully.
        """
        event_id = event.id
        event_type = event.type
        
        # Check idempotency - was this event already processed?
        existing = self.client.table("stripe_webhook_events").select("processed").eq("stripe_event_id", event_id).execute()
        
        if existing.data and existing.data[0].get("processed"):
            logger.info(f"Webhook event {event_id} already processed, skipping")
            return True
        
        # Log the event
        self.client.table("stripe_webhook_events").upsert({
            "stripe_event_id": event_id,
            "event_type": event_type,
            "payload": event.to_dict(),
            "processed": False,
        }).execute()
        
        try:
            # Route to appropriate handler
            if event_type == "checkout.session.completed":
                self._handle_checkout_completed(event.data.object)
            
            elif event_type == "customer.subscription.created":
                self._handle_subscription_created(event.data.object)
            
            elif event_type == "customer.subscription.updated":
                self._handle_subscription_updated(event.data.object)
            
            elif event_type == "customer.subscription.deleted":
                self._handle_subscription_deleted(event.data.object)
            
            elif event_type == "invoice.paid":
                self._handle_invoice_paid(event.data.object)
            
            elif event_type == "invoice.payment_failed":
                self._handle_invoice_payment_failed(event.data.object)
            
            else:
                logger.info(f"Unhandled webhook event type: {event_type}")
            
            # Mark as processed
            self.client.table("stripe_webhook_events").update({
                "processed": True,
                "processed_at": datetime.now(timezone.utc).isoformat()
            }).eq("stripe_event_id", event_id).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing webhook {event_id}: {e}")
            
            # Log the error
            self.client.table("stripe_webhook_events").update({
                "processing_error": str(e)
            }).eq("stripe_event_id", event_id).execute()
            
            raise
    
    # =========================================================================
    # WEBHOOK HANDLERS
    # =========================================================================
    
    def _handle_checkout_completed(self, session: Dict[str, Any]):
        """Handle successful checkout - subscription will be created separately."""
        user_id = session.get("metadata", {}).get("user_id")
        logger.info(f"Checkout completed for user {user_id}, session {session['id']}")
        
        # The subscription.created webhook will handle the actual subscription record
    
    def _handle_subscription_created(self, subscription: Dict[str, Any]):
        """Handle new subscription creation."""
        user_id = subscription.get("metadata", {}).get("user_id")
        
        if not user_id:
            # Try to find user by customer ID from existing subscriptions
            customer_id = subscription["customer"]
            user_result = self.client.table("subscriptions").select("user_id").eq("stripe_customer_id", customer_id).limit(1).execute()
            if user_result.data:
                user_id = user_result.data[0]["user_id"]
        
        if not user_id:
            logger.error(f"Could not find user for subscription {subscription['id']}")
            return
        
        # Determine plan name from price
        plan_name = "premium"  # Default
        plan_slug = subscription.get("metadata", {}).get("plan_slug", "premium_monthly")
        
        if "enterprise" in plan_slug:
            plan_name = "enterprise"
        
        # Get interval
        interval = "month"
        if subscription.get("items", {}).get("data"):
            price = subscription["items"]["data"][0].get("price", {})
            interval = price.get("recurring", {}).get("interval", "month")
        
        # Insert subscription record
        self.client.table("subscriptions").upsert({
            "user_id": user_id,
            "stripe_subscription_id": subscription["id"],
            "stripe_customer_id": subscription["customer"],
            "stripe_price_id": subscription["items"]["data"][0]["price"]["id"] if subscription.get("items", {}).get("data") else None,
            "status": subscription["status"],
            "plan_name": plan_name,
            "plan_interval": interval,
            "current_period_start": datetime.fromtimestamp(subscription["current_period_start"], tz=timezone.utc).isoformat(),
            "current_period_end": datetime.fromtimestamp(subscription["current_period_end"], tz=timezone.utc).isoformat(),
            "trial_start": datetime.fromtimestamp(subscription["trial_start"], tz=timezone.utc).isoformat() if subscription.get("trial_start") else None,
            "trial_end": datetime.fromtimestamp(subscription["trial_end"], tz=timezone.utc).isoformat() if subscription.get("trial_end") else None,
            "cancel_at_period_end": subscription.get("cancel_at_period_end", False),
        }, on_conflict="stripe_subscription_id").execute()
        
        logger.info(f"Created subscription record for user {user_id}, plan {plan_name}")
    
    def _handle_subscription_updated(self, subscription: Dict[str, Any]):
        """Handle subscription updates (status changes, plan changes, etc.)."""
        # Update subscription record
        self.client.table("subscriptions").update({
            "status": subscription["status"],
            "current_period_start": datetime.fromtimestamp(subscription["current_period_start"], tz=timezone.utc).isoformat(),
            "current_period_end": datetime.fromtimestamp(subscription["current_period_end"], tz=timezone.utc).isoformat(),
            "cancel_at_period_end": subscription.get("cancel_at_period_end", False),
            "canceled_at": datetime.fromtimestamp(subscription["canceled_at"], tz=timezone.utc).isoformat() if subscription.get("canceled_at") else None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("stripe_subscription_id", subscription["id"]).execute()
        
        logger.info(f"Updated subscription {subscription['id']} to status {subscription['status']}")
    
    def _handle_subscription_deleted(self, subscription: Dict[str, Any]):
        """Handle subscription cancellation/deletion."""
        self.client.table("subscriptions").update({
            "status": "canceled",
            "canceled_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("stripe_subscription_id", subscription["id"]).execute()
        
        logger.info(f"Subscription {subscription['id']} canceled")
    
    def _handle_invoice_paid(self, invoice: Dict[str, Any]):
        """Handle successful payment."""
        customer_id = invoice["customer"]
        
        # Find user from subscriptions table
        user_result = self.client.table("subscriptions").select("user_id").eq("stripe_customer_id", customer_id).limit(1).execute()
        user_id = user_result.data[0]["user_id"] if user_result.data else None
        
        # Find subscription
        sub_result = self.client.table("subscriptions").select("id").eq("stripe_subscription_id", invoice.get("subscription")).single().execute()
        subscription_id = sub_result.data["id"] if sub_result.data else None
        
        # Record payment
        self.client.table("payment_history").upsert({
            "user_id": user_id,
            "subscription_id": subscription_id,
            "stripe_invoice_id": invoice["id"],
            "stripe_payment_intent_id": invoice.get("payment_intent"),
            "amount_cents": invoice["amount_paid"],
            "currency": invoice["currency"],
            "status": "succeeded",
            "invoice_number": invoice.get("number"),
            "invoice_pdf_url": invoice.get("invoice_pdf"),
            "hosted_invoice_url": invoice.get("hosted_invoice_url"),
            "description": invoice.get("description") or f"Subscription payment",
            "paid_at": datetime.fromtimestamp(invoice["status_transitions"]["paid_at"], tz=timezone.utc).isoformat() if invoice.get("status_transitions", {}).get("paid_at") else datetime.now(timezone.utc).isoformat(),
        }, on_conflict="stripe_invoice_id").execute()
        
        logger.info(f"Recorded payment for invoice {invoice['id']}")
    
    def _handle_invoice_payment_failed(self, invoice: Dict[str, Any]):
        """Handle failed payment."""
        customer_id = invoice["customer"]
        
        # Find user from subscriptions table
        user_result = self.client.table("subscriptions").select("user_id").eq("stripe_customer_id", customer_id).limit(1).execute()
        user_id = user_result.data[0]["user_id"] if user_result.data else None
        
        # Record failed payment
        self.client.table("payment_history").upsert({
            "user_id": user_id,
            "stripe_invoice_id": invoice["id"],
            "amount_cents": invoice["amount_due"],
            "currency": invoice["currency"],
            "status": "failed",
            "invoice_number": invoice.get("number"),
            "failure_message": invoice.get("last_finalization_error", {}).get("message") if invoice.get("last_finalization_error") else "Payment failed",
        }, on_conflict="stripe_invoice_id").execute()
        
        logger.warning(f"Payment failed for invoice {invoice['id']}, user {user_id}")
        
        # TODO: Trigger email notification via email_service
    
    # =========================================================================
    # INVOICES
    # =========================================================================
    
    def get_invoices(self, user_id: str, limit: int = 10) -> list:
        """Get user's payment history."""
        result = self.client.table("payment_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        
        return result.data or []


# Singleton instance
stripe_service = StripeService()
