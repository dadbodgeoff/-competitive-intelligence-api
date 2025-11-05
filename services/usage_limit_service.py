"""
Usage Limit Service
Enforces free tier usage limits with atomic operations
Pattern: Security-first, prevents all abuse vectors
"""
import logging
from typing import Dict, Optional, Tuple
from datetime import datetime
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
            logger.error(f"Error checking usage limit: {e}")
            # Fail closed - deny access on error
            return False, {
                'allowed': False,
                'message': f'Error checking usage limits: {str(e)}',
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
            
            # Premium/Enterprise users have unlimited
            if subscription_tier in ['premium', 'enterprise']:
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


# Singleton instance
_usage_limit_service = None

def get_usage_limit_service() -> UsageLimitService:
    """Get singleton instance of UsageLimitService"""
    global _usage_limit_service
    if _usage_limit_service is None:
        _usage_limit_service = UsageLimitService()
    return _usage_limit_service
