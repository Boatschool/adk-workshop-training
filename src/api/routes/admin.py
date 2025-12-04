"""Admin API routes for dashboard statistics."""

from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import (
    get_shared_db_dependency,
    get_tenant_db_dependency,
    require_role,
)
from src.api.schemas.admin import (
    ActivityStats,
    AdminStatsResponse,
    ContentStats,
    HealthStats,
    OrganizationStats,
    UserStats,
)
from src.core.constants import UserRole
from src.db.models.user import User

router = APIRouter()

# Dependency for super_admin only - stats include cross-tenant data
require_super_admin = require_role(UserRole.SUPER_ADMIN)


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: Annotated[AsyncSession, Depends(get_tenant_db_dependency)],
    shared_db: Annotated[AsyncSession, Depends(get_shared_db_dependency)],
    _current_user: Annotated[User, Depends(require_super_admin)],
) -> AdminStatsResponse:
    """
    Get platform statistics for admin dashboard.

    Returns aggregated counts for users, content, activity, and health status.
    Requires super_admin role since stats include cross-tenant data from shared schema.

    Args:
        db: Tenant database session
        shared_db: Shared database session for guides/library
        _current_user: Current super_admin user (for authorization)

    Returns:
        AdminStatsResponse: Platform statistics
    """
    # Calculate date ranges
    now = datetime.now(UTC)
    week_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # User stats from tenant database
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0

    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)  # noqa: E712
    )
    active_users = active_users_result.scalar() or 0

    new_users_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )
    new_users = new_users_result.scalar() or 0

    # Organization stats - we need to query from shared schema
    # For now, return placeholder values since we're in tenant context
    # In production, this would query the shared.tenants table
    org_total = 1  # Current tenant
    org_active = 1

    # Content stats from shared database
    # Guides
    try:
        from src.db.models.guide import Guide

        guides_result = await shared_db.execute(select(func.count(Guide.id)))
        total_guides = guides_result.scalar() or 0

        published_guides_result = await shared_db.execute(
            select(func.count(Guide.id)).where(Guide.published == True)  # noqa: E712
        )
        published_guides = published_guides_result.scalar() or 0
    except Exception:
        total_guides = 0
        published_guides = 0

    # Library resources
    try:
        from src.db.models.library_resource import LibraryResource

        resources_result = await shared_db.execute(select(func.count(LibraryResource.id)))
        total_resources = resources_result.scalar() or 0

        featured_result = await shared_db.execute(
            select(func.count(LibraryResource.id)).where(
                LibraryResource.featured == True  # noqa: E712
            )
        )
        featured_resources = featured_result.scalar() or 0
    except Exception:
        total_resources = 0
        featured_resources = 0

    # Workshops from tenant database
    try:
        from src.db.models.workshop import Workshop

        workshops_result = await db.execute(select(func.count(Workshop.id)))
        total_workshops = workshops_result.scalar() or 0
    except Exception:
        total_workshops = 0

    # Activity stats - placeholder values for now
    # In production, these would come from audit logs or session tracking
    logins_today = 0
    active_sessions = 0
    api_requests = 0

    # Try to get login count from users who logged in today
    try:
        # Count users with updated_at today as proxy for activity
        active_today_result = await db.execute(
            select(func.count(User.id)).where(User.updated_at >= today_start)
        )
        logins_today = active_today_result.scalar() or 0
    except Exception:
        logins_today = 0

    # Health checks - typed as Literal for mypy
    api_health: Literal["healthy", "degraded", "unhealthy", "unknown"] = "healthy"
    db_health: Literal["healthy", "degraded", "unhealthy", "unknown"] = "healthy"
    external_health: Literal["healthy", "degraded", "unhealthy", "unknown"] = "healthy"

    # Simple database health check
    try:
        await db.execute(select(func.count(User.id)))
    except Exception:
        db_health = "unhealthy"

    return AdminStatsResponse(
        users=UserStats(
            total=total_users,
            active=active_users,
            newThisWeek=new_users,
        ),
        organizations=OrganizationStats(
            total=org_total,
            active=org_active,
        ),
        content=ContentStats(
            guides=total_guides,
            publishedGuides=published_guides,
            libraryResources=total_resources,
            featuredResources=featured_resources,
            workshops=total_workshops,
        ),
        activity=ActivityStats(
            loginsToday=logins_today,
            activeSessions=active_sessions,
            apiRequests24h=api_requests,
        ),
        health=HealthStats(
            api=api_health,
            database=db_health,
            externalServices=external_health,
        ),
    )
