"""Agent registry for discovering and managing agent templates."""

from typing import Type
import logging

from src.agents.base import BaseAgentTemplate, AgentCategory, AgentConfig

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Registry for agent template types.

    Provides discovery and instantiation of registered agent templates.
    Uses singleton pattern to ensure consistent registry across application.

    Usage:
        registry = AgentRegistry()

        # List available types
        types = registry.list_agent_types()

        # Get template class
        template_cls = registry.get_template("faq")

        # Create instance with custom config
        template = registry.create_instance("faq", config=my_config)
    """

    _instance: "AgentRegistry | None" = None
    _templates: dict[str, Type[BaseAgentTemplate]] = {}

    def __new__(cls) -> "AgentRegistry":
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        """Initialize registry and auto-discover templates."""
        if getattr(self, "_initialized", False):
            return

        self._initialized = True
        self._discover_templates()

    def _discover_templates(self) -> None:
        """Auto-discover and register agent templates."""
        # Import templates module to trigger registration
        try:
            from src.agents import templates  # noqa: F401

            logger.info(f"Discovered {len(self._templates)} agent templates")
        except ImportError as e:
            logger.warning(f"Failed to discover agent templates: {e}")

    @classmethod
    def register(cls, template_cls: Type[BaseAgentTemplate]) -> Type[BaseAgentTemplate]:
        """Register an agent template class.

        Can be used as decorator:
            @AgentRegistry.register
            class MyAgentTemplate(BaseAgentTemplate):
                ...

        Args:
            template_cls: Agent template class to register

        Returns:
            The registered class (for decorator usage)
        """
        agent_type = template_cls.get_agent_type()

        if agent_type in cls._templates:
            logger.warning(
                f"Overwriting existing template registration for '{agent_type}'"
            )

        cls._templates[agent_type] = template_cls
        logger.debug(f"Registered agent template: {agent_type}")

        return template_cls

    def get_template(self, agent_type: str) -> Type[BaseAgentTemplate] | None:
        """Get template class by type identifier.

        Args:
            agent_type: Agent type identifier (e.g., "faq")

        Returns:
            Template class or None if not found
        """
        return self._templates.get(agent_type)

    def create_instance(
        self,
        agent_type: str,
        config: AgentConfig | None = None,
        api_key: str | None = None,
    ) -> BaseAgentTemplate | None:
        """Create an instance of an agent template.

        Args:
            agent_type: Agent type identifier
            config: Optional custom configuration
            api_key: Google API key

        Returns:
            Agent template instance or None if type not found
        """
        template_cls = self.get_template(agent_type)
        if template_cls is None:
            return None

        return template_cls(config=config, api_key=api_key)

    def list_agent_types(self) -> list[str]:
        """List all registered agent type identifiers.

        Returns:
            List of agent type strings
        """
        return list(self._templates.keys())

    def list_templates(self) -> list[dict]:
        """List all registered templates with metadata.

        Returns:
            List of template info dictionaries
        """
        templates = []
        for agent_type, template_cls in self._templates.items():
            templates.append({
                "type": agent_type,
                "name": template_cls.get_display_name(),
                "description": template_cls.get_description(),
                "category": template_cls.get_category().value,
            })
        return templates

    def list_by_category(self, category: AgentCategory) -> list[dict]:
        """List templates filtered by category.

        Args:
            category: Category to filter by

        Returns:
            List of template info dictionaries
        """
        return [
            t for t in self.list_templates()
            if t["category"] == category.value
        ]

    def clear(self) -> None:
        """Clear all registered templates. Mainly for testing."""
        self._templates.clear()


def get_registry() -> AgentRegistry:
    """Get the singleton registry instance.

    Returns:
        AgentRegistry singleton
    """
    return AgentRegistry()
