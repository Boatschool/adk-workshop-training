"""Database session management"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.core.config import get_settings
from src.core.tenancy import TenantContext

# Global engine and session factory
_engine: AsyncEngine | None = None
_async_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Get or create the database engine"""
    global _engine

    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url,
            echo=settings.app_debug,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_pre_ping=True,  # Verify connections before using
        )

    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get or create the session factory"""
    global _async_session_factory

    if _async_session_factory is None:
        engine = get_engine()
        _async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )

    return _async_session_factory


async def set_tenant_schema(session: AsyncSession, schema_name: str) -> None:
    """
    Set the PostgreSQL search_path to use the tenant's schema.

    This ensures all queries in this session use the tenant's schema by default.

    Args:
        session: Database session
        schema_name: Name of the tenant schema
    """
    await session.execute(
        text(f"SET search_path TO {schema_name}, adk_platform_shared, public")
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting database sessions without tenant schema set.

    Note: This provides a raw session. For tenant-scoped operations,
    use get_tenant_db which ensures proper schema isolation.
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_tenant_db(tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
    """
    Get a database session with tenant schema properly set.

    This is a generator function that should be used with dependency injection
    that provides the tenant_id. Use get_tenant_db_dependency() for FastAPI.

    Args:
        tenant_id: The tenant ID to scope the session to
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            # Set tenant context
            TenantContext.set(tenant_id)

            # Get tenant record to find the actual schema name
            from sqlalchemy import select
            from src.db.models.tenant import Tenant

            result = await session.execute(
                select(Tenant.database_schema).where(Tenant.id == tenant_id)
            )
            schema_name = result.scalar_one_or_none()

            if schema_name:
                await set_tenant_schema(session, schema_name)

            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """Context manager for database sessions"""
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            # Set tenant schema if tenant context is available
            tenant_id = TenantContext.get_optional()
            if tenant_id:
                # Get tenant record to find the actual schema name
                from sqlalchemy import select
                from src.db.models.tenant import Tenant

                result = await session.execute(
                    select(Tenant.database_schema).where(Tenant.id == tenant_id)
                )
                schema_name = result.scalar_one_or_none()

                if schema_name:
                    await set_tenant_schema(session, schema_name)

            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Initialize database connections"""
    # Pre-initialize the engine and session factory
    get_engine()
    get_session_factory()


async def close_db() -> None:
    """Close database connections"""
    global _engine, _async_session_factory

    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _async_session_factory = None
