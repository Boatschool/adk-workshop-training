"""Library service for managing library resources, bookmarks, and progress.

Library resources are stored in the shared schema and accessible by all tenants.
Bookmarks and progress are tenant-scoped (per-user within tenant).

NOTE: The search_path is already set by get_tenant_db_dependency to include
both the tenant schema AND adk_platform_shared, so no explicit schema switching
is needed. This allows tenant-scoped operations (bookmarks, progress) and
shared schema operations (library_resources) to work in the same session.
"""

from datetime import UTC, datetime

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.library import (
    LibraryResourceCreate,
    LibraryResourceFilters,
    LibraryResourceUpdate,
    ResourceProgressUpdate,
)
from src.core.constants import ResourceProgressStatus
from src.core.exceptions import NotFoundError
from src.db.models.library import LibraryResource, ResourceProgress, UserBookmark


class LibraryResourceService:
    """Service for library resource management (shared schema operations).

    Library resources are in the shared schema (adk_platform_shared.library_resources).
    The search_path set by get_tenant_db_dependency includes the shared schema,
    so resources are accessible without explicit schema switching.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize library resource service.

        Args:
            db: Database session (should have search_path including shared schema)
        """
        self.db = db

    async def create_resource(self, resource_data: LibraryResourceCreate) -> LibraryResource:
        """
        Create a new library resource.

        Args:
            resource_data: Resource creation data

        Returns:
            LibraryResource: Created resource
        """
        resource = LibraryResource(
            title=resource_data.title,
            description=resource_data.description,
            resource_type=resource_data.resource_type.value,
            source=resource_data.source.value,
            external_url=resource_data.external_url,
            content_path=resource_data.content_path,
            content_html=resource_data.content_html,
            topics=[t.value for t in resource_data.topics],
            difficulty=resource_data.difficulty.value,
            author=resource_data.author,
            estimated_minutes=resource_data.estimated_minutes,
            thumbnail_url=resource_data.thumbnail_url,
            featured=resource_data.featured,
        )

        self.db.add(resource)
        await self.db.commit()
        await self.db.refresh(resource)

        return resource

    async def get_resource_by_id(self, resource_id: str) -> LibraryResource | None:
        """
        Get library resource by ID.

        Args:
            resource_id: Resource UUID

        Returns:
            LibraryResource or None if not found
        """
        result = await self.db.execute(
            select(LibraryResource).where(LibraryResource.id == resource_id)
        )
        return result.scalar_one_or_none()

    async def update_resource(
        self, resource_id: str, resource_data: LibraryResourceUpdate
    ) -> LibraryResource:
        """
        Update an existing library resource.

        Args:
            resource_id: Resource UUID
            resource_data: Resource update data

        Returns:
            LibraryResource: Updated resource

        Raises:
            NotFoundError: If resource not found
        """
        resource = await self.get_resource_by_id(resource_id)
        if not resource:
            raise NotFoundError(f"Library resource with ID '{resource_id}' not found")

        update_data = resource_data.model_dump(exclude_unset=True)

        # Convert enums to their values
        if "resource_type" in update_data and update_data["resource_type"]:
            update_data["resource_type"] = update_data["resource_type"].value
        if "source" in update_data and update_data["source"]:
            update_data["source"] = update_data["source"].value
        if "difficulty" in update_data and update_data["difficulty"]:
            update_data["difficulty"] = update_data["difficulty"].value
        if "topics" in update_data and update_data["topics"]:
            update_data["topics"] = [t.value for t in update_data["topics"]]

        for field, value in update_data.items():
            if hasattr(resource, field):
                setattr(resource, field, value)

        await self.db.commit()
        await self.db.refresh(resource)

        return resource

    async def delete_resource(self, resource_id: str) -> None:
        """
        Delete a library resource.

        Args:
            resource_id: Resource UUID

        Raises:
            NotFoundError: If resource not found
        """
        resource = await self.get_resource_by_id(resource_id)
        if not resource:
            raise NotFoundError(f"Library resource with ID '{resource_id}' not found")

        await self.db.delete(resource)
        await self.db.commit()

    async def list_resources(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: LibraryResourceFilters | None = None,
    ) -> list[LibraryResource]:
        """
        List library resources with pagination and filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters

        Returns:
            list[LibraryResource]: List of resources
        """
        query = select(LibraryResource).order_by(
            LibraryResource.featured.desc(),
            LibraryResource.created_at.desc(),
        )

        if filters:
            conditions = []

            if filters.search:
                search_term = f"%{filters.search}%"
                conditions.append(
                    or_(
                        LibraryResource.title.ilike(search_term),
                        LibraryResource.description.ilike(search_term),
                    )
                )

            if filters.resource_type:
                conditions.append(LibraryResource.resource_type == filters.resource_type.value)

            if filters.topic:
                # Check if topic is in the topics array (PostgreSQL ARRAY contains)
                conditions.append(LibraryResource.topics.contains([filters.topic.value]))

            if filters.difficulty:
                conditions.append(LibraryResource.difficulty == filters.difficulty.value)

            if filters.featured is not None:
                conditions.append(LibraryResource.featured == filters.featured)

            if conditions:
                query = query.where(and_(*conditions))

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_featured_resources(self, limit: int = 6) -> list[LibraryResource]:
        """
        Get featured library resources.

        Args:
            limit: Maximum number of featured resources to return

        Returns:
            list[LibraryResource]: List of featured resources
        """
        result = await self.db.execute(
            select(LibraryResource)
            .where(LibraryResource.featured == True)  # noqa: E712
            .order_by(LibraryResource.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())


class UserBookmarkService:
    """Service for user bookmark management (tenant-scoped)."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize bookmark service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def toggle_bookmark(self, user_id: str, resource_id: str) -> UserBookmark | None:
        """
        Toggle bookmark for a resource. Creates if not exists, deletes if exists.

        Args:
            user_id: User UUID
            resource_id: Library resource UUID

        Returns:
            UserBookmark if created (with timestamp), None if removed
        """
        # Check if bookmark exists
        result = await self.db.execute(
            select(UserBookmark).where(
                and_(
                    UserBookmark.user_id == user_id,
                    UserBookmark.resource_id == resource_id,
                )
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            await self.db.delete(existing)
            await self.db.commit()
            return None
        else:
            bookmark = UserBookmark(user_id=user_id, resource_id=resource_id)
            self.db.add(bookmark)
            await self.db.commit()
            await self.db.refresh(bookmark)
            return bookmark

    async def is_bookmarked(self, user_id: str, resource_id: str) -> bool:
        """
        Check if a resource is bookmarked by the user.

        Args:
            user_id: User UUID
            resource_id: Library resource UUID

        Returns:
            bool: True if bookmarked
        """
        result = await self.db.execute(
            select(func.count(UserBookmark.id)).where(
                and_(
                    UserBookmark.user_id == user_id,
                    UserBookmark.resource_id == resource_id,
                )
            )
        )
        count = result.scalar()
        return count is not None and count > 0

    async def get_bookmark(self, user_id: str, resource_id: str) -> UserBookmark | None:
        """
        Get bookmark for a specific resource if it exists.

        Args:
            user_id: User UUID
            resource_id: Library resource UUID

        Returns:
            UserBookmark or None if not bookmarked
        """
        result = await self.db.execute(
            select(UserBookmark).where(
                and_(
                    UserBookmark.user_id == user_id,
                    UserBookmark.resource_id == resource_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_user_bookmarks(self, user_id: str) -> list[UserBookmark]:
        """
        Get all bookmarks for a user.

        Args:
            user_id: User UUID

        Returns:
            list[UserBookmark]: List of user's bookmarks
        """
        result = await self.db.execute(
            select(UserBookmark)
            .where(UserBookmark.user_id == user_id)
            .order_by(UserBookmark.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_bookmarked_resource_ids(self, user_id: str) -> set[str]:
        """
        Get set of bookmarked resource IDs for a user.

        Args:
            user_id: User UUID

        Returns:
            set[str]: Set of resource IDs
        """
        result = await self.db.execute(
            select(UserBookmark.resource_id).where(UserBookmark.user_id == user_id)
        )
        return {str(row[0]) for row in result.all()}


class ResourceProgressService:
    """Service for resource progress tracking (tenant-scoped)."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize progress service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def update_progress(
        self, user_id: str, resource_id: str, progress_data: ResourceProgressUpdate
    ) -> ResourceProgress:
        """
        Update or create progress for a resource.

        Args:
            user_id: User UUID
            resource_id: Library resource UUID
            progress_data: Progress update data

        Returns:
            ResourceProgress: Updated or created progress
        """
        # Check if progress exists
        result = await self.db.execute(
            select(ResourceProgress).where(
                and_(
                    ResourceProgress.user_id == user_id,
                    ResourceProgress.resource_id == resource_id,
                )
            )
        )
        progress = result.scalar_one_or_none()

        now = datetime.now(UTC)

        if progress:
            # Update existing progress
            progress.status = progress_data.status.value
            progress.last_viewed_at = now

            if progress_data.time_spent_seconds is not None:
                progress.time_spent_seconds += progress_data.time_spent_seconds

            if progress_data.status == ResourceProgressStatus.COMPLETED:
                progress.completed_at = now
        else:
            # Create new progress
            progress = ResourceProgress(
                user_id=user_id,
                resource_id=resource_id,
                status=progress_data.status.value,
                last_viewed_at=now,
                time_spent_seconds=progress_data.time_spent_seconds or 0,
                completed_at=(
                    now if progress_data.status == ResourceProgressStatus.COMPLETED else None
                ),
            )
            self.db.add(progress)

        await self.db.commit()
        await self.db.refresh(progress)

        return progress

    async def get_progress(self, user_id: str, resource_id: str) -> ResourceProgress | None:
        """
        Get progress for a specific resource.

        Args:
            user_id: User UUID
            resource_id: Library resource UUID

        Returns:
            ResourceProgress or None if not found
        """
        result = await self.db.execute(
            select(ResourceProgress).where(
                and_(
                    ResourceProgress.user_id == user_id,
                    ResourceProgress.resource_id == resource_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_user_progress(self, user_id: str) -> list[ResourceProgress]:
        """
        Get all progress records for a user.

        Args:
            user_id: User UUID

        Returns:
            list[ResourceProgress]: List of progress records
        """
        result = await self.db.execute(
            select(ResourceProgress)
            .where(ResourceProgress.user_id == user_id)
            .order_by(ResourceProgress.last_viewed_at.desc())
        )
        return list(result.scalars().all())

    async def get_progress_map(self, user_id: str) -> dict[str, ResourceProgress]:
        """
        Get a mapping of resource_id to progress for a user.

        Args:
            user_id: User UUID

        Returns:
            dict[str, ResourceProgress]: Map of resource_id to progress
        """
        progress_list = await self.get_user_progress(user_id)
        return {str(p.resource_id): p for p in progress_list}

    async def mark_as_viewed(self, user_id: str, resource_id: str) -> ResourceProgress:
        """
        Mark a resource as viewed (in_progress if not already completed).

        Args:
            user_id: User UUID
            resource_id: Library resource UUID

        Returns:
            ResourceProgress: Updated progress
        """
        existing = await self.get_progress(user_id, resource_id)

        if existing and existing.status == ResourceProgressStatus.COMPLETED.value:
            # Don't downgrade from completed
            existing.last_viewed_at = datetime.now(UTC)
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        return await self.update_progress(
            user_id,
            resource_id,
            ResourceProgressUpdate(
                status=ResourceProgressStatus.IN_PROGRESS, time_spent_seconds=None
            ),
        )
