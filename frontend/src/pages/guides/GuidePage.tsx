/**
 * Guide Page
 * Displays guide/documentation content
 */

import { Link, useParams } from 'react-router-dom'
import { MarkdownRenderer } from '@components/exercise'

// Mock data - will be replaced with API call
const mockGuides: Record<string, { title: string; content: string }> = {
  'visual-agent-builder-guide': {
    title: 'ADK Visual Agent Builder Training Guide',
    content: `
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

      <h3>Available Sample Agents</h3>
      <p>Your training environment includes these sample agents:</p>
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>hello_agent</code></td>
            <td>Python</td>
            <td>Simple greeting agent (read-only in Visual Builder)</td>
          </tr>
          <tr>
            <td><code>starter_agent</code></td>
            <td>YAML</td>
            <td>Basic template for learning</td>
          </tr>
          <tr>
            <td><code>faq_agent</code></td>
            <td>YAML</td>
            <td>HR FAQ assistant with knowledge base</td>
          </tr>
          <tr>
            <td><code>scheduler_agent</code></td>
            <td>YAML</td>
            <td>Meeting room booking assistant</td>
          </tr>
          <tr>
            <td><code>router_agent</code></td>
            <td>YAML</td>
            <td>Multi-agent facilities ticketing system</td>
          </tr>
          <tr>
            <td><code>npi_lookup</code></td>
            <td>YAML</td>
            <td>Healthcare NPI lookup agent</td>
          </tr>
          <tr>
            <td><code>tenant_creation</code></td>
            <td>YAML</td>
            <td>Multi-tenant creation workflow</td>
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

      <p><strong>Building multi-agent systems:</strong></p>
      <pre><code>Create a research agent that coordinates between a query refinement agent
and a search execution agent. Use a loop pattern to iterate until good
results are found.</code></pre>

      <p><strong>Modifying instructions:</strong></p>
      <pre><code>Update the agent's instruction to be more formal and include a disclaimer
about not providing medical advice.</code></pre>

      <h3>Best Practices</h3>
      <ol>
        <li><strong>Be specific</strong> – Include details about behavior, tone, and constraints</li>
        <li><strong>Iterate</strong> – Start simple and add complexity through conversation</li>
        <li><strong>Review changes</strong> – Always verify generated configurations before saving</li>
        <li><strong>Test frequently</strong> – Use the chat to validate each change</li>
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

      <h3>Editing Properties</h3>
      <p><strong>Basic Properties:</strong></p>
      <ul>
        <li>Name and description</li>
        <li>Model selection</li>
        <li>Instructions (system prompt)</li>
      </ul>

      <p><strong>Advanced Properties:</strong></p>
      <ul>
        <li>Tools configuration</li>
        <li>Sub-agents (for multi-agent workflows)</li>
        <li>Callbacks (before/after hooks)</li>
      </ul>

      <h3>Adding Sub-Agents</h3>
      <p>To create a multi-agent workflow:</p>
      <ol>
        <li>Edit the parent agent</li>
        <li>In the "Sub-Agents" section, add references:
          <pre><code class="language-yaml">sub_agents:
  - config_path: ./sub_agent_1.yaml
  - config_path: ./sub_agent_2.yaml</code></pre>
        </li>
        <li>Create the referenced YAML files in the same directory</li>
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
        <li>Test the agent with questions like:
          <ul>
            <li>"Can I return something after 3 weeks?"</li>
            <li>"I lost my receipt, can I still return?"</li>
            <li>"What about items I bought on sale?"</li>
          </ul>
        </li>
      </ol>
      <p><strong>Success Criteria:</strong> Agent correctly answers based on the policy rules.</p>

      <hr />

      <h3>Exercise 2: Add a Sub-Agent Workflow</h3>
      <p><strong>Goal:</strong> Extend the <code>starter_agent</code> with a sub-agent.</p>

      <p><strong>Steps:</strong></p>
      <ol>
        <li>Select <code>starter_agent</code> in the Visual Builder</li>
        <li>Ask the AI Assistant:
          <pre><code>Add a sub-agent called "fact_checker" that verifies information
before the main agent responds. The fact checker should be thorough
but concise.</code></pre>
        </li>
        <li>Review the generated sub-agent configuration</li>
        <li>Test the workflow with fact-based questions</li>
      </ol>
      <p><strong>Success Criteria:</strong> Responses show evidence of the two-agent workflow.</p>

      <hr />

      <h3>Exercise 3: Configure Agent Callbacks</h3>
      <p><strong>Goal:</strong> Add a callback to log all interactions.</p>

      <p><strong>Steps:</strong></p>
      <ol>
        <li>Select any YAML agent</li>
        <li>Ask the AI Assistant:
          <pre><code>Add a before_model_callback that logs the user's input, and an
after_model_callback that logs the agent's response. These should
help with debugging and auditing.</code></pre>
        </li>
        <li>Review the callback configuration</li>
        <li>Test and observe logging behavior</li>
      </ol>
      <p><strong>Success Criteria:</strong> Callbacks are configured (note: actual logging requires Python implementation).</p>

      <hr />

      <h3>Exercise 4: Build a Multi-Agent Pipeline</h3>
      <p><strong>Goal:</strong> Create a complete multi-agent system from scratch.</p>

      <p><strong>Scenario:</strong> Build a "Content Review Pipeline" with three agents:</p>
      <ol>
        <li><strong>Writer Agent</strong> – Drafts content based on a topic</li>
        <li><strong>Editor Agent</strong> – Reviews and improves the draft</li>
        <li><strong>Publisher Agent</strong> – Formats and finalizes the content</li>
      </ol>

      <p><strong>Steps:</strong></p>
      <ol>
        <li>Ask the AI Assistant to create the pipeline:
          <pre><code>Create a content review pipeline with three agents:
1. A writer agent that creates draft content from a topic
2. An editor agent that reviews and improves the draft
3. A publisher agent that formats the final output

Use a sequential workflow where each agent passes output to the next.
Use output_key to share state between agents.</code></pre>
        </li>
        <li>Review the generated configuration</li>
        <li>Test with a prompt like: "Write a short article about healthy eating"</li>
        <li>Observe how content flows through the pipeline</li>
      </ol>

      <p><strong>Success Criteria:</strong></p>
      <ul>
        <li>Three agents created with proper hierarchy</li>
        <li>Content improves through each stage</li>
        <li>Final output is well-formatted</li>
      </ul>

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

      <h3>"Cannot edit agent (no pencil icon)"</h3>
      <p><strong>Cause:</strong> Trying to edit a Python-based agent</p>
      <p><strong>Solution:</strong> Python agents (<code>agent.py</code>) are read-only in Visual Builder. Either:</p>
      <ul>
        <li>Edit the Python file directly in your code editor</li>
        <li>Create a new YAML-based agent using the "+" button</li>
      </ul>

      <hr />

      <h3>"Agent not responding in chat"</h3>
      <p><strong>Cause:</strong> Usually API key or model issues</p>
      <p><strong>Solution:</strong></p>
      <ol>
        <li>Verify <code>GOOGLE_API_KEY</code> is set in <code>.env</code></li>
        <li>Check the model name is valid (e.g., <code>gemini-2.5-flash</code>)</li>
        <li>Check terminal for error messages</li>
        <li>Try restarting: <code>./restart_visual_builder.sh</code></li>
      </ol>

      <hr />

      <h3>"Changes not saving"</h3>
      <p><strong>Cause:</strong> File permission or configuration error</p>
      <p><strong>Solution:</strong></p>
      <ol>
        <li>Check terminal for error messages</li>
        <li>Verify the agents directory is writable</li>
        <li>Ensure YAML syntax is valid</li>
      </ol>

      <hr />

      <h3>Getting Help</h3>
      <ul>
        <li><strong>ADK Documentation:</strong> <a href="https://google.github.io/adk-docs/" target="_blank" rel="noopener noreferrer">https://google.github.io/adk-docs/</a></li>
        <li><strong>Visual Builder Guide:</strong> <a href="https://google.github.io/adk-docs/visual-builder/" target="_blank" rel="noopener noreferrer">https://google.github.io/adk-docs/visual-builder/</a></li>
        <li><strong>ADK GitHub:</strong> <a href="https://github.com/google/adk-python" target="_blank" rel="noopener noreferrer">https://github.com/google/adk-python</a></li>
      </ul>

      <hr />

      <h2>Quick Reference</h2>

      <h3>Supported Agent Types</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>LlmAgent</code></td>
            <td>AI-powered conversational agents</td>
          </tr>
          <tr>
            <td><code>SequentialAgent</code></td>
            <td>Execute sub-agents in order</td>
          </tr>
          <tr>
            <td><code>ParallelAgent</code></td>
            <td>Execute sub-agents concurrently</td>
          </tr>
          <tr>
            <td><code>LoopAgent</code></td>
            <td>Repeat until condition met</td>
          </tr>
        </tbody>
      </table>

      <h3>Built-in Tools</h3>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>google_search</code></td>
            <td>Web search (Gemini 2+ only)</td>
          </tr>
          <tr>
            <td><code>exit_loop</code></td>
            <td>Exit from LoopAgent</td>
          </tr>
          <tr>
            <td><code>load_artifacts</code></td>
            <td>Load stored artifacts</td>
          </tr>
          <tr>
            <td><code>url_context</code></td>
            <td>Fetch URL content</td>
          </tr>
        </tbody>
      </table>

      <h3>Recommended Models</h3>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>gemini-2.5-flash</code></td>
            <td>Fast responses, cost-effective</td>
          </tr>
          <tr>
            <td><code>gemini-2.5-pro</code></td>
            <td>Complex reasoning</td>
          </tr>
          <tr>
            <td><code>gemini-2.0-flash-exp</code></td>
            <td>Experimental features</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Next Steps</h2>
      <p>After completing these exercises:</p>
      <ol>
        <li><strong>Explore the sample agents</strong> – Study <code>router_agent</code> for multi-agent patterns</li>
        <li><strong>Build your own</strong> – Create agents for your specific use cases</li>
        <li><strong>Add tools</strong> – Extend agents with custom Python functions</li>
        <li><strong>Deploy</strong> – Learn about deploying agents to production</li>
      </ol>

      <p>Happy agent building!</p>
    `,
  },
  'quickstart-guide': {
    title: 'ADK Quickstart Guide',
    content: `
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
    `,
  },
  'cheat-sheet': {
    title: 'Command Cheat Sheet',
    content: `
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
    `,
  },
  'troubleshooting-guide': {
    title: 'Troubleshooting Guide',
    content: `
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
    `,
  },
  'getting-started': {
    title: 'Getting Started',
    content: `
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
    `,
  },
}

// Guide metadata for the listing page
const guidesMeta: Record<string, { title: string; description: string; icon: 'book' | 'rocket' | 'terminal' | 'wrench' | 'play' }> = {
  'visual-agent-builder-guide': {
    title: 'Visual Agent Builder Guide',
    description: 'Learn to create, edit, and test AI agents using the Visual Builder interface without writing code.',
    icon: 'book',
  },
  'quickstart-guide': {
    title: 'ADK Quickstart Guide',
    description: 'Get up and running with Google\'s Agent Development Kit in minutes.',
    icon: 'rocket',
  },
  'cheat-sheet': {
    title: 'Command Cheat Sheet',
    description: 'Quick reference for common ADK commands and workshop scripts.',
    icon: 'terminal',
  },
  'troubleshooting-guide': {
    title: 'Troubleshooting Guide',
    description: 'Solutions for common issues you may encounter during the workshop.',
    icon: 'wrench',
  },
  'getting-started': {
    title: 'Getting Started',
    description: 'Set up your environment and prepare for the ADK workshop.',
    icon: 'play',
  },
}

// Icon components for guide cards
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  )
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  )
}

const iconMap = {
  book: BookIcon,
  rocket: RocketIcon,
  terminal: TerminalIcon,
  wrench: WrenchIcon,
  play: PlayIcon,
}

export function GuidesListPage() {
  const guideEntries = Object.entries(guidesMeta)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Guides & Documentation
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Learn how to use the ADK platform with these step-by-step guides.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {guideEntries.map(([slug, meta]) => {
          const IconComponent = iconMap[meta.icon]
          return (
            <Link
              key={slug}
              to={`/guides/${slug}`}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                  <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {meta.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {meta.description}
                  </p>
                </div>
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>()

  const guide = slug ? mockGuides[slug] : null

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Guide Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The guide you're looking for doesn't exist.
          </p>
          <Link to="/guides" className="text-primary-600 dark:text-primary-400 hover:underline">
            Return to Guides
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{guide.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {guide.title}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <MarkdownRenderer content={guide.content} />
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
