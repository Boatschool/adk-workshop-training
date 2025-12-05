/**
 * Stats Card Component
 * Displays a single metric in the stats row with colored number and icon
 * Matches Agent Architect dashboard styling
 */

import { cn } from '@utils/cn'

type ColorVariant = 'blue' | 'amber' | 'green' | 'purple'

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color?: ColorVariant
  className?: string
}

const colorStyles: Record<ColorVariant, { icon: string; value: string }> = {
  blue: {
    icon: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    value: 'text-primary-600 dark:text-primary-400',
  },
  amber: {
    icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
  green: {
    icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    value: 'text-green-600 dark:text-green-400',
  },
  purple: {
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    value: 'text-purple-600 dark:text-purple-400',
  },
}

export function StatsCard({
  icon,
  label,
  value,
  color = 'blue',
  className,
}: StatsCardProps) {
  const styles = colorStyles[color]

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            styles.icon
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className={cn('text-2xl font-bold', styles.value)}>{value}</p>
        </div>
      </div>
    </div>
  )
}
