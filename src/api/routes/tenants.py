"""Tenant management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import require_admin
from src.api.schemas.tenant import TenantCreate, TenantResponse, TenantUpdate
from src.core.exceptions import NotFoundError, ValidationError
from src.db.models.user import User
from src.db.session import get_db
from src.services.tenant_service import TenantService

router = APIRouter()


@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new tenant.

    This endpoint creates a new tenant and provisions its database schema.
    **Note**: This endpoint doesn't require authentication for initial tenant creation.

    Args:
        tenant_data: Tenant creation data
        db: Database session

    Returns:
        TenantResponse: Created tenant

    Raises:
        HTTPException: If validation fails or slug already exists
    """
    try:
        service = TenantService(db)
        tenant = await service.create_tenant(tenant_data)
        return tenant
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """
    Get tenant by ID.

    Requires admin role.

    Args:
        tenant_id: Tenant UUID
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        TenantResponse: Tenant data

    Raises:
        HTTPException: If tenant not found
    """
    service = TenantService(db)
    tenant = await service.get_tenant_by_id(tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tenant with ID '{tenant_id}' not found",
        )
    return tenant


@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: str,
    tenant_data: TenantUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """
    Update an existing tenant.

    Requires admin role.

    Args:
        tenant_id: Tenant UUID
        tenant_data: Tenant update data
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        TenantResponse: Updated tenant

    Raises:
        HTTPException: If tenant not found
    """
    try:
        service = TenantService(db)
        tenant = await service.update_tenant(tenant_id, tenant_data)
        return tenant
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/", response_model=list[TenantResponse])
async def list_tenants(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
):
    """
    List all tenants with pagination.

    Requires admin role.

    Args:
        db: Database session
        current_user: Current authenticated admin user
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[TenantResponse]: List of tenants
    """
    service = TenantService(db)
    tenants = await service.list_tenants(skip=skip, limit=limit)
    return tenants
