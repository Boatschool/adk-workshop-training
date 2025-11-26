# Archived: Non-ADK v1.18.0 Compliant Code

**Archived Date:** 2025-11-24

## Why This Code Was Archived

This directory contains agent-related code that was **not compliant with Google ADK v1.18.0** and would not work correctly. The code has been preserved for reference but should not be used.

## Contents

### `src_agents/` (formerly `src/agents/`)

A custom Python framework that attempted to wrap Google ADK but used incorrect APIs:

| File | Issue |
|------|-------|
| `runner.py` | Uses `agent.generate()` and `agent.invoke()` which don't exist in ADK v1.18.0. ADK requires `InMemoryRunner.run()` |
| `templates/router_agent.py` | Uses `agents=[...]` parameter instead of correct `sub_agents=[...]` |
| `base.py` | Custom `AgentConfig` class conflicts with ADK patterns |
| `registry.py` | Custom registry duplicates ADK Visual Builder functionality |

### `examples/` (formerly `examples/`)

Standalone Python scripts with similar issues:

| File | Issue |
|------|-------|
| `01-simple-faq-agent.py` | Uses `agent.run()` which doesn't exist in ADK |
| `02-meeting-room-scheduler.py` | Uses `agent.run()` which doesn't exist in ADK |
| `03-facilities-ticket-router.py` | Uses `agents=[...]` instead of `sub_agents=[...]`, uses `agent.run()` |

### `test_agents/` (formerly `tests/unit/test_agents/`)

Unit tests for the non-compliant framework.

## Correct ADK v1.18.0 Patterns

### Running Agents

```python
# WRONG (what this archived code did):
agent.run()
agent.generate(message)
agent.invoke(message)

# CORRECT (ADK v1.18.0):
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
runner = InMemoryRunner(
    agent=my_agent,
    app_name="my_app",
    session_service=session_service
)
result = await runner.run(
    user_id="user1",
    session_id="session1",
    new_message=message
)
```

### Multi-Agent Systems

```python
# WRONG (what this archived code did):
Agent(..., agents=[sub1, sub2])

# CORRECT (ADK v1.18.0):
Agent(..., sub_agents=[sub1, sub2])
```

## What To Use Instead

1. **Visual Builder** - http://localhost:8000/dev-ui
   - Create and test agents visually
   - Generates ADK v1.18.0 compliant YAML configs
   - Start with: `./start_visual_builder.sh`

2. **YAML Agent Configs** - `agents/` directory
   - Pre-built compliant agents in `agents/<name>/root_agent.yaml`
   - Proper structure for Visual Builder discovery

3. **Direct ADK Integration**
   - Use `InMemoryRunner` for programmatic execution
   - Follow patterns in ADK documentation: https://google.github.io/adk-docs/

## References

- [ADK Visual Builder Docs](https://google.github.io/adk-docs/visual-builder/)
- [ADK Agent Config Docs](https://google.github.io/adk-docs/agents/config/)
- [ADK v1.18.0 Release Notes](https://github.com/google/adk-python/releases/tag/v1.18.0)
