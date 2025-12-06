"""Add agent templates tables

Revision ID: 006_add_agent_templates
Revises: 005_add_announcements_table
Create Date: 2025-12-06 12:00:00.000000

This migration creates:
1. agent_templates table in the shared schema (global templates)
2. template_bookmarks table in existing tenant schemas

Note: New tenant schemas will automatically get these tables via tenant_schema.py.
This migration adds them to existing tenant schemas.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "006_add_agent_templates"
down_revision: str = "005_add_announcements_table"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add agent templates tables to shared and tenant schemas."""

    # 1. Create agent_templates table in shared schema
    op.create_table(
        "agent_templates",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        # Basic info
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("yaml_content", sa.Text(), nullable=False),
        # Categorization
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("difficulty", sa.String(50), nullable=False),
        sa.Column("use_case", sa.Text(), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String(50)), nullable=False, server_default="{}"),
        # Author info
        sa.Column("author_id", sa.UUID(), nullable=True),
        sa.Column("author_name", sa.String(255), nullable=False),
        # Approval workflow
        sa.Column("status", sa.String(50), nullable=False, server_default="'pending_review'"),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("approved_by", sa.UUID(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        # Display & metrics
        sa.Column("featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("download_count", sa.Integer(), nullable=False, server_default="0"),
        # Agent metadata
        sa.Column("model", sa.String(100), nullable=True),
        sa.Column("has_tools", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("has_sub_agents", sa.Boolean(), nullable=False, server_default="false"),
        # Optional preview
        sa.Column("thumbnail_url", sa.String(500), nullable=True),
        # Timestamps
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

    # Create index on status for filtering pending reviews
    op.create_index(
        "ix_agent_templates_status",
        "agent_templates",
        ["status"],
        schema="adk_platform_shared",
    )

    # Create index on category for filtering
    op.create_index(
        "ix_agent_templates_category",
        "agent_templates",
        ["category"],
        schema="adk_platform_shared",
    )

    # Create trigger for updated_at on shared agent_templates
    op.execute(
        """
        CREATE TRIGGER update_agent_templates_updated_at
        BEFORE UPDATE ON adk_platform_shared.agent_templates
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    """
    )

    # 2. Add template_bookmarks table to existing tenant schemas
    connection = op.get_bind()
    result = connection.execute(sa.text("SELECT database_schema FROM adk_platform_shared.tenants"))
    tenant_schemas = [row[0] for row in result.fetchall()]

    for schema_name in tenant_schemas:
        # Create template_bookmarks table
        op.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.template_bookmarks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES {schema_name}.users(id) ON DELETE CASCADE,
                template_id UUID NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, template_id)
            )
        """
        )

        # Add trigger for updated_at
        op.execute(
            f"""
            CREATE TRIGGER update_{schema_name}_template_bookmarks_updated_at
            BEFORE UPDATE ON {schema_name}.template_bookmarks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        """
        )


def downgrade() -> None:
    """Remove agent templates tables from shared and tenant schemas."""

    # Get all tenant schemas from the database
    connection = op.get_bind()
    result = connection.execute(sa.text("SELECT database_schema FROM adk_platform_shared.tenants"))
    tenant_schemas = [row[0] for row in result.fetchall()]

    # Remove tables from tenant schemas
    for schema_name in tenant_schemas:
        op.execute(
            f"DROP TRIGGER IF EXISTS update_{schema_name}_template_bookmarks_updated_at ON {schema_name}.template_bookmarks"
        )
        op.execute(f"DROP TABLE IF EXISTS {schema_name}.template_bookmarks")

    # Remove shared agent_templates table
    op.execute(
        "DROP TRIGGER IF EXISTS update_agent_templates_updated_at ON adk_platform_shared.agent_templates"
    )
    op.drop_index("ix_agent_templates_category", table_name="agent_templates", schema="adk_platform_shared")
    op.drop_index("ix_agent_templates_status", table_name="agent_templates", schema="adk_platform_shared")
    op.drop_table("agent_templates", schema="adk_platform_shared")
