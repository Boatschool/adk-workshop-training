"""add_password_reset_tokens_table

Revision ID: 06da01720794
Revises: eef9007a89c5
Create Date: 2025-11-24 14:13:54.043683

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "06da01720794"
down_revision: str | None = "eef9007a89c5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add password_reset_tokens table to all tenant schemas."""
    # Get list of tenant schemas
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name LIKE 'adk_platform_tenant_%' OR schema_name LIKE 'adk_tenant_%'"
        )
    )
    tenant_schemas = [row[0] for row in result]

    # Create password_reset_tokens table in each tenant schema
    for schema in tenant_schemas:
        op.create_table(
            "password_reset_tokens",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("token", sa.String(length=255), nullable=False),
            sa.Column("user_id", sa.UUID(), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
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
            sa.ForeignKeyConstraint(["user_id"], [f"{schema}.users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            schema=schema,
        )
        op.create_index(
            f"ix_{schema}_password_reset_tokens_token",
            "password_reset_tokens",
            ["token"],
            unique=True,
            schema=schema,
        )
        op.create_index(
            f"ix_{schema}_password_reset_tokens_user_id",
            "password_reset_tokens",
            ["user_id"],
            schema=schema,
        )


def downgrade() -> None:
    """Remove password_reset_tokens table from all tenant schemas."""
    # Get list of tenant schemas
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name LIKE 'adk_platform_tenant_%' OR schema_name LIKE 'adk_tenant_%'"
        )
    )
    tenant_schemas = [row[0] for row in result]

    # Drop password_reset_tokens table from each tenant schema
    for schema in tenant_schemas:
        op.drop_index(
            f"ix_{schema}_password_reset_tokens_user_id",
            table_name="password_reset_tokens",
            schema=schema,
        )
        op.drop_index(
            f"ix_{schema}_password_reset_tokens_token",
            table_name="password_reset_tokens",
            schema=schema,
        )
        op.drop_table("password_reset_tokens", schema=schema)
