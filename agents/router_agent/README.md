# Facilities Ticket Router

## Overview

A multi-agent workflow for facilities ticket routing that demonstrates ADK's hierarchical agent architecture. The coordinator orchestrates three specialized sub-agents to intake, categorize, and create tickets for facility maintenance requests.

## Agent Configuration

- **Name:** `facilities_coordinator`
- **Model:** `gemini-2.5-flash`
- **Type:** Multi-agent workflow (1 coordinator + 3 sub-agents)
- **Files:**
  - `root_agent.yaml` - Coordinator agent
  - `intake_agent.yaml` - Information gathering
  - `categorizer_agent.yaml` - Issue categorization
  - `ticket_agent.yaml` - Ticket creation

## Architecture

```
┌─────────────────────────────────────────────┐
│         facilities_coordinator              │
│              (root agent)                   │
└──────────────────┬──────────────────────────┘
                   │ coordinates
       ┌───────────┼───────────┐
       ▼           ▼           ▼
┌──────────┐ ┌───────────┐ ┌──────────┐
│  intake  │→│categorizer│→│  ticket  │
│  agent   │ │   agent   │ │  agent   │
└──────────┘ └───────────┘ └──────────┘
   gather      classify      create &
   details     & prioritize  confirm
```

### Workflow Steps

1. **Intake Phase** (`facilities_intake`)
   - Greet user and explain process
   - Gather issue description
   - Collect location (building, floor, room)
   - Get reporter name and contact info

2. **Categorization Phase** (`facilities_categorizer`)
   - Analyze issue description
   - Assign category (HVAC, Electrical, etc.)
   - Determine priority level

3. **Ticket Creation Phase** (`facilities_ticket_creator`)
   - Generate ticket number (FAC-YYYYMMDD-XXXX)
   - Provide confirmation with response time
   - Explain status check process

## Issue Categories

| Category | Examples |
|----------|----------|
| HVAC | Temperature, heating, cooling, air conditioning |
| Electrical | Lights, outlets, power issues |
| Plumbing | Leaks, water, drains, toilets |
| Custodial | Cleaning, trash, janitorial |
| Security | Locks, doors, keys, access |
| General Maintenance | Other facility issues |

## Priority Levels

| Priority | SLA | Criteria |
|----------|-----|----------|
| High | 2 hours | Safety hazards, emergencies |
| Medium | 24 hours | Broken/not working |
| Low | 72 hours | Routine maintenance |

## Usage

### Running with ADK CLI

```bash
cd agents
adk web
# Access at http://localhost:8000/dev-ui
```

### Example Conversation

```
User: The lights in Conference Room 201 are flickering.

Agent: I'll help you submit a facilities request for that. Let me gather
some information.

You mentioned flickering lights in Conference Room 201.
- What floor is that on?
- Is this affecting work in the room currently?
- May I have your name and preferred contact method?

User: Floor 2, yes it's distracting. I'm John Smith, email jsmith@hospital.example.com

Agent: Thank you, John. I've created your ticket:

📋 Ticket: FAC-20241125-0042
📍 Location: Conference Room 201, Floor 2
⚡ Category: Electrical
🔴 Priority: Medium

Expected response: Within 24 hours
To check status: Call ext. 5200 with your ticket number

Thank you for reporting this issue!
```

## Customization

### Modifying Sub-agents

Each sub-agent can be customized independently:
- **intake_agent.yaml** - Change questions or add fields
- **categorizer_agent.yaml** - Modify categories or priority rules
- **ticket_agent.yaml** - Update confirmation format or SLAs

### Adding Real Ticket System Integration

Add tools to connect with ticketing systems:

```yaml
tools:
  - name: create_ticket_in_system
    description: Create ticket in ServiceNow/Jira
  - name: send_email_confirmation
    description: Email ticket confirmation to reporter
```

## Notes

- Demo version simulates ticket creation
- Handles facilities/maintenance requests only
- Does not process patient or clinical data
- Sub-agent references use relative paths (`./agent_name.yaml`)
