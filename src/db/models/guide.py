"""Guide model for platform documentation.

Guide is stored in the SHARED schema (adk_platform_shared) and accessible by all tenants.
Guides are platform-wide documentation, not tenant-specific content.
"""

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import BaseModel


class Guide(BaseModel):
    """Guide model for platform documentation.

    Stored in the shared schema (adk_platform_shared) so all tenants can access the same guides.
    """

    __tablename__ = "guides"

    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    content_html: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False, default="book")  # book, rocket, terminal, wrench, play
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    def __repr__(self) -> str:
        return f"<Guide(id={self.id}, slug={self.slug}, title={self.title})>"
