"""FastAPI application entry point for ADK Platform."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.middleware.rate_limit import RateLimitMiddleware
from src.api.middleware.security_headers import SecurityHeadersMiddleware
from src.api.middleware.tenant import TenantMiddleware
from src.api.routes import (
    admin,
    agents,
    auth,
    exercises,
    guides,
    health,
    library,
    progress,
    tenants,
    users,
    workshops,
)
from src.core.config import get_settings
from src.db.session import close_db, init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="ADK Platform API",
    description="Multi-tenant training platform for Google Agent Developer Kit",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    redirect_slashes=False,  # Prevent CORS issues from trailing slash redirects
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware (outermost - runs first on response)
app.add_middleware(SecurityHeadersMiddleware)

# Rate limiting middleware (should be added before tenant middleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_requests_per_minute)

# Tenant middleware
app.add_middleware(TenantMiddleware)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(tenants.router, prefix="/api/v1/tenants", tags=["tenants"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(workshops.router, prefix="/api/v1/workshops", tags=["workshops"])
app.include_router(exercises.router, prefix="/api/v1/exercises", tags=["exercises"])
app.include_router(progress.router, prefix="/api/v1/progress", tags=["progress"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(library.router, prefix="/api/v1/library", tags=["library"])
app.include_router(guides.router, prefix="/api/v1/guides", tags=["guides"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
