"""
Cache Module Tests
Tests for cache functionality with Redis and in-memory fallback
"""
import pytest
import time


class TestCacheManager:
    """Tests for CacheManager class"""
    
    def test_cache_set_and_get(self):
        """Cache should store and retrieve values"""
        from cache import cache
        
        test_key = "test:cache:set_get"
        test_value = {"message": "hello", "count": 42}
        
        cache.set(test_key, test_value, ttl=60)
        result = cache.get(test_key)
        
        assert result == test_value
        
        # Cleanup
        cache.invalidate(test_key)
    
    def test_cache_get_missing_key(self):
        """Cache should return None for missing keys"""
        from cache import cache
        
        result = cache.get("nonexistent:key:12345")
        
        assert result is None
    
    def test_cache_invalidate(self):
        """Cache should remove values when invalidated"""
        from cache import cache
        
        test_key = "test:cache:invalidate"
        cache.set(test_key, "value")
        
        # Verify it exists
        assert cache.get(test_key) is not None
        
        # Invalidate
        cache.invalidate(test_key)
        
        # Should be gone
        assert cache.get(test_key) is None
    
    def test_cache_string_value(self):
        """Cache should handle string values"""
        from cache import cache
        
        test_key = "test:cache:string"
        cache.set(test_key, "simple string", ttl=60)
        
        result = cache.get(test_key)
        
        # String should be returned as-is
        assert result == "simple string"
        
        cache.invalidate(test_key)
    
    def test_cache_list_value(self):
        """Cache should handle list values"""
        from cache import cache
        
        test_key = "test:cache:list"
        test_list = [1, 2, 3, "four", {"five": 5}]
        
        cache.set(test_key, test_list, ttl=60)
        result = cache.get(test_key)
        
        assert result == test_list
        
        cache.invalidate(test_key)
    
    def test_cache_type_property(self):
        """Cache should report whether using Redis or memory"""
        from cache import cache
        
        assert hasattr(cache, 'is_redis')
        assert isinstance(cache.is_redis, bool)


class TestInMemoryCache:
    """Tests specifically for InMemoryCache fallback"""
    
    def test_in_memory_cache_ttl(self):
        """In-memory cache should respect TTL"""
        from cache import InMemoryCache
        
        mem_cache = InMemoryCache()
        
        # Set with very short TTL
        mem_cache.set("expire:test", "value", ex=1)
        
        # Should exist immediately
        assert mem_cache.get("expire:test") == "value"
        
        # Wait for expiry
        time.sleep(1.1)
        
        # Should be expired
        assert mem_cache.get("expire:test") is None
    
    def test_in_memory_cache_delete(self):
        """In-memory cache delete should work"""
        from cache import InMemoryCache
        
        mem_cache = InMemoryCache()
        
        mem_cache.set("delete:test", "value")
        assert mem_cache.get("delete:test") == "value"
        
        mem_cache.delete("delete:test")
        assert mem_cache.get("delete:test") is None
    
    def test_in_memory_cache_exists(self):
        """In-memory cache exists should work"""
        from cache import InMemoryCache
        
        mem_cache = InMemoryCache()
        
        assert not mem_cache.exists("exists:test")
        
        mem_cache.set("exists:test", "value")
        assert mem_cache.exists("exists:test")
