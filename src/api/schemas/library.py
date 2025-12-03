"""Pydantic schemas for Library resources, bookmarks, and progress tracking."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.constants import (
    LibraryDifficulty,
    LibraryResourceSource,
    LibraryResourceType,
    LibraryTopic,
    ResourceProgressStatus,
)

# ============================================================================
# Library Resource Schemas
# ============================================================================


class LibraryResourceBase(BaseModel):
    """Base library resource schema with common fields."""

    title: str = Field(..., min_length=1, max_length=255, description="Resource title")
    description: str = Field(..., min_length=1, description="Resource description")
    resource_type: LibraryResourceType = Field(..., description="Type of resource")
    source: LibraryResourceSource = Field(..., description="Whether resource is external or embedded")
    external_url: str | None = Field(None, max_length=1000, description="External URL for external resources")
    content_path: str | None = Field(None, max_length=500, description="Path to embedded content")
    content_html: str | None = Field(None, description="HTML/Markdown content for embedded resources")
    topics: list[LibraryTopic] = Field(default_factory=list, description="Resource topics")
    difficulty: LibraryDifficulty = Field(..., description="Difficulty level")
    author: str | None = Field(None, max_length=255, description="Author or source name")
    estimated_minutes: int | None = Field(None, ge=1, description="Estimated reading/viewing time")
    thumbnail_url: str | None = Field(None, max_length=500, description="Thumbnail image URL")
    featured: bool = Field(default=False, description="Whether to feature this resource")


class LibraryResourceCreate(LibraryResourceBase):
    """Schema for creating a new library resource."""

    pass


class LibraryResourceUpdate(BaseModel):
    """Schema for updating an existing library resource."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1)
    resource_type: LibraryResourceType | None = None
    source: LibraryResourceSource | None = None
    external_url: str | None = Field(None, max_length=1000)
    content_path: str | None = Field(None, max_length=500)
    content_html: str | None = None
    topics: list[LibraryTopic] | None = None
    difficulty: LibraryDifficulty | None = None
    author: str | None = Field(None, max_length=255)
    estimated_minutes: int | None = Field(None, ge=1)
    thumbnail_url: str | None = Field(None, max_length=500)
    featured: bool | None = None


class LibraryResourceResponse(LibraryResourceBase):
    """Schema for library resource responses."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LibraryResourceWithUserData(LibraryResourceResponse):
    """Library resource response with user-specific bookmark and progress data."""

    is_bookmarked: bool = False
    progress_status: ResourceProgressStatus | None = None


# ============================================================================
# User Bookmark Schemas
# ============================================================================


class UserBookmarkCreate(BaseModel):
    """Schema for creating a bookmark (toggle)."""

    resource_id: UUID = Field(..., description="Library resource ID to bookmark")


class UserBookmarkResponse(BaseModel):
    """Schema for bookmark responses."""

    id: UUID
    user_id: UUID
    resource_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class BookmarkStatusResponse(BaseModel):
    """Schema for bookmark status check."""

    is_bookmarked: bool
    bookmarked_at: datetime | None = None


# ============================================================================
# Resource Progress Schemas
# ============================================================================


class ResourceProgressUpdate(BaseModel):
    """Schema for updating resource progress."""

    status: ResourceProgressStatus = Field(..., description="Progress status")
    time_spent_seconds: int | None = Field(None, ge=0, description="Time spent on resource")


class ResourceProgressResponse(BaseModel):
    """Schema for resource progress responses."""

    id: UUID
    user_id: UUID
    resource_id: UUID
    status: ResourceProgressStatus
    last_viewed_at: datetime | None
    completed_at: datetime | None
    time_spent_seconds: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# File Upload Schemas
# ============================================================================


class FileUploadResponse(BaseModel):
    """Schema for file upload responses."""

    file_path: str = Field(..., description="Path to the file in GCS")
    file_url: str = Field(..., description="GCS URL (gs://bucket/path)")
    file_name: str = Field(..., description="Original filename")
    file_size: int = Field(..., description="File size in bytes")
    content_type: str = Field(..., description="MIME type of the file")


class FileDownloadResponse(BaseModel):
    """Schema for file download responses."""

    download_url: str = Field(..., description="Signed URL for downloading the file")
    expires_in_minutes: int = Field(..., description="URL expiration time in minutes")
    file_name: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type of the file")


# ============================================================================
# Query Parameter Schemas
# ============================================================================


class LibraryResourceFilters(BaseModel):
    """Query parameters for filtering library resources."""

    search: str | None = Field(None, description="Search query for title/description")
    resource_type: LibraryResourceType | None = Field(None, description="Filter by resource type")
    topic: LibraryTopic | None = Field(None, description="Filter by topic")
    difficulty: LibraryDifficulty | None = Field(None, description="Filter by difficulty")
    featured: bool | None = Field(None, description="Filter by featured status")
    bookmarked: bool | None = Field(None, description="Filter to only bookmarked resources")
    progress_status: ResourceProgressStatus | None = Field(None, description="Filter by progress status")
