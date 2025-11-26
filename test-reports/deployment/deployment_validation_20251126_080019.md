# Deployment Validation Report

**Date:** Wed Nov 26 08:00:19 MST 2025
**Environment:** local

## Summary

- **Passed:** 28
- **Failed:** 2
- **Warnings:** 7

## Passed Checks

- ✅ File exists: pyproject.toml
- ✅ File exists: poetry.lock
- ✅ File exists: alembic.ini
- ✅ File exists: docker-compose.yml
- ✅ File exists: .env.example
- ✅ File exists: src/api/main.py
- ✅ File exists: frontend/package.json
- ✅ Dockerfile exists
- ✅ Dockerfile has FROM instruction
- ✅ Dockerfile uses multi-stage build
- ✅ docker-compose.yml exists
- ✅ PostgreSQL service defined
- ✅ alembic.ini exists
- ✅ Found        4 migration files
- ✅ Readiness endpoint defined
- ✅ Required var in .env.example: SECRET_KEY
- ✅ Required var in .env.example: DATABASE_URL
- ✅ Required var in .env.example: GOOGLE_API_KEY
- ✅ Found       17 test files
- ✅ Unit tests pass
- ✅ Frontend package.json exists
- ✅ node_modules exists
- ✅ Frontend builds successfully
- ✅ Frontend dist directory created
- ✅ Pre-commit config exists
- ✅ README.md exists
- ✅ API docs directory exists
- ✅ CLAUDE.md exists

## Failed Checks

- ❌ Health route not found
- ❌ Potential hardcoded API key found

## Warnings

- ⚠️ Alembic check failed (may need database)
- ⚠️ Health endpoint not responding (server may not be running)
- ⚠️ Ruff linting has issues
- ⚠️ Black formatting has issues
- ⚠️ MyPy has issues
- ⚠️ No .github/workflows directory
- ⚠️ No Terraform directory (may be using different IaC)

## Recommendations

**Critical:** Address all failed checks before deployment.
