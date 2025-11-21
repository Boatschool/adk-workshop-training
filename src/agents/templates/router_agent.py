"""
Facilities Ticket Routing Agent Template.

A multi-agent system for processing facility maintenance requests:
1. Intake Agent - Gathers information
2. Categorization Agent - Analyzes and categorizes
3. Ticket Agent - Creates ticket and confirms

Demonstrates multi-agent orchestration with Google ADK.

No PHI/PII processing - facilities/operations only.
"""

from datetime import datetime
from typing import Any
import random

from src.agents.base import BaseAgentTemplate, AgentConfig, AgentCategory
from src.agents.registry import AgentRegistry


def categorize_request(description: str) -> dict:
    """
    Categorize a facilities request based on description.

    Args:
        description: Description of the issue

    Returns:
        Category and priority information
    """
    description_lower = description.lower()

    # Determine category
    if any(word in description_lower for word in ["hvac", "temperature", "heating", "cooling", "air"]):
        category = "HVAC"
        department = "Climate Control"
    elif any(word in description_lower for word in ["electrical", "light", "outlet", "power"]):
        category = "Electrical"
        department = "Electrical Services"
    elif any(word in description_lower for word in ["plumbing", "leak", "water", "drain", "toilet"]):
        category = "Plumbing"
        department = "Plumbing Services"
    elif any(word in description_lower for word in ["cleaning", "janitorial", "trash", "dirty"]):
        category = "Custodial"
        department = "Environmental Services"
    elif any(word in description_lower for word in ["lock", "door", "key", "access"]):
        category = "Security"
        department = "Security Services"
    else:
        category = "General Maintenance"
        department = "General Facilities"

    # Determine priority
    if any(word in description_lower for word in ["emergency", "urgent", "immediate", "safety", "hazard"]):
        priority = "High"
        sla_hours = 2
    elif any(word in description_lower for word in ["soon", "important", "broken", "not working"]):
        priority = "Medium"
        sla_hours = 24
    else:
        priority = "Low"
        sla_hours = 72

    return {
        "category": category,
        "department": department,
        "priority": priority,
        "sla_hours": sla_hours,
    }


def create_ticket(
    category: str,
    department: str,
    priority: str,
    description: str,
    location: str,
    reporter_name: str,
    reporter_contact: str,
) -> dict:
    """
    Create a facilities ticket.

    Args:
        category: Issue category
        department: Department to handle the issue
        priority: Priority level (High/Medium/Low)
        description: Issue description
        location: Location of the issue
        reporter_name: Name of person reporting
        reporter_contact: Contact info (email/phone)

    Returns:
        Ticket details with tracking number
    """
    ticket_number = f"FAC-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

    ticket = {
        "ticket_number": ticket_number,
        "category": category,
        "department": department,
        "priority": priority,
        "description": description,
        "location": location,
        "reporter_name": reporter_name,
        "reporter_contact": reporter_contact,
        "status": "Open",
        "created_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "estimated_response": f"Within {categorize_request(description)['sla_hours']} hours",
    }

    return ticket


def check_ticket_status(ticket_number: str) -> dict:
    """
    Check the status of a ticket.

    Args:
        ticket_number: Ticket tracking number

    Returns:
        Ticket status information
    """
    # In production, would query actual ticketing system
    return {
        "ticket_number": ticket_number,
        "status": "In Progress",
        "message": "Ticket found in the system. For detailed status, contact Facilities at ext. 5200",
    }


class IntakeAgentTemplate(BaseAgentTemplate):
    """Intake agent for gathering facilities request information."""

    @classmethod
    def get_agent_type(cls) -> str:
        return "intake"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.ROUTING

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Facilities Intake",
            model="gemini-2.5-flash",
            description="Gathers information about facilities requests",
        )

    def create_agent(self) -> Any:
        from google.adk.agents import Agent

        instruction = """You are a friendly facilities intake specialist.

Your job is to gather complete information about facility maintenance requests:
1. What is the issue? (Get detailed description)
2. Where is it located? (Building, floor, room number)
3. Reporter's name
4. Best contact method (email or phone)

Be empathetic and professional. Ask clarifying questions to get complete information.
Once you have all details, pass the information to the categorization specialist.

Do not process or request any patient information. This is for facilities only.
"""

        return Agent(
            name="facilities_intake",
            model=self.config.model,
            instruction=instruction,
            description=self.config.description,
        )


class CategorizationAgentTemplate(BaseAgentTemplate):
    """Categorization agent for analyzing and prioritizing requests."""

    @classmethod
    def get_agent_type(cls) -> str:
        return "categorizer"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.ROUTING

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Facilities Categorizer",
            model="gemini-2.5-flash",
            description="Categorizes and prioritizes facilities requests",
        )

    def create_agent(self) -> Any:
        from google.adk.agents import Agent
        from google.adk.tools import FunctionTool

        instruction = """You are a facilities request categorization specialist.

Your job:
1. Analyze the issue description
2. Use the categorization tool to determine category and priority
3. Review the automated categorization and adjust if needed based on your expertise
4. Pass categorized information to the ticket creation specialist

Categories: HVAC, Electrical, Plumbing, Custodial, Security, General Maintenance
Priorities: High (safety/emergency), Medium (broken/not working), Low (routine)
"""

        return Agent(
            name="facilities_categorizer",
            model=self.config.model,
            instruction=instruction,
            description=self.config.description,
            tools=[FunctionTool(categorize_request)],
        )

    def get_tools(self) -> list[Any]:
        from google.adk.tools import FunctionTool

        return [FunctionTool(categorize_request)]


class TicketAgentTemplate(BaseAgentTemplate):
    """Ticket creation agent for finalizing and confirming tickets."""

    @classmethod
    def get_agent_type(cls) -> str:
        return "ticket_creator"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.ROUTING

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Facilities Ticket Creator",
            model="gemini-2.5-flash",
            description="Creates tickets and provides confirmation",
        )

    def create_agent(self) -> Any:
        from google.adk.agents import Agent
        from google.adk.tools import FunctionTool

        instruction = """You are a facilities ticketing specialist.

Your job:
1. Create the facilities ticket using the provided information
2. Provide clear confirmation to the reporter including:
   - Ticket number
   - Expected response time
   - Department handling the request
   - How to check status (call ext. 5200 or use ticket number)

Be professional and reassuring. Thank them for reporting the issue.
"""

        return Agent(
            name="facilities_ticket_creator",
            model=self.config.model,
            instruction=instruction,
            description=self.config.description,
            tools=[
                FunctionTool(create_ticket),
                FunctionTool(check_ticket_status),
            ],
        )

    def get_tools(self) -> list[Any]:
        from google.adk.tools import FunctionTool

        return [
            FunctionTool(create_ticket),
            FunctionTool(check_ticket_status),
        ]


@AgentRegistry.register
class RouterAgentTemplate(BaseAgentTemplate):
    """Multi-agent ticket routing coordinator.

    Orchestrates a team of specialized agents:
    - Intake: Gathers request information
    - Categorizer: Analyzes and prioritizes
    - Ticket Creator: Creates ticket and confirms

    Features:
    - Multi-agent workflow orchestration
    - Automatic categorization and routing
    - Ticket creation with tracking numbers
    - SLA-based priority assignment

    Tools:
    - categorize_request: Categorize by keywords
    - create_ticket: Generate ticket with tracking
    - check_ticket_status: Query ticket status
    """

    @classmethod
    def get_agent_type(cls) -> str:
        return "router"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.ROUTING

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Facilities Coordinator",
            model="gemini-2.5-flash",
            description="Coordinates the facilities ticket routing process with multiple specialized agents",
            settings={
                "enable_sub_agents": True,
                "sla_high_hours": 2,
                "sla_medium_hours": 24,
                "sla_low_hours": 72,
            },
        )

    def create_agent(self) -> Any:
        """Create the coordinator agent with sub-agents."""
        from google.adk.agents import Agent

        instruction = """You are the facilities request coordinator.

Your workflow:
1. Greet the user and explain you'll help them submit a facilities request
2. Delegate to the intake agent to gather information
3. Delegate to the categorization agent to analyze the request
4. Delegate to the ticket agent to create the ticket and confirm

Keep the process moving smoothly. Ensure the user gets a ticket number and next steps.

This system is for facilities/maintenance requests only - no clinical or patient data.
"""

        if self.config.instruction:
            instruction = self.config.instruction

        # Create sub-agents
        intake = IntakeAgentTemplate(api_key=self.api_key).create_agent()
        categorizer = CategorizationAgentTemplate(api_key=self.api_key).create_agent()
        ticket_creator = TicketAgentTemplate(api_key=self.api_key).create_agent()

        return Agent(
            name="facilities_coordinator",
            model=self.config.model,
            instruction=instruction,
            description=self.config.description,
            agents=[intake, categorizer, ticket_creator],
        )

    def get_sub_agents(self) -> list[BaseAgentTemplate]:
        """Return the sub-agent templates."""
        return [
            IntakeAgentTemplate(api_key=self.api_key),
            CategorizationAgentTemplate(api_key=self.api_key),
            TicketAgentTemplate(api_key=self.api_key),
        ]

    def get_tools(self) -> list[Any]:
        """Router agent tools are on sub-agents."""
        from google.adk.tools import FunctionTool

        return [
            FunctionTool(categorize_request),
            FunctionTool(create_ticket),
            FunctionTool(check_ticket_status),
        ]
