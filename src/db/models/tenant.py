"""Tenant model - stored in shared schema"""

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from src.core.constants import SHARED_SCHEMA, TenantStatus
from src.db.base import BaseModel


class Tenant(BaseModel):
    """Tenant model for multi-tenant architecture"""

    __tablename__ = "tenants"
    __table_args__ = {"schema": SHARED_SCHEMA}

    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    database_schema: Mapped[str] = mapped_column(String(63), nullable=False, unique=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=TenantStatus.ACTIVE.value
    )
    subscription_tier: Mapped[str] = mapped_column(
        String(50), nullable=False, default="trial"
    )
    google_api_key_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    settings: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    def __repr__(self) -> str:
        return f"<Tenant(id={self.id}, slug={self.slug}, name={self.name})>"
