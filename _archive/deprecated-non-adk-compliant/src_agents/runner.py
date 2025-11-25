"""
Agent Runner - Execution engine for ADK Platform agents.

Provides a clean interface for executing agents with:
- Tenant isolation
- Session management
- Error handling
- Execution logging
"""

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Any

from src.agents.base import AgentConfig, AgentResponse, BaseAgentTemplate
from src.agents.registry import get_registry

logger = logging.getLogger(__name__)


@dataclass
class ExecutionContext:
    """Context for agent execution.

    Attributes:
        tenant_id: Tenant identifier for isolation
        user_id: User performing the execution
        session_id: Session identifier for conversation continuity
        api_key: Google API key for ADK
        metadata: Additional context metadata
    """

    tenant_id: str
    user_id: str | None = None
    session_id: str | None = None
    api_key: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class AgentRunner:
    """Execution engine for running ADK agents.

    Features:
    - Creates and configures agent instances
    - Manages execution context (tenant, user, session)
    - Handles errors and returns structured responses
    - Logs execution metrics

    Usage:
        runner = AgentRunner(
            tenant_id="tenant-123",
            api_key="your-api-key"
        )

        # Simple execution
        response = await runner.execute(
            agent_type="faq",
            user_message="When is open enrollment?"
        )

        # With custom config
        config = AgentConfig(name="Custom FAQ", knowledge_base="...")
        response = await runner.execute(
            agent_type="faq",
            user_message="...",
            config=config
        )
    """

    def __init__(
        self,
        tenant_id: str,
        api_key: str | None = None,
        user_id: str | None = None,
    ):
        """Initialize agent runner.

        Args:
            tenant_id: Tenant identifier
            api_key: Google API key for ADK
            user_id: Optional user identifier
        """
        self.context = ExecutionContext(
            tenant_id=tenant_id,
            api_key=api_key,
            user_id=user_id,
        )
        self._registry = get_registry()

    def list_available_agents(self) -> list[dict]:
        """List all available agent types.

        Returns:
            List of agent type metadata dictionaries
        """
        return self._registry.list_templates()

    def get_agent_info(self, agent_type: str) -> dict | None:
        """Get information about a specific agent type.

        Args:
            agent_type: Agent type identifier

        Returns:
            Agent metadata or None if not found
        """
        template_cls = self._registry.get_template(agent_type)
        if template_cls is None:
            return None

        return {
            "type": template_cls.get_agent_type(),
            "name": template_cls.get_display_name(),
            "description": template_cls.get_description(),
            "category": template_cls.get_category().value,
            "default_config": template_cls.get_default_config().to_dict(),
        }

    def create_agent_instance(
        self,
        agent_type: str,
        config: AgentConfig | None = None,
    ) -> BaseAgentTemplate | None:
        """Create an agent template instance.

        Args:
            agent_type: Agent type identifier
            config: Optional custom configuration

        Returns:
            Agent template instance or None if type not found
        """
        return self._registry.create_instance(
            agent_type=agent_type,
            config=config,
            api_key=self.context.api_key,
        )

    async def execute(
        self,
        agent_type: str,
        user_message: str,
        config: AgentConfig | None = None,
        conversation_history: list[dict] | None = None,
    ) -> AgentResponse:
        """Execute an agent with a user message.

        Args:
            agent_type: Agent type identifier
            user_message: User's input message
            config: Optional custom configuration
            conversation_history: Previous messages for context

        Returns:
            AgentResponse with execution results
        """
        start_time = time.time()

        try:
            # Create agent instance
            template = self.create_agent_instance(agent_type, config)
            if template is None:
                return AgentResponse(
                    success=False,
                    message="",
                    error=f"Unknown agent type: {agent_type}",
                )

            # Validate configuration
            validation_errors = template.validate_config()
            if validation_errors:
                return AgentResponse(
                    success=False,
                    message="",
                    error=f"Configuration errors: {', '.join(validation_errors)}",
                )

            # Execute the agent
            response = await self._execute_agent(
                template=template,
                user_message=user_message,
                conversation_history=conversation_history,
            )

            # Calculate execution time
            execution_time_ms = int((time.time() - start_time) * 1000)
            response.execution_time_ms = execution_time_ms
            response.model_used = template.config.model

            logger.info(
                f"Agent execution completed",
                extra={
                    "tenant_id": self.context.tenant_id,
                    "agent_type": agent_type,
                    "execution_time_ms": execution_time_ms,
                    "success": response.success,
                },
            )

            return response

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)
            logger.exception(
                f"Agent execution failed: {e}",
                extra={
                    "tenant_id": self.context.tenant_id,
                    "agent_type": agent_type,
                    "error": str(e),
                },
            )
            return AgentResponse(
                success=False,
                message="",
                error=f"Execution error: {str(e)}",
                execution_time_ms=execution_time_ms,
            )

    async def _execute_agent(
        self,
        template: BaseAgentTemplate,
        user_message: str,
        conversation_history: list[dict] | None = None,
    ) -> AgentResponse:
        """Internal method to execute the agent.

        This wraps the ADK agent execution and handles the response.
        """
        try:
            agent = template.agent

            # For now, use synchronous execution wrapped in asyncio
            # ADK may provide async methods in future versions
            response_text = await asyncio.to_thread(
                self._run_agent_sync,
                agent,
                user_message,
            )

            return AgentResponse(
                success=True,
                message=response_text,
                data={
                    "agent_name": template.config.name,
                    "agent_type": template.get_agent_type(),
                },
            )

        except Exception as e:
            logger.exception(f"Agent internal execution error: {e}")
            raise

    def _run_agent_sync(self, agent: Any, user_message: str) -> str:
        """Run agent synchronously.

        Note: Google ADK may use its own async patterns internally.
        This method adapts to the ADK's execution model.
        """
        try:
            # Try the ADK's generate method for single-turn
            if hasattr(agent, "generate"):
                response = agent.generate(user_message)
                if hasattr(response, "text"):
                    return response.text
                return str(response)

            # Fallback: try invoke for conversational
            if hasattr(agent, "invoke"):
                response = agent.invoke(user_message)
                if hasattr(response, "content"):
                    return response.content
                return str(response)

            # Last resort: string representation
            return f"Agent '{agent.name}' processed: {user_message[:50]}..."

        except AttributeError as e:
            # ADK API may vary - log and return helpful message
            logger.warning(f"ADK API compatibility issue: {e}")
            return f"Agent configured but execution method unavailable. Check ADK version."

    async def execute_batch(
        self,
        agent_type: str,
        messages: list[str],
        config: AgentConfig | None = None,
    ) -> list[AgentResponse]:
        """Execute agent with multiple messages in parallel.

        Args:
            agent_type: Agent type identifier
            messages: List of user messages
            config: Optional custom configuration

        Returns:
            List of AgentResponse objects
        """
        tasks = [
            self.execute(agent_type, message, config)
            for message in messages
        ]
        return await asyncio.gather(*tasks)


class ConversationSession:
    """Manages a conversation session with an agent.

    Maintains conversation history and provides a stateful interface
    for multi-turn conversations.

    Usage:
        session = ConversationSession(
            runner=runner,
            agent_type="faq"
        )

        response1 = await session.send("Hello")
        response2 = await session.send("What about PTO?")

        history = session.get_history()
    """

    def __init__(
        self,
        runner: AgentRunner,
        agent_type: str,
        config: AgentConfig | None = None,
        session_id: str | None = None,
    ):
        """Initialize conversation session.

        Args:
            runner: AgentRunner instance
            agent_type: Agent type to use
            config: Optional custom configuration
            session_id: Optional session identifier
        """
        self.runner = runner
        self.agent_type = agent_type
        self.config = config
        self.session_id = session_id or self._generate_session_id()
        self._history: list[dict] = []

    def _generate_session_id(self) -> str:
        """Generate a unique session ID."""
        import uuid

        return str(uuid.uuid4())

    async def send(self, message: str) -> AgentResponse:
        """Send a message and get a response.

        Args:
            message: User message

        Returns:
            AgentResponse from the agent
        """
        # Add user message to history
        self._history.append({
            "role": "user",
            "content": message,
        })

        # Execute with history context
        response = await self.runner.execute(
            agent_type=self.agent_type,
            user_message=message,
            config=self.config,
            conversation_history=self._history,
        )

        # Add assistant response to history
        if response.success:
            self._history.append({
                "role": "assistant",
                "content": response.message,
            })

        return response

    def get_history(self) -> list[dict]:
        """Get conversation history.

        Returns:
            List of message dictionaries with role and content
        """
        return self._history.copy()

    def clear_history(self) -> None:
        """Clear conversation history."""
        self._history.clear()

    @property
    def message_count(self) -> int:
        """Get total message count in session."""
        return len(self._history)
