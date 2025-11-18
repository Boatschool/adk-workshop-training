"""
Facilities Ticket Routing Agent

This multi-agent system:
1. Receives facility maintenance requests
2. Categorizes and prioritizes them
3. Routes to appropriate department
4. Generates ticket with tracking number

No PHI/PII processing - facilities/operations only.
"""

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from datetime import datetime
from typing import Dict
import random

def categorize_request(description: str) -> Dict:
    """
    Categorize a facilities request based on description.

    Args:
        description: Description of the issue

    Returns:
        Category and priority information
    """
    # Simple keyword-based categorization (in production, use more sophisticated NLP)
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
        "sla_hours": sla_hours
    }

def create_ticket(
    category: str,
    department: str,
    priority: str,
    description: str,
    location: str,
    reporter_name: str,
    reporter_contact: str
) -> Dict:
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
        "estimated_response": f"Within {categorize_request(description)['sla_hours']} hours"
    }

    return ticket

def check_ticket_status(ticket_number: str) -> Dict:
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
        "message": "Ticket found in the system. For detailed status, contact Facilities at ext. 5200"
    }

# Create tools
categorize_tool = FunctionTool(categorize_request)
create_ticket_tool = FunctionTool(create_ticket)
check_status_tool = FunctionTool(check_ticket_status)

# Agent 1: Intake Agent - Gathers information
intake_agent = Agent(
    name="facilities_intake",
    model="gemini-2.5-flash",
    instruction="""You are a friendly facilities intake specialist.

    Your job is to gather complete information about facility maintenance requests:
    1. What is the issue? (Get detailed description)
    2. Where is it located? (Building, floor, room number)
    3. Reporter's name
    4. Best contact method (email or phone)

    Be empathetic and professional. Ask clarifying questions to get complete information.
    Once you have all details, pass the information to the categorization specialist.

    Do not process or request any patient information. This is for facilities only.
    """,
    description="Gathers information about facilities requests"
)

# Agent 2: Categorization Agent - Analyzes and categorizes
categorization_agent = Agent(
    name="facilities_categorizer",
    model="gemini-2.5-flash",
    instruction="""You are a facilities request categorization specialist.

    Your job:
    1. Analyze the issue description
    2. Use the categorization tool to determine category and priority
    3. Review the automated categorization and adjust if needed based on your expertise
    4. Pass categorized information to the ticket creation specialist

    Categories: HVAC, Electrical, Plumbing, Custodial, Security, General Maintenance
    Priorities: High (safety/emergency), Medium (broken/not working), Low (routine)
    """,
    description="Categorizes and prioritizes facilities requests",
    tools=[categorize_tool]
)

# Agent 3: Ticket Creation Agent - Creates ticket and provides confirmation
ticket_agent = Agent(
    name="facilities_ticket_creator",
    model="gemini-2.5-flash",
    instruction="""You are a facilities ticketing specialist.

    Your job:
    1. Create the facilities ticket using the provided information
    2. Provide clear confirmation to the reporter including:
       - Ticket number
       - Expected response time
       - Department handling the request
       - How to check status (call ext. 5200 or use ticket number)

    Be professional and reassuring. Thank them for reporting the issue.
    """,
    description="Creates tickets and provides confirmation",
    tools=[create_ticket_tool, check_status_tool]
)

# Coordinator Agent - Orchestrates the workflow
facilities_coordinator = Agent(
    name="facilities_coordinator",
    model="gemini-2.5-flash",
    instruction="""You are the facilities request coordinator.

    Your workflow:
    1. Greet the user and explain you'll help them submit a facilities request
    2. Delegate to the intake agent to gather information
    3. Delegate to the categorization agent to analyze the request
    4. Delegate to the ticket agent to create the ticket and confirm

    Keep the process moving smoothly. Ensure the user gets a ticket number and next steps.

    This system is for facilities/maintenance requests only - no clinical or patient data.
    """,
    description="Coordinates the facilities ticket routing process",
    agents=[intake_agent, categorization_agent, ticket_agent]
)

# Example usage
if __name__ == "__main__":
    print("Facilities Ticket Routing System - Type 'quit' to exit")
    print("=" * 70)

    print("\nExample requests:")
    print("- The AC isn't working in Conference Room 201")
    print("- There's a water leak in the 3rd floor break room")
    print("- The lights are out in the parking garage")
    print("- Check status of ticket FAC-20241118-1234")
    print("\n" + "=" * 70 + "\n")

    # Run the coordinator agent
    facilities_coordinator.run()
