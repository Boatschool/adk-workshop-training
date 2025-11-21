# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ADK Platform v2.0 is a multi-tenant AI agent development platform built on Google's Agent Development Kit (ADK). It provides a FastAPI backend with schema-per-tenant PostgreSQL isolation for healthcare organizations building non-clinical AI automation workflows.

## Essential Commands

```bash
# Install dependencies
poetry install

# Start local PostgreSQL (port 5433)
docker-compose up -d postgres

# Run database migrations
poetry run alembic upgrade head

# Start API server (development)
poetry run uvicorn src.api.main:app --reload --port 8000

# Run tests with coverage
poetry run pytest

# Run a single test file
poetry run pytest tests/unit/test_tenancy.py -v

# Lint and format
poetry run ruff check .
poetry run black .

# Type checking
poetry run mypy src/

# Pre-commit hooks
poetry run pre-commit install
poetry run pre-commit run --all-files
```

## Database Commands

```bash
# Create new migration
poetry run alembic revision --autogenerate -m "Description"

# Apply migrations
poetry run alembic upgrade head

# Rollback one migration
poetry run alembic downgrade -1

# View migration history
poetry run alembic history
```

## Architecture

### Multi-Tenant Database Design

The platform uses **schema-per-tenant isolation**:
- **Shared schema** (`adk_platform_shared`): Tenant metadata in `tenants` table
- **Tenant schemas** (`adk_platform_tenant_<slug>`): Per-tenant User, Workshop, Exercise, Progress, Agent tables

Tenant context is set via `X-Tenant-ID` header and managed through `src/core/tenancy.py`.

### Source Code Structure

```
src/
├── api/                 # FastAPI application layer
│   ├── main.py          # App entry point, lifespan events
│   ├── dependencies.py  # Auth/tenant injection (get_current_user, get_tenant_id)
│   ├── routes/          # API endpoints (health, tenants, users, workshops)
│   ├── schemas/         # Pydantic request/response models
│   └── middleware/      # Tenant extraction middleware
├── core/                # Business logic and configuration
│   ├── config.py        # Pydantic Settings (env vars)
│   ├── tenancy.py       # Thread-safe tenant context manager
│   ├── security.py      # JWT tokens, password hashing
│   ├── constants.py     # Enums (UserRole, TenantStatus, WorkshopStatus)
│   └── exceptions.py    # Custom exception hierarchy
├── db/                  # Database layer
│   ├── session.py       # Async SQLAlchemy engine/session factory
│   ├── base.py          # Declarative base with tenant schema awareness
│   ├── tenant_schema.py # Dynamic schema creation/provisioning
│   ├── models/          # SQLAlchemy models (Tenant, User, Workshop, etc.)
│   └── migrations/      # Alembic migrations
└── services/            # Business logic services
    ├── tenant_service.py   # Tenant CRUD + schema provisioning
    ├── user_service.py     # User auth + CRUD
    └── workshop_service.py # Workshop CRUD
```

### Key Patterns

- **Async/await throughout**: All database operations use SQLAlchemy async sessions
- **Dependency injection**: FastAPI Depends() for auth, tenant context, database sessions
- **Role-based access**: UserRole enum (participant, instructor, tenant_admin, super_admin) with `require_role()` factory
- **Service layer**: Business logic in `src/services/`, routes are thin orchestrators

### API Authentication

- JWT Bearer tokens via `Authorization: Bearer <token>`
- `X-Tenant-ID` header required for all tenant-scoped operations
- Roles checked via `require_admin`, `require_instructor` dependencies

## Code Style

- Python 3.11+
- Black formatter (line length 100)
- Ruff linter with isort
- MyPy strict type checking
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Environment Variables

Required in `.env` (copy from `.env.example`):
- `SECRET_KEY`: JWT signing key
- `GOOGLE_API_KEY`: Google ADK API key
- `DATABASE_URL`: PostgreSQL async connection string (default: `postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform`)

## Local Development

The PostgreSQL container exposes port 5433 (not 5432) to avoid conflicts. The API runs on port 8000 by default.

API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
