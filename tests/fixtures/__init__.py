"""Test fixtures for ADK Platform."""

from typing import Any
from uuid import uuid4


def create_test_tenant_data(
    slug: str = "test_tenant",
    name: str = "Test Tenant",
    subscription_tier: str = "trial",
) -> dict[str, Any]:
    """Create test tenant data."""
    return {
        "slug": slug,
        "name": name,
        "subscription_tier": subscription_tier,
    }


def create_test_user_data(
    email: str = "test@example.com",
    password: str = "SecureP@ss123!",
    full_name: str = "Test User",
    role: str = "participant",
) -> dict[str, Any]:
    """Create test user data."""
    return {
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role,
    }


def create_test_workshop_data(
    title: str = "Test Workshop",
    description: str = "A test workshop",
) -> dict[str, Any]:
    """Create test workshop data."""
    return {
        "title": title,
        "description": description,
    }


def create_test_exercise_data(
    workshop_id: str | None = None,
    title: str = "Test Exercise",
    content_type: str = "markdown",
    order_index: int = 0,
) -> dict[str, Any]:
    """Create test exercise data."""
    return {
        "workshop_id": workshop_id or str(uuid4()),
        "title": title,
        "content_type": content_type,
        "order_index": order_index,
    }


def create_test_agent_data(
    name: str = "Test Agent",
    agent_type: str = "faq",
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create test agent data."""
    return {
        "name": name,
        "agent_type": agent_type,
        "config": config or {"model": "gemini-1.5-flash"},
    }
