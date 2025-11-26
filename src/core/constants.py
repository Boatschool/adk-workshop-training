"""Application constants"""

from enum import Enum


class UserRole(str, Enum):
    """User roles for RBAC"""

    SUPER_ADMIN = "super_admin"
    TENANT_ADMIN = "tenant_admin"
    INSTRUCTOR = "instructor"
    PARTICIPANT = "participant"


class TenantStatus(str, Enum):
    """Tenant statuses"""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"
    PROVISIONING = "provisioning"


class WorkshopStatus(str, Enum):
    """Workshop statuses"""

    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ExerciseStatus(str, Enum):
    """Exercise completion statuses"""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentStatus(str, Enum):
    """Agent statuses"""

    STOPPED = "stopped"
    RUNNING = "running"
    ERROR = "error"


# Shared schema name for multi-tenant architecture
SHARED_SCHEMA = "adk_platform_shared"
