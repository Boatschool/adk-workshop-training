"""Integration tests for multi-tenant isolation."""

import os
from uuid import uuid4

import pytest

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform"
)

from src.core.exceptions import TenantNotSetError
from src.core.tenancy import TenantContext


class TestTenantContextIsolation:
    """Tests for tenant context isolation."""

    def setup_method(self) -> None:
        """Clear tenant context before each test."""
        TenantContext.clear()

    def teardown_method(self) -> None:
        """Clear tenant context after each test."""
        TenantContext.clear()

    def test_tenant_context_isolation_between_requests(self) -> None:
        """Test that tenant context is isolated between requests."""
        # First request sets tenant A
        TenantContext.set("tenant-A")
        assert TenantContext.get() == "tenant-A"

        # Clear (simulating request end)
        TenantContext.clear()

        # Second request sets tenant B
        TenantContext.set("tenant-B")
        assert TenantContext.get() == "tenant-B"

        # Tenant A should not be accessible
        assert TenantContext.get() != "tenant-A"

    def test_tenant_context_not_shared_after_clear(self) -> None:
        """Test that tenant context is not shared after clearing."""
        TenantContext.set("shared-tenant")
        TenantContext.clear()

        # Should raise because context was cleared
        with pytest.raises(TenantNotSetError):
            TenantContext.get()

    def test_multiple_tenant_switches(self) -> None:
        """Test multiple tenant context switches."""
        tenants = ["tenant-1", "tenant-2", "tenant-3"]

        for tenant in tenants:
            TenantContext.set(tenant)
            assert TenantContext.get() == tenant


class TestSchemaNameGeneration:
    """Tests for tenant schema name generation."""

    def test_schema_name_uniqueness(self) -> None:
        """Test that different tenant IDs produce different schema names."""
        schema1 = TenantContext.get_schema_name("tenant-a")
        schema2 = TenantContext.get_schema_name("tenant-b")

        assert schema1 != schema2

    def test_schema_name_consistency(self) -> None:
        """Test that same tenant ID always produces same schema name."""
        tenant_id = "consistent-tenant"

        schema1 = TenantContext.get_schema_name(tenant_id)
        schema2 = TenantContext.get_schema_name(tenant_id)

        assert schema1 == schema2

    def test_schema_name_sql_safe(self) -> None:
        """Test that schema names are SQL-safe."""
        # Characters that could be problematic in SQL
        dangerous_ids = [
            "tenant; DROP TABLE users;--",
            "tenant'OR'1'='1",
            "tenant\"; DELETE FROM tenants; --",
            "tenant<script>alert('xss')</script>",
        ]

        for dangerous_id in dangerous_ids:
            schema = TenantContext.get_schema_name(dangerous_id)

            # Schema should not contain dangerous characters
            assert ";" not in schema
            assert "'" not in schema
            assert '"' not in schema
            assert "<" not in schema
            assert ">" not in schema
            assert "--" not in schema

            # Should only contain alphanumeric and underscore
            clean_part = schema.replace("adk_tenant_", "")
            for char in clean_part:
                assert char.isalnum() or char == "_", f"Invalid char: {char}"


class TestTenantIsolationRequirements:
    """Tests for tenant isolation requirements."""

    def test_tenant_required_for_protected_operations(self) -> None:
        """Test that protected operations require tenant context."""
        TenantContext.clear()

        # Operations that should require tenant context should raise
        with pytest.raises(TenantNotSetError):
            TenantContext.get()

    def test_tenant_optional_check_available(self) -> None:
        """Test that optional tenant check doesn't raise."""
        TenantContext.clear()

        # This should not raise
        result = TenantContext.get_optional()
        assert result is None


class TestCrossTenantAccess:
    """Tests to verify cross-tenant access is prevented."""

    def test_cannot_access_other_tenant_context(self) -> None:
        """Test that one tenant cannot access another's context."""
        # Set tenant A
        TenantContext.set("tenant-A")
        tenant_a_context = TenantContext.get()

        # Switch to tenant B
        TenantContext.set("tenant-B")
        tenant_b_context = TenantContext.get()

        # They should be different
        assert tenant_a_context != tenant_b_context

        # Current context should be B, not A
        assert TenantContext.get() == "tenant-B"
        assert TenantContext.get() != "tenant-A"

    def test_schema_names_isolated(self) -> None:
        """Test that schema names are properly isolated per tenant."""
        tenant_a_schema = TenantContext.get_schema_name("acme")
        tenant_b_schema = TenantContext.get_schema_name("techcorp")

        # Schemas should not overlap
        assert tenant_a_schema != tenant_b_schema

        # Each should contain the tenant identifier
        assert "acme" in tenant_a_schema
        assert "techcorp" in tenant_b_schema


class TestTenantContextEdgeCases:
    """Tests for edge cases in tenant context handling."""

    def setup_method(self) -> None:
        """Clear tenant context before each test."""
        TenantContext.clear()

    def teardown_method(self) -> None:
        """Clear tenant context after each test."""
        TenantContext.clear()

    def test_uuid_tenant_id(self) -> None:
        """Test that UUID-format tenant IDs work correctly."""
        uuid_tenant = str(uuid4())
        TenantContext.set(uuid_tenant)

        assert TenantContext.get() == uuid_tenant

    def test_schema_from_uuid(self) -> None:
        """Test schema generation from UUID tenant ID."""
        uuid_tenant = "123e4567-e89b-12d3-a456-426614174000"
        schema = TenantContext.get_schema_name(uuid_tenant)

        # Hyphens should be converted to underscores
        assert "-" not in schema
        assert "_" in schema

    def test_long_tenant_id(self) -> None:
        """Test handling of long tenant IDs."""
        long_tenant = "a" * 100
        TenantContext.set(long_tenant)

        assert TenantContext.get() == long_tenant

        schema = TenantContext.get_schema_name(long_tenant)
        assert len(schema) > 100  # prefix + tenant id

    def test_special_characters_in_tenant_id(self) -> None:
        """Test handling of special characters in tenant ID."""
        special_ids = [
            "tenant@domain.com",
            "tenant+tag",
            "tenant#hash",
            "tenant%percent",
        ]

        for special_id in special_ids:
            TenantContext.set(special_id)
            assert TenantContext.get() == special_id

            # Schema should sanitize special characters
            schema = TenantContext.get_schema_name(special_id)
            for char in "@+#%":
                assert char not in schema
