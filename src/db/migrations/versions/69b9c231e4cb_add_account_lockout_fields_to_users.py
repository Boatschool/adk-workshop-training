"""add_account_lockout_fields_to_users

Revision ID: 69b9c231e4cb
Revises: 001_tenant_isolation
Create Date: 2025-11-24 12:01:39.901230

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "69b9c231e4cb"
down_revision: Union[str, None] = "001_tenant_isolation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add account lockout fields to all tenant user tables."""
    # Get list of tenant schemas
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name LIKE 'adk_platform_tenant_%' OR schema_name LIKE 'adk_tenant_%'"
        )
    )
    tenant_schemas = [row[0] for row in result]

    # Add columns to each tenant's users table
    for schema in tenant_schemas:
        op.add_column(
            "users",
            sa.Column(
                "failed_login_attempts",
                sa.Integer(),
                nullable=False,
                server_default="0",
            ),
            schema=schema,
        )
        op.add_column(
            "users",
            sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
            schema=schema,
        )


def downgrade() -> None:
    """Remove account lockout fields from all tenant user tables."""
    # Get list of tenant schemas
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT schema_name FROM information_schema.schemata "
            "WHERE schema_name LIKE 'adk_platform_tenant_%' OR schema_name LIKE 'adk_tenant_%'"
        )
    )
    tenant_schemas = [row[0] for row in result]

    # Remove columns from each tenant's users table
    for schema in tenant_schemas:
        op.drop_column("users", "locked_until", schema=schema)
        op.drop_column("users", "failed_login_attempts", schema=schema)
