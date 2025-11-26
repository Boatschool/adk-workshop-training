# Technical Analysis: Google ADK v1.18.0 and Visual Agent Builder

## Document Information

- **Document Type**: Technical Analysis
- **Created Date**: 2025-11-24
- **Author**: Development Team
- **Version**: 1.0
- **ADK Version Analyzed**: 1.18.0

---

## Executive Summary

Google's Agent Development Kit (ADK) is an open-source, code-first Python framework for building, evaluating, and deploying AI agents. While optimized for Gemini models, ADK is model-agnostic and deployment-agnostic. The Visual Agent Builder, introduced in v1.18.0, provides a browser-based interface for designing agents through drag-and-drop interactions.

**Our Local Installation**:
- ADK Version: 1.18.0
- Virtual Environment: `~/adk-workshop`
- Visual Builder Port: 8000
- Agents Directory: `/Users/ronwince/Desktop/adk-workshop-training/agents`

---

## 1. ADK Architecture Overview

### 1.1 Core Components and Modules

The ADK architecture consists of several interconnected layers:

```
+------------------------------------------+
|            Application Layer              |
|   (Your Code / Visual Builder / CLI)      |
+------------------------------------------+
|              Runner Layer                 |
|   (Runner, InMemoryRunner, API Server)    |
+------------------------------------------+
|              Agent Layer                  |
|   (LlmAgent, SequentialAgent, etc.)       |
+------------------------------------------+
|              Tools Layer                  |
|   (FunctionTool, Built-in Tools, MCP)     |
+------------------------------------------+
|            Services Layer                 |
|   (SessionService, ArtifactService,       |
|    MemoryService)                         |
+------------------------------------------+
|              Model Layer                  |
|   (Gemini, LiteLLM integration)           |
+------------------------------------------+
```

**Key Dependencies** (from our local installation):
- `fastapi` >= 0.115.0 - API server foundation
- `google-genai` >= 1.9.0 - Gemini model integration
- `mcp` >= 1.5.0 - Model Context Protocol support
- `pydantic` >= 2.0 - Data validation
- `sqlalchemy` >= 2.0 - Session persistence
- `uvicorn` >= 0.34.0 - ASGI server

### 1.2 Agent Class Hierarchy

The agent hierarchy in ADK:

```
BaseAgent (Abstract)
    |
    +-- LlmAgent (alias: Agent)
    |       - Uses LLM for reasoning and tool selection
    |       - Non-deterministic behavior
    |
    +-- SequentialAgent
    |       - Executes sub-agents in order
    |       - Deterministic flow
    |
    +-- ParallelAgent
    |       - Executes sub-agents concurrently
    |       - Deterministic flow
    |
    +-- LoopAgent
    |       - Repeats sub-agent execution
    |       - Controlled by max_iterations or exit_loop tool
    |
    +-- Custom Agents (extend BaseAgent)
```

**Important**: `Agent` is an alias for `LlmAgent` - they are the same class.

```python
from google.adk.agents import Agent  # This IS LlmAgent
from google.adk.agents import LlmAgent  # Same as above
```

### 1.3 Agent Configuration Parameters

The `LlmAgent` (Agent) class accepts these parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | str | Yes | Unique identifier for the agent |
| `model` | str | Yes | LLM model (e.g., "gemini-2.5-flash") |
| `description` | str | Recommended | Summary for multi-agent delegation |
| `instruction` | str | Critical | System prompt defining behavior |
| `tools` | list | No | Functions, BaseTool instances, or AgentTools |
| `sub_agents` / `agents` | list | No | Child agents for delegation |
| `output_key` | str | No | Auto-save response to state key |
| `before_agent_callback` | callable | No | Pre-execution hook |
| `after_agent_callback` | callable | No | Post-execution hook |
| `before_model_callback` | callable | No | Pre-LLM call hook |
| `after_model_callback` | callable | No | Post-LLM call hook |
| `before_tool_callback` | callable | No | Pre-tool execution hook |
| `after_tool_callback` | callable | No | Post-tool execution hook |

### 1.4 Agent Loading and Execution Flow

**Event Loop Architecture**:

```
1. Runner receives user query
       |
2. Runner loads/creates Session
       |
3. Agent executes via run_async()
       |
4. Agent yields Event (content, state changes)
       |
5. Agent PAUSES
       |
6. Runner processes Event through Services
       |
7. Runner commits state changes
       |
8. Agent RESUMES with committed state
       |
9. Repeat until final response
       |
10. Runner returns complete Event stream
```

### 1.5 The root_agent Pattern

ADK discovers agents through the `root_agent` convention:

**Python-based (agent.py)**:
```python
# agents/my_agent/agent.py
from google.adk.agents import Agent

root_agent = Agent(
    name="my_agent",
    model="gemini-2.0-flash-exp",
    description="A helpful assistant",
    instruction="Answer questions clearly and concisely"
)
```

**YAML-based (root_agent.yaml)**:
```yaml
# agents/my_agent/root_agent.yaml
name: my_agent
model: gemini-2.5-flash
agent_class: LlmAgent
description: A helpful assistant
instruction: Answer questions clearly and concisely
sub_agents: []
tools: []
```

The `adk web` command scans the specified directory for subdirectories containing either:
1. `agent.py` with a `root_agent` variable
2. `root_agent.yaml` configuration file

---

## 2. Visual Agent Builder (adk web)

### 2.1 Overview and Launch

The Visual Agent Builder is a browser-based IDE for designing agents:

```bash
# Start Visual Builder
adk web --port 8000

# With specific agents directory (our configuration)
adk web --port 8000 /path/to/agents
```

**Access URLs**:
- Visual Builder UI: `http://localhost:8000/dev-ui`
- API Documentation: `http://localhost:8000/docs`

### 2.2 Web Server Architecture

The `adk web` command starts a FastAPI server with multiple components:

```
adk web
    |
    +-- FastAPI Application
    |       |
    |       +-- /dev-ui (Visual Builder SPA)
    |       +-- /docs (Swagger UI)
    |       +-- /list-apps (Agent discovery)
    |       +-- /run (Synchronous execution)
    |       +-- /run_sse (SSE streaming)
    |       +-- /run_live (WebSocket bidirectional)
    |       +-- Session management endpoints
    |
    +-- Agent Discovery
    |       - Scans directory for agent.py / root_agent.yaml
    |       - Loads agents dynamically
    |
    +-- Session Service
            - In-memory by default
            - Manages conversation state
```

### 2.3 Communication Protocols

**REST API** (`/run`):
- Synchronous execution
- Returns complete event list as JSON array
- Suitable for simple integrations

**Server-Sent Events** (`/run_sse`):
- Streaming responses
- Token-level streaming with `streaming: true`
- Real-time progress updates

**WebSocket** (`/run_live`):
- Full-duplex bidirectional communication
- Supports multimodal (text, audio)
- Real-time interactive sessions

**Request Format**:
```json
{
    "appName": "my_agent",
    "userId": "user123",
    "sessionId": "session456",
    "newMessage": {
        "role": "user",
        "parts": [{"text": "Hello"}]
    },
    "streaming": true
}
```

### 2.4 Visual Builder Features

| Feature | Description |
|---------|-------------|
| Drag-and-Drop | Visual canvas for agent workflow design |
| Component Library | LLM Agent, Sequential, Parallel, Loop agents |
| AI Assistant | Natural language agent configuration |
| Live Testing | Built-in chat interface for testing |
| Code Generation | Exports to YAML + Python files |
| Callback Configuration | UI for all 6 callback types |

**Generated Directory Structure**:
```
ProjectName/
    root_agent.yaml
    sub_agent_1.yaml
    sub_agent_2.yaml
    tools/
        __init__.py
        custom_tool.py
```

### 2.5 Agent Discovery Process

The Visual Builder discovers agents through:

1. **Directory Scan**: Examines subdirectories of the specified path
2. **File Detection**: Looks for `agent.py` or `root_agent.yaml`
3. **Dynamic Loading**: Imports Python modules or parses YAML
4. **Registration**: Makes agents available through `/list-apps`

---

## 3. Agent Definition Patterns

### 3.1 Python-Based Agents

**Simple Agent**:
```python
# agents/simple_agent/agent.py
from google.adk.agents import Agent

root_agent = Agent(
    name="simple_agent",
    model="gemini-2.5-flash",
    description="Answers general questions",
    instruction="""You are a helpful assistant.
    - Answer questions clearly
    - Be concise and accurate
    - Ask for clarification if needed"""
)
```

**Agent with Tools**:
```python
# agents/weather_agent/agent.py
from google.adk.agents import Agent

def get_weather(city: str, unit: str = "celsius") -> dict:
    """Get current weather for a city.

    Args:
        city: The city name (e.g., "San Francisco")
        unit: Temperature unit, 'celsius' or 'fahrenheit'

    Returns:
        Weather information dictionary
    """
    # Implementation
    return {
        "status": "success",
        "city": city,
        "temperature": 22,
        "unit": unit,
        "conditions": "Partly cloudy"
    }

root_agent = Agent(
    name="weather_agent",
    model="gemini-2.5-flash",
    description="Provides weather information",
    instruction="Help users get weather information using the get_weather tool.",
    tools=[get_weather]  # Automatically wrapped as FunctionTool
)
```

### 3.2 YAML-Based Agents

**Basic Configuration**:
```yaml
# root_agent.yaml
name: assistant_agent
model: gemini-2.5-flash
agent_class: LlmAgent
description: A helpful assistant for general questions
instruction: |
  You are a helpful assistant.
  - Answer questions clearly and accurately
  - Be polite and professional
  - If you don't know something, say so
tools: []
sub_agents: []
```

**With Sub-Agents**:
```yaml
# root_agent.yaml
name: coordinator
model: gemini-2.5-flash
agent_class: LlmAgent
description: Coordinates specialist agents
instruction: |
  You coordinate between specialist agents.
  Delegate research tasks to the research agent.
  Delegate writing tasks to the writing agent.
sub_agents:
  - config_path: ./research_agent.yaml
  - config_path: ./writing_agent.yaml
tools: []
```

### 3.3 Multi-Agent Configurations

**Sequential Workflow**:
```python
from google.adk.agents import Agent, SequentialAgent

# Define specialized agents
research_agent = Agent(
    name="researcher",
    model="gemini-2.5-flash",
    instruction="Research the topic thoroughly",
    output_key="research_results"  # Saves to state
)

writer_agent = Agent(
    name="writer",
    model="gemini-2.5-flash",
    instruction="Write a report based on state['research_results']"
)

# Sequential orchestration
root_agent = SequentialAgent(
    name="report_generator",
    sub_agents=[research_agent, writer_agent]
)
```

**Parallel Execution**:
```python
from google.adk.agents import Agent, ParallelAgent, SequentialAgent

# Parallel data gathering
flight_agent = Agent(name="flight_finder", ...)
hotel_agent = Agent(name="hotel_finder", ...)

parallel_search = ParallelAgent(
    name="parallel_search",
    sub_agents=[flight_agent, hotel_agent]
)

# Summary agent
summarizer = Agent(name="summarizer", ...)

# Complete workflow
root_agent = SequentialAgent(
    name="travel_planner",
    sub_agents=[parallel_search, summarizer]
)
```

**Loop Agent**:
```python
from google.adk.agents import Agent, LoopAgent

reviewer_agent = Agent(
    name="reviewer",
    model="gemini-2.5-flash",
    instruction="""Review the content and provide feedback.
    If quality is acceptable, call exit_loop tool.
    Otherwise, provide improvement suggestions.""",
    tools=[exit_loop]  # Built-in tool
)

root_agent = LoopAgent(
    name="review_loop",
    sub_agents=[reviewer_agent],
    max_iterations=5
)
```

---

## 4. Key APIs and Classes

### 4.1 google.adk.agents Module

```python
# Core imports
from google.adk.agents import Agent  # Alias for LlmAgent
from google.adk.agents import LlmAgent
from google.adk.agents import BaseAgent
from google.adk.agents import SequentialAgent
from google.adk.agents import ParallelAgent
from google.adk.agents import LoopAgent
```

### 4.2 google.adk.tools Module

```python
# Tool imports
from google.adk.tools import FunctionTool
from google.adk.tools import google_search  # Built-in (Gemini 2+ only)
from google.adk.tools import built_in_code_execution  # Built-in
from google.adk.tools.agent_tool import AgentTool

# MCP integration
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
```

**FunctionTool Pattern**:
```python
from google.adk.tools import FunctionTool

def calculate_total(items: list[dict], tax_rate: float = 0.08) -> dict:
    """Calculate total with tax.

    Args:
        items: List of items with 'price' and 'quantity' keys
        tax_rate: Tax rate as decimal (default 0.08 for 8%)

    Returns:
        Dictionary with subtotal, tax, and total
    """
    subtotal = sum(item['price'] * item['quantity'] for item in items)
    tax = subtotal * tax_rate
    return {
        "status": "success",
        "subtotal": subtotal,
        "tax": round(tax, 2),
        "total": round(subtotal + tax, 2)
    }

# Explicit wrapping (optional - Agent does this automatically)
tool = FunctionTool(calculate_total)

agent = Agent(
    name="calculator",
    model="gemini-2.5-flash",
    tools=[calculate_total]  # or [tool]
)
```

### 4.3 Runner and Execution

```python
from google.adk.runners import Runner, InMemoryRunner
from google.adk.sessions import InMemorySessionService

# Simple approach with InMemoryRunner
runner = InMemoryRunner(agent=agent, app_name="my_app")

# Full control with Runner
session_service = InMemorySessionService()
runner = Runner(
    agent=agent,
    app_name="my_app",
    session_service=session_service
)

# Execution methods
# Async (preferred)
async for event in runner.run_async(user_id, session_id, new_message):
    process(event)

# Sync wrapper
events = runner.run(user_id, session_id, new_message)
```

**Code Example - Basic Execution**:
```python
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Define agent
agent = Agent(
    name="assistant",
    model="gemini-2.5-flash",
    instruction="You are a helpful assistant."
)

# Create runner with session service
session_service = InMemorySessionService()
runner = Runner(
    agent=agent,
    app_name="my_app",
    session_service=session_service
)

# Execute
async def run():
    async for event in runner.run_async(
        user_id="user123",
        session_id="session456",
        new_message="Hello, how are you?"
    ):
        if event.content:
            print(event.content.text)

import asyncio
asyncio.run(run())
```

### 4.4 Session and State Management

**Session Types**:
1. **InMemorySessionService** - Development/testing (data lost on restart)
2. **DatabaseSessionService** - Persistent local storage
3. **VertexAISessionService** - Cloud-based persistence

**State Scopes**:
```python
# Agent-scoped state (persists for session)
context.state['user_preference'] = 'dark_mode'

# Temporary state (cleared after invocation)
context.state['temp:intermediate_result'] = data

# Reading state in tools/callbacks
value = context.state.get('key', default_value)
```

### 4.5 Callbacks

```python
from google.adk.agents import Agent

def before_agent(context):
    """Runs before agent logic. Return Content to short-circuit."""
    if not has_permission(context.user_id):
        return Content(text="Access denied")
    return None  # Continue normal execution

def after_agent(context, content):
    """Runs after agent produces content. Can modify output."""
    return Content(text=content.text + "\n\n[Disclaimer: AI-generated]")

def before_model(context, request):
    """Runs before LLM call. Can modify request or return response."""
    # Add system context
    request.messages.insert(0, system_message)
    return None  # Continue to LLM

def after_model(context, response):
    """Runs after LLM response. Can validate/filter output."""
    if contains_pii(response.text):
        return LlmResponse(text="[Content filtered]")
    return response

def before_tool(context, tool_name, args):
    """Runs before tool execution. Can validate or block."""
    log_tool_call(tool_name, args)
    return None  # Allow tool execution

def after_tool(context, tool_name, result):
    """Runs after tool execution. Can modify result."""
    log_tool_result(tool_name, result)
    return result

agent = Agent(
    name="guarded_agent",
    model="gemini-2.5-flash",
    before_agent_callback=before_agent,
    after_agent_callback=after_agent,
    before_model_callback=before_model,
    after_model_callback=after_model,
    before_tool_callback=before_tool,
    after_tool_callback=after_tool
)
```

---

## 5. Configuration and Environment

### 5.1 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes (for Gemini) | Google AI Studio API key |
| `GOOGLE_CLOUD_PROJECT` | For Vertex AI | GCP project ID |
| `GOOGLE_CLOUD_LOCATION` | For Vertex AI | GCP region |

**.env file** (our configuration):
```bash
# Google AI Studio (simpler)
GOOGLE_API_KEY=your_api_key_here

# Vertex AI (enterprise)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

### 5.2 Supported Models

**Gemini Models** (recommended):
- `gemini-2.5-flash` - Fast, cost-effective
- `gemini-2.5-pro` - Advanced reasoning
- `gemini-2.0-flash-exp` - Experimental features (our default)
- `gemini-1.5-flash` - Legacy support
- `gemini-1.5-pro` - Legacy support

**LiteLLM Integration** (model-agnostic):
```python
# Using other providers via LiteLLM
agent = Agent(
    name="claude_agent",
    model="litellm/anthropic/claude-3-sonnet",
    ...
)
```

### 5.3 Directory Structure Requirements

**Standard Agent Project**:
```
my_project/
    agents/
        hello_agent/
            agent.py           # Python-based agent
            __init__.py
        npi_lookup/
            root_agent.yaml    # YAML-based agent
        tenant_creation/
            root_agent.yaml
            sub_agent_1.yaml
            tools/
                __init__.py
                custom_tools.py
    .env                       # Environment variables
```

**Visual Builder Generated**:
```
visual_project/
    root_agent.yaml
    sub_agent_1.yaml
    sub_agent_2.yaml
    tools/
        __init__.py
        tool_function.py
```

---

## 6. Our Local Implementation

### 6.1 Current Agent Structure

**Python Agent** (`agents/hello_agent/agent.py`):
```python
from google.adk.agents import Agent

root_agent = Agent(
    name="hello_agent",
    model="gemini-2.0-flash-exp",
    description="A friendly assistant that helps answer questions.",
    instruction="""You are a helpful, friendly assistant.

Your primary goals are:
1. Answer questions clearly and concisely
2. Be helpful and informative
3. If you don't know something, say so honestly

Always be polite and professional in your responses.""",
)
```

### 6.2 Visual Builder Start Script

Our `start_visual_builder.sh` configuration:

```bash
# Key settings
VENV_PATH="$HOME/adk-workshop"      # Virtual environment location
ADK_PORT=8000                        # Visual Builder port
AGENTS_DIR="$SCRIPT_DIR/agents"      # Agent definitions directory

# Start command
adk web --port $ADK_PORT "$AGENTS_DIR"
```

**Management Commands**:
```bash
# Start Visual Builder
./start_visual_builder.sh

# Stop Visual Builder
./stop_visual_builder.sh

# Restart Visual Builder
./restart_visual_builder.sh

# View logs
tail -f adk-builder.log
```

### 6.3 Port Allocation

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 4000 | http://localhost:4000 |
| FastAPI Backend | 8080 | http://localhost:8080 |
| ADK Visual Builder | 8000 | http://localhost:8000/dev-ui |
| PostgreSQL | 5433 | localhost:5433 |

---

## 7. Best Practices

### 7.1 Agent Design
1. Keep instructions clear and specific
2. Use meaningful names for agents and tools
3. Leverage `output_key` for inter-agent communication
4. Implement callbacks for guardrails and logging

### 7.2 Tool Development
1. Use comprehensive docstrings (LLM reads them)
2. Return dictionaries with `status` field
3. Keep parameter counts minimal
4. Use simple data types

### 7.3 Multi-Agent Systems
1. Start simple, add complexity as needed
2. Use SequentialAgent for linear workflows
3. Use ParallelAgent for independent tasks
4. Use state for communication between agents

### 7.4 Security
1. Implement `before_model_callback` for input validation
2. Use `before_tool_callback` for permission checks
3. Never expose sensitive data in agent instructions
4. Log all tool executions for audit trails

---

## 8. Troubleshooting

### 8.1 Common Issues

**"No root_agent found" Error**:
```
ValueError: No root_agent found for 'agent_name'.
```
- Ensure `agent.py` exports a `root_agent` variable
- Or ensure `root_agent.yaml` exists in the agent directory
- Check directory structure matches expected pattern

**Port Already in Use**:
```
Port 8000 is already in use!
```
- Run `./stop_visual_builder.sh` first
- Or check for stale processes: `lsof -i :8000`

**GOOGLE_API_KEY Not Found**:
- Ensure `.env` file exists in project root
- Verify `GOOGLE_API_KEY` is set correctly
- Check that `.env` is being loaded by the start script

### 8.2 Log Locations

- Visual Builder logs: `./adk-builder.log`
- PID file: `./.adk-builder.pid`

---

## 9. Resources

### Official Documentation
- [ADK Official Documentation](https://google.github.io/adk-docs/)
- [ADK Python GitHub Repository](https://github.com/google/adk-python)
- [ADK Web GitHub Repository](https://github.com/google/adk-web)
- [Google Cloud ADK Overview](https://cloud.google.com/products/agent-development-kit)

### Specific Guides
- [Visual Builder Documentation](https://google.github.io/adk-docs/get-started/quickstart-visual-builder/)
- [Agent Configuration Reference](https://google.github.io/adk-docs/agents/)
- [Function Tools Guide](https://google.github.io/adk-docs/tools/function-tools/)
- [Multi-Agent Systems Guide](https://google.github.io/adk-docs/agents/multi-agents/)
- [Callbacks Documentation](https://google.github.io/adk-docs/callbacks/)
- [MCP Integration Guide](https://google.github.io/adk-docs/tools/mcp-tools/)

### Package Information
- [PyPI google-adk Package](https://pypi.org/project/google-adk/)

---

## Appendix A: Quick Reference

### Agent Creation Checklist

- [ ] Create directory: `agents/<agent_name>/`
- [ ] Create `agent.py` with `root_agent` variable OR `root_agent.yaml`
- [ ] If Python: create `__init__.py` exporting `root_agent`
- [ ] Define `name`, `model`, `description`, `instruction`
- [ ] Add tools if needed
- [ ] Restart Visual Builder to detect new agent

### Minimal Python Agent Template

```python
# agents/my_agent/agent.py
from google.adk.agents import Agent

root_agent = Agent(
    name="my_agent",
    model="gemini-2.0-flash-exp",
    description="Brief description for multi-agent delegation",
    instruction="""Detailed instructions for the agent.

    Be specific about:
    - What the agent should do
    - How it should respond
    - Any constraints or guidelines
    """
)
```

### Minimal YAML Agent Template

```yaml
# agents/my_agent/root_agent.yaml
name: my_agent
model: gemini-2.0-flash-exp
agent_class: LlmAgent
description: Brief description for multi-agent delegation
instruction: |
  Detailed instructions for the agent.

  Be specific about:
  - What the agent should do
  - How it should respond
  - Any constraints or guidelines
tools: []
sub_agents: []
```
