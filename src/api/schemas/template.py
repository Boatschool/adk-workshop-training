"""Pydantic schemas for Agent Templates."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from src.core.constants import TemplateCategory, TemplateDifficulty, TemplateStatus

# ============================================================================
# Agent Template Schemas
# ============================================================================


class AgentTemplateBase(BaseModel):
    """Base agent template schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    description: str = Field(..., min_length=10, description="What this agent does")
    yaml_content: str = Field(..., min_length=10, description="The YAML configuration")
    category: TemplateCategory = Field(..., description="Template category")
    difficulty: TemplateDifficulty = Field(..., description="Difficulty level")
    use_case: str | None = Field(None, description="Detailed use case description")
    tags: list[str] = Field(default_factory=list, max_length=10, description="Searchable tags")
    thumbnail_url: str | None = Field(None, max_length=500, description="Preview image URL")


class AgentTemplateCreate(AgentTemplateBase):
    """Schema for creating/submitting a new agent template."""

    @field_validator("yaml_content")
    @classmethod
    def validate_yaml(cls, v: str) -> str:
        """Validate that the YAML content is valid."""
        import yaml

        try:
            parsed = yaml.safe_load(v)
            if not isinstance(parsed, dict):
                raise ValueError("YAML must be a dictionary/object")
            if "name" not in parsed:
                raise ValueError("YAML must contain a 'name' field")
            if "model" not in parsed:
                raise ValueError("YAML must contain a 'model' field")
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML: {e}") from e
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        """Validate and normalize tags."""
        return [tag.lower().strip() for tag in v if tag.strip()][:10]


class AgentTemplateUpdate(BaseModel):
    """Schema for updating an existing agent template."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=10)
    yaml_content: str | None = Field(None, min_length=10)
    category: TemplateCategory | None = None
    difficulty: TemplateDifficulty | None = None
    use_case: str | None = None
    tags: list[str] | None = None
    thumbnail_url: str | None = Field(None, max_length=500)

    @field_validator("yaml_content")
    @classmethod
    def validate_yaml(cls, v: str | None) -> str | None:
        """Validate that the YAML content is valid."""
        if v is None:
            return v
        import yaml

        try:
            parsed = yaml.safe_load(v)
            if not isinstance(parsed, dict):
                raise ValueError("YAML must be a dictionary/object")
            if "name" not in parsed:
                raise ValueError("YAML must contain a 'name' field")
            if "model" not in parsed:
                raise ValueError("YAML must contain a 'model' field")
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML: {e}") from e
        return v


class AgentTemplateResponse(BaseModel):
    """Schema for agent template responses."""

    id: UUID
    name: str
    description: str
    yaml_content: str
    category: TemplateCategory
    difficulty: TemplateDifficulty
    use_case: str | None
    tags: list[str]
    author_id: UUID | None
    author_name: str
    status: TemplateStatus
    rejection_reason: str | None
    approved_by: UUID | None
    approved_at: datetime | None
    featured: bool
    download_count: int
    model: str | None
    has_tools: bool
    has_sub_agents: bool
    thumbnail_url: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgentTemplateListResponse(BaseModel):
    """Simplified schema for template list views (without full YAML)."""

    id: UUID
    name: str
    description: str
    category: TemplateCategory
    difficulty: TemplateDifficulty
    tags: list[str]
    author_name: str
    status: TemplateStatus
    featured: bool
    download_count: int
    model: str | None
    has_tools: bool
    has_sub_agents: bool
    thumbnail_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class AgentTemplateWithUserData(AgentTemplateResponse):
    """Template response with user-specific bookmark data."""

    is_bookmarked: bool = False


# ============================================================================
# Admin Schemas
# ============================================================================


class TemplateApproveRequest(BaseModel):
    """Schema for approving a template."""

    pass  # No additional data needed, just confirming approval


class TemplateRejectRequest(BaseModel):
    """Schema for rejecting a template."""

    reason: str = Field(..., min_length=10, max_length=1000, description="Reason for rejection")


class TemplateFeatureRequest(BaseModel):
    """Schema for featuring/unfeaturing a template."""

    featured: bool = Field(..., description="Whether to feature the template")


# ============================================================================
# Bookmark Schemas
# ============================================================================


class TemplateBookmarkResponse(BaseModel):
    """Schema for bookmark responses."""

    id: UUID
    user_id: UUID
    template_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateBookmarkStatusResponse(BaseModel):
    """Schema for bookmark status check."""

    is_bookmarked: bool
    bookmarked_at: datetime | None = None


# ============================================================================
# Download Schemas
# ============================================================================


class TemplateDownloadResponse(BaseModel):
    """Schema for template download response."""

    filename: str = Field(..., description="Suggested filename for the download")
    content: str = Field(..., description="YAML content")
    content_type: str = Field(default="text/yaml", description="MIME type")


# ============================================================================
# Query Parameter Schemas
# ============================================================================


class TemplateFilters(BaseModel):
    """Query parameters for filtering templates."""

    search: str | None = Field(default=None, description="Search query for name/description/tags")
    category: TemplateCategory | None = Field(default=None, description="Filter by category")
    difficulty: TemplateDifficulty | None = Field(default=None, description="Filter by difficulty")
    featured: bool | None = Field(default=None, description="Filter by featured status")
    has_tools: bool | None = Field(default=None, description="Filter by whether template uses tools")
    has_sub_agents: bool | None = Field(default=None, description="Filter by multi-agent templates")
    status: TemplateStatus | None = Field(default=None, description="Filter by status (admin only)")


# ============================================================================
# Statistics Schemas
# ============================================================================


class TemplateStatsResponse(BaseModel):
    """Schema for template statistics."""

    total_templates: int
    approved_templates: int
    pending_templates: int
    total_downloads: int
    templates_by_category: dict[str, int]
    templates_by_difficulty: dict[str, int]
