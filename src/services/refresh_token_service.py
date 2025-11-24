"""Refresh token service for managing refresh token operations."""

import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.exceptions import AuthenticationError
from src.db.models.refresh_token import RefreshToken
from src.db.models.user import User

settings = get_settings()


class RefreshTokenService:
    """Service for refresh token management operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize refresh token service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def create_refresh_token(self, user_id: UUID) -> RefreshToken:
        """
        Create a new refresh token for a user.

        Args:
            user_id: User UUID

        Returns:
            RefreshToken: Created refresh token

        """
        # Generate secure random token
        token_value = secrets.token_urlsafe(32)

        # Calculate expiration
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)

        # Create token
        refresh_token = RefreshToken(
            token=token_value,
            user_id=user_id,
            expires_at=expires_at,
        )

        self.db.add(refresh_token)
        await self.db.commit()
        await self.db.refresh(refresh_token)

        return refresh_token

    async def get_by_token(self, token: str) -> RefreshToken | None:
        """
        Get refresh token by token value.

        Args:
            token: Token string

        Returns:
            RefreshToken or None if not found
        """
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.token == token))
        return result.scalar_one_or_none()

    async def validate_and_get_user(self, token: str) -> User:
        """
        Validate refresh token and return associated user.

        Args:
            token: Token string

        Returns:
            User: User associated with token

        Raises:
            AuthenticationError: If token is invalid, expired, or revoked
        """
        # Find token
        refresh_token = await self.get_by_token(token)
        if not refresh_token:
            raise AuthenticationError("Invalid refresh token")

        # Check if token is revoked
        if refresh_token.revoked_at is not None:
            raise AuthenticationError("Refresh token has been revoked")

        # Check if token is expired
        if refresh_token.expires_at < datetime.now(timezone.utc):
            raise AuthenticationError("Refresh token has expired")

        # Get user
        result = await self.db.execute(select(User).where(User.id == refresh_token.user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise AuthenticationError("User not found")

        if not user.is_active:
            raise AuthenticationError("User account is inactive")

        return user

    async def revoke_token(self, token: str) -> None:
        """
        Revoke a refresh token.

        Args:
            token: Token string to revoke
        """
        refresh_token = await self.get_by_token(token)
        if refresh_token:
            refresh_token.revoked_at = datetime.now(timezone.utc)
            await self.db.commit()

    async def revoke_all_user_tokens(self, user_id: UUID) -> int:
        """
        Revoke all refresh tokens for a user.

        Args:
            user_id: User UUID

        Returns:
            int: Number of tokens revoked
        """
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)
            )
        )
        tokens = result.scalars().all()

        count = 0
        for token in tokens:
            token.revoked_at = datetime.now(timezone.utc)
            count += 1

        await self.db.commit()
        return count
