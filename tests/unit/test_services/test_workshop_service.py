"""Unit tests for WorkshopService."""

import os
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

# Set environment variables before importing modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only-not-for-production"

from src.api.schemas.workshop import WorkshopCreate, WorkshopUpdate
from src.core.exceptions import NotFoundError
from src.services.workshop_service import WorkshopService


class TestWorkshopServiceInit:
    """Tests for WorkshopService initialization."""

    def test_init_with_db_and_tenant_id(self) -> None:
        """Test WorkshopService initialization."""
        mock_db = MagicMock()
        tenant_id = "test-tenant"

        service = WorkshopService(db=mock_db, tenant_id=tenant_id)

        assert service.db is mock_db
        assert service.tenant_id == tenant_id


class TestWorkshopServiceCreateWorkshop:
    """Tests for WorkshopService.create_workshop method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.add = MagicMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> WorkshopService:
        """Create a WorkshopService instance with mock db."""
        return WorkshopService(db=mock_db, tenant_id="test-tenant")

    @pytest.fixture
    def workshop_create_data(self) -> WorkshopCreate:
        """Create test workshop data."""
        return WorkshopCreate(
            title="ADK Fundamentals",
            description="Learn the basics of Google ADK",
            start_date=datetime.now() + timedelta(days=1),
            end_date=datetime.now() + timedelta(days=7),
        )

    @pytest.mark.asyncio
    async def test_create_workshop_success(
        self, service: WorkshopService, mock_db: AsyncMock, workshop_create_data: WorkshopCreate
    ) -> None:
        """Test successful workshop creation."""
        creator_id = str(uuid4())

        result = await service.create_workshop(workshop_create_data, creator_id)

        # Verify db operations
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_db.refresh.called

    @pytest.mark.asyncio
    async def test_create_workshop_minimal_data(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test creating workshop with minimal required data."""
        workshop_data = WorkshopCreate(
            title="Minimal Workshop",
        )
        creator_id = str(uuid4())

        result = await service.create_workshop(workshop_data, creator_id)

        assert mock_db.add.called


class TestWorkshopServiceGetWorkshop:
    """Tests for WorkshopService.get_workshop_by_id method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> WorkshopService:
        """Create a WorkshopService instance with mock db."""
        return WorkshopService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_get_workshop_by_id_found(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test getting workshop by ID when workshop exists."""
        mock_workshop = MagicMock()
        mock_workshop.id = str(uuid4())
        mock_workshop.title = "Test Workshop"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_workshop
        mock_db.execute.return_value = mock_result

        result = await service.get_workshop_by_id(mock_workshop.id)

        assert result is mock_workshop

    @pytest.mark.asyncio
    async def test_get_workshop_by_id_not_found(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test getting workshop by ID when workshop doesn't exist."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await service.get_workshop_by_id("nonexistent-id")

        assert result is None


class TestWorkshopServiceUpdateWorkshop:
    """Tests for WorkshopService.update_workshop method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> WorkshopService:
        """Create a WorkshopService instance with mock db."""
        return WorkshopService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_update_workshop_not_found(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test updating nonexistent workshop raises NotFoundError."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        update_data = WorkshopUpdate(title="New Title")

        with pytest.raises(NotFoundError) as exc_info:
            await service.update_workshop("nonexistent-id", update_data)

        assert "not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_update_workshop_success(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test successful workshop update."""
        mock_workshop = MagicMock()
        mock_workshop.id = str(uuid4())
        mock_workshop.title = "Old Title"
        mock_workshop.description = "Old Description"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_workshop
        mock_db.execute.return_value = mock_result

        update_data = WorkshopUpdate(title="New Title", description="New Description")
        result = await service.update_workshop(mock_workshop.id, update_data)

        assert mock_db.commit.called
        assert mock_db.refresh.called

    @pytest.mark.asyncio
    async def test_update_workshop_partial(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test partial workshop update."""
        mock_workshop = MagicMock()
        mock_workshop.id = str(uuid4())
        mock_workshop.title = "Original Title"
        mock_workshop.description = "Original Description"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_workshop
        mock_db.execute.return_value = mock_result

        # Only update title
        update_data = WorkshopUpdate(title="Updated Title")
        await service.update_workshop(mock_workshop.id, update_data)

        assert mock_db.commit.called


class TestWorkshopServiceListWorkshops:
    """Tests for WorkshopService.list_workshops method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> WorkshopService:
        """Create a WorkshopService instance with mock db."""
        return WorkshopService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_list_workshops_empty(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test listing workshops when none exist."""
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_workshops()

        assert result == []

    @pytest.mark.asyncio
    async def test_list_workshops_with_results(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test listing workshops with results."""
        mock_workshops = [MagicMock() for _ in range(3)]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_workshops

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_workshops()

        assert len(result) == 3

    @pytest.mark.asyncio
    async def test_list_workshops_with_pagination(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test listing workshops with pagination."""
        mock_workshops = [MagicMock() for _ in range(5)]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_workshops

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_workshops(skip=0, limit=5)

        assert len(result) == 5

    @pytest.mark.asyncio
    async def test_list_workshops_with_status_filter(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test listing workshops with status filter."""
        mock_workshops = [MagicMock() for _ in range(2)]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_workshops

        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await service.list_workshops(status="active")

        assert len(result) == 2


class TestWorkshopServiceDeleteWorkshop:
    """Tests for WorkshopService.delete_workshop method."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Create a mock database session."""
        mock = AsyncMock()
        mock.execute = AsyncMock()
        mock.delete = AsyncMock()
        mock.commit = AsyncMock()
        return mock

    @pytest.fixture
    def service(self, mock_db: AsyncMock) -> WorkshopService:
        """Create a WorkshopService instance with mock db."""
        return WorkshopService(db=mock_db, tenant_id="test-tenant")

    @pytest.mark.asyncio
    async def test_delete_workshop_not_found(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test deleting nonexistent workshop raises NotFoundError."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with pytest.raises(NotFoundError) as exc_info:
            await service.delete_workshop("nonexistent-id")

        assert "not found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_delete_workshop_success(
        self, service: WorkshopService, mock_db: AsyncMock
    ) -> None:
        """Test successful workshop deletion."""
        mock_workshop = MagicMock()
        mock_workshop.id = str(uuid4())

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_workshop
        mock_db.execute.return_value = mock_result

        await service.delete_workshop(mock_workshop.id)

        assert mock_db.delete.called
        assert mock_db.commit.called
