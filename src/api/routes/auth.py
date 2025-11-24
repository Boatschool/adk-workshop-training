"""Authentication API routes."""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_tenant_id
from src.api.schemas.user import TokenResponse
from src.core.config import get_settings
from src.core.exceptions import AuthenticationError
from src.core.security import create_access_token
from src.core.tenancy import TenantContext
from src.db.session import get_db
from src.services.refresh_token_service import RefreshTokenService

settings = get_settings()
router = APIRouter()


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_token: Annotated[str, Body(..., embed=True)],
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Refresh access token using a refresh token.

    Implements token rotation: the provided refresh token is revoked and
    a new refresh token is issued along with a new access token.

    Args:
        refresh_token: The refresh token to use
        db: Database session
        tenant_id: Tenant ID from header

    Returns:
        TokenResponse: New access token and refresh token

    Raises:
        HTTPException: If refresh token is invalid, expired, or revoked
    """
    try:
        TenantContext.set(tenant_id)
        refresh_service = RefreshTokenService(db, tenant_id)

        # Validate refresh token and get user
        user = await refresh_service.validate_and_get_user(refresh_token)

        # Revoke the old refresh token (token rotation)
        await refresh_service.revoke_token(refresh_token)

        # Create new access token
        token_data = {
            "user_id": str(user.id),
            "tenant_id": tenant_id,
            "role": user.role,
        }
        new_access_token = create_access_token(token_data)

        # Create new refresh token
        new_refresh_token = await refresh_service.create_refresh_token(user.id)

        # Calculate expiry in seconds
        expires_in = settings.jwt_access_token_expire_minutes * 60

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token.token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
