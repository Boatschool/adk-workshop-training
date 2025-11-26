# ADK Platform v2.0

**Multi-Tenant AI Agent Development Platform**

A production-ready, scalable platform for building and deploying AI agents using Google's Agent Development Kit (ADK). Designed for healthcare organizations to create non-clinical AI automation workflows.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

## 🚀 Features

### Training Platform
- **Interactive Workshops**: Hands-on courses with step-by-step exercises for learning AI agent development
- **Setup Wizard**: Guided installation for local ADK Visual Builder with platform-specific instructions
- **Progress Tracking**: Badge/achievement system to track learning milestones
- **Visual Builder Integration**: Seamless connection to Google's ADK Visual Builder for hands-on practice
- **User Settings**: Configurable development environment and preferences
- **Ecosystem Navigation**: Clear path from learning to production with GraymatterLab ecosystem

### Platform Infrastructure
- **Multi-Tenant Architecture**: Schema-per-tenant isolation for enterprise security
- **Modern Python Stack**: FastAPI, SQLAlchemy 2.0, Pydantic v2, async/await
- **Google ADK Integration**: Build and deploy AI agents with Google's Agent Development Kit
- **Developer Experience**: Poetry, Ruff, Black, MyPy, pre-commit hooks
- **Production Ready**: Docker, PostgreSQL, comprehensive testing, structured logging

## 🎓 Training Platform

The ADK Training Platform provides a complete learning environment for mastering AI agent development:

### Getting Started
1. **Visit the Setup Wizard**: Navigate to `/getting-started` on the frontend (http://localhost:4000/getting-started)
2. **Follow Platform-Specific Instructions**: Automatically detects your OS (macOS, Windows, Linux)
3. **Install ADK Locally**: Copy-to-clipboard commands for easy setup
4. **Launch Visual Builder**: Connect to Google's ADK Visual Builder for hands-on practice
5. **Earn Achievements**: Complete setup to earn your first badge

### Learning Journey
- **Setup Wizard** - 7-step guided installation (30 minutes)
  - Prerequisites check (Python 3.11+)
  - Virtual environment setup
  - ADK installation
  - Google API key configuration
  - Visual Builder launch and verification

- **Workshops** - Interactive courses with exercises (coming soon)
  - Introduction to AI Agents
  - Building Your First Agent
  - Advanced Agent Patterns
  - Multi-Agent Systems

- **Progress Tracking** - Badge system with 4 achievements:
  - 🚀 Environment Setup - Complete the setup wizard
  - 🎓 Workshop Graduate - Finish your first workshop
  - ✅ First Steps - Complete your first exercise
  - 🛠️ Visual Builder Master - Build an agent with Visual Builder

### Ecosystem Integration
The platform connects three products in the GraymatterLab ecosystem:
1. **ADK Training Portal** (this app) - Learn agent fundamentals
2. **ADK Visual Builder** (Google) - Practice building agents locally
3. **GraymatterStudio** (production) - Deploy enterprise agents

See [docs/ecosystem.md](./docs/ecosystem.md) for the complete learning-to-production pipeline.

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

7. **Start the API server**

```bash
poetry run uvicorn src.api.main:app --reload --port 8080
```

The API will be available at http://localhost:8080

API Documentation: http://localhost:8080/docs

8. **Start the Frontend** (React application)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:4000

9. **Start the ADK Visual Builder** (optional, for agent development)

```bash
./start_visual_builder.sh
```

The Visual Builder will be available at http://localhost:8000/dev-ui

> **Note**:
> - React frontend runs on port 4000
> - FastAPI backend runs on port 8080
> - ADK Visual Builder runs on port 8000
> - PostgreSQL runs on port 5433

### All Services Running

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 4000 | http://localhost:4000 |
| FastAPI Backend | 8080 | http://localhost:8080 |
| API Docs | 8080 | http://localhost:8080/docs |
| Visual Builder | 8000 | http://localhost:8000/dev-ui |
| PostgreSQL | 5433 | localhost:5433 |

### Development Commands

```bash
# Install dependencies
poetry install

# Run API server (port 8080)
poetry run uvicorn src.api.main:app --reload --port 8080

# Run ADK Visual Builder (port 8000)
./start_visual_builder.sh

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

Once the API server is running (port 8080), visit:

- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc
- **OpenAPI JSON**: http://localhost:8080/openapi.json

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

# Run container (API on port 8080)
docker run -p 8080:8080 \
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

### Training Resources
- [Setup Wizard](http://localhost:4000/getting-started) - Interactive setup guide for new users
- [GraymatterLab Ecosystem](./docs/ecosystem.md) - Complete guide to learning-to-production pipeline
- [Workshop Materials](./README_WORKSHOP.md) - Original workshop guide

### Developer Documentation
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
