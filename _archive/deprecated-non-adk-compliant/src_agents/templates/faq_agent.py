"""
FAQ Agent Template.

A simple Q&A agent that answers common questions using a knowledge base.
Ideal for HR departments, customer service, or internal documentation.

No PHI/PII processing - purely informational.
"""

from typing import Any

from src.agents.base import BaseAgentTemplate, AgentConfig, AgentCategory
from src.agents.registry import AgentRegistry


# Default FAQ knowledge base for healthcare HR
DEFAULT_FAQ_KNOWLEDGE = """
BENEFITS ENROLLMENT:
- Open enrollment period: November 1-30 annually
- New employees: 30 days from hire date to enroll
- Life events: 30 days to make changes
- Contact: benefits@hospital.example.com

TIME OFF POLICIES:
- PTO accrual: 15 days/year for 0-5 years of service
- PTO accrual: 20 days/year for 5+ years of service
- Sick time: 10 days/year, does not roll over
- Holidays: 10 paid holidays per year
- Request process: Submit in Workday, requires manager approval

PAYROLL SCHEDULES:
- Pay frequency: Bi-weekly on Fridays
- Payroll deadline: Tuesday 5pm prior to pay date
- Direct deposit: Set up in Workday
- Pay stubs: Available in Workday portal

EMPLOYEE RESOURCES:
- Workday login: workday.hospital.example.com
- IT Help Desk: ext. 5555
- HR Main Line: ext. 5000
- Employee Assistance Program: 1-800-EAP-HELP
- Learning Portal: learning.hospital.example.com

WORKSPACE REQUESTS:
- Office supplies: Order via Workday catalog
- Equipment requests: Submit IT ticket
- Parking passes: Contact Facilities (ext. 5200)
- Building access: Contact Security (ext. 5100)
"""


@AgentRegistry.register
class FAQAgentTemplate(BaseAgentTemplate):
    """FAQ Agent for answering common questions from a knowledge base.

    Features:
    - Uses configurable knowledge base content
    - Fast responses with gemini-2.5-flash model
    - No tool usage - pure conversation
    - Customizable instruction and persona

    Configuration:
        knowledge_base: Custom FAQ content (optional, uses default if not set)
        settings.fallback_contact: Contact for unanswered questions
    """

    @classmethod
    def get_agent_type(cls) -> str:
        return "faq"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.FAQ

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="HR FAQ Assistant",
            model="gemini-2.5-flash",
            description="Answers common questions about benefits, time off, payroll, and employee resources",
            knowledge_base=DEFAULT_FAQ_KNOWLEDGE,
            instruction="",  # Built dynamically in create_agent
            settings={
                "fallback_contact": "HR (ext. 5000)",
                "tone": "friendly and professional",
            },
        )

    def create_agent(self) -> Any:
        """Create the Google ADK Agent instance."""
        from google.adk.agents import Agent

        knowledge = self.config.knowledge_base or DEFAULT_FAQ_KNOWLEDGE
        fallback = self.config.settings.get("fallback_contact", "HR (ext. 5000)")
        tone = self.config.settings.get("tone", "friendly and professional")

        instruction = f"""You are a helpful HR assistant for a healthcare organization.
You answer common questions about benefits, time off, payroll, and employee resources.

Use this knowledge base to answer questions:
{knowledge}

Guidelines:
- Be {tone}
- If you don't know the answer, direct them to {fallback}
- Never make up information
- Keep responses concise
- Do not process or ask for any personal employee information
"""

        if self.config.instruction:
            # Allow custom instruction override
            instruction = self.config.instruction

        return Agent(
            name=self.config.name.lower().replace(" ", "_"),
            model=self.config.model,
            instruction=instruction,
            description=self.config.description,
        )

    def get_tools(self) -> list[Any]:
        """FAQ agent has no tools - pure conversation."""
        return []
