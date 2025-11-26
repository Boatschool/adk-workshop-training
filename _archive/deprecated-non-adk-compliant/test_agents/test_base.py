"""Tests for agent base classes."""

import pytest
from dataclasses import asdict

from src.agents.base import (
    AgentCategory,
    AgentConfig,
    AgentResponse,
    BaseAgentTemplate,
)


class TestAgentCategory:
    """Tests for AgentCategory enum."""

    def test_category_values(self):
        """Test category enum values."""
        assert AgentCategory.FAQ.value == "faq"
        assert AgentCategory.SCHEDULING.value == "scheduling"
        assert AgentCategory.ROUTING.value == "routing"
        assert AgentCategory.CUSTOM.value == "custom"

    def test_category_string_enum(self):
        """Test category is string enum."""
        assert isinstance(AgentCategory.FAQ, str)
        assert AgentCategory.FAQ == "faq"


class TestAgentConfig:
    """Tests for AgentConfig dataclass."""

    def test_default_values(self):
        """Test default configuration values."""
        config = AgentConfig(name="Test Agent")

        assert config.name == "Test Agent"
        assert config.model == "gemini-2.5-flash"
        assert config.instruction == ""
        assert config.description == ""
        assert config.knowledge_base is None
        assert config.settings == {}

    def test_custom_values(self):
        """Test custom configuration values."""
        config = AgentConfig(
            name="Custom Agent",
            model="gemini-1.5-pro",
            instruction="Be helpful",
            description="A custom agent",
            knowledge_base="Some knowledge",
            settings={"timeout": 30},
        )

        assert config.name == "Custom Agent"
        assert config.model == "gemini-1.5-pro"
        assert config.instruction == "Be helpful"
        assert config.description == "A custom agent"
        assert config.knowledge_base == "Some knowledge"
        assert config.settings == {"timeout": 30}

    def test_to_dict(self):
        """Test config serialization to dict."""
        config = AgentConfig(
            name="Test",
            description="Test agent",
            settings={"key": "value"},
        )

        result = config.to_dict()

        assert result["name"] == "Test"
        assert result["model"] == "gemini-2.5-flash"
        assert result["description"] == "Test agent"
        assert result["settings"] == {"key": "value"}
        assert "knowledge_base" in result


class TestAgentResponse:
    """Tests for AgentResponse dataclass."""

    def test_successful_response(self):
        """Test successful response creation."""
        response = AgentResponse(
            success=True,
            message="Hello!",
            data={"agent_type": "faq"},
            execution_time_ms=150,
            model_used="gemini-2.5-flash",
        )

        assert response.success is True
        assert response.message == "Hello!"
        assert response.data == {"agent_type": "faq"}
        assert response.error is None
        assert response.execution_time_ms == 150
        assert response.model_used == "gemini-2.5-flash"

    def test_error_response(self):
        """Test error response creation."""
        response = AgentResponse(
            success=False,
            message="",
            error="Agent execution failed",
        )

        assert response.success is False
        assert response.message == ""
        assert response.error == "Agent execution failed"

    def test_to_dict(self):
        """Test response serialization."""
        response = AgentResponse(
            success=True,
            message="Test message",
        )

        result = response.to_dict()

        assert result["success"] is True
        assert result["message"] == "Test message"
        assert "timestamp" in result

    def test_timestamp_auto_set(self):
        """Test timestamp is automatically set."""
        response = AgentResponse(success=True, message="")

        assert response.timestamp is not None


class TestBaseAgentTemplate:
    """Tests for BaseAgentTemplate abstract class."""

    def test_cannot_instantiate_abstract(self):
        """Test that abstract class cannot be instantiated directly."""
        with pytest.raises(TypeError):
            BaseAgentTemplate()

    def test_concrete_implementation(self):
        """Test concrete implementation of BaseAgentTemplate."""

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(
                    name="Test Agent",
                    description="A test agent",
                )

            def create_agent(self):
                return {"name": self.config.name}

        agent = ConcreteAgent()

        assert agent.get_agent_type() == "test"
        assert agent.get_category() == AgentCategory.CUSTOM
        assert agent.config.name == "Test Agent"

    def test_custom_config_override(self):
        """Test that custom config overrides default."""

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Default Name")

            def create_agent(self):
                return None

        custom_config = AgentConfig(name="Custom Name")
        agent = ConcreteAgent(config=custom_config)

        assert agent.config.name == "Custom Name"

    def test_validate_config_valid(self):
        """Test validation passes for valid config."""

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Test", model="gemini-2.5-flash")

            def create_agent(self):
                return None

        agent = ConcreteAgent()
        errors = agent.validate_config()

        assert errors == []

    def test_validate_config_invalid(self):
        """Test validation fails for invalid config."""

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="", model="")

            def create_agent(self):
                return None

        agent = ConcreteAgent()
        errors = agent.validate_config()

        assert "Agent name is required" in errors
        assert "Model is required" in errors

    def test_get_tools_default_empty(self):
        """Test default tools list is empty."""

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Test")

            def create_agent(self):
                return None

        agent = ConcreteAgent()
        assert agent.get_tools() == []

    def test_get_sub_agents_default_empty(self):
        """Test default sub-agents list is empty."""

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Test")

            def create_agent(self):
                return None

        agent = ConcreteAgent()
        assert agent.get_sub_agents() == []

    def test_lazy_agent_creation(self):
        """Test agent is lazily created on first access."""
        creation_count = 0

        class ConcreteAgent(BaseAgentTemplate):
            @classmethod
            def get_agent_type(cls) -> str:
                return "test"

            @classmethod
            def get_category(cls) -> AgentCategory:
                return AgentCategory.CUSTOM

            @classmethod
            def get_default_config(cls) -> AgentConfig:
                return AgentConfig(name="Test")

            def create_agent(self):
                nonlocal creation_count
                creation_count += 1
                return {"created": True}

        agent = ConcreteAgent()

        # Agent not created yet
        assert creation_count == 0

        # First access creates agent
        _ = agent.agent
        assert creation_count == 1

        # Second access reuses existing
        _ = agent.agent
        assert creation_count == 1
