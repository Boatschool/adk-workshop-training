"""Add library tables

Revision ID: 002_add_library_tables
Revises: 06da01720794
Create Date: 2025-12-02 12:00:00.000000

This migration creates:
1. library_resources table in the shared schema (global resources)
2. user_bookmarks table in existing tenant schemas
3. resource_progress table in existing tenant schemas

Note: New tenant schemas will automatically get these tables via tenant_schema.py.
This migration adds them to existing tenant schemas.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002_add_library_tables"
down_revision: str = "06da01720794"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add library tables to shared and tenant schemas."""

    # 1. Create library_resources table in shared schema
    op.create_table(
        "library_resources",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("resource_type", sa.String(50), nullable=False),
        sa.Column("source", sa.String(20), nullable=False),
        sa.Column("external_url", sa.String(1000), nullable=True),
        sa.Column("content_path", sa.String(500), nullable=True),
        sa.Column("content_html", sa.Text(), nullable=True),
        sa.Column("topics", postgresql.ARRAY(sa.String(50)), nullable=False, server_default="{}"),
        sa.Column("difficulty", sa.String(20), nullable=False),
        sa.Column("author", sa.String(255), nullable=True),
        sa.Column("estimated_minutes", sa.Integer(), nullable=True),
        sa.Column("thumbnail_url", sa.String(500), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default="false"),
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
        schema="adk_platform_shared",
    )

    # Create trigger for updated_at on shared library_resources
    op.execute("""
        CREATE TRIGGER update_library_resources_updated_at
        BEFORE UPDATE ON adk_platform_shared.library_resources
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    """)

    # 2. Add tables to existing tenant schemas
    # Get all tenant schemas from the database
    connection = op.get_bind()
    result = connection.execute(
        sa.text("SELECT database_schema FROM adk_platform_shared.tenants")
    )
    tenant_schemas = [row[0] for row in result.fetchall()]

    for schema_name in tenant_schemas:
        # Create user_bookmarks table
        op.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.user_bookmarks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
                resource_id UUID NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, resource_id)
            )
        """)

        # Create resource_progress table
        op.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.resource_progress (
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
        """)

        # Add triggers for updated_at
        op.execute(f"""
            CREATE TRIGGER update_{schema_name}_user_bookmarks_updated_at
            BEFORE UPDATE ON {schema_name}.user_bookmarks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        """)

        op.execute(f"""
            CREATE TRIGGER update_{schema_name}_resource_progress_updated_at
            BEFORE UPDATE ON {schema_name}.resource_progress
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        """)


def downgrade() -> None:
    """Remove library tables from shared and tenant schemas."""

    # Get all tenant schemas from the database
    connection = op.get_bind()
    result = connection.execute(
        sa.text("SELECT database_schema FROM adk_platform_shared.tenants")
    )
    tenant_schemas = [row[0] for row in result.fetchall()]

    # Remove tables from tenant schemas
    for schema_name in tenant_schemas:
        op.execute(f"DROP TRIGGER IF EXISTS update_{schema_name}_user_bookmarks_updated_at ON {schema_name}.user_bookmarks")
        op.execute(f"DROP TRIGGER IF EXISTS update_{schema_name}_resource_progress_updated_at ON {schema_name}.resource_progress")
        op.execute(f"DROP TABLE IF EXISTS {schema_name}.user_bookmarks")
        op.execute(f"DROP TABLE IF EXISTS {schema_name}.resource_progress")

    # Remove shared library_resources table
    op.execute("DROP TRIGGER IF EXISTS update_library_resources_updated_at ON adk_platform_shared.library_resources")
    op.drop_table("library_resources", schema="adk_platform_shared")
