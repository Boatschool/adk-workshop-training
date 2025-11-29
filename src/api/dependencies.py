"""FastAPI dependencies for dependency injection."""

from collections.abc import AsyncGenerator, Awaitable, Callable
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import UserRole
from src.core.exceptions import AuthenticationError
from src.core.security import decode_access_token
from src.db.models.user import User
from src.db.session import TenantNotFoundError, get_tenant_db
from src.services.user_service import UserService

security = HTTPBearer()


async def get_tenant_id(
    x_tenant_id: Annotated[str | None, Header()] = None,
) -> str:
    """
    Extract tenant ID from request header.

    Args:
        x_tenant_id: Tenant ID from X-Tenant-ID header

    Returns:
        str: Tenant ID

    Raises:
        HTTPException: If tenant ID not provided
    """
    if not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Tenant-ID header is required",
        )
    return x_tenant_id


async def get_tenant_db_dependency(
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session with tenant schema properly set.

    This dependency ensures the tenant_id is resolved FIRST,
    then creates a database session with the correct schema search_path.

    SECURITY: Rejects unknown/invalid tenant IDs with 404 to prevent
    cross-tenant data access via spoofed headers.

    Args:
        tenant_id: Tenant ID from header (resolved first)

    Yields:
        AsyncSession: Database session scoped to tenant schema

    Raises:
        HTTPException 404: If tenant_id does not resolve to a valid schema
    """
    try:
        async for session in get_tenant_db(tenant_id):
            yield session
    except TenantNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> User:
    """
    Get the current authenticated user.

    Args:
        credentials: HTTP Bearer token
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Decode JWT token
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("user_id")
        token_tenant_id = payload.get("tenant_id")

        if not user_id:
            raise AuthenticationError("Invalid token payload")

        # Verify tenant matches
        if token_tenant_id != tenant_id:
            raise AuthenticationError("Tenant mismatch")

        # Get user from database (tenant schema already set by get_tenant_db_dependency)
        user_service = UserService(db, tenant_id)
        user = await user_service.get_user_by_id(user_id)

        if not user:
            raise AuthenticationError("User not found")

        if not user.is_active:
            raise AuthenticationError("User account is inactive")

        return user

    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from None


def require_role(
    *allowed_roles: UserRole,
) -> Callable[[Annotated[User, Depends(get_current_user)]], Awaitable[User]]:
    """
    Dependency factory for role-based authorization.

    Args:
        *allowed_roles: Roles that are allowed to access the endpoint

    Returns:
        Dependency function
    """

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        """
        Check if current user has required role.

        Args:
            current_user: Current authenticated user

        Returns:
            User: Current user if authorized

        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


# Convenience dependencies for common role checks
require_admin = require_role(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
require_instructor = require_role(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.INSTRUCTOR)
