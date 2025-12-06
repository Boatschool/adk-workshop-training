"""Tenant schema management utilities.

This module provides functions to create and manage tenant-specific database schemas.
Each tenant gets their own PostgreSQL schema with isolated tables.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import ValidationError


async def create_tenant_schema_and_tables(db: AsyncSession, schema_name: str) -> None:
    """
    Create a new PostgreSQL schema for a tenant and all required tables.

    This function creates a tenant-specific schema with the following tables:
    - users: User accounts for the tenant
    - workshops: Training workshops
    - exercises: Workshop exercises
    - progress: User progress tracking
    - agents: AI agent configurations

    Args:
        db: Database session
        schema_name: Name of the schema to create (e.g., 'adk_tenant_acme')

    Raises:
        ValidationError: If schema name is invalid
    """
    # Sanitize schema name to prevent SQL injection
    if not schema_name.replace("_", "").isalnum():
        raise ValidationError(f"Invalid schema name: {schema_name}")

    # Create the schema
    await db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))

    # Create users table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            hashed_password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            failed_login_attempts INTEGER NOT NULL DEFAULT 0,
            locked_until TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
        )
    )

    # Create unique index on email
    await db.execute(
        text(f"CREATE UNIQUE INDEX ix_{schema_name}_users_email ON {schema_name}.users(email)")
    )

    # Create refresh_tokens table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.refresh_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token VARCHAR(255) NOT NULL,
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            expires_at TIMESTAMPTZ NOT NULL,
            revoked_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
        )
    )
    await db.execute(
        text(
            f"CREATE UNIQUE INDEX ix_{schema_name}_refresh_tokens_token ON {schema_name}.refresh_tokens(token)"
        )
    )

    # Create password_reset_tokens table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token VARCHAR(255) NOT NULL,
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            expires_at TIMESTAMPTZ NOT NULL,
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
        )
    )
    await db.execute(
        text(
            f"CREATE UNIQUE INDEX ix_{schema_name}_password_reset_tokens_token ON {schema_name}.password_reset_tokens(token)"
        )
    )

    # Create workshops table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.workshops (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) NOT NULL,
            start_date TIMESTAMPTZ,
            end_date TIMESTAMPTZ,
            created_by UUID NOT NULL REFERENCES {schema_name}.users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
        )
    )

    # Create exercises table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.exercises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workshop_id UUID NOT NULL REFERENCES {schema_name}.workshops(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            content_type VARCHAR(50) NOT NULL,
            content_path VARCHAR(500),
            order_index INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
        )
    )

    # Create progress table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            exercise_id UUID NOT NULL REFERENCES {schema_name}.exercises(id) ON DELETE CASCADE,
            status VARCHAR(50) NOT NULL,
            completed_at TIMESTAMPTZ,
            time_spent_seconds INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, exercise_id)
        )
        """
        )
    )

    # Create agents table
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            agent_type VARCHAR(100) NOT NULL,
            config JSONB NOT NULL,
            status VARCHAR(50) NOT NULL,
            last_run_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
        )
    )

    # Create user_bookmarks table (for library resources)
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.user_bookmarks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            resource_id UUID NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, resource_id)
        )
        """
        )
    )

    # Create resource_progress table (for library resources)
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.resource_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            resource_id UUID NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'not_started',
            last_viewed_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            time_spent_seconds INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, resource_id)
        )
        """
        )
    )

    # Create template_bookmarks table (for agent templates)
    await db.execute(
        text(
            f"""
        CREATE TABLE {schema_name}.template_bookmarks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
            template_id UUID NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, template_id)
        )
        """
        )
    )

    # Create updated_at trigger function (if it doesn't exist)
    await db.execute(
        text(
            """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
        """
        )
    )

    # Add triggers for updated_at on all tables
    for table in [
        "users",
        "refresh_tokens",
        "password_reset_tokens",
        "workshops",
        "exercises",
        "progress",
        "agents",
        "user_bookmarks",
        "resource_progress",
        "template_bookmarks",
    ]:
        await db.execute(
            text(
                f"""
            CREATE TRIGGER update_{schema_name}_{table}_updated_at
            BEFORE UPDATE ON {schema_name}.{table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
            """
            )
        )

    await db.commit()


async def drop_tenant_schema(db: AsyncSession, schema_name: str) -> None:
    """
    Drop a tenant schema and all its tables.

    WARNING: This is a destructive operation that will delete all tenant data.

    Args:
        db: Database session
        schema_name: Name of the schema to drop

    Raises:
        ValidationError: If schema name is invalid
    """
    # Sanitize schema name to prevent SQL injection
    if not schema_name.replace("_", "").isalnum():
        raise ValidationError(f"Invalid schema name: {schema_name}")

    await db.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
    await db.commit()


async def schema_exists(db: AsyncSession, schema_name: str) -> bool:
    """
    Check if a schema exists.

    Args:
        db: Database session
        schema_name: Name of the schema to check

    Returns:
        bool: True if schema exists, False otherwise
    """
    result = await db.execute(
        text(
            "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = :schema_name)"
        ),
        {"schema_name": schema_name},
    )
    return result.scalar() or False
