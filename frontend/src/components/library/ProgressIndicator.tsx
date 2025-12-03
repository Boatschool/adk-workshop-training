/**
 * ProgressIndicator Component
 * Visual indicator for resource progress status
 */

import { cn } from '@utils/cn'
import type { ResourceProgressStatus } from '@/types/models'

interface ProgressIndicatorProps {
  status: ResourceProgressStatus | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig = {
  not_started: {
    label: 'Not started',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-500 dark:text-gray-400',
    icon: null,
  },
  in_progress: {
    label: 'In progress',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: 'clock',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    icon: 'check',
  },
}

export function ProgressIndicator({
  status,
  size = 'sm',
  showLabel = true,
  className,
}: ProgressIndicatorProps) {
  // If no progress, don't show anything
  if (!status || status === 'not_started') {
    return null
  }

  const config = statusConfig[status]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      {config.icon === 'check' && (
        <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {config.icon === 'clock' && (
        <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      )}
      {showLabel && config.label}
    </span>
  )
}

/**
 * Compact progress icon for use in cards
 */
export function ProgressIcon({
  status,
  className,
}: {
  status: ResourceProgressStatus | null
  className?: string
}) {
  if (!status || status === 'not_started') {
    return null
  }

  if (status === 'completed') {
    return (
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-green-500 flex items-center justify-center',
          className
        )}
        title="Completed"
      >
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }

  if (status === 'in_progress') {
    return (
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center',
          className
        )}
        title="In progress"
      >
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="8" />
          <polyline points="12,8 12,12 14,14" />
        </svg>
      </div>
    )
  }

  return null
}
