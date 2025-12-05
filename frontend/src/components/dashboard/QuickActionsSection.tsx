/**
 * Quick Actions Section Component
 * Two-column layout with Quick Actions buttons and Platform Features checklist
 * Matches Agent Architect dashboard styling
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const LibraryIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
)

interface QuickActionsSectionProps {
  className?: string
}

const platformFeatures = [
  {
    title: 'AI-Powered Learning',
    description: 'Interactive workshops with guided AI agent development',
  },
  {
    title: 'Healthcare Focus',
    description: 'Content tailored for clinical and life sciences workflows',
  },
  {
    title: 'Google Cloud Integration',
    description: 'Deploy to Vertex AI Agent Engine with best practices',
  },
]

export function QuickActionsSection({ className }: QuickActionsSectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions - Left Column */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/workshops"
              className={cn(
                'flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg',
                'bg-primary-600 hover:bg-primary-700 text-white font-medium',
                'transition-colors duration-200'
              )}
            >
              <PlusIcon />
              Start a Workshop
            </Link>
            <Link
              to="/library"
              className={cn(
                'flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg',
                'border-2 border-primary-600 text-primary-600 dark:text-primary-400 font-medium',
                'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                'transition-colors duration-200'
              )}
            >
              <LibraryIcon />
              Browse Library
            </Link>
          </div>
        </div>

        {/* Platform Features - Right Column */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platform Features
          </h2>
          <ul className="space-y-4">
            {platformFeatures.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircleIcon />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {feature.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
