"""
Feature flag service for gradual rollout of new features.

Provides centralized feature flag management with Redis-backed TTL caching.
"""
from __future__ import annotations

import logging
import time
import os
from typing import Any, Dict, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)

# Default TTL for feature flag cache (5 minutes)
FEATURE_FLAG_CACHE_TTL = int(os.getenv("FEATURE_FLAG_CACHE_TTL", "300"))


class CacheEntry:
    """Cache entry with TTL tracking."""
    
    def __init__(self, data: Dict[str, Any], ttl: int):
        self.data = data
        self.expires_at = time.time() + ttl
    
    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class FeatureFlagService:
    """
    Manages feature flags for gradual rollout.
    
    Uses a two-tier caching strategy:
    1. Redis (if available) - shared across instances
    2. In-memory with TTL - per-instance fallback
    """
    
    def __init__(self):
        self.client = get_supabase_service_client()
        self._local_cache: Dict[str, CacheEntry] = {}
        self._ttl = FEATURE_FLAG_CACHE_TTL
        
        # Try to use Redis for distributed caching
        try:
            from services.redis_client import cache
            self._redis = cache if cache.enabled else None
        except ImportError:
            self._redis = None
        
        if self._redis:
            logger.info(f"✅ Feature flags using Redis cache (TTL: {self._ttl}s)")
        else:
            logger.info(f"⚠️ Feature flags using in-memory cache (TTL: {self._ttl}s)")
    
    def _get_redis_key(self, flag_name: str) -> str:
        """Generate Redis key for feature flag."""
        return f"feature_flag:{flag_name}"
    
    def _get_from_cache(self, flag_name: str) -> Optional[Dict[str, Any]]:
        """Get flag from cache (Redis first, then local)."""
        # Try Redis first
        if self._redis:
            cached = self._redis.get(self._get_redis_key(flag_name))
            if cached:
                logger.debug(f"Feature flag '{flag_name}' from Redis cache")
                return cached
        
        # Fall back to local cache
        if flag_name in self._local_cache:
            entry = self._local_cache[flag_name]
            if not entry.is_expired():
                logger.debug(f"Feature flag '{flag_name}' from local cache")
                return entry.data
            else:
                # Clean up expired entry
                del self._local_cache[flag_name]
        
        return None
    
    def _set_cache(self, flag_name: str, data: Dict[str, Any]):
        """Set flag in cache (both Redis and local)."""
        # Set in Redis
        if self._redis:
            self._redis.set(self._get_redis_key(flag_name), data, ttl=self._ttl)
        
        # Always set in local cache as fallback
        self._local_cache[flag_name] = CacheEntry(data, self._ttl)
    
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
            cached = self._get_from_cache(flag_name)
            if cached is not None:
                return cached.get("is_enabled", default)
            
            # Query database
            result = self.client.table("feature_flags").select(
                "is_enabled, config"
            ).eq("flag_name", flag_name).limit(1).execute()
            
            if result.data:
                flag = result.data[0]
                self._set_cache(flag_name, flag)
                return flag["is_enabled"]
            
            # Cache negative result too (flag doesn't exist)
            self._set_cache(flag_name, {"is_enabled": default, "config": {}})
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
            # Check cache first
            cached = self._get_from_cache(flag_name)
            if cached is not None:
                return cached.get("config", {})
            
            # Query database
            result = self.client.table("feature_flags").select(
                "is_enabled, config"
            ).eq("flag_name", flag_name).limit(1).execute()
            
            if result.data:
                flag = result.data[0]
                self._set_cache(flag_name, flag)
                return flag.get("config", {})
            
            return {}
            
        except Exception as e:
            logger.error(f"Error getting feature flag config {flag_name}: {e}")
            return {}
    
    def clear_cache(self, flag_name: Optional[str] = None):
        """
        Clear feature flag cache.
        
        Args:
            flag_name: Specific flag to clear, or None to clear all
        """
        if flag_name:
            # Clear specific flag
            if self._redis:
                self._redis.delete(self._get_redis_key(flag_name))
            if flag_name in self._local_cache:
                del self._local_cache[flag_name]
            logger.info(f"Feature flag cache cleared: {flag_name}")
        else:
            # Clear all flags
            if self._redis:
                self._redis.delete_pattern("feature_flag:*")
            self._local_cache = {}
            logger.info("All feature flag caches cleared")
    
    def refresh_flag(self, flag_name: str) -> bool:
        """
        Force refresh a specific flag from database.
        
        Args:
            flag_name: Name of the feature flag
            
        Returns:
            True if flag exists and was refreshed
        """
        try:
            # Clear from cache first
            self.clear_cache(flag_name)
            
            # Query database
            result = self.client.table("feature_flags").select(
                "is_enabled, config"
            ).eq("flag_name", flag_name).limit(1).execute()
            
            if result.data:
                flag = result.data[0]
                self._set_cache(flag_name, flag)
                logger.info(f"Feature flag '{flag_name}' refreshed: enabled={flag['is_enabled']}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error refreshing feature flag {flag_name}: {e}")
            return False
    
    def get_all_flags(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all feature flags (for admin dashboard).
        
        Returns:
            Dictionary of all flags with their status and config
        """
        try:
            result = self.client.table("feature_flags").select(
                "flag_name, is_enabled, config, description, created_at, updated_at"
            ).execute()
            
            flags = {}
            for flag in result.data:
                flags[flag["flag_name"]] = {
                    "is_enabled": flag["is_enabled"],
                    "config": flag.get("config", {}),
                    "description": flag.get("description", ""),
                    "created_at": flag.get("created_at"),
                    "updated_at": flag.get("updated_at")
                }
                # Update cache while we're at it
                self._set_cache(flag["flag_name"], flag)
            
            return flags
            
        except Exception as e:
            logger.error(f"Error getting all feature flags: {e}")
            return {}


# Singleton instance
_feature_flag_service: Optional[FeatureFlagService] = None


def get_feature_flag_service() -> FeatureFlagService:
    """Get singleton feature flag service instance."""
    global _feature_flag_service
    if _feature_flag_service is None:
        _feature_flag_service = FeatureFlagService()
    return _feature_flag_service


# Convenience functions
def is_feature_enabled(flag_name: str, default: bool = False) -> bool:
    """Quick check if a feature is enabled."""
    return get_feature_flag_service().is_enabled(flag_name, default)


def get_feature_config(flag_name: str) -> Dict[str, Any]:
    """Quick get feature config."""
    return get_feature_flag_service().get_config(flag_name)
