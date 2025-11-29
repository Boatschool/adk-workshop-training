"""Health check endpoints for monitoring and readiness probes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db

router = APIRouter()


@router.get("/")
async def health_check() -> dict[str, str]:
    """
    Basic health check endpoint.

    Returns:
        dict: Health status
    """
    return {
        "status": "healthy",
        "service": "adk-platform-api",
        "version": "1.0.0",
    }


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """
    Readiness probe that checks database connectivity.

    Args:
        db: Database session

    Returns:
        dict: Readiness status

    Raises:
        HTTPException: If database connection fails
    """
    try:
        # Try to execute a simple query
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        return {
            "status": "ready",
            "database": "connected",
            "service": "adk-platform-api",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}",
        ) from None
