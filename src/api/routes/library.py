"""Library management API routes.

Library resources are stored in the shared schema and accessible by all tenants.
Bookmarks and progress are tenant-scoped (per-user within tenant).
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_current_user,
    get_storage_service_dependency,
    get_tenant_db_dependency,
    get_tenant_id,
    require_role,
)
from src.api.schemas.library import (
    BookmarkStatusResponse,
    FileDownloadResponse,
    FileUploadResponse,
    LibraryResourceCreate,
    LibraryResourceFilters,
    LibraryResourceResponse,
    LibraryResourceUpdate,
    LibraryResourceWithUserData,
    ResourceProgressResponse,
    ResourceProgressUpdate,
    UserBookmarkResponse,
)
from src.core.constants import (
    LibraryDifficulty,
    LibraryResourceType,
    LibraryTopic,
    ResourceProgressStatus,
    UserRole,
)
from src.core.exceptions import NotFoundError
from src.core.tenancy import TenantContext
from src.db.models.library import LibraryResource, ResourceProgress, UserBookmark
from src.db.models.user import User
from src.services.library_service import (
    LibraryResourceService,
    ResourceProgressService,
    UserBookmarkService,
)
from src.services.storage_service import StorageError, StorageService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency for super_admin only
require_super_admin = require_role(UserRole.SUPER_ADMIN)


# ============================================================================
# Library Resource Endpoints (Shared Schema)
# ============================================================================


@router.get("/", response_model=list[LibraryResourceWithUserData])
async def list_library_resources(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    search: Annotated[str | None, Query()] = None,
    resource_type: Annotated[LibraryResourceType | None, Query()] = None,
    topic: Annotated[LibraryTopic | None, Query()] = None,
    difficulty: Annotated[LibraryDifficulty | None, Query()] = None,
    featured: Annotated[bool | None, Query()] = None,
    bookmarked: Annotated[bool | None, Query()] = None,
    progress_status: Annotated[ResourceProgressStatus | None, Query()] = None,
) -> list[dict]:
    """
    List library resources with pagination and filtering.

    Includes user-specific bookmark and progress data.

    Note: When filtering by `bookmarked` or `progress_status`, the filters are
    applied after merging user data. To ensure consistent pagination, the API
    fetches all matching resources first, then applies skip/limit to the filtered
    result set.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Search query for title/description
        resource_type: Filter by resource type
        topic: Filter by topic
        difficulty: Filter by difficulty
        featured: Filter by featured status
        bookmarked: Filter to only bookmarked resources
        progress_status: Filter by progress status

    Returns:
        list[LibraryResourceWithUserData]: List of resources with user data
    """
    TenantContext.set(tenant_id)

    # Determine if we need to filter by user-specific data (bookmarked/progress)
    needs_user_filtering = bookmarked is not None or progress_status is not None

    # Get resources from shared schema
    resource_service = LibraryResourceService(db)
    filters = LibraryResourceFilters(
        search=search,
        resource_type=resource_type,
        topic=topic,
        difficulty=difficulty,
        featured=featured,
        bookmarked=bookmarked,
        progress_status=progress_status,
    )

    # When filtering by user data, fetch all resources first, then paginate after filtering
    if needs_user_filtering:
        resources = await resource_service.list_resources(skip=0, limit=1000, filters=filters)
    else:
        resources = await resource_service.list_resources(skip=skip, limit=limit, filters=filters)

    # Get user's bookmarks and progress
    bookmark_service = UserBookmarkService(db, tenant_id)
    progress_service = ResourceProgressService(db, tenant_id)

    bookmarked_ids = await bookmark_service.get_bookmarked_resource_ids(str(current_user.id))
    progress_map = await progress_service.get_progress_map(str(current_user.id))

    # Combine data and apply user-specific filters
    result = []
    for resource in resources:
        resource_id = str(resource.id)
        is_bookmarked = resource_id in bookmarked_ids
        progress = progress_map.get(resource_id)
        progress_status_value = progress.status if progress else None

        # Apply user-specific filters for bookmarked and progress_status
        if bookmarked is not None and is_bookmarked != bookmarked:
            continue
        if progress_status is not None:
            if progress_status_value != progress_status.value:
                continue

        result.append({
            **resource.to_dict(),
            "is_bookmarked": is_bookmarked,
            "progress_status": progress_status_value,
        })

    # Apply pagination after user-specific filtering
    if needs_user_filtering:
        result = result[skip : skip + limit]

    return result


@router.get("/featured", response_model=list[LibraryResourceResponse])
async def get_featured_resources(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    limit: Annotated[int, Query(ge=1, le=20)] = 6,
) -> list[LibraryResource]:
    """
    Get featured library resources.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        limit: Maximum number of featured resources to return

    Returns:
        list[LibraryResourceResponse]: List of featured resources
    """
    TenantContext.set(tenant_id)
    service = LibraryResourceService(db)
    return await service.get_featured_resources(limit=limit)


@router.get("/{resource_id}", response_model=LibraryResourceWithUserData)
async def get_library_resource(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> dict:
    """
    Get library resource by ID with user-specific data.

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        LibraryResourceWithUserData: Resource data with bookmark/progress status

    Raises:
        HTTPException: If resource not found
    """
    TenantContext.set(tenant_id)

    resource_service = LibraryResourceService(db)
    resource = await resource_service.get_resource_by_id(resource_id)

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Library resource with ID '{resource_id}' not found",
        )

    # Get user's bookmark and progress
    bookmark_service = UserBookmarkService(db, tenant_id)
    progress_service = ResourceProgressService(db, tenant_id)

    is_bookmarked = await bookmark_service.is_bookmarked(str(current_user.id), resource_id)
    progress = await progress_service.get_progress(str(current_user.id), resource_id)

    return {
        **resource.to_dict(),
        "is_bookmarked": is_bookmarked,
        "progress_status": progress.status if progress else None,
    }


@router.post("/", response_model=LibraryResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_library_resource(
    resource_data: LibraryResourceCreate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> LibraryResource:
    """
    Create a new library resource.

    Requires super_admin role (global resource management).

    Args:
        resource_data: Resource creation data
        db: Database session
        current_user: Current authenticated user (super_admin)
        tenant_id: Tenant ID from header

    Returns:
        LibraryResourceResponse: Created resource
    """
    TenantContext.set(tenant_id)
    service = LibraryResourceService(db)
    return await service.create_resource(resource_data)


@router.patch("/{resource_id}", response_model=LibraryResourceResponse)
async def update_library_resource(
    resource_id: str,
    resource_data: LibraryResourceUpdate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> LibraryResource:
    """
    Update a library resource.

    Requires super_admin role (global resource management).

    Args:
        resource_id: Resource UUID
        resource_data: Resource update data
        db: Database session
        current_user: Current authenticated user (super_admin)
        tenant_id: Tenant ID from header

    Returns:
        LibraryResourceResponse: Updated resource

    Raises:
        HTTPException: If resource not found
    """
    try:
        TenantContext.set(tenant_id)
        service = LibraryResourceService(db)
        return await service.update_resource(resource_id, resource_data)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_library_resource(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> None:
    """
    Delete a library resource.

    Requires super_admin role (global resource management).

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user (super_admin)
        tenant_id: Tenant ID from header

    Raises:
        HTTPException: If resource not found
    """
    try:
        TenantContext.set(tenant_id)
        service = LibraryResourceService(db)
        await service.delete_resource(resource_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from None


# ============================================================================
# Bookmark Endpoints (Tenant-Scoped)
# ============================================================================


@router.post("/{resource_id}/bookmark", response_model=BookmarkStatusResponse)
async def toggle_bookmark(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> dict:
    """
    Toggle bookmark for a library resource.

    Creates bookmark if not exists, removes if exists.

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        BookmarkStatusResponse: Current bookmark status
    """
    TenantContext.set(tenant_id)

    # Verify resource exists
    resource_service = LibraryResourceService(db)
    resource = await resource_service.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Library resource with ID '{resource_id}' not found",
        )

    bookmark_service = UserBookmarkService(db, tenant_id)
    bookmark = await bookmark_service.toggle_bookmark(str(current_user.id), resource_id)

    return {
        "is_bookmarked": bookmark is not None,
        "bookmarked_at": bookmark.created_at if bookmark else None,
    }


@router.get("/{resource_id}/bookmark", response_model=BookmarkStatusResponse)
async def get_bookmark_status(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> dict:
    """
    Check if a resource is bookmarked by the current user.

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        BookmarkStatusResponse: Bookmark status
    """
    TenantContext.set(tenant_id)
    bookmark_service = UserBookmarkService(db, tenant_id)
    bookmark = await bookmark_service.get_bookmark(str(current_user.id), resource_id)

    return {
        "is_bookmarked": bookmark is not None,
        "bookmarked_at": bookmark.created_at if bookmark else None,
    }


@router.get("/bookmarks/", response_model=list[UserBookmarkResponse])
async def get_user_bookmarks(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> list[UserBookmark]:
    """
    Get all bookmarks for the current user.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        list[UserBookmarkResponse]: List of user's bookmarks
    """
    TenantContext.set(tenant_id)
    bookmark_service = UserBookmarkService(db, tenant_id)
    return await bookmark_service.get_user_bookmarks(str(current_user.id))


# ============================================================================
# Progress Endpoints (Tenant-Scoped)
# ============================================================================


@router.post("/{resource_id}/progress", response_model=ResourceProgressResponse)
async def update_resource_progress(
    resource_id: str,
    progress_data: ResourceProgressUpdate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> ResourceProgress:
    """
    Update progress for a library resource.

    Args:
        resource_id: Resource UUID
        progress_data: Progress update data
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        ResourceProgressResponse: Updated progress
    """
    TenantContext.set(tenant_id)

    # Verify resource exists
    resource_service = LibraryResourceService(db)
    resource = await resource_service.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Library resource with ID '{resource_id}' not found",
        )

    progress_service = ResourceProgressService(db, tenant_id)
    return await progress_service.update_progress(str(current_user.id), resource_id, progress_data)


@router.get("/{resource_id}/progress", response_model=ResourceProgressResponse | None)
async def get_resource_progress(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> ResourceProgress | None:
    """
    Get progress for a specific library resource.

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        ResourceProgressResponse or None if not started
    """
    TenantContext.set(tenant_id)
    progress_service = ResourceProgressService(db, tenant_id)
    return await progress_service.get_progress(str(current_user.id), resource_id)


@router.get("/progress/", response_model=list[ResourceProgressResponse])
async def get_user_progress(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> list[ResourceProgress]:
    """
    Get all progress records for the current user.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        list[ResourceProgressResponse]: List of progress records
    """
    TenantContext.set(tenant_id)
    progress_service = ResourceProgressService(db, tenant_id)
    return await progress_service.get_user_progress(str(current_user.id))


@router.post("/{resource_id}/view", response_model=ResourceProgressResponse)
async def mark_resource_viewed(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> ResourceProgress:
    """
    Mark a resource as viewed (sets status to in_progress if not already completed).

    Convenience endpoint for automatically tracking views.

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        ResourceProgressResponse: Updated progress
    """
    TenantContext.set(tenant_id)

    # Verify resource exists
    resource_service = LibraryResourceService(db)
    resource = await resource_service.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Library resource with ID '{resource_id}' not found",
        )

    progress_service = ResourceProgressService(db, tenant_id)
    return await progress_service.mark_as_viewed(str(current_user.id), resource_id)


# ============================================================================
# File Upload/Download Endpoints
# ============================================================================


@router.post("/upload", response_model=FileUploadResponse)
async def upload_library_document(
    file: Annotated[UploadFile, File(description="PDF document to upload")],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    storage: Annotated[StorageService, Depends(get_storage_service_dependency)],
) -> dict:
    """
    Upload a PDF document for library resources.

    Requires super_admin role. The uploaded file is stored in Google Cloud Storage
    and the returned file_path can be used in the content_path field when creating
    or updating a library resource with source='uploaded'.

    Args:
        file: PDF file to upload (max 50MB)
        current_user: Current authenticated user (super_admin)
        tenant_id: Tenant ID from header
        storage: Storage service for GCS operations

    Returns:
        FileUploadResponse: Upload result with file path and metadata

    Raises:
        HTTPException 400: If file validation fails
        HTTPException 500: If upload fails
    """
    TenantContext.set(tenant_id)

    # Read file content
    try:
        file_content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded file",
        ) from None

    # Validate file
    filename = file.filename or "document.pdf"
    content_type = file.content_type or "application/octet-stream"

    is_valid, error_message = storage.validate_file(file_content, content_type, filename)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message,
        )

    # Generate unique path and upload
    try:
        destination_path = storage.generate_file_path(filename)
        result = storage.upload_file(file_content, destination_path, content_type, filename)

        logger.info(f"User {current_user.id} uploaded file: {destination_path}")

        return result

    except StorageError as e:
        logger.error(f"Storage error during upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        ) from None
    except Exception as e:
        logger.error(f"Unexpected error during upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during file upload",
        ) from None


@router.get("/{resource_id}/download", response_model=FileDownloadResponse)
async def get_resource_download_url(
    resource_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    storage: Annotated[StorageService, Depends(get_storage_service_dependency)],
) -> dict:
    """
    Get a signed download URL for an uploaded library resource.

    Only works for resources with source='uploaded' that have a content_path.
    The signed URL expires after the configured time (default 60 minutes).

    Args:
        resource_id: Resource UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        storage: Storage service for GCS operations

    Returns:
        FileDownloadResponse: Signed download URL and metadata

    Raises:
        HTTPException 404: If resource not found
        HTTPException 400: If resource is not an uploaded file
    """
    TenantContext.set(tenant_id)

    # Get the resource
    resource_service = LibraryResourceService(db)
    resource = await resource_service.get_resource_by_id(resource_id)

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Library resource with ID '{resource_id}' not found",
        )

    # Verify it's an uploaded resource with a content_path
    if resource.source != "uploaded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This resource is not an uploaded file",
        )

    if not resource.content_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This resource does not have an associated file",
        )

    # Generate signed URL
    try:
        from src.core.config import get_settings

        settings = get_settings()
        expiration_minutes = settings.upload_signed_url_expiration_minutes

        signed_url = storage.generate_signed_url(resource.content_path, expiration_minutes)

        # Extract filename from path
        filename = resource.content_path.split("/")[-1]
        # Remove the unique prefix (first 13 chars: 12 hex + underscore)
        if len(filename) > 13 and filename[12] == "_":
            filename = filename[13:]

        logger.info(f"User {current_user.id} requested download for resource {resource_id}")

        return {
            "download_url": signed_url,
            "expires_in_minutes": expiration_minutes,
            "file_name": filename,
            "content_type": "application/pdf",
        }

    except StorageError as e:
        logger.error(f"Storage error generating signed URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}",
        ) from None
    except Exception as e:
        logger.error(f"Unexpected error generating signed URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        ) from None
