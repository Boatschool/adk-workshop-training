"""Announcement management API routes for What's New section.

Announcements are platform-wide content stored in the shared schema.
Public endpoints don't require authentication (read-only).
Admin endpoints require tenant_admin or super_admin role.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_shared_db_dependency,
    require_admin,
)
from src.api.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementListResponse,
    AnnouncementResponse,
    AnnouncementUpdate,
)
from src.core.exceptions import NotFoundError
from src.db.models.user import User
from src.services.announcement_service import AnnouncementService

router = APIRouter()


# ============================================================================
# Public Endpoints (No Authentication Required)
# ============================================================================


@router.get("/active", response_model=list[AnnouncementResponse])
async def get_active_announcements(
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    limit: int = Query(5, ge=1, le=10, description="Maximum announcements to return"),
) -> list[AnnouncementResponse]:
    """
    Get active announcements for dashboard display.

    Public endpoint - no authentication required.
    Only returns active announcements within their start/expiration window.

    Args:
        db: Database session (shared schema)
        limit: Maximum number of announcements (default 5, max 10)

    Returns:
        List of active announcements
    """
    service = AnnouncementService(db)
    announcements = await service.get_active_announcements(limit=limit)

    return [
        AnnouncementResponse(
            id=a.id,
            title=a.title,
            description=a.description,
            announcement_type=a.announcement_type,
            link_url=a.link_url,
            badge_text=a.badge_text,
            badge_color=a.badge_color,
            display_order=a.display_order,
            is_active=a.is_active,
            starts_at=a.starts_at,
            expires_at=a.expires_at,
            created_by=a.created_by,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )
        for a in announcements
    ]


# ============================================================================
# Admin Endpoints (Requires tenant_admin or super_admin role)
# ============================================================================


@router.get("/", response_model=AnnouncementListResponse)
async def list_announcements(
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_admin)],
    include_inactive: bool = Query(True, description="Include inactive announcements"),
) -> AnnouncementListResponse:
    """
    List all announcements for admin management.

    Requires tenant_admin or super_admin role.

    Args:
        db: Database session
        include_inactive: Whether to include inactive announcements

    Returns:
        AnnouncementListResponse: List of all announcements with count
    """
    service = AnnouncementService(db)
    announcements, total = await service.get_all_announcements(
        include_inactive=include_inactive
    )

    return AnnouncementListResponse(
        items=[
            AnnouncementResponse(
                id=a.id,
                title=a.title,
                description=a.description,
                announcement_type=a.announcement_type,
                link_url=a.link_url,
                badge_text=a.badge_text,
                badge_color=a.badge_color,
                display_order=a.display_order,
                is_active=a.is_active,
                starts_at=a.starts_at,
                expires_at=a.expires_at,
                created_by=a.created_by,
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
            for a in announcements
        ],
        total=total,
    )


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: UUID,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_admin)],
) -> AnnouncementResponse:
    """
    Get a single announcement by ID.

    Requires tenant_admin or super_admin role.

    Args:
        announcement_id: Announcement UUID
        db: Database session

    Returns:
        AnnouncementResponse: Full announcement details

    Raises:
        HTTPException 404: If announcement not found
    """
    service = AnnouncementService(db)
    announcement = await service.get_announcement_by_id(announcement_id)

    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement '{announcement_id}' not found",
        )

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        description=announcement.description,
        announcement_type=announcement.announcement_type,
        link_url=announcement.link_url,
        badge_text=announcement.badge_text,
        badge_color=announcement.badge_color,
        display_order=announcement.display_order,
        is_active=announcement.is_active,
        starts_at=announcement.starts_at,
        expires_at=announcement.expires_at,
        created_by=announcement.created_by,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at,
    )


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    data: AnnouncementCreate,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    current_user: Annotated[User, Depends(require_admin)],
) -> AnnouncementResponse:
    """
    Create a new announcement.

    Requires tenant_admin or super_admin role.

    Args:
        data: Announcement creation data
        db: Database session
        current_user: Authenticated admin user

    Returns:
        AnnouncementResponse: Created announcement
    """
    service = AnnouncementService(db)
    announcement = await service.create_announcement(data, created_by=current_user.id)

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        description=announcement.description,
        announcement_type=announcement.announcement_type,
        link_url=announcement.link_url,
        badge_text=announcement.badge_text,
        badge_color=announcement.badge_color,
        display_order=announcement.display_order,
        is_active=announcement.is_active,
        starts_at=announcement.starts_at,
        expires_at=announcement.expires_at,
        created_by=announcement.created_by,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at,
    )


@router.patch("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: UUID,
    data: AnnouncementUpdate,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_admin)],
) -> AnnouncementResponse:
    """
    Update an existing announcement.

    Requires tenant_admin or super_admin role.

    Args:
        announcement_id: Announcement UUID
        data: Announcement update data
        db: Database session

    Returns:
        AnnouncementResponse: Updated announcement

    Raises:
        HTTPException 404: If announcement not found
    """
    service = AnnouncementService(db)

    try:
        announcement = await service.update_announcement(announcement_id, data)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        description=announcement.description,
        announcement_type=announcement.announcement_type,
        link_url=announcement.link_url,
        badge_text=announcement.badge_text,
        badge_color=announcement.badge_color,
        display_order=announcement.display_order,
        is_active=announcement.is_active,
        starts_at=announcement.starts_at,
        expires_at=announcement.expires_at,
        created_by=announcement.created_by,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at,
    )


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: UUID,
    db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_admin)],
) -> None:
    """
    Delete an announcement.

    Requires tenant_admin or super_admin role.

    Args:
        announcement_id: Announcement UUID
        db: Database session

    Raises:
        HTTPException 404: If announcement not found
    """
    service = AnnouncementService(db)

    try:
        await service.delete_announcement(announcement_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
