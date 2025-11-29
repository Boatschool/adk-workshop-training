"""Progress service for managing user exercise progress."""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.workshop import ProgressUpdate
from src.core.constants import ExerciseStatus
from src.core.exceptions import NotFoundError
from src.db.models.workshop import Progress


class ProgressService:
    """Service for progress tracking operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize progress service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def get_or_create_progress(self, user_id: str, exercise_id: str) -> Progress:
        """
        Get existing progress or create a new one.

        Args:
            user_id: User UUID
            exercise_id: Exercise UUID

        Returns:
            Progress: Progress record
        """
        progress = await self.get_progress_by_user_exercise(user_id, exercise_id)
        if progress:
            return progress

        progress = Progress(
            user_id=user_id,
            exercise_id=exercise_id,
            status=ExerciseStatus.NOT_STARTED.value,
        )

        self.db.add(progress)
        await self.db.commit()
        await self.db.refresh(progress)

        return progress

    async def get_progress_by_id(self, progress_id: str) -> Progress | None:
        """
        Get progress by ID.

        Args:
            progress_id: Progress UUID

        Returns:
            Progress or None if not found
        """
        result = await self.db.execute(select(Progress).where(Progress.id == progress_id))
        return result.scalar_one_or_none()

    async def get_progress_by_user_exercise(
        self, user_id: str, exercise_id: str
    ) -> Progress | None:
        """
        Get progress by user and exercise.

        Args:
            user_id: User UUID
            exercise_id: Exercise UUID

        Returns:
            Progress or None if not found
        """
        result = await self.db.execute(
            select(Progress).where(
                Progress.user_id == user_id,
                Progress.exercise_id == exercise_id,
            )
        )
        return result.scalar_one_or_none()

    async def update_progress(
        self, user_id: str, exercise_id: str, progress_data: ProgressUpdate
    ) -> Progress:
        """
        Update exercise progress for a user.

        Args:
            user_id: User UUID
            exercise_id: Exercise UUID
            progress_data: Progress update data

        Returns:
            Progress: Updated progress
        """
        progress = await self.get_or_create_progress(user_id, exercise_id)

        update_data = progress_data.model_dump(exclude_unset=True)

        # Handle status enum conversion
        if "status" in update_data and update_data["status"]:
            update_data["status"] = update_data["status"].value

        for field, value in update_data.items():
            if hasattr(progress, field):
                setattr(progress, field, value)

        # Auto-set completed_at when status changes to completed
        if progress.status == ExerciseStatus.COMPLETED.value and not progress.completed_at:
            progress.completed_at = datetime.now(UTC)

        await self.db.commit()
        await self.db.refresh(progress)

        return progress

    async def list_progress_by_user(
        self, user_id: str, skip: int = 0, limit: int = 100
    ) -> list[Progress]:
        """
        List all progress records for a user.

        Args:
            user_id: User UUID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            list[Progress]: List of progress records
        """
        result = await self.db.execute(
            select(Progress)
            .where(Progress.user_id == user_id)
            .order_by(Progress.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_progress_by_exercise(
        self, exercise_id: str, skip: int = 0, limit: int = 100
    ) -> list[Progress]:
        """
        List all progress records for an exercise.

        Args:
            exercise_id: Exercise UUID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            list[Progress]: List of progress records
        """
        result = await self.db.execute(
            select(Progress)
            .where(Progress.exercise_id == exercise_id)
            .order_by(Progress.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def delete_progress(self, progress_id: str) -> None:
        """
        Delete a progress record.

        Args:
            progress_id: Progress UUID

        Raises:
            NotFoundError: If progress not found
        """
        progress = await self.get_progress_by_id(progress_id)
        if not progress:
            raise NotFoundError(f"Progress with ID '{progress_id}' not found")

        await self.db.delete(progress)
        await self.db.commit()
