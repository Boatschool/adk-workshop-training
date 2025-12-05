"""Pydantic schemas for News."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

# ============================================================================
# News Schemas
# ============================================================================


class NewsBase(BaseModel):
    """Base news schema with common fields."""

    title: str = Field(..., min_length=1, max_length=255, description="News title")
    excerpt: str = Field(..., min_length=1, max_length=500, description="Short excerpt/summary")
    content: str | None = Field(None, description="Full HTML content (for admin-created news)")
    source: str = Field(
        default="GraymatterLab", max_length=100, description="News source name"
    )
    source_url: str | None = Field(None, max_length=500, description="URL to original article")
    image_url: str | None = Field(None, max_length=500, description="Featured image URL")
    is_external: bool = Field(default=False, description="Whether this is from an external source")
    is_featured: bool = Field(default=False, description="Whether to feature this news item")
    published: bool = Field(default=True, description="Whether the news is published")


class NewsCreate(NewsBase):
    """Schema for creating a new news item."""

    published_at: datetime = Field(..., description="Publication date/time")


class NewsUpdate(BaseModel):
    """Schema for updating an existing news item."""

    title: str | None = Field(None, min_length=1, max_length=255)
    excerpt: str | None = Field(None, min_length=1, max_length=500)
    content: str | None = None
    source: str | None = Field(None, max_length=100)
    source_url: str | None = Field(None, max_length=500)
    image_url: str | None = Field(None, max_length=500)
    published_at: datetime | None = None
    is_external: bool | None = None
    is_featured: bool | None = None
    published: bool | None = None


class NewsResponse(NewsBase):
    """Schema for news responses."""

    id: UUID
    published_at: datetime
    created_by: UUID | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NewsListItem(BaseModel):
    """Schema for news list items (without full content for performance)."""

    id: UUID
    title: str
    excerpt: str
    source: str
    source_url: str | None
    image_url: str | None
    published_at: datetime
    is_external: bool
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    """Schema for paginated news list response."""

    items: list[NewsListItem]
    total: int
    page: int
    page_size: int
    pages: int
