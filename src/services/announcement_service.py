"""Announcement service for What's New section management."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.announcement import AnnouncementCreate, AnnouncementUpdate
from src.core.exceptions import NotFoundError
from src.db.models.announcement import Announcement


class AnnouncementService:
    """Service for managing announcements (What's New section)."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_announcements(
        self,
        limit: int = 5,
    ) -> list[Announcement]:
        """
        Get active announcements for display on dashboard.

        Only returns announcements that are:
        - Active (is_active=True)
        - Within their start/expiration window (if set)

        Args:
            limit: Maximum number of announcements to return

        Returns:
            List of active announcements ordered by display_order
        """
        now = datetime.now(UTC)

        query = (
            select(Announcement)
            .where(Announcement.is_active == True)  # noqa: E712
            .where(
                (Announcement.starts_at == None) | (Announcement.starts_at <= now)  # noqa: E711
            )
            .where(
                (Announcement.expires_at == None) | (Announcement.expires_at > now)  # noqa: E711
            )
            .order_by(Announcement.display_order.asc(), Announcement.created_at.desc())
            .limit(limit)
        )

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_all_announcements(
        self,
        include_inactive: bool = True,
    ) -> tuple[list[Announcement], int]:
        """
        Get all announcements for admin management.

        Args:
            include_inactive: Whether to include inactive announcements

        Returns:
            Tuple of (announcements list, total count)
        """
        # Build base query
        query = select(Announcement)

        if not include_inactive:
            query = query.where(Announcement.is_active == True)  # noqa: E712

        # Get count
        count_query = select(func.count()).select_from(Announcement)
        if not include_inactive:
            count_query = count_query.where(Announcement.is_active == True)  # noqa: E712

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get announcements ordered by display_order
        query = query.order_by(
            Announcement.display_order.asc(),
            Announcement.created_at.desc(),
        )

        result = await self.db.execute(query)
        announcements = list(result.scalars().all())

        return announcements, total

    async def get_announcement_by_id(self, announcement_id: UUID) -> Announcement | None:
        """
        Get a single announcement by ID.

        Args:
            announcement_id: Announcement UUID

        Returns:
            Announcement if found, None otherwise
        """
        query = select(Announcement).where(Announcement.id == announcement_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_announcement(
        self,
        data: AnnouncementCreate,
        created_by: UUID | None = None,
    ) -> Announcement:
        """
        Create a new announcement.

        Args:
            data: Announcement creation data
            created_by: UUID of the user creating the announcement

        Returns:
            Created announcement
        """
        announcement = Announcement(
            title=data.title,
            description=data.description,
            announcement_type=data.announcement_type,
            link_url=data.link_url,
            badge_text=data.badge_text,
            badge_color=data.badge_color,
            display_order=data.display_order,
            is_active=data.is_active,
            starts_at=data.starts_at,
            expires_at=data.expires_at,
            created_by=created_by,
        )

        self.db.add(announcement)
        await self.db.flush()
        await self.db.refresh(announcement)

        return announcement

    async def update_announcement(
        self,
        announcement_id: UUID,
        data: AnnouncementUpdate,
    ) -> Announcement:
        """
        Update an existing announcement.

        Args:
            announcement_id: Announcement UUID
            data: Announcement update data

        Returns:
            Updated announcement

        Raises:
            NotFoundError: If announcement not found
        """
        # Get existing announcement
        announcement = await self.get_announcement_by_id(announcement_id)
        if not announcement:
            raise NotFoundError(f"Announcement '{announcement_id}' not found")

        # Build update values
        update_values = {}
        for field, value in data.model_dump(exclude_unset=True).items():
            if value is not None or field in ["link_url", "badge_text", "starts_at", "expires_at"]:
                update_values[field] = value

        if update_values:
            update_values["updated_at"] = datetime.now(UTC)

            stmt = (
                update(Announcement)
                .where(Announcement.id == announcement_id)
                .values(**update_values)
            )
            await self.db.execute(stmt)
            await self.db.flush()

            # Refresh to get updated values
            await self.db.refresh(announcement)

        return announcement

    async def delete_announcement(self, announcement_id: UUID) -> None:
        """
        Delete an announcement.

        Args:
            announcement_id: Announcement UUID

        Raises:
            NotFoundError: If announcement not found
        """
        # Check if announcement exists
        announcement = await self.get_announcement_by_id(announcement_id)
        if not announcement:
            raise NotFoundError(f"Announcement '{announcement_id}' not found")

        stmt = delete(Announcement).where(Announcement.id == announcement_id)
        await self.db.execute(stmt)
        await self.db.flush()

    async def reorder_announcements(self, order_map: dict[UUID, int]) -> None:
        """
        Reorder announcements by updating display_order.

        Args:
            order_map: Dict mapping announcement_id to new display_order
        """
        for announcement_id, new_order in order_map.items():
            stmt = (
                update(Announcement)
                .where(Announcement.id == announcement_id)
                .values(display_order=new_order, updated_at=datetime.now(UTC))
            )
            await self.db.execute(stmt)

        await self.db.flush()
