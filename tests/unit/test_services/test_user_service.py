"""Unit tests for UserService."""

import os
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"

from src.api.schemas.user import UserCreate, UserUpdate
from src.core.exceptions import AuthenticationError, NotFoundError, ValidationError
from src.services.user_service import UserService


class TestUserServiceInit:
    """Tests for UserService initialization."""

    def test_init_with_db_and_tenant_id(self) -> None:
        """Test UserService initialization."""
        mock_db = MagicMock()
        tenant_id = "test-tenant"

        service = UserService(db=mock_db, tenant_id=tenant_id)

        assert service.db is mock_db
        assert service.tenant_id == tenant_id


class TestUserServiceCreateUser:
    """Tests for UserService.create_user method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.add = MagicMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> UserService:
        """Create a UserService instance with mock db."""
        return UserService(db=mock_db, tenant_id="test-tenant")

    @pytest.fixture
    def user_create_data(self) -> UserCreate:
        """Create test user data."""
        return UserCreate(
            email="test@example.com",
            password="SecureP@ss123",
            full_name="Test User",
            role="participant",
        )

    @pytest.mark.asyncio
    async def test_create_user_success(
        self, service: UserService, mock_db: AsyncMock, user_create_data: UserCreate
    ) -> None:
        """Test successful user creation."""
        # Mock no existing user
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await service.create_user(user_create_data)

        # Verify db.add was called
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email_raises_error(
        self, service: UserService, mock_db: AsyncMock, user_create_data: UserCreate
    ) -> None:
        """Test that creating user with existing email raises ValidationError."""
        # Mock existing user found
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = MagicMock()  # Existing user
        mock_db.execute.return_value = mock_result

        with pytest.raises(ValidationError) as exc_info:
            await service.create_user(user_create_data)

        assert "already exists" in str(exc_info.value)


class TestUserServiceGetUser:
    """Tests for UserService get methods."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> UserService:
        """Create a UserService instance with mock db."""
        return UserService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_get_user_by_id_found(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test getting user by ID when user exists."""
        mock_user = MagicMock()
        mock_user.id = str(uuid4())
        mock_user.email = "test@example.com"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        result = await service.get_user_by_id(mock_user.id)

        assert result is mock_user

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test getting user by ID when user doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await service.get_user_by_id("nonexistent-id")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_user_by_email_found(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test getting user by email when user exists."""
        mock_user = MagicMock()
        mock_user.email = "test@example.com"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        result = await service.get_user_by_email("test@example.com")

        assert result is mock_user
        assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_user_by_email_not_found(
        self, service: UserService, mock_db: AsyncMock
    ) -> None:
        """Test getting user by email when user doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await service.get_user_by_email("nonexistent@example.com")

        assert result is None


class TestUserServiceAuthenticate:
    """Tests for UserService.authenticate_user method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> UserService:
        """Create a UserService instance with mock db."""
        return UserService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(
        self, service: UserService, mock_db: AsyncMock
    ) -> None:
        """Test authentication fails when user doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with pytest.raises(AuthenticationError) as exc_info:
            await service.authenticate_user("unknown@example.com", "password")

        assert "Invalid email or password" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_authenticate_inactive_user(
        self, service: UserService, mock_db: AsyncMock
    ) -> None:
        """Test authentication fails for inactive user."""
        mock_user = MagicMock()
        mock_user.is_active = False
        mock_user.locked_until = None  # Account lockout field
        mock_user.failed_login_attempts = 0  # Brute force protection field

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with pytest.raises(AuthenticationError) as exc_info:
            await service.authenticate_user("test@example.com", "password")

        assert "inactive" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_authenticate_wrong_password(
        self, service: UserService, mock_db: AsyncMock
    ) -> None:
        """Test authentication fails with wrong password."""
        from src.core.security import hash_password

        mock_user = MagicMock()
        mock_user.is_active = True
        mock_user.hashed_password = hash_password("correct_password")
        mock_user.locked_until = None  # Account lockout field
        mock_user.failed_login_attempts = 0  # Brute force protection field

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        with pytest.raises(AuthenticationError) as exc_info:
            await service.authenticate_user("test@example.com", "wrong_password")

        assert "Invalid email or password" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_authenticate_success(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test successful authentication."""
        from src.core.security import hash_password

        password = "correct_password"
        mock_user = MagicMock()
        mock_user.is_active = True
        mock_user.hashed_password = hash_password(password)
        mock_user.locked_until = None  # Account lockout field
        mock_user.failed_login_attempts = 0  # Brute force protection field

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        result = await service.authenticate_user("test@example.com", password)

        assert result is mock_user


class TestUserServiceUpdateUser:
    """Tests for UserService.update_user method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> UserService:
        """Create a UserService instance with mock db."""
        return UserService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_update_user_not_found(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test updating nonexistent user raises NotFoundError."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        update_data = UserUpdate(full_name="New Name")

        with pytest.raises(NotFoundError) as exc_info:
            await service.update_user("nonexistent-id", update_data)

        assert "not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_update_user_success(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test successful user update."""
        mock_user = MagicMock()
        mock_user.id = str(uuid4())
        mock_user.full_name = "Old Name"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result

        update_data = UserUpdate(full_name="New Name")
        result = await service.update_user(mock_user.id, update_data)

        assert mock_db.commit.called
        assert mock_db.refresh.called


class TestUserServiceListUsers:
    """Tests for UserService.list_users method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> UserService:
        """Create a UserService instance with mock db."""
        return UserService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_list_users_empty(self, service: UserService, mock_db: AsyncMock) -> None:
        """Test listing users when none exist."""
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_users()

        assert result == []

    @pytest.mark.asyncio
    async def test_list_users_with_pagination(
        self, service: UserService, mock_db: AsyncMock
    ) -> None:
        """Test listing users with pagination parameters."""
        mock_users = [MagicMock() for _ in range(5)]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_users

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_users(skip=10, limit=5)

        assert len(result) == 5
