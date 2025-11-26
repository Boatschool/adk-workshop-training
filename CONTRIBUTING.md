# Contributing

Thank you for helping improve the ADK Platform. This guide covers the day‑to‑day workflow. For code style, structure, and commands, see `AGENTS.md`.

## Getting Started
- Prereqs: Python 3.11+, Poetry, Docker.
- Setup: `poetry install` • `cp .env.example .env` • `docker-compose up -d postgres` • `poetry run alembic upgrade head` • `poetry run uvicorn src.api.main:app --reload`.
- Read: `AGENTS.md` for structure, testing, and tooling.

## Branching
- Pattern: `feature/<short-desc>`, `fix/<short-desc>`, `docs/<short-desc>`, `chore/<short-desc>`.
- Prefer linking issues: `feature/123-add-tenant-middleware`.
- Keep branches small and focused.

## Issues
- Include: summary, context, reproduction or acceptance criteria, screenshots/logs if applicable.
- Label appropriately (bug, feat, docs, chore). Small fixes can go straight to PR with clear description.

## Commits
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Examples:
  - `feat: add tenant-aware workshop routes`
  - `fix: correct Alembic env config for async`

## Pull Requests
- Use the PR template. PRs must:
  - Pass checks: `ruff`, `black --check`, `mypy`, `pytest`.
  - Include tests and docs updates when relevant.
  - Include Alembic migration when DB schema changes.
  - Link issues (e.g., `Closes #123`).
- Request at least one reviewer; add screenshots for UI changes.

## Quality Gates
- Install hooks: `poetry run pre-commit install`.
- Run locally before pushing:
  - `poetry run ruff check . && poetry run black --check . && poetry run mypy src/`
  - `poetry run pytest --cov=src --cov-report=term-missing`

## Security
- Do not commit secrets. Use `.env` locally and CI/runner secrets in pipelines.

See `AGENTS.md` for detailed repository guidelines.
