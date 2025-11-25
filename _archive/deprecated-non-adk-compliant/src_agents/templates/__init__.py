"""
Agent Templates Module.

This module contains pre-built agent templates for common use cases.
Each template is automatically registered with the AgentRegistry.

Available Templates:
- FAQAgentTemplate: Simple Q&A agent with knowledge base
- SchedulerAgentTemplate: Meeting room booking with tools
- RouterAgentTemplate: Multi-agent ticket routing system
"""

from src.agents.templates.faq_agent import FAQAgentTemplate
from src.agents.templates.scheduler_agent import SchedulerAgentTemplate
from src.agents.templates.router_agent import (
    RouterAgentTemplate,
    IntakeAgentTemplate,
    CategorizationAgentTemplate,
    TicketAgentTemplate,
)

__all__ = [
    "FAQAgentTemplate",
    "SchedulerAgentTemplate",
    "RouterAgentTemplate",
    "IntakeAgentTemplate",
    "CategorizationAgentTemplate",
    "TicketAgentTemplate",
]
