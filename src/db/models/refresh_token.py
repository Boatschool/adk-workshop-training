"""RefreshToken model - stored in tenant-specific schema"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import BaseModel


class RefreshToken(BaseModel):
    """Refresh token model for long-lived session management"""

    __tablename__ = "refresh_tokens"
    # Note: schema will be set dynamically based on tenant context

    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, revoked={self.revoked_at is not None})>"

    @property
    def is_valid(self) -> bool:
        """Check if token is valid (not revoked and not expired)."""
        if self.revoked_at is not None:
            return False
        if self.expires_at < datetime.now(timezone.utc):
            return False
        return True
