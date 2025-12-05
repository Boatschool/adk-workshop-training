"""News service for managing healthcare AI news and announcements.

News is stored in the shared schema and accessible by all tenants.
Supports both admin-created news and external news sources.
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.news import NewsCreate, NewsUpdate
from src.core.exceptions import NotFoundError
from src.db.models.news import News


class NewsService:
    """Service for news management (shared schema operations).

    News is in the shared schema (adk_platform_shared.news).
    The search_path set by get_shared_db_dependency includes the shared schema,
    so news is accessible without explicit schema switching.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize news service.

        Args:
            db: Database session (should have search_path including shared schema)
        """
        self.db = db

    async def create_news(
        self, news_data: NewsCreate, created_by: UUID | None = None
    ) -> News:
        """
        Create a new news item.

        Args:
            news_data: News creation data
            created_by: UUID of the user creating the news (optional)

        Returns:
            News: Created news item
        """
        news = News(
            title=news_data.title,
            excerpt=news_data.excerpt,
            content=news_data.content,
            source=news_data.source,
            source_url=news_data.source_url,
            image_url=news_data.image_url,
            published_at=news_data.published_at,
            is_external=news_data.is_external,
            is_featured=news_data.is_featured,
            published=news_data.published,
            created_by=created_by,
        )

        self.db.add(news)
        await self.db.commit()
        await self.db.refresh(news)

        return news

    async def get_news_by_id(self, news_id: UUID) -> News | None:
        """
        Get news by ID.

        Args:
            news_id: News UUID

        Returns:
            News or None if not found
        """
        result = await self.db.execute(select(News).where(News.id == news_id))
        return result.scalar_one_or_none()

    async def get_news_list(
        self,
        published_only: bool = True,
        featured_only: bool = False,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[News], int]:
        """
        Get paginated news list.

        Args:
            published_only: If True, only return published news
            featured_only: If True, only return featured news
            page: Page number (1-indexed)
            page_size: Number of items per page

        Returns:
            Tuple of (news list, total count)
        """
        query = select(News)

        if published_only:
            query = query.where(News.published == True)  # noqa: E712

        if featured_only:
            query = query.where(News.is_featured == True)  # noqa: E712

        # Order by published_at descending (most recent first)
        query = query.order_by(News.published_at.desc())

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        news_list = list(result.scalars().all())

        return news_list, total

    async def update_news(self, news_id: UUID, news_data: NewsUpdate) -> News:
        """
        Update an existing news item.

        Args:
            news_id: News UUID
            news_data: News update data

        Returns:
            News: Updated news item

        Raises:
            NotFoundError: If news not found
        """
        news = await self.get_news_by_id(news_id)
        if not news:
            raise NotFoundError(f"News with id '{news_id}' not found")

        update_data = news_data.model_dump(exclude_unset=True)

        # Apply updates
        for key, value in update_data.items():
            setattr(news, key, value)

        await self.db.commit()
        await self.db.refresh(news)

        return news

    async def delete_news(self, news_id: UUID) -> None:
        """
        Delete a news item.

        Args:
            news_id: News UUID

        Raises:
            NotFoundError: If news not found
        """
        news = await self.get_news_by_id(news_id)
        if not news:
            raise NotFoundError(f"News with id '{news_id}' not found")

        await self.db.delete(news)
        await self.db.commit()
