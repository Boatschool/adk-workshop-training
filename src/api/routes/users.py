"""User management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_id, require_admin
from src.api.schemas.user import (
    UserCreate,
    UserCreateAdmin,
    UserLogin,
    UserResponse,
    UserUpdate,
    UserWithToken,
)
from src.core.exceptions import (
    AccountLockedError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
)
from src.core.security import create_access_token
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.db.session import get_db
from src.services.user_service import UserService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Register a new user in the tenant (self-registration).

    Always creates users with PARTICIPANT role. For elevated roles,
    use the POST /users/create endpoint (admin-only).

    Args:
        user_data: User registration data
        db: Database session
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: Created user with PARTICIPANT role

    Raises:
        HTTPException: If validation fails or email already exists
    """
    try:
        TenantContext.set(tenant_id)
        service = UserService(db, tenant_id)
        user = await service.create_user(user_data)
        return user
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_with_role(
    user_data: UserCreateAdmin,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Create a new user with specified role (admin-only endpoint).

    Requires admin privileges (SUPER_ADMIN or TENANT_ADMIN).

    Args:
        user_data: User creation data with role
        db: Database session
        current_user: Current authenticated admin user
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: Created user with specified role

    Raises:
        HTTPException: If validation fails or email already exists
    """
    try:
        TenantContext.set(tenant_id)
        service = UserService(db, tenant_id)
        user = await service.create_user_admin(user_data)
        return user
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=UserWithToken)
async def login_user(
    credentials: UserLogin,
    db: Annotated[AsyncSession, Depends(get_db)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Authenticate user and return access token.

    Args:
        credentials: User login credentials
        db: Database session
        tenant_id: Tenant ID from header

    Returns:
        UserWithToken: User data with access token

    Raises:
        HTTPException: If authentication fails
    """
    try:
        TenantContext.set(tenant_id)
        service = UserService(db, tenant_id)
        user = await service.authenticate_user(credentials.email, credentials.password)

        # Create JWT token
        token_data = {
            "user_id": str(user.id),
            "tenant_id": tenant_id,
            "role": user.role,  # user.role is already a string in the database
        }
        access_token = create_access_token(token_data)

        return UserWithToken(
            **user.__dict__,
            access_token=access_token,
            token_type="bearer",
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
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Get user by ID.

    Args:
        user_id: User UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: User data

    Raises:
        HTTPException: If user not found
    """
    TenantContext.set(tenant_id)
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
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Update an existing user.

    Requires admin role.

    Args:
        user_id: User UUID
        user_data: User update data
        db: Database session
        current_user: Current authenticated admin user
        tenant_id: Tenant ID from header

    Returns:
        UserResponse: Updated user

    Raises:
        HTTPException: If user not found
    """
    try:
        TenantContext.set(tenant_id)
        service = UserService(db, tenant_id)
        user = await service.update_user(user_id, user_data)
        return user
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/", response_model=list[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    is_active: Annotated[bool | None, Query()] = None,
):
    """
    List users with pagination and optional filtering.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return
        is_active: Filter by active status

    Returns:
        list[UserResponse]: List of users
    """
    TenantContext.set(tenant_id)
    service = UserService(db, tenant_id)
    users = await service.list_users(skip=skip, limit=limit, is_active=is_active)
    return users
