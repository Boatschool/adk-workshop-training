/**
 * Workshops Page
 * Lists all available workshops
 */

import { Link } from 'react-router-dom'
import { WorkshopCard } from '@components/workshop'
import type { Workshop } from '@/types/models'

// Mock data - will be replaced with API call
const mockWorkshops: Workshop[] = [
  {
    id: '1',
    title: 'Introduction to ADK',
    description: 'Learn the fundamentals of Google Agent Development Kit and build your first AI agent.',
    status: 'published',
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Building Agents with Tools',
    description: 'Extend your agents with custom tools and integrations for real-world applications.',
    status: 'published',
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Multi-Agent Systems',
    description: 'Design and implement complex workflows with multiple collaborating agents.',
    status: 'published',
    order_index: 3,
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
