"""Add announcements table for What's New section.

Revision ID: 005
Revises: 004_add_news_table
Create Date: 2025-12-05

Announcements are stored in the shared schema for platform-wide visibility.
Used for dashboard "What's New" section to highlight new content, workshops, features.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "005_add_announcements_table"
down_revision = "004_add_news_table"
branch_labels = None
depends_on = None

SHARED_SCHEMA = "adk_platform_shared"


def upgrade() -> None:
    """Create announcements table in shared schema."""

    # Create announcements table
    op.create_table(
        "announcements",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("announcement_type", sa.String(50), nullable=False, server_default="general"),
        sa.Column("link_url", sa.String(500), nullable=True),
        sa.Column("badge_text", sa.String(50), nullable=True),
        sa.Column("badge_color", sa.String(20), nullable=False, server_default="blue"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
        schema=SHARED_SCHEMA,
    )

    # Create indexes for common queries
    op.create_index(
        "ix_announcements_is_active",
        "announcements",
        ["is_active"],
        schema=SHARED_SCHEMA,
    )

    op.create_index(
        "ix_announcements_display_order",
        "announcements",
        ["display_order"],
        schema=SHARED_SCHEMA,
    )

    op.create_index(
        "ix_announcements_announcement_type",
        "announcements",
        ["announcement_type"],
        schema=SHARED_SCHEMA,
    )

    # Composite index for active announcements query
    op.create_index(
        "ix_announcements_active_display",
        "announcements",
        ["is_active", "display_order", "created_at"],
        schema=SHARED_SCHEMA,
    )


def downgrade() -> None:
    """Drop announcements table."""

    op.drop_index(
        "ix_announcements_active_display",
        table_name="announcements",
        schema=SHARED_SCHEMA,
    )
    op.drop_index(
        "ix_announcements_announcement_type",
        table_name="announcements",
        schema=SHARED_SCHEMA,
    )
    op.drop_index(
        "ix_announcements_display_order",
        table_name="announcements",
        schema=SHARED_SCHEMA,
    )
    op.drop_index(
        "ix_announcements_is_active",
        table_name="announcements",
        schema=SHARED_SCHEMA,
    )
    op.drop_table("announcements", schema=SHARED_SCHEMA)
