/**
 * Badge Card Component
 * Displays an achievement/badge with earned status
 */

import type { Badge } from '@/types'
import { cn } from '@utils/cn'

interface BadgeCardProps {
  badge: Badge
  size?: 'sm' | 'md' | 'lg'
}

export function BadgeCard({ badge, size = 'md' }: BadgeCardProps) {
  const isEarned = badge.earnedAt !== null

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'text-2xl',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      container: 'p-4',
      icon: 'text-3xl',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      container: 'p-6',
      icon: 'text-4xl',
      title: 'text-lg',
      description: 'text-base',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        classes.container,
        isEarned
          ? 'bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800 shadow-sm'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            isEarned
              ? 'bg-white dark:bg-gray-900 shadow-sm'
              : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <span className={cn(classes.icon, isEarned ? '' : 'grayscale opacity-50')}>
            {badge.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-semibold truncate',
                classes.title,
                isEarned
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {badge.name}
            </h3>
            {isEarned && (
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p
            className={cn(
              'mt-1',
              classes.description,
              isEarned
                ? 'text-gray-600 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            {badge.description}
          </p>
          {isEarned && badge.earnedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
          {!isEarned && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
              Not yet earned
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
