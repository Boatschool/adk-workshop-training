"""Multi-tenant context management"""

from contextvars import ContextVar

from src.core.exceptions import TenantNotSetError

# Thread-safe tenant context
_tenant_context: ContextVar[str | None] = ContextVar("tenant_id", default=None)


class TenantContext:
    """Manage tenant context across async requests"""

    @staticmethod
    def set(tenant_id: str) -> None:
        """Set the current tenant ID"""
        _tenant_context.set(tenant_id)

    @staticmethod
    def get() -> str:
        """Get the current tenant ID"""
        tenant_id = _tenant_context.get()
        if not tenant_id:
            raise TenantNotSetError("Tenant context not initialized")
        return tenant_id

    @staticmethod
    def get_optional() -> str | None:
        """Get the current tenant ID without raising an exception"""
        return _tenant_context.get()

    @staticmethod
    def clear() -> None:
        """Clear the tenant context"""
        _tenant_context.set(None)

    @staticmethod
    def get_schema_name(tenant_id: str, prefix: str = "adk_tenant_") -> str:
        """Get the database schema name for a tenant"""
        # Sanitize tenant ID to be SQL-safe (alphanumeric + underscore only)
        safe_tenant_id = "".join(c if c.isalnum() or c == "_" else "_" for c in tenant_id)
        return f"{prefix}{safe_tenant_id}"
