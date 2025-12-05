"""News model for healthcare AI news and announcements.

News is stored in the SHARED schema (adk_platform_shared) and accessible by all tenants.
Supports both admin-created news and external news sources.
"""

from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import BaseModel


class News(BaseModel):
    """News model for healthcare AI news and platform announcements.

    Stored in the shared schema (adk_platform_shared) so all tenants can access the same news.
    """

    __tablename__ = "news"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(
        String(100), nullable=False, default="GraymatterLab"
    )
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    is_external: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_by: Mapped[PyUUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    def __repr__(self) -> str:
        return f"<News(id={self.id}, title={self.title}, source={self.source})>"
