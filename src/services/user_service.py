"""User service for managing user operations."""

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.user import UserCreate, UserCreateAdmin, UserUpdate
from src.core.config import get_settings
from src.core.constants import UserRole
from src.core.exceptions import (
    AccountLockedError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
)
from src.core.security import hash_password, verify_password
from src.db.models.user import User

settings = get_settings()


class UserService:
    """Service for user management operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize user service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user via self-registration (always PARTICIPANT role).

        Args:
            user_data: User creation data

        Returns:
            User: Created user

        Raises:
            ValidationError: If email already exists
        """
        # Check if email already exists
        existing = await self.get_user_by_email(user_data.email)
        if existing:
            raise ValidationError(f"User with email '{user_data.email}' already exists")

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Create user with PARTICIPANT role (security: no role escalation)
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=UserRole.PARTICIPANT,  # Always PARTICIPANT for self-registration
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def create_user_admin(self, user_data: UserCreateAdmin) -> User:
        """
        Create a new user with specified role (admin-only operation).

        Args:
            user_data: User creation data with role

        Returns:
            User: Created user

        Raises:
            ValidationError: If email already exists
        """
        # Check if email already exists
        existing = await self.get_user_by_email(user_data.email)
        if existing:
            raise ValidationError(f"User with email '{user_data.email}' already exists")

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Create user with specified role
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=user_data.role,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def get_user_by_id(self, user_id: str) -> User | None:
        """
        Get user by ID.

        Args:
            user_id: User UUID

        Returns:
            User or None if not found
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Get user by email.

        Args:
            email: User email

        Returns:
            User or None if not found
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def authenticate_user(self, email: str, password: str) -> User:
        """
        Authenticate a user by email and password with brute force protection.

        Args:
            email: User email
            password: Plain text password

        Returns:
            User: Authenticated user

        Raises:
            AuthenticationError: If authentication fails
            AccountLockedError: If account is locked due to failed attempts
        """
        user = await self.get_user_by_email(email)
        if not user:
            raise AuthenticationError("Invalid email or password")

        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.now(UTC):
            # Calculate remaining lockout time
            remaining_minutes = (user.locked_until - datetime.now(UTC)).seconds // 60
            raise AccountLockedError(
                f"Account is locked due to too many failed login attempts. "
                f"Try again in {remaining_minutes} minute(s)."
            )

        # If lockout expired, reset failed attempts
        if user.locked_until and user.locked_until <= datetime.now(UTC):
            user.failed_login_attempts = 0
            user.locked_until = None
            await self.db.commit()

        # Check if account is active
        if not user.is_active:
            raise AuthenticationError("User account is inactive")

        # Verify password
        if not verify_password(password, user.hashed_password):
            # Increment failed attempts
            user.failed_login_attempts += 1

            # Lock account if threshold reached
            if user.failed_login_attempts >= settings.max_login_attempts:
                user.locked_until = datetime.now(UTC) + timedelta(
                    minutes=settings.lockout_duration_minutes
                )
                await self.db.commit()
                raise AccountLockedError(
                    f"Account locked due to {settings.max_login_attempts} failed login attempts. "
                    f"Try again in {settings.lockout_duration_minutes} minutes."
                )

            await self.db.commit()
            # Don't reveal how many attempts remaining for security
            raise AuthenticationError("Invalid email or password")

        # Successful authentication - reset failed attempts
        if user.failed_login_attempts > 0:
            user.failed_login_attempts = 0
            user.locked_until = None
            await self.db.commit()

        return user

    async def update_user(self, user_id: str, user_data: UserUpdate) -> User:
        """
        Update an existing user.

        Args:
            user_id: User UUID
            user_data: User update data

        Returns:
            User: Updated user

        Raises:
            NotFoundError: If user not found
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            raise NotFoundError(f"User with ID '{user_id}' not found")

        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def list_users(
        self, skip: int = 0, limit: int = 100, is_active: bool | None = None
    ) -> list[User]:
        """
        List users with pagination and optional filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            is_active: Filter by active status (None = all)

        Returns:
            list[User]: List of users
        """
        query = select(User).order_by(User.created_at.desc())

        if is_active is not None:
            query = query.where(User.is_active == is_active)

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())
