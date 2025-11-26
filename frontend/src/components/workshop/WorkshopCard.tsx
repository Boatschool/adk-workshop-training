/**
 * Workshop Card Component
 * Displays a workshop with progress indicator
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'
import type { Workshop } from '@/types/models'

interface WorkshopCardProps {
  workshop: Workshop
  progress?: {
    completed: number
    total: number
  }
}

export function WorkshopCard({ workshop, progress }: WorkshopCardProps) {
  // Guard against division by zero or missing data
  const percentage = progress && progress.total > 0
    ? (progress.completed / progress.total) * 100
    : 0

  return (
    <Link
      to={`/workshops/${workshop.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {workshop.status === 'published' && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Available
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {workshop.title}
        </h3>

        {workshop.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {workshop.description}
          </p>
        )}

        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div
              className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  percentage === 100 ? 'bg-green-500' : 'bg-primary-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
