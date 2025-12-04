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


class LibraryResourceType(str, Enum):
    """Library resource types"""

    ARTICLE = "article"
    VIDEO = "video"
    PDF = "pdf"
    TOOL = "tool"
    COURSE = "course"
    DOCUMENTATION = "documentation"


class LibraryResourceSource(str, Enum):
    """Library resource source types"""

    EXTERNAL = "external"
    EMBEDDED = "embedded"
    UPLOADED = "uploaded"  # For files uploaded to GCS


class LibraryTopic(str, Enum):
    """Library resource topics"""

    AGENT_FUNDAMENTALS = "agent-fundamentals"
    PROMPT_ENGINEERING = "prompt-engineering"
    MULTI_AGENT_SYSTEMS = "multi-agent-systems"
    TOOLS_INTEGRATIONS = "tools-integrations"
    DEPLOYMENT = "deployment"
    BEST_PRACTICES = "best-practices"


class LibraryDifficulty(str, Enum):
    """Library resource difficulty levels"""

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ResourceProgressStatus(str, Enum):
    """Resource progress statuses"""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class GuideIcon(str, Enum):
    """Guide icon types"""

    BOOK = "book"
    ROCKET = "rocket"
    TERMINAL = "terminal"
    WRENCH = "wrench"
    PLAY = "play"


# Shared schema name for multi-tenant architecture
SHARED_SCHEMA = "adk_platform_shared"
