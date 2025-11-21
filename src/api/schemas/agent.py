"""Pydantic schemas for Agent resources."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.constants import AgentStatus


class AgentBase(BaseModel):
    """Base agent schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Agent name")
    agent_type: str = Field(
        ..., min_length=1, max_length=100, description="Agent type (e.g., faq, scheduler, router)"
    )
    config: dict[str, Any] = Field(default_factory=dict, description="Agent configuration")


# ============================================================================
# Agent Execution Schemas
# ============================================================================


class AgentExecuteRequest(BaseModel):
    """Request schema for executing an agent."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User message to send to the agent",
    )
    config_override: dict[str, Any] | None = Field(
        None, description="Optional configuration overrides"
    )
    session_id: str | None = Field(
        None, description="Session ID for conversation continuity"
    )


class AgentExecuteResponse(BaseModel):
    """Response schema for agent execution."""

    success: bool = Field(..., description="Whether execution succeeded")
    message: str = Field(..., description="Agent's response message")
    data: dict[str, Any] | None = Field(None, description="Additional response data")
    error: str | None = Field(None, description="Error message if failed")
    execution_time_ms: int | None = Field(
        None, description="Execution time in milliseconds"
    )
    model_used: str | None = Field(None, description="Model that processed the request")
    tokens_used: int | None = Field(None, description="Approximate token count")


class AgentTemplateInfo(BaseModel):
    """Information about an available agent template."""

    type: str = Field(..., description="Agent type identifier")
    name: str = Field(..., description="Display name")
    description: str = Field(..., description="Agent description")
    category: str = Field(..., description="Agent category")


class AgentTemplateDetail(AgentTemplateInfo):
    """Detailed information about an agent template."""

    default_config: dict[str, Any] = Field(
        ..., description="Default configuration values"
    )


class AgentCreate(AgentBase):
    """Schema for creating a new agent."""

    pass


class AgentUpdate(BaseModel):
    """Schema for updating an existing agent."""

    name: str | None = Field(None, min_length=1, max_length=255)
    agent_type: str | None = Field(None, min_length=1, max_length=100)
    config: dict[str, Any] | None = None
    status: AgentStatus | None = None


class AgentResponse(AgentBase):
    """Schema for agent responses."""

    id: UUID
    user_id: UUID
    status: AgentStatus
    last_run_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
