"""
Utilities Module.

Provides shared utility functions and services:
- Caching (Redis/in-memory)
- Logging configuration
- Monitoring/metrics helpers
"""

from src.utils.cache import (
    Cache,
    cache_key,
    cached,
    get_cache,
)

__all__ = [
    "Cache",
    "get_cache",
    "cached",
    "cache_key",
]
