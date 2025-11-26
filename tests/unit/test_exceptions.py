"""Unit tests for custom exceptions."""

import pytest

from src.core.exceptions import (
    ADKPlatformException,
    AuthenticationError,
    AuthorizationError,
    DatabaseError,
    NotFoundError,
    ResourceNotFoundError,
    TenantNotFoundError,
    TenantNotSetError,
    ValidationError,
)


class TestADKPlatformException:
    """Tests for the base exception class."""

    def test_base_exception_with_defaults(self) -> None:
        """Test base exception with default status code."""
        exc = ADKPlatformException("Test error")
        assert exc.message == "Test error"
        assert exc.status_code == 500
        assert str(exc) == "Test error"

    def test_base_exception_with_custom_status(self) -> None:
        """Test base exception with custom status code."""
        exc = ADKPlatformException("Custom error", status_code=418)
        assert exc.message == "Custom error"
        assert exc.status_code == 418


class TestTenantNotFoundError:
    """Tests for TenantNotFoundError."""

    def test_tenant_not_found_error(self) -> None:
        """Test tenant not found exception formatting."""
        exc = TenantNotFoundError("tenant-123")
        assert exc.message == "Tenant not found: tenant-123"
        assert exc.status_code == 404


class TestTenantNotSetError:
    """Tests for TenantNotSetError."""

    def test_tenant_not_set_with_default_message(self) -> None:
        """Test tenant not set with default message."""
        exc = TenantNotSetError()
        assert exc.message == "Tenant context not initialized"
        assert exc.status_code == 500

    def test_tenant_not_set_with_custom_message(self) -> None:
        """Test tenant not set with custom message."""
        exc = TenantNotSetError("Custom tenant error")
        assert exc.message == "Custom tenant error"
        assert exc.status_code == 500


class TestAuthenticationError:
    """Tests for AuthenticationError."""

    def test_auth_error_with_default_message(self) -> None:
        """Test authentication error with default message."""
        exc = AuthenticationError()
        assert exc.message == "Authentication failed"
        assert exc.status_code == 401

    def test_auth_error_with_custom_message(self) -> None:
        """Test authentication error with custom message."""
        exc = AuthenticationError("Invalid credentials")
        assert exc.message == "Invalid credentials"
        assert exc.status_code == 401


class TestAuthorizationError:
    """Tests for AuthorizationError."""

    def test_authz_error_with_default_message(self) -> None:
        """Test authorization error with default message."""
        exc = AuthorizationError()
        assert exc.message == "Insufficient permissions"
        assert exc.status_code == 403

    def test_authz_error_with_custom_message(self) -> None:
        """Test authorization error with custom message."""
        exc = AuthorizationError("Admin access required")
        assert exc.message == "Admin access required"
        assert exc.status_code == 403


class TestResourceNotFoundError:
    """Tests for ResourceNotFoundError."""

    def test_resource_not_found_error(self) -> None:
        """Test resource not found exception formatting."""
        exc = ResourceNotFoundError("Workshop", "ws-456")
        assert exc.message == "Workshop not found: ws-456"
        assert exc.status_code == 404


class TestNotFoundError:
    """Tests for generic NotFoundError."""

    def test_not_found_error(self) -> None:
        """Test generic not found exception."""
        exc = NotFoundError("Item does not exist")
        assert exc.message == "Item does not exist"
        assert exc.status_code == 404


class TestValidationError:
    """Tests for ValidationError."""

    def test_validation_error(self) -> None:
        """Test validation exception."""
        exc = ValidationError("Email format is invalid")
        assert exc.message == "Email format is invalid"
        assert exc.status_code == 400


class TestDatabaseError:
    """Tests for DatabaseError."""

    def test_database_error(self) -> None:
        """Test database exception formatting."""
        exc = DatabaseError("Connection refused")
        assert exc.message == "Database error: Connection refused"
        assert exc.status_code == 500


class TestExceptionInheritance:
    """Tests for exception inheritance."""

    def test_all_exceptions_inherit_from_base(self) -> None:
        """Test that all custom exceptions inherit from ADKPlatformException."""
        exceptions = [
            TenantNotFoundError("t1"),
            TenantNotSetError(),
            AuthenticationError(),
            AuthorizationError(),
            ResourceNotFoundError("User", "u1"),
            NotFoundError("Not found"),
            ValidationError("Invalid"),
            DatabaseError("Error"),
        ]

        for exc in exceptions:
            assert isinstance(exc, ADKPlatformException)
            assert isinstance(exc, Exception)

    def test_exceptions_can_be_caught_by_base(self) -> None:
        """Test that exceptions can be caught by base class."""
        with pytest.raises(ADKPlatformException) as exc_info:
            raise AuthenticationError("Test")

        assert exc_info.value.status_code == 401
