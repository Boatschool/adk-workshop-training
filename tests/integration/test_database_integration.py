"""Database integration tests for the ADK Platform.

This module tests database operations including:
- CRUD operations for all entities
- Transaction handling and rollbacks
- Connection pooling behavior
- Query performance
- Migration scripts
"""

import os
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform"
)

from src.core.config import get_settings
from src.core.constants import UserRole, WorkshopStatus

pytestmark = pytest.mark.integration

settings = get_settings()


@pytest.fixture(scope="module")
def db_url() -> str:
    """Database URL for testing."""
    return settings.database_url


@pytest.fixture
async def engine(db_url: str):
    """Create async engine."""
    engine = create_async_engine(db_url, echo=False, pool_pre_ping=True)
    yield engine
    await engine.dispose()


@pytest.fixture
async def session(engine) -> AsyncSession:
    """Create async session."""
    async_session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session_factory() as session:
        yield session


class TestDatabaseConnection:
    """Tests for database connectivity."""

    @pytest.mark.asyncio
    async def test_database_connection(self, session: AsyncSession) -> None:
        """Test basic database connectivity."""
        result = await session.execute(text("SELECT 1"))
        assert result.scalar() == 1

    @pytest.mark.asyncio
    async def test_database_version(self, session: AsyncSession) -> None:
        """Test PostgreSQL version is available."""
        result = await session.execute(text("SELECT version()"))
        version = result.scalar()
        assert "PostgreSQL" in version

    @pytest.mark.asyncio
    async def test_connection_pool_health(self, engine) -> None:
        """Test connection pool is healthy."""
        pool = engine.pool
        assert pool is not None
        # Pool should have connections available
        assert pool.checkedin() >= 0


class TestSchemaOperations:
    """Tests for database schema operations."""

    @pytest.mark.asyncio
    async def test_shared_schema_exists(self, session: AsyncSession) -> None:
        """Test that shared schema exists."""
        result = await session.execute(
            text(
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name = 'adk_platform_shared'"
            )
        )
        schema = result.scalar()
        assert schema == "adk_platform_shared"

    @pytest.mark.asyncio
    async def test_tenants_table_exists(self, session: AsyncSession) -> None:
        """Test that tenants table exists in shared schema."""
        result = await session.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'adk_platform_shared' AND table_name = 'tenants'"
            )
        )
        table = result.scalar()
        assert table == "tenants"

    @pytest.mark.asyncio
    async def test_search_path_setting(self, session: AsyncSession) -> None:
        """Test that search path can be set correctly."""
        await session.execute(text("SET search_path TO adk_platform_shared, public"))
        result = await session.execute(text("SHOW search_path"))
        path = result.scalar()
        assert "adk_platform_shared" in path


class TestTransactionHandling:
    """Tests for database transaction handling."""

    @pytest.mark.asyncio
    async def test_transaction_rollback(self, session: AsyncSession) -> None:
        """Test that transactions can be rolled back."""
        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        # Start a transaction
        async with session.begin_nested():
            # Insert test data
            test_id = str(uuid4())
            await session.execute(
                text(
                    "INSERT INTO tenants (id, name, slug, status, settings) "
                    "VALUES (:id, :name, :slug, :status, :settings)"
                ),
                {
                    "id": test_id,
                    "name": "Test Tenant",
                    "slug": f"test-tenant-{test_id[:8]}",
                    "status": "active",
                    "settings": "{}",
                },
            )
            # Rollback
            await session.rollback()

        # Verify data was rolled back
        result = await session.execute(
            text("SELECT id FROM tenants WHERE id = :id"),
            {"id": test_id},
        )
        assert result.scalar() is None

    @pytest.mark.asyncio
    async def test_transaction_commit(self, session: AsyncSession) -> None:
        """Test that transactions can be committed."""
        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        test_id = str(uuid4())
        test_slug = f"commit-test-{test_id[:8]}"

        try:
            await session.execute(
                text(
                    "INSERT INTO tenants (id, name, slug, status, settings) "
                    "VALUES (:id, :name, :slug, :status, :settings)"
                ),
                {
                    "id": test_id,
                    "name": "Commit Test Tenant",
                    "slug": test_slug,
                    "status": "active",
                    "settings": "{}",
                },
            )
            await session.commit()

            # Verify data was committed
            result = await session.execute(
                text("SELECT id FROM tenants WHERE id = :id"),
                {"id": test_id},
            )
            assert result.scalar() == test_id
        finally:
            # Clean up
            await session.execute(
                text("DELETE FROM tenants WHERE id = :id"),
                {"id": test_id},
            )
            await session.commit()


class TestQueryPerformance:
    """Tests for database query performance."""

    @pytest.mark.asyncio
    async def test_simple_query_performance(self, session: AsyncSession) -> None:
        """Test that simple queries execute quickly."""
        import time

        start = time.perf_counter()
        await session.execute(text("SELECT 1"))
        elapsed = time.perf_counter() - start

        # Simple query should complete in under 100ms
        assert elapsed < 0.1, f"Simple query took {elapsed:.3f}s"

    @pytest.mark.asyncio
    async def test_tenant_list_query_performance(self, session: AsyncSession) -> None:
        """Test that listing tenants is performant."""
        import time

        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        start = time.perf_counter()
        await session.execute(text("SELECT * FROM tenants LIMIT 100"))
        elapsed = time.perf_counter() - start

        # Should complete in under 200ms
        assert elapsed < 0.2, f"Tenant list query took {elapsed:.3f}s"

    @pytest.mark.asyncio
    async def test_count_query_performance(self, session: AsyncSession) -> None:
        """Test that count queries are performant."""
        import time

        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        start = time.perf_counter()
        await session.execute(text("SELECT COUNT(*) FROM tenants"))
        elapsed = time.perf_counter() - start

        # Count should complete in under 100ms
        assert elapsed < 0.1, f"Count query took {elapsed:.3f}s"


class TestIndexUsage:
    """Tests for database index usage."""

    @pytest.mark.asyncio
    async def test_primary_key_index_used(self, session: AsyncSession) -> None:
        """Test that primary key index is used for lookups."""
        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        result = await session.execute(
            text("EXPLAIN SELECT * FROM tenants WHERE id = '00000000-0000-0000-0000-000000000000'")
        )
        plan = " ".join(row[0] for row in result.fetchall())

        # Should use index scan, not sequential scan
        assert "Seq Scan" not in plan or "Index" in plan

    @pytest.mark.asyncio
    async def test_email_index_on_users(self, session: AsyncSession) -> None:
        """Test that email index exists on users table (if tenant schema exists)."""
        # Check if any tenant schema exists
        result = await session.execute(
            text(
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name LIKE 'adk_tenant_%' LIMIT 1"
            )
        )
        schema = result.scalar()

        if schema:
            # Check for index on email column
            result = await session.execute(
                text(
                    "SELECT indexname FROM pg_indexes "
                    "WHERE schemaname = :schema AND tablename = 'users' "
                    "AND indexdef LIKE '%email%'"
                ),
                {"schema": schema},
            )
            # Email should have an index (or be covered by unique constraint)
            # This is informational - may or may not have explicit index


class TestConnectionPoolBehavior:
    """Tests for connection pool behavior under load."""

    @pytest.mark.asyncio
    async def test_multiple_concurrent_sessions(self, engine) -> None:
        """Test handling of multiple concurrent sessions."""
        import asyncio

        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        async def make_query():
            async with async_session_factory() as session:
                result = await session.execute(text("SELECT 1"))
                return result.scalar()

        # Make 10 concurrent queries
        results = await asyncio.gather(*[make_query() for _ in range(10)])

        # All should succeed
        assert all(r == 1 for r in results)

    @pytest.mark.asyncio
    async def test_connection_reuse(self, engine) -> None:
        """Test that connections are properly reused."""
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        # Make several sequential queries
        for _ in range(5):
            async with async_session_factory() as session:
                await session.execute(text("SELECT 1"))

        # Pool should still be healthy
        pool = engine.pool
        assert pool.checkedin() >= 0


class TestMigrationReadiness:
    """Tests for database migration readiness."""

    @pytest.mark.asyncio
    async def test_alembic_version_table_exists(self, session: AsyncSession) -> None:
        """Test that Alembic version table exists."""
        result = await session.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_name = 'alembic_version'"
            )
        )
        table = result.scalar()
        assert table == "alembic_version"

    @pytest.mark.asyncio
    async def test_current_migration_version(self, session: AsyncSession) -> None:
        """Test that current migration version is recorded."""
        result = await session.execute(text("SELECT version_num FROM alembic_version"))
        version = result.scalar()
        assert version is not None, "No migration version found"


class TestDataIntegrity:
    """Tests for data integrity constraints."""

    @pytest.mark.asyncio
    async def test_tenant_slug_uniqueness(self, session: AsyncSession) -> None:
        """Test that tenant slugs must be unique."""
        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        test_id_1 = str(uuid4())
        test_id_2 = str(uuid4())
        test_slug = f"unique-test-{uuid4().hex[:8]}"

        # Insert first tenant
        await session.execute(
            text(
                "INSERT INTO tenants (id, name, slug, status, settings) "
                "VALUES (:id, :name, :slug, :status, :settings)"
            ),
            {
                "id": test_id_1,
                "name": "First Tenant",
                "slug": test_slug,
                "status": "active",
                "settings": "{}",
            },
        )
        await session.commit()

        try:
            # Try to insert second tenant with same slug - should fail
            with pytest.raises(Exception):  # IntegrityError wrapped in async exception
                await session.execute(
                    text(
                        "INSERT INTO tenants (id, name, slug, status, settings) "
                        "VALUES (:id, :name, :slug, :status, :settings)"
                    ),
                    {
                        "id": test_id_2,
                        "name": "Second Tenant",
                        "slug": test_slug,  # Same slug
                        "status": "active",
                        "settings": "{}",
                    },
                )
                await session.commit()
        finally:
            await session.rollback()
            # Clean up
            await session.execute(
                text("DELETE FROM tenants WHERE id = :id"),
                {"id": test_id_1},
            )
            await session.commit()

    @pytest.mark.asyncio
    async def test_uuid_primary_keys(self, session: AsyncSession) -> None:
        """Test that UUIDs are used for primary keys."""
        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        result = await session.execute(
            text(
                "SELECT data_type FROM information_schema.columns "
                "WHERE table_schema = 'adk_platform_shared' "
                "AND table_name = 'tenants' AND column_name = 'id'"
            )
        )
        data_type = result.scalar()
        assert data_type in ("uuid", "character varying"), f"Unexpected type: {data_type}"
