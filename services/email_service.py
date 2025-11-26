"""
Email Service (SendGrid)
Handles transactional emails: receipts, usage warnings, upgrade confirmations, etc.

Note: Supabase handles auth emails (registration, password reset).
This service handles business/transactional emails.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from enum import Enum

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@restaurantiq.us")
FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "RestaurantIQ")


class EmailType(str, Enum):
    """Types of transactional emails we send."""
    WELCOME = "welcome"
    UPGRADE_CONFIRMATION = "upgrade_confirmation"
    DOWNGRADE_CONFIRMATION = "downgrade_confirmation"
    USAGE_WARNING_80 = "usage_warning_80"
    USAGE_WARNING_100 = "usage_warning_100"
    PAYMENT_RECEIPT = "payment_receipt"
    PAYMENT_FAILED = "payment_failed"
    SUBSCRIPTION_RENEWED = "subscription_renewed"
    SUBSCRIPTION_CANCELED = "subscription_canceled"
    SUBSCRIPTION_EXPIRING = "subscription_expiring"
    TRIAL_ENDING = "trial_ending"


class EmailService:
    """
    Handles sending transactional emails via SendGrid.
    
    Usage:
        service = EmailService()
        await service.send_welcome_email(user_id, email, first_name)
    """
    
    def __init__(self):
        self.client = SendGridAPIClient(SENDGRID_API_KEY) if SENDGRID_API_KEY else None
        self.db = get_supabase_service_client()
        
        if not self.client:
            logger.warning("SENDGRID_API_KEY not configured - emails disabled")
    
    # =========================================================================
    # CORE SEND METHOD
    # =========================================================================
    
    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        email_type: EmailType,
        user_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> bool:
        """
        Send an email and log it.
        Returns True if sent successfully.
        """
        if not self.client:
            logger.warning(f"Email not sent (SendGrid not configured): {email_type} to {to_email}")
            return False
        
        try:
            message = Mail(
                from_email=Email(FROM_EMAIL, FROM_NAME),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            response = self.client.send(message)
            
            # Log to database
            sendgrid_message_id = response.headers.get("X-Message-Id")
            
            self.db.table("email_log").insert({
                "user_id": user_id,
                "email_type": email_type.value,
                "recipient_email": to_email,
                "subject": subject,
                "sendgrid_message_id": sendgrid_message_id,
                "status": "sent",
                "sent_at": datetime.now(timezone.utc).isoformat(),
                "metadata": metadata or {},
            }).execute()
            
            logger.info(f"Email sent: {email_type} to {to_email}, message_id={sendgrid_message_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email {email_type} to {to_email}: {e}")
            
            # Log failure
            self.db.table("email_log").insert({
                "user_id": user_id,
                "email_type": email_type.value,
                "recipient_email": to_email,
                "subject": subject,
                "status": "failed",
                "error_message": str(e),
                "metadata": metadata or {},
            }).execute()
            
            return False
    
    # =========================================================================
    # EMAIL TEMPLATES
    # =========================================================================
    
    def _base_template(self, content: str, preheader: str = "") -> str:
        """Wrap content in base email template."""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RestaurantIQ</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; }}
        .header {{ background: #121212; padding: 24px; text-align: center; }}
        .header h1 {{ color: #B08968; margin: 0; font-size: 24px; }}
        .content {{ padding: 32px 24px; }}
        .button {{ display: inline-block; background: #B08968; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }}
        .button:hover {{ background: #9a7559; }}
        .footer {{ background: #f9f9f9; padding: 24px; text-align: center; font-size: 12px; color: #666; }}
        .highlight {{ background: #f0f9ff; border-left: 4px solid #B08968; padding: 16px; margin: 16px 0; }}
        .preheader {{ display: none; max-height: 0; overflow: hidden; }}
    </style>
</head>
<body>
    <span class="preheader">{preheader}</span>
    <div class="container">
        <div class="header">
            <h1>RestaurantIQ</h1>
        </div>
        <div class="content">
            {content}
        </div>
        <div class="footer">
            <p>© {datetime.now().year} RestaurantIQ. All rights reserved.</p>
            <p>Questions? Reply to this email or contact <a href="mailto:support@restaurantiq.us">support@restaurantiq.us</a></p>
        </div>
    </div>
</body>
</html>
"""
    
    # =========================================================================
    # SPECIFIC EMAIL METHODS
    # =========================================================================
    
    def send_welcome_email(self, user_id: str, email: str, first_name: str) -> bool:
        """Send welcome email after registration."""
        content = f"""
<h2>Welcome to RestaurantIQ, {first_name}! 🎉</h2>

<p>You're all set to start protecting your margins and growing your restaurant.</p>

<p>Here's what you can do right now:</p>

<ul>
    <li><strong>Upload your first invoice</strong> — We'll parse it in seconds and flag any price anomalies</li>
    <li><strong>Generate marketing assets</strong> — Create professional images with AI in under 15 seconds</li>
    <li><strong>Analyze your competitors</strong> — See what customers are saying about restaurants in your area</li>
</ul>

<p style="text-align: center;">
    <a href="https://app.restaurantiq.us/dashboard" class="button">Go to Dashboard</a>
</p>

<div class="highlight">
    <strong>Free tier includes:</strong><br>
    1 invoice upload per week + 2 bonus uploads every 28 days<br>
    5 AI image generations per month<br>
    Full access to all features in sandbox mode
</div>

<p>Questions? Just reply to this email — I read every one.</p>

<p>— The RestaurantIQ Team</p>
"""
        return self._send_email(
            to_email=email,
            subject=f"Welcome to RestaurantIQ, {first_name}!",
            html_content=self._base_template(content, "Your restaurant intelligence platform is ready"),
            email_type=EmailType.WELCOME,
            user_id=user_id,
            metadata={"first_name": first_name}
        )
    
    def send_upgrade_confirmation(
        self,
        user_id: str,
        email: str,
        first_name: str,
        plan_name: str,
        amount_display: str,
        next_billing_date: str
    ) -> bool:
        """Send confirmation after successful upgrade."""
        content = f"""
<h2>You're now on {plan_name}! 🚀</h2>

<p>Hey {first_name},</p>

<p>Your upgrade to <strong>{plan_name}</strong> is complete. Here's what's unlocked:</p>

<ul>
    <li>✅ Unlimited invoice uploads</li>
    <li>✅ Unlimited menu comparisons</li>
    <li>✅ 50 AI image generations per month</li>
    <li>✅ Priority support</li>
    <li>✅ Data export</li>
</ul>

<div class="highlight">
    <strong>Billing details:</strong><br>
    Amount: {amount_display}<br>
    Next billing date: {next_billing_date}
</div>

<p>You can manage your subscription anytime from your account settings.</p>

<p style="text-align: center;">
    <a href="https://app.restaurantiq.us/settings/billing" class="button">Manage Subscription</a>
</p>

<p>Thanks for supporting RestaurantIQ!</p>

<p>— The RestaurantIQ Team</p>
"""
        return self._send_email(
            to_email=email,
            subject=f"Welcome to {plan_name}!",
            html_content=self._base_template(content, f"Your {plan_name} subscription is active"),
            email_type=EmailType.UPGRADE_CONFIRMATION,
            user_id=user_id,
            metadata={"plan_name": plan_name, "amount": amount_display}
        )
    
    def send_usage_warning(
        self,
        user_id: str,
        email: str,
        first_name: str,
        feature_name: str,
        used: int,
        limit: int,
        reset_date: str
    ) -> bool:
        """Send warning when user approaches usage limit."""
        percentage = int((used / limit) * 100) if limit > 0 else 100
        is_at_limit = used >= limit
        
        email_type = EmailType.USAGE_WARNING_100 if is_at_limit else EmailType.USAGE_WARNING_80
        
        if is_at_limit:
            subject = f"You've reached your {feature_name} limit"
            headline = f"You've used all your {feature_name} 📊"
            message = f"You've used <strong>{used}/{limit}</strong> {feature_name} this period."
        else:
            subject = f"Heads up: {percentage}% of your {feature_name} used"
            headline = f"You're at {percentage}% of your {feature_name} limit"
            message = f"You've used <strong>{used}/{limit}</strong> {feature_name} this period."
        
        content = f"""
<h2>{headline}</h2>

<p>Hey {first_name},</p>

<p>{message}</p>

<p>Your limit resets on <strong>{reset_date}</strong>.</p>

<div class="highlight">
    <strong>Want unlimited access?</strong><br>
    Upgrade to Premium for unlimited {feature_name} and more.
</div>

<p style="text-align: center;">
    <a href="https://app.restaurantiq.us/settings/billing" class="button">Upgrade Now</a>
</p>

<p>— The RestaurantIQ Team</p>
"""
        return self._send_email(
            to_email=email,
            subject=subject,
            html_content=self._base_template(content, f"{percentage}% of your {feature_name} limit used"),
            email_type=email_type,
            user_id=user_id,
            metadata={"feature": feature_name, "used": used, "limit": limit}
        )
    
    def send_payment_receipt(
        self,
        user_id: str,
        email: str,
        first_name: str,
        amount_display: str,
        invoice_number: str,
        invoice_pdf_url: Optional[str] = None
    ) -> bool:
        """Send payment receipt."""
        content = f"""
<h2>Payment received — thank you! 💳</h2>

<p>Hey {first_name},</p>

<p>We've received your payment of <strong>{amount_display}</strong>.</p>

<div class="highlight">
    <strong>Invoice #{invoice_number}</strong><br>
    Amount: {amount_display}<br>
    Date: {datetime.now().strftime('%B %d, %Y')}
</div>

{"<p><a href='" + invoice_pdf_url + "'>Download PDF Receipt</a></p>" if invoice_pdf_url else ""}

<p>You can view all your invoices in your account settings.</p>

<p style="text-align: center;">
    <a href="https://app.restaurantiq.us/settings/billing" class="button">View Billing History</a>
</p>

<p>— The RestaurantIQ Team</p>
"""
        return self._send_email(
            to_email=email,
            subject=f"Payment received — Invoice #{invoice_number}",
            html_content=self._base_template(content, f"Payment of {amount_display} received"),
            email_type=EmailType.PAYMENT_RECEIPT,
            user_id=user_id,
            metadata={"amount": amount_display, "invoice_number": invoice_number}
        )
    
    def send_payment_failed(
        self,
        user_id: str,
        email: str,
        first_name: str,
        amount_display: str,
        failure_reason: Optional[str] = None
    ) -> bool:
        """Send notification when payment fails."""
        content = f"""
<h2>Payment failed — action needed ⚠️</h2>

<p>Hey {first_name},</p>

<p>We weren't able to process your payment of <strong>{amount_display}</strong>.</p>

{f"<p><strong>Reason:</strong> {failure_reason}</p>" if failure_reason else ""}

<p>Please update your payment method to keep your subscription active.</p>

<p style="text-align: center;">
    <a href="https://app.restaurantiq.us/settings/billing" class="button">Update Payment Method</a>
</p>

<p>If you have questions, just reply to this email.</p>

<p>— The RestaurantIQ Team</p>
"""
        return self._send_email(
            to_email=email,
            subject="Action needed: Payment failed",
            html_content=self._base_template(content, "Please update your payment method"),
            email_type=EmailType.PAYMENT_FAILED,
            user_id=user_id,
            metadata={"amount": amount_display, "failure_reason": failure_reason}
        )
    
    def send_subscription_canceled(
        self,
        user_id: str,
        email: str,
        first_name: str,
        end_date: str
    ) -> bool:
        """Send confirmation when subscription is canceled."""
        content = f"""
<h2>Your subscription has been canceled</h2>

<p>Hey {first_name},</p>

<p>Your subscription has been canceled. You'll continue to have access to premium features until <strong>{end_date}</strong>.</p>

<p>After that, your account will revert to the free tier.</p>

<div class="highlight">
    <strong>Changed your mind?</strong><br>
    You can resubscribe anytime from your account settings.
</div>

<p style="text-align: center;">
    <a href="https://app.restaurantiq.us/settings/billing" class="button">Resubscribe</a>
</p>

<p>We'd love to know why you canceled — just reply to this email with any feedback.</p>

<p>— The RestaurantIQ Team</p>
"""
        return self._send_email(
            to_email=email,
            subject="Your subscription has been canceled",
            html_content=self._base_template(content, f"Access continues until {end_date}"),
            email_type=EmailType.SUBSCRIPTION_CANCELED,
            user_id=user_id,
            metadata={"end_date": end_date}
        )


# Singleton instance
email_service = EmailService()
