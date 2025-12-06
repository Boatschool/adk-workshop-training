"""Agent Template management API routes.

Templates are stored in the shared schema and accessible by all tenants.
Bookmarks are tenant-scoped (per-user within tenant).
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_current_user,
    get_tenant_db_dependency,
    get_tenant_id,
    require_role,
)
from src.api.schemas.template import (
    AgentTemplateCreate,
    AgentTemplateListResponse,
    AgentTemplateResponse,
    AgentTemplateUpdate,
    AgentTemplateWithUserData,
    TemplateApproveRequest,
    TemplateBookmarkStatusResponse,
    TemplateDownloadResponse,
    TemplateFeatureRequest,
    TemplateFilters,
    TemplateRejectRequest,
    TemplateStatsResponse,
)
from src.core.constants import (
    TemplateCategory,
    TemplateDifficulty,
    TemplateStatus,
    UserRole,
)
from src.core.exceptions import NotFoundError, ValidationError
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.services.template_service import AgentTemplateService, TemplateBookmarkService

logger = logging.getLogger(__name__)

router = APIRouter()

# Role dependencies
require_super_admin = require_role(UserRole.SUPER_ADMIN)
require_instructor = require_role(UserRole.INSTRUCTOR)


# ============================================================================
# Public Endpoints (Authenticated Users)
# ============================================================================


@router.get("", response_model=list[AgentTemplateListResponse])
async def list_templates(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    search: Annotated[str | None, Query()] = None,
    category: Annotated[TemplateCategory | None, Query()] = None,
    difficulty: Annotated[TemplateDifficulty | None, Query()] = None,
    featured: Annotated[bool | None, Query()] = None,
    has_tools: Annotated[bool | None, Query()] = None,
    has_sub_agents: Annotated[bool | None, Query()] = None,
) -> list[AgentTemplateListResponse]:
    """
    List approved agent templates with pagination and filtering.

    Only returns approved templates for regular users.
    """
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    filters = TemplateFilters(
        search=search,
        category=category,
        difficulty=difficulty,
        featured=featured,
        has_tools=has_tools,
        has_sub_agents=has_sub_agents,
        status=TemplateStatus.APPROVED,  # Only approved for public listing
    )

    templates = await template_service.list_templates(
        skip=skip, limit=limit, filters=filters, include_pending=False
    )

    return [AgentTemplateListResponse.model_validate(t) for t in templates]


@router.get("/featured", response_model=list[AgentTemplateListResponse])
async def get_featured_templates(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    limit: Annotated[int, Query(ge=1, le=12)] = 6,
) -> list[AgentTemplateListResponse]:
    """Get featured agent templates."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    templates = await template_service.get_featured_templates(limit=limit)

    return [AgentTemplateListResponse.model_validate(t) for t in templates]


@router.get("/my-submissions", response_model=list[AgentTemplateResponse])
async def get_my_submissions(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> list[AgentTemplateResponse]:
    """Get templates submitted by the current user."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    templates = await template_service.get_user_templates(current_user.id)

    return [AgentTemplateResponse.model_validate(t) for t in templates]


@router.get("/bookmarks", response_model=list[AgentTemplateListResponse])
async def get_bookmarked_templates(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> list[AgentTemplateListResponse]:
    """Get templates bookmarked by the current user."""
    TenantContext.set(tenant_id)

    bookmark_service = TemplateBookmarkService(db, tenant_id)
    template_service = AgentTemplateService(db)

    bookmarked_ids = await bookmark_service.get_bookmarked_template_ids(current_user.id)

    # Fetch each bookmarked template
    templates = []
    for template_id in bookmarked_ids:
        template = await template_service.get_template_by_id(template_id)
        if template and template.status == TemplateStatus.APPROVED.value:
            templates.append(template)

    return [AgentTemplateListResponse.model_validate(t) for t in templates]


@router.get("/stats", response_model=TemplateStatsResponse)
async def get_template_stats(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> TemplateStatsResponse:
    """Get template statistics (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    stats = await template_service.get_template_stats()

    return TemplateStatsResponse(**stats)


@router.get("/{template_id}", response_model=AgentTemplateWithUserData)
async def get_template(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> dict:
    """Get a single template by ID with user bookmark status."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    template = await template_service.get_template_by_id(template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID '{template_id}' not found",
        )

    # Only allow viewing approved templates (or own submissions)
    if template.status != TemplateStatus.APPROVED.value:
        if template.author_id != current_user.id and current_user.role != UserRole.SUPER_ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID '{template_id}' not found",
            )

    # Get bookmark status
    bookmark_service = TemplateBookmarkService(db, tenant_id)
    is_bookmarked = await bookmark_service.is_bookmarked(current_user.id, template_id)

    # Convert to dict and add bookmark status
    template_data = AgentTemplateResponse.model_validate(template).model_dump()
    template_data["is_bookmarked"] = is_bookmarked

    return template_data


@router.get("/{template_id}/download", response_model=TemplateDownloadResponse)
async def download_template(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> TemplateDownloadResponse:
    """
    Download template YAML content.

    Increments the download counter.
    """
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    template = await template_service.get_template_by_id(template_id)

    if not template or template.status != TemplateStatus.APPROVED.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID '{template_id}' not found",
        )

    # Increment download count
    await template_service.increment_download_count(template_id)

    # Generate filename from template name
    safe_name = template.name.lower().replace(" ", "_").replace("-", "_")
    filename = f"{safe_name}.yaml"

    return TemplateDownloadResponse(
        filename=filename,
        content=template.yaml_content,
        content_type="text/yaml",
    )


@router.get("/{template_id}/yaml")
async def get_template_yaml(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> Response:
    """
    Get raw YAML content for clipboard copy.

    Does NOT increment download counter (use /download for that).
    """
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    template = await template_service.get_template_by_id(template_id)

    if not template or template.status != TemplateStatus.APPROVED.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID '{template_id}' not found",
        )

    return Response(
        content=template.yaml_content,
        media_type="text/yaml",
    )


@router.post("/{template_id}/bookmark", response_model=TemplateBookmarkStatusResponse)
async def toggle_template_bookmark(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> TemplateBookmarkStatusResponse:
    """Toggle bookmark status for a template."""
    TenantContext.set(tenant_id)

    # Verify template exists and is approved
    template_service = AgentTemplateService(db)
    template = await template_service.get_template_by_id(template_id)

    if not template or template.status != TemplateStatus.APPROVED.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID '{template_id}' not found",
        )

    bookmark_service = TemplateBookmarkService(db, tenant_id)
    bookmark = await bookmark_service.toggle_bookmark(current_user.id, template_id)

    return TemplateBookmarkStatusResponse(
        is_bookmarked=bookmark is not None,
        bookmarked_at=bookmark.created_at if bookmark else None,
    )


# ============================================================================
# Instructor Endpoints (Submit Templates)
# ============================================================================


@router.post("", response_model=AgentTemplateResponse, status_code=status.HTTP_201_CREATED)
async def submit_template(
    template_data: AgentTemplateCreate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> AgentTemplateResponse:
    """
    Submit a new agent template for review.

    Requires instructor role or higher.
    Template will be in 'pending_review' status until approved by an admin.
    """
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)

    try:
        template = await template_service.create_template(
            template_data=template_data,
            author_id=current_user.id,
            author_name=current_user.full_name or current_user.email,
            status=TemplateStatus.PENDING_REVIEW,
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    logger.info(f"Template '{template.name}' submitted by {current_user.email}")

    return AgentTemplateResponse.model_validate(template)


@router.patch("/{template_id}", response_model=AgentTemplateResponse)
async def update_my_template(
    template_id: str,
    template_data: AgentTemplateUpdate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> AgentTemplateResponse:
    """
    Update own template (only if draft or rejected).

    Instructors can only edit their own templates that haven't been approved yet.
    """
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    template = await template_service.get_template_by_id(template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID '{template_id}' not found",
        )

    # Check ownership
    if template.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own templates",
        )

    # Can only edit draft or rejected templates
    if template.status not in [TemplateStatus.DRAFT.value, TemplateStatus.REJECTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only edit draft or rejected templates",
        )

    try:
        updated = await template_service.update_template(template_id, template_data)
        # Reset to pending review after edit
        updated.status = TemplateStatus.PENDING_REVIEW.value
        updated.rejection_reason = None
        await db.commit()
        await db.refresh(updated)
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return AgentTemplateResponse.model_validate(updated)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_template(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_instructor)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> None:
    """
    Delete own draft template.

    Instructors can only delete their own templates that are in draft status.
    """
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    template = await template_service.get_template_by_id(template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID '{template_id}' not found",
        )

    # Check ownership
    if template.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own templates",
        )

    # Can only delete draft templates
    if template.status != TemplateStatus.DRAFT.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete draft templates",
        )

    await template_service.delete_template(template_id)


# ============================================================================
# Admin Endpoints (Manage All Templates)
# ============================================================================


@router.get("/admin/pending", response_model=list[AgentTemplateResponse])
async def get_pending_templates(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> list[AgentTemplateResponse]:
    """Get all templates pending review (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    templates = await template_service.get_pending_templates()

    return [AgentTemplateResponse.model_validate(t) for t in templates]


@router.get("/admin/all", response_model=list[AgentTemplateResponse])
async def list_all_templates(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    status_filter: Annotated[TemplateStatus | None, Query(alias="status")] = None,
    search: Annotated[str | None, Query()] = None,
    category: Annotated[TemplateCategory | None, Query()] = None,
) -> list[AgentTemplateResponse]:
    """List all templates including non-approved (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)
    filters = TemplateFilters(
        search=search,
        category=category,
        status=status_filter,
    )

    templates = await template_service.list_templates(
        skip=skip, limit=limit, filters=filters, include_pending=True
    )

    return [AgentTemplateResponse.model_validate(t) for t in templates]


@router.post("/{template_id}/approve", response_model=AgentTemplateResponse)
async def approve_template(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    _: TemplateApproveRequest = TemplateApproveRequest(),
) -> AgentTemplateResponse:
    """Approve a pending template (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)

    try:
        template = await template_service.approve_template(template_id, current_user.id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e

    logger.info(f"Template '{template.name}' approved by {current_user.email}")

    return AgentTemplateResponse.model_validate(template)


@router.post("/{template_id}/reject", response_model=AgentTemplateResponse)
async def reject_template(
    template_id: str,
    reject_data: TemplateRejectRequest,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> AgentTemplateResponse:
    """Reject a pending template with reason (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)

    try:
        template = await template_service.reject_template(template_id, reject_data.reason)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e

    logger.info(f"Template '{template.name}' rejected by {current_user.email}: {reject_data.reason}")

    return AgentTemplateResponse.model_validate(template)


@router.post("/{template_id}/feature", response_model=AgentTemplateResponse)
async def feature_template(
    template_id: str,
    feature_data: TemplateFeatureRequest,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> AgentTemplateResponse:
    """Set featured status for a template (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)

    try:
        template = await template_service.set_featured(template_id, feature_data.featured)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e

    action = "featured" if feature_data.featured else "unfeatured"
    logger.info(f"Template '{template.name}' {action} by {current_user.email}")

    return AgentTemplateResponse.model_validate(template)


@router.patch("/admin/{template_id}", response_model=AgentTemplateResponse)
async def admin_update_template(
    template_id: str,
    template_data: AgentTemplateUpdate,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> AgentTemplateResponse:
    """Update any template (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)

    try:
        template = await template_service.update_template(template_id, template_data)
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return AgentTemplateResponse.model_validate(template)


@router.delete("/admin/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_template(
    template_id: str,
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    current_user: Annotated[User, Depends(require_super_admin)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
) -> None:
    """Delete any template (admin only)."""
    TenantContext.set(tenant_id)

    template_service = AgentTemplateService(db)

    try:
        await template_service.delete_template(template_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e

    logger.info(f"Template '{template_id}' deleted by {current_user.email}")
