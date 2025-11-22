/**
 * Guide Page
 * Displays guide/documentation content
 */

import { Link, useParams } from 'react-router-dom'
import { MarkdownRenderer } from '@components/exercise'

// Mock data - will be replaced with API call
const mockGuides: Record<string, { title: string; content: string }> = {
  'visual-agent-builder-guide': {
    title: 'Visual Agent Builder Guide',
    content: `
      <h2>Introduction</h2>
      <p>The Visual Agent Builder is a web-based interface that allows you to create and configure AI agents without writing code. This guide will walk you through the basics of using the Visual Builder.</p>

      <h2>Getting Started</h2>
      <ol>
        <li>Start the Visual Builder: <code>./start_visual_builder.sh</code></li>
        <li>Open your browser to <a href="http://localhost:8000/dev-ui">http://localhost:8000/dev-ui</a></li>
        <li>Click "Create New Agent" to begin</li>
      </ol>

      <h2>Creating Your First Agent</h2>
      <p>The Visual Builder provides a drag-and-drop interface for building agents:</p>
      <ul>
        <li><strong>Agent Node</strong> - The main agent configuration</li>
        <li><strong>Tool Nodes</strong> - Add capabilities to your agent</li>
        <li><strong>Connections</strong> - Link components together</li>
      </ul>

      <h2>Tips</h2>
      <ul>
        <li>Use keyboard shortcuts for faster navigation</li>
        <li>Export your agents regularly to save your work</li>
        <li>Test your agent in the built-in chat interface</li>
      </ul>
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
          <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            Return to Dashboard
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
