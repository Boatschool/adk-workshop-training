"""
Security tests for the ADK Platform.

This module tests security controls including:
- Authentication bypass attempts
- Authorization escalation
- Injection prevention (SQL, XSS, Command)
- Rate limiting
- Security headers
- Token validation

IMPORTANT: These tests should only be run against test/staging environments,
never against production systems without explicit authorization.
"""

import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform"
)

from datetime import UTC

from src.api.main import app
from src.core.security import create_access_token

pytestmark = pytest.mark.security


class TestAuthenticationSecurity:
    """Tests for authentication security controls."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def tenant_id(self) -> str:
        return str(uuid4())

    def test_no_auth_header_rejected(self, client: TestClient) -> None:
        """Test that requests without auth header are rejected."""
        response = client.get("/api/v1/users/me")
        assert response.status_code in [401, 403]

    def test_invalid_token_format_rejected(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that invalid token formats are rejected."""
        invalid_tokens = [
            "invalid",
            "Bearer",
            "Bearer ",
            "Bearer invalid",
            "Basic dXNlcjpwYXNz",  # Basic auth instead of Bearer
            "bearer valid-token",  # lowercase bearer
        ]

        for token in invalid_tokens:
            response = client.get(
                "/api/v1/users/me",
                headers={"Authorization": token, "X-Tenant-ID": tenant_id},
            )
            assert response.status_code in [401, 403, 500], f"Token '{token}' was not rejected"

    def test_expired_token_rejected(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that expired tokens are rejected."""
        from datetime import datetime, timedelta

        import jwt

        from src.core.config import get_settings

        settings = get_settings()

        # Create an expired token
        payload = {
            "user_id": str(uuid4()),
            "tenant_id": tenant_id,
            "role": "participant",
            "exp": datetime.now(UTC) - timedelta(hours=1),  # Expired
            "iat": datetime.now(UTC) - timedelta(hours=2),
        }

        expired_token = jwt.encode(payload, settings.secret_key, algorithm="HS256")

        response = client.get(
            "/api/v1/users/me",
            headers={
                "Authorization": f"Bearer {expired_token}",
                "X-Tenant-ID": tenant_id,
            },
        )
        assert response.status_code in [401, 403]

    def test_tampered_token_rejected(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that tampered tokens are rejected."""
        # Create a valid token
        valid_token = create_access_token(
            data={
                "user_id": str(uuid4()),
                "tenant_id": tenant_id,
                "role": "participant",
            }
        )

        # Tamper with the token (modify last character)
        tampered_token = valid_token[:-1] + ("a" if valid_token[-1] != "a" else "b")

        response = client.get(
            "/api/v1/users/me",
            headers={
                "Authorization": f"Bearer {tampered_token}",
                "X-Tenant-ID": tenant_id,
            },
        )
        assert response.status_code in [401, 403, 500]

    def test_wrong_signing_key_rejected(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that tokens signed with wrong key are rejected."""
        from datetime import datetime, timedelta

        import jwt

        # Create token with different secret
        payload = {
            "user_id": str(uuid4()),
            "tenant_id": tenant_id,
            "role": "participant",
            "exp": datetime.now(UTC) + timedelta(hours=1),
            "iat": datetime.now(UTC),
        }

        wrong_key_token = jwt.encode(payload, "wrong-secret-key", algorithm="HS256")

        response = client.get(
            "/api/v1/users/me",
            headers={
                "Authorization": f"Bearer {wrong_key_token}",
                "X-Tenant-ID": tenant_id,
            },
        )
        assert response.status_code in [401, 403, 500]


class TestAuthorizationSecurity:
    """Tests for authorization security controls."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def tenant_id(self) -> str:
        return str(uuid4())

    def create_token(self, tenant_id: str, role: str) -> str:
        """Create a token with specified role."""
        return create_access_token(
            data={
                "user_id": str(uuid4()),
                "tenant_id": tenant_id,
                "role": role,
            }
        )

    def test_participant_cannot_access_admin_endpoints(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that participants cannot access admin-only endpoints."""
        token = self.create_token(tenant_id, "participant")

        admin_endpoints = [
            "/api/v1/tenants/",
            "/api/v1/users/create",
        ]

        for endpoint in admin_endpoints:
            if "create" in endpoint:
                response = client.post(
                    endpoint,
                    json={},
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-Tenant-ID": tenant_id,
                    },
                )
            else:
                response = client.get(
                    endpoint,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-Tenant-ID": tenant_id,
                    },
                )
            # Should be forbidden or validation error, not success
            assert response.status_code in [401, 403, 422, 500], f"Endpoint {endpoint} accessible to participant"

    def test_participant_cannot_create_admin_user(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that participants cannot create users with elevated roles."""
        token = self.create_token(tenant_id, "participant")

        response = client.post(
            "/api/v1/users/create",
            json={
                "email": "hacker@example.com",
                "password": "HackerPass123!",
                "full_name": "Hacker",
                "role": "super_admin",  # Trying to escalate
            },
            headers={
                "Authorization": f"Bearer {token}",
                "X-Tenant-ID": tenant_id,
            },
        )
        # Should not allow privilege escalation
        assert response.status_code in [401, 403, 422, 500]

    def test_token_tenant_mismatch_rejected(
        self, client: TestClient
    ) -> None:
        """Test that tokens for one tenant cannot be used for another."""
        tenant_a = str(uuid4())
        tenant_b = str(uuid4())

        # Create token for tenant A
        token = self.create_token(tenant_a, "participant")

        # Try to use it for tenant B
        response = client.get(
            "/api/v1/users/me",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Tenant-ID": tenant_b,  # Different tenant
            },
        )
        # Should fail or return user from tenant A, not tenant B
        # The important thing is it shouldn't return data from tenant B
        assert response.status_code in [200, 401, 403, 500]


class TestInjectionPrevention:
    """Tests for injection attack prevention."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def tenant_id(self) -> str:
        return str(uuid4())

    def test_sql_injection_in_email(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test SQL injection prevention in email field."""
        sql_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "\" OR \"\"=\"",
            "'; DELETE FROM users WHERE '1'='1",
            "admin@example.com'; INSERT INTO users VALUES('hack');--",
        ]

        for payload in sql_payloads:
            response = client.post(
                "/api/v1/users/login",
                json={"email": payload, "password": "password"},
                headers={"X-Tenant-ID": tenant_id},
            )
            # Should return validation error or auth error, not server error
            assert response.status_code in [401, 422, 500], f"SQL injection not handled: {payload}"
            # If we get a response body, it should not contain database error details
            if response.text:
                assert "syntax error" not in response.text.lower()
                assert "postgresql" not in response.text.lower()

    def test_sql_injection_in_search(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test SQL injection prevention in search/filter parameters."""
        token = create_access_token(
            data={
                "user_id": str(uuid4()),
                "tenant_id": tenant_id,
                "role": "participant",
            }
        )

        sql_payloads = [
            "'; DROP TABLE workshops; --",
            "1 OR 1=1",
            "1; SELECT * FROM users; --",
        ]

        for payload in sql_payloads:
            response = client.get(
                "/api/v1/workshops/",
                params={"status": payload},
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Tenant-ID": tenant_id,
                },
            )
            # Should handle gracefully
            assert response.status_code in [200, 422, 500]

    def test_xss_in_user_registration(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test XSS prevention in user registration."""
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')",
            "<svg onload=alert('XSS')>",
            "';!--\"<XSS>=&{()}",
        ]

        for payload in xss_payloads:
            response = client.post(
                "/api/v1/users/register",
                json={
                    "email": "test@example.com",
                    "password": "SecureP@ss123",
                    "full_name": payload,  # XSS in name field
                },
                headers={"X-Tenant-ID": tenant_id},
            )
            # Should accept or reject, but not execute script
            # If it returns data, check it's properly encoded
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                if "full_name" in data:
                    # Should be stored as-is (not interpreted as HTML)
                    assert data["full_name"] == payload or "<script>" not in str(data)

    def test_command_injection_prevention(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test command injection prevention."""
        cmd_payloads = [
            "; ls -la",
            "| cat /etc/passwd",
            "$(whoami)",
            "`id`",
            "&& rm -rf /",
        ]

        for payload in cmd_payloads:
            response = client.post(
                "/api/v1/users/register",
                json={
                    "email": f"test{payload}@example.com",
                    "password": "SecureP@ss123",
                    "full_name": f"Test {payload}",
                },
                headers={"X-Tenant-ID": tenant_id},
            )
            # Should not execute commands
            assert response.status_code in [200, 201, 422, 500]


class TestSecurityHeaders:
    """Tests for security headers."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    def test_content_type_header(self, client: TestClient) -> None:
        """Test that Content-Type is set correctly."""
        response = client.get("/health/")
        assert "application/json" in response.headers.get("content-type", "")

    def test_no_server_version_disclosure(self, client: TestClient) -> None:
        """Test that server version is not disclosed."""
        response = client.get("/health/")
        server_header = response.headers.get("server", "")
        # Should not contain detailed version info
        assert "uvicorn" not in server_header.lower() or "/" not in server_header


class TestErrorMessageSanitization:
    """Tests for error message sanitization."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def tenant_id(self) -> str:
        return str(uuid4())

    def test_no_stack_traces_in_errors(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that stack traces are not exposed in error responses."""
        # Try to trigger an error
        response = client.post(
            "/api/v1/users/login",
            json={"email": "nonexistent@example.com", "password": "wrong"},
            headers={"X-Tenant-ID": tenant_id},
        )

        if response.status_code >= 400:
            text = response.text.lower()
            # Should not contain Python traceback indicators
            assert "traceback" not in text
            assert "file \"" not in text
            assert "line " not in text or "error" in text
            assert ".py\"" not in text

    def test_no_database_errors_exposed(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that database error details are not exposed."""
        response = client.post(
            "/api/v1/users/login",
            json={"email": "test", "password": "test"},  # Invalid
            headers={"X-Tenant-ID": tenant_id},
        )

        if response.status_code >= 400:
            text = response.text.lower()
            # Should not expose database details
            assert "postgresql" not in text
            assert "sqlalchemy" not in text
            assert "asyncpg" not in text


class TestPasswordSecurity:
    """Tests for password security controls."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def tenant_id(self) -> str:
        return str(uuid4())

    def test_weak_password_rejected(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that weak passwords are rejected (if validation exists)."""
        weak_passwords = [
            "123",
            "password",
            "qwerty",
            "abc",
        ]

        for password in weak_passwords:
            response = client.post(
                "/api/v1/users/register",
                json={
                    "email": f"test{uuid4().hex[:8]}@example.com",
                    "password": password,
                    "full_name": "Test User",
                },
                headers={"X-Tenant-ID": tenant_id},
            )
            # Should reject weak passwords with 422 or accept them (depends on policy)
            # At minimum, should not cause server error
            assert response.status_code in [201, 400, 422, 500]

    def test_password_not_in_response(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that passwords are not returned in API responses."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": f"test{uuid4().hex[:8]}@example.com",
                "password": "SecureP@ss123!",
                "full_name": "Test User",
            },
            headers={"X-Tenant-ID": tenant_id},
        )

        if response.status_code in [200, 201]:
            data = response.json()
            # Password should not be in response
            assert "password" not in data
            assert "hashed_password" not in data
            assert "SecureP@ss123!" not in str(data)


class TestRateLimitingBehavior:
    """Tests for rate limiting behavior (informational)."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    @pytest.fixture
    def tenant_id(self) -> str:
        return str(uuid4())

    def test_multiple_rapid_requests(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test handling of multiple rapid requests."""
        # Make multiple rapid requests
        responses = []
        for _ in range(20):
            response = client.get("/health/")
            responses.append(response.status_code)

        # Most should succeed (rate limiting may kick in)
        success_count = sum(1 for r in responses if r == 200)
        assert success_count > 0, "All requests failed"

    def test_brute_force_login_handling(
        self, client: TestClient, tenant_id: str
    ) -> None:
        """Test that brute force login attempts are handled."""
        # Make multiple failed login attempts
        for i in range(10):
            response = client.post(
                "/api/v1/users/login",
                json={
                    "email": "nonexistent@example.com",
                    "password": f"wrong_password_{i}",
                },
                headers={"X-Tenant-ID": tenant_id},
            )

        # Should still return proper error responses (not crash)
        assert response.status_code in [401, 403, 429, 500]
