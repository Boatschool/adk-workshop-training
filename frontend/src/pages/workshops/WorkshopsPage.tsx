/**
 * Workshops Page
 * Lists all available workshops
 */

import { Link } from 'react-router-dom'
import { WorkshopCard } from '@components/workshop'
import { useUserSettings } from '@hooks/useUserSettings'
import type { Workshop } from '@/types/models'

// Mock data - will be replaced with API call
const mockWorkshops: Workshop[] = [
  {
    id: '1',
    title: 'Introduction to ADK',
    description: 'Learn the fundamentals of Google Agent Development Kit and build your first AI agent.',
    status: 'published',
    order_index: 1,
    start_date: null,
    end_date: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Building Agents with Tools',
    description: 'Extend your agents with custom tools and integrations for real-world applications.',
    status: 'published',
    order_index: 2,
    start_date: null,
    end_date: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Multi-Agent Systems',
    description: 'Design and implement complex workflows with multiple collaborating agents.',
    status: 'published',
    order_index: 3,
    start_date: null,
    end_date: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockProgress = {
  '1': { completed: 1, total: 3 },
  '2': { completed: 0, total: 2 },
  '3': { completed: 0, total: 4 },
}

export function WorkshopsPage() {
  const { settings } = useUserSettings()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Dashboard
          </Link>
          <span>/</span>
          <span>Workshops</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Workshops
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse and complete training workshops to master AI agent development.
        </p>
      </div>

      {/* Setup Wizard Banner - shown for users who haven't completed setup */}
      {!settings.setupCompleted && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Set Up Visual Builder
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Configure the ADK Visual Builder to practice building agents locally. This is optional but recommended for hands-on workshop exercises.
              </p>
            </div>
            <Link
              to="/getting-started"
              className="flex-shrink-0 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Setup Wizard
            </Link>
          </div>
        </div>
      )}

      {/* Workshop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWorkshops.map((workshop) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            progress={mockProgress[workshop.id as keyof typeof mockProgress]}
          />
        ))}
      </div>
    </div>
  )
}
