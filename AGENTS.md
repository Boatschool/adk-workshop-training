# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (FastAPI app in `src/api`, domain logic in `src/core`, data layer in `src/db`, services in `src/services`).
- API: routes in `src/api/routes/`, schemas in `src/api/schemas/`, middleware in `src/api/middleware/`, entrypoint `src/api/main.py`.
- Database: SQLAlchemy models in `src/db/models/`; Alembic migrations in `src/db/migrations/`.
- Web assets: templates in `templates/`, static files in `static/`, styles in `styles/`.
- Tests: `tests/{unit,integration,fixtures}/`.
- Training portal utilities: `training_portal.py`, `start_portal.sh` (local workshop UI).

## Build, Test, and Development Commands
- Install: `poetry install`
- Run API (dev): `poetry run uvicorn src.api.main:app --reload --port 8000`
- Database (local): `docker-compose up -d postgres` then `poetry run alembic upgrade head`
- Tests: `poetry run pytest` (coverage: `--cov=src --cov-report=html`)
- Lint/Format: `poetry run ruff check .` and `poetry run black .`
- Type check: `poetry run mypy src/`
- Training portal (optional UI): `./start_portal.sh` (serves on `http://localhost:5000`).

## Pre-Commit Hooks
- Install hooks: `poetry run pre-commit install`
- Run on all files: `poetry run pre-commit run --all-files`
- CI mirrors hooks; ensure local pass before pushing.

## Coding Style & Naming Conventions
- Python 3.11; Black line length 100; Ruff + isort rules per `pyproject.toml`.
- Naming: modules/files `snake_case.py`; functions/vars `snake_case`; classes `PascalCase`; constants `UPPER_SNAKE`.
- Pydantic schema modules in `src/api/schemas/` named by resource (e.g., `user.py`).

## Testing Guidelines
- Framework: pytest with `asyncio_mode=auto`.
- Layout: place unit tests in `tests/unit/` and integration in `tests/integration/`.
- Naming: files `test_*.py`, functions `test_*`, classes `Test*`.
- Run: `poetry run pytest -q`; generate coverage HTML: `poetry run pytest --cov=src --cov-report=html`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, etc. (see history: e.g., `feat:`, `fix:`).
- Scope small, focused PRs. Include: clear description, linked issue, test coverage, and screenshots for UI changes.
- Keep migrations isolated: one logical change per Alembic revision; run `poetry run alembic upgrade head` locally before opening PR.

## Security & Configuration Tips
- Copy env: `cp .env.example .env`; set `SECRET_KEY`, `GOOGLE_API_KEY`, and `DATABASE_URL`.
- Never commit secrets or `.env`; prefer Docker/CI secrets for deployment.
- Default Postgres is exposed on `localhost:5433`; change credentials for non-local use.
