"""Agent Template models for shareable agent YAML templates.

AgentTemplate is stored in the SHARED schema (adk_platform_shared) and accessible by all tenants.
TemplateBookmark is stored in tenant-specific schemas for per-user tracking.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import BaseModel


class AgentTemplate(BaseModel):
    """Agent template model for shareable agent configurations.

    Stored in the shared schema (adk_platform_shared) so all tenants can access the same templates.
    Templates go through an approval workflow before being visible to users.
    """

    __tablename__ = "agent_templates"

    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    yaml_content: Mapped[str] = mapped_column(Text, nullable=False)

    # Categorization
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # hr, scheduling, faq, etc.
    difficulty: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # beginner, intermediate, advanced
    use_case: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=False, default=list)

    # Author info
    author_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )  # References user in tenant schema, no FK
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Approval workflow
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending_review"
    )  # draft, pending_review, approved, rejected
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_by: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )  # Admin who approved
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Display & metrics
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    download_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Agent metadata (extracted from YAML for filtering)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g., gemini-2.5-flash
    has_tools: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_sub_agents: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Optional preview
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<AgentTemplate(id={self.id}, name={self.name}, status={self.status})>"


class TemplateBookmark(BaseModel):
    """User bookmark model for saving agent templates.

    Stored in tenant-specific schemas for per-user tracking.
    References the shared agent_templates table via UUID (not foreign key due to cross-schema).
    """

    __tablename__ = "template_bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "template_id", name="uq_user_template_bookmark"),)

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False  # References users table in same tenant schema
    )
    template_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False  # References shared schema, no FK constraint
    )

    def __repr__(self) -> str:
        return f"<TemplateBookmark(user_id={self.user_id}, template_id={self.template_id})>"
