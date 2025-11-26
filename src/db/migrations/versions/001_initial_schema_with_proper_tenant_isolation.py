"""Initial schema with proper tenant isolation

Revision ID: 001_tenant_isolation
Revises:
Create Date: 2025-11-20 16:00:00.000000

This migration creates:
1. The shared schema (adk_platform_shared) with the tenants table
2. Helper functions to create tenant-specific schemas and tables

Tenant-specific tables (users, workshops, exercises, progress, agents) are NOT
created here - they are created dynamically when a tenant is provisioned.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001_tenant_isolation"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create shared schema and tenants table"""

    # Create shared schema
    op.execute("CREATE SCHEMA IF NOT EXISTS adk_platform_shared")

    # Create tenants table in shared schema
    op.create_table(
        "tenants",
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("database_schema", sa.String(length=63), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("subscription_tier", sa.String(length=50), nullable=False),
        sa.Column("google_api_key_secret", sa.String(length=255), nullable=True),
        sa.Column("settings", sa.JSON(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("database_schema"),
        schema="adk_platform_shared",
    )
    op.create_index(
        op.f("ix_adk_platform_shared_tenants_slug"),
        "tenants",
        ["slug"],
        unique=True,
        schema="adk_platform_shared",
    )


def downgrade() -> None:
    """Remove shared schema and tenants table"""
    op.drop_index(
        op.f("ix_adk_platform_shared_tenants_slug"),
        table_name="tenants",
        schema="adk_platform_shared",
    )
    op.drop_table("tenants", schema="adk_platform_shared")
    op.execute("DROP SCHEMA IF NOT EXISTS adk_platform_shared CASCADE")


def create_tenant_schema_tables(schema_name: str) -> None:
    """
    Create all tenant-specific tables in the given schema.

    This function is called by TenantService when provisioning a new tenant.
    It creates: users, workshops, exercises, progress, and agents tables.

    Args:
        schema_name: The schema name for the tenant (e.g., 'adk_tenant_acme')
    """
    conn = op.get_bind()

    # Create the schema
    conn.execute(sa.text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))

    # Create users table
    op.create_table(
        "users",
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=schema_name,
    )
    op.create_index(
        f"ix_{schema_name}_users_email",
        "users",
        ["email"],
        unique=True,
        schema=schema_name,
    )

    # Create workshops table
    op.create_table(
        "workshops",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.UUID(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            [f"{schema_name}.users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=schema_name,
    )

    # Create exercises table
    op.create_table(
        "exercises",
        sa.Column("workshop_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=50), nullable=False),
        sa.Column("content_path", sa.String(length=500), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["workshop_id"],
            [f"{schema_name}.workshops.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=schema_name,
    )

    # Create progress table
    op.create_table(
        "progress",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("exercise_id", sa.UUID(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("time_spent_seconds", sa.Integer(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["exercise_id"],
            [f"{schema_name}.exercises.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            [f"{schema_name}.users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=schema_name,
    )

    # Create agents table
    op.create_table(
        "agents",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("agent_type", sa.String(length=100), nullable=False),
        sa.Column("config", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            [f"{schema_name}.users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=schema_name,
    )


def drop_tenant_schema_tables(schema_name: str) -> None:
    """
    Drop all tables in a tenant schema and the schema itself.

    Args:
        schema_name: The schema name for the tenant
    """
    conn = op.get_bind()
    conn.execute(sa.text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
