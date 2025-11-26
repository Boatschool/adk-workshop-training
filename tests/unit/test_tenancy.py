"""Unit tests for multi-tenant context management."""

import pytest

from src.core.exceptions import TenantNotSetError
from src.core.tenancy import TenantContext


class TestTenantContext:
    """Tests for TenantContext class."""

    def setup_method(self) -> None:
        """Clear tenant context before each test."""
        TenantContext.clear()

    def teardown_method(self) -> None:
        """Clear tenant context after each test."""
        TenantContext.clear()

    def test_set_and_get_tenant_id(self) -> None:
        """Test setting and getting tenant ID."""
        tenant_id = "test-tenant-123"
        TenantContext.set(tenant_id)

        assert TenantContext.get() == tenant_id

    def test_get_raises_when_not_set(self) -> None:
        """Test that get() raises TenantNotSetError when context is not set."""
        with pytest.raises(TenantNotSetError) as exc_info:
            TenantContext.get()

        assert "Tenant context not initialized" in str(exc_info.value)

    def test_get_optional_returns_none_when_not_set(self) -> None:
        """Test that get_optional() returns None when context is not set."""
        result = TenantContext.get_optional()
        assert result is None

    def test_get_optional_returns_value_when_set(self) -> None:
        """Test that get_optional() returns the value when set."""
        tenant_id = "optional-tenant-456"
        TenantContext.set(tenant_id)

        result = TenantContext.get_optional()
        assert result == tenant_id

    def test_clear_resets_context(self) -> None:
        """Test that clear() resets the tenant context."""
        TenantContext.set("tenant-to-clear")
        assert TenantContext.get_optional() is not None

        TenantContext.clear()
        assert TenantContext.get_optional() is None

    def test_overwrite_tenant_id(self) -> None:
        """Test that setting a new tenant ID overwrites the previous one."""
        TenantContext.set("tenant-1")
        assert TenantContext.get() == "tenant-1"

        TenantContext.set("tenant-2")
        assert TenantContext.get() == "tenant-2"

    def test_empty_string_is_valid_tenant_id(self) -> None:
        """Test that an empty string is technically a valid tenant ID."""
        TenantContext.set("")
        # Empty string is falsy, so get() will raise
        with pytest.raises(TenantNotSetError):
            TenantContext.get()

    def test_get_optional_with_empty_string(self) -> None:
        """Test get_optional with empty string set."""
        TenantContext.set("")
        # Empty string is still returned by get_optional
        result = TenantContext.get_optional()
        assert result == ""


class TestTenantContextSchemaName:
    """Tests for schema name generation."""

    def test_get_schema_name_basic(self) -> None:
        """Test basic schema name generation."""
        schema = TenantContext.get_schema_name("acme")
        assert schema == "adk_tenant_acme"

    def test_get_schema_name_with_custom_prefix(self) -> None:
        """Test schema name with custom prefix."""
        schema = TenantContext.get_schema_name("corp", prefix="custom_")
        assert schema == "custom_corp"

    def test_get_schema_name_sanitizes_special_chars(self) -> None:
        """Test that special characters are replaced with underscores."""
        # Hyphens should be replaced
        schema = TenantContext.get_schema_name("my-tenant-id")
        assert schema == "adk_tenant_my_tenant_id"

        # Spaces and other special chars should be replaced
        schema = TenantContext.get_schema_name("tenant with spaces!")
        assert schema == "adk_tenant_tenant_with_spaces_"

    def test_get_schema_name_preserves_underscores(self) -> None:
        """Test that underscores are preserved."""
        schema = TenantContext.get_schema_name("tenant_with_underscores")
        assert schema == "adk_tenant_tenant_with_underscores"

    def test_get_schema_name_preserves_alphanumeric(self) -> None:
        """Test that alphanumeric characters are preserved."""
        schema = TenantContext.get_schema_name("Tenant123ABC")
        assert schema == "adk_tenant_Tenant123ABC"

    def test_get_schema_name_empty_tenant_id(self) -> None:
        """Test schema name with empty tenant ID."""
        schema = TenantContext.get_schema_name("")
        assert schema == "adk_tenant_"

    def test_get_schema_name_uuid_format(self) -> None:
        """Test schema name with UUID format tenant ID."""
        uuid = "123e4567-e89b-12d3-a456-426614174000"
        schema = TenantContext.get_schema_name(uuid)
        # Hyphens are replaced with underscores
        assert schema == "adk_tenant_123e4567_e89b_12d3_a456_426614174000"


class TestTenantContextIsolation:
    """Tests for tenant context isolation between tests."""

    def setup_method(self) -> None:
        """Clear context before each test."""
        TenantContext.clear()

    def teardown_method(self) -> None:
        """Clear context after each test."""
        TenantContext.clear()

    def test_context_isolation_test_1(self) -> None:
        """First isolation test - sets tenant A."""
        TenantContext.set("tenant-A")
        assert TenantContext.get() == "tenant-A"

    def test_context_isolation_test_2(self) -> None:
        """Second isolation test - context should be empty."""
        # This should be None because setup_method clears it
        assert TenantContext.get_optional() is None

    def test_context_isolation_test_3(self) -> None:
        """Third isolation test - sets tenant B."""
        TenantContext.set("tenant-B")
        assert TenantContext.get() == "tenant-B"
