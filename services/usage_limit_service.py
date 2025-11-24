"""
Usage Limit Service
Enforces free tier usage limits with atomic operations
Pattern: Security-first, prevents all abuse vectors
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple

from zoneinfo import ZoneInfo

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class UsageLimitService:
    """
    Enforces usage limits for free tier accounts
    
    Limits (Free Tier):
    - Weekly (reset Monday 12:00 AM EST):
      - 1 invoice upload
      - 2 free review analyses
      - 1 menu comparison
      - 1 menu upload
      - 1 premium review analysis
    
    - 28-day (reset every 28 days from 2025-11-03):
      - 2 bonus invoice uploads
    
    Premium/Enterprise: Unlimited
    """
    
    def __init__(self):
        self.client = get_supabase_service_client()
        self._est = ZoneInfo("America/New_York")
    
    def check_limit(
        self,
        user_id: str,
        operation_type: str
    ) -> Tuple[bool, Dict]:
        """
        Check if user can perform operation (atomic, race-condition safe)
        
        Args:
            user_id: User UUID
            operation_type: One of:
                - 'invoice_upload'
                - 'free_analysis'
                - 'menu_comparison'
                - 'menu_upload'
                - 'premium_analysis'
                - 'image_generation'
        
        Returns:
            (allowed: bool, details: dict)
            
        Details dict contains:
            - allowed: bool
            - current_usage: int
            - limit_value: int
            - reset_date: str (ISO format)
            - message: str
            - subscription_tier: str
        """
        try:
            # Call database function (atomic, handles resets automatically)
            result = self.client.rpc('check_usage_limit', {
                'p_user_id': user_id,
                'p_operation_type': operation_type
            }).execute()
            
            if not result.data or len(result.data) == 0:
                logger.error(f"No result from check_usage_limit for user {user_id}")
                return False, {
                    'allowed': False,
                    'message': 'Unable to check usage limits',
                    'current_usage': 0,
                    'limit_value': 0,
                    'reset_date': None,
                    'subscription_tier': 'free'
                }
            
            limit_check = result.data[0]
            
            # Get user's subscription tier for context
            user_result = self.client.table('users').select('subscription_tier').eq('id', user_id).execute()
            subscription_tier = user_result.data[0]['subscription_tier'] if user_result.data else 'free'
            
            details = {
                'allowed': limit_check['allowed'],
                'current_usage': limit_check['current_usage'],
                'limit_value': limit_check['limit_value'],
                'reset_date': limit_check['reset_date'],
                'message': limit_check['message'],
                'subscription_tier': subscription_tier
            }
            
            if not limit_check['allowed']:
                logger.warning(
                    f"Usage limit exceeded: user={user_id}, operation={operation_type}, "
                    f"usage={limit_check['current_usage']}/{limit_check['limit_value']}, "
                    f"reset={limit_check['reset_date']}"
                )
            
            return limit_check['allowed'], details
            
        except Exception as e:
            error_message = str(e)
            logger.warning(f"Primary usage-limit RPC failed, attempting fallback: {error_message}")
            fallback = self._fallback_check_limit(user_id, operation_type)
            if fallback:
                return fallback

            logger.error(f"Usage limit fallback also failed: {error_message}")
            return False, {
                'allowed': False,
                'message': f'Error checking usage limits: {error_message}',
                'current_usage': 0,
                'limit_value': 0,
                'reset_date': None,
                'subscription_tier': 'free'
            }
    
    def increment_usage(
        self,
        user_id: str,
        operation_type: str,
        operation_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> bool:
        """
        Increment usage counter after successful operation (atomic)
        
        IMPORTANT: Only call this AFTER the operation succeeds
        
        Args:
            user_id: User UUID
            operation_type: Same as check_limit
            operation_id: UUID of the operation (invoice_id, analysis_id, etc.)
            metadata: Additional context (IP, user agent, etc.)
        
        Returns:
            bool: Success
        """
        try:
            # Call database function (atomic, logs to audit trail)
            result = self.client.rpc('increment_usage', {
                'p_user_id': user_id,
                'p_operation_type': operation_type,
                'p_operation_id': operation_id,
                'p_metadata': metadata
            }).execute()
            
            logger.info(
                f"Usage incremented: user={user_id}, operation={operation_type}, "
                f"operation_id={operation_id}"
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error incrementing usage: {e}")
            # Don't fail the operation if logging fails
            return False
    
    def get_usage_summary(self, user_id: str) -> Dict:
        """
        Get user's current usage summary
        
        Returns:
            {
                'subscription_tier': str,
                'weekly': {
                    'invoice_uploads': {'used': int, 'limit': int, 'reset_date': str},
                    'free_analyses': {'used': int, 'limit': int, 'reset_date': str},
                    'menu_comparisons': {'used': int, 'limit': int, 'reset_date': str},
                    'menu_uploads': {'used': int, 'limit': int, 'reset_date': str},
                    'premium_analyses': {'used': int, 'limit': int, 'reset_date': str}
                },
                'monthly': {
                    'bonus_invoices': {'used': int, 'limit': int, 'reset_date': str}
                }
            }
        """
        try:
            # Get user's subscription tier
            user_result = self.client.table('users').select('subscription_tier').eq('id', user_id).execute()
            
            if not user_result.data:
                return {'error': 'User not found'}
            
            subscription_tier = user_result.data[0]['subscription_tier']
            
            if subscription_tier == 'enterprise':
                return {
                    'subscription_tier': subscription_tier,
                    'unlimited': True,
                    'message': 'Unlimited access'
                }
            
            # Get usage limits record
            limits_result = self.client.table('user_usage_limits').select('*').eq('user_id', user_id).execute()
            
            if not limits_result.data:
                # Initialize if not exists
                self.client.rpc('initialize_usage_limits', {'p_user_id': user_id}).execute()
                limits_result = self.client.table('user_usage_limits').select('*').eq('user_id', user_id).execute()
            
            limits = limits_result.data[0]
            
            if subscription_tier == 'premium':
                return {
                    'subscription_tier': subscription_tier,
                    'unlimited': False,
                    'message': 'Premium members receive 50 creative generations per calendar month; other operations are unlimited.',
                    'creative': {
                        'image_generations': {
                            'used': limits.get('premium_image_generation_count', 0),
                            'limit': 50,
                            'reset_date': limits.get('premium_image_generation_reset')
                        }
                    }
                }
            
            return {
                'subscription_tier': subscription_tier,
                'unlimited': False,
                'weekly': {
                    'invoice_uploads': {
                        'used': limits['weekly_invoice_uploads'],
                        'limit': 1,
                        'reset_date': limits['weekly_reset_date']
                    },
                    'free_analyses': {
                        'used': limits['weekly_free_analyses'],
                        'limit': 2,
                        'reset_date': limits['weekly_reset_date']
                    },
                    'menu_comparisons': {
                        'used': limits['weekly_menu_comparisons'],
                        'limit': 1,
                        'reset_date': limits['weekly_reset_date']
                    },
                    'menu_uploads': {
                        'used': limits['weekly_menu_uploads'],
                        'limit': 1,
                        'reset_date': limits['weekly_reset_date']
                    },
                    'premium_analyses': {
                        'used': limits['weekly_premium_analyses'],
                        'limit': 1,
                        'reset_date': limits['weekly_reset_date']
                    }
                },
                'monthly': {
                    'bonus_invoices': {
                        'used': limits['monthly_bonus_invoices'],
                        'limit': 2,
                        'reset_date': limits['monthly_reset_date']
                    }
                },
                'creative': {
                    'image_generations': {
                        'used': limits.get('image_generation_28day_count', 0),
                        'limit': 3,  # Free tier: 3 generations per 28 days
                        'reset_date': limits.get('image_generation_28day_reset')
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting usage summary: {e}")
            return {'error': str(e)}
    
    def get_usage_history(
        self,
        user_id: str,
        operation_type: Optional[str] = None,
        limit: int = 100
    ) -> list:
        """
        Get user's usage history (audit trail)
        
        Args:
            user_id: User UUID
            operation_type: Filter by operation type (optional)
            limit: Max records to return
        
        Returns:
            List of usage history records
        """
        try:
            query = self.client.table('usage_history').select('*').eq('user_id', user_id)
            
            if operation_type:
                query = query.eq('operation_type', operation_type)
            
            result = query.order('timestamp', desc=True).limit(limit).execute()
            
            return result.data
            
        except Exception as e:
            logger.error(f"Error getting usage history: {e}")
            return []
    
    def reset_user_limits(self, user_id: str, admin_user_id: str) -> bool:
        """
        Manually reset user's limits (admin only)
        
        Args:
            user_id: User to reset
            admin_user_id: Admin performing the reset
        
        Returns:
            bool: Success
        """
        try:
            # Verify admin has permission (check admin role)
            admin_result = self.client.table('users').select('subscription_tier').eq('id', admin_user_id).execute()
            
            if not admin_result.data or admin_result.data[0]['subscription_tier'] != 'enterprise':
                logger.warning(f"Unauthorized reset attempt by {admin_user_id}")
                return False
            
            # Reset all counters
            self.client.table('user_usage_limits').update({
                'weekly_invoice_uploads': 0,
                'weekly_free_analyses': 0,
                'weekly_menu_comparisons': 0,
                'weekly_menu_uploads': 0,
                'weekly_premium_analyses': 0,
                'monthly_bonus_invoices': 0,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('user_id', user_id).execute()
            
            # Log to audit trail
            self.client.table('usage_history').insert({
                'user_id': user_id,
                'operation_type': 'admin_reset',
                'subscription_tier': 'free',
                'metadata': {'admin_user_id': admin_user_id}
            }).execute()
            
            logger.info(f"Usage limits reset for user {user_id} by admin {admin_user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error resetting user limits: {e}")
            return False

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    def _fallback_check_limit(
        self,
        user_id: str,
        operation_type: str
    ) -> Optional[Tuple[bool, Dict]]:
        """
        Software fallback in case the Postgres function result type is broken.
        Mimics the database logic to keep the product usable.
        """
        try:
            logger.warning("Usage limit fallback invoked for user=%s op=%s", user_id, operation_type)
            user_resp = self.client.table('users').select('subscription_tier').eq('id', user_id).limit(1).execute()
            if not user_resp.data:
                logger.error(f"Usage limit fallback: no user record for {user_id}")
                return None

            subscription_tier = user_resp.data[0]['subscription_tier']

            if subscription_tier == 'enterprise':
                return True, {
                    'allowed': True,
                    'current_usage': 0,
                    'limit_value': 999999,
                    'reset_date': datetime.now(timezone.utc).isoformat(),
                    'message': 'Unlimited access',
                    'subscription_tier': 'enterprise'
                }

            record = self._ensure_usage_record(user_id)
            if not record:
                logger.error(f"Usage limit fallback: no usage record for {user_id}")
                return None

            now = datetime.now(timezone.utc)
            updates = {}

            weekly_reset = self._parse_timestamp(record.get('weekly_reset_date'))
            if not weekly_reset or now >= weekly_reset:
                updates.update({
                    'weekly_invoice_uploads': 0,
                    'weekly_free_analyses': 0,
                    'weekly_menu_comparisons': 0,
                    'weekly_menu_uploads': 0,
                    'weekly_premium_analyses': 0,
                    'weekly_image_generations': 0,
                    'weekly_reset_date': self._format_timestamp(self._get_next_monday_est(now))
                })

            monthly_reset = self._parse_timestamp(record.get('monthly_reset_date'))
            if not monthly_reset or now >= monthly_reset:
                updates.update({
                    'monthly_bonus_invoices': 0,
                    'monthly_reset_date': self._format_timestamp(self._get_next_28day_reset(now))
                })

            creative_reset = self._parse_timestamp(record.get('image_generation_28day_reset'))
            if not creative_reset or now >= creative_reset:
                updates.update({
                    'image_generation_28day_count': 0,
                    'image_generation_28day_reset': self._format_timestamp(self._get_next_28day_reset(now))
                })

            premium_reset = self._parse_timestamp(record.get('premium_image_generation_reset'))
            if subscription_tier == 'premium' and (not premium_reset or now >= premium_reset):
                updates.update({
                    'premium_image_generation_count': 0,
                    'premium_image_generation_reset': self._format_timestamp(self._get_next_month_start_est(now))
                })

            if updates:
                self.client.table('user_usage_limits').update(updates).eq('user_id', user_id).execute()
                record = self._ensure_usage_record(user_id)
                if not record:
                    return None

            details = self._evaluate_limits(subscription_tier, record, operation_type)
            logger.info(
                "Usage limit fallback applied: user=%s tier=%s operation=%s allowed=%s",
                user_id,
                subscription_tier,
                operation_type,
                details['allowed'],
            )
            return details['allowed'], details

        except Exception as err:
            logger.error(f"Usage limit fallback failed: {err}")
            return None

    def _ensure_usage_record(self, user_id: str) -> Optional[Dict]:
        record_resp = self.client.table('user_usage_limits').select('*').eq('user_id', user_id).limit(1).execute()
        if not record_resp.data:
            self.client.rpc('initialize_usage_limits', {'p_user_id': user_id}).execute()
            record_resp = self.client.table('user_usage_limits').select('*').eq('user_id', user_id).limit(1).execute()
        return record_resp.data[0] if record_resp.data else None

    def _evaluate_limits(self, subscription_tier: str, record: Dict, operation_type: str) -> Dict:
        now_iso = datetime.now(timezone.utc).isoformat()

        def _detail(allowed: bool, current: int, limit_value: int, reset_field: str, message: str) -> Dict:
            return {
                'allowed': allowed,
                'current_usage': current,
                'limit_value': limit_value,
                'reset_date': record.get(reset_field) or now_iso,
                'message': message,
                'subscription_tier': subscription_tier
            }

        if subscription_tier == 'premium' and operation_type != 'image_generation':
            return _detail(True, 0, 999999, 'weekly_reset_date', 'Unlimited access')

        if operation_type == 'invoice_upload':
            weekly = record.get('weekly_invoice_uploads', 0)
            monthly = record.get('monthly_bonus_invoices', 0)
            if weekly < 1:
                return _detail(True, weekly, 1, 'weekly_reset_date', 'Weekly invoice upload available')
            if monthly < 2:
                return _detail(True, monthly, 2, 'monthly_reset_date', 'Bonus invoice upload available')
            return _detail(False, weekly, 1, 'weekly_reset_date', 'Weekly limit (1) and monthly bonus (2) exhausted')

        if operation_type == 'free_analysis':
            used = record.get('weekly_free_analyses', 0)
            if used < 2:
                return _detail(True, used, 2, 'weekly_reset_date', 'Free analysis available')
            return _detail(False, used, 2, 'weekly_reset_date', 'Weekly limit (2) exhausted')

        if operation_type == 'menu_comparison':
            used = record.get('weekly_menu_comparisons', 0)
            if used < 1:
                return _detail(True, used, 1, 'weekly_reset_date', 'Menu comparison available')
            return _detail(False, used, 1, 'weekly_reset_date', 'Weekly limit (1) exhausted')

        if operation_type == 'menu_upload':
            used = record.get('weekly_menu_uploads', 0)
            if used < 1:
                return _detail(True, used, 1, 'weekly_reset_date', 'Menu upload available')
            return _detail(False, used, 1, 'weekly_reset_date', 'Weekly limit (1) exhausted')

        if operation_type == 'premium_analysis':
            used = record.get('weekly_premium_analyses', 0)
            if used < 1:
                return _detail(True, used, 1, 'weekly_reset_date', 'Premium analysis available')
            return _detail(False, used, 1, 'weekly_reset_date', 'Weekly limit (1) exhausted')

        if operation_type == 'image_generation':
            if subscription_tier == 'premium':
                used = record.get('premium_image_generation_count', 0)
                limit_value = 50
                allowed = used < limit_value
                return _detail(
                    allowed,
                    used,
                    limit_value,
                    'premium_image_generation_reset',
                    'Monthly premium creative generation available' if allowed else 'Monthly premium creative limit (50) exhausted'
                )
            used = record.get('image_generation_28day_count', 0)
            limit_value = 3  # Free tier: 3 generations per 28 days
            allowed = used < limit_value
            return _detail(
                allowed,
                used,
                limit_value,
                'image_generation_28day_reset',
                'Creative generation available (3 per 28 days)' if allowed else '28-day creative limit (3) exhausted'
            )

        return _detail(False, 0, 0, 'weekly_reset_date', 'Unknown operation type')

    def _parse_timestamp(self, value: Optional[str]) -> Optional[datetime]:
        if not value:
            return None
        try:
            if value.endswith('Z'):
                value = value[:-1] + '+00:00'
            parsed = datetime.fromisoformat(value)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
        except Exception:
            return None

    def _format_timestamp(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat()

    def _get_next_monday_est(self, now_utc: datetime) -> datetime:
        est_now = now_utc.astimezone(self._est)
        days_ahead = (7 - est_now.weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7
        next_monday_date = (est_now + timedelta(days=days_ahead)).date()
        next_monday = datetime.combine(next_monday_date, datetime.min.time(), tzinfo=self._est)
        return next_monday.astimezone(timezone.utc)

    def _get_next_28day_reset(self, now_utc: datetime) -> datetime:
        base_est = datetime(2025, 11, 3, tzinfo=self._est)
        est_now = now_utc.astimezone(self._est)
        delta_days = (est_now - base_est).days
        periods_elapsed = max(0, delta_days // 28)
        next_reset = base_est + timedelta(days=(periods_elapsed + 1) * 28)
        return next_reset.astimezone(timezone.utc)

    def _get_next_month_start_est(self, now_utc: datetime) -> datetime:
        est_now = now_utc.astimezone(self._est)
        first_of_month = est_now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month = first_of_month.month + 1
        year = first_of_month.year + (1 if month > 12 else 0)
        month = 1 if month > 12 else month
        next_start = first_of_month.replace(year=year, month=month)
        return next_start.astimezone(timezone.utc)


# Singleton instance
_usage_limit_service = None

def get_usage_limit_service() -> UsageLimitService:
    """Get singleton instance of UsageLimitService"""
    global _usage_limit_service
    if _usage_limit_service is None:
        _usage_limit_service = UsageLimitService()
    return _usage_limit_service
