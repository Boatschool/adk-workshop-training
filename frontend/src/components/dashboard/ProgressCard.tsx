/**
 * Progress Card Component
 * Displays progress metrics with optional progress bar
 */

import { cn } from '@utils/cn'

interface ProgressCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  total?: number
  detail?: string
  className?: string
}

export function ProgressCard({
  icon,
  title,
  value,
  total,
  detail,
  className,
}: ProgressCardProps) {
  const percentage = total ? (Number(value) / total) * 100 : null

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
            {total !== undefined && (
              <span className="text-lg text-gray-400 dark:text-gray-500">
                {' '}
                / {total}
              </span>
            )}
          </p>
          {percentage !== null && (
            <div className="mt-3">
              <div
                className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
          {detail && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {detail}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
