"""Pydantic schemas for API request/response validation."""

from src.api.schemas.agent import AgentCreate, AgentResponse, AgentUpdate
from src.api.schemas.tenant import TenantCreate, TenantResponse, TenantUpdate
from src.api.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, UserWithToken
from src.api.schemas.workshop import (
    ExerciseCreate,
    ExerciseResponse,
    ExerciseUpdate,
    ProgressResponse,
    ProgressUpdate,
    WorkshopCreate,
    WorkshopResponse,
    WorkshopUpdate,
)

__all__ = [
    # Agent schemas
    "AgentCreate",
    "AgentUpdate",
    "AgentResponse",
    # Tenant schemas
    "TenantCreate",
    "TenantUpdate",
    "TenantResponse",
    # User schemas
    "UserCreate",
    "UserUpdate",
    "UserLogin",
    "UserResponse",
    "UserWithToken",
    # Workshop schemas
    "WorkshopCreate",
    "WorkshopUpdate",
    "WorkshopResponse",
    # Exercise schemas
    "ExerciseCreate",
    "ExerciseUpdate",
    "ExerciseResponse",
    # Progress schemas
    "ProgressUpdate",
    "ProgressResponse",
]
