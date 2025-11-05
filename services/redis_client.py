#!/usr/bin/env python3
"""
Redis Cache Client for RestaurantIQ
Provides caching for competitor data and reviews
"""
import redis
import json
import os
from typing import Optional, Any, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class RedisCache:
    """
    Redis cache client with graceful fallback
    
    If Redis is unavailable, operations fail silently and return None
    This ensures the app works without Redis (just slower)
    """
    
    def __init__(self):
        self.enabled = False
        self.client = None
        
        try:
            # Try to connect to Redis
            redis_host = os.getenv('REDIS_HOST', 'localhost')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_password = os.getenv('REDIS_PASSWORD', None)
            
            self.client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                db=0,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2
            )
            
            # Test connection
            self.client.ping()
            self.enabled = True
            logger.info(f"✅ Redis connected: {redis_host}:{redis_port}")
            
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable: {e}. Running without cache.")
            self.enabled = False
            self.client = None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled:
            return None
        
        try:
            value = self.client.get(key)
            if value:
                logger.debug(f"✅ Cache HIT: {key}")
                return json.loads(value)
            logger.debug(f"❌ Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Redis GET error for {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL (seconds)"""
        if not self.enabled:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            self.client.setex(key, ttl, serialized)
            logger.debug(f"💾 Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Redis SET error for {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.enabled:
            return False
        
        try:
            self.client.delete(key)
            logger.debug(f"🗑️ Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error for {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.enabled:
            return 0
        
        try:
            deleted = 0
            cursor = 0
            while True:
                cursor, keys = self.client.scan(cursor, match=pattern, count=100)
                for key in keys:
                    self.client.delete(key)
                    deleted += 1
                if cursor == 0:
                    break
            logger.info(f"🗑️ Cache DELETE pattern: {pattern} ({deleted} keys)")
            return deleted
        except Exception as e:
            logger.error(f"Redis DELETE pattern error for {pattern}: {e}")
            return 0
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        if not self.enabled:
            return {
                'enabled': False,
                'message': 'Redis not available'
            }
        
        try:
            info = self.client.info()
            hits = info.get('keyspace_hits', 0)
            misses = info.get('keyspace_misses', 0)
            total = hits + misses
            hit_rate = (hits / total * 100) if total > 0 else 0
            
            return {
                'enabled': True,
                'used_memory': info.get('used_memory_human', 'N/A'),
                'connected_clients': info.get('connected_clients', 0),
                'total_commands': info.get('total_commands_processed', 0),
                'keyspace_hits': hits,
                'keyspace_misses': misses,
                'hit_rate_percent': round(hit_rate, 2),
                'uptime_days': info.get('uptime_in_days', 0)
            }
        except Exception as e:
            logger.error(f"Redis stats error: {e}")
            return {
                'enabled': True,
                'error': str(e)
            }
    
    def health_check(self) -> bool:
        """Check if Redis is healthy"""
        if not self.enabled:
            return False
        
        try:
            return self.client.ping()
        except:
            return False

# Global cache instance
cache = RedisCache()

# Cache key generators
def get_reviews_cache_key(place_id: str) -> str:
    """Generate cache key for reviews (includes today's date)"""
    from datetime import date
    today = date.today().isoformat()
    return f"reviews:{place_id}:{today}"

def get_analysis_cache_key(restaurant_name: str, location: str, tier: str) -> str:
    """Generate cache key for complete analysis"""
    # Normalize inputs
    restaurant = restaurant_name.lower().strip().replace(' ', '_')
    loc = location.lower().strip().replace(' ', '_')
    return f"analysis:{restaurant}:{loc}:{tier}"

def get_competitors_cache_key(location: str, category: str) -> str:
    """Generate cache key for competitor discovery"""
    loc = location.lower().strip().replace(' ', '_')
    cat = category.lower().strip().replace(' ', '_')
    return f"competitors:{loc}:{cat}"
