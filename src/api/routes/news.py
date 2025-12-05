"""News management API routes.

News is platform-wide content stored in the shared schema.
Public endpoints don't require authentication (read-only).
Admin endpoints require tenant_admin or super_admin role.
"""

import math
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_shared_db_dependency,
    require_role,
)
from src.api.schemas.news import (
    NewsCreate,
    NewsListItem,
    NewsListResponse,
    NewsResponse,
    NewsUpdate,
)
from src.core.constants import UserRole
from src.core.exceptions import NotFoundError
from src.db.models.user import User
from src.services.news_service import NewsService

router = APIRouter()

# Dependency for admin access (tenant_admin or super_admin)
require_admin = require_role(UserRole.TENANT_ADMIN)


# ============================================================================
# Public Endpoints (No Authentication Required)
# ============================================================================


@router.get("/", response_model=NewsListResponse)
async def list_news(
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    featured_only: bool = Query(False, description="Only return featured news"),
) -> NewsListResponse:
    """
    List news items with pagination.

    Public endpoint - no authentication required.
    Only returns published news.

    Args:
        db: Database session (shared schema)
        page: Page number (1-indexed)
        page_size: Number of items per page (max 50)
        featured_only: If True, only return featured news

    Returns:
        NewsListResponse: Paginated list of news items
    """
    service = NewsService(db)
    news_list, total = await service.get_news_list(
        published_only=True,
        featured_only=featured_only,
        page=page,
        page_size=page_size,
    )

    pages = math.ceil(total / page_size) if total > 0 else 1

    return NewsListResponse(
        items=[
            NewsListItem(
                id=news.id,
                title=news.title,
                excerpt=news.excerpt,
                source=news.source,
                source_url=news.source_url,
                image_url=news.image_url,
                published_at=news.published_at,
                is_external=news.is_external,
                is_featured=news.is_featured,
                created_at=news.created_at,
            )
            for news in news_list
        ],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(
    news_id: UUID,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
) -> NewsResponse:
    """
    Get a single news item by ID.

    Public endpoint - no authentication required.

    Args:
        news_id: News UUID
        db: Database session (shared schema)

    Returns:
        NewsResponse: Full news content

    Raises:
        HTTPException 404: If news not found or not published
    """
    service = NewsService(db)
    news = await service.get_news_by_id(news_id)

    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News '{news_id}' not found",
        )

    # For public access, only return published news
    if not news.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News '{news_id}' not found",
        )

    return NewsResponse(
        id=news.id,
        title=news.title,
        excerpt=news.excerpt,
        content=news.content,
        source=news.source,
        source_url=news.source_url,
        image_url=news.image_url,
        published_at=news.published_at,
        is_external=news.is_external,
        is_featured=news.is_featured,
        published=news.published,
        created_by=news.created_by,
        created_at=news.created_at,
        updated_at=news.updated_at,
    )


# ============================================================================
# Admin Endpoints (Requires tenant_admin or super_admin role)
# ============================================================================


@router.post("/", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    news_data: NewsCreate,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    current_user: Annotated[User, Depends(require_admin)],
) -> NewsResponse:
    """
    Create a new news item.

    Requires tenant_admin or super_admin role.

    Args:
        news_data: News creation data
        db: Database session
        current_user: Authenticated admin user

    Returns:
        NewsResponse: Created news item
    """
    service = NewsService(db)
    news = await service.create_news(news_data, created_by=current_user.id)

    return NewsResponse(
        id=news.id,
        title=news.title,
        excerpt=news.excerpt,
        content=news.content,
        source=news.source,
        source_url=news.source_url,
        image_url=news.image_url,
        published_at=news.published_at,
        is_external=news.is_external,
        is_featured=news.is_featured,
        published=news.published,
        created_by=news.created_by,
        created_at=news.created_at,
        updated_at=news.updated_at,
    )


@router.patch("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: UUID,
    news_data: NewsUpdate,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_admin)],
) -> NewsResponse:
    """
    Update an existing news item.

    Requires tenant_admin or super_admin role.

    Args:
        news_id: News UUID
        news_data: News update data
        db: Database session
        current_user: Authenticated admin user

    Returns:
        NewsResponse: Updated news item

    Raises:
        HTTPException 404: If news not found
    """
    service = NewsService(db)

    try:
        news = await service.update_news(news_id, news_data)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None

    return NewsResponse(
        id=news.id,
        title=news.title,
        excerpt=news.excerpt,
        content=news.content,
        source=news.source,
        source_url=news.source_url,
        image_url=news.image_url,
        published_at=news.published_at,
        is_external=news.is_external,
        is_featured=news.is_featured,
        published=news.published,
        created_by=news.created_by,
        created_at=news.created_at,
        updated_at=news.updated_at,
    )


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: UUID,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_admin)],
) -> None:
    """
    Delete a news item.

    Requires tenant_admin or super_admin role.

    Args:
        news_id: News UUID
        db: Database session
        current_user: Authenticated admin user

    Raises:
        HTTPException 404: If news not found
    """
    service = NewsService(db)

    try:
        await service.delete_news(news_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
