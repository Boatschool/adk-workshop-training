"""
ADK Platform Agent Module.

This module provides the agent framework for creating, registering, and executing
AI agents based on Google's Agent Development Kit (ADK).

Architecture:
- BaseAgentTemplate: Abstract base class for all agent templates
- AgentRegistry: Singleton registry for agent type discovery
- AgentRunner: Execution engine for running agents with tenant isolation

Usage:
    from src.agents import AgentRegistry, AgentRunner

    # Get available agent types
    registry = AgentRegistry()
    types = registry.list_agent_types()

    # Run an agent
    runner = AgentRunner(tenant_id="...", api_key="...")
    response = await runner.execute(agent_type="faq", user_message="...")
"""

from src.agents.base import BaseAgentTemplate, AgentConfig, AgentResponse
from src.agents.registry import AgentRegistry, get_registry
from src.agents.runner import AgentRunner

__all__ = [
    "BaseAgentTemplate",
    "AgentConfig",
    "AgentResponse",
    "AgentRegistry",
    "get_registry",
    "AgentRunner",
]
