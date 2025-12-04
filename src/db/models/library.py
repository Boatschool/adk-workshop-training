"""Library models for curated learning resources.

LibraryResource is stored in the SHARED schema (adk_platform_shared) and accessible by all tenants.
UserBookmark and ResourceProgress are stored in tenant-specific schemas for per-user tracking.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import BaseModel


class LibraryResource(BaseModel):
    """Library resource model for curated learning content.

    Stored in the shared schema (adk_platform_shared) so all tenants can access the same resources.
    Resources can be external links or embedded content.
    """

    __tablename__ = "library_resources"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resource_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # article, video, pdf, tool, course, documentation
    source: Mapped[str] = mapped_column(String(20), nullable=False)  # external, embedded
    external_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    content_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content_html: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # For embedded markdown/HTML content
    topics: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=False, default=list)
    difficulty: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # beginner, intermediate, advanced
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<LibraryResource(id={self.id}, title={self.title}, type={self.resource_type})>"


class UserBookmark(BaseModel):
    """User bookmark model for saving library resources.

    Stored in tenant-specific schemas for per-user tracking.
    References the shared library_resources table via UUID (not foreign key due to cross-schema).
    """

    __tablename__ = "user_bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "resource_id", name="uq_user_bookmark"),)

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    resource_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False  # References shared schema, no FK constraint
    )

    def __repr__(self) -> str:
        return f"<UserBookmark(user_id={self.user_id}, resource_id={self.resource_id})>"


class ResourceProgress(BaseModel):
    """Resource progress tracking model.

    Stored in tenant-specific schemas for per-user tracking.
    Tracks whether a user has viewed, is viewing, or completed a library resource.
    """

    __tablename__ = "resource_progress"
    __table_args__ = (UniqueConstraint("user_id", "resource_id", name="uq_user_resource_progress"),)

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    resource_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False  # References shared schema, no FK constraint
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="not_started"
    )  # not_started, in_progress, completed
    last_viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<ResourceProgress(user_id={self.user_id}, resource_id={self.resource_id}, status={self.status})>"
