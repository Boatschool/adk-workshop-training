"""Workshop service for managing workshop operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.workshop import WorkshopCreate, WorkshopUpdate
from src.core.exceptions import NotFoundError
from src.db.models.workshop import Workshop


class WorkshopService:
    """Service for workshop management operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize workshop service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def create_workshop(self, workshop_data: WorkshopCreate, creator_id: str) -> Workshop:
        """
        Create a new workshop.

        Args:
            workshop_data: Workshop creation data
            creator_id: UUID of the user creating the workshop

        Returns:
            Workshop: Created workshop
        """
        workshop = Workshop(
            title=workshop_data.title,
            description=workshop_data.description,
            start_date=workshop_data.start_date,
            end_date=workshop_data.end_date,
            created_by=creator_id,
        )

        self.db.add(workshop)
        await self.db.commit()
        await self.db.refresh(workshop)

        return workshop

    async def get_workshop_by_id(self, workshop_id: str) -> Workshop | None:
        """
        Get workshop by ID.

        Args:
            workshop_id: Workshop UUID

        Returns:
            Workshop or None if not found
        """
        result = await self.db.execute(select(Workshop).where(Workshop.id == workshop_id))
        return result.scalar_one_or_none()

    async def update_workshop(self, workshop_id: str, workshop_data: WorkshopUpdate) -> Workshop:
        """
        Update an existing workshop.

        Args:
            workshop_id: Workshop UUID
            workshop_data: Workshop update data

        Returns:
            Workshop: Updated workshop

        Raises:
            NotFoundError: If workshop not found
        """
        workshop = await self.get_workshop_by_id(workshop_id)
        if not workshop:
            raise NotFoundError(f"Workshop with ID '{workshop_id}' not found")

        # Update fields
        update_data = workshop_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(workshop, field):
                setattr(workshop, field, value)

        await self.db.commit()
        await self.db.refresh(workshop)

        return workshop

    async def list_workshops(
        self, skip: int = 0, limit: int = 100, status: str | None = None
    ) -> list[Workshop]:
        """
        List workshops with pagination and optional filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Filter by workshop status

        Returns:
            list[Workshop]: List of workshops
        """
        query = select(Workshop).order_by(Workshop.created_at.desc())

        if status:
            query = query.where(Workshop.status == status)

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def delete_workshop(self, workshop_id: str) -> None:
        """
        Delete a workshop.

        Args:
            workshop_id: Workshop UUID

        Raises:
            NotFoundError: If workshop not found
        """
        workshop = await self.get_workshop_by_id(workshop_id)
        if not workshop:
            raise NotFoundError(f"Workshop with ID '{workshop_id}' not found")

        await self.db.delete(workshop)
        await self.db.commit()
