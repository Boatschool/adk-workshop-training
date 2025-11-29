"""Progress tracking API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_id, require_instructor
from src.api.schemas.workshop import ProgressResponse, ProgressUpdate
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.db.models.workshop import Progress
from src.db.session import get_db
from src.services.progress_service import ProgressService

router = APIRouter()


@router.put("/exercises/{exercise_id}", response_model=ProgressResponse)
async def update_progress(
    exercise_id: str,
    progress_data: ProgressUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> Progress:
    """
    Update progress for an exercise.

    Creates the progress record if it doesn't exist.

    Args:
        exercise_id: Exercise UUID
        progress_data: Progress update data
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        ProgressResponse: Updated progress
    """
    TenantContext.set(tenant_id)
    service = ProgressService(db, tenant_id)
    progress = await service.update_progress(str(current_user.id), exercise_id, progress_data)
    return progress


@router.get("/{progress_id}", response_model=ProgressResponse)
async def get_progress(
    progress_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> Progress:
    """
    Get progress by ID.

    Args:
        progress_id: Progress UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        ProgressResponse: Progress data

    Raises:
        HTTPException: If progress not found
    """
    TenantContext.set(tenant_id)
    service = ProgressService(db, tenant_id)
    progress = await service.get_progress_by_id(progress_id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress with ID '{progress_id}' not found",
        )
    return progress


@router.get("/user/{user_id}", response_model=list[ProgressResponse])
async def list_progress_by_user(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[Progress]:
    """
    List progress records for a specific user.

    Users can view their own progress. Instructors can view any user's progress.

    Args:
        user_id: User UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[ProgressResponse]: List of progress records

    Raises:
        HTTPException: If user doesn't have permission
    """
    # Users can view their own progress, instructors can view all
    if str(current_user.id) != user_id and current_user.role not in [
        "instructor",
        "tenant_admin",
        "super_admin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own progress",
        )

    TenantContext.set(tenant_id)
    service = ProgressService(db, tenant_id)
    progress_list = await service.list_progress_by_user(user_id, skip=skip, limit=limit)
    return progress_list


@router.get("/exercise/{exercise_id}", response_model=list[ProgressResponse])
async def list_progress_by_exercise(
    exercise_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[Progress]:
    """
    List progress records for a specific exercise.

    Requires instructor role or higher to view all users' progress.

    Args:
        exercise_id: Exercise UUID
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[ProgressResponse]: List of progress records
    """
    TenantContext.set(tenant_id)
    service = ProgressService(db, tenant_id)
    progress_list = await service.list_progress_by_exercise(exercise_id, skip=skip, limit=limit)
    return progress_list


@router.get("/me", response_model=list[ProgressResponse])
async def get_my_progress(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[Progress]:
    """
    Get current user's progress across all exercises.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[ProgressResponse]: List of progress records
    """
    TenantContext.set(tenant_id)
    service = ProgressService(db, tenant_id)
    progress_list = await service.list_progress_by_user(
        str(current_user.id), skip=skip, limit=limit
    )
    return progress_list
