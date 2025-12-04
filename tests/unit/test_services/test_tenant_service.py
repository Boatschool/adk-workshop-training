"""Unit tests for TenantService."""

import os
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"

from src.api.schemas.tenant import TenantCreate, TenantUpdate
from src.core.exceptions import NotFoundError, ValidationError
from src.services.tenant_service import TenantService


class TestTenantServiceInit:
    """Tests for TenantService initialization."""

    def test_init_with_db(self) -> None:
        """Test TenantService initialization."""
        mock_db = MagicMock()

        service = TenantService(db=mock_db)

        assert service.db is mock_db


class TestTenantServiceCreateTenant:
    """Tests for TenantService.create_tenant method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.add = MagicMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        mock.flush = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> TenantService:
        """Create a TenantService instance with mock db."""
        return TenantService(db=mock_db)

    @pytest.fixture
    def tenant_create_data(self) -> TenantCreate:
        """Create test tenant data."""
        return TenantCreate(
            slug="acme",
            name="ACME Corporation",
            subscription_tier="professional",
        )

    @pytest.mark.asyncio
    async def test_create_tenant_success(
        self, service: TenantService, mock_db: AsyncMock, tenant_create_data: TenantCreate
    ) -> None:
        """Test successful tenant creation."""
        # Mock no existing tenant
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Mock schema creation
        with patch("src.db.tenant_schema.create_tenant_schema_and_tables", new_callable=AsyncMock):
            result = await service.create_tenant(tenant_create_data)

        # Verify db operations
        assert mock_db.add.called
        assert mock_db.flush.called
        assert mock_db.commit.called
        assert mock_db.refresh.called

    @pytest.mark.asyncio
    async def test_create_tenant_duplicate_slug_raises_error(
        self, service: TenantService, mock_db: AsyncMock, tenant_create_data: TenantCreate
    ) -> None:
        """Test that creating tenant with existing slug raises ValidationError."""
        # Mock existing tenant found
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = MagicMock()  # Existing tenant
        mock_db.execute.return_value = mock_result

        with pytest.raises(ValidationError) as exc_info:
            await service.create_tenant(tenant_create_data)

        assert "already exists" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_create_tenant_schema_name_format(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test that tenant schema name is generated correctly."""
        tenant_data = TenantCreate(
            slug="test-company",  # Use hyphen, not underscore (slug validation)
            name="Test Company",
            subscription_tier="trial",
        )

        # Mock no existing tenant
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Capture the schema name used
        captured_schema = None

        async def capture_schema(db, schema_name):
            nonlocal captured_schema
            captured_schema = schema_name

        with patch(
            "src.db.tenant_schema.create_tenant_schema_and_tables",
            side_effect=capture_schema,
        ):
            await service.create_tenant(tenant_data)

        assert captured_schema is not None
        assert captured_schema.startswith("adk_tenant_")
        assert "test-company" in captured_schema


class TestTenantServiceGetTenant:
    """Tests for TenantService get methods."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> TenantService:
        """Create a TenantService instance with mock db."""
        return TenantService(db=mock_db)

    @pytest.mark.asyncio
    async def test_get_tenant_by_id_found(self, service: TenantService, mock_db: AsyncMock) -> None:
        """Test getting tenant by ID when tenant exists."""
        mock_tenant = MagicMock()
        mock_tenant.id = str(uuid4())
        mock_tenant.slug = "acme"
        mock_tenant.name = "ACME Corporation"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_tenant
        mock_db.execute.return_value = mock_result

        result = await service.get_tenant_by_id(mock_tenant.id)

        assert result is mock_tenant

    @pytest.mark.asyncio
    async def test_get_tenant_by_id_not_found(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test getting tenant by ID when tenant doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await service.get_tenant_by_id("nonexistent-id")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_tenant_by_slug_found(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test getting tenant by slug when tenant exists."""
        mock_tenant = MagicMock()
        mock_tenant.slug = "acme"
        mock_tenant.name = "ACME Corporation"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_tenant
        mock_db.execute.return_value = mock_result

        result = await service.get_tenant_by_slug("acme")

        assert result is mock_tenant
        assert result.slug == "acme"

    @pytest.mark.asyncio
    async def test_get_tenant_by_slug_not_found(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test getting tenant by slug when tenant doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await service.get_tenant_by_slug("nonexistent")

        assert result is None


class TestTenantServiceUpdateTenant:
    """Tests for TenantService.update_tenant method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> TenantService:
        """Create a TenantService instance with mock db."""
        return TenantService(db=mock_db)

    @pytest.mark.asyncio
    async def test_update_tenant_not_found(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test updating nonexistent tenant raises NotFoundError."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        update_data = TenantUpdate(name="New Name")

        with pytest.raises(NotFoundError) as exc_info:
            await service.update_tenant("nonexistent-id", update_data)

        assert "not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_update_tenant_success(self, service: TenantService, mock_db: AsyncMock) -> None:
        """Test successful tenant update."""
        mock_tenant = MagicMock()
        mock_tenant.id = str(uuid4())
        mock_tenant.name = "Old Name"
        mock_tenant.subscription_tier = "trial"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_tenant
        mock_db.execute.return_value = mock_result

        update_data = TenantUpdate(name="New Name", subscription_tier="professional")
        result = await service.update_tenant(mock_tenant.id, update_data)

        assert mock_db.commit.called
        assert mock_db.refresh.called

    @pytest.mark.asyncio
    async def test_update_tenant_partial(self, service: TenantService, mock_db: AsyncMock) -> None:
        """Test partial tenant update."""
        mock_tenant = MagicMock()
        mock_tenant.id = str(uuid4())
        mock_tenant.name = "Original Name"
        mock_tenant.subscription_tier = "trial"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_tenant
        mock_db.execute.return_value = mock_result

        # Only update name, not subscription_tier
        update_data = TenantUpdate(name="Updated Name")
        await service.update_tenant(mock_tenant.id, update_data)

        # Subscription tier should remain unchanged
        assert mock_db.commit.called


class TestTenantServiceListTenants:
    """Tests for TenantService.list_tenants method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> TenantService:
        """Create a TenantService instance with mock db."""
        return TenantService(db=mock_db)

    @pytest.mark.asyncio
    async def test_list_tenants_empty(self, service: TenantService, mock_db: AsyncMock) -> None:
        """Test listing tenants when none exist."""
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_tenants()

        assert result == []

    @pytest.mark.asyncio
    async def test_list_tenants_with_results(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test listing tenants with results."""
        mock_tenants = [MagicMock() for _ in range(3)]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_tenants

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_tenants()

        assert len(result) == 3

    @pytest.mark.asyncio
    async def test_list_tenants_with_pagination(
        self, service: TenantService, mock_db: AsyncMock
    ) -> None:
        """Test listing tenants with pagination."""
        mock_tenants = [MagicMock() for _ in range(5)]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_tenants

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_tenants(skip=10, limit=5)

        assert len(result) == 5
