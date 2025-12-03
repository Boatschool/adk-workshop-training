"""Add guides table

Revision ID: 003_add_guides_table
Revises: 002_add_library_tables
Create Date: 2025-12-03 12:00:00.000000

This migration creates:
1. guides table in the shared schema (global documentation)

Guides are platform-wide documentation accessible by all tenants.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003_add_guides_table"
down_revision: str = "002_add_library_tables"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add guides table to shared schema."""

    # Create guides table in shared schema
    op.create_table(
        "guides",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("content_html", sa.Text(), nullable=False),
        sa.Column("icon", sa.String(50), nullable=False, server_default="book"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("published", sa.Boolean(), nullable=False, server_default="true"),
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
        sa.UniqueConstraint("slug", name="uq_guides_slug"),
        schema="adk_platform_shared",
    )

    # Create index on slug for fast lookups
    op.create_index(
        "ix_guides_slug",
        "guides",
        ["slug"],
        schema="adk_platform_shared",
    )

    # Create trigger for updated_at
    op.execute("""
        CREATE TRIGGER update_guides_updated_at
        BEFORE UPDATE ON adk_platform_shared.guides
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    """)


def downgrade() -> None:
    """Remove guides table from shared schema."""

    op.execute("DROP TRIGGER IF EXISTS update_guides_updated_at ON adk_platform_shared.guides")
    op.drop_index("ix_guides_slug", table_name="guides", schema="adk_platform_shared")
    op.drop_table("guides", schema="adk_platform_shared")
