"""Workshop management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_id, require_instructor
from src.api.schemas.workshop import WorkshopCreate, WorkshopResponse, WorkshopUpdate
from src.core.exceptions import NotFoundError
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.db.session import get_db
from src.services.workshop_service import WorkshopService

router = APIRouter()


@router.post("/", response_model=WorkshopResponse, status_code=status.HTTP_201_CREATED)
async def create_workshop(
    workshop_data: WorkshopCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Create a new workshop.

    Requires instructor role or higher.

    Args:
        workshop_data: Workshop creation data
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header

    Returns:
        WorkshopResponse: Created workshop
    """
    TenantContext.set(tenant_id)
    service = WorkshopService(db, tenant_id)
    workshop = await service.create_workshop(workshop_data, str(current_user.id))
    return workshop


@router.get("/{workshop_id}", response_model=WorkshopResponse)
async def get_workshop(
    workshop_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Get workshop by ID.

    Args:
        workshop_id: Workshop UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        WorkshopResponse: Workshop data

    Raises:
        HTTPException: If workshop not found
    """
    TenantContext.set(tenant_id)
    service = WorkshopService(db, tenant_id)
    workshop = await service.get_workshop_by_id(workshop_id)
    if not workshop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workshop with ID '{workshop_id}' not found",
        )
    return workshop


@router.patch("/{workshop_id}", response_model=WorkshopResponse)
async def update_workshop(
    workshop_id: str,
    workshop_data: WorkshopUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Update an existing workshop.

    Requires instructor role or higher.

    Args:
        workshop_id: Workshop UUID
        workshop_data: Workshop update data
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header

    Returns:
        WorkshopResponse: Updated workshop

    Raises:
        HTTPException: If workshop not found
    """
    try:
        TenantContext.set(tenant_id)
        service = WorkshopService(db, tenant_id)
        workshop = await service.update_workshop(workshop_id, workshop_data)
        return workshop
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{workshop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workshop(
    workshop_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Delete a workshop.

    Requires instructor role or higher.

    Args:
        workshop_id: Workshop UUID
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header

    Raises:
        HTTPException: If workshop not found
    """
    try:
        TenantContext.set(tenant_id)
        service = WorkshopService(db, tenant_id)
        await service.delete_workshop(workshop_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/", response_model=list[WorkshopResponse])
async def list_workshops(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    status: Annotated[str | None, Query()] = None,
):
    """
    List workshops with pagination and optional filtering.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Filter by workshop status

    Returns:
        list[WorkshopResponse]: List of workshops
    """
    TenantContext.set(tenant_id)
    service = WorkshopService(db, tenant_id)
    workshops = await service.list_workshops(skip=skip, limit=limit, status=status)
    return workshops
