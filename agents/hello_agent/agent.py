2"""
Hello Agent - A simple starter agent for ADK Visual Builder testing.
"""

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
