"""Integration tests for health check API routes."""

import os

import pytest
from fastapi.testclient import TestClient

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform"
)

from src.api.main import app

# Mark tests that require DB
pytestmark = pytest.mark.integration


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    def test_health_check(self, client: TestClient) -> None:
        """Test the basic health check endpoint."""
        response = client.get("/health/")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data

    def test_health_check_returns_service_info(self, client: TestClient) -> None:
        """Test that health check returns service information."""
        response = client.get("/health/")

        data = response.json()
        assert data["service"] == "adk-platform-api"
        assert data["version"] is not None


class TestReadinessEndpoint:
    """Tests for readiness probe endpoint."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    def test_readiness_endpoint_exists(self, client: TestClient) -> None:
        """Test that readiness endpoint exists."""
        response = client.get("/health/ready")

        # Should return 200 if DB is connected, 503 if not
        assert response.status_code in [200, 503]

    def test_readiness_returns_status(self, client: TestClient) -> None:
        """Test that readiness endpoint returns status field."""
        response = client.get("/health/ready")

        data = response.json()
        assert "status" in data
        # Status could be "ready" (DB connected), "not ready" (DB not connected)
        # or other values depending on implementation
        assert isinstance(data["status"], str)


class TestOpenAPIEndpoints:
    """Tests for OpenAPI documentation endpoints."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create a test client."""
        return TestClient(app)

    def test_openapi_docs_available(self, client: TestClient) -> None:
        """Test that Swagger UI docs are available."""
        response = client.get("/docs")

        assert response.status_code == 200

    def test_openapi_json_available(self, client: TestClient) -> None:
        """Test that OpenAPI JSON schema is available."""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
        assert "info" in data

    def test_openapi_schema_contains_health_routes(self, client: TestClient) -> None:
        """Test that OpenAPI schema includes health routes."""
        response = client.get("/openapi.json")

        data = response.json()
        paths = data["paths"]
        assert "/health/" in paths
        assert "/health/ready" in paths

    def test_redoc_available(self, client: TestClient) -> None:
        """Test that ReDoc is available."""
        response = client.get("/redoc")

        assert response.status_code == 200
