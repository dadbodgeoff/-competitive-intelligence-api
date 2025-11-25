"""
Feature flag service for gradual rollout of new features.

Provides centralized feature flag management with caching.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class FeatureFlagService:
    """Manages feature flags for gradual rollout."""
    
    def __init__(self):
        self.client = get_supabase_service_client()
        self._cache: Dict[str, Dict[str, Any]] = {}
    
    def is_enabled(self, flag_name: str, default: bool = False) -> bool:
        """
        Check if a feature flag is enabled.
        
        Args:
            flag_name: Name of the feature flag
            default: Default value if flag not found
            
        Returns:
            True if enabled, False otherwise
        """
        try:
            # Check cache first
            if flag_name in self._cache:
                return self._cache[flag_name]["is_enabled"]
            
            # Query database
            result = self.client.table("feature_flags").select(
                "is_enabled, config"
            ).eq("flag_name", flag_name).limit(1).execute()
            
            if result.data:
                flag = result.data[0]
                self._cache[flag_name] = flag
                return flag["is_enabled"]
            
            logger.warning(f"Feature flag '{flag_name}' not found, using default: {default}")
            return default
            
        except Exception as e:
            logger.error(f"Error checking feature flag {flag_name}: {e}")
            return default
    
    def get_config(self, flag_name: str) -> Dict[str, Any]:
        """
        Get feature flag configuration.
        
        Args:
            flag_name: Name of the feature flag
            
        Returns:
            Configuration dictionary
        """
        try:
            if flag_name in self._cache:
                return self._cache[flag_name].get("config", {})
            
            result = self.client.table("feature_flags").select(
                "is_enabled, config"
            ).eq("flag_name", flag_name).limit(1).execute()
            
            if result.data:
                flag = result.data[0]
                self._cache[flag_name] = flag
                return flag.get("config", {})
            
            return {}
            
        except Exception as e:
            logger.error(f"Error getting feature flag config {flag_name}: {e}")
            return {}
    
    def clear_cache(self):
        """Clear feature flag cache to force refresh."""
        self._cache = {}
        logger.info("Feature flag cache cleared")


# Singleton instance
_feature_flag_service: Optional[FeatureFlagService] = None


def get_feature_flag_service() -> FeatureFlagService:
    """Get singleton feature flag service instance."""
    global _feature_flag_service
    if _feature_flag_service is None:
        _feature_flag_service = FeatureFlagService()
    return _feature_flag_service
