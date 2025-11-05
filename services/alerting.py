"""
Simple Alerting for Critical Issues
Logs critical alerts prominently for manual review
"""
import os
import logging
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


def send_critical_alert(title: str, message: str, context: Optional[Dict] = None):
    """
    Send critical alert for manual review
    
    During beta: Logs prominently, check logs daily
    Post-beta: Integrate with email/Slack/PagerDuty
    
    Args:
        title: Alert title
        message: Alert message
        context: Additional context data
    """
    if os.getenv("ENVIRONMENT") != "production":
        return  # Don't spam in dev
    
    # Log prominently with emoji for easy grep
    logger.critical("=" * 80)
    logger.critical(f"🚨 CRITICAL ALERT: {title}")
    logger.critical(f"Message: {message}")
    logger.critical(f"Time: {datetime.utcnow().isoformat()}")
    
    if context:
        logger.critical(f"Context: {context}")
    
    logger.critical("=" * 80)
    
    # TODO: After beta, integrate with:
    # - SendGrid/Mailgun for email alerts
    # - Slack webhook for team notifications
    # - PagerDuty for on-call rotation


def alert_subscription_bypass(user_id: str, endpoint: str, required_tier: str, actual_tier: str):
    """Alert when user bypasses subscription tier check"""
    send_critical_alert(
        "Subscription Bypass Detected",
        f"User attempted to access premium feature without proper tier",
        {
            "user_id": user_id,
            "endpoint": endpoint,
            "required_tier": required_tier,
            "actual_tier": actual_tier
        }
    )


def alert_rate_limit_abuse(user_id: str, endpoint: str, request_count: int):
    """Alert when user hits rate limits excessively"""
    send_critical_alert(
        "Rate Limit Abuse Detected",
        f"User hitting rate limits repeatedly",
        {
            "user_id": user_id,
            "endpoint": endpoint,
            "request_count": request_count
        }
    )


def alert_api_cost_spike(service: str, cost: float, threshold: float):
    """Alert when API costs spike unexpectedly"""
    send_critical_alert(
        "API Cost Spike",
        f"{service} costs exceeded threshold",
        {
            "service": service,
            "cost": cost,
            "threshold": threshold
        }
    )


def alert_database_error(operation: str, error: str):
    """Alert on database errors"""
    send_critical_alert(
        "Database Error",
        f"Database operation failed: {operation}",
        {
            "operation": operation,
            "error": error
        }
    )
