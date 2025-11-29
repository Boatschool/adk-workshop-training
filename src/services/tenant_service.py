"""Tenant service for managing tenant operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.tenant import TenantCreate, TenantUpdate
from src.core.config import get_settings
from src.core.exceptions import NotFoundError, ValidationError
from src.db.models.tenant import Tenant

settings = get_settings()


class TenantService:
    """Service for tenant management operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize tenant service.

        Args:
            db: Database session
        """
        self.db = db

    async def create_tenant(self, tenant_data: TenantCreate) -> Tenant:
        """
        Create a new tenant with its own database schema.

        Args:
            tenant_data: Tenant creation data

        Returns:
            Tenant: Created tenant

        Raises:
            ValidationError: If tenant slug already exists
        """
        # Check if slug already exists
        existing = await self.get_tenant_by_slug(tenant_data.slug)
        if existing:
            raise ValidationError(f"Tenant with slug '{tenant_data.slug}' already exists")

        # Generate database schema name
        database_schema = f"{settings.default_tenant_schema_prefix}{tenant_data.slug}"

        # Create tenant record
        tenant = Tenant(
            slug=tenant_data.slug,
            name=tenant_data.name,
            database_schema=database_schema,
            subscription_tier=tenant_data.subscription_tier,
        )

        # TODO: Store Google API key in Secret Manager if provided
        # if tenant_data.google_api_key:
        #     secret_path = await store_secret(tenant.id, tenant_data.google_api_key)
        #     tenant.google_api_key_secret = secret_path

        self.db.add(tenant)
        await self.db.flush()

        # Create tenant schema in database
        await self._create_tenant_schema(database_schema)

        await self.db.commit()
        await self.db.refresh(tenant)

        return tenant

    async def get_tenant_by_id(self, tenant_id: str) -> Tenant | None:
        """
        Get tenant by ID.

        Args:
            tenant_id: Tenant UUID

        Returns:
            Tenant or None if not found
        """
        result = await self.db.execute(select(Tenant).where(Tenant.id == tenant_id))
        return result.scalar_one_or_none()

    async def get_tenant_by_slug(self, slug: str) -> Tenant | None:
        """
        Get tenant by slug.

        Args:
            slug: Tenant slug

        Returns:
            Tenant or None if not found
        """
        result = await self.db.execute(select(Tenant).where(Tenant.slug == slug))
        return result.scalar_one_or_none()

    async def update_tenant(self, tenant_id: str, tenant_data: TenantUpdate) -> Tenant:
        """
        Update an existing tenant.

        Args:
            tenant_id: Tenant UUID
            tenant_data: Tenant update data

        Returns:
            Tenant: Updated tenant

        Raises:
            NotFoundError: If tenant not found
        """
        tenant = await self.get_tenant_by_id(tenant_id)
        if not tenant:
            raise NotFoundError(f"Tenant with ID '{tenant_id}' not found")

        # Update fields
        update_data = tenant_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "google_api_key" and value:
                # TODO: Store in Secret Manager
                # secret_path = await store_secret(tenant.id, value)
                # tenant.google_api_key_secret = secret_path
                pass
            elif hasattr(tenant, field):
                setattr(tenant, field, value)

        await self.db.commit()
        await self.db.refresh(tenant)

        return tenant

    async def list_tenants(self, skip: int = 0, limit: int = 100) -> list[Tenant]:
        """
        List all tenants with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            list[Tenant]: List of tenants
        """
        result = await self.db.execute(
            select(Tenant).order_by(Tenant.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def _create_tenant_schema(self, schema_name: str) -> None:
        """
        Create a new PostgreSQL schema for the tenant with all required tables.

        Args:
            schema_name: Name of the schema to create
        """
        from src.db.tenant_schema import create_tenant_schema_and_tables

        # This function handles sanitization and table creation
        await create_tenant_schema_and_tables(self.db, schema_name)
