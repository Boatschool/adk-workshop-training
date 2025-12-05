"""Guide management API routes.

Guides are platform-wide documentation stored in the shared schema.
Public endpoints don't require authentication (read-only).
Admin endpoints require super_admin role.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_shared_db_dependency,
    require_role,
)
from src.api.schemas.guide import (
    GuideCreate,
    GuideListItem,
    GuideResponse,
    GuideUpdate,
)
from src.core.constants import GuideIcon, UserRole
from src.core.exceptions import ConflictError, NotFoundError
from src.db.models.user import User
from src.services.guide_service import GuideService

router = APIRouter()

# Dependency for super_admin only
require_super_admin = require_role(UserRole.SUPER_ADMIN)


# ============================================================================
# Public Endpoints (No Authentication Required)
# ============================================================================


@router.get("", response_model=list[GuideListItem])
async def list_guides(
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    published_only: bool = True,
) -> list[GuideListItem]:
    """
    List all guides.

    Public endpoint - no authentication required.
    By default, only returns published guides.

    Args:
        db: Database session (shared schema)
        published_only: If True, only return published guides

    Returns:
        list[GuideListItem]: List of guides (without full content)
    """
    service = GuideService(db)
    guides = await service.get_guides(published_only=published_only)

    return [
        GuideListItem(
            id=guide.id,
            slug=guide.slug,
            title=guide.title,
            description=guide.description,
            icon=GuideIcon(guide.icon),
            display_order=guide.display_order,
            published=guide.published,
            created_at=guide.created_at,
            updated_at=guide.updated_at,
        )
        for guide in guides
    ]


@router.get("/{slug}", response_model=GuideResponse)
async def get_guide(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
) -> GuideResponse:
    """
    Get a single guide by slug.

    Public endpoint - no authentication required.

    Args:
        slug: Guide slug
        db: Database session (shared schema)

    Returns:
        GuideResponse: Full guide content

    Raises:
        HTTPException 404: If guide not found or not published
    """
    service = GuideService(db)
    guide = await service.get_guide_by_slug(slug)

    if not guide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guide '{slug}' not found",
        )

    # For public access, only return published guides
    if not guide.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guide '{slug}' not found",
        )

    return GuideResponse(
        id=guide.id,
        slug=guide.slug,
        title=guide.title,
        description=guide.description,
        content_html=guide.content_html,
        icon=GuideIcon(guide.icon),
        display_order=guide.display_order,
        published=guide.published,
        created_at=guide.created_at,
        updated_at=guide.updated_at,
    )


# ============================================================================
# Admin Endpoints (Requires super_admin role)
# ============================================================================


@router.post("", response_model=GuideResponse, status_code=status.HTTP_201_CREATED)
async def create_guide(
    guide_data: GuideCreate,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_super_admin)],
) -> GuideResponse:
    """
    Create a new guide.

    Requires super_admin role.

    Args:
        guide_data: Guide creation data
        db: Database session
        current_user: Authenticated super_admin user

    Returns:
        GuideResponse: Created guide

    Raises:
        HTTPException 409: If guide with same slug already exists
    """
    service = GuideService(db)

    try:
        guide = await service.create_guide(guide_data)
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        ) from None

    return GuideResponse(
        id=guide.id,
        slug=guide.slug,
        title=guide.title,
        description=guide.description,
        content_html=guide.content_html,
        icon=GuideIcon(guide.icon),
        display_order=guide.display_order,
        published=guide.published,
        created_at=guide.created_at,
        updated_at=guide.updated_at,
    )


@router.patch("/{slug}", response_model=GuideResponse)
async def update_guide(
    slug: str,
    guide_data: GuideUpdate,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_super_admin)],
) -> GuideResponse:
    """
    Update an existing guide.

    Requires super_admin role.

    Args:
        slug: Guide slug
        guide_data: Guide update data
        db: Database session
        current_user: Authenticated super_admin user

    Returns:
        GuideResponse: Updated guide

    Raises:
        HTTPException 404: If guide not found
        HTTPException 409: If new slug already exists
    """
    service = GuideService(db)

    try:
        guide = await service.update_guide(slug, guide_data)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        ) from None

    return GuideResponse(
        id=guide.id,
        slug=guide.slug,
        title=guide.title,
        description=guide.description,
        content_html=guide.content_html,
        icon=GuideIcon(guide.icon),
        display_order=guide.display_order,
        published=guide.published,
        created_at=guide.created_at,
        updated_at=guide.updated_at,
    )


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_guide(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_super_admin)],
) -> None:
    """
    Delete a guide.

    Requires super_admin role.

    Args:
        slug: Guide slug
        db: Database session
        current_user: Authenticated super_admin user

    Raises:
        HTTPException 404: If guide not found
    """
    service = GuideService(db)

    try:
        await service.delete_guide(slug)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
