"""Workshop model - stored in tenant-specific schema"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.constants import WorkshopStatus
from src.db.base import BaseModel


class Workshop(BaseModel):
    """Workshop model for organizing training sessions"""

    __tablename__ = "workshops"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=WorkshopStatus.DRAFT.value
    )
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Workshop(id={self.id}, title={self.title}, status={self.status})>"


class Exercise(BaseModel):
    """Exercise model for workshop content"""

    __tablename__ = "exercises"

    workshop_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workshops.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    order_index: Mapped[int] = mapped_column(nullable=False)

    def __repr__(self) -> str:
        return f"<Exercise(id={self.id}, title={self.title}, workshop_id={self.workshop_id})>"


class Progress(BaseModel):
    """Progress tracking for users completing exercises"""

    __tablename__ = "progress"

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="not_started")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_spent_seconds: Mapped[int] = mapped_column(nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<Progress(user_id={self.user_id}, exercise_id={self.exercise_id}, status={self.status})>"
