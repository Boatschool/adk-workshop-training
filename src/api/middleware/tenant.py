"""Tenant middleware for multi-tenant request handling."""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.tenancy import TenantContext


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract and set tenant context for each request.

    The tenant can be identified via:
    1. X-Tenant-ID header (preferred for API calls)
    2. Subdomain (e.g., acme.adk-platform.com -> tenant slug: acme)
    """

    async def dispatch(self, request: Request, call_next):
        """
        Process request and set tenant context.

        Args:
            request: Incoming request
            call_next: Next middleware/handler

        Returns:
            Response
        """
        tenant_id = None

        # Try to get tenant from header first
        tenant_id = request.headers.get("X-Tenant-ID")

        # TODO: If not in header, try to extract from subdomain
        # if not tenant_id:
        #     host = request.headers.get("host", "")
        #     subdomain = extract_subdomain(host)
        #     if subdomain:
        #         # Look up tenant by slug in database
        #         tenant_id = await get_tenant_id_by_slug(subdomain)

        # Set tenant context if found
        if tenant_id:
            TenantContext.set(tenant_id)

        try:
            response: Response = await call_next(request)
            return response
        finally:
            # Always clear tenant context after request
            TenantContext.clear()
