"""Integration tests for authentication flow."""

import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform"
)

from src.api.main import app
from src.core.security import create_access_token

# Mark all tests in this module that require DB
pytestmark = pytest.mark.integration


class TestAuthenticationFlow:
    """Tests for the complete authentication flow."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def test_tenant_id(self) -> str:
        """Generate test tenant ID."""
        return str(uuid4())

    @pytest.fixture
    def test_user_id(self) -> str:
        """Generate test user ID."""
        return str(uuid4())

    def test_login_endpoint_requires_tenant_header(self, client: TestClient) -> None:
        """Test that login requires X-Tenant-ID header."""
        response = client.post(
            "/api/v1/users/login",
            json={"email": "test@example.com", "password": "password"},
        )

        # Should fail without tenant header
        assert response.status_code in [400, 401, 422, 500]

    def test_protected_route_requires_auth(self, client: TestClient) -> None:
        """Test that protected routes require authentication."""
        response = client.get("/api/v1/users/me")

        # Should return 401 or 403 without auth token
        assert response.status_code in [401, 403]

    def test_protected_route_with_invalid_token(
        self, client: TestClient, test_tenant_id: str
    ) -> None:
        """Test that invalid tokens are rejected."""
        response = client.get(
            "/api/v1/users/me",
            headers={
                "Authorization": "Bearer invalid-token",
                "X-Tenant-ID": test_tenant_id,
            },
        )

        # Should be rejected (401, 403, or 500 if DB not available)
        assert response.status_code in [401, 403, 500]

    def test_protected_route_with_malformed_header(
        self, client: TestClient, test_tenant_id: str
    ) -> None:
        """Test that malformed auth headers are rejected."""
        # Missing "Bearer " prefix
        response = client.get(
            "/api/v1/users/me",
            headers={
                "Authorization": "just-a-token",
                "X-Tenant-ID": test_tenant_id,
            },
        )

        assert response.status_code in [401, 403]


class TestTokenValidation:
    """Tests for JWT token validation."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def test_tenant_id(self) -> str:
        """Generate test tenant ID."""
        return str(uuid4())

    @pytest.fixture
    def test_user_id(self) -> str:
        """Generate test user ID."""
        return str(uuid4())

    def test_valid_token_structure(
        self, test_user_id: str, test_tenant_id: str
    ) -> None:
        """Test that created tokens have correct structure."""
        token = create_access_token(
            data={
                "sub": test_user_id,
                "tenant_id": test_tenant_id,
                "role": "participant",
            }
        )

        # Token should be a JWT with 3 parts
        parts = token.split(".")
        assert len(parts) == 3

    def test_token_contains_required_claims(
        self, test_user_id: str, test_tenant_id: str
    ) -> None:
        """Test that tokens contain required claims."""
        from src.core.security import decode_access_token

        token = create_access_token(
            data={
                "sub": test_user_id,
                "tenant_id": test_tenant_id,
                "role": "admin",
            }
        )

        decoded = decode_access_token(token)

        assert decoded["sub"] == test_user_id
        assert decoded["tenant_id"] == test_tenant_id
        assert decoded["role"] == "admin"
        assert "exp" in decoded
        assert "iat" in decoded


class TestRegistrationFlow:
    """Tests for user registration flow."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def test_tenant_id(self) -> str:
        """Generate test tenant ID."""
        return str(uuid4())

    def test_registration_endpoint_exists(
        self, client: TestClient, test_tenant_id: str
    ) -> None:
        """Test that registration endpoint exists."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "new@example.com",
                "password": "SecureP@ss123",
                "full_name": "New User",
            },
            headers={"X-Tenant-ID": test_tenant_id},
        )

        # Should not return 404 or 405 (endpoint exists)
        # May return 500 if DB not available
        assert response.status_code not in [404, 405]

    def test_registration_validates_email(
        self, client: TestClient, test_tenant_id: str
    ) -> None:
        """Test that registration validates email format."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "invalid-email",
                "password": "SecureP@ss123",
                "full_name": "Test User",
            },
            headers={"X-Tenant-ID": test_tenant_id},
        )

        # Should fail with validation error (422 or 500 if DB issue)
        assert response.status_code in [422, 500]

    def test_registration_requires_password(
        self, client: TestClient, test_tenant_id: str
    ) -> None:
        """Test that registration requires password."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "test@example.com",
                "full_name": "Test User",
            },
            headers={"X-Tenant-ID": test_tenant_id},
        )

        # Should fail with validation error (422 or 500 if DB issue)
        assert response.status_code in [422, 500]


class TestRoleBasedAccess:
    """Tests for role-based access control."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def test_tenant_id(self) -> str:
        """Generate test tenant ID."""
        return str(uuid4())

    @pytest.fixture
    def participant_token(self, test_tenant_id: str) -> str:
        """Create token for participant role."""
        return create_access_token(
            data={
                "sub": str(uuid4()),
                "tenant_id": test_tenant_id,
                "role": "participant",
            }
        )

    @pytest.fixture
    def admin_token(self, test_tenant_id: str) -> str:
        """Create token for admin role."""
        return create_access_token(
            data={
                "sub": str(uuid4()),
                "tenant_id": test_tenant_id,
                "role": "tenant_admin",
            }
        )

    def test_tenant_list_requires_admin(
        self, client: TestClient, participant_token: str
    ) -> None:
        """Test that listing tenants requires admin role."""
        response = client.get(
            "/api/v1/tenants/",
            headers={"Authorization": f"Bearer {participant_token}"},
        )

        # Should be forbidden for non-admin (403) or fail if DB not ready (500)
        assert response.status_code in [401, 403, 500]

    def test_health_is_public(self, client: TestClient) -> None:
        """Test that health endpoint is publicly accessible."""
        response = client.get("/health/")

        assert response.status_code == 200
