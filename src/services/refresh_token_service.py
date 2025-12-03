"""Refresh token service for managing refresh token operations."""

import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.exceptions import AuthenticationError
from src.core.security import hash_token
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

        The plain token is returned to the client, but only the hash is stored
        in the database. This prevents token theft if the database is compromised.

        Args:
            user_id: User UUID

        Returns:
            RefreshToken: Created refresh token with plain token value
                          (the token attribute contains the plain value for client response)

        """
        # Generate secure random token
        plain_token = secrets.token_urlsafe(32)

        # Hash the token for storage (never store plain tokens)
        token_hash = hash_token(plain_token)

        # Calculate expiration
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)

        # Create token with hashed value in database
        refresh_token = RefreshToken(
            token=token_hash,
            user_id=user_id,
            expires_at=expires_at,
        )

        self.db.add(refresh_token)
        await self.db.commit()
        # Note: We skip db.refresh() here because after commit, the search_path
        # may be reset and we already have all the data we need from the insert.

        # Return plain token to client (override the hash temporarily for response)
        # The caller will use refresh_token.token which now contains plain value
        refresh_token.token = plain_token

        return refresh_token

    async def get_by_token(self, token: str) -> RefreshToken | None:
        """
        Get refresh token by token value.

        The provided plain token is hashed and compared against stored hashes.

        Args:
            token: Plain token string from client

        Returns:
            RefreshToken or None if not found
        """
        # Hash the provided token to match against stored hash
        token_hash = hash_token(token)
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.token == token_hash))
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
        if refresh_token.expires_at < datetime.now(UTC):
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
            refresh_token.revoked_at = datetime.now(UTC)
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
            token.revoked_at = datetime.now(UTC)
            count += 1

        await self.db.commit()
        return count
