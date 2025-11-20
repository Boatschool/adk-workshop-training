# ADK Platform v2.0

**Multi-Tenant AI Agent Development Platform**

A production-ready, scalable platform for building and deploying AI agents using Google's Agent Development Kit (ADK). Designed for healthcare organizations to create non-clinical AI automation workflows.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

## 🚀 Features

- **Multi-Tenant Architecture**: Schema-per-tenant isolation for enterprise security
- **Modern Python Stack**: FastAPI, SQLAlchemy 2.0, Pydantic v2, async/await
- **Google ADK Integration**: Build and deploy AI agents with Google's Agent Development Kit
- **Developer Experience**: Poetry, Ruff, Black, MyPy, pre-commit hooks
- **Production Ready**: Docker, PostgreSQL, comprehensive testing, structured logging

## 📁 Project Structure

```
adk-platform/
├── src/                          # Application source code
│   ├── api/                      # FastAPI application
│   │   ├── routes/               # API endpoints
│   │   ├── schemas/              # Pydantic models
│   │   ├── middleware/           # Request middleware
│   │   └── main.py               # FastAPI app entry
│   ├── core/                     # Business logic
│   │   ├── config.py             # Settings management
│   │   ├── tenancy.py            # Multi-tenant context
│   │   ├── constants.py          # Enums and constants
│   │   └── exceptions.py         # Custom exceptions
│   ├── db/                       # Database layer
│   │   ├── models/               # SQLAlchemy models
│   │   ├── migrations/           # Alembic migrations
│   │   ├── base.py               # Database base
│   │   └── session.py            # Session management
│   ├── services/                 # Service layer
│   ├── agents/                   # ADK agent templates
│   └── utils/                    # Utilities
│
├── tests/                        # Test suite
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── fixtures/                 # Test fixtures
│
├── content/                      # Workshop materials
│   ├── exercises/                # Training exercises
│   ├── guides/                   # Documentation
│   └── examples/                 # Agent examples
│
├── docs/                         # Documentation
│   ├── architecture/             # Architecture docs
│   ├── api/                      # API documentation
│   └── development/              # Dev guides
│
├── config/                       # Configuration files
├── scripts/                      # Utility scripts
├── pyproject.toml                # Poetry configuration
├── docker-compose.yml            # Local development
└── Dockerfile                    # Container image

```

## 🛠️ Quick Start

### Prerequisites

- Python 3.11+
- Poetry 1.7+
- Docker & Docker Compose (for local database)
- Google API Key ([setup guide](./google_api_setup_guide.md))

### Installation

1. **Clone the repository**

```bash
cd /Users/ronwince/Desktop/adk-workshop-training
```

2. **Install Poetry (if not already installed)**

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

3. **Install dependencies**

```bash
poetry install
```

4. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env and add your configuration
```

Required environment variables:
- `SECRET_KEY`: Random secret key for JWT signing
- `GOOGLE_API_KEY`: Your Google API key
- `DATABASE_URL`: PostgreSQL connection string

5. **Start local database**

```bash
docker-compose up -d postgres
```

6. **Run database migrations**

```bash
poetry run alembic upgrade head
```

7. **Start the application**

```bash
poetry run uvicorn src.api.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

API Documentation: http://localhost:8000/docs

### Development Commands

```bash
# Install dependencies
poetry install

# Run application
poetry run uvicorn src.api.main:app --reload

# Run tests
poetry run pytest

# Run tests with coverage
poetry run pytest --cov=src --cov-report=html

# Lint code
poetry run ruff check .

# Format code
poetry run black .

# Type checking
poetry run mypy src/

# Install pre-commit hooks
poetry run pre-commit install

# Run pre-commit on all files
poetry run pre-commit run --all-files
```

## 🗄️ Database Setup

### Local Development (Docker)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Create database
docker-compose exec postgres createdb -U adk_user adk_platform

# Run migrations
poetry run alembic upgrade head
```

### Database Migrations

```bash
# Create a new migration
poetry run alembic revision --autogenerate -m "Description of changes"

# Apply migrations
poetry run alembic upgrade head

# Rollback one migration
poetry run alembic downgrade -1

# View migration history
poetry run alembic history
```

## 🏗️ Architecture

### Multi-Tenant Design

The platform uses a **schema-per-tenant** approach:

- **Shared schema** (`adk_platform_shared`): Tenant metadata, subscriptions
- **Tenant schemas** (`adk_tenant_<id>`): User data, workshops, progress, agents

This provides strong isolation and security guarantees for healthcare data.

### Technology Stack

**Backend:**
- FastAPI (web framework)
- SQLAlchemy 2.0 (ORM with async support)
- Alembic (database migrations)
- Pydantic v2 (data validation)
- Google ADK (agent framework)

**Database:**
- PostgreSQL 15+ (with async support)

**Development:**
- Poetry (dependency management)
- Ruff (linting)
- Black (code formatting)
- MyPy (type checking)
- Pytest (testing)

## 🧪 Testing

```bash
# Run all tests
poetry run pytest

# Run specific test file
poetry run pytest tests/unit/test_tenancy.py

# Run with coverage
poetry run pytest --cov=src --cov-report=term-missing

# Run only unit tests
poetry run pytest tests/unit/

# Run only integration tests
poetry run pytest tests/integration/
```

## 📚 API Documentation

Once the application is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔐 Security

- **Multi-tenant isolation**: Schema-per-tenant database architecture
- **No PHI/PII**: Designed for non-clinical healthcare use cases
- **Environment variables**: Secrets managed via `.env` files (production: Cloud Secret Manager)
- **Input validation**: Pydantic models validate all API inputs
- **SQL injection prevention**: Parameterized queries via SQLAlchemy

## 🚢 Deployment

### Docker Build

```bash
# Build image
docker build -t adk-platform:latest .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e SECRET_KEY=... \
  -e GOOGLE_API_KEY=... \
  adk-platform:latest
```

### Production Checklist

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Use strong random `SECRET_KEY`
- [ ] Configure production database with SSL
- [ ] Set up proper CORS origins
- [ ] Enable database backups
- [ ] Configure structured logging
- [ ] Set up monitoring and alerting
- [ ] Review security settings

## 📖 Documentation

- [Workshop Materials](./README_WORKSHOP.md) - Original workshop guide
- [Architecture Overview](./docs/architecture/system-design.md) - Coming soon
- [API Reference](./docs/api/openapi.yaml) - Coming soon
- [Development Guide](./docs/development/setup.md) - Coming soon
- [Deployment Guide](./docs/deployment/runbook.md) - Coming soon

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `poetry run pytest`
4. Run linting: `poetry run ruff check . && poetry run black .`
5. Run type checking: `poetry run mypy src/`
6. Commit changes: `git commit -am 'Add my feature'`
7. Push branch: `git push origin feature/my-feature`
8. Create a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Built with [Google Agent Development Kit (ADK)](https://github.com/google/adk-python)

Copyright © 2025 GraymatterLab

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/adk-platform/issues)
- **Email**: support@graymatterlab.com
- **Documentation**: [Workshop Guide](./README_WORKSHOP.md)

---

## Migration Notes

This is v2.0 - a complete architectural refactor of the original workshop codebase.

**Changes from v1.0:**
- ✅ Modern project structure (src/, tests/, docs/ separation)
- ✅ Flask → FastAPI migration
- ✅ Multi-tenant database architecture
- ✅ Async/await support throughout
- ✅ Comprehensive test coverage
- ✅ Production-ready configuration
- ✅ Docker containerization
- ✅ Developer tooling (Poetry, Ruff, Black, MyPy)

**For workshop participants**: See [README_WORKSHOP.md](./README_WORKSHOP.md) for the original workshop guide.

**For developers**: Continue reading this document for development setup and architecture details.

See [tasks/task_002_refactor_to_production_gcp_architecture.md](./tasks/task_002_refactor_to_production_gcp_architecture.md) for detailed refactoring plan and rationale.
