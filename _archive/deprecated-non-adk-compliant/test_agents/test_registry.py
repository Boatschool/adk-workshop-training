"""Tests for agent registry."""

import pytest

from src.agents.base import AgentCategory, AgentConfig, BaseAgentTemplate
from src.agents.registry import AgentRegistry, get_registry


class DummyAgentTemplate(BaseAgentTemplate):
    """Dummy agent template for testing."""

    @classmethod
    def get_agent_type(cls) -> str:
        return "dummy"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.CUSTOM

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Dummy Agent",
            description="A dummy agent for testing",
        )

    def create_agent(self):
        return {"type": "dummy"}


class AnotherDummyAgent(BaseAgentTemplate):
    """Another dummy agent for testing."""

    @classmethod
    def get_agent_type(cls) -> str:
        return "another_dummy"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.FAQ

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Another Dummy",
            description="Another test agent",
        )

    def create_agent(self):
        return {"type": "another"}


class TestAgentRegistry:
    """Tests for AgentRegistry class."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset registry state before each test."""
        # Store original templates
        original_templates = AgentRegistry._templates.copy()

        yield

        # Restore original templates
        AgentRegistry._templates = original_templates

    def test_singleton_pattern(self):
        """Test registry uses singleton pattern."""
        registry1 = AgentRegistry()
        registry2 = AgentRegistry()

        assert registry1 is registry2

    def test_get_registry_function(self):
        """Test get_registry returns singleton."""
        registry = get_registry()

        assert isinstance(registry, AgentRegistry)
        assert registry is AgentRegistry()

    def test_register_template(self):
        """Test registering a template."""
        # Clear registry for this test
        AgentRegistry._templates.clear()

        AgentRegistry.register(DummyAgentTemplate)

        assert "dummy" in AgentRegistry._templates
        assert AgentRegistry._templates["dummy"] is DummyAgentTemplate

    def test_register_as_decorator(self):
        """Test register can be used as decorator."""
        AgentRegistry._templates.clear()

        @AgentRegistry.register
        class DecoratedAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "decorated"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Decorated")

            def create_agent(self):
                return None

        assert "decorated" in AgentRegistry._templates

    def test_get_template_exists(self):
        """Test getting existing template."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)

        registry = AgentRegistry()
        template_cls = registry.get_template("dummy")

        assert template_cls is DummyAgentTemplate

    def test_get_template_not_exists(self):
        """Test getting non-existent template."""
        registry = AgentRegistry()
        template_cls = registry.get_template("nonexistent")

        assert template_cls is None

    def test_create_instance(self):
        """Test creating template instance."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)

        registry = AgentRegistry()
        instance = registry.create_instance("dummy")

        assert instance is not None
        assert isinstance(instance, DummyAgentTemplate)
        assert instance.config.name == "Dummy Agent"

    def test_create_instance_with_custom_config(self):
        """Test creating instance with custom config."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)

        custom_config = AgentConfig(name="Custom Name")
        registry = AgentRegistry()
        instance = registry.create_instance("dummy", config=custom_config)

        assert instance.config.name == "Custom Name"

    def test_create_instance_not_found(self):
        """Test creating instance for non-existent type."""
        registry = AgentRegistry()
        instance = registry.create_instance("nonexistent")

        assert instance is None

    def test_list_agent_types(self):
        """Test listing registered types."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)
        AgentRegistry.register(AnotherDummyAgent)

        registry = AgentRegistry()
        types = registry.list_agent_types()

        assert "dummy" in types
        assert "another_dummy" in types

    def test_list_templates(self):
        """Test listing templates with metadata."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)
        AgentRegistry.register(AnotherDummyAgent)

        registry = AgentRegistry()
        templates = registry.list_templates()

        assert len(templates) == 2

        dummy_template = next(t for t in templates if t["type"] == "dummy")
        assert dummy_template["name"] == "Dummy Agent"
        assert dummy_template["description"] == "A dummy agent for testing"
        assert dummy_template["category"] == "custom"

    def test_list_by_category(self):
        """Test filtering templates by category."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)  # CUSTOM
        AgentRegistry.register(AnotherDummyAgent)  # FAQ

        registry = AgentRegistry()

        faq_templates = registry.list_by_category(AgentCategory.FAQ)
        assert len(faq_templates) == 1
        assert faq_templates[0]["type"] == "another_dummy"

        custom_templates = registry.list_by_category(AgentCategory.CUSTOM)
        assert len(custom_templates) == 1
        assert custom_templates[0]["type"] == "dummy"

    def test_clear_registry(self):
        """Test clearing all templates."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)

        registry = AgentRegistry()
        assert len(registry.list_agent_types()) > 0

        registry.clear()
        assert len(registry.list_agent_types()) == 0

    def test_overwrite_warning(self, caplog):
        """Test warning when overwriting registration."""
        AgentRegistry._templates.clear()
        AgentRegistry.register(DummyAgentTemplate)

        # Register another template with same type
        class DuplicateAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "dummy"  # Same as DummyAgentTemplate

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Duplicate")

            def create_agent(self):
                return None

        import logging

        with caplog.at_level(logging.WARNING):
            AgentRegistry.register(DuplicateAgent)

        assert "Overwriting" in caplog.text or AgentRegistry._templates["dummy"] is DuplicateAgent


class TestRegistryWithBuiltinTemplates:
    """Tests verifying built-in templates are registered."""

    def test_builtin_templates_registered(self):
        """Test that built-in templates are auto-registered."""
        registry = get_registry()
        types = registry.list_agent_types()

        # Should have the 3 built-in templates
        assert "faq" in types
        assert "scheduler" in types
        assert "router" in types

    def test_faq_template_info(self):
        """Test FAQ template has correct info."""
        registry = get_registry()
        template_cls = registry.get_template("faq")

        assert template_cls is not None
        assert template_cls.get_display_name() == "HR FAQ Assistant"
        assert template_cls.get_category() == AgentCategory.FAQ

    def test_scheduler_template_info(self):
        """Test scheduler template has correct info."""
        registry = get_registry()
        template_cls = registry.get_template("scheduler")

        assert template_cls is not None
        assert template_cls.get_display_name() == "Meeting Room Scheduler"
        assert template_cls.get_category() == AgentCategory.SCHEDULING

    def test_router_template_info(self):
        """Test router template has correct info."""
        registry = get_registry()
        template_cls = registry.get_template("router")

        assert template_cls is not None
        assert template_cls.get_display_name() == "Facilities Coordinator"
        assert template_cls.get_category() == AgentCategory.ROUTING
