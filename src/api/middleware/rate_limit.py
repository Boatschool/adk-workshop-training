"""Rate limiting middleware for API endpoints."""

import time
from collections import defaultdict
from typing import Callable

from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.config import get_settings

settings = get_settings()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using in-memory storage.

    For production, consider using Redis for distributed rate limiting.
    """

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request with rate limiting.

        Args:
            request: The incoming request
            call_next: The next middleware or route handler

        Returns:
            Response from the next handler

        Raises:
            HTTPException: 429 if rate limit exceeded
        """
        # Get client identifier (IP address)
        client_ip = request.client.host if request.client else "unknown"

        # Use different rate limits for auth endpoints
        if request.url.path.startswith("/api/v1/users/login") or request.url.path.startswith(
            "/api/v1/users/register"
        ):
            rate_limit = settings.rate_limit_auth_requests_per_minute
        else:
            rate_limit = self.requests_per_minute

        # Get current time
        now = time.time()

        # Clean old requests (older than 60 seconds)
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip] if now - req_time < 60
        ]

        # Check if rate limit exceeded
        if len(self.requests[client_ip]) >= rate_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {rate_limit} requests per minute allowed.",
                headers={"Retry-After": "60"},
            )

        # Add current request timestamp
        self.requests[client_ip].append(now)

        # Process request
        response = await call_next(request)
        return response
