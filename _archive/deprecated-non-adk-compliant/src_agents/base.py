"""Base agent template class for ADK Platform agents."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any


class AgentCategory(str, Enum):
    """Categories for organizing agent templates."""

    FAQ = "faq"
    SCHEDULING = "scheduling"
    ROUTING = "routing"
    CUSTOM = "custom"


@dataclass
class AgentConfig:
    """Configuration for an agent instance.

    Attributes:
        name: Display name for the agent
        model: LLM model to use (e.g., "gemini-2.5-flash")
        instruction: System instruction/prompt for the agent
        description: Human-readable description
        knowledge_base: Optional knowledge content for the agent
        settings: Additional configuration settings
    """

    name: str
    model: str = "gemini-2.5-flash"
    instruction: str = ""
    description: str = ""
    knowledge_base: str | None = None
    settings: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "name": self.name,
            "model": self.model,
            "instruction": self.instruction,
            "description": self.description,
            "knowledge_base": self.knowledge_base,
            "settings": self.settings,
        }


@dataclass
class AgentResponse:
    """Response from agent execution.

    Attributes:
        success: Whether execution succeeded
        message: Response message from the agent
        data: Additional structured data
        error: Error message if failed
        execution_time_ms: Execution time in milliseconds
        model_used: The model that processed the request
        tokens_used: Approximate token count
    """

    success: bool
    message: str
    data: dict[str, Any] | None = None
    error: str | None = None
    execution_time_ms: int | None = None
    model_used: str | None = None
    tokens_used: int | None = None
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict[str, Any]:
        """Convert response to dictionary."""
        return {
            "success": self.success,
            "message": self.message,
            "data": self.data,
            "error": self.error,
            "execution_time_ms": self.execution_time_ms,
            "model_used": self.model_used,
            "tokens_used": self.tokens_used,
            "timestamp": self.timestamp.isoformat(),
        }


class BaseAgentTemplate(ABC):
    """Abstract base class for agent templates.

    All agent templates must inherit from this class and implement:
    - get_agent_type(): Returns unique type identifier
    - get_category(): Returns agent category
    - get_default_config(): Returns default AgentConfig
    - create_agent(): Creates the Google ADK Agent instance

    Example:
        class FAQAgentTemplate(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "faq"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.FAQ

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(
                    name="FAQ Assistant",
                    description="Answers common questions"
                )

            def create_agent(self):
                from google.adk.agents import Agent
                return Agent(name=self.config.name, ...)
    """

    def __init__(self, config: AgentConfig | None = None, api_key: str | None = None):
        """Initialize agent template.

        Args:
            config: Agent configuration (uses default if not provided)
            api_key: Google API key for ADK
        """
        self.config = config or self.get_default_config()
        self.api_key = api_key
        self._agent = None

    @classmethod
    @abstractmethod
    def get_agent_type(cls) -> str:
        """Return unique type identifier for this agent template.

        Example: "faq", "scheduler", "router"
        """
        ...

    @classmethod
    @abstractmethod
    def get_category(cls) -> AgentCategory:
        """Return category for this agent template."""
        ...

    @classmethod
    @abstractmethod
    def get_default_config(cls) -> AgentConfig:
        """Return default configuration for this agent type."""
        ...

    @classmethod
    def get_display_name(cls) -> str:
        """Return human-readable display name."""
        return cls.get_default_config().name

    @classmethod
    def get_description(cls) -> str:
        """Return agent description."""
        return cls.get_default_config().description

    @abstractmethod
    def create_agent(self) -> Any:
        """Create and return the Google ADK Agent instance.

        Returns:
            Agent: Configured google.adk.agents.Agent instance
        """
        ...

    @property
    def agent(self) -> Any:
        """Lazy-load and return the agent instance."""
        if self._agent is None:
            self._agent = self.create_agent()
        return self._agent

    def get_tools(self) -> list[Any]:
        """Return list of tools available to this agent.

        Override in subclasses to provide custom tools.
        """
        return []

    def get_sub_agents(self) -> list["BaseAgentTemplate"]:
        """Return list of sub-agents for multi-agent templates.

        Override in subclasses for multi-agent orchestration.
        """
        return []

    def validate_config(self) -> list[str]:
        """Validate agent configuration.

        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []

        if not self.config.name:
            errors.append("Agent name is required")

        if not self.config.model:
            errors.append("Model is required")

        return errors
