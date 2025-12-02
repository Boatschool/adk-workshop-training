"""Seed data for library resources.

Run this script to populate the shared library_resources table with initial content.

Usage:
    poetry run python -m src.db.seeds.library_resources
"""

import asyncio
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from src.core.config import get_settings
from src.core.constants import SHARED_SCHEMA

settings = get_settings()

# Library resources seed data (matches frontend mock data)
LIBRARY_RESOURCES: list[dict[str, Any]] = [
    {
        "title": "Google ADK Official Documentation",
        "description": "Comprehensive documentation for Google Agent Development Kit, including API references, tutorials, and best practices for building AI agents.",
        "resource_type": "documentation",
        "source": "external",
        "external_url": "https://google.github.io/adk-docs/",
        "topics": ["agent-fundamentals"],
        "difficulty": "beginner",
        "author": "Google",
        "featured": True,
    },
    {
        "title": "Prompt Engineering for AI Agents",
        "description": "Learn how to write effective instructions and prompts that make your agents more capable, reliable, and aligned with user intentions.",
        "resource_type": "article",
        "source": "embedded",
        "content_html": """# Prompt Engineering for AI Agents

Effective prompt engineering is the foundation of building reliable AI agents. This guide covers the key principles and techniques for crafting prompts that lead to consistent, high-quality agent behavior.

## Core Principles

### 1. Be Specific and Unambiguous

Agents perform best when given clear, specific instructions. Avoid vague language that could be interpreted multiple ways.

**Poor:** "Help the user with their request"

**Better:** "Analyze the user's question, identify the core intent, and provide a direct answer. If clarification is needed, ask one specific follow-up question."

### 2. Define the Agent's Role and Constraints

Establish who the agent is and what boundaries it should operate within.

```
You are a customer support agent for a software company. You can:
- Answer questions about product features
- Help troubleshoot common issues
- Escalate complex problems to human support

You should NOT:
- Make promises about future features
- Discuss pricing or contracts
- Share internal company information
```

### 3. Provide Examples (Few-Shot Prompting)

Show the agent what good responses look like.

## Advanced Techniques

### Chain of Thought

For complex reasoning tasks, instruct the agent to think step-by-step.

### Output Formatting

Specify exactly how you want responses structured.

## Testing Your Prompts

Always test prompts with:
- Edge cases and unusual inputs
- Adversarial attempts to break the agent
- Real user scenarios from your domain

Iterate based on failures and unexpected behaviors.""",
        "topics": ["prompt-engineering", "best-practices"],
        "difficulty": "intermediate",
        "author": "GraymatterLab",
        "estimated_minutes": 15,
        "featured": True,
    },
    {
        "title": "LangChain Agents Overview",
        "description": "Introduction to building agents with LangChain, covering agent types, tools, and execution patterns.",
        "resource_type": "documentation",
        "source": "external",
        "external_url": "https://python.langchain.com/docs/concepts/agents/",
        "topics": ["agent-fundamentals", "tools-integrations"],
        "difficulty": "intermediate",
        "author": "LangChain",
        "featured": False,
    },
    {
        "title": "Anthropic Tool Use Guide",
        "description": "Official guide on implementing tool use (function calling) with Claude, including best practices and examples.",
        "resource_type": "documentation",
        "source": "external",
        "external_url": "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
        "topics": ["tools-integrations", "agent-fundamentals"],
        "difficulty": "intermediate",
        "author": "Anthropic",
        "featured": False,
    },
    {
        "title": "OpenAI Function Calling Guide",
        "description": "Learn how to use function calling with OpenAI models to create agents that can interact with external tools and APIs.",
        "resource_type": "documentation",
        "source": "external",
        "external_url": "https://platform.openai.com/docs/guides/function-calling",
        "topics": ["tools-integrations"],
        "difficulty": "intermediate",
        "author": "OpenAI",
        "featured": False,
    },
    {
        "title": "Agent Architecture Patterns",
        "description": "Common architectural patterns for building AI agents, from simple ReAct loops to complex multi-agent systems.",
        "resource_type": "article",
        "source": "embedded",
        "content_html": """# Agent Architecture Patterns

Understanding common agent architectures helps you choose the right approach for your use case. This guide covers patterns from simple to complex.

## 1. ReAct (Reasoning + Acting)

The most common agent pattern. The agent alternates between thinking and taking actions.

```
Loop:
  1. Observe: What's the current state?
  2. Think: What should I do next?
  3. Act: Execute an action (call a tool)
  4. Repeat until task is complete
```

**Best for:** General-purpose assistants, Q&A with tools

**Limitations:** Can get stuck in loops, limited planning

## 2. Plan-and-Execute

The agent creates a full plan upfront, then executes each step.

**Best for:** Complex multi-step tasks, workflows

**Limitations:** Plans can become outdated, less flexible

## 3. Hierarchical Agents

Multiple agents with different specializations, coordinated by a manager agent.

**Best for:** Complex tasks requiring diverse skills

**Limitations:** Higher latency, coordination overhead

## 4. Reflexion

Agent reflects on its actions and improves over multiple attempts.

**Best for:** Tasks where quality matters more than speed

## Choosing the Right Pattern

| Use Case | Recommended Pattern |
|----------|-------------------|
| Simple Q&A with tools | ReAct |
| Multi-step workflows | Plan-and-Execute |
| Complex research tasks | Hierarchical |
| High-stakes decisions | Reflexion |""",
        "topics": ["agent-fundamentals", "multi-agent-systems"],
        "difficulty": "advanced",
        "author": "GraymatterLab",
        "estimated_minutes": 20,
        "featured": True,
    },
    {
        "title": "Multi-Agent Orchestration Basics",
        "description": "Learn the fundamentals of coordinating multiple AI agents to work together on complex tasks.",
        "resource_type": "article",
        "source": "embedded",
        "content_html": """# Multi-Agent Orchestration Basics

When a single agent isn't enough, you can coordinate multiple specialized agents to tackle complex problems.

## Why Multi-Agent?

- **Specialization**: Each agent focuses on what it does best
- **Scalability**: Distribute work across agents
- **Reliability**: Agents can verify each other's work
- **Modularity**: Easier to update individual agents

## Orchestration Patterns

### Sequential Pipeline

Agents process tasks in order, each adding to the previous output.

### Parallel Fan-Out

Multiple agents work simultaneously, results are combined.

### Supervisor Pattern

A manager agent coordinates worker agents.

## Best Practices

1. **Define clear interfaces**: What each agent expects and returns
2. **Handle failures gracefully**: What happens if an agent fails?
3. **Add timeouts**: Prevent waiting forever
4. **Log conversations**: Debug agent-to-agent communication
5. **Start with 2 agents**: Add more only when needed""",
        "topics": ["multi-agent-systems", "agent-fundamentals"],
        "difficulty": "advanced",
        "author": "GraymatterLab",
        "estimated_minutes": 18,
        "featured": False,
    },
    {
        "title": "Building Reliable AI Agents",
        "description": "Strategies for building agents that work consistently in production, including error handling, testing, and monitoring.",
        "resource_type": "article",
        "source": "embedded",
        "content_html": """# Building Reliable AI Agents

Moving agents from prototype to production requires careful attention to reliability. This guide covers key strategies.

## Common Failure Modes

### 1. Infinite Loops

Agent keeps trying the same action without progress.

**Solution**: Set maximum iterations and detect repeated actions.

### 2. Hallucinated Tools

Agent tries to use tools that don't exist.

**Solution**: Validate tool calls before execution.

### 3. Malformed Outputs

Agent returns data in wrong format.

**Solution**: Use structured outputs with validation.

## Testing Strategies

- Unit tests for each tool independently
- Integration tests for full agent workflows
- Adversarial tests to try to break the agent

## Production Monitoring

### Key Metrics

- **Success rate**: % of tasks completed successfully
- **Latency**: Time to complete tasks (p50, p95, p99)
- **Token usage**: Cost per task
- **Error rate**: % of tasks with errors

## Graceful Degradation

When things go wrong, fail gracefully and provide helpful error messages.""",
        "topics": ["deployment", "best-practices"],
        "difficulty": "advanced",
        "author": "GraymatterLab",
        "estimated_minutes": 22,
        "featured": False,
    },
    {
        "title": "Introduction to AI Agents",
        "description": "A beginner-friendly overview of what AI agents are, how they work, and where they can be applied.",
        "resource_type": "article",
        "source": "embedded",
        "content_html": """# Introduction to AI Agents

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
Functions the agent can call to interact with the world.

### 3. Memory
Information the agent remembers across interactions.

### 4. Planning
How the agent decides what to do.

## Example Use Cases

- **Customer Support**: Answer questions, create tickets, process refunds
- **Research Assistant**: Search web, summarize findings, compile reports
- **Coding Assistant**: Write code, run tests, fix bugs
- **Data Analyst**: Query databases, create visualizations, generate insights""",
        "topics": ["agent-fundamentals"],
        "difficulty": "beginner",
        "author": "GraymatterLab",
        "estimated_minutes": 10,
        "featured": False,
    },
    {
        "title": "CrewAI Multi-Agent Framework",
        "description": "Documentation for CrewAI, a framework for orchestrating role-playing autonomous AI agents.",
        "resource_type": "documentation",
        "source": "external",
        "external_url": "https://docs.crewai.com/",
        "topics": ["multi-agent-systems", "tools-integrations"],
        "difficulty": "intermediate",
        "author": "CrewAI",
        "featured": False,
    },
    {
        "title": "AutoGen Multi-Agent Conversations",
        "description": "Microsoft AutoGen framework for building multi-agent conversational systems with customizable agents.",
        "resource_type": "documentation",
        "source": "external",
        "external_url": "https://microsoft.github.io/autogen/",
        "topics": ["multi-agent-systems"],
        "difficulty": "advanced",
        "author": "Microsoft",
        "featured": False,
    },
    {
        "title": "Deploying AI Agents to Production",
        "description": "A practical guide to deploying AI agents, covering infrastructure, scaling, monitoring, and cost optimization.",
        "resource_type": "article",
        "source": "embedded",
        "content_html": """# Deploying AI Agents to Production

Taking your agent from localhost to production requires careful planning. This guide covers the key considerations.

## Infrastructure Options

### Serverless (Recommended for Starting)

**Pros**: No infrastructure management, auto-scaling, pay-per-use
**Cons**: Cold starts, execution time limits

**Options**: AWS Lambda, Google Cloud Functions, Vercel Functions

### Containers

**Pros**: More control, no cold starts, longer execution
**Cons**: Infrastructure management, cost when idle

**Options**: Google Cloud Run, AWS Fargate, Kubernetes

## Key Architecture Decisions

### Synchronous vs. Asynchronous

**Synchronous**: User waits for response - simple but limited to ~30 second tasks

**Asynchronous**: User gets immediate acknowledgment, result delivered later - better for long tasks

### State Management

Where does agent state live?

- **In-memory**: Fast, lost on restart
- **Database**: Persistent, adds latency
- **Redis**: Fast + persistent, good middle ground

## Scaling Considerations

### LLM API Limits

Most providers have rate limits. Plan for requests per minute, tokens per minute, and concurrent requests.

### Cost Control

Agent costs can explode quickly. Set max tokens per request, limit iterations, cache common queries.

## Security Checklist

- Validate all user inputs
- Sanitize tool outputs before display
- Rate limit by user/IP
- Audit log all actions
- Secure API keys""",
        "topics": ["deployment", "best-practices"],
        "difficulty": "advanced",
        "author": "GraymatterLab",
        "estimated_minutes": 25,
        "featured": False,
    },
]


async def seed_library_resources() -> None:
    """Seed the library_resources table with initial data."""
    engine = create_async_engine(settings.database_url)

    async with AsyncSession(engine) as session:
        # Set schema to shared
        await session.execute(text(f"SET search_path TO {SHARED_SCHEMA}"))

        # Check if resources already exist
        result = await session.execute(text("SELECT COUNT(*) FROM library_resources"))
        count = result.scalar()

        if count is not None and count > 0:
            print(f"Library resources table already has {count} records. Skipping seed.")
            return

        # Insert resources
        for resource in LIBRARY_RESOURCES:
            topics_array = "{" + ",".join(f'"{t}"' for t in resource.get("topics", [])) + "}"

            await session.execute(
                text("""
                    INSERT INTO library_resources
                    (title, description, resource_type, source, external_url, content_html,
                     topics, difficulty, author, estimated_minutes, featured)
                    VALUES
                    (:title, :description, :resource_type, :source, :external_url, :content_html,
                     :topics::text[], :difficulty, :author, :estimated_minutes, :featured)
                """),
                {
                    "title": resource["title"],
                    "description": resource["description"],
                    "resource_type": resource["resource_type"],
                    "source": resource["source"],
                    "external_url": resource.get("external_url"),
                    "content_html": resource.get("content_html"),
                    "topics": topics_array,
                    "difficulty": resource["difficulty"],
                    "author": resource.get("author"),
                    "estimated_minutes": resource.get("estimated_minutes"),
                    "featured": resource.get("featured", False),
                },
            )

        await session.commit()
        print(f"Successfully seeded {len(LIBRARY_RESOURCES)} library resources.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_library_resources())
