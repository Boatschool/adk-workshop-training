"""Guide service for managing platform documentation.

Guides are stored in the shared schema and accessible by all tenants.
They provide platform-wide documentation and tutorials.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.guide import GuideCreate, GuideUpdate
from src.core.exceptions import ConflictError, NotFoundError
from src.db.models.guide import Guide


class GuideService:
    """Service for guide management (shared schema operations).

    Guides are in the shared schema (adk_platform_shared.guides).
    The search_path set by get_shared_db_dependency includes the shared schema,
    so guides are accessible without explicit schema switching.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize guide service.

        Args:
            db: Database session (should have search_path including shared schema)
        """
        self.db = db

    async def create_guide(self, guide_data: GuideCreate) -> Guide:
        """
        Create a new guide.

        Args:
            guide_data: Guide creation data

        Returns:
            Guide: Created guide

        Raises:
            ConflictError: If guide with same slug already exists
        """
        # Check for existing slug
        existing = await self.get_guide_by_slug(guide_data.slug)
        if existing:
            raise ConflictError(f"Guide with slug '{guide_data.slug}' already exists")

        guide = Guide(
            slug=guide_data.slug,
            title=guide_data.title,
            description=guide_data.description,
            content_html=guide_data.content_html,
            icon=guide_data.icon.value,
            display_order=guide_data.display_order,
            published=guide_data.published,
        )

        self.db.add(guide)
        await self.db.commit()
        await self.db.refresh(guide)

        return guide

    async def get_guide_by_id(self, guide_id: str) -> Guide | None:
        """
        Get guide by ID.

        Args:
            guide_id: Guide UUID

        Returns:
            Guide or None if not found
        """
        result = await self.db.execute(select(Guide).where(Guide.id == guide_id))
        return result.scalar_one_or_none()

    async def get_guide_by_slug(self, slug: str) -> Guide | None:
        """
        Get guide by slug.

        Args:
            slug: Guide slug

        Returns:
            Guide or None if not found
        """
        result = await self.db.execute(select(Guide).where(Guide.slug == slug))
        return result.scalar_one_or_none()

    async def get_guides(
        self,
        published_only: bool = True,
        include_content: bool = False,
    ) -> list[Guide]:
        """
        Get all guides, optionally filtered by published status.

        Args:
            published_only: If True, only return published guides
            include_content: If True, return full content (otherwise just metadata)

        Returns:
            List of guides ordered by display_order
        """
        query = select(Guide)

        if published_only:
            query = query.where(Guide.published == True)  # noqa: E712

        query = query.order_by(Guide.display_order.asc(), Guide.title.asc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_guide(self, slug: str, guide_data: GuideUpdate) -> Guide:
        """
        Update an existing guide.

        Args:
            slug: Guide slug
            guide_data: Guide update data

        Returns:
            Guide: Updated guide

        Raises:
            NotFoundError: If guide not found
            ConflictError: If new slug already exists
        """
        guide = await self.get_guide_by_slug(slug)
        if not guide:
            raise NotFoundError(f"Guide with slug '{slug}' not found")

        update_data = guide_data.model_dump(exclude_unset=True)

        # Check for slug conflict if changing slug
        if "slug" in update_data and update_data["slug"] != slug:
            existing = await self.get_guide_by_slug(update_data["slug"])
            if existing:
                raise ConflictError(f"Guide with slug '{update_data['slug']}' already exists")

        # Convert icon enum to value
        if "icon" in update_data and update_data["icon"]:
            update_data["icon"] = update_data["icon"].value

        # Apply updates
        for key, value in update_data.items():
            setattr(guide, key, value)

        await self.db.commit()
        await self.db.refresh(guide)

        return guide

    async def delete_guide(self, slug: str) -> None:
        """
        Delete a guide.

        Args:
            slug: Guide slug

        Raises:
            NotFoundError: If guide not found
        """
        guide = await self.get_guide_by_slug(slug)
        if not guide:
            raise NotFoundError(f"Guide with slug '{slug}' not found")

        await self.db.delete(guide)
        await self.db.commit()
