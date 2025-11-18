# Visual Agent Builder Guide for Healthcare Professionals

## Introduction

Welcome to the Google ADK Visual Agent Builder! This guide is designed for healthcare professionals who want to build AI agents for non-clinical use cases without extensive coding knowledge.

## What is the Visual Agent Builder?

The Visual Agent Builder is a browser-based interface that lets you design, configure, and test AI agents using:
- **Drag-and-drop canvas** - Visually arrange your agents
- **Natural language configuration** - Describe what you want in plain English
- **Gemini-powered AI** - AI assistance to generate agent configurations
- **Built-in testing** - Test your agents immediately
- **Export to code** - Download production-ready configurations

## Getting Started

### 1. Launch the Visual Builder

```bash
# Activate your virtual environment
source ~/adk-workshop/bin/activate

# Start the Visual Builder
adk web

# Open your browser to: http://localhost:8000/dev-ui
```

### 2. Visual Builder Interface

The interface has four main sections:

**Left Panel - Agent Library**
- Pre-built agent templates
- Your saved agents
- Tool catalog

**Center Canvas**
- Drag agents here
- Connect agents visually
- See the workflow flow

**Right Panel - Configuration**
- Agent properties
- Instructions/prompts
- Tool assignments
- Model selection

**Bottom Panel - Testing Console**
- Chat with your agent
- View execution logs
- Debug issues

## Building Your First Agent

### Step 1: Create a New Agent

1. Click **"New Agent"** button
2. Choose a template or start from scratch
3. Name your agent (e.g., "appointment_scheduler")

### Step 2: Configure with Natural Language

In the configuration panel, you can describe what you want:

**Example Conversation with AI Assistant:**
```
You: "I need an agent that helps schedule meetings by checking calendar availability"

AI: I'll create an appointment scheduling agent. Would you like me to:
- Add Google Calendar integration?
- Include email notifications?
- Handle timezone conversions?

You: "Yes to all three"

AI: [Generates configuration automatically]
```

The AI will create:
- Agent instructions (system prompt)
- Tool selections
- Model recommendations
- Example test cases

### Step 3: Manual Configuration (Alternative)

If you prefer manual configuration:

**Agent Name:** `appointment_scheduler`

**Model:** `gemini-2.5-flash` (fast, efficient)

**Instructions:**
```
You are a professional appointment scheduling assistant for a healthcare
organization. You help staff schedule meetings, check availability, and
send calendar invitations. Always be courteous and confirm details before
booking.
```

**Tools:**
- Google Calendar API
- Email sender
- Timezone converter

### Step 4: Test Your Agent

1. Click **"Test"** tab at bottom
2. Type a message: "Schedule a team meeting for next Tuesday at 2pm"
3. Watch the agent:
   - Understand the request
   - Check calendar availability
   - Propose time slots
   - Confirm and create event

### Step 5: Export

1. Click **"Export"** button
2. Choose format:
   - YAML (configuration file)
   - Python (code)
   - JSON (API format)
3. Save to your project

## Agent Types

### 1. Simple Agent
Single agent that handles one type of task.

**Visual Representation:**
```
[User Input] → [Agent] → [Output]
```

**Use Cases:**
- FAQ responder
- Form filler
- Data validator

### 2. Sequential Agent
Multiple agents work in sequence, each handling a step.

**Visual Representation:**
```
[User Input] → [Agent 1] → [Agent 2] → [Agent 3] → [Output]
```

**Use Cases:**
- Document processing: Extract → Validate → Summarize
- Onboarding: Collect info → Verify → Create accounts
- Report generation: Gather data → Analyze → Format

### 3. Parallel Agent
Multiple agents work simultaneously, results are combined.

**Visual Representation:**
```
                 ┌─ [Agent 1] ─┐
[User Input] ──┼─ [Agent 2] ─┼─→ [Combine] → [Output]
                 └─ [Agent 3] ─┘
```

**Use Cases:**
- Multi-source research
- Batch processing
- Validation checks

### 4. Loop Agent
Agent repeats until condition is met.

**Visual Representation:**
```
[User Input] → [Agent] ⟲ (until done) → [Output]
```

**Use Cases:**
- Iterative improvement
- Multi-step workflows
- Quality checking

## Visual Builder Features

### Drag-and-Drop Canvas

**To Add an Agent:**
1. Find agent in library (left panel)
2. Drag onto canvas
3. Position where you want

**To Connect Agents:**
1. Click output port of first agent
2. Drag to input port of second agent
3. Line appears showing connection

**To Configure Agent:**
1. Click agent on canvas
2. Right panel shows properties
3. Edit as needed

### AI-Assisted Configuration

Click the **AI Assistant** button and describe what you need:

**Examples:**

"Create an agent that monitors our facilities inbox and categorizes emails by urgency"

"Build a workflow that extracts data from PDF reports, validates the numbers, and generates a summary"

"Make an agent that helps employees find and book conference rooms"

The AI will:
- Suggest agent architecture
- Recommend tools
- Generate instructions
- Create test scenarios

### Tool Selection

Tools extend what your agent can do. Common tools for healthcare non-clinical use:

**Communication Tools:**
- Email sender/reader
- Calendar integration
- Slack/Teams messaging
- SMS notifications

**Data Tools:**
- Spreadsheet reader/writer
- Database queries
- File upload/download
- PDF processing

**Web Tools:**
- Google Search
- Website scraper
- Form submitter
- API caller

**Utility Tools:**
- Calculator
- Date/time handler
- Text formatter
- Translator

### Testing Console

The testing console shows:

**Conversation View:**
- Your messages
- Agent responses
- Clear chat history

**Event Log:**
- Step-by-step execution
- Tool calls made
- Decisions taken
- Errors encountered

**Artifacts:**
- Files created
- Data extracted
- Intermediate results

**Performance Metrics:**
- Response time
- Tokens used
- API calls made
- Success/failure rate

## Best Practices

### 1. Start Simple
- Begin with single-agent workflows
- Add complexity gradually
- Test each component

### 2. Clear Instructions
Good: "You are an appointment scheduler. Check calendar availability before suggesting times. Always confirm timezone with the user."

Bad: "Help with scheduling"

### 3. Right Tools for the Job
- Only add tools the agent needs
- Too many tools = confusion
- Test tool integration separately

### 4. Test Thoroughly
- Try normal cases
- Try edge cases
- Try error scenarios
- Test with real users

### 5. Iterate
- Start with prototype
- Get feedback
- Refine instructions
- Add features incrementally

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New agent |
| Ctrl/Cmd + S | Save configuration |
| Ctrl/Cmd + T | Open test console |
| Ctrl/Cmd + E | Export |
| Delete | Remove selected agent |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y | Redo |

## Troubleshooting

### Agent doesn't respond
- Check model is selected
- Verify API credentials
- Check test console for errors

### Tools not working
- Verify tool configuration
- Check API keys/permissions
- Test tool independently

### Connections not working
- Ensure output types match input types
- Check agent order in sequence
- Verify loop conditions

### Export fails
- Save configuration first
- Check for validation errors
- Try different export format

## Example Workflow: Building a Meeting Scheduler

**Step 1:** Start new agent
- Click "New Agent"
- Name: "meeting_scheduler"

**Step 2:** Use AI Assistant
- Click AI Assistant
- Say: "Create an agent that schedules team meetings by checking Google Calendar availability and sending invites"

**Step 3:** Review Generated Config
- Instructions: Auto-generated
- Tools: Google Calendar, Email
- Model: gemini-2.5-flash

**Step 4:** Customize
- Edit instructions for your organization's policies
- Add specific working hours
- Include meeting room preferences

**Step 5:** Test
- "Schedule a 1-hour meeting with John and Mary next week"
- Review proposed times
- Confirm booking works

**Step 6:** Deploy
- Export as YAML
- Save to version control
- Deploy to production

## Healthcare Non-Clinical Use Cases

Here are scenarios perfect for the Visual Builder:

1. **Meeting & Resource Management**
   - Conference room booking
   - Equipment scheduling
   - Cafeteria reservations

2. **HR & Administration**
   - Employee onboarding
   - Timesheet processing
   - Leave request handling

3. **Facilities & Operations**
   - Maintenance request routing
   - Inventory tracking
   - Supply ordering

4. **Communications**
   - Email triage
   - Announcement distribution
   - Newsletter generation

5. **Training & Education**
   - Course enrollment
   - Quiz generation
   - Certificate tracking

## Next Steps

1. ✅ Complete the hands-on exercises in `/exercises`
2. ✅ Build the sample agents in `/examples`
3. ✅ Create your own custom agent for your department
4. ✅ Share your agent with the team
5. ✅ Deploy to production with monitoring

## Additional Resources

- **Official Docs:** https://google.github.io/adk-docs/
- **Visual Builder Tutorial:** https://www.datacamp.com/tutorial/google-adk-visual-agent-builder-tutorial-with-demo-project
- **Tool Catalog:** https://google.github.io/adk-docs/components/tools/
- **Community Examples:** https://github.com/google/adk-python-community

## Questions?

During the workshop, feel free to:
- Ask the instructor
- Check the Resources folder
- Post in workshop chat
- Experiment in the Visual Builder

Remember: The best way to learn is by building! Don't be afraid to experiment and break things in the test environment.
