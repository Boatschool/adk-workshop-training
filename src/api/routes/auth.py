"""Authentication API routes."""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_db_dependency, get_tenant_id
from src.api.schemas.user import TokenResponse
from src.core.audit import AuditEvent, log_audit_event
from src.core.config import get_settings
from src.core.exceptions import AuthenticationError, ValidationError
from src.core.security import create_access_token, hash_password, verify_password
from src.db.models.user import User
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


class ChangePasswordRequest(BaseModel):
    """Schema for change password request."""

    current_password: str = Field(..., description="Current password for verification")
    new_password: str = Field(..., min_length=8, description="New password (min 8 chars)")


class MessageResponse(BaseModel):
    """Schema for simple message responses."""

    message: str


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    refresh_token: Annotated[str, Body(..., embed=True)],
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> TokenResponse:
    """
    Refresh access token using a refresh token.

    Implements token rotation: the provided refresh token is revoked and
    a new refresh token is issued along with a new access token.

    Args:
        request: FastAPI request object
        refresh_token: The refresh token to use
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        TokenResponse: New access token and refresh token

    Raises:
        HTTPException: If refresh token is invalid, expired, or revoked
    """
    # Get client info for audit logging
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
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

        # Audit log token refresh
        log_audit_event(
            AuditEvent.TOKEN_REFRESH,
            tenant_id=tenant_id,
            user_id=str(user.id),
            ip_address=client_ip,
            user_agent=user_agent,
            success=True,
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token.token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except AuthenticationError as e:
        # Audit log failed token refresh
        log_audit_event(
            AuditEvent.TOKEN_REFRESH,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": str(e)},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from None


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    http_request: Request,
    request: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> MessageResponse:
    """
    Request a password reset email.

    Always returns success to prevent email enumeration attacks.
    If the email exists and belongs to an active user, a reset email will be sent.

    Args:
        http_request: FastAPI request object
        request: Email address to send reset link to
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        MessageResponse: Success message
    """
    # Get client info for audit logging
    client_ip = http_request.client.host if http_request.client else None
    user_agent = http_request.headers.get("user-agent")

    service = PasswordResetService(db, tenant_id)
    await service.request_password_reset(request.email)

    # Audit log password reset request (always log, even if user not found)
    log_audit_event(
        AuditEvent.PASSWORD_RESET_REQUEST,
        tenant_id=tenant_id,
        email=request.email,
        ip_address=client_ip,
        user_agent=user_agent,
        success=True,
    )

    return MessageResponse(
        message="If an account exists with this email, a password reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    http_request: Request,
    request: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> MessageResponse:
    """
    Reset password using a valid reset token.

    The token is single-use and expires after 1 hour (configurable).
    All existing sessions (refresh tokens) are invalidated on password reset.

    Args:
        http_request: FastAPI request object
        request: Reset token and new password
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        MessageResponse: Success message

    Raises:
        HTTPException: If token is invalid, expired, or already used
    """
    # Get client info for audit logging
    client_ip = http_request.client.host if http_request.client else None
    user_agent = http_request.headers.get("user-agent")

    try:
        service = PasswordResetService(db, tenant_id)
        await service.reset_password(request.token, request.new_password)

        # Audit log successful password reset
        log_audit_event(
            AuditEvent.PASSWORD_RESET_COMPLETE,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            success=True,
        )

        return MessageResponse(message="Password has been reset successfully. Please log in.")
    except ValidationError as e:
        # Audit log failed password reset
        log_audit_event(
            AuditEvent.PASSWORD_RESET_COMPLETE,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": "validation_error"},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from None
    except AuthenticationError as e:
        # Audit log failed password reset (invalid token)
        log_audit_event(
            AuditEvent.PASSWORD_RESET_COMPLETE,
            tenant_id=tenant_id,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": "invalid_token"},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        ) from None


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    http_request: Request,
    request: ChangePasswordRequest,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> MessageResponse:
    """
    Change password for the currently authenticated user.

    Requires the current password for verification.
    Invalidates all existing sessions (refresh tokens revoked) for security.

    Args:
        http_request: FastAPI request object
        request: Current password and new password
        db: Database session (with tenant schema already set)
        current_user: Currently authenticated user
        tenant_id: Tenant ID from header

    Returns:
        MessageResponse: Success message with count of revoked sessions

    Raises:
        HTTPException: If current password is incorrect
    """
    # Get client info for audit logging
    client_ip = http_request.client.host if http_request.client else None
    user_agent = http_request.headers.get("user-agent")

    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        # Audit log failed password change
        log_audit_event(
            AuditEvent.PASSWORD_CHANGE,
            tenant_id=tenant_id,
            user_id=str(current_user.id),
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": "incorrect_current_password"},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Check that new password is different from current
    if verify_password(request.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    # Update password
    current_user.hashed_password = hash_password(request.new_password)

    # Revoke all refresh tokens (force re-login on all devices)
    # This ensures stolen tokens cannot be used after password change
    refresh_service = RefreshTokenService(db, tenant_id)
    revoked_count = await refresh_service.revoke_all_user_tokens(current_user.id)

    await db.commit()

    # Audit log successful password change
    log_audit_event(
        AuditEvent.PASSWORD_CHANGE,
        tenant_id=tenant_id,
        user_id=str(current_user.id),
        ip_address=client_ip,
        user_agent=user_agent,
        success=True,
        details={"sessions_revoked": revoked_count},
    )

    return MessageResponse(
        message=f"Password changed successfully. {revoked_count} session(s) invalidated."
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> MessageResponse:
    """
    Logout the current user by revoking all refresh tokens.

    This invalidates all sessions for the user across all devices.
    The current access token remains valid until it expires.

    Args:
        request: FastAPI request object
        db: Database session (with tenant schema already set)
        current_user: Currently authenticated user
        tenant_id: Tenant ID from header

    Returns:
        MessageResponse: Success message with count of revoked sessions
    """
    # Get client info for audit logging
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    refresh_service = RefreshTokenService(db, tenant_id)

    # Revoke all refresh tokens for this user
    revoked_count = await refresh_service.revoke_all_user_tokens(current_user.id)

    # Audit log logout
    log_audit_event(
        AuditEvent.LOGOUT,
        tenant_id=tenant_id,
        user_id=str(current_user.id),
        ip_address=client_ip,
        user_agent=user_agent,
        success=True,
        details={"sessions_revoked": revoked_count},
    )

    return MessageResponse(
        message=f"Logged out successfully. {revoked_count} session(s) invalidated."
    )
