"""Pydantic schemas for Announcements (What's New section)."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

# ============================================================================
# Announcement Schemas
# ============================================================================

# Valid announcement types
ANNOUNCEMENT_TYPES = ["workshop", "guide", "library", "news", "feature", "general"]

# Valid badge colors
BADGE_COLORS = ["blue", "green", "amber", "red", "purple"]


class AnnouncementBase(BaseModel):
    """Base announcement schema with common fields."""

    title: str = Field(..., min_length=1, max_length=255, description="Announcement title")
    description: str = Field(..., min_length=1, max_length=500, description="Short description")
    announcement_type: str = Field(
        default="general",
        description="Type: workshop, guide, library, news, feature, general",
    )
    link_url: str | None = Field(None, max_length=500, description="Link URL (internal or external)")
    badge_text: str | None = Field(None, max_length=50, description="Badge text (e.g., NEW, UPDATED)")
    badge_color: str = Field(default="blue", description="Badge color: blue, green, amber, red, purple")
    display_order: int = Field(default=0, description="Display order (lower = higher priority)")
    is_active: bool = Field(default=True, description="Whether the announcement is active")
    starts_at: datetime | None = Field(None, description="Optional start date")
    expires_at: datetime | None = Field(None, description="Optional expiration date")


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating a new announcement."""

    pass


class AnnouncementUpdate(BaseModel):
    """Schema for updating an existing announcement."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1, max_length=500)
    announcement_type: str | None = None
    link_url: str | None = None
    badge_text: str | None = None
    badge_color: str | None = None
    display_order: int | None = None
    is_active: bool | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None


class AnnouncementResponse(AnnouncementBase):
    """Schema for announcement responses."""

    id: UUID
    created_by: UUID | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    """Schema for announcement list response."""

    items: list[AnnouncementResponse]
    total: int
