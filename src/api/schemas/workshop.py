"""Pydantic schemas for Workshop and Exercise resources."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.core.constants import ExerciseStatus, WorkshopStatus


class WorkshopBase(BaseModel):
    """Base workshop schema with common fields."""

    title: str = Field(..., min_length=1, max_length=255, description="Workshop title")
    description: str | None = Field(None, description="Workshop description")


class WorkshopCreate(WorkshopBase):
    """Schema for creating a new workshop."""

    start_date: datetime | None = Field(None, description="Workshop start date")
    end_date: datetime | None = Field(None, description="Workshop end date")


class WorkshopUpdate(BaseModel):
    """Schema for updating an existing workshop."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    status: WorkshopStatus | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class WorkshopResponse(WorkshopBase):
    """Schema for workshop responses."""

    id: UUID
    status: WorkshopStatus
    start_date: datetime | None
    end_date: datetime | None
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExerciseBase(BaseModel):
    """Base exercise schema with common fields."""

    title: str = Field(..., min_length=1, max_length=255, description="Exercise title")
    content_type: str = Field(..., description="Content type (markdown, jupyter, interactive)")
    content_path: str | None = Field(None, description="Cloud Storage path to content")
    order_index: int = Field(..., ge=0, description="Order within workshop")


class ExerciseCreate(ExerciseBase):
    """Schema for creating a new exercise."""

    workshop_id: UUID = Field(..., description="Workshop ID")


class ExerciseUpdate(BaseModel):
    """Schema for updating an existing exercise."""

    title: str | None = Field(None, min_length=1, max_length=255)
    content_type: str | None = None
    content_path: str | None = None
    order_index: int | None = Field(None, ge=0)


class ExerciseResponse(ExerciseBase):
    """Schema for exercise responses."""

    id: UUID
    workshop_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProgressBase(BaseModel):
    """Base progress schema with common fields."""

    status: ExerciseStatus = Field(
        default=ExerciseStatus.NOT_STARTED, description="Progress status"
    )


class ProgressUpdate(ProgressBase):
    """Schema for updating exercise progress."""

    time_spent_seconds: int | None = Field(None, ge=0)


class ProgressResponse(ProgressBase):
    """Schema for progress responses."""

    id: UUID
    user_id: UUID
    exercise_id: UUID
    completed_at: datetime | None
    time_spent_seconds: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
