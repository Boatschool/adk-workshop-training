"""add_refresh_tokens_table

Revision ID: eef9007a89c5
Revises: 69b9c231e4cb
Create Date: 2025-11-24 12:26:12.139768

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "eef9007a89c5"
down_revision: Union[str, None] = "69b9c231e4cb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add refresh_tokens table to all tenant schemas."""
    # Get list of tenant schemas
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name LIKE 'adk_platform_tenant_%' OR schema_name LIKE 'adk_tenant_%'"
        )
    )
    tenant_schemas = [row[0] for row in result]

    # Create refresh_tokens table in each tenant schema
    for schema in tenant_schemas:
        op.create_table(
            "refresh_tokens",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("token", sa.String(length=255), nullable=False),
            sa.Column("user_id", sa.UUID(), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
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
            f"ix_{schema}_refresh_tokens_token",
            "refresh_tokens",
            ["token"],
            unique=True,
            schema=schema,
        )
        op.create_index(
            f"ix_{schema}_refresh_tokens_user_id", "refresh_tokens", ["user_id"], schema=schema
        )


def downgrade() -> None:
    """Remove refresh_tokens table from all tenant schemas."""
    # Get list of tenant schemas
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name LIKE 'adk_platform_tenant_%' OR schema_name LIKE 'adk_tenant_%'"
        )
    )
    tenant_schemas = [row[0] for row in result]

    # Drop refresh_tokens table from each tenant schema
    for schema in tenant_schemas:
        op.drop_index(f"ix_{schema}_refresh_tokens_user_id", table_name="refresh_tokens", schema=schema)
        op.drop_index(f"ix_{schema}_refresh_tokens_token", table_name="refresh_tokens", schema=schema)
        op.drop_table("refresh_tokens", schema=schema)
