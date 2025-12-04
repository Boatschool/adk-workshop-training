"""User management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_current_user,
    get_tenant_db_dependency,
    get_tenant_id,
    require_admin,
)
from src.api.schemas.user import (
    UserCreate,
    UserCreateAdmin,
    UserLogin,
    UserResponse,
    UserUpdate,
    UserWithToken,
)
from src.core.audit import AuditEvent, log_audit_event
from src.core.constants import UserRole
from src.core.config import get_settings
from src.core.exceptions import (
    AccountLockedError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
)
from src.core.security import create_access_token
from src.db.models.user import User
from src.services.refresh_token_service import RefreshTokenService
from src.services.user_service import UserService

settings = get_settings()

router = APIRouter()


@router.post("/register", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: Request,
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> UserWithToken:
    """
    Register a new user in the tenant (self-registration).

    Always creates users with PARTICIPANT role. For elevated roles,
    use the POST /users/create endpoint (admin-only).

    Returns access and refresh tokens so users are automatically
    logged in after registration.

    Args:
        user_data: User registration data
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        UserWithToken: Created user with access and refresh tokens

    Raises:
        HTTPException: If validation fails or email already exists
    """
    # Get client info for audit logging
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
        service = UserService(db, tenant_id)
        user = await service.create_user(user_data)

        # Create JWT access token
        token_data = {
            "user_id": str(user.id),
            "tenant_id": tenant_id,
            "role": user.role,
        }
        access_token = create_access_token(token_data)

        # Create refresh token
        refresh_service = RefreshTokenService(db, tenant_id)
        refresh_token = await refresh_service.create_refresh_token(user.id)

        # Calculate expiry in seconds
        expires_in = settings.jwt_access_token_expire_minutes * 60

        # Audit log successful registration
        log_audit_event(
            AuditEvent.REGISTER,
            tenant_id=tenant_id,
            user_id=str(user.id),
            email=user_data.email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=True,
        )

        # Build response using explicit field mapping to avoid SQLAlchemy internal fields
        return UserWithToken(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=UserRole(user.role),
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            access_token=access_token,
            refresh_token=refresh_token.token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except ValidationError as e:
        # Audit log failed registration
        log_audit_event(
            AuditEvent.REGISTER,
            tenant_id=tenant_id,
            email=user_data.email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": str(e)},
        )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None


@router.post("/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_with_role(
    user_data: UserCreateAdmin,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> User:
    """
    Create a new user with specified role (admin-only endpoint).

    Requires admin privileges (SUPER_ADMIN or TENANT_ADMIN).

    Args:
        user_data: User creation data with role
        db: Database session (with tenant schema already set)
        current_user: Current authenticated admin user
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: Created user with specified role

    Raises:
        HTTPException: If validation fails or email already exists
    """
    try:
        service = UserService(db, tenant_id)
        user = await service.create_user_admin(user_data)
        return user
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None


@router.post("/login", response_model=UserWithToken)
async def login_user(
    request: Request,
    credentials: UserLogin,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> UserWithToken:
    """
    Authenticate user and return access token.

    Args:
        request: FastAPI request object
        credentials: User login credentials
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        UserWithToken: User data with access token

    Raises:
        HTTPException: If authentication fails
    """
    # Get client info for audit logging
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
        service = UserService(db, tenant_id)
        user = await service.authenticate_user(credentials.email, credentials.password)

        # Create JWT access token
        token_data = {
            "user_id": str(user.id),
            "tenant_id": tenant_id,
            "role": user.role,  # user.role is already a string in the database
        }
        access_token = create_access_token(token_data)

        # Create refresh token
        refresh_service = RefreshTokenService(db, tenant_id)
        refresh_token = await refresh_service.create_refresh_token(user.id)

        # Calculate expiry in seconds
        expires_in = settings.jwt_access_token_expire_minutes * 60

        # Audit log successful login
        log_audit_event(
            AuditEvent.LOGIN_SUCCESS,
            tenant_id=tenant_id,
            user_id=str(user.id),
            email=credentials.email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=True,
        )

        # Build response using explicit field mapping to avoid SQLAlchemy internal fields
        return UserWithToken(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=UserRole(user.role),
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            access_token=access_token,
            refresh_token=refresh_token.token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except AccountLockedError as e:
        # Audit log account locked
        log_audit_event(
            AuditEvent.ACCOUNT_LOCKED,
            tenant_id=tenant_id,
            email=credentials.email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": "too_many_failed_attempts"},
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from None
    except AuthenticationError as e:
        # Audit log failed login
        log_audit_event(
            AuditEvent.LOGIN_FAILURE,
            tenant_id=tenant_id,
            email=credentials.email,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            details={"reason": "invalid_credentials"},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from None


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Get current authenticated user information.

    Args:
        current_user: Current authenticated user

    Returns:
        UserResponse: Current user data
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> User:
    """
    Get user by ID.

    Args:
        user_id: User UUID
        db: Database session (with tenant schema already set)
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: User data

    Raises:
        HTTPException: If user not found
    """
    service = UserService(db, tenant_id)
    user = await service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found",
        )
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> User:
    """
    Update an existing user.

    Requires admin role.

    Args:
        user_id: User UUID
        user_data: User update data
        db: Database session (with tenant schema already set)
        current_user: Current authenticated admin user
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: Updated user

    Raises:
        HTTPException: If user not found
    """
    try:
        service = UserService(db, tenant_id)
        user = await service.update_user(user_id, user_data)
        return user
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.get("/", response_model=list[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    is_active: Annotated[bool | None, Query()] = None,
) -> list[User]:
    """
    List users with pagination and optional filtering.

    Args:
        db: Database session (with tenant schema already set)
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return
        is_active: Filter by active status

    Returns:
        list[UserResponse]: List of users
    """
    service = UserService(db, tenant_id)
    users = await service.list_users(skip=skip, limit=limit, is_active=is_active)
    return users
