"""Template service for managing agent templates and bookmarks.

Agent templates are stored in the shared schema and accessible by all tenants.
Bookmarks are tenant-scoped (per-user within tenant).

NOTE: The search_path is already set by get_tenant_db_dependency to include
both the tenant schema AND adk_platform_shared, so no explicit schema switching
is needed.
"""

from datetime import UTC, datetime
from uuid import UUID

import yaml
from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.template import (
    AgentTemplateCreate,
    AgentTemplateUpdate,
    TemplateFilters,
)
from src.core.constants import TemplateStatus
from src.core.exceptions import NotFoundError, ValidationError
from src.db.models.agent_template import AgentTemplate, TemplateBookmark


class AgentTemplateService:
    """Service for agent template management (shared schema operations)."""

    def __init__(self, db: AsyncSession):
        """Initialize template service."""
        self.db = db

    def _extract_yaml_metadata(self, yaml_content: str) -> dict:
        """
        Extract metadata from YAML content for filtering.

        Args:
            yaml_content: The YAML string

        Returns:
            dict with model, has_tools, has_sub_agents
        """
        try:
            parsed = yaml.safe_load(yaml_content)
            return {
                "model": parsed.get("model"),
                "has_tools": bool(parsed.get("tools")),
                "has_sub_agents": bool(parsed.get("sub_agents")),
            }
        except yaml.YAMLError:
            return {"model": None, "has_tools": False, "has_sub_agents": False}

    async def create_template(
        self,
        template_data: AgentTemplateCreate,
        author_id: UUID,
        author_name: str,
        status: TemplateStatus = TemplateStatus.PENDING_REVIEW,
    ) -> AgentTemplate:
        """
        Create a new agent template.

        Args:
            template_data: Template creation data
            author_id: UUID of the submitting user
            author_name: Display name of the author
            status: Initial status (default: pending_review)

        Returns:
            AgentTemplate: Created template
        """
        # Check for duplicate name
        existing = await self.get_template_by_name(template_data.name)
        if existing:
            raise ValidationError(f"Template with name '{template_data.name}' already exists")

        # Extract YAML metadata
        metadata = self._extract_yaml_metadata(template_data.yaml_content)

        template = AgentTemplate(
            name=template_data.name,
            description=template_data.description,
            yaml_content=template_data.yaml_content,
            category=template_data.category.value,
            difficulty=template_data.difficulty.value,
            use_case=template_data.use_case,
            tags=template_data.tags,
            author_id=author_id,
            author_name=author_name,
            status=status.value,
            model=metadata["model"],
            has_tools=metadata["has_tools"],
            has_sub_agents=metadata["has_sub_agents"],
            thumbnail_url=template_data.thumbnail_url,
        )

        self.db.add(template)
        await self.db.commit()
        await self.db.refresh(template)

        return template

    async def get_template_by_id(self, template_id: str | UUID) -> AgentTemplate | None:
        """Get template by ID."""
        result = await self.db.execute(
            select(AgentTemplate).where(AgentTemplate.id == template_id)
        )
        return result.scalar_one_or_none()

    async def get_template_by_name(self, name: str) -> AgentTemplate | None:
        """Get template by name."""
        result = await self.db.execute(
            select(AgentTemplate).where(AgentTemplate.name == name)
        )
        return result.scalar_one_or_none()

    async def update_template(
        self, template_id: str | UUID, template_data: AgentTemplateUpdate
    ) -> AgentTemplate:
        """
        Update an existing template.

        Args:
            template_id: Template UUID
            template_data: Update data

        Returns:
            AgentTemplate: Updated template

        Raises:
            NotFoundError: If template not found
        """
        template = await self.get_template_by_id(template_id)
        if not template:
            raise NotFoundError(f"Template with ID '{template_id}' not found")

        update_data = template_data.model_dump(exclude_unset=True)

        # Convert enums to values
        if "category" in update_data and update_data["category"]:
            update_data["category"] = update_data["category"].value
        if "difficulty" in update_data and update_data["difficulty"]:
            update_data["difficulty"] = update_data["difficulty"].value

        # If YAML content changed, re-extract metadata
        if "yaml_content" in update_data and update_data["yaml_content"]:
            metadata = self._extract_yaml_metadata(update_data["yaml_content"])
            update_data.update(metadata)

        # Check for name conflict if name is being changed
        if "name" in update_data and update_data["name"] != template.name:
            existing = await self.get_template_by_name(update_data["name"])
            if existing:
                raise ValidationError(f"Template with name '{update_data['name']}' already exists")

        for field, value in update_data.items():
            if hasattr(template, field):
                setattr(template, field, value)

        await self.db.commit()
        await self.db.refresh(template)

        return template

    async def delete_template(self, template_id: str | UUID) -> None:
        """Delete a template."""
        template = await self.get_template_by_id(template_id)
        if not template:
            raise NotFoundError(f"Template with ID '{template_id}' not found")

        await self.db.delete(template)
        await self.db.commit()

    async def list_templates(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: TemplateFilters | None = None,
        include_pending: bool = False,
    ) -> list[AgentTemplate]:
        """
        List templates with pagination and filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters
            include_pending: If False, only return approved templates

        Returns:
            list[AgentTemplate]: List of templates
        """
        query = select(AgentTemplate).order_by(
            AgentTemplate.featured.desc(),
            AgentTemplate.download_count.desc(),
            AgentTemplate.created_at.desc(),
        )

        conditions = []

        # By default, only show approved templates unless include_pending
        if not include_pending:
            if filters and filters.status:
                conditions.append(AgentTemplate.status == filters.status.value)
            else:
                conditions.append(AgentTemplate.status == TemplateStatus.APPROVED.value)
        elif filters and filters.status:
            conditions.append(AgentTemplate.status == filters.status.value)

        if filters:
            if filters.search:
                search_term = f"%{filters.search}%"
                conditions.append(
                    or_(
                        AgentTemplate.name.ilike(search_term),
                        AgentTemplate.description.ilike(search_term),
                        AgentTemplate.tags.contains([filters.search.lower()]),
                    )
                )

            if filters.category:
                conditions.append(AgentTemplate.category == filters.category.value)

            if filters.difficulty:
                conditions.append(AgentTemplate.difficulty == filters.difficulty.value)

            if filters.featured is not None:
                conditions.append(AgentTemplate.featured == filters.featured)

            if filters.has_tools is not None:
                conditions.append(AgentTemplate.has_tools == filters.has_tools)

            if filters.has_sub_agents is not None:
                conditions.append(AgentTemplate.has_sub_agents == filters.has_sub_agents)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_featured_templates(self, limit: int = 6) -> list[AgentTemplate]:
        """Get featured approved templates."""
        result = await self.db.execute(
            select(AgentTemplate)
            .where(
                and_(
                    AgentTemplate.featured == True,  # noqa: E712
                    AgentTemplate.status == TemplateStatus.APPROVED.value,
                )
            )
            .order_by(AgentTemplate.download_count.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_pending_templates(self) -> list[AgentTemplate]:
        """Get all templates pending review."""
        result = await self.db.execute(
            select(AgentTemplate)
            .where(AgentTemplate.status == TemplateStatus.PENDING_REVIEW.value)
            .order_by(AgentTemplate.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_user_templates(self, author_id: UUID) -> list[AgentTemplate]:
        """Get all templates submitted by a user."""
        result = await self.db.execute(
            select(AgentTemplate)
            .where(AgentTemplate.author_id == author_id)
            .order_by(AgentTemplate.created_at.desc())
        )
        return list(result.scalars().all())

    async def approve_template(
        self, template_id: str | UUID, approved_by: UUID
    ) -> AgentTemplate:
        """
        Approve a template.

        Args:
            template_id: Template UUID
            approved_by: UUID of the admin approving

        Returns:
            AgentTemplate: Approved template
        """
        template = await self.get_template_by_id(template_id)
        if not template:
            raise NotFoundError(f"Template with ID '{template_id}' not found")

        template.status = TemplateStatus.APPROVED.value
        template.approved_by = approved_by
        template.approved_at = datetime.now(UTC)
        template.rejection_reason = None

        await self.db.commit()
        await self.db.refresh(template)

        return template

    async def reject_template(
        self, template_id: str | UUID, reason: str
    ) -> AgentTemplate:
        """
        Reject a template.

        Args:
            template_id: Template UUID
            reason: Rejection reason

        Returns:
            AgentTemplate: Rejected template
        """
        template = await self.get_template_by_id(template_id)
        if not template:
            raise NotFoundError(f"Template with ID '{template_id}' not found")

        template.status = TemplateStatus.REJECTED.value
        template.rejection_reason = reason

        await self.db.commit()
        await self.db.refresh(template)

        return template

    async def set_featured(self, template_id: str | UUID, featured: bool) -> AgentTemplate:
        """Set featured status for a template."""
        template = await self.get_template_by_id(template_id)
        if not template:
            raise NotFoundError(f"Template with ID '{template_id}' not found")

        template.featured = featured

        await self.db.commit()
        await self.db.refresh(template)

        return template

    async def increment_download_count(self, template_id: str | UUID) -> None:
        """Increment the download counter for a template."""
        await self.db.execute(
            update(AgentTemplate)
            .where(AgentTemplate.id == template_id)
            .values(download_count=AgentTemplate.download_count + 1)
        )
        await self.db.commit()

    async def get_template_stats(self) -> dict:
        """Get aggregate statistics about templates."""
        # Total and by status
        total_result = await self.db.execute(select(func.count(AgentTemplate.id)))
        total = total_result.scalar() or 0

        approved_result = await self.db.execute(
            select(func.count(AgentTemplate.id)).where(
                AgentTemplate.status == TemplateStatus.APPROVED.value
            )
        )
        approved = approved_result.scalar() or 0

        pending_result = await self.db.execute(
            select(func.count(AgentTemplate.id)).where(
                AgentTemplate.status == TemplateStatus.PENDING_REVIEW.value
            )
        )
        pending = pending_result.scalar() or 0

        # Total downloads
        downloads_result = await self.db.execute(
            select(func.sum(AgentTemplate.download_count))
        )
        total_downloads = downloads_result.scalar() or 0

        # By category
        category_result = await self.db.execute(
            select(AgentTemplate.category, func.count(AgentTemplate.id))
            .where(AgentTemplate.status == TemplateStatus.APPROVED.value)
            .group_by(AgentTemplate.category)
        )
        by_category = {row[0]: row[1] for row in category_result.all()}

        # By difficulty
        difficulty_result = await self.db.execute(
            select(AgentTemplate.difficulty, func.count(AgentTemplate.id))
            .where(AgentTemplate.status == TemplateStatus.APPROVED.value)
            .group_by(AgentTemplate.difficulty)
        )
        by_difficulty = {row[0]: row[1] for row in difficulty_result.all()}

        return {
            "total_templates": total,
            "approved_templates": approved,
            "pending_templates": pending,
            "total_downloads": total_downloads,
            "templates_by_category": by_category,
            "templates_by_difficulty": by_difficulty,
        }


class TemplateBookmarkService:
    """Service for template bookmark management (tenant-scoped)."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """Initialize bookmark service."""
        self.db = db
        self.tenant_id = tenant_id

    async def toggle_bookmark(self, user_id: str | UUID, template_id: str | UUID) -> TemplateBookmark | None:
        """
        Toggle bookmark for a template. Creates if not exists, deletes if exists.

        Args:
            user_id: User UUID
            template_id: Template UUID

        Returns:
            TemplateBookmark if created, None if removed
        """
        result = await self.db.execute(
            select(TemplateBookmark).where(
                and_(
                    TemplateBookmark.user_id == user_id,
                    TemplateBookmark.template_id == template_id,
                )
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            await self.db.delete(existing)
            await self.db.commit()
            return None
        else:
            bookmark = TemplateBookmark(user_id=user_id, template_id=template_id)
            self.db.add(bookmark)
            await self.db.commit()
            await self.db.refresh(bookmark)
            return bookmark

    async def is_bookmarked(self, user_id: str | UUID, template_id: str | UUID) -> bool:
        """Check if a template is bookmarked by the user."""
        result = await self.db.execute(
            select(func.count(TemplateBookmark.id)).where(
                and_(
                    TemplateBookmark.user_id == user_id,
                    TemplateBookmark.template_id == template_id,
                )
            )
        )
        count = result.scalar()
        return count is not None and count > 0

    async def get_bookmark(self, user_id: str | UUID, template_id: str | UUID) -> TemplateBookmark | None:
        """Get bookmark for a specific template if it exists."""
        result = await self.db.execute(
            select(TemplateBookmark).where(
                and_(
                    TemplateBookmark.user_id == user_id,
                    TemplateBookmark.template_id == template_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_user_bookmarks(self, user_id: str | UUID) -> list[TemplateBookmark]:
        """Get all template bookmarks for a user."""
        result = await self.db.execute(
            select(TemplateBookmark)
            .where(TemplateBookmark.user_id == user_id)
            .order_by(TemplateBookmark.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_bookmarked_template_ids(self, user_id: str | UUID) -> set[str]:
        """Get set of bookmarked template IDs for a user."""
        result = await self.db.execute(
            select(TemplateBookmark.template_id).where(TemplateBookmark.user_id == user_id)
        )
        return {str(row[0]) for row in result.all()}
