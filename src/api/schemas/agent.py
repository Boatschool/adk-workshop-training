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
