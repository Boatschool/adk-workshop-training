"""Password reset service for managing password recovery."""

import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.exceptions import AuthenticationError, ValidationError
from src.core.security import hash_password
from src.db.models.password_reset_token import PasswordResetToken
from src.db.models.refresh_token import RefreshToken
from src.db.models.user import User
from src.services.email_service import send_password_reset_email

settings = get_settings()


class PasswordResetService:
    """Service for password reset operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize password reset service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Get user by email.

        Args:
            email: User email

        Returns:
            User or None if not found
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_reset_token(self, user: User) -> PasswordResetToken:
        """
        Create a password reset token for a user.

        Args:
            user: User to create token for

        Returns:
            PasswordResetToken: Created token
        """
        # Generate secure random token
        token_value = secrets.token_urlsafe(32)

        # Calculate expiration
        expires_at = datetime.now(timezone.utc) + timedelta(
            hours=settings.password_reset_token_expire_hours
        )

        # Create token
        reset_token = PasswordResetToken(
            token=token_value,
            user_id=user.id,
            expires_at=expires_at,
        )

        self.db.add(reset_token)
        await self.db.commit()
        await self.db.refresh(reset_token)

        return reset_token

    async def request_password_reset(self, email: str) -> bool:
        """
        Request a password reset for an email address.

        Always returns True to prevent email enumeration attacks.
        Only sends email if user exists and is active.

        Args:
            email: Email address to send reset to

        Returns:
            bool: Always True
        """
        user = await self.get_user_by_email(email)

        # Only proceed if user exists and is active
        if user and user.is_active:
            # Create reset token
            reset_token = await self.create_reset_token(user)

            # Build reset link
            reset_link = f"{settings.frontend_url}/reset-password?token={reset_token.token}"

            # Send email (fire and forget - don't fail if email fails)
            try:
                await send_password_reset_email(
                    to=user.email,
                    name=user.full_name or user.email,
                    reset_link=reset_link,
                    expiry_hours=settings.password_reset_token_expire_hours,
                )
            except Exception:
                # Log error but don't fail the request
                pass

        # Always return True to prevent email enumeration
        return True

    async def get_token_by_value(self, token: str) -> PasswordResetToken | None:
        """
        Get password reset token by token value.

        Args:
            token: Token string

        Returns:
            PasswordResetToken or None if not found
        """
        result = await self.db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token == token)
        )
        return result.scalar_one_or_none()

    async def validate_token(self, token: str) -> PasswordResetToken:
        """
        Validate a password reset token.

        Args:
            token: Token string

        Returns:
            PasswordResetToken: Valid token

        Raises:
            ValidationError: If token is invalid, expired, or already used
        """
        reset_token = await self.get_token_by_value(token)

        if not reset_token:
            raise ValidationError("Invalid password reset token")

        if reset_token.used_at is not None:
            raise ValidationError("Password reset token has already been used")

        if reset_token.expires_at < datetime.now(timezone.utc):
            raise ValidationError("Password reset token has expired")

        return reset_token

    async def reset_password(self, token: str, new_password: str) -> bool:
        """
        Reset a user's password using a valid token.

        Args:
            token: Password reset token
            new_password: New password to set

        Returns:
            bool: True if password was reset

        Raises:
            ValidationError: If token is invalid, expired, or already used
            AuthenticationError: If user not found or inactive
        """
        # Validate token
        reset_token = await self.validate_token(token)

        # Get user
        result = await self.db.execute(select(User).where(User.id == reset_token.user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise AuthenticationError("User not found")

        if not user.is_active:
            raise AuthenticationError("User account is inactive")

        # Update password
        user.hashed_password = hash_password(new_password)

        # Mark token as used
        reset_token.used_at = datetime.now(timezone.utc)

        # Reset any failed login attempts
        user.failed_login_attempts = 0
        user.locked_until = None

        # Revoke all refresh tokens (force re-login on all devices)
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(timezone.utc))
        )

        await self.db.commit()

        return True
