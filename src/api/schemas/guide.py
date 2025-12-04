"""Pydantic schemas for Guide documentation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.constants import GuideIcon

# ============================================================================
# Guide Schemas
# ============================================================================


class GuideBase(BaseModel):
    """Base guide schema with common fields."""

    title: str = Field(..., min_length=1, max_length=255, description="Guide title")
    description: str = Field(..., min_length=1, description="Guide description")
    content_html: str = Field(..., min_length=1, description="HTML content for the guide")
    icon: GuideIcon = Field(default=GuideIcon.BOOK, description="Icon type for the guide")
    display_order: int = Field(default=0, ge=0, description="Display order in the guide list")
    published: bool = Field(default=True, description="Whether the guide is published")


class GuideCreate(GuideBase):
    """Schema for creating a new guide."""

    slug: str = Field(
        ..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$", description="URL-friendly slug"
    )


class GuideUpdate(BaseModel):
    """Schema for updating an existing guide."""

    slug: str | None = Field(None, min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1)
    content_html: str | None = Field(None, min_length=1)
    icon: GuideIcon | None = None
    display_order: int | None = Field(None, ge=0)
    published: bool | None = None


class GuideResponse(GuideBase):
    """Schema for guide responses."""

    id: UUID
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GuideListItem(BaseModel):
    """Schema for guide list items (without content_html for performance)."""

    id: UUID
    slug: str
    title: str
    description: str
    icon: GuideIcon
    display_order: int
    published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
