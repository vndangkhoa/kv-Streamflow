"""
Cache module - Redis with in-memory fallback for development
"""
import json
import time
from typing import Optional, Any
import os

# Try to import redis, fall back to in-memory if not available
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class InMemoryCache:
    """Simple in-memory cache with TTL support for development"""
    
    def __init__(self):
        self._cache: dict[str, tuple[Any, float]] = {}
    
    def get(self, key: str) -> Optional[str]:
        if key in self._cache:
            value, expiry = self._cache[key]
            if time.time() < expiry:
                return value
            del self._cache[key]
        return None
    
    def set(self, key: str, value: str, ex: int = 10800) -> None:
        self._cache[key] = (value, time.time() + ex)
    
    def delete(self, key: str) -> None:
        self._cache.pop(key, None)
    
    def exists(self, key: str) -> bool:
        return self.get(key) is not None


class CacheManager:
    """
    Cache manager with Redis support and in-memory fallback.
    Default TTL: 3 hours (10800 seconds)
    """
    
    DEFAULT_TTL = 10800  # 3 hours
    
    def __init__(self):
        self.client = None
        self.is_redis = False
        self._connect()
    
    def _connect(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        
        if REDIS_AVAILABLE:
            try:
                self.client = redis.from_url(redis_url, decode_responses=True)
                self.client.ping()
                self.is_redis = True
                print("✓ Connected to Redis")
            except Exception as e:
                print(f"⚠ Redis not available ({e}), using in-memory cache")
                self.client = InMemoryCache()
        else:
            print("⚠ Redis package not installed, using in-memory cache")
            self.client = InMemoryCache()
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached data by key"""
        data = self.client.get(key)
        if data:
            try:
                return json.loads(data)
            except:
                return data
        return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> None:
        """Cache data by key"""
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        self.client.set(key, value, ex=ttl or self.DEFAULT_TTL)

    def invalidate(self, key: str) -> None:
        """Remove cached data"""
        self.client.delete(key)


# Singleton instance
cache = CacheManager()
