# Hello Agent

## Overview

A simple Python-based agent demonstrating the programmatic approach to ADK agent development. Unlike YAML declarative agents, this agent uses the ADK Python SDK directly, providing more flexibility for complex implementations.

## Agent Configuration

- **Name:** `hello_agent`
- **Model:** `gemini-2.0-flash-exp`
- **Type:** LlmAgent (Python-based)
- **Files:**
  - `agent.py` - Agent definition using ADK SDK
  - `__init__.py` - Package initialization, exports `root_agent`

## Capabilities

- Answer questions clearly and concisely
- Provide helpful and informative responses
- Acknowledge knowledge limitations honestly
- Maintain polite and professional communication

## Usage

### Running with ADK CLI

```bash
# From the agents directory
cd agents
adk web

# Access the Visual Builder at:
# http://localhost:8000/dev-ui
```

### Running Directly

```bash
adk run hello_agent
```

### Example Conversation

```
User: Hello! What can you do?

Agent: Hello! I'm a friendly assistant here to help you. I can:
- Answer questions on various topics
- Provide information and explanations
- Have helpful conversations

Feel free to ask me anything!
```

## Python vs YAML Agents

| Aspect | Python (this agent) | YAML (declarative) |
|--------|---------------------|-------------------|
| Definition | `agent.py` with SDK | `root_agent.yaml` |
| Flexibility | Full Python power | Limited to YAML schema |
| Custom logic | Native support | Requires tool files |
| Model support | All models (via LiteLLM) | Gemini models only |
| Visual Builder | Works with export | Native support |

## Customization

### Modifying the Agent

Edit `agent.py` to customize:

```python
from google.adk.agents import Agent

root_agent = Agent(
    name="my_custom_agent",
    model="gemini-2.0-flash-exp",
    description="Your agent description",
    instruction="""Your custom instructions here...""",
)
```

### Key Requirements

1. The agent variable **must be named `root_agent`**
2. The `__init__.py` must export `root_agent`
3. The directory must be a valid Python package

### Adding Tools

```python
from google.adk.agents import Agent
from google.adk.tools import FunctionTool

def my_tool(param: str) -> str:
    return f"Result: {param}"

root_agent = Agent(
    name="agent_with_tools",
    model="gemini-2.0-flash-exp",
    instruction="...",
    tools=[FunctionTool(my_tool)],
)
```

## Notes

- Use Python agents when you need non-Gemini models or complex tool logic
- YAML agents are preferred for Visual Builder workflows
- Both approaches work with `adk web` and `adk run`
