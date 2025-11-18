# ADK Quickstart Guide

## What is Google ADK?

The Agent Development Kit (ADK) is Google's open-source framework for building production-ready AI agents. Released at Google Cloud NEXT 2025, it's the same tooling Google uses internally for products like Agentspace.

## Core Concepts

### Agents
An agent is an autonomous program that uses an LLM to understand requests, make decisions, and take actions to accomplish tasks.

### Tools
Tools are functions that agents can call to interact with external systems (APIs, databases, search engines, etc.).

### Models
ADK supports various Gemini models:
- `gemini-2.5-flash` - Fast, efficient for most tasks
- `gemini-2.5-pro` - More capable for complex reasoning
- `gemini-2.5-pro-exp` - Experimental features

## Basic Agent Structure

```python
from google.adk.agents import Agent
from google.adk.tools import google_search

agent = Agent(
    name="agent_name",           # Unique identifier
    model="gemini-2.5-flash",    # LLM to use
    instruction="...",            # System prompt
    description="...",            # What the agent does
    tools=[...]                   # Available tools
)
```

## Your First Agent: Hello World

```python
from google.adk.agents import Agent

# Create a simple conversational agent
hello_agent = Agent(
    name="hello_assistant",
    model="gemini-2.5-flash",
    instruction="You are a friendly assistant. Greet users warmly and answer their questions.",
    description="A simple greeting agent"
)

# Run interactively
if __name__ == "__main__":
    hello_agent.run()
```

## Adding Tools

```python
from google.adk.agents import Agent
from google.adk.tools import google_search, calculator

# Agent with multiple tools
research_agent = Agent(
    name="research_assistant",
    model="gemini-2.5-flash",
    instruction="""You are a research assistant. Use Google Search to find
    current information and the calculator for any computations needed.""",
    description="Research agent with search and calculation capabilities",
    tools=[google_search, calculator]
)
```

## Running Your Agent

### Method 1: CLI
```bash
adk run
```

### Method 2: Web UI
```bash
# Terminal 1
adk api_server --allow_origins=http://localhost:4200

# Terminal 2
cd frontend/adk-web
npm run serve --backend=http://localhost:8000

# Open browser to http://localhost:4200
```

### Method 3: Programmatic
```python
response = agent.query("What is the weather today?")
print(response)
```

## Multi-Agent Systems

Create teams of specialized agents:

```python
from google.adk.agents import Agent

# Researcher agent
researcher = Agent(
    name="researcher",
    model="gemini-2.5-flash",
    instruction="Research topics thoroughly using available tools",
    tools=[google_search]
)

# Writer agent
writer = Agent(
    name="writer",
    model="gemini-2.5-pro",
    instruction="Write clear, engaging content based on research"
)

# Coordinator agent
coordinator = Agent(
    name="coordinator",
    model="gemini-2.5-flash",
    instruction="Coordinate between researcher and writer agents",
    agents=[researcher, writer]
)
```

## Best Practices

1. **Clear Instructions**: Give agents specific, actionable instructions
2. **Right Tools**: Only include tools the agent needs
3. **Model Selection**: Use faster models unless complex reasoning is required
4. **Testing**: Test agents thoroughly before deployment
5. **Observability**: Use logging and tracing in production

## Common Patterns

### Sequential Processing
```python
# Agent 1 processes, passes to Agent 2
input → Agent A → intermediate → Agent B → output
```

### Parallel Processing
```python
# Multiple agents work simultaneously
input → [Agent A, Agent B, Agent C] → combine results → output
```

### Hierarchical
```python
# Manager delegates to specialized workers
input → Manager → [Worker A, Worker B] → Manager → output
```

## Debugging Tips

1. Use the Web UI to visualize agent decisions
2. Check the Events tab for execution traces
3. Review tool calls in the Artifacts section
4. Use evaluation frameworks to test agent quality
5. Enable verbose logging for detailed output

## Environment Variables

```bash
# Required
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Optional
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
export ADK_LOG_LEVEL="DEBUG"
```

## Next Steps

1. Build the example agents in `examples/`
2. Complete exercises in `exercises/`
3. Explore sample applications: https://github.com/google/adk-samples
4. Read full documentation: https://google.github.io/adk-docs/

## Common Issues

**Import Error**: Ensure virtual environment is activated
```bash
source adk-workshop/bin/activate
```

**Authentication Error**: Run gcloud auth
```bash
gcloud auth application-default login
```

**API Server Won't Start**: Check if port 8000 is already in use
```bash
lsof -i :8000
```

## Additional Resources

- API Reference: https://google.github.io/adk-docs/api/
- Tool Catalog: https://google.github.io/adk-docs/components/tools/
- Community Examples: https://github.com/google/adk-python-community
