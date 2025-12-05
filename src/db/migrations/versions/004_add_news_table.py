"""Add news table

Revision ID: 004_add_news_table
Revises: 003_add_guides_table
Create Date: 2025-12-05 12:00:00.000000

This migration creates:
1. news table in the shared schema (platform-wide news)

News items are platform-wide content accessible by all tenants.
Supports both admin-created news and external news sources.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004_add_news_table"
down_revision: str = "003_add_guides_table"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add news table to shared schema."""

    # Create news table in shared schema
    op.create_table(
        "news",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("source", sa.String(100), nullable=False, server_default="GraymatterLab"),
        sa.Column("source_url", sa.String(500), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_external", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("published", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_by", sa.UUID(), nullable=True),
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

    # Create index on published_at for sorting
    op.create_index(
        "ix_news_published_at",
        "news",
        ["published_at"],
        schema="adk_platform_shared",
    )

    # Create index on is_featured for filtering
    op.create_index(
        "ix_news_is_featured",
        "news",
        ["is_featured"],
        schema="adk_platform_shared",
    )

    # Create index on published for filtering
    op.create_index(
        "ix_news_published",
        "news",
        ["published"],
        schema="adk_platform_shared",
    )

    # Create trigger for updated_at
    op.execute(
        """
        CREATE TRIGGER update_news_updated_at
        BEFORE UPDATE ON adk_platform_shared.news
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    """
    )


def downgrade() -> None:
    """Remove news table from shared schema."""

    op.execute("DROP TRIGGER IF EXISTS update_news_updated_at ON adk_platform_shared.news")
    op.drop_index("ix_news_published", table_name="news", schema="adk_platform_shared")
    op.drop_index("ix_news_is_featured", table_name="news", schema="adk_platform_shared")
    op.drop_index("ix_news_published_at", table_name="news", schema="adk_platform_shared")
    op.drop_table("news", schema="adk_platform_shared")
