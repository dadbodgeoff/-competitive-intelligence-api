#!/usr/bin/env python3
"""
Feature Flags Configuration
SAFE DEPLOYMENT: Control menu intelligence features via environment variables

This allows deploying menu code with features disabled,
then enabling gradually without code changes.
"""
import os
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class FeatureFlags:
    """
    Centralized feature flag management
    
    Environment variables control which features are enabled:
    - ENABLE_MENU_ANALYSIS=true/false
    - ENABLE_MENU_EXTRACTION=true/false  
    - ENABLE_MENU_PREMIUM=true/false
    """
    
    def __init__(self):
        self._flags = self._load_flags_from_env()
        self._log_flag_status()
    
    def _load_flags_from_env(self) -> Dict[str, bool]:
        """Load feature flags from environment variables"""
        
        flags = {
            # Core menu analysis feature
            'menu_analysis': self._env_bool('ENABLE_MENU_ANALYSIS', False),
            
            # Menu extraction from competitor websites
            'menu_extraction': self._env_bool('ENABLE_MENU_EXTRACTION', False),
            
            # Premium menu features
            'menu_premium': self._env_bool('ENABLE_MENU_PREMIUM', False),
            
            # Menu API routes
            'menu_api_routes': self._env_bool('ENABLE_MENU_API_ROUTES', False),
            
            # Menu frontend components
            'menu_frontend': self._env_bool('ENABLE_MENU_FRONTEND', False),
            
            # Beta user testing
            'menu_beta_users': self._env_bool('ENABLE_MENU_BETA_USERS', False),
            
            # ============================================================================
            # OPTIMIZATION FLAGS (NEW)
            # ============================================================================
            
            # Parallel Google Places collection
            'use_parallel_google_places': self._env_bool('USE_PARALLEL_GOOGLE_PLACES', False),
            
            # Review caching system
            'use_review_caching': self._env_bool('USE_REVIEW_CACHING', False),
            
            # ============================================================================
            # SERPAPI INTEGRATION FLAGS (NEW)
            # ============================================================================
            
            # SerpAPI premium review collection
            'use_serpapi_premium': self._env_bool('USE_SERPAPI_PREMIUM', False),
            
            # SerpAPI adaptive sampling
            'use_serpapi_adaptive_sampling': self._env_bool('USE_SERPAPI_ADAPTIVE_SAMPLING', True),
            
            # SerpAPI fallback to web scraping
            'serpapi_fallback_enabled': self._env_bool('SERPAPI_FALLBACK_ENABLED', True),
        }
        
        return flags
    
    def _env_bool(self, key: str, default: bool = False) -> bool:
        """Convert environment variable to boolean"""
        value = os.getenv(key, str(default)).lower()
        return value in ('true', '1', 'yes', 'on', 'enabled')
    
    def _log_flag_status(self):
        """Log current feature flag status"""
        logger.info("Feature flags loaded:")
        for flag_name, enabled in self._flags.items():
            status = "ENABLED" if enabled else "DISABLED"
            logger.info(f"  • {flag_name}: {status}")
    
    # ============================================================================
    # FEATURE FLAG CHECKS
    # ============================================================================
    
    def is_menu_analysis_enabled(self) -> bool:
        """Check if menu analysis is enabled"""
        return self._flags.get('menu_analysis', False)
    
    def is_menu_extraction_enabled(self) -> bool:
        """Check if menu extraction is enabled"""
        return self._flags.get('menu_extraction', False)
    
    def is_menu_premium_enabled(self) -> bool:
        """Check if premium menu features are enabled"""
        return self._flags.get('menu_premium', False)
    
    def is_menu_api_enabled(self) -> bool:
        """Check if menu API routes are enabled"""
        return self._flags.get('menu_api_routes', False)
    
    def is_menu_frontend_enabled(self) -> bool:
        """Check if menu frontend is enabled"""
        return self._flags.get('menu_frontend', False)
    
    def is_menu_beta_enabled(self) -> bool:
        """Check if menu beta testing is enabled"""
        return self._flags.get('menu_beta_users', False)
    
    # ============================================================================
    # OPTIMIZATION FEATURE FLAGS (NEW)
    # ============================================================================
    

    
    def use_parallel_google_places(self) -> bool:
        """Check if parallel Google Places collection is enabled"""
        return self._flags.get('use_parallel_google_places', False)
    
    def use_review_caching(self) -> bool:
        """Check if review caching is enabled"""
        return self._flags.get('use_review_caching', False)
    

    
    # ============================================================================
    # SERPAPI FEATURE FLAGS (NEW)
    # ============================================================================
    
    def use_serpapi_premium(self) -> bool:
        """Check if SerpAPI should be used for premium tier review collection"""
        return self._flags.get('use_serpapi_premium', False)
    
    def use_serpapi_adaptive_sampling(self) -> bool:
        """Check if SerpAPI adaptive sampling is enabled"""
        return self._flags.get('use_serpapi_adaptive_sampling', True)
    
    def is_serpapi_fallback_enabled(self) -> bool:
        """Check if fallback to web scraping is enabled when SerpAPI fails"""
        return self._flags.get('serpapi_fallback_enabled', True)
    
    # ============================================================================
    # USER-SPECIFIC CHECKS
    # ============================================================================
    
    def is_menu_enabled_for_user(self, user_id: str) -> bool:
        """
        Check if menu features are enabled for specific user
        
        Allows gradual rollout to specific users first
        """
        
        # If menu analysis is globally disabled, return False
        if not self.is_menu_analysis_enabled():
            return False
        
        # If beta mode is enabled, check beta user list
        if self.is_menu_beta_enabled():
            return self._is_beta_user(user_id)
        
        # If not in beta mode, enabled for all users
        return True
    
    def _is_beta_user(self, user_id: str) -> bool:
        """Check if user is in beta test group"""
        
        # Get beta users from environment variable
        beta_users_str = os.getenv('MENU_BETA_USERS', '')
        beta_users = [user.strip() for user in beta_users_str.split(',') if user.strip()]
        
        return user_id in beta_users
    
    # ============================================================================
    # TIER-SPECIFIC CHECKS
    # ============================================================================
    
    def is_tier_enabled(self, tier: str) -> bool:
        """Check if specific tier is enabled"""
        
        if tier == 'free':
            return self.is_menu_analysis_enabled()
        elif tier == 'premium':
            return self.is_menu_analysis_enabled() and self.is_menu_premium_enabled()
        else:
            return False
    
    # ============================================================================
    # FEATURE COMBINATIONS
    # ============================================================================
    
    def get_enabled_features(self) -> Dict[str, bool]:
        """Get all enabled features for debugging"""
        return self._flags.copy()
    
    def get_menu_feature_status(self) -> Dict[str, Any]:
        """Get comprehensive menu feature status"""
        
        return {
            'menu_analysis_enabled': self.is_menu_analysis_enabled(),
            'menu_extraction_enabled': self.is_menu_extraction_enabled(),
            'menu_premium_enabled': self.is_menu_premium_enabled(),
            'menu_api_enabled': self.is_menu_api_enabled(),
            'menu_frontend_enabled': self.is_menu_frontend_enabled(),
            'beta_testing_enabled': self.is_menu_beta_enabled(),
            'environment_variables': {
                'ENABLE_MENU_ANALYSIS': os.getenv('ENABLE_MENU_ANALYSIS', 'false'),
                'ENABLE_MENU_EXTRACTION': os.getenv('ENABLE_MENU_EXTRACTION', 'false'),
                'ENABLE_MENU_PREMIUM': os.getenv('ENABLE_MENU_PREMIUM', 'false'),
                'ENABLE_MENU_API_ROUTES': os.getenv('ENABLE_MENU_API_ROUTES', 'false'),
                'ENABLE_MENU_FRONTEND': os.getenv('ENABLE_MENU_FRONTEND', 'false'),
                'ENABLE_MENU_BETA_USERS': os.getenv('ENABLE_MENU_BETA_USERS', 'false'),
                'MENU_BETA_USERS': os.getenv('MENU_BETA_USERS', '')
            }
        }

# ============================================================================
# GLOBAL INSTANCE
# ============================================================================
# Create global instance for easy importing
feature_flags = FeatureFlags()

# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================
def is_menu_enabled() -> bool:
    """Quick check if menu analysis is enabled"""
    return feature_flags.is_menu_analysis_enabled()

def is_menu_enabled_for_user(user_id: str) -> bool:
    """Quick check if menu is enabled for specific user"""
    return feature_flags.is_menu_enabled_for_user(user_id)

def require_menu_enabled():
    """Decorator/function to require menu features to be enabled"""
    if not is_menu_enabled():
        raise RuntimeError("Menu analysis features are disabled")

def require_menu_enabled_for_user(user_id: str):
    """Require menu features to be enabled for specific user"""
    if not is_menu_enabled_for_user(user_id):
        raise RuntimeError(f"Menu analysis not enabled for user {user_id}")

# ============================================================================
# DEPLOYMENT CONFIGURATIONS
# ============================================================================
class DeploymentConfig:
    """Predefined deployment configurations"""
    
    @staticmethod
    def production_safe() -> Dict[str, str]:
        """Production deployment with all menu features OFF"""
        return {
            'ENABLE_MENU_ANALYSIS': 'false',
            'ENABLE_MENU_EXTRACTION': 'false',
            'ENABLE_MENU_PREMIUM': 'false',
            'ENABLE_MENU_API_ROUTES': 'false',
            'ENABLE_MENU_FRONTEND': 'false',
            'ENABLE_MENU_BETA_USERS': 'false'
        }
    
    @staticmethod
    def beta_testing() -> Dict[str, str]:
        """Beta testing configuration"""
        return {
            'ENABLE_MENU_ANALYSIS': 'true',
            'ENABLE_MENU_EXTRACTION': 'false',  # Start without extraction
            'ENABLE_MENU_PREMIUM': 'false',     # Free tier only first
            'ENABLE_MENU_API_ROUTES': 'true',
            'ENABLE_MENU_FRONTEND': 'true',
            'ENABLE_MENU_BETA_USERS': 'true',
            'MENU_BETA_USERS': 'your-user-id,test-user-id'  # Replace with actual IDs
        }
    
    @staticmethod
    def full_release() -> Dict[str, str]:
        """Full release configuration"""
        return {
            'ENABLE_MENU_ANALYSIS': 'true',
            'ENABLE_MENU_EXTRACTION': 'true',
            'ENABLE_MENU_PREMIUM': 'true',
            'ENABLE_MENU_API_ROUTES': 'true',
            'ENABLE_MENU_FRONTEND': 'true',
            'ENABLE_MENU_BETA_USERS': 'false'  # No longer beta
        }

# ============================================================================
# USAGE EXAMPLES
# ============================================================================
"""
DEPLOYMENT PHASES:

Phase 1 - Deploy Code (Features OFF):
export ENABLE_MENU_ANALYSIS=false
# Deploy and verify review analysis still works

Phase 2 - Beta Testing:
export ENABLE_MENU_ANALYSIS=true
export ENABLE_MENU_API_ROUTES=true
export ENABLE_MENU_BETA_USERS=true
export MENU_BETA_USERS="your-user-id"
# Test with yourself only

Phase 3 - Limited Release:
export ENABLE_MENU_ANALYSIS=true
export ENABLE_MENU_API_ROUTES=true
export ENABLE_MENU_BETA_USERS=false
# Enable for all users, basic features only

Phase 4 - Full Release:
export ENABLE_MENU_ANALYSIS=true
export ENABLE_MENU_EXTRACTION=true
export ENABLE_MENU_PREMIUM=true
export ENABLE_MENU_API_ROUTES=true
export ENABLE_MENU_FRONTEND=true
# All features enabled

EMERGENCY ROLLBACK:
export ENABLE_MENU_ANALYSIS=false
# Instantly disables all menu features
"""