# ADK Visual Agent Builder Training Guide

This guide teaches you how to use Google's ADK Visual Agent Builder to create, edit, and test AI agents without writing code.

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Creating Your First Agent](#2-creating-your-first-agent)
3. [Using the AI Assistant](#3-using-the-ai-assistant)
4. [Editing Existing Agents](#4-editing-existing-agents)
5. [Workshop Exercises](#5-workshop-exercises)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Getting Started

### Accessing the Visual Builder

1. Start the Visual Builder:
   ```bash
   ./start_visual_builder.sh
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/dev-ui
   ```

3. You should see the Visual Builder interface with your agents listed on the left.

### Browser Cache Warning

If you don't see the Visual Builder features (like the "+" button or pencil icons), perform a hard refresh:
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

This clears cached JavaScript files from older ADK versions.

### Understanding the Interface

The Visual Builder has three main panels:

| Panel | Location | Purpose |
|-------|----------|---------|
| **Agent List & Config Editor** | Left | Browse agents, edit properties |
| **Agent Canvas** | Center | Visual workflow design, agent hierarchy |
| **AI Assistant** | Right | Natural language agent building |

### Available Sample Agents

Your training environment includes these sample agents:

| Agent | Type | Description |
|-------|------|-------------|
| `hello_agent` | Python | Simple greeting agent (read-only in Visual Builder) |
| `starter_agent` | YAML | Basic template for learning |
| `faq_agent` | YAML | HR FAQ assistant with knowledge base |
| `scheduler_agent` | YAML | Meeting room booking assistant |
| `router_agent` | YAML | Multi-agent facilities ticketing system |
| `npi_lookup` | YAML | Healthcare NPI lookup agent |
| `tenant_creation` | YAML | Multi-tenant creation workflow |

---

## 2. Creating Your First Agent

### Step 1: Click the "+" Button

In the Visual Builder interface, look for the **"+"** button (usually in the top-left or near the agent list).

### Step 2: Name Your Agent

Enter a name for your new agent. Use lowercase letters and underscores:
- Good: `customer_support`, `data_analyzer`
- Avoid: `Customer Support`, `DataAnalyzer`

### Step 3: Configure Basic Properties

| Property | Description | Example |
|----------|-------------|---------|
| **Name** | Unique identifier | `my_first_agent` |
| **Model** | LLM to use | `gemini-2.5-flash` |
| **Description** | Brief summary for delegation | "Answers customer questions" |
| **Instruction** | System prompt defining behavior | See below |

### Step 4: Write Instructions

The instruction field is crucial. Be specific about:
- What the agent should do
- How it should respond
- Any constraints or guidelines

Example:
```
You are a helpful customer service agent for a healthcare organization.

Your responsibilities:
- Answer questions about our services
- Help with appointment inquiries
- Provide general information

Guidelines:
- Be friendly and professional
- If unsure, offer to connect them with a human
- Never provide medical advice
```

### Step 5: Save and Test

1. Click **Save** to create the agent
2. Use the **Chat** panel to test your agent
3. Iterate on the instructions based on responses

---

## 3. Using the AI Assistant

The AI Assistant (right panel) helps you build agents using natural language.

### How to Use It

1. Type what you want in the chat interface
2. The assistant generates agent configurations
3. Review and apply the suggestions
4. Continue iterating with follow-up requests

### Example Prompts

**Creating a new agent:**
```
Create a simple Q&A agent that answers questions about employee benefits.
It should be friendly and direct users to HR if it can't answer.
```

**Adding features:**
```
Help me add a dice roll tool to my current agent.
Use the default model if you need to configure that.
```

**Building multi-agent systems:**
```
Create a research agent that coordinates between a query refinement agent
and a search execution agent. Use a loop pattern to iterate until good
results are found.
```

**Modifying instructions:**
```
Update the agent's instruction to be more formal and include a disclaimer
about not providing medical advice.
```

### Best Practices

1. **Be specific** - Include details about behavior, tone, and constraints
2. **Iterate** - Start simple and add complexity through conversation
3. **Review changes** - Always verify generated configurations before saving
4. **Test frequently** - Use the chat to validate each change

---

## 4. Editing Existing Agents

### Which Agents Can Be Edited?

| Agent Type | Source | Editable in Visual Builder? |
|------------|--------|----------------------------|
| YAML-based | `root_agent.yaml` | Yes |
| Python-based | `agent.py` | No (read-only) |

### How to Edit

1. **Select** the agent from the list (left panel)
2. **Click** the pencil icon to enter edit mode
3. **Modify** properties in the configuration editor
4. **Save** your changes

### Editing Properties

**Basic Properties:**
- Name and description
- Model selection
- Instructions (system prompt)

**Advanced Properties:**
- Tools configuration
- Sub-agents (for multi-agent workflows)
- Callbacks (before/after hooks)

### Adding Sub-Agents

To create a multi-agent workflow:

1. Edit the parent agent
2. In the "Sub-Agents" section, add references:
   ```yaml
   sub_agents:
     - config_path: ./sub_agent_1.yaml
     - config_path: ./sub_agent_2.yaml
   ```
3. Create the referenced YAML files in the same directory

---

## 5. Workshop Exercises

### Exercise 1: Create a Simple Q&A Agent

**Goal:** Build a basic FAQ agent using the AI Assistant.

**Steps:**
1. Open the Visual Builder
2. In the AI Assistant panel, type:
   ```
   Create a simple FAQ agent that answers questions about a company's
   return policy. The policy allows returns within 30 days with receipt,
   14 days without receipt, and no returns on sale items.
   ```
3. Review the generated configuration
4. Test the agent with questions like:
   - "Can I return something after 3 weeks?"
   - "I lost my receipt, can I still return?"
   - "What about items I bought on sale?"

**Success Criteria:** Agent correctly answers based on the policy rules.

---

### Exercise 2: Add a Sub-Agent Workflow

**Goal:** Extend the `starter_agent` with a sub-agent.

**Steps:**
1. Select `starter_agent` in the Visual Builder
2. Ask the AI Assistant:
   ```
   Add a sub-agent called "fact_checker" that verifies information
   before the main agent responds. The fact checker should be thorough
   but concise.
   ```
3. Review the generated sub-agent configuration
4. Test the workflow with fact-based questions

**Success Criteria:** Responses show evidence of the two-agent workflow.

---

### Exercise 3: Configure Agent Callbacks

**Goal:** Add a callback to log all interactions.

**Steps:**
1. Select any YAML agent
2. Ask the AI Assistant:
   ```
   Add a before_model_callback that logs the user's input, and an
   after_model_callback that logs the agent's response. These should
   help with debugging and auditing.
   ```
3. Review the callback configuration
4. Test and observe logging behavior

**Success Criteria:** Callbacks are configured (note: actual logging requires Python implementation).

---

### Exercise 4: Build a Multi-Agent Pipeline

**Goal:** Create a complete multi-agent system from scratch.

**Scenario:** Build a "Content Review Pipeline" with three agents:
1. **Writer Agent** - Drafts content based on a topic
2. **Editor Agent** - Reviews and improves the draft
3. **Publisher Agent** - Formats and finalizes the content

**Steps:**
1. Ask the AI Assistant to create the pipeline:
   ```
   Create a content review pipeline with three agents:
   1. A writer agent that creates draft content from a topic
   2. An editor agent that reviews and improves the draft
   3. A publisher agent that formats the final output

   Use a sequential workflow where each agent passes output to the next.
   Use output_key to share state between agents.
   ```

2. Review the generated configuration
3. Test with a prompt like: "Write a short article about healthy eating"
4. Observe how content flows through the pipeline

**Success Criteria:**
- Three agents created with proper hierarchy
- Content improves through each stage
- Final output is well-formatted

---

## 6. Troubleshooting

### Common Issues

#### "No agents appear in the list"

**Cause:** Agents not in correct directory or missing `root_agent.yaml`

**Solution:**
1. Verify agents are in `/agents/<agent_name>/` directory
2. Each agent folder needs `root_agent.yaml` or `agent.py`
3. Restart the Visual Builder: `./restart_visual_builder.sh`

---

#### "Visual Builder UI looks different/missing features"

**Cause:** Cached old JavaScript files

**Solution:** Hard refresh your browser:
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

---

#### "Cannot edit agent (no pencil icon)"

**Cause:** Trying to edit a Python-based agent

**Solution:** Python agents (`agent.py`) are read-only in Visual Builder. Either:
- Edit the Python file directly in your code editor
- Create a new YAML-based agent using the "+" button

---

#### "Agent not responding in chat"

**Cause:** Usually API key or model issues

**Solution:**
1. Verify `GOOGLE_API_KEY` is set in `.env`
2. Check the model name is valid (e.g., `gemini-2.5-flash`)
3. Check terminal for error messages
4. Try restarting: `./restart_visual_builder.sh`

---

#### "Changes not saving"

**Cause:** File permission or configuration error

**Solution:**
1. Check terminal for error messages
2. Verify the agents directory is writable
3. Ensure YAML syntax is valid

---

### Getting Help

- **ADK Documentation:** https://google.github.io/adk-docs/
- **Visual Builder Guide:** https://google.github.io/adk-docs/visual-builder/
- **ADK GitHub:** https://github.com/google/adk-python

---

## Quick Reference

### Supported Agent Types

| Type | Use Case |
|------|----------|
| `LlmAgent` | AI-powered conversational agents |
| `SequentialAgent` | Execute sub-agents in order |
| `ParallelAgent` | Execute sub-agents concurrently |
| `LoopAgent` | Repeat until condition met |

### Built-in Tools

| Tool | Description |
|------|-------------|
| `google_search` | Web search (Gemini 2+ only) |
| `exit_loop` | Exit from LoopAgent |
| `load_artifacts` | Load stored artifacts |
| `url_context` | Fetch URL content |

### Recommended Models

| Model | Best For |
|-------|----------|
| `gemini-2.5-flash` | Fast responses, cost-effective |
| `gemini-2.5-pro` | Complex reasoning |
| `gemini-2.0-flash-exp` | Experimental features |

---

## Next Steps

After completing these exercises:

1. **Explore the sample agents** - Study `router_agent` for multi-agent patterns
2. **Build your own** - Create agents for your specific use cases
3. **Add tools** - Extend agents with custom Python functions
4. **Deploy** - Learn about deploying agents to production

Happy agent building!
