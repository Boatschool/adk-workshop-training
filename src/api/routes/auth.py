"""Authentication API routes."""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_tenant_id
from src.api.schemas.user import TokenResponse
from src.core.config import get_settings
from src.core.exceptions import AuthenticationError, ValidationError
from src.core.security import create_access_token
from src.core.tenancy import TenantContext
from src.db.session import get_db
from src.services.password_reset_service import PasswordResetService
from src.services.refresh_token_service import RefreshTokenService

settings = get_settings()
router = APIRouter()


# Request/Response schemas for password reset
class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""

    email: EmailStr = Field(..., description="Email address to send reset link to")


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request."""

    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password (min 8 chars)")


class MessageResponse(BaseModel):
    """Schema for simple message responses."""

    message: str


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


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Request a password reset email.

    Always returns success to prevent email enumeration attacks.
    If the email exists and belongs to an active user, a reset email will be sent.

    Args:
        request: Email address to send reset link to
        db: Database session
        tenant_id: Tenant ID from header

    Returns:
        MessageResponse: Success message
    """
    TenantContext.set(tenant_id)
    service = PasswordResetService(db, tenant_id)
    await service.request_password_reset(request.email)

    return MessageResponse(
        message="If an account exists with this email, a password reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Reset password using a valid reset token.

    The token is single-use and expires after 1 hour (configurable).
    All existing sessions (refresh tokens) are invalidated on password reset.

    Args:
        request: Reset token and new password
        db: Database session
        tenant_id: Tenant ID from header

    Returns:
        MessageResponse: Success message

    Raises:
        HTTPException: If token is invalid, expired, or already used
    """
    try:
        TenantContext.set(tenant_id)
        service = PasswordResetService(db, tenant_id)
        await service.reset_password(request.token, request.new_password)

        return MessageResponse(message="Password has been reset successfully. Please log in.")
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
