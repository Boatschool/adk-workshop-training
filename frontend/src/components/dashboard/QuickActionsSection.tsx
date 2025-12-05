/**
 * Quick Actions Section Component
 * Two-column layout with Quick Actions buttons and What's New section
 * Matches Agent Architect dashboard styling
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'
import { WhatsNewSection } from './WhatsNewSection'

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

interface QuickActionsSectionProps {
  className?: string
}

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

        {/* What's New - Right Column */}
        <WhatsNewSection />
      </div>
    </section>
  )
}
