"""Agent management API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, get_tenant_id
from src.api.schemas.agent import (
    AgentCreate,
    AgentExecuteRequest,
    AgentExecuteResponse,
    AgentResponse,
    AgentTemplateDetail,
    AgentTemplateInfo,
    AgentUpdate,
)
from src.core.config import get_settings
from src.core.exceptions import NotFoundError
from src.core.tenancy import TenantContext
from src.db.models.user import User
from src.db.session import get_db
from src.services.agent_service import AgentService
from src.agents import AgentRunner, AgentConfig, get_registry

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


@router.get("/templates", response_model=list[AgentTemplateInfo])
async def list_agent_templates(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    List all available agent templates.

    Returns a list of pre-built agent templates that can be used
    to create and run agents.

    Returns:
        list[AgentTemplateInfo]: Available agent templates
    """
    registry = get_registry()
    return registry.list_templates()


@router.get("/templates/{agent_type}", response_model=AgentTemplateDetail)
async def get_agent_template(
    agent_type: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get details about a specific agent template.

    Args:
        agent_type: Agent type identifier (e.g., "faq", "scheduler", "router")

    Returns:
        AgentTemplateDetail: Template details including default configuration

    Raises:
        HTTPException: If template not found
    """
    registry = get_registry()
    template_cls = registry.get_template(agent_type)

    if template_cls is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent template '{agent_type}' not found",
        )

    return AgentTemplateDetail(
        type=template_cls.get_agent_type(),
        name=template_cls.get_display_name(),
        description=template_cls.get_description(),
        category=template_cls.get_category().value,
        default_config=template_cls.get_default_config().to_dict(),
    )


@router.post("/templates/{agent_type}/execute", response_model=AgentExecuteResponse)
async def execute_agent_template(
    agent_type: str,
    request: AgentExecuteRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Execute an agent template directly without creating a saved agent.

    This is useful for testing agent templates or one-off interactions.

    Args:
        agent_type: Agent type identifier
        request: Execution request with message and optional config overrides

    Returns:
        AgentExecuteResponse: Agent's response

    Raises:
        HTTPException: If template not found or execution fails
    """
    settings = get_settings()

    # Verify template exists
    registry = get_registry()
    if registry.get_template(agent_type) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent template '{agent_type}' not found",
        )

    # Create runner and execute
    runner = AgentRunner(
        tenant_id=tenant_id,
        api_key=settings.google_api_key,
        user_id=str(current_user.id),
    )

    # Build config from override if provided
    config = None
    if request.config_override:
        config = AgentConfig(**request.config_override)

    response = await runner.execute(
        agent_type=agent_type,
        user_message=request.message,
        config=config,
    )

    return AgentExecuteResponse(
        success=response.success,
        message=response.message,
        data=response.data,
        error=response.error,
        execution_time_ms=response.execution_time_ms,
        model_used=response.model_used,
        tokens_used=response.tokens_used,
    )


@router.post("/{agent_id}/execute", response_model=AgentExecuteResponse)
async def execute_saved_agent(
    agent_id: str,
    request: AgentExecuteRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[str, Depends(get_tenant_id)],
):
    """
    Execute a saved agent.

    Runs the agent with its stored configuration.

    Args:
        agent_id: Agent UUID
        request: Execution request with message

    Returns:
        AgentExecuteResponse: Agent's response

    Raises:
        HTTPException: If agent not found or execution fails
    """
    TenantContext.set(tenant_id)
    settings = get_settings()

    # Get saved agent
    service = AgentService(db, tenant_id)
    agent = await service.get_agent_by_id(agent_id)

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' not found",
        )

    # Verify template exists
    registry = get_registry()
    if registry.get_template(agent.agent_type) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Agent type '{agent.agent_type}' is not a valid template",
        )

    # Create runner and execute
    runner = AgentRunner(
        tenant_id=tenant_id,
        api_key=settings.google_api_key,
        user_id=str(current_user.id),
    )

    # Build config from saved agent
    config = AgentConfig(
        name=agent.name,
        **agent.config,
    )

    # Apply request overrides if any
    if request.config_override:
        for key, value in request.config_override.items():
            if hasattr(config, key):
                setattr(config, key, value)
            else:
                config.settings[key] = value

    response = await runner.execute(
        agent_type=agent.agent_type,
        user_message=request.message,
        config=config,
    )

    # Update last_run_at timestamp
    from src.api.schemas.agent import AgentUpdate
    from datetime import datetime

    await service.update_agent(
        agent_id,
        AgentUpdate(status=agent.status),  # This triggers updated_at
    )

    return AgentExecuteResponse(
        success=response.success,
        message=response.message,
        data=response.data,
        error=response.error,
        execution_time_ms=response.execution_time_ms,
        model_used=response.model_used,
        tokens_used=response.tokens_used,
    )
