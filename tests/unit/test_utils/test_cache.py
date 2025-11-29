"""Tests for caching utility."""

import asyncio
import time

import pytest

from src.utils.cache import Cache, CacheEntry, cache_key, cached, get_cache


class TestCacheEntry:
    """Tests for CacheEntry dataclass."""

    def test_create_entry(self):
        """Test creating a cache entry."""
        entry = CacheEntry(value={"data": "test"})

        assert entry.value == {"data": "test"}
        assert entry.expires_at is None

    def test_not_expired_without_ttl(self):
        """Test entry without TTL never expires."""
        entry = CacheEntry(value="test")

        assert entry.is_expired() is False

    def test_not_expired_with_future_ttl(self):
        """Test entry with future expiry is not expired."""
        entry = CacheEntry(
            value="test",
            expires_at=time.time() + 100,
        )

        assert entry.is_expired() is False

    def test_expired_with_past_ttl(self):
        """Test entry with past expiry is expired."""
        entry = CacheEntry(
            value="test",
            expires_at=time.time() - 1,
        )

        assert entry.is_expired() is True


class TestCache:
    """Tests for Cache class."""

    @pytest.fixture
    def fresh_cache(self):
        """Create a fresh cache for each test."""
        # Reset singleton
        Cache._instance = None
        cache = Cache()

        # Clear any existing entries
        cache._memory_cache.clear()

        yield cache

        # Cleanup
        Cache._instance = None

    def test_singleton(self, fresh_cache):
        """Test singleton pattern."""
        cache1 = Cache()
        cache2 = Cache()

        assert cache1 is cache2

    def test_get_cache_function(self, fresh_cache):
        """Test get_cache returns singleton."""
        cache = get_cache()

        assert isinstance(cache, Cache)
        assert cache is Cache()

    @pytest.mark.asyncio
    async def test_set_and_get(self, fresh_cache):
        """Test basic set and get operations."""
        await fresh_cache.set("test_key", {"data": "value"})
        result = await fresh_cache.get("test_key")

        assert result == {"data": "value"}

    @pytest.mark.asyncio
    async def test_get_missing_key(self, fresh_cache):
        """Test getting non-existent key."""
        result = await fresh_cache.get("nonexistent")

        assert result is None

    @pytest.mark.asyncio
    async def test_delete(self, fresh_cache):
        """Test deleting a key."""
        await fresh_cache.set("to_delete", "value")
        assert await fresh_cache.get("to_delete") == "value"

        result = await fresh_cache.delete("to_delete")

        assert result is True
        assert await fresh_cache.get("to_delete") is None

    @pytest.mark.asyncio
    async def test_delete_missing_key(self, fresh_cache):
        """Test deleting non-existent key."""
        result = await fresh_cache.delete("nonexistent")

        assert result is False

    @pytest.mark.asyncio
    async def test_exists(self, fresh_cache):
        """Test checking key existence."""
        await fresh_cache.set("exists_key", "value")

        assert await fresh_cache.exists("exists_key") is True
        assert await fresh_cache.exists("nonexistent") is False

    @pytest.mark.asyncio
    async def test_ttl_expiry(self, fresh_cache):
        """Test TTL expiry."""
        await fresh_cache.set("expiring", "value", ttl=1)

        # Should exist initially
        assert await fresh_cache.get("expiring") == "value"

        # Wait for expiry
        await asyncio.sleep(1.1)

        # Should be expired
        assert await fresh_cache.get("expiring") is None

    @pytest.mark.asyncio
    async def test_clear_all(self, fresh_cache):
        """Test clearing all entries."""
        await fresh_cache.set("key1", "value1")
        await fresh_cache.set("key2", "value2")
        await fresh_cache.set("key3", "value3")

        count = await fresh_cache.clear()

        assert count == 3
        assert await fresh_cache.get("key1") is None
        assert await fresh_cache.get("key2") is None
        assert await fresh_cache.get("key3") is None

    @pytest.mark.asyncio
    async def test_clear_pattern(self, fresh_cache):
        """Test clearing by pattern."""
        await fresh_cache.set("user:1", "user1")
        await fresh_cache.set("user:2", "user2")
        await fresh_cache.set("product:1", "product1")

        count = await fresh_cache.clear("user:*")

        assert count == 2
        assert await fresh_cache.get("user:1") is None
        assert await fresh_cache.get("user:2") is None
        assert await fresh_cache.get("product:1") == "product1"

    @pytest.mark.asyncio
    async def test_get_many(self, fresh_cache):
        """Test getting multiple keys."""
        await fresh_cache.set("k1", "v1")
        await fresh_cache.set("k2", "v2")
        await fresh_cache.set("k3", "v3")

        results = await fresh_cache.get_many(["k1", "k2", "k4"])

        assert results == {"k1": "v1", "k2": "v2"}

    @pytest.mark.asyncio
    async def test_set_many(self, fresh_cache):
        """Test setting multiple keys."""
        count = await fresh_cache.set_many({
            "batch1": "value1",
            "batch2": "value2",
            "batch3": "value3",
        })

        assert count == 3
        assert await fresh_cache.get("batch1") == "value1"
        assert await fresh_cache.get("batch2") == "value2"
        assert await fresh_cache.get("batch3") == "value3"

    @pytest.mark.asyncio
    async def test_cleanup_expired(self, fresh_cache):
        """Test cleaning up expired entries."""
        # Set entries with different TTLs
        await fresh_cache.set("long_lived", "value", ttl=100)
        await fresh_cache.set("short_lived", "value", ttl=0)

        # Wait a moment
        await asyncio.sleep(0.1)

        # Cleanup
        removed = await fresh_cache.cleanup_expired()

        assert removed == 1
        assert await fresh_cache.get("long_lived") == "value"

    def test_make_key(self, fresh_cache):
        """Test key namespacing."""
        key = fresh_cache._make_key("test")

        assert key == "adk:test"


class TestCacheKey:
    """Tests for cache_key function."""

    def test_cache_key_args(self):
        """Test key generation from args."""
        key1 = cache_key(1, 2, 3)
        key2 = cache_key(1, 2, 3)
        key3 = cache_key(1, 2, 4)

        assert key1 == key2
        assert key1 != key3

    def test_cache_key_kwargs(self):
        """Test key generation from kwargs."""
        key1 = cache_key(name="test", id=1)
        key2 = cache_key(id=1, name="test")  # Same kwargs, different order
        key3 = cache_key(name="test", id=2)

        assert key1 == key2  # Should be same (sorted keys)
        assert key1 != key3

    def test_cache_key_mixed(self):
        """Test key generation from mixed args and kwargs."""
        key1 = cache_key("arg1", "arg2", key="value")
        key2 = cache_key("arg1", "arg2", key="value")

        assert key1 == key2


class TestCachedDecorator:
    """Tests for @cached decorator."""

    @pytest.fixture(autouse=True)
    def reset_cache(self):
        """Reset cache before each test."""
        Cache._instance = None
        cache = Cache()
        cache._memory_cache.clear()
        yield
        Cache._instance = None

    @pytest.mark.asyncio
    async def test_cached_basic(self):
        """Test basic caching with decorator."""
        call_count = 0

        @cached(ttl=300)
        async def expensive_operation(x: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * 2

        # First call - should execute
        result1 = await expensive_operation(5)
        assert result1 == 10
        assert call_count == 1

        # Second call - should use cache
        result2 = await expensive_operation(5)
        assert result2 == 10
        assert call_count == 1  # Not incremented

        # Different arg - should execute
        result3 = await expensive_operation(10)
        assert result3 == 20
        assert call_count == 2

    @pytest.mark.asyncio
    async def test_cached_with_prefix(self):
        """Test caching with prefix."""
        @cached(ttl=300, prefix="user")
        async def get_user(user_id: str) -> dict:
            return {"id": user_id, "name": f"User {user_id}"}

        result = await get_user("123")

        assert result == {"id": "123", "name": "User 123"}

        # Check key was created with prefix
        cache = get_cache()
        keys = list(cache._memory_cache.keys())
        assert any("user:" in k for k in keys)

    @pytest.mark.asyncio
    async def test_cached_ttl_expiry(self):
        """Test cache expiry with decorator."""
        call_count = 0

        @cached(ttl=1)
        async def expiring_func() -> str:
            nonlocal call_count
            call_count += 1
            return "result"

        # First call
        await expiring_func()
        assert call_count == 1

        # Second call (cached)
        await expiring_func()
        assert call_count == 1

        # Wait for expiry
        await asyncio.sleep(1.1)

        # Third call (expired, re-execute)
        await expiring_func()
        assert call_count == 2
