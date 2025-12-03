"""Admin API schemas."""

from typing import Literal

from pydantic import BaseModel


class UserStats(BaseModel):
    """User statistics."""

    total: int
    active: int
    newThisWeek: int


class OrganizationStats(BaseModel):
    """Organization (tenant) statistics."""

    total: int
    active: int


class ContentStats(BaseModel):
    """Content statistics."""

    guides: int
    publishedGuides: int
    libraryResources: int
    featuredResources: int
    workshops: int


class ActivityStats(BaseModel):
    """Activity statistics."""

    loginsToday: int
    activeSessions: int
    apiRequests24h: int


HealthStatus = Literal["healthy", "degraded", "unhealthy", "unknown"]


class HealthStats(BaseModel):
    """Platform health status."""

    api: HealthStatus
    database: HealthStatus
    externalServices: HealthStatus


class AdminStatsResponse(BaseModel):
    """Admin dashboard statistics response."""

    users: UserStats
    organizations: OrganizationStats
    content: ContentStats
    activity: ActivityStats
    health: HealthStats
