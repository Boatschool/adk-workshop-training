/**
 * Workshop Detail Page
 * Shows workshop information and list of exercises
 */

import { Link, useParams } from 'react-router-dom'
import { ExerciseList } from '@components/workshop'
import type { Exercise } from '@/types/models'

// Mock data - will be replaced with API call
const mockWorkshop = {
  id: '1',
  title: 'Introduction to ADK',
  description: 'Learn the fundamentals of Google Agent Development Kit and build your first AI agent. This workshop covers the basics of agent creation, configuration, and deployment.',
}

const mockExercises: Exercise[] = [
  {
    id: 'exercise-1-basic-agent',
    workshop_id: '1',
    title: 'Build Your First Agent',
    description: 'Create a simple conversational agent using ADK',
    content_type: 'markdown',
    content_path: '/exercises/basic-agent.md',
    order_index: 1,
    estimated_minutes: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exercise-2-agents-with-tools',
    workshop_id: '1',
    title: 'Adding Tools to Your Agent',
    description: 'Extend your agent with custom tools and capabilities',
    content_type: 'markdown',
    content_path: '/exercises/agent-tools.md',
    order_index: 2,
    estimated_minutes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exercise-3-multi-agent-systems',
    workshop_id: '1',
    title: 'Multi-Agent Collaboration',
    description: 'Build a system with multiple agents working together',
    content_type: 'markdown',
    content_path: '/exercises/multi-agent.md',
    order_index: 3,
    estimated_minutes: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const completedExercises = ['exercise-1-basic-agent']

export function WorkshopDetailPage() {
  const { id: _workshopId } = useParams<{ id: string }>()

  // In real app, fetch workshop by _workshopId
  const workshop = mockWorkshop
  const exercises = mockExercises
  const completedCount = completedExercises.length
  const totalCount = exercises.length
  const percentage = (completedCount / totalCount) * 100

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
        <span className="text-gray-900 dark:text-white">{workshop.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {workshop.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {workshop.description}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Your Progress
          </h2>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {completedCount} of {totalCount} exercises completed
          </span>
        </div>
        <div
          className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Exercises
        </h2>
        <ExerciseList exercises={exercises} completedIds={completedExercises} />
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Link
          to="/workshops"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workshops
        </Link>
      </div>
    </div>
  )
}
