"""Security headers middleware for API endpoints."""

from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.config import get_settings

settings = get_settings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses.

    These headers help protect against common web vulnerabilities:
    - XSS attacks
    - Clickjacking
    - MIME type sniffing
    - Man-in-the-middle attacks (via HSTS in production)
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Add security headers to the response.

        Args:
            request: The incoming request
            call_next: The next middleware or route handler

        Returns:
            Response with security headers added
        """
        response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking - deny all framing
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS filter in browsers (legacy, but still useful for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Prevent caching of sensitive data
        # Only apply to API responses, not static assets
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
            response.headers["Pragma"] = "no-cache"

        # Content Security Policy - restrict resource loading
        # Allows 'self' for scripts/styles, and data: for images (common in APIs)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "frame-ancestors 'none'"
        )

        # Referrer Policy - limit referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy - disable unnecessary browser features
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=()"
        )

        # HSTS - only in production to enforce HTTPS
        # max-age=31536000 = 1 year
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        return response
