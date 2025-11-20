"""User service for managing user operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.user import UserCreate, UserUpdate
from src.core.exceptions import AuthenticationError, NotFoundError, ValidationError
from src.core.security import hash_password, verify_password
from src.db.models.user import User


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
        Create a new user in the tenant's schema.

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

        # Create user
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
        Authenticate a user by email and password.

        Args:
            email: User email
            password: Plain text password

        Returns:
            User: Authenticated user

        Raises:
            AuthenticationError: If authentication fails
        """
        user = await self.get_user_by_email(email)
        if not user:
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("User account is inactive")

        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

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
