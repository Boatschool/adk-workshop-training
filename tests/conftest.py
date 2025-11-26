"""Pytest configuration and fixtures for the ADK Platform test suite."""

import asyncio
import os
from collections.abc import AsyncGenerator, Generator
from typing import Any
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set test environment variables BEFORE importing app modules
os.environ["APP_ENV"] = "development"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform_test"
)
os.environ["GOOGLE_API_KEY"] = "test-api-key"

from src.api.main import app
from src.core.config import Settings, get_settings
from src.core.tenancy import TenantContext
from src.db.session import get_db


# ============================================================================
# Test Settings
# ============================================================================


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Provide test settings with in-memory/test database."""
    return Settings(
        app_env="development",
        secret_key="test-secret-key-for-testing-only-not-for-production",
        database_url="postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform_test",
        google_api_key="test-api-key",
        jwt_access_token_expire_minutes=60,
    )


# ============================================================================
# Event Loop Configuration
# ============================================================================
# Note: pytest-asyncio handles the event loop automatically when asyncio_mode = "auto"
# No custom event_loop fixture needed


# ============================================================================
# Database Fixtures
# ============================================================================


@pytest_asyncio.fixture(scope="function")
async def db_engine(test_settings: Settings) -> AsyncGenerator[Any, None]:
    """Create a test database engine."""
    engine = create_async_engine(
        test_settings.database_url,
        echo=False,
        pool_pre_ping=True,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine: Any) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session with transaction rollback."""
    async_session_factory = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    async with async_session_factory() as session:
        # Set search path to shared schema for tests
        await session.execute(
            text("SET search_path TO adk_platform_shared, public")
        )
        yield session
        # Rollback any changes made during the test
        await session.rollback()


# ============================================================================
# Tenant Fixtures
# ============================================================================


@pytest.fixture
def test_tenant_id() -> str:
    """Provide a test tenant ID."""
    return str(uuid4())


@pytest.fixture
def test_tenant_slug() -> str:
    """Provide a test tenant slug."""
    return "test_tenant"


@pytest.fixture
def test_tenant_schema() -> str:
    """Provide a test tenant schema name."""
    return "adk_tenant_test_tenant"


@pytest.fixture
def tenant_context(test_tenant_id: str) -> Generator[None, None, None]:
    """Set up tenant context for tests."""
    TenantContext.set(test_tenant_id)
    yield
    TenantContext.clear()


# ============================================================================
# User Fixtures
# ============================================================================


@pytest.fixture
def test_user_id() -> str:
    """Provide a test user ID."""
    return str(uuid4())


@pytest.fixture
def test_user_data() -> dict[str, Any]:
    """Provide test user data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "full_name": "Test User",
        "role": "participant",
    }


@pytest.fixture
def test_admin_data() -> dict[str, Any]:
    """Provide test admin user data."""
    return {
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "full_name": "Admin User",
        "role": "tenant_admin",
    }


# ============================================================================
# JWT Token Fixtures
# ============================================================================


@pytest.fixture
def test_jwt_payload(test_user_id: str, test_tenant_id: str) -> dict[str, Any]:
    """Provide a test JWT payload."""
    return {
        "sub": test_user_id,
        "tenant_id": test_tenant_id,
        "role": "participant",
    }


@pytest.fixture
def test_admin_jwt_payload(test_user_id: str, test_tenant_id: str) -> dict[str, Any]:
    """Provide a test admin JWT payload."""
    return {
        "sub": test_user_id,
        "tenant_id": test_tenant_id,
        "role": "tenant_admin",
    }


# ============================================================================
# FastAPI Client Fixtures
# ============================================================================


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Provide a synchronous test client."""
    with TestClient(app) as client:
        yield client


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Provide an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def authenticated_client(
    async_client: AsyncClient,
    test_tenant_id: str,
) -> AsyncGenerator[AsyncClient, None]:
    """Provide an authenticated async test client."""
    # Create a mock token for testing
    from src.core.security import create_access_token

    token = create_access_token(
        data={
            "sub": str(uuid4()),
            "tenant_id": test_tenant_id,
            "role": "participant",
        }
    )

    async_client.headers["Authorization"] = f"Bearer {token}"
    async_client.headers["X-Tenant-ID"] = test_tenant_id

    yield async_client


# ============================================================================
# Mock Fixtures
# ============================================================================


@pytest.fixture
def mock_db_session() -> MagicMock:
    """Provide a mock database session."""
    mock = MagicMock(spec=AsyncSession)
    mock.commit = MagicMock(return_value=asyncio.coroutine(lambda: None)())
    mock.refresh = MagicMock(return_value=asyncio.coroutine(lambda x: None)())
    mock.rollback = MagicMock(return_value=asyncio.coroutine(lambda: None)())
    return mock


@pytest.fixture
def mock_settings() -> Settings:
    """Provide mock settings for unit tests."""
    return Settings(
        app_env="development",
        secret_key="mock-secret-key-for-testing",
        database_url="postgresql+asyncpg://test:test@localhost:5433/test",
        google_api_key="mock-api-key",
    )


# ============================================================================
# Helper Functions
# ============================================================================


def create_test_token(
    user_id: str,
    tenant_id: str,
    role: str = "participant",
) -> str:
    """Create a test JWT token."""
    from src.core.security import create_access_token

    return create_access_token(
        data={
            "sub": user_id,
            "tenant_id": tenant_id,
            "role": role,
        }
    )
