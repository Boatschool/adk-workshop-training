# Google ADK Quick Reference Cheat Sheet

## Visual Agent Builder Basics

### Launch Visual Builder
```bash
source ~/adk-workshop/bin/activate
adk web
# Open: http://localhost:8000/dev-ui
```

### Interface Layout
```
┌─────────────┬──────────────────────┬─────────────────┐
│   Agent     │                      │  Configuration  │
│   Library   │      Canvas          │     Panel       │
│   (Tools)   │   (Drag & Drop)      │   (Settings)    │
│             │                      │                 │
└─────────────┴──────────────────────┴─────────────────┘
                  Testing Console
```

### Create New Agent
1. Click "New Agent"
2. Choose template or start blank
3. Configure properties
4. Test and iterate
5. Export when ready

---

## Agent Configuration

### Essential Properties
```yaml
name: "agent_name"              # Unique identifier
model: "gemini-2.5-flash"       # AI model to use
instruction: "System prompt"    # What the agent does
description: "Brief summary"    # Agent purpose
tools: []                       # List of tools
agents: []                      # Sub-agents (for multi-agent)
```

### Model Selection
| Model | Speed | Capability | Use Case |
|-------|-------|------------|----------|
| gemini-2.5-flash | Fast | Good | Simple tasks, FAQ |
| gemini-2.5-pro | Medium | Better | Complex reasoning |
| gemini-2.5-pro-exp | Medium | Experimental | Cutting edge features |

**Rule of thumb:** Start with flash, upgrade to pro if needed.

---

## Writing Good Instructions

### Template
```
You are a [ROLE] for [ORGANIZATION].

Your responsibilities:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

Guidelines:
- [Guideline 1]
- [Guideline 2]
- [Guideline 3]

[Any specific knowledge or constraints]
```

### Example
```
You are a helpful HR assistant for a healthcare organization.

Your responsibilities:
- Answer questions about benefits and policies
- Direct employees to appropriate resources
- Provide accurate, up-to-date information

Guidelines:
- Be friendly and professional
- If you don't know, say so and provide contact info
- Never make up policy information
- Keep responses concise

IMPORTANT: Do not process any employee personal information.
```

### Best Practices
✅ **DO:**
- Be specific about role and responsibilities
- Include examples of expected behavior
- Set clear boundaries
- Specify tone and style
- Include safety guidelines

❌ **DON'T:**
- Be vague ("help users")
- Include contradictory instructions
- Overwhelm with too many rules
- Forget to test

---

## Tools

### Built-in Tools (Common)
```python
from google.adk.tools import (
    google_search,      # Web search
    calculator,         # Math operations
    # More tools in official docs
)
```

### Custom Tool Template
```python
from google.adk.tools import FunctionTool

def my_custom_tool(param1: str, param2: int) -> dict:
    """
    Brief description of what this tool does.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Dictionary with results
    """
    # Your logic here
    return {"result": "value"}

# Convert function to tool
my_tool = FunctionTool(my_custom_tool)
```

### Tool Best Practices
- Clear function names
- Detailed docstrings (agent reads these!)
- Type hints for parameters
- Return structured data (dict/list)
- Handle errors gracefully

---

## Multi-Agent Patterns

### Sequential (Pipeline)
```python
coordinator = Agent(
    name="coordinator",
    agents=[agent_a, agent_b, agent_c]  # Run in order
)
```
**Use for:** Step-by-step processing

### Parallel
```python
coordinator = Agent(
    name="coordinator",
    agents=[agent_a, agent_b, agent_c]  # Run simultaneously
    # Configure parallel in Visual Builder
)
```
**Use for:** Independent tasks

### Hierarchical
```python
manager = Agent(
    name="manager",
    agents=[worker_1, worker_2]  # Manager delegates
)
```
**Use for:** Complex coordination

---

## Testing

### Test Console Features
- **Conversation:** Chat with your agent
- **Events:** See decision-making process
- **Artifacts:** View created files/data
- **Metrics:** Response time, tokens used

### Good Test Cases
```
# Normal case
"What are the office hours?"

# Edge case
"What happens if I'm late on my first day?"

# Error case
"[Intentionally vague or impossible request]"

# Multi-step
"I need to enroll in HIPAA training next week"
```

### Debugging Checklist
- [ ] Read the event log
- [ ] Check tool calls (right tool used?)
- [ ] Review agent reasoning
- [ ] Verify tool outputs
- [ ] Check for errors in console
- [ ] Test with different phrasings

---

## Common Commands

### Setup & Installation
```bash
# Create virtual environment
python3 -m venv adk-workshop
source adk-workshop/bin/activate  # Mac/Linux
# adk-workshop\Scripts\activate   # Windows

# Install ADK
pip install --upgrade google-adk

# Verify
python -c "import google.adk; print(google.adk.__version__)"
```

### Running Agents

**Method 1: CLI**
```bash
adk run
```

**Method 2: Visual Builder**
```bash
adk web
# Then test in browser
```

**Method 3: Python**
```python
response = agent.query("Your question here")
print(response)
```

**Method 4: API Server**
```bash
adk api_server --allow_origins=http://localhost:4200
```

---

## Export Options

### YAML Configuration
```yaml
name: my_agent
model: gemini-2.5-flash
instruction: |
  You are a helpful assistant...
tools:
  - google_search
```
**Use for:** Version control, deployment

### Python Code
```python
from google.adk.agents import Agent

agent = Agent(
    name="my_agent",
    model="gemini-2.5-flash",
    instruction="You are a helpful assistant..."
)
```
**Use for:** Customization, integration

### JSON (API format)
```json
{
  "name": "my_agent",
  "model": "gemini-2.5-flash",
  "instruction": "You are a helpful assistant..."
}
```
**Use for:** REST API, external systems

---

## Troubleshooting

### Issue: Visual Builder won't load
```bash
# Check if port is in use
lsof -i :8000

# Try different port
adk web --port 8001
```

### Issue: Import errors
```bash
# Ensure virtual environment is activated
which python  # Should show venv path

# Reinstall ADK
pip uninstall google-adk
pip install google-adk
```

### Issue: Authentication errors
```bash
# Set project
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Re-authenticate
gcloud auth application-default login
```

### Issue: Agent gives wrong answers
- ✅ Make instructions more specific
- ✅ Add examples of correct behavior
- ✅ Test with different questions
- ✅ Check if agent is using tools correctly

### Issue: Tools not working
- ✅ Verify tool is in tools list
- ✅ Check function signature
- ✅ Review docstring (agent reads this)
- ✅ Test tool independently
- ✅ Check tool outputs in event log

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New agent |
| Ctrl/Cmd + S | Save |
| Ctrl/Cmd + T | Test console |
| Ctrl/Cmd + E | Export |
| Delete | Remove selected |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y | Redo |

---

## Environment Variables

```bash
# Required
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Optional
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
export ADK_LOG_LEVEL="DEBUG"  # For verbose logging
```

---

## Healthcare Use Case Examples

### Non-Clinical Only (No PHI/PII)

**Administrative:**
- HR FAQ bot
- Meeting room scheduler
- Benefits enrollment helper
- Onboarding assistant

**Facilities:**
- Maintenance request router
- Supply ordering
- Equipment scheduling

**Communications:**
- Newsletter creator
- Announcement writer
- Event planner

**Training:**
- Course catalog search
- Enrollment assistant
- Certificate generator

---

## Resources

### Official Documentation
- **ADK Docs:** https://google.github.io/adk-docs/
- **API Reference:** https://google.github.io/adk-docs/api/
- **Tool Catalog:** https://google.github.io/adk-docs/components/tools/

### Code & Examples
- **GitHub:** https://github.com/google/adk-python
- **Samples:** https://github.com/google/adk-samples
- **Community:** https://github.com/google/adk-python-community

### Tutorials
- **DataCamp:** https://www.datacamp.com/tutorial/google-adk-visual-agent-builder-tutorial-with-demo-project
- **Medium:** Search "Google ADK Visual Agent Builder"

### Getting Help
1. Check official documentation
2. Review workshop materials
3. Search GitHub issues
4. Ask in community forums
5. Contact workshop instructor

---

## Quick Tips

💡 **Start simple** - One agent, clear task, then expand

💡 **Test frequently** - Don't build everything before testing

💡 **Use the AI Assistant** - In Visual Builder, describe what you want

💡 **Read the event log** - Understand how your agent thinks

💡 **Iterate** - First version won't be perfect, that's OK

💡 **Document** - Export and save configurations regularly

💡 **Share** - Get feedback from colleagues

💡 **Stay focused** - One use case at a time

---

**Print this and keep it handy during the workshop!**

**Version:** 1.0 | **Updated:** 2024-11-18
