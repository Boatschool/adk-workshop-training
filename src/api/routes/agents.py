"""Agent management API routes.

Note: Template-based agent execution endpoints have been disabled.
The custom src/agents framework was not compliant with Google ADK v1.18.0
and has been archived. Use the Visual Builder at /dev-ui for agent creation
and testing, or integrate with ADK directly using InMemoryRunner.

See: _archive/deprecated-non-adk-compliant/ for the original implementation.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_id
from src.api.schemas.agent import (
    AgentCreate,
    # AgentExecuteRequest,  # Disabled - requires ADK-compliant runner
    # AgentExecuteResponse,  # Disabled - requires ADK-compliant runner
    AgentResponse,
    # AgentTemplateDetail,  # Disabled - requires ADK-compliant registry
    # AgentTemplateInfo,  # Disabled - requires ADK-compliant registry
    AgentUpdate,
)
from src.core.exceptions import NotFoundError
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.db.session import get_db
from src.services.agent_service import AgentService

# NOTE: The following imports were from a non-ADK-compliant custom framework
# that has been archived. These endpoints are disabled until a proper
# ADK v1.18.0 compliant runner is implemented.
# from src.agents import AgentRunner, AgentConfig, get_registry

router = APIRouter()


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Create a new agent.

    Any authenticated user can create agents.

    Args:
        agent_data: Agent creation data
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        AgentResponse: Created agent
    """
    TenantContext.set(tenant_id)
    service = AgentService(db, tenant_id)
    agent = await service.create_agent(agent_data, str(current_user.id))
    return agent


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Get agent by ID.

    Args:
        agent_id: Agent UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        AgentResponse: Agent data

    Raises:
        HTTPException: If agent not found
    """
    TenantContext.set(tenant_id)
    service = AgentService(db, tenant_id)
    agent = await service.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' not found",
        )
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Update an existing agent.

    Users can update their own agents. Admins can update any agent.

    Args:
        agent_id: Agent UUID
        agent_data: Agent update data
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Returns:
        AgentResponse: Updated agent

    Raises:
        HTTPException: If agent not found or no permission
    """
    TenantContext.set(tenant_id)
    service = AgentService(db, tenant_id)

    # Check if agent exists
    agent = await service.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' not found",
        )

    # Check ownership (users can only update their own agents unless admin)
    if str(agent.user_id) != str(current_user.id) and current_user.role not in [
        "tenant_admin",
        "super_admin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own agents",
        )

    try:
        updated_agent = await service.update_agent(agent_id, agent_data)
        return updated_agent
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Delete an agent.

    Users can delete their own agents. Admins can delete any agent.

    Args:
        agent_id: Agent UUID
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header

    Raises:
        HTTPException: If agent not found or no permission
    """
    TenantContext.set(tenant_id)
    service = AgentService(db, tenant_id)

    # Check if agent exists
    agent = await service.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' not found",
        )

    # Check ownership (users can only delete their own agents unless admin)
    if str(agent.user_id) != str(current_user.id) and current_user.role not in [
        "tenant_admin",
        "super_admin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own agents",
        )

    try:
        await service.delete_agent(agent_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/", response_model=list[AgentResponse])
async def list_agents(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    user_id: Annotated[str | None, Query(description="Filter by user ID")] = None,
    agent_type: Annotated[str | None, Query(description="Filter by agent type")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
):
    """
    List agents with pagination and optional filtering.

    Regular users only see their own agents. Admins see all agents.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        user_id: Filter by user ID
        agent_type: Filter by agent type
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[AgentResponse]: List of agents
    """
    TenantContext.set(tenant_id)
    service = AgentService(db, tenant_id)

    # Non-admins can only see their own agents
    if current_user.role not in ["instructor", "tenant_admin", "super_admin"]:
        user_id = str(current_user.id)

    agents = await service.list_agents(
        skip=skip, limit=limit, user_id=user_id, agent_type=agent_type
    )
    return agents


@router.get("/me", response_model=list[AgentResponse])
async def get_my_agents(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
):
    """
    Get current user's agents.

    Args:
        db: Database session
        current_user: Current authenticated user
        tenant_id: Tenant ID from header
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        list[AgentResponse]: List of agents
    """
    TenantContext.set(tenant_id)
    service = AgentService(db, tenant_id)
    agents = await service.list_agents_by_user(
        str(current_user.id), skip=skip, limit=limit
    )
    return agents


# ============================================================================
# Agent Templates & Execution Endpoints
# ============================================================================
# NOTE: These endpoints have been disabled because they relied on a custom
# agent framework (src/agents) that was not compliant with Google ADK v1.18.0.
#
# The framework used incorrect APIs like agent.run(), agent.generate(), and
# agent.invoke() which don't exist in ADK. It also used the wrong parameter
# name 'agents' instead of 'sub_agents' for multi-agent systems.
#
# For agent execution, use:
# 1. Visual Builder at http://localhost:8000/dev-ui (recommended)
# 2. Direct ADK integration with InMemoryRunner
#
# See: _archive/deprecated-non-adk-compliant/ for the original code
# See: agents/ directory for ADK v1.18.0 compliant YAML agents
# ============================================================================

# @router.get("/templates", response_model=list[AgentTemplateInfo])
# async def list_agent_templates(...): ...
#
# @router.get("/templates/{agent_type}", response_model=AgentTemplateDetail)
# async def get_agent_template(...): ...
#
# @router.post("/templates/{agent_type}/execute", response_model=AgentExecuteResponse)
# async def execute_agent_template(...): ...
#
# @router.post("/{agent_id}/execute", response_model=AgentExecuteResponse)
# async def execute_saved_agent(...): ...
