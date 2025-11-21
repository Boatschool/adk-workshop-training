"""
Utilities Module.

Provides shared utility functions and services:
- Caching (Redis/in-memory)
- Logging configuration
- Monitoring/metrics helpers
"""

from src.utils.cache import (
    Cache,
    get_cache,
    cached,
    cache_key,
)

__all__ = [
    "Cache",
    "get_cache",
    "cached",
    "cache_key",
]
