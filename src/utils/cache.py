"""
Caching Utility - Redis and in-memory caching.

Provides a unified caching interface with:
- In-memory caching (development)
- Redis caching (production)
- Decorator-based caching
- TTL support
- Key namespacing

Usage:
    from src.utils.cache import get_cache, cached

    cache = get_cache()

    # Direct cache operations
    await cache.set("key", {"data": "value"}, ttl=300)
    value = await cache.get("key")

    # Decorator-based caching
    @cached(ttl=300, prefix="user")
    async def get_user(user_id: str):
        return await db.get_user(user_id)
"""

import functools
import hashlib
import json
import logging
import time
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, ParamSpec, TypeVar

from src.core.config import get_settings

logger = logging.getLogger(__name__)

P = ParamSpec("P")
T = TypeVar("T")


@dataclass
class CacheEntry:
    """Cache entry with value and expiration."""

    value: Any
    expires_at: float | None = None

    def is_expired(self) -> bool:
        """Check if entry is expired."""
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at


class Cache:
    """Unified caching interface.

    Supports both in-memory and Redis backends.
    Defaults to in-memory for development.

    Attributes:
        namespace: Key prefix for all cache operations
        default_ttl: Default TTL in seconds (None = no expiry)
    """

    _instance: "Cache | None" = None

    def __new__(cls) -> "Cache":
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        """Initialize cache."""
        if getattr(self, "_initialized", False):
            return

        self._initialized = True
        self.settings = get_settings()
        self.namespace = "adk"
        self.default_ttl: int | None = 300  # 5 minutes default

        # Storage backend
        self._memory_cache: dict[str, CacheEntry] = {}
        self._redis_client = None

        # Try to connect to Redis if configured
        self._setup_backend()

        logger.info(f"Cache initialized (backend: {self._backend_name})")

    def _setup_backend(self) -> None:
        """Set up the cache backend."""
        redis_url = getattr(self.settings, "redis_url", None)

        if redis_url:
            try:
                import redis.asyncio as redis

                self._redis_client = redis.from_url(
                    redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                )
                logger.info(f"Redis cache connected: {redis_url}")
            except ImportError:
                logger.warning("Redis package not installed, using in-memory cache")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}, using in-memory cache")

    @property
    def _backend_name(self) -> str:
        """Get backend name."""
        return "redis" if self._redis_client else "memory"

    def _make_key(self, key: str) -> str:
        """Create namespaced cache key.

        Args:
            key: Base key

        Returns:
            Namespaced key
        """
        return f"{self.namespace}:{key}"

    async def get(self, key: str) -> Any | None:
        """Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        full_key = self._make_key(key)

        if self._redis_client:
            return await self._redis_get(full_key)
        return self._memory_get(full_key)

    async def set(
        self,
        key: str,
        value: Any,
        ttl: int | None = None,
    ) -> bool:
        """Set value in cache.

        Args:
            key: Cache key
            value: Value to cache (must be JSON-serializable)
            ttl: Time-to-live in seconds (None = use default)

        Returns:
            True if successful
        """
        full_key = self._make_key(key)
        ttl = ttl if ttl is not None else self.default_ttl

        if self._redis_client:
            return await self._redis_set(full_key, value, ttl)
        return self._memory_set(full_key, value, ttl)

    async def delete(self, key: str) -> bool:
        """Delete value from cache.

        Args:
            key: Cache key

        Returns:
            True if deleted
        """
        full_key = self._make_key(key)

        if self._redis_client:
            return await self._redis_delete(full_key)
        return self._memory_delete(full_key)

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache.

        Args:
            key: Cache key

        Returns:
            True if exists and not expired
        """
        value = await self.get(key)
        return value is not None

    async def clear(self, pattern: str | None = None) -> int:
        """Clear cache entries.

        Args:
            pattern: Optional pattern to match (e.g., "user:*")

        Returns:
            Number of entries cleared
        """
        if self._redis_client:
            return await self._redis_clear(pattern)
        return self._memory_clear(pattern)

    async def get_many(self, keys: list[str]) -> dict[str, Any]:
        """Get multiple values.

        Args:
            keys: List of cache keys

        Returns:
            Dict of key -> value (missing keys omitted)
        """
        results = {}
        for key in keys:
            value = await self.get(key)
            if value is not None:
                results[key] = value
        return results

    async def set_many(
        self,
        items: dict[str, Any],
        ttl: int | None = None,
    ) -> int:
        """Set multiple values.

        Args:
            items: Dict of key -> value
            ttl: Time-to-live in seconds

        Returns:
            Number of items set
        """
        count = 0
        for key, value in items.items():
            if await self.set(key, value, ttl):
                count += 1
        return count

    # In-memory backend methods

    def _memory_get(self, key: str) -> Any | None:
        """Get from in-memory cache."""
        entry = self._memory_cache.get(key)
        if entry is None:
            return None
        if entry.is_expired():
            del self._memory_cache[key]
            return None
        return entry.value

    def _memory_set(self, key: str, value: Any, ttl: int | None) -> bool:
        """Set in in-memory cache."""
        expires_at = None
        if ttl is not None:
            expires_at = time.time() + ttl

        self._memory_cache[key] = CacheEntry(value=value, expires_at=expires_at)
        return True

    def _memory_delete(self, key: str) -> bool:
        """Delete from in-memory cache."""
        if key in self._memory_cache:
            del self._memory_cache[key]
            return True
        return False

    def _memory_clear(self, pattern: str | None) -> int:
        """Clear in-memory cache."""
        if pattern is None:
            count = len(self._memory_cache)
            self._memory_cache.clear()
            return count

        # Pattern matching (simple prefix matching)
        prefix = self._make_key(pattern.rstrip("*"))
        to_delete = [k for k in self._memory_cache if k.startswith(prefix)]
        for key in to_delete:
            del self._memory_cache[key]
        return len(to_delete)

    # Redis backend methods

    async def _redis_get(self, key: str) -> Any | None:
        """Get from Redis."""
        try:
            value = await self._redis_client.get(key)
            if value is None:
                return None
            return json.loads(value)
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None

    async def _redis_set(self, key: str, value: Any, ttl: int | None) -> bool:
        """Set in Redis."""
        try:
            serialized = json.dumps(value)
            if ttl:
                await self._redis_client.setex(key, ttl, serialized)
            else:
                await self._redis_client.set(key, serialized)
            return True
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False

    async def _redis_delete(self, key: str) -> bool:
        """Delete from Redis."""
        try:
            result = await self._redis_client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return False

    async def _redis_clear(self, pattern: str | None) -> int:
        """Clear Redis cache."""
        try:
            if pattern:
                full_pattern = self._make_key(pattern)
                keys = await self._redis_client.keys(full_pattern)
            else:
                keys = await self._redis_client.keys(f"{self.namespace}:*")

            if keys:
                return await self._redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis clear error: {e}")
            return 0

    async def cleanup_expired(self) -> int:
        """Clean up expired entries (in-memory only).

        Returns:
            Number of entries removed
        """
        if self._redis_client:
            return 0  # Redis handles expiry automatically

        expired = [k for k, v in self._memory_cache.items() if v.is_expired()]
        for key in expired:
            del self._memory_cache[key]

        if expired:
            logger.debug(f"Cleaned up {len(expired)} expired cache entries")

        return len(expired)


def get_cache() -> Cache:
    """Get the singleton cache instance."""
    return Cache()


def cache_key(*args: Any, **kwargs: Any) -> str:
    """Generate a cache key from arguments.

    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments

    Returns:
        Hash-based cache key
    """
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
    return hashlib.md5(key_data.encode()).hexdigest()


def cached(
    ttl: int | None = 300,
    prefix: str = "",
    key_builder: Callable[..., str] | None = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator for caching function results.

    Args:
        ttl: Cache TTL in seconds
        prefix: Key prefix
        key_builder: Custom key builder function

    Returns:
        Decorator function

    Example:
        @cached(ttl=300, prefix="user")
        async def get_user(user_id: str) -> User:
            return await db.get_user(user_id)
    """

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @functools.wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            cache = get_cache()

            # Build cache key
            if key_builder:
                key = key_builder(*args, **kwargs)
            else:
                func_name = func.__name__
                key_suffix = cache_key(*args, **kwargs)
                key = (
                    f"{prefix}:{func_name}:{key_suffix}" if prefix else f"{func_name}:{key_suffix}"
                )

            # Try cache
            cached_value = await cache.get(key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {key}")
                return cached_value

            # Execute function
            logger.debug(f"Cache miss: {key}")
            result = await func(*args, **kwargs)

            # Store in cache
            await cache.set(key, result, ttl)

            return result

        return wrapper

    return decorator
