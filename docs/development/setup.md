# ADK Platform - Development Setup Guide

This guide walks you through setting up a local development environment for the ADK Platform.

## Prerequisites

### Required Software

| Software | Minimum Version | Check Command |
|----------|-----------------|---------------|
| Python | 3.11+ | `python3 --version` |
| Poetry | 1.7+ | `poetry --version` |
| Docker | 24+ | `docker --version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |

### Install Prerequisites

**macOS (Homebrew):**
```bash
# Python 3.11
brew install python@3.11

# Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Docker Desktop
brew install --cask docker

# Node.js
brew install node@20
```

**Ubuntu/Debian:**
```bash
# Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.11 python3.11-venv

# Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Docker
curl -fsSL https://get.docker.com | sh

# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

## Quick Setup

Run the automated setup script:

```bash
./scripts/dev/setup-local.sh
```

This will:
1. Check all prerequisites
2. Create `.env` from `.env.example`
3. Install Python dependencies
4. Set up pre-commit hooks
5. Start PostgreSQL in Docker
6. Run database migrations
7. Install frontend dependencies

## Manual Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd adk-workshop-training
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
vim .env
```

Required environment variables:
```bash
# Database (default works with docker-compose)
DATABASE_URL=postgresql+asyncpg://adk_user:adk_password@localhost:5433/adk_platform

# Security
SECRET_KEY=your-256-bit-secret-key-here

# Google ADK (get from Google AI Studio)
GOOGLE_API_KEY=your-google-api-key
```

### 3. Python Dependencies

```bash
# Install all dependencies
poetry install

# Activate virtual environment
poetry shell

# Or run commands with poetry run prefix
poetry run pytest
```

### 4. Pre-commit Hooks

```bash
# Install hooks
poetry run pre-commit install

# Run on all files (optional, first time)
poetry run pre-commit run --all-files
```

### 5. Database Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Verify it's running
docker-compose ps

# Run migrations
poetry run alembic upgrade head

# (Optional) Seed development data
poetry run python scripts/dev/seed-data.py
```

### 6. Frontend Dependencies

```bash
cd frontend
npm ci
cd ..
```

## Running the Application

### Start All Services

Open three terminal windows/tabs:

**Terminal 1 - Backend API:**
```bash
poetry run uvicorn src.api.main:app --reload --port 8080
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ADK Visual Builder (optional):**
```bash
./start_visual_builder.sh
```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8080 | FastAPI application |
| API Docs | http://localhost:8080/docs | Swagger UI |
| Frontend | http://localhost:4000 | React application |
| Visual Builder | http://localhost:8000/dev-ui | Google ADK Visual Builder |

## Development Workflow

### Running Tests

```bash
# All backend tests
poetry run pytest

# Unit tests only (no database needed)
poetry run pytest tests/ -m "not integration"

# With coverage report
poetry run pytest --cov=src --cov-report=html

# Frontend tests
cd frontend && npm run test

# E2E tests
cd frontend && npm run test:e2e
```

### Code Quality

```bash
# Linting
poetry run ruff check src/ tests/

# Formatting
poetry run black src/ tests/

# Type checking
poetry run mypy src/

# All checks at once (via pre-commit)
poetry run pre-commit run --all-files
```

### Database Migrations

```bash
# Create new migration
poetry run alembic revision --autogenerate -m "Add new field"

# Apply migrations
poetry run alembic upgrade head

# Rollback one step
poetry run alembic downgrade -1

# View migration history
poetry run alembic history
```

## Common Tasks

### Reset Database

```bash
# Stop and remove container
docker-compose down -v

# Start fresh
docker-compose up -d postgres

# Wait for startup
sleep 5

# Run migrations
poetry run alembic upgrade head

# Seed data
poetry run python scripts/dev/seed-data.py
```

### Update Dependencies

```bash
# Update Python dependencies
poetry update

# Update frontend dependencies
cd frontend && npm update
```

### Connect to Database

```bash
# Via Docker
docker-compose exec postgres psql -U adk_user -d adk_platform

# Or using psql directly
PGPASSWORD=adk_password psql -h localhost -p 5433 -U adk_user -d adk_platform
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Restart Docker Desktop (macOS)
osascript -e 'quit app "Docker"'
open -a Docker

# Or remove all containers and start fresh
docker-compose down -v
docker system prune -f
```

### Database Connection Errors

1. Check PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check database URL in `.env`:
   ```bash
   grep DATABASE_URL .env
   ```

3. Verify port 5433 is available:
   ```bash
   lsof -i :5433
   ```

### Import Errors

```bash
# Ensure you're in the virtual environment
poetry shell

# Or use poetry run
poetry run python -c "from src.api.main import app"
```

### Pre-commit Failures

```bash
# Format code first
poetry run black src/ tests/

# Then run pre-commit
poetry run pre-commit run --all-files
```

## IDE Setup

### VS Code

Recommended extensions:
- Python (Microsoft)
- Pylance
- Black Formatter
- Ruff
- Docker
- GitLens

Settings (`.vscode/settings.json`):
```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

### PyCharm

1. Set interpreter to Poetry environment
2. Enable Black as formatter
3. Configure Ruff as linter
4. Set pytest as test runner

## Getting Help

- Check existing issues on GitHub
- Review the [API documentation](../api/README.md)
- Consult the [deployment runbook](../deployment/runbook.md)
