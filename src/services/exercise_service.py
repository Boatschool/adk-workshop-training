"""Exercise service for managing exercise operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.workshop import ExerciseCreate, ExerciseUpdate
from src.core.exceptions import NotFoundError
from src.db.models.workshop import Exercise


class ExerciseService:
    """Service for exercise management operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize exercise service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def create_exercise(self, exercise_data: ExerciseCreate) -> Exercise:
        """
        Create a new exercise.

        Args:
            exercise_data: Exercise creation data

        Returns:
            Exercise: Created exercise
        """
        exercise = Exercise(
            workshop_id=exercise_data.workshop_id,
            title=exercise_data.title,
            content_type=exercise_data.content_type,
            content_path=exercise_data.content_path,
            order_index=exercise_data.order_index,
        )

        self.db.add(exercise)
        await self.db.commit()
        await self.db.refresh(exercise)

        return exercise

    async def get_exercise_by_id(self, exercise_id: str) -> Exercise | None:
        """
        Get exercise by ID.

        Args:
            exercise_id: Exercise UUID

        Returns:
            Exercise or None if not found
        """
        result = await self.db.execute(
            select(Exercise).where(Exercise.id == exercise_id)
        )
        return result.scalar_one_or_none()

    async def update_exercise(
        self, exercise_id: str, exercise_data: ExerciseUpdate
    ) -> Exercise:
        """
        Update an existing exercise.

        Args:
            exercise_id: Exercise UUID
            exercise_data: Exercise update data

        Returns:
            Exercise: Updated exercise

        Raises:
            NotFoundError: If exercise not found
        """
        exercise = await self.get_exercise_by_id(exercise_id)
        if not exercise:
            raise NotFoundError(f"Exercise with ID '{exercise_id}' not found")

        update_data = exercise_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(exercise, field):
                setattr(exercise, field, value)

        await self.db.commit()
        await self.db.refresh(exercise)

        return exercise

    async def list_exercises(
        self,
        skip: int = 0,
        limit: int = 100,
        workshop_id: str | None = None,
    ) -> list[Exercise]:
        """
        List exercises with pagination and optional filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            workshop_id: Filter by workshop ID

        Returns:
            list[Exercise]: List of exercises
        """
        query = select(Exercise).order_by(Exercise.order_index.asc())

        if workshop_id:
            query = query.where(Exercise.workshop_id == workshop_id)

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def delete_exercise(self, exercise_id: str) -> None:
        """
        Delete an exercise.

        Args:
            exercise_id: Exercise UUID

        Raises:
            NotFoundError: If exercise not found
        """
        exercise = await self.get_exercise_by_id(exercise_id)
        if not exercise:
            raise NotFoundError(f"Exercise with ID '{exercise_id}' not found")

        await self.db.delete(exercise)
        await self.db.commit()
