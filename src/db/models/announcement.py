"""Announcement model for What's New section on dashboard.

Announcements are stored in the SHARED schema (adk_platform_shared) and accessible by all tenants.
Used to highlight new content, workshops, features, or news on the dashboard.
"""

from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import BaseModel


class Announcement(BaseModel):
    """Announcement model for dashboard What's New section.

    Stored in the shared schema (adk_platform_shared) so all tenants see the same announcements.
    Can link to workshops, library resources, guides, or external URLs.
    """

    __tablename__ = "announcements"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Type of announcement: 'workshop', 'guide', 'library', 'news', 'feature', 'general'
    announcement_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="general"
    )

    # Link to internal content (optional - use one or the other)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Badge text shown on the announcement (e.g., "NEW", "UPDATED", "COMING SOON")
    badge_text: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Badge color variant: 'blue', 'green', 'amber', 'red', 'purple'
    badge_color: Mapped[str] = mapped_column(String(20), nullable=False, default="blue")

    # Display order (lower = higher priority)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Visibility controls
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Optional start/end dates for time-limited announcements
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Tracking
    created_by: Mapped[PyUUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    def __repr__(self) -> str:
        return f"<Announcement(id={self.id}, title={self.title}, type={self.announcement_type})>"
