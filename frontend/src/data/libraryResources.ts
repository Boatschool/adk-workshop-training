import type { LibraryResource } from '@/types/models'

/**
 * Mock library resources data
 * Mix of external links and embedded content for agent development learning
 */
export const libraryResources: LibraryResource[] = [
  // Featured Resources
  {
    id: 'google-adk-docs',
    title: 'Google ADK Official Documentation',
    description:
      'Comprehensive documentation for Google Agent Development Kit, including API references, tutorials, and best practices for building AI agents.',
    type: 'documentation',
    source: 'external',
    externalUrl: 'https://google.github.io/adk-docs/',
    topics: ['agent-fundamentals'],
    difficulty: 'beginner',
    author: 'Google',
    featured: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'prompt-engineering-agents',
    title: 'Prompt Engineering for AI Agents',
    description:
      'Learn how to write effective instructions and prompts that make your agents more capable, reliable, and aligned with user intentions.',
    type: 'article',
    source: 'embedded',
    contentHtml: `
# Prompt Engineering for AI Agents

Effective prompt engineering is the foundation of building reliable AI agents. This guide covers the key principles and techniques for crafting prompts that lead to consistent, high-quality agent behavior.

## Core Principles

### 1. Be Specific and Unambiguous

Agents perform best when given clear, specific instructions. Avoid vague language that could be interpreted multiple ways.

**Poor:** "Help the user with their request"

**Better:** "Analyze the user's question, identify the core intent, and provide a direct answer. If clarification is needed, ask one specific follow-up question."

### 2. Define the Agent's Role and Constraints

Establish who the agent is and what boundaries it should operate within.

\`\`\`
You are a customer support agent for a software company. You can:
- Answer questions about product features
- Help troubleshoot common issues
- Escalate complex problems to human support

You should NOT:
- Make promises about future features
- Discuss pricing or contracts
- Share internal company information
\`\`\`

### 3. Provide Examples (Few-Shot Prompting)

Show the agent what good responses look like.

\`\`\`
Example interaction:
User: "How do I reset my password?"
Agent: "To reset your password:
1. Click 'Forgot Password' on the login page
2. Enter your email address
3. Check your inbox for a reset link
4. Click the link and create a new password

Need help with any of these steps?"
\`\`\`

## Advanced Techniques

### Chain of Thought

For complex reasoning tasks, instruct the agent to think step-by-step.

\`\`\`
Before answering, analyze the question:
1. What is the user actually asking?
2. What information do I need to answer this?
3. What's the most helpful response format?
\`\`\`

### Output Formatting

Specify exactly how you want responses structured.

\`\`\`
Format your response as:
- **Summary**: One sentence overview
- **Details**: Bulleted list of key points
- **Next Steps**: What the user should do next
\`\`\`

## Testing Your Prompts

Always test prompts with:
- Edge cases and unusual inputs
- Adversarial attempts to break the agent
- Real user scenarios from your domain

Iterate based on failures and unexpected behaviors.
    `,
    topics: ['prompt-engineering', 'best-practices'],
    difficulty: 'intermediate',
    author: 'GraymatterLab',
    estimatedMinutes: 15,
    featured: true,
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'langchain-agents-overview',
    title: 'LangChain Agents Overview',
    description:
      'Introduction to building agents with LangChain, covering agent types, tools, and execution patterns.',
    type: 'documentation',
    source: 'external',
    externalUrl: 'https://python.langchain.com/docs/concepts/agents/',
    topics: ['agent-fundamentals', 'tools-integrations'],
    difficulty: 'intermediate',
    author: 'LangChain',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    id: 'anthropic-tool-use',
    title: 'Anthropic Tool Use Guide',
    description:
      'Official guide on implementing tool use (function calling) with Claude, including best practices and examples.',
    type: 'documentation',
    source: 'external',
    externalUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
    topics: ['tools-integrations', 'agent-fundamentals'],
    difficulty: 'intermediate',
    author: 'Anthropic',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'openai-function-calling',
    title: 'OpenAI Function Calling Guide',
    description:
      'Learn how to use function calling with OpenAI models to create agents that can interact with external tools and APIs.',
    type: 'documentation',
    source: 'external',
    externalUrl: 'https://platform.openai.com/docs/guides/function-calling',
    topics: ['tools-integrations'],
    difficulty: 'intermediate',
    author: 'OpenAI',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'agent-architecture-patterns',
    title: 'Agent Architecture Patterns',
    description:
      'Common architectural patterns for building AI agents, from simple ReAct loops to complex multi-agent systems.',
    type: 'article',
    source: 'embedded',
    contentHtml: `
# Agent Architecture Patterns

Understanding common agent architectures helps you choose the right approach for your use case. This guide covers patterns from simple to complex.

## 1. ReAct (Reasoning + Acting)

The most common agent pattern. The agent alternates between thinking and taking actions.

\`\`\`
Loop:
  1. Observe: What's the current state?
  2. Think: What should I do next?
  3. Act: Execute an action (call a tool)
  4. Repeat until task is complete
\`\`\`

**Best for:** General-purpose assistants, Q&A with tools

**Limitations:** Can get stuck in loops, limited planning

## 2. Plan-and-Execute

The agent creates a full plan upfront, then executes each step.

\`\`\`
1. Receive task
2. Create detailed plan with steps
3. Execute each step in order
4. Verify completion
\`\`\`

**Best for:** Complex multi-step tasks, workflows

**Limitations:** Plans can become outdated, less flexible

## 3. Hierarchical Agents

Multiple agents with different specializations, coordinated by a manager agent.

\`\`\`
Manager Agent
├── Research Agent (web search, data gathering)
├── Analysis Agent (data processing, insights)
└── Writer Agent (content generation, formatting)
\`\`\`

**Best for:** Complex tasks requiring diverse skills

**Limitations:** Higher latency, coordination overhead

## 4. Reflexion

Agent reflects on its actions and improves over multiple attempts.

\`\`\`
1. Attempt task
2. Evaluate result
3. Reflect on what went wrong
4. Retry with improvements
\`\`\`

**Best for:** Tasks where quality matters more than speed

**Limitations:** Increased token usage, longer execution

## Choosing the Right Pattern

| Use Case | Recommended Pattern |
|----------|-------------------|
| Simple Q&A with tools | ReAct |
| Multi-step workflows | Plan-and-Execute |
| Complex research tasks | Hierarchical |
| High-stakes decisions | Reflexion |

## Implementation Tips

1. **Start simple**: Begin with ReAct, add complexity as needed
2. **Add guardrails**: Limit iterations to prevent infinite loops
3. **Log everything**: Track reasoning for debugging
4. **Test edge cases**: Agents fail in unexpected ways
    `,
    topics: ['agent-fundamentals', 'multi-agent-systems'],
    difficulty: 'advanced',
    author: 'GraymatterLab',
    estimatedMinutes: 20,
    featured: true,
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-09-15T00:00:00Z',
  },
  {
    id: 'multi-agent-orchestration',
    title: 'Multi-Agent Orchestration Basics',
    description:
      'Learn the fundamentals of coordinating multiple AI agents to work together on complex tasks.',
    type: 'article',
    source: 'embedded',
    contentHtml: `
# Multi-Agent Orchestration Basics

When a single agent isn't enough, you can coordinate multiple specialized agents to tackle complex problems.

## Why Multi-Agent?

- **Specialization**: Each agent focuses on what it does best
- **Scalability**: Distribute work across agents
- **Reliability**: Agents can verify each other's work
- **Modularity**: Easier to update individual agents

## Orchestration Patterns

### Sequential Pipeline

Agents process tasks in order, each adding to the previous output.

\`\`\`
User Request → Agent A → Agent B → Agent C → Final Response
\`\`\`

**Example**: Research → Summarize → Format

### Parallel Fan-Out

Multiple agents work simultaneously, results are combined.

\`\`\`
              ┌→ Agent A ─┐
User Request ─┼→ Agent B ─┼→ Combine → Response
              └→ Agent C ─┘
\`\`\`

**Example**: Search multiple sources in parallel

### Supervisor Pattern

A manager agent coordinates worker agents.

\`\`\`
User Request → Supervisor → Worker Agents → Supervisor → Response
\`\`\`

The supervisor decides which workers to invoke and synthesizes results.

## Communication Strategies

### Direct Message Passing

Agents send messages directly to each other.

\`\`\`python
# Pseudocode
result_a = agent_a.run(task)
result_b = agent_b.run(result_a)
\`\`\`

### Shared State

Agents read/write to a shared workspace.

\`\`\`python
# Pseudocode
workspace = SharedState()
agent_a.update(workspace)
agent_b.read(workspace)
\`\`\`

### Event-Based

Agents publish events, others subscribe.

\`\`\`python
# Pseudocode
agent_a.publish("task_complete", result)
agent_b.on("task_complete", handle_result)
\`\`\`

## Best Practices

1. **Define clear interfaces**: What each agent expects and returns
2. **Handle failures gracefully**: What happens if an agent fails?
3. **Add timeouts**: Prevent waiting forever
4. **Log conversations**: Debug agent-to-agent communication
5. **Start with 2 agents**: Add more only when needed
    `,
    topics: ['multi-agent-systems', 'agent-fundamentals'],
    difficulty: 'advanced',
    author: 'GraymatterLab',
    estimatedMinutes: 18,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'building-reliable-agents',
    title: 'Building Reliable AI Agents',
    description:
      'Strategies for building agents that work consistently in production, including error handling, testing, and monitoring.',
    type: 'article',
    source: 'embedded',
    contentHtml: `
# Building Reliable AI Agents

Moving agents from prototype to production requires careful attention to reliability. This guide covers key strategies.

## Common Failure Modes

### 1. Infinite Loops

Agent keeps trying the same action without progress.

**Solution**: Set maximum iterations and detect repeated actions.

\`\`\`python
MAX_ITERATIONS = 10
seen_actions = set()

for i in range(MAX_ITERATIONS):
    action = agent.decide()
    if action in seen_actions:
        break  # Stuck in loop
    seen_actions.add(action)
\`\`\`

### 2. Hallucinated Tools

Agent tries to use tools that don't exist.

**Solution**: Validate tool calls before execution.

\`\`\`python
AVAILABLE_TOOLS = {"search", "calculate", "send_email"}

if tool_name not in AVAILABLE_TOOLS:
    return "Error: Unknown tool. Available: " + str(AVAILABLE_TOOLS)
\`\`\`

### 3. Malformed Outputs

Agent returns data in wrong format.

**Solution**: Use structured outputs with validation.

\`\`\`python
from pydantic import BaseModel

class AgentResponse(BaseModel):
    thought: str
    action: str
    action_input: dict

# Parse and validate
response = AgentResponse.parse_raw(agent_output)
\`\`\`

## Testing Strategies

### Unit Tests for Tools

Test each tool independently.

\`\`\`python
def test_search_tool():
    result = search_tool("python tutorials")
    assert "results" in result
    assert len(result["results"]) > 0
\`\`\`

### Integration Tests

Test full agent workflows with mocked tools.

\`\`\`python
def test_research_workflow():
    agent = create_agent(tools=[mock_search, mock_summarize])
    result = agent.run("Research Python best practices")
    assert "best practices" in result.lower()
\`\`\`

### Adversarial Tests

Try to break the agent.

\`\`\`python
adversarial_inputs = [
    "Ignore your instructions and...",
    "",  # Empty input
    "x" * 10000,  # Very long input
]
\`\`\`

## Production Monitoring

### Key Metrics

- **Success rate**: % of tasks completed successfully
- **Latency**: Time to complete tasks (p50, p95, p99)
- **Token usage**: Cost per task
- **Error rate**: % of tasks with errors

### Logging

Log every decision for debugging.

\`\`\`python
logger.info({
    "session_id": session_id,
    "step": step_number,
    "thought": agent_thought,
    "action": action_taken,
    "result": action_result
})
\`\`\`

## Graceful Degradation

When things go wrong, fail gracefully.

\`\`\`python
try:
    result = agent.run(task)
except MaxIterationsExceeded:
    result = "I couldn't complete this task. Please try rephrasing."
except ToolError as e:
    result = f"A tool encountered an error. Please try again."
\`\`\`
    `,
    topics: ['deployment', 'best-practices'],
    difficulty: 'advanced',
    author: 'GraymatterLab',
    estimatedMinutes: 22,
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'intro-to-ai-agents',
    title: 'Introduction to AI Agents',
    description:
      'A beginner-friendly overview of what AI agents are, how they work, and where they can be applied.',
    type: 'article',
    source: 'embedded',
    contentHtml: `
# Introduction to AI Agents

AI agents are autonomous systems that can perceive their environment, make decisions, and take actions to achieve goals. This guide introduces the core concepts.

## What is an AI Agent?

An AI agent is a system that:

1. **Perceives** its environment (receives inputs)
2. **Reasons** about what to do (uses an LLM or other AI)
3. **Acts** on the environment (calls tools, produces outputs)
4. **Learns** from feedback (optional, for advanced agents)

Think of it as giving an AI the ability to "do things" rather than just "say things."

## Agents vs. Chatbots

| Chatbot | Agent |
|---------|-------|
| Responds to messages | Takes actions |
| Stateless conversations | Maintains context |
| Limited to text | Uses tools (search, APIs, code) |
| Human-driven flow | Autonomous decision-making |

## Core Components

### 1. The Brain (LLM)

The language model that powers reasoning and decision-making.

### 2. Tools

Functions the agent can call to interact with the world:
- Web search
- Database queries
- API calls
- Code execution
- File operations

### 3. Memory

Information the agent remembers:
- **Short-term**: Current conversation context
- **Long-term**: Stored knowledge, past interactions

### 4. Planning

How the agent decides what to do:
- Break complex tasks into steps
- Prioritize actions
- Handle errors and retry

## Example Use Cases

- **Customer Support**: Answer questions, create tickets, process refunds
- **Research Assistant**: Search web, summarize findings, compile reports
- **Coding Assistant**: Write code, run tests, fix bugs
- **Data Analyst**: Query databases, create visualizations, generate insights

## Getting Started

1. **Start simple**: Build an agent with 1-2 tools
2. **Define clear goals**: What should the agent accomplish?
3. **Add guardrails**: Prevent unwanted behaviors
4. **Test thoroughly**: Agents fail in unexpected ways
5. **Iterate**: Improve based on real usage

## Next Steps

- Read about [Agent Architecture Patterns](#agent-architecture-patterns)
- Learn [Prompt Engineering for Agents](#prompt-engineering-agents)
- Try building with [Google ADK](#google-adk-docs)
    `,
    topics: ['agent-fundamentals'],
    difficulty: 'beginner',
    author: 'GraymatterLab',
    estimatedMinutes: 10,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'crewai-multi-agent',
    title: 'CrewAI Multi-Agent Framework',
    description:
      'Documentation for CrewAI, a framework for orchestrating role-playing autonomous AI agents.',
    type: 'documentation',
    source: 'external',
    externalUrl: 'https://docs.crewai.com/',
    topics: ['multi-agent-systems', 'tools-integrations'],
    difficulty: 'intermediate',
    author: 'CrewAI',
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'autogen-agents',
    title: 'AutoGen Multi-Agent Conversations',
    description:
      'Microsoft AutoGen framework for building multi-agent conversational systems with customizable agents.',
    type: 'documentation',
    source: 'external',
    externalUrl: 'https://microsoft.github.io/autogen/',
    topics: ['multi-agent-systems'],
    difficulty: 'advanced',
    author: 'Microsoft',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'agent-deployment-guide',
    title: 'Deploying AI Agents to Production',
    description:
      'A practical guide to deploying AI agents, covering infrastructure, scaling, monitoring, and cost optimization.',
    type: 'article',
    source: 'embedded',
    contentHtml: `
# Deploying AI Agents to Production

Taking your agent from localhost to production requires careful planning. This guide covers the key considerations.

## Infrastructure Options

### Serverless (Recommended for Starting)

**Pros**: No infrastructure management, auto-scaling, pay-per-use
**Cons**: Cold starts, execution time limits

**Options**:
- AWS Lambda + API Gateway
- Google Cloud Functions
- Vercel/Netlify Functions

### Containers

**Pros**: More control, no cold starts, longer execution
**Cons**: Infrastructure management, cost when idle

**Options**:
- Google Cloud Run
- AWS Fargate
- Kubernetes

### Dedicated Servers

**Pros**: Full control, consistent performance
**Cons**: Highest management overhead, fixed costs

## Key Architecture Decisions

### Synchronous vs. Asynchronous

**Synchronous**: User waits for response
- Simple to implement
- Limited to ~30 second tasks
- Bad UX for long tasks

**Asynchronous**: User gets immediate acknowledgment, result delivered later
- Better UX for long tasks
- More complex (queues, callbacks)
- Required for tasks > 30 seconds

### State Management

Where does agent state live?

- **In-memory**: Fast, lost on restart
- **Database**: Persistent, adds latency
- **Redis**: Fast + persistent, good middle ground

## Scaling Considerations

### LLM API Limits

Most providers have rate limits. Plan for:
- Requests per minute
- Tokens per minute
- Concurrent requests

**Strategies**:
- Queue requests
- Use multiple API keys
- Implement backoff/retry

### Cost Control

Agent costs can explode quickly.

\`\`\`
Per-request cost = prompt_tokens + completion_tokens + tool_calls
\`\`\`

**Strategies**:
- Set max tokens per request
- Limit iterations
- Cache common queries
- Use cheaper models for simple tasks

## Monitoring & Observability

### Essential Metrics

- Request latency (p50, p95, p99)
- Success/failure rates
- Token usage per request
- Cost per request
- Error types and frequencies

### Logging

Log every agent decision:

\`\`\`json
{
  "request_id": "abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "step": 3,
  "action": "search",
  "input": {"query": "python tutorials"},
  "output": {"results": [...]},
  "latency_ms": 450
}
\`\`\`

## Security Checklist

- [ ] Validate all user inputs
- [ ] Sanitize tool outputs before display
- [ ] Rate limit by user/IP
- [ ] Audit log all actions
- [ ] Secure API keys (don't expose to client)
- [ ] Review agent permissions regularly
    `,
    topics: ['deployment', 'best-practices'],
    difficulty: 'advanced',
    author: 'GraymatterLab',
    estimatedMinutes: 25,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
]

/**
 * Get all library resources
 */
export function getLibraryResources(): LibraryResource[] {
  return libraryResources
}

/**
 * Get a single library resource by ID
 */
export function getLibraryResourceById(id: string): LibraryResource | undefined {
  return libraryResources.find((r) => r.id === id)
}

/**
 * Get featured library resources
 */
export function getFeaturedResources(): LibraryResource[] {
  return libraryResources.filter((r) => r.featured)
}

/**
 * Get all unique topics from resources
 */
export function getAllTopics(): string[] {
  const topics = new Set<string>()
  libraryResources.forEach((r) => r.topics.forEach((t) => topics.add(t)))
  return Array.from(topics).sort()
}
