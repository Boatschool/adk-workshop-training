# Starter Agent

## Overview

A minimal template agent designed for learning the ADK Visual Builder. This agent demonstrates the basic structure of a YAML-based declarative agent and serves as a starting point for building more complex agents.

## Agent Configuration

- **Name:** `starter_agent`
- **Model:** `gemini-2.5-flash`
- **Type:** LlmAgent (single agent, no sub-agents)
- **Files:** `root_agent.yaml`

## Capabilities

- Answer questions clearly and accurately
- Provide helpful, professional responses
- Acknowledge knowledge limitations honestly
- Ask clarifying questions when needed

## Usage

### Running with ADK CLI

```bash
# From the agents directory
cd agents
adk web

# Access the Visual Builder at:
# http://localhost:8000/dev-ui
```

### Running a Specific Agent

```bash
# Run just this agent
adk run starter_agent
```

### Example Conversation

```
User: What can you help me with?

Agent: I'm a helpful assistant created using the ADK Visual Builder. I can:
- Answer questions on various topics
- Help clarify information
- Provide concise, informative responses

What would you like to know?
```

## Customization

### Modifying the Agent

Edit `root_agent.yaml` to customize:

1. **Change the name:** Update the `name` field
2. **Adjust the model:** Change `model` to another supported Gemini model
3. **Update instructions:** Modify the `instruction` field to change behavior
4. **Add tools:** Add tool configurations to the `tools` list
5. **Add sub-agents:** Reference other agents in `sub_agents` for multi-agent workflows

### Adding Domain Knowledge

To make this agent domain-specific, update the instruction with:
- Specific knowledge about your domain
- Custom guidelines and constraints
- Response formatting requirements

## Notes

- This is a YAML-only declarative agent (no Python files required)
- Ideal for Visual Builder training and prototyping
- For complex logic, consider Python-based agents or adding custom tools
