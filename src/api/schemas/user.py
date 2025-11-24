"""Pydantic schemas for User resource."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from src.core.constants import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr = Field(..., description="User email address")
    full_name: str | None = Field(None, max_length=255, description="User full name")


class UserCreate(UserBase):
    """Schema for creating a new user via self-registration."""

    password: str = Field(..., min_length=8, description="User password (min 8 chars)")
    # Note: role field removed - self-registration always creates PARTICIPANT


class UserCreateAdmin(UserBase):
    """Schema for admin-created users with role assignment."""

    password: str = Field(..., min_length=8, description="User password (min 8 chars)")
    role: UserRole = Field(default=UserRole.PARTICIPANT, description="User role")


class UserUpdate(BaseModel):
    """Schema for updating an existing user."""

    full_name: str | None = Field(None, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user responses."""

    id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token expiry in seconds")


class UserWithToken(UserResponse):
    """Schema for user with authentication tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token expiry in seconds")
