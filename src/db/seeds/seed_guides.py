"""Seed script for populating guides table with initial content.

This script migrates the hardcoded guide content from the frontend
to the database. Run this after applying migration 003_add_guides_table.

Usage:
    poetry run python -m src.db.seeds.seed_guides
"""

import asyncio

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.guide import Guide
from src.db.session import get_session_factory

# Guide content migrated from frontend/src/pages/guides/GuidePage.tsx
GUIDES_DATA = [
    {
        "slug": "getting-started",
        "title": "Getting Started",
        "description": "Set up your environment and prepare for the ADK workshop.",
        "icon": "play",
        "display_order": 1,
        "published": True,
        "content_html": """
      <h2>Welcome to the ADK Workshop!</h2>
      <p>This guide will help you set up your environment and get started with Google's Agent Development Kit.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Python 3.11 or higher</li>
        <li>A Google API key with Generative Language API enabled</li>
        <li>A code editor (VS Code recommended)</li>
      </ul>

      <h2>Setup Steps</h2>

      <h3>1. Create Virtual Environment</h3>
      <pre><code class="language-bash">python3 -m venv ~/adk-workshop
source ~/adk-workshop/bin/activate</code></pre>

      <h3>2. Install ADK</h3>
      <pre><code class="language-bash">pip install google-adk</code></pre>

      <h3>3. Set Up API Key</h3>
      <p>Create a <code>.env</code> file with your API key:</p>
      <pre><code>GOOGLE_API_KEY=your-api-key-here</code></pre>

      <h3>4. Verify Installation</h3>
      <pre><code class="language-bash">adk --version</code></pre>

      <h2>Next Steps</h2>
      <p>Now you're ready to start the workshop! Head to the <a href="/workshops">Workshops</a> page to begin.</p>
    """,
    },
    {
        "slug": "quickstart-guide",
        "title": "ADK Quickstart Guide",
        "description": "Get up and running with Google's Agent Development Kit in minutes.",
        "icon": "rocket",
        "display_order": 2,
        "published": True,
        "content_html": """
      <h2>Quick Start</h2>
      <p>Get up and running with Google's Agent Development Kit in minutes.</p>

      <h2>Installation</h2>
      <pre><code class="language-bash">pip install google-adk</code></pre>

      <h2>Your First Agent</h2>
      <pre><code class="language-python">from google.adk import Agent

agent = Agent(
    name="quickstart_agent",
    model="gemini-2.0-flash",
    instructions="You are a helpful assistant."
)

agent.run()</code></pre>

      <h2>Running the Agent</h2>
      <pre><code class="language-bash">python my_agent.py</code></pre>

      <p>Visit <a href="http://localhost:8000/dev-ui">http://localhost:8000/dev-ui</a> to interact with your agent.</p>
    """,
    },
    {
        "slug": "visual-agent-builder-guide",
        "title": "Visual Agent Builder Guide",
        "description": "Learn to create, edit, and test AI agents using the Visual Builder interface without writing code.",
        "icon": "book",
        "display_order": 3,
        "published": True,
        "content_html": """
      <p>This guide teaches you how to use Google's ADK Visual Agent Builder to create, edit, and test AI agents without writing code.</p>

      <h2>Table of Contents</h2>
      <ol>
        <li><a href="#getting-started">Getting Started</a></li>
        <li><a href="#creating-your-first-agent">Creating Your First Agent</a></li>
        <li><a href="#using-the-ai-assistant">Using the AI Assistant</a></li>
        <li><a href="#editing-existing-agents">Editing Existing Agents</a></li>
        <li><a href="#workshop-exercises">Workshop Exercises</a></li>
        <li><a href="#troubleshooting">Troubleshooting</a></li>
      </ol>

      <hr />

      <h2 id="getting-started">1. Getting Started</h2>

      <h3>Accessing the Visual Builder</h3>
      <ol>
        <li>Start the Visual Builder:
          <pre><code class="language-bash">./start_visual_builder.sh</code></pre>
        </li>
        <li>Open your browser and navigate to:
          <pre><code>http://localhost:8000/dev-ui</code></pre>
        </li>
        <li>You should see the Visual Builder interface with your agents listed on the left.</li>
      </ol>

      <h3>Browser Cache Warning</h3>
      <p>If you don't see the Visual Builder features (like the "+" button or pencil icons), perform a hard refresh:</p>
      <ul>
        <li><strong>Mac:</strong> <code>Cmd + Shift + R</code></li>
        <li><strong>Windows/Linux:</strong> <code>Ctrl + Shift + R</code></li>
      </ul>
      <p>This clears cached JavaScript files from older ADK versions.</p>

      <h3>Understanding the Interface</h3>
      <p>The Visual Builder has three main panels:</p>
      <table>
        <thead>
          <tr>
            <th>Panel</th>
            <th>Location</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Agent List & Config Editor</strong></td>
            <td>Left</td>
            <td>Browse agents, edit properties</td>
          </tr>
          <tr>
            <td><strong>Agent Canvas</strong></td>
            <td>Center</td>
            <td>Visual workflow design, agent hierarchy</td>
          </tr>
          <tr>
            <td><strong>AI Assistant</strong></td>
            <td>Right</td>
            <td>Natural language agent building</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2 id="creating-your-first-agent">2. Creating Your First Agent</h2>

      <h3>Step 1: Click the "+" Button</h3>
      <p>In the Visual Builder interface, look for the <strong>"+"</strong> button (usually in the top-left or near the agent list).</p>

      <h3>Step 2: Name Your Agent</h3>
      <p>Enter a name for your new agent. Use lowercase letters and underscores:</p>
      <ul>
        <li><strong>Good:</strong> <code>customer_support</code>, <code>data_analyzer</code></li>
        <li><strong>Avoid:</strong> <code>Customer Support</code>, <code>DataAnalyzer</code></li>
      </ul>

      <h3>Step 3: Configure Basic Properties</h3>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Name</strong></td>
            <td>Unique identifier</td>
            <td><code>my_first_agent</code></td>
          </tr>
          <tr>
            <td><strong>Model</strong></td>
            <td>LLM to use</td>
            <td><code>gemini-2.5-flash</code></td>
          </tr>
          <tr>
            <td><strong>Description</strong></td>
            <td>Brief summary for delegation</td>
            <td>"Answers customer questions"</td>
          </tr>
          <tr>
            <td><strong>Instruction</strong></td>
            <td>System prompt defining behavior</td>
            <td>See below</td>
          </tr>
        </tbody>
      </table>

      <h3>Step 4: Write Instructions</h3>
      <p>The instruction field is crucial. Be specific about:</p>
      <ul>
        <li>What the agent should do</li>
        <li>How it should respond</li>
        <li>Any constraints or guidelines</li>
      </ul>

      <p><strong>Example:</strong></p>
      <pre><code>You are a helpful customer service agent for a healthcare organization.

Your responsibilities:
- Answer questions about our services
- Help with appointment inquiries
- Provide general information

Guidelines:
- Be friendly and professional
- If unsure, offer to connect them with a human
- Never provide medical advice</code></pre>

      <h3>Step 5: Save and Test</h3>
      <ol>
        <li>Click <strong>Save</strong> to create the agent</li>
        <li>Use the <strong>Chat</strong> panel to test your agent</li>
        <li>Iterate on the instructions based on responses</li>
      </ol>

      <hr />

      <h2 id="using-the-ai-assistant">3. Using the AI Assistant</h2>
      <p>The AI Assistant (right panel) helps you build agents using natural language.</p>

      <h3>How to Use It</h3>
      <ol>
        <li>Type what you want in the chat interface</li>
        <li>The assistant generates agent configurations</li>
        <li>Review and apply the suggestions</li>
        <li>Continue iterating with follow-up requests</li>
      </ol>

      <h3>Example Prompts</h3>

      <p><strong>Creating a new agent:</strong></p>
      <pre><code>Create a simple Q&A agent that answers questions about employee benefits.
It should be friendly and direct users to HR if it can't answer.</code></pre>

      <p><strong>Adding features:</strong></p>
      <pre><code>Help me add a dice roll tool to my current agent.
Use the default model if you need to configure that.</code></pre>

      <h3>Best Practices</h3>
      <ol>
        <li><strong>Be specific</strong> - Include details about behavior, tone, and constraints</li>
        <li><strong>Iterate</strong> - Start simple and add complexity through conversation</li>
        <li><strong>Review changes</strong> - Always verify generated configurations before saving</li>
        <li><strong>Test frequently</strong> - Use the chat to validate each change</li>
      </ol>

      <hr />

      <h2 id="editing-existing-agents">4. Editing Existing Agents</h2>

      <h3>Which Agents Can Be Edited?</h3>
      <table>
        <thead>
          <tr>
            <th>Agent Type</th>
            <th>Source</th>
            <th>Editable in Visual Builder?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>YAML-based</td>
            <td><code>root_agent.yaml</code></td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Python-based</td>
            <td><code>agent.py</code></td>
            <td>No (read-only)</td>
          </tr>
        </tbody>
      </table>

      <h3>How to Edit</h3>
      <ol>
        <li><strong>Select</strong> the agent from the list (left panel)</li>
        <li><strong>Click</strong> the pencil icon to enter edit mode</li>
        <li><strong>Modify</strong> properties in the configuration editor</li>
        <li><strong>Save</strong> your changes</li>
      </ol>

      <hr />

      <h2 id="workshop-exercises">5. Workshop Exercises</h2>

      <h3>Exercise 1: Create a Simple Q&A Agent</h3>
      <p><strong>Goal:</strong> Build a basic FAQ agent using the AI Assistant.</p>

      <p><strong>Steps:</strong></p>
      <ol>
        <li>Open the Visual Builder</li>
        <li>In the AI Assistant panel, type:
          <pre><code>Create a simple FAQ agent that answers questions about a company's
return policy. The policy allows returns within 30 days with receipt,
14 days without receipt, and no returns on sale items.</code></pre>
        </li>
        <li>Review the generated configuration</li>
        <li>Test the agent with questions</li>
      </ol>
      <p><strong>Success Criteria:</strong> Agent correctly answers based on the policy rules.</p>

      <hr />

      <h2 id="troubleshooting">6. Troubleshooting</h2>

      <h3>"No agents appear in the list"</h3>
      <p><strong>Cause:</strong> Agents not in correct directory or missing <code>root_agent.yaml</code></p>
      <p><strong>Solution:</strong></p>
      <ol>
        <li>Verify agents are in <code>/agents/&lt;agent_name&gt;/</code> directory</li>
        <li>Each agent folder needs <code>root_agent.yaml</code> or <code>agent.py</code></li>
        <li>Restart the Visual Builder: <code>./restart_visual_builder.sh</code></li>
      </ol>

      <hr />

      <h3>"Visual Builder UI looks different/missing features"</h3>
      <p><strong>Cause:</strong> Cached old JavaScript files</p>
      <p><strong>Solution:</strong> Hard refresh your browser:</p>
      <ul>
        <li><strong>Mac:</strong> <code>Cmd + Shift + R</code></li>
        <li><strong>Windows/Linux:</strong> <code>Ctrl + Shift + R</code></li>
      </ul>

      <hr />

      <h3>Getting Help</h3>
      <ul>
        <li><strong>ADK Documentation:</strong> <a href="https://google.github.io/adk-docs/" target="_blank" rel="noopener noreferrer">https://google.github.io/adk-docs/</a></li>
        <li><strong>Visual Builder Guide:</strong> <a href="https://google.github.io/adk-docs/visual-builder/" target="_blank" rel="noopener noreferrer">https://google.github.io/adk-docs/visual-builder/</a></li>
        <li><strong>ADK GitHub:</strong> <a href="https://github.com/google/adk-python" target="_blank" rel="noopener noreferrer">https://github.com/google/adk-python</a></li>
      </ul>
    """,
    },
    {
        "slug": "cheat-sheet",
        "title": "Command Cheat Sheet",
        "description": "Quick reference for common ADK commands and workshop scripts.",
        "icon": "terminal",
        "display_order": 4,
        "published": True,
        "content_html": """
      <h2>Common Commands</h2>

      <h3>Virtual Environment</h3>
      <pre><code class="language-bash"># Activate virtual environment
source ~/adk-workshop/bin/activate

# Deactivate
deactivate</code></pre>

      <h3>ADK Commands</h3>
      <pre><code class="language-bash"># Start Visual Builder
adk web --port 8000

# Run an agent
python my_agent.py

# Check ADK version
adk --version</code></pre>

      <h3>Workshop Scripts</h3>
      <pre><code class="language-bash"># Start Visual Builder
./start_visual_builder.sh

# Stop Visual Builder
./stop_visual_builder.sh

# Restart
./restart_visual_builder.sh</code></pre>
    """,
    },
    {
        "slug": "troubleshooting-guide",
        "title": "Troubleshooting Guide",
        "description": "Solutions for common issues you may encounter during the workshop.",
        "icon": "wrench",
        "display_order": 5,
        "published": True,
        "content_html": """
      <h2>Common Issues</h2>

      <h3>API Key Not Found</h3>
      <p>If you see "GOOGLE_API_KEY not found", make sure your <code>.env</code> file contains:</p>
      <pre><code>GOOGLE_API_KEY=your-api-key-here</code></pre>

      <h3>Port Already in Use</h3>
      <p>If port 8000 is in use, either:</p>
      <ul>
        <li>Stop the other process using the port</li>
        <li>Use a different port: <code>adk web --port 8001</code></li>
      </ul>

      <h3>Virtual Environment Issues</h3>
      <p>Recreate your virtual environment:</p>
      <pre><code class="language-bash">rm -rf ~/adk-workshop
python3 -m venv ~/adk-workshop
source ~/adk-workshop/bin/activate
pip install google-adk</code></pre>

      <h3>Still Having Issues?</h3>
      <p>Ask your instructor for help or check the ADK documentation.</p>
    """,
    },
]


async def seed_guides(session: AsyncSession) -> None:
    """Seed the guides table with initial content."""

    # Check if guides already exist
    result = await session.execute(select(Guide).limit(1))
    if result.scalar_one_or_none():
        print("Guides already exist, skipping seed.")
        return

    print(f"Seeding {len(GUIDES_DATA)} guides...")

    for guide_data in GUIDES_DATA:
        content_html = str(guide_data["content_html"]) if guide_data.get("content_html") else ""
        display_order_val = guide_data.get("display_order", 0)
        guide = Guide(
            slug=str(guide_data["slug"]),
            title=str(guide_data["title"]),
            description=str(guide_data["description"]),
            content_html=content_html.strip(),
            icon=str(guide_data["icon"]),
            display_order=(
                int(display_order_val) if isinstance(display_order_val, int | float) else 0
            ),
            published=bool(guide_data.get("published", True)),
        )
        session.add(guide)
        print(f"  - Added: {guide_data['title']}")

    await session.commit()
    print("Guides seeded successfully!")


async def main() -> None:
    """Main function to run the seed script."""
    session_factory = get_session_factory()

    async with session_factory() as session:
        # Set search_path to shared schema
        await session.execute(text("SET search_path TO adk_platform_shared, public"))

        await seed_guides(session)


if __name__ == "__main__":
    asyncio.run(main())
