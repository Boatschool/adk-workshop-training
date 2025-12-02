/**
 * Exercise Page
 * Displays exercise content with completion button
 */

import { Link, useParams } from 'react-router-dom'
import { MarkdownRenderer, CompletionButton } from '@components/exercise'

// Mock data - will be replaced with API call
const mockExercise = {
  id: 'exercise-1-basic-agent',
  title: 'Build Your First Agent',
  content: `
    <h2>Overview</h2>
    <p>In this exercise, you'll create your first AI agent using Google's Agent Development Kit (ADK). By the end of this exercise, you'll have a working conversational agent that can respond to user queries.</p>

    <h2>Prerequisites</h2>
    <ul>
      <li>Python 3.11+ installed</li>
      <li>Virtual environment activated</li>
      <li>Google API key configured</li>
    </ul>

    <h2>Step 1: Create the Agent File</h2>
    <p>Create a new file called <code>my_first_agent.py</code> in your project directory:</p>

    <pre><code class="language-python">from google.adk import Agent

agent = Agent(
    name="my_first_agent",
    model="gemini-2.0-flash",
    instructions="You are a helpful assistant."
)

if __name__ == "__main__":
    agent.run()
</code></pre>

    <h2>Step 2: Run Your Agent</h2>
    <p>Start your agent with the following command:</p>
    <pre><code class="language-bash">python my_first_agent.py</code></pre>

    <h2>Step 3: Test Your Agent</h2>
    <p>Open your browser and navigate to <a href="http://localhost:8000/dev-ui">http://localhost:8000/dev-ui</a> to interact with your agent.</p>

    <h2>Congratulations!</h2>
    <p>You've successfully created your first AI agent. In the next exercise, you'll learn how to add tools to extend your agent's capabilities.</p>
  `,
  isCompleted: false,
}

export function ExercisePage() {
  useParams<{ id: string }>()

  // In real app, fetch exercise by id from useParams
  const exercise = mockExercise

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/workshops" className="hover:text-primary-600 dark:hover:text-primary-400">
          Workshops
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{exercise.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {exercise.title}
          </h1>
        </div>
        {exercise.isCompleted && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Completion Button (top) */}
      <div className="mb-6">
        <CompletionButton
          exerciseId={exercise.id}
          isCompleted={exercise.isCompleted}
        />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <MarkdownRenderer content={exercise.content} />
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          to="/workshops"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <CompletionButton
          exerciseId={exercise.id}
          isCompleted={exercise.isCompleted}
          size="lg"
        />

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
      </div>
    </div>
  )
}
