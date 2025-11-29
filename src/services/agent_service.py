"""Agent service for managing AI agent operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.agent import AgentCreate, AgentUpdate
from src.core.exceptions import NotFoundError
from src.db.models.agent import Agent


class AgentService:
    """Service for agent management operations."""

    def __init__(self, db: AsyncSession, tenant_id: str):
        """
        Initialize agent service.

        Args:
            db: Database session
            tenant_id: Tenant ID for scoping operations
        """
        self.db = db
        self.tenant_id = tenant_id

    async def create_agent(self, agent_data: AgentCreate, user_id: str) -> Agent:
        """
        Create a new agent.

        Args:
            agent_data: Agent creation data
            user_id: UUID of the user creating the agent

        Returns:
            Agent: Created agent
        """
        agent = Agent(
            user_id=user_id,
            name=agent_data.name,
            agent_type=agent_data.agent_type,
            config=agent_data.config,
        )

        self.db.add(agent)
        await self.db.commit()
        await self.db.refresh(agent)

        return agent

    async def get_agent_by_id(self, agent_id: str) -> Agent | None:
        """
        Get agent by ID.

        Args:
            agent_id: Agent UUID

        Returns:
            Agent or None if not found
        """
        result = await self.db.execute(select(Agent).where(Agent.id == agent_id))
        return result.scalar_one_or_none()

    async def update_agent(self, agent_id: str, agent_data: AgentUpdate) -> Agent:
        """
        Update an existing agent.

        Args:
            agent_id: Agent UUID
            agent_data: Agent update data

        Returns:
            Agent: Updated agent

        Raises:
            NotFoundError: If agent not found
        """
        agent = await self.get_agent_by_id(agent_id)
        if not agent:
            raise NotFoundError(f"Agent with ID '{agent_id}' not found")

        update_data = agent_data.model_dump(exclude_unset=True)

        # Handle status enum conversion
        if "status" in update_data and update_data["status"]:
            update_data["status"] = update_data["status"].value

        for field, value in update_data.items():
            if hasattr(agent, field):
                setattr(agent, field, value)

        await self.db.commit()
        await self.db.refresh(agent)

        return agent

    async def list_agents(
        self,
        skip: int = 0,
        limit: int = 100,
        user_id: str | None = None,
        agent_type: str | None = None,
    ) -> list[Agent]:
        """
        List agents with pagination and optional filtering.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Filter by user ID
            agent_type: Filter by agent type

        Returns:
            list[Agent]: List of agents
        """
        query = select(Agent).order_by(Agent.created_at.desc())

        if user_id:
            query = query.where(Agent.user_id == user_id)

        if agent_type:
            query = query.where(Agent.agent_type == agent_type)

        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def list_agents_by_user(
        self, user_id: str, skip: int = 0, limit: int = 100
    ) -> list[Agent]:
        """
        List agents for a specific user.

        Args:
            user_id: User UUID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            list[Agent]: List of agents
        """
        return await self.list_agents(skip=skip, limit=limit, user_id=user_id)

    async def delete_agent(self, agent_id: str) -> None:
        """
        Delete an agent.

        Args:
            agent_id: Agent UUID

        Raises:
            NotFoundError: If agent not found
        """
        agent = await self.get_agent_by_id(agent_id)
        if not agent:
            raise NotFoundError(f"Agent with ID '{agent_id}' not found")

        await self.db.delete(agent)
        await self.db.commit()
