"""Exercise management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_id, require_instructor
from src.api.schemas.workshop import ExerciseCreate, ExerciseResponse, ExerciseUpdate
from src.core.exceptions import NotFoundError
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.db.models.workshop import Exercise
from src.db.session import get_db
from src.services.exercise_service import ExerciseService

router = APIRouter()


@router.post("", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_data: ExerciseCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> Exercise:
    """
    Create a new exercise.

    Requires instructor role or higher.

    Args:
        exercise_data: Exercise creation data
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header

    Returns:
        ExerciseResponse: Created exercise
    """
    TenantContext.set(tenant_id)
    service = ExerciseService(db, tenant_id)
    exercise = await service.create_exercise(exercise_data)
    return exercise


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> Exercise:
    """
    Get exercise by ID.

    Args:
        exercise_id: Exercise UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        ExerciseResponse: Exercise data

    Raises:
        HTTPException: If exercise not found
    """
    TenantContext.set(tenant_id)
    service = ExerciseService(db, tenant_id)
    exercise = await service.get_exercise_by_id(exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with ID '{exercise_id}' not found",
        )
    return exercise


@router.patch("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: str,
    exercise_data: ExerciseUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> Exercise:
    """
    Update an existing exercise.

    Requires instructor role or higher.

    Args:
        exercise_id: Exercise UUID
        exercise_data: Exercise update data
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header

    Returns:
        ExerciseResponse: Updated exercise

    Raises:
        HTTPException: If exercise not found
    """
    try:
        TenantContext.set(tenant_id)
        service = ExerciseService(db, tenant_id)
        exercise = await service.update_exercise(exercise_id, exercise_data)
        return exercise
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> None:
    """
    Delete an exercise.

    Requires instructor role or higher.

    Args:
        exercise_id: Exercise UUID
        db: Database session
        current_user: Current authenticated user (instructor or admin)
        tenant_id: Tenant ID from header

    Raises:
        HTTPException: If exercise not found
    """
    try:
        TenantContext.set(tenant_id)
        service = ExerciseService(db, tenant_id)
        await service.delete_exercise(exercise_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.get("", response_model=list[ExerciseResponse])
async def list_exercises(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    workshop_id: Annotated[str | None, Query(description="Filter by workshop ID")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[Exercise]:
    """
    List exercises with pagination and optional filtering.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        workshop_id: Filter by workshop ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[ExerciseResponse]: List of exercises
    """
    TenantContext.set(tenant_id)
    service = ExerciseService(db, tenant_id)
    exercises = await service.list_exercises(skip=skip, limit=limit, workshop_id=workshop_id)
    return exercises
