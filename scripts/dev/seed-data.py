#!/usr/bin/env python3
"""
ADK Platform - Development Data Seeder

Creates sample tenants, users, workshops, and exercises for local development.
Run from project root: poetry run python scripts/dev/seed-data.py
"""

import asyncio
import sys
from pathlib import Path
from uuid import uuid4

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.core.config import get_settings
from src.core.constants import UserRole, WorkshopStatus
from src.core.tenancy import TenantContext
from src.db.session import get_db_context, init_db
from src.db.tenant_schema import create_tenant_schema_and_tables
from src.services.tenant_service import TenantService
from src.services.user_service import UserService
from src.services.workshop_service import WorkshopService


async def create_tenant(db, name: str, slug: str) -> dict:
    """Create a tenant with its schema."""
    service = TenantService(db)

    # Check if tenant exists
    existing = await service.get_by_slug(slug)
    if existing:
        print(f"  Tenant '{slug}' already exists")
        return {"id": str(existing.id), "slug": existing.slug}

    # Create tenant
    tenant = await service.create(
        name=name,
        slug=slug,
        subscription_tier="trial",
    )
    print(f"  Created tenant: {name} ({slug})")
    return {"id": str(tenant.id), "slug": tenant.slug}


async def create_user(db, email: str, name: str, role: UserRole, password: str) -> dict:
    """Create a user in the current tenant context."""
    service = UserService(db)

    # Check if user exists
    existing = await service.get_by_email(email)
    if existing:
        print(f"    User '{email}' already exists")
        return {"id": str(existing.id), "email": existing.email}

    # Create user
    user = await service.create(
        email=email,
        full_name=name,
        password=password,
        role=role,
    )
    print(f"    Created user: {name} ({email}) - {role.value}")
    return {"id": str(user.id), "email": user.email}


async def create_workshop(db, title: str, description: str, creator_id: str) -> dict:
    """Create a workshop in the current tenant context."""
    service = WorkshopService(db)

    # Check if workshop exists
    workshops = await service.list(skip=0, limit=100)
    for w in workshops:
        if w.title == title:
            print(f"    Workshop '{title}' already exists")
            return {"id": str(w.id), "title": w.title}

    # Create workshop
    from src.api.schemas.workshop import WorkshopCreate
    workshop = await service.create(
        WorkshopCreate(
            title=title,
            description=description,
            status=WorkshopStatus.PUBLISHED,
        ),
        creator_id=creator_id,
    )
    print(f"    Created workshop: {title}")
    return {"id": str(workshop.id), "title": workshop.title}


async def seed_development_data():
    """Main seeding function."""
    print("\n" + "=" * 50)
    print("  ADK Platform - Development Data Seeder")
    print("=" * 50 + "\n")

    settings = get_settings()
    print(f"Database: {settings.database_url[:50]}...")
    print()

    # Initialize database
    await init_db()

    async with get_db_context() as db:
        # ---------------------------------------------------------------------
        # Create Demo Tenant: ACME Healthcare
        # ---------------------------------------------------------------------
        print("Creating demo tenant: ACME Healthcare")
        acme = await create_tenant(db, "ACME Healthcare", "acme")

        # Set tenant context
        TenantContext.set(acme["id"])

        print("  Creating users for ACME Healthcare:")

        # Admin user
        admin = await create_user(
            db,
            email="admin@acme.example.com",
            name="Alice Admin",
            role=UserRole.TENANT_ADMIN,
            password="admin123!",
        )

        # Instructor user
        instructor = await create_user(
            db,
            email="instructor@acme.example.com",
            name="Ivan Instructor",
            role=UserRole.INSTRUCTOR,
            password="instructor123!",
        )

        # Participant users
        for i in range(1, 4):
            await create_user(
                db,
                email=f"participant{i}@acme.example.com",
                name=f"Participant {i}",
                role=UserRole.PARTICIPANT,
                password="participant123!",
            )

        print("  Creating workshops for ACME Healthcare:")

        # Create workshops
        await create_workshop(
            db,
            title="Introduction to AI Agents",
            description="Learn the fundamentals of building AI agents with Google ADK.",
            creator_id=instructor["id"],
        )

        await create_workshop(
            db,
            title="Building Healthcare Assistants",
            description="Create AI assistants for non-clinical healthcare workflows.",
            creator_id=instructor["id"],
        )

        await create_workshop(
            db,
            title="Advanced Agent Patterns",
            description="Multi-agent systems, routing, and orchestration patterns.",
            creator_id=instructor["id"],
        )

        TenantContext.clear()

        # ---------------------------------------------------------------------
        # Create Demo Tenant: TechCorp
        # ---------------------------------------------------------------------
        print("\nCreating demo tenant: TechCorp")
        techcorp = await create_tenant(db, "TechCorp Inc", "techcorp")

        # Set tenant context
        TenantContext.set(techcorp["id"])

        print("  Creating users for TechCorp:")

        # Admin user
        await create_user(
            db,
            email="admin@techcorp.example.com",
            name="Terry TechAdmin",
            role=UserRole.TENANT_ADMIN,
            password="admin123!",
        )

        # Instructor user
        instructor2 = await create_user(
            db,
            email="instructor@techcorp.example.com",
            name="Irene Instructor",
            role=UserRole.INSTRUCTOR,
            password="instructor123!",
        )

        print("  Creating workshops for TechCorp:")

        await create_workshop(
            db,
            title="Getting Started with ADK",
            description="Quick start guide for Google Agent Development Kit.",
            creator_id=instructor2["id"],
        )

        TenantContext.clear()

    # -------------------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------------------
    print("\n" + "=" * 50)
    print("  Seeding Complete!")
    print("=" * 50)
    print("\nDemo Credentials:")
    print("-" * 50)
    print("\nACME Healthcare (tenant: acme):")
    print("  Admin:      admin@acme.example.com / admin123!")
    print("  Instructor: instructor@acme.example.com / instructor123!")
    print("  Participant: participant1@acme.example.com / participant123!")
    print("\nTechCorp (tenant: techcorp):")
    print("  Admin:      admin@techcorp.example.com / admin123!")
    print("  Instructor: instructor@techcorp.example.com / instructor123!")
    print("\nAPI Login Example:")
    print("-" * 50)
    print("""
curl -X POST http://localhost:8080/api/v1/users/login \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-ID: <tenant-uuid>" \\
  -d '{"email": "admin@acme.example.com", "password": "admin123!"}'
""")


if __name__ == "__main__":
    asyncio.run(seed_development_data())
