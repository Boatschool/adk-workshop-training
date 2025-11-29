"""Password reset service for managing password recovery."""

import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.exceptions import AuthenticationError, ValidationError
from src.core.security import hash_password, hash_token
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

    async def create_reset_token(self, user: User) -> tuple[PasswordResetToken, str]:
        """
        Create a password reset token for a user.

        SECURITY: The plain token is returned separately for the email link,
        but only the hash is stored in the database. This prevents token theft
        if the database is compromised (same pattern as refresh tokens).

        Args:
            user: User to create token for

        Returns:
            tuple[PasswordResetToken, str]: Created token record and plain token value
        """
        # Generate secure random token
        plain_token = secrets.token_urlsafe(32)

        # SECURITY: Hash the token for storage (never store plain tokens)
        token_hash = hash_token(plain_token)

        # Calculate expiration
        expires_at = datetime.now(UTC) + timedelta(
            hours=settings.password_reset_token_expire_hours
        )

        # Create token with hashed value in database
        reset_token = PasswordResetToken(
            token=token_hash,
            user_id=user.id,
            expires_at=expires_at,
        )

        self.db.add(reset_token)
        await self.db.commit()
        await self.db.refresh(reset_token)

        # Return both the DB record and the plain token for the email
        return reset_token, plain_token

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
            # Create reset token (returns DB record and plain token)
            _reset_token_record, plain_token = await self.create_reset_token(user)

            # Build reset link using the plain token (not the hash)
            reset_link = f"{settings.frontend_url}/reset-password?token={plain_token}"

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

        SECURITY: The provided plain token is hashed and compared against
        stored hashes (same pattern as refresh tokens).

        Args:
            token: Plain token string from the reset link

        Returns:
            PasswordResetToken or None if not found
        """
        # Hash the provided token to match against stored hash
        token_hash = hash_token(token)
        result = await self.db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token == token_hash)
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

        if reset_token.expires_at < datetime.now(UTC):
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
        reset_token.used_at = datetime.now(UTC)

        # Reset any failed login attempts
        user.failed_login_attempts = 0
        user.locked_until = None

        # Revoke all refresh tokens (force re-login on all devices)
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )

        await self.db.commit()

        return True
