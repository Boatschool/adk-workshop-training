"""Pydantic schemas for Tenant resource."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.constants import TenantStatus


class TenantBase(BaseModel):
    """Base tenant schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Tenant name")
    slug: str = Field(
        ...,
        min_length=1,
        max_length=255,
        pattern="^[a-z0-9-]+$",
        description="URL-friendly tenant identifier",
    )


class TenantCreate(TenantBase):
    """Schema for creating a new tenant."""

    google_api_key: str | None = Field(
        None, description="Google API key (will be stored in Secret Manager)"
    )
    subscription_tier: str = Field(
        default="trial", description="Subscription tier (trial, basic, pro, enterprise)"
    )


class TenantUpdate(BaseModel):
    """Schema for updating an existing tenant."""

    name: str | None = Field(None, min_length=1, max_length=255)
    status: TenantStatus | None = None
    subscription_tier: str | None = None
    google_api_key: str | None = None
    settings: dict | None = None


class TenantResponse(TenantBase):
    """Schema for tenant responses."""

    id: UUID
    database_schema: str
    status: TenantStatus
    subscription_tier: str
    settings: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
