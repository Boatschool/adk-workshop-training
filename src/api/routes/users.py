"""User management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
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

        return UserWithToken(
            **user.__dict__,
            access_token=access_token,
            refresh_token=refresh_token.token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from None


@router.post("/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_with_role(
    user_data: UserCreateAdmin,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=UserWithToken)
async def login_user(
    credentials: UserLogin,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Authenticate user and return access token.

    Args:
        credentials: User login credentials
        db: Database session (with tenant schema already set)
        tenant_id: Tenant ID from header

    Returns:
        UserWithToken: User data with access token

    Raises:
        HTTPException: If authentication fails
    """
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

        return UserWithToken(
            **user.__dict__,
            access_token=access_token,
            refresh_token=refresh_token.token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except AccountLockedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
):
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
):
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
):
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/", response_model=list[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    is_active: Annotated[bool | None, Query()] = None,
):
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
